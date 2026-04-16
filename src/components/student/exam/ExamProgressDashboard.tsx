import React from 'react';
import { Users, Award, TrendingUp, Target } from 'lucide-react';
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
  isPurchased?: boolean;
  totalUsersPublic?: number;
  totalTestsAvailable?: number;
  totalCleared?: number;
}

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS  (single source of truth for this component)
───────────────────────────────────────────────────────────────────────────── */
const T = {
  emerald:   '#10b981',
  amber:     '#f59e0b',
  blue:      '#3b82f6',
  purple:    '#8b5cf6',
  trackGrey: '#e8edf2',
  label:     '#94a3b8',   // slate-400
  value:     '#1e293b',   // slate-900
  subValue:  '#64748b',   // slate-500
};

/* ─────────────────────────────────────────────────────────────────────────────
   ProgressRing  — SVG circular ring with centred pct label
───────────────────────────────────────────────────────────────────────────── */
interface RingProps {
  pct:      number;
  size?:    number;
  stroke?:  number;
  color:    string;
  label:    string;
  subLabel?: string;
}
const ProgressRing: React.FC<RingProps> = ({
  pct, size = 76, stroke = 6, color, label, subLabel,
}) => {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(Math.max(pct, 0), 100) / 100 * circ;

  return (
    <div className="flex flex-col items-center gap-1.5" style={{ minWidth: size }}>
      {/* ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ display: 'block' }}>
          {/* track */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={T.trackGrey} strokeWidth={stroke}
          />
          {/* progress arc */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray 0.55s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        {/* centre label */}
        <span
          className="absolute inset-0 flex items-center justify-center font-bold"
          style={{ fontSize: 13, color: T.value }}
        >
          {pct}%
        </span>
      </div>

      {/* text labels */}
      <p className="text-[12px] font-semibold text-center" style={{ color: T.subValue }}>
        {label}
      </p>
      {subLabel && (
        <p className="text-[10px] text-center" style={{ color: T.label }}>
          {subLabel}
        </p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   StatTile — used in the BEFORE-PURCHASE state (3 public metrics)
   Fixed height + equal flex-basis so all three are identical size.
───────────────────────────────────────────────────────────────────────────── */
interface TileProps { label: string; value: string | number }
const StatTile: React.FC<TileProps> = ({ label, value }) => (
  <div
    className="flex flex-col items-center justify-center gap-1 rounded-xl border"
    style={{
      flex: '1 1 0',           // equal width
      padding: '10px 12px',
      borderColor: '#d1fae5',  // emerald-100
      background: '#f0fdf4',   // emerald-50
      minWidth: 96,
    }}
  >
    <span style={{ fontSize: 11, color: T.label, fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>
      {label}
    </span>
    <span style={{ fontSize: 20, fontWeight: 800, color: T.value, lineHeight: 1.15 }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </span>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MiniStatPill — used in the AFTER-PURCHASE state (4 personal metrics)
   Strict fixed height + icon alignment so all four pills are identical.
───────────────────────────────────────────────────────────────────────────── */
interface PillProps { label: string; value: string; icon: React.ReactNode; iconBg: string; iconColor: string; }
const MiniStatPill: React.FC<PillProps> = ({ label, value, icon, iconBg, iconColor }) => (
  <div
    className="flex items-center gap-2.5 rounded-xl border border-slate-200"
    style={{
      flex: '1 1 0',           // equal width
      minWidth: 100,
      padding: '8px 12px',
      background: '#ffffff',
      boxShadow: '0 1px 3px 0 rgba(0,0,0,.06)',
    }}
  >
    {/* icon bubble — fixed 30×30 */}
    <div
      className="flex items-center justify-center rounded-full flex-shrink-0"
      style={{ width: 30, height: 30, background: iconBg, color: iconColor }}
    >
      {icon}
    </div>

    {/* text — baseline-aligned label over value */}
    <div className="flex flex-col justify-center" style={{ minWidth: 0 }}>
      <span
        className="block truncate"
        style={{ fontSize: 10, color: T.label, fontWeight: 500, lineHeight: 1.2 }}
      >
        {label}
      </span>
      <span
        className="block truncate"
        style={{ fontSize: 15, fontWeight: 700, color: T.value, lineHeight: 1.25, marginTop: 1 }}
      >
        {value}
      </span>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────────────────── */
export const ExamProgressDashboard: React.FC<ExamProgressDashboardProps> = ({
  progressData,
  getTypeProgress,
  isPurchased = true,
  totalUsersPublic  = 3435,
  totalTestsAvailable = 120,
  totalCleared      = 567,
}) => {
  /* derived totals */
  const typeKeys = Object.keys(progressData.testTypes) as (keyof ExamProgressData['testTypes'])[];
  const totalCompleted = typeKeys.reduce((s, k) => s + getTypeProgress(k).completed, 0);
  const totalTests     = typeKeys.reduce((s, k) => s + getTypeProgress(k).total,     0);

  const prelimsProg = getTypeProgress('prelims');
  const mainsProg   = getTypeProgress('mains');

  /* interview placeholder — proportional to overall, capped 100 */
  const interviewPct = Math.min(
    Math.round(progressData.overallProgress * 1.25 + 12) % 101,
    100,
  );

  /* ── BEFORE PURCHASE ─────────────────────────────────────────────────── */
  if (!isPurchased) {
    return (
      <div className="mt-3 space-y-3">
        <p style={{ fontSize: 12, color: T.subValue, fontWeight: 500 }}>
          Prelims + Mains + Interview
        </p>

        {/* 3 equal-width public stat tiles */}
        <div className="flex gap-2.5" style={{ alignItems: 'stretch' }}>
          <StatTile label="Total Users"           value={totalUsersPublic}    />
          <StatTile label="Total Tests Available" value={totalTestsAvailable} />
          <StatTile label="Total People Cleared"  value={totalCleared}        />
        </div>
      </div>
    );
  }

  /* ── AFTER PURCHASE ──────────────────────────────────────────────────── */
  return (
    <div className="mt-3 space-y-3">
      <p style={{ fontSize: 12, color: T.subValue, fontWeight: 500 }}>
        Prelims + Mains + Interview
      </p>

      {/* 4 equal-width personal stat pills */}
      <div className="flex flex-wrap gap-2">
        <MiniStatPill
          label="Total Users"
          value={progressData.totalUsers.toLocaleString()}
          icon={<Users   style={{ width: 14, height: 14 }} />}
          iconBg={`${T.emerald}18`} iconColor={T.emerald}
        />
        <MiniStatPill
          label="Your Rank"
          value={progressData.userRank ? `#${progressData.userRank}` : 'N/A'}
          icon={<Award   style={{ width: 14, height: 14 }} />}
          iconBg={`${T.amber}18`}   iconColor={T.amber}
        />
        <MiniStatPill
          label="Overall Progress"
          value={`${progressData.overallProgress}%`}
          icon={<TrendingUp style={{ width: 14, height: 14 }} />}
          iconBg={`${T.blue}18`}    iconColor={T.blue}
        />
        <MiniStatPill
          label="Tests Completed"
          value={`${totalCompleted}/${totalTests || 120}`}
          icon={<Target  style={{ width: 14, height: 14 }} />}
          iconBg={`${T.emerald}18`} iconColor={T.emerald}
        />
      </div>

      {/* Progress rings section */}
      <div
        className="rounded-xl border border-slate-200"
        style={{ background: '#fff', boxShadow: '0 1px 4px 0 rgba(0,0,0,.05)' }}
      >
        {/* header bar */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b border-slate-100"
          style={{ borderRadius: '12px 12px 0 0' }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: T.label, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            Test Progress
          </span>
          <span style={{ fontSize: 10, color: T.label }}>
            {totalCompleted}/{totalTests || 120} done
          </span>
        </div>

        {/* rings row — equal gaps, centred */}
        <div className="flex items-start justify-around px-3 py-4 gap-2 flex-wrap">
          <ProgressRing
            pct={progressData.overallProgress}
            color={T.emerald}
            label="Overall"
            subLabel={`${Math.round(progressData.overallProgress)}%`}
          />
          <ProgressRing
            pct={prelimsProg.percentage}
            color={T.emerald}
            label="Prelims"
            subLabel={`${prelimsProg.completed}/${prelimsProg.total}`}
          />
          <ProgressRing
            pct={mainsProg.percentage}
            color={T.blue}
            label="Mains"
            subLabel={`${mainsProg.completed}/${mainsProg.total}`}
          />
          <ProgressRing
            pct={interviewPct}
            color={T.amber}
            label="Interview"
          />
        </div>
      </div>
    </div>
  );
};
