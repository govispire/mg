
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Target, CheckCircle, XCircle, Clock, Users, Trophy, Brain, TrendingUp, AlertTriangle, Swords, BarChart2, MapPin } from 'lucide-react';
import { TestAnalysisData } from '@/data/testAnalysisData';
import { useIsMobile } from '@/hooks/use-mobile';

/* ─────────────────────────────────────────
   DESIGN SYSTEM TOKENS
   Primary:  #1a3c6e  (navy)
   Accent:   #2563eb  (blue)
   Success:  #16a34a  (green)
   Warning:  #d97706  (amber)
   Danger:   #dc2626  (red)
   Surface:  #f8fafc
   Border:   #e2e8f0
───────────────────────────────────────── */

interface OverallAnalysisTabProps {
  analysisData: TestAnalysisData;
}

/* ── Shared section-heading component ── */
const SectionHeading = ({
  icon: Icon,
  title,
  badge,
  badgeColor = 'bg-blue-100 text-blue-700 border-blue-200',
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  badge?: string;
  badgeColor?: string;
}) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-lg bg-[#1a3c6e]/10 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-[#1a3c6e]" />
    </div>
    <h3 className="text-base sm:text-lg font-bold text-[#1a3c6e] leading-none">{title}</h3>
    {badge && (
      <span className={`text-[10px] font-semibold border rounded-full px-2.5 py-0.5 ${badgeColor}`}>
        {badge}
      </span>
    )}
  </div>
);

