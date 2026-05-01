import React, { useState, useMemo } from 'react';
import { getExamSyllabus } from '@/data/syllabusData';
import { TopicDrawer, type TopicRow } from './TopicDrawer';

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
    // slight dip in middle tests, recovery toward end
    const dip = (i === 3 || i === 4) ? -0.08 : 0;
    const acc = Math.max(0.30, Math.min(1, baseAcc + (rng() - 0.48) * 0.18 + dip));
    const timeTaken = 12 + Math.round(rng() * 10);
    return { correct: Math.round(acc * attempted), attempted, available, timeTaken, expTime: 20 };
  });
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
  // With 10 tests: weak if 4+ below threshold or high W-score
  const lowCount = accs.filter(a => a < THRESHOLD).length;
  const weak = lowCount >= 4 || score > 0.60;
  // Recovery: last 3 tests all >= threshold
  const last3Good = accs.slice(-3).every(a => a >= THRESHOLD);
  if (weak && last3Good) return 'RECOVERING';
  if (weak) return 'WEAK';
  return score > 0.38 ? 'MODERATE' : 'STRONG';
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; bdr: string }> = {
  WEAK:         { label: '⚑ Weak',        color: C.weak,    bg: C.weakBg,    bdr: C.weakBdr    },
  RECOVERING:   { label: '↑ Recovering',  color: C.recover, bg: C.recoverBg, bdr: C.recoverBdr },
  MODERATE:     { label: '◑ Moderate',    color: C.mod,     bg: C.modBg,     bdr: C.modBdr     },
  STRONG:       { label: '✓ Strong',       color: C.strong,  bg: C.strongBg,  bdr: C.strongBdr  },
  INSUFFICIENT: { label: '— No data',     color: C.slate5,  bg: C.slate1,    bdr: C.slate2     },
};

