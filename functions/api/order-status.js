import { json, hashToken, corsHeaders, corsPreflight, getOrderByToken } from "../_shared.js";

export const onRequestOptions = async ({ request }) => corsPreflight(request);

export const onRequestGet = async ({ request, env }) => {
  const origin = request.headers.get('Origin') || '*';
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return json({ error: "Valid magic-link token required." }, 401, corsHeaders(origin));

  const token_hash = await hashToken(token);
  const db = env.DB;
  const order = await getOrderByToken(db, token_hash);
  if (!order) return json({ error: "Invalid or expired token." }, 401, corsHeaders(origin));

  return json({
    order_id: order.order_id,
    service_category: order.service_category,
    current_status: order.status,
    payment_status: order.payment_status,
    delivery_status: order.delivery_status,
    deadline_if_public: order.deadline,
    created_at: order.created_at,
    updated_at: order.updated_at
  }, 200, corsHeaders(origin));
};
