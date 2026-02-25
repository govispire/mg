
export type UserRole = 'student' | 'admin' | 'instructor' | 'employee' | 'super-admin' | 'owner' | 'mentor';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type TaskType = 'assignment' | 'test' | 'meeting' | 'presentation' | 'study' | 'revision' | 'project' | 'exam' | 'test-prep' | 'practice' | 'system-maintenance' | 'user-management' | 'content-review' | 'analytics-review' | 'deadline' | 'progress-review' | 'session-planning' | 'student-guidance' | 'assessment' | 'announcement';
export type ViewType = 'month' | 'week' | 'day' | 'progress' | 'list';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
  taskType: TaskType;
  completed: boolean;
  assignedBy?: UserRole | 'system' | 'board';
  assignedTo?: UserRole;
  images: string[];
  isAssigned?: boolean;
  missed?: boolean;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
}

export interface EventCategory {
  value: string;
  label: string;
  color: string;
  roles: UserRole[] | string[];
}

export const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'admin', label: 'Admin' },
  { value: 'employee', label: 'Employee' },
  { value: 'super-admin', label: 'Super Admin' },
  { value: 'owner', label: 'Owner' },
  { value: 'instructor', label: 'Instructor' }
] as const;

export const eventCategories: EventCategory[] = [
  { value: 'assignment', label: 'Assignment', color: 'bg-blue-500', roles: ['student', 'mentor', 'admin', 'employee', 'super-admin', 'owner'] },
  { value: 'test', label: 'Test', color: 'bg-red-500', roles: ['student', 'mentor', 'admin', 'employee', 'super-admin', 'owner'] },
  { value: 'meeting', label: 'Meeting', color: 'bg-green-500', roles: ['mentor', 'admin', 'employee', 'super-admin', 'owner'] },
  { value: 'presentation', label: 'Presentation', color: 'bg-purple-500', roles: ['student', 'mentor', 'admin', 'employee', 'super-admin', 'owner'] },
  { value: 'study', label: 'Study Session', color: 'bg-yellow-500', roles: ['student', 'mentor'] },
  { value: 'revision', label: 'Revision', color: 'bg-orange-500', roles: ['student', 'mentor'] },
  { value: 'project', label: 'Project', color: 'bg-indigo-500', roles: ['student', 'mentor', 'admin', 'employee', 'super-admin', 'owner'] },
  { value: 'exam', label: 'Exam', color: 'bg-pink-500', roles: ['student', 'mentor', 'admin'] },
  { value: 'content-creation', label: 'Content Creation', color: 'bg-teal-500', roles: ['employee', 'admin', 'super-admin', 'owner'] },
  { value: 'user-management', label: 'User Management', color: 'bg-cyan-500', roles: ['admin', 'super-admin', 'owner'] },
  { value: 'business-review', label: 'Business Review', color: 'bg-rose-500', roles: ['owner', 'super-admin'] },
];
