import { ExtendedQuiz, QuizType, QUIZ_PATTERNS, DifficultyLevel, ExamLevel } from '@/types/quizTypes';

/**
 * Quiz templates organized by type and subject
 */
interface QuizTemplateConfig {
    subjects: {
        [key: string]: {
            topics: string[];
            questionRange: { min: number; max: number };
            durationRange: { min: number; max: number };
        };
    };
}

const quizTemplate: QuizTemplateConfig = {
    subjects: {
        'Quantitative Aptitude': {
            topics: [
                'Number System', 'Simplification', 'Percentage', 'Ratio & Proportion',
                'Average', 'Time & Work', 'Time & Distance', 'Profit & Loss',
                'Simple & Compound Interest', 'Data Interpretation', 'Mensuration',
                'Algebra', 'Data Sufficiency', 'Quadratic Equations',
            ],
            questionRange: { min: 10, max: 20 },
            durationRange: { min: 10, max: 20 },
        },
        Reasoning: {
            topics: [
                'Syllogism', 'Coding-Decoding', 'Blood Relations', 'Seating Arrangement',
                'Puzzles', 'Direction Sense', 'Input-Output', 'Logical Reasoning',
                'Inequality', 'Data Sufficiency', 'Statement & Assumptions', 'Critical Reasoning',
            ],
            questionRange: { min: 10, max: 15 },
            durationRange: { min: 8, max: 15 },
        },
        English: {
            topics: [
                'Reading Comprehension', 'Cloze Test', 'Error Spotting', 'Sentence Improvement',
                'Para Jumbles', 'Fill in the Blanks', 'Vocabulary', 'Idioms & Phrases',
                'One Word Substitution', 'Active-Passive Voice', 'Direct-Indirect Speech',
            ],
            questionRange: { min: 15, max: 25 },
            durationRange: { min: 10, max: 20 },
        },
        'General Awareness': {
            topics: [
                'Banking Awareness', 'Financial Awareness', 'Static GK', 'Economic Terms',
                'Government Schemes', 'Awards & Honours', 'Books & Authors', 'Sports',
                'Indian History', 'Geography', 'Science & Technology',
            ],
            questionRange: { min: 10, max: 20 },
            durationRange: { min: 8, max: 15 },
        },
        'Current Affairs': {
            topics: [
                'National Affairs', 'International Affairs', 'Banking & Finance', 'Economy',
                'Sports News', 'Awards & Appointments', 'Summits & Conferences', 'Defence & Security',
            ],
            questionRange: { min: 10, max: 15 },
            durationRange: { min: 5, max: 10 },
        },
    },
};

