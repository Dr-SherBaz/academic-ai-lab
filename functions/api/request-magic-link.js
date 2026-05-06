import { json, readJson, makeToken, hashToken, validateRequired, corsHeaders, corsPreflight } from "../_shared.js";

export const onRequestOptions = async ({ request }) => corsPreflight(request);

export const onRequestPost = async ({ request, env }) => {
  const origin = request.headers.get('Origin') || '*';
  const body = await readJson(request);
  const missing = validateRequired(body, ["contact", "order_id"]);
  if (missing.length) return json({ error: "Missing required fields.", missing }, 400, corsHeaders(origin));

  const db = env.DB;
  const order = await db.prepare(`SELECT order_id FROM orders WHERE order_id = ?`).bind(body.order_id).first();
  if (!order) return json({ error: "Order not found." }, 404, corsHeaders(origin));

  const token = makeToken();
  const token_hash = await hashToken(token);
  const expires_at = new Date(Date.now() + 20 * 60 * 1000).toISOString();

  await db.prepare(
    `INSERT INTO magic_tokens (order_id, token_hash, expires_at) VALUES (?, ?, ?)`
  ).bind(body.order_id, token_hash, expires_at).run();

  return json({
    message: "Magic link generated. In production, send the raw token by email/WhatsApp.",
    order_id: body.order_id,
    expires_at,
    raw_token: token
  }, 201, corsHeaders(origin));
};
