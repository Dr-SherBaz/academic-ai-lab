import { json, corsHeaders, corsPreflight } from "../../_shared.js";

export const onRequestOptions = async ({ request }) => corsPreflight(request);

export const onRequest = async ({ request, env }) => {
  const origin = request.headers.get('Origin') || '*';
  const url = new URL(request.url);
  const slug = url.pathname.replace(/^\/api\/blog\/view\//, '').replace(/\/$/, '');
  const noCache = { 'Cache-Control': 'no-cache, no-store, must-revalidate' };

  if (!slug) return json({ error: "Missing slug" }, 400, corsHeaders(origin));

  const db = env.DB;

  if (request.method === 'GET') {
    if (!db) return json({ reads: 0 }, 200, { ...corsHeaders(origin), ...noCache });
    const row = await db.prepare(`SELECT reads FROM blog_metrics WHERE slug = ?`).bind(slug).first();
    return json({ reads: row?.reads || 0 }, 200, { ...corsHeaders(origin), ...noCache });
  }

  if (request.method === 'POST') {
    if (!db) return json({ reads: 0 }, 200, { ...corsHeaders(origin), ...noCache });
    try {
      await db.prepare(
        `INSERT INTO blog_metrics (slug, reads, updated_at) VALUES (?, 1, datetime('now'))
         ON CONFLICT(slug) DO UPDATE SET reads = reads + 1, updated_at = datetime('now')`
      ).bind(slug).run();
    } catch (e) {
      return json({ reads: 0, error: String(e) }, 200, { ...corsHeaders(origin), ...noCache });
    }
    const row = await db.prepare(`SELECT reads FROM blog_metrics WHERE slug = ?`).bind(slug).first();
    return json({ reads: row?.reads || 0 }, 200, { ...corsHeaders(origin), ...noCache });
  }

  return json({ error: "Method not allowed" }, 405, corsHeaders(origin));
};
