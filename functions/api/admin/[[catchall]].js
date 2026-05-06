import { json, readJson, corsHeaders } from "../../_shared.js";

export const onRequest = async ({ request, env }) => {
  const origin = request.headers.get('Origin') || '*';
  const headers = corsHeaders(origin);
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/admin\/?/, '').replace(/\/$/, '');
  const db = env.DB;

  if (!db) return json({ error: "D1 not configured" }, 503, headers);

  try {
    // OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // GET /api/admin/stats
    if (request.method === 'GET' && (path === 'stats' || path === '')) {
      const [total, pending, inProgress, completed] = await Promise.all([
        db.prepare('SELECT COUNT(*) as c FROM orders').first(),
        db.prepare(`SELECT COUNT(*) as c FROM orders WHERE status IN ('pending_review','in_review')`).first(),
        db.prepare(`SELECT COUNT(*) as c FROM orders WHERE status IN ('expert_working','revision')`).first(),
        db.prepare(`SELECT COUNT(*) as c FROM orders WHERE status = 'completed'`).first(),
      ]);
      const pendingFeedback = await db.prepare(`SELECT COUNT(*) as c FROM feedback WHERE display_status = 'pending_approval'`).first();
      const pendingExperts = await db.prepare(`SELECT COUNT(*) as c FROM experts WHERE status = 'pending_review'`).first();
      return json({
        stats: {
          total_orders: total?.c || 0,
          pending_review: pending?.c || 0,
          in_progress: inProgress?.c || 0,
          completed: completed?.c || 0,
          pending_feedback: pendingFeedback?.c || 0,
          pending_experts: pendingExperts?.c || 0
        }
      }, 200, headers);
    }

    // GET /api/admin/orders
    if (request.method === 'GET' && path === 'orders') {
      const { results } = await db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
      return json({ orders: results || [] }, 200, headers);
    }

    // GET /api/admin/orders/:id
    const orderMatch = path.match(/^orders\/([^/]+)$/);
    if (request.method === 'GET' && orderMatch) {
      const order = await db.prepare('SELECT * FROM orders WHERE order_id = ?').bind(orderMatch[1]).first();
      if (!order) return json({ error: "Order not found" }, 404, headers);
      return json({ order }, 200, headers);
    }

    // POST /api/admin/orders/:id/status
    const statusMatch = path.match(/^orders\/([^/]+)\/status$/);
    if (request.method === 'POST' && statusMatch) {
      const body = await readJson(request);
      const order_id = statusMatch[1];
      const order = await db.prepare('SELECT status FROM orders WHERE order_id = ?').bind(order_id).first();
      if (!order) return json({ error: "Order not found" }, 404, headers);
      const previous = order.status;
      await db.prepare('UPDATE orders SET status = ?, updated_at = datetime(\'now\') WHERE order_id = ?').bind(body.status, order_id).run();
      await db.prepare('INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, notes) VALUES (?, ?, ?, \'admin\', \'Status updated from dashboard\')').bind(order_id, previous, body.status).run();
      return json({ ok: true, order_id, status: body.status }, 200, headers);
    }

    // GET /api/admin/feedback
    if (request.method === 'GET' && path === 'feedback') {
      const { results } = await db.prepare('SELECT * FROM feedback ORDER BY created_at DESC').all();
      return json({ feedback: results || [] }, 200, headers);
    }

    // POST /api/admin/feedback/:id/approve
    const feedbackMatch = path.match(/^feedback\/(\d+)\/approve$/);
    if (request.method === 'POST' && feedbackMatch) {
      await db.prepare("UPDATE feedback SET display_status = 'approved' WHERE id = ?").bind(Number(feedbackMatch[1])).run();
      return json({ ok: true }, 200, headers);
    }

    // GET /api/admin/blog-comments
    if (request.method === 'GET' && path === 'blog-comments') {
      const { results } = await db.prepare('SELECT * FROM blog_comments ORDER BY created_at DESC').all();
      return json({ comments: results || [] }, 200, headers);
    }

    // POST /api/admin/blog-comments/:id/approve
    const blogApproveMatch = path.match(/^blog-comments\/(\d+)\/approve$/);
    if (request.method === 'POST' && blogApproveMatch) {
      await db.prepare("UPDATE blog_comments SET status = 'approved', approved_at = datetime('now') WHERE id = ?").bind(Number(blogApproveMatch[1])).run();
      return json({ ok: true }, 200, headers);
    }

    // POST /api/admin/blog-comments/:id/reject
    const blogRejectMatch = path.match(/^blog-comments\/(\d+)\/reject$/);
    if (request.method === 'POST' && blogRejectMatch) {
      await db.prepare("UPDATE blog_comments SET status = 'rejected' WHERE id = ?").bind(Number(blogRejectMatch[1])).run();
      return json({ ok: true }, 200, headers);
    }

    // GET /api/admin/experts
    if (request.method === 'GET' && path === 'experts') {
      const { results } = await db.prepare('SELECT * FROM experts ORDER BY created_at DESC').all();
      return json({ experts: results || [] }, 200, headers);
    }

    // POST /api/admin/experts/:id/status
    const expertMatch = path.match(/^experts\/(\d+)\/status$/);
    if (request.method === 'POST' && expertMatch) {
      const body = await readJson(request);
      await db.prepare('UPDATE experts SET status = ? WHERE id = ?').bind(body.status, Number(expertMatch[1])).run();
      return json({ ok: true }, 200, headers);
    }

    return json({ error: "Not found" }, 404, headers);
  } catch (err) {
    return json({ error: err.message }, 500, headers);
  }
};
