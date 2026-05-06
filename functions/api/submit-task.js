import { json, readJson, insertOrder, validateRequired, corsHeaders, corsPreflight } from "../_shared.js";

export const onRequestOptions = async ({ request }) => corsPreflight(request);

export const onRequestPost = async ({ request, env }) => {
  const origin = request.headers.get('Origin') || '*';
  const body = await readJson(request);
  const missing = validateRequired(body, ["client_name", "email", "whatsapp", "service_category", "description"]);
  if (missing.length) return json({ error: "Missing required fields.", missing }, 400);

  const db = env.DB;
  const order_id = await insertOrder(db, body);

  await db.prepare(
    `INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, notes) VALUES (?, '', 'pending_review', 'client', 'Task submitted via web form')`
  ).bind(order_id).run();

  return json({
    order_id,
    next_step: "Admin review will confirm scope, required files, quote type, advance payment step, and expert fit.",
    magic_link_required: "Request a magic link with your email/WhatsApp and Order ID to view client-safe status updates."
  }, 201, corsHeaders(origin));
};
