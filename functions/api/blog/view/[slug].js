import { json, corsHeaders, corsPreflight } from "../../../_shared.js";

const NO_CACHE = { 'Cache-Control': 'no-cache, no-store, must-revalidate' };

export const onRequestOptions = async ({ request }) => corsPreflight(request);

async function ensureBlogMetricsTable(db) {
  await db.prepare(
    "CREATE TABLE IF NOT EXISTS blog_metrics (slug TEXT PRIMARY KEY, reads INTEGER NOT NULL DEFAULT 0, likes INTEGER NOT NULL DEFAULT 0, dislikes INTEGER NOT NULL DEFAULT 0, shares INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"
  ).run();
}

async function fetchMetrics(db, slug) {
  const row = await db.prepare(`SELECT reads, likes, dislikes, shares FROM blog_metrics WHERE slug = ?`).bind(slug).first();
  return {
    reads: row?.reads || 0,
    likes: row?.likes || 0,
    dislikes: row?.dislikes || 0,
    shares: row?.shares || 0,
  };
}

export const onRequest = async ({ request, env, params }) => {
  const origin = request.headers.get('Origin') || '*';
  const slug = params.slug;

  if (!slug) return json({ error: "Missing slug" }, 400, corsHeaders(origin));

  const db = env.DB;

  if (request.method === 'GET') {
    if (!db) return json({ reads: 0, likes: 0, dislikes: 0, shares: 0, db: false }, 200, { ...corsHeaders(origin), ...NO_CACHE });
    try {
      await ensureBlogMetricsTable(db);
      const metrics = await fetchMetrics(db, slug);
      return json(metrics, 200, { ...corsHeaders(origin), ...NO_CACHE });
    } catch (e) {
      return json({ reads: 0, likes: 0, dislikes: 0, shares: 0, error: e.message || String(e) }, 200, { ...corsHeaders(origin), ...NO_CACHE });
    }
  }

  if (request.method === 'POST') {
    if (!db) return json({ reads: 0, likes: 0, dislikes: 0, shares: 0, slug, db: false }, 200, { ...corsHeaders(origin), ...NO_CACHE });
    try {
      await ensureBlogMetricsTable(db);
      const result = await db.prepare(
        `INSERT INTO blog_metrics (slug, reads, updated_at) VALUES (?, 1, datetime('now'))
         ON CONFLICT(slug) DO UPDATE SET reads = reads + 1, updated_at = datetime('now')`
      ).bind(slug).run();
      const metrics = await fetchMetrics(db, slug);
      return json({ ...metrics, slug, success: result.success }, 200, { ...corsHeaders(origin), ...NO_CACHE });
    } catch (e) {
      return json({ reads: 0, likes: 0, dislikes: 0, shares: 0, slug, error: e.message || String(e) }, 200, { ...corsHeaders(origin), ...NO_CACHE });
    }
  }

  return json({ error: "Method not allowed" }, 405, corsHeaders(origin));
};
