import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import {
  Clock, CheckCircle2, XCircle, MinusCircle,
  Target, Award, Zap, TrendingUp
} from "lucide-react";
import { TestAnalysisData } from "@/data/testAnalysisData";

interface OverallAnalysisTabProps {
  analysisData: TestAnalysisData;
  defaultSection?: boolean;
}

// ─── Inline Score Trend Mini Chart ───────────────────────────────────────────
type ChartMode = "score" | "rank" | "accuracy";
type TestRange = 5 | 10 | 15;

// Per-test cutoff values (60 is the standard cut-off for most govt exams)
const MOCK_SCORES  = [60, 79, 50, 75, 55, 80, 59, 75, 52, 56, 60, 50, 58, 65, 90];
// Each test has its own published cutoff — varies based on difficulty & competition
const MOCK_CUTOFFS = [55, 68, 48, 72, 52, 70, 58, 65, 45, 74, 60, 50, 63, 56, 78];

function generateHistory(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const score  = MOCK_SCORES[i % MOCK_SCORES.length];
    const cutoff = MOCK_CUTOFFS[i % MOCK_CUTOFFS.length];
    return {
      idx: i + 1,
      score,
      cutoff,
      rank: Math.max(1, 1500 - score * 14),
      accuracy: Math.min(98, Math.round(score * 1.1)),
    };
  });
}

