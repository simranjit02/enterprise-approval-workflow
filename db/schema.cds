namespace com.enterprise.approval;

using { managed, cuid } from '@sap/cds/common';

type Decision : String enum {
    PENDING;
    APPROVED;
    REJECTED;
}

type Status : String enum {
    DRAFT;
    SUBMITTED;
    IN_APPROVAL;
    APPROVED;
    REJECTED;
    FAILED;
}

type ExecutionStatus : String enum {
    PENDING;
    SUCCESS;
    FAILED;
}

type WorkflowStatus : String enum {
    STARTED;
    RUNNING;
    COMPLETED;
    CANCELLED;
    FAILED;
}

type StepStatus : String enum {
    PENDING;
    ACTIVE;
    COMPLETED;
    SKIPPED;
}

entity Request : cuid, managed {
    title       : String(100);
    description : String(500);
    amount      : Decimal(15,2);
    currency    : String(5);
    status      : Status default 'DRAFT';
    steps : Composition of many ApprovalStep
        on steps.request = $self;
    workflows : Association to many WorkflowInstance
        on workflows.request = $self;
    executionLogs : Association to many BusinessExecutionLog
        on executionLogs.request = $self;
    auditLogs : Association to many AuditLog
        on auditLogs.request = $self;
}

entity ApprovalStep : cuid, managed {
    request        : Association to Request not null;
    stepNumber     : Integer not null;
    approverUserId : String(100) not null;
    approverRole   : String(50)  not null;
    stepStatus     : StepStatus default 'PENDING' not null;
    decision       : Decision   default 'PENDING' not null;
    comment        : String(500);
    decidedAt      : Timestamp;
}

entity WorkflowInstance : cuid, managed {
    request            : Association to Request not null;
    runNumber          : Integer not null; // important for resubmission tracking
    workflowInstanceId : String(100) not null;
    status             : WorkflowStatus not null;
    startedAt          : Timestamp;
    completedAt        : Timestamp;
    escalated          : Boolean default false;
    escalationCount    : Integer default 0;
}

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

entity AuditLog : cuid, managed {
    request     : Association to Request not null;
    entityName  : String(100);
    entityId    : UUID;
    action      : String(50);
    oldValue    : LargeString;
    newValue    : LargeString;
    performedBy : String(100);
}