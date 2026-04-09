using Request as service from '../../srv/service';

annotate service.Requests with @(
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'title',
                Value: title,
            },
            {
                $Type: 'UI.DataField',
                Label: 'description',
                Value: description,
            },
            {
                $Type: 'UI.DataField',
                Label: 'amount',
                Value: amount,
            },
            {
                $Type: 'UI.DataField',
                Label: 'currency',
                Value: currency,
            },
            {
                $Type: 'UI.DataField',
                Label: 'status',
                Value: status,
            },
        ],
    },
    UI.Facets                    : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup',
    }, ],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: 'title',
            Value: title,
        },
        {
            $Type: 'UI.DataField',
            Label: 'description',
            Value: description,
        },
        {
            $Type: 'UI.DataField',
            Label: 'amount',
            Value: amount,
        },
        {
            $Type: 'UI.DataField',
            Label: 'currency',
            Value: currency,
        },
        {
            $Type: 'UI.DataField',
            Label: 'status',
            Value: status,
        },
    ],
    UI.HeaderInfo                : {
        TypeName      : 'Request Detail',
        TypeNamePlural: '',
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
    UI.Identification            : [{
        $Type        : 'UI.DataFieldForAction',
        Action       : 'Request.submit',
        Label        : 'Submit',
        Determining  : true,
        Criticality  : #Positive,
        ![@UI.Hidden]: {$edmJson: {$Or: [
            {$Eq: [
                {$Path: 'IsActiveEntity'},
                {$Bool: false}
            ]},
            {$Ne: [
                {$Path: 'status'},
                {$String: 'DRAFT'}
            ]}
        ]}}
    }, ],
);

annotate service.Requests with {
    title @Common.FieldControl: #Mandatory
};

annotate service.Requests with {
    description @Common.FieldControl: #Mandatory
};

annotate service.Requests with {
    amount @(
        Common.FieldControl : #Mandatory,
        Measures.ISOCurrency: currency,
    )
};

annotate service.Requests with {
    currency @Common.FieldControl: #Mandatory
};

annotate service.Requests with {
    status @Common.FieldControl: [
        #ReadOnly,
        #Mandatory
    ]
};
annotate service.Requests with actions {
  submit @(
    Common.SideEffects: {
      TargetProperties: ['status']
    }
  );
};