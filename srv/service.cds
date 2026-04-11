using {com.enterprise.approval as db} from '../db/schema';

service Request {
  @odata.draft.enabled
  entity Requests      as projection on db.Request
    actions {
      action submit()  returns Requests;
      action approve() returns Requests;
      action reject()  returns Requests;
    };

  entity ApprovalSteps as projection on db.ApprovalStep;
  entity AuditLogs     as projection on db.AuditLog;
}
