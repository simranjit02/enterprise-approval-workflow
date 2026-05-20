using AdminService as service from '../../srv/admin-service';

// ─── Purchase Requests List Report ───────────────────────────────────────────
annotate service.PurchaseRequests with @(
    UI.SelectionFields: [
        status,
        priority,
        category,
        department,
        costCenter,
        createdAt
    ],
    UI.LineItem: [
        { Value: requestNumber, Label: 'Request #' },
        { Value: title,         Label: 'Title' },
        { Value: department,    Label: 'Department' },
        { Value: costCenter,    Label: 'Cost Center' },
        { Value: totalAmount,   Label: 'Amount' },
        { Value: currency,      Label: 'Currency' },
        { Value: status,        Label: 'Status' },
        { Value: priority,      Label: 'Priority' },
        { Value: category,      Label: 'Category' },
        { Value: createdBy,     Label: 'Requested By' },
        { Value: createdAt,     Label: 'Created On' }
    ]
);

annotate service.PurchaseRequests with @(
    UI.FieldGroup #General: {
        Label: 'General Information',
        Data: [
            { Value: requestNumber },
            { Value: title },
            { Value: status },
            { Value: priority },
            { Value: category },
            { Value: department },
            { Value: costCenter },
            { Value: costCenterName },
            { Value: justification }
        ]
    },
    UI.FieldGroup #Financial: {
        Label: 'Financial Details',
        Data: [
            { Value: totalAmount },
            { Value: currency },
            { Value: budgetCheckStatus },
            { Value: requestedDeliveryDate }
        ]
    },
    UI.FieldGroup #Vendor: {
        Label: 'Vendor Information',
        Data: [
            { Value: vendorId },
            { Value: vendorName },
            { Value: vendorCountry },
            { Value: vendorIndustry }
        ]
    },
    UI.FieldGroup #AI: {
        Label: 'AI Assessment',
        Data: [
            { Value: aiRiskLevel },
            { Value: aiRiskSummary }
        ]
    },
    UI.FieldGroup #Timestamps: {
        Label: 'Timeline',
        Data: [
            { Value: createdAt },
            { Value: createdBy },
            { Value: submittedAt },
            { Value: completedAt }
        ]
    },
    UI.Facets: [
        { $Type: 'UI.ReferenceFacet', Label: 'General',   Target: '@UI.FieldGroup#General' },
        { $Type: 'UI.ReferenceFacet', Label: 'Financial', Target: '@UI.FieldGroup#Financial' },
        { $Type: 'UI.ReferenceFacet', Label: 'Vendor',    Target: '@UI.FieldGroup#Vendor' },
        { $Type: 'UI.ReferenceFacet', Label: 'AI Risk',   Target: '@UI.FieldGroup#AI' },
        { $Type: 'UI.ReferenceFacet', Label: 'Timeline',  Target: '@UI.FieldGroup#Timestamps' }
    ]
);

// ─── Department Budgets List Report ──────────────────────────────────────────
annotate service.DepartmentBudgets with @(
    UI.SelectionFields: [
        costCenter,
        fiscalYear,
        fiscalMonth
    ],
    UI.LineItem: [
        { Value: costCenter,        Label: 'Cost Center' },
        { Value: fiscalYear,        Label: 'Year' },
        { Value: fiscalMonth,       Label: 'Month' },
        { Value: monthlyAllocation, Label: 'Monthly Budget' },
        { Value: consumedAmount,    Label: 'Consumed' },
        { Value: reservedAmount,    Label: 'Reserved' },
        { Value: remainingAmount,   Label: 'Remaining' },
        { Value: lastResetAt,       Label: 'Last Reset' }
    ]
);

annotate service.DepartmentBudgets with @(
    UI.FieldGroup #BudgetDetails: {
        Label: 'Budget Details',
        Data: [
            { Value: costCenter },
            { Value: fiscalYear },
            { Value: fiscalMonth },
            { Value: monthlyAllocation },
            { Value: totalAnnualBudget }
        ]
    },
    UI.FieldGroup #BudgetStatus: {
        Label: 'Current Status',
        Data: [
            { Value: consumedAmount },
            { Value: reservedAmount },
            { Value: remainingAmount },
            { Value: lastResetAt }
        ]
    },
    UI.Facets: [
        { $Type: 'UI.ReferenceFacet', Label: 'Budget Details', Target: '@UI.FieldGroup#BudgetDetails' },
        { $Type: 'UI.ReferenceFacet', Label: 'Current Status', Target: '@UI.FieldGroup#BudgetStatus' }
    ],
    UI.HeaderInfo: {
        TypeName: 'Department Budget',
        TypeNamePlural: 'Department Budgets',
        Title: { Value: costCenter },
        Description: { Value: fiscalYear }
    }
);

// ─── Audit Logs List Report ───────────────────────────────────────────────────
annotate service.AuditLogs with @(
    UI.SelectionFields: [
        entityName,
        action,
        performedBy,
        createdAt
    ],
    UI.LineItem: [
        { Value: createdAt,   Label: 'Timestamp' },
        { Value: entityName,  Label: 'Entity' },
        { Value: action,      Label: 'Action' },
        { Value: performedBy, Label: 'Performed By' },
        { Value: oldValue,    Label: 'Old Value' },
        { Value: newValue,    Label: 'New Value' }
    ]
);
