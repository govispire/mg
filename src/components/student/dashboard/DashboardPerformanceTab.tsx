import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Target, Zap, Trophy,
  BookOpen, ChevronDown, ChevronUp, ArrowUpRight, BarChart3,
  CheckCircle, AlertTriangle, XCircle, Activity,
  Award, Flame,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashStats {
  studyHours: number;
  activeStreak: number;
  mockTestsTaken: number;
  avgScore: number;
  percentile: number;
  performanceData: Array<{ week: string; tests: number; quizzes: number }>;
  isLoading: boolean;
}

interface Props {
  targetExamName: string;
  dashStats: DashStats;
  userName: string;
}

// ─── Seeded mock data (scoped to exam, swappable for real API) ─────────────────

const SUBJECT_DATA = [
  { subject: 'General Awareness', short: 'GA', score: 91, color: '#10b981', topics: [
    { name: 'Current Affairs', score: 94 }, { name: 'Static GK', score: 89 },
    { name: 'Banking Awareness', score: 88 }, { name: 'Economy', score: 82 },
  ]},
  { subject: 'English Language', short: 'English', score: 82, color: '#6366f1', topics: [
    { name: 'Reading Comprehension', score: 88 }, { name: 'Cloze Test', score: 85 },
    { name: 'Error Detection', score: 79 }, { name: 'Para Jumbles', score: 72 },
  ]},
  { subject: 'Reasoning', short: 'Reasoning', score: 76, color: '#f59e0b', topics: [
    { name: 'Blood Relations', score: 87 }, { name: 'Syllogism', score: 82 },
    { name: 'Puzzle & Seating', score: 71 }, { name: 'Coding-Decoding', score: 65 },
  ]},
  { subject: 'Quantitative Aptitude', short: 'Quant', score: 61, color: '#ef4444', topics: [
    { name: 'Simplification', score: 81 }, { name: 'Data Interpretation', score: 61 },
    { name: 'Quadratic Equations', score: 42 }, { name: 'Number Series', score: 74 },
    { name: 'Probability', score: 38 },
  ]},
];

const STRENGTH_WEAKNESS = {
  strong:    ['Reading Comp.', 'Cloze Test', 'Blood Relations', 'Current Affairs', 'Static GK'],
  improving: ['Data Interpretation', 'Puzzle', 'Para Jumbles', 'Coding-Decoding'],
  weak:      ['Quadratic Equations', 'Probability', 'Permutation & Combo'],
};


const RECENT_MOCKS = [
  { id: 26, label: 'Mock 26', score: 82, total: 100, rank: 1248, date: '2 Aug 2026', trend: 'up' },
  { id: 25, label: 'Mock 25', score: 79, total: 100, rank: 1840, date: '28 Jul 2026', trend: 'up' },
  { id: 24, label: 'Mock 24', score: 74, total: 100, rank: 2300, date: '21 Jul 2026', trend: 'down' },
  { id: 23, label: 'Mock 23', score: 77, total: 100, rank: 2100, date: '14 Jul 2026', trend: 'up' },
];


// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  color?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, subtitle, color = '#6366f1', action }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2.5">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
        style={{ background: `${color}18`, border: `1.5px solid ${color}30` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <h3 className="font-bold text-[14px] text-slate-800 leading-none">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

// ─── Section 1: Performance Snapshot ─────────────────────────────────────────

const PerformanceSnapshot: React.FC<{ dashStats: DashStats; targetExamName: string }> = ({
  dashStats, targetExamName,
}) => {
  const readiness = dashStats.avgScore > 0
    ? Math.min(99, Math.round((dashStats.avgScore / 100) * 85 + (dashStats.mockTestsTaken / 30) * 10 + 5))
    : 0;

  const consistency = dashStats.activeStreak > 0
    ? Math.min(99, Math.round(dashStats.activeStreak * 6.5))
    : 0;

  const cards = [
    {
      label: 'Accuracy',
      value: dashStats.avgScore > 0 ? `${dashStats.avgScore}%` : '—',
      icon: Target,
      color: '#10b981',
      bg: '#10b98115',
      sub: dashStats.avgScore > 80 ? 'Excellent' : dashStats.avgScore > 60 ? 'Good' : 'Needs work',
    },
    {
      label: 'Avg Score',
      value: dashStats.avgScore > 0 ? `${Math.round(dashStats.avgScore * 1.2)}/120` : '—',
      icon: BarChart3,
      color: '#6366f1',
      bg: '#6366f115',
      sub: 'Per mock',
    },
    {
      label: 'Best Rank',
      value: dashStats.mockTestsTaken > 0 ? '#1,248' : '—',
      icon: Trophy,
      color: '#f59e0b',
      bg: '#f59e0b15',
      sub: `in ${targetExamName}`,
    },
    {
      label: 'Readiness',
      value: readiness > 0 ? `${readiness}%` : '—',
      icon: Zap,
      color: readiness >= 70 ? '#10b981' : readiness >= 50 ? '#f59e0b' : '#ef4444',
      bg: readiness >= 70 ? '#10b98115' : readiness >= 50 ? '#f59e0b15' : '#ef444415',
      sub: readiness >= 70 ? 'On track!' : readiness >= 50 ? 'Keep going' : 'Start mocks',
    },
    {
      label: 'Mocks Taken',
      value: dashStats.mockTestsTaken > 0 ? String(dashStats.mockTestsTaken) : '0',
      icon: BookOpen,
      color: '#8b5cf6',
      bg: '#8b5cf615',
      sub: `${Math.max(0, 30 - dashStats.mockTestsTaken)} to go`,
    },
    {
      label: 'Streak',
      value: dashStats.activeStreak > 0 ? `${dashStats.activeStreak}d` : '0d',
      icon: Flame,
      color: '#ef4444',
      bg: '#ef444415',
      sub: dashStats.activeStreak >= 7 ? '🔥 On fire!' : 'Keep it daily',
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 flex flex-col gap-1.5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {c.label}
              </span>
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: c.bg }}
              >
                <Icon className="h-3 w-3" style={{ color: c.color }} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-800 leading-none">{c.value}</div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium">{c.sub}</div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Section 2: Performance Trend ────────────────────────────────────────────

const TREND_FILTERS = ['Last 7 Mocks', 'Last 30 Days', 'All Time'] as const;
type TrendFilter = typeof TREND_FILTERS[number];

const TREND_METRICS = ['Accuracy', 'Avg Score', 'Rank'] as const;
type TrendMetric = typeof TREND_METRICS[number];

const PerformanceTrend: React.FC<{
  performanceData: Array<{ week: string; tests: number; quizzes: number }>;
  targetExamName: string;
}> = ({ performanceData, targetExamName }) => {
  const [filter, setFilter] = useState<TrendFilter>('Last 7 Mocks');
  const [metric, setMetric] = useState<TrendMetric>('Accuracy');

  const chartData = useMemo(() => {
    const base = performanceData.length > 0 ? performanceData : [
      { week: 'M1', tests: 62, quizzes: 58 },
      { week: 'M2', tests: 65, quizzes: 63 },
      { week: 'M3', tests: 70, quizzes: 67 },
      { week: 'M4', tests: 74, quizzes: 71 },
      { week: 'M5', tests: 77, quizzes: 75 },
      { week: 'M6', tests: 79, quizzes: 77 },
      { week: 'M7', tests: 82, quizzes: 80 },
    ];
    const sliced = filter === 'Last 7 Mocks' ? base.slice(-7) : base;
    return sliced.map((d) => ({
      name: d.week,
      value: metric === 'Accuracy' ? d.tests
        : metric === 'Avg Score' ? Math.round(d.tests * 1.2)
        : Math.max(500, 10000 - d.tests * 90),
      avg: metric === 'Accuracy' ? 75 : metric === 'Avg Score' ? 90 : 5000,
    }));
  }, [performanceData, filter, metric]);

  const metricColor = metric === 'Accuracy' ? '#6366f1' : metric === 'Avg Score' ? '#10b981' : '#f59e0b';
  const gradId = `grad_trend_${metric.replace(/\s/g, '')}`;

  const formatY = (v: number) =>
    metric === 'Rank' ? `#${v.toLocaleString()}` : metric === 'Accuracy' ? `${v}%` : String(v);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
      <SectionHeader
        icon={TrendingUp}
        title="Performance Trend"
        subtitle={`${targetExamName} — mock-wise progress`}
        color="#6366f1"
        action={
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {TREND_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                  filter === f
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      {/* Metric switcher */}
      <div className="flex gap-2 mb-4">
        {TREND_METRICS.map((m) => {
          const mColor = m === 'Accuracy' ? '#6366f1' : m === 'Avg Score' ? '#10b981' : '#f59e0b';
          return (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                metric === m
                  ? 'text-white shadow-sm border-transparent'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
              style={metric === m ? { background: mColor, borderColor: mColor } : {}}
            >
              {m}
            </button>
          );
        })}
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metricColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={metricColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatY}
              width={metric === 'Rank' ? 52 : 36}
              reversed={metric === 'Rank'}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                padding: '8px 12px',
              }}
              formatter={(v: number) => [formatY(v), metric]}
              labelStyle={{ fontWeight: 700, color: '#1e293b', marginBottom: 2 }}
            />
            <ReferenceLine
              y={chartData[0]?.avg}
              stroke={metricColor}
              strokeDasharray="4 4"
              opacity={0.4}
              label={{ value: 'Avg', position: 'right', fontSize: 9, fill: metricColor }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={metricColor}
              strokeWidth={2.5}
              fill={`url(#${gradId})`}
              dot={{ fill: metricColor, strokeWidth: 0, r: 3.5 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ─── Section 3: Exam Readiness ─────────────────────────────────────────────

const ExamReadiness: React.FC<{ dashStats: DashStats; targetExamName: string }> = ({
  dashStats, targetExamName,
}) => {
  const readiness = dashStats.avgScore > 0
    ? Math.min(99, Math.round((dashStats.avgScore / 100) * 85 + (dashStats.mockTestsTaken / 30) * 10 + 5))
    : 42;

  const expectedScore = dashStats.avgScore > 0
    ? Math.round(dashStats.avgScore * 1.2)
    : 50;
  const expectedRank = dashStats.mockTestsTaken > 0 ? '#1,248' : '#—';
  const selectionChance = Math.min(98, Math.round(readiness * 0.95));

  const readinessColor =
    readiness >= 70 ? '#10b981' : readiness >= 50 ? '#f59e0b' : '#ef4444';

  const tiers = [
    { label: 'Beginner', range: [0, 40], color: '#ef4444' },
    { label: 'Average', range: [40, 65], color: '#f59e0b' },
    { label: 'Good', range: [65, 80], color: '#6366f1' },
    { label: 'Ready!', range: [80, 100], color: '#10b981' },
  ];
  const currentTier = tiers.find((t) => readiness >= t.range[0] && readiness < t.range[1]) || tiers[3];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col">
      <SectionHeader
        icon={Zap}
        title="Exam Readiness"
        subtitle={`Are you ready for ${targetExamName}?`}
        color="#10b981"
      />

      {/* Readiness ring */}
      <div className="flex flex-col items-center mb-5">
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke={readinessColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(readiness / 100) * 314} 314`}
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-800">{readiness}%</span>
            <span className="text-[9px] font-semibold" style={{ color: readinessColor }}>
              {currentTier.label}
            </span>
          </div>
        </div>
      </div>

      {/* Metric rows */}
      <div className="space-y-3 mt-auto">
        {[
          { label: 'Expected Score', value: `${expectedScore}/120`, icon: BarChart3, color: '#6366f1' },
          { label: 'Expected Rank', value: expectedRank, icon: Trophy, color: '#f59e0b' },
          { label: 'Selection Chance', value: `${selectionChance}%`, icon: Target, color: '#10b981' },
        ].map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-100"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5" style={{ color: row.color }} />
                <span className="text-[12px] text-slate-600 font-medium">{row.label}</span>
              </div>
              <span className="text-[13px] font-bold text-slate-800">{row.value}</span>
            </div>
          );
        })}
      </div>

      {/* Selection bar */}
      <div className="mt-4">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span>Selection Probability</span>
          <span style={{ color: readinessColor }}>{selectionChance}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${selectionChance}%`, background: readinessColor }}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Section 4: Subject Performance ──────────────────────────────────────────

const SubjectPerformance: React.FC<{ targetExamName: string }> = ({ targetExamName }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
      <SectionHeader
        icon={BookOpen}
        title="Subject Performance"
        subtitle={`${targetExamName} — tap any subject to see topic breakdown`}
        color="#8b5cf6"
      />

      <div className="space-y-3">
        {SUBJECT_DATA.map((sub) => {
          const isExp = expanded === sub.short;
          const label =
            sub.score >= 85 ? 'Strong' : sub.score >= 70 ? 'Average' : 'Needs Work';
          const labelColor =
            sub.score >= 85 ? '#10b981' : sub.score >= 70 ? '#f59e0b' : '#ef4444';

          return (
            <div key={sub.short} className="border border-slate-100 rounded-xl overflow-hidden">
              {/* Row */}
              <button
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                onClick={() => setExpanded(isExp ? null : sub.short)}
              >
                <div className="w-20 sm:w-24 shrink-0">
                  <span className="text-[12px] font-semibold text-slate-700">{sub.short}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${sub.score}%`, background: sub.color }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[12px] font-bold text-slate-800 w-8 text-right">
                    {sub.score}%
                  </span>
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full hidden sm:inline"
                    style={{ background: `${labelColor}15`, color: labelColor }}
                  >
                    {label}
                  </span>
                  {isExp ? (
                    <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Topic drill-down */}
              {isExp && (
                <div className="bg-slate-50 border-t border-slate-100 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
                    Topic Breakdown
                  </p>
                  {sub.topics.map((t) => {
                    const tc = t.score >= 80 ? '#10b981' : t.score >= 60 ? '#f59e0b' : '#ef4444';
                    return (
                      <div key={t.name} className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-600 w-36 sm:w-44 shrink-0">{t.name}</span>
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${t.score}%`, background: tc }}
                          />
                        </div>
                        <span className="text-[11px] font-bold w-8 text-right" style={{ color: tc }}>
                          {t.score}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        Strong (≥85%)
        <div className="w-2 h-2 rounded-full bg-amber-400 ml-2" />
        Average (70–84%)
        <div className="w-2 h-2 rounded-full bg-red-400 ml-2" />
        Weak (&lt;70%)
      </div>
    </div>
  );
};

// ─── Section 5: Strength & Weakness ──────────────────────────────────────────

const StrengthWeakness: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
    <SectionHeader
      icon={Activity}
      title="Strength & Weakness"
      subtitle="What to focus on next"
      color="#8b5cf6"
    />

    <div className="space-y-4">
      {[
        {
          label: 'Strong',
          icon: CheckCircle,
          color: '#10b981',
          bg: '#10b98110',
          border: '#10b98130',
          items: STRENGTH_WEAKNESS.strong,
        },
        {
          label: 'Improving',
          icon: AlertTriangle,
          color: '#f59e0b',
          bg: '#f59e0b10',
          border: '#f59e0b30',
          items: STRENGTH_WEAKNESS.improving,
        },
        {
          label: 'Weak — Focus Here',
          icon: XCircle,
          color: '#ef4444',
          bg: '#ef444410',
          border: '#ef444430',
          items: STRENGTH_WEAKNESS.weak,
        },
      ].map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.label}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className="h-3.5 w-3.5" style={{ color: group.color }} />
              <span className="text-[11px] font-bold" style={{ color: group.color }}>
                {group.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full border"
                  style={{
                    background: group.bg,
                    borderColor: group.border,
                    color: group.color,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);


// ─── Section 7: Recent Mock Tests ────────────────────────────────────────────

const RecentMockTests: React.FC<{ targetExamName: string }> = ({ targetExamName }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
    <SectionHeader
      icon={Award}
      title="Recent Mock Tests"
      subtitle={`${targetExamName} — review your latest attempts`}
      color="#6366f1"
      action={
        <button className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
          View All <ArrowUpRight className="h-3 w-3" />
        </button>
      }
    />

    <div className="space-y-2.5">
      {RECENT_MOCKS.map((mock) => {
        const pct = Math.round((mock.score / mock.total) * 100);
        const color = pct >= 80 ? '#10b981' : pct >= 65 ? '#f59e0b' : '#ef4444';
        return (
          <div
            key={mock.id}
            className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3 sm:px-4 py-2.5 hover:border-slate-200 hover:shadow-sm transition-all"
          >
            {/* Mock number badge */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0"
              style={{ background: color }}
            >
              {mock.id}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-slate-700">{mock.label}</div>
              <div className="text-[10px] text-slate-400">{mock.date}</div>
            </div>

            {/* Score */}
            <div className="text-center">
              <div className="text-[15px] font-black" style={{ color }}>
                {mock.score}
                <span className="text-[11px] font-semibold text-slate-400">/{mock.total}</span>
              </div>
              <div className="text-[9px] text-slate-400">{pct}%</div>
            </div>

            {/* Rank */}
            <div className="text-center hidden sm:block">
              <div className="text-[12px] font-bold text-slate-700">#{mock.rank.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400">Rank</div>
            </div>

            {/* Trend */}
            <div className="ml-1">
              {mock.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
            </div>

            {/* CTA */}
            <button className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors">
              Review
            </button>
          </div>
        );
      })}
    </div>
  </div>
);

// ─── Main Export ──────────────────────────────────────────────────────────────

const DashboardPerformanceTab: React.FC<Props> = ({ targetExamName, dashStats, userName }) => {
  const hasData = dashStats.mockTestsTaken > 0 || dashStats.avgScore > 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">

      {/* Empty state nudge — shown only when no quiz data yet */}
      {!hasData && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <Zap className="h-4.5 w-4.5 text-indigo-600" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-indigo-800">Complete your first mock to unlock analytics</p>
            <p className="text-[11px] text-indigo-600">
              All stats below are previewed for <strong>{targetExamName}</strong>. Real data appears after your first attempt.
            </p>
          </div>
        </div>
      )}

      {/* ── Section 1: Snapshot ── */}
      <PerformanceSnapshot dashStats={dashStats} targetExamName={targetExamName} />

      {/* ── Row 2: Trend + Readiness ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3">
          <PerformanceTrend
            performanceData={dashStats.performanceData}
            targetExamName={targetExamName}
          />
        </div>
        <div className="xl:col-span-2">
          <ExamReadiness dashStats={dashStats} targetExamName={targetExamName} />
        </div>
      </div>

      {/* ── Section 4: Subject Performance ── */}
      <SubjectPerformance targetExamName={targetExamName} />

      {/* ── Section 5: Strength & Weakness ── */}
      <StrengthWeakness />

      {/* ── Section 7: Recent Mocks ── */}
      <RecentMockTests targetExamName={targetExamName} />


    </div>
  );
};

export default DashboardPerformanceTab;
