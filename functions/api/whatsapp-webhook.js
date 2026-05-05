import { json, readJson } from "../_shared.js";

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge || "", { status: 200 });
  }
  return json({ error: "Webhook verification placeholder failed." }, 403);
};

export const onRequestPost = async ({ request }) => {
  await readJson(request);
  return json({
    message: "WhatsApp webhook placeholder received. Persist only safe event metadata after credentials and policies are configured."
  });
};
