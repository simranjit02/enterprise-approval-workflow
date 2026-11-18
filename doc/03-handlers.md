# Business Logic Handlers — Enterprise Approval Workflow

## Overview

Handlers are where business logic lives. While `service.cds` declares what operations exist and who can call them, handlers implement what actually happens when those operations are called.

| File | Job |
|---|---|
| `request-handler.js` | submit, cancel, edit locks, totals, budget reservation, per-user button flags |
| `approval-handler.js` | approve and reject |
| `validation-handler.js` | S/4HANA lookups: value helps, vendor/cost center/product checks, prices, currency |
| `admin-handler.js` | budget maintenance (AdminService) |
| `ans-helper.js` | email alerts through SAP Alert Notification |

---

## Handler Registration

```javascript
// srv/service.js
module.exports = cds.service.impl(async (srv) => {
  await require('./handlers/request-handler')(srv)
  await require('./handlers/approval-handler')(srv)
  await require('./handlers/validation-handler')(srv)
})
```

Each handler file exports a function that receives the `srv` object and registers event handlers on it. `srv.on('submit', 'Requests', async (req) => {...})` means: "when the `submit` action is called on the `Requests` entity, run this function." The order matters: approval and validation handlers use helpers the request handler attaches to `srv` (`srv._releaseBudget`, `srv._consumeBudget`, `srv._recalcDraftTotals`). `AdminService` has its own file, wired with `@impl` in `admin-service.cds`.

---

## The Submit Handler

### What it does

When a requester clicks Submit, this handler:
1. Validates the request exists and is `DRAFT` or `REJECTED`
2. Refuses an empty request (total 0)
3. Refuses a request whose currency differs from the cost center's budget currency
4. Checks resubmission limits (max 3 submissions)
5. Reserves the amount in this month's budget, and warns when less than 10% is left
6. Assigns a request number on the first submission
7. Creates the approval steps
8. Creates a WorkflowInstance record and sets the status to `IN_APPROVAL`
9. Writes an audit log entry, and sends an alert after the transaction commits

### Routing logic

```javascript
const { financeLimit } = (await SELECT.one.from(CurrencyValue)
  .columns("financeLimit").where({ code: request.currency })) ?? {};
const needsFinance = financeLimit == null || Number(request.totalAmount) > Number(financeLimit);
const steps = needsFinance ? [step(1, "Manager"), step(2, "Finance")] : [step(1, "Manager")];
```

Every request needs a Manager. Above the currency's `financeLimit`, Finance must approve too. The limit is per currency because the same number means different money, and a currency without a limit always needs Finance.

**Why approvers by role, not by person?**
Nothing in the system knows which manager owns which cost center. Any user with the step's role may act, and the step records who did. A real system would look the approver up, e.g. the cost center's responsible user in S/4.

### Budget reservation

```javascript
const reserved = await UPDATE(DepartmentBudget)
  .set({ reservedAmount: { "+=": amt }, remainingAmount: { "-=": amt } })
  .where({ costCenter, fiscalYear, fiscalMonth, remainingAmount: { ">=": amt } });
```

Check and write are one statement, so two submits at the same moment cannot both take the last of the budget. The year and month come from the server clock, whose time zone is set to the company's in `mta.yaml` (`TZ`). The period is stored on the request so approve and reject later move money in the same row.

### Resubmission tracking

```javascript
const runs = await SELECT.from(WorkflowInstance).where({ request_ID: ID });
const runNumber = runs.length + 1;
if (runNumber > 3) return req.error(400, 'Maximum resubmissions reached. Request is permanently closed.');
```

Each submission creates a WorkflowInstance; their count is the run number. Steps carry the run number too, which the two-person rule needs.

---

## The Approve Handler

### What it does

1. Validates the request is `IN_APPROVAL`
2. Finds the active step this user may act on (see below)
3. Marks it `COMPLETED` / `APPROVED` and records the real user in `approverUserId`
4. If no step is still pending: request → `APPROVED`, budget reserved → consumed, workflow run → `COMPLETED`
5. Writes the audit log; the alert goes out after commit — `purchase-request.approved` for the last step, `purchase-request.step-approved` (naming who it still waits for) otherwise

### Who may act on a step

```javascript
if (request.createdBy === req.user.id) req.reject(403, "You cannot approve or reject your own request");
const step = steps.find((s) => req.user.is(s.approverRole));
// … and the same user may not approve two steps of one run
```

Three rules, checked in `activeStepFor`:
- **Not your own request.** A user with both Requester and Manager roles cannot approve what they created.
- **Your role must match an active step.** For requests needing Finance, the Manager and Finance steps are active at the same time, so the handler picks the step matching the user's role instead of the first one.
- **Two steps need two people.** A user holding both Manager and Finance cannot approve both steps of the same run. Steps of earlier runs don't count, so a Manager may approve again after a resubmit.

`req.user` comes from the XSUAA JWT in production — it cannot be faked.

### Parallel approval detection

