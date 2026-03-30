const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/presence  — mark today as active
router.post('/', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    await pool.query(
      `INSERT INTO daily_presence (user_id, date) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user.id, today]
    );

    res.json({ ok: true, date: today });
  } catch (err) {
    console.error('POST /presence error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/presence  — get all active dates for this user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT date FROM daily_presence WHERE user_id = $1 ORDER BY date DESC`,
      [req.user.id]
    );

    // Return as a map { "YYYY-MM-DD": true } matching the old localStorage format
    const presenceMap = {};
    result.rows.forEach(r => {
      presenceMap[r.date] = true;
    });

    res.json(presenceMap);
  } catch (err) {
    console.error('GET /presence error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
