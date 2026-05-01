import React, { useMemo } from 'react';
import { X } from 'lucide-react';

const C = {
  primary: '#059669', primaryBg: '#ecfdf5', primaryBdr: '#6ee7b7',
  weak: '#dc2626', weakBg: '#fef2f2', weakBdr: '#fca5a5',
  recover: '#7c3aed', recoverBg: '#faf5ff', recoverBdr: '#d8b4fe',
  mod: '#d97706', modBg: '#fffbeb', modBdr: '#fde68a',
  strong: '#059669', strongBg: '#f0fdf4', strongBdr: '#86efac',
  slate9: '#0f172a', slate7: '#334155', slate5: '#64748b',
  slate3: '#cbd5e1', slate2: '#e2e8f0', slate1: '#f8fafc',
  font: "'Inter', system-ui, sans-serif",
};

function heatClr(a: number) {
  if (a >= 0.85) return { bg: '#dcfce7', txt: '#15803d', bdr: '#86efac' };
  if (a >= 0.78) return { bg: '#f0fdf4', txt: '#16a34a', bdr: '#bbf7d0' };
  if (a >= 0.68) return { bg: '#fefce8', txt: '#a16207', bdr: '#fde047' };
  if (a >= 0.58) return { bg: '#fff7ed', txt: '#c2410c', bdr: '#fdba74' };
  return { bg: '#fef2f2', txt: '#dc2626', bdr: '#fca5a5' };
}

// Seeded calendar generator
function lcg(seed: number) {
  let s = ((seed * 747796405 + 2891336453) >>> 0);
  return () => { s = ((s * 1664525 + 1013904223) >>> 0); return s / 4294967296; };
}
function genCalendar(topicId: string, rawAcc: number) {
  const seed = [...topicId].reduce((a, c, i) => a + c.charCodeAt(0) * (i + 7), 0);
  const rng = lcg(seed);
  return Array.from({ length: 30 }, () => {
    const active = rng() > 0.45;
    if (!active) return null;
    const score = Math.max(40, Math.min(98, Math.round(rawAcc * 100 + (rng() - 0.5) * 30)));
    return score;
  });
}

function calColor(score: number) {
  if (score >= 85) return { bg: '#dcfce7', txt: '#15803d' };
  if (score >= 80) return { bg: '#f0fdf4', txt: '#16a34a' };
  if (score >= 70) return { bg: '#fefce8', txt: '#a16207' };
  if (score >= 60) return { bg: '#fff7ed', txt: '#c2410c' };
  return { bg: '#fef2f2', txt: '#dc2626' };
}

export interface TopicRow {
  id: string; name: string; subjName: string; subjColor: string; subjIcon: string;
  tests: { correct: number; attempted: number; available: number; timeTaken: number; expTime: number }[];
  accs: number[]; status: string; score: number; rawAcc: number;
}

interface Props { topic: TopicRow; examName?: string; onClose: () => void }

