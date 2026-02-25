import { DailyQuiz } from '@/utils/quizGenerator';

/**
 * Quiz Completion Data Structure
 */
export interface QuizCompletion {
    quizId: string;
    completed: boolean;
    score: number;
    accuracy: number;
    timeSpent: number;
    correctAnswers: number;
    totalQuestions: number;
    date: string;
    subject: string;
    topic?: string;
    answers: {
        questionId: string;
        correct: boolean;
        timeSpent: number;
    }[];
}

/**
 * Subject Performance Metrics
 */
export interface SubjectPerformance {
    subject: string;
    totalQuizzes: number;
    averageScore: number;
    averageAccuracy: number;
    totalTimeSpent: number;
    strongTopics: string[];
    weakTopics: string[];
}

/**
 * Weak Area Analysis
 */
export interface WeakArea {
    topic: string;
    subject: string;
    accuracy: number;
    quizzesTaken: number;
    averageTimePerQuestion: number;
    priority: 'High' | 'Medium' | 'Low';
    examRelevance: number;
    suggestedQuizzes: number;
    reason: string;
}

/**
 * Streak Data
 */
export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    totalQuizzesCompleted: number;
    lastCompletedDate: string;
    todayCompleted: boolean;
    weeklyProgress: boolean[];
}

/**
 * Get quiz completions from localStorage
 */
export function getQuizCompletions(): Record<string, QuizCompletion> {
    try {
        const data = localStorage.getItem('quizCompletions');
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error loading quiz completions:', error);
        return {};
    }
}

/**
 * Save quiz completion to localStorage
 */
export function saveQuizCompletion(completion: QuizCompletion): void {
    try {
        const completions = getQuizCompletions();
        completions[completion.quizId] = completion;
        localStorage.setItem('quizCompletions', JSON.stringify(completions));
    } catch (error) {
        console.error('Error saving quiz completion:', error);
    }
}

/**
 * Calculate subject-wise performance
 */
export function calculateSubjectPerformance(
    completions: Record<string, QuizCompletion>
): SubjectPerformance[] {
    const subjectMap = new Map<string, QuizCompletion[]>();

    // Group completions by subject
    Object.values(completions).forEach((completion) => {
        if (!subjectMap.has(completion.subject)) {
            subjectMap.set(completion.subject, []);
        }
        subjectMap.get(completion.subject)!.push(completion);
    });

    // Calculate metrics for each subject
    return Array.from(subjectMap.entries()).map(([subject, subjectCompletions]) => {
        const totalQuizzes = subjectCompletions.length;
        const averageScore =
            subjectCompletions.reduce((sum, c) => sum + c.score, 0) / totalQuizzes;
        const averageAccuracy =
            subjectCompletions.reduce((sum, c) => sum + c.accuracy, 0) / totalQuizzes;
        const totalTimeSpent = subjectCompletions.reduce((sum, c) => sum + c.timeSpent, 0);

        // Identify topics (if available)
        const topicAccuracy = new Map<string, { accuracy: number; count: number }>();
        subjectCompletions.forEach((completion) => {
            if (completion.topic) {
                const current = topicAccuracy.get(completion.topic) || { accuracy: 0, count: 0 };
                topicAccuracy.set(completion.topic, {
                    accuracy: current.accuracy + completion.accuracy,
                    count: current.count + 1,
                });
            }
        });

        const topicAverages = Array.from(topicAccuracy.entries()).map(([topic, data]) => ({
            topic,
            accuracy: data.accuracy / data.count,
        }));

        topicAverages.sort((a, b) => b.accuracy - a.accuracy);

        return {
            subject,
            totalQuizzes,
            averageScore,
            averageAccuracy,
            totalTimeSpent,
            strongTopics: topicAverages.slice(0, 3).map((t) => t.topic),
            weakTopics: topicAverages.slice(-3).map((t) => t.topic),
        };
    });
}

/**
 * Identify weak areas based on quiz performance
 */
