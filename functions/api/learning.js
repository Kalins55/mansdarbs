// Privacy-first aggregate learning metrics.
// Stores only daily counters for a fixed allowlist of event names.
// Never stores event histories, answers, names, account IDs, cookies or IP addresses.
const ALLOWED = new Set(["flow_started", "step_completed", "flow_completed", "workspace_opened"]);

export async function onRequestPost({ request, env }) {
  if (!env.VISITS) {
    // The app continues to work if aggregate storage has not yet been configured.
    return Response.json({ ok: true, stored: false }, { status: 202 });
  }

  let body;
  try {
    const raw = await request.text();
    if (raw.length > 256) return new Response("Payload too large", { status: 413 });
    body = JSON.parse(raw);
  } catch (_) {
    return new Response("Bad request", { status: 400 });
  }

  const event = body?.event;
  if (typeof event !== "string" || !ALLOWED.has(event)) {
    return new Response("Unsupported event", { status: 400 });
  }

  const day = new Date().toISOString().slice(0, 10);
  const key = `learning:${day}:${event}`;
  let count = 0;
  try {
    count = Number(await env.VISITS.get(key) || 0);
    if (!Number.isSafeInteger(count) || count < 0) count = 0;
  } catch (_) {
    return Response.json({ ok: false, stored: false }, { status: 503 });
  }

  try {
    await env.VISITS.put(key, String(count + 1), { expirationTtl: 60 * 60 * 24 * 400 });
  } catch (_) {
    return Response.json({ ok: false, stored: false }, { status: 503 });
  }

  return Response.json({ ok: true, stored: true }, {
    headers: { "Cache-Control": "no-store" }
  });
}
