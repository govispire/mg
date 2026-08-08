import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, XCircle, Info, TrendingUp, BookOpen } from 'lucide-react';
import { TestAnalysisData } from '@/data/testAnalysisData';

interface ExamReadinessTabProps {
  analysisData: TestAnalysisData;
}

// Exam-aware cutoff data (in marks per 100 total)
const EXAM_CUTOFFS: Record<string, { section: string; cutoff: number; maxMarks: number }[]> = {
  'sbi-po': [
    { section: 'English Language',      cutoff: 7.75, maxMarks: 40 },
    { section: 'Reasoning Ability',     cutoff: 8.00, maxMarks: 35 },
    { section: 'Quantitative Aptitude', cutoff: 7.25, maxMarks: 35 },
  ],
  'sbi-clerk': [
    { section: 'English Language',      cutoff: 7.50, maxMarks: 30 },
    { section: 'Numerical Ability',     cutoff: 6.75, maxMarks: 35 },
    { section: 'Reasoning Ability',     cutoff: 7.00, maxMarks: 35 },
  ],
  'ibps-po': [
    { section: 'English Language',      cutoff: 8.00, maxMarks: 40 },
    { section: 'Reasoning Ability',     cutoff: 8.50, maxMarks: 40 },
    { section: 'Quantitative Aptitude', cutoff: 7.75, maxMarks: 40 },
    { section: 'General Awareness',     cutoff: 6.75, maxMarks: 40 },
    { section: 'Computer Aptitude',     cutoff: 6.50, maxMarks: 20 },
  ],
  'ibps-clerk': [
    { section: 'English Language',      cutoff: 7.00, maxMarks: 40 },
    { section: 'Numerical Ability',     cutoff: 7.00, maxMarks: 40 },
    { section: 'Reasoning',             cutoff: 7.50, maxMarks: 50 },
  ],
  'upsc': [
    { section: 'General Studies I',     cutoff: 50, maxMarks: 250 },
    { section: 'General Studies II',    cutoff: 50, maxMarks: 250 },
    { section: 'CSAT',                  cutoff: 66.66, maxMarks: 200 },
  ],
  'ssc-cgl': [
    { section: 'General Intelligence',  cutoff: 30, maxMarks: 50 },
    { section: 'English Comprehension', cutoff: 25, maxMarks: 50 },
    { section: 'Quantitative Aptitude', cutoff: 28, maxMarks: 50 },
    { section: 'General Awareness',     cutoff: 22, maxMarks: 50 },
  ],
  'default': [
    { section: 'Section A', cutoff: 40, maxMarks: 100 },
    { section: 'Section B', cutoff: 35, maxMarks: 100 },
    { section: 'Section C', cutoff: 30, maxMarks: 100 },
  ],
};

function detectExamType(analysisData: TestAnalysisData): string {
  const name = (analysisData.testName || '').toLowerCase();
  if (name.includes('sbi po') || name.includes('sbi-po')) return 'sbi-po';
  if (name.includes('sbi clerk')) return 'sbi-clerk';
  if (name.includes('ibps po') || name.includes('ibps-po')) return 'ibps-po';
  if (name.includes('ibps clerk')) return 'ibps-clerk';
  if (name.includes('upsc')) return 'upsc';
  if (name.includes('ssc')) return 'ssc-cgl';
  return 'default';
}

// Circular arc path
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const s = { x: cx + r * Math.cos(toRad(startAngle)), y: cy + r * Math.sin(toRad(startAngle)) };
  const e = { x: cx + r * Math.cos(toRad(endAngle)),   y: cy + r * Math.sin(toRad(endAngle))   };
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

function getReadiness(pct: number): { label: string; desc: string; color: string; emoji: string; zone: string } {
  if (pct >= 80) return { label: "You're Ready! 💪", desc: "Well prepared. Keep practising weak topics to score even higher.", color: '#10b981', emoji: '💪', zone: 'Ready' };
  if (pct >= 60) return { label: 'Almost There! ⚡', desc: 'Getting closer! A bit more focused practice will get you over the line.', color: '#f59e0b', emoji: '⚡', zone: 'Almost Ready' };
  return { label: 'Needs More Work 📚', desc: 'Focus on high-weightage topics and attempt more full-length mocks.', color: '#ef4444', emoji: '📚', zone: 'Needs Improvement' };
}