function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function getDifficulty(dayIndex: number): DifficultyLevel {
    const pattern = dayIndex % 3;
    if (pattern === 0) return 'Easy';
    if (pattern === 1) return 'Medium';
    return 'Hard';
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Generate Daily Quizzes - Multiple per day for demo
 */
function generateDailyQuizzes(startDate: Date, endDate: Date): ExtendedQuiz[] {
    const quizzes: ExtendedQuiz[] = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate);
        const dayIndex = Math.floor(currentDate.getTime() / (1000 * 60 * 60 * 24));
        const isToday = currentDate.getTime() === today.getTime();

        // Generate 4 daily quizzes for variety
        for (let i = 0; i < 4; i++) {
            quizzes.push({
                id: `daily-${dateStr}-${i}`,
                type: 'daily',
                title: isToday ? "Today's Mixed Practice" : "Daily Mixed Practice",
                description: '15 questions covering all subjects',
                subject: 'Mixed',
                questions: 15,
                duration: 15,
                difficulty: getDifficulty(dayIndex + i),
                scheduledDate: dateStr,
                examLevel: 'prelims',
                isLocked: false,
                isNew: isToday && i === 0,
                totalUsers: Math.floor(1500 + seededRandom(dayIndex + i) * 1000),
            });
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return quizzes;
}

/**
 * Generate Rapid Fire - Multiple daily
 */
function generateRapidFireQuizzes(startDate: Date, endDate: Date): ExtendedQuiz[] {
    const quizzes: ExtendedQuiz[] = [];
    const subjects = Object.keys(quizTemplate.subjects);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate);
        const dayIndex = Math.floor(currentDate.getTime() / (1000 * 60 * 60 * 24));

        // Generate 3 rapid-fire quizzes daily
        subjects.slice(0, 3).forEach((subject, index) => {
            quizzes.push({
                id: `rapid-${dateStr}-${index}`,
                type: 'rapid-fire',
                title: `Rapid Fire - ${subject}`,
                description: '10 quick questions to test your speed',
                subject,
                questions: 10,
                duration: 10,
                difficulty: 'Medium',
                scheduledDate: dateStr,
                examLevel: 'prelims',
                isLocked: false,
                totalUsers: Math.floor(800 + seededRandom(dayIndex + index) * 500),
            });
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return quizzes;
}

/**
 * Generate Speed Challenge - Multiple daily
 */
function generateSpeedChallengeQuizzes(startDate: Date, endDate: Date): ExtendedQuiz[] {
    const quizzes: ExtendedQuiz[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate);
        const dayIndex = Math.floor(currentDate.getTime() / (1000 * 60 * 60 * 24));

        // Generate 2 speed challenges daily
        for (let i = 0; i < 2; i++) {
            quizzes.push({
                id: `speed-${dateStr}-${i}`,
                type: 'speed-challenge',
                title: `Speed Challenge ${i + 1}`,
                description: '20 questions in 15 minutes - test your limits!',
                subject: 'Mixed',
                questions: 20,
                duration: 15,
                difficulty: 'Hard',
                scheduledDate: dateStr,
                examLevel: 'prelims',
                isLocked: false,
                totalUsers: Math.floor(1200 + seededRandom(dayIndex + i) * 800),
            });
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return quizzes;
}

/**
 * Generate Mini Tests - Daily
 */
function generateMiniTests(startDate: Date, endDate: Date): ExtendedQuiz[] {
    const quizzes: ExtendedQuiz[] = [];
    const subjects = Object.keys(quizTemplate.subjects);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate);
        const dayIndex = Math.floor(currentDate.getTime() / (1000 * 60 * 60 * 24));

        // Generate 2 mini tests daily with different subjects
        for (let i = 0; i < 2; i++) {
            const subject = subjects[(dayIndex + i) % subjects.length];
            const topicIndex = Math.floor((dayIndex + i) / subjects.length) % quizTemplate.subjects[subject].topics.length;
            const topic = quizTemplate.subjects[subject].topics[topicIndex];

            quizzes.push({
                id: `mini-${dateStr}-${i}`,
                type: 'mini-test',
                title: `Mini Test - ${topic}`,
                description: `30 questions on ${subject}`,
                subject,
                questions: 30,
                duration: 25,
                difficulty: getDifficulty(dayIndex + i),
                scheduledDate: dateStr,
                examLevel: 'both',
                isLocked: false,
                totalUsers: Math.floor(900 + seededRandom(dayIndex + i) * 600),
            });
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return quizzes;
}

/**
 * Generate Sectional Tests - Daily per subject
 */
function generateSectionalTests(startDate: Date, endDate: Date): ExtendedQuiz[] {
    const quizzes: ExtendedQuiz[] = [];
    const subjects = Object.keys(quizTemplate.subjects);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dayIndex = Math.floor(currentDate.getTime() / (1000 * 60 * 60 * 24));
        const dateStr = formatDate(currentDate);

        // Generate 2 sectional tests daily
        for (let i = 0; i < 2; i++) {
            const subject = subjects[(dayIndex + i) % subjects.length];

            quizzes.push({
                id: `sectional-${dateStr}-${i}`,
                type: 'sectional',
                title: `Sectional Test - ${subject}`,
                description: `50 comprehensive questions on ${subject}`,
                subject,
                questions: 50,
                duration: 45,
                difficulty: 'Hard',
                scheduledDate: dateStr,
                examLevel: 'both',
                isLocked: false,
                totalUsers: Math.floor(700 + seededRandom(dayIndex + i) * 400),
            });
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return quizzes;
}

/**
 * Generate Full Test Prelims - Daily
 */
function generateFullTestPrelims(startDate: Date, endDate: Date): ExtendedQuiz[] {
    const quizzes: ExtendedQuiz[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate);
        const dayIndex = Math.floor(currentDate.getTime() / (1000 * 60 * 60 * 24));

        // Generate 1 full prelims test daily
        quizzes.push({
            id: `full-prelims-${dateStr}`,
            type: 'full-prelims',
            title: 'Full Test - Prelims Pattern',
            description: '100 questions following exact prelims exam pattern',
            subject: 'All Subjects',
            questions: 100,
            duration: 60,
            difficulty: 'Hard',
            scheduledDate: dateStr,
            examLevel: 'prelims',
            isLocked: false,
            totalUsers: Math.floor(2000 + seededRandom(dayIndex) * 1500),
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return quizzes;
}

/**
 * Generate Full Test Mains - Daily
 */
function generateFullTestMains(startDate: Date, endDate: Date): ExtendedQuiz[] {
    const quizzes: ExtendedQuiz[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate);
        const dayIndex = Math.floor(currentDate.getTime() / (1000 * 60 * 60 * 24));

        // Generate 1 full mains test daily
        quizzes.push({
            id: `full-mains-${dateStr}`,
            type: 'full-mains',
            title: 'Full Test - Mains Pattern',
            description: '155 questions following exact mains exam pattern',
            subject: 'All Subjects',
            questions: 155,
            duration: 180,
            difficulty: 'Hard',
            scheduledDate: dateStr,
            examLevel: 'mains',
            isLocked: false,
            totalUsers: Math.floor(1800 + seededRandom(dayIndex) * 1200),
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return quizzes;
}

/**
 * Generate all quiz types for 365 days
 */
export function generateAllQuizTypes(): ExtendedQuiz[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 180);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 184);

    const allQuizzes: ExtendedQuiz[] = [
        ...generateDailyQuizzes(startDate, endDate),
        ...generateRapidFireQuizzes(startDate, endDate),
        ...generateSpeedChallengeQuizzes(startDate, endDate),
        ...generateMiniTests(startDate, endDate),
        ...generateSectionalTests(startDate, endDate),
        ...generateFullTestPrelims(startDate, endDate),
        ...generateFullTestMains(startDate, endDate),
    ];

    // Sort by date
    allQuizzes.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

    return allQuizzes;
}

/**
 * Get quizzes by type
 */
export function getQuizzesByType(quizzes: ExtendedQuiz[], type: QuizType): ExtendedQuiz[] {
    return quizzes.filter(q => q.type === type);
}

/**
 * Get quizzes by date
 */
export function getQuizzesByDate(quizzes: ExtendedQuiz[], date: string): ExtendedQuiz[] {
    return quizzes.filter(q => q.scheduledDate === date);
}

/**
 * Get quizzes by date and type
 */
export function getQuizzesByDateAndType(
    quizzes: ExtendedQuiz[],
    date: string,
    type?: QuizType
): ExtendedQuiz[] {
    return quizzes.filter(q =>
        q.scheduledDate === date && (!type || q.type === type)
    );
}
