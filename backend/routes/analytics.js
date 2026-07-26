const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// GET /api/analytics/quiz-performance - Get aggregated quiz stats for current user
router.get('/quiz-performance', auth, async (req, res) => {
  try {
    const statsResult = await pool.query(
      `SELECT
         COUNT(*)::int AS total_quizzes,
         COALESCE(AVG(percentage), 0)::numeric(5,2) AS avg_score,
         COALESCE(AVG(percentage), 0)::numeric(5,2) AS avg_accuracy,
         COALESCE(MAX(percentage), 0)::numeric(5,2) AS best_score
       FROM quiz_results
       WHERE user_id = $1`,
      [req.user.id]
    );

    const subjectResult = await pool.query(
      `SELECT
         key AS subject,
         AVG(value::numeric)::numeric(5,2) AS accuracy
       FROM quiz_results,
            jsonb_each_text(subject_accuracy) AS t(key, value)
       WHERE user_id = $1
       GROUP BY key
       ORDER BY accuracy DESC`,
      [req.user.id]
    );

    const topicResult = await pool.query(
      `SELECT
         key AS topic,
         AVG(value::numeric)::numeric(5,2) AS accuracy
       FROM quiz_results,
            jsonb_each_text(topic_accuracy) AS t(key, value)
       WHERE user_id = $1
       GROUP BY key
       ORDER BY accuracy DESC`,
      [req.user.id]
    );

    const trendResult = await pool.query(
      `SELECT id, quiz_id, date, score, percentage
       FROM quiz_results
       WHERE user_id = $1
       ORDER BY date DESC
       LIMIT 10`,
      [req.user.id]
    );

    const stats = statsResult.rows[0];

    res.json({
      total_quizzes: stats.total_quizzes,
      avg_score: parseFloat(stats.avg_score),
      avg_accuracy: parseFloat(stats.avg_accuracy),
      best_score: parseFloat(stats.best_score),
      subject_accuracy: subjectResult.rows,
      topic_accuracy: topicResult.rows,
      score_trend: trendResult.rows,
    });
  } catch (err) {
    console.error('GET /analytics/quiz-performance error:', err);
    res.status(500).json({ error: 'Failed to fetch quiz performance' });
  }
});

// GET /api/analytics/study-time - Get study time by day/week/month
router.get('/study-time', auth, async (req, res) => {
  const { period = 'week' } = req.query;

  let interval;
  if (period === 'day') {
    interval = '7 days';
  } else if (period === 'month') {
    interval = '30 days';
  } else {
    interval = '7 weeks';
  }

  try {
    let query;
    if (period === 'month') {
      query = `
        SELECT
          date_trunc('day', date)::date AS period_date,
          COALESCE(SUM(time_taken), 0)::int AS total_time
        FROM quiz_results
        WHERE user_id = $1 AND date >= NOW() - INTERVAL '${interval}'
        GROUP BY date_trunc('day', date)
        ORDER BY period_date ASC`;
    } else if (period === 'week') {
      query = `
        SELECT
          date_trunc('week', date)::date AS period_date,
          COALESCE(SUM(time_taken), 0)::int AS total_time
        FROM quiz_results
        WHERE user_id = $1 AND date >= NOW() - INTERVAL '${interval}'
        GROUP BY date_trunc('week', date)
        ORDER BY period_date ASC`;
    } else {
      query = `
        SELECT
          date::date AS period_date,
          COALESCE(SUM(time_taken), 0)::int AS total_time
        FROM quiz_results
        WHERE user_id = $1 AND date >= NOW() - INTERVAL '${interval}'
        GROUP BY date::date
        ORDER BY period_date ASC`;
    }

    const result = await pool.query(query, [req.user.id]);

    res.json({ period, data: result.rows });
  } catch (err) {
    console.error('GET /analytics/study-time error:', err);
    res.status(500).json({ error: 'Failed to fetch study time' });
  }
});

