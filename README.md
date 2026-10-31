# Enterprise Approval Workflow

A full-stack enterprise approval system built with SAP CAP, SAP Fiori Elements, and XSUAA.

## Tech Stack
- SAP CAP (Node.js)
- SAP Fiori Elements (UI5)
- SQLite (local) / SAP HANA Cloud (production)
- XSUAA (authentication)
- SAP S/4HANA Cloud APIs: Business Partner (suppliers), Product, Cost Center, Purchasing Info Record

## Features
- Purchase requests with vendor, product, price and cost center data from S/4HANA
- Monthly budget per cost center: reserved on submit, spent on approval, released on reject
- Manager approval; Finance approves too above the per-currency limit (`financeLimit` in `db/data/com.enterprise.approval-CurrencyValue.csv`)
- Two-step approvals need two different people
- Audit logging and role-based access control

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
