# Architecture Decisions — Enterprise Approval Workflow

## Why SAP CAP?

SAP Cloud Application Programming Model (CAP) was chosen because:

**1. It eliminates boilerplate**
A traditional Express.js backend for an OData service requires implementing the OData protocol manually — entity metadata, query options, batch requests, error formatting. CAP generates all of this from a `.cds` schema definition. What would take weeks to build correctly takes hours with CAP.

**2. It's the standard for SAP BTP**
EPAM, Accenture, Deloitte, and all major SAP SIs use CAP for BTP development. Knowing CAP deeply is more valuable to employers than knowing a generic Node.js framework.

**3. Built-in security integration**
XSUAA, `@requires`, `@restrict` — CAP handles JWT validation and role checking with zero custom code. Security is declarative, not imperative.

**4. HANA integration is seamless**
CAP's `@cap-js/hana` adapter handles the translation from CDS entities to HANA-specific SQL, HDI artifacts, and connection management automatically.

---

## Why Fiori Elements?

SAP Fiori Elements was chosen over custom UI5 or React because:

**1. Enterprise-grade UI with minimal code**
A complete List Report + Object Page with create, edit, delete, custom actions, and child tables requires zero JavaScript. All configuration is done through CDS annotations. This is how real enterprise applications are built at SAP customers.

**2. Consistent SAP UX**
Fiori Elements follows SAP's Fiori Design Guidelines automatically — responsive layout, accessibility, dark mode support, keyboard navigation. A custom React app would require months to achieve the same level of UX consistency.

**3. Demonstrates annotation skills**
Being able to configure Fiori Elements through CDS annotations (`@UI.LineItem`, `@UI.FieldGroup`, `@UI.Identification`, `@UI.HeaderInfo`, `@Common.ValueList`, `SideEffects`) is a specific skill that SAP employers test for.

---

## Why HANA Cloud?

**1. It's the SAP production standard**
Real enterprise projects use HANA. SQLite is only for local development. Demonstrating that your app works on real HANA Cloud is more valuable than a locally-running SQLite demo.

**2. HDI containers provide proper isolation**
Each application gets its own schema in HANA Cloud, managed by the HDI (HANA Deployment Infrastructure). Schema changes are deployed transactionally — either all changes apply or none do. This is production-grade database management.

**3. CAP handles the abstraction**
The same CDS schema runs on SQLite locally and HANA in production with zero code changes. CAP handles the SQL dialect differences transparently.

---

## Why Standalone App Router over Managed App Router?

**Managed App Router** (via SAP Build Work Zone / Launchpad) is easier to set up but:
- Requires the Launchpad service to be configured
- Your app must be added to the Launchpad manually
- Less control over routing configuration

**Standalone App Router** gives you:
- Direct control over `xs-app.json` routing rules
- Your own URL (not a shared Launchpad URL)
- Simpler architecture for a single-app deployment
- Easier to debug authentication issues

For a portfolio project where you want full control and a clean demo URL, standalone is better.

---

## Why Separate `approverUserId` and `approverRole`?

This decision came from thinking about how real enterprise approval workflows work.

In reality, approvers change. The manager who approves today might be on leave tomorrow. A system that hardcodes just the role (`Manager`) has no way to know which specific manager should approve a request.

By storing `approverUserId`, the system:
- Can send email notifications to the specific person
- Can enforce that ONLY that person approves (the security guard)
- Can track who actually approved vs who was assigned
- Supports future features like delegation (if manager is unavailable, reassign to deputy)

The tradeoff is that approver assignment is currently hardcoded in the handler (`manager@company.com`). In a real system this would come from an HR lookup or org chart API. The architecture supports this enhancement without schema changes.

---

## Why Composition vs Association for Steps?

```cds
steps : Composition of many ApprovalStep on steps.request = $self;
```

`Composition` means deep ownership — steps are part of the request, not independently meaningful entities. This has practical consequences:

- When you deep-read a Request (`$expand=steps`), CAP automatically joins to steps
- When you delete a Request, CAP cascades the delete to steps
- Steps are always queried in the context of their parent request
- In Fiori Elements, a Composition creates a child table that's always shown within the parent Object Page

If steps were an `Association`, they'd be independent entities that happen to reference a request. You'd have to manage their lifecycle manually. The Composition approach is semantically correct and practically convenient.

---

## Why Enums Instead of a Lookup Table?

```cds
type Status : String enum { DRAFT; SUBMITTED; IN_APPROVAL; APPROVED; REJECTED; FAILED; }
```

A lookup table approach would use a separate `StatusCodes` entity with an ID and description. This is common in traditional database design but has downsides in CAP:

- More tables to maintain
- Foreign key joins on every query
- Code must use numeric IDs (`status: 1`) instead of readable strings (`status: 'DRAFT'`)
- No automatic validation in the OData layer

CAP's string enums give you:
- Validation at the OData layer (invalid values are rejected)
- Readable values in the database (no lookup table needed to understand the data)
- Type safety in handlers
- Automatic dropdown generation in Fiori Elements

The tradeoff is that adding a new status requires a schema change and redeployment. For a workflow with well-defined states that rarely change, this is acceptable.

---

## Why runNumber on ApprovalStep?

The initial design had no `runNumber`. Steps from all submission attempts were mixed together in the same table. This caused two problems:

**Problem 1: Ordering**
When a request was rejected and resubmitted, the new steps appeared mixed with old steps. The UI showed steps from run 1 and run 2 interleaved.

**Problem 2: Status logic**
The approve handler checks for ACTIVE steps. Without `runNumber`, cancelled steps from a previous run that weren't properly cleaned up would be found by the ACTIVE step query.

Adding `runNumber` solved both:
- Steps are ordered by `runNumber asc, stepNumber asc` in the service projection
- Step queries can be scoped to the current run number
- The history of all submission attempts is preserved for audit purposes

---

## Decisions That Are Intentionally Simplified

These are areas where the project is simplified compared to a full production system:

| Simplified | Production Reality |
|---|---|
| Hardcoded approver emails | Looked up from HR/org chart API |
| Max 3 resubmissions hardcoded | Configurable per request type |
| No email notifications | Integration with SAP Alert Notification Service |
| Approver assignment fixed at submit | Could be dynamic, delegatable |
| Single currency | Multi-currency with exchange rate conversion |
| No SLA enforcement | Timer events with escalation automation |
| WorkflowInstance is a placeholder | Real integration with SAP Build Process Automation |

These simplifications are appropriate for a portfolio project. The architecture is designed to support these enhancements without requiring schema changes — which demonstrates forward-thinking design.
