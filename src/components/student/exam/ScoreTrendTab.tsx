import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';
import { TestAnalysisData } from '@/data/testAnalysisData';

interface ScoreTrendTabProps {
  analysisData: TestAnalysisData;
}

type ChartMode = 'score' | 'rank' | 'accuracy';
type TestRange = 5 | 10 | 15;

// Per-test mock data — each entry has its own cutoff so we can show above/below
const MOCK_SCORES  = [60, 79, 50, 75, 55, 80, 59, 75, 52, 56, 60, 50, 58, 65, 90];
// Each test has its own published cutoff — varies based on difficulty & competition level
const MOCK_CUTOFFS = [55, 68, 48, 72, 52, 70, 58, 65, 45, 74, 60, 50, 63, 56, 78];

function generateMockHistory(_analysisData: TestAnalysisData, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const score  = MOCK_SCORES[i % MOCK_SCORES.length];
    const cutoff = MOCK_CUTOFFS[i % MOCK_CUTOFFS.length];
    return {
      testIndex: i + 1,
      testName: `${i + 1}`,
      score,
      cutoff,
      maxScore: 100,
      rank:     Math.max(1, 1500 - score * 14),
      accuracy: Math.min(98, Math.max(50, Math.round(score * 1.1))),
    };
  });
}

const MODE_CONFIG: Record<ChartMode, { label: string; unit: string; icon: React.ElementType }> = {
  score:    { label: 'Score',    unit: 'pts', icon: Target   },
  rank:     { label: 'Rank',     unit: '#',   icon: Award    },
  accuracy: { label: 'Accuracy', unit: '%',   icon: Zap      },
};

// ─── Bar colour ──────────────────────────────────────────────────────────────
// Green  = above target (≥75 score / ≥80 accuracy / rank ≤300)
// Blue   = above cutoff, below target
// Red    = below cutoff
function barColor(h: ReturnType<typeof generateMockHistory>[0], mode: ChartMode): string {
  if (mode === 'score') {
    if (h.score >= 75)       return 'bg-emerald-500 hover:bg-emerald-600';
    if (h.score >= h.cutoff) return 'bg-blue-500 hover:bg-blue-600';
    return 'bg-red-500 hover:bg-red-600';
  }
  if (mode === 'accuracy') {
    if (h.accuracy >= 80) return 'bg-emerald-500 hover:bg-emerald-600';
    if (h.accuracy >= 70) return 'bg-blue-500 hover:bg-blue-600';
    return 'bg-red-500 hover:bg-red-600';
  }
  // rank — lower is better
  if (h.rank <= 300)  return 'bg-emerald-500 hover:bg-emerald-600';
  if (h.rank <= 800)  return 'bg-blue-500 hover:bg-blue-600';
  return 'bg-red-500 hover:bg-red-600';
}