export const ExamReadinessTab: React.FC<ExamReadinessTabProps> = ({ analysisData }) => {
  const examType = detectExamType(analysisData);
  const cutoffs = EXAM_CUTOFFS[examType] || EXAM_CUTOFFS['default'];

  const totalScore = analysisData.sectionWiseData.reduce((s, x) => s + x.score, 0);
  const maxScore = analysisData.sectionWiseData.reduce((s, x) => s + x.maxScore, 0);

  // Map section scores to cutoff rows
  const sectionCutoffRows = useMemo(() => {
    return cutoffs.map(cut => {
      const found = analysisData.sectionWiseData.find(s =>
        s.sectionName.toLowerCase().includes(cut.section.toLowerCase().split(' ')[0]) ||
        cut.section.toLowerCase().includes(s.sectionName.toLowerCase().split(' ')[0])
      );
      const yourScore = found ? found.score : Math.round(cut.maxMarks * 0.45);
      const scaledCutoff = cut.cutoff;
      const diff = +(yourScore - scaledCutoff).toFixed(2);
      let status: 'safe' | 'warning' | 'danger';
      if (diff >= 5) status = 'safe';
      else if (diff >= 0) status = 'warning';
      else status = 'danger';
      return { section: cut.section, yourScore, maxMarks: cut.maxMarks, cutoff: scaledCutoff, diff, status };
    });
  }, [analysisData, cutoffs]);

  const totalCutoff = cutoffs.reduce((s, c) => s + c.cutoff, 0);
  const totalMax = cutoffs.reduce((s, c) => s + c.maxMarks, 0);
  const totalDiff = +(totalScore - totalCutoff).toFixed(2);
  const overallStatus: 'safe' | 'warning' | 'danger' =
    totalDiff >= 10 ? 'safe' : totalDiff >= 0 ? 'warning' : 'danger';

  // Readiness percentage — how well you clear overall cutoff + section cutoffs
  const sectionsClearedCount = sectionCutoffRows.filter(r => r.status !== 'danger').length;
  const overallCutoffPct = Math.min(100, Math.max(0, Math.round((totalScore / Math.max(totalCutoff * 1.5, 1)) * 80)));
  const sectionBonus = Math.round((sectionsClearedCount / sectionCutoffRows.length) * 20);
  const readinessPct = Math.min(100, overallCutoffPct + sectionBonus);

  const readiness = getReadiness(readinessPct);

  // Circular gauge
  const cx = 70, cy = 70, r = 52;
  const startAngle = 135, totalArc = 270;
  const endAngle = startAngle + totalArc * (readinessPct / 100);
  const trackEnd = startAngle + totalArc;

  const statusStyles = {
    safe: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', icon: CheckCircle2, label: '✓ Safe' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#a16207', icon: AlertTriangle, label: '⚠ Borderline' },
    danger: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: XCircle, label: '✗ Below Cutoff' },
  };

  return (
    <div className="p-4 space-y-4 bg-[#f8fafc] min-h-full">

      {/* ── Top Row: Gauge + Summary ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Circular Readiness Gauge */}
        <Card className="p-5 border border-gray-200 shadow-sm flex flex-col items-center">
          <p className="text-sm font-bold text-gray-800 mb-4 self-start">Exam Readiness</p>

          <svg viewBox="0 0 140 140" className="w-36 h-36">
            {/* Track */}
            <path
              d={describeArc(cx, cy, r, startAngle, trackEnd)}
              fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round"
            />
            {/* Progress */}
            {readinessPct > 0 && (
              <path
                d={describeArc(cx, cy, r, startAngle, Math.min(endAngle, trackEnd - 0.5))}
                fill="none" stroke={readiness.color} strokeWidth="12" strokeLinecap="round"
              />
            )}
            {/* Zone markers */}
            {[
              { pct: 60, label: '60%' },
              { pct: 80, label: '80%' },
            ].map(m => {
              const angle = startAngle + totalArc * (m.pct / 100);
              const rad = (angle * Math.PI) / 180;
              const mx = cx + (r + 2) * Math.cos(rad);
              const my = cy + (r + 2) * Math.sin(rad);
              return (
                <circle key={m.pct} cx={mx} cy={my} r="3" fill="#94a3b8" />
              );
            })}
            {/* Center text */}
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="#1f2937" fontFamily="system-ui">
              {readinessPct}%
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600" fontFamily="system-ui">
              READINESS
            </text>
          </svg>

          {/* Verdict */}
          <div className="mt-3 text-center">
            <p className="text-sm font-bold" style={{ color: readiness.color }}>{readiness.label}</p>
            <p className="text-xs text-gray-500 mt-1 max-w-[200px]">{readiness.desc}</p>
          </div>

          {/* Zone bar */}
          <div className="mt-4 w-full">
            <div className="relative h-3 rounded-full overflow-hidden flex">
              <div className="h-full bg-rose-400" style={{ width: '60%' }} />
              <div className="h-full bg-amber-400" style={{ width: '20%' }} />
              <div className="h-full bg-emerald-400" style={{ width: '20%' }} />
              {/* Marker */}
              <div
                className="absolute top-0 bottom-0 w-3 h-3 rounded-full bg-white border-2 shadow-md"
                style={{ left: `calc(${readinessPct}% - 6px)`, borderColor: readiness.color }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-gray-400 font-medium mt-1.5">
              <span>Needs Improvement<br />(0–60%)</span>
              <span className="text-center">Almost Ready<br />(60–80%)</span>
              <span className="text-right">Ready<br />(80–100%)</span>
            </div>
          </div>
        </Card>

        {/* Quick readiness summary */}
        <Card className="p-5 border border-gray-200 shadow-sm flex flex-col">
          <p className="text-sm font-bold text-gray-800 mb-3">Readiness Snapshot</p>
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-600 font-medium">Your Total Score</span>
              <span className="text-sm font-extrabold text-gray-900">{totalScore} / {maxScore}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-600 font-medium">Total Cutoff Required</span>
              <span className="text-sm font-extrabold text-gray-700">{totalCutoff.toFixed(1)} / {totalMax}</span>
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg border`}
              style={{ background: statusStyles[overallStatus].bg, borderColor: statusStyles[overallStatus].border }}>
              <span className="text-xs font-semibold" style={{ color: statusStyles[overallStatus].text }}>Overall Cutoff Gap</span>
              <span className="text-sm font-extrabold" style={{ color: statusStyles[overallStatus].text }}>
                {totalDiff >= 0 ? `+${totalDiff}` : totalDiff} marks
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-600 font-medium">Sections Cleared Cutoff</span>
              <span className="text-sm font-extrabold text-gray-900">
                {sectionsClearedCount} / {sectionCutoffRows.length}
              </span>
            </div>
          </div>

          {/* Tip */}
          <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
            <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-blue-700 leading-relaxed">
              {sectionsClearedCount < sectionCutoffRows.length
                ? `Focus on sections below cutoff. Even +3 marks per section can change your readiness significantly.`
                : `All sections cleared cutoff! Work on boosting overall score to secure a safer margin.`}
            </p>
          </div>
        </Card>
      </div>

      {/* ── Section-wise Cutoff Table ── */}
      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-800">
          <p className="text-sm font-bold text-white">Section-wise Cutoff Readiness</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Section', 'Your Score', 'Cutoff', 'Difference', 'Status'].map(h => (
                  <th key={h} className="text-xs font-semibold text-gray-500 px-4 py-2.5 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sectionCutoffRows.map((row, i) => {
                const s = statusStyles[row.status];
                const StatusIcon = s.icon;
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{row.section}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold" style={{ color: '#6366f1' }}>
                        {row.yourScore.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400"> / {row.maxMarks}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-600">{row.cutoff.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold" style={{ color: s.text }}>
                        {row.diff >= 0 ? `+${row.diff.toFixed(2)}` : row.diff.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                        style={{ background: s.bg, borderColor: s.border, color: s.text }}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {row.status === 'safe' ? 'Safe' : row.status === 'warning' ? 'Borderline' : 'Below Cutoff'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* Total row */}
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="px-4 py-3 text-sm font-bold text-gray-800">TOTAL</td>
                <td className="px-4 py-3">
                  <span className="text-sm font-extrabold" style={{ color: '#6366f1' }}>
                    {totalScore.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-400"> / {totalMax}</span>
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-600">{totalCutoff.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className="text-sm font-extrabold" style={{ color: statusStyles[overallStatus].text }}>
                    {totalDiff >= 0 ? `+${totalDiff.toFixed(2)}` : totalDiff.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border"
                    style={{ background: statusStyles[overallStatus].bg, borderColor: statusStyles[overallStatus].border, color: statusStyles[overallStatus].text }}
                  >
                    {overallStatus === 'danger' ? '✗ Danger Zone' : overallStatus === 'warning' ? '⚠ Borderline' : '✓ Safe'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Improvement Roadmap ── */}
      {sectionCutoffRows.filter(r => r.status === 'danger').length > 0 && (
        <Card className="p-4 border border-rose-100 bg-rose-50/30 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-rose-600" />
            <p className="text-sm font-bold text-rose-700">Priority Improvement Areas</p>
          </div>
          <div className="space-y-2">
            {sectionCutoffRows
              .filter(r => r.status === 'danger')
              .map((row, i) => (
                <div key={i} className="flex items-center justify-between bg-white border border-rose-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-xs font-semibold text-gray-700">{row.section}</span>
                  </div>
                  <span className="text-xs font-bold text-rose-600">
                    Need {Math.abs(row.diff).toFixed(1)} more marks
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}

    </div>
  );
};
