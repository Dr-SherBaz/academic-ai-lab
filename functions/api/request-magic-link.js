import { json, readJson, makeToken, hashToken, validateRequired } from "../_shared.js";

export const onRequestPost = async ({ request }) => {
  const body = await readJson(request);
  const missing = validateRequired(body, ["contact", "order_id"]);
  if (missing.length) return json({ error: "Missing required fields.", missing }, 400);

  const token = makeToken();
  const token_hash = await hashToken(token);
  const expires_at = new Date(Date.now() + 20 * 60 * 1000).toISOString();

  return json({
    message: "Magic-link scaffold created. In production, send the raw token by email/WhatsApp and store only the hash.",
    order_id: body.order_id,
    expires_at,
    token_storage_placeholder: {
      table: "magic_tokens",
      token_hash,
      raw_token_logged: false
    }
  });
};
