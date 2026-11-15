// Privacy-minimal technical issue reports. No free text, stacks, URLs or user data.
const RETENTION_SECONDS = 60 * 60 * 24 * 30;
const ALLOWED_CODES = new Set(["manual_report", "js_error", "promise_rejection", "storage_write_failed"]);
const ALLOWED_VIEWS = new Set(["home", "calculator", "records", "sia", "choice", "unknown"]);
const ALLOWED_BROWSERS = new Set(["Safari", "Chrome", "Firefox", "Edge", "Other"]);

export async function onRequestPost({ request, env }) {
  if (!env.ISSUES) return Response.json({ ok: false, error: "storage_not_configured" }, { status: 503 });
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 });
  if (!(request.headers.get("Content-Type") || "").toLowerCase().includes("application/json")) return new Response("Unsupported media type", { status: 415 });
  let raw;
  try { raw = await request.text(); } catch (_) { return new Response("Bad request", { status: 400 }); }
  if (new TextEncoder().encode(raw).byteLength > 2048) return new Response("Payload too large", { status: 413 });
  let body;
  try { body = JSON.parse(raw); } catch (_) { return new Response("Bad request", { status: 400 }); }
  const code = ALLOWED_CODES.has(body?.code) ? body.code : null;
  const view = ALLOWED_VIEWS.has(body?.view) ? body.view : "unknown";
  const browser = ALLOWED_BROWSERS.has(body?.browser) ? body.browser : "Other";
  if (!code || Object.keys(body || {}).some(key => !["code", "view", "browser"].includes(key))) return new Response("Invalid report", { status: 400 });
  const report = { code, view, browser, receivedAt: new Date().toISOString() };
  const key = "issues:report:" + Date.now() + ":" + crypto.randomUUID();
  try {
    await env.ISSUES.put(key, JSON.stringify(report), { expirationTtl: RETENTION_SECONDS });
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (_) {
    return Response.json({ ok: false, error: "temporarily_unavailable" }, { status: 503 });
  }
}
