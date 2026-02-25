/**
 * Quiz Type Definitions
 */
export type QuizType =
    | 'daily'
    | 'rapid-fire'
    | 'mini-test'
    | 'sectional'
    | 'full-prelims'
    | 'full-mains'
    | 'speed-challenge';

export type ExamLevel = 'prelims' | 'mains' | 'both';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

/**
 * Subject Distribution for quiz patterns
 */
export interface SubjectDistribution {
    subject: string;
    questions: number;
    duration: number;
}

/**
 * Quiz Pattern Configuration
 */
export interface QuizPattern {
    type: QuizType;
    title: string;
    description: string;
    totalQuestions: number;
    duration: number; // in minutes
    examLevel: ExamLevel;
    subjects: SubjectDistribution[];
    frequency: string;
    icon: string;
    color: string;
}

/**
 * Extended Quiz Interface
 */
export interface ExtendedQuiz {
    id: string;
    type: QuizType;
    title: string;
    description?: string;
    subject: string;
    questions: number;
    duration: number;
    difficulty: DifficultyLevel;
    scheduledDate: string;
    examLevel: ExamLevel;
    isLocked: boolean;
    isNew?: boolean;
    totalUsers?: number;
    completed?: boolean;
    score?: number;
    pattern?: QuizPattern;
}

/**
 * Quiz Type Patterns Configuration
 */
export const QUIZ_PATTERNS: Record<QuizType, QuizPattern> = {
    'daily': {
        type: 'daily',
        title: 'Daily Quiz',
        description: 'Quick 15-question mixed practice for consistent daily learning',
        totalQuestions: 15,
        duration: 15,
        examLevel: 'prelims',
        subjects: [
            { subject: 'Quantitative Aptitude', questions: 3, duration: 3 },
            { subject: 'Reasoning', questions: 3, duration: 3 },
            { subject: 'English', questions: 3, duration: 3 },
            { subject: 'General Awareness', questions: 3, duration: 3 },
            { subject: 'Current Affairs', questions: 3, duration: 3 },
        ],
        frequency: 'Daily',
        icon: 'Calendar',
        color: 'blue',
    },
    'rapid-fire': {
        type: 'rapid-fire',
        title: 'Rapid Fire',
        description: 'Fast-paced 10-question challenge to test your speed',
        totalQuestions: 10,
        duration: 10,
        examLevel: 'prelims',
        subjects: [
            { subject: 'Mixed', questions: 10, duration: 10 },
        ],
        frequency: 'Twice weekly per subject',
        icon: 'Zap',
        color: 'orange',
    },
    'speed-challenge': {
        type: 'speed-challenge',
        title: 'Speed Challenge',
        description: 'Ultra-fast 20-question sprint to maximize your speed',
        totalQuestions: 20,
        duration: 15,
        examLevel: 'prelims',
        subjects: [
            { subject: 'Mixed', questions: 20, duration: 15 },
        ],
        frequency: 'Weekly',
        icon: 'Rocket',
        color: 'red',
    },
    'mini-test': {
        type: 'mini-test',
        title: 'Mini Test',
        description: '30-question subject-specific test for topic mastery',
        totalQuestions: 30,
        duration: 25,
        examLevel: 'both',
        subjects: [
            { subject: 'Single Subject', questions: 30, duration: 25 },
        ],
        frequency: 'Weekly per subject',
        icon: 'BookOpen',
        color: 'green',
    },
    'sectional': {
        type: 'sectional',
        title: 'Sectional Test',
        description: 'Comprehensive 50-question subject deep-dive',
        totalQuestions: 50,
        duration: 45,
        examLevel: 'both',
        subjects: [
            { subject: 'Single Subject', questions: 50, duration: 45 },
        ],
        frequency: 'Bi-weekly per subject',
        icon: 'Target',
        color: 'purple',
    },
    'full-prelims': {
        type: 'full-prelims',
        title: 'Full Test - Prelims',
        description: 'Complete 100-question prelims pattern mock test',
        totalQuestions: 100,
        duration: 60,
        examLevel: 'prelims',
        subjects: [
            { subject: 'Quantitative Aptitude', questions: 35, duration: 21 },
            { subject: 'Reasoning', questions: 35, duration: 21 },
            { subject: 'English', questions: 30, duration: 18 },
        ],
        frequency: 'Monthly',
        icon: 'Award',
        color: 'yellow',
    },
    'full-mains': {
        type: 'full-mains',
        title: 'Full Test - Mains',
        description: 'Complete 155-question mains pattern mock test',
        totalQuestions: 155,
        duration: 180,
        examLevel: 'mains',
        subjects: [
            { subject: 'Quantitative Aptitude', questions: 35, duration: 42 },
            { subject: 'Reasoning', questions: 45, duration: 54 },
            { subject: 'English', questions: 35, duration: 42 },
            { subject: 'General Awareness', questions: 40, duration: 42 },
        ],
        frequency: 'Monthly',
        icon: 'Trophy',
        color: 'indigo',
    },
};

/**
 * Get quiz pattern by type
 */
export function getQuizPattern(type: QuizType): QuizPattern {
    return QUIZ_PATTERNS[type];
}

/**
 * Get all quiz types
 */
export function getAllQuizTypes(): QuizType[] {
    return Object.keys(QUIZ_PATTERNS) as QuizType[];
}

/**
 * Get quiz types by exam level
 */
export function getQuizTypesByLevel(level: ExamLevel): QuizType[] {
    return Object.entries(QUIZ_PATTERNS)
        .filter(([_, pattern]) => pattern.examLevel === level || pattern.examLevel === 'both')
        .map(([type]) => type as QuizType);
}
