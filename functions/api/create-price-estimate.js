import { json, readJson, validateRequired, corsHeaders, corsPreflight } from "../_shared.js";

export const onRequestOptions = async ({ request }) => corsPreflight(request);

export const onRequestPost = async ({ request, env }) => {
  const origin = request.headers.get('Origin') || '*';
  const body = await readJson(request);
  const missing = validateRequired(body, ["service_category", "subcategory"]);
  if (missing.length) return json({ error: "Missing required fields.", missing }, 400, corsHeaders(origin));

  const urgency = String(body.deadline_urgency || "").toLowerCase();
  const risk = String(body.risk_level || "standard").toLowerCase();
  const complex = ["high", "complex", "urgent"].some((word) => risk.includes(word) || urgency.includes(word));
  const simple = ["formatting", "proofreading", "simple slides", "simple notes"].some((word) =>
    String(body.subcategory || "").toLowerCase().includes(word)
  );

  const model = simple ? "fixed_price" : complex ? "manual_quote" : "calculated_range";

  const db = env.DB;
  const existing = await db.prepare(
    `SELECT suggested_price, pricing_model FROM price_templates WHERE service_category = ? AND subcategory = ? AND pricing_model = ?`
  ).bind(body.service_category, body.subcategory || '', model).first();

  return json({
    pricing_model: model,
    suggested_price_range: existing?.suggested_price || (model === "fixed_price" ? "Fixed package — contact for quote" : model === "manual_quote" ? "Manual admin quote required" : "Calculated range — contact for estimate"),
    expert_tag: body.software_required ? "Software specialist" : "Relevant subject/expert reviewer",
    estimated_delivery_time: complex ? "Admin review required" : "Estimated after file review",
    required_files_checklist: ["task brief", "deadline", "source files", "instructions/rubric", "sample/output preference"],
    risk_level: complex ? "high" : "standard",
    manual_review_flag: complex || !simple,
    admin_approval_required: true
  }, 200, corsHeaders(origin));
};
