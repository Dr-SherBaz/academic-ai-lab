import { json, corsHeaders } from "../../_shared.js";

export const onRequest = async ({ request, env }) => {
  const origin = request.headers.get('Origin') || '*';
  const url = new URL(request.url);
  const slug = url.pathname.replace(/^\/api\/blog\/comments\//, '').replace(/\/$/, '');

  if (!slug) return json({ error: "Missing slug" }, 400, corsHeaders(origin));

  const db = env.DB;
  if (!db) return json({ comments: [] }, 200, corsHeaders(origin));

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(origin) });
  }

  const { results } = await db.prepare(
    `SELECT id, name, website, comment, created_at FROM blog_comments WHERE slug = ? AND status = 'approved' ORDER BY created_at ASC`
  ).bind(slug).all();

  return json({ comments: results || [] }, 200, corsHeaders(origin));
};
