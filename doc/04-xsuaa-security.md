# XSUAA Security — Enterprise Approval Workflow

## Overview

XSUAA (Authorization and Trust Management Service) is SAP BTP's OAuth 2.0 authorization server. It handles authentication (who are you?) and authorization (what can you do?) for all applications running on BTP.

Without XSUAA, your CAP service is wide open — anyone with the URL can read or modify data. With XSUAA, every request must carry a cryptographically signed JWT token that proves the user's identity and roles.

---

## The Full Auth Flow

```
User opens app
      ↓
App Router checks: does user have a valid session?
      ↓ NO
App Router redirects to XSUAA login page
      ↓
User logs in via Identity Provider (SAP ID Service or custom IDP)
      ↓
IDP authenticates user, returns auth code to XSUAA
      ↓
XSUAA exchanges auth code for JWT token
JWT contains: user ID, email, roles (scopes)
      ↓
App Router stores session, forwards requests with JWT in Authorization header
      ↓
CAP service receives request
@sap/xssec validates JWT signature
Extracts user ID and roles → populates req.user
      ↓
@requires / @restrict annotations evaluated
      ↓
Handler executes with verified req.user.id
      ↓
Response returned to user
```

---

## xs-security.json Explained

```json
{
  "xsappname": "enterprise-approval-workflow",
  "tenant-mode": "dedicated"
}
```

**`xsappname`** — unique identifier for this application in XSUAA. All scope names are prefixed with this: `enterprise-approval-workflow.Manager`.

**`tenant-mode: dedicated`** — this app serves a single tenant (your subaccount). For multi-tenant SaaS applications you'd use `shared`.

### Scopes

```json
"scopes": [
  { "name": "$XSAPPNAME.Requester", "description": "..." },
  { "name": "$XSAPPNAME.Manager",   "description": "..." },
  { "name": "$XSAPPNAME.Finance",   "description": "..." },
  { "name": "$XSAPPNAME.Admin",     "description": "..." }
]
```

A **scope** is the most granular unit of permission. `$XSAPPNAME` is a placeholder that gets replaced with the actual `xsappname` at runtime. So `$XSAPPNAME.Manager` becomes `enterprise-approval-workflow.Manager` in the deployed JWT token.

Scopes are what actually appear in the JWT token's `scope` claim.

### Role Templates

```json
"role-templates": [
  {
    "name": "Manager",
    "description": "Role for managers...",
    "scope-references": ["$XSAPPNAME.Manager"]
  }
]
```

A **role template** is a named group of scopes. Users are not assigned scopes directly — they're assigned role collections which contain role templates which contain scopes.

### Role Collections

```json
"role-collections": [
  {
    "name": "Approval_Manager",
    "description": "Grants access to review and approve...",
    "role-template-references": ["$XSAPPNAME.Manager"]
  }
]
```

A **role collection** is what you assign to users in BTP Cockpit. It bundles one or more role templates together. When you assign `Approval_Manager` to a user, they get the `Manager` role template, which gives them the `enterprise-approval-workflow.Manager` scope in their JWT token.

### The hierarchy:

```
Role Collection (assigned to users in BTP Cockpit)
  └── Role Template (groups scopes together)
        └── Scope (appears in JWT token)
```

---

## How CAP Reads Scopes

In `service.cds`:

```cds
@restrict: [{ grant: 'READ', to: 'Manager' }]
```

CAP automatically maps the role name `Manager` to the full scope `enterprise-approval-workflow.Manager`. When a request arrives, CAP checks whether the JWT token contains this scope. If not, the request is rejected with 403.

You never write code to check roles manually — it's all declarative.

---

## JWT Token Deep Dive

A JWT token has three parts: header, payload, signature. The payload for a Manager user looks like this:

```json
{
  "sub": "manager@company.com",
  "user_name": "manager@company.com",
  "email": "manager@company.com",
  "scope": ["enterprise-approval-workflow.Manager", "openid"],
  "iat": 1713348000,
  "exp": 1713351600,
  "iss": "https://<org>-<space>.authentication.us10.hana.ondemand.com/oauth/token"
}
```

