require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes          = require('./routes/auth');
const userRoutes          = require('./routes/users');
const quizRoutes          = require('./routes/quiz');
const taskRoutes          = require('./routes/tasks');
const presenceRoutes      = require('./routes/presence');
const adminUsersRoutes    = require('./routes/adminUsers');
const staffTasksRoutes    = require('./routes/staffTasks');
const auditLogsRoutes     = require('./routes/auditLogs');
const notificationsRoutes = require('./routes/notifications');
// Phase 4 routes
const coursesRoutes       = require('./routes/courses');
const quizzesRoutes       = require('./routes/quizzes');
const blogsRoutes         = require('./routes/blogs');
const currentAffairsRoutes = require('./routes/currentAffairs');
const mentorshipRoutes    = require('./routes/mentorship');
const studentMentorshipRoutes = require('./routes/studentMentorship');
const vocabularyRoutes    = require('./routes/vocabulary');
const paymentsRoutes      = require('./routes/payments');
const analyticsRoutes     = require('./routes/analytics');
const leaderboardRoutes   = require('./routes/leaderboard');
const examNotificationsRoutes = require('./routes/examNotifications');
const materialsRoutes     = require('./routes/materials');
const profileRoutes       = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security Middleware ────────────────────────────────────────
app.use(helmet());

// ── Rate Limiting ─────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later' },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many admin requests, please try again later' },
});

app.use(globalLimiter);

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Original Routes ───────────────────────────────────────────
app.use('/api/auth',          authLimiter, authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/quiz',          quizRoutes);
app.use('/api/tasks',         taskRoutes);
app.use('/api/presence',      presenceRoutes);

// ── Governance Routes ─────────────────────────────────────────
app.use('/api/admin/users',   adminLimiter, adminUsersRoutes);
app.use('/api/staff-tasks',   adminLimiter, staffTasksRoutes);
app.use('/api/audit-logs',    adminLimiter, auditLogsRoutes);
app.use('/api/notifications', notificationsRoutes);

// ── Phase 4: Feature Routes ──────────────────────────────────
app.use('/api/courses',           coursesRoutes);
app.use('/api/quizzes',           quizzesRoutes);
app.use('/api/blogs',             blogsRoutes);
app.use('/api/current-affairs',   currentAffairsRoutes);
app.use('/api/mentors',           mentorshipRoutes);
app.use('/api/students',          studentMentorshipRoutes);
app.use('/api/vocabulary',        vocabularyRoutes);
app.use('/api',                   paymentsRoutes);
app.use('/api/analytics',         analyticsRoutes);
app.use('/api/leaderboard',       leaderboardRoutes);
app.use('/api/exam-notifications', examNotificationsRoutes);
app.use('/api/materials',         materialsRoutes);
app.use('/api',                   profileRoutes);

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Routes: auth, users, quiz, tasks, presence, admin, staff-tasks,`);
  console.log(`           audit-logs, notifications, courses, quizzes, blogs,`);
  console.log(`           current-affairs, mentors, vocabulary, payments,`);
  console.log(`           analytics, leaderboard, exam-notifications, materials, profile`);
});
