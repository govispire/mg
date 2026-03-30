const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/tasks
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, completed, due_date, category, priority, repeat, tags, created_at, updated_at
       FROM tasks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const tasks = result.rows.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      completed: t.completed,
      dueDate: t.due_date,
      category: t.category,
      priority: t.priority,
      repeat: t.repeat,
      tags: t.tags || [],
    }));

    res.json(tasks);
  } catch (err) {
    console.error('GET /tasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tasks
router.post('/', auth, async (req, res) => {
  const { title, description, dueDate, category = 'study', priority = 'medium', repeat = 'none', tags = [] } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, due_date, category, priority, repeat, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, title, description, completed, due_date, category, priority, repeat, tags`,
      [req.user.id, title, description || null, dueDate || null, category, priority, repeat, JSON.stringify(tags)]
    );

    const t = result.rows[0];
    res.status(201).json({
      id: t.id,
      title: t.title,
      description: t.description,
      completed: t.completed,
      dueDate: t.due_date,
      category: t.category,
      priority: t.priority,
      repeat: t.repeat,
      tags: t.tags || [],
    });
  } catch (err) {
    console.error('POST /tasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { title, description, completed, dueDate, category, priority, repeat, tags } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title       = COALESCE($1, title),
           description = COALESCE($2, description),
           completed   = COALESCE($3, completed),
           due_date    = COALESCE($4, due_date),
           category    = COALESCE($5, category),
           priority    = COALESCE($6, priority),
           repeat      = COALESCE($7, repeat),
           tags        = COALESCE($8, tags),
           updated_at  = NOW()
       WHERE id = $9 AND user_id = $10
       RETURNING id, title, description, completed, due_date, category, priority, repeat, tags`,
      [
        title, description,
        completed !== undefined ? completed : null,
        dueDate,
        category, priority, repeat,
        tags ? JSON.stringify(tags) : null,
        id, req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const t = result.rows[0];
    res.json({
      id: t.id,
      title: t.title,
      description: t.description,
      completed: t.completed,
      dueDate: t.due_date,
      category: t.category,
      priority: t.priority,
      repeat: t.repeat,
      tags: t.tags || [],
    });
  } catch (err) {
    console.error('PUT /tasks/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /tasks/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
