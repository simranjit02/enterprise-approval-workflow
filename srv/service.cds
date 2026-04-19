using {com.enterprise.approval as db} from '../db/schema';

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
                            itemNumber asc;

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

}
