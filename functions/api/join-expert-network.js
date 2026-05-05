import { json, readJson, validateRequired } from "../_shared.js";

export const onRequestPost = async ({ request }) => {
  const body = await readJson(request);
  const missing = validateRequired(body, ["name", "email", "whatsapp"]);
  if (missing.length) return json({ error: "Missing required fields.", missing }, 400);

  return json({
    message: "Expert application scaffold received. Admin review required before assignment.",
    application_status: "pending_review",
    expert_tags: [
      "Research experts",
      "SPSS/EViews/SEM analysts",
      "Academic editors/formatters",
      "Digital developers",
      "AI workflow experts",
      "Design/media experts",
      "Trainers",
      "Subject specialists"
    ]
  }, 201);
};
