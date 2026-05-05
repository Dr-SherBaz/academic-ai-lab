import { json, readJson, makeOrderId, validateRequired } from "../_shared.js";

export const onRequestPost = async ({ request }) => {
  const body = await readJson(request);
  const missing = validateRequired(body, ["client_name", "email", "whatsapp", "service_category", "description"]);
  if (missing.length) return json({ error: "Missing required fields.", missing }, 400);

  const order_id = makeOrderId();
  return json({
    order_id,
    next_step: "Admin review will confirm scope, required files, quote type, advance payment step, and expert fit.",
    magic_link_required: "Request a magic link with your email/WhatsApp and Order ID to view client-safe status updates.",
    storage_note: "File metadata accepted. Future private uploads should use Cloudflare R2 signed upload URLs.",
    received_fields: {
      client_name: body.client_name,
      email: body.email,
      whatsapp: body.whatsapp,
      service_category: body.service_category,
      subcategory: body.subcategory || "",
      academic_level: body.academic_level || "",
      discipline: body.discipline || "",
      deadline: body.deadline || "",
      preferred_communication_channel: body.preferred_communication_channel || "WhatsApp"
    }
  }, 201);
};
