// Shared activity catalogue backed by Cloudflare KV (VISITS binding).
// A custom activity is promoted after five confirmed selections.
const THRESHOLD = 5;
const cleanName = value => typeof value === "string" ? value.trim().replace(/\\s+/g, " ").slice(0, 80) : "";
const keyFor = name => "activity:" + encodeURIComponent(name.toLocaleLowerCase("lv-LV"));
export async function onRequestGet({ env }) {
  if (!env.VISITS) return Response.json({ popular: [] }, { status: 200 });
  const listed = await env.VISITS.list({ prefix: "activity:" });
  const popular = [];
  for (const key of listed.keys) {
    const raw = await env.VISITS.get(key.name);
    if (!raw) continue;
    try {
      const item = JSON.parse(raw);
      if (item.count >= THRESHOLD) popular.push({ name: item.name, count: item.count });
    } catch (_) {}
  }
  popular.sort((a,b) => b.count-a.count || a.name.localeCompare(b.name, "lv"));
  return Response.json({ popular: popular.slice(0, 30) }, { headers: { "Cache-Control": "no-store" } });
}
export async function onRequestPost({ request, env }) {
  if (!env.VISITS) return new Response("Counter storage is not configured", { status: 503 });
  let body;
  try { body = await request.json(); } catch (_) { return new Response("Bad request", { status: 400 }); }
  const name = cleanName(body?.name);
  if (name.length < 2 || !/[\\p{L}\\p{N}]/u.test(name)) return new Response("Invalid activity", { status: 400 });
  const key = keyFor(name);
  let item = {};
  try { item = JSON.parse(await env.VISITS.get(key) || "{}"); } catch (_) {}
  item = { name, count: Number(item.count || 0) + 1 };
  await env.VISITS.put(key, JSON.stringify(item));
  return Response.json({ count: item.count, promoted: item.count >= THRESHOLD });
}
