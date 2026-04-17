# Deployment — Enterprise Approval Workflow

## Overview

Deploying a CAP application to SAP BTP Cloud Foundry involves packaging multiple modules (backend, approuter, database deployer, UI) into a single `.mtar` archive and deploying it as a Multi-Target Application (MTA). This document explains the architecture, every file involved, and every lesson learned during the deployment process.

---

## Deployment Architecture

```
Internet
    ↓
App Router (enterprise-approval-workflow)
    ├── Authenticates users via XSUAA
    ├── Serves UI from HTML5 Repo Runtime
    └── Forwards /odata/* calls to CAP Service
          ↓
    CAP Service (enterprise-approval-workflow-srv)
          ├── Validates JWT token
          ├── Enforces @restrict annotations
          └── Executes business logic
                ↓
          HANA Cloud (via HDI Container)
```

The App Router is the single entry point. Users never access the CAP service directly — all traffic goes through the App Router which handles authentication.

---

## Files Required for Deployment

### 1. `mta.yaml` — The Blueprint

This is the most important deployment file. It describes every module (app) and resource (service) that needs to be created and how they connect.

```yaml
modules: # Applications deployed to CF
resources: # Service instances created in BTP
```

**Key lesson:** Every service-name in `mta.yaml` must exactly match the actual service instance name in CF. If you create a service manually first, the name gets a generated suffix. Either delete the manual service and let `mta.yaml` create it, or update `mta.yaml` to use the generated name.

### 2. `app/router/package.json` — Approuter Dependencies

```json
{
  "name": "approuter",
  "dependencies": {
    "@sap/approuter": "^16"
  },
  "scripts": {
    "start": "node node_modules/@sap/approuter/approuter.js"
  }
}
```

The App Router is a Node.js application. This `package.json` tells CF what to install and how to start it.

### 3. `app/router/xs-app.json` — Routing Rules

```json
{
  "welcomeFile": "/approvalui/index.html",
  "authenticationMethod": "route",
  "routes": [
    {
      "source": "^/odata/(.*)$",
      "target": "/odata/$1",
      "destination": "srv-api",
      "authenticationType": "xsuaa"
    },
    {
      "source": "^(.*)$",
      "target": "$1",
      "service": "html5-apps-repo-rt",
      "authenticationType": "xsuaa"
    }
  ]
}
```

This file tells the App Router how to route requests:

- Requests to `/odata/*` go to the CAP backend via the `srv-api` destination
- Everything else is served from the HTML5 Repo Runtime (your Fiori UI)
- All routes require XSUAA authentication

**Key lesson:** `welcomeFile` must match the exact path in the HTML5 repo. The app is deployed as `approvalui` so the path is `/approvalui/index.html`, not just `/index.html`.

### 4. `app/approval-ui/xs-app.json` — UI Build Config

This is the SAME content as the router's `xs-app.json` but it's needed by the UI5 build tool (`ui5-task-zipper`) when packaging the UI into a zip file. Both files must exist even though they have the same content.

### 5. `app/approval-ui/ui5-deploy.yaml` — UI Build Instructions

```yaml
specVersion: "3.1"
metadata:
  name: approvalui
type: application
builder:
  customTasks:
    - name: ui5-task-zipper
      afterTask: generateCachebusterInfo
      configuration:
        archiveName: approvalui
        additionalFiles:
          - xs-app.json
```

This tells the UI5 build tool to:

1. Build the UI5 application
2. Package it into `approvalui.zip`
3. Include `xs-app.json` in the zip (the HTML5 Repo needs it)

### 6. `xs-security.json` — XSUAA Configuration

Defines scopes, role templates, and role collections. Deployed automatically when the XSUAA service instance is created via `mta.yaml`.

---

## MTA Modules Explained

### `enterprise-approval-workflow-srv`

The CAP Node.js backend. Deployed from `gen/srv` (the CDS build output).

```yaml
type: nodejs
path: gen/srv
build-parameters:
  builder: npm-ci
```

`npm-ci` is used instead of `npm install` for reproducible builds — it installs exactly what's in `package-lock.json`.

### `enterprise-approval-workflow` (App Router)

The standalone App Router.

```yaml
type: approuter.nodejs
path: app/router
requires:
  - name: enterprise-approval-workflow-auth # XSUAA for token validation
  - name: enterprise-approval-workflow-html5-runtime # Serves UI files
  - name: enterprise-approval-workflow-destination # Destination service
  - name: srv-api # CAP backend URL
```

**Critical:** The approuter must bind to `html5-apps-repo` with plan `app-runtime` (NOT `app-host`). Using `app-host` causes `Missing required property: grant_type` error on startup.

### `enterprise-approval-workflow-db-deployer`

Deploys the HDI (HANA Deployment Infrastructure) artifacts to HANA Cloud. Creates the database tables from the CDS schema.

```yaml
type: hdb
path: gen/db
```

Runs once at deployment, exits when done.

### `enterprise-approval-workflow-app-content`

Uploads the Fiori UI zip to the HTML5 Repository.

```yaml
type: com.sap.application.content
requires:
  - name: enterprise-approval-workflow-html5-host
    parameters:
      content-target: true # Upload here
```

### `approvalui`

Builds the Fiori UI from source.

```yaml
type: html5
path: app/approval-ui
build-parameters:
  builder: custom
  commands:
    - npm install
    - npm run build:cf
```

