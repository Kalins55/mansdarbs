# SMOLETS — Public Ideas and Innovation Workspace

**Status:** experimental specification only  
**Branch:** `experiment/smolets-public-ideas`  
**Product:** Mansdarbs  
**Scope:** a separate, opt-in workspace for developing and evaluating public ideas and projects.

## Purpose

SMOLETS is a configurable workspace for structured innovation work: collect a proposal, identify the public problem it addresses, check evidence, compare possible solutions, record assumptions, and prepare a testable next step.

The name “Smolets” and the initial collaboration concept were suggested in connection with Jānis Ceriņš. This is **not** authorization to construct a dossier about him or to infer private characteristics from social-media activity. The workspace must evaluate ideas and materials, not secretly profile a person.

## Permitted inputs

- Ideas, proposals, project descriptions and materials deliberately supplied by the participant.
- Publicly available, relevant project or organizational information that can be independently verified.
- Public statements or publications when directly relevant to the idea being evaluated.
- Explicitly provided feedback and decisions from the participant.

For every external factual claim, retain its source, publication date where available, and a short explanation of what it supports. Distinguish verified facts, participant claims, hypotheses and unanswered questions.

## Prohibited processing

The workspace must not:
- Build or enrich a personal dossier from social-media profiles or scattered personal traces.
- Infer sensitive traits, private circumstances, psychological vulnerabilities, beliefs, relationships or likely behaviour.
- Rank, target or segment a named person for persuasion, pressure, recruitment or manipulation.
- Generate covert influence strategies, deceptive messages or impersonation.
- Treat speculation about a person's motives or personality as verified evidence.
- Collect private, leaked, access-controlled or unlawfully obtained information.

If a task cannot be completed without such processing, reject that task and offer an idea-centred alternative where possible.

## Mandatory local policy gate

Every user request and every queued payload must pass a policy check **on the user's device before any request body, attachment, prompt or derived personal data is transmitted to a server or external AI provider**.

The gate must:
1. Inspect the complete outbound payload, including quoted text, attachments, metadata and generated context.
2. Reject prohibited requests by default when classification is uncertain.
3. Stop transmission entirely on rejection; do not send a “sanitized” copy unless the user explicitly submits a new, compliant request.
4. Explain the reason in plain language and, where possible, suggest a compliant idea- or project-focused reformulation.
5. Apply to every route: normal chat, file upload, background jobs, integrations, retries and future APIs.
6. Fail closed if the policy engine is unavailable, outdated or cannot inspect a payload.
7. Keep policy enforcement outside the experimental workspace's control. The workspace cannot edit, disable, override or grant exceptions to the gate.

A server-side check may provide defence in depth, but it does not replace the local pre-transmission gate.

## Privacy and security

- No special personal profile for Jānis Ceriņš or any other named individual is created.
- Do not retain raw rejected prompts or attachments in analytics.
- Do not transmit rejected content, even for moderation, debugging or telemetry.
- Store workspace drafts locally by default, consistent with Mansdarbs' privacy architecture.
- Any future optional server processing must disclose what is sent and require a deliberate user action.
- Do not represent local checks as infallible; document their limits and keep a server-side safety layer as a secondary control.

## Workspace workflow

1. **Submit an idea** — describe a problem, proposal or project.
2. **Clarify** — separate goals, constraints, stakeholders and assumptions.
3. **Verify** — identify public evidence and record source quality and gaps.
4. **Evaluate** — compare feasibility, cost, risks, benefits and alternatives.
5. **Develop** — turn the strongest direction into a practical plan or prototype brief.
6. **Test** — define a small, measurable experiment and success criteria.
7. **Review** — record results and decide whether to iterate, pause or stop.

The workspace should make uncertainty visible. It must not fabricate sources, endorsements, consent, partnerships or results.

## Governance and access

- The SMOLETS workspace is a feature configuration, not an elevated permission level.
- It inherits all Mansdarbs privacy, security and acceptable-use rules.
- Its participant cannot modify platform-wide rules, inspect other users' data or gain access to private systems.
- Any collaboration or contact with a real person requires that person's own voluntary participation and appropriate consent.
- No messages are sent, accounts contacted or invitations issued automatically.

## Delivery sequence

1. Review this specification and threat model.
2. Design a standalone local policy-gate module with deny-by-default behaviour.
3. Create unit tests for direct prompts, quoted content, attachments, metadata, retries and alternate request paths.
4. Verify that rejected payloads produce **zero outbound requests** using mocked network boundaries.
5. Only then consider a separate, opt-in workspace UI. Any material visual or UX change requires product-owner approval before implementation.
6. Keep the branch isolated until review; do not deploy it or merge it into `main` as part of this experiment.

## Current implementation status

This file records the product and security specification only. No personal dossier has been created, no social profiles have been scraped, no person has been contacted, and no policy gate or workspace UI has yet been implemented. The branch is not deployed.


## Initial codebase reconnaissance (2026-11-18)

A read-only review of the current `main` frontend identified one explicit browser-side network request in `index.html`: a POST to `/api/vid-assistant` carrying the chat history, selected profile and current task. The currently loaded frontend scripts `contextual-help.js`, `industry-modules.js`, `context-engine.js`, `funding-discovery.js` and `funding-ui.js` did not contain direct `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket` or `EventSource` calls in the reviewed versions.

This is a limited frontend scan, **not** proof that the entire deployed system has only one outbound path. Before implementing or claiming complete enforcement, inspect the Cloudflare Pages Functions / Worker handlers, all dynamically loaded modules, third-party scripts and any future integrations. The VID assistant route is an existing feature and must not be silently changed by this experimental branch.

### First integration checkpoint

The first technical prototype should intercept the VID assistant request only in a dedicated test harness, prove that a rejected payload never reaches the mocked network boundary, and verify that an allowed payload preserves the existing request contract. Do not alter the live `main` route or production UX from this branch.


## Local gate prototype checkpoint (2026-11-18)

Added `smolets-policy-gate.js` and `tests/smolets-policy-gate.test.js` as an isolated, non-production prototype. The gate recursively inspects JSON-compatible text payloads, rejects unsupported objects and non-empty attachment fields, applies a small set of deterministic blocking rules, and exposes an injected network boundary so tests can prove rejected requests cause zero calls.

**Important limitations:** this is not a complete policy classifier. Pattern matching can miss paraphrases, encoded content, names and contextual intent; it can also produce false positives. Attachments are rejected rather than inspected. A passing result means only that no configured rule matched. The prototype is not wired into the live frontend, does not intercept every network API, and must not be described as a production security boundary. Further work must add a threat-modelled classifier, multilingual/adversarial tests, complete outbound-path inventory, and browser-level interception tests before any integration.
