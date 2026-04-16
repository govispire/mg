import React from 'react';
import { Users, Award, TrendingUp, Target, Clock, Zap } from 'lucide-react';
import { ExamProgressData } from '@/hooks/useExamProgress';

interface ExamProgressDashboardProps {
  progressData: ExamProgressData;
  getTypeProgress: (testType: keyof ExamProgressData['testTypes']) => {
    completed: number;
    total: number;
    percentage: number;
    averageScore: number;
    bestScore: number;
    totalAttempts: number;
  };
}

const ACCENT = '#10b981';

/* ── Tiny SVG ring ─────────────────────────────────────────────────────────── */
const MiniRing: React.FC<{ pct: number; size?: number; stroke?: number }> = ({
  pct, size = 44, stroke = 4,
}) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct, 100) / 100 * circ;
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={ACCENT} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
    </svg>
  );
};

const TEST_TYPES: { key: string; name: string; icon: React.ReactNode }[] = [
  { key: 'prelims',   name: 'Prelims',   icon: <Target className="h-3 w-3" /> },
  { key: 'mains',     name: 'Mains',     icon: <Award className="h-3 w-3" /> },
  { key: 'sectional', name: 'Sectional', icon: <Clock className="h-3 w-3" /> },
  { key: 'speed',     name: 'Speed',     icon: <Zap className="h-3 w-3" /> },
  { key: 'pyq',       name: 'PYQ',       icon: <TrendingUp className="h-3 w-3" /> },
  { key: 'live',      name: 'Live',      icon: <Users className="h-3 w-3" /> },
];

export const ExamProgressDashboard: React.FC<ExamProgressDashboardProps> = ({
  progressData,
  getTypeProgress,
}) => {
  const totalCompleted = Object.keys(progressData.testTypes).reduce(
    (s, t) => s + getTypeProgress(t as keyof ExamProgressData['testTypes']).completed, 0,
  );
  const totalTests = Object.keys(progressData.testTypes).reduce(
    (s, t) => s + getTypeProgress(t as keyof ExamProgressData['testTypes']).total, 0,
  );
  const completedPct = totalTests > 0 ? Math.round((totalCompleted / totalTests) * 100) : 0;

  return (
    <div className="px-4 py-3 space-y-4">

      {/* ── 4 compact stat tiles ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Total Users',      value: progressData.totalUsers.toLocaleString(), pct: null, icon: <Users className="h-3.5 w-3.5" /> },
          { label: 'Your Rank',        value: progressData.userRank ? `#${progressData.userRank}` : 'N/A', pct: null, icon: <Award className="h-3.5 w-3.5" /> },
          { label: 'Overall Progress', value: `${progressData.overallProgress}%`, pct: progressData.overallProgress, icon: null },
          { label: 'Tests Completed',  value: `${totalCompleted}/${totalTests || 120}`, pct: completedPct, icon: null },
        ].map((stat, i) => (
          <div key={i}
            className="flex items-center gap-2.5 bg-white rounded-xl border border-slate-200 px-3 py-2.5 shadow-sm"
          >
            {stat.pct !== null ? (
              <div className="relative flex-shrink-0">
                <MiniRing pct={stat.pct} />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-700">
                  {stat.pct}%
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${ACCENT}15`, color: ACCENT }}>
                {stat.icon}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 leading-none">{stat.label}</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Test type ring row ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Test Type Progress</span>
          <span className="text-[10px] text-slate-400">{totalCompleted}/{totalTests || 120} done</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-slate-100">
          {TEST_TYPES.map((tt) => {
            const prog = getTypeProgress(tt.key as keyof ExamProgressData['testTypes']);
            return (
              <div key={tt.key} className="flex flex-col items-center py-3 px-2 gap-1.5">
                <div className="relative">
                  <MiniRing pct={prog.percentage} size={40} stroke={4} />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-700">
                    {Math.round(prog.percentage)}%
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-slate-600">{tt.name}</p>
                <p className="text-[9px] text-slate-400">{prog.completed}/{prog.total}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
