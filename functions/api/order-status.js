import { json } from "../_shared.js";

export const onRequestGet = async ({ request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return json({ error: "Valid magic-link token required." }, 401);

  return json({
    order_id: "AAL-2026-0001",
    service_category: "Research & Academic Services",
    current_status: "Expert review",
    payment_status: "Advance not yet confirmed",
    required_action: "Wait for admin-approved quote",
    public_update_note: "Your submitted task is being checked for scope, files, deadline, and expert fit.",
    delivery_status: "Not ready",
    deadline_if_public: null
  });
};
