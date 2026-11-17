# LAAPC pilot: organization finance and project operations

Status: discovery blueprint only. This document does not describe a deployed feature or an agreement with LAAPC.

## Why this organization is a relevant pilot candidate

The Latvian Plant Protection Research Centre (LAAPC) conducts field trials of plant-protection products, fertilizers and biostimulants, pest monitoring and sampling, and regulatory support. Its public materials describe work across crop types and locations throughout Latvia, research groups, state-funded and international projects, and field days/seminars.

That operating model creates a plausible need for a financial operations layer connecting projects, field activity, procurement, invoices and management reporting. This is a hypothesis to validate with LAAPC staff; do not assume their current software or processes are inadequate.

## Product positioning

Mansdarbs should not be pitched as a replacement for LAAPC's accounting system, scientific trial records, GEP records, LBTU systems, or the Electronic Procurement System (EIS).

Proposed positioning: **a lightweight project-cost and financial-operations workspace** that connects operational activity to the financial picture, while existing authoritative systems remain authoritative.

The current Mansdarbs individual/self-employed experience remains unchanged. An organization workspace must be a separate, opt-in product mode with separate data boundaries.

## Proposed modules, in priority order

### P0 — Project budget and actual-cost control

- Create projects with internal ID, customer/funder, contract reference, project lead, dates, status and approved budget.
- Track budget lines by cost category (staff time, travel, fuel, field materials, laboratory/analysis, equipment, subcontractors, overhead and other).
- Record planned, committed and actual amounts separately.
- Link each cost, invoice and purchase commitment to one or more projects and budget lines.
- Show remaining budget, variance, forecast-at-completion and project contribution before shared overhead.
- Keep budget changes versioned with who/when/why.

### P0 — Purchase, supplier and invoice register

- Supplier register and purchase requests.
- Quote/offer comparison with attachments and decision notes.
- Purchase order/contract reference, delivery/acceptance status and invoice matching.
- Invoice due dates, payment status, overdue alerts and partial payments.
- Links to the relevant EIS notice/procedure where applicable; never submit procurement actions to EIS or claim to replace EIS.
- Export records for the accountant and existing accounting system.

### P0 — Fieldwork cost capture (not scientific trial data)

- Mobile-friendly entry of date, project, field/site code, staff member, activity category, vehicle, distance, fuel, travel/per-diem cost and receipt.
- Optional offline-first draft entry, with explicit later sync only in the organization workspace.
- Approval by a project lead or finance role.
- A strict boundary: do not store GEP source records, trial protocols, raw measurements, confidential sponsor results, product registration data, or sensitive research datasets in this finance module.

### P1 — Staff time and resource allocation

- Optional time allocation by project and activity category.
- Planned vs actual staff hours and internal cost rates, visible only to authorized finance/management roles.
- Resource utilization overview without employee surveillance or continuous location tracking.
- No automatic payroll calculation or HR system replacement in the first release.

### P1 — Project funding and reporting pack

- Track funding source, reporting period, co-financing plan and eligible/ineligible cost flags.
- Checklist of required evidence and missing supporting documents.
- Period close and exportable project ledger (CSV/XLSX/PDF).
- Eligibility flags are user-controlled and informational; the tool must not decide legal eligibility or certify grant compliance.

### P1 — Finance management dashboard

- Project budget vs committed vs actual vs forecast.
- Receivables and overdue invoices.
- Supplier liabilities and upcoming cash requirements.
- Revenue and contribution by project/customer/funding source.
- Monthly cash-flow forecast with explicit assumptions.
- Drill-down to source entries and audit trail; no opaque AI-generated totals.

## Organization security and data model requirements

These requirements are prerequisites before storing real LAAPC data:

- Separate organization tenant; no mixing with personal/self-employed data.
- Explicit organization opt-in, named users and role-based access (finance, project lead, field staff, management/read-only, administrator).
- MFA for privileged accounts; least-privilege access.
- Append-only audit events for creation, edits, approvals, exports and permission changes.
- Encryption in transit and at rest, tested backups and documented recovery.
- EU/EEA hosting preference, processor/subprocessor list, data-processing agreement, retention/deletion schedule and export/exit path.
- No advertising, sale of data, cross-customer analytics, or model training on organization data.
- No third-party AI processing of invoices, payroll, contracts or research data by default. Any future AI feature must be separately enabled and have field-level data minimization.
- Documented separation between operational finance records and GEP/scientific records.
- Data export and complete tenant deletion workflow.

