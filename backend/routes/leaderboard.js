const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/leaderboard/global - Global ranking by total_points
router.get('/global', auth, async (req, res) => {
  try {
    const topResult = await pool.query(
      `SELECT
         u.id, u.name, u.avatar,
         COALESCE(sd.total_points, 0) AS total_points,
         COALESCE(sd.current_streak, 0) AS current_streak,
         COALESCE(sd.total_quizzes_taken, 0) AS total_quizzes_taken
       FROM users u
       JOIN streak_data sd ON sd.user_id = u.id
       ORDER BY sd.total_points DESC
       LIMIT 50`
    );

    const rankResult = await pool.query(
      `SELECT COUNT(*)::int + 1 AS rank
       FROM users u
       JOIN streak_data sd ON sd.user_id = u.id
       WHERE sd.total_points > (
         SELECT COALESCE(total_points, 0) FROM streak_data WHERE user_id = $1
       )`,
      [req.user.id]
    );

    res.json({
      leaderboard: topResult.rows.map((r, i) => ({ rank: i + 1, ...r })),
      user_rank: rankResult.rows[0].rank,
    });
  } catch (err) {
    console.error('GET /leaderboard/global error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/leaderboard/quiz/:quizId - Per-quiz leaderboard
router.get('/quiz/:quizId', auth, async (req, res) => {
  const { quizId } = req.params;

  try {
    const topResult = await pool.query(
      `SELECT
         u.id, u.name, u.avatar,
         qc.score,
         qc.duration,
         qc.date
       FROM quiz_completions qc
       JOIN users u ON u.id = qc.user_id
       WHERE qc.quiz_id = $1 AND qc.completed = true
       ORDER BY qc.score DESC, qc.duration ASC
       LIMIT 50`,
      [quizId]
    );

    const rankResult = await pool.query(
      `SELECT COUNT(*)::int + 1 AS rank
       FROM quiz_completions
       WHERE quiz_id = $1 AND completed = true
         AND (score > (SELECT score FROM quiz_completions WHERE user_id = $2 AND quiz_id = $1 AND completed = true LIMIT 1)
              OR (score = (SELECT score FROM quiz_completions WHERE user_id = $2 AND quiz_id = $1 AND completed = true LIMIT 1)
                  AND duration < (SELECT duration FROM quiz_completions WHERE user_id = $2 AND quiz_id = $1 AND completed = true LIMIT 1)))`,
      [quizId, req.user.id]
    );

    res.json({
      leaderboard: topResult.rows.map((r, i) => ({ rank: i + 1, ...r })),
      user_rank: rankResult.rows[0].rank,
    });
  } catch (err) {
    console.error('GET /leaderboard/quiz/:quizId error:', err);
    res.status(500).json({ error: 'Failed to fetch quiz leaderboard' });
  }
});

module.exports = router;
