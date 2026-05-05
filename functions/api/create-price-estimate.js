import { json, readJson, validateRequired } from "../_shared.js";

export const onRequestPost = async ({ request }) => {
  const body = await readJson(request);
  const missing = validateRequired(body, ["service_category", "subcategory"]);
  if (missing.length) return json({ error: "Missing required fields.", missing }, 400);

  const urgency = String(body.deadline_urgency || "").toLowerCase();
  const risk = String(body.risk_level || "standard").toLowerCase();
  const complex = ["high", "complex", "urgent"].some((word) => risk.includes(word) || urgency.includes(word));
  const simple = ["formatting", "proofreading", "simple slides", "simple notes"].some((word) =>
    String(body.subcategory || "").toLowerCase().includes(word)
  );

  const model = simple ? "fixed_price" : complex ? "manual_quote" : "calculated_range";
  return json({
    pricing_model: model,
    suggested_price_range: model === "fixed_price" ? "Fixed package placeholder" : model === "manual_quote" ? "Manual admin quote required" : "Calculated range placeholder",
    expert_tag: body.software_required ? "Software specialist" : "Relevant subject/expert reviewer",
    estimated_delivery_time: complex ? "Admin review required" : "Estimated after file review",
    required_files_checklist: ["task brief", "deadline", "source files", "instructions/rubric", "sample/output preference"],
    risk_level: complex ? "high" : "standard",
    manual_review_flag: complex || !simple,
    admin_approval_required: true,
    inputs_supported: ["service category", "subcategory", "academic level", "discipline", "word count/pages/slides/models", "deadline urgency", "file condition", "data condition", "software required", "quality-control level", "expert skill needed", "risk level"]
  });
};