function Sparkline({ accs }: { accs: number[] }) {
  const mn = Math.min(...accs), mx = Math.max(...accs), rng = mx - mn || 0.01;
  const w = 50, h = 18;
  const pts = accs.map((v, i) => `${((i / (accs.length - 1)) * w).toFixed(1)},${(2 + (1 - (v - mn) / rng) * (h - 4)).toFixed(1)}`).join(' ');
  const up = accs[accs.length - 1] > accs[0];
  return (
    <svg width={w} height={h} style={{ overflow: 'visible', display: 'block' }}>
      <polyline points={pts} fill="none" stroke={up ? '#16a34a' : '#dc2626'} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

interface HoveredCell { topicName: string; testIdx: number; correct: number; attempted: number; available: number; timeTaken: number; expTime: number; x: number; y: number }

interface Props { examId?: string; examName?: string }

export default function WeaknessHeatmapEngine({ examId, examName }: Props) {
  const [activeTab, setActiveTab]       = useState<'overview' | 'needs-attention' | 'recovery-tracker'>('overview');
  const [expandedSubj, setExpandedSubj] = useState<Record<string, boolean>>({});
  const [selectedTopic, setSelectedTopic] = useState<TopicRow | null>(null);
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
  const needsAttention = rows.filter(r => r.status === 'WEAK');   // WEAK only — RECOVERING goes to Recovery Tracker
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

  const displayRows = activeTab === 'needs-attention' ? needsAttention : rows;

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

      {/* ── Topic Drawer ── */}
      {selectedTopic && <TopicDrawer topic={selectedTopic} examName={examName} onClose={() => setSelectedTopic(null)} />}

      {/* ── Title ── */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.slate9 }}>
          {examName ? <><span style={{ color: C.primary }}>{examName}</span> — Topic Performance Overview</> : 'Topic Performance Overview'}
        </div>
        <div style={{ fontSize: 11, color: C.slate5, marginTop: 2 }}>Prelims syllabus · Last 10 tests · Click any row for full analysis</div>
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
        ↗ Click any topic row for full analysis · Hover over a score cell for test details
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
                      onClick={() => setSelectedTopic(row)}
                      style={{ display: 'grid', gridTemplateColumns: '1fr repeat(10,36px) 52px 56px 82px', alignItems: 'center', gap: 3, padding: '8px 16px 8px 28px', background: ri % 2 === 0 ? '#fff' : '#fafbfd', borderBottom: ri < subjRows.length - 1 ? `1px solid ${C.slate2}` : 'none', cursor: 'pointer', borderLeft: `3px solid ${meta.color}50`, transition: 'background .1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = `${meta.color}08`)}
                      onMouseLeave={e => (e.currentTarget.style.background = ri % 2 === 0 ? '#fff' : '#fafbfd')}>

                      {/* Topic name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                            style={{ width: 32, height: 26, borderRadius: 5, background: clr.bg, border: `1px solid ${clr.bdr}`, color: clr.txt, fontSize: 9, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                            {(a * 100).toFixed(0)}%
                          </div>
                        );
                      })}

                      <Sparkline accs={row.accs} />
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
        ) : activeTab === 'needs-attention' ? (
          needsAttention.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: C.slate5 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
              <div style={{ fontWeight: 600, color: C.slate9, fontSize: 14 }}>No weak topics right now 🎉</div>
              <div style={{ marginTop: 6, fontSize: 12 }}>All topics are above threshold. Check the <strong>Recovery Tracker</strong> for topics on their way back.</div>
            </div>
          ) : (
            (() => {
              const attnGrouped: Record<string, TopicRow[]> = {};
              needsAttention.forEach(r => {
                if (!attnGrouped[r.subjName]) attnGrouped[r.subjName] = [];
                attnGrouped[r.subjName].push(r);
              });
              return (
                <>
                  {/* Column header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(10,36px) 52px 56px 82px', gap: 3, padding: '6px 16px 6px 28px', marginBottom: 6, background: '#f1f5f9', borderRadius: 8, border: `1px solid ${C.slate2}` }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.slate5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>TOPIC</div>
                    {Array.from({ length: 9 }, (_, i) => (
                      <div key={i} style={{ fontSize: 8, fontWeight: 700, color: C.slate5, textAlign: 'center', textTransform: 'uppercase' }}>T{i + 1}</div>
                    ))}
                    <div style={{ fontSize: 8, fontWeight: 700, color: C.primary, textAlign: 'center', textTransform: 'uppercase' }}>LATEST</div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: C.slate5, textAlign: 'center', textTransform: 'uppercase' }}>TREND</div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: C.slate5, textAlign: 'center', textTransform: 'uppercase' }}>TRUE SCORE</div>
                    <div style={{ fontSize: 8, fontWeight: 700, color: C.slate5, textAlign: 'center', textTransform: 'uppercase' }}>STATUS</div>
                  </div>

                  {Object.entries(attnGrouped).map(([subjName, subjRows]) => {
                    const meta = subjMeta(subjName);
                    const weakN = subjRows.length; // all are WEAK in this tab
                    return (
                      <div key={subjName} style={{ marginBottom: 12, borderRadius: 12, border: `1px solid ${C.slate2}`, overflow: 'hidden', background: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: `linear-gradient(90deg,${meta.color}10,#f8fafc)`, borderBottom: `1px solid ${C.slate2}` }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: `${meta.color}15`, border: `1px solid ${meta.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: meta.color, flexShrink: 0 }}>{meta.icon}</div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: C.slate9 }}>{subjName}</span>
                          <span style={{ fontSize: 11, color: C.slate5 }}>{subjRows.length} weak topic{subjRows.length > 1 ? 's' : ''}</span>
                          <span style={{ padding: '1px 7px', borderRadius: 4, fontSize: 10, background: C.weakBg, color: C.weak, border: `1px solid ${C.weakBdr}` }}>{weakN} Weak</span>
                        </div>
                        {subjRows.map((row, ri) => {
                          const sm = STATUS_MAP[row.status] ?? STATUS_MAP.INSUFFICIENT;
                          return (
                            <div key={row.id} onClick={() => setSelectedTopic(row)}
                              style={{ display: 'grid', gridTemplateColumns: '1fr repeat(10,36px) 52px 56px 82px', alignItems: 'center', gap: 3, padding: '8px 16px 8px 28px', background: ri % 2 === 0 ? '#fff' : '#fafbfd', borderBottom: ri < subjRows.length - 1 ? `1px solid ${C.slate2}` : 'none', cursor: 'pointer', borderLeft: `3px solid ${sm.color}60`, transition: 'background .1s' }}
                              onMouseEnter={e => (e.currentTarget.style.background = `${meta.color}08`)}
                              onMouseLeave={e => (e.currentTarget.style.background = ri % 2 === 0 ? '#fff' : '#fafbfd')}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: sm.color }} />
                                <span style={{ fontSize: 12, color: C.slate9, fontWeight: 600 }}>{row.name}</span>
                              </div>
                              {row.tests.map((t, ti) => {
                                const a = t.attempted > 0 ? t.correct / t.attempted : 0;
                                const clr = heatClr(a);
                                return (
                                  <div key={ti}
                                    onMouseEnter={e => { e.stopPropagation(); setHoveredCell({ topicName: row.name, testIdx: ti, correct: t.correct, attempted: t.attempted, available: t.available, timeTaken: t.timeTaken, expTime: t.expTime, x: e.clientX, y: e.clientY }); }}
                                    onMouseMove={e => setHoveredCell(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                                    onMouseLeave={e => { e.stopPropagation(); setHoveredCell(null); }}
                                    style={{ width: 32, height: 26, borderRadius: 5, background: clr.bg, border: `1px solid ${clr.bdr}`, color: clr.txt, fontSize: 9, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    {(a * 100).toFixed(0)}%
                                  </div>
                                );
                              })}
                              <Sparkline accs={row.accs} />
                              <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: row.rawAcc >= 0.78 ? C.strong : row.rawAcc >= 0.65 ? C.mod : C.weak }}>
                                {(row.rawAcc * 100).toFixed(1)}%
                              </div>
                              <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 10, background: sm.bg, color: sm.color, border: `1px solid ${sm.bdr}`, whiteSpace: 'nowrap', textAlign: 'center' }}>
                                {sm.label}
                              </span>
                            </div>
                          );
                        })}
                        <div style={{ padding: '8px 16px 10px 28px', fontSize: 11, color: C.slate5, background: '#fafbfd', borderTop: `1px solid ${C.slate2}` }}>
                          💡 <strong>{weakN} weak topic{weakN > 1 ? 's' : ''}</strong> in {subjName} — click any row for a full practice plan.
                        </div>
                      </div>
                    );
                  })}
                </>
              );
            })()
          )
          ) : null}



        {/* ── Recovery Tracker Tab ── */}
        {activeTab === 'recovery-tracker' && (
          recoveringRows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: C.slate5 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔄</div>
              <div style={{ fontWeight: 600, color: C.slate9, fontSize: 14 }}>No topics in recovery right now</div>
              <div style={{ marginTop: 6, fontSize: 12 }}>Topics that were weak but showing improvement will appear here.</div>
            </div>
          ) : (
            <>
              {/* Recovery header info */}
              <div style={{ padding: '6px 4px 12px', fontSize: 11, color: C.slate5 }}>
                Topics that were previously <strong>Weak</strong> and have scored ≥75% in the last 3 consecutive tests — they're on their way back. Keep the momentum!
              </div>

              {recoveringRows.map(row => {
                const meta = subjMeta(row.subjName);
                const accs = row.accs;
                // Count consecutive good tests from end
                let streak = 0;
                for (let i = accs.length - 1; i >= 0; i--) {
                  if (accs[i] >= 0.75) streak++; else break;
                }
                const avgLast3 = accs.slice(-3).reduce((a, b) => a + b, 0) / 3;
                const avgFirst3 = accs.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
                const improvement = avgLast3 - avgFirst3;
                const estDays = Math.max(3, Math.round((1 - avgLast3) * 30));
                const progress = Math.min(100, Math.round((avgLast3 / 0.85) * 100));

                return (
                  <div key={row.id} onClick={() => setSelectedTopic(row)}
                    style={{ marginBottom: 12, borderRadius: 12, border: `1px solid ${C.recoverBdr}`, background: '#fff', overflow: 'hidden', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#faf5ff')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'linear-gradient(90deg,rgba(124,58,237,.06),#f8fafc)', borderBottom: `1px solid ${C.slate2}` }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: `${meta.color}15`, border: `1px solid ${meta.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: meta.color, flexShrink: 0 }}>{meta.icon}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.slate9 }}>{row.name}</div>
                        <div style={{ fontSize: 10, color: C.slate5 }}>{row.subjName}</div>
                      </div>
                      <span style={{ marginLeft: 'auto', padding: '2px 10px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: C.recoverBg, color: C.recover, border: `1px solid ${C.recoverBdr}` }}>↑ Recovering</span>
                    </div>

                    <div style={{ padding: '16px 20px', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

                      {/* Test score sparkline with cells */}
                      <div style={{ flex: 2, minWidth: 200 }}>
                        <div style={{ fontSize: 10, color: C.slate5, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Last 10 Tests (oldest → newest)</div>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          {row.tests.map((t, ti) => {
                            const a = t.attempted > 0 ? t.correct / t.attempted : 0;
                            const clr = heatClr(a);
                            const isRecent = ti >= row.tests.length - 3;
                            return (
                              <div key={ti}
                                onMouseEnter={e => { e.stopPropagation(); setHoveredCell({ topicName: row.name, testIdx: ti, correct: t.correct, attempted: t.attempted, available: t.available, timeTaken: t.timeTaken, expTime: t.expTime, x: e.clientX, y: e.clientY }); }}
                                onMouseMove={e => setHoveredCell(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                                onMouseLeave={e => { e.stopPropagation(); setHoveredCell(null); }}
                                style={{ width: 34, height: 28, borderRadius: 5, background: clr.bg, border: `2px solid ${isRecent ? C.recover : clr.bdr}`, color: clr.txt, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                                {(a * 100).toFixed(0)}%
                                {isRecent && <div style={{ position: 'absolute', top: -4, right: -4, width: 6, height: 6, borderRadius: '50%', background: C.recover }} />}
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, border: `2px solid ${C.recover}`, background: C.recoverBg }} />
                          <span style={{ fontSize: 9, color: C.slate5 }}>Purple border = last 3 tests (recovery window)</span>
                        </div>
                      </div>

                      {/* ── Growth Graph ── */}
                      <div style={{ flex: 3, minWidth: 260, paddingRight: 8 }}>
                        <div style={{ fontSize: 10, color: C.slate5, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Score Growth Chart</div>
                        {(() => {
                          const W = 280, H = 90, PAD = { t: 8, r: 8, b: 24, l: 32 };
                          const iW = W - PAD.l - PAD.r, iH = H - PAD.t - PAD.b;
                          const minV = 0.30, maxV = 1.00;
                          const xOf = (i: number) => PAD.l + (i / (accs.length - 1)) * iW;
                          const yOf = (v: number) => PAD.t + (1 - (v - minV) / (maxV - minV)) * iH;
                          const pts = accs.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ');
                          const areaClose = `${xOf(accs.length - 1).toFixed(1)},${(PAD.t + iH).toFixed(1)} ${PAD.l.toFixed(1)},${(PAD.t + iH).toFixed(1)}`;
                          const thresh75Y = yOf(0.75);
                          const thresh85Y = yOf(0.85);
                          const gradId = `g_${row.id.replace(/[^a-z0-9]/gi, '')}`;
                          return (
                            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
                              <defs>
                                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={C.recover} stopOpacity="0.22" />
                                  <stop offset="100%" stopColor={C.recover} stopOpacity="0.02" />
                                </linearGradient>
                              </defs>

                              {/* Y-axis grid lines */}
                              {[0.40, 0.55, 0.70, 0.85, 1.00].map(v => (
                                <g key={v}>
                                  <line x1={PAD.l} y1={yOf(v)} x2={W - PAD.r} y2={yOf(v)} stroke={C.slate2} strokeWidth="0.5" strokeDasharray="3,3" />
                                  <text x={PAD.l - 3} y={yOf(v) + 3} textAnchor="end" fontSize="7" fill={C.slate5}>{(v * 100).toFixed(0)}%</text>
                                </g>
                              ))}

                              {/* 75% threshold line (danger zone boundary) */}
                              <line x1={PAD.l} y1={thresh75Y} x2={W - PAD.r} y2={thresh75Y} stroke={C.weak} strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
                              <text x={W - PAD.r + 2} y={thresh75Y + 3} fontSize="7" fill={C.weak} opacity="0.8">75%</text>

                              {/* 85% target line */}
                              <line x1={PAD.l} y1={thresh85Y} x2={W - PAD.r} y2={thresh85Y} stroke={C.strong} strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
                              <text x={W - PAD.r + 2} y={thresh85Y + 3} fontSize="7" fill={C.strong} opacity="0.8">85%</text>

                              {/* Shaded area under curve */}
                              <polygon points={`${pts} ${areaClose}`} fill={`url(#${gradId})`} />

                              {/* Main line */}
                              <polyline points={pts} fill="none" stroke={C.recover} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

                              {/* Data points — hover shows test details tooltip */}
                              {accs.map((v, i) => {
                                const isRecent = i >= accs.length - 3;
                                const t = row.tests[i];
                                return (
                                  <circle key={i} cx={xOf(i)} cy={yOf(v)} r={isRecent ? 5 : 3.5}
                                    fill={isRecent ? C.recover : '#fff'}
                                    stroke={C.recover} strokeWidth={isRecent ? 2 : 1.5}
                                    style={{ cursor: 'crosshair' }}
                                    onMouseEnter={e => {
                                      e.stopPropagation();
                                      setHoveredCell({ topicName: row.name, testIdx: i, correct: t.correct, attempted: t.attempted, available: t.available, timeTaken: t.timeTaken, expTime: t.expTime, x: e.clientX, y: e.clientY });
                                    }}
                                    onMouseMove={e => setHoveredCell(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                                    onMouseLeave={e => { e.stopPropagation(); setHoveredCell(null); }}
                                  />
                                );
                              })}

                              {/* X-axis labels */}
                              {accs.map((_, i) => (
                                <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fontSize="7" fill={i >= accs.length - 3 ? C.recover : C.slate5} fontWeight={i >= accs.length - 3 ? '700' : '400'}>
                                  T{i + 1}
                                </text>
                              ))}
                            </svg>
                          );
                        })()}
                        <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 9, color: C.slate5 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 16, height: 2, background: C.weak, opacity: 0.6, display: 'inline-block', borderRadius: 1 }} /> 75% threshold</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 16, height: 2, background: C.strong, opacity: 0.6, display: 'inline-block', borderRadius: 1 }} /> 85% target</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: C.recover, display: 'inline-block' }} /> Last 3 tests</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 20, borderLeft: `1px solid ${C.slate2}` }}>
                        {/* Progress bar to 85% target */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.slate5, marginBottom: 3 }}>
                            <span>Progress to 85% target</span>
                            <span style={{ fontWeight: 700, color: C.recover }}>{progress}%</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: C.slate2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progress}%`, borderRadius: 3, background: `linear-gradient(90deg,${C.recover},#a855f7)`, transition: 'width 1s ease' }} />
                          </div>
                        </div>

                        {/* Key stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          <div style={{ padding: '6px 8px', borderRadius: 7, background: C.recoverBg, border: `1px solid ${C.recoverBdr}`, textAlign: 'center' }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: C.recover }}>{streak}</div>
                            <div style={{ fontSize: 9, color: C.slate5 }}>Good streak</div>
                          </div>
                          <div style={{ padding: '6px 8px', borderRadius: 7, background: improvement > 0 ? C.strongBg : C.weakBg, border: `1px solid ${improvement > 0 ? C.strongBdr : C.weakBdr}`, textAlign: 'center' }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: improvement > 0 ? C.strong : C.weak }}>{improvement > 0 ? '+' : ''}{(improvement * 100).toFixed(0)}%</div>
                            <div style={{ fontSize: 9, color: C.slate5 }}>Improvement</div>
                          </div>
                          <div style={{ padding: '6px 8px', borderRadius: 7, background: C.modBg, border: `1px solid ${C.modBdr}`, textAlign: 'center' }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: C.mod }}>{(avgLast3 * 100).toFixed(0)}%</div>
                            <div style={{ fontSize: 9, color: C.slate5 }}>Recent avg</div>
                          </div>
                          <div style={{ padding: '6px 8px', borderRadius: 7, background: C.slate1, border: `1px solid ${C.slate2}`, textAlign: 'center' }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: C.slate7 }}>~{estDays}d</div>
                            <div style={{ fontSize: 9, color: C.slate5 }}>Est. full recovery</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer tip */}
                    <div style={{ padding: '7px 16px', background: C.recoverBg, borderTop: `1px solid ${C.recoverBdr}`, fontSize: 11, color: C.recover }}>
                      ✨ <strong>Keep going!</strong> {streak} consecutive tests above 75% — maintain this pace and you'll be marked <strong>Strong</strong> soon.
                    </div>
                  </div>
                );
              })}
            </>
          )
        )}

      </div>

    </div>
  );
}
