# Schema Design — Enterprise Approval Workflow

## Overview

The schema is the foundation of the entire project. It defines what data exists, how it relates, and what constraints apply. A poorly designed schema creates problems everywhere downstream — in handlers, in the UI, in reports. Getting it right first saves enormous time.

This document explains every entity, every field choice, and every relationship decision. The source is `db/schema.cds`.

---

## The Data Model

```
PurchaseRequest
  ├── RequestItem (many, composition)
  ├── ApprovalStep (many, composition)
  ├── WorkflowInstance (many)
  └── AuditLog (many)

DepartmentBudget        one row per cost center and month
CurrencyValue, PriorityValue, CategoryValue, CountryValue   dropdown values
```

Everything revolves around a `PurchaseRequest`. Budgets stand on their own: many requests reserve from the same cost center's monthly row.

---

## Entity: PurchaseRequest

```cds
entity PurchaseRequest : cuid, managed {
    requestNumber         : String(20);      // PR-2026-001, set on first submit
    title                 : String(100);
    vendorId              : String(20);      // S/4 supplier
    vendorName            : String(200);
    vendorCountry         : String(3);
    priority              : Priority default 'MEDIUM';
    category              : RequestCategory;
    department            : String(100);
    costCenter            : String(20);      // S/4 cost center
    costCenterName        : String(50);
    costCenterCurrency    : String(5);       // the budget's currency, from S/4
    justification         : String(1000);
    requestedDeliveryDate : Date;
    totalAmount           : Decimal(15, 2);
    currency              : String(5);
    budgetCheckStatus     : BudgetCheckStatus;
    budgetFiscalYear      : Integer;         // period the budget was reserved in
    budgetFiscalMonth     : Integer;
    status                : Status default 'DRAFT';
    submittedAt           : Timestamp;
    completedAt           : Timestamp;
    virtual isApprover    : Boolean;         // computed per user on read
    virtual isOwner       : Boolean;
    virtual hideEdit      : Boolean;
    items                 : Composition of many RequestItem  on items.request = $self;
    steps                 : Composition of many ApprovalStep on steps.request = $self;
    workflows             : Association to many WorkflowInstance on workflows.request = $self;
    auditLogs             : Association to many AuditLog on auditLogs.request = $self;
}
```

**Why `cuid`?**
CAP's `cuid` automatically generates a UUID for the `ID` field. This avoids sequential IDs which expose business volume (e.g. your 1000th customer can see their ID is 1000). UUIDs are also globally unique — safe for distributed systems.

**Why `managed`?**
CAP's `managed` automatically adds and fills four fields: `createdAt`, `createdBy`, `modifiedAt`, `modifiedBy`. You never write code for these — CAP handles them on every INSERT and UPDATE. `createdBy` is also what makes a user the owner of a request: access rules use `createdBy = $user`.

**Why `Decimal(15, 2)` for amounts?**
Never use `Float` or `Double` for money. Floating point arithmetic introduces rounding errors — `0.1 + 0.2 = 0.30000000000000004` in IEEE 754. `Decimal(15, 2)` gives you exact precision: up to 13 digits before the decimal point, exactly 2 after.

**Why store `vendorName`, `costCenterName` and `costCenterCurrency` when S/4 already has them?**
They are filled from S/4 when the user picks a vendor or cost center. Storing them keeps the request readable when S/4 is down, and keeps what the approvers saw even if S/4 data changes later. `costCenterCurrency` is the budget's currency: submit refuses a request in any other currency, because nothing converts between currencies.

**Why `budgetFiscalYear` and `budgetFiscalMonth`?**
A request reserves budget in the month it is submitted, but may be approved or rejected in the next month. Approve and reject must move money in the same budget row the reservation went to, so the period is stored on the request.

**Why the `virtual` fields?**
They are not stored. The service computes them for the current user on every read, and the UI uses them to show or hide buttons: Approve/Reject (`isApprover`), Submit/Cancel (`isOwner`), Edit/Delete (`hideEdit`).