`npm run build:cf` runs: `ui5 build preload --clean-dest --config ui5-deploy.yaml --include-task=generateCachebusterInfo`

---

## MTA Resources Explained

### HANA HDI Container

```yaml
- name: enterprise-approval-workflow-db
  type: com.sap.xs.hdi-container
  parameters:
    service: hana
    service-plan: hdi-shared
```

Creates an isolated schema in your HANA Cloud instance. Multiple projects can share the same HANA Cloud instance — each gets its own HDI container with separate tables. Free tier allows only ONE HANA Cloud instance but many HDI containers.

### XSUAA

```yaml
- name: enterprise-approval-workflow-auth
  type: org.cloudfoundry.managed-service
  parameters:
    service: xsuaa
    service-plan: application
    path: ./xs-security.json
```

Creates the XSUAA service instance and configures it with your scopes and role collections from `xs-security.json`.

### HTML5 App Host

```yaml
- name: enterprise-approval-workflow-html5-host
  parameters:
    service: html5-apps-repo
    service-plan: app-host
```

Stores your UI files. Think of it as a CDN for your Fiori app.

### HTML5 App Runtime

```yaml
- name: enterprise-approval-workflow-html5-runtime
  parameters:
    service: html5-apps-repo
    service-plan: app-runtime
```

Serves your UI files at runtime. The App Router binds to this to fetch and serve the UI to users. **Must be `app-runtime`, not `app-host`.**

### Destination Service

```yaml
- name: enterprise-approval-workflow-destination
  parameters:
    service: destination
    service-plan: lite
```

Stores named HTTP destinations. The App Router uses the `srv-api` destination to know the URL of the CAP backend.

---

## Build and Deploy Commands

```bash
# Step 1: Install/sync dependencies
npm install

# Step 2: Build the MTA archive
mbt build
# Output: mta_archives/enterprise-approval-workflow_1.0.0.mtar

# Step 3: Deploy to Cloud Foundry
cf deploy mta_archives/enterprise-approval-workflow_1.0.0.mtar

# If deployment gets stuck:
cf deploy -i <operation-id> -a abort

# To undeploy everything including services:
cf undeploy enterprise-approval-workflow --delete-services -f
```

---

## CAP CLI Commands

These commands configure your project correctly for deployment:

```bash
# Generate mta.yaml from your CAP project
cds add mta

# Add XSUAA configuration (updates mta.yaml + package.json)
cds add xsuaa --for production

# Add HANA configuration (updates mta.yaml + package.json)
cds add hana --for production
```

---

## Lessons Learned

### 1. Service name mismatches kill deployments

If you create any service manually in BTP Cockpit before deploying, it gets a generated suffix in its name (e.g. `enterprise-approval-workflow-html5-app-hos1950b391`). Your `mta.yaml` won't know this name. Either delete the manual service before deploying, or update `mta.yaml` to use the exact generated name.

**Rule:** Let `mta.yaml` create all services. Never create services manually first.

### 2. App Router must use `app-runtime`, not `app-host`

The HTML5 Repo has two plans:

- `app-host` — for uploading/storing UI files
- `app-runtime` — for serving/reading UI files at runtime

The App Router needs `app-runtime`. Using `app-host` causes the cryptic error: `html5-repo-credentials: Missing required property: grant_type`. This is because `app-host` credentials don't include OAuth flow information that the approuter expects.

### 3. Both `xs-app.json` files must exist

- `app/router/xs-app.json` — used by the running App Router to route requests
- `app/approval-ui/xs-app.json` — used by `ui5-task-zipper` during build to include in the zip

They have the same content but both must exist. Missing the UI one causes build failure.

### 4. `package-lock.json` must be in sync before `mbt build`

`mbt build` runs `npm ci` which requires `package-lock.json` to be perfectly in sync with `package.json`. After adding any new dependency, always run `npm install` first to update the lock file.

### 5. Always access the app via the App Router URL

The CAP service has its own URL but requests to it directly bypass authentication. Always use the App Router URL:

```
https://<org>-<space>-dev-enterprise-approval-workflow.cfapps.us10-001.hana.ondemand.com
```

Not the srv URL:

```
https://<org>-<space>-dev-enterprise-approval-workflow-srv.cfapps.us10-001.hana.ondemand.com
```

### 6. Assign role collections after every fresh deployment

Role collections are created by XSUAA but not assigned to any user. After deployment you must go to BTP Cockpit → Security → Users → your user → Assign Role Collections manually.

### 7. `cds add mta` + `cds add xsuaa` + `cds add hana` is the right starting point

Don't write `mta.yaml` from scratch. Use the CAP CLI commands — they generate the correct structure with proper bindings and profiles. Then add only what's missing (HTML5 host/runtime resources, approuter module).

---

## Post-Deployment Checklist

- [ ] `cf apps` shows all apps as `started`
- [ ] `cf html5-list` shows `approvalui` deployed
- [ ] Role collections assigned to test user in BTP Cockpit
- [ ] App opens at App Router URL
- [ ] Login redirects to SAP ID Service
- [ ] After login, Fiori List Report loads
- [ ] Can create a new request (Requester role)
- [ ] Can submit a request (Requester role)
- [ ] Can approve a request (Manager role)
- [ ] Audit log entry created after each action
