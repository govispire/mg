import React, { useState } from 'react';
import { TrendingUp, Flame, Trophy, Target, BarChart2, CheckCircle2, Clock } from 'lucide-react';

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
  { subject: 'English', score: 65, weak: ['RC', 'Para Jumble'], color: 'bg-blue-500' },
  { subject: 'Quantitative', score: 78, weak: ['Time & Work'], color: 'bg-green-500' },
  { subject: 'Reasoning', score: 60, weak: ['Seating Arr.', 'Blood Rel.'], color: 'bg-purple-500' },
  { subject: 'General Awareness', score: 82, weak: [], color: 'bg-orange-500' },
];

type Tab = 'overview' | 'leaderboard' | 'weekly';

const ProgressPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [lbFilter, setLbFilter] = useState<'task' | 'score' | 'streak'>('task');

  const maxTest = Math.max(...weeklyProgress.map(d => d.testScore), 1);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Task Streak', value: '18 days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Batch Rank', value: '#4 / 14', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { label: 'Avg Accuracy', value: '71%', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Tasks Done', value: '85%', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center mb-3 shadow-sm`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit" role="tablist" aria-label="Progress view options">
        {(['overview', 'leaderboard', 'weekly'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize
              ${activeTab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            role="tab"
            aria-selected={activeTab === t}
            aria-controls={`progress-panel-${t}`}
            id={`progress-tab-${t}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && (
        <div className="space-y-4" role="tabpanel" aria-labelledby="progress-tab-overview" id="progress-panel-overview">
          <h3 className="text-sm font-bold text-gray-700">Subject-wise Progress</h3>
          {subjectProgress.map(s => (
            <div key={s.subject} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-gray-900">{s.subject}</p>
                <span className={`text-sm font-bold ${s.score >= 75 ? 'text-green-600' : s.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {s.score}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                <div className={`${s.color} h-full rounded-full transition-all duration-500`} style={{ width: `${s.score}%` }} />
              </div>
              {s.weak.length > 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-red-500 font-medium">⚠ Weak:</span>
                  {s.weak.map(w => (
                    <span key={w} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-md">{w}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> No weak areas — keep it up!
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Leaderboard ── */}
      {activeTab === 'leaderboard' && (
        <div role="tabpanel" aria-labelledby="progress-tab-leaderboard" id="progress-panel-leaderboard">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-500 font-medium">Sort by:</span>
            {(['task', 'score', 'streak'] as const).map(f => (
              <button
                key={f}
                onClick={() => setLbFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors capitalize
                  ${lbFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                aria-label={`Sort leaderboard by ${f === 'task' ? 'task completion' : f === 'score' ? 'test score' : 'streak'}`}
                aria-pressed={lbFilter === f}
              >
                {f === 'task' ? 'Task Completion' : f === 'score' ? 'Test Score' : 'Streak'}
              </button>
            ))}
          </div>

          <div className="space-y-2">
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
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                      ${entry.isCurrentUser ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                      ${displayRank === 1 ? 'bg-yellow-400 text-white' :
                        displayRank === 2 ? 'bg-gray-300 text-gray-700' :
                        displayRank === 3 ? 'bg-orange-300 text-white' :
                        'bg-gray-100 text-gray-500'}`}
                    >
                      {displayRank}
                    </div>
                    <img src={entry.avatar} alt={entry.name} className="w-9 h-9 rounded-full border-2 border-gray-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${entry.isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>
                        {entry.name} {entry.isCurrentUser && <span className="text-xs font-normal">(You)</span>}
                      </p>
                      <p className="text-xs text-gray-500">{entry.streak} day streak 🔥</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">
                        {lbFilter === 'task' ? `${entry.taskCompletion}%` :
                         lbFilter === 'score' ? `${entry.testScore}%` :
                         `${entry.streak}d`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {lbFilter === 'task' ? 'tasks' : lbFilter === 'score' ? 'score' : 'streak'}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Weekly ── */}
      {activeTab === 'weekly' && (
        <div role="tabpanel" aria-labelledby="progress-tab-weekly" id="progress-panel-weekly">
          <h3 className="text-sm font-bold text-gray-700 mb-4">This Week's Performance</h3>

          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <p className="text-xs text-gray-500 mb-4 font-medium">Test Score by Day</p>
            <div className="flex items-end gap-3 h-32">
              {weeklyProgress.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500">{d.testScore > 0 ? `${d.testScore}%` : ''}</span>
                  <div
                    className={`w-full rounded-t-lg transition-all ${d.testScore > 75 ? 'bg-blue-500' : d.testScore > 0 ? 'bg-blue-300' : 'bg-gray-100'}`}
                    style={{ height: `${d.testScore > 0 ? (d.testScore / maxTest) * 100 : 5}%` }}
                  />
                  <span className="text-[10px] text-gray-400">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily summary */}
          <div className="space-y-2">
            {weeklyProgress.map(d => (
              <div key={d.day} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-gray-700 w-10">{d.day}</span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs text-gray-600">{d.tasks} tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs text-gray-600">{d.testScore > 0 ? `${d.testScore}% score` : 'No test'}</span>
                </div>
                <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  d.tasks >= 6 ? 'bg-green-100 text-green-700' :
                  d.tasks >= 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  {d.tasks >= 6 ? 'Full' : d.tasks >= 4 ? 'Partial' : 'Missed'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;
