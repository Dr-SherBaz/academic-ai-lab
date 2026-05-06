import { json, readJson, validateRequired, validateUpload, corsHeaders, corsPreflight } from "../_shared.js";

export const onRequestOptions = async ({ request }) => corsPreflight(request);

export const onRequestPost = async ({ request, env }) => {
  const origin = request.headers.get('Origin') || '*';
  const body = await readJson(request);
  const missing = validateRequired(body, ["order_id", "filename", "size"]);
  if (missing.length) return json({ error: "Missing required fields.", missing }, 400, corsHeaders(origin));

  const validation = validateUpload({ filename: body.filename, size: body.size });
  if (!validation.ok) return json({ error: validation.reason }, 400, corsHeaders(origin));

  const db = env.DB;
  const order = await db.prepare(`SELECT order_id FROM orders WHERE order_id = ?`).bind(body.order_id).first();
  if (!order) return json({ error: "Order not found." }, 404, corsHeaders(origin));

  const storage_path = `client-uploads/${body.order_id}/${body.filename}`;

  if (env.R2) {
    const uploadUrl = await env.R2.createSignedUrl(storage_path, {
      method: 'PUT',
      expiryInSeconds: 3600,
    });

    await db.prepare(
      `INSERT INTO uploads (order_id, filename, file_size, storage_path) VALUES (?, ?, ?, ?)`
    ).bind(body.order_id, body.filename, Number(body.size) || 0, storage_path).run();

    return json({
      message: "Signed upload URL generated. Use PUT with this URL to upload the file.",
      order_id: body.order_id,
      upload_url: uploadUrl,
      storage_path,
      expires_in: 3600
    }, 201, corsHeaders(origin));
  }

  return json({
    message: "R2 binding not configured. File metadata recorded but no upload URL generated.",
    order_id: body.order_id,
    storage_path
  }, 201, corsHeaders(origin));
};
