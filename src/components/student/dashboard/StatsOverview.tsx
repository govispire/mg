import React, { useMemo } from 'react';
import { Map, Hourglass, Flame, ClipboardCheck, ArrowUpRight, ListChecks } from 'lucide-react';

// ── Read today's goal stats live from localStorage ──────────────────────────
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

// ── Tiny circular progress ring for the tasks card ────────────────────────
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
      {/* pct label in center */}
      <div
        className="absolute inset-0 flex items-center justify-center text-[9px] font-bold"
        style={{ color }}
      >
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
            label: 'Total Journey Days',
            value: Math.max(0, journeyDays),
            subtext: 'Since start of prep',
            icon: Map,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            accentColor: '#3b82f6',
            emptyPrompt: journeyDays === 0 ? 'Set your start date →' : null,
        },
        {
            id: 'hours',
            label: 'Total Study Hours',
            value: studyHours,
            subtext: studyHours > 0 ? 'From completed quizzes' : 'Complete quizzes to track',
            icon: Hourglass,
            iconBg: 'bg-violet-100',
            iconColor: 'text-violet-600',
            accentColor: '#8b5cf6',
            emptyPrompt: studyHours === 0 ? 'Start your first quiz →' : null,
        },
        {
            id: 'active',
            label: 'Active Days Streak',
            value: activeStreak,
            subtext: activeStreak > 0 ? `${activeStreak} day${activeStreak !== 1 ? 's' : ''} in a row 🔥` : 'Complete 2 quizzes today',
            icon: Flame,
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            accentColor: '#10b981',
            emptyPrompt: activeStreak === 0 ? 'Do 2 quizzes to start 🔥' : null,
        },
        {
            id: 'tests',
            label: 'Quizzes Completed',
            value: mockTestsTaken,
            subtext: mockTestsTaken > 0 ? `${mockTestsTaken} quiz${mockTestsTaken !== 1 ? 'zes' : ''} finished` : 'Start your first quiz!',
            icon: ClipboardCheck,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            accentColor: '#f97316',
            emptyPrompt: mockTestsTaken === 0 ? 'Try a free quiz →' : null,
        },
    ];

    return (
        <div
          className="grid grid-cols-2 lg:grid-cols-5 gap-[1px] bg-slate-200/80 border border-slate-200/80 rounded-2xl overflow-hidden mb-6"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.06)' }}
        >
            {/* ── Standard 4 stat cards ── */}
            {stats.map((stat) => (
                <button
                    key={stat.id}
                    onClick={() => onCardClick(stat.id as any)}
                    className="flex flex-col gap-2 px-3 sm:px-4 py-4 text-left bg-white relative group overflow-hidden"
                    style={{ transition: 'transform 0.18s ease, box-shadow 0.18s ease' }}
                    onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = 'translateY(-2px)';
                        el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)';
                        el.style.zIndex = '10';
                    }}
                    onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = 'translateY(0)';
                        el.style.boxShadow = 'none';
                        el.style.zIndex = '1';
                    }}
                >
                    {/* Left accent bar on hover */}
                    <span
                        className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-l"
                        style={{ background: stat.accentColor }}
                    />
                    {/* Icon + label */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className={`${stat.iconBg} ${stat.iconColor} flex items-center justify-center w-7 h-7 rounded-lg transition-transform duration-200 group-hover:scale-110`}>
                                <stat.icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-xs font-medium text-muted-foreground truncate">{stat.label}</span>
                        </div>
                        <div className="p-1.5 rounded-full bg-primary text-white shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    {/* Value */}
                    <div
                        className="text-3xl font-extrabold text-foreground tracking-tight leading-none"
                        style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
                    >
                        {stat.value}
                    </div>
                    {/* Subtext */}
                    <div className={`text-[11px] leading-tight ${stat.value === 0 && stat.emptyPrompt ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        {stat.value === 0 && stat.emptyPrompt ? stat.emptyPrompt : stat.subtext}
                    </div>
                </button>
            ))}

            {/* ── 5th card: Today's Tasks ── */}
            <button
                onClick={() => onCardClick('tasks')}
                className="flex flex-col gap-2 px-3 sm:px-4 py-4 text-left bg-white relative group overflow-hidden col-span-2 lg:col-span-1"
                style={{ transition: 'transform 0.18s ease, box-shadow 0.18s ease' }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(-2px)';
                    el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)';
                    el.style.zIndex = '10';
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                    el.style.zIndex = '1';
                }}
            >
                {/* Left accent bar — amber/emerald based on completion */}
                <span
                    className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-l"
                    style={{ background: taskPct === 100 ? '#10b981' : '#f59e0b' }}
                />

                {/* Icon + label */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className={`flex items-center justify-center w-7 h-7 rounded-lg transition-transform duration-200 group-hover:scale-110 ${taskPct === 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                            <ListChecks className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-xs font-medium text-muted-foreground truncate">Today's Tasks</span>
                    </div>
                    <div className="p-1.5 rounded-full bg-primary text-white shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                </div>

                {/* Main content: ring + score */}
                <div className="flex items-center gap-3">
                    <MiniRing pct={taskPct} size={44} />
                    <div className="flex flex-col min-w-0">
                        <div
                            className="text-2xl font-extrabold tracking-tight leading-none"
                            style={{
                                fontFamily: "'Outfit', 'Inter', sans-serif",
                                color: taskPct === 100 ? '#10b981' : added > 0 ? '#f59e0b' : '#94a3b8',
                            }}
                        >
                            {completed}/{added}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                            tasks done
                        </div>
                    </div>
                </div>

                {/* Slot meter: 5 segments showing how many of 5 are used */}
                <div className="flex gap-1 mt-0.5">
                    {Array.from({ length: MAX_TASKS }).map((_, i) => {
                        const isUsed = i < added;
                        const isDone = i < completed;
                        return (
                            <div
                                key={i}
                                className="flex-1 h-1.5 rounded-full transition-all duration-500"
                                style={{
                                    background: isDone ? '#10b981' : isUsed ? '#f59e0b' : '#e2e8f0',
                                    transitionDelay: `${i * 60}ms`,
                                }}
                            />
                        );
                    })}
                </div>

                {/* Subtext */}
                <div className="text-[11px] leading-tight">
                    {added === 0
                        ? <span className="text-amber-600 font-semibold">Set goals before 9 AM →</span>
                        : taskPct === 100
                        ? <span className="text-emerald-600 font-semibold">🎉 All done! Great work!</span>
                        : <span className="text-muted-foreground">{added}/{MAX_TASKS} slots used · {MAX_TASKS - added} left</span>
                    }
                </div>
            </button>
        </div>
    );
};
