using {com.enterprise.approval as db} from '../db/schema';

@path    : 'admin'
@requires: ['Admin']
@impl    : './handlers/admin-handler.js'

service AdminService {

    // Read-only cross-department view of all requests
    @readonly
    entity PurchaseRequests as projection on db.PurchaseRequest;

    // Full read/write access to department budgets
    @odata.draft.enabled
    entity DepartmentBudgets as projection on db.DepartmentBudget;

    // Read-only audit trail
    @readonly
    entity AuditLogs        as projection on db.AuditLog;

    // Admin action to reset a department budget for a fiscal period
    action resetMonthlyBudget(
        costCenter  : String,
        fiscalYear  : Integer,
        fiscalMonth : Integer,
        budgetAmount: Decimal
    ) returns String;
}