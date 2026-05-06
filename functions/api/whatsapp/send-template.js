import { json, readJson, validateRequired, corsHeaders, corsPreflight } from "../../_shared.js";

export const onRequestOptions = async ({ request }) => corsPreflight(request);

export const onRequestPost = async ({ request, env }) => {
  const origin = request.headers.get('Origin') || '*';
  const body = await readJson(request);
  const missing = validateRequired(body, ["to", "template_name", "order_id"]);
  if (missing.length) return json({ error: "Missing required fields.", missing }, 400, corsHeaders(origin));

  if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    return json({
      error: "WhatsApp not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in env.",
      configured: false
    }, 501, corsHeaders(origin));
  }

  const waUrl = `https://graph.facebook.com/v22.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const waBody = {
    messaging_product: "whatsapp",
    to: body.to,
    type: "template",
    template: {
      name: body.template_name,
      language: { code: "en" },
      components: [{
        type: "body",
        parameters: [{ type: "text", text: body.order_id }]
      }]
    }
  };

  const resp = await fetch(waUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(waBody)
  });

  const result = await resp.json();

  if (resp.ok) {
    return json({
      message: "Template sent via WhatsApp.",
      wa_id: result.messages?.[0]?.id,
      order_id: body.order_id
    }, 200, corsHeaders(origin));
  }

  return json({
    error: "WhatsApp API error",
    details: result
  }, resp.status, corsHeaders(origin));
};
