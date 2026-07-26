/**
 * API utility — all requests to the Express/PostgreSQL backend.
 * Automatically attaches the JWT from localStorage.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

  // ── Courses ──────────────────────────────────────────────
  getCourses: (params?: { category?: string; instructor?: string; search?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) qs.set(k, String(v)); });
    const q = qs.toString();
    return request<{ courses: CoursePayload[]; total: number }>(`/courses${q ? '?' + q : ''}`);
  },

  getCourse: (id: string) => request<CourseDetailPayload>(`/courses/${id}`),

  getCourseCategories: () =>
    request<{ category: string; count: number }[]>('/courses/categories'),

  getEnrolledCourses: () => request<CoursePayload[]>('/courses/enrolled'),

  createCourse: (data: Record<string, any>) =>
    request<CoursePayload>('/courses', { method: 'POST', body: JSON.stringify(data) }),

  updateCourse: (id: string, data: Record<string, any>) =>
    request<CoursePayload>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteCourse: (id: string) =>
    request<{ ok: boolean }>(`/courses/${id}`, { method: 'DELETE' }),

  enrollInCourse: (id: string) =>
    request<{ userId: string; courseId: string; progressPct: number }>(`/courses/${id}/enroll`, { method: 'POST' }),

  // ── Quiz Bank ────────────────────────────────────────────
  getQuizCategories: () =>
    request<{ id: string; name: string; quiz_count: number }[]>('/quizzes/categories'),

  getQuizBank: (params?: { type?: string; category_id?: string; subject?: string; difficulty?: string; search?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) qs.set(k, String(v)); });
    const q = qs.toString();
    return request<{ quizzes: QuizBankPayload[]; total: number }>(`/quizzes${q ? '?' + q : ''}`);
  },

  getQuizBankItem: (id: string) => request<QuizBankDetailPayload>(`/quizzes/${id}`),

  createQuiz: (data: Record<string, any>) =>
    request<QuizBankPayload>('/quizzes', { method: 'POST', body: JSON.stringify(data) }),

  updateQuiz: (id: string, data: Record<string, any>) =>
    request<QuizBankPayload>(`/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteQuiz: (id: string) =>
    request<{ ok: boolean }>(`/quizzes/${id}`, { method: 'DELETE' }),

  addQuizQuestions: (quizId: string, questions: Record<string, any>[]) =>
    request<{ questions: any[]; count: number }>(`/quizzes/${quizId}/questions`, {
      method: 'POST', body: JSON.stringify({ questions }),
    }),

  updateQuizQuestion: (questionId: string, data: Record<string, any>) =>
    request<any>(`/quizzes/questions/${questionId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ── Blogs ────────────────────────────────────────────────
  getBlogs: (params?: { category?: string; search?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) qs.set(k, String(v)); });
    const q = qs.toString();
    return request<{ blogs: BlogPayload[]; total: number }>(`/blogs${q ? '?' + q : ''}`);
  },

  getBlog: (slug: string) => request<BlogPayload & { content: string }>(`/blogs/${slug}`),

  createBlog: (data: Record<string, any>) =>
    request<BlogPayload>('/blogs', { method: 'POST', body: JSON.stringify(data) }),

  updateBlog: (id: string, data: Record<string, any>) =>
    request<BlogPayload>(`/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteBlog: (id: string) =>
    request<{ ok: boolean }>(`/blogs/${id}`, { method: 'DELETE' }),

  // ── Current Affairs ──────────────────────────────────────
  getCurrentAffairs: (params?: { category?: string; topic?: string; publish_type?: string; search?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) qs.set(k, String(v)); });
    const q = qs.toString();
    return request<{ articles: CurrentAffairsPayload[]; total: number }>(`/current-affairs${q ? '?' + q : ''}`);
  },

  getCurrentAffairsTopics: () =>
    request<{ topic: string; count: number }[]>('/current-affairs/topics'),

  getCurrentAffairsArticle: (id: string) =>
    request<CurrentAffairsPayload>(`/current-affairs/${id}`),

  createCurrentAffairsArticle: (data: Record<string, any>) =>
    request<CurrentAffairsPayload>('/current-affairs', { method: 'POST', body: JSON.stringify(data) }),

  updateCurrentAffairsArticle: (id: string, data: Record<string, any>) =>
    request<CurrentAffairsPayload>(`/current-affairs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteCurrentAffairsArticle: (id: string) =>
    request<{ ok: boolean }>(`/current-affairs/${id}`, { method: 'DELETE' }),

  // ── Mentors ──────────────────────────────────────────────
  getMentors: (params?: { category?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) qs.set(k, String(v)); });
    const q = qs.toString();
    return request<MentorPayload[]>(`/mentors${q ? '?' + q : ''}`);
  },

  assignMentor: (data: { mentor_id: string; student_id: string; category?: string }) =>
    request<any>('/mentors/assign', { method: 'POST', body: JSON.stringify(data) }),

  unassignMentorStudent: (mentorId: string, studentId: string) =>
    request<{ ok: boolean }>(`/mentors/${mentorId}/students/${studentId}`, { method: 'DELETE' }),

  getMentorStudents: (id: string) => request<MentorStudentPayload[]>(`/mentors/${id}/students`),

  getStudentWeakAreas: (id: string) => request<WeakAreaPayload[]>(`/students/${id}/weak-areas`),

  createStudentWeakAreas: (id: string, weakAreas: Record<string, any>[]) =>
    request<WeakAreaPayload[]>(`/students/${id}/weak-areas`, {
      method: 'POST', body: JSON.stringify({ weak_areas: weakAreas }),
    }),

  getStudentRecommendations: (id: string) => request<RecommendationPayload[]>(`/students/${id}/recommendations`),

  createStudentRecommendation: (id: string, data: Record<string, any>) =>
    request<RecommendationPayload>(`/students/${id}/recommendations`, {
      method: 'POST', body: JSON.stringify(data),
    }),

  // ── Vocabulary ───────────────────────────────────────────
  getVocabularyWords: (params?: { difficulty?: string; category?: string; search?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) qs.set(k, String(v)); });
    const q = qs.toString();
    return request<{ words: VocabularyWordPayload[]; total: number }>(`/vocabulary${q ? '?' + q : ''}`);
  },

  getVocabularyCategories: () =>
    request<{ category: string; word_count: number }[]>('/vocabulary/categories'),

  getVocabularyProgress: () => request<VocabularyProgressPayload[]>('/vocabulary/progress'),

  updateVocabularyProgress: (data: { word_id: string; correct: boolean }) =>
    request<VocabularyProgressPayload>('/vocabulary/progress', {
      method: 'POST', body: JSON.stringify(data),
    }),

  getVocabularyPractice: () => request<VocabularyWordPayload[]>('/vocabulary/practice'),

  createVocabularyWord: (data: Record<string, any>) =>
    request<VocabularyWordPayload>('/vocabulary/words', { method: 'POST', body: JSON.stringify(data) }),

  updateVocabularyWord: (id: string, data: Record<string, any>) =>
    request<VocabularyWordPayload>(`/vocabulary/words/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteVocabularyWord: (id: string) =>
    request<{ ok: boolean }>(`/vocabulary/words/${id}`, { method: 'DELETE' }),

  // ── Payments & Subscriptions ─────────────────────────────
  getPlans: () => request<PlanPayload[]>('/plans'),

  getMySubscription: () => request<SubscriptionPayload | null>('/subscriptions/me'),

  createSubscription: (data: { plan_id: string; billing_cycle: 'monthly' | 'yearly' }) =>
    request<{ order_id: string; amount: number; currency: string }>('/subscriptions/create', {
      method: 'POST', body: JSON.stringify(data),
    }),

  verifySubscription: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    request<{ ok: boolean }>('/subscriptions/verify', { method: 'POST', body: JSON.stringify(data) }),

  cancelSubscription: () =>
    request<{ ok: boolean }>('/subscriptions/cancel', { method: 'POST' }),

  validateCoupon: (code: string, order_amount: number) =>
    request<CouponValidationPayload>('/coupons/validate', {
      method: 'POST', body: JSON.stringify({ code, order_amount }),
    }),

  getPaymentHistory: () => request<PaymentHistoryPayload[]>('/payments/history'),

  getRevenueSummary: () => request<RevenueSummaryPayload>('/revenue/summary'),

  // ── Analytics ────────────────────────────────────────────
  getQuizPerformance: () => request<QuizPerformancePayload>('/analytics/quiz-performance'),

  getStudyTime: (period: 'day' | 'week' | 'month' = 'week') =>
    request<{ period: string; data: { period_date: string; total_time: number }[] }>(`/analytics/study-time?period=${period}`),

  getProgress: () => request<{ weeks: { week_start: string; quizzes_taken: number; avg_score: number; active_days: number }[] }>('/analytics/progress'),

  getAdminOverview: () => request<AdminOverviewPayload>('/analytics/admin/overview'),

  getMentorStudentAnalytics: (mentorId: string) =>
    request<any[]>(`/analytics/mentor/${mentorId}/students`),

  // ── Leaderboard ──────────────────────────────────────────
  getGlobalLeaderboard: () =>
    request<{ leaderboard: LeaderboardEntryPayload[]; user_rank: number }>('/leaderboard/global'),

  getQuizLeaderboard: (quizId: string) =>
    request<{ leaderboard: LeaderboardEntryPayload[]; user_rank: number }>(`/leaderboard/quiz/${quizId}`),

  // ── Exam Notifications ───────────────────────────────────
  getExamNotifications: (params?: { category?: string; status?: string; search?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) qs.set(k, String(v)); });
    const q = qs.toString();
    return request<{ notifications: ExamNotificationPayload[]; total: number }>(`/exam-notifications${q ? '?' + q : ''}`);
  },

  getExamNotification: (id: string) => request<ExamNotificationPayload>(`/exam-notifications/${id}`),

  createExamNotification: (data: Record<string, any>) =>
    request<ExamNotificationPayload>('/exam-notifications', { method: 'POST', body: JSON.stringify(data) }),

  updateExamNotification: (id: string, data: Record<string, any>) =>
    request<ExamNotificationPayload>(`/exam-notifications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteExamNotification: (id: string) =>
    request<{ ok: boolean }>(`/exam-notifications/${id}`, { method: 'DELETE' }),

  // ── Study Materials ──────────────────────────────────────
  getMaterials: (params?: { type?: string; category?: string; subject?: string; search?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) qs.set(k, String(v)); });
    const q = qs.toString();
    return request<{ materials: MaterialPayload[]; total: number }>(`/materials${q ? '?' + q : ''}`);
  },

  getMaterial: (id: string) => request<MaterialPayload>(`/materials/${id}`),

  downloadMaterial: (id: string) =>
    request<MaterialPayload>(`/materials/${id}/download`, { method: 'POST' }),

  createMaterial: (data: Record<string, any>) =>
    request<MaterialPayload>('/materials', { method: 'POST', body: JSON.stringify(data) }),

  updateMaterial: (id: string, data: Record<string, any>) =>
    request<MaterialPayload>(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteMaterial: (id: string) =>
    request<{ ok: boolean }>(`/materials/${id}`, { method: 'DELETE' }),

  // ── Notifications ────────────────────────────────────────
  getNotifications: () =>
    request<{ notifications: NotificationPayload[]; unread: number }>('/notifications'),

  markNotificationRead: (id: string) =>
    request<{ ok: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    request<{ ok: boolean }>('/notifications/read-all', { method: 'PATCH' }),

  // ── Profile & Account ────────────────────────────────────
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: boolean }>('/change-password', {
      method: 'POST', body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),

  updatePreferences: (data: { notification_enabled?: boolean; theme?: string; language?: string }) =>
    request<{ ok: boolean }>('/users/me/preferences', { method: 'PUT', body: JSON.stringify(data) }),

  deleteAccount: () =>
    request<{ ok: boolean }>('/users/me', { method: 'DELETE' }),
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

// ── New payload types ────────────────────────────────────────
export interface CoursePayload {
  id: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  difficulty?: string;
  thumbnailUrl?: string;
  instructorId: string;
  instructorName?: string;
  instructorFullName?: string;
  instructorAvatar?: string;
  durationHours: number;
  enrolledCount: number;
  rating: number;
  isPublished: boolean;
  isFree: boolean;
  price: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseDetailPayload extends CoursePayload {
  subjects: {
    id: string;
    courseId: string;
    title: string;
    description?: string;
    orderIndex: number;
    createdAt: string;
    chapters: {
      id: string;
      subjectId: string;
      title: string;
      description?: string;
      videoUrl?: string;
      durationMinutes: number;
      orderIndex: number;
      isFreePreview: boolean;
      createdAt: string;
    }[];
  }[];
}

export interface QuizBankPayload {
  id: string;
  title: string;
  description?: string;
  type: string;
  category_id?: string;
  category_name?: string;
  subject?: string;
  total_questions: number;
  duration_minutes?: number;
  max_score: number;
  difficulty: string;
  exam_type?: string;
  is_published: boolean;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizBankDetailPayload extends QuizBankPayload {
  questions: {
    id: string;
    quiz_id: string;
    question_text: string;
    question_type: string;
    options: any;
    explanation?: string;
    difficulty: string;
    subject?: string;
    topic?: string;
    marks: number;
    negative_marks: number;
    order_index: number;
    sets?: any;
    created_at: string;
  }[];
}

export interface BlogPayload {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  author_name?: string;
  author_id?: string;
  category?: string;
  tags: string[];
  featured_image?: string;
  status: string;
  is_ai_generated: boolean;
  reading_time_minutes: number;
  views_count: number;
  seo_meta?: any;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CurrentAffairsPayload {
  id: string;
  title: string;
  content?: string;
  summary?: string;
  category?: string;
  topic?: string;
  publish_type?: string;
  source?: string;
  image_url?: string;
  tags: string[];
  inline_quiz: any[];
  status: string;
  created_by?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MentorPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  student_count: number;
}

export interface MentorStudentPayload {
  id: string;
  name: string;
  email: string;
  department?: string;
  assigned_at: string;
  assignment_category?: string;
  weak_area_count: number;
  avg_accuracy: number;
}

export interface WeakAreaPayload {
  id: string;
  student_id: string;
  topic: string;
  subject?: string;
  accuracy_pct: number;
  attempt_count: number;
  trend: string;
  flagged: boolean;
}

export interface RecommendationPayload {
  id: string;
  student_id: string;
  mentor_id: string;
  mentor_name?: string;
  weak_area_id?: string;
  message: string;
  resource_type?: string;
  resource_id?: string;
  resource_title?: string;
  sent_at?: string;
  created_at?: string;
}

export interface VocabularyWordPayload {
  id: string;
  word: string;
  definition: string;
  example?: string;
  difficulty: string;
  category?: string;
  synonyms: string[];
  antonyms: string[];
  pronunciation?: string;
  is_active?: boolean;
}

export interface VocabularyProgressPayload {
  id: string;
  user_id: string;
  word_id: string;
  mastery_level: string;
  correct_count: number;
  incorrect_count: number;
  next_review_at?: string;
  last_reviewed_at?: string;
  word?: string;
  definition?: string;
  difficulty?: string;
  category?: string;
}

export interface PlanPayload {
  id: string;
  display_name: string;
  description?: string;
  monthly_price: number;
  yearly_price: number;
  features: any;
  category_access: any;
  limits: any;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface SubscriptionPayload {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name?: string;
  billing_cycle: string;
  status: string;
  starts_at: string;
  expires_at: string;
  created_at: string;
}

export interface CouponValidationPayload {
  valid: boolean;
  error?: string;
  coupon_id?: string;
  code?: string;
  discount_type?: string;
  discount_value?: number;
  discount_amount?: number;
  applicable_to?: string;
}

export interface PaymentHistoryPayload {
  id: string;
  amount: number;
  currency: string;
  status: string;
  plan_name?: string;
  billing_cycle?: string;
  created_at: string;
}

export interface RevenueSummaryPayload {
  total_revenue: number;
  active_subscriptions: number;
  mrr: number;
  recent_payments: any[];
}

export interface QuizPerformancePayload {
  total_quizzes: number;
  avg_score: number;
  avg_accuracy: number;
  best_score: number;
  subject_accuracy: { subject: string; accuracy: number }[];
  topic_accuracy: { topic: string; accuracy: number }[];
  score_trend: { id: string; quiz_id: string; date: string; score: number; percentage: number }[];
}

export interface AdminOverviewPayload {
  total_students: number;
  quizzes_taken_today: number;
  active_users_this_week: number;
  role_distribution: { role: string; count: number }[];
  quiz_completion_rate: number;
}

export interface LeaderboardEntryPayload {
  rank: number;
  id: string;
  name: string;
  avatar?: string;
  total_points: number;
  current_streak: number;
  total_quizzes_taken: number;
  score?: number;
  duration?: number;
  date?: string;
}

export interface ExamNotificationPayload {
  id: string;
  title: string;
  description?: string;
  exam_name?: string;
  organization?: string;
  category?: string;
  application_start?: string;
  application_end?: string;
  exam_date?: string;
  admit_card_date?: string;
  result_date?: string;
  status: string;
  link?: string;
  metadata?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaterialPayload {
  id: string;
  title: string;
  description?: string;
  type: string;
  category?: string;
  subject?: string;
  fileUrl?: string;
  fileSizeBytes: number;
  downloadCount: number;
  createdBy: string;
  createdByName?: string;
  isFree: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}
