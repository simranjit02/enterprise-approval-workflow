using ApprovalService as service from '../../srv/service';

annotate service.Requests with @(
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Title',
                Value: title,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Description',
                Value: description,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Amount',
                Value: amount,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Currency',
                Value: currency,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Status',
                Value: status,
            },
        ],
    },
    UI.Facets                    : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup',
    }],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: 'Title',
            Value: title,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Amount',
            Value: amount,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Currency',
            Value: currency,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Status',
            Value: status,
        },
    ],
    UI.HeaderInfo                : {
        TypeName      : 'Request',
        TypeNamePlural: 'Requests',
        Title         : {
            $Type: 'UI.DataField',
            Value: title,
        },
        Description   : {
            $Type: 'UI.DataField',
            Value: description,
        },
        TypeImageUrl  : 'sap-icon://request',
    },
    UI.Identification            : [
        {
            $Type        : 'UI.DataFieldForAction',
            Action       : 'ApprovalService.submit',
            Label        : 'Submit',
            Determining  : true,
            Criticality  : #Positive,
            ![@UI.Hidden]: {$edmJson: {$Or: [
                {$Eq: [
                    {$Path: 'IsActiveEntity'},
                    {$Bool: false}
                ]},

                {$And: [
                    {$Ne: [
                        {$Path: 'status'},
                        'DRAFT'
                    ]},
                    {$Ne: [
                        {$Path: 'status'},
                        'REJECTED'
                    ]},
                ]}
            ]}}
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
);

annotate service.Requests with {
    title       @Common.FieldControl: #Mandatory;
    description @Common.FieldControl: #Mandatory;
    amount      @(
        Common.FieldControl : #Mandatory,
        Measures.ISOCurrency: currency,
    );
    currency    @Common.FieldControl: #Mandatory;
    status      @Common.FieldControl: #ReadOnly;
};

annotate service.Requests with actions {
    submit  @(Common.SideEffects: {TargetProperties: ['status']});
    approve @(Common.SideEffects: {TargetProperties: ['status']});
    reject  @(Common.SideEffects: {TargetProperties: ['status']});
};
