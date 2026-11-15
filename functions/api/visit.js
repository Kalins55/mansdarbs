// Cloudflare Pages Function: anonymous page-open counter.
// Requires a KV namespace binding named VISITS and a secret named STATS_TOKEN.
export async function onRequestPost({ env }) {
  if (!env.VISITS) return new Response("Counter storage is not configured", { status: 503 });
  const total = Number(await env.VISITS.get("total") || "0") + 1;
  const day = new Date().toISOString().slice(0, 10);
  const daily = Number(await env.VISITS.get("day:" + day) || "0") + 1;
  await Promise.all([
    env.VISITS.put("total", String(total)),
    env.VISITS.put("day:" + day, String(daily))
  ]);
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

export async function onRequestGet({ request, env }) {
  const token = env.STATS_TOKEN;
  if (!token || request.headers.get("Authorization") !== "Bearer " + token) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!env.VISITS) return new Response("Counter storage is not configured", { status: 503 });
  const total = Number(await env.VISITS.get("total") || "0");
  const list = await env.VISITS.list({ prefix: "day:" });
  const days = {};
  for (const key of list.keys) {
    days[key.name.slice(4)] = Number(await env.VISITS.get(key.name) || "0");
  }
  return Response.json({ total_opens: total, daily_opens: days }, {
    headers: { "Cache-Control": "no-store" }
  });
}