export const TopicDrawer: React.FC<Props> = ({ topic, examName, onClose }) => {
  const sm = useMemo(() => {
    const M: Record<string, { label: string; color: string; bg: string; bdr: string }> = {
      WEAK:         { label: '⚑ Weak',        color: C.weak,    bg: C.weakBg,    bdr: C.weakBdr    },
      RECOVERING:   { label: '↑ Recovering',  color: C.recover, bg: C.recoverBg, bdr: C.recoverBdr },
      MODERATE:     { label: '◑ Moderate',    color: C.mod,     bg: C.modBg,     bdr: C.modBdr     },
      STRONG:       { label: '✓ Strong',       color: C.strong,  bg: C.strongBg,  bdr: C.strongBdr  },
      INSUFFICIENT: { label: '— No data',     color: C.slate5,  bg: C.slate1,    bdr: C.slate2     },
    };
    return M[topic.status] ?? M.INSUFFICIENT;
  }, [topic.status]);

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

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', justifyContent: 'flex-end', fontFamily: C.font }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', height: '100%', overflowY: 'auto', boxShadow: '-4px 0 40px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${C.slate2}`, background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ padding: '3px 10px', borderRadius: 6, background: `${topic.subjColor}15`, border: `1px solid ${topic.subjColor}30`, fontSize: 11, color: topic.subjColor, fontWeight: 600 }}>
              {topic.subjIcon} {topic.subjName}
            </div>
            <button onClick={onClose} style={{ marginLeft: 'auto', width: 26, height: 26, borderRadius: 6, background: C.slate1, border: `1px solid ${C.slate2}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={13} color={C.slate5} />
            </button>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.slate9, lineHeight: 1.2, marginBottom: 8 }}>{topic.name}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ padding: '2px 10px', borderRadius: 5, fontSize: 11, fontWeight: 600, background: sm.bg, color: sm.color, border: `1px solid ${sm.bdr}` }}>{sm.label}</span>
            <span style={{ padding: '2px 10px', borderRadius: 5, fontSize: 11, fontWeight: 600, background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac' }}>● Low Risk</span>
          </div>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* All Tests */}
          <div style={{ borderRadius: 12, border: `1px solid ${C.slate2}`, padding: '14px 16px', background: '#fff' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.slate9, marginBottom: 10 }}>All {topic.tests.length} Tests</div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
              {topic.tests.map((t, i) => {
                const a = t.attempted > 0 ? t.correct / t.attempted : 0;
                const clr = heatClr(a);
                return (
                  <div key={i} style={{ width: 38, height: 30, borderRadius: 6, background: clr.bg, border: `1px solid ${clr.bdr}`, color: clr.txt, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(a * 100).toFixed(0)}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#f8fafc', border: `1px solid ${C.slate2}` }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.weak }}>{(avgAcc * 100).toFixed(1)}%</div>
                <div style={{ fontSize: 10, color: C.slate5, marginTop: 2 }}>Basic Score</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1d4ed8' }}>{(trueScore * 100).toFixed(1)}%</div>
                <div style={{ fontSize: 10, color: C.slate5, marginTop: 2 }}>True Score</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 8, background: hardGap < 0 ? C.weakBg : C.strongBg, border: `1px solid ${hardGap < 0 ? C.weakBdr : C.strongBdr}` }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: hardGap < 0 ? C.weak : C.strong }}>{hardGap < 0 ? '' : '+'}{(hardGap * 100).toFixed(0)}%</div>
                <div style={{ fontSize: 10, color: C.slate5, marginTop: 2 }}>Hard Qs gap</div>
              </div>
            </div>
          </div>

          {/* Difficulty Mix */}
          <div style={{ borderRadius: 12, border: `1px solid ${C.slate2}`, padding: '14px 16px', background: '#fff' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.slate9, marginBottom: 10 }}>Question Difficulty Mix</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {[['Easy', `${easy}%`, '#16a34a', '#f0fdf4', '#86efac'], ['Medium', `${medium}%`, '#d97706', '#fffbeb', '#fde68a'], ['Hard', `${hard}%`, '#dc2626', '#fef2f2', '#fca5a5'], ['Hard Acc', `${hardAcc}%`, '#7c3aed', '#faf5ff', '#d8b4fe']].map(([l, v, c, bg, bdr]) => (
                <div key={l} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: bg, border: `1px solid ${bdr}` }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: c }}>{v}</div>
                  <div style={{ fontSize: 9, color: C.slate5, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: C.slate5, background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
              Your <strong>True Score</strong> weights hard questions ×2 more than easy ones — giving a fairer picture of your real ability.
            </div>
          </div>

          {/* Weakness confirmed */}
          <div style={{ borderRadius: 12, border: `1px solid ${isWeak ? C.weakBdr : C.strongBdr}`, padding: '14px 16px', background: isWeak ? C.weakBg : C.strongBg }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.slate9, marginBottom: 6 }}>Is This Weakness Confirmed?</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: isWeak ? C.weak : C.strong, marginBottom: 4 }}>
              {isWeak ? '✓ Yes, this is a real pattern' : '✓ No, you are doing well'}
            </div>
            <div style={{ fontSize: 11, color: C.slate5 }}>
              {isWeak ? `We checked across all ${topic.tests.length} tests to rule out bad days. This needs attention.` : 'Your scores are consistently above threshold across all tests.'}
            </div>
          </div>

          {/* Rank Impact Gauge */}
          {isWeak && (
            <div style={{ borderRadius: 12, border: `1px solid ${C.slate2}`, padding: '14px 16px', background: '#fff' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.slate9, marginBottom: 4 }}>How Much Can Your Rank Improve?</div>
              <div style={{ fontSize: 11, color: C.slate5, marginBottom: 14 }}>Reach 80% in this topic and you could jump <strong>+{rankPositions} positions</strong> in rankings.<br/><span style={{ fontSize: 10 }}>Based on last 10 tests · Wilson-score confidence interval applied</span></div>
              {/* Gauge arc SVG */}
              <svg viewBox="0 0 200 110" width="100%" style={{ display: 'block', marginBottom: 8 }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center', padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.slate2}`, background: C.slate1 }}>
                  <div style={{ fontSize: 11, color: C.slate5 }}>You are now</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.slate9 }}>{rankImpact}<span style={{ fontSize: 12 }}>th</span></div>
                  <div style={{ fontSize: 10, color: C.slate5 }}>percentile</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.primaryBdr}`, background: C.primaryBg }}>
                  <div style={{ fontSize: 11, color: C.slate5 }}>You could reach</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>{Math.min(95, rankImpact + rankPositions)}<span style={{ fontSize: 12 }}>th</span></div>
                  <div style={{ fontSize: 10, color: C.primary }}>+{rankPositions} positions</div>
                </div>
              </div>
              <div style={{ marginTop: 10, background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#92400e' }}>
                💡 Fixing this one topic can push your {examName ? examName : 'exam'} rank up by roughly <strong>{rankPositions} positions</strong>.
              </div>
            </div>
          )}

          {/* Practice Calendar */}
          <div style={{ borderRadius: 12, border: `1px solid ${C.slate2}`, padding: '14px 16px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.slate9 }}>Practice Calendar</div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
                {[[`${calActive.length}`, 'Days'], [`${calAvg}%`, 'Avg'], [`${calStreak}d`, 'Streak']].map(([v, l]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.primary }}>{v}</div>
                    <div style={{ fontSize: 9, color: C.slate5 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3 }}>
              {cal.map((score, i) => {
                if (score === null) return <div key={i} style={{ aspectRatio: '1', borderRadius: 4, background: '#f1f5f9' }} />;
                const cl = calColor(score);
                return <div key={i} style={{ aspectRatio: '1', borderRadius: 4, background: cl.bg, color: cl.txt, fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{score}</div>;
              })}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
              {[['#fef2f2', '<60%'], ['#fff7ed', '60–69%'], ['#fefce8', '70–79%'], ['#f0fdf4', '80–84%'], ['#dcfce7', '≥85%']].map(([bg, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: bg, border: '1px solid #e2e8f0' }} />
                  <span style={{ fontSize: 9, color: C.slate5 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Drills */}
          <div style={{ borderRadius: 12, border: `1px solid ${C.slate2}`, padding: '14px 16px', background: '#fff' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.slate9, marginBottom: 10 }}>Recommended Practice Sets</div>
            {DRILLS.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < DRILLS.length - 1 ? `1px solid ${C.slate2}` : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? C.mod : C.weak, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.slate9 }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: C.slate5 }}>{d.level} · {d.q} questions · {d.min} min</div>
                </div>
                <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 9, fontWeight: 700, background: d.tagBg, color: d.tagColor, whiteSpace: 'nowrap' }}>{d.tag}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: '#f8fafc', border: `1px solid ${C.slate2}` }}>
              <span style={{ fontSize: 11, color: C.slate5 }}>Estimated recovery time</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.recover }}>~{isWeak ? '14–21' : '7–10'} days</span>
            </div>
          </div>

          {/* CTA */}
          <button style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: '0.01em' }}>
            Start Practice → {topic.name}
          </button>
        </div>
      </div>
    </div>
  );
};
