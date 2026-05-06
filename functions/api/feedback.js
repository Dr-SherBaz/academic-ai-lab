import { json, readJson, validateRequired, corsHeaders, corsPreflight } from "../_shared.js";

export const onRequestOptions = async ({ request }) => corsPreflight(request);

export const onRequestPost = async ({ request, env }) => {
  const origin = request.headers.get('Origin') || '*';
  const body = await readJson(request);
  const missing = validateRequired(body, ["order_id", "feedback"]);
  if (missing.length) return json({ error: "Missing required fields.", missing }, 400, corsHeaders(origin));

  const db = env.DB;
  const order = await db.prepare(`SELECT order_id FROM orders WHERE order_id = ?`).bind(body.order_id).first();
  if (!order) return json({ error: "Order not found." }, 404, corsHeaders(origin));

  await db.prepare(
    `INSERT INTO feedback (order_id, client_name, rating, feedback, display_status) VALUES (?, ?, ?, ?, 'pending_approval')`
  ).bind(body.order_id, body.client_name || '', Number(body.rating) || 0, body.feedback).run();

  return json({
    message: "Feedback received. It will be reviewed before public display.",
    order_id: body.order_id,
    public_display_status: "pending_approval"
  }, 201, corsHeaders(origin));
};
