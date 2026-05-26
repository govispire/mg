-- ============================================================
-- Governance Schema Migration 001
-- Run with: psql -d mvp_db -f migrations/001_governance.sql
-- ============================================================

-- ── Extend users table ───────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active',       -- active | inactive
  ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id),            -- who created this user
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS department VARCHAR(100),                             -- Banking / SSC / Railway etc.
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deactivated_by INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS employee_capacity INTEGER DEFAULT 0;                 -- max students for mentor

-- ── Staff Tasks (role-to-role assignment) ────────────────────
-- This is SEPARATE from the student self-task table
CREATE TABLE IF NOT EXISTS staff_tasks (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(500) NOT NULL,
  description   TEXT,
  assigned_by   INTEGER NOT NULL REFERENCES users(id),
  assigned_to   INTEGER NOT NULL REFERENCES users(id),
  assignee_role VARCHAR(50) NOT NULL,                   -- employee | mentor
  category      VARCHAR(100),                           -- Banking / SSC / Railway / UPSC
  priority      VARCHAR(20) NOT NULL DEFAULT 'medium',  -- low | medium | high | critical
  status        VARCHAR(30) NOT NULL DEFAULT 'assigned',-- assigned | in_progress | completed | blocked
  due_date      TIMESTAMPTZ,
  proof_url     TEXT,                                   -- completion proof upload
  extension_requested BOOLEAN DEFAULT FALSE,
  extension_reason    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

-- ── Staff Task Activity Log ──────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_task_logs (
  id         SERIAL PRIMARY KEY,
  task_id    INTEGER NOT NULL REFERENCES staff_tasks(id) ON DELETE CASCADE,
  actor_id   INTEGER NOT NULL REFERENCES users(id),
  action     VARCHAR(100) NOT NULL,   -- status_changed | comment_added | proof_uploaded | extension_requested
  old_value  TEXT,
  new_value  TEXT,
  comment    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Platform Audit Logs ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id            SERIAL PRIMARY KEY,
  actor_id      INTEGER REFERENCES users(id),
  actor_role    VARCHAR(50),
  action        VARCHAR(200) NOT NULL,  -- user.create | user.deactivate | content.approve | task.assign ...
  resource_type VARCHAR(100),           -- user | content | task | category | exam | test
  resource_id   VARCHAR(100),
  resource_name TEXT,
  old_data      JSONB,
  new_data      JSONB,
  ip_address    VARCHAR(50),
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── In-App Notifications ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(300) NOT NULL,
  body        TEXT,
  type        VARCHAR(50) DEFAULT 'info',  -- info | warning | task | approval | reminder
  is_read     BOOLEAN DEFAULT FALSE,
  link        TEXT,                         -- optional deep-link path
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Employee Performance Scores ──────────────────────────────
-- Auto-calculated view (materialized via a function or computed)
CREATE TABLE IF NOT EXISTS employee_performance (
  user_id             INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_tasks         INTEGER DEFAULT 0,
  completed_tasks     INTEGER DEFAULT 0,
  overdue_tasks       INTEGER DEFAULT 0,
  avg_completion_days NUMERIC(5,2) DEFAULT 0,
  content_uploads     INTEGER DEFAULT 0,
  approved_uploads    INTEGER DEFAULT 0,
  rejected_uploads    INTEGER DEFAULT 0,
  quality_score       NUMERIC(5,2) DEFAULT 0,   -- 0-100
  performance_score   NUMERIC(5,2) DEFAULT 0,   -- 0-100 composite
  last_calculated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Mentor → Student Mapping ─────────────────────────────────
CREATE TABLE IF NOT EXISTS mentor_student_map (
  mentor_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES users(id),
  category   VARCHAR(100),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (mentor_id, student_id)
);

-- ── Weak Area Recommendations ────────────────────────────────
CREATE TABLE IF NOT EXISTS student_weak_areas (
  id          SERIAL PRIMARY KEY,
  student_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic       VARCHAR(200) NOT NULL,
  subject     VARCHAR(100),
  accuracy_pct NUMERIC(5,2) DEFAULT 0,
  attempt_count INTEGER DEFAULT 0,
  trend       VARCHAR(20) DEFAULT 'stable', -- improving | declining | stable
  flagged     BOOLEAN DEFAULT TRUE,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mentor_recommendations (
  id              SERIAL PRIMARY KEY,
  student_id      INTEGER NOT NULL REFERENCES users(id),
  mentor_id       INTEGER REFERENCES users(id),
  weak_area_id    INTEGER REFERENCES student_weak_areas(id),
  message         TEXT NOT NULL,
  resource_type   VARCHAR(50),   -- video | test | pdf | mentorship
  resource_id     VARCHAR(200),
  resource_title  VARCHAR(300),
  sent_at         TIMESTAMPTZ,
  clicked         BOOLEAN DEFAULT FALSE,
  purchased       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Content Items (with full ownership chain) ────────────────
CREATE TABLE IF NOT EXISTS content_items (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(500) NOT NULL,
  type          VARCHAR(50) NOT NULL,  -- test | question | blog | pdf | current_affairs | quiz
  category      VARCHAR(100),
  subject       VARCHAR(100),
  status        VARCHAR(30) DEFAULT 'draft',  -- draft | pending_approval | approved | rejected | archived
  created_by    INTEGER NOT NULL REFERENCES users(id),
  reviewed_by   INTEGER REFERENCES users(id),
  published_by  INTEGER REFERENCES users(id),
  archived_by   INTEGER REFERENCES users(id),
  current_owner INTEGER REFERENCES users(id),  -- for reassignment after exit
  reject_reason TEXT,
  archive_reason TEXT,
  published_at  TIMESTAMPTZ,
  archived_at   TIMESTAMPTZ,
  reviewed_at   TIMESTAMPTZ,
  content_data  JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Login History ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_history (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(50),
  user_agent TEXT,
  status     VARCHAR(20) DEFAULT 'success',  -- success | failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_staff_tasks_assigned_to  ON staff_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_assigned_by  ON staff_tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_status       ON staff_tasks(status);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_due_date     ON staff_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_staff_task_logs_task_id  ON staff_task_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id      ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource      ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at    ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id    ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_content_items_created_by ON content_items(created_by);
CREATE INDEX IF NOT EXISTS idx_content_items_status     ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id    ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_users_status             ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role               ON users(role);
CREATE INDEX IF NOT EXISTS idx_mentor_student_map       ON mentor_student_map(mentor_id);
