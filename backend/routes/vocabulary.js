const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// GET /api/vocabulary - List vocabulary words with filters
router.get('/', async (req, res) => {
  try {
    const { difficulty, category, search, limit = 20, offset = 0 } = req.query;

    let query = 'SELECT * FROM vocabulary_words WHERE is_active = true';
    let countQuery = 'SELECT COUNT(*) FROM vocabulary_words WHERE is_active = true';
    const params = [];
    const countParams = [];
    let paramIndex = 1;
    let countParamIndex = 1;

    if (difficulty) {
      query += ` AND difficulty = $${paramIndex}`;
      countQuery += ` AND difficulty = $${countParamIndex}`;
      params.push(difficulty);
      countParams.push(difficulty);
      paramIndex++;
      countParamIndex++;
    }

    if (category) {
      query += ` AND category = $${paramIndex}`;
      countQuery += ` AND category = $${countParamIndex}`;
      params.push(category);
      countParams.push(category);
      paramIndex++;
      countParamIndex++;
    }

    if (search) {
      query += ` AND (word ILIKE $${paramIndex} OR definition ILIKE $${paramIndex})`;
      countQuery += ` AND (word ILIKE $${countParamIndex} OR definition ILIKE $${countParamIndex})`;
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
      paramIndex++;
      countParamIndex++;
    }

    query += ` ORDER BY word ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const [wordsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    res.json({
      words: wordsResult.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (err) {
    console.error('Error listing vocabulary:', err);
    res.status(500).json({ error: 'Failed to fetch vocabulary' });
  }
});

// GET /api/vocabulary/categories - Get distinct categories with word counts
router.get('/categories', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT category, COUNT(*) AS word_count
       FROM vocabulary_words
       WHERE is_active = true AND category IS NOT NULL
       GROUP BY category
       ORDER BY word_count DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/vocabulary/progress - Get current user's progress
router.get('/progress', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT vp.*, vw.word, vw.definition, vw.difficulty, vw.category
       FROM vocabulary_progress vp
       JOIN vocabulary_words vw ON vp.word_id = vw.id
       WHERE vp.user_id = $1
       ORDER BY vp.last_reviewed_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// POST /api/vocabulary/progress - Update word progress
router.post('/progress', auth, async (req, res) => {
  try {
    const { word_id, correct } = req.body;

    if (!word_id || correct === undefined) {
      return res.status(400).json({ error: 'word_id and correct are required' });
    }

    const { rows: existing } = await pool.query(
      `SELECT * FROM vocabulary_progress WHERE user_id = $1 AND word_id = $2`,
      [req.user.id, word_id]
    );

    let mastery_level = 'new';
    let correct_count = 0;
    let incorrect_count = 0;

    if (existing.length > 0) {
      const prev = existing[0];
      correct_count = prev.correct_count + (correct ? 1 : 0);
      incorrect_count = prev.incorrect_count + (correct ? 0 : 1);

      if (correct_count >= 10 && incorrect_count <= 2) {
        mastery_level = 'mastered';
      } else if (correct_count >= 5) {
        mastery_level = 'review';
      } else if (correct_count >= 1 || incorrect_count >= 1) {
        mastery_level = 'learning';
      } else {
        mastery_level = 'new';
      }
    } else {
      correct_count = correct ? 1 : 0;
      incorrect_count = correct ? 0 : 1;
      mastery_level = correct ? 'learning' : 'new';
    }

    const nextReviewIntervals = {
      new: '1 day',
      learning: '3 days',
      review: '7 days',
      mastered: '30 days'
    };

    const { rows } = await pool.query(
      `INSERT INTO vocabulary_progress (user_id, word_id, mastery_level, correct_count, incorrect_count, next_review_at, last_reviewed_at)
       VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '${nextReviewIntervals[mastery_level]}', NOW())
       ON CONFLICT (user_id, word_id)
       DO UPDATE SET
         mastery_level = $3,
         correct_count = $4,
         incorrect_count = $5,
         next_review_at = NOW() + INTERVAL '${nextReviewIntervals[mastery_level]}',
         last_reviewed_at = NOW()
       RETURNING *`,
      [req.user.id, word_id, mastery_level, correct_count, incorrect_count]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating progress:', err);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// GET /api/vocabulary/practice - Get practice set for user
router.get('/practice', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT vw.*, vp.mastery_level, vp.correct_count, vp.incorrect_count, vp.next_review_at
       FROM vocabulary_words vw
       LEFT JOIN vocabulary_progress vp ON vw.id = vp.word_id AND vp.user_id = $1
       WHERE vw.is_active = true
         AND (vp.word_id IS NULL OR vp.mastery_level = 'new' OR vp.next_review_at <= NOW())
       ORDER BY
         CASE
           WHEN vp.word_id IS NULL THEN 0
           WHEN vp.mastery_level = 'new' THEN 1
           WHEN vp.mastery_level = 'learning' THEN 2
           WHEN vp.mastery_level = 'review' THEN 3
           ELSE 4
         END,
         RANDOM()
       LIMIT 20`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching practice set:', err);
    res.status(500).json({ error: 'Failed to fetch practice set' });
  }
});

// POST /api/vocabulary/words - Create word
router.post('/words', auth, requireRole(['owner', 'super-admin', 'employee']), async (req, res) => {
  try {
    const { word, definition, example, difficulty, category, synonyms, antonyms, pronunciation } = req.body;

    if (!word || !definition) {
      return res.status(400).json({ error: 'word and definition are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO vocabulary_words (word, definition, example, difficulty, category, synonyms, antonyms, pronunciation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [word, definition, example || null, difficulty || 'medium', category || null,
       synonyms ? JSON.stringify(synonyms) : '[]',
       antonyms ? JSON.stringify(antonyms) : '[]',
       pronunciation || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating word:', err);
    res.status(500).json({ error: 'Failed to create word' });
  }
});

// PUT /api/vocabulary/words/:id - Update word
router.put('/words/:id', auth, requireRole(['owner', 'super-admin', 'employee']), async (req, res) => {
  try {
    const { id } = req.params;
    const { word, definition, example, difficulty, category, synonyms, antonyms, pronunciation, is_active } = req.body;

    const { rows } = await pool.query(
      `UPDATE vocabulary_words SET
         word = COALESCE($1, word),
         definition = COALESCE($2, definition),
         example = COALESCE($3, example),
         difficulty = COALESCE($4, difficulty),
         category = COALESCE($5, category),
         synonyms = COALESCE($6, synonyms),
         antonyms = COALESCE($7, antonyms),
         pronunciation = COALESCE($8, pronunciation),
         is_active = COALESCE($9, is_active)
       WHERE id = $10
       RETURNING *`,
      [word || null, definition || null, example || null, difficulty || null, category || null,
       synonyms ? JSON.stringify(synonyms) : null,
       antonyms ? JSON.stringify(antonyms) : null,
       pronunciation || null,
       is_active !== undefined ? is_active : null,
       id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Word not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating word:', err);
    res.status(500).json({ error: 'Failed to update word' });
  }
});

// DELETE /api/vocabulary/words/:id - Delete word (soft delete)
router.delete('/words/:id', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `UPDATE vocabulary_words SET is_active = false WHERE id = $1 RETURNING *`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Word not found' });
    }

    res.json({ message: 'Word deleted successfully', word: rows[0] });
  } catch (err) {
    console.error('Error deleting word:', err);
    res.status(500).json({ error: 'Failed to delete word' });
  }
});

module.exports = router;
