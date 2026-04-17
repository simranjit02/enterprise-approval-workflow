# Business Logic Handlers — Enterprise Approval Workflow

## Overview

Handlers are where business logic lives. While `service.cds` declares what operations exist and who can call them, handlers implement what actually happens when those operations are called.

The project has two active handler files:
- `request-handler.js` — handles the `submit` action
- `approval-handler.js` — handles the `approve` and `reject` actions

---

## Handler Registration

```javascript
// srv/service.js
module.exports = cds.service.impl(async (srv) => {
  require('./handlers/request-handler')(srv)
  require('./handlers/approval-handler')(srv)
})
```

Each handler file exports a function that receives the `srv` object. This function registers event handlers on the service. The pattern `srv.on('submit', 'Requests', async (req) => {...})` means: "when the `submit` action is called on the `Requests` entity, run this function."

---

## The Submit Handler

### What it does

When a requester clicks Submit, this handler:
1. Validates the request exists and is in the right state
2. Checks resubmission limits (max 3 attempts)
3. Creates the appropriate approval steps based on the amount
4. Creates a WorkflowInstance record
5. Updates the request status to `IN_APPROVAL`
6. Writes an audit log entry

### Routing logic

```javascript
if (request.amount <= 5000) {
  // Single step: Manager only
  steps.push({
    stepNumber: 1,
    approverRole: 'Manager',
    approverUserId: 'manager@company.com',
    stepStatus: 'ACTIVE',
  });
} else {
  // Two parallel steps: Manager + Finance
  steps.push({ stepNumber: 1, approverRole: 'Manager', ... });
  steps.push({ stepNumber: 2, approverRole: 'Finance', ... });
}
```

**Why hardcoded approver emails?**
This is a deliberate simplification for the portfolio project. In a real enterprise system, the approver would be looked up from an HR system or org chart API. The architecture supports this — you just replace the hardcoded value with an API call.

**Why check for `DRAFT` AND `REJECTED` status?**
```javascript
if (request.status !== 'DRAFT' && request.status !== 'REJECTED') {
  return req.error(400, `Cannot submit — current status is '${request.status}'`);
}
```
A request can be resubmitted after rejection. So `submit` must accept both `DRAFT` (first submission) and `REJECTED` (resubmission) as valid starting states.

**Why clean up ACTIVE steps before creating new ones?**
```javascript
await UPDATE(ApprovalStep)
  .set({ stepStatus: 'COMPLETED' })
  .where({ request_ID: ID, stepStatus: 'ACTIVE' });
```
On resubmission, any leftover ACTIVE steps from the previous rejected run must be closed before creating new ones. Otherwise the approval logic would find multiple ACTIVE steps and behave incorrectly.

### Resubmission tracking

```javascript
const runs = await SELECT.from(WorkflowInstance).where({ request_ID: ID });
const runNumber = runs.length + 1;
if (runNumber > 3) {
  return req.error(400, 'Maximum resubmissions reached.');
}
```

Each submission creates a WorkflowInstance. The count of existing instances tells us which run this is. After 3 runs, the request is permanently closed.

---

## The Approve Handler

### What it does

1. Validates the request is `IN_APPROVAL`
2. Finds the ACTIVE step for this approver
3. Verifies the calling user is the assigned approver
4. Marks the step as `COMPLETED` with decision `APPROVED`
5. Checks if all steps are now approved
6. If yes, sets request status to `APPROVED`
7. Writes audit log

### The approverUserId guard

```javascript
if (step.approverUserId !== req.user.id) {
  return req.error(403, 'You are not the assigned approver for this step');
}
```

This is the most important security check in the entire handler. Without it, any Manager or Finance user could approve any request — including ones not assigned to them. The guard ensures that `manager@company.com` can only approve steps where `approverUserId === 'manager@company.com'`.

`req.user.id` comes from the JWT token in production — it cannot be faked. This is why XSUAA is so important: it's the cryptographic guarantee that the user claiming to be `manager@company.com` actually is.

**This check was temporarily disabled during local testing** (without real XSUAA, all users share the same mock session). It was restored before deployment.

