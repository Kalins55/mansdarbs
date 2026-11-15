// Aggregate-only statistics. Individual visitor identifiers are never returned.
const PAGEVIEW_PREFIX = "stats:pageview:";
const VISITOR_PREFIX = "stats:visitor:";

async function countKeys(kv, prefix) {
  let count = 0;
  let cursor;
  do {
    const page = await kv.list({ prefix, limit: 1000, ...(cursor ? { cursor } : {}) });
    count += page.keys.length;
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return count;
}

export async function onRequestGet({ env }) {
  if (!env.VISITS) {
    return Response.json({ error: "Statistics storage is not configured" }, {
      status: 503,
      headers: { "Cache-Control": "no-store" }
    });
  }

  try {
    const [pageviews, uniqueVisitors] = await Promise.all([
      countKeys(env.VISITS, PAGEVIEW_PREFIX),
      countKeys(env.VISITS, VISITOR_PREFIX)
    ]);

    return Response.json({
      uniqueVisitors,
      pageviews,
      retentionDays: 365,
      updatedAt: new Date().toISOString()
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (_) {
    return Response.json({ error: "Statistics are temporarily unavailable" }, {
      status: 503,
      headers: { "Cache-Control": "no-store" }
    });
  }
}
