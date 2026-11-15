# Mansdarbs self-improving system — first safe layer

This first layer collects only aggregate counts of a fixed set of product events:
- flow_started
- step_completed
- flow_completed
- workspace_opened

It does not send or store answers, free-text input, activity names, names, account IDs, cookies, or app-generated IP identifiers. It stores daily counters only; there is no per-person event history. The counters help identify where the experience is confusing or where users stop.

## Important privacy boundary
The application code does not read or save visitor IP addresses. The hosting/CDN provider may independently process connection metadata under its own service terms, so this must not be described as absolute anonymity until provider logging, retention, and contractual settings are reviewed. The public privacy notice must explain the aggregate analytics purpose and lawful basis before this is enabled for real users.

## Activation
The endpoint uses the existing Cloudflare KV binding named VISITS. If it is not configured, the site continues to work and the endpoint deliberately stores nothing (HTTP 202). Configure the binding in the test environment before evaluating the counters. Do not enable it in production until the privacy notice and retention settings have been reviewed.

## How improvements are approved
The counters are signals, not automatic permission to change the product. They can inform improvement proposals. Changes to tax rules, legal explanations, privacy/security behavior, and production features still require source verification, testing, and owner approval.

## Social preview
The page head includes Open Graph image, title, description, absolute image URL, dimensions and alt text. Instagram link cards are relevant to Direct Messages and supported link-sharing surfaces; Instagram feed captions do not turn plain URLs into clickable preview cards. The Meta crawler/cache must be able to access the page and image. Validate with Meta Sharing Debugger after deployment.
