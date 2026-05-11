# Admin Dashboard

React + Vite dashboard for the Enterprise Approval Workflow CAP service.

## Prerequisites

- Node.js 18+
- CAP backend running on `http://localhost:4004` (`npm run watch` or `cds watch` from the project root)

## Run

```bash
cd app/admin-dashboard
npm install
npm run dev
```

Open [http://localhost:5174](http://localhost:5174).

## Auth

The dashboard sends `Authorization: Basic dGVzdEBjb21wYW55LmNvbTp0ZXN0` (`test@company.com:test`) on every request. This matches the mocked-auth user in `package.json` who has all roles (Requester, Manager, Finance, Admin). No login UI is needed for local dev.

## OData endpoints used

| Endpoint | Purpose |
|---|---|
| `GET /odata/v4/approval/Requests?$top=500` | All requests — KPIs + charts |
| `GET /odata/v4/approval/DepartmentBudget` | Budget utilization |
| `GET /odata/v4/approval/AuditLogs?$orderby=createdAt desc&$top=10` | Recent audit log |

## Reset Monthly Budget button

The **Reset Monthly Budget** button calls `POST /odata/v4/approval/resetMonthlyBudget`. This action is **not yet defined** in `srv/service.cds` — the button will return an error toast until it is added. To implement it, add an unbound action to `ApprovalService`:

```cds
// srv/service.cds
action resetMonthlyBudget() returns String;
```

And handle it in a CAP handler:

```js
srv.on('resetMonthlyBudget', async () => {
  // reset consumedAmount and reservedAmount for current fiscal month
  // ...
  return 'OK'
})
```

## Stack

- React 18
- Vite 5
- Recharts 2 (charts)
- Tailwind CSS via CDN
