# Dev Notes

## 2026-04-08

- Code review done — schema strong, gaps identified (stubs, empty XSUAA, README conflict)
- Decided: Kyma paused, certification deferred, focus = CF stack
- BPMN v3 produced but layout still messy — vertical version pending

## 2026-04-09

- submit() action fully working — DRAFT → IN_APPROVAL state machine
- ApprovalStep creation based on amount threshold (≤5000 manager only, >5000 manager + finance)
- AuditLog entries on submission working
- SideEffects annotation fixes status refresh after submit (proper SAP pattern, not a workaround)
- Committed to dev branch
- Next: approval-handler.js (approve + reject actions)

## 2026-04-11

- approve() and reject() action handlers fully implemented
- Guard 1: request status check (must be IN_APPROVAL)
- Guard 2: active step lookup (by request_ID + stepStatus ACTIVE)
- Parallel approval path handled via pendingSteps.length check
- AuditLog entries on approve and reject working
- Mock users configured in package.json (manager, finance, requester)
- README merge conflict resolved
- Next: xs-security.json scopes + @requires annotations in service.cds

## 2026-10-31

- S/4HANA data: vendors from `A_Supplier` (blocked/deleted refused), product name/unit/group, agreed price from the Purchasing Info Record API, cost center validity and currency
- Currency follows the vendor; budgets are per cost center currency and mismatches are refused at submit
- Finance threshold is now per currency (`financeLimit` in CurrencyValue.csv), replacing the fixed 5000
- Approval guards: not your own request, role must match an active step, two steps of one submission need two people
- Alerts sent after commit with a timeout; server time zone set in mta.yaml for the budget month
- Removed unused BusinessExecutionLog, escalation, AI-risk and industry fields
