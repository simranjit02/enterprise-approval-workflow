# Enterprise Approval Workflow

A full-stack enterprise approval system built with SAP CAP, SAP Fiori Elements, and XSUAA.

## Tech Stack
- SAP CAP (Node.js)
- SAP Fiori Elements (UI5)
- SQLite (local) / SAP HANA Cloud (production)
- XSUAA (authentication)

## Features
- Multi-step approval workflow
- Parallel approval path for high-value requests
- Audit logging
- Role-based access control

## Setup
npm install
cds watch

## Mock Users
| User | Password | Role |
|------|----------|------|
| manager@company.com | manager | Manager |
| finance@company.com | finance | Finance |
| requester@company.com | requester | Requester |