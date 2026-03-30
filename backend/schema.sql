-- ============================================================
-- MVP App Database Schema
-- Run with: psql -d mvp_db -f schema.sql
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'student',   -- student | employee | admin | super-admin | owner
  target_exam VARCHAR(255),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz results (full result stored per attempt)
CREATE TABLE IF NOT EXISTS quiz_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id VARCHAR(255),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  time_taken INTEGER NOT NULL DEFAULT 0,         -- seconds
  time_per_question JSONB DEFAULT '[]',
  topic_accuracy JSONB DEFAULT '{}',
  subject_accuracy JSONB DEFAULT '{}',
  answers JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streak / gamification data (one row per user)
CREATE TABLE IF NOT EXISTS streak_data (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_quiz_date VARCHAR(50),                    -- stored as date string e.g. "Thu Mar 26 2026"
  total_quizzes_taken INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  unlocked_rewards JSONB DEFAULT '[]',
  daily_goal_completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily goals / tasks
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  due_date TIMESTAMPTZ,
  category VARCHAR(100) DEFAULT 'study',
  priority VARCHAR(50) DEFAULT 'medium',
  repeat VARCHAR(50) DEFAULT 'none',
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily presence / activity log (one row per user per day)
CREATE TABLE IF NOT EXISTS daily_presence (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  PRIMARY KEY (user_id, date)
);

-- Quiz completions (tracks which specific quiz IDs a user has done)
CREATE TABLE IF NOT EXISTS quiz_completions (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id VARCHAR(255) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  score NUMERIC(5,2) DEFAULT 0,
  date TIMESTAMPTZ DEFAULT NOW(),
  duration INTEGER DEFAULT 15,              -- minutes
  PRIMARY KEY (user_id, quiz_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_date ON quiz_results(date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_presence_user_id ON daily_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_completions_user_id ON quiz_completions(user_id);
