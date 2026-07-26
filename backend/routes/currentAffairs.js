const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// GET /api/current-affairs
router.get('/', async (req, res) => {
  try {
    const { category, topic, publish_type, date_from, date_to, search, limit = 20, offset = 0 } = req.query;
    const lim = Math.min(parseInt(limit) || 20, 100);
    const off = parseInt(offset) || 0;
    const conditions = ["ca.status = 'published'"];
    const values = [];
    let idx = 1;

    if (category) {
      conditions.push(`ca.category = $${idx++}`);
      values.push(category);
    }
    if (topic) {
      conditions.push(`ca.topic = $${idx++}`);
      values.push(topic);
    }
    if (publish_type) {
      conditions.push(`ca.publish_type = $${idx++}`);
      values.push(publish_type);
    }
    if (date_from) {
      conditions.push(`ca.created_at >= $${idx++}`);
      values.push(date_from);
    }
    if (date_to) {
      conditions.push(`ca.created_at <= $${idx++}`);
      values.push(date_to);
    }
    if (search) {
      conditions.push(`(ca.title ILIKE $${idx} OR ca.summary ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM current_affairs ca ${where}`,
      values
    );

    values.push(lim, off);
    const result = await pool.query(
      `SELECT ca.id, ca.title, ca.summary, ca.category, ca.topic, ca.publish_type,
              ca.source, ca.image_url, ca.tags, ca.inline_quiz, ca.status, ca.created_by,
              ca.published_at, ca.created_at, ca.updated_at
       FROM current_affairs ca
       ${where}
       ORDER BY ca.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values
    );

    res.json({
      articles: result.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (err) {
    console.error('GET /current-affairs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/current-affairs/topics
router.get('/topics', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT topic, COUNT(*)::int AS count
       FROM current_affairs
       WHERE status = 'published' AND topic IS NOT NULL
       GROUP BY topic
       ORDER BY count DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error('GET /current-affairs/topics error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/current-affairs/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, title, content, summary, category, topic, publish_type, source,
              image_url, tags, inline_quiz, status, created_by, published_at,
              created_at, updated_at
       FROM current_affairs
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /current-affairs/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/current-affairs
router.post('/', auth, requireRole(['owner', 'super-admin', 'employee']), async (req, res) => {
  try {
    const {
      title, content, summary, category, topic, publish_type,
      source, image_url, tags, inline_quiz, status, published_at,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const articleStatus = status || 'draft';
    const pubAt = articleStatus === 'published' ? (published_at || new Date()) : null;

    const result = await pool.query(
      `INSERT INTO current_affairs
         (title, content, summary, category, topic, publish_type, source,
          image_url, tags, inline_quiz, status, created_by, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id, title, summary, category, topic, publish_type, source,
                 image_url, tags, inline_quiz, status, created_by, published_at,
                 created_at, updated_at`,
      [
        title, content, summary || null, category || null, topic || null,
        publish_type || 'news', source || null, image_url || null,
        JSON.stringify(tags || []), JSON.stringify(inline_quiz || []),
        articleStatus, req.user.id, pubAt,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /current-affairs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/current-affairs/:id
router.put('/:id', auth, requireRole(['owner', 'super-admin', 'employee']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, content, summary, category, topic, publish_type,
      source, image_url, tags, inline_quiz, status, published_at,
    } = req.body;

    const result = await pool.query(
      `UPDATE current_affairs
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           summary = COALESCE($3, summary),
           category = COALESCE($4, category),
           topic = COALESCE($5, topic),
           publish_type = COALESCE($6, publish_type),
           source = COALESCE($7, source),
           image_url = COALESCE($8, image_url),
           tags = COALESCE($9, tags),
           inline_quiz = COALESCE($10, inline_quiz),
           status = COALESCE($11, status),
           published_at = COALESCE($12, published_at),
           updated_at = NOW()
       WHERE id = $13
       RETURNING id, title, content, summary, category, topic, publish_type, source,
                 image_url, tags, inline_quiz, status, created_by, published_at,
                 created_at, updated_at`,
      [
        title, content, summary, category, topic, publish_type,
        source, image_url,
        tags ? JSON.stringify(tags) : null,
        inline_quiz ? JSON.stringify(inline_quiz) : null,
        status, published_at, id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /current-affairs/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/current-affairs/:id
router.delete('/:id', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM current_affairs WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /current-affairs/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
