import React, { useState } from 'react';
import { Trophy, Flame, TrendingUp, TrendingDown, Minus, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface StudentRank {
  id: number;
  name: string;
  avatar: string;
  exam: string;
  taskCompletion: number;
  avgScore: number;
  streak: number;
  trend: 'up' | 'down' | 'same';
  weakSubject: string;
  strongSubject: string;
  lastActive: string;
}

const students: StudentRank[] = [
  {
    id: 1, name: 'Ananya Rajan', avatar: 'https://i.pravatar.cc/40?u=ananya',
    exam: 'SBI PO', taskCompletion: 98, avgScore: 89, streak: 24, trend: 'up',
    weakSubject: 'Para Jumble', strongSubject: 'Grammar', lastActive: '1h ago',
  },
  {
    id: 2, name: 'Karthik Menon', avatar: 'https://i.pravatar.cc/40?u=karthik',
    exam: 'IBPS PO', taskCompletion: 95, avgScore: 85, streak: 20, trend: 'up',
    weakSubject: 'DI', strongSubject: 'Reasoning', lastActive: '2h ago',
  },
  {
    id: 3, name: 'Sneha Gupta', avatar: 'https://i.pravatar.cc/40?u=sneha',
    exam: 'SBI Clerk', taskCompletion: 91, avgScore: 82, streak: 18, trend: 'same',
    weakSubject: 'RC', strongSubject: 'Quant', lastActive: '30m ago',
  },
  {
    id: 4, name: 'Arjun Verma', avatar: 'https://i.pravatar.cc/40?u=arjun2',
    exam: 'IBPS Clerk', taskCompletion: 85, avgScore: 78, streak: 18, trend: 'up',
    weakSubject: 'Seating Arr.', strongSubject: 'Number Series', lastActive: '15m ago',
  },
  {
    id: 5, name: 'Priya Shetty', avatar: 'https://i.pravatar.cc/40?u=priya3',
    exam: 'SBI PO', taskCompletion: 80, avgScore: 75, streak: 14, trend: 'down',
    weakSubject: 'Time & Work', strongSubject: 'English', lastActive: '6h ago',
  },
  {
    id: 6, name: 'Rahul Das', avatar: 'https://i.pravatar.cc/40?u=rahul3',
    exam: 'IBPS PO', taskCompletion: 72, avgScore: 68, streak: 12, trend: 'down',
    weakSubject: 'Blood Rel.', strongSubject: 'GK', lastActive: '1d ago',
  },
  {
    id: 7, name: 'Deepa Varma', avatar: 'https://i.pravatar.cc/40?u=deepa2',
    exam: 'SBI Clerk', taskCompletion: 68, avgScore: 65, streak: 10, trend: 'same',
    weakSubject: 'GK', strongSubject: 'Computer', lastActive: '2d ago',
  },
];

type SortKey = 'taskCompletion' | 'avgScore' | 'streak';

const MentorLeaderboard: React.FC = () => {
  const [sortKey, setSortKey] = useState<SortKey>('taskCompletion');
  const [expanded, setExpanded] = useState<number | null>(null);

  const sorted = [...students].sort((a, b) => b[sortKey] - a[sortKey]);

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'same' }) => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
    return <Minus className="w-3.5 h-3.5 text-gray-300" />;
  };

  const RankBadge = ({ rank }: { rank: number }) => {
    const styles: Record<number, string> = {
      1: 'bg-yellow-400 text-white',
      2: 'bg-gray-300 text-gray-700',
      3: 'bg-orange-300 text-white',
    };
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${styles[rank] ?? 'bg-gray-100 text-gray-500'}`}>
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Student Leaderboard
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">{students.length} students · Ranked by performance</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {([['taskCompletion', 'Tasks'], ['avgScore', 'Score'], ['streak', 'Streak']] as [SortKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${sortKey === key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-4">
        {sorted.slice(0, 3).map((s, i) => {
          const colors = ['bg-yellow-50 border-yellow-300', 'bg-gray-50 border-gray-200', 'bg-orange-50 border-orange-200'];
          return (
            <div key={s.id} className={`${colors[i]} border-2 rounded-2xl p-4 text-center`}>
              <div className="relative mb-2">
                <img src={s.avatar} alt={s.name} className="w-14 h-14 rounded-full border-4 border-white shadow-sm mx-auto" />
                <span className="absolute -top-1 -right-1 text-lg">{['🥇', '🥈', '🥉'][i]}</span>
              </div>
              <p className="text-sm font-bold text-gray-900 truncate">{s.name.split(' ')[0]}</p>
              <p className="text-xs text-gray-500">{s.exam}</p>
              <p className={`text-xl font-bold mt-2 ${sortKey === 'taskCompletion' ? 'text-blue-600' : 'text-green-600'}`}>
                {s[sortKey]}{sortKey !== 'streak' ? '%' : 'd'}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {sortKey === 'taskCompletion' ? 'tasks done' : sortKey === 'avgScore' ? 'avg score' : 'streak'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Full list */}
      <div className="space-y-2">
        {sorted.map((s, i) => {
          const rank = i + 1;
          const isExpanded = expanded === s.id;
          return (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : s.id)}
              >
                <RankBadge rank={rank} />
                <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-full border-2 border-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900 truncate">{s.name}</p>
                    <TrendIcon trend={s.trend} />
                  </div>
                  <p className="text-xs text-gray-500">{s.exam} · {s.lastActive}</p>
                </div>
                <div className="flex items-center gap-4 text-right flex-shrink-0">
                  <div>
                    <p className="text-sm font-bold text-blue-600">{s.taskCompletion}%</p>
                    <p className="text-[10px] text-gray-400">tasks</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-600">{s.avgScore}%</p>
                    <p className="text-[10px] text-gray-400">score</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <p className="text-sm font-semibold text-gray-700">{s.streak}d</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 pt-3">
                    <div>
                      <p className="text-xs font-semibold text-red-500 mb-1.5">⚠ Weak Area</p>
                      <span className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-md font-medium">{s.weakSubject}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-600 mb-1.5">✨ Strong Area</p>
                      <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-md font-medium">{s.strongSubject}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1.5">Last Active</p>
                      <span className="text-xs text-gray-700">{s.lastActive}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1.5">Actions</p>
                      <div className="flex gap-2">
                        <button className="text-xs text-blue-600 font-semibold hover:underline">Assign Task</button>
                        <button className="text-xs text-purple-600 font-semibold hover:underline">Chat</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MentorLeaderboard;
