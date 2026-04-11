import { useState, useEffect } from 'react';
import { dailyQuizzes } from '@/data/dailyQuizzesData';
import { api } from '@/lib/api';

interface DashboardStats {
  studyHours: number;
  activeStreak: number;
  mockTestsTaken: number;
  avgScore: number;
  percentile: number;
  performanceData: Array<{ week: string; tests: number; quizzes: number }>;
  isLoading: boolean;
}

const formatDateLocal = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function computeStats(
  quizCompletions: Record<string, { completed: boolean; score: number; date: string; duration?: number }>,
  studentPresence: Record<string, boolean>
): Omit<DashboardStats, 'isLoading'> {
  const completedEntries = Object.entries(quizCompletions).filter(([, v]) => v.completed);

  // Study Hours
  const studyMinutes = completedEntries.reduce((acc, [id, v]) => {
    if (v.duration) return acc + v.duration;
    const quiz = dailyQuizzes.find(q => q.id === id);
    return acc + (quiz?.duration ?? 15);
  }, 0);
  const studyHours = Math.round(studyMinutes / 60 * 10) / 10;

  // Mock Tests Taken
  const mockTestsTaken = completedEntries.length;

  // Active Streak
  const today = new Date();
  let streak = 0;
  let checkDate = new Date(today);
  if (!studentPresence[formatDateLocal(today)]) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  for (let i = 0; i < 365; i++) {
    const key = formatDateLocal(checkDate);
    if (studentPresence[key]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else break;
  }

  // Scores & Percentile
  const scores = completedEntries.map(([, v]) => v.score).filter(s => s > 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const percentile = scores.length > 0
    ? Math.min(99, Math.max(1, Math.round((avgScore / 100) * 99)))
    : 0;

  // Performance Graph (last 8 weeks)
  const weeks: Array<{ week: string; tests: number; quizzes: number }> = [];
  for (let w = 7; w >= 0; w--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - w * 7 - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekKey = `Week ${8 - w}`;
    const weekCompletions = completedEntries.filter(([, v]) => {
      const d = new Date(v.date);
      return d >= weekStart && d <= weekEnd;
    });
    const weekScores = weekCompletions.map(([, v]) => v.score).filter(s => s > 0);
    const avgWeekScore = weekScores.length > 0
      ? Math.round(weekScores.reduce((a, b) => a + b, 0) / weekScores.length)
      : 0;
    weeks.push({
      week: weekKey,
      tests: avgWeekScore,
      quizzes: Math.min(100, Math.max(0, avgWeekScore + Math.round((Math.random() * 10) - 5))),
    });
  }

  return { studyHours, activeStreak: streak, mockTestsTaken, avgScore, percentile, performanceData: weeks };
}

export function useDashboardStats(): DashboardStats {
  const [stats, setStats] = useState<Omit<DashboardStats, 'isLoading'>>({
    studyHours: 0, activeStreak: 0, mockTestsTaken: 0, avgScore: 0, percentile: 0, performanceData: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      Promise.all([api.getQuizCompletions(), api.getPresence()])
        .then(([completions, presence]) => {
          setStats(computeStats(completions, presence));
        })
        .catch(() => setStats(computeStats(getLocalCompletions(), getLocalPresence())))
        .finally(() => setIsLoading(false));
    } else {
      setStats(computeStats(getLocalCompletions(), getLocalPresence()));
      setIsLoading(false);
    }
  }, []);

  return { ...stats, isLoading };
}

function getLocalCompletions() {
  try { return JSON.parse(localStorage.getItem('quizCompletions') || '{}'); } catch { return {}; }
}

function getLocalPresence() {
  try { return JSON.parse(localStorage.getItem('studentPresence') || '{}'); } catch { return {}; }
}
