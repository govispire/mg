const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// GET /api/courses/categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT category, COUNT(*)::int AS count
       FROM courses
       WHERE is_published = true
       GROUP BY category
       ORDER BY count DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /courses/categories error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/courses/enrolled
router.get('/enrolled', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, e.progress_pct, e.last_chapter_id, e.enrolled_at
       FROM course_enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    );

    const courses = result.rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      subcategory: r.subcategory,
      difficulty: r.difficulty,
      thumbnailUrl: r.thumbnail_url,
      instructorId: r.instructor_id,
      instructorName: r.instructor_name,
      durationHours: r.duration_hours,
      enrolledCount: r.enrolled_count,
      rating: r.rating,
      isPublished: r.is_published,
      isFree: r.is_free,
      price: r.price,
      tags: r.tags || [],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      progressPct: r.progress_pct,
      lastChapterId: r.last_chapter_id,
      enrolledAt: r.enrolled_at,
    }));

    res.json(courses);
  } catch (err) {
    console.error('GET /courses/enrolled error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/courses
router.get('/', async (req, res) => {
  try {
    const { category, instructor, is_free, search, limit, offset } = req.query;
    const lim = Math.min(parseInt(limit) || 20, 100);
    const off = parseInt(offset) || 0;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (category) {
      conditions.push(`c.category = $${idx++}`);
      values.push(category);
    }
    if (instructor) {
      conditions.push(`c.instructor_id = $${idx++}`);
      values.push(instructor);
    }
    if (is_free !== undefined) {
      conditions.push(`c.is_free = $${idx++}`);
      values.push(is_free === 'true');
    }
    if (search) {
      conditions.push(`(c.title ILIKE $${idx} OR c.description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM courses c ${where}`,
      values
    );
    const total = countResult.rows[0].total;

    const dataResult = await pool.query(
      `SELECT c.id, c.title, c.description, c.category, c.subcategory, c.difficulty,
              c.thumbnail_url, c.instructor_id, c.instructor_name, c.duration_hours,
              c.enrolled_count, c.rating, c.is_published, c.is_free, c.price,
              c.tags, c.created_at, c.updated_at,
              u.name AS instructor_full_name, u.avatar_url AS instructor_avatar
       FROM courses c
       LEFT JOIN users u ON u.id = c.instructor_id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, lim, off]
    );

    const courses = dataResult.rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      subcategory: r.subcategory,
      difficulty: r.difficulty,
      thumbnailUrl: r.thumbnail_url,
      instructorId: r.instructor_id,
      instructorName: r.instructor_name,
      instructorFullName: r.instructor_full_name,
      instructorAvatar: r.instructor_avatar,
      durationHours: r.duration_hours,
      enrolledCount: r.enrolled_count,
      rating: r.rating,
      isPublished: r.is_published,
      isFree: r.is_free,
      price: r.price,
      tags: r.tags || [],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    res.json({ courses, total });
  } catch (err) {
    console.error('GET /courses error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/courses/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const courseResult = await pool.query(
      `SELECT c.*, u.name AS instructor_full_name, u.avatar_url AS instructor_avatar
       FROM courses c
       LEFT JOIN users u ON u.id = c.instructor_id
       WHERE c.id = $1`,
      [id]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const cr = courseResult.rows[0];

    const subjectsResult = await pool.query(
      `SELECT * FROM course_subjects WHERE course_id = $1 ORDER BY order_index ASC`,
      [id]
    );

    const subjectIds = subjectsResult.rows.map(s => s.id);

    let chaptersMap = {};
    if (subjectIds.length > 0) {
      const chaptersResult = await pool.query(
        `SELECT * FROM course_chapters WHERE subject_id = ANY($1::int[]) ORDER BY order_index ASC`,
        [subjectIds]
      );
      for (const ch of chaptersResult.rows) {
        if (!chaptersMap[ch.subject_id]) {
          chaptersMap[ch.subject_id] = [];
        }
        chaptersMap[ch.subject_id].push({
          id: ch.id,
          subjectId: ch.subject_id,
          title: ch.title,
          description: ch.description,
          videoUrl: ch.video_url,
          durationMinutes: ch.duration_minutes,
          orderIndex: ch.order_index,
          isFreePreview: ch.is_free_preview,
          createdAt: ch.created_at,
        });
      }
    }

    const subjects = subjectsResult.rows.map(s => ({
      id: s.id,
      courseId: s.course_id,
      title: s.title,
      description: s.description,
      orderIndex: s.order_index,
      createdAt: s.created_at,
      chapters: chaptersMap[s.id] || [],
    }));

    const course = {
      id: cr.id,
      title: cr.title,
      description: cr.description,
      category: cr.category,
      subcategory: cr.subcategory,
      difficulty: cr.difficulty,
      thumbnailUrl: cr.thumbnail_url,
      instructorId: cr.instructor_id,
      instructorName: cr.instructor_name,
      instructorFullName: cr.instructor_full_name,
      instructorAvatar: cr.instructor_avatar,
      durationHours: cr.duration_hours,
      enrolledCount: cr.enrolled_count,
      rating: cr.rating,
      isPublished: cr.is_published,
      isFree: cr.is_free,
      price: cr.price,
      tags: cr.tags || [],
      createdAt: cr.created_at,
      updatedAt: cr.updated_at,
      subjects,
    };

    res.json(course);
  } catch (err) {
    console.error('GET /courses/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/courses
router.post('/', auth, requireRole(['owner', 'super-admin', 'employee']), async (req, res) => {
  try {
    const {
      title, description, category, subcategory, difficulty,
      thumbnailUrl, instructorName, durationHours, isPublished,
      isFree, price, tags,
    } = req.body;

    const instructorId = req.user.id;

    const result = await pool.query(
      `INSERT INTO courses (
         title, description, category, subcategory, difficulty,
         thumbnail_url, instructor_id, instructor_name, duration_hours,
         is_published, is_free, price, tags
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        title, description || null, category || null, subcategory || null,
        difficulty || 'beginner', thumbnailUrl || null, instructorId,
        instructorName || null, durationHours || 0, isPublished !== undefined ? isPublished : false,
        isFree !== undefined ? isFree : true, price || 0, tags ? JSON.stringify(tags) : '[]',
      ]
    );

    const c = result.rows[0];
    res.status(201).json({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      subcategory: c.subcategory,
      difficulty: c.difficulty,
      thumbnailUrl: c.thumbnail_url,
      instructorId: c.instructor_id,
      instructorName: c.instructor_name,
      durationHours: c.duration_hours,
      enrolledCount: c.enrolled_count,
      rating: c.rating,
      isPublished: c.is_published,
      isFree: c.is_free,
      price: c.price,
      tags: c.tags || [],
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    });
  } catch (err) {
    console.error('POST /courses error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/courses/:id
router.put('/:id', auth, requireRole(['owner', 'super-admin', 'employee']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, category, subcategory, difficulty,
      thumbnailUrl, instructorName, durationHours, isPublished,
      isFree, price, tags,
    } = req.body;

    const result = await pool.query(
      `UPDATE courses
       SET title         = COALESCE($1, title),
           description   = COALESCE($2, description),
           category      = COALESCE($3, category),
           subcategory   = COALESCE($4, subcategory),
           difficulty    = COALESCE($5, difficulty),
           thumbnail_url = COALESCE($6, thumbnail_url),
           instructor_name = COALESCE($7, instructor_name),
           duration_hours  = COALESCE($8, duration_hours),
           is_published  = COALESCE($9, is_published),
           is_free       = COALESCE($10, is_free),
           price         = COALESCE($11, price),
           tags          = COALESCE($12, tags),
           updated_at    = NOW()
       WHERE id = $13
       RETURNING *`,
      [
        title, description, category, subcategory, difficulty,
        thumbnailUrl, instructorName,
        durationHours !== undefined ? durationHours : null,
        isPublished !== undefined ? isPublished : null,
        isFree !== undefined ? isFree : null,
        price !== undefined ? price : null,
        tags ? JSON.stringify(tags) : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const c = result.rows[0];
    res.json({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      subcategory: c.subcategory,
      difficulty: c.difficulty,
      thumbnailUrl: c.thumbnail_url,
      instructorId: c.instructor_id,
      instructorName: c.instructor_name,
      durationHours: c.duration_hours,
      enrolledCount: c.enrolled_count,
      rating: c.rating,
      isPublished: c.is_published,
      isFree: c.is_free,
      price: c.price,
      tags: c.tags || [],
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    });
  } catch (err) {
    console.error('PUT /courses/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/courses/:id
router.delete('/:id', auth, requireRole(['owner', 'super-admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM courses WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /courses/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/courses/:id/enroll
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const courseCheck = await pool.query(
      'SELECT id FROM courses WHERE id = $1',
      [id]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const result = await pool.query(
      `INSERT INTO course_enrollments (user_id, course_id, progress_pct, enrolled_at)
       VALUES ($1, $2, 0, NOW())
       ON CONFLICT (user_id, course_id) DO UPDATE SET enrolled_at = course_enrollments.enrolled_at
       RETURNING user_id, course_id, progress_pct, last_chapter_id, enrolled_at`,
      [req.user.id, id]
    );

    const e = result.rows[0];
    res.status(201).json({
      userId: e.user_id,
      courseId: e.course_id,
      progressPct: e.progress_pct,
      lastChapterId: e.last_chapter_id,
      enrolledAt: e.enrolled_at,
    });
  } catch (err) {
    console.error('POST /courses/:id/enroll error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
