import { json, readJson, corsHeaders, corsPreflight } from "../../_shared.js";

export const onRequestOptions = async ({ request }) => corsPreflight(request);

export const onRequestPost = async ({ request, env }) => {
  const origin = request.headers.get('Origin') || '*';
  const url = new URL(request.url);
  const slug = url.pathname.replace(/^\/api\/blog\/comment\//, '').replace(/\/$/, '');
  const body = await readJson(request);

  if (!slug) return json({ error: "Missing slug" }, 400, corsHeaders(origin));
  if (!body.name || String(body.name).trim().length < 2) return json({ error: "Name must be at least 2 characters." }, 400, corsHeaders(origin));
  if (!body.comment || String(body.comment).trim().length < 10) return json({ error: "Comment must be at least 10 characters." }, 400, corsHeaders(origin));
  if (String(body.comment).length > 2000) return json({ error: "Comment exceeds 2000 character limit." }, 400, corsHeaders(origin));

  const db = env.DB;
  if (!db) return json({ error: "D1 not configured" }, 503, corsHeaders(origin));

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ua = request.headers.get('User-Agent') || '';

  async function sha256(str) {
    const bytes = new TextEncoder().encode(str);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2,"0")).join("");
  }

  const ipHash = ip ? await sha256(ip) : '';
  const uaHash = ua ? await sha256(ua) : '';

  const result = await db.prepare(
    `INSERT INTO blog_comments (slug, name, email, website, comment, status, ip_hash, user_agent_hash)
     VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`
  ).bind(
    slug,
    String(body.name).trim(),
    String(body.email || '').trim(),
    String(body.website || '').trim(),
    String(body.comment).trim(),
    ipHash,
    uaHash
  ).run();

  return json({
    id: result.meta?.last_row_id || null,
    message: "Thank you. Your comment has been received and will appear after review.",
    status: "pending"
  }, 201, corsHeaders(origin));
};