### Parallel approval detection

```javascript
const pendingSteps = await SELECT.from(ApprovalStep).where({
  request_ID: ID,
  decision: 'PENDING',
});
if (!pendingSteps.length) {
  await UPDATE(Request).set({ status: 'APPROVED' }).where({ ID });
}
```

For requests above 5,000, both Manager and Finance must approve. After each approval, we check if any steps still have `decision: 'PENDING'`. Only when ALL steps are approved does the request move to `APPROVED` status. This implements the AND-join (parallel approval) logic entirely in code without needing a BPMN engine.

---

## The Reject Handler

### What it does

1. Validates the request is `IN_APPROVAL`
2. Finds the ACTIVE step for this approver
3. Verifies the calling user is the assigned approver
4. Marks the step as `COMPLETED` with decision `REJECTED`
5. Marks ALL other ACTIVE steps as `SKIPPED` (parallel step cancellation)
6. Sets request status to `REJECTED`
7. Writes audit log

### Parallel step cancellation

```javascript
await UPDATE(ApprovalStep)
  .set({ stepStatus: 'SKIPPED', decision: 'PENDING' })
  .where({ request_ID: ID, stepStatus: 'ACTIVE' });
```

In a parallel approval scenario (amount > 5,000), if Finance rejects, the Manager's step should be cancelled immediately — there's no point waiting for manager approval if finance already rejected. This UPDATE skips all remaining ACTIVE steps in one query.

**Why `decision: 'PENDING'` when skipping?**
The step was never decided — it was cancelled before a decision was made. Setting `decision: 'PENDING'` on a `SKIPPED` step accurately reflects this: the step was skipped, not approved or rejected.

### The reject comment

```javascript
comment: req.data.comment || 'No reason provided'
```

The `reject` action accepts an optional `comment` parameter. If the rejecting approver provides a reason, it's stored on the step. If not, a default message is used. This appears in the audit log and is visible to the requester.

---

## Error Handling Pattern

All handlers use `req.error()` to return errors:

```javascript
return req.error(400, 'Request is not available for approval');
return req.error(403, 'You are not the assigned approver for this step');
return req.error(404, `Request ${ID} not found`);
```

**Why `return req.error()` instead of `throw`?**
`req.error()` integrates with CAP's error handling and returns a proper OData error response with the correct HTTP status code. Fiori Elements reads this and displays the error message to the user automatically in a dialog. A raw `throw` would cause an unhandled exception.

**HTTP status codes:**
- `400` — Bad Request (wrong state, business rule violation)
- `403` — Forbidden (wrong user, permission violation)
- `404` — Not Found (entity doesn't exist)

---

## Audit Log Pattern

Every significant action writes an audit entry:

```javascript
await INSERT.into(AuditLog).entries({
  request_ID: ID,
  entityName: 'Request',
  entityId: ID,
  action: 'APPROVE',
  oldValue: request.status,
  newValue: 'APPROVED',
  performedBy: req.user.id,
});
```

`performedBy: req.user.id` captures who performed the action from the JWT token. This cannot be spoofed — it comes directly from the cryptographically signed token.

---

## Handler Flow Summary

```
submit()
  ├── Validate: status is DRAFT or REJECTED
  ├── Check: runNumber ≤ 3
  ├── Create approval steps (based on amount threshold)
  ├── Create WorkflowInstance
  ├── Update Request status → IN_APPROVAL
  └── Write AuditLog

approve()
  ├── Validate: status is IN_APPROVAL
  ├── Find ACTIVE step
  ├── Guard: approverUserId === req.user.id
  ├── Update step → COMPLETED / APPROVED
  ├── Check: any pending steps remaining?
  │   └── NO → Update Request → APPROVED
  └── Write AuditLog

reject()
  ├── Validate: status is IN_APPROVAL
  ├── Find ACTIVE step
  ├── Guard: approverUserId === req.user.id
  ├── Update step → COMPLETED / REJECTED
  ├── Skip all other ACTIVE steps
  ├── Update Request → REJECTED
  └── Write AuditLog
```
