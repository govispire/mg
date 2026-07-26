const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function calcReadingTime(content) {
  if (!content) return 1;
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// GET /api/blogs
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    const lim = Math.min(parseInt(limit) || 20, 100);
    const off = parseInt(offset) || 0;
    const conditions = ["b.status = 'published'"];
    const values = [];
    let idx = 1;

    if (category) {
      conditions.push(`b.category = $${idx++}`);
      values.push(category);
    }
    if (search) {
      conditions.push(`(b.title ILIKE $${idx} OR b.excerpt ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM blogs b ${where}`,
      values
    );

    values.push(lim, off);
    const result = await pool.query(
      `SELECT b.id, b.title, b.slug, b.excerpt, b.author_name, b.category, b.tags,
              b.featured_image, b.status, b.is_ai_generated, b.reading_time_minutes,
              b.views_count, b.seo_meta, b.published_at, b.created_at, b.updated_at
       FROM blogs b
       ${where}
       ORDER BY b.published_at DESC NULLS LAST, b.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values
    );

    res.json({
      blogs: result.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (err) {
    console.error('GET /blogs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/blogs/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `UPDATE blogs
       SET views_count = views_count + 1
       WHERE slug = $1 AND status = 'published'
       RETURNING id, title, slug, content, excerpt, author_name, author_id, category, tags,
                 featured_image, status, is_ai_generated, reading_time_minutes, views_count,
                 seo_meta, published_at, created_at, updated_at`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /blogs/:slug error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/blogs
router.post('/', auth, requireRole(['owner', 'super-admin', 'employee']), async (req, res) => {
  try {
    const {
      title, content, excerpt, category, tags, featured_image,
      status, is_ai_generated, seo_meta, published_at,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    let slug = slugify(title);
    const slugCheck = await pool.query('SELECT id FROM blogs WHERE slug = $1', [slug]);
    if (slugCheck.rows.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const readingTime = calcReadingTime(content);
    const blogStatus = status || 'draft';
    const pubAt = blogStatus === 'published' ? (published_at || new Date()) : null;

    const result = await pool.query(
      `INSERT INTO blogs
         (title, slug, content, excerpt, author_name, author_id, category, tags,
          featured_image, status, is_ai_generated, reading_time_minutes, seo_meta, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id, title, slug, excerpt, author_name, author_id, category, tags,
                 featured_image, status, is_ai_generated, reading_time_minutes, views_count,
                 seo_meta, published_at, created_at, updated_at`,
      [
        title, slug, content, excerpt || null, req.user.email || null, req.user.id,
        category || null, JSON.stringify(tags || []),
        featured_image || null, blogStatus, is_ai_generated || false,
        readingTime, JSON.stringify(seo_meta || {}), pubAt,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /blogs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/blogs/:id
router.put('/:id', auth, requireRole(['owner', 'super-admin', 'employee']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, content, excerpt, category, tags, featured_image,
      status, is_ai_generated, seo_meta, published_at,
    } = req.body;

    const existing = await pool.query('SELECT id, slug, title FROM blogs WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    let slug = existing.rows[0].slug;
    if (title && title !== existing.rows[0].title) {
      slug = slugify(title);
      const slugCheck = await pool.query('SELECT id FROM blogs WHERE slug = $1 AND id != $2', [slug, id]);
      if (slugCheck.rows.length > 0) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const readingTime = content ? calcReadingTime(content) : undefined;

    const result = await pool.query(
      `UPDATE blogs
       SET title = COALESCE($1, title),
           slug = $2,
           content = COALESCE($3, content),
           excerpt = COALESCE($4, excerpt),
           category = COALESCE($5, category),
           tags = COALESCE($6, tags),
           featured_image = COALESCE($7, featured_image),
           status = COALESCE($8, status),
           is_ai_generated = COALESCE($9, is_ai_generated),
           reading_time_minutes = COALESCE($10, reading_time_minutes),
           seo_meta = COALESCE($11, seo_meta),
           published_at = COALESCE($12, published_at),
           updated_at = NOW()
       WHERE id = $13
       RETURNING id, title, slug, excerpt, author_name, author_id, category, tags,
                 featured_image, status, is_ai_generated, reading_time_minutes, views_count,
                 seo_meta, published_at, created_at, updated_at`,
      [
        title, slug, content, excerpt, category,
        tags ? JSON.stringify(tags) : null,
        featured_image, status,
        is_ai_generated !== undefined ? is_ai_generated : null,
        readingTime,
        seo_meta ? JSON.stringify(seo_meta) : null,
        published_at, id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /blogs/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/blogs/:id
router.delete('/:id', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM blogs WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /blogs/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
