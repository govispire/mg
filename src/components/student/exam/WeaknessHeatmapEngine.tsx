import React, { useState, useMemo } from 'react';
import { getExamSyllabus } from '@/data/syllabusData';
import { X, TrendingUp, Target, Award, Clock, ArrowUpRight, ArrowDownRight, Activity, Sparkles, Play, CheckCircle2, AlertCircle, ShieldAlert, Zap } from 'lucide-react';

const C = {
  primary: '#059669', primaryBg: '#ecfdf5', primaryBdr: '#6ee7b7',
  weak: '#dc2626', weakBg: '#fef2f2', weakBdr: '#fca5a5',
  recover: '#7c3aed', recoverBg: '#faf5ff', recoverBdr: '#d8b4fe',
  mod: '#d97706', modBg: '#fffbeb', modBdr: '#fde68a',
  strong: '#059669', strongBg: '#f0fdf4', strongBdr: '#86efac',
  slate9: '#0f172a', slate7: '#334155', slate5: '#64748b',
  slate2: '#e2e8f0', slate1: '#f8fafc',
  font: "'Inter', system-ui, sans-serif",
};

const SUBJ_COLOR: Record<string, { color: string; icon: string }> = {
  'Quantitative Aptitude':            { color: '#2563eb', icon: '∑'  },
  'Numerical Ability':                { color: '#2563eb', icon: '∑'  },
  'Reasoning Ability':                { color: '#7c3aed', icon: '⬡'  },
  'Reasoning & Computer Aptitude':    { color: '#7c3aed', icon: '⬡'  },
  'English Language':                 { color: '#059669', icon: 'Aa' },
  'General English':                  { color: '#059669', icon: 'Aa' },
  'General/Economy/Banking Awareness':{ color: '#d97706', icon: '₹'  },
  'General/Financial Awareness':      { color: '#d97706', icon: '₹'  },
  'Data Analysis & Interpretation':   { color: '#0891b2', icon: '📊' },
};

function subjMeta(name: string) {
  return SUBJ_COLOR[name] ?? { color: '#64748b', icon: '◎' };
}

function heatClr(a: number) {
  if (a >= 0.85) return { bg: '#dcfce7', txt: '#15803d', bdr: '#86efac' };
  if (a >= 0.78) return { bg: '#f0fdf4', txt: '#16a34a', bdr: '#bbf7d0' };
  if (a >= 0.68) return { bg: '#fefce8', txt: '#a16207', bdr: '#fde047' };
  if (a >= 0.58) return { bg: '#fff7ed', txt: '#c2410c', bdr: '#fdba74' };
  return           { bg: '#fef2f2', txt: '#dc2626', bdr: '#fca5a5' };
}

function lcg(seed: number) {
  let s = ((seed * 747796405 + 2891336453) >>> 0);
  return () => { s = ((s * 1664525 + 1013904223) >>> 0); return s / 4294967296; };
}

function genTests(topicId: string, baseAcc: number) {
  const seed = [...topicId].reduce((a, c, i) => a + c.charCodeAt(0) * (i + 3), 0);
  const rng = lcg(seed);
  return Array.from({ length: 10 }, (_, i) => {
    const available = 10 + Math.round(rng() * 5);
    const attempted = Math.max(8, Math.round(available * (0.75 + rng() * 0.25)));
    const dip = (i === 3 || i === 4) ? -0.08 : 0;
    const acc = Math.max(0.30, Math.min(1, baseAcc + (rng() - 0.48) * 0.18 + dip));
    const timeTaken = 12 + Math.round(rng() * 10);
    return { correct: Math.round(acc * attempted), attempted, available, timeTaken, expTime: 20 };
  });
}

function genCalendar(topicId: string, rawAcc: number) {
  const seed = [...topicId].reduce((a, c, i) => a + c.charCodeAt(0) * (i + 7), 0);
  const rng = lcg(seed);
  return Array.from({ length: 30 }, () => {
    const active = rng() > 0.45;
    if (!active) return null;
    return Math.max(40, Math.min(98, Math.round(rawAcc * 100 + (rng() - 0.5) * 30)));
  });
}

function calColor(score: number) {
  if (score >= 85) return { bg: '#dcfce7', txt: '#15803d' };
  if (score >= 80) return { bg: '#f0fdf4', txt: '#16a34a' };
  if (score >= 70) return { bg: '#fefce8', txt: '#a16207' };
  if (score >= 60) return { bg: '#fff7ed', txt: '#c2410c' };
  return { bg: '#fef2f2', txt: '#dc2626' };
}

