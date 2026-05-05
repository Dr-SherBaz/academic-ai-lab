import { json, readJson, validateRequired } from "../_shared.js";

export const onRequestPost = async ({ request }) => {
  const body = await readJson(request);
  const missing = validateRequired(body, ["order_id", "feedback"]);
  if (missing.length) return json({ error: "Missing required fields.", missing }, 400);

  return json({
    message: "Verified feedback scaffold received. Feedback must be approved before public display.",
    order_id: body.order_id,
    public_display_status: "pending_approval"
  }, 201);
};
