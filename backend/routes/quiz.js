const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// ── Quiz Results ──────────────────────────────────────────────

// GET /api/quiz/results
router.get('/results', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, quiz_id, date, score, total_questions, percentage,
              time_taken, time_per_question, topic_accuracy, subject_accuracy, answers
       FROM quiz_results
       WHERE user_id = $1
       ORDER BY date DESC
       LIMIT 100`,
      [req.user.id]
    );

    const results = result.rows.map(r => ({
      id: `quiz_${r.id}`,
      quizId: r.quiz_id,
      date: r.date,
      score: r.score,
      totalQuestions: r.total_questions,
      percentage: parseFloat(r.percentage),
      timeTaken: r.time_taken,
      timePerQuestion: r.time_per_question || [],
      topicAccuracy: r.topic_accuracy || {},
      subjectAccuracy: r.subject_accuracy || {},
      answers: r.answers || [],
    }));

    res.json(results);
  } catch (err) {
    console.error('GET /quiz/results error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/quiz/results
router.post('/results', auth, async (req, res) => {
  const {
    quizId, date, score, totalQuestions, percentage,
    timeTaken, timePerQuestion, topicAccuracy, subjectAccuracy, answers,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO quiz_results
         (user_id, quiz_id, date, score, total_questions, percentage,
          time_taken, time_per_question, topic_accuracy, subject_accuracy, answers)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id, date`,
      [
        req.user.id,
        quizId || null,
        date || new Date(),
        score || 0,
        totalQuestions || 0,
        percentage || 0,
        timeTaken || 0,
        JSON.stringify(timePerQuestion || []),
        JSON.stringify(topicAccuracy || {}),
        JSON.stringify(subjectAccuracy || {}),
        JSON.stringify(answers || []),
      ]
    );

    res.status(201).json({ id: `quiz_${result.rows[0].id}`, date: result.rows[0].date });
  } catch (err) {
    console.error('POST /quiz/results error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Streak Data ───────────────────────────────────────────────

// GET /api/quiz/streak
router.get('/streak', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM streak_data WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      // Auto-init
      await pool.query(
        'INSERT INTO streak_data (user_id) VALUES ($1) ON CONFLICT DO NOTHING',
        [req.user.id]
      );
      return res.json({
        currentStreak: 0, longestStreak: 0, lastQuizDate: null,
        totalQuizzesTaken: 0, totalPoints: 0, unlockedRewards: [],
        dailyGoalCompleted: false,
      });
    }

    const s = result.rows[0];
    res.json({
      currentStreak: s.current_streak,
      longestStreak: s.longest_streak,
      lastQuizDate: s.last_quiz_date,
      totalQuizzesTaken: s.total_quizzes_taken,
      totalPoints: s.total_points,
      unlockedRewards: s.unlocked_rewards || [],
      dailyGoalCompleted: s.daily_goal_completed,
    });
  } catch (err) {
    console.error('GET /quiz/streak error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/quiz/streak
router.put('/streak', auth, async (req, res) => {
  const {
    currentStreak, longestStreak, lastQuizDate,
    totalQuizzesTaken, totalPoints, unlockedRewards, dailyGoalCompleted,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO streak_data
         (user_id, current_streak, longest_streak, last_quiz_date,
          total_quizzes_taken, total_points, unlocked_rewards, daily_goal_completed, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         current_streak = EXCLUDED.current_streak,
         longest_streak = EXCLUDED.longest_streak,
         last_quiz_date = EXCLUDED.last_quiz_date,
         total_quizzes_taken = EXCLUDED.total_quizzes_taken,
         total_points = EXCLUDED.total_points,
         unlocked_rewards = EXCLUDED.unlocked_rewards,
         daily_goal_completed = EXCLUDED.daily_goal_completed,
         updated_at = NOW()`,
      [
        req.user.id,
        currentStreak || 0,
        longestStreak || 0,
        lastQuizDate || null,
        totalQuizzesTaken || 0,
        totalPoints || 0,
        JSON.stringify(unlockedRewards || []),
        dailyGoalCompleted || false,
      ]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /quiz/streak error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Quiz Completions ──────────────────────────────────────────

// GET /api/quiz/completions
router.get('/completions', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT quiz_id, completed, score, date, duration
       FROM quiz_completions WHERE user_id = $1`,
      [req.user.id]
    );

    // Return as a map matching the existing localStorage format
    const map = {};
    result.rows.forEach(r => {
      map[r.quiz_id] = {
        completed: r.completed,
        score: parseFloat(r.score),
        date: r.date,
        duration: r.duration,
      };
    });

    res.json(map);
  } catch (err) {
    console.error('GET /quiz/completions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/quiz/completions
router.post('/completions', auth, async (req, res) => {
  const { quizId, completed = true, score = 0, date, duration = 15 } = req.body;

  if (!quizId) {
    return res.status(400).json({ error: 'quizId is required' });
  }

  try {
    await pool.query(
      `INSERT INTO quiz_completions (user_id, quiz_id, completed, score, date, duration)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (user_id, quiz_id) DO UPDATE SET
         completed = EXCLUDED.completed,
         score = EXCLUDED.score,
         date = EXCLUDED.date,
         duration = EXCLUDED.duration`,
      [req.user.id, quizId, completed, score, date || new Date(), duration]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('POST /quiz/completions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