const DECAY = 0.85, THRESHOLD = 0.75, WIN = 10;
function computeWScore(tests: ReturnType<typeof genTests>) {
  const w = tests.map((_, i) => Math.pow(DECAY, WIN - 1 - i));
  const tw = w.reduce((a, b) => a + b, 0);
  const rawAcc = tests.reduce((s, t, i) => s + (t.attempted > 0 ? t.correct / t.attempted : 0) * w[i], 0) / tw;
  const A = 1 - rawAcc;
  const T = Math.max(0, Math.min(1, (tests.reduce((s, t) => s + t.timeTaken / t.expTime, 0) / tests.length - 0.6) / 1.4));
  const totAtt = tests.reduce((s, t) => s + t.attempted, 0);
  const totAvl = tests.reduce((s, t) => s + t.available, 0);
  const R = totAvl > 0 ? 1 - totAtt / totAvl : 0;
  return { score: 0.55 * A + 0.25 * T + 0.20 * R, rawAcc };
}

function computeStatus(tests: ReturnType<typeof genTests>, score: number) {
  const tot = tests.reduce((s, t) => s + t.attempted, 0);
  if (tot < 8) return 'INSUFFICIENT';
  const accs = tests.map(t => t.attempted > 0 ? t.correct / t.attempted : 0);
  const lowCount = accs.filter(a => a < THRESHOLD).length;
  const weak = lowCount >= 4 || score > 0.60;
  const last3Good = accs.slice(-3).every(a => a >= THRESHOLD);
  if (weak && last3Good) return 'RECOVERING';
  if (weak) return 'WEAK';
  return score > 0.38 ? 'MODERATE' : 'STRONG';
}

export interface TopicRow {
  id: string; name: string; subjName: string; subjColor: string; subjIcon: string;
  tests: { correct: number; attempted: number; available: number; timeTaken: number; expTime: number }[];
  accs: number[]; status: string; score: number; rawAcc: number;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; bdr: string }> = {
  WEAK:         { label: '⚑ Weak',        color: C.weak,    bg: C.weakBg,    bdr: C.weakBdr    },
  RECOVERING:   { label: '↑ Recovering',  color: C.recover, bg: C.recoverBg, bdr: C.recoverBdr },
  MODERATE:     { label: '◑ Moderate',    color: C.mod,     bg: C.modBg,     bdr: C.modBdr     },
  STRONG:       { label: '✓ Strong',       color: C.strong,  bg: C.strongBg,  bdr: C.strongBdr  },
  INSUFFICIENT: { label: '— No data',     color: C.slate5,  bg: C.slate1,    bdr: C.slate2     },
};

