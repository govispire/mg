import { useState, useEffect, useCallback } from 'react';

export interface QuizResult {
  id: string;
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

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastQuizDate: string | null;
  totalQuizzesTaken: number;
  totalPoints: number;
  unlockedRewards: string[];
  dailyGoalCompleted: boolean;
}

const QUIZ_RESULTS_KEY = 'quiz_results';
const STREAK_DATA_KEY = 'streak_data';

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastQuizDate: null,
  totalQuizzesTaken: 0,
  totalPoints: 0,
  unlockedRewards: [],
  dailyGoalCompleted: false,
};

export function useQuizStorage() {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [streakData, setStreakData] = useState<StreakData>(defaultStreakData);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedResults = localStorage.getItem(QUIZ_RESULTS_KEY);
      const storedStreak = localStorage.getItem(STREAK_DATA_KEY);
      
      if (storedResults) {
        setQuizResults(JSON.parse(storedResults));
      }
      
      if (storedStreak) {
        const parsed = JSON.parse(storedStreak);
        // Check if streak should be reset (missed a day)
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (parsed.lastQuizDate && parsed.lastQuizDate !== today && parsed.lastQuizDate !== yesterday) {
          // Reset streak if more than a day has passed
          setStreakData({ ...parsed, currentStreak: 0, dailyGoalCompleted: false });
        } else if (parsed.lastQuizDate !== today) {
          setStreakData({ ...parsed, dailyGoalCompleted: false });
        } else {
          setStreakData(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading quiz data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save quiz result
  const saveQuizResult = useCallback((result: Omit<QuizResult, 'id'>) => {
    const newResult: QuizResult = {
      ...result,
      id: `quiz_${Date.now()}`,
    };

    setQuizResults(prev => {
      const updated = [newResult, ...prev].slice(0, 100); // Keep last 100 results
      localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(updated));
      return updated;
    });

    // Update streak
    updateStreak(result.percentage);

    return newResult;
  }, []);

  // Update streak data
  const updateStreak = useCallback((percentage: number) => {
    setStreakData(prev => {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      let newStreak = prev.currentStreak;
      
      // Only count towards streak if score >= 50%
      if (percentage >= 50) {
        if (prev.lastQuizDate === yesterday) {
          newStreak = prev.currentStreak + 1;
        } else if (prev.lastQuizDate !== today) {
          newStreak = 1;
        }
      }
      
      const points = Math.round(percentage * 10);
      const newUnlockedRewards = [...prev.unlockedRewards];
      
      // Check for new rewards
      const milestones = [
        { streak: 3, reward: '3-day-streak' },
        { streak: 7, reward: '7-day-streak' },
        { streak: 14, reward: '14-day-streak' },
        { streak: 30, reward: '30-day-streak' },
        { streak: 50, reward: '50-day-streak' },
        { streak: 100, reward: '100-day-streak' },
      ];
      
      milestones.forEach(({ streak, reward }) => {
        if (newStreak >= streak && !newUnlockedRewards.includes(reward)) {
          newUnlockedRewards.push(reward);
        }
      });
      
      const updated: StreakData = {
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastQuizDate: today,
        totalQuizzesTaken: prev.totalQuizzesTaken + 1,
        totalPoints: prev.totalPoints + points,
        unlockedRewards: newUnlockedRewards,
        dailyGoalCompleted: true,
      };
      
      localStorage.setItem(STREAK_DATA_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get analytics data
  const getAnalytics = useCallback(() => {
    if (quizResults.length === 0) {
      return {
        averageScore: 0,
        averageTime: 0,
        totalQuizzes: 0,
        topicAccuracy: {},
        subjectAccuracy: {},
        performanceTrend: [],
        timePerQuestionTrend: [],
        weeklyProgress: [],
        strongTopics: [],
        weakTopics: [],
      };
    }

    // Calculate averages
    const averageScore = quizResults.reduce((sum, r) => sum + r.percentage, 0) / quizResults.length;
    const averageTime = quizResults.reduce((sum, r) => sum + r.timeTaken, 0) / quizResults.length;

    // Aggregate topic and subject accuracy
    const topicAccuracy: Record<string, { correct: number; total: number; percentage: number }> = {};
    const subjectAccuracy: Record<string, { correct: number; total: number; percentage: number }> = {};

    quizResults.forEach(result => {
      Object.entries(result.topicAccuracy).forEach(([topic, data]) => {
        if (!topicAccuracy[topic]) {
          topicAccuracy[topic] = { correct: 0, total: 0, percentage: 0 };
        }
        topicAccuracy[topic].correct += data.correct;
        topicAccuracy[topic].total += data.total;
      });

      Object.entries(result.subjectAccuracy).forEach(([subject, data]) => {
        if (!subjectAccuracy[subject]) {
          subjectAccuracy[subject] = { correct: 0, total: 0, percentage: 0 };
        }
        subjectAccuracy[subject].correct += data.correct;
        subjectAccuracy[subject].total += data.total;
      });
    });

    // Calculate percentages
    Object.keys(topicAccuracy).forEach(topic => {
      const data = topicAccuracy[topic];
      data.percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    });

    Object.keys(subjectAccuracy).forEach(subject => {
      const data = subjectAccuracy[subject];
      data.percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    });

    // Performance trend (last 10 quizzes)
    const performanceTrend = quizResults.slice(0, 10).reverse().map((r, i) => ({
      quiz: i + 1,
      score: r.percentage,
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

    // Time per question trend
    const timePerQuestionTrend = quizResults.slice(0, 10).reverse().map((r, i) => ({
      quiz: i + 1,
      avgTime: r.timeTaken / r.totalQuestions,
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

    // Weekly progress
    const weeklyProgress = getWeeklyProgress(quizResults);

    // Strong and weak topics
    const topicEntries = Object.entries(topicAccuracy)
      .filter(([_, data]) => data.total >= 2)
      .sort((a, b) => b[1].percentage - a[1].percentage);

    const strongTopics = topicEntries.slice(0, 5).map(([topic, data]) => ({
      topic,
      accuracy: data.percentage,
      attempts: data.total,
    }));

    const weakTopics = topicEntries.slice(-5).reverse().map(([topic, data]) => ({
      topic,
      accuracy: data.percentage,
      attempts: data.total,
    }));

    return {
      averageScore: Math.round(averageScore),
      averageTime: Math.round(averageTime),
      totalQuizzes: quizResults.length,
      topicAccuracy,
      subjectAccuracy,
      performanceTrend,
      timePerQuestionTrend,
      weeklyProgress,
      strongTopics,
      weakTopics,
    };
  }, [quizResults]);

  // Reset all data
  const resetAllData = useCallback(() => {
    localStorage.removeItem(QUIZ_RESULTS_KEY);
    localStorage.removeItem(STREAK_DATA_KEY);
    setQuizResults([]);
    setStreakData(defaultStreakData);
  }, []);

  return {
    quizResults,
    streakData,
    isLoading,
    saveQuizResult,
    getAnalytics,
    resetAllData,
  };
}

// Helper function to calculate weekly progress
function getWeeklyProgress(results: QuizResult[]) {
  const weeks: Record<string, { quizzes: number; totalScore: number }> = {};
  
  results.forEach(result => {
    const date = new Date(result.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = { quizzes: 0, totalScore: 0 };
    }
    weeks[weekKey].quizzes++;
    weeks[weekKey].totalScore += result.percentage;
  });

  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, data]) => ({
      week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      quizzes: data.quizzes,
      avgScore: Math.round(data.totalScore / data.quizzes),
    }));
}
