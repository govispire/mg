const { z } = require('zod');

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * @param {z.ZodSchema} schema
 * @returns {Function} Express middleware
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    req.body = result.data; // Use parsed (coerced/defaulted) values
    next();
  };
}

// ── Auth Schemas ──────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'employee', 'mentor', 'admin', 'super-admin', 'owner']).optional().default('student'),
});

// ── User Schemas ──────────────────────────────────────────────
const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  avatar: z.string().url().optional().nullable(),
  targetExam: z.string().max(255).optional().nullable(),
});

// ── Quiz Schemas ──────────────────────────────────────────────
const submitQuizResultSchema = z.object({
  quizId: z.string().optional(),
  score: z.number().int().min(0),
  totalQuestions: z.number().int().min(1),
  percentage: z.number().min(0).max(100),
  timeTaken: z.number().int().min(0),
  timePerQuestion: z.array(z.number()).optional().default([]),
  topicAccuracy: z.record(z.number()).optional().default({}),
  subjectAccuracy: z.record(z.number()).optional().default({}),
  answers: z.array(z.any()).optional().default([]),
});

const updateStreakSchema = z.object({
  currentStreak: z.number().int().min(0).optional(),
  longestStreak: z.number().int().min(0).optional(),
  totalQuizzesTaken: z.number().int().min(0).optional(),
  totalPoints: z.number().int().min(0).optional(),
  unlockedRewards: z.array(z.any()).optional(),
  dailyGoalCompleted: z.boolean().optional(),
});

const upsertQuizCompletionSchema = z.object({
  quizId: z.string().min(1),
  completed: z.boolean().optional().default(true),
  score: z.number().min(0).max(100).optional(),
  duration: z.number().int().min(0).optional(),
});

// ── Task Schemas ──────────────────────────────────────────────
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  category: z.string().max(100).optional().default('study'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  repeat: z.enum(['none', 'daily', 'weekly', 'monthly']).optional().default('none'),
  tags: z.array(z.string()).optional().default([]),
});

const updateTaskSchema = z.object({
  title: z.string().max(500).optional(),
  description: z.string().optional().nullable(),
  completed: z.boolean().optional(),
  dueDate: z.string().optional().nullable(),
  category: z.string().max(100).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  repeat: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
  tags: z.array(z.string()).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

// ── Admin User Schemas ────────────────────────────────────────
const createUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['employee', 'mentor', 'student', 'admin', 'super-admin', 'owner']),
  phone: z.string().max(20).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  employee_capacity: z.number().int().min(0).optional().default(0),
});

const editUserSchema = z.object({
  name: z.string().max(255).optional(),
  phone: z.string().max(20).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  employee_capacity: z.number().int().min(0).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

const resetPasswordSchema = z.object({
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
});

const bulkImportSchema = z.object({
  students: z.array(z.object({
    name: z.string().min(1),
    email: z.string().email(),
    exam: z.string().optional(),
    mentor_id: z.number().int().optional(),
  })).min(1, 'At least one student is required'),
});

// ── Staff Task Schemas ────────────────────────────────────────
const createStaffTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  assigned_to: z.number().int(),
  category: z.string().max(100).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  due_date: z.string().optional().nullable(),
});

const updateStaffTaskStatusSchema = z.object({
  status: z.enum(['assigned', 'in_progress', 'completed', 'blocked']),
  comment: z.string().optional(),
  proof_url: z.string().url().optional().nullable(),
  extension_reason: z.string().optional(),
});

const addCommentSchema = z.object({
  comment: z.string().min(1, 'Comment cannot be empty'),
});

module.exports = {
  validate,
  loginSchema,
  registerSchema,
  updateProfileSchema,
  submitQuizResultSchema,
  updateStreakSchema,
  upsertQuizCompletionSchema,
  createTaskSchema,
  updateTaskSchema,
  createUserSchema,
  editUserSchema,
  resetPasswordSchema,
  bulkImportSchema,
  createStaffTaskSchema,
  updateStaffTaskStatusSchema,
  addCommentSchema,
};
