const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// GET /api/quizzes/categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(q.id)::int AS quiz_count
      FROM quiz_categories c
      LEFT JOIN quizzes q ON q.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching quiz categories:', err);
    res.status(500).json({ error: 'Failed to fetch quiz categories' });
  }
});

// GET /api/quizzes
router.get('/', async (req, res) => {
  try {
    const {
      type,
      category_id,
      subject,
      difficulty,
      is_free,
      search,
      limit = 20,
      offset = 0,
    } = req.query;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (type) {
      conditions.push(`q.type = $${idx++}`);
      values.push(type);
    }
    if (category_id) {
      conditions.push(`q.category_id = $${idx++}`);
      values.push(category_id);
    }
    if (subject) {
      conditions.push(`q.subject = $${idx++}`);
      values.push(subject);
    }
    if (difficulty) {
      conditions.push(`q.difficulty = $${idx++}`);
      values.push(difficulty);
    }
    if (is_free !== undefined) {
      conditions.push(`q.is_free = $${idx++}`);
      values.push(is_free === 'true');
    }
    if (search) {
      conditions.push(`(q.title ILIKE $${idx} OR q.description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM quizzes q ${whereClause}`,
      values
    );
    const total = countResult.rows[0].total;

    const lim = Math.min(Number(limit), 100);
    const off = Number(offset);

    values.push(lim);
    values.push(off);

    const result = await pool.query(
      `SELECT q.*, c.name AS category_name
       FROM quizzes q
       LEFT JOIN quiz_categories c ON c.id = q.category_id
       ${whereClause}
       ORDER BY q.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values
    );

    res.json({ quizzes: result.rows, total });
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// GET /api/quizzes/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const quizResult = await pool.query(
      `SELECT q.*, c.name AS category_name
       FROM quizzes q
       LEFT JOIN quiz_categories c ON c.id = q.category_id
       WHERE q.id = $1`,
      [id]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = quizResult.rows[0];

    const questionsResult = await pool.query(
      `SELECT id, quiz_id, question_text, question_type, options,
              explanation, difficulty, subject, topic, marks,
              negative_marks, order_index, sets, created_at
       FROM quiz_questions
       WHERE quiz_id = $1
       ORDER BY order_index ASC, created_at ASC`,
      [id]
    );

    res.json({ ...quiz, questions: questionsResult.rows });
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// POST /api/quizzes
router.post('/', auth, requireRole(['owner', 'super-admin', 'employee']), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      title,
      description,
      type,
      category_id,
      subject,
      total_questions,
      duration_minutes,
      max_score,
      difficulty,
      exam_type,
      is_published,
      is_free,
      metadata,
    } = req.body;

    if (!title || !type) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'title and type are required' });
    }

    const quizResult = await client.query(
      `INSERT INTO quizzes
         (title, description, type, category_id, subject, total_questions,
          duration_minutes, max_score, difficulty, exam_type, is_published,
          is_free, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        title,
        description || null,
        type,
        category_id || null,
        subject || null,
        total_questions || 0,
        duration_minutes || null,
        max_score || 0,
        difficulty || 'medium',
        exam_type || null,
        is_published !== undefined ? is_published : false,
        is_free !== undefined ? is_free : false,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );

    const quiz = quizResult.rows[0];

    if (metadata && Array.isArray(metadata.questions) && metadata.questions.length > 0) {
      for (let i = 0; i < metadata.questions.length; i++) {
        const q = metadata.questions[i];
        await client.query(
          `INSERT INTO quiz_questions
             (quiz_id, question_text, question_type, options, correct_answers,
              explanation, difficulty, subject, topic, marks, negative_marks,
              order_index, sets)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [
            quiz.id,
            q.question_text,
            q.question_type || 'mcq',
            JSON.stringify(q.options || []),
            JSON.stringify(q.correct_answers || []),
            q.explanation || null,
            q.difficulty || 'medium',
            q.subject || null,
            q.topic || null,
            q.marks || 1,
            q.negative_marks || 0,
            i + 1,
            q.sets ? JSON.stringify(q.sets) : null,
          ]
        );
      }

      await client.query(
        `UPDATE quizzes SET total_questions = $1 WHERE id = $2`,
        [metadata.questions.length, quiz.id]
      );
      quiz.total_questions = metadata.questions.length;
    }

    await client.query('COMMIT');
    res.status(201).json(quiz);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating quiz:', err);
    res.status(500).json({ error: 'Failed to create quiz' });
  } finally {
    client.release();
  }
});

// PUT /api/quizzes/:id
router.put('/:id', auth, requireRole(['owner', 'super-admin', 'employee']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      type,
      category_id,
      subject,
      total_questions,
      duration_minutes,
      max_score,
      difficulty,
      exam_type,
      is_published,
      is_free,
      metadata,
    } = req.body;

    const existing = await pool.query('SELECT id FROM quizzes WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const result = await pool.query(
      `UPDATE quizzes SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         type = COALESCE($3, type),
         category_id = COALESCE($4, category_id),
         subject = COALESCE($5, subject),
         total_questions = COALESCE($6, total_questions),
         duration_minutes = COALESCE($7, duration_minutes),
         max_score = COALESCE($8, max_score),
         difficulty = COALESCE($9, difficulty),
         exam_type = COALESCE($10, exam_type),
         is_published = COALESCE($11, is_published),
         is_free = COALESCE($12, is_free),
         metadata = COALESCE($13, metadata),
         updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        title || null,
        description !== undefined ? description : null,
        type || null,
        category_id !== undefined ? category_id : null,
        subject !== undefined ? subject : null,
        total_questions !== undefined ? total_questions : null,
        duration_minutes !== undefined ? duration_minutes : null,
        max_score !== undefined ? max_score : null,
        difficulty || null,
        exam_type !== undefined ? exam_type : null,
        is_published !== undefined ? is_published : null,
        is_free !== undefined ? is_free : null,
        metadata ? JSON.stringify(metadata) : null,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating quiz:', err);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// DELETE /api/quizzes/:id
router.delete('/:id', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM quizzes WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ message: 'Quiz deleted successfully', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting quiz:', err);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// POST /api/quizzes/:id/questions
router.post('/:id/questions', auth, requireRole(['owner', 'super-admin', 'employee']), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'questions array is required' });
    }

    const quizResult = await client.query('SELECT id FROM quizzes WHERE id = $1', [id]);
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    await client.query('BEGIN');

    const maxOrder = await client.query(
      'SELECT COALESCE(MAX(order_index), 0) AS max_idx FROM quiz_questions WHERE quiz_id = $1',
      [id]
    );
    let currentOrder = maxOrder.rows[0].max_idx;

    const inserted = [];
    for (const q of questions) {
      currentOrder++;
      const result = await client.query(
        `INSERT INTO quiz_questions
           (quiz_id, question_text, question_type, options, correct_answers,
            explanation, difficulty, subject, topic, marks, negative_marks,
            order_index, sets)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING *`,
        [
          id,
          q.question_text,
          q.question_type || 'mcq',
          JSON.stringify(q.options || []),
          JSON.stringify(q.correct_answers || []),
          q.explanation || null,
          q.difficulty || 'medium',
          q.subject || null,
          q.topic || null,
          q.marks || 1,
          q.negative_marks || 0,
          q.order_index || currentOrder,
          q.sets ? JSON.stringify(q.sets) : null,
        ]
      );
      inserted.push(result.rows[0]);
    }

    await client.query(
      'UPDATE quizzes SET total_questions = (SELECT COUNT(*)::int FROM quiz_questions WHERE quiz_id = $1), updated_at = NOW() WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');
    res.status(201).json({ questions: inserted, count: inserted.length });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding questions:', err);
    res.status(500).json({ error: 'Failed to add questions' });
  } finally {
    client.release();
  }
});

// PUT /api/quizzes/questions/:questionId
router.put('/questions/:questionId', auth, requireRole(['owner', 'super-admin', 'employee']), async (req, res) => {
  try {
    const { questionId } = req.params;
    const {
      question_text,
      question_type,
      options,
      correct_answers,
      explanation,
      difficulty,
      subject,
      topic,
      marks,
      negative_marks,
      order_index,
      sets,
    } = req.body;

    const existing = await pool.query('SELECT id FROM quiz_questions WHERE id = $1', [questionId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const result = await pool.query(
      `UPDATE quiz_questions SET
         question_text = COALESCE($1, question_text),
         question_type = COALESCE($2, question_type),
         options = COALESCE($3, options),
         correct_answers = COALESCE($4, correct_answers),
         explanation = COALESCE($5, explanation),
         difficulty = COALESCE($6, difficulty),
         subject = COALESCE($7, subject),
         topic = COALESCE($8, topic),
         marks = COALESCE($9, marks),
         negative_marks = COALESCE($10, negative_marks),
         order_index = COALESCE($11, order_index),
         sets = COALESCE($12, sets)
       WHERE id = $13
       RETURNING *`,
      [
        question_text || null,
        question_type || null,
        options ? JSON.stringify(options) : null,
        correct_answers ? JSON.stringify(correct_answers) : null,
        explanation !== undefined ? explanation : null,
        difficulty || null,
        subject !== undefined ? subject : null,
        topic !== undefined ? topic : null,
        marks !== undefined ? marks : null,
        negative_marks !== undefined ? negative_marks : null,
        order_index !== undefined ? order_index : null,
        sets ? JSON.stringify(sets) : null,
        questionId,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

module.exports = router;
