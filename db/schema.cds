namespace com.enterprise.approval;

using {
    managed,
    cuid
} from '@sap/cds/common';

entity PurchaseRequest : cuid, managed {
    requestNumber         : String(20);
    title                 : String(100);
    vendorId              : String(20);
    vendorName            : String(200);
    vendorCountry         : String(3);
    priority              : Priority default 'MEDIUM';
    category              : RequestCategory;
    department            : String(100);
    costCenter            : String(20);
    costCenterName        : String(50);
    costCenterCurrency    : String(5); // budget currency, from S/4 when the cost center is picked
    justification         : String(1000);
    requestedDeliveryDate : Date;
    totalAmount           : Decimal(15, 2);
    currency              : String(5);
    budgetCheckStatus     : BudgetCheckStatus;
    budgetFiscalYear      : Integer; // period the budget was reserved in
    budgetFiscalMonth     : Integer;
    status                : Status default 'DRAFT';
    submittedAt           : Timestamp;
    completedAt           : Timestamp;
    virtual isApprover    : Boolean;
    virtual isOwner       : Boolean; // current user created it
    virtual hideEdit      : Boolean; // not owner, or no longer DRAFT/REJECTED
    items                 : Composition of many RequestItem
                                on items.request = $self;
    steps                 : Composition of many ApprovalStep
                                on steps.request = $self;
    workflows             : Association to many WorkflowInstance
                                on workflows.request = $self;
    auditLogs             : Association to many AuditLog
                                on auditLogs.request = $self;
}

entity RequestItem : cuid, managed {
    request         : Association to one PurchaseRequest not null;
    itemNumber      : Integer not null;
    productId       : String(40);
    productName     : String(200) not null;
    productCategory : String(100);
    quantity        : Decimal(13, 3) not null;
    unit            : String(3) not null;
    unitPrice       : Decimal(15, 2) not null;
    lineTotal       : Decimal(15, 2);
}

entity DepartmentBudget : cuid, managed {
    costCenter        : String(20) not null;
    fiscalYear        : Integer not null;
    fiscalMonth       : Integer not null;
    totalAnnualBudget : Decimal(15, 2);
    monthlyAllocation : Decimal(15, 2);
    consumedAmount    : Decimal(15, 2) default 0;
    reservedAmount    : Decimal(15, 2) default 0;
    remainingAmount   : Decimal(15, 2);
    lastResetAt       : Timestamp;
}

entity ApprovalStep : cuid, managed {
    request        : Association to one PurchaseRequest not null;
    stepNumber     : Integer not null;
    runNumber      : Integer; // which submission created the step
    approverUserId : String(100) not null;
    approverRole   : String(50) not null;
    stepStatus     : StepStatus not null default 'PENDING';
    decision       : Decision not null default 'PENDING';
    comment        : String(500);
    decidedAt      : Timestamp;
}

entity WorkflowInstance : cuid, managed {
    request            : Association to one PurchaseRequest not null;
    runNumber          : Integer not null;
    workflowInstanceId : String(100) not null;
    status             : WorkflowStatus not null;
    startedAt          : Timestamp;
    completedAt        : Timestamp;
}

entity AuditLog : cuid, managed {
    request     : Association to one PurchaseRequest;
    entityName  : String(100);
    entityId    : UUID;
    action      : String(50);
    oldValue    : LargeString;
    newValue    : LargeString;
    performedBy : String(100);
}

type BudgetCheckStatus : String enum {
    WITHIN;
    WARNING;
    EXCEEDED;
}

type Decision          : String enum {
    PENDING;
    APPROVED;
    REJECTED;
    SKIPPED;
}

type Priority          : String enum {
    LOW;
    MEDIUM;
    HIGH;
    CRITICAL;
}

type RequestCategory   : String enum {
    IT;
    SOFTWARE;
    SERVICES;
    TRAVEL;
    OFFICE;
    OTHER;
}

type Status            : String enum {
    DRAFT;
    SUBMITTED;
    IN_APPROVAL;
    APPROVED;
    REJECTED;
    FAILED;
    BUDGET_ESCALATION;
    BUDGET_REJECTED;
    CANCELLED;
}

type StepStatus        : String enum {
    PENDING;
    ACTIVE;
    COMPLETED;
    SKIPPED;
}

type WorkflowStatus    : String enum {
    STARTED;
    RUNNING;
    COMPLETED;
    CANCELLED;
    FAILED;
}

// ─── Value Help Tables ────────────────────────────────────────────────────────

entity PriorityValue {
    key code  : String(20);
        label : String(50);
}

entity CategoryValue {
    key code  : String(20);
        label : String(50);
}

entity CountryValue {
    key code  : String(3);
        label : String(100);
}

entity CurrencyValue {
    key code         : String(3);
        name         : String(50);
        financeLimit : Decimal(15, 2); // above this amount Finance must approve too; empty = always
}