import { json, corsHeaders, corsPreflight } from "../../_shared.js";

export const onRequestOptions = async ({ request }) => corsPreflight(request);

export const onRequestPost = async ({ request, env }) => {
  const origin = request.headers.get('Origin') || '*';
  const url = new URL(request.url);
  const slug = url.pathname.replace(/^\/api\/blog\/share\//, '').replace(/\/$/, '');

  if (!slug) return json({ error: "Missing slug" }, 400, corsHeaders(origin));

  const db = env.DB;
  if (!db) return json({ shares: 0 }, 200, corsHeaders(origin));

  await db.prepare(
    `INSERT INTO blog_metrics (slug, shares, updated_at) VALUES (?, 1, datetime('now'))
     ON CONFLICT(slug) DO UPDATE SET shares = shares + 1, updated_at = datetime('now')`
  ).bind(slug).run();

  const row = await db.prepare(`SELECT shares FROM blog_metrics WHERE slug = ?`).bind(slug).first();

  return json({ shares: row?.shares || 0 }, 200, corsHeaders(origin));
};
