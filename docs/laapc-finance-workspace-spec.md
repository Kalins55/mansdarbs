# LAAPC finance workspace — functional specification (discovery draft)

Status: internal product specification for discovery. Not implemented, not deployed, and not approved by LAAPC.

## Product objective

Design a lightweight finance-operations workspace for an organization that runs multiple research and field projects. The primary user is a finance operator who works directly with project budgets, costs, invoices and settlements. The product should reduce manual reconciliation and make every project cost traceable without replacing the organization's accounting, procurement, HR, GEP or scientific systems.

This is a working hypothesis based on public information and the user's confirmation that a close family contact works directly with these finance processes. It is not evidence of LAAPC's actual software stack or pain points.

## Interaction principle: show the right functions at the point of need

Users should not have to know the product's menu structure or search manually for a function they need. When a user opens a section, project or task, the workspace should automatically present the relevant actions and information for that context.

Examples:
- Opening a project presents its approved budget, actual/invoiced costs, commitments, payments, remaining budget, outstanding invoices and the next relevant project actions.
- Opening an invoice presents actions appropriate to its state: assign project and cost category, attach supporting reference, submit for approval, record partial/full payment, or flag a mismatch.
- Opening a fieldwork expense flow presents the fields and actions needed to record the expense, attach a receipt/reference, assign a project and submit it for review.
- Opening a reporting period presents the applicable report, missing-document checks, outstanding items and export actions.

Guidelines:
- Contextual suggestions must be based on the current record, workflow state and the user's permissions.
- Show the next useful action, not every available function at once.
- Do not expose actions the user is not authorized to perform; permissions must still be enforced server-side.
- Suggestions should be helpful and dismissible, not blocking pop-ups or forced tours.
- Keep the user's place and entered data when moving between related actions.
- Explain why an action is suggested when that is not obvious.
- Avoid claiming that an action is complete until the user confirms it and the system records the result.
- Validate the terminology and actual workflow with finance users before implementation.

This is a functional behavior requirement, not approval to change the existing Mansdarbs visual design. The final presentation and placement of contextual actions must follow the product's established design and any required design approval.

## Release priorities

### P0. Project financial register

A project record should include:
- internal project code and name;
- customer, funder and contract/reference number;
- project owner and finance contact;
- start/end dates and status;
- approved budget, currency and budget version;
- reporting periods and notes.

Each budget line should include:
- cost category and optional subcategory;
- approved amount and any approved revision;
- committed amount (approved purchase/order not yet invoiced or paid);
- invoiced/actual amount;
- paid amount and outstanding amount;
- source document/reference;
- date, supplier/payee and responsible person;
- allocation across projects where a cost is shared, with allocation method recorded.

Core calculations:
- available budget = latest approved budget - actual costs - open commitments;
- unpaid amount = invoiced amount - payments allocated;
- variance = actual + committed - approved budget;
- forecast at completion = actual + open commitments + explicitly entered forecast;
- never silently treat a forecast or commitment as an actual expense.

All totals must be traceable to underlying records. Revisions must preserve prior values and record who changed what, when and why.

### P0. Purchase-to-payment tracking

Track the operational lifecycle:
1. Purchase request created.
2. Project and budget line selected.
3. Quote/offer details and decision evidence recorded.
4. Approval outcome and approver recorded.
5. Order/contract reference recorded.
6. Delivery or service acceptance recorded.
7. Supplier invoice received and matched.
8. Payment(s) recorded, including partial payments.
9. Record closed or flagged for follow-up.

Minimum fields:
- supplier, invoice number, invoice date and due date;
- net, VAT and gross amount as separate fields where applicable;
- currency, project allocation and cost category;
- purchase/contract reference;
- attachment reference and document status;
- payment date, amount and payment reference;
- status and responsible person.

The tool is a register and workflow aid only. It must not submit bids, purchase orders or procurement actions to EIS, nor represent itself as an accounting ledger or legal procurement authority.

### P0. Fieldwork expense capture

A simple mobile-friendly expense record:
- date and project code;
- field/site reference (administrative identifier only);
- activity category;
- staff member or cost owner;
- vehicle and distance, where relevant;
- fuel, travel, per diem, accommodation or materials amount;
- receipt/document reference;
- approval status and approver.

Do not collect continuous GPS/location data. Do not store GEP source records, protocols, raw trial measurements, sponsor-confidential results, product registration data or other scientific datasets.

### P1. Finance reporting

Provide:
- project budget / committed / invoiced / paid / forecast view;
- unpaid invoices and upcoming due dates;
- supplier liabilities;
- period-based project cost report;
- missing-document and unapproved-cost lists;
- export to CSV/XLSX/PDF for review and handoff to existing systems.

Reports must show the selected period, filters, currency and data timestamp. Exports must respect the user's access permissions and be audit logged.

