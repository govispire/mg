import React from 'react';
import { ArrowLeft, Trophy, Flame, Zap, Target, CheckCircle, Lock, TrendingUp, Star, Clock, BookOpen } from 'lucide-react';
import { grammarLevels, grammarTopics, getTopicsForLevel, getTotalTopics } from '@/data/grammarData';
import type { GrammarProgress } from '@/pages/student/GrammarHub';

interface Props {
  progress: GrammarProgress;
  overallProgress: number;
  onBack: () => void;
  onStartTopic: (id: string) => void;
}

const BADGE_INFO: Record<string, { icon: string; label: string; desc: string }> = {
  'first-lesson': { icon: '🌱', label: 'First Step', desc: 'Completed your first lesson' },
  'five-lessons': { icon: '🌿', label: 'Getting Warmed Up', desc: 'Completed 5 lessons' },
  'ten-lessons': { icon: '🌳', label: 'On a Roll', desc: 'Completed 10 lessons' },
  'perfect-quiz': { icon: '⭐', label: 'Perfect Score', desc: 'Got 5/5 on a quiz' },
};

const ProgressDashboard: React.FC<Props> = ({ progress, overallProgress, onBack, onStartTopic }) => {
  const totalTopics = getTotalTopics();
  const completedTopics = Object.values(progress.topics).filter(t => t.completed);
  const completedCount = completedTopics.length;
  const accuracy = completedCount > 0
    ? Math.round(completedTopics.reduce((sum, t) => sum + (t.quizScore / 5), 0) / completedCount * 100)
    : 0;

  const totalStudyTime = completedTopics.reduce((sum, t) => {
    const topic = grammarTopics.find(g => g.id === t.topicId);
    return sum + (topic?.timeMinutes ?? 0);
  }, 0);

  // Estimate completion
  const remaining = totalTopics - completedCount;
  const avgTimePerTopic = completedCount > 0 ? totalStudyTime / completedCount : 8;
  const estDays = Math.ceil((remaining * avgTimePerTopic) / 30); // assuming 30 min/day

  // Current skill and next lesson
  const currentTopic = [...grammarTopics].reverse().find(t => progress.topics[t.id]?.completed);
  const nextTopic = grammarTopics.find(t => !progress.topics[t.id]?.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="font-black text-slate-800">Grammar Mastery</h1>
          <p className="text-slate-400 text-xs">Your performance dashboard</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 pb-10">
        {/* ── Overall Progress Card ───────────────────────────────────── */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-5 text-white shadow-xl shadow-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Overall Progress</p>
              <p className="text-4xl font-black mt-0.5">{overallProgress}%</p>
            </div>
            <div className="w-20 h-20 relative">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeWidth="2.5"
                  strokeDasharray={`${overallProgress} ${100 - overallProgress}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy className="h-7 w-7 text-yellow-300" />
              </div>
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-white rounded-full" style={{ width: `${overallProgress}%` }} />
          </div>
          <p className="text-white/60 text-xs">{completedCount} of {totalTopics} topics completed</p>
        </div>

        {/* ── Key Stats ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Zap className="h-5 w-5 text-yellow-500" />, label: 'Total XP', value: progress.totalXP.toString(), bg: 'bg-yellow-50 border-yellow-100' },
            { icon: <Flame className="h-5 w-5 text-orange-500" />, label: 'Current Streak', value: `${progress.streak} days`, bg: 'bg-orange-50 border-orange-100' },
            { icon: <Target className="h-5 w-5 text-blue-500" />, label: 'Quiz Accuracy', value: `${accuracy}%`, bg: 'bg-blue-50 border-blue-100' },
            { icon: <Clock className="h-5 w-5 text-violet-500" />, label: 'Study Time', value: `${totalStudyTime} min`, bg: 'bg-violet-50 border-violet-100' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} border rounded-2xl p-4 flex flex-col gap-2`}>
              {stat.icon}
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Smart Summary ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          <h2 className="font-black text-slate-800">Learning Snapshot</h2>
          {[
            { label: 'Current Skill', value: currentTopic?.title ?? 'Not started yet', icon: <BookOpen className="h-4 w-4 text-indigo-500" /> },
            { label: 'Next Lesson', value: nextTopic?.title ?? '🎉 All done!', icon: <TrendingUp className="h-4 w-4 text-emerald-500" /> },
            { label: 'Est. Completion', value: estDays > 0 ? `~${estDays} days` : '🏆 Complete!', icon: <Clock className="h-4 w-4 text-violet-500" /> },
            { label: 'Longest Streak', value: `${progress.longestStreak} days`, icon: <Flame className="h-4 w-4 text-orange-500" /> },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-sm text-slate-500 font-medium">{item.label}</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{item.value}</span>
            </div>
          ))}
          {nextTopic && (
            <button onClick={() => onStartTopic(nextTopic.id)}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 rounded-xl text-sm hover:scale-[1.02] transition-all">
              Continue: {nextTopic.emoji} {nextTopic.title}
            </button>
          )}
        </div>

        {/* ── Level Mastery ─────────────────────────────────────────── */}
        <div>
          <h2 className="font-black text-slate-800 mb-3">Level Mastery</h2>
          <div className="space-y-3">
            {grammarLevels.map(level => {
              const unlocked = overallProgress >= level.minProgress;
              const topics = getTopicsForLevel(level.id);
              const done = topics.filter(t => progress.topics[t.id]?.completed).length;
              const pct = topics.length > 0 ? Math.round((done / topics.length) * 100) : 0;
              return (
                <div key={level.id} className={`bg-white rounded-2xl border p-4 ${unlocked ? 'border-slate-100 shadow-sm' : 'border-dashed border-slate-200 opacity-60'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{level.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-800 text-sm">{level.title}</p>
                        {pct === 100 ? (
                          <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Complete
                          </span>
                        ) : !unlocked ? (
                          <span className="text-xs bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Locked
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-500">{done}/{topics.length}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {unlocked && (
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: `linear-gradient(to right, ${level.color}cc, ${level.color})` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Badges ────────────────────────────────────────────────── */}
        <div>
          <h2 className="font-black text-slate-800 mb-3">Badges Earned</h2>
          {progress.badges.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
              <p className="text-4xl mb-2">🔒</p>
              <p className="text-slate-400 text-sm">Complete lessons to earn badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {progress.badges.map(badge => {
                const info = BADGE_INFO[badge];
                if (!info) return null;
                return (
                  <div key={badge} className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
                    <span className="text-4xl">{info.icon}</span>
                    <p className="font-black text-slate-800 text-sm">{info.label}</p>
                    <p className="text-xs text-slate-500">{info.desc}</p>
                  </div>
                );
              })}
              {/* Locked badge examples */}
              {Object.entries(BADGE_INFO)
                .filter(([key]) => !progress.badges.includes(key))
                .slice(0, 4 - progress.badges.length)
                .map(([key, info]) => (
                  <div key={key} className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 text-center opacity-50">
                    <span className="text-4xl grayscale">{info.icon}</span>
                    <p className="font-bold text-slate-600 text-sm">{info.label}</p>
                    <p className="text-xs text-slate-400">{info.desc}</p>
                    <Lock className="h-3 w-3 text-slate-400" />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
