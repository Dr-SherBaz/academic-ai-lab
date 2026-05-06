import { json, readJson, validateRequired, corsHeaders, corsPreflight } from "../_shared.js";

export const onRequestOptions = async ({ request }) => corsPreflight(request);

export const onRequestPost = async ({ request, env }) => {
  const origin = request.headers.get('Origin') || '*';
  const body = await readJson(request);
  const missing = validateRequired(body, ["name", "email", "whatsapp"]);
  if (missing.length) return json({ error: "Missing required fields.", missing }, 400, corsHeaders(origin));

  const db = env.DB;
  await db.prepare(
    `INSERT INTO experts (name, email, whatsapp, expertise, experience) VALUES (?, ?, ?, ?, ?)`
  ).bind(body.name, body.email, body.whatsapp, body.expertise || '', body.experience || '').run();

  return json({
    message: "Application received. We'll review and be in touch.",
    application_status: "pending_review"
  }, 201, corsHeaders(origin));
};
