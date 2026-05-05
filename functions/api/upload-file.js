import { json, readJson, validateRequired, validateUpload } from "../_shared.js";

export const onRequestPost = async ({ request }) => {
  const body = await readJson(request);
  const missing = validateRequired(body, ["order_id", "session_token", "filename", "size"]);
  if (missing.length) return json({ error: "Missing required fields.", missing }, 400);

  const validation = validateUpload({ filename: body.filename, size: body.size });
  if (!validation.ok) return json({ error: validation.reason }, 400);

  return json({
    message: "Upload scaffold accepted. Future implementation should issue a signed Cloudflare R2 upload URL.",
    order_id: body.order_id,
    file_type: validation.extension,
    future_storage_path: `client-uploads/${body.order_id}/${body.filename}`,
    r2_public: false
  });
};