// GET /api/analytics/progress - Get progress over time (last 12 weeks)
router.get('/progress', auth, async (req, res) => {
  try {
    const quizResult = await pool.query(
      `SELECT
         date_trunc('week', date)::date AS week_start,
         COUNT(*)::int AS quizzes_taken,
         COALESCE(AVG(percentage), 0)::numeric(5,2) AS avg_score
       FROM quiz_results
       WHERE user_id = $1 AND date >= NOW() - INTERVAL '12 weeks'
       GROUP BY date_trunc('week', date)
       ORDER BY week_start ASC`,
      [req.user.id]
    );

    const streakResult = await pool.query(
      `SELECT
         date_trunc('week', date)::date AS week_start,
         COUNT(*)::int AS active_days
       FROM daily_presence
       WHERE user_id = $1 AND date >= NOW() - INTERVAL '12 weeks'
       GROUP BY date_trunc('week', date)
       ORDER BY week_start ASC`,
      [req.user.id]
    );

    const streakMap = {};
    streakResult.rows.forEach(r => {
      streakMap[r.week_start] = r.active_days;
    });

    const weeks = quizResult.rows.map(q => ({
      week_start: q.week_start,
      quizzes_taken: q.quizzes_taken,
      avg_score: parseFloat(q.avg_score),
      active_days: streakMap[q.week_start] || 0,
    }));

    res.json({ weeks });
  } catch (err) {
    console.error('GET /analytics/progress error:', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// GET /api/analytics/admin/overview - Admin dashboard
router.get('/admin/overview', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const [totalStudents, quizzesToday, activeThisWeek, roleDistribution, completionRate] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'student'`),
      pool.query(`SELECT COUNT(*)::int AS count FROM quiz_results WHERE date::date = CURRENT_DATE`),
      pool.query(`SELECT COUNT(DISTINCT user_id)::int AS count FROM daily_presence WHERE date >= CURRENT_DATE - INTERVAL '7 days'`),
      pool.query(`SELECT role, COUNT(*)::int AS count FROM users GROUP BY role ORDER BY count DESC`),
      pool.query(
        `SELECT
           CASE WHEN total > 0 THEN ROUND((completed::numeric / total) * 100, 1) ELSE 0 END AS rate
         FROM (
           SELECT
             (SELECT COUNT(*)::int FROM quiz_completions WHERE user_id IN (SELECT id FROM users WHERE role = 'student')) AS total,
             (SELECT COUNT(*)::int FROM quiz_completions WHERE completed = true AND user_id IN (SELECT id FROM users WHERE role = 'student')) AS completed
         ) sub`
      ),
    ]);

    res.json({
      total_students: totalStudents.rows[0].count,
      quizzes_taken_today: quizzesToday.rows[0].count,
      active_users_this_week: activeThisWeek.rows[0].count,
      role_distribution: roleDistribution.rows,
      quiz_completion_rate: parseFloat(completionRate.rows[0].rate),
    });
  } catch (err) {
    console.error('GET /analytics/admin/overview error:', err);
    res.status(500).json({ error: 'Failed to fetch admin overview' });
  }
});

// GET /api/analytics/mentor/:mentorId/students - Mentor's student analytics
router.get('/mentor/:mentorId/students', auth, async (req, res) => {
  const { mentorId } = req.params;

  try {
    const result = await pool.query(
      `SELECT
         u.id, u.name, u.email,
         COUNT(qr.id)::int AS total_quizzes,
         COALESCE(AVG(qr.percentage), 0)::numeric(5,2) AS avg_score,
         COALESCE(MAX(qr.percentage), 0)::numeric(5,2) AS best_score,
         COALESCE(sd.current_streak, 0) AS current_streak,
         COALESCE(sd.total_points, 0) AS total_points
       FROM users u
       LEFT JOIN quiz_results qr ON qr.user_id = u.id
       LEFT JOIN streak_data sd ON sd.user_id = u.id
       WHERE u.mentor_id = $1
       GROUP BY u.id, u.name, u.email, sd.current_streak, sd.total_points
       ORDER BY avg_score DESC`,
      [mentorId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('GET /analytics/mentor/:mentorId/students error:', err);
    res.status(500).json({ error: 'Failed to fetch mentor student analytics' });
  }
});

module.exports = router;