/* ── Stat chip (primary 4-card row) ── */
const StatChip = ({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: string;
  accent: string;
}) => (
  <div className={`rounded-2xl border-2 ${accent} px-4 py-4 flex items-start justify-between gap-2 bg-white shadow-sm hover:shadow-md transition-shadow`}>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-extrabold leading-none text-[#1a3c6e]">{value}</p>
      <p className="text-[10px] text-gray-400 mt-1 truncate">{sub}</p>
    </div>
    <span className="text-2xl select-none flex-shrink-0">{icon}</span>
  </div>
);

/* ── Mini info card — matches StatChip white design, color only on icon dot ── */
const MiniCard = ({
  label,
  value,
  dotColor,
  icon,
}: {
  label: string;
  value: number | string;
  dotColor: string;  // tailwind bg colour class e.g. 'bg-blue-500'
  icon: string;
}) => (
  <div className="rounded-2xl border-2 border-[#e2e8f0] bg-white px-4 py-3 flex items-start justify-between gap-2 shadow-sm hover:shadow-md transition-shadow">
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
        <p className="text-[9px] sm:text-[10px] text-gray-400 font-semibold uppercase tracking-widest leading-none">{label}</p>
      </div>
      <p className="text-2xl font-extrabold leading-none text-[#1a3c6e]">{value}</p>
    </div>
    <span className="text-xl select-none flex-shrink-0 mt-0.5">{icon}</span>
  </div>
);

export const OverallAnalysisTab: React.FC<OverallAnalysisTabProps> = ({ analysisData }) => {
  const isMobile = useIsMobile();
  const [journeyFilter, setJourneyFilter] = useState<'all' | 'correct' | 'wrong' | 'skipped'>('all');
  const [rankSliderMarks, setRankSliderMarks] = useState<number>(() =>
    analysisData.sectionWiseData.reduce((s, sec) => s + sec.score, 0)
  );
  // init percentile slider to actual student score (not 0)
  const [percentileSliderMarks, setPercentileSliderMarks] = useState<number>(() =>
    analysisData.sectionWiseData.reduce((s, sec) => s + sec.score, 0)
  );

  // ── Totals ────────────────────────────────────────────────────
  const totalAttempted = analysisData.sectionWiseData.reduce((s, sec) => s + sec.attempted, 0);
  const totalCorrect = analysisData.sectionWiseData.reduce((s, sec) => s + sec.correct, 0);
  const totalWrong = analysisData.sectionWiseData.reduce((s, sec) => s + sec.wrong, 0);
  const totalSkipped = analysisData.sectionWiseData.reduce((s, sec) => s + sec.skipped, 0);
  const totalScore = analysisData.sectionWiseData.reduce((s, sec) => s + sec.score, 0);
  const sumMaxScore = analysisData.sectionWiseData.reduce((s, sec) => s + sec.maxScore, 0);
  const totalTime = analysisData.sectionWiseData.reduce((s, sec) => s + sec.timeSpent, 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const totalNegative = totalWrong * 0.25;

  // ── Cut-off ───────────────────────────────────────────────────
  const sectionCutoffs = analysisData.sectionWiseData
    .filter(s => s.cutOff !== undefined && s.cutOff! > 0)
    .reduce((sum, s) => sum + s.cutOff!, 0);
  const estimatedCutoff = sectionCutoffs > 0 ? sectionCutoffs : Math.round(sumMaxScore * 0.70);
  const aboveCutoff = totalScore - estimatedCutoff;
  const cutoffPct = Math.round((estimatedCutoff / sumMaxScore) * 100);
  const yourScorePct = Math.round((totalScore / sumMaxScore) * 100);
  const beatStudents = aboveCutoff > 0
    ? Math.round(analysisData.totalStudents * (1 - analysisData.rank / analysisData.totalStudents))
    : 0;

  // ── AI prediction ─────────────────────────────────────────────
  const history = analysisData.performanceHistory ?? [];
  const last5 = history.slice(-5);
  const trendPerTest = last5.length >= 2
    ? Math.round((last5[last5.length - 1].score - last5[0].score) / (last5.length - 1))
    : 0;
  const trendLabel = trendPerTest > 0 ? `+${trendPerTest}/mock` : trendPerTest < 0 ? `${trendPerTest}/mock` : 'Stable';
  const trendColor = trendPerTest > 0 ? 'text-green-600' : trendPerTest < 0 ? 'text-red-500' : 'text-gray-500';

  const secScorePcts = analysisData.sectionWiseData.map(s => (s.score / s.maxScore) * 100);
  const secMean = secScorePcts.reduce((a, b) => a + b, 0) / (secScorePcts.length || 1);
  const secStdDev = Math.sqrt(secScorePcts.reduce((acc, v) => acc + (v - secMean) ** 2, 0) / (secScorePcts.length || 1));
  const cv = secMean > 0 ? secStdDev / secMean : 1;
  const consistencyLabel = cv < 0.08 ? 'High' : cv < 0.15 ? 'Medium' : 'Low';
  const consistencyColor = cv < 0.08 ? 'text-green-600' : cv < 0.15 ? 'text-amber-500' : 'text-red-500';

  const worstSection = [...analysisData.sectionWiseData].sort((a, b) => a.accuracy - b.accuracy)[0];
  const qaRiskPts = worstSection ? -(worstSection.wrong * 0.25) : 0;
  const qaRiskLabel = qaRiskPts === 0 ? 'None' : `${qaRiskPts.toFixed(2)} pts`;
  const qaRiskColor = qaRiskPts === 0 ? 'text-green-600' : qaRiskPts > -2 ? 'text-amber-500' : 'text-red-500';

  const timePctUsed = analysisData.maxTime > 0 ? Math.round((analysisData.timeTaken / analysisData.maxTime) * 100) : 100;
  const timeLabel = timePctUsed > 95 ? 'Needs work' : timePctUsed > 80 ? 'Good' : 'Excellent';
  const timeColor = timePctUsed > 95 ? 'text-orange-500' : timePctUsed > 80 ? 'text-green-600' : 'text-green-700';
  const timeMinLeft = analysisData.maxTime - analysisData.timeTaken;

  const historyVariance = last5.length >= 2
    ? Math.abs(last5[last5.length - 1].score - last5[0].score) / 2
    : 5;
  const margin = Math.max(3, Math.min(8, Math.round(historyVariance)));
  const predictedLow = Math.max(0, totalScore - margin);
  const predictedHigh = Math.min(sumMaxScore, totalScore + Math.round(margin * 0.8));
  const confidenceLabel = analysisData.percentile >= 90 ? 'Very High'
    : analysisData.percentile >= 75 ? 'High'
      : analysisData.percentile >= 50 ? 'Medium' : 'Low';

  // ── Exam readiness ────────────────────────────────────────────
  const readinessPct = Math.min(100, Math.round(
    overallAccuracy * 0.45 +
    (totalScore / sumMaxScore) * 45 +
    (1 - analysisData.rank / Math.max(analysisData.totalStudents, 1)) * 10
  ));
  const sectionReadiness = analysisData.sectionWiseData.map(s => ({
    name: s.sectionName.split(' ')[0],
    pct: Math.min(100, Math.round((s.score / s.maxScore) * 100 + (s.accuracy - 70) * 0.3)),
    color: s.accuracy >= 85 ? '#16a34a' : s.accuracy >= 65 ? '#2563eb' : '#f59e0b',
  }));

  // ── Question journey ──────────────────────────────────────────
  const questions = analysisData.questionWiseData;
  const journeyQuestions = journeyFilter === 'all' ? questions
    : questions.filter(q =>
      journeyFilter === 'correct' ? q.status === 'correct'
        : journeyFilter === 'wrong' ? q.status === 'wrong'
          : q.status === 'unattempted' || q.status === 'marked'
    );

  // ── Donut math ────────────────────────────────────────────────
  const donutTotal = totalCorrect + totalWrong + totalSkipped || 1;
  const C = 2 * Math.PI * 56;
  const correctDash = (totalCorrect / donutTotal) * C;
  const wrongDash = (totalWrong / donutTotal) * C;

  // ── Leaderboard ───────────────────────────────────────────────
  const topScore = analysisData.comparisonData.topperScore;
  const scoreGap = Math.max(1, Math.round((topScore - totalScore) / Math.max(analysisData.rank, 1)));
  const secNames = analysisData.sectionWiseData.map(s => s.sectionName.split(' ')[0]);
  const peerSubs = [
    `${secNames[0] ?? 'Reasoning'} ${analysisData.sectionWiseData[0]?.correct ?? '--'}/${analysisData.sectionWiseData[0]?.maxScore ?? '--'} · Acc ${analysisData.sectionWiseData[0]?.accuracy ?? 0}%`,
    `${secNames[1] ?? 'English'} ${analysisData.sectionWiseData[1]?.correct ?? '--'}/${analysisData.sectionWiseData[1]?.maxScore ?? '--'} · Acc ${analysisData.sectionWiseData[1]?.accuracy ?? 0}%`,
    `${secNames[2] ?? 'Quant'} ${analysisData.sectionWiseData[2]?.correct ?? '--'}/${analysisData.sectionWiseData[2]?.maxScore ?? '--'} · Acc ${analysisData.sectionWiseData[2]?.accuracy ?? 0}%`,
    `All sections ${Math.round(overallAccuracy * 0.9)}%+ · Time: ${Math.floor(analysisData.timeTaken / 60)}h ${analysisData.timeTaken % 60}m`,
    `Fast finisher · Completed in ${Math.floor((analysisData.timeTaken - 5) / 60)}h ${(analysisData.timeTaken - 5) % 60}m`,
  ];
  const leaderboard = [
    { rank: 1, initials: 'PS', name: 'Priya S.', sub: peerSubs[0], score: topScore, bg: '#fef3c7', fg: '#92400e', border: '#fbbf24' },
    { rank: 2, initials: 'AM', name: 'Arjun M.', sub: peerSubs[1], score: topScore - scoreGap, bg: '#dbeafe', fg: '#1e40af', border: '#93c5fd' },
    { rank: 3, initials: 'NR', name: 'Neha R.', sub: peerSubs[2], score: topScore - scoreGap * 2, bg: '#ede9fe', fg: '#5b21b6', border: '#c4b5fd' },
    { rank: 4, initials: 'KB', name: 'Karan B.', sub: peerSubs[3], score: topScore - scoreGap * 3, bg: '#d1fae5', fg: '#065f46', border: '#6ee7b7' },
    { rank: 5, initials: 'DT', name: 'Divya T.', sub: peerSubs[4], score: topScore - scoreGap * 4, bg: '#ffedd5', fg: '#9a3412', border: '#fdba74' },
  ];

  // ── Mobile section cards ──────────────────────────────────────
  const MobileSectionCards = () => (
    <div className="space-y-3">
      {analysisData.sectionWiseData.map(section => (
        <div key={section.sectionName} className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-bold text-sm text-[#1a3c6e]">{section.sectionName}</h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">#{section.rank}</span>
              <span className="text-[10px] font-bold text-blue-600">{section.percentile}%ile</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="bg-green-50 rounded-lg p-2">
              <p className="text-[9px] text-green-600 font-semibold">Correct</p>
              <p className="font-extrabold text-green-700">{section.correct}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2">
              <p className="text-[9px] text-red-600 font-semibold">Wrong</p>
              <p className="font-extrabold text-red-600">{section.wrong}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-[9px] text-gray-500 font-semibold">Skipped</p>
              <p className="font-extrabold text-gray-600">{section.skipped}</p>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Score: <strong className="text-[#1a3c6e]">{section.score}/{section.maxScore}</strong></span>
            <span>Time: <strong className="text-[#1a3c6e]">{section.timeSpent}m</strong></span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-medium text-gray-500">
              <span>Accuracy</span><span className="text-[#1a3c6e] font-bold">{section.accuracy}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${section.accuracy}%`,
                  background: section.accuracy >= 85 ? '#16a34a' : section.accuracy >= 65 ? '#2563eb' : '#f59e0b',
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── Desktop section table ─────────────────────────────────────
  const DesktopTable = () => (
    <div className="overflow-x-auto rounded-xl border border-[#e2e8f0]">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#1a3c6e]">
            {['Section', 'Attempted', 'Correct / Wrong', 'Skipped', 'Score', 'Rank', 'Percentile', 'Accuracy', 'Time'].map(h => (
              <TableHead key={h} className="text-white text-sm font-semibold px-4 py-3 whitespace-nowrap">{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {analysisData.sectionWiseData.map((section, index) => (
            <TableRow
              key={section.sectionName}
              className={`transition-colors hover:bg-blue-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-[#f0f6ff]'}`}
            >
              <TableCell className="font-semibold text-sm px-4 py-3 text-[#1a3c6e]">{section.sectionName}</TableCell>
              <TableCell className="text-sm px-4 py-3 text-gray-700">{section.attempted}</TableCell>
              <TableCell className="text-sm px-4 py-3">
                <span className="text-green-600 font-bold">{section.correct}</span>
                <span className="text-gray-300 mx-1">/</span>
                <span className="text-red-500 font-bold">{section.wrong}</span>
              </TableCell>
              <TableCell className="text-sm px-4 py-3 text-gray-600">{section.skipped}</TableCell>
              <TableCell className="text-sm px-4 py-3 font-semibold text-gray-800">{section.score}/{section.maxScore}</TableCell>
              <TableCell className="text-sm px-4 py-3 text-gray-600">{section.rank}</TableCell>
              <TableCell className="text-sm px-4 py-3 text-blue-600 font-semibold">{section.percentile}%</TableCell>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${section.accuracy}%`,
                        background: section.accuracy >= 85 ? '#16a34a' : section.accuracy >= 65 ? '#2563eb' : '#f59e0b',
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-10">{section.accuracy}%</span>
                </div>
              </TableCell>
              <TableCell className="text-sm px-4 py-3 text-gray-600">{section.timeSpent}m</TableCell>
            </TableRow>
          ))}
          {/* Overall row */}
          <TableRow className="bg-[#1a3c6e]/8 border-t-2 border-[#1a3c6e]/30">
            <TableCell className="font-extrabold text-sm px-4 py-3 text-[#1a3c6e]">Overall</TableCell>
            <TableCell className="text-sm px-4 py-3 font-bold text-[#1a3c6e]">{totalAttempted}</TableCell>
            <TableCell className="text-sm px-4 py-3">
              <span className="text-green-600 font-extrabold">{totalCorrect}</span>
              <span className="text-gray-300 mx-1">/</span>
              <span className="text-red-500 font-extrabold">{totalWrong}</span>
            </TableCell>
            <TableCell className="text-sm px-4 py-3 font-bold text-[#1a3c6e]">{totalSkipped}</TableCell>
            <TableCell className="text-sm px-4 py-3 font-extrabold text-[#1a3c6e]">{totalScore}/{sumMaxScore}</TableCell>
            <TableCell className="text-sm px-4 py-3 font-bold text-[#1a3c6e]">{analysisData.rank}</TableCell>
            <TableCell className="text-sm px-4 py-3 font-bold text-blue-600">{analysisData.percentile}%</TableCell>
            <TableCell className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden min-w-[60px]">
                  <div className="h-full rounded-full bg-[#1a3c6e]" style={{ width: `${overallAccuracy}%` }} />
                </div>
                <span className="text-sm font-extrabold text-[#1a3c6e] w-10">{overallAccuracy}%</span>
              </div>
            </TableCell>
            <TableCell className="text-sm px-4 py-3 font-bold text-[#1a3c6e]">{totalTime}m</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-5 p-1 pb-6">

      {/* ════════════════════════════════════════
          SECTION 1 — PRIMARY STAT CARDS (4 up)
      ════════════════════════════════════════ */}
      {/* ── PRIMARY STAT CHIPS — single clean row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip label="Score" value={`${totalScore}/${sumMaxScore}`} sub={`Avg: ${analysisData.comparisonData.averageScore} · Topper: ${analysisData.comparisonData.topperScore}`} icon="📈" accent="border-blue-200" />
        <StatChip label="Rank" value={`${analysisData.rank}/${analysisData.totalStudents.toLocaleString()}`} sub={`Beat ${Math.round((1 - analysisData.rank / analysisData.totalStudents) * 100)}% of students`} icon="🏅" accent="border-indigo-200" />
        <StatChip label="Percentile" value={`${analysisData.percentile}%`} sub={`Top ${100 - analysisData.percentile}% nationally`} icon="%" accent="border-sky-200" />
        <StatChip label="Accuracy" value={`${overallAccuracy}%`} sub={`✅ ${totalCorrect} correct · ❌ ${totalWrong} wrong · ⏭ ${totalSkipped} skipped`} icon="✔" accent="border-green-200" />
      </div>

      {/* ════════════════════════════════════════
          SECTION 2 — SECTION-WISE ANALYSIS
      ════════════════════════════════════════ */}
      <Card className="p-4 sm:p-5 shadow-sm border-[#e2e8f0]">
        <SectionHeading icon={BarChart2} title="Section-wise Analysis" />
        {isMobile ? <MobileSectionCards /> : <DesktopTable />}
      </Card>

      {/* ════════════════════════════════════════
          SECTION 3 — QUESTION JOURNEY
      ════════════════════════════════════════ */}
      <Card className="p-4 sm:p-5 shadow-sm border-[#e2e8f0]">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1a3c6e]">Question Journey</h3>
            <span className="text-[10px] bg-gray-100 text-gray-500 border border-gray-200 rounded-full px-2.5 py-0.5 font-semibold">
              All {questions.length} Questions
            </span>
          </div>
          {/* Filter pills */}
          <div className="flex gap-1.5 ml-auto">
            {([
              { key: 'all',     label: 'All',     active: 'bg-gray-700 text-white',    inactive: 'bg-white text-gray-600 border-gray-200' },
              { key: 'correct', label: 'Correct',  active: 'bg-green-600 text-white',   inactive: 'bg-white text-gray-600 border-gray-200' },
              { key: 'wrong',   label: 'Wrong',    active: 'bg-red-500 text-white',     inactive: 'bg-white text-gray-600 border-gray-200' },
              { key: 'skipped', label: 'Skipped',  active: 'bg-gray-400 text-white',   inactive: 'bg-white text-gray-600 border-gray-200' },
            ] as const).map(({ key, label, active, inactive }) => (
              <button
                key={key}
                onClick={() => setJourneyFilter(key)}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${journeyFilter === key ? active : `border ${inactive} hover:border-gray-400`}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="flex gap-4 mb-3">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-600" /><span className="text-[10px] text-gray-500 font-medium">Correct</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-[10px] text-gray-500 font-medium">Wrong</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-200 border border-gray-300" /><span className="text-[10px] text-gray-500 font-medium">Skipped</span></div>
        </div>
        {/* Grid */}
        <div className="flex flex-wrap gap-1.5">
          {journeyQuestions.map(q => {
            const isCorrect = q.status === 'correct';
            const isWrong = q.status === 'wrong';
            return (
              <div
                key={q.questionId}
                title={`Q${q.questionId}: ${q.status}`}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border cursor-default select-none transition-transform hover:scale-110 ${
                  isCorrect
                    ? 'bg-green-700 text-white border-green-600 shadow-sm'
                    : isWrong
                      ? 'bg-red-500 text-white border-red-400 shadow-sm'
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                }`}
              >
                {q.questionId}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ════════════════════════════════════════
          SECTION 4 — BEAT THE TOPPER (60%) + TOP PERFORMERS (40%)
          Both in same row with column layout
      ════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Beat The Topper — 60% */}
        <div className="lg:w-[60%] rounded-2xl border border-[#e2e8f0] bg-white shadow-sm overflow-hidden flex-shrink-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-[#e2e8f0] bg-[#1a3c6e]/[0.03]">
            <div className="w-8 h-8 rounded-lg bg-[#1a3c6e]/10 flex items-center justify-center">
              <Swords className="w-4 h-4 text-[#1a3c6e]" />
            </div>
            <h3 className="text-base font-bold text-[#1a3c6e]">Beat The Topper</h3>
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5">
              Competitive View
            </span>
            <span className="ml-auto text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5">
              Top {100 - analysisData.percentile + 1}%
            </span>
          </div>

          {/* VS panel */}
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-[#e2e8f0]">
            {/* YOU */}
            <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50/40 px-5 py-5">
              <p className="text-[10px] font-extrabold text-green-600 tracking-widest mb-3 flex items-center gap-1.5">
                <span className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-[8px]">★</span>
                YOU
              </p>
              <p className="text-5xl font-extrabold text-green-600 leading-none mb-1">{totalScore}</p>
              <p className="text-xs text-gray-500 mb-4 font-medium">
                Rank {analysisData.rank} · {analysisData.percentile}th percentile
              </p>
              <div className="space-y-2.5">
                {analysisData.sectionWiseData.map(s => (
                  <div key={s.sectionName} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{s.sectionName}</span>
                    <span className="font-bold text-green-700 tabular-nums">{s.correct}/{s.maxScore}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* VS divider */}
            <div className="flex items-center justify-center px-3 py-3 sm:py-0 bg-white">
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                <span className="text-xs font-extrabold text-gray-400">VS</span>
              </div>
            </div>

            {/* TOPPER */}
            <div className="flex-1 bg-gradient-to-br from-amber-50 to-yellow-50/40 px-5 py-5">
              <p className="text-[10px] font-extrabold text-amber-600 tracking-widest mb-3 flex items-center gap-1.5">
                <span className="text-base">👑</span>
                TOPPER
              </p>
              <p className="text-5xl font-extrabold text-amber-500 leading-none mb-1">{topScore}</p>
              <p className="text-xs text-gray-500 mb-4 font-medium">Rank 1 · 99th percentile</p>
              <div className="space-y-2.5">
                {analysisData.sectionWiseData.map(s => {
                  const topperSec = Math.round(s.maxScore * 0.9);
                  const isAhead = topperSec > s.correct;
                  return (
                    <div key={s.sectionName} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{s.sectionName}</span>
                      <span className={`font-bold tabular-nums ${isAhead ? 'text-amber-600' : 'text-green-600'}`}>
                        {topperSec}/{s.maxScore}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers — 40% */}
        <div className="lg:w-[40%] rounded-2xl border border-[#e2e8f0] bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-[#e2e8f0] bg-[#1a3c6e]/[0.03]">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-[#1a3c6e]">Top Performers</h3>
          </div>

          {/* Podium */}
          <div className="px-5 pt-5 pb-2">
            <div className="flex items-end justify-center gap-2 mb-4">
              {/* Rank 2 */}
              {leaderboard[1] && (
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-extrabold border-4 border-white shadow-md"
                    style={{ background: leaderboard[1].bg, color: leaderboard[1].fg, outline: `2px solid ${leaderboard[1].border}` }}
                  >
                    {leaderboard[1].initials}
                  </div>
                  <p className="text-[9px] font-semibold text-gray-600 truncate max-w-[60px] text-center">{leaderboard[1].name}</p>
                  <p className="text-xs font-extrabold text-gray-700">{leaderboard[1].score}</p>
                  <div className="w-full rounded-t-lg flex items-start justify-center pt-1.5 shadow-inner"
                    style={{ height: '52px', background: 'linear-gradient(180deg,#d4d4d4,#a3a3a3)' }}>
                    <span className="text-white text-lg font-extrabold">2</span>
                  </div>
                </div>
              )}
              {/* Rank 1 */}
              {leaderboard[0] && (
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="text-xl leading-none animate-bounce">👑</div>
                  <div
                    className="w-13 h-13 rounded-full flex items-center justify-center text-base font-extrabold border-4 border-white shadow-lg"
                    style={{ background: leaderboard[0].bg, color: leaderboard[0].fg, outline: `2px solid ${leaderboard[0].border}`, width: '52px', height: '52px' }}
                  >
                    {leaderboard[0].initials}
                  </div>
                  <p className="text-[9px] font-semibold text-gray-600 truncate max-w-[68px] text-center">{leaderboard[0].name}</p>
                  <p className="text-xs font-extrabold text-amber-600">{leaderboard[0].score}</p>
                  <div className="w-full rounded-t-lg flex items-start justify-center pt-1.5 shadow-inner"
                    style={{ height: '72px', background: 'linear-gradient(180deg,#fbbf24,#d97706)' }}>
                    <span className="text-white text-lg font-extrabold">1</span>
                  </div>
                </div>
              )}
              {/* Rank 3 */}
              {leaderboard[2] && (
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-extrabold border-4 border-white shadow-md"
                    style={{ background: leaderboard[2].bg, color: leaderboard[2].fg, outline: `2px solid ${leaderboard[2].border}` }}
                  >
                    {leaderboard[2].initials}
                  </div>
                  <p className="text-[9px] font-semibold text-gray-600 truncate max-w-[60px] text-center">{leaderboard[2].name}</p>
                  <p className="text-xs font-extrabold text-amber-700">{leaderboard[2].score}</p>
                  <div className="w-full rounded-t-lg flex items-start justify-center pt-1.5 shadow-inner"
                    style={{ height: '38px', background: 'linear-gradient(180deg,#d97706,#b45309)' }}>
                    <span className="text-white text-lg font-extrabold">3</span>
                  </div>
                </div>
              )}
            </div>

            {/* Ranked list */}
            <div className="space-y-1.5 pb-3">
              {leaderboard.map((p, i) => {
                const barW = Math.round((p.score / (topScore + 5)) * 100);
                return (
                  <div
                    key={p.rank}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 border transition-colors ${i === 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100 hover:bg-white'}`}
                  >
                    <span className={`text-xs font-bold w-4 text-center ${i === 0 ? 'text-amber-600' : 'text-gray-400'}`}>{p.rank}</span>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 border-2"
                      style={{ background: p.bg, color: p.fg, borderColor: p.border }}>
                      {p.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-gray-800">{p.name}</p>
                      <p className="text-[9px] text-gray-400 truncate">{p.sub}</p>
                    </div>
                    <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                      <div className="h-full rounded-full" style={{ width: `${barW}%`, background: i === 0 ? '#d97706' : '#9ca3af' }} />
                    </div>
                    <span className={`text-sm font-extrabold w-7 text-right ${i === 0 ? 'text-amber-600' : 'text-gray-700'}`}>{p.score}</span>
                  </div>
                );
              })}

              <div className="text-center text-[10px] text-gray-300 py-0.5">· · · ranks 6 – {Math.max(6, analysisData.rank - 1)} · · ·</div>

              {/* You row */}
              <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 bg-green-50 border-2 border-green-300">
                <span className="text-xs font-bold w-4 text-center text-green-700">{analysisData.rank}</span>
                <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 border-2 border-green-400">★</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-green-800">You</p>
                  <p className="text-[9px] text-green-600 truncate">+{Math.max(0, totalScore - analysisData.comparisonData.averageScore)} above avg · {overallAccuracy}% accuracy</p>
                </div>
                <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.round((totalScore / (topScore + 5)) * 100)}%` }} />
                </div>
                <span className="text-sm font-extrabold text-green-700 w-7 text-right">{totalScore}</span>
              </div>

              {/* Neighbour */}
              <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 bg-gray-50 border border-gray-100">
                <span className="text-xs font-bold w-4 text-center text-gray-400">{analysisData.rank + 1}</span>
                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 border-2 border-gray-300">RP</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700">Rohit P.</p>
                  <p className="text-[9px] text-gray-400 truncate">{peerSubs[3]}</p>
                </div>
                <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  <div className="h-full rounded-full bg-gray-300" style={{ width: `${Math.round(((totalScore - 1) / (topScore + 5)) * 100)}%` }} />
                </div>
                <span className="text-sm font-extrabold text-gray-700 w-7 text-right">{totalScore - 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ════════════════════════════════════════
          SECTION 5 — ATTEMPT ANALYSIS (32%) + WHERE YOU STAND (68%)
      ════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* ── Attempt Analysis ── */}
        <Card className="lg:w-[32%] flex-shrink-0 p-4 shadow-sm border-[#e2e8f0]">
          <SectionHeading icon={Target} title="Attempt Analysis" />

          {/* Donut centred */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <svg width="120" height="120" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r="56" fill="none" stroke="#f1f5f9" strokeWidth="20" />
                <circle cx="75" cy="75" r="56" fill="none" stroke="#16a34a" strokeWidth="20"
                  strokeDasharray={`${correctDash} ${C - correctDash}`}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '75px 75px' }} />
                <circle cx="75" cy="75" r="56" fill="none" stroke="#dc2626" strokeWidth="20"
                  strokeDasharray={`${wrongDash} ${C - wrongDash}`}
                  strokeDashoffset={-(correctDash)}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '75px 75px' }} />
                <text x="75" y="68" textAnchor="middle" fontSize="28" fontWeight="800" fill="#1a3c6e">{totalAttempted}</text>
                <text x="75" y="85" textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="700" letterSpacing="1.5">ATTEMPTED</text>
              </svg>
            </div>
          </div>

          {/* Stat rows with mini progress bars */}
          <div className="space-y-3">
            {[
              { dot: '#16a34a', label: 'Correct',    raw: totalCorrect,   total: totalAttempted, display: String(totalCorrect),               cls: 'text-green-600',  track: '#dcfce7', fill: '#16a34a' },
              { dot: '#dc2626', label: 'Wrong',      raw: totalWrong,     total: totalAttempted, display: String(totalWrong),                 cls: 'text-red-500',    track: '#fee2e2', fill: '#dc2626' },
              { dot: '#94a3b8', label: 'Skipped',    raw: totalSkipped,   total: totalAttempted, display: String(totalSkipped),               cls: 'text-gray-500',   track: '#f1f5f9', fill: '#94a3b8' },
              { dot: '#f59e0b', label: 'Neg. Marks', raw: totalNegative,  total: 10,             display: `-${totalNegative.toFixed(2)}`,     cls: 'text-amber-600',  track: '#fef3c7', fill: '#f59e0b' },
            ].map(({ dot, label, raw, total, display, cls, track, fill }) => {
              const pct = total > 0 ? Math.round((Math.abs(raw) / total) * 100) : 0;
              return (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dot }} />
                      <span className="text-xs text-gray-600 font-medium">{label}</span>
                    </div>
                    <span className={`text-sm font-extrabold ${cls}`}>{display}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: track }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, background: fill }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Where You Stand ── */}
        <Card className="flex-1 p-4 shadow-sm border-[#e2e8f0] overflow-hidden">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-[#1a3c6e]">Where You Stand</h3>
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5">
              Cut-off Context
            </span>
          </div>

          {/* Key metric row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 text-center">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Your Score</p>
              <p className="text-2xl font-extrabold text-[#1a3c6e]">{totalScore}</p>
              <p className="text-[9px] text-gray-400">/{sumMaxScore}</p>
            </div>
            <div className={`rounded-xl p-3 text-center border-2 ${aboveCutoff >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-1 text-gray-400">vs Cut-off</p>
              <p className={`text-2xl font-extrabold ${aboveCutoff >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {aboveCutoff >= 0 ? `+${aboveCutoff}` : aboveCutoff}
              </p>
              <p className="text-[9px] text-gray-400">marks</p>
            </div>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 text-center">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Beat</p>
              <p className="text-2xl font-extrabold text-indigo-600">{beatStudents > 0 ? beatStudents.toLocaleString() : '—'}</p>
              <p className="text-[9px] text-gray-400">students</p>
            </div>
          </div>

          {/* Layered score position bar */}
          <div className="mb-2">
            <div className="flex justify-between text-[9px] text-gray-400 mb-1 font-medium">
              <span>0</span>
              <span className="text-amber-600 font-bold">~{estimatedCutoff} Cut-off</span>
              <span>{sumMaxScore}</span>
            </div>
            {/* Zone track */}
            <div className="relative h-8 rounded-xl overflow-hidden border border-[#e2e8f0]">
              {/* Danger zone */}
              <div className="absolute inset-y-0 left-0 bg-red-100" style={{ width: `${cutoffPct}%` }} />
              {/* Safe zone */}
              <div className="absolute inset-y-0 right-0 bg-green-100" style={{ width: `${100 - cutoffPct}%` }} />
              {/* Cut-off line */}
              <div className="absolute inset-y-0 w-0.5 bg-amber-400" style={{ left: `${cutoffPct}%` }} />

              {/* Your score marker */}
              <div
                className="absolute inset-y-0 flex items-center"
                style={{ left: `${Math.min(yourScorePct, 96)}%` }}
              >
                <div className="relative flex flex-col items-center">
                  <div className="w-5 h-full flex items-center justify-center">
                    <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${aboveCutoff >= 0 ? 'bg-green-600' : 'bg-red-500'}`} />
                  </div>
                </div>
              </div>

              {/* Zone labels */}
              <div className="absolute inset-0 flex items-center pointer-events-none">
                <span className="text-[9px] font-bold text-red-400/80 pl-2">Below Cut-off</span>
                <span className="text-[9px] font-bold text-green-500/80 ml-auto pr-2">Safe Zone</span>
              </div>
            </div>

            {/* Your position label */}
            <div
              className="mt-1 flex items-center gap-1"
              style={{ paddingLeft: `${Math.min(Math.max(yourScorePct - 4, 0), 88)}%` }}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${aboveCutoff >= 0 ? 'bg-green-600' : 'bg-red-500'}`} />
              <span className="text-[9px] font-bold text-gray-500">You ({totalScore})</span>
            </div>
          </div>

          {/* Status message */}
          <div className={`mt-3 rounded-xl px-4 py-3 border ${aboveCutoff >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`text-sm font-semibold ${aboveCutoff >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              {aboveCutoff >= 0
                ? `✅ You are ${aboveCutoff > 0 ? `+${aboveCutoff} marks above` : 'exactly at'} the General category cut-off`
                : `⚠️ You are ${Math.abs(aboveCutoff)} marks below the cut-off — keep practising!`}
            </p>
          </div>
        </Card>
      </div>


      {/* ════════════════════════════════════════
          SECTION 6 — RANK PREDICTOR
      ════════════════════════════════════════ */}
      {(() => {
        const minMark = Math.round(sumMaxScore * -0.10);
        const maxMark = sumMaxScore;
        const pct = (rankSliderMarks - minMark) / (maxMark - minMark);
        const rawRank = Math.round(analysisData.totalStudents * Math.pow(Math.max(0, 1 - pct), 1.8));
        const predictedRank = Math.max(1, Math.min(analysisData.totalStudents, rawRank));
        const thumbPct = Math.round(((rankSliderMarks - minMark) / (maxMark - minMark)) * 100);
        const isCustom = rankSliderMarks !== totalScore;
        const displayRank = isCustom ? predictedRank : analysisData.rank;
        const rankPctOfTotal = Math.round((1 - displayRank / analysisData.totalStudents) * 100);

        return (
          <Card className="p-4 sm:p-5 shadow-sm border-[#e2e8f0]">
            <SectionHeading
              icon={TrendingUp}
              title="Rank Predictor"
              badge="Interactive"
              badgeColor="bg-indigo-100 text-indigo-700 border-indigo-200"
            />

            {/* Hero rank display */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 mb-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-10 translate-x-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-8 -translate-x-8 pointer-events-none" />

              <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Rank */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <svg className="w-8 h-8 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                      {isCustom ? `Predicted Rank at ${rankSliderMarks} marks` : 'Your Current Rank'}
                    </p>
                    <p className="text-4xl font-extrabold text-white leading-none">#{displayRank.toLocaleString()}</p>
                    <p className="text-indigo-200 text-xs mt-0.5">out of {analysisData.totalStudents.toLocaleString()} students</p>
                  </div>
                </div>

                {/* Score chips */}
                <div className="flex gap-2 sm:ml-auto flex-wrap">
                  {[
                    { label: 'Your Score', val: totalScore,   bg: 'bg-white/20', text: 'text-white' },
                    { label: 'Topper',     val: analysisData.comparisonData.topperScore, bg: 'bg-amber-400/30 border border-amber-300/40', text: 'text-amber-200' },
                    { label: 'Avg Score',  val: analysisData.comparisonData.averageScore, bg: 'bg-white/10', text: 'text-indigo-100' },
                  ].map(({ label, val, bg, text }) => (
                    <div key={label} className={`${bg} backdrop-blur-sm rounded-xl px-3 py-2 text-center min-w-[68px]`}>
                      <p className="text-[9px] text-white/60 font-bold uppercase tracking-wide mb-0.5">{label}</p>
                      <p className={`text-lg font-extrabold ${text}`}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rank percentile badge */}
              <div className="relative mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-white/80 text-xs font-medium">
                  You beat <strong className="text-white">{rankPctOfTotal}%</strong> of all {analysisData.totalStudents.toLocaleString()} students
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1 px-1">
              <div className="relative pt-10 pb-6">
                {/* Tooltip above thumb */}
                <div className="absolute -top-1 flex flex-col items-center pointer-events-none"
                  style={{ left: `calc(${thumbPct}% - 36px)`, zIndex: 10 }}>
                  <div className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap">
                    Rank: {displayRank.toLocaleString()}
                  </div>
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-indigo-600" />
                </div>
                {/* Track */}
                <div className="relative h-3 bg-gray-100 rounded-full cursor-pointer">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600" style={{ width: `${thumbPct}%` }} />
                  <input
                    type="range" min={minMark} max={maxMark} step={1} value={rankSliderMarks}
                    onChange={e => setRankSliderMarks(Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" style={{ zIndex: 20 }}
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-4 border-indigo-500 shadow-lg pointer-events-none"
                    style={{ left: `${thumbPct}%` }} />
                  <div className="absolute top-full mt-2 flex flex-col items-center pointer-events-none"
                    style={{ left: `calc(${thumbPct}% - 30px)` }}>
                    <div className="bg-white border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow whitespace-nowrap">
                      Marks: {rankSliderMarks}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 px-0.5 font-medium">
                {Array.from({ length: 6 }, (_, i) => {
                  const v = Math.round(minMark + ((maxMark - minMark) / 5) * i);
                  return <span key={i}>{v}</span>;
                })}
              </div>
              <p className="text-center text-[10px] text-gray-400 pt-0.5">← Drag to predict rank at different marks →</p>
            </div>
          </Card>
        );
      })()}




      {/* ════════════════════════════════════════
          PREDICTED REAL EXAM SCORE
      ════════════════════════════════════════ */}
      <Card className="p-4 sm:p-5 shadow-sm border-[#e2e8f0]">
        <SectionHeading
          icon={Brain}
          title="Predicted Real Exam Score"
          badge="AI Prediction"
          badgeColor="bg-violet-100 text-violet-700 border-violet-200"
        />

        {/* Score range hero */}
        <div className="rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-5 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-16 translate-x-16 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <p className="text-violet-200 text-[10px] font-bold uppercase tracking-widest mb-1">Predicted Score Range</p>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-extrabold text-white">{predictedLow}–{predictedHigh}</p>
                <span className="text-violet-200 text-sm font-medium">/ {sumMaxScore}</span>
              </div>
              <p className="text-violet-200/80 text-xs mt-1">in the actual exam, based on your mock performance</p>
            </div>

            <div className="sm:ml-auto flex flex-col items-center gap-2">
              {/* Confidence badge */}
              <div className="bg-white/15 border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
                <p className="text-[9px] text-white/60 font-bold uppercase tracking-widest mb-0.5">Confidence</p>
                <p className="text-xl font-extrabold text-white">{confidenceLabel}</p>
              </div>
              <div className="text-[10px] text-violet-200 font-medium">
                🗓️ {timeMinLeft > 0 ? `${timeMinLeft}m saved` : 'Full time used'}
              </div>
            </div>
          </div>

          {/* Score range bar */}
          <div className="relative mt-4 pt-2">
            <div className="h-2 bg-white/20 rounded-full overflow-visible relative">
              <div
                className="absolute inset-y-0 rounded-full bg-white/60"
                style={{
                  left: `${Math.round((predictedLow / sumMaxScore) * 100)}%`,
                  width: `${Math.round(((predictedHigh - predictedLow) / sumMaxScore) * 100)}%`,
                }}
              />
              {/* Your score dot */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-yellow-400 shadow"
                style={{ left: `${Math.round((totalScore / sumMaxScore) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-violet-200/60 mt-1.5 px-0.5">
              <span>0</span><span>Your score: {totalScore}</span><span>{sumMaxScore}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Signal analysis */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Performance Signals</p>
            {[
              { Icon: TrendingUp,    label: 'Mock test trend (last 5)',              value: trendLabel,       cls: trendColor,       bg: trendPerTest >= 0 ? 'bg-green-50' : 'bg-red-50' },
              { Icon: Target,        label: 'Consistency across sections',           value: consistencyLabel, cls: consistencyColor, bg: cv < 0.08 ? 'bg-green-50' : cv < 0.15 ? 'bg-amber-50' : 'bg-red-50' },
              { Icon: AlertTriangle, label: `"${worstSection?.sectionName?.split(' ')[0] ?? 'QA'}" accuracy risk`, value: qaRiskLabel, cls: qaRiskColor, bg: qaRiskPts === 0 ? 'bg-green-50' : 'bg-amber-50' },
              { Icon: Clock,         label: 'Time management',                       value: timeLabel,        cls: timeColor,        bg: timePctUsed > 95 ? 'bg-orange-50' : 'bg-green-50' },
            ].map(({ Icon, label, value, cls, bg }) => (
              <div key={label} className={`flex items-center justify-between rounded-xl px-3 py-2.5 border border-transparent ${bg}`}>
                <div className="flex items-center gap-2 text-xs text-gray-600 min-w-0">
                  <Icon className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                  <span className="truncate">{label}</span>
                </div>
                <span className={`text-xs font-extrabold flex-shrink-0 ml-2 ${cls}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Gauge + section readiness */}
          <div className="space-y-4">
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Exam Readiness Gauge</p>
              {(() => {
                const cx = 110, cy = 115, R = 80, strokeW = 14;
                const needleAngle = Math.PI - (readinessPct / 100) * Math.PI;
                const nx = cx + (R - strokeW / 2 - 6) * Math.cos(needleAngle);
                const ny = cy - (R - strokeW / 2 - 6) * Math.sin(needleAngle);
                const arc = (pct1: number, pct2: number) =>
                  `M ${cx + R * Math.cos(Math.PI - pct1 * Math.PI)} ${cy - R * Math.sin(Math.PI - pct1 * Math.PI)} A ${R} ${R} 0 0 1 ${cx + R * Math.cos(Math.PI - pct2 * Math.PI)} ${cy - R * Math.sin(Math.PI - pct2 * Math.PI)}`;
                const statusLabel = readinessPct >= 85 ? 'Excellent' : readinessPct >= 65 ? 'Good' : readinessPct >= 40 ? 'Average' : 'Needs Work';
                const statusColor = readinessPct >= 85 ? '#16a34a' : readinessPct >= 65 ? '#2563eb' : readinessPct >= 40 ? '#d97706' : '#dc2626';
                const ticks = Array.from({ length: 21 }, (_, i) => i / 20);
                return (
                  <div className="flex flex-col items-center">
                    <svg width="220" height="135" viewBox="0 0 220 135" style={{ overflow: 'visible' }}>
                      <path d={arc(0, 1)} fill="none" stroke="#f1f5f9" strokeWidth={strokeW} strokeLinecap="butt" />
                      <path d={arc(0, 0.30)} fill="none" stroke="#dc2626" strokeWidth={strokeW} strokeLinecap="butt" opacity="0.85" />
                      <path d={arc(0.30, 0.55)} fill="none" stroke="#f59e0b" strokeWidth={strokeW} strokeLinecap="butt" opacity="0.85" />
                      <path d={arc(0.55, 0.78)} fill="none" stroke="#84cc16" strokeWidth={strokeW} strokeLinecap="butt" opacity="0.85" />
                      <path d={arc(0.78, 1.00)} fill="none" stroke="#16a34a" strokeWidth={strokeW} strokeLinecap="butt" opacity="0.85" />
                      {ticks.map((t, i) => {
                        const a = Math.PI - t * Math.PI;
                        const isMajor = i % 5 === 0;
                        const r1 = R + strokeW / 2 + 2;
                        const r2 = r1 + (isMajor ? 7 : 4);
                        return (
                          <line key={i}
                            x1={cx + r1 * Math.cos(a)} y1={cy - r1 * Math.sin(a)}
                            x2={cx + r2 * Math.cos(a)} y2={cy - r2 * Math.sin(a)}
                            stroke={isMajor ? '#64748b' : '#94a3b8'} strokeWidth={isMajor ? 2 : 1} strokeLinecap="round" />
                        );
                      })}
                      <text x={cx} y={cy - 34} textAnchor="middle" fontSize="13" fontWeight="700" fill={statusColor}>{statusLabel}</text>
                      <text x={cx} y={cy - 14} textAnchor="middle" fontSize="26" fontWeight="800" fill={statusColor}>{readinessPct}</text>
                      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#1a3c6e" strokeWidth="3" strokeLinecap="round" />
                      <circle cx={cx} cy={cy} r="7" fill="#1a3c6e" />
                      <circle cx={cx} cy={cy} r="3.5" fill="#3b82f6" />
                      <text x={cx - R - 2} y={cy + 16} textAnchor="middle" fontSize="9" fill="#94a3b8">Low</text>
                      <text x={cx + R + 2} y={cy + 16} textAnchor="middle" fontSize="9" fill="#94a3b8">100</text>
                    </svg>
                    <p className="text-xs text-gray-400 -mt-2 font-medium">Readiness for real exam</p>
                  </div>
                );
              })()}
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 space-y-2.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Readiness by Section</p>
              {sectionReadiness.map(({ name, pct, color }) => (
                <div key={name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">{name}</span>
                    <span className="font-bold text-gray-700">{pct}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
};