```javascript
const pendingSteps = await SELECT.from(ApprovalStep).where({ request_ID: ID, decision: 'PENDING' });
if (!pendingSteps.length) { /* request → APPROVED */ }
```

After each approval, the request is approved only when no step is still pending. This implements the AND-join (parallel approval) in code without a BPMN engine. It is also why skipped steps must not stay `PENDING`.

---

## The Reject Handler

### What it does

1. Validates the request is `IN_APPROVAL` and the user may act (same rules as approve)
2. Requires a reason
3. Marks the step `COMPLETED` / `REJECTED` with the reason
4. Marks all other active steps `SKIPPED` (decision `SKIPPED`)
5. Releases the reserved budget, sets the request to `REJECTED`, closes the workflow run
6. Writes the audit log; the alert goes out after commit

### Parallel step cancellation

```javascript
await UPDATE(ApprovalStep)
  .set({ stepStatus: 'SKIPPED', decision: 'SKIPPED' })
  .where({ request_ID: ID, stepStatus: 'ACTIVE' });
```

If Finance rejects, the Manager's step is cancelled at once — there is no point waiting. The decision is `SKIPPED`, not `PENDING`: the approve handler counts `PENDING` decisions across all runs, so a skipped step left `PENDING` would block every later approval of a resubmitted request.

The requester sees the reason in the Approval Steps table, changes the request and resubmits.

---

## Draft and S/4HANA Handlers

These run while the requester edits a draft (`validation-handler.js`, plus totals in `request-handler.js`):

- **Picking a vendor** checks the supplier exists and is not blocked or deleted, fills name and country, and sets the currency: the supplier's purchasing currency, else its currency in the cost center's company code.
- **Picking a cost center** checks it is valid today and not blocked, and fills its name and budget currency.
- **Picking a product** fills name, unit and product group, plus the price agreed with the vendor (Purchasing Info Record; expired prices are skipped, other currencies only warn).
- **Changing vendor, cost center or currency** re-prices the items already on the request.
- **Changing or deleting an item** recalculates line totals and the request total.
- **Bad values are rejected with `req.reject`**, not `req.error`: in a draft PATCH, `req.error` only adds a draft message and the bad value is still stored.
- **Value-help search** is turned into a `contains` filter, because the S/4 APIs reject OData `$search`.

Saving a draft also checks the delivery date is not in the past and each item has quantity > 0 and price ≥ 0. Submitted requests cannot be edited, saved or deleted.

---

## Error Handling Pattern

```javascript
return req.error(400, `Cannot submit — current status is '${request.status}'`);
req.reject(403, "You cannot approve or reject your own request");
req.notify(`Request ${result.requestNumber} submitted for approval`);
req.warn(`Budget for ${name} is almost used up: …`);
```

- `req.error()` collects an error; CAP fails the request after the handler. Use `return req.error(...)` to stop the handler there.
- `req.reject()` throws at once — used inside helpers, where a `return` would only leave the helper.
- `req.notify()`, `req.info()` and `req.warn()` send success, info and warning messages. Fiori Elements shows them as a toast or message dialog.

**HTTP status codes:**
- `400` — Bad Request (wrong state, business rule violation)
- `403` — Forbidden (wrong user, permission violation)
- `404` — Not Found (entity doesn't exist)
- `502` — S/4HANA could not be reached

---

## Audit Log and Alerts

```javascript
await INSERT.into(AuditLog).entries({
  request_ID: ID, entityName: 'PurchaseRequest', entityId: ID,
  action: 'APPROVE', oldValue: request.status, newValue: newStatus,
  performedBy: req.user.id,
});
req.on("succeeded", () => sendAlert({ … }));
```

The audit entry is part of the transaction: if the action fails, no entry is written. The alert is sent only after the transaction commits, without waiting for it and with a 5-second timeout — a slow alert service must not hold the budget row locked.

---

## Handler Flow Summary

```
submit()
  ├── Validate: status is DRAFT or REJECTED, total > 0
  ├── Validate: currency = cost center budget currency
  ├── Check: runNumber ≤ 3
  ├── Reserve budget (atomic), warn and alert below 10%
  ├── Request number on first submit
  ├── Create steps: Manager, + Finance above the currency limit
  ├── Create WorkflowInstance, Request → IN_APPROVAL
  └── Write AuditLog; alert after commit

approve()
  ├── Validate: status is IN_APPROVAL
  ├── Guard: not own request, role matches an active step, not a second step of the same run
  ├── Update step → COMPLETED / APPROVED (records the user)
  ├── Any pending steps remaining?
  │   └── NO → Request → APPROVED, budget reserved → consumed, run → COMPLETED
  └── Write AuditLog; alert after commit

reject()
  ├── Validate: status is IN_APPROVAL, same guards, reason given
  ├── Update step → COMPLETED / REJECTED
  ├── Skip all other ACTIVE steps
  ├── Release budget, Request → REJECTED, run → COMPLETED
  └── Write AuditLog; alert after commit
```
