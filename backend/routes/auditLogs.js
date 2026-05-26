const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// ─── GET /api/audit-logs ─────────────────────────────────────
router.get('/', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const { action, resource_type, actor_id, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT al.*, u.name AS actor_name, u.role AS actor_role
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.actor_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    // Super-admin can see logs but not revenue-related ones
    if (req.user.role === 'super-admin') {
      query += ` AND al.action NOT LIKE 'revenue.%'`;
    }

    if (action)        { query += ` AND al.action ILIKE $${idx++}`;        params.push(`%${action}%`); }
    if (resource_type) { query += ` AND al.resource_type = $${idx++}`;     params.push(resource_type); }
    if (actor_id)      { query += ` AND al.actor_id = $${idx++}`;          params.push(actor_id); }

    query += ` ORDER BY al.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);

    const countQuery = `SELECT COUNT(*) FROM audit_logs al WHERE 1=1
      ${req.user.role === 'super-admin' ? "AND al.action NOT LIKE 'revenue.%'" : ''}`;
    const countResult = await pool.query(countQuery);

    res.json({ logs: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    console.error('GET /audit-logs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
