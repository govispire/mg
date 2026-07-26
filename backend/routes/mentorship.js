const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// GET /api/mentors - List all active mentors with student counts
router.get('/', auth, async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.department,
        COUNT(msm.student_id) AS student_count
      FROM users u
      LEFT JOIN mentor_student_map msm ON u.id = msm.mentor_id
      WHERE u.role = 'mentor' AND u.status = 'active'
    `;
    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND u.department = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY u.id, u.name, u.email, u.role, u.department ORDER BY u.name`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error listing mentors:', err);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// POST /api/mentors/assign - Assign mentor to student (upsert)
router.post('/assign', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const { mentor_id, student_id, category } = req.body;

    if (!mentor_id || !student_id) {
      return res.status(400).json({ error: 'mentor_id and student_id are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO mentor_student_map (mentor_id, student_id, assigned_by, category)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (mentor_id, student_id)
       DO UPDATE SET category = EXCLUDED.category, assigned_by = EXCLUDED.assigned_by
       RETURNING *`,
      [mentor_id, student_id, req.user.id, category || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error assigning mentor:', err);
    res.status(500).json({ error: 'Failed to assign mentor' });
  }
});

// DELETE /api/mentors/:mentorId/students/:studentId - Unassign
router.delete('/:mentorId/students/:studentId', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const { mentorId, studentId } = req.params;

    const { rows } = await pool.query(
      `DELETE FROM mentor_student_map
       WHERE mentor_id = $1 AND student_id = $2
       RETURNING *`,
      [mentorId, studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ message: 'Student unassigned successfully', assignment: rows[0] });
  } catch (err) {
    console.error('Error unassigning student:', err);
    res.status(500).json({ error: 'Failed to unassign student' });
  }
});

// GET /api/mentors/:id/students - Get mentor's assigned students with stats
router.get('/:id/students', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.department,
        msm.assigned_at, msm.category AS assignment_category,
        COALESCE(swa.weak_area_count, 0) AS weak_area_count,
        COALESCE(swa.avg_accuracy, 0) AS avg_accuracy
      FROM mentor_student_map msm
      JOIN users u ON msm.student_id = u.id
      LEFT JOIN (
        SELECT student_id,
          COUNT(*) AS weak_area_count,
          AVG(accuracy_pct) AS avg_accuracy
        FROM student_weak_areas
        GROUP BY student_id
      ) swa ON u.id = swa.student_id
      WHERE msm.mentor_id = $1
      ORDER BY u.name`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching mentor students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

module.exports = router;
