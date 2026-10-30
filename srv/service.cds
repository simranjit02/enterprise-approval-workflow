using {com.enterprise.approval as db} from '../db/schema';

using {S4HANA_SANDBOX} from './external/S4HANA_SANDBOX';

using {API_PRODUCT_SRV} from './external/API_PRODUCT_SRV';

using {API_COSTCENTER_SRV} from './external/API_COSTCENTER_SRV';

@path: 'approval'
service ApprovalService {
    annotate ApprovalSteps with @restrict: [
        {
            grant: ['READ'],
            to   : ['Requester'],
            where: 'request.createdBy = $user'
        },
        {
            grant: ['READ'],
            to   : [
                'Manager',
                'Finance',
                'Admin'
            ]
        }
    ];

    annotate AuditLogs with @restrict: [
        {
            grant: ['READ'],
            to   : ['Requester'],
            where: 'request.createdBy = $user'
        },
        {
            grant: ['READ'],
            to   : [
                'Manager',
                'Finance',
                'Admin'
            ]
        }
    ];

    annotate RequestItems with @restrict: [
        {
            grant: [
                'CREATE',
                'READ',
                'WRITE'
            ],
            to   : ['Requester'],
            where: 'createdBy = $user'
        },
        {
            grant: ['READ'],
            to   : [
                'Manager',
                'Finance',
                'Admin'
            ]
        }
    ];

    annotate Requests with @restrict: [
        {
            grant: [
                'CREATE',
                'READ',
                'WRITE'
            ],
            to   : ['Requester'],
            where: 'createdBy = $user'
        },
        {
            // bound-action instance checks only work here, not on the action itself
            grant: [
                'submit',
                'cancel',
                'validateCostCenter'
            ],
            to   : ['Requester'],
            where: 'createdBy = $user'
        },
        {
            grant: ['READ'],
            to   : [
                'Manager',
                'Finance',
                'Admin'
            ]
        }
    ];

    @odata.draft.enabled
    entity Requests         as projection on db.PurchaseRequest
        actions {
            action submit()                returns Requests;

            @restrict: [{
                grant: ['WRITE'],
                to   : [
                    'Manager',
                    'Finance'
                ]
            }]
            action approve()               returns Requests;
            action cancel()                returns Requests;
            @restrict: [{
                grant: ['WRITE'],
                to   : [
                    'Manager',
                    'Finance'
                ]
            }]
            action reject(comment: String) returns Requests;

            @restrict: [{
                grant: ['WRITE'],
                to   : [
                    'Manager',
                    'Finance'
                ]
            }]
            action validateVendor()        returns Requests;

            action validateCostCenter()    returns Requests;

            @restrict: [{
                grant: ['READ'],
                to   : [
                    'Requester',
                    'Manager',
                    'Finance'
                ]
            }]
            action checkBudget()           returns String;
        };

    entity RequestItems     as projection on db.RequestItem
                               order by
                                   itemNumber asc
        actions {
            @restrict: [{
                grant: ['WRITE'],
                to   : ['Requester']
            }]
            action validateProduct() returns RequestItems;
        };


    entity ApprovalSteps    as projection on db.ApprovalStep
                               order by
                                   stepNumber asc;

    entity AuditLogs        as projection on db.AuditLog;

    @cds.autoexpose
    @readonly
    entity VendorHelp       as
        projection on S4HANA_SANDBOX.A_BusinessPartner {
            key BusinessPartner         as vendorId,
                BusinessPartnerFullName as vendorName
        };

    @cds.autoexpose
    @readonly
    entity ProductHelp      as
        projection on API_PRODUCT_SRV.A_Product {
            key Product  as productId,
                BaseUnit as baseUnit
        };

    @cds.autoexpose
    @readonly
    entity CostCenterHelp   as
        projection on API_COSTCENTER_SRV.A_CostCenter_2 {
            key CostCenter     as costCenterId,
                ControllingArea,
                CostCenterName as costCenterName,
                CompanyCode
        };

    @cds.redirection.target
    entity A_Product        as
        projection on API_PRODUCT_SRV.A_Product {
            Product,
            ProductType,
            GrossWeight,
            WeightUnit,
            NetWeight,
            CountryOfOrigin,
            ItemCategoryGroup
        };

    // Per-user UI flags; the UI can't know roles from static metadata.
    @odata.singleton
    @cds.persistence.skip
    @readonly
    entity UserInfo {
        hideCreate : Boolean; // only Requesters can create requests
    }

    // ─── Dropdown Value Help Entities ────────────────────────────────────────────
    @readonly
    entity PriorityValues   as projection on db.PriorityValue;
    @readonly
    entity CategoryValues   as projection on db.CategoryValue;
    @readonly
    entity CountryValues    as projection on db.CountryValue;
    @readonly
    entity IndustryValues   as projection on db.IndustryValue;
    @readonly
    entity CurrencyValues   as projection on db.CurrencyValue;
    @readonly
    entity DepartmentBudget as projection on db.DepartmentBudget;
}

annotate ApprovalService with @requires: ['authenticated-user'];

annotate ApprovalService.Requests with {
    budgetFiscalYear  @readonly;
    budgetFiscalMonth @readonly;
};
