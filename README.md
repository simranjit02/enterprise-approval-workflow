# Enterprise Approval Workflow

A full-stack purchase-request approval system built with SAP CAP, SAP Fiori Elements, and XSUAA.
Requesters raise purchase requests using live S/4HANA master data. Each request reserves part of a monthly
cost-center budget and goes through Manager approval, plus Finance approval when the amount is above a set limit.

<!-- Screenshots: save PNGs to doc/images/ and uncomment.
![Request list](doc/images/list.png)
![Request object page](doc/images/object-page.png)
-->

## Tech Stack
- SAP CAP (Node.js)
- SAP Fiori Elements (UI5): an approval app and an admin app
- SQLite (local) / SAP HANA Cloud (production)
- XSUAA (authentication), SAP Alert Notification Service (alerts)
- SAP S/4HANA Cloud APIs: Business Partner (suppliers), Product, Cost Center, Purchasing Info Record

## Architecture

```mermaid
flowchart LR
    U[User browser] --> R[App Router<br/>XSUAA login]
    R --> UI[Fiori apps<br/>approval-ui / admin-ui<br/>HTML5 repo]
    R --> S[CAP service<br/>Node.js]
    S --> DB[(HANA Cloud<br/>SQLite locally)]
    S -->|BTP destinations| S4[S/4HANA Cloud APIs<br/>suppliers, products,<br/>cost centers, info records]
    S --> ANS[Alert Notification<br/>Service]
```

## Request Lifecycle

```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> CANCELLED: cancel
    DRAFT --> IN_APPROVAL: submit (budget reserved)
    IN_APPROVAL --> APPROVED: all steps approved (budget spent)
    IN_APPROVAL --> REJECTED: any step rejects (budget released)
    REJECTED --> IN_APPROVAL: resubmit (max 3 runs)
    APPROVED --> [*]
    CANCELLED --> [*]
```

A submit that would go over the month's budget is refused, and the request stays where it was.

## Approval Flow

```mermaid
sequenceDiagram
    actor Req as Requester
    participant Svc as CAP service
    actor Mgr as Manager
    actor Fin as Finance
    Req->>Svc: submit
    Svc->>Svc: reserve budget, create steps
    Note over Svc: Finance step only if amount > financeLimit
    par steps are active together
        Mgr->>Svc: approve / reject
    and
        Fin->>Svc: approve / reject
    end
    Svc->>Svc: last approval: APPROVED, budget spent
    Svc-->>Req: alert via ANS
```

Rules enforced on the server:
- Nobody can approve or reject their own request.
- A two-step approval needs two different people, even if one user holds both roles.
- A rejection needs a comment, and it skips the other open step.

## Data Model

```mermaid
erDiagram
    PurchaseRequest ||--o{ RequestItem : items
    PurchaseRequest ||--o{ ApprovalStep : steps
    PurchaseRequest ||--o{ WorkflowInstance : "runs (max 3)"
    PurchaseRequest ||--o{ AuditLog : auditLogs
    DepartmentBudget }o..o{ PurchaseRequest : "cost center + month"
    CurrencyValue ||..o{ PurchaseRequest : financeLimit
```

## Features
- Purchase requests with vendor, product, price and cost center data from S/4HANA
- Monthly budget per cost center: reserved on submit, spent on approval, released on reject; low-budget warning and alert below 10%
- Manager approval; Finance approves too above the per-currency limit (`financeLimit` in `db/data/com.enterprise.approval-CurrencyValue.csv`)
- Two-step approvals need two different people
- Audit logging and role-based access control (`@restrict` row-level rules)

## Setup
```
npm install
cds watch
```

The S/4HANA sandbox needs an API key from api.sap.com. Put it in `.cdsrc-private.json` (gitignored):

```json
{
  "requires": {
    "S4HANA_SANDBOX":             { "credentials": { "headers": { "APIKey": "<key>" } } },
    "API_PRODUCT_SRV":            { "credentials": { "headers": { "APIKey": "<key>" } } },
    "API_COSTCENTER_SRV":         { "credentials": { "headers": { "APIKey": "<key>" } } },
    "API_INFORECORD_PROCESS_SRV": { "credentials": { "headers": { "APIKey": "<key>" } } }
  }
}
```

In production each API is reached through a BTP destination of the same name.
The server's time zone (`TZ` in `mta.yaml`) decides the budget month.

## Mock Users
Sign in at `http://localhost:4004/login.html`, or click a test user there.

| User | Password | Role |
|------|----------|------|
| test@company.com | test | Requester, Manager, Finance, Admin |
| requester@company.com | requester | Requester |
| manager@company.com | manager | Manager |
| finance@company.com | finance | Finance |
| noaccess@company.com | noaccess | none |

## Tests
```
npm test
```
S/4HANA calls are stubbed in the tests, so they run offline.

## Further Reading
- [Schema design](doc/01-schema-design.md)
- [Service layer](doc/02-service-layer.md)
- [Handlers](doc/03-handlers.md)
- [XSUAA security](doc/04-xsuaa-security.md)
- [Deployment](doc/05-deployment.md)
- [Architecture decisions](doc/06-architecture-decisions.md)