The current Mansdarbs prototype stores finance data locally in the user's browser. That is appropriate for the anonymous individual product, but it is not sufficient for multi-user organizational collaboration. Do not add server-side organization storage until the security, access-control, privacy and backup design is reviewed.

## Integration strategy

Start with controlled CSV/XLSX imports and exports. Do not promise direct bank, payroll, EIS, LBTU or accounting-system integrations until LAAPC identifies the exact systems, formats, permissions and procurement constraints.

Potential first imports: supplier list, project list, approved budgets and opening receivables/payables. Potential exports: project-cost ledger, invoice register, monthly management report and accountant-ready transaction file.

## Pilot shape

A low-risk pilot should use synthetic or anonymized data first, then a small, explicitly approved project only after security and legal review.

Suggested pilot scope:
1. One finance owner and one project lead.
2. Two or three representative projects.
3. Budget lines, purchase commitments, invoices and a small sample of fieldwork expenses.
4. Compare time spent preparing a monthly project-cost report before and during the pilot.
5. Measure missing documents, coding corrections, overdue receivables visibility and budget variance visibility.

Success criteria:
- Every pilot cost can be traced to a project, budget line and source document.
- Finance can produce a project-cost snapshot without manually reconciling multiple disconnected spreadsheets.
- Project leads can see their remaining budget without access to other projects' restricted information.
- Accountant exports reconcile to the source ledger.
- No scientific/GEP source data or unnecessary personal data is copied into Mansdarbs.

## Commercial and procurement approach

LAAPC is an LBTU-owned limited liability company. Public procurement notices identify it as a buyer and direct submissions to EIS. Therefore, any paid deployment, subscription or service must follow LAAPC's applicable purchasing/procurement rules and internal approvals. Do not split purchases, disguise a paid service as a free pilot, or use a personal relationship to bypass procurement.

A genuine discovery/demo using synthetic data can be discussed without access to internal records. Before any production pilot, agree scope, security, data roles, support, pricing and procurement route in writing.

Commercial options to validate:
- fixed annual organization licence with user/project limits;
- a paid implementation/onboarding package after the pilot;
- a narrowly scoped pilot with agreed success criteria, subject to LAAPC's procurement and legal review.

Do not set a price before validating users, workflows, integration needs, support burden and procurement route.

## Discovery questions for LAAPC

1. Which accounting, project-management, document and payroll systems are currently used?
2. Are project budgets and actual costs tracked per contract, funder, trial, site or another dimension?
3. What is the most time-consuming monthly or quarterly finance report?
4. How are staff travel, fuel, field materials and equipment costs attributed to projects?
5. How are purchase requests, quotations, approvals, delivery acceptance and invoices connected today?
6. Which reports must be delivered to LBTU, funders, auditors or customers, and in what formats?
7. Which records must remain in GEP/scientific systems and must never be duplicated?
8. What user roles, data residency, retention and audit requirements apply?
9. What would save the finance team at least several hours per month?
10. Who owns the business decision, IT/security review and procurement approval?

## Public research references

- LAAPC services and operating model: https://www.laapc.lv/lv/par-mums
- LAAPC team and organizational groups: https://www.laapc.lv/lv/kontakti
- LAAPC research projects: https://www.laapc.lv/lv/dokumenti/zinatniskie-petijumi
- LAAPC privacy policy: https://www.laapc.lv/lv/dokumenti/privatuma-politika
- LAAPC documents page (lists Operations and Development Strategy 2025–2027): https://www.laapc.lv/en/documents/privacy-policy
- LAAPC buyer profile in EIS: https://www.eis.gov.lv/EKEIS/Supplier/Organizer/3340

## Evidence limits

Public sources establish LAAPC's activities, team structure, privacy policy and procurement footprint. They do not establish which internal finance tools LAAPC uses, where its bottlenecks are, whether it wants a new system, or whether the proposed modules fit its GEP and LBTU obligations. Those points must be confirmed with authorized staff before implementation.
