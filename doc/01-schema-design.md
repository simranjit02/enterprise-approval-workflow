# Schema Design — Enterprise Approval Workflow

## Overview

The schema is the foundation of the entire project. It defines what data exists, how it relates, and what constraints apply. A poorly designed schema creates problems everywhere downstream — in handlers, in the UI, in reports. Getting it right first saves enormous time.

This document explains every entity, every field choice, and every relationship decision.

---

## The Data Model

```
Request
  └── ApprovalStep (many)
  └── WorkflowInstance (many)
  └── BusinessExecutionLog (many)
  └── AuditLog (many)
```

Everything revolves around a `Request`. All other entities are children of it. This is intentional — it makes querying simple and keeps data together.

---

## Entity: Request

```cds
entity Request : cuid, managed {
    title         : String(100);
    description   : String(500);
    amount        : Decimal(15, 2);
    currency      : String(5);
    status        : Status default 'DRAFT';
    steps         : Composition of many ApprovalStep on steps.request = $self;
    workflows     : Association to many WorkflowInstance on workflows.request = $self;
    executionLogs : Association to many BusinessExecutionLog on executionLogs.request = $self;
    auditLogs     : Association to many AuditLog on auditLogs.request = $self;
}
```

**Why `cuid`?**
CAP's `cuid` automatically generates a UUID for the `ID` field. This avoids sequential IDs which expose business volume (e.g. your 1000th customer can see their ID is 1000). UUIDs are also globally unique — safe for distributed systems.

**Why `managed`?**
CAP's `managed` automatically adds and fills four fields: `createdAt`, `createdBy`, `modifiedAt`, `modifiedBy`. You never write code for these — CAP handles them on every INSERT and UPDATE. This gives you a free audit trail on every record.

**Why `Decimal(15, 2)` for amount?**
Never use `Float` or `Double` for money. Floating point arithmetic introduces rounding errors — `0.1 + 0.2 = 0.30000000000000004` in IEEE 754. `Decimal(15, 2)` gives you exact precision: up to 13 digits before the decimal point, exactly 2 after.

**Why `Composition` for steps but `Association` for others?**
- `Composition` means deep ownership — steps cannot exist without a request. If you delete a request, its steps are automatically deleted. This is the right relationship for something that has no independent existence.
- `Association` for WorkflowInstance and AuditLog means they exist more independently. They're linked to the request but managed separately.

**Status lifecycle:**
```
DRAFT → SUBMITTED → IN_APPROVAL → APPROVED
                                → REJECTED → SUBMITTED (resubmit)
                              → FAILED
```

---

## Entity: ApprovalStep

```cds
entity ApprovalStep : cuid, managed {
    request        : Association to Request not null;
    stepNumber     : Integer not null;
    runNumber      : Integer default 1;
    approverUserId : String(100) not null;
    approverRole   : String(50) not null;
    stepStatus     : StepStatus default 'PENDING' not null;
    decision       : Decision default 'PENDING' not null;
    comment        : String(500);
    decidedAt      : Timestamp;
}
```

**Why both `stepNumber` and `runNumber`?**
When a request is rejected and resubmitted, new steps are created. `runNumber` tracks which submission attempt this step belongs to. `stepNumber` tracks the order within a run. Together they uniquely identify a step across the full history of a request.

Example:
- Run 1, Step 1: Manager approves
- Run 1, Step 2: Finance rejects → request rejected
- Run 2, Step 1: New manager step created
- Run 2, Step 2: New finance step created

Without `runNumber`, you can't distinguish steps from different submission attempts.

**Why `approverUserId` AND `approverRole`?**
- `approverUserId` is the specific person assigned (e.g. `manager@company.com`)
- `approverRole` is the role category (e.g. `Manager`)

You need both because the guard in the handler checks `approverUserId` to prevent wrong people from approving. But `approverRole` is displayed in the UI and used for routing logic.

**Why `decidedAt` as a separate field?**
`modifiedAt` from `managed` changes whenever any field is updated. `decidedAt` specifically captures when the approval decision was made — useful for SLA tracking and audit reports.

