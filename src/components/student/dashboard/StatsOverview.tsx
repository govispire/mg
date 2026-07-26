import React, { useMemo } from 'react';
import { Map, Hourglass, Flame, ClipboardCheck, ArrowUpRight, ListChecks } from 'lucide-react';

const getISTDateStr = () => {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, '0')}-${String(ist.getUTCDate()).padStart(2, '0')}`;
};

const useTodayGoalStats = () => {
  return useMemo(() => {
    try {
      const allGoals = JSON.parse(localStorage.getItem('dailyGoals_v2') || '[]');
      const today = getISTDateStr();
      const todayGoals = allGoals.filter((g: any) => g.createdAt === today);
      const added = todayGoals.length;
      const completed = todayGoals.filter((g: any) => g.status === 'completed').length;
      return { added, completed };
    } catch {
      return { added: 0, completed: 0 };
    }
  }, []);
};

interface StatsOverviewProps {
    journeyDays: number;
    userName: string;
    studyHours: number;
    activeStreak: number;
    mockTestsTaken: number;
    onCardClick: (type: 'journey' | 'hours' | 'active' | 'tests' | 'tasks') => void;
}

const MiniRing: React.FC<{ pct: number; size?: number }> = ({ pct, size = 40 }) => {
  const stroke = 4;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct === 100 ? '#10b981' : pct > 0 ? '#f59e0b' : '#e2e8f0';
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color }}>
        {pct}%
      </div>
    </div>
  );
};

export const StatsOverview: React.FC<StatsOverviewProps> = ({
    journeyDays,
    studyHours,
    activeStreak,
    mockTestsTaken,
    onCardClick
}) => {
    const { added, completed } = useTodayGoalStats();
    const taskPct = added === 0 ? 0 : Math.round((completed / added) * 100);
    const MAX_TASKS = 5;

    const stats = [
        {
            id: 'journey',
            label: 'Journey Days',
            value: Math.max(0, journeyDays),
            subtext: 'Since start of prep',
            icon: Map,
            // Neutral icon — no rainbow gradient
            iconBg: '#F1F5F9',
            iconColor: '#475569',
            accentColor: '#2563EB',  // brand blue left-strip only
        },
        {
            id: 'hours',
            label: 'Study Hours',
            value: studyHours,
            subtext: studyHours > 0 ? 'From completed quizzes' : 'Complete quizzes to track',
            icon: Hourglass,
            iconBg: '#F1F5F9',
            iconColor: '#475569',
            accentColor: '#475569',
        },
        {
            id: 'active',
            label: 'Active Streak',
            value: activeStreak,
            subtext: activeStreak > 0 ? `${activeStreak} day${activeStreak !== 1 ? 's' : ''} in a row` : 'Complete 2 quizzes today',
            icon: Flame,
            // Flame is semantic: amber for in-progress streaks
            iconBg: '#FFF7ED',
            iconColor: '#D97706',
            accentColor: '#D97706',
        },
        {
            id: 'tests',
            label: 'Tests Done',
            value: mockTestsTaken,
            subtext: mockTestsTaken > 0 ? `${mockTestsTaken} quiz${mockTestsTaken !== 1 ? 'zes' : ''} finished` : 'Start your first quiz!',
            icon: ClipboardCheck,
            iconBg: '#F1F5F9',
            iconColor: '#475569',
            accentColor: '#475569',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* ── Standard 4 stat cards ── */}
            {stats.map((stat) => (
                <button
                    key={stat.id}
                    onClick={() => onCardClick(stat.id as any)}
                    className="group relative flex flex-col gap-2 px-5 py-4 text-left bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-slate-300"
                    style={{ borderLeft: `3px solid ${stat.accentColor}` }}
                >
                    {/* Subtle watermark arrow */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ArrowUpRight className="h-16 w-16 text-slate-400" />
                    </div>
                    
                    {/* Icon — uniform neutral gray container */}
                    <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm flex-shrink-0"
                        style={{ background: stat.iconBg, color: stat.iconColor }}
                    >
                        <stat.icon className="h-5 w-5" />
                    </div>
                    
                    {/* Value */}
                    <div className="relative z-10">
                        <div
                            className="text-3xl font-bold text-slate-900 tracking-tight leading-none"
                            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
                        >
                            {stat.value}
                        </div>
                        <div className="text-xs font-medium text-slate-500 mt-1">{stat.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{stat.subtext}</div>
                    </div>
                </button>
            ))}

            {/* ── 5th card: Today's Tasks ── */}
            <button
                onClick={() => onCardClick('tasks')}
                className="group relative flex flex-col gap-2 px-5 py-4 text-left bg-white rounded-2xl border border-slate-200 overflow-hidden col-span-2 lg:col-span-1 transition-all duration-200 hover:shadow-lg hover:border-slate-300"
                style={{ borderLeft: `3px solid ${taskPct === 100 ? '#16A34A' : added > 0 ? '#D97706' : '#CBD5E1'}` }}
            >
                {/* Subtle watermark */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ArrowUpRight className="h-16 w-16 text-slate-400" />
                </div>

                {/* Icon — semantic coloring retained (task completion state is functional) */}
                <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm flex-shrink-0"
                    style={{
                        background: taskPct === 100 ? '#F0FDF4' : added > 0 ? '#FFFBEB' : '#F1F5F9',
                        color:      taskPct === 100 ? '#16A34A' : added > 0 ? '#D97706' : '#94A3B8',
                    }}
                >
                    <ListChecks className="h-5 w-5" />
                </div>

                {/* Main content */}
                <div className="relative z-10">
                    <div
                        className="text-2xl font-bold tracking-tight leading-none"
                        style={{
                            fontFamily: "'Outfit', 'Inter', sans-serif",
                            color: taskPct === 100 ? '#16A34A' : added > 0 ? '#D97706' : '#94a3b8',
                        }}
                    >
                        {completed}/{added}
                    </div>
                    <div className="text-xs font-medium text-slate-500 mt-1">Today's Tasks</div>
                </div>

                {/* Slot meter: 5 segments */}
                <div className="flex gap-1 relative z-10">
                    {Array.from({ length: MAX_TASKS }).map((_, i) => {
                        const isUsed = i < added;
                        const isDone = i < completed;
                        return (
                            <div
                                key={i}
                                className="flex-1 h-1.5 rounded-full transition-all duration-500"
                                style={{
                                    background: isDone ? '#16A34A' : isUsed ? '#D97706' : '#e2e8f0',
                                    transitionDelay: `${i * 60}ms`,
                                }}
                            />
                        );
                    })}
                </div>
            </button>
        </div>
    );
};
