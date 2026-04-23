using {com.enterprise.approval as db} from '../db/schema';
using {S4HANA_SANDBOX} from './external/S4HANA_SANDBOX';
using {API_PRODUCT_SRV} from './external/API_PRODUCT_SRV';
using {API_COSTCENTER_SRV} from './external/API_COSTCENTER_SRV';
@requires: 'authenticated-user'
@path    : 'approval'
service ApprovalService {

  @restrict: [
    {
      grant: [
        'CREATE',
        'READ',
        'WRITE'
      ],
      to   : 'Requester'
    },
    {
      grant: ['READ'],
      to   : [
        'Manager',
        'Finance',
        'Admin'
      ]
    }
  ]
  @odata.draft.enabled

  entity Requests      as projection on db.PurchaseRequest
    actions {
      @restrict: [{
        grant: 'WRITE',
        to   : 'Requester'
      }]
      action submit()                returns Requests;
      @restrict: [{
        grant: 'WRITE',
        to   : [
          'Manager',
          'Finance'
        ]
      }]
      action approve()               returns Requests;
      @restrict: [{
        grant: 'WRITE',
        to   : [
          'Manager',
          'Finance'
        ]
      }]
      action reject(comment: String) returns Requests;
      @restrict: [{
        grant: 'WRITE',
        to   : 'Requester'
      }]
      action validateVendor()        returns Requests;
      @restrict: [{
        grant: 'WRITE',
        to   : 'Requester'
      }]
      action validateCostCenter()    returns Requests;
    };


  @restrict: [
    {
      grant: [
        'CREATE',
        'READ',
        'WRITE'
      ],
      to   : 'Requester'
    },
    {
      grant: ['READ'],
      to   : [
        'Manager',
        'Finance',
        'Admin'
      ]
    }
  ]
  entity RequestItems  as projection on db.RequestItem
                          order by
                            itemNumber asc
    actions {
      @restrict: [{
        grant: 'WRITE',
        to   : 'Requester'
      }]
      action validateProduct() returns RequestItems;
    };

  @restrict: [{
    grant: 'READ',
    to   : [
      'Manager',
      'Finance',
      'Admin'
    ]
  }]
  entity ApprovalSteps as projection on db.ApprovalStep
                          order by
                            stepNumber asc;

  @restrict: [{
    grant: 'READ',
    to   : [
      'Requester',
      'Manager',
      'Finance',
      'Admin'
    ]
  }]
  entity AuditLogs     as projection on db.AuditLog;

  @readonly
  @cds.autoexpose
  entity VendorHelp       as projection on S4HANA_SANDBOX.A_BusinessPartner {
    key BusinessPartner        as vendorId,
        BusinessPartnerFullName as vendorName
  };

  @readonly
  @cds.autoexpose
  entity ProductHelp      as projection on API_PRODUCT_SRV.A_Product {
    key Product  as productId,
        BaseUnit as baseUnit
  };

  @readonly
  @cds.autoexpose
  entity CostCenterHelp   as projection on API_COSTCENTER_SRV.A_CostCenter_2 {
    key CostCenter       as costCenterId,
        ControllingArea,
        CostCenterName   as costCenterName,
        CompanyCode
  };

}
