const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// GET /api/materials - List published materials
router.get('/', async (req, res) => {
  try {
    const { type, category, subject, search, limit, offset } = req.query;
    const lim = Math.min(parseInt(limit) || 20, 100);
    const off = parseInt(offset) || 0;

    const conditions = [];
    const values = [];
    let idx = 1;

    conditions.push('is_published = TRUE');

    if (type) {
      conditions.push(`type = $${idx++}`);
      values.push(type);
    }
    if (category) {
      conditions.push(`category = $${idx++}`);
      values.push(category);
    }
    if (subject) {
      conditions.push(`subject = $${idx++}`);
      values.push(subject);
    }
    if (search) {
      conditions.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM study_materials ${where}`,
      values
    );
    const total = countResult.rows[0].total;

    const dataResult = await pool.query(
      `SELECT sm.*, u.name AS created_by_name
       FROM study_materials sm
       LEFT JOIN users u ON u.id = sm.created_by
       ${where}
       ORDER BY sm.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, lim, off]
    );

    const materials = dataResult.rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      category: r.category,
      subject: r.subject,
      fileUrl: r.file_url,
      fileSizeBytes: r.file_size_bytes,
      downloadCount: r.download_count,
      createdBy: r.created_by,
      createdByName: r.created_by_name,
      isFree: r.is_free,
      isPublished: r.is_published,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    res.json({ materials, total });
  } catch (err) {
    console.error('GET /materials error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/materials/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sm.*, u.name AS created_by_name
       FROM study_materials sm
       LEFT JOIN users u ON u.id = sm.created_by
       WHERE sm.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const r = result.rows[0];
    res.json({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      category: r.category,
      subject: r.subject,
      fileUrl: r.file_url,
      fileSizeBytes: r.file_size_bytes,
      downloadCount: r.download_count,
      createdBy: r.created_by,
      createdByName: r.created_by_name,
      isFree: r.is_free,
      isPublished: r.is_published,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    });
  } catch (err) {
    console.error('GET /materials/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/materials/:id/download - Increment download_count
router.post('/:id/download', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE study_materials
       SET download_count = download_count + 1,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const r = result.rows[0];
    res.json({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      category: r.category,
      subject: r.subject,
      fileUrl: r.file_url,
      fileSizeBytes: r.file_size_bytes,
      downloadCount: r.download_count,
      createdBy: r.created_by,
      isFree: r.is_free,
      isPublished: r.is_published,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    });
  } catch (err) {
    console.error('POST /materials/:id/download error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/materials - Create material
router.post('/', auth, requireRole(['owner', 'super-admin', 'employee']), async (req, res) => {
  try {
    const {
      title, description, type, category, subject,
      fileUrl, fileSizeBytes, isFree, isPublished,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO study_materials (
         title, description, type, category, subject,
         file_url, file_size_bytes, created_by, is_free, is_published
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        title, description || null, type || 'document', category || null,
        subject || null, fileUrl || null, fileSizeBytes || 0,
        req.user.id, isFree !== undefined ? isFree : true,
        isPublished !== undefined ? isPublished : false,
      ]
    );

    const r = result.rows[0];
    res.status(201).json({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      category: r.category,
      subject: r.subject,
      fileUrl: r.file_url,
      fileSizeBytes: r.file_size_bytes,
      downloadCount: r.download_count,
      createdBy: r.created_by,
      isFree: r.is_free,
      isPublished: r.is_published,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    });
  } catch (err) {
    console.error('POST /materials error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/materials/:id - Update material
router.put('/:id', auth, requireRole(['owner', 'super-admin', 'employee']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, type, category, subject,
      fileUrl, fileSizeBytes, isFree, isPublished,
    } = req.body;

    const result = await pool.query(
      `UPDATE study_materials
       SET title         = COALESCE($1, title),
           description   = COALESCE($2, description),
           type          = COALESCE($3, type),
           category      = COALESCE($4, category),
           subject       = COALESCE($5, subject),
           file_url      = COALESCE($6, file_url),
           file_size_bytes = COALESCE($7, file_size_bytes),
           is_free       = COALESCE($8, is_free),
           is_published  = COALESCE($9, is_published),
           updated_at    = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        title, description, type, category, subject,
        fileUrl,
        fileSizeBytes !== undefined ? fileSizeBytes : null,
        isFree !== undefined ? isFree : null,
        isPublished !== undefined ? isPublished : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const r = result.rows[0];
    res.json({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      category: r.category,
      subject: r.subject,
      fileUrl: r.file_url,
      fileSizeBytes: r.file_size_bytes,
      downloadCount: r.download_count,
      createdBy: r.created_by,
      isFree: r.is_free,
      isPublished: r.is_published,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    });
  } catch (err) {
    console.error('PUT /materials/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/materials/:id
router.delete('/:id', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM study_materials WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /materials/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