### P1. Time and resource allocation

Only after discovery confirms value:
- optional staff hours by project and activity;
- approved internal cost rates;
- planned vs actual time and costs.

This is not payroll, HR, employee surveillance or a time-tracking mandate. No automatic payroll calculations in the first release.

## Primary finance workflow

The default workflow should let a finance user answer, for any project:
1. What budget was approved, and what is the latest approved version?
2. How much is spent, invoiced, paid and still committed?
3. Which invoices are due or overdue?
4. Which costs lack a project, budget line, approval or supporting document?
5. What changed since the previous reporting period?
6. Can I export a reconciliable report without retyping the data?

A project lead should see only projects and financial details they are authorized to see. A finance role may see cross-project data if explicitly granted. Management read-only access should not imply permission to edit or export restricted records.

## Roles and permissions

Initial roles to validate:
- Organization administrator: manages tenant, users and settings.
- Finance: manages project financial records, invoices, payments and reports.
- Project lead: views assigned projects, submits/approves permitted expenses and sees assigned project budget.
- Field staff: submits own expense drafts and supporting documents; cannot view unrelated project finances.
- Management read-only: sees approved management summaries without editing rights.

Permissions must be enforced server-side, not only by hiding interface controls. Privileged roles require MFA. Every approval, edit, export and permission change must be auditable.

## Data integrity and controls

- Use immutable internal IDs; do not rely on project names or invoice numbers as unique identifiers.
- Store money as decimal minor units or a decimal type, never binary floating point.
- Keep currency explicit; do not combine currencies without a documented exchange-rate source and date.
- Prevent duplicate invoice creation using supplier + invoice number + date checks, with a review path for legitimate duplicates.
- Preserve source documents and references; do not silently overwrite an attachment or financial record.
- Separate draft, submitted, approved, rejected, invoiced, partially paid, paid and cancelled states.
- Corrections should create a reversal or versioned adjustment, not erase the audit trail.
- Define how VAT, credit notes, shared costs and period cut-offs work with LAAPC's accountant before implementation.

## Data boundaries and security prerequisites

No real organization data may be stored until:
- organization tenant isolation and authorization are implemented and independently reviewed;
- encryption in transit and at rest, tested backups and recovery procedures exist;
- retention, deletion, export and incident processes are documented;
- processor/subprocessor roles and a data-processing agreement are agreed;
- hosting/data residency and access logging are confirmed;
- AI processing is off by default for invoices, contracts, payroll and organization records;
- scientific/GEP data is explicitly excluded from this workspace.

The current browser-local individual product is not a secure multi-user organization system. Do not reuse its localStorage model as a substitute for tenant security.

## Discovery checklist for a finance workflow walkthrough

Use synthetic or anonymized examples only. Do not request bank statements, real invoices, payroll records, sponsor contracts or confidential trial data during initial discovery.

Ask the finance operator to walk through one completed project and one active project:
1. Where does the approved project budget originate, and how are revisions recorded?
2. Where are commitments recorded before supplier invoices arrive?
3. How are shared expenses allocated across projects?
4. How do field travel, fuel, materials and receipts reach finance?
5. What happens between invoice receipt, approval, booking and payment?
6. Which figures are taken from the accounting system versus maintained in spreadsheets?
7. Which report takes the most manual work each month or quarter?
8. What causes the most common corrections, missing documents or delays?
9. Which fields or documents must never leave existing systems?
10. What would make the tool genuinely useful within the first 30 days?

Record only process descriptions, field names, anonymized examples and estimated time spent. Obtain organizational authorization before any deeper process or system review.

## Pilot success measures

Agree baseline and target with LAAPC before a pilot. Candidate measures:
- time required to prepare a monthly project-cost report;
- percentage of costs linked to project and budget line;
- number of missing supporting documents;
- number of duplicate or incorrectly coded invoices;
- visibility of upcoming and overdue payments;
- time to identify budget variance;
- reconciliation differences between Mansdarbs export and the authoritative accounting records.

No claim of savings or compliance should be made until measured.

## Non-goals

The first release will not:
- replace accounting, payroll, HR, GEP, scientific trial management, LBTU systems or EIS;
- decide legal or grant cost eligibility;
- submit procurement decisions or payments;
- ingest raw scientific trial data;
- provide cross-customer benchmarking;
- train AI models on organization data;
- collect continuous staff location or behavior data.

## Decision gates

Before implementation:
1. Validate the workflow with an authorized LAAPC finance representative.
2. Identify the authoritative source for each financial field.
3. Confirm required exports and reconciliation rules with the accountant.
4. Confirm procurement, legal, IT/security and data-protection approval paths.
5. Approve a tenant security and data-protection design.
6. Agree pilot scope, success criteria, support responsibilities and commercial/procurement route in writing.