---

## Entity: WorkflowInstance

```cds
entity WorkflowInstance : cuid, managed {
    request            : Association to Request not null;
    runNumber          : Integer not null;
    workflowInstanceId : String(100) not null;
    status             : WorkflowStatus not null;
    startedAt          : Timestamp;
    completedAt        : Timestamp;
    escalated          : Boolean default false;
    escalationCount    : Integer default 0;
}
```

This entity exists to track integration with SAP Build Process Automation (BPA). Each submission creates one WorkflowInstance. The `workflowInstanceId` will eventually hold the real BPA workflow ID — for now it holds a placeholder like `manual-run-1`.

**Why `runNumber` here too?**
So you can correlate which workflow instance belongs to which submission attempt of the request.

**Why `escalated` and `escalationCount`?**
When a step times out (e.g. manager doesn't approve in 48 hours), the task is escalated to a senior manager. These fields track whether escalation happened and how many times — useful for process health monitoring.

---

## Entity: BusinessExecutionLog

```cds
entity BusinessExecutionLog : cuid, managed {
    request        : Association to Request not null;
    attemptNumber  : Integer not null;
    status         : ExecutionStatus not null;
    errorMessage   : String(1000);
    responseBody   : LargeString;
    executedAt     : Timestamp;
    durationMs     : Integer;
    isFinalAttempt : Boolean default false;
}
```

This tracks execution of business actions — like creating a Purchase Order in S/4HANA after approval. Since external system calls can fail and need retry, each attempt is logged separately.

**Why `LargeString` for responseBody?**
External API responses can be large JSON documents. `LargeString` maps to a CLOB in HANA — effectively unlimited size. `String(n)` has a fixed maximum.

**Why `durationMs`?**
Performance monitoring. If your PO creation is taking 30 seconds, you want to know.

---

## Entity: AuditLog

```cds
entity AuditLog : cuid, managed {
    request     : Association to Request not null;
    entityName  : String(100);
    entityId    : UUID;
    action      : String(50);
    oldValue    : LargeString;
    newValue    : LargeString;
    performedBy : String(100);
}
```

Every significant action in the system writes an audit log entry. This is both a compliance requirement and a debugging tool.

**Why store `oldValue` and `newValue`?**
So you can reconstruct the exact state at any point in time. If a request was in an unexpected state, you can trace exactly how it got there.

**Why `performedBy` instead of relying on `createdBy` from `managed`?**
`createdBy` is the technical user who made the database write — which might be a service account. `performedBy` explicitly captures the business user who triggered the action, taken from `req.user.id` in the handler.

---

## Type Enums

```cds
type Decision : String enum { PENDING; APPROVED; REJECTED; }
type Status   : String enum { DRAFT; SUBMITTED; IN_APPROVAL; APPROVED; REJECTED; FAILED; }
type StepStatus : String enum { PENDING; ACTIVE; COMPLETED; SKIPPED; }
```

**Why enums?**
- Validation is automatic — you can't store `"APPROVD"` by accident
- CAP generates OData metadata with allowed values, which Fiori Elements uses to create dropdowns
- The code is self-documenting — `status: 'IN_APPROVAL'` is clearer than `status: 3`
- HANA stores them as strings, not integers, making the database readable without a lookup table

---

## Key Design Decisions Summary

| Decision | Reason |
|---|---|
| `cuid` on all entities | UUID primary keys, globally unique, no sequential exposure |
| `managed` on all entities | Free `createdAt/By`, `modifiedAt/By` on every record |
| `Decimal(15,2)` for money | Exact precision, no floating point errors |
| `Composition` for ApprovalStep | Steps have no independent existence — owned by Request |
| `runNumber` on steps | Track resubmission history correctly |
| Both `approverUserId` and `approverRole` | Security guard uses userId, UI and routing use role |
| Separate `AuditLog` entity | Full action history for compliance and debugging |
| String enums for all status fields | Type safety, auto-validation, readable database |
