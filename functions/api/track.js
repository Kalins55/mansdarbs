// Anonymous first-party visitor counter using the existing Cloudflare KV binding VISITS.
const COOKIE = 'md_vid';
const COOKIE_AGE = 60 * 60 * 24 * 365;
function getCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  const match = raw.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return match ? match[1] : null;
}
async function updateTotals(kv, isNewVisitor) {
  const key = 'stats:totals';
  let totals = {};
  try { totals = JSON.parse(await kv.get(key) || '{}'); } catch (_) {}
  totals.pageviews = Number(totals.pageviews || 0) + 1;
  if (isNewVisitor) totals.uniqueVisitors = Number(totals.uniqueVisitors || 0) + 1;
  totals.updatedAt = new Date().toISOString();
  await kv.put(key, JSON.stringify(totals));
}
export async function onRequestPost({ request, env }) {
  if (!env.VISITS) return new Response('Statistics storage is not configured', { status: 503 });
  let id = getCookie(request, COOKIE);
  let isNewVisitor = false;
  if (!id || !/^[a-f0-9-]{36}$/i.test(id)) { id = crypto.randomUUID(); isNewVisitor = true; }
  else isNewVisitor = !(await env.VISITS.get('stats:visitor:' + id));
  if (isNewVisitor) await env.VISITS.put('stats:visitor:' + id, '1', { expirationTtl: COOKIE_AGE });
  await updateTotals(env.VISITS, isNewVisitor);
  const headers = new Headers({ 'Cache-Control': 'no-store', 'Content-Type': 'application/json' });
  if (getCookie(request, COOKIE) !== id) headers.append('Set-Cookie', COOKIE + '=' + id + '; Max-Age=' + COOKIE_AGE + '; Path=/; Secure; HttpOnly; SameSite=Lax');
  return new Response(JSON.stringify({ ok: true }), { headers });
}