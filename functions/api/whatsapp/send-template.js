import { json, readJson, validateRequired } from "../../_shared.js";

export const onRequestPost = async ({ request, env }) => {
  const body = await readJson(request);
  const missing = validateRequired(body, ["to", "template_name", "order_id"]);
  if (missing.length) return json({ error: "Missing required fields.", missing }, 400);

  const configured = Boolean(env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID && env.WHATSAPP_BUSINESS_ACCOUNT_ID);
  return json({
    message: "WhatsApp template placeholder only. No real message was sent.",
    configured,
    required_env: ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_BUSINESS_ACCOUNT_ID"],
    handover_required_for: ["final pricing", "discount", "complaint", "scope change", "ethical risk", "complex judgment"]
  });
};
