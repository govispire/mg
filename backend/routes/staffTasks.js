const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const auditLog = require('../middleware/auditLogger');
const { validate, createStaffTaskSchema, updateStaffTaskStatusSchema, addCommentSchema } = require('../middleware/validation');

const router = express.Router();

// ─── Permission helpers ───────────────────────────────────────
const canAssign = (role) => ['owner', 'super-admin'].includes(role);
const canViewAll = (role) => ['owner', 'super-admin'].includes(role);

// ─── GET /api/staff-tasks — list tasks ───────────────────────
// Owner/Superadmin: all tasks | Employee/Mentor: own tasks only
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, category, assigned_to, date_filter } = req.query;

    let baseQuery = `
      SELECT st.*,
             ab.name AS assigned_by_name, ab.role AS assigned_by_role,
             at2.name AS assigned_to_name, at2.role AS assigned_to_role
      FROM staff_tasks st
      JOIN users ab  ON ab.id  = st.assigned_by
      JOIN users at2 ON at2.id = st.assigned_to
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    // Non-admin users see only their own tasks
    if (!canViewAll(req.user.role)) {
      baseQuery += ` AND st.assigned_to = $${idx++}`;
      params.push(req.user.id);
    } else if (assigned_to) {
      baseQuery += ` AND st.assigned_to = $${idx++}`;
      params.push(assigned_to);
    }

    if (status)   { baseQuery += ` AND st.status = $${idx++}`;   params.push(status); }
    if (priority) { baseQuery += ` AND st.priority = $${idx++}`; params.push(priority); }
    if (category) { baseQuery += ` AND st.category = $${idx++}`; params.push(category); }

    if (date_filter === 'today') {
      baseQuery += ` AND st.due_date::date = CURRENT_DATE`;
    } else if (date_filter === 'this_week') {
      baseQuery += ` AND st.due_date >= date_trunc('week', NOW()) AND st.due_date < date_trunc('week', NOW()) + interval '7 days'`;
    } else if (date_filter === 'overdue') {
      baseQuery += ` AND st.due_date < NOW() AND st.status NOT IN ('completed')`;
    }

    baseQuery += ` ORDER BY
      CASE st.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
      st.due_date ASC NULLS LAST`;

    const result = await pool.query(baseQuery, params);

    // Summary stats
    const tasks = result.rows;
    const summary = {
      total: tasks.length,
      assigned: tasks.filter(t => t.status === 'assigned').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      blocked: tasks.filter(t => t.status === 'blocked').length,
      overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length,
    };

    res.json({ tasks, summary });
  } catch (err) {
    console.error('GET /staff-tasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/staff-tasks — assign a task ───────────────────
router.post(
  '/',
  auth,
  requireRole(['owner', 'super-admin']),
  validate(createStaffTaskSchema),
  auditLog('task.assign', { resourceType: 'task' }),
  async (req, res) => {
    const { title, description, assigned_to, category, priority, due_date } = req.body;

    try {
      // Validate assignee exists and is employee/mentor
      const assignee = await pool.query('SELECT id, name, role FROM users WHERE id=$1 AND status=$2', [assigned_to, 'active']);
      if (assignee.rows.length === 0) {
        return res.status(404).json({ error: 'Assignee not found or inactive' });
      }
      if (!['employee', 'mentor'].includes(assignee.rows[0].role)) {
        return res.status(400).json({ error: 'Tasks can only be assigned to employees or mentors' });
      }

      const result = await pool.query(
        `INSERT INTO staff_tasks (title, description, assigned_by, assigned_to, assignee_role, category, priority, due_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [title, description || null, req.user.id, assigned_to, assignee.rows[0].role,
         category || null, priority || 'medium', due_date || null]
      );

      const task = result.rows[0];

      // Log the assignment
      await pool.query(
        `INSERT INTO staff_task_logs (task_id, actor_id, action, new_value)
         VALUES ($1,$2,'task_assigned',$3)`,
        [task.id, req.user.id, `Assigned to ${assignee.rows[0].name}`]
      );

      // Notify the assignee
      await pool.query(
        `INSERT INTO notifications (user_id, title, body, type, link) VALUES ($1,$2,$3,'task',$4)`,
        [
          assigned_to,
          `New Task: ${title}`,
          `Priority: ${priority || 'medium'} | Due: ${due_date ? new Date(due_date).toLocaleDateString('en-IN') : 'No deadline'}`,
          `/employee/my-tasks`,
        ]
      );

      res.status(201).json(task);
    } catch (err) {
      console.error('POST /staff-tasks error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ─── GET /api/staff-tasks/:id — single task with logs ────────
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await pool.query(
      `SELECT st.*, ab.name AS assigned_by_name, at2.name AS assigned_to_name
       FROM staff_tasks st
       JOIN users ab  ON ab.id  = st.assigned_by
       JOIN users at2 ON at2.id = st.assigned_to
       WHERE st.id=$1`,
      [req.params.id]
    );
    if (task.rows.length === 0) return res.status(404).json({ error: 'Task not found' });

    const t = task.rows[0];
    // Employees/mentors can only see their own tasks
    if (!canViewAll(req.user.role) && t.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const logs = await pool.query(
      `SELECT stl.*, u.name AS actor_name, u.role AS actor_role
       FROM staff_task_logs stl JOIN users u ON u.id = stl.actor_id
       WHERE stl.task_id=$1 ORDER BY stl.created_at ASC`,
      [req.params.id]
    );

    res.json({ task: t, logs: logs.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PUT /api/staff-tasks/:id — update task (admin) ──────────
router.put(
  '/:id',
  auth,
  requireRole(['owner', 'super-admin']),
  auditLog('task.edit'),
  async (req, res) => {
    const { title, description, priority, due_date, category } = req.body;
    try {
      const result = await pool.query(
        `UPDATE staff_tasks SET
           title=COALESCE($1,title), description=COALESCE($2,description),
           priority=COALESCE($3,priority), due_date=COALESCE($4,due_date),
           category=COALESCE($5,category), updated_at=NOW()
         WHERE id=$6 RETURNING *`,
        [title, description, priority, due_date, category, req.params.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ─── PATCH /api/staff-tasks/:id/status — update status (employee/mentor) ──
router.patch('/:id/status', auth, validate(updateStaffTaskStatusSchema), async (req, res) => {
  const { status, comment, proof_url, extension_reason } = req.body;

  try {
    // Find task and check ownership
    const task = await pool.query('SELECT * FROM staff_tasks WHERE id=$1', [req.params.id]);
    if (task.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    const t = task.rows[0];

    if (!canViewAll(req.user.role) && t.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Can only update your own tasks' });
    }

    const oldStatus = t.status;
    const updates = { status, updated_at: 'NOW()' };
    if (status === 'completed') updates.completed_at = new Date().toISOString();
    if (proof_url) updates.proof_url = proof_url;
    if (extension_reason) { updates.extension_requested = true; updates.extension_reason = extension_reason; }

    const result = await pool.query(
      `UPDATE staff_tasks SET
         status=$1, updated_at=NOW(),
         completed_at=CASE WHEN $1='completed' THEN NOW() ELSE completed_at END,
         proof_url=COALESCE($2,proof_url),
         extension_requested=CASE WHEN $3 IS NOT NULL THEN TRUE ELSE extension_requested END,
         extension_reason=COALESCE($3,extension_reason)
       WHERE id=$4 RETURNING *`,
      [status, proof_url || null, extension_reason || null, req.params.id]
    );

    // Log the status change
    await pool.query(
      `INSERT INTO staff_task_logs (task_id, actor_id, action, old_value, new_value, comment)
       VALUES ($1,$2,'status_changed',$3,$4,$5)`,
      [req.params.id, req.user.id, oldStatus, status, comment || null]
    );

    // Notify assigner if task completed/blocked
    if (['completed', 'blocked'].includes(status)) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, body, type, link) VALUES ($1,$2,$3,$4,$5)`,
        [
          t.assigned_by,
          `Task "${t.title}" — ${status.toUpperCase()}`,
          `Updated by the assignee. ${comment || ''}`,
          status === 'completed' ? 'info' : 'warning',
          `/super-admin/task-manager`,
        ]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PATCH /staff-tasks/:id/status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/staff-tasks/:id/comment — add comment ────────
router.post('/:id/comment', auth, validate(addCommentSchema), async (req, res) => {
  const { comment } = req.body;

  try {
    const task = await pool.query('SELECT * FROM staff_tasks WHERE id=$1', [req.params.id]);
    if (task.rows.length === 0) return res.status(404).json({ error: 'Task not found' });

    if (!canViewAll(req.user.role) && task.rows[0].assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const log = await pool.query(
      `INSERT INTO staff_task_logs (task_id, actor_id, action, comment)
       VALUES ($1,$2,'comment_added',$3) RETURNING *`,
      [req.params.id, req.user.id, comment]
    );
    res.status(201).json(log.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE /api/staff-tasks/:id — delete task (admin only) ──
router.delete(
  '/:id',
  auth,
  requireRole(['owner', 'super-admin']),
  auditLog('task.delete'),
  async (req, res) => {
    try {
      const result = await pool.query('DELETE FROM staff_tasks WHERE id=$1 RETURNING id', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ─── GET /api/staff-tasks/performance/:userId ────────────────
router.get('/performance/:userId', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE status='completed') as completed,
         COUNT(*) FILTER (WHERE status IN ('assigned','in_progress') AND due_date < NOW()) as overdue,
         AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/86400) FILTER (WHERE status='completed') as avg_days
       FROM staff_tasks WHERE assigned_to=$1`,
      [req.params.userId]
    );
    const r = result.rows[0];
    const total = parseInt(r.total) || 0;
    const completed = parseInt(r.completed) || 0;
    res.json({
      total,
      completed,
      overdue: parseInt(r.overdue) || 0,
      completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avg_completion_days: r.avg_days ? parseFloat(r.avg_days).toFixed(1) : null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
