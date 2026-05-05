export const json = (data, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
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
    return { ok: false, reason: "Placeholder limit is 50 MB until R2 direct uploads are configured." };
  }
  return { ok: true, extension };
}
