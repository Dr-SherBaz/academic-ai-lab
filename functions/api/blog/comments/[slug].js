import { json, corsHeaders, corsPreflight } from "../../../_shared.js";

export const onRequestOptions = async ({ request }) => corsPreflight(request);

export const onRequest = async ({ request, env, params }) => {
  const origin = request.headers.get('Origin') || '*';
  const slug = params.slug;

  if (!slug) return json({ error: "Missing slug" }, 400, corsHeaders(origin));

  const db = env.DB;
  if (!db) return json({ comments: [] }, 200, corsHeaders(origin));

  const { results } = await db.prepare(
    `SELECT id, name, website, comment, created_at FROM blog_comments WHERE slug = ? AND status = 'approved' ORDER BY created_at ASC`
  ).bind(slug).all();

  return json({ comments: results || [] }, 200, corsHeaders(origin));
};