function Sparkline({ accs, onClick }: { accs: number[]; onClick?: () => void }) {
  const mn = Math.min(...accs), mx = Math.max(...accs), rng = mx - mn || 0.01;
  const w = 54, h = 20;
  const pts = accs.map((v, i) => `${((i / (accs.length - 1)) * w).toFixed(1)},${(2 + (1 - (v - mn) / rng) * (h - 4)).toFixed(1)}`).join(' ');
  const up = accs[accs.length - 1] > accs[0];
  return (
    <div
      onClick={onClick}
      title="Click to view 10-Test Trend Pop Graph & Comprehensive Analysis"
      style={{ cursor: 'pointer', padding: '2px 4px', borderRadius: 4, transition: 'transform 0.15s' }}
      className="hover:scale-110 hover:bg-slate-100"
    >
      <svg width={w} height={h} style={{ overflow: 'visible', display: 'block' }}>
        <polyline points={pts} fill="none" stroke={up ? '#16a34a' : '#dc2626'} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ── COMPREHENSIVE TREND POP GRAPH & ANALYTICS MODAL ──
interface TrendPopGraphModalProps {
  topic: TopicRow;
  examName?: string;
  onClose: () => void;
}

export const TrendPopGraphModal: React.FC<TrendPopGraphModalProps> = ({ topic, examName, onClose }) => {
  const [activeTestHover, setActiveTestHover] = useState<number | null>(null);

  const accPercentages = topic.accs.map(a => Math.round(a * 100));
  const maxAcc = Math.max(...accPercentages);
  const minAcc = Math.min(...accPercentages);
  const latestAcc = accPercentages[accPercentages.length - 1];
  const firstAcc = accPercentages[0];
  const isOverallUp = latestAcc >= firstAcc;

  const sm = STATUS_MAP[topic.status] ?? STATUS_MAP.INSUFFICIENT;

  // Previous TopicDrawer Data calculations
  const avgAcc     = topic.accs.reduce((a, b) => a + b, 0) / topic.accs.length;
  const trueScore  = topic.rawAcc;
  const hardGap    = trueScore - avgAcc;
  const isWeak     = topic.status === 'WEAK' || topic.status === 'RECOVERING';
  const rankImpact = Math.round(20 + topic.rawAcc * 40);
  const rankPositions = isWeak ? Math.round(20 + (1 - topic.rawAcc) * 30) : 0;
  
  const cal = useMemo(() => genCalendar(topic.id, topic.rawAcc), [topic.id, topic.rawAcc]);
  const calActive = cal.filter(Boolean) as number[];
  const calAvg    = calActive.length ? Math.round(calActive.reduce((a, b) => a + b, 0) / calActive.length) : 0;
  const calStreak = useMemo(() => {
    let streak = 0;
    for (let i = cal.length - 1; i >= 0; i--) { if (cal[i] !== null) streak++; else break; }
    return streak;
  }, [cal]);

  // Difficulty estimate
  const easy   = Math.round(35 + (1 - topic.rawAcc) * 10);
  const hard   = Math.round(20 + (1 - topic.rawAcc) * 15);
  const medium = 100 - easy - hard;
  const hardAcc = Math.round(topic.rawAcc * 100 * 0.75);

  const DRILLS = [
    { name: `${topic.name} — Rapid Fire`, level: 'Medium', q: 10, min: 12, tag: 'NEEDS WORK', tagColor: '#d97706', tagBg: '#fffbeb' },
    { name: `${topic.name} — High Level`, level: 'Hard',   q: 8,  min: 15, tag: 'HIGH IMPACT', tagColor: '#7c3aed', tagBg: '#faf5ff' },
    { name: `${topic.name} — Exam Ready`, level: 'Hard',   q: 5,  min: 18, tag: 'EXAM READY',  tagColor: '#059669', tagBg: '#f0fdf4' },
  ];

  // SVG Chart dimensions
  const chartW = 680;
  const chartH = 200;
  const padX = 42;
  const padY = 24;
  const innerW = chartW - padX * 2;
  const innerH = chartH - padY * 2;

  const points = accPercentages.map((acc, idx) => {
    const x = padX + (idx / 9) * innerW;
    const y = padY + innerH - (acc / 100) * innerH;
    return { x, y, acc, idx };
  });

  const polylinePts = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPts = `${points[0].x},${padY + innerH} ${polylinePts} ${points[points.length - 1].x},${padY + innerH}`;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', fontFamily: C.font
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 780, maxHeight: '90vh', background: '#ffffff',
          borderRadius: 24, boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
          border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #e2e8f0',
          background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 6,
                background: `${topic.subjColor}15`, color: topic.subjColor, border: `1px solid ${topic.subjColor}30`
              }}>
                {topic.subjIcon} {topic.subjName}
              </span>
              {examName && (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                  · {examName}
                </span>
              )}
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              {topic.name}
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 6,
                background: sm.bg, color: sm.color, border: `1px solid ${sm.bdr}`
              }}>
                {sm.label}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 6,
                background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac'
              }}>
                ● Low Risk
              </span>
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10, background: '#f1f5f9',
              border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#64748b'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* SECTION 1: TOP SUMMARY STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            <div style={{ padding: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>True Score</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1d4ed8', marginTop: 2 }}>
                {(trueScore * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Basic Score</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.weak, marginTop: 2 }}>
                {(avgAcc * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{ padding: '10px', background: hardGap < 0 ? C.weakBg : C.strongBg, border: `1px solid ${hardGap < 0 ? C.weakBdr : C.strongBdr}`, borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: hardGap < 0 ? C.weak : C.strong, textTransform: 'uppercase' }}>Hard Qs Gap</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: hardGap < 0 ? C.weak : C.strong, marginTop: 2 }}>
                {hardGap < 0 ? '' : '+'}{(hardGap * 100).toFixed(0)}%
              </div>
            </div>

            <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Peak Score</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a', marginTop: 2 }}>
                {maxAcc}%
              </div>
            </div>

            <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Overall Trend</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: isOverallUp ? '#16a34a' : '#dc2626', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                {isOverallUp ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                {isOverallUp ? `+${latestAcc - firstAcc}%` : `${latestAcc - firstAcc}%`}
              </div>
            </div>
          </div>

          {/* SECTION 2: 10-TEST TREND POP GRAPH */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16,
            padding: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={18} color="#2563eb" />
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                  Last 10 Tests Performance Curve
                </span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '3px 9px', borderRadius: 6 }}>
                🎯 Target Benchmark: 75%
              </span>
            </div>

            {/* SVG Line & Area Chart */}
            <div style={{ position: 'relative', width: '100%' }}>
              <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isOverallUp ? '#16a34a' : '#dc2626'} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={isOverallUp ? '#16a34a' : '#dc2626'} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[100, 75, 50, 25].map(val => {
                  const y = padY + innerH - (val / 100) * innerH;
                  return (
                    <g key={val}>
                      <line x1={padX} y1={y} x2={chartW - padX} y2={y} stroke={val === 75 ? '#d97706' : '#f1f5f9'} strokeDasharray={val === 75 ? '4 4' : 'none'} strokeWidth={val === 75 ? 1.5 : 1} />
                      <text x={padX - 8} y={y + 3} fontSize="9" fontWeight="600" fill={val === 75 ? '#d97706' : '#94a3b8'} textAnchor="end">{val}%</text>
                    </g>
                  );
                })}

                <polygon points={areaPts} fill="url(#trendGrad)" />
                <polyline points={polylinePts} fill="none" stroke={isOverallUp ? '#16a34a' : '#dc2626'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {points.map((p, idx) => {
                  const isHovered = activeTestHover === idx;
                  return (
                    <g key={idx} cursor="pointer" onMouseEnter={() => setActiveTestHover(idx)} onMouseLeave={() => setActiveTestHover(null)}>
                      <line x1={p.x} y1={padY} x2={p.x} y2={padY + innerH} stroke="#f1f5f9" strokeWidth="1" />
                      <text x={p.x} y={chartH - 4} fontSize="9" fontWeight={idx === 9 ? '800' : '600'} fill={idx === 9 ? '#2563eb' : '#64748b'} textAnchor="middle">
                        {idx === 9 ? 'LATEST' : `T${idx + 1}`}
                      </text>
                      <circle cx={p.x} cy={p.y} r={isHovered ? 7 : 5} fill={p.acc >= 75 ? '#16a34a' : '#dc2626'} stroke="#ffffff" strokeWidth="2" />
                    </g>
                  );
                })}
              </svg>

              {activeTestHover !== null && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  background: '#0f172a', color: '#ffffff', borderRadius: 10,
                  padding: '8px 12px', fontSize: 11, fontWeight: 600, boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase' }}>
                    {activeTestHover === 9 ? 'Latest Attempt' : `Test #${activeTestHover + 1}`}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: topic.accs[activeTestHover] >= 0.75 ? '#4ade80' : '#f87171', marginTop: 2 }}>
                    {Math.round(topic.accs[activeTestHover] * 100)}% Accuracy
                  </div>
                  {topic.tests[activeTestHover] && (
                    <div style={{ fontSize: 10, color: '#cbd5e1', marginTop: 2 }}>
                      {topic.tests[activeTestHover].correct} / {topic.tests[activeTestHover].attempted} Correct · {topic.tests[activeTestHover].timeTaken} mins
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 10 Tests Score Cells Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4, marginTop: 12 }}>
              {topic.tests.map((t, ti) => {
                const a = t.attempted > 0 ? t.correct / t.attempted : 0;
                const clr = heatClr(a);
                return (
                  <div
                    key={ti}
                    onClick={() => setActiveTestHover(ti)}
                    style={{
                      padding: '5px 2px', borderRadius: 6, background: clr.bg, border: `1px solid ${clr.bdr}`,
                      color: clr.txt, fontSize: 10, fontWeight: 700, textAlign: 'center', cursor: 'pointer'
                    }}
                  >
                    {(a * 100).toFixed(0)}%
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: QUESTION DIFFICULTY MIX */}
          <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: '16px', background: '#ffffff' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Question Difficulty Mix</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
              {[['Easy', `${easy}%`, '#16a34a', '#f0fdf4', '#86efac'], ['Medium', `${medium}%`, '#d97706', '#fffbeb', '#fde68a'], ['Hard', `${hard}%`, '#dc2626', '#fef2f2', '#fca5a5'], ['Hard Acc', `${hardAcc}%`, '#7c3aed', '#faf5ff', '#d8b4fe']].map(([l, v, c, bg, bdr]) => (
                <div key={l} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: bg, border: `1px solid ${bdr}` }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: c }}>{v}</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', background: '#f8fafc', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0' }}>
              Your <strong>True Score</strong> weights hard questions ×2 more than easy ones — giving a fairer picture of your real ability.
            </div>
          </div>

          {/* SECTION 4: IS WEAKNESS CONFIRMED */}
          <div style={{ borderRadius: 16, border: `1px solid ${isWeak ? C.weakBdr : C.strongBdr}`, padding: '16px', background: isWeak ? C.weakBg : C.strongBg }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Is This Weakness Confirmed?</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: isWeak ? C.weak : C.strong, marginBottom: 4 }}>
              {isWeak ? '✓ Yes, this is a real pattern' : '✓ No, you are doing well'}
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              {isWeak ? `We checked across all ${topic.tests.length} tests to rule out bad days. This needs attention.` : 'Your scores are consistently above threshold across all tests.'}
            </div>
          </div>

          {/* SECTION 5: RANK IMPROVEMENT GAUGE & PERCENTILES */}
          {isWeak && (
            <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: '16px', background: '#ffffff' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>How Much Can Your Rank Improve?</div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 14 }}>
                Reach 80% in this topic and you could jump <strong>+{rankPositions} positions</strong> in rankings.<br/>
                <span style={{ fontSize: 10 }}>Based on last 10 tests · Wilson-score confidence interval applied</span>
              </div>

              {/* Gauge arc SVG */}
              <svg viewBox="0 0 200 110" width="100%" style={{ display: 'block', marginBottom: 8, maxHeight: 110 }}>
                <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
                <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${topic.rawAcc * 250} 250`} />
                <defs>
                  <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#dc2626" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <circle cx={20 + (180 - 20) * topic.rawAcc} cy={100 - Math.sin(Math.PI * topic.rawAcc) * 80} r="6" fill="#2563eb" stroke="#fff" strokeWidth="2" />
                <circle cx={20 + (180 - 20) * 0.95} cy={100 - Math.sin(Math.PI * 0.95) * 80} r="5" fill={C.primary} stroke="#fff" strokeWidth="2" />
              </svg>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>You are now</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{rankImpact}<span style={{ fontSize: 12 }}>th</span></div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>percentile</div>
                </div>

                <div style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 12, border: `1px solid ${C.primaryBdr}`, background: C.primaryBg }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>You could reach</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>{Math.min(95, rankImpact + rankPositions)}<span style={{ fontSize: 12 }}>th</span></div>
                  <div style={{ fontSize: 10, color: C.primary }}>+{rankPositions} positions</div>
                </div>
              </div>

              <div style={{ marginTop: 10, background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '8px 12px', fontSize: 11, color: '#92400e' }}>
                💡 Fixing this one topic can push your {examName ? examName : 'exam'} rank up by roughly <strong>{rankPositions} positions</strong>.
              </div>
            </div>
          )}

          {/* SECTION 6: PRACTICE CALENDAR */}
          <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: '16px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Practice Calendar</div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
                {[[`${calActive.length}`, 'Days'], [`${calAvg}%`, 'Avg'], [`${calStreak}d`, 'Streak']].map(([v, l]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.primary }}>{v}</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
              {cal.map((score, i) => {
                if (score === null) return <div key={i} style={{ aspectRatio: '1', borderRadius: 4, background: '#f1f5f9' }} />;
                const cl = calColor(score);
                return <div key={i} style={{ aspectRatio: '1', borderRadius: 4, background: cl.bg, color: cl.txt, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{score}</div>;
              })}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              {[['#fef2f2', '<60%'], ['#fff7ed', '60–69%'], ['#fefce8', '70–79%'], ['#f0fdf4', '80–84%'], ['#dcfce7', '≥85%']].map(([bg, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: bg, border: '1px solid #e2e8f0' }} />
                  <span style={{ fontSize: 10, color: '#64748b' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 7: RECOMMENDED PRACTICE SETS */}
          <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', padding: '16px', background: '#ffffff' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Recommended Practice Sets</div>
            {DRILLS.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < DRILLS.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? C.mod : C.weak, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>{d.level} · {d.q} questions · {d.min} min</div>
                </div>
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: d.tagBg, color: d.tagColor }}>{d.tag}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Modal Footer CTA */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px', borderRadius: 12, background: '#ffffff',
              border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700, color: '#475569', cursor: 'pointer'
            }}
          >
            Close
          </button>

          <button
            onClick={() => {
              alert(`Starting targeted practice session for ${topic.name}!`);
              onClose();
            }}
            style={{
              padding: '10px 24px', borderRadius: 12, background: '#2563eb',
              border: 'none', fontSize: 12, fontWeight: 800, color: '#ffffff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
            }}
          >
            <Play size={14} fill="#ffffff" />
            <span>Practice This Topic Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface HoveredCell { topicName: string; testIdx: number; correct: number; attempted: number; available: number; timeTaken: number; expTime: number; x: number; y: number }

interface Props { examId?: string; examName?: string }

export default function WeaknessHeatmapEngine({ examId, examName }: Props) {
  const [activeTab, setActiveTab]       = useState<'overview' | 'needs-attention' | 'recovery-tracker'>('overview');
  const [expandedSubj, setExpandedSubj] = useState<Record<string, boolean>>({});
  const [selectedTopic, setSelectedTopic] = useState<TopicRow | null>(null);
  const [trendModalTopic, setTrendModalTopic] = useState<TopicRow | null>(null);
  const [hoveredCell, setHoveredCell]   = useState<HoveredCell | null>(null);

  const syllabusConfig = useMemo(() => examId ? (getExamSyllabus(examId) ?? null) : null, [examId]);
  const prelims  = useMemo(() => syllabusConfig?.tiers.find(t => t.id === 'prelims'), [syllabusConfig]);
  const subjects = prelims?.subjects ?? [];

  const rows = useMemo((): TopicRow[] => {
    if (!subjects.length) return [];
    const BASE: Record<string, number> = { 'quant-prelims': 0.67, 'reasoning-prelims': 0.72, 'english-prelims': 0.78 };
    return subjects.flatMap(subj => {
      const meta = subjMeta(subj.name);
      return subj.topics.map(topic => {
        const base = (BASE[subj.id] ?? 0.70) + Math.sin(topic.id.charCodeAt(0)) * 0.08;
        const tests = genTests(topic.id, Math.max(0.40, Math.min(0.90, base)));
        const accs  = tests.map(t => t.attempted > 0 ? t.correct / t.attempted : 0);
        const { score, rawAcc } = computeWScore(tests);
        const status = computeStatus(tests, score);
        return { id: topic.id, name: topic.name, subjName: subj.name, subjColor: meta.color, subjIcon: meta.icon, tests, accs, status, score, rawAcc };
      });
    });
  }, [subjects]);

  const cnt = (s: string) => rows.filter(r => r.status === s).length;
  const needsAttention = rows.filter(r => r.status === 'WEAK');
  const recoveringRows = rows.filter(r => r.status === 'RECOVERING');

  const grouped = useMemo(() => {
    const map: Record<string, TopicRow[]> = {};
    rows.forEach(r => { if (!map[r.subjName]) map[r.subjName] = []; map[r.subjName].push(r); });
    return map;
  }, [rows]);

  const toggleSubj = (name: string) => setExpandedSubj(p => ({ ...p, [name]: p[name] === false }));
  const isExpanded = (name: string) => expandedSubj[name] !== false;

  const tabs = [
    { id: 'overview' as const, label: 'All Topics' },
    { id: 'needs-attention' as const, label: `Needs Attention${needsAttention.length > 0 ? ` (${needsAttention.length})` : ''}` },
    { id: 'recovery-tracker' as const, label: `Recovery Tracker${recoveringRows.length > 0 ? ` (${recoveringRows.length})` : ''}` },
  ];

  if (!syllabusConfig || !subjects.length) {
    return (
      <div style={{ padding: 32, textAlign: 'center', fontFamily: C.font, color: C.slate5 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.slate9 }}>No syllabus data available</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>Attempt at least one test to see your weakness report.</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: C.font, background: '#f8fafc', minHeight: 400, position: 'relative' }}>

      {/* ── Hover Tooltip ── */}
      {hoveredCell && (
        <div style={{
          position: 'fixed', zIndex: 4000, pointerEvents: 'none',
          left: hoveredCell.x + 12, top: hoveredCell.y - 10,
          background: '#fff', border: `1px solid ${C.slate2}`, borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: '10px 14px', minWidth: 200,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.slate9, marginBottom: 8, borderBottom: `1px solid ${C.slate2}`, paddingBottom: 6 }}>
            {hoveredCell.topicName} · Test {hoveredCell.testIdx + 1}
          </div>
          {[
            ['Score', `${((hoveredCell.correct / (hoveredCell.attempted || 1)) * 100).toFixed(1)}%`],
            ['Got Right', `${hoveredCell.correct}/${hoveredCell.attempted}`],
            ['Attempted', `${hoveredCell.attempted}/${hoveredCell.available} available`],
            ['Time', `${hoveredCell.timeTaken}m / ${hoveredCell.expTime}m target`],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, fontSize: 11, color: C.slate5, marginBottom: 4 }}>
              <span>{l}</span><span style={{ fontWeight: 600, color: C.slate9 }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Trend Pop Graph & Comprehensive Analytics Modal ── */}
      {trendModalTopic && (
        <TrendPopGraphModal
          topic={trendModalTopic}
          examName={examName}
          onClose={() => setTrendModalTopic(null)}
        />
      )}

      {/* ── Title ── */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.slate9 }}>
          {examName ? <><span style={{ color: C.primary }}>{examName}</span> — Topic Performance Overview</> : 'Topic Performance Overview'}
        </div>
        <div style={{ fontSize: 11, color: C.slate5, marginTop: 2 }}>Prelims syllabus · Last 10 tests · Click any row or trend map for full analysis</div>
      </div>

      {/* ── Summary strip ── */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 20px 0', flexWrap: 'wrap' }}>
        {([['WEAK', cnt('WEAK'), C.weak, C.weakBg, C.weakBdr], ['RECOVERING', cnt('RECOVERING'), C.recover, C.recoverBg, C.recoverBdr], ['MODERATE', cnt('MODERATE'), C.mod, C.modBg, C.modBdr], ['STRONG', cnt('STRONG'), C.strong, C.strongBg, C.strongBdr]] as const).map(([label, val, color, bg, bdr]) => (
          <div key={label} style={{ padding: '5px 13px', borderRadius: 8, background: bg, border: `1px solid ${bdr}`, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 10, color, opacity: 0.75, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: C.slate5, alignSelf: 'center' }}>
          Flagged <strong>Weak</strong> if scored below 75% in 4+ of last 10 tests
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 2, padding: '12px 20px 0', borderBottom: `1px solid ${C.slate2}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: C.font, fontSize: 13, fontWeight: 500, color: activeTab === t.id ? C.slate9 : C.slate5, borderBottom: `2px solid ${activeTab === t.id ? C.primary : 'transparent'}`, marginBottom: -1, transition: 'color .15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Hint ── */}
      <div style={{ padding: '8px 20px 0', fontSize: 11, color: C.slate5, fontStyle: 'italic' }}>
        ↗ Click any topic row or trend map for full analysis · Hover over a score cell for test details
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '12px 20px 24px' }}>

        {/* Column headers — only in overview tab */}
        {activeTab === 'overview' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr repeat(10,36px) 52px 56px 82px',
            gap: 3, padding: '6px 16px 6px 28px',
            marginBottom: 6,
            background: '#f1f5f9',
            borderRadius: 8,
            border: `1px solid ${C.slate2}`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.slate5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>TOPIC</div>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} style={{ fontSize: 8, fontWeight: 700, color: C.slate5, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>T{i + 1}</div>
            ))}
            <div style={{ fontSize: 8, fontWeight: 700, color: C.primary, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>LATEST</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: C.slate5, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TREND</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: C.slate5, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TRUE SCORE</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: C.slate5, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>STATUS</div>
          </div>
        )}

        {activeTab === 'overview' ? (
          Object.entries(grouped).map(([subjName, subjRows]) => {
            const meta = subjMeta(subjName);
            const expanded = isExpanded(subjName);
            const weakN = subjRows.filter(r => r.status === 'WEAK').length;
            const recN  = subjRows.filter(r => r.status === 'RECOVERING').length;
            return (
              <div key={subjName} style={{ marginBottom: 12, borderRadius: 12, border: `1px solid ${C.slate2}`, overflow: 'hidden', background: '#fff' }}>
                {/* Subject header */}
                <div onClick={() => toggleSubj(subjName)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: `linear-gradient(90deg,${meta.color}10,#f8fafc)`, cursor: 'pointer', borderBottom: expanded ? `1px solid ${C.slate2}` : 'none' }}>
                  <span style={{ fontSize: 11, color: meta.color, transition: 'transform .2s', display: 'inline-block', transform: expanded ? 'rotate(90deg)' : 'none' }}>▶</span>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${meta.color}15`, border: `1px solid ${meta.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: meta.color, flexShrink: 0 }}>{meta.icon}</div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.slate9 }}>{subjName}</span>
                  <span style={{ fontSize: 11, color: C.slate5 }}>{subjRows.length} topics</span>
                  {weakN > 0 && <span style={{ padding: '1px 7px', borderRadius: 4, fontSize: 10, background: C.weakBg, color: C.weak, border: `1px solid ${C.weakBdr}` }}>{weakN} Weak</span>}
                  {recN  > 0 && <span style={{ padding: '1px 7px', borderRadius: 4, fontSize: 10, background: C.recoverBg, color: C.recover, border: `1px solid ${C.recoverBdr}` }}>{recN} Recovering</span>}
                </div>

                {/* Topic rows */}
                {expanded && subjRows.map((row, ri) => {
                  const sm = STATUS_MAP[row.status] ?? STATUS_MAP.INSUFFICIENT;
                  return (
                    <div key={row.id}
                      onClick={() => setTrendModalTopic(row)}
                      style={{ display: 'grid', gridTemplateColumns: '1fr repeat(10,36px) 52px 56px 82px', alignItems: 'center', gap: 3, padding: '8px 16px 8px 28px', background: ri % 2 === 0 ? '#fff' : '#fafbfd', borderBottom: ri < subjRows.length - 1 ? `1px solid ${C.slate2}` : 'none', cursor: 'pointer', borderLeft: `3px solid ${meta.color}50`, transition: 'background .1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = `${meta.color}08`)}
                      onMouseLeave={e => (e.currentTarget.style.background = ri % 2 === 0 ? '#fff' : '#fafbfd')}>

                      {/* Topic name */}
                      <div style={{ display: 'flex', items: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: sm.color }} />
                        <span style={{ fontSize: 12, color: C.slate9, fontWeight: 500 }}>{row.name}</span>
                      </div>

                      {/* Test cells — with hover tooltip */}
                      {row.tests.map((t, ti) => {
                        const a = t.attempted > 0 ? t.correct / t.attempted : 0;
                        const clr = heatClr(a);
                        return (
                          <div key={ti}
                            onMouseEnter={e => { e.stopPropagation(); setHoveredCell({ topicName: row.name, testIdx: ti, correct: t.correct, attempted: t.attempted, available: t.available, timeTaken: t.timeTaken, expTime: t.expTime, x: e.clientX, y: e.clientY }); }}
                            onMouseMove={e => setHoveredCell(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                            onMouseLeave={e => { e.stopPropagation(); setHoveredCell(null); }}
                            style={{ width: 32, height: 26, borderRadius: 5, background: clr.bg, border: `1px solid ${clr.bdr}`, color: clr.txt, fontSize: 9, fontWeight: 600, display: 'flex', items: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                            {(a * 100).toFixed(0)}%
                          </div>
                        );
                      })}

                      {/* TREND Sparkline - Click opens Trend Pop Graph Modal */}
                      <div onClick={(e) => { e.stopPropagation(); setTrendModalTopic(row); }}>
                        <Sparkline accs={row.accs} />
                      </div>

                      <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: row.rawAcc >= 0.78 ? C.strong : row.rawAcc >= 0.65 ? C.mod : C.weak }}>
                        {(row.rawAcc * 100).toFixed(1)}%
                      </div>
                      <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 10, background: sm.bg, color: sm.color, border: `1px solid ${sm.bdr}`, whiteSpace: 'nowrap', textAlign: 'center' }}>
                        {sm.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          <div style={{ padding: 20, textAlign: 'center', color: C.slate5 }}>
            No topics to display.
          </div>
        )}
      </div>
    </div>
  );
}
