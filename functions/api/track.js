// Consent-gated anonymous first-party visitor counter.
// Each page view is stored as its own KV record so concurrent requests cannot
// overwrite one another through a read-modify-write counter.
const COOKIE = "md_vid";
const RETENTION_SECONDS = 60 * 60 * 24 * 365;

function getCookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  const match = raw.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return match ? match[1] : null;
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (_) {
    return Response.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  if (body?.consent !== true) {
    return Response.json({ ok: false, error: "consent_required" }, { status: 403 });
  }

  if (!env.VISITS) {
    return Response.json({ ok: false, error: "storage_not_configured" }, { status: 503 });
  }

  let id = getCookie(request, COOKIE);
  let isNewVisitor = false;

  if (!id || !/^[a-f0-9-]{36}$/i.test(id)) {
    id = crypto.randomUUID();
    isNewVisitor = true;
  } else {
    isNewVisitor = !(await env.VISITS.get("stats:visitor:" + id));
  }

  const now = Date.now();
  const writes = [
    env.VISITS.put(
      "stats:pageview:" + now + ":" + crypto.randomUUID(),
      "1",
      { expirationTtl: RETENTION_SECONDS }
    )
  ];

  if (isNewVisitor) {
    writes.push(
      env.VISITS.put("stats:visitor:" + id, "1", { expirationTtl: RETENTION_SECONDS })
    );
  }

  await Promise.all(writes);

  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": "application/json"
  });

  if (getCookie(request, COOKIE) !== id) {
    headers.append(
      "Set-Cookie",
      COOKIE + "=" + id + "; Max-Age=" + RETENTION_SECONDS +
      "; Path=/; Secure; HttpOnly; SameSite=Lax"
    );
  }

  return new Response(JSON.stringify({ ok: true }), { headers });
}
