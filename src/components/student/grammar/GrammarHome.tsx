import React, { useState } from 'react';
import { BookOpen, Flame, Star, Trophy, Target, ChevronRight, Play, BarChart3, Map, Zap, Clock, CheckCircle, Lock, TrendingUp, ArrowRight } from 'lucide-react';
import { grammarLevels, grammarTopics, getTopicsForLevel } from '@/data/grammarData';
import type { GrammarProgress } from '@/pages/student/GrammarHub';


interface Props {
  progress: GrammarProgress;
  overallProgress: number;
  onStartLesson: (topicId: string) => void;
  onOpenSkillTree: () => void;
  onOpenProgress: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getStageLabel = (pct: number) => {
  if (pct < 15) return { label: 'Beginner', icon: '🌱', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (pct < 45) return { label: 'Intermediate', icon: '🌿', color: 'text-blue-600 bg-blue-50 border-blue-200' };
  if (pct < 80) return { label: 'Advanced', icon: '🌳', color: 'text-violet-600 bg-violet-50 border-violet-200' };
  return { label: 'Master', icon: '🏆', color: 'text-amber-600 bg-amber-50 border-amber-200' };
};

const getCurrentLevel = (pct: number) =>
  [...grammarLevels].reverse().find(l => pct >= l.minProgress) ?? grammarLevels[0];

const isLevelUnlocked = (level: typeof grammarLevels[0], overallProgress: number) =>
  overallProgress >= level.minProgress;

const DAILY_GOALS = [
  { id: 'learn', icon: '📘', label: 'Learn', target: 'Study a new topic', color: 'from-blue-400 to-blue-600' },
  { id: 'practice', icon: '📝', label: 'Practice', target: 'Do exercises', color: 'from-violet-400 to-violet-600' },
  { id: 'quiz', icon: '⚡', label: 'Quiz', target: 'Test yourself', color: 'from-amber-400 to-orange-500' },
  { id: 'revise', icon: '🔄', label: 'Revision', target: 'Review past topics', color: 'from-emerald-400 to-teal-500' },
];

const GrammarHome: React.FC<Props> = ({
  progress, overallProgress, onStartLesson, onOpenSkillTree, onOpenProgress,
}) => {
  const stage = getStageLabel(overallProgress);
  const currentLevel = getCurrentLevel(overallProgress);
  const [activeGoal, setActiveGoal] = useState<string | null>(null);

  // Find continue topic (last incomplete topic in order)
  const continueTopic = grammarTopics.find(t => !progress.topics[t.id]?.completed);
  const completedCount = Object.values(progress.topics).filter(t => t.completed).length;
  const accuracy = completedCount > 0
    ? Math.round(Object.values(progress.topics).filter(t => t.completed).reduce((sum, t) => sum + (t.quizScore / 5), 0) / completedCount * 100)
    : 0;

  // Next level progress
  const nextLevel = grammarLevels.find(l => l.minProgress > overallProgress);
  const progressToNext = nextLevel
    ? Math.round(((overallProgress - currentLevel.minProgress) / (nextLevel.minProgress - currentLevel.minProgress)) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-blue-700 to-violet-700 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
          {/* Floating letters */}
          {['A', 'B', 'C', '?', '.', '!'].map((l, i) => (
            <span key={i} className="absolute text-white/5 font-black select-none"
              style={{ fontSize: `${80 + i * 20}px`, top: `${10 + i * 12}%`, left: `${5 + i * 15}%`, transform: `rotate(${-20 + i * 8}deg)` }}>
              {l}
            </span>
          ))}
        </div>

        <div className="relative px-6 pt-8 pb-6">
          {/* Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">English Hub › Grammar</p>
              <h1 className="text-2xl font-black tracking-tight">Master English Grammar</h1>
            </div>
          </div>

          {/* Stage Badge + Progress */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/20">
              <span className="text-lg">{stage.icon}</span>
              <span className="font-bold text-sm">{stage.label}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs">
              <Flame className="h-3.5 w-3.5 text-orange-300" />
              <span className="font-semibold">{progress.streak} day streak</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs">
              <Star className="h-3.5 w-3.5 text-yellow-300" />
              <span className="font-semibold">{progress.totalXP} XP</span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white/60 text-xs">Current Level</p>
                <p className="font-bold text-base">{currentLevel.emoji} Level {currentLevel.number} — {currentLevel.title}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black">{overallProgress}%</p>
                <p className="text-white/60 text-xs">Overall</p>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-300 to-green-300 rounded-full transition-all duration-700"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            {nextLevel && (
              <p className="text-white/60 text-xs mt-1.5">
                {100 - progressToNext}% more to unlock Level {nextLevel.number}: {nextLevel.title}
              </p>
            )}
          </div>

          {/* CTA */}
          {continueTopic && (
            <button
              onClick={() => onStartLesson(continueTopic.id)}
              className="w-full flex items-center justify-between bg-white text-indigo-700 rounded-xl px-5 py-3.5 font-bold shadow-lg shadow-indigo-900/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{continueTopic.emoji}</span>
                <div className="text-left">
                  <p className="text-xs text-indigo-400 font-medium">Continue Learning</p>
                  <p className="text-sm font-black">{continueTopic.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">+{continueTopic.xpReward} XP</span>
                <Play className="h-5 w-5 fill-indigo-600" />
              </div>
            </button>
          )}
          {!continueTopic && (
            <div className="w-full flex items-center justify-center gap-3 bg-white/20 rounded-xl px-5 py-3.5">
              <Trophy className="h-6 w-6 text-yellow-300" />
              <span className="font-bold text-lg">All topics completed! 🎉</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-10 space-y-6 mt-5">
        {/* ── Quick Nav ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <button onClick={onOpenSkillTree}
            className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
            <div className="p-2.5 bg-indigo-50 rounded-xl">
              <Map className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Skill Tree</span>
          </button>
          <button onClick={onOpenProgress}
            className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-violet-200 hover:shadow-md transition-all">
            <div className="p-2.5 bg-violet-50 rounded-xl">
              <BarChart3 className="h-5 w-5 text-violet-600" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Progress</span>
          </button>
          <button className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all">
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Badges</span>
          </button>
        </div>

        {/* ── Learning Journey Strip ───────────────────────────────────── */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-3">Your Learning Journey</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { pct: 0, icon: '🌱', label: 'Beginner', color: 'from-emerald-400 to-teal-500', minPct: 0, maxPct: 30 },
              { pct: 30, icon: '🌿', label: 'Intermediate', color: 'from-blue-400 to-indigo-500', minPct: 30, maxPct: 60 },
              { pct: 60, icon: '🌳', label: 'Advanced', color: 'from-violet-400 to-purple-600', minPct: 60, maxPct: 85 },
              { pct: 85, icon: '🏆', label: 'Master', color: 'from-amber-400 to-orange-500', minPct: 85, maxPct: 100 },
            ].map((stage) => {
              const isActive = overallProgress >= stage.minPct && overallProgress < stage.maxPct;
              const isDone = overallProgress >= stage.maxPct;
              return (
                <div key={stage.label}
                  className={`flex-shrink-0 rounded-2xl p-4 min-w-[120px] text-center transition-all ${isDone ? `bg-gradient-to-br ${stage.color} text-white shadow-lg` : isActive ? `bg-gradient-to-br ${stage.color} text-white shadow-lg ring-2 ring-white ring-offset-2` : 'bg-white border border-slate-100'}`}>
                  <div className="text-2xl mb-1">{stage.icon}</div>
                  <p className={`text-xs font-bold ${isDone || isActive ? 'text-white' : 'text-slate-600'}`}>{stage.label}</p>
                  {isDone && <CheckCircle className="h-3.5 w-3.5 text-white/80 mx-auto mt-1" />}
                  {isActive && <div className="mt-1 h-1 bg-white/30 rounded-full"><div className="h-full bg-white rounded-full" style={{ width: `${Math.round(((overallProgress - stage.minPct) / (stage.maxPct - stage.minPct)) * 100)}%` }} /></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Today's Goal ─────────────────────────────────────────────── */}
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-3">Today's Goal</h2>
          <div className="grid grid-cols-4 gap-2">
            {DAILY_GOALS.map(g => (
              <button key={g.id}
                onClick={() => {
                  setActiveGoal(g.id);
                  if (g.id === 'learn' && continueTopic) onStartLesson(continueTopic.id);
                }}
                className={`flex flex-col items-center gap-2 rounded-xl p-3 border transition-all ${activeGoal === g.id ? `bg-gradient-to-br ${g.color} text-white border-transparent shadow-lg scale-105` : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'}`}>
                <span className="text-xl">{g.icon}</span>
                <span className={`text-xs font-bold ${activeGoal === g.id ? 'text-white' : 'text-slate-700'}`}>{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats Row ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <CheckCircle className="h-5 w-5 text-emerald-500" />, label: 'Completed', value: `${completedCount}/${grammarTopics.length}`, bg: 'bg-emerald-50 border-emerald-100' },
            { icon: <Target className="h-5 w-5 text-blue-500" />, label: 'Accuracy', value: `${accuracy}%`, bg: 'bg-blue-50 border-blue-100' },
            { icon: <Zap className="h-5 w-5 text-amber-500" />, label: 'Total XP', value: progress.totalXP.toString(), bg: 'bg-amber-50 border-amber-100' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-2xl p-4 flex flex-col gap-2`}>
              {s.icon}
              <p className="text-xl font-black text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Grammar Topics Grid ──────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">All Grammar Topics</h2>
            <button onClick={onOpenSkillTree} className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
              View map <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {grammarLevels.map(level => {
              const unlocked = isLevelUnlocked(level, overallProgress);
              const levelTopics = getTopicsForLevel(level.id);
              const levelDone = levelTopics.filter(t => progress.topics[t.id]?.completed).length;

              return (
                <div key={level.id} className={`rounded-2xl border overflow-hidden ${unlocked ? 'border-slate-100 bg-white shadow-sm' : 'border-dashed border-slate-200 bg-slate-50/50 opacity-70'}`}>
                  {/* Level header */}
                  <div className={`px-4 py-3 bg-gradient-to-r ${level.gradient} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{level.emoji}</span>
                      <div>
                        <p className="text-white/70 text-xs font-medium">Level {level.number}</p>
                        <p className="text-white font-bold text-sm">{level.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {!unlocked ? (
                        <Lock className="h-5 w-5 text-white/60" />
                      ) : (
                        <div className="text-right">
                          <p className="text-white font-black text-lg">{levelDone}/{levelTopics.length}</p>
                          <p className="text-white/70 text-xs">done</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Topics */}
                  {unlocked && (
                    <div className="p-3 grid grid-cols-1 gap-2">
                      {levelTopics.map(topic => {
                        const done = progress.topics[topic.id]?.completed;
                        const inProgress = !done && (progress.topics[topic.id]?.stepReached ?? 0) > 0;
                        const score = progress.topics[topic.id]?.quizScore ?? 0;
                        return (
                          <button key={topic.id}
                            onClick={() => onStartLesson(topic.id)}
                            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl transition-all hover:scale-[1.01] ${done ? 'bg-emerald-50 border border-emerald-100' : inProgress ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200'}`}>
                            <span className="text-xl flex-shrink-0">{topic.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold truncate ${done ? 'text-emerald-800' : 'text-slate-800'}`}>{topic.title}</p>
                              <p className="text-xs text-slate-500">{topic.timeMinutes} min · +{topic.xpReward} XP</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {done && (
                                <>
                                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                                    {score}/{topic.quiz.length} ⭐
                                  </span>
                                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                                </>
                              )}
                              {inProgress && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">In Progress</span>}
                              {!done && !inProgress && <ChevronRight className="h-4 w-4 text-slate-400" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {!unlocked && (
                    <div className="px-4 py-3 flex items-center gap-2 text-slate-400">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm">Reach {level.minProgress}% overall progress to unlock</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrammarHome;
