# Service Layer — Enterprise Approval Workflow

## Overview

The service layer sits between the database and the UI. It defines what operations are exposed, who can perform them, and at what path. In CAP this is defined in `service.cds` — a declarative file that does an enormous amount of work with very little code.

---

## The Service Definition

```cds
@requires: 'authenticated-user'
@path    : 'approval'
service ApprovalService {
  ...
}
```

**`@requires: 'authenticated-user'`**
This single annotation makes the entire service require authentication. Any request without a valid JWT token gets a 401 Unauthorized response before it even reaches your handlers. You write zero code for this.

In local development with mock users, CAP's built-in auth middleware reads the mock user config from `package.json` and populates `req.user` automatically.

In production with XSUAA, CAP's `@sap/xssec` middleware validates the JWT token, extracts the user ID and roles, and populates `req.user` with real data.

**`@path: 'approval'`**
This sets the OData service URL path. CAP converts the service name to kebab-case by default, so `ApprovalService` would become `/odata/v4/approval-service/`. The `@path` annotation overrides this to `/odata/v4/approval/` — cleaner and easier to remember.

---

## Entity Exposure with `@restrict`

```cds
@restrict: [
  { grant: ['CREATE', 'READ', 'WRITE'], to: 'Requester' },
  { grant: ['READ'], to: ['Manager', 'Finance', 'Admin'] }
]
@odata.draft.enabled
entity Requests as projection on db.Request
```

**How `@restrict` works:**
CAP evaluates the restrictions on every request. It checks whether the requesting user has any of the roles listed in the `to` array. If not, the request is rejected with 403 Forbidden.

The `grant` array specifies which HTTP operations are allowed:
- `CREATE` → POST
- `READ` → GET
- `WRITE` → PATCH/PUT
- `DELETE` → DELETE (not granted to anyone here — requests can't be deleted)

**Why this design?**
- Requesters can create, read, and update their own requests
- Managers and Finance can only read requests — they approve/reject through bound actions, not direct WRITE
- Admins have read-only access to monitor everything
- Nobody can delete requests — the audit trail must be preserved

**`@odata.draft.enabled`**
This enables SAP Fiori's draft mechanism. When a user starts creating a request, a draft is saved automatically. They can navigate away and come back without losing their work. The draft is only committed to the real table when they click Save.

This requires two hidden tables in HANA: `Requests_drafts` and `DraftAdministrativeData`. CAP creates and manages these automatically.

---

## Bound Actions

```cds
actions {
  @restrict: [{ grant: 'WRITE', to: 'Requester' }]
  action submit() returns Requests;

  @restrict: [{ grant: 'WRITE', to: ['Manager', 'Finance'] }]
  action approve() returns Requests;

  @restrict: [{ grant: 'WRITE', to: ['Manager', 'Finance'] }]
  action reject(comment: String) returns Requests;
}
```

**What are bound actions?**
Bound actions are operations tied to a specific entity instance. When you call `approve()`, you call it on a specific request — `POST /odata/v4/approval/Requests(ID)/ApprovalService.approve`. The `ID` is part of the URL, so CAP automatically knows which request you're acting on.

**Why bound actions instead of PATCH?**
You could theoretically update the status by patching the `status` field directly. But that would bypass all your business logic — anyone with WRITE permission could set any status. Bound actions let you put business logic in a handler that always runs when the action is called.

**`returns Requests`**
After approve/reject, the action returns the updated request. Fiori Elements uses this to automatically refresh the UI without a separate GET request.

**`reject(comment: String)`**
The reject action takes an optional comment parameter. This is passed in the request body and available as `req.data.comment` in the handler.

---

## Child Entity Exposure

```cds
@restrict: [{ grant: 'READ', to: ['Manager', 'Finance', 'Admin'] }]
entity ApprovalSteps as select from db.ApprovalStep
  order by runNumber asc, stepNumber asc;
```

**Why is `ApprovalSteps` exposed separately?**
Even though `ApprovalStep` is a composition of `Request`, exposing it as a separate entity in the service allows the UI to query steps independently. It also allows different access control — Requesters can't see the steps entity directly (though they can see steps expanded from a Request).

**Why `order by runNumber asc, stepNumber asc` in the service definition?**
This is more reliable than using `UI.PresentationVariant` annotations. The ordering happens at the SQL level in HANA, not in the UI layer. This ensures steps always come back in the correct order regardless of how they're queried.

---

## AuditLogs Exposure

```cds
@restrict: [{ grant: 'READ', to: ['Requester', 'Manager', 'Finance', 'Admin'] }]
entity AuditLogs as projection on db.AuditLog;
```

All roles can read audit logs. This is intentional — transparency is important. A requester should be able to see the full history of their request, including who approved or rejected it and when.

---

## How CAP Enforces Security

```
Request arrives
       ↓
1. Is there a valid JWT token? (authenticated-user check)
   NO → 401 Unauthorized
       ↓
2. Does the user's role match @restrict for this operation?
   NO → 403 Forbidden
       ↓
3. Handler executes
       ↓
4. Response returned
```

All of steps 1 and 2 happen automatically. You write no code for this. The entire security model is declarative in `service.cds`.

---

## Local vs Production Auth

| | Local (`cds watch`) | Production (CF) |
|---|---|---|
| Auth type | Mocked | XSUAA JWT |
| User source | `package.json` mock users | BTP Identity Provider |
| `req.user.id` | Mock email (`manager@company.com`) | Real user email from JWT |
| Role check | Reads from mock user `roles` array | Reads JWT scope claims |
| Config | `"auth": { "kind": "mocked" }` | Automatic when XSUAA bound |

**Important:** Mock users must be in the top-level `cds.requires` block in `package.json`, NOT inside a `[production]` profile. If they're in the production profile, `req.user.id` returns `"anonymous"` locally.

---

## Key Takeaways

- `@requires: 'authenticated-user'` secures the entire service with one annotation
- `@restrict` controls who can do what on each entity and action
- Bound actions enforce business logic — can't be bypassed with direct PATCH
- `order by` in service projections is more reliable than UI annotations for ordering
- CAP handles all JWT validation automatically — you write zero auth code
