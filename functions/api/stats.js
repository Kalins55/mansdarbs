// Public aggregate only; no visitor identifiers are returned.
export async function onRequestGet({ env }) {
  if (!env.VISITS) return Response.json({ error: 'Statistics storage is not configured' }, { status: 503 });
  let totals = { uniqueVisitors: 0, pageviews: 0 };
  try { const saved = await env.VISITS.get('stats:totals'); if (saved) totals = { ...totals, ...JSON.parse(saved) }; }
  catch (_) { return Response.json({ error: 'Statistics are temporarily unavailable' }, { status: 503 }); }
  return Response.json({ uniqueVisitors: Number(totals.uniqueVisitors || 0), pageviews: Number(totals.pageviews || 0), updatedAt: totals.updatedAt || null }, { headers: { 'Cache-Control': 'no-store' } });
}