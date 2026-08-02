import React, { useState, useEffect, useCallback } from 'react';
import {
  grammarLevels, grammarTopics, getTopicById,
  getLevelById, getTopicsForLevel, getTotalTopics, TOTAL_XP,
  type GrammarTopic, type GrammarLevel,
} from '@/data/grammarData';

// ─── Progress Types ──────────────────────────────────────────────────────────
export interface TopicProgress {
  topicId: string;
  completed: boolean;
  quizScore: number;   // 0–5
  xpEarned: number;
  completedAt?: string;
  stepReached: number; // 0–8
}

export interface GrammarProgress {
  topics: Record<string, TopicProgress>;
  totalXP: number;
  streak: number;
  longestStreak: number;
  lastStudyDate: string;
  badges: string[];
}

const STORAGE_KEY = 'grammar_hub_progress';

const defaultProgress = (): GrammarProgress => ({
  topics: {},
  totalXP: 0,
  streak: 0,
  longestStreak: 0,
  lastStudyDate: '',
  badges: [],
});

// ─── Load / Save ─────────────────────────────────────────────────────────────
const loadProgress = (): GrammarProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultProgress();
  } catch {
    return defaultProgress();
  }
};

const saveProgress = (p: GrammarProgress) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
};

// ─── Overall Progress % ──────────────────────────────────────────────────────
export const calcOverallProgress = (p: GrammarProgress): number => {
  const total = getTotalTopics();
  if (total === 0) return 0;
  const done = Object.values(p.topics).filter(t => t.completed).length;
  return Math.round((done / total) * 100);
};

// ─── Screen Types ────────────────────────────────────────────────────────────
type Screen =
  | { type: 'home' }
  | { type: 'skill-tree' }
  | { type: 'level-detail'; levelId: string }
  | { type: 'lesson'; topicId: string }
  | { type: 'lesson-complete'; topicId: string; xpEarned: number; quizScore: number }
  | { type: 'progress-dashboard' };

// ─── Imports ─────────────────────────────────────────────────────────────────
import GrammarHome from '@/components/student/grammar/GrammarHome';
import SkillTree from '@/components/student/grammar/SkillTree';
import TopicLesson from '@/components/student/grammar/TopicLesson';
import LessonComplete from '@/components/student/grammar/LessonComplete';
import ProgressDashboard from '@/components/student/grammar/ProgressDashboard';

// ─── Main GrammarHub ─────────────────────────────────────────────────────────
const GrammarHub: React.FC = () => {
  const [progress, setProgress] = useState<GrammarProgress>(loadProgress);
  const [screen, setScreen] = useState<Screen>({ type: 'home' });

  // Persist on change
  useEffect(() => { saveProgress(progress); }, [progress]);

  // Update streak on mount
  useEffect(() => {
    const today = new Date().toDateString();
    setProgress(prev => {
      if (prev.lastStudyDate === today) return prev;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = prev.lastStudyDate === yesterday.toDateString();
      const newStreak = isConsecutive ? prev.streak + 1 : 1;
      return {
        ...prev,
        streak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastStudyDate: today,
      };
    });
  }, []);

  const handleTopicComplete = useCallback((topicId: string, quizScore: number) => {
    const topic = getTopicById(topicId);
    if (!topic) return;
    const xpEarned = Math.round(topic.xpReward * (0.5 + (quizScore / topic.quiz.length) * 0.5));

    setProgress(prev => {
      const updated: GrammarProgress = {
        ...prev,
        totalXP: prev.totalXP + xpEarned,
        topics: {
          ...prev.topics,
          [topicId]: {
            topicId,
            completed: true,
            quizScore,
            xpEarned,
            completedAt: new Date().toISOString(),
            stepReached: 8,
          },
        },
      };

      // Badge logic
      const completedCount = Object.values(updated.topics).filter(t => t.completed).length;
      const badges = [...updated.badges];
      if (completedCount === 1 && !badges.includes('first-lesson')) badges.push('first-lesson');
      if (completedCount === 5 && !badges.includes('five-lessons')) badges.push('five-lessons');
      if (completedCount === 10 && !badges.includes('ten-lessons')) badges.push('ten-lessons');
      if (quizScore === topic.quiz.length && !badges.includes('perfect-quiz')) badges.push('perfect-quiz');

      return { ...updated, badges };
    });

    setScreen({ type: 'lesson-complete', topicId, xpEarned, quizScore });
  }, []);

  const handleSaveStep = useCallback((topicId: string, step: number) => {
    setProgress(prev => ({
      ...prev,
      topics: {
        ...prev.topics,
        [topicId]: {
          ...(prev.topics[topicId] || { topicId, completed: false, quizScore: 0, xpEarned: 0, stepReached: 0 }),
          stepReached: Math.max(prev.topics[topicId]?.stepReached ?? 0, step),
        },
      },
    }));
  }, []);

  const overallProgress = calcOverallProgress(progress);

  // ── Render ──
  if (screen.type === 'lesson') {
    const topic = getTopicById(screen.topicId);
    if (!topic) return null;
    return (
      <TopicLesson
        topic={topic}
        initialStep={progress.topics[topic.id]?.stepReached ?? 0}
        onComplete={(score) => handleTopicComplete(topic.id, score)}
        onSaveStep={(step) => handleSaveStep(topic.id, step)}
        onExit={() => setScreen({ type: 'home' })}
      />
    );
  }

  if (screen.type === 'lesson-complete') {
    const topic = getTopicById(screen.topicId)!;
    return (
      <LessonComplete
        topic={topic}
        xpEarned={screen.xpEarned}
        quizScore={screen.quizScore}
        totalXP={progress.totalXP}
        streak={progress.streak}
        onNext={() => {
          // Find next topic in learning order
          const idx = grammarTopics.findIndex(t => t.id === screen.topicId);
          const next = grammarTopics[idx + 1];
          if (next) setScreen({ type: 'lesson', topicId: next.id });
          else setScreen({ type: 'home' });
        }}
        onHome={() => setScreen({ type: 'home' })}
      />
    );
  }

  if (screen.type === 'skill-tree') {
    return (
      <SkillTree
        levels={grammarLevels}
        progress={progress}
        overallProgress={overallProgress}
        onSelectTopic={(topicId) => setScreen({ type: 'lesson', topicId })}
        onBack={() => setScreen({ type: 'home' })}
      />
    );
  }

  if (screen.type === 'progress-dashboard') {
    return (
      <ProgressDashboard
        progress={progress}
        overallProgress={overallProgress}
        onBack={() => setScreen({ type: 'home' })}
        onStartTopic={(id) => setScreen({ type: 'lesson', topicId: id })}
      />
    );
  }

  // Default: Home
  return (
    <GrammarHome
      progress={progress}
      overallProgress={overallProgress}
      onStartLesson={(topicId) => setScreen({ type: 'lesson', topicId })}
      onOpenSkillTree={() => setScreen({ type: 'skill-tree' })}
      onOpenProgress={() => setScreen({ type: 'progress-dashboard' })}
    />
  );
};

export default GrammarHub;
export { loadProgress, saveProgress, defaultProgress };