export function identifyWeakAreas(
    completions: Record<string, QuizCompletion>
): WeakArea[] {
    const topicMap = new Map<
        string,
        {
            subject: string;
            accuracySum: number;
            quizCount: number;
            timeSum: number;
            questionCount: number;
        }
    >();

    // Aggregate data by topic
    Object.values(completions).forEach((completion) => {
        const topic = completion.topic || completion.subject;
        const key = `${completion.subject}::${topic}`;

        const current = topicMap.get(key) || {
            subject: completion.subject,
            accuracySum: 0,
            quizCount: 0,
            timeSum: 0,
            questionCount: 0,
        };

        topicMap.set(key, {
            subject: completion.subject,
            accuracySum: current.accuracySum + completion.accuracy,
            quizCount: current.quizCount + 1,
            timeSum: current.timeSum + completion.timeSpent,
            questionCount: current.questionCount + completion.totalQuestions,
        });
    });

    // Calculate weak areas
    const weakAreas: WeakArea[] = [];

    topicMap.forEach((data, key) => {
        const [subject, topic] = key.split('::');
        const accuracy = data.accuracySum / data.quizCount;
        const averageTimePerQuestion = data.timeSum / data.questionCount;

        // Consider weak if accuracy < 65%
        if (accuracy < 65) {
            // Determine priority
            let priority: 'High' | 'Medium' | 'Low' = 'Low';
            if (accuracy < 50) priority = 'High';
            else if (accuracy < 60) priority = 'Medium';

            // Estimate exam relevance (mock - in real app, this would be based on exam syllabus)
            const examRelevance = Math.floor(70 + Math.random() * 25);

            // Determine reason
            let reason = 'Needs more practice';
            if (accuracy < 40) reason = 'Critical weakness - requires immediate attention';
            else if (accuracy < 50) reason = 'Low accuracy in recent tests';
            else if (data.quizCount < 3) reason = 'Not practiced recently';

            weakAreas.push({
                topic,
                subject,
                accuracy: Math.round(accuracy),
                quizzesTaken: data.quizCount,
                averageTimePerQuestion: Math.round(averageTimePerQuestion),
                priority,
                examRelevance,
                suggestedQuizzes: priority === 'High' ? 5 : priority === 'Medium' ? 3 : 2,
                reason,
            });
        }
    });

    // Sort by priority and accuracy
    weakAreas.sort((a, b) => {
        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.accuracy - b.accuracy;
    });

    return weakAreas;
}

/**
 * Calculate streak data
 */
export function calculateStreakData(): StreakData {
    const completions = getQuizCompletions();
    const completionDates = new Set(
        Object.values(completions).map((c) => c.date.split('T')[0])
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);

    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (completionDates.has(dateStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    // Calculate longest streak
    const sortedDates = Array.from(completionDates).sort();
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor(
            (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 1;
        }
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    // Calculate weekly progress (last 7 days)
    const weeklyProgress: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        weeklyProgress.push(completionDates.has(dateStr));
    }

    return {
        currentStreak,
        longestStreak,
        totalQuizzesCompleted: Object.keys(completions).length,
        lastCompletedDate:
            sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : '',
        todayCompleted: completionDates.has(todayStr),
        weeklyProgress,
    };
}

/**
 * Get overall statistics
 */
export function getOverallStatistics() {
    const completions = getQuizCompletions();
    const completionsList = Object.values(completions);

    if (completionsList.length === 0) {
        return {
            totalQuizzes: 0,
            averageScore: 0,
            averageAccuracy: 0,
            totalTimeSpent: 0,
        };
    }

    return {
        totalQuizzes: completionsList.length,
        averageScore: Math.round(
            completionsList.reduce((sum, c) => sum + c.score, 0) / completionsList.length
        ),
        averageAccuracy: Math.round(
            completionsList.reduce((sum, c) => sum + c.accuracy, 0) / completionsList.length
        ),
        totalTimeSpent: completionsList.reduce((sum, c) => sum + c.timeSpent, 0),
    };
}
