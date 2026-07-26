const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { validate, loginSchema, registerSchema } = require('../middleware/validation');

const router = express.Router();

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      // Record failed login attempt
      await pool.query(
        `INSERT INTO login_history (user_id, ip_address, user_agent, status) VALUES (0, $1, $2, 'failed')`,
        [req.ip, req.headers['user-agent'] || '']
      ).catch(() => {});
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      // Record failed login attempt
      await pool.query(
        `INSERT INTO login_history (user_id, ip_address, user_agent, status) VALUES ($1, $2, $3, 'failed')`,
        [user.id, req.ip, req.headers['user-agent'] || '']
      ).catch(() => {});
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Record successful login
    await pool.query(
      `INSERT INTO login_history (user_id, ip_address, user_agent, status) VALUES ($1, $2, $3, 'success')`,
      [user.id, req.ip, req.headers['user-agent'] || '']
    ).catch(() => {});

    // Update last_login_at
    await pool.query(
      `UPDATE users SET last_login_at = NOW() WHERE id = $1`,
      [user.id]
    ).catch(() => {});

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        targetExam: user.target_exam,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if email already exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, target_exam, avatar`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, role]
    );

    const newUser = result.rows[0];

    // Init streak data for new user
    await pool.query(
      `INSERT INTO streak_data (user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
      [newUser.id]
    );

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        targetExam: newUser.target_exam,
        avatar: newUser.avatar,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
