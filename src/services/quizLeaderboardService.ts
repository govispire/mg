/**
 * Per-Quiz Leaderboard Types
 */
export interface QuizLeaderboardEntry {
    userId: string;
    userName: string;
    avatar: string;
    score: number;
    accuracy: number;
    timeTaken: number; // in seconds
    completedAt: string; // ISO timestamp
    rank: number;
}

export interface QuizLeaderboard {
    quizId: string;
    quizTitle: string;
    totalParticipants: number;
    topByScore: QuizLeaderboardEntry[];
    topBySpeed: QuizLeaderboardEntry[];
    topByCompletion: QuizLeaderboardEntry[]; // first to complete
    userRank?: {
        byScore: number;
        bySpeed: number;
        byCompletion: number;
    };
}

export type LeaderboardRankingType = 'score' | 'speed' | 'completion';

/**
 * Generate mock leaderboard for a quiz
 */
export function generateQuizLeaderboard(
    quizId: string,
    quizTitle: string,
    userScore?: number,
    userTime?: number
): QuizLeaderboard {
    const participantCount = Math.floor(Math.random() * 500) + 100;

    // Generate mock participants
    const mockNames = [
        'Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Sneha Reddy', 'Vikram Patel',
        'Anjali Verma', 'Rohan Gupta', 'Neha Agarwal', 'Arjun Mehta', 'Pooja Das',
        'Karan Joshi', 'Divya Iyer', 'Sanjay Nair', 'Kavita Rao', 'Manish Desai',
        'Ritu Chauhan', 'Aditya Malhotra', 'Swati Kapoor', 'Deepak Bose', 'Shweta Shah'
    ];

    const generateEntry = (index: number, type: 'score' | 'speed' | 'completion'): QuizLeaderboardEntry => {
        const name = mockNames[index % mockNames.length];
        const baseScore = type === 'score'
            ? 100 - (index * 2) - Math.random() * 5
            : 60 + Math.random() * 40;

        const baseTime = type === 'speed'
            ? 300 + (index * 10) + Math.random() * 30
            : 600 + Math.random() * 600;

        return {
            userId: `user-${index}`,
            userName: index === 0 ? name : `${name} ${index > 0 ? index : ''}`,
            avatar: name.split(' ').map(n => n[0]).join(''),
            score: Math.round(baseScore),
            accuracy: Math.round(baseScore),
            timeTaken: Math.round(baseTime),
            completedAt: new Date(Date.now() - index * 3600000).toISOString(),
            rank: index + 1
        };
    };

    // Generate top performers
    const topByScore = Array.from({ length: 20 }, (_, i) => generateEntry(i, 'score'))
        .sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);

    const topBySpeed = Array.from({ length: 20 }, (_, i) => generateEntry(i, 'speed'))
        .filter(e => e.accuracy >= 60) // Minimum accuracy requirement
        .sort((a, b) => a.timeTaken - b.timeTaken);

    const topByCompletion = Array.from({ length: 20 }, (_, i) => generateEntry(i, 'completion'))
        .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

    // Assign ranks
    topByScore.forEach((entry, index) => entry.rank = index + 1);
    topBySpeed.forEach((entry, index) => entry.rank = index + 1);
    topByCompletion.forEach((entry, index) => entry.rank = index + 1);

    // Calculate user ranks if they completed
    let userRank;
    if (userScore !== undefined && userTime !== undefined) {
        const scoreRank = topByScore.filter(e => e.score > userScore).length + 1;
        const speedRank = topBySpeed.filter(e => e.timeTaken < userTime).length + 1;
        const completionRank = Math.floor(Math.random() * 100) + 1;

        userRank = {
            byScore: scoreRank,
            bySpeed: speedRank,
            byCompletion: completionRank
        };
    }

    return {
        quizId,
        quizTitle,
        totalParticipants: participantCount,
        topByScore,
        topBySpeed,
        topByCompletion,
        userRank
    };
}

/**
 * Get leaderboard for a specific quiz
 */
export function getQuizLeaderboard(
    quizId: string,
    quizTitle: string,
    completion?: { score: number; timeTaken: number }
): QuizLeaderboard {
    // In a real app, this would fetch from an API
    return generateQuizLeaderboard(
        quizId,
        quizTitle,
        completion?.score,
        completion?.timeTaken
    );
}
