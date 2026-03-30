const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, target_exam, avatar, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const u = result.rows[0];
    res.json({
      id: u.id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      targetExam: u.target_exam,
      avatar: u.avatar,
    });
  } catch (err) {
    console.error('GET /me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/me
router.put('/me', auth, async (req, res) => {
  const { name, avatar, targetExam } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           avatar = COALESCE($2, avatar),
           target_exam = COALESCE($3, target_exam)
       WHERE id = $4
       RETURNING id, name, email, role, target_exam, avatar`,
      [name, avatar, targetExam, req.user.id]
    );

    const u = result.rows[0];
    res.json({
      id: u.id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      targetExam: u.target_exam,
      avatar: u.avatar,
    });
  } catch (err) {
    console.error('PUT /me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
