// src/types/roles.ts — Canonical role + permission types for the entire platform

export type UserRole = 'owner' | 'super-admin' | 'employee' | 'mentor' | 'student';

export type TaskStatus = 'assigned' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type ContentStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'archived';

export type AccountStatus = 'active' | 'inactive';

// ── Staff Task (role-to-role assignment) ──────────────────────
export interface StaffTask {
  id: number;
  title: string;
  description?: string;
  assigned_by: number;
  assigned_by_name: string;
  assigned_by_role: UserRole;
  assigned_to: number;
  assigned_to_name: string;
  assigned_to_role: UserRole;
  assignee_role: UserRole;
  category?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
  proof_url?: string;
  extension_requested?: boolean;
  extension_reason?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface StaffTaskLog {
  id: number;
  task_id: number;
  actor_id: number;
  actor_name: string;
  actor_role: UserRole;
  action: string;
  old_value?: string;
  new_value?: string;
  comment?: string;
  created_at: string;
}

export interface TaskSummary {
  total: number;
  assigned: number;
  in_progress: number;
  completed: number;
  blocked: number;
  overdue: number;
}

// ── User management ──────────────────────────────────────────
export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  phone?: string;
  department?: string;
  employee_capacity?: number;
  created_at: string;
  deactivated_at?: string;
  last_login_at?: string;
  created_by_name?: string;
}

// ── Audit log ────────────────────────────────────────────────
export interface AuditLog {
  id: number;
  actor_id: number;
  actor_name: string;
  actor_role: UserRole;
  action: string;
  resource_type: string;
  resource_id?: string;
  resource_name?: string;
  ip_address?: string;
  created_at: string;
}

// ── Notification ──────────────────────────────────────────────
export interface AppNotification {
  id: number;
  title: string;
  body?: string;
  type: 'info' | 'warning' | 'task' | 'approval' | 'reminder';
  is_read: boolean;
  link?: string;
  created_at: string;
}

// ── Permission matrix (frontend mirror) ───────────────────────
export const ROLE_PERMISSIONS: Record<UserRole, {
  canAssignTasks: boolean;
  canViewAllTasks: boolean;
  canCreateUsers: boolean;
  canDeactivateUsers: boolean;
  canViewRevenue: boolean;
  canApproveContent: boolean;
  canViewAuditLogs: boolean;
  canPublishContent: boolean;
}> = {
  owner: {
    canAssignTasks: true,
    canViewAllTasks: true,
    canCreateUsers: true,
    canDeactivateUsers: true,
    canViewRevenue: true,
    canApproveContent: true,
    canViewAuditLogs: true,
    canPublishContent: true,
  },
  'super-admin': {
    canAssignTasks: true,
    canViewAllTasks: true,
    canCreateUsers: true,
    canDeactivateUsers: true,
    canViewRevenue: false,
    canApproveContent: true,
    canViewAuditLogs: true,
    canPublishContent: true,
  },
  employee: {
    canAssignTasks: false,
    canViewAllTasks: false,
    canCreateUsers: false,
    canDeactivateUsers: false,
    canViewRevenue: false,
    canApproveContent: false,
    canViewAuditLogs: false,
    canPublishContent: false,
  },
  mentor: {
    canAssignTasks: false,
    canViewAllTasks: false,
    canCreateUsers: false,
    canDeactivateUsers: false,
    canViewRevenue: false,
    canApproveContent: false,
    canViewAuditLogs: false,
    canPublishContent: false,
  },
  student: {
    canAssignTasks: false,
    canViewAllTasks: false,
    canCreateUsers: false,
    canDeactivateUsers: false,
    canViewRevenue: false,
    canApproveContent: false,
    canViewAuditLogs: false,
    canPublishContent: false,
  },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  low:      { label: 'Low',      color: 'text-slate-600',  bg: 'bg-slate-100' },
  medium:   { label: 'Medium',   color: 'text-blue-600',   bg: 'bg-blue-100' },
  high:     { label: 'High',     color: 'text-orange-600', bg: 'bg-orange-100' },
  critical: { label: 'Critical', color: 'text-red-600',    bg: 'bg-red-100' },
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  assigned:    { label: 'Assigned',    color: 'text-blue-600',   bg: 'bg-blue-50' },
  in_progress: { label: 'In Progress', color: 'text-amber-600',  bg: 'bg-amber-50' },
  completed:   { label: 'Completed',   color: 'text-green-600',  bg: 'bg-green-50' },
  blocked:     { label: 'Blocked',     color: 'text-red-600',    bg: 'bg-red-50' },
};

export const EXAM_CATEGORIES = [
  'Banking', 'SSC', 'Railway', 'UPSC', 'TNPSC', 'NEET', 'Defence',
  'State PSC', 'Insurance', 'Teaching',
] as const;
