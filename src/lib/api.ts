/**
 * API utility — all requests to the Express/PostgreSQL backend.
 * Automatically attaches the JWT from localStorage.
 */

const BASE_URL = 'http://localhost:3001/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      errorMsg = body.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────
  login: (email: string, password: string) =>
    request<{ token: string; user: UserPayload }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role?: string) =>
    request<{ token: string; user: UserPayload }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  // ── Users ─────────────────────────────────────────────────
  getMe: () => request<UserPayload>('/users/me'),

  updateMe: (data: Partial<{ name: string; avatar: string; targetExam: string }>) =>
    request<UserPayload>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // ── Quiz Results ──────────────────────────────────────────
  getQuizResults: () => request<QuizResultPayload[]>('/quiz/results'),

  saveQuizResult: (data: Partial<QuizResultPayload>) =>
    request<{ id: string; date: string }>('/quiz/results', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ── Streak ────────────────────────────────────────────────
  getStreak: () => request<StreakPayload>('/quiz/streak'),

  updateStreak: (data: StreakPayload) =>
    request<{ ok: boolean }>('/quiz/streak', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // ── Quiz Completions ──────────────────────────────────────
  getQuizCompletions: () =>
    request<Record<string, { completed: boolean; score: number; date: string; duration: number }>>('/quiz/completions'),

  markQuizComplete: (data: {
    quizId: string; completed?: boolean; score?: number; date?: string; duration?: number;
  }) =>
    request<{ ok: boolean }>('/quiz/completions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ── Tasks ─────────────────────────────────────────────────
  getTasks: () => request<TaskPayload[]>('/tasks'),

  createTask: (data: Partial<TaskPayload>) =>
    request<TaskPayload>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (id: number, data: Partial<TaskPayload>) =>
    request<TaskPayload>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTask: (id: number) =>
    request<{ ok: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),

  // ── Presence ──────────────────────────────────────────────
  markPresence: () =>
    request<{ ok: boolean; date: string }>('/presence', { method: 'POST' }),

  getPresence: () =>
    request<Record<string, boolean>>('/presence'),

  // ── Health ────────────────────────────────────────────────
  health: () => request<{ status: string }>('/health'),
};

// ── Shared types ──────────────────────────────────────────────
export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  targetExam?: string;
  avatar?: string;
}

export interface QuizResultPayload {
  id: string;
  quizId?: string;
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number;
  timePerQuestion: number[];
  topicAccuracy: Record<string, { correct: number; total: number }>;
  subjectAccuracy: Record<string, { correct: number; total: number }>;
  answers: {
    questionId: string;
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    timeTaken: number;
    topic: string;
    subject: string;
  }[];
}

export interface StreakPayload {
  currentStreak: number;
  longestStreak: number;
  lastQuizDate: string | null;
  totalQuizzesTaken: number;
  totalPoints: number;
  unlockedRewards: string[];
  dailyGoalCompleted: boolean;
}

export interface TaskPayload {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  category: string;
  priority: string;
  repeat?: string;
  tags?: string[];
}
