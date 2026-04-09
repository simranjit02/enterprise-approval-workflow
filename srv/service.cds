using {com.enterprise.approval as db} from '../db/schema';

service Request {
  @odata.draft.enabled
  entity Requests as projection on db.Request
    actions {
      action submit() returns Requests;
    };
}