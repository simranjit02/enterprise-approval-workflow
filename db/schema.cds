namespace com.enterprise.approval;

using {
    managed,
    cuid
} from '@sap/cds/common';

// ─── Existing Types (extended) ────────────────────────────────────────────────

type Decision          : String enum {
    PENDING;
    APPROVED;
    REJECTED;
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

type ExecutionStatus   : String enum {
    PENDING;
    SUCCESS;
    FAILED;
}

type WorkflowStatus    : String enum {
    STARTED;
    RUNNING;
    COMPLETED;
    CANCELLED;
    FAILED;
}

type StepStatus        : String enum {
    PENDING;
    ACTIVE;
    COMPLETED;
    SKIPPED;
}

// ─── New Types ────────────────────────────────────────────────────────────────

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

type BudgetCheckStatus : String enum {
    WITHIN;
    WARNING;
    EXCEEDED;
}

type AIRiskLevel       : String enum {
    LOW;
    MEDIUM;
    HIGH;
    CRITICAL;
}

// ─── Core Entities ────────────────────────────────────────────────────────────

entity PurchaseRequest : cuid, managed {
    // Identity
    requestNumber         : String(20);
    title                 : String(100);

    // Vendor
    vendorId              : String(20);
    vendorName            : String(200);
    vendorCountry         : String(3);
    vendorIndustry        : String(100);

    // Classification
    priority              : Priority default 'MEDIUM';
    category              : RequestCategory;
    department            : String(100);
    costCenter            : String(20);
    costCenterName        : String(50);
    justification : String(1000);
    requestedDeliveryDate : Date;

    // Amount & Budget
    totalAmount           : Decimal(15, 2);
    currency              : String(5);
    budgetCheckStatus     : BudgetCheckStatus;

    // AI Assessment
    aiRiskLevel           : AIRiskLevel;
    aiRiskSummary         : LargeString;

    // Status & Timestamps
    status                : Status default 'DRAFT';
    submittedAt           : Timestamp;
    completedAt           : Timestamp;

    // Compositions & Associations
    items                 : Composition of many RequestItem
                                on items.request = $self;
    steps                 : Composition of many ApprovalStep
                                on steps.request = $self;
    workflows             : Association to many WorkflowInstance
                                on workflows.request = $self;
    executionLogs         : Association to many BusinessExecutionLog
                                on executionLogs.request = $self;
    auditLogs             : Association to many AuditLog
                                on auditLogs.request = $self;
}

entity RequestItem : cuid, managed {
    request         : Association to PurchaseRequest not null;
    itemNumber      : Integer not null;
    productId       : String(40);
    productName     : String(200) not null;
    productCategory : String(100);
    quantity        : Decimal(13, 3) not null;
    unit            : String(3) not null;
    unitPrice       : Decimal(15, 2) not null;
    lineTotal       : Decimal(15, 2); // stored — calculated in handler as quantity * unitPrice
}

entity DepartmentBudget : cuid, managed {
    // Unique constraint: department + fiscalYear + fiscalMonth
    // Enforced in handler on CREATE — CDS has no native compound unique annotation
    costCenter        : String(20) not null;
    fiscalYear        : Integer not null;
    fiscalMonth       : Integer not null; // 1–12
    totalAnnualBudget : Decimal(15, 2) not null;
    monthlyAllocation : Decimal(15, 2) not null;
    consumedAmount    : Decimal(15, 2) default 0;
    reservedAmount    : Decimal(15, 2) default 0;
    remainingAmount   : Decimal(15, 2); // stored — recalculated in handler on every budget mutation
    lastResetAt       : Timestamp;
}

entity ApprovalStep : cuid, managed {
    request        : Association to PurchaseRequest not null;
    stepNumber     : Integer not null;
    approverUserId : String(100) not null;
    approverRole   : String(50) not null;
    stepStatus     : StepStatus default 'PENDING' not null;
    decision       : Decision default 'PENDING' not null;
    comment        : String(500);
    decidedAt      : Timestamp;
}

entity WorkflowInstance : cuid, managed {
    request            : Association to PurchaseRequest not null;
    runNumber          : Integer not null;
    workflowInstanceId : String(100) not null;
    status             : WorkflowStatus not null;
    startedAt          : Timestamp;
    completedAt        : Timestamp;
    escalated          : Boolean default false;
    escalationCount    : Integer default 0;
}

entity BusinessExecutionLog : cuid, managed {
    request        : Association to PurchaseRequest not null;
    attemptNumber  : Integer not null;
    status         : ExecutionStatus not null;
    errorMessage   : String(1000);
    responseBody   : LargeString;
    executedAt     : Timestamp;
    durationMs     : Integer;
    isFinalAttempt : Boolean default false;
}

entity AuditLog : cuid, managed {
    request     : Association to PurchaseRequest not null;
    entityName  : String(100);
    entityId    : UUID;
    action      : String(50);
    oldValue    : LargeString;
    newValue    : LargeString;
    performedBy : String(100);
}