**Why `Composition` for items and steps but `Association` for the rest?**
- `Composition` means deep ownership — items and steps cannot exist without their request. Deleting a request deletes them, and they are part of the request's draft.
- `Association` for WorkflowInstance and AuditLog means they exist more independently. Audit entries in particular must survive the request.

Steps being a composition has one catch: a draft copies them, so the service marks `ApprovalSteps` `@readonly` and drops `steps` from every request write. Only submit, approve and reject change steps.

**Status lifecycle:**
```
DRAFT → IN_APPROVAL → APPROVED
                    → REJECTED → IN_APPROVAL (resubmit, at most 3 submissions)
DRAFT → CANCELLED
```
`SUBMITTED` exists in the enum but is only set and replaced inside the same submit transaction.

---

## Entity: RequestItem

```cds
entity RequestItem : cuid, managed {
    request         : Association to one PurchaseRequest not null;
    itemNumber      : Integer not null;     // highest existing + 1
    productId       : String(40);           // S/4 product
    productName     : String(200) not null;
    productCategory : String(100);          // S/4 product group
    quantity        : Decimal(13, 3) not null;
    unit            : String(3) not null;
    unitPrice       : Decimal(15, 2) not null;  // agreed price from the S/4 info record when one exists
    lineTotal       : Decimal(15, 2);           // quantity × unitPrice, kept up to date by the service
}
```

**Why `Decimal(13, 3)` for quantity?**
Units like kilograms or hours need fractions; three decimals cover them.

---

## Entity: DepartmentBudget

```cds
entity DepartmentBudget : cuid, managed {
    costCenter        : String(20) not null;
    fiscalYear        : Integer not null;
    fiscalMonth       : Integer not null;
    totalAnnualBudget : Decimal(15, 2);
    monthlyAllocation : Decimal(15, 2);
    consumedAmount    : Decimal(15, 2) default 0;   // approved
    reservedAmount    : Decimal(15, 2) default 0;   // submitted, waiting for approval
    remainingAmount   : Decimal(15, 2);             // allocation − consumed − reserved
    lastResetAt       : Timestamp;
}
```

**Why reserved and consumed separately?**
Money moves in two steps. Submit reserves it, so two requests cannot both spend the last of the budget. Approve moves it from reserved to consumed; reject moves it back to remaining. The reservation is one atomic `UPDATE … WHERE remainingAmount >= amount`, so two submits at the same moment cannot both pass the check.

---

## Entity: ApprovalStep

```cds
entity ApprovalStep : cuid, managed {
    request        : Association to one PurchaseRequest not null;
    stepNumber     : Integer not null;
    runNumber      : Integer;               // which submission created the step
    approverUserId : String(100) not null;
    approverRole   : String(50) not null;
    stepStatus     : StepStatus not null default 'PENDING';
    decision       : Decision not null default 'PENDING';
    comment        : String(500);
    decidedAt      : Timestamp;
}
```

**Why both `stepNumber` and `runNumber`?**
When a request is rejected and resubmitted, new steps are created. `runNumber` tracks which submission attempt a step belongs to; `stepNumber` the order within a run. The two-person rule needs `runNumber`: one user may not approve two steps of the same run, but a Manager who approved run 1 may approve again in run 2.

Example:
- Run 1, Step 1: Manager approves
- Run 1, Step 2: Finance rejects → request rejected
- Run 2, Step 1: New manager step created
- Run 2, Step 2: New finance step created

**Why `approverRole` AND `approverUserId`?**
- `approverRole` decides who may act: any user with that role.
- `approverUserId` starts as the role name and is overwritten with the real user ID when someone decides, so the step records who actually approved.

Approvers are chosen by role because nothing in the system knows which person manages which cost center. A real system would look the approver up, e.g. from the cost center's responsible user in S/4.

