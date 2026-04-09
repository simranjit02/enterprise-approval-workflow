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