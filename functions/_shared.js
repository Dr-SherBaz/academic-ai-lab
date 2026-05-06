export const json = (data, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extraHeaders }
  });

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function makeOrderId(now = new Date()) {
  const year = now.getUTCFullYear();
  const sequence = String(Math.floor(Math.random() * 9000) + 1).padStart(4, "0");
  return `AAL-${year}-${sequence}`;
}

export async function hashToken(token) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function makeToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function validateRequired(body, fields) {
  return fields.filter((field) => !body[field] || String(body[field]).trim() === "");
}

const allowedUploadExtensions = new Set(["pdf", "doc", "docx", "xls", "xlsx", "csv", "sav", "ppt", "pptx", "zip"]);
const blockedUploadExtensions = new Set(["exe", "js", "bat", "sh", "php"]);

export function validateUpload({ filename = "", size = 0 }) {
  const extension = String(filename).split(".").pop().toLowerCase();
  if (!extension || blockedUploadExtensions.has(extension) || !allowedUploadExtensions.has(extension)) {
    return { ok: false, reason: "File type is not allowed." };
  }
  if (Number(size) > 50 * 1024 * 1024) {
    return { ok: false, reason: "File size exceeds 50 MB limit." };
  }
  return { ok: true, extension };
}

export async function insertOrder(db, data) {
  const order_id = makeOrderId();
  const { client_name, email, whatsapp, service_category, subcategory, academic_level, discipline, deadline, description, preferred_channel } = data;
  await db.prepare(
    `INSERT INTO orders (order_id, client_name, email, whatsapp, service_category, subcategory, academic_level, discipline, deadline, description, preferred_channel)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(order_id, client_name, email, whatsapp, service_category, subcategory || '', academic_level || '', discipline || '', deadline || '', description || '', preferred_channel || 'WhatsApp').run();
  return order_id;
}

export async function getOrderByToken(db, token_hash) {
  const tokenRow = await db.prepare(
    `SELECT order_id FROM magic_tokens WHERE token_hash = ? AND expires_at > datetime('now') AND used_at IS NULL`
  ).bind(token_hash).first();
  if (!tokenRow) return null;
  return db.prepare(`SELECT * FROM orders WHERE order_id = ?`).bind(tokenRow.order_id).first();
}

export async function recordStatusHistory(db, order_id, new_status, changed_by = 'system', notes = '') {
  const order = await db.prepare(`SELECT status FROM orders WHERE order_id = ?`).bind(order_id).first();
  const previous = order ? order.status : '';
  await db.prepare(
    `INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, notes) VALUES (?, ?, ?, ?, ?)`
  ).bind(order_id, previous, new_status, changed_by, notes).run();
}

export function corsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export function corsPreflight(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders(request.headers.get('Origin') || '*'),
    });
  }
}