export const ScoreTrendTab: React.FC<ScoreTrendTabProps> = ({ analysisData }) => {
  const [mode, setMode]   = useState<ChartMode>('score');
  const [range, setRange] = useState<TestRange>(15);

  const allHistory = useMemo(() => generateMockHistory(analysisData, 15), [analysisData]);
  const history    = useMemo(() => allHistory.slice(-range), [allHistory, range]);
  const cfg        = MODE_CONFIG[mode];
  const maxV       = mode === 'score' ? 100 : mode === 'accuracy' ? 100 : Math.max(...history.map(h => h.rank)) + 50;

  // Average cutoff for the horizontal line (score mode only)
  const avgCutoff = Math.round(MOCK_CUTOFFS.reduce((a, b) => a + b, 0) / MOCK_CUTOFFS.length);
  const cutoffLinePct = mode === 'score'
    ? (avgCutoff / 100) * 100
    : mode === 'accuracy' ? 70 : null;   // 70% is a typical accuracy cutoff

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 min-h-full">

      {/* ── Controls Bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Score Trajectory</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track your performance progress across test attempts
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Metric Selector */}
          <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            {(Object.keys(MODE_CONFIG) as ChartMode[]).map(m => {
              const c = MODE_CONFIG[m];
              const active = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <c.icon className="w-3.5 h-3.5" />
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Range Selector */}
          <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            {([5, 10, 15] as TestRange[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  range === r
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Last {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BAR CHART CARD ── */}
      <Card className="p-6 border border-slate-200 shadow-sm rounded-2xl bg-white space-y-4">

        {/* Chart Graphic Area */}
        <div className="relative pt-2 pb-2">

          {/* Bar columns + cutoff line container */}
          <div className="relative">
            <div className="flex items-end h-72 w-full gap-2 sm:gap-3 px-12 relative border-l border-b border-slate-300">

              {/* Y-Axis Labels */}
              <div className="absolute -left-2 top-0 bottom-0 flex flex-col justify-between text-xs font-bold text-slate-400 select-none text-right pr-3">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>

              {/* Horizontal Gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="border-b border-slate-100 w-full" />
                ))}
              </div>

              {/* Y-Axis Title */}
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-slate-500 uppercase tracking-wider">
                {cfg.label}
              </div>

              {/* ── Dashed Cut-off Line ── */}
              {cutoffLinePct !== null && (
                <div
                  className="absolute left-0 right-0 pointer-events-none z-20"
                  style={{ bottom: `${cutoffLinePct}%` }}
                >
                  <svg className="w-full" height="2" style={{ overflow: 'visible' }}>
                    <line
                      x1="0" y1="1" x2="100%" y2="1"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeDasharray="8 5"
                    />
                  </svg>
                  {/* Cut-off label */}
                  <span className="absolute left-2 -top-4 text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md whitespace-nowrap shadow-xs">
                    Cut-off: {avgCutoff}
                  </span>
                </div>
              )}

              {/* BAR COLUMNS */}
              {history.map((h, idx) => {
                const val       = h[mode] as number;
                const heightPct = Math.min(100, Math.max(10, Math.round((val / maxV) * 100)));
                const aboveCutoff =
                  mode === 'score'    ? h.score    >= h.cutoff :
                  mode === 'accuracy' ? h.accuracy >= 70       :
                  h.rank <= 800;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end h-full relative group z-10"
                  >
                    {/* Value label above bar */}
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 mb-1.5 transition-transform group-hover:scale-110">
                      {val}
                    </span>

                    {/* Rounded Vertical Bar */}
                    <div
                      className={`w-full max-w-[32px] sm:max-w-[40px] rounded-t-xl transition-all duration-300 shadow-xs ${barColor(h, mode)}`}
                      style={{ height: `${heightPct}%` }}
                      title={`Test ${h.testIndex}: ${val} ${cfg.unit}${mode === 'score' ? ` | Cut-off: ${h.cutoff}` : ''}`}
                    />

                    {/* Below-cutoff red warning dot above bar top */}
                    {mode === 'score' && !aboveCutoff && (
                      <span
                        className="absolute bottom-[calc(100%_+_2px)] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white shadow"
                        title={`Below cut-off (${h.cutoff})`}
                      />
                    )}
                  </div>
                );
              })}

            </div>
          </div>

          {/* X-Axis Labels */}
          <div className="flex items-center justify-between px-12 pt-3 text-xs font-bold text-slate-500">
            {history.map(h => (
              <span key={h.testIndex} className="flex-1 text-center">
                {h.testIndex}
              </span>
            ))}
          </div>

          <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">
            Test Number
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100 text-xs font-bold flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-md bg-emerald-500" />
            <span className="text-slate-700">Target Score (75+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-md bg-blue-500" />
            <span className="text-slate-700">Above Cut-off</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-md bg-red-500" />
            <span className="text-slate-700">Below Cut-off</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" /></svg>
            <span className="text-slate-700">Cut-off Line ({avgCutoff})</span>
          </div>
        </div>
      </Card>

      {/* ── Test-by-Test Data Table ── */}
      <Card className="p-5 border border-slate-200 shadow-sm rounded-2xl bg-white">
        <h3 className="text-sm font-extrabold text-slate-800 mb-3">Test Breakdown History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-blue-600 text-[11px] uppercase">
                <th className="px-4 py-2.5 text-blue-50 font-extrabold">Test #</th>
                <th className="px-4 py-2.5 text-blue-50 font-extrabold">Score</th>
                <th className="px-4 py-2.5 text-blue-50 font-extrabold">Cut-off</th>
                <th className="px-4 py-2.5 text-blue-50 font-extrabold">Rank</th>
                <th className="px-4 py-2.5 text-blue-50 font-extrabold">Accuracy</th>
                <th className="px-4 py-2.5 text-blue-50 font-extrabold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {history.map(h => {
                const aboveCutoff = h.score >= h.cutoff;
                const isTarget    = h.score >= 75;
                return (
                  <tr key={h.testIndex} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-bold text-slate-900">Mock #{h.testIndex}</td>
                    <td className="px-4 py-2.5 font-extrabold text-slate-800">{h.score} / 100</td>
                    <td className="px-4 py-2.5 font-bold text-red-600">{h.cutoff}</td>
                    <td className="px-4 py-2.5 font-bold text-blue-600">#{h.rank}</td>
                    <td className="px-4 py-2.5 font-bold text-emerald-600">{h.accuracy}%</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                        isTarget
                          ? 'bg-emerald-100 text-emerald-800'
                          : aboveCutoff
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {isTarget ? '★ Target' : aboveCutoff ? '✓ Above Cut-off' : '✗ Below Cut-off'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
