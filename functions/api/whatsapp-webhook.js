import { json, readJson, corsHeaders } from "../_shared.js";

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge || "", { status: 200 });
  }
  return json({ error: "Webhook verification failed." }, 403);
};

export const onRequestPost = async ({ request, env }) => {
  const body = await readJson(request);

  const db = env.DB;
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];
  const statuses = change?.value?.statuses?.[0];

  if (message) {
    const from = message.from;
    const text = message.text?.body || '';
    const msg_id = message.id;

    if (db) {
      await db.prepare(
        `INSERT INTO incoming_messages (wa_from, wa_message_id, wa_text, raw_json) VALUES (?, ?, ?, ?)`
      ).bind(from, msg_id, text, JSON.stringify(body)).run();
    }

    return json({ status: 'received' }, 200);
  }

  if (statuses) {
    if (db) {
      await db.prepare(
        `INSERT INTO message_status (wa_message_id, status) VALUES (?, ?)`
      ).bind(statuses.id, statuses.status).run();
    }
    return json({ status: 'acknowledged' }, 200);
  }

  return json({ status: 'ignored' }, 200);
};