**Why `decidedAt` as a separate field?**
`modifiedAt` from `managed` changes whenever any field is updated. `decidedAt` specifically captures when the approval decision was made — useful for SLA tracking and audit reports.

---

## Entity: WorkflowInstance

```cds
entity WorkflowInstance : cuid, managed {
    request            : Association to one PurchaseRequest not null;
    runNumber          : Integer not null;
    workflowInstanceId : String(100) not null;
    status             : WorkflowStatus not null;   // RUNNING until approved or rejected, then COMPLETED
    startedAt          : Timestamp;
    completedAt        : Timestamp;
}
```

Each submission creates one WorkflowInstance; their count is the run number, and at most 3 runs are allowed. The `workflowInstanceId` is a placeholder like `manual-run-1`, ready to hold a real SAP Build Process Automation ID.

---

## Entity: AuditLog

```cds
entity AuditLog : cuid, managed {
    request     : Association to one PurchaseRequest;
    entityName  : String(100);
    entityId    : UUID;
    action      : String(50);
    oldValue    : LargeString;
    newValue    : LargeString;
    performedBy : String(100);
}
```

Every significant action writes an audit log entry: submit, approve, reject, cancel and budget resets. This is both a compliance requirement and a debugging tool. Requesters can read the entries of their own requests only.

**Why store `oldValue` and `newValue`?**
So you can reconstruct the exact state at any point in time. If a request was in an unexpected state, you can trace exactly how it got there.

**Why `performedBy` instead of relying on `createdBy` from `managed`?**
`createdBy` is the technical user who made the database write — which might be a service account. `performedBy` explicitly captures the business user who triggered the action, taken from `req.user.id` in the handler.

---

## Value Tables

`CurrencyValue` holds all ISO 4217 currencies plus one business setting:

```cds
entity CurrencyValue {
    key code         : String(3);
        name         : String(50);
        financeLimit : Decimal(15, 2);   // above this, Finance approves too; empty = always
}
```

The limit is per currency because the same number means different money: 4,900 GBP is more than 5,000 EUR. A currency without a limit always needs Finance — the safe default. The values live in `db/data/com.enterprise.approval-CurrencyValue.csv`.

---

## Type Enums

```cds
type Decision   : String enum { PENDING; APPROVED; REJECTED; SKIPPED; }
type Status     : String enum { DRAFT; SUBMITTED; IN_APPROVAL; APPROVED; REJECTED; FAILED; BUDGET_ESCALATION; BUDGET_REJECTED; CANCELLED; }
type StepStatus : String enum { PENDING; ACTIVE; COMPLETED; SKIPPED; }
```

**Why enums?**
- CAP generates OData metadata with allowed values, which Fiori Elements uses to create dropdowns
- The code is self-documenting — `status: 'IN_APPROVAL'` is clearer than `status: 3`
- HANA stores them as strings, not integers, making the database readable without a lookup table

Note that CAP does not reject unknown enum values by itself (that needs `@assert.range` on the field), and never checks writes the handlers make directly to the database — handlers must use valid values themselves.

---

## Key Design Decisions Summary

| Decision | Reason |
|---|---|
| `cuid` on all entities | UUID primary keys, globally unique, no sequential exposure |
| `managed` on all entities | Free `createdAt/By`, `modifiedAt/By`; `createdBy` defines ownership |
| `Decimal` for money | Exact precision, no floating point errors |
| `Composition` for items and steps | Owned by the request; steps kept read-only by the service |
| Reserved vs consumed budget | Atomic reservation on submit, no overspending under concurrency |
| Budget period stored on the request | Approve/reject hit the same month the reservation went to |
| `costCenterCurrency` on the request | Budgets are per currency; mismatches are refused |
| `financeLimit` per currency | Same threshold in real money across currencies |
| `runNumber` on steps | Resubmission history and the two-person rule |
| Separate `AuditLog` entity | Full action history for compliance and debugging |