const InlineScoreTrend: React.FC<{ analysisData: TestAnalysisData }> = () => {
  const [mode, setMode] = useState<ChartMode>("score");
  const [range, setRange] = useState<TestRange>(15);

  const allHistory = useMemo(() => generateHistory(15), []);
  const history    = useMemo(() => allHistory.slice(-range), [allHistory, range]);
  const maxV       = mode === "rank" ? Math.max(...history.map(h => h[mode] as number)) + 50 : 100;

  // Cutoff line position (only meaningful in score/accuracy mode)
  const avgCutoff  = Math.round(MOCK_CUTOFFS.reduce((a, b) => a + b, 0) / MOCK_CUTOFFS.length);
  const cutoffPct  = mode === "score" ? ((avgCutoff / maxV) * 100) : mode === "accuracy" ? 70 : null;

  const MODES: { key: ChartMode; label: string }[] = [
    { key: "score",    label: "Score"    },
    { key: "rank",     label: "Rank"     },
    { key: "accuracy", label: "Accuracy" },
  ];
  const RANGES: TestRange[] = [5, 10, 15];

  // Bar colour logic:
  //   Green  = above target (score ≥75 / accuracy ≥80)
  //   Blue   = above cutoff but below target
  //   Red    = below cutoff
  const barColor = (h: ReturnType<typeof generateHistory>[0]): string => {
    if (mode === "score") {
      if (h.score >= 75)        return "bg-emerald-500 hover:bg-emerald-600";
      if (h.score >= h.cutoff)  return "bg-blue-500   hover:bg-blue-600";
      return "bg-red-500 hover:bg-red-600";
    }
    if (mode === "accuracy") {
      const val = h.accuracy;
      if (val >= 80) return "bg-emerald-500 hover:bg-emerald-600";
      if (val >= 70) return "bg-blue-500 hover:bg-blue-600";
      return "bg-red-500 hover:bg-red-600";
    }
    // rank mode — lower = better (green ≤300)
    const r = h.rank as number;
    if (r <= 300)  return "bg-emerald-500 hover:bg-emerald-600";
    if (r <= 800)  return "bg-blue-500 hover:bg-blue-600";
    return "bg-red-500 hover:bg-red-600";
  };

  return (
    <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Score Trajectory</h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Performance progress across test attempts</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
            {MODES.map(m => (
              <button key={m.key} onClick={() => setMode(m.key)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                  mode === m.key ? "bg-slate-800 text-white shadow-xs" : "text-slate-500 hover:text-slate-700"
                }`}>{m.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
            {RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                  range === r ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-700"
                }`}>Last {r}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 pt-5 pb-3">
        {/* Chart container — positioned so the dashed cutoff line can span the full width */}
        <div className="relative">
          <div className="flex items-end gap-1.5 sm:gap-2 h-52 w-full relative border-l border-b border-slate-200 pl-8">

            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] font-bold text-slate-400 select-none text-right pr-1.5">
              <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
            </div>

            {/* Gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pl-8">
              {[0,1,2,3,4].map(i => <div key={i} className="border-b border-slate-100 w-full" />)}
            </div>

            {/* ── Dashed cut-off line ── */}
            {cutoffPct !== null && (
              <div
                className="absolute left-8 right-0 pointer-events-none z-20"
                style={{ bottom: `${cutoffPct}%` }}
              >
                {/* Dashed SVG line */}
                <svg className="w-full" height="2" style={{ overflow: 'visible' }}>
                  <line
                    x1="0" y1="1" x2="100%" y2="1"
                    stroke="#ef4444"
                    strokeWidth="1.8"
                    strokeDasharray="6 4"
                  />
                </svg>
                {/* Label */}
                <span
                  className="absolute right-0 -top-4 text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md whitespace-nowrap"
                >
                  Cut-off {avgCutoff}
                </span>
              </div>
            )}

            {/* Bar columns */}
            {history.map((h, i) => {
              const val       = h[mode] as number;
              const heightPct = Math.min(100, Math.max(6, Math.round((val / maxV) * 100)));
              const aboveCutoff = mode === "score" ? h.score >= h.cutoff : mode === "accuracy" ? h.accuracy >= 70 : h.rank <= 800;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative group z-10">
                  <span className="text-[9px] font-extrabold text-slate-600 mb-0.5 leading-none">{val}</span>

                  <div
                    className={`w-full max-w-[28px] sm:max-w-[36px] rounded-t-lg transition-all duration-300 ${barColor(h)}`}
                    style={{ height: `${heightPct}%` }}
                    title={`Test ${h.idx}: ${val}${mode === 'score' ? ` | Cut-off: ${h.cutoff}` : ''}`}
                  />

                  {/* Below-cutoff warning dot */}
                  {mode === "score" && !aboveCutoff && (
                    <span
                      className="absolute bottom-[calc(100%_+_2px)] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-500 shadow ring-1 ring-white"
                      title="Below cut-off"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex items-center pl-8 pt-1.5 gap-1.5 sm:gap-2">
          {history.map(h => (
            <span key={h.idx} className="flex-1 text-center text-[10px] font-bold text-slate-400">{h.idx}</span>
          ))}
        </div>
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Test Number</p>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 py-3 border-t border-slate-100 text-[11px] font-bold flex-wrap px-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-slate-600">Target Score (75+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-slate-600">Above Cut-off</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-slate-600">Below Cut-off</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="5 3" /></svg>
          <span className="text-slate-600">Cut-off Line</span>
        </div>
      </div>
    </Card>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const OverallAnalysisTab: React.FC<OverallAnalysisTabProps> = ({ analysisData }) => {

  const totalAttempted  = analysisData.sectionWiseData.reduce((s, x) => s + x.attempted, 0);
  const totalCorrect    = analysisData.sectionWiseData.reduce((s, x) => s + x.correct, 0);
  const totalWrong      = analysisData.sectionWiseData.reduce((s, x) => s + x.wrong, 0);
  const totalSkipped    = analysisData.sectionWiseData.reduce((s, x) => s + x.skipped, 0);
  const totalScore      = analysisData.sectionWiseData.reduce((s, x) => s + x.score, 0);
  const sumMaxScore     = analysisData.sectionWiseData.reduce((s, x) => s + x.maxScore, 0);
  const totalTime       = analysisData.sectionWiseData.reduce((s, x) => s + x.timeSpent, 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const donutTotal  = Math.max(totalCorrect + totalWrong + totalSkipped, 1);
  const R = 52, C = 2 * Math.PI * R;
  const cDash = (totalCorrect / donutTotal) * C;
  const wDash = (totalWrong   / donutTotal) * C;
  const sDash = (totalSkipped / donutTotal) * C;

  const sectionIdealTime = analysisData.sectionWiseData.map(s =>
    Math.round((s.maxScore / sumMaxScore) * totalTime * 0.92)
  );

  return (
    <div className="space-y-5 bg-slate-50 min-h-full">

      {/* ── 1. Section-wise Performance Table ── */}
      <Card className="p-0 overflow-hidden border border-blue-100 shadow-sm rounded-2xl bg-white">
        <div className="overflow-x-auto">
          <Table>
            {/* Blue header row */}
            <TableHeader>
              <TableRow className="bg-blue-600 hover:bg-blue-600 border-none">
                {["Section", "Attempted", "Correct / Wrong", "Skipped", "Score", "Rank", "Percentile", "Accuracy", "Time", "Topper Score"].map(h => (
                  <TableHead
                    key={h}
                    className="text-[11px] font-extrabold uppercase text-blue-50 px-4 py-3 whitespace-nowrap tracking-wider"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="text-xs divide-y divide-blue-50">
              {analysisData.sectionWiseData.map((s, i) => {
                const topperScore = analysisData.comparisonData?.topperScore
                  ? Math.round((s.maxScore / sumMaxScore) * analysisData.comparisonData.topperScore * 10) / 10
                  : Math.round(s.maxScore * 0.9);
                const accColor = s.accuracy >= 80
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : s.accuracy >= 60
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-red-100 text-red-800 border-red-200";

                return (
                  <TableRow
                    key={s.sectionName}
                    className={`hover:bg-blue-50/40 transition-colors border-b border-blue-50 ${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    }`}
                  >
                    {/* Section Name */}
                    <TableCell className="font-extrabold text-slate-800 px-4 py-3.5 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        <span>{s.sectionName}</span>
                      </div>
                    </TableCell>

                    {/* Attempted */}
                    <TableCell className="text-slate-700 px-4 py-3.5 font-bold">{s.attempted}</TableCell>

                    {/* Correct / Wrong */}
                    <TableCell className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                        {s.correct} ✓
                      </span>
                      <span className="text-slate-300 mx-1.5">/</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-extrabold text-[11px]">
                        {s.wrong} ✗
                      </span>
                    </TableCell>

                    {/* Skipped */}
                    <TableCell className="text-slate-500 px-4 py-3.5 font-semibold">{s.skipped}</TableCell>

                    {/* Score */}
                    <TableCell className="font-extrabold text-slate-900 px-4 py-3.5 whitespace-nowrap">
                      <span>{s.score}</span>
                      <span className="text-[11px] text-slate-400 font-normal"> / {s.maxScore}</span>
                    </TableCell>

                    {/* Rank */}
                    <TableCell className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-black text-[11px]">
                        #{s.rank}
                      </span>
                    </TableCell>

                    {/* Percentile */}
                    <TableCell className="font-extrabold text-blue-700 px-4 py-3.5 text-xs">{s.percentile}%</TableCell>

                    {/* Accuracy */}
                    <TableCell className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md border font-extrabold text-[11px] ${accColor}`}>
                        {s.accuracy}%
                      </span>
                    </TableCell>

                    {/* Time */}
                    <TableCell className="px-4 py-3.5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-bold text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{s.timeSpent}m</span>
                      </div>
                    </TableCell>

                    {/* Topper Score */}
                    <TableCell className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-lg border border-blue-200 font-extrabold text-[11px]">
                        {topperScore} / {s.maxScore}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Overall Summary Row — grey */}
              <TableRow className="bg-slate-200 border-t-2 border-slate-300">
                <TableCell className="text-slate-800 px-4 py-3.5 text-xs font-black uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    <span>Overall</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-700 px-4 py-3.5 font-bold">{totalAttempted}</TableCell>
                <TableCell className="px-4 py-3.5 whitespace-nowrap">
                  <span className="text-emerald-700 font-black">{totalCorrect}</span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span className="text-red-600 font-black">{totalWrong}</span>
                </TableCell>
                <TableCell className="text-slate-600 px-4 py-3.5 font-bold">{totalSkipped}</TableCell>
                <TableCell className="text-slate-900 px-4 py-3.5 font-black">{totalScore} / {sumMaxScore}</TableCell>
                <TableCell className="text-blue-700 px-4 py-3.5 font-black text-xs">#{analysisData.rank}</TableCell>
                <TableCell className="text-blue-700 px-4 py-3.5 font-black text-xs">{analysisData.percentile}%</TableCell>
                <TableCell className="text-emerald-700 px-4 py-3.5 font-black text-xs">{overallAccuracy}%</TableCell>
                <TableCell className="text-slate-700 px-4 py-3.5 font-bold">{totalTime}m</TableCell>
                <TableCell className="text-blue-700 px-4 py-3.5 font-black text-xs">
                  {analysisData.comparisonData?.topperScore ?? Math.round(sumMaxScore * 0.9)} / {sumMaxScore}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── 2. Score Trend (Embedded immediately below section table) ── */}
      <InlineScoreTrend analysisData={analysisData} />

      {/* ── 3. Question Summary + Time Analysis (side-by-side) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Question Summary */}
        <Card className="lg:col-span-2 border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
            <h3 className="text-sm font-extrabold text-slate-700">Question Summary</h3>
          </div>

          {/* Donut + Legend */}
          <div className="p-5">
            {/* Donut */}
            <div className="flex items-center justify-center mb-5">
              <div className="relative">
                <svg viewBox="0 0 130 130" className="w-32 h-32 -rotate-90">
                  <circle cx="65" cy="65" r={R} fill="none" stroke="#f1f5f9" strokeWidth="18" />
                  <circle cx="65" cy="65" r={R} fill="none" stroke="#10b981" strokeWidth="18"
                    strokeDasharray={`${cDash} ${C - cDash}`}
                  />
                  <circle cx="65" cy="65" r={R} fill="none" stroke="#ef4444" strokeWidth="18"
                    strokeDasharray={`${wDash} ${C - wDash}`}
                    strokeDashoffset={-cDash}
                  />
                  <circle cx="65" cy="65" r={R} fill="none" stroke="#94a3b8" strokeWidth="18"
                    strokeDasharray={`${sDash} ${C - sDash}`}
                    strokeDashoffset={-(cDash + wDash)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900">{donutTotal}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Qs</span>
                </div>
              </div>
            </div>

            {/* Stats rows */}
            <div className="space-y-2.5">
              {[
                { label: "Correct",    val: totalCorrect, pct: Math.round((totalCorrect / donutTotal) * 100), color: "#10b981", bg: "bg-emerald-500",  Icon: CheckCircle2, textColor: "text-emerald-700" },
                { label: "Incorrect",  val: totalWrong,   pct: Math.round((totalWrong   / donutTotal) * 100), color: "#ef4444", bg: "bg-red-500",      Icon: XCircle,      textColor: "text-red-700"     },
                { label: "Unattempted",val: totalSkipped, pct: Math.round((totalSkipped / donutTotal) * 100), color: "#94a3b8", bg: "bg-slate-400",    Icon: MinusCircle,  textColor: "text-slate-600"   },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <item.Icon className="w-4 h-4 flex-shrink-0" style={{ color: item.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-600">{item.label}</span>
                      <span className={`text-xs font-extrabold ${item.textColor}`}>{item.val} <span className="text-slate-400 font-normal">({item.pct}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${item.bg}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Score pill */}
            <div className="mt-4 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <span className="text-xs font-bold text-slate-500">Net Score</span>
              <span className="text-sm font-extrabold text-slate-900">{totalScore} <span className="text-slate-400 font-normal text-xs">/ {sumMaxScore}</span></span>
              <span className="text-[10px] font-bold text-slate-500">Accuracy</span>
              <span className={`text-sm font-extrabold ${overallAccuracy >= 70 ? "text-emerald-600" : "text-red-500"}`}>{overallAccuracy}%</span>
            </div>
          </div>
        </Card>

        {/* Time Analysis (Section-wise) */}
        <Card className="lg:col-span-3 border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
            <h3 className="text-sm font-extrabold text-slate-700">Time Analysis <span className="text-slate-400 font-normal">(Section-wise)</span></h3>
          </div>

          <div className="p-5 space-y-3">
            {analysisData.sectionWiseData.map((s, i) => {
              const ideal = sectionIdealTime[i];
              const diff = s.timeSpent - ideal;
              const pct = ideal > 0 ? Math.min(100, Math.round((s.timeSpent / ideal) * 100)) : 0;
              const isOver = diff > 0;
              return (
                <div key={s.sectionName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 truncate max-w-[140px]">{s.sectionName}</span>
                    <div className="flex items-center gap-3 text-[11px] font-semibold">
                      <span className="text-slate-500">Spent: <strong className="text-slate-800">{s.timeSpent}m</strong></span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-500">Ideal: <strong className="text-blue-700">{ideal}m</strong></span>
                      <span className={`font-extrabold ${isOver ? "text-red-600" : "text-emerald-600"}`}>
                        {diff > 0 ? `+${diff}m` : diff === 0 ? "✓" : `${diff}m`}
                      </span>
                    </div>
                  </div>
                  {/* Dual progress bar: actual vs ideal */}
                  <div className="relative w-full bg-slate-100 rounded-full h-2 overflow-visible">
                    <div
                      className={`h-full rounded-full transition-all ${isOver ? "bg-red-400" : "bg-emerald-500"}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                    {/* Ideal marker */}
                    {ideal > 0 && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-blue-600 rounded-full z-10"
                        style={{ left: `${Math.min(99, Math.round((ideal / Math.max(s.timeSpent, ideal)) * 100))}%` }}
                        title={`Ideal: ${ideal}m`}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>0m</span>
                    <span
                      className={`font-bold ${s.accuracy >= 80 ? "text-emerald-600" : s.accuracy >= 60 ? "text-blue-600" : "text-red-500"}`}
                    >
                      Acc: {s.accuracy}%
                    </span>
                    <span>{Math.max(s.timeSpent, ideal)}m</span>
                  </div>
                </div>
              );
            })}

            {/* Overall total row */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700">Overall</span>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="text-slate-500">Spent: <strong className="text-slate-800">{totalTime}m</strong></span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500">Ideal: <strong className="text-blue-700">{Math.round(totalTime * 0.92)}m</strong></span>
                <span className="text-red-600 font-extrabold">+{totalTime - Math.round(totalTime * 0.92)}m</span>
              </div>
            </div>

            {/* Tip */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2.5 mt-1">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                You spent <strong>{totalTime - Math.round(totalTime * 0.92)} min</strong> more than ideal. Focus on time management in sections where accuracy is already high.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── 4. Section-wise Cutoff Readiness + Actionable Next Steps ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Section-wise Cutoff Readiness */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
            <h3 className="text-sm font-extrabold text-slate-700">Section-wise Cutoff Readiness</h3>
          </div>
          <div className="p-5 space-y-3">
            {analysisData.sectionWiseData.map(sec => {
              const cutoff   = sec.cutOff ?? Math.round(sec.maxScore * 0.6);
              const isPassed = sec.score >= cutoff;
              const pct      = Math.min(100, Math.round((sec.score / sec.maxScore) * 100));
              const cutoffPct = Math.round((cutoff / sec.maxScore) * 100);

              return (
                <div key={sec.sectionName} className={`p-3.5 rounded-xl border space-y-2 ${
                  isPassed ? "bg-emerald-50/60 border-emerald-200" : "bg-red-50/50 border-red-200"
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800">{sec.sectionName}</span>
                      {isPassed ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-md">✓ Qualified</span>
                      ) : (
                        <span className="text-[10px] bg-red-100 text-red-800 border border-red-300 font-extrabold px-2 py-0.5 rounded-md animate-pulse">⚠ Cutoff Missed</span>
                      )}
                    </div>
                    <span className={`font-black ${isPassed ? "text-emerald-700" : "text-red-700"}`}>
                      {sec.score} / {sec.maxScore}
                    </span>
                  </div>

                  <div className="relative w-full bg-slate-200 h-2 rounded-full overflow-visible">
                    <div
                      className={`h-full rounded-full ${isPassed ? "bg-emerald-500" : "bg-red-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-slate-700 z-10"
                      style={{ left: `${cutoffPct}%` }}
                      title={`Cutoff: ${cutoff} marks`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold pt-0.5">
                    <span className="text-slate-500">Cutoff: <strong>{cutoff} marks</strong></span>
                    <span className={isPassed ? "text-emerald-700 font-bold" : "text-red-700 font-extrabold"}>
                      {isPassed
                        ? `+${(sec.score - cutoff).toFixed(1)} above`
                        : `Need ${(cutoff - sec.score).toFixed(1)} more`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Actionable Next Steps */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
            <h3 className="text-sm font-extrabold text-slate-700">Actionable Next Steps</h3>
          </div>
          <div className="p-5 space-y-3">
            <p className="text-[11px] text-slate-500 font-medium">
              Based on your diagnostic, target these practice drills to boost accuracy:
            </p>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold text-blue-900">Review Negative Marks</p>
                <p className="text-[11px] text-blue-700 mt-0.5">Lost {(totalWrong * 0.25).toFixed(2)} marks from wrong attempts</p>
              </div>
              <button
                onClick={() => window.location.href = `/student/vocabulary`}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs whitespace-nowrap transition-colors"
              >
                Review
              </button>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold text-emerald-900">Speed Drill Practice</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">Practice 10 high-yield questions for weak sections</p>
              </div>
              <button
                onClick={() => window.location.href = `/student/grammar-hub`}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs whitespace-nowrap transition-colors"
              >
                Launch
              </button>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold text-blue-900">Re-attempt Skipped Questions</p>
                <p className="text-[11px] text-blue-700 mt-0.5">Solve {totalSkipped} unattempted questions with zero pressure</p>
              </div>
              <button
                onClick={() => window.location.href = `/student/tests`}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs whitespace-nowrap transition-colors"
              >
                Practice
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* ── 5. Key Takeaway Banner ── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div className="text-white">
          <p className="text-sm font-extrabold">Performance Summary</p>
          <p className="text-xs font-medium mt-0.5 text-blue-100 leading-relaxed">
            Your accuracy of <strong className="text-white">{overallAccuracy}%</strong> is{" "}
            {overallAccuracy >= 80
              ? "excellent! Keep maintaining this accuracy."
              : "moderate. Eliminate wrong guesses to clear competitive cutoff scores."}
            {" "}Rank: <strong className="text-white">#{analysisData.rank}</strong> out of {analysisData.totalStudents.toLocaleString()} aspirants.
          </p>
        </div>
      </div>

    </div>
  );
};
