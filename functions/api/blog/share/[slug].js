import { json, corsHeaders, corsPreflight } from "../../../_shared.js";

async function ensureBlogMetricsTable(db) {
  await db.prepare(
    "CREATE TABLE IF NOT EXISTS blog_metrics (slug TEXT PRIMARY KEY, reads INTEGER NOT NULL DEFAULT 0, likes INTEGER NOT NULL DEFAULT 0, dislikes INTEGER NOT NULL DEFAULT 0, shares INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"
  ).run();
}

export const onRequestOptions = async ({ request }) => corsPreflight(request);

export const onRequestPost = async ({ request, env, params }) => {
  const origin = request.headers.get('Origin') || '*';
  const slug = params.slug;

  if (!slug) return json({ error: "Missing slug" }, 400, corsHeaders(origin));

  const db = env.DB;
  if (!db) return json({ shares: 0 }, 200, corsHeaders(origin));

  await ensureBlogMetricsTable(db);

  await db.prepare(
    `INSERT INTO blog_metrics (slug, shares, updated_at) VALUES (?, 1, datetime('now'))
     ON CONFLICT(slug) DO UPDATE SET shares = shares + 1, updated_at = datetime('now')`
  ).bind(slug).run();

  const row = await db.prepare(`SELECT shares FROM blog_metrics WHERE slug = ?`).bind(slug).first();

  return json({ shares: row?.shares || 0 }, 200, corsHeaders(origin));
};