**Key fields:**

- `sub` / `user_name` — becomes `req.user.id` in CAP
- `scope` — the roles this user has — CAP checks these against `@restrict`
- `exp` — expiry timestamp — XSUAA tokens expire, forcing re-authentication
- `iss` — issuer — `@sap/xssec` validates the token came from your XSUAA instance

**Why can't the JWT be faked?**
The token is signed with XSUAA's private key. `@sap/xssec` validates the signature using XSUAA's public key. A tampered token has an invalid signature and is rejected immediately.

---

## package.json — Local Mock Auth

```json
"cds": {
  "requires": {
    "auth": {
      "kind": "mocked",
      "users": {
        "manager@company.com": {
          "password": "manager",
          "roles": ["Manager"]
        }
      }
    }
  }
}
```

This block configures mock authentication for local development. When `cds watch` runs, CAP uses this instead of real XSUAA. The mock middleware:

1. Reads the `Authorization: Basic` header (base64 encoded `email:password`)
2. Looks up the user in this config
3. Populates `req.user.id` with the email and `req.user.roles` with the roles array

**Critical rule:** This config must be in the TOP-LEVEL `cds.requires` block, not inside a `[production]` profile. If it's inside `[production]`, it won't be loaded during `cds watch` and `req.user.id` will return `"anonymous"`.

---

## Production Configuration

When deployed to CF with XSUAA bound:

```json
// package.json (added by cds add xsuaa --for production)
"[production]": {
  "auth": {
    "kind": "xsuaa"
  }
}
```

CAP automatically switches to XSUAA auth when `NODE_ENV=production` (set by Cloud Foundry). The `@sap/xssec` package (already in your dependencies) is loaded to validate JWT tokens.

---

## mta.yaml XSUAA Resource

```yaml
- name: enterprise-approval-workflow-auth
  type: org.cloudfoundry.managed-service
  parameters:
    service: xsuaa
    service-plan: application
    path: ./xs-security.json
    config:
      xsappname: enterprise-approval-workflow-${org}-${space}
      tenant-mode: dedicated
      oauth2-configuration:
        credential-types:
          - binding-secret
          - x509
        redirect-uris:
          - https://*~{app-api/app-uri}/**
  requires:
    - name: app-api
```

**`path: ./xs-security.json`** — CF deployment reads your `xs-security.json` and configures the XSUAA instance with the correct scopes, role templates, and role collections automatically.

**`xsappname: enterprise-approval-workflow-${org}-${space}`** — The `${org}` and `${space}` placeholders ensure the xsappname is unique per deployment environment. This matters if you deploy to multiple spaces (dev, test, prod).

**`redirect-uris`** — After successful login, XSUAA redirects the user back to your app. The URI must be whitelisted here. The `*` wildcard allows any subdomain, which works for the dynamic CF URLs.

---

## Role Collection Assignment (Post-Deployment)

After deploying, role collections defined in `xs-security.json` are created automatically in XSUAA. But they're not assigned to any users yet.

**To assign in BTP Cockpit:**

1. Security → Users
2. Select your user
3. Assign Role Collections → select from the list

For testing all roles with one user, assign all four:

- `Approval_Requester`
- `Approval_Manager`
- `Approval_Finance`
- `Approval_Admin`

In production, each real user would have only one role collection assigned matching their job function.

---

## Common Issues and Fixes

| Issue                                 | Cause                              | Fix                                                             |
| ------------------------------------- | ---------------------------------- | --------------------------------------------------------------- |
| 401 on all requests                   | No valid JWT in request            | Check approuter is running and forwarding token                 |
| 403 on specific operations            | User missing required role         | Assign correct role collection in BTP Cockpit                   |
| `req.user.id` returns `anonymous`     | Mock users in wrong config section | Move mock users to top-level `cds.requires`, not `[production]` |
| Login redirects fail                  | Redirect URI not whitelisted       | Add approuter URL to `redirect-uris` in `xs-security.json`      |
| `grant_type` error on approuter start | Wrong HTML5 repo plan              | Bind approuter to `app-runtime` plan, not `app-host`            |
