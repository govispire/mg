import React, { useState } from 'react';
import { Flame, Trophy, Target, CheckCircle2 } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  taskCompletion: number;
  testScore: number;
  streak: number;
  isCurrentUser?: boolean;
}

interface WeeklyProgress {
  day: string;
  tasks: number;
  testScore: number;
}

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Ananya R.', avatar: 'https://i.pravatar.cc/40?u=ananya', taskCompletion: 98, testScore: 89, streak: 24 },
  { rank: 2, name: 'Karthik M.', avatar: 'https://i.pravatar.cc/40?u=karthik', taskCompletion: 95, testScore: 85, streak: 20 },
  { rank: 3, name: 'Sneha G.', avatar: 'https://i.pravatar.cc/40?u=sneha', taskCompletion: 91, testScore: 82, streak: 18 },
  { rank: 4, name: 'You (Arjun)', avatar: 'https://i.pravatar.cc/40?u=arjun', taskCompletion: 85, testScore: 78, streak: 18, isCurrentUser: true },
  { rank: 5, name: 'Priya S.', avatar: 'https://i.pravatar.cc/40?u=priya2', taskCompletion: 80, testScore: 75, streak: 14 },
  { rank: 6, name: 'Rahul K.', avatar: 'https://i.pravatar.cc/40?u=rahul2', taskCompletion: 72, testScore: 68, streak: 12 },
  { rank: 7, name: 'Deepa V.', avatar: 'https://i.pravatar.cc/40?u=deepa', taskCompletion: 68, testScore: 65, streak: 10 },
];

const weeklyProgress: WeeklyProgress[] = [
  { day: 'Mon', tasks: 6, testScore: 72 },
  { day: 'Tue', tasks: 5, testScore: 75 },
  { day: 'Wed', tasks: 6, testScore: 78 },
  { day: 'Thu', tasks: 4, testScore: 70 },
  { day: 'Fri', tasks: 6, testScore: 82 },
  { day: 'Sat', tasks: 5, testScore: 79 },
  { day: 'Sun', tasks: 3, testScore: 0 },
];

const subjectProgress = [
  { subject: 'English Language', score: 65, weak: ['RC', 'Para Jumble'] },
  { subject: 'Quantitative Aptitude', score: 78, weak: ['Time & Work'] },
  { subject: 'Reasoning Ability', score: 60, weak: ['Seating Arr.', 'Blood Rel.'] },
  { subject: 'General Awareness', score: 82, weak: [] },
];

type Tab = 'overview' | 'leaderboard' | 'weekly';

const ProgressPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [lbFilter, setLbFilter] = useState<'task' | 'score' | 'streak'>('task');

  const maxTest = Math.max(...weeklyProgress.map(d => d.testScore), 1);

  return (
    <div className="space-y-6">
      {/* ── 1. UNIFIED WHITE TOP STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Task Streak', value: '18 days', icon: Flame, iconColor: 'text-orange-500' },
          { label: 'Batch Rank', value: '#4 / 14', icon: Trophy, iconColor: 'text-amber-500' },
          { label: 'Avg Accuracy', value: '71%', icon: Target, iconColor: 'text-blue-600' },
          { label: 'Tasks Done', value: '85%', icon: CheckCircle2, iconColor: 'text-emerald-600' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mb-3 shadow-2xs">
                <Icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">{s.value}</p>
              <p className="text-xs font-bold text-slate-400 mt-1.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── 2. COMPACT SEGMENTED CONTROL TRACK FOR SUB-TABS ── */}
      <div className="bg-slate-100/90 border border-slate-200/80 p-1 rounded-xl flex items-center gap-1 w-fit" role="tablist">
        {(['overview', 'leaderboard', 'weekly'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
              activeTab === t
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            role="tab"
            aria-selected={activeTab === t}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── 3. OVERVIEW: UNIFIED ROYAL BLUE PROGRESS BARS & EQUAL HEIGHT CARDS ── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Subject-wise Performance Breakdown</h3>
            <span className="text-xs text-slate-400 font-semibold">Updated Today</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {subjectProgress.map(s => (
              <div key={s.subject} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-extrabold text-slate-900">{s.subject}</p>
                    <span className="text-sm font-extrabold text-slate-900">
                      {s.score}%
                    </span>
                  </div>

                  {/* UNIFIED ROYAL BLUE PROGRESS BAR */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden border border-slate-200/60">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                </div>

                {/* NEUTRAL GRAY WEAK TOPIC TAGS (TONED DOWN) */}
                <div className="pt-2 border-t border-slate-100">
                  {s.weak.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-500">Weak Topics:</span>
                      {s.weak.map(w => (
                        <span key={w} className="text-xs font-bold bg-slate-100 border border-slate-200/80 text-slate-700 px-2.5 py-0.5 rounded-md">
                          {w}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Strong proficiency — No weak areas!
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. LEADERBOARD ── */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-500">Filter Leaderboard:</span>
            <div className="flex gap-1.5">
              {(['task', 'score', 'streak'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setLbFilter(f)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-extrabold transition-all capitalize ${
                    lbFilter === f ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f === 'task' ? 'Task Completion' : f === 'score' ? 'Test Score' : 'Streak'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {leaderboard
              .sort((a, b) =>
                lbFilter === 'task' ? b.taskCompletion - a.taskCompletion :
                lbFilter === 'score' ? b.testScore - a.testScore :
                b.streak - a.streak
              )
              .map((entry, i) => {
                const displayRank = i + 1;
                return (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      entry.isCurrentUser ? 'border-blue-500 bg-blue-50/70 shadow-2xs' : 'border-slate-100 bg-white shadow-2xs'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                      displayRank === 1 ? 'bg-amber-400 text-slate-950' :
                      displayRank === 2 ? 'bg-slate-300 text-slate-800' :
                      displayRank === 3 ? 'bg-amber-600 text-white' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {displayRank}
                    </div>
                    <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full border-2 border-slate-200 object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-extrabold truncate ${entry.isCurrentUser ? 'text-blue-700' : 'text-slate-900'}`}>
                        {entry.name} {entry.isCurrentUser && <span className="text-xs font-normal text-blue-600">(You)</span>}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">{entry.streak} day streak 🔥</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-slate-900">
                        {lbFilter === 'task' ? `${entry.taskCompletion}%` :
                         lbFilter === 'score' ? `${entry.testScore}%` :
                         `${entry.streak}d`}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        {lbFilter === 'task' ? 'tasks' : lbFilter === 'score' ? 'score' : 'streak'}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── 5. WEEKLY ── */}
      {activeTab === 'weekly' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">Weekly Performance Trends</h3>

          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs text-slate-400 font-bold mb-4">Test Accuracy Score by Day</p>
            <div className="flex items-end gap-3 h-36 pt-4">
              {weeklyProgress.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-600">{d.testScore > 0 ? `${d.testScore}%` : ''}</span>
                  <div
                    className={`w-full rounded-t-xl transition-all ${d.testScore > 75 ? 'bg-blue-600' : d.testScore > 0 ? 'bg-blue-400' : 'bg-slate-100'}`}
                    style={{ height: `${d.testScore > 0 ? (d.testScore / maxTest) * 100 : 8}%` }}
                  />
                  <span className="text-[11px] font-bold text-slate-500">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;
