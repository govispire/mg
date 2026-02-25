import { generateAllQuizTypes, ExtendedQuiz } from '@/utils/quizGenerator';

// Export the ExtendedQuiz type as DailyQuiz for backwards compatibility
export type DailyQuiz = ExtendedQuiz;
export type { ExtendedQuiz };

// Generate all quiz types automatically
console.log('[Quiz Generator] Generating quizzes...');
export const dailyQuizzes: ExtendedQuiz[] = generateAllQuizTypes();
console.log(`[Quiz Generator] Generated ${dailyQuizzes.length} total quizzes`);

// Log today's quizzes for debugging
const today = new Date().toISOString().split('T')[0];
const todayQuizzes = dailyQuizzes.filter(q => q.scheduledDate === today);
console.log(`[Quiz Generator] Quizzes for ${today}:`, todayQuizzes.length);
console.log('[Quiz Generator] Date range:', {
    first: dailyQuizzes[0]?.scheduledDate,
    last: dailyQuizzes[dailyQuizzes.length - 1]?.scheduledDate
});

export const getQuizzesForDate = (date: string) => {
    return dailyQuizzes.filter(q => q.scheduledDate === date);
};

export const getQuizzesByType = (type: string) => {
    return dailyQuizzes.filter(q => q.type === type);
};

export const getQuizzesByDateAndType = (
    quizzes: ExtendedQuiz[],
    date: string,
    type?: string
) => {
    return quizzes.filter(q =>
        q.scheduledDate === date && (!type || type === 'all' || q.type === type)
    );
};
