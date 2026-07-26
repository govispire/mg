const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// GET /api/students/:id/weak-areas - Get student's weak areas
router.get('/:id/weak-areas', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'student' && parseInt(id) !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (userRole === 'mentor') {
      const { rows: assignment } = await pool.query(
        `SELECT 1 FROM mentor_student_map WHERE mentor_id = $1 AND student_id = $2`,
        [userId, id]
      );
      if (assignment.length === 0) {
        return res.status(403).json({ error: 'Access denied: not your assigned student' });
      }
    }

    const { rows } = await pool.query(
      `SELECT * FROM student_weak_areas WHERE student_id = $1 ORDER BY accuracy_pct ASC, updated_at DESC`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching weak areas:', err);
    res.status(500).json({ error: 'Failed to fetch weak areas' });
  }
});

// POST /api/students/:id/weak-areas - Add/update weak areas
router.post('/:id/weak-areas', auth, requireRole(['owner', 'super-admin', 'mentor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { weak_areas } = req.body;

    if (!Array.isArray(weak_areas) || weak_areas.length === 0) {
      return res.status(400).json({ error: 'weak_areas array is required' });
    }

    const results = [];

    for (const area of weak_areas) {
      const { topic, subject, accuracy_pct, attempt_count, trend, flagged } = area;
      if (!topic) continue;

      const { rows } = await pool.query(
        `INSERT INTO student_weak_areas (student_id, topic, subject, accuracy_pct, attempt_count, trend, flagged)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (student_id, topic) DO NOTHING
         RETURNING *`,
        [id, topic, subject || null, accuracy_pct || 0, attempt_count || 0, trend || 'stable', flagged || false]
      );

      if (rows.length > 0) results.push(rows[0]);
    }

    res.status(201).json(results);
  } catch (err) {
    console.error('Error updating weak areas:', err);
    res.status(500).json({ error: 'Failed to update weak areas' });
  }
});

// POST /api/students/:id/recommendations - Mentor sends recommendation
router.post('/:id/recommendations', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { message, resource_type, resource_id, resource_title, weak_area_id } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO mentor_recommendations (student_id, mentor_id, weak_area_id, message, resource_type, resource_id, resource_title, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [id, req.user.id, weak_area_id || null, message, resource_type || null, resource_id || null, resource_title || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating recommendation:', err);
    res.status(500).json({ error: 'Failed to create recommendation' });
  }
});

// GET /api/students/:id/recommendations - Get student's recommendations
router.get('/:id/recommendations', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    let params;

    if (userRole === 'student') {
      if (parseInt(id) !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    if (userRole === 'mentor') {
      query = `SELECT mr.*, u.name AS mentor_name
               FROM mentor_recommendations mr
               JOIN users u ON mr.mentor_id = u.id
               WHERE mr.student_id = $1 AND mr.mentor_id = $2
               ORDER BY mr.created_at DESC`;
      params = [id, userId];
    } else {
      query = `SELECT mr.*, u.name AS mentor_name
               FROM mentor_recommendations mr
               JOIN users u ON mr.mentor_id = u.id
               WHERE mr.student_id = $1
               ORDER BY mr.created_at DESC`;
      params = [id];
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

module.exports = router;
