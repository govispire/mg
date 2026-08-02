import React, { useState } from 'react';
import { ArrowLeft, Lock, CheckCircle, ChevronRight, Star, Zap, Map } from 'lucide-react';
import { grammarLevels, grammarTopics, getTopicsForLevel } from '@/data/grammarData';
import type { GrammarProgress } from '@/pages/student/GrammarHub';

interface Props {
  levels: typeof grammarLevels;
  progress: GrammarProgress;
  overallProgress: number;
  onSelectTopic: (topicId: string) => void;
  onBack: () => void;
}

const SkillTree: React.FC<Props> = ({ levels, progress, overallProgress, onSelectTopic, onBack }) => {
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  const isLevelUnlocked = (level: typeof grammarLevels[0]) => overallProgress >= level.minProgress;

  const getLevelStats = (levelId: string) => {
    const topics = getTopicsForLevel(levelId);
    const done = topics.filter(t => progress.topics[t.id]?.completed).length;
    return { done, total: topics.length, pct: topics.length > 0 ? Math.round((done / topics.length) * 100) : 0 };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-indigo-400" />
          <div>
            <h1 className="font-black text-base">Skill Tree</h1>
            <p className="text-white/50 text-xs">8-Level Grammar Journey</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
          <Zap className="h-3.5 w-3.5 text-yellow-400" />
          <span className="text-xs font-bold">{progress.totalXP} XP</span>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Overall Mastery</span>
          <span className="text-sm font-black">{overallProgress}%</span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 rounded-full transition-all duration-1000"
            style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      {/* Skill Tree Nodes */}
      <div className="relative px-6 pb-16">
        {levels.map((level, idx) => {
          const unlocked = isLevelUnlocked(level);
          const stats = getLevelStats(level.id);
          const isExpanded = expandedLevel === level.id;
          const isCompleted = stats.pct === 100;
          const isCurrent = unlocked && !isCompleted;
          const levelTopics = getTopicsForLevel(level.id);

          return (
            <div key={level.id} className="relative">
              {/* Connecting line */}
              {idx < levels.length - 1 && (
                <div className="absolute left-[2.75rem] top-[4.5rem] w-0.5 h-12 z-0"
                  style={{
                    background: unlocked
                      ? `linear-gradient(to bottom, ${level.color}, ${levels[idx + 1]?.color ?? level.color})`
                      : 'rgba(255,255,255,0.1)',
                  }} />
              )}

              {/* Level Node */}
              <div className="relative z-10 mb-4">
                <button
                  onClick={() => unlocked && setExpandedLevel(isExpanded ? null : level.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                    isCompleted ? 'bg-gradient-to-r border-transparent shadow-lg shadow-indigo-900/50' :
                    isCurrent ? 'bg-white/10 border-white/20 shadow-lg' :
                    unlocked ? 'bg-white/5 border-white/10' :
                    'bg-white/3 border-white/5 opacity-50'
                  }`}
                  style={isCompleted ? {
                    background: `linear-gradient(135deg, ${level.color}30, ${level.color}10)`,
                    borderColor: `${level.color}50`,
                  } : {}}
                >
                  {/* Level icon */}
                  <div className={`relative flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg ${
                    unlocked ? '' : 'grayscale'
                  }`}
                    style={unlocked ? {
                      background: `linear-gradient(135deg, ${level.color}cc, ${level.color}88)`,
                      boxShadow: isCurrent ? `0 0 20px ${level.color}66` : undefined,
                    } : { background: 'rgba(255,255,255,0.05)' }}>
                    {level.emoji}
                    {/* Pulse ring for current */}
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-2xl animate-ping opacity-30"
                        style={{ background: level.color }} />
                    )}
                    {/* Lock overlay */}
                    {!unlocked && (
                      <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-white/40" />
                      </div>
                    )}
                    {/* Complete checkmark */}
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Level info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white/50 text-xs font-medium">Level {level.number}</span>
                      {!unlocked && <span className="text-white/30 text-xs">• Unlock at {level.minProgress}%</span>}
                    </div>
                    <p className="font-black text-base truncate">{level.title}</p>
                    <p className="text-white/50 text-xs truncate">{level.subtitle}</p>
                    {unlocked && (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${stats.pct}%`, background: level.color }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: level.color }}>
                          {stats.done}/{stats.total}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  {isCompleted && (
                    <div className="flex-shrink-0 text-center">
                      <div className="text-2xl">{level.badgeIcon}</div>
                      <p className="text-xs text-white/50 mt-0.5">Earned</p>
                    </div>
                  )}
                  {unlocked && !isCompleted && (
                    <ChevronRight className={`h-5 w-5 text-white/40 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  )}
                </button>

                {/* Expanded topics */}
                {isExpanded && unlocked && (
                  <div className="mt-2 ml-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    {levelTopics.map(topic => {
                      const done = progress.topics[topic.id]?.completed;
                      const inProg = !done && (progress.topics[topic.id]?.stepReached ?? 0) > 0;
                      return (
                        <button key={topic.id}
                          onClick={() => onSelectTopic(topic.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                            done ? 'bg-emerald-500/10 border-emerald-500/30' :
                            inProg ? 'bg-blue-500/10 border-blue-500/30' :
                            'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}>
                          <span className="text-xl">{topic.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${done ? 'text-emerald-300' : 'text-white'}`}>{topic.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-white/40 text-xs">{topic.timeMinutes} min</span>
                              <span className="text-yellow-400/60 text-xs">+{topic.xpReward} XP</span>
                              {'★'.repeat(topic.difficulty) + '☆'.repeat(3 - topic.difficulty)}
                            </div>
                          </div>
                          {done && <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
                          {!done && <ChevronRight className="h-4 w-4 text-white/30 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Master badge at end */}
        <div className="flex flex-col items-center gap-3 mt-4 pt-6 border-t border-white/10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-4xl shadow-2xl shadow-amber-900/50"
            style={{ opacity: overallProgress >= 88 ? 1 : 0.3 }}>
            🏆
          </div>
          <div className="text-center">
            <p className="font-black text-lg">Grammar Master</p>
            <p className="text-white/50 text-sm">Certificate Unlocked</p>
          </div>
          {overallProgress < 88 && (
            <p className="text-white/30 text-xs">Complete 88% to unlock</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillTree;
