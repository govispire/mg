const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// GET /api/exam-notifications - List exam notifications
router.get('/', async (req, res) => {
  try {
    const { category, status, search, limit, offset } = req.query;
    const lim = Math.min(parseInt(limit) || 20, 100);
    const off = parseInt(offset) || 0;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (category) {
      conditions.push(`category = $${idx++}`);
      values.push(category);
    }
    if (status) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }
    if (search) {
      conditions.push(`(title ILIKE $${idx} OR description ILIKE $${idx} OR exam_name ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    conditions.push('is_active = TRUE');

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM exam_notifications ${where}`,
      values
    );
    const total = countResult.rows[0].total;

    const dataResult = await pool.query(
      `SELECT * FROM exam_notifications
       ${where}
       ORDER BY exam_date ASC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, lim, off]
    );

    res.json({ notifications: dataResult.rows, total });
  } catch (err) {
    console.error('GET /exam-notifications error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/exam-notifications/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM exam_notifications WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam notification not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /exam-notifications/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/exam-notifications
router.post('/', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const {
      title, description, exam_name, organization, category,
      application_start, application_end, exam_date,
      admit_card_date, result_date, status, link, metadata,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO exam_notifications (
         title, description, exam_name, organization, category,
         application_start, application_end, exam_date,
         admit_card_date, result_date, status, link, metadata, is_active
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,TRUE)
       RETURNING *`,
      [
        title, description || null, exam_name || null, organization || null,
        category || null, application_start || null, application_end || null,
        exam_date || null, admit_card_date || null, result_date || null,
        status || 'upcoming', link || null,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /exam-notifications error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/exam-notifications/:id
router.put('/:id', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, exam_name, organization, category,
      application_start, application_end, exam_date,
      admit_card_date, result_date, status, link, metadata, is_active,
    } = req.body;

    const result = await pool.query(
      `UPDATE exam_notifications
       SET title            = COALESCE($1, title),
           description      = COALESCE($2, description),
           exam_name        = COALESCE($3, exam_name),
           organization     = COALESCE($4, organization),
           category         = COALESCE($5, category),
           application_start = COALESCE($6, application_start),
           application_end  = COALESCE($7, application_end),
           exam_date        = COALESCE($8, exam_date),
           admit_card_date  = COALESCE($9, admit_card_date),
           result_date      = COALESCE($10, result_date),
           status           = COALESCE($11, status),
           link             = COALESCE($12, link),
           metadata         = COALESCE($13, metadata),
           is_active        = COALESCE($14, is_active),
           updated_at       = NOW()
       WHERE id = $15
       RETURNING *`,
      [
        title, description, exam_name, organization, category,
        application_start, application_end, exam_date,
        admit_card_date, result_date, status, link,
        metadata ? JSON.stringify(metadata) : null,
        is_active !== undefined ? is_active : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam notification not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /exam-notifications/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/exam-notifications/:id
router.delete('/:id', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM exam_notifications WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam notification not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /exam-notifications/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
