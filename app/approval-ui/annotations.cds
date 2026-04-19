using ApprovalService as service from '../../srv/service';

// ─── Requests: Header + List + Actions ───────────────────────────────────────

annotate service.Requests with @(

    UI.HeaderInfo: {
        TypeName      : 'Purchase Request',
        TypeNamePlural: 'Purchase Requests',
        Title         : {
            $Type: 'UI.DataField',
            Value: title,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: requestNumber,
        },
        TypeImageUrl  : 'sap-icon://sales-order',
    },

    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Label: 'Request No.',
            Value: requestNumber,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Title',
            Value: title,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Vendor',
            Value: vendorName,
        },
        {
            $Type      : 'UI.DataField',
            Label      : 'Priority',
            Value      : priority,
            Criticality: {$edmJson: {$If: [
                {$Eq: [{$Path: 'priority'}, 'CRITICAL']}, 1,
                {$If: [
                    {$Eq: [{$Path: 'priority'}, 'HIGH']}, 2,
                2]}
            ]}},
        },
        {
            $Type: 'UI.DataField',
            Label: 'Department',
            Value: department,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Amount',
            Value: totalAmount,
        },
        {
            $Type      : 'UI.DataField',
            Label      : 'Status',
            Value      : status,
            Criticality: {$edmJson: {$If: [
                {$Eq: [{$Path: 'status'}, 'APPROVED']}, 3,
                {$If: [
                    {$Eq: [{$Path: 'status'}, 'IN_APPROVAL']}, 2,
                    {$If: [
                        {$Eq: [{$Path: 'status'}, 'BUDGET_ESCALATION']}, 2,
                        {$If: [
                            {$Eq: [{$Path: 'status'}, 'DRAFT']}, 0,
                        1]}
                    ]}
                ]}
            ]}},
        },
        {
            $Type      : 'UI.DataField',
            Label      : 'AI Risk',
            Value      : aiRiskLevel,
            Criticality: {$edmJson: {$If: [
                {$Eq: [{$Path: 'aiRiskLevel'}, 'LOW']}, 3,
                {$If: [
                    {$Eq: [{$Path: 'aiRiskLevel'}, 'MEDIUM']}, 2,
                1]}
            ]}},
        },
    ],

    UI.Identification: [
        {
            $Type      : 'UI.DataFieldForAction',
            Action     : 'ApprovalService.submit',
            Label      : 'Submit',
            Determining: true,
            Criticality: #Positive,
        },
        {
            $Type      : 'UI.DataFieldForAction',
            Action     : 'ApprovalService.approve',
            Label      : 'Approve',
            Determining: true,
            Criticality: #Positive,
        },
        {
            $Type      : 'UI.DataFieldForAction',
            Action     : 'ApprovalService.reject',
            Label      : 'Reject',
            Determining: true,
            Criticality: #Negative,
        },
    ],

    UI.Facets: [
        {
            $Type : 'UI.CollectionFacet',
            ID    : 'GeneralInfo',
            Label : 'General Information',
            Facets: [
                {
                    $Type : 'UI.ReferenceFacet',
                    ID    : 'RequestDetails',
                    Label : 'Request Details',
                    Target: '@UI.FieldGroup#RequestDetails',
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    ID    : 'VendorInfo',
                    Label : 'Vendor Information',
                    Target: '@UI.FieldGroup#VendorInfo',
                },
            ],
        },
        {
            $Type : 'UI.CollectionFacet',
            ID    : 'BusinessContext',
            Label : 'Business Context',
            Facets: [
                {
                    $Type : 'UI.ReferenceFacet',
                    ID    : 'BusinessDetails',
                    Label : 'Business Details',
                    Target: '@UI.FieldGroup#BusinessDetails',
                },
                {
                    $Type : 'UI.ReferenceFacet',
                    ID    : 'StatusTracking',
                    Label : 'Status & Tracking',
                    Target: '@UI.FieldGroup#StatusTracking',
                },
            ],
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'ItemsFacet',
            Label : 'Items',
            Target: 'items/@UI.LineItem',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'BudgetRisk',
            Label : 'Budget & Risk',
            Target: '@UI.FieldGroup#BudgetRisk',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'ApprovalStepsFacet',
            Label : 'Approval Steps',
            Target: 'steps/@UI.LineItem',
        },
    ],

    UI.FieldGroup #RequestDetails: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {$Type: 'UI.DataField', Label: 'Title',          Value: title},
            {$Type: 'UI.DataField', Label: 'Priority',       Value: priority},
            {$Type: 'UI.DataField', Label: 'Category',       Value: category},
            {$Type: 'UI.DataField', Label: 'Justification',  Value: justification},
            {$Type: 'UI.DataField', Label: 'Delivery Date',  Value: requestedDeliveryDate},
        ],
    },

    UI.FieldGroup #VendorInfo: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {$Type: 'UI.DataField', Label: 'Vendor ID',   Value: vendorId},
            {$Type: 'UI.DataField', Label: 'Vendor Name', Value: vendorName},
            {$Type: 'UI.DataField', Label: 'Country',     Value: vendorCountry},
            {$Type: 'UI.DataField', Label: 'Industry',    Value: vendorIndustry},
        ],
    },

    UI.FieldGroup #BusinessDetails: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {$Type: 'UI.DataField', Label: 'Department',  Value: department},
            {$Type: 'UI.DataField', Label: 'Cost Center', Value: costCenter},
        ],
    },

    UI.FieldGroup #StatusTracking: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {$Type: 'UI.DataField', Label: 'Request No.',  Value: requestNumber},
            {$Type: 'UI.DataField', Label: 'Status',       Value: status},
            {$Type: 'UI.DataField', Label: 'Submitted At', Value: submittedAt},
            {$Type: 'UI.DataField', Label: 'Completed At', Value: completedAt},
        ],
    },

    UI.FieldGroup #BudgetRisk: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {$Type: 'UI.DataField', Label: 'Total Amount',    Value: totalAmount},
            {$Type: 'UI.DataField', Label: 'Currency',        Value: currency},
            {$Type: 'UI.DataField', Label: 'Budget Status',   Value: budgetCheckStatus},
            {$Type: 'UI.DataField', Label: 'AI Risk Level',   Value: aiRiskLevel},
            {$Type: 'UI.DataField', Label: 'AI Risk Summary', Value: aiRiskSummary},
        ],
    },
);

