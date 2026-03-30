-- ============================================================
-- Seed Demo Users
-- Passwords:  all use "password123"  (bcrypt hash below)
-- Run with: psql -d mvp_db -f seed.sql
-- ============================================================

-- bcrypt hash of "password123" (cost 10)
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO users (name, email, password_hash, role, target_exam, avatar) VALUES
  ('Student User',  'student@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student',    'IBPS PO', ''),
  ('Employee User', 'employee@example.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'employee',   NULL,      ''),
  ('Admin User',    'admin@example.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin',      NULL,      ''),
  ('Super Admin',   'superadmin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'super-admin',NULL,      ''),
  ('Owner User',    'owner@example.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'owner',      NULL,      '')
ON CONFLICT (email) DO NOTHING;

-- Init streak data for the student demo user
INSERT INTO streak_data (user_id, current_streak, longest_streak, total_quizzes_taken, total_points, unlocked_rewards, daily_goal_completed)
SELECT id, 0, 0, 0, 0, '[]', false
FROM users
WHERE email = 'student@example.com'
ON CONFLICT (user_id) DO NOTHING;
