import { json, readJson, corsHeaders, corsPreflight } from "../../_shared.js";

export const onRequestOptions = async ({ request }) => corsPreflight(request);

export const onRequestPost = async ({ request, env }) => {
  const origin = request.headers.get('Origin') || '*';
  const url = new URL(request.url);
  const slug = url.pathname.replace(/^\/api\/blog\/vote\//, '').replace(/\/$/, '');
  const body = await readJson(request);

  if (!slug) return json({ error: "Missing slug" }, 400, corsHeaders(origin));
  if (!body.vote || !['like', 'dislike'].includes(body.vote)) {
    return json({ error: "Vote must be 'like' or 'dislike'" }, 400, corsHeaders(origin));
  }

  const db = env.DB;
  if (!db) return json({ error: "D1 not configured" }, 503, corsHeaders(origin));

  const column = body.vote === 'like' ? 'likes' : 'dislikes';

  await db.prepare(
    `INSERT INTO blog_metrics (slug, ${column}, updated_at) VALUES (?, 1, datetime('now'))
     ON CONFLICT(slug) DO UPDATE SET ${column} = ${column} + 1, updated_at = datetime('now')`
  ).bind(slug).run();

  const row = await db.prepare(`SELECT reads, likes, dislikes FROM blog_metrics WHERE slug = ?`).bind(slug).first();

  return json({
    reads: row?.reads || 0,
    likes: row?.likes || 0,
    dislikes: row?.dislikes || 0
  }, 200, corsHeaders(origin));
};