// ─── Field Controls ───────────────────────────────────────────────────────────

annotate service.Requests with {
    title                 @Common.FieldControl: #Mandatory;
    category              @Common.FieldControl: #Mandatory;
    priority              @Common.FieldControl: #Mandatory;
    department            @Common.FieldControl: #Mandatory;
    justification         @Common.FieldControl: #Mandatory;
    currency              @Common.FieldControl: #ReadOnly;
    requestNumber         @Common.FieldControl: #ReadOnly;
    status                @Common.FieldControl: #ReadOnly;
    budgetCheckStatus     @Common.FieldControl: #ReadOnly;
    aiRiskLevel           @Common.FieldControl: #ReadOnly;
    aiRiskSummary         @Common.FieldControl: #ReadOnly;
    submittedAt           @Common.FieldControl: #ReadOnly;
    completedAt           @Common.FieldControl: #ReadOnly;
};

// ─── SideEffects ─────────────────────────────────────────────────────────────

annotate service.Requests with actions {
    submit  @(Common.SideEffects: {
        TargetProperties: ['in/status', 'in/submittedAt', 'in/budgetCheckStatus'],
        TargetEntities  : [in.steps],
    });
    approve @(Common.SideEffects: {
        TargetProperties: ['in/status', 'in/completedAt'],
        TargetEntities  : [in.steps],
    });
    reject  @(Common.SideEffects: {
        TargetProperties: ['in/status', 'in/completedAt'],
        TargetEntities  : [in.steps],
    });
};

// ─── RequestItems: Child Table ────────────────────────────────────────────────

annotate service.RequestItems with @(UI.LineItem: [
    {$Type: 'UI.DataField', Label: 'Item No.',   Value: itemNumber,      @UI.Importance: #High},
    {$Type: 'UI.DataField', Label: 'Product ID', Value: productId,       @UI.Importance: #Medium},
    {$Type: 'UI.DataField', Label: 'Name',       Value: productName,     @UI.Importance: #High},
    {$Type: 'UI.DataField', Label: 'Category',   Value: productCategory, @UI.Importance: #Medium},
    {$Type: 'UI.DataField', Label: 'Quantity',   Value: quantity,        @UI.Importance: #High},
    {$Type: 'UI.DataField', Label: 'Unit',       Value: unit,            @UI.Importance: #High},
    {$Type: 'UI.DataField', Label: 'Unit Price', Value: unitPrice,       @UI.Importance: #High},
    {$Type: 'UI.DataField', Label: 'Line Total', Value: lineTotal,       @UI.Importance: #High},
]);

// ─── ApprovalSteps: Child Table ───────────────────────────────────────────────

annotate service.ApprovalSteps with @(UI.LineItem: [
    {$Type: 'UI.DataField', Label: 'Step',         Value: stepNumber,     @UI.Importance: #High},
    {$Type: 'UI.DataField', Label: 'Approver Role',Value: approverRole,   @UI.Importance: #High},
    {$Type: 'UI.DataField', Label: 'Approver',     Value: approverUserId, @UI.Importance: #High},
    {
        $Type      : 'UI.DataField',
        Label      : 'Decision',
        Value      : decision,
        Criticality: {$edmJson: {$If: [
            {$Eq: [{$Path: 'decision'}, 'APPROVED']}, 3,
            {$If: [{$Eq: [{$Path: 'decision'}, 'REJECTED']}, 1, 2]}
        ]}},
        @UI.Importance: #High,
    },
    {$Type: 'UI.DataField', Label: 'Status',       Value: stepStatus,     @UI.Importance: #High},
    {$Type: 'UI.DataField', Label: 'Comment',      Value: comment,        @UI.Importance: #Medium},
    {$Type: 'UI.DataField', Label: 'Decided At',   Value: decidedAt,      @UI.Importance: #Medium},
]);
annotate service.Requests with {
    totalAmount @Common.FieldControl : #ReadOnly
};

