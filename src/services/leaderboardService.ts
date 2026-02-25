import { QuizCompletion } from '@/utils/quizAnalytics';

/**
 * Leaderboard Entry
 */
export interface LeaderboardEntry {
    rank: number;
    name: string;
    avatar: string;
    score: number;
    streak: number;
    quizzesCompleted: number;
    userId?: string;
}

/**
 * Leaderboard Period
 */
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly';

/**
 * Calculate user score based on quiz completions
 */
export function calculateUserScore(completions: QuizCompletion[]): number {
    if (completions.length === 0) return 0;

    let totalScore = 0;

    completions.forEach((completion) => {
        // Base score from quiz performance
        const baseScore = completion.score * 10; // Convert percentage to points

        // Bonus for accuracy
        const accuracyBonus = completion.accuracy > 80 ? 50 : completion.accuracy > 60 ? 25 : 0;

        // Bonus for speed (if completed faster)
        const speedBonus = completion.timeSpent < completion.totalQuestions * 45 ? 30 : 0;

        totalScore += baseScore + accuracyBonus + speedBonus;
    });

    return Math.round(totalScore);
}

/**
 * Get mock leaderboard data
 * In production, this would fetch from an API
 */
export function getLeaderboardData(
    period: LeaderboardPeriod,
    currentUserScore: number,
    currentUserStreak: number,
    currentUserQuizCount: number
): LeaderboardEntry[] {
    // Mock data - in production, this would come from an API
    const mockUsers = [
        { name: 'Priya Sharma', avatar: 'PS', baseScore: 2840, baseStreak: 45 },
        { name: 'Rahul Kumar', avatar: 'RK', baseScore: 2720, baseStreak: 38 },
        { name: 'Anjali Singh', avatar: 'AS', baseScore: 2650, baseStreak: 32 },
        { name: 'Vikram Patel', avatar: 'VP', baseScore: 2580, baseStreak: 28 },
        { name: 'Sneha Reddy', avatar: 'SR', baseScore: 2490, baseStreak: 25 },
        { name: 'Amit Verma', avatar: 'AV', baseScore: 2420, baseStreak: 22 },
        { name: 'Neha Gupta', avatar: 'NG', baseScore: 2350, baseStreak: 19 },
        { name: 'Karan Sharma', avatar: 'KS', baseScore: 2280, baseStreak: 17 },
        { name: 'Pooja Mehta', avatar: 'PM', baseScore: 2210, baseStreak: 15 },
        { name: 'Rohan Joshi', avatar: 'RJ', baseScore: 2145, baseStreak: 13 },
    ];

    // Adjust scores based on period
    const periodMultiplier = period === 'daily' ? 0.3 : period === 'weekly' ? 0.7 : 1.0;

    let leaderboard: LeaderboardEntry[] = mockUsers.map((user, index) => ({
        rank: index + 1,
        name: user.name,
        avatar: user.avatar,
        score: Math.round(user.baseScore * periodMultiplier),
        streak: Math.round(user.baseStreak * periodMultiplier),
        quizzesCompleted: Math.round((156 - index * 5) * periodMultiplier),
    }));

    // Add current user
    const userEntry: LeaderboardEntry = {
        rank: -1, // Will be calculated
        name: 'You',
        avatar: 'YU',
        score: currentUserScore,
        streak: currentUserStreak,
        quizzesCompleted: currentUserQuizCount,
    };

    leaderboard.push(userEntry);

    // Sort by score
    leaderboard.sort((a, b) => b.score - a.score);

    // Assign ranks
    leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
    });

    return leaderboard;
}

/**
 * Get user's rank in leaderboard
 */
export function getUserRank(
    leaderboard: LeaderboardEntry[],
    userName: string = 'You'
): number {
    const userEntry = leaderboard.find((entry) => entry.name === userName);
    return userEntry ? userEntry.rank : -1;
}
