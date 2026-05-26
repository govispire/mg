const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const auditLog = require('../middleware/auditLogger');

const router = express.Router();

// ─── GET /api/admin/users — list all users (owner + super-admin) ──
router.get('/', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const { role, status, search, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.status, u.phone, u.department,
             u.created_at, u.deactivated_at, u.last_login_at, u.employee_capacity,
             cb.name AS created_by_name
      FROM users u
      LEFT JOIN users cb ON cb.id = u.created_by
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    // Super-admin cannot see owner accounts
    if (req.user.role === 'super-admin') {
      query += ` AND u.role != 'owner'`;
    }

    if (role) { query += ` AND u.role = $${idx++}`; params.push(role); }
    if (status) { query += ` AND u.status = $${idx++}`; params.push(status); }
    if (search) {
      query += ` AND (u.name ILIKE $${idx} OR u.email ILIKE $${idx++})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);

    // Count query
    let countQuery = `SELECT COUNT(*) FROM users u WHERE 1=1`;
    const countParams = [];
    let ci = 1;
    if (req.user.role === 'super-admin') countQuery += ` AND u.role != 'owner'`;
    if (role) { countQuery += ` AND u.role = $${ci++}`; countParams.push(role); }
    if (status) { countQuery += ` AND u.status = $${ci++}`; countParams.push(status); }
    if (search) { countQuery += ` AND (u.name ILIKE $${ci} OR u.email ILIKE $${ci++})`; countParams.push(`%${search}%`); }

    const countResult = await pool.query(countQuery, countParams);

    res.json({ users: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    console.error('GET /admin/users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/admin/users — create user (owner + super-admin) ───
router.post(
  '/',
  auth,
  requireRole(['owner', 'super-admin']),
  auditLog('user.create'),
  async (req, res) => {
    const { name, email, password, role, phone, department, employee_capacity } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password, role are required' });
    }

    // Super-admin cannot create owner or super-admin
    if (req.user.role === 'super-admin' && ['owner', 'super-admin'].includes(role)) {
      return res.status(403).json({ error: 'Super-admin cannot create Owner or Super-admin accounts' });
    }

    const validRoles = ['owner', 'super-admin', 'employee', 'mentor', 'student'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    try {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, phone, department, employee_capacity, created_by, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'active')
         RETURNING id, name, email, role, status, phone, department, created_at`,
        [
          name.trim(), email.toLowerCase().trim(), passwordHash,
          role, phone || null, department || null,
          employee_capacity || 0, req.user.id,
        ]
      );

      // Init streak data for new user
      await pool.query(`INSERT INTO streak_data (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [result.rows[0].id]);

      // Init performance row for employees/mentors
      if (['employee', 'mentor'].includes(role)) {
        await pool.query(
          `INSERT INTO employee_performance (user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
          [result.rows[0].id]
        );
      }

      // Send notification to new user
      await pool.query(
        `INSERT INTO notifications (user_id, title, body, type) VALUES ($1,$2,$3,'info')`,
        [
          result.rows[0].id,
          'Welcome to the platform!',
          `Your ${role} account has been created by ${req.user.role === 'owner' ? 'the Owner' : 'Superadmin'}.`,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('POST /admin/users error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ─── GET /api/admin/users/:id — get single user ──────────────
router.get('/:id', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, cb.name AS created_by_name
       FROM users u LEFT JOIN users cb ON cb.id = u.created_by
       WHERE u.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    // Super-admin cannot view owner details
    if (req.user.role === 'super-admin' && result.rows[0].role === 'owner') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PUT /api/admin/users/:id — edit user ────────────────────
router.put(
  '/:id',
  auth,
  requireRole(['owner', 'super-admin']),
  auditLog('user.edit'),
  async (req, res) => {
    const { name, phone, department, employee_capacity } = req.body;
    try {
      const result = await pool.query(
        `UPDATE users SET name=COALESCE($1,name), phone=COALESCE($2,phone),
         department=COALESCE($3,department), employee_capacity=COALESCE($4,employee_capacity),
         updated_at=NOW()
         WHERE id=$5 RETURNING id,name,email,role,status,phone,department`,
        [name, phone, department, employee_capacity, req.params.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ─── POST /api/admin/users/:id/deactivate ────────────────────
router.post(
  '/:id/deactivate',
  auth,
  requireRole(['owner', 'super-admin']),
  auditLog('user.deactivate'),
  async (req, res) => {
    try {
      const target = await pool.query('SELECT * FROM users WHERE id=$1', [req.params.id]);
      if (target.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      const u = target.rows[0];

      // Super-admin cannot deactivate owner
      if (req.user.role === 'super-admin' && u.role === 'owner') {
        return res.status(403).json({ error: 'Cannot deactivate Owner account' });
      }

      await pool.query(
        `UPDATE users SET status='inactive', deactivated_at=NOW(), deactivated_by=$1 WHERE id=$2`,
        [req.user.id, req.params.id]
      );

      // Get pending tasks for reassignment
      const pendingTasks = await pool.query(
        `SELECT COUNT(*) as cnt FROM staff_tasks WHERE assigned_to=$1 AND status IN ('assigned','in_progress')`,
        [req.params.id]
      );

      // Get content items owned
      const contentItems = await pool.query(
        `SELECT COUNT(*) as cnt FROM content_items WHERE current_owner=$1 AND status NOT IN ('archived')`,
        [req.params.id]
      );

      res.json({
        ok: true,
        message: `Account deactivated. ${u.name} is now marked as Former ${u.role}.`,
        pending_tasks: parseInt(pendingTasks.rows[0].cnt),
        content_items: parseInt(contentItems.rows[0].cnt),
        needs_reassignment: parseInt(pendingTasks.rows[0].cnt) > 0 || parseInt(contentItems.rows[0].cnt) > 0,
      });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ─── POST /api/admin/users/:id/activate ──────────────────────
router.post(
  '/:id/activate',
  auth,
  requireRole(['owner', 'super-admin']),
  auditLog('user.activate'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `UPDATE users SET status='active', deactivated_at=NULL, deactivated_by=NULL WHERE id=$1 RETURNING id,name,status`,
        [req.params.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json({ ok: true, user: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ─── POST /api/admin/users/:id/reset-password ─────────────────
router.post(
  '/:id/reset-password',
  auth,
  requireRole(['owner', 'super-admin']),
  auditLog('user.password_reset'),
  async (req, res) => {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    try {
      const hash = await bcrypt.hash(new_password, 10);
      await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.params.id]);
      res.json({ ok: true, message: 'Password reset successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ─── POST /api/admin/users/bulk-import — bulk student import ──
router.post(
  '/bulk-import',
  auth,
  requireRole(['owner', 'super-admin']),
  auditLog('user.bulk_import'),
  async (req, res) => {
    const { students } = req.body; // [{name, email, exam, mentor_id}]
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'students array is required' });
    }

    const results = { created: [], failed: [] };

    for (const s of students) {
      if (!s.name || !s.email) { results.failed.push({ ...s, reason: 'Missing name/email' }); continue; }
      const tempPassword = Math.random().toString(36).slice(-8);
      try {
        const hash = await bcrypt.hash(tempPassword, 10);
        const u = await pool.query(
          `INSERT INTO users (name,email,password_hash,role,department,created_by)
           VALUES ($1,$2,$3,'student',$4,$5) ON CONFLICT(email) DO NOTHING
           RETURNING id,name,email`,
          [s.name.trim(), s.email.toLowerCase(), hash, s.exam || null, req.user.id]
        );
        if (u.rows.length === 0) { results.failed.push({ ...s, reason: 'Email already exists' }); continue; }

        await pool.query(`INSERT INTO streak_data (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [u.rows[0].id]);

        if (s.mentor_id) {
          await pool.query(
            `INSERT INTO mentor_student_map (mentor_id,student_id,assigned_by,category) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
            [s.mentor_id, u.rows[0].id, req.user.id, s.exam || null]
          );
        }
        results.created.push({ ...u.rows[0], temp_password: tempPassword });
      } catch (e) {
        results.failed.push({ ...s, reason: e.message });
      }
    }

    res.status(201).json({ ok: true, ...results });
  }
);

// ─── GET /api/admin/users/:id/login-history ──────────────────
router.get('/:id/login-history', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, ip_address, user_agent, status, created_at FROM login_history
       WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/admin/users/role-summary ────────────────────────
router.get('/meta/role-summary', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT role, status, COUNT(*) as count FROM users GROUP BY role, status ORDER BY role`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
