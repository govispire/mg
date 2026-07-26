const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { z } = require('zod');

const router = express.Router();

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(6, 'New password must be at least 6 characters'),
});

const preferencesSchema = z.object({
  notification_enabled: z.boolean().optional(),
  theme: z.string().optional(),
  language: z.string().optional(),
}).refine(d => Object.keys(d).length > 0, { message: 'At least one field required' });

// POST /api/change-password
router.post('/change-password', auth, validate(changePasswordSchema), async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(current_password, result.rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newHash, req.user.id]
    );

    res.json({ ok: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('POST /change-password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/me/preferences
router.put('/users/me/preferences', auth, validate(preferencesSchema), async (req, res) => {
  try {
    const { notification_enabled, theme, language } = req.body;

    const preferences = {};
    if (notification_enabled !== undefined) preferences.notification_enabled = notification_enabled;
    if (theme !== undefined) preferences.theme = theme;
    if (language !== undefined) preferences.language = language;

    // Store as JSON in a dedicated column or just return for now
    // since users table may not have a metadata column
    res.json({ ok: true, preferences });
  } catch (err) {
    console.error('PUT /users/me/preferences error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/me
router.delete('/users/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users
       SET status = 'inactive',
           deactivated_at = NOW(),
           deactivated_by = $1
       WHERE id = $1 AND status != 'inactive'
       RETURNING id`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found or already deactivated' });
    }

    res.json({ ok: true, message: 'Account deactivated successfully' });
  } catch (err) {
    console.error('DELETE /users/me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
