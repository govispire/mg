
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Target, CheckCircle, XCircle, Clock, Users, Trophy, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { TestAnalysisData } from '@/data/testAnalysisData';
import { useIsMobile } from '@/hooks/use-mobile';

interface OverallAnalysisTabProps {
  analysisData: TestAnalysisData;
}

export const OverallAnalysisTab: React.FC<OverallAnalysisTabProps> = ({ analysisData }) => {
  const isMobile = useIsMobile();
  const [journeyFilter, setJourneyFilter] = useState<'all' | 'correct' | 'wrong' | 'skipped'>('all');

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

  // ── Slider state (initialized after totals) ──────────────────
  const [rankSliderMarks, setRankSliderMarks] = useState<number>(() => totalScore);
  const [percentileSliderMarks, setPercentileSliderMarks] = useState<number>(0);

  // ── Quick info cards ─────────────────────────────────────────
  const quickInfoCards = [
    { title: 'Total Attempted', value: totalAttempted, icon: Target, color: 'blue' },
    { title: 'Correct', value: totalCorrect, icon: CheckCircle, color: 'green' },
    { title: 'Wrong', value: totalWrong, icon: XCircle, color: 'red' },
    { title: 'Skipped', value: analysisData.sectionWiseData.reduce((s, sec) => s + sec.skipped + sec.unseen, 0), icon: Clock, color: 'yellow' },
    { title: 'Avg Score', value: analysisData.comparisonData.averageScore, icon: Users, color: 'purple' },
    { title: 'Topper Score', value: analysisData.comparisonData.topperScore, icon: Trophy, color: 'orange' },
  ];

  const getColorClasses = (color: string) => {
    const map: Record<string, string> = {
      blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600',
      green: 'from-green-50 to-green-100 border-green-200 text-green-600',
      red: 'from-red-50 to-red-100 border-red-200 text-red-600',
      yellow: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-600',
      purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
      orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-600',
    };
    return map[color] ?? map.blue;
  };

  // ── Performance chart data ───────────────────────────────────
  const performanceData = analysisData.sectionWiseData.map(sec => ({
    section: sec.sectionName.length > 12 ? sec.sectionName.split(' ')[0] : sec.sectionName,
    yourScore: sec.score,
    topperScore: Math.round(sec.maxScore * 0.85),
    maxScore: sec.maxScore,
  }));

  // ── Mobile section cards ─────────────────────────────────────
  const MobileSectionCards = () => (
    <div className="space-y-3">
      {analysisData.sectionWiseData.map(section => (
        <Card key={section.sectionName} className="p-3 border shadow-sm">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-sm leading-tight flex-1 pr-2">{section.sectionName}</h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">#{section.rank}</span>
                <span className="text-xs font-medium text-blue-600">{section.percentile}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 bg-gray-50 rounded px-3">
              <div className="text-center"><p className="text-xs text-gray-500">Score</p><p className="font-bold text-sm">{section.score}/{section.maxScore}</p></div>
              <div className="text-center"><p className="text-xs text-gray-500">Accuracy</p><p className="font-bold text-sm text-green-600">{section.accuracy}%</p></div>
              <div className="text-center"><p className="text-xs text-gray-500">Time</p><p className="font-bold text-sm">{section.timeSpent}m</p></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-50 rounded p-2"><p className="text-xs text-green-600 font-medium">Correct</p><p className="font-bold text-green-700">{section.correct}</p></div>
              <div className="bg-red-50 rounded p-2"><p className="text-xs text-red-600 font-medium">Wrong</p><p className="font-bold text-red-700">{section.wrong}</p></div>
              <div className="bg-gray-50 rounded p-2"><p className="text-xs text-gray-600 font-medium">Skipped</p><p className="font-bold text-gray-700">{section.skipped}</p></div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Performance</span>
                <span className="text-xs font-semibold">{section.accuracy}%</span>
              </div>
              <Progress value={section.accuracy} className="h-2" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // ── Section table ────────────────────────────────────────────
  const ResponsiveTable = () => (
    <div className="w-full">
      {isMobile ? <MobileSectionCards /> : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#003366]">
              <TableRow>
                {['Section', 'Attempted', 'Correct / Wrong', 'Skipped', 'Score', 'Rank', 'Percentile', 'Accuracy', 'Time'].map(h => (
                  <TableHead key={h} className="text-white text-base px-4 py-3 min-w-[80px]">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysisData.sectionWiseData.map((section, index) => (
                <TableRow key={section.sectionName} className={index % 2 === 0 ? 'bg-white' : 'bg-[#DCEBFA]'}>
                  <TableCell className="font-medium text-sm px-4 py-3">{section.sectionName}</TableCell>
                  <TableCell className="text-sm px-4 py-3">{section.attempted}</TableCell>
                  <TableCell className="text-sm px-4 py-3">
                    <span className="text-green-600 font-semibold">{section.correct}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-red-600 font-semibold">{section.wrong}</span>
                  </TableCell>
                  <TableCell className="text-sm px-4 py-3">{section.skipped}</TableCell>
                  <TableCell className="text-sm px-4 py-3 font-medium">{section.score}/{section.maxScore}</TableCell>
                  <TableCell className="text-sm px-4 py-3">{section.rank}</TableCell>
                  <TableCell className="text-sm px-4 py-3">{section.percentile}%</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={section.accuracy} className="w-20 h-2.5" />
                      <span className="text-sm font-medium">{section.accuracy}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm px-4 py-3">{section.timeSpent}m</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-[#003366]/10 border-t-2 border-[#003366]">
                <TableCell className="font-bold text-sm px-4 py-3 text-[#003366]">Overall</TableCell>
                <TableCell className="text-sm px-4 py-3 font-bold text-[#003366]">{totalAttempted}</TableCell>
                <TableCell className="text-sm px-4 py-3">
                  <span className="text-green-600 font-bold">{totalCorrect}</span>
                  <span className="text-gray-400 mx-1">/</span>
                  <span className="text-red-600 font-bold">{totalWrong}</span>
                </TableCell>
                <TableCell className="text-sm px-4 py-3 font-bold text-[#003366]">{totalSkipped}</TableCell>
                <TableCell className="text-sm px-4 py-3 font-bold text-[#003366]">{totalScore}/{sumMaxScore}</TableCell>
                <TableCell className="text-sm px-4 py-3 font-bold text-[#003366]">{analysisData.rank}</TableCell>
                <TableCell className="text-sm px-4 py-3 font-bold text-[#003366]">{analysisData.percentile}%</TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Progress value={overallAccuracy} className="w-20 h-2.5" />
                    <span className="text-sm font-bold text-[#003366]">{overallAccuracy}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm px-4 py-3 font-bold text-[#003366]">{totalTime}m</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );

  // ── Derived values — all dynamic ────────────────────────────

  // Cut-off: use actual section cutOff field if provided, else 70% of max
  const sectionCutoffs = analysisData.sectionWiseData
    .filter(s => s.cutOff !== undefined && s.cutOff! > 0)
    .reduce((sum, s) => sum + s.cutOff!, 0);
  const estimatedCutoff = sectionCutoffs > 0
    ? sectionCutoffs
    : Math.round(sumMaxScore * 0.70);
  const aboveCutoff = totalScore - estimatedCutoff;
  const cutoffPct = Math.round((estimatedCutoff / sumMaxScore) * 100);
  const yourScorePct = Math.round((totalScore / sumMaxScore) * 100);
  const beatStudents = aboveCutoff > 0
    ? Math.round(analysisData.totalStudents * (1 - analysisData.rank / analysisData.totalStudents))
    : 0;

  // Readiness gauge — weighted from accuracy + score ratio
  const readinessPct = Math.min(100, Math.round(
    overallAccuracy * 0.45 +
    (totalScore / sumMaxScore) * 45 +
    (1 - analysisData.rank / Math.max(analysisData.totalStudents, 1)) * 10
  ));

  // Section readiness bars — based on actual score vs max + accuracy bonus
  const sectionReadiness = analysisData.sectionWiseData.map(s => ({
    name: s.sectionName.split(' ')[0],
    pct: Math.min(100, Math.round((s.score / s.maxScore) * 100 + (s.accuracy - 70) * 0.3)),
    color: s.accuracy >= 85 ? '#22c55e' : s.accuracy >= 65 ? '#3b82f6' : '#f59e0b',
  }));

  // ── AI prediction insights — computed from real data ─────────
  // 1. Mock test trend: slope of last-5 performance history scores
  const history = analysisData.performanceHistory ?? [];
  const last5 = history.slice(-5);
  const trendPerTest = last5.length >= 2
    ? Math.round((last5[last5.length - 1].score - last5[0].score) / (last5.length - 1))
    : 0;
  const trendLabel = trendPerTest > 0 ? `+${trendPerTest}/mock` : trendPerTest < 0 ? `${trendPerTest}/mock` : 'Stable';
  const trendColor = trendPerTest > 0 ? 'text-green-600' : trendPerTest < 0 ? 'text-red-500' : 'text-gray-500';

  // 2. Consistency: coefficient of variation of section scores (lower CV = more consistent)
  const secScorePcts = analysisData.sectionWiseData.map(s => (s.score / s.maxScore) * 100);
  const secMean = secScorePcts.reduce((a, b) => a + b, 0) / (secScorePcts.length || 1);
  const secStdDev = Math.sqrt(secScorePcts.reduce((acc, v) => acc + (v - secMean) ** 2, 0) / (secScorePcts.length || 1));
  const cv = secMean > 0 ? secStdDev / secMean : 1;
  const consistencyLabel = cv < 0.08 ? 'High' : cv < 0.15 ? 'Medium' : 'Low';
  const consistencyColor = cv < 0.08 ? 'text-green-600' : cv < 0.15 ? 'text-amber-500' : 'text-red-500';

  // 3. QA / worst section risk: penalty per wrong (0.25) x wrong count in weakest section
  const worstSection = [...analysisData.sectionWiseData].sort((a, b) => a.accuracy - b.accuracy)[0];
  const qaRiskPts = worstSection ? -(worstSection.wrong * 0.25) : 0;
  const qaRiskLabel = qaRiskPts === 0 ? 'None' : `${qaRiskPts.toFixed(2)} pts`;
  const qaRiskColor = qaRiskPts === 0 ? 'text-green-600' : qaRiskPts > -2 ? 'text-amber-500' : 'text-red-500';

  // 4. Time management: % of allotted time used
  const timePctUsed = analysisData.maxTime > 0 ? Math.round((analysisData.timeTaken / analysisData.maxTime) * 100) : 100;
  const timeLabel = timePctUsed > 95 ? 'Needs work' : timePctUsed > 80 ? 'Good' : 'Excellent';
  const timeColor = timePctUsed > 95 ? 'text-orange-500' : timePctUsed > 80 ? 'text-green-600' : 'text-green-700';
  const timeMinLeft = analysisData.maxTime - analysisData.timeTaken;

  // Predicted score: current score ± history-inferred margin
  const historyVariance = last5.length >= 2
    ? Math.abs(last5[last5.length - 1].score - last5[0].score) / 2
    : 5;
  const margin = Math.max(3, Math.min(8, Math.round(historyVariance)));
  const predictedLow = Math.max(0, totalScore - margin);
  const predictedHigh = Math.min(sumMaxScore, totalScore + Math.round(margin * 0.8));

  // Confidence label from rank percentile
  const confidenceLabel = analysisData.percentile >= 90 ? 'Very High'
    : analysisData.percentile >= 75 ? 'High'
      : analysisData.percentile >= 50 ? 'Medium' : 'Low';

  // ── Question journey ─────────────────────────────────────────
  const questions = analysisData.questionWiseData;
  const journeyQuestions = journeyFilter === 'all' ? questions
    : questions.filter(q =>
      journeyFilter === 'correct' ? q.status === 'correct'
        : journeyFilter === 'wrong' ? q.status === 'wrong'
          : q.status === 'unattempted' || q.status === 'marked'
    );

  // ── Donut SVG math ───────────────────────────────────────────
  const donutTotal = totalCorrect + totalWrong + totalSkipped || 1;
  const C = 2 * Math.PI * 56;
  const correctDash = (totalCorrect / donutTotal) * C;
  const wrongDash = (totalWrong / donutTotal) * C;

  // ── Leaderboard — scores spaced dynamically around topperScore ──
  const topScore = analysisData.comparisonData.topperScore;
  const scoreGap = Math.max(1, Math.round((topScore - totalScore) / Math.max(analysisData.rank, 1)));
  // Strongest section name per simulated peer (cycle through actual sections)
  const secNames = analysisData.sectionWiseData.map(s => s.sectionName.split(' ')[0]);
  const peerSubs = [
    `${secNames[0] ?? 'Reasoning'} ${analysisData.sectionWiseData[0]?.correct ?? '--'}/${analysisData.sectionWiseData[0]?.maxScore ?? '--'} · Acc ${analysisData.sectionWiseData[0]?.accuracy ?? 0}%`,
    `${secNames[1] ?? 'English'} ${analysisData.sectionWiseData[1]?.correct ?? '--'}/${analysisData.sectionWiseData[1]?.maxScore ?? '--'} · Acc ${analysisData.sectionWiseData[1]?.accuracy ?? 0}%`,
    `${secNames[2] ?? 'Quant'} ${analysisData.sectionWiseData[2]?.correct ?? '--'}/${analysisData.sectionWiseData[2]?.maxScore ?? '--'} · Acc ${analysisData.sectionWiseData[2]?.accuracy ?? 0}%`,
    `All sections ${Math.round(overallAccuracy * 0.9)}%+ · Time: ${Math.floor(analysisData.timeTaken / 60)}h ${analysisData.timeTaken % 60}m`,
    `Fast finisher · Completed in ${Math.floor((analysisData.timeTaken - 5) / 60)}h ${(analysisData.timeTaken - 5) % 60}m`,
  ];
  const leaderboard = [
    { rank: 1, initials: 'PS', name: 'Priya S.', sub: peerSubs[0], score: topScore, bg: '#fde68a', fg: '#92400e' },
    { rank: 2, initials: 'AM', name: 'Arjun M.', sub: peerSubs[1], score: topScore - scoreGap, bg: '#bfdbfe', fg: '#1e40af' },
    { rank: 3, initials: 'NR', name: 'Neha R.', sub: peerSubs[2], score: topScore - scoreGap * 2, bg: '#ddd6fe', fg: '#5b21b6' },
    { rank: 4, initials: 'KB', name: 'Karan B.', sub: peerSubs[3], score: topScore - scoreGap * 3, bg: '#d1fae5', fg: '#065f46' },
    { rank: 5, initials: 'DT', name: 'Divya T.', sub: peerSubs[4], score: topScore - scoreGap * 4, bg: '#fed7aa', fg: '#9a3412' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-1">


      {/* ── 4 Primary Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Score', value: `${totalScore}/${sumMaxScore}`, icon: '↗', sub: 'your total score', textColor: 'text-blue-700' },
          { label: 'Rank', value: `${analysisData.rank}/${analysisData.totalStudents.toLocaleString()}`, icon: '👤', sub: 'among all students', textColor: 'text-blue-700' },
          { label: 'Percentile', value: `${analysisData.percentile}%`, icon: '%', sub: `top ${100 - analysisData.percentile}% nationally`, textColor: 'text-blue-700' },
          { label: 'Accuracy', value: `${overallAccuracy}%`, icon: '✓', sub: `${totalCorrect} correct · ${totalWrong} wrong`, textColor: 'text-blue-700' },
        ].map(({ label, value, icon, sub, textColor }) => (
          <div key={label} className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5 uppercase tracking-wide">{label}</p>
              <p className={`text-lg sm:text-2xl font-extrabold leading-none ${textColor}`}>{value}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 truncate">{sub}</p>
            </div>
            <span className="text-xl sm:text-2xl text-blue-200 font-black flex-shrink-0 select-none">{icon}</span>
          </div>
        ))}
      </div>

      {/* ── 6 Colored Mini-Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {[
          { label: 'Total Attempted', value: totalAttempted, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', icon: '🎯' },
          { label: 'Correct', value: totalCorrect, bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', icon: '✅' },
          { label: 'Wrong', value: totalWrong, bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', icon: '❌' },
          { label: 'Skipped', value: analysisData.sectionWiseData.reduce((s, sec) => s + sec.skipped + sec.unseen, 0), bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-600', icon: '⏱' },
          { label: 'Avg Score', value: analysisData.comparisonData.averageScore, bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', icon: '👥' },
          { label: 'Topper Score', value: analysisData.comparisonData.topperScore, bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-600', icon: '🏆' },
        ].map(({ label, value, bg, border, text, icon }) => (
          <div key={label} className={`${bg} border ${border} rounded-xl px-3 py-3 flex items-center justify-between gap-2`}>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium mb-1 leading-tight">{label}</p>
              <p className={`text-xl sm:text-2xl font-extrabold leading-none ${text}`}>{value}</p>
            </div>
            <span className="text-xl flex-shrink-0">{icon}</span>
          </div>
        ))}
      </div>


      {/* Section-wise Analysis */}
      <Card className="p-3 sm:p-4 lg:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 lg:mb-6">Section-wise Analysis</h3>
        <ResponsiveTable />
      </Card>

      {/* ── Attempt Analysis (30%) + Where You Stand (70%) ── */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Attempt Analysis — 30% */}
        <Card className="lg:w-[30%] flex-shrink-0 p-3 shadow-sm">
          <h3 className="text-sm font-semibold mb-2">Attempt Analysis</h3>
          <div className="flex items-center gap-3">
            {/* Compact donut */}
            <div className="relative flex-shrink-0">
              <svg width="96" height="96" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r="56" fill="none" stroke="#e5e7eb" strokeWidth="16" />
                <circle cx="75" cy="75" r="56" fill="none" stroke="#22c55e" strokeWidth="16"
                  strokeDasharray={`${correctDash} ${C - correctDash}`}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '75px 75px' }} />
                <circle cx="75" cy="75" r="56" fill="none" stroke="#ef4444" strokeWidth="16"
                  strokeDasharray={`${wrongDash} ${C - wrongDash}`}
                  strokeDashoffset={-(correctDash)}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '75px 75px' }} />
                <text x="75" y="70" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#16a34a">{totalAttempted}</text>
                <text x="75" y="88" textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600" letterSpacing="0.5">ATTEMPTED</text>
              </svg>
            </div>
            {/* Stats */}
            <div className="flex-1 space-y-1.5">
              {[
                { dot: '#22c55e', label: 'Correct', value: String(totalCorrect), cls: 'text-green-600' },
                { dot: '#ef4444', label: 'Wrong', value: String(totalWrong), cls: 'text-red-500' },
                { dot: '#9ca3af', label: 'Skipped', value: String(totalSkipped), cls: 'text-gray-600' },
                { dot: '#f59e0b', label: 'Neg. Marks', value: `-${totalNegative.toFixed(2)}`, cls: 'text-amber-600' },
              ].map(({ dot, label, value, cls }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                  <span className={`text-xs font-bold ${cls}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Where You Stand — 70% */}
        <Card className="lg:w-[70%] p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold">Where You Stand</h3>
            <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-medium">Cut-off Context</span>
          </div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-[10px] text-gray-500 mb-0.5">Your score vs estimated cut-off</p>
              <p className="text-xl font-extrabold text-green-700 leading-tight">
                {totalScore} <span className="text-xs font-normal text-gray-500">vs ~{estimatedCutoff} cut-off</span>
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                You are{' '}
                <span className={`font-semibold ${aboveCutoff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {aboveCutoff >= 0 ? `+${aboveCutoff}` : aboveCutoff} marks
                </span>{' '}
                {aboveCutoff >= 0 ? 'above' : 'below'} the General category cut-off
              </p>
            </div>
            {aboveCutoff > 0 && (
              <div className="text-right flex-shrink-0">
                <p className="text-[9px] text-gray-400 uppercase tracking-wide">Beat by</p>
                <p className="text-2xl font-extrabold text-green-700 leading-tight">{beatStudents.toLocaleString()}</p>
                <p className="text-[9px] text-gray-500">of {analysisData.totalStudents.toLocaleString()} students</p>
              </div>
            )}
          </div>
          {/* Score bar */}
          <div className="relative mt-3">
            <div className="w-full h-5 rounded-full overflow-visible bg-gray-100 relative">
              <div className="h-full rounded-full bg-gradient-to-r from-green-300 to-green-600 transition-all duration-700" style={{ width: `${yourScorePct}%` }} />
              <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500" style={{ left: `${cutoffPct}%` }}>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  ~{estimatedCutoff} Cut-off
                </div>
              </div>
              <div className="absolute right-2 top-0 bottom-0 flex items-center">
                <span className="text-xs font-bold text-white drop-shadow">{totalScore}</span>
              </div>
            </div>
            <div className="flex justify-between text-[9px] text-gray-400 mt-1 px-0.5">
              <span>0</span>
              <span>{Math.round(sumMaxScore * 0.25)}</span>
              <span>{Math.round(sumMaxScore * 0.50)}</span>
              <span>{Math.round(sumMaxScore * 0.75)}</span>
              <span>{sumMaxScore}</span>
            </div>
          </div>
        </Card>

      </div>


      {/* ── Rank Predictor ── */}
      {(() => {
        const minMark = Math.round(sumMaxScore * -0.10);
        const maxMark = sumMaxScore;
        const pct = (rankSliderMarks - minMark) / (maxMark - minMark);
        const rawRank = Math.round(analysisData.totalStudents * Math.pow(Math.max(0, 1 - pct), 1.8));
        const predictedRank = Math.max(1, Math.min(analysisData.totalStudents, rawRank));
        const thumbPct = Math.round(((rankSliderMarks - minMark) / (maxMark - minMark)) * 100);
        // Actual student rank thumb position
        const actualThumbPct = Math.round(((totalScore - minMark) / (maxMark - minMark)) * 100);
        const isCustom = rankSliderMarks !== totalScore;
        return (
          <Card className="p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <h3 className="text-base sm:text-lg font-semibold">Rank Predictor</h3>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full px-2 py-0.5 font-medium">Interactive</span>
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 sm:p-6">
              {/* Header: Student avatar + rank info + score chips */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6">
                {/* Student avatar + rank */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {/* Student icon */}
                    <div className="w-14 h-14 rounded-full bg-indigo-100 border-4 border-indigo-400 flex items-center justify-center shadow-sm">
                      <svg className="w-7 h-7 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                      </svg>
                    </div>
                    {/* Rank badge */}
                    <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[9px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center border border-white">
                      #{analysisData.rank <= 99 ? analysisData.rank : '99+'}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">
                      {isCustom ? `Predicted at ${rankSliderMarks} marks` : 'Your Rank'}
                    </p>
                    <p className="text-3xl font-extrabold text-indigo-700 leading-none">
                      #{isCustom ? predictedRank.toLocaleString() : analysisData.rank.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">out of {analysisData.totalStudents.toLocaleString()} students</p>
                  </div>
                </div>

                {/* Score chips */}
                <div className="flex gap-2 sm:ml-auto">
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-center min-w-[70px]">
                    <p className="text-[9px] text-gray-400 font-medium uppercase">Your Score</p>
                    <p className="text-base font-extrabold text-green-700">{totalScore}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-center min-w-[70px]">
                    <p className="text-[9px] text-gray-400 font-medium uppercase">Topper</p>
                    <p className="text-base font-extrabold text-amber-600">{analysisData.comparisonData.topperScore}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-center min-w-[70px]">
                    <p className="text-[9px] text-gray-400 font-medium uppercase">Avg Score</p>
                    <p className="text-base font-extrabold text-blue-600">{analysisData.comparisonData.averageScore}</p>
                  </div>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-3">
                <div className="relative pt-10 pb-6">
                  {/* Tooltip above dragging thumb */}
                  <div
                    className="absolute -top-1 flex flex-col items-center pointer-events-none"
                    style={{ left: `calc(${thumbPct}% - 36px)`, zIndex: 10 }}
                  >
                    <div className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap">
                      Rank : {isCustom ? predictedRank.toLocaleString() : analysisData.rank.toLocaleString()}
                    </div>
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-indigo-600" />
                  </div>

                  {/* Track */}
                  <div className="relative h-1.5 bg-gray-200 rounded-full cursor-pointer">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-indigo-500" style={{ width: `${thumbPct}%` }} />
                    <input
                      type="range"
                      min={minMark}
                      max={maxMark}
                      step={1}
                      value={rankSliderMarks}
                      onChange={e => setRankSliderMarks(Number(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                      style={{ zIndex: 20 }}
                    />
                    {/* Drag thumb */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-4 border-indigo-500 shadow-md pointer-events-none"
                      style={{ left: `${thumbPct}%` }}
                    />
                    {/* Marks tooltip below thumb */}
                    <div
                      className="absolute top-full mt-2 flex flex-col items-center pointer-events-none"
                      style={{ left: `calc(${thumbPct}% - 30px)` }}
                    >
                      <div className="bg-white border border-indigo-200 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm whitespace-nowrap">
                        Marks : {rankSliderMarks}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scale labels */}
                <div className="flex justify-between text-[10px] text-gray-400 px-0.5">
                  {Array.from({ length: 6 }, (_, i) => {
                    const v = Math.round(minMark + ((maxMark - minMark) / 5) * i);
                    return <span key={i}>{v}</span>;
                  })}
                </div>
                <p className="text-center text-[10px] text-gray-400">← Drag to predict rank at different marks →</p>
              </div>
            </div>
          </Card>
        );
      })()}

      {/* ── Score Percentile Distribution ── */}
      {(() => {
        const maxMark = sumMaxScore;
        const avgScore = analysisData.comparisonData.averageScore;
        const spread = sumMaxScore * 0.18;
        const rawPercentile = 100 / (1 + Math.exp(-(percentileSliderMarks - avgScore) / spread));
        const predictedPercentile = Math.min(99.9, Math.max(0.1, Math.round(rawPercentile * 10) / 10));
        // Student's actual percentile (initialised from real data)
        const actualPercentile = analysisData.percentile;
        const thumbPct = Math.round((percentileSliderMarks / maxMark) * 100);
        const perColor = predictedPercentile >= 90 ? '#16a34a' : predictedPercentile >= 75 ? '#2563eb' : predictedPercentile >= 50 ? '#d97706' : '#dc2626';
        const perLabel = predictedPercentile >= 90 ? 'Excellent' : predictedPercentile >= 75 ? 'Good' : predictedPercentile >= 50 ? 'Average' : 'Below Avg';
        const isCustom = percentileSliderMarks !== totalScore;
        return (
          <Card className="p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <h3 className="text-base sm:text-lg font-semibold">Score Percentile Distribution</h3>
              <span className="text-[10px] bg-sky-100 text-sky-700 border border-sky-200 rounded-full px-2 py-0.5 font-medium">Percentile Predictor</span>
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
              {/* Main: donut + big number */}
              <div className="flex items-center gap-5">
                {/* Donut ring */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e5e7eb" strokeWidth="3.8" />
                    <circle
                      cx="18" cy="18" r="15.9155" fill="none"
                      stroke={perColor}
                      strokeWidth="3.8"
                      strokeDasharray={`${predictedPercentile} ${100 - predictedPercentile}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.3s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-extrabold leading-none" style={{ color: perColor }}>
                      {predictedPercentile.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Percentile number + label */}
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">
                    {isCustom ? `At ${percentileSliderMarks} marks` : 'Your Percentile'}
                  </p>
                  <p className="text-4xl font-extrabold leading-none" style={{ color: perColor }}>
                    {isCustom ? predictedPercentile.toFixed(1) : actualPercentile}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">Percentile</p>
                  <span
                    className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1"
                    style={{ background: perColor + '18', color: perColor }}
                  >
                    {perLabel}
                  </span>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <div className="relative pt-9 pb-2">
                  {/* Tooltip above thumb */}
                  <div
                    className="absolute top-0 flex flex-col items-center pointer-events-none"
                    style={{ left: `calc(${thumbPct}% - 38px)`, zIndex: 10 }}
                  >
                    <div
                      className="text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap"
                      style={{ background: perColor }}
                    >
                      Score: {percentileSliderMarks} &nbsp;·&nbsp; {predictedPercentile.toFixed(1)}%ile
                    </div>
                    <div
                      className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent"
                      style={{ borderTopColor: perColor }}
                    />
                  </div>

                  {/* Track */}
                  <div className="relative h-1.5 bg-gray-200 rounded-full cursor-pointer">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-75"
                      style={{
                        width: `${thumbPct}%`,
                        background: 'linear-gradient(90deg, #dc2626, #d97706 40%, #22c55e 80%, #16a34a)',
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxMark}
                      step={1}
                      value={percentileSliderMarks}
                      onChange={e => setPercentileSliderMarks(Number(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                      style={{ zIndex: 20 }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-4 shadow-md pointer-events-none"
                      style={{ left: `${thumbPct}%`, borderColor: perColor }}
                    />
                  </div>
                </div>

                {/* Scale */}
                <div className="flex justify-between text-[10px] text-gray-400 px-0.5">
                  {Array.from({ length: 6 }, (_, i) => (
                    <span key={i}>{Math.round((maxMark / 5) * i)}</span>
                  ))}
                </div>
                <p className="text-center text-[10px] text-gray-400">Slide the bar to check percentile at different scores</p>
              </div>
            </div>
          </Card>
        );
      })()}


      {/* ── Predicted Real Exam Score ── */}
      <Card className="p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base sm:text-lg font-semibold">Predicted Real Exam Score</h3>
          <span className="text-[10px] bg-violet-100 text-violet-700 border border-violet-200 rounded-full px-2 py-0.5 font-medium flex items-center gap-1">
            <Brain className="h-2.5 w-2.5" /> AI Prediction
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Left: score range */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Predicted Score Range</p>
            <p className="text-4xl font-extrabold text-green-800">{predictedLow}–{predictedHigh}</p>
            <p className="text-xs text-green-700">out of {sumMaxScore} in the real exam</p>
            <div className="inline-flex items-center gap-1.5 bg-white border border-green-200 rounded-full px-3 py-1 text-xs text-green-700 font-medium">
              🗓️ {timeMinLeft > 0 ? `${timeMinLeft}m saved` : 'Full time used'} · {confidenceLabel} Confidence
            </div>
            <div className="space-y-2 pt-1">
              {[
                { Icon: TrendingUp, label: 'Mock test trend (last 5)', value: trendLabel, cls: trendColor },
                { Icon: Target, label: 'Consistency across sections', value: consistencyLabel, cls: consistencyColor },
                { Icon: AlertTriangle, label: `"${worstSection?.sectionName?.split(' ')[0] ?? 'QA'}" accuracy risk`, value: qaRiskLabel, cls: qaRiskColor },
                { Icon: Clock, label: 'Time management', value: timeLabel, cls: timeColor },
              ].map(({ Icon, label, value, cls }) => (
                <div key={label} className="flex items-center justify-between text-xs border-b border-green-100 pb-1.5">
                  <div className="flex items-center gap-1.5 text-gray-600"><Icon className="h-3 w-3" />{label}</div>
                  <span className={`font-bold ${cls}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: gauge + section bars */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Exam Readiness Gauge</p>
              {(() => {
                /* ── Speedometer geometry ── */
                const cx = 110, cy = 115, R = 80, strokeW = 14;
                const startAngle = Math.PI;          // 180° (left)
                const endAngle = 0;                  // 0°   (right)
                const totalArc = Math.PI;            // 180°
                /* needle angle: 180° → 0° as pct goes 0 → 100 */
                const needleAngle = Math.PI - (readinessPct / 100) * Math.PI;
                const nx = cx + (R - strokeW / 2 - 6) * Math.cos(needleAngle);
                const ny = cy - (R - strokeW / 2 - 6) * Math.sin(needleAngle);
                /* arc helper */
                const arc = (pct1: number, pct2: number) => {
                  const a1 = Math.PI - pct1 * Math.PI;
                  const a2 = Math.PI - pct2 * Math.PI;
                  return `M ${cx + R * Math.cos(Math.PI - pct1 * Math.PI)} ${cy - R * Math.sin(Math.PI - pct1 * Math.PI)} A ${R} ${R} 0 0 1 ${cx + R * Math.cos(Math.PI - pct2 * Math.PI)} ${cy - R * Math.sin(Math.PI - pct2 * Math.PI)}`;
                };
                /* status label */
                const statusLabel = readinessPct >= 85 ? 'Excellent' : readinessPct >= 65 ? 'Good' : readinessPct >= 40 ? 'Average' : 'Needs Work';
                const statusColor = readinessPct >= 85 ? '#16a34a' : readinessPct >= 65 ? '#2563eb' : readinessPct >= 40 ? '#d97706' : '#dc2626';
                /* tick marks */
                const ticks = Array.from({ length: 21 }, (_, i) => i / 20);
                return (
                  <div className="flex flex-col items-center">
                    <svg width="220" height="135" viewBox="0 0 220 135" style={{ overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="spGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#dc2626" />
                          <stop offset="30%" stopColor="#f59e0b" />
                          <stop offset="60%" stopColor="#84cc16" />
                          <stop offset="100%" stopColor="#16a34a" />
                        </linearGradient>
                      </defs>

                      {/* background track */}
                      <path d={arc(0, 1)} fill="none" stroke="#f1f5f9" strokeWidth={strokeW} strokeLinecap="butt" />

                      {/* coloured arc segments */}
                      <path d={arc(0, 0.30)} fill="none" stroke="#dc2626" strokeWidth={strokeW} strokeLinecap="butt" opacity="0.85" />
                      <path d={arc(0.30, 0.55)} fill="none" stroke="#f59e0b" strokeWidth={strokeW} strokeLinecap="butt" opacity="0.85" />
                      <path d={arc(0.55, 0.78)} fill="none" stroke="#84cc16" strokeWidth={strokeW} strokeLinecap="butt" opacity="0.85" />
                      <path d={arc(0.78, 1.00)} fill="none" stroke="#16a34a" strokeWidth={strokeW} strokeLinecap="butt" opacity="0.85" />

                      {/* tick marks */}
                      {ticks.map((t, i) => {
                        const a = Math.PI - t * Math.PI;
                        const isMajor = i % 5 === 0;
                        const r1 = R + strokeW / 2 + 2;
                        const r2 = r1 + (isMajor ? 7 : 4);
                        return (
                          <line key={i}
                            x1={cx + r1 * Math.cos(a)} y1={cy - r1 * Math.sin(a)}
                            x2={cx + r2 * Math.cos(a)} y2={cy - r2 * Math.sin(a)}
                            stroke={isMajor ? '#64748b' : '#94a3b8'} strokeWidth={isMajor ? 2 : 1} strokeLinecap="round"
                          />
                        );
                      })}

                      {/* filled progress overlay (subtle glow) */}
                      <path d={arc(0, readinessPct / 100)} fill="none" stroke="url(#spGrad)" strokeWidth={strokeW - 4} strokeLinecap="butt" opacity="0.35" />

                      {/* status label inside arc */}
                      <text x={cx} y={cy - 34} textAnchor="middle" fontSize="13" fontWeight="700" fill={statusColor}>{statusLabel}</text>

                      {/* big value */}
                      <text x={cx} y={cy - 14} textAnchor="middle" fontSize="26" fontWeight="800" fill={statusColor}>{readinessPct}</text>

                      {/* needle */}
                      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#1e3a5f" strokeWidth="3" strokeLinecap="round" />
                      {/* pivot */}
                      <circle cx={cx} cy={cy} r="7" fill="#1e3a5f" />
                      <circle cx={cx} cy={cy} r="3.5" fill="#3b82f6" />

                      {/* axis labels */}
                      <text x={cx - R - 2} y={cy + 16} textAnchor="middle" fontSize="9" fill="#94a3b8">Low</text>
                      <text x={cx + R + 2} y={cy + 16} textAnchor="middle" fontSize="9" fill="#94a3b8">100</text>
                    </svg>
                    <p className="text-xs text-gray-500 -mt-2">Ready for real exam</p>
                  </div>
                );
              })()}
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Readiness by Section</p>
              {sectionReadiness.map(({ name, pct, color }) => (
                <div key={name} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{name}</span>
                    <span className="font-semibold text-gray-700">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Question Journey ── */}
      <Card className="p-4 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="text-base sm:text-lg font-semibold">Question Journey</h3>
            <span className="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 rounded-full px-2 py-0.5">
              All {questions.length} Questions
            </span>
          </div>
          <div className="flex gap-1.5 ml-auto">
            {([
              { key: 'all', label: 'All', color: 'bg-gray-500' },
              { key: 'correct', label: 'Correct', color: 'bg-green-600' },
              { key: 'wrong', label: 'Wrong', color: 'bg-red-500' },
              { key: 'skipped', label: 'Skipped', color: 'bg-gray-400' },
            ] as const).map(({ key, label, color }) => (
              <button key={key} onClick={() => setJourneyFilter(key)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${journeyFilter === key
                  ? `${color} text-white border-transparent`
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="flex gap-4 mb-3">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-600" /><span className="text-[10px] text-gray-600">Correct</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-[10px] text-gray-600">Wrong</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-200 border border-gray-300" /><span className="text-[10px] text-gray-600">Skipped</span></div>
        </div>
        {/* Grid */}
        <div className="flex flex-wrap gap-1.5">
          {journeyQuestions.map(q => {
            const isCorrect = q.status === 'correct';
            const isWrong = q.status === 'wrong';
            return (
              <div key={q.questionId}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold border cursor-default select-none ${isCorrect ? 'bg-green-700 text-green-200 border-green-600'
                  : isWrong ? 'bg-red-600 text-red-200 border-red-500'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}
              >
                {q.questionId}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Beat The Topper + Competitive View ── */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 sm:px-6 pt-4 pb-3 border-b border-gray-100">
          <span className="text-lg">⚔️</span>
          <h3 className="text-base sm:text-lg font-bold">Beat The Topper</h3>
          <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-0.5">
            Competitive View
          </span>
          <span className="ml-auto text-[10px] bg-green-100 text-green-700 border border-green-200 rounded-full px-2 py-0.5 font-semibold">
            Top {100 - analysisData.percentile + 1}%
          </span>
        </div>

        {/* ── VS Panel ── */}
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {/* YOU */}
          <div className="flex-1 bg-green-50 px-5 py-5">
            <p className="text-[10px] font-extrabold text-green-600 tracking-widest mb-2 flex items-center gap-1">
              <span>★</span> YOU
            </p>
            <p className="text-6xl font-extrabold text-green-600 leading-none mb-1">{totalScore}</p>
            <p className="text-xs text-gray-500 mb-4">
              Rank {analysisData.rank} · {analysisData.percentile}th percentile
            </p>
            <div className="space-y-2">
              {analysisData.sectionWiseData.map(s => (
                <div key={s.sectionName} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{s.sectionName}</span>
                  <span className="font-bold text-green-700">{s.correct}/{s.maxScore}</span>
                </div>
              ))}
            </div>
          </div>

          {/* VS divider */}
          <div className="flex items-center justify-center px-4 py-3 sm:py-0 bg-white">
            <span className="text-base font-extrabold text-gray-400 tracking-widest">VS</span>
          </div>

          {/* TOPPER */}
          <div className="flex-1 bg-white px-5 py-5">
            <p className="text-[10px] font-extrabold text-amber-600 tracking-widest mb-2 flex items-center gap-1">
              <span>👑</span> TOPPER
            </p>
            <p className="text-6xl font-extrabold text-amber-500 leading-none mb-1">{topScore}</p>
            <p className="text-xs text-gray-500 mb-4">Rank 1 · 99th percentile</p>
            <div className="space-y-2">
              {analysisData.sectionWiseData.map(s => {
                const topperSec = Math.round(s.maxScore * 0.9);
                const isAhead = topperSec > s.correct;
                return (
                  <div key={s.sectionName} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{s.sectionName}</span>
                    <span className={`font-bold ${isAhead ? 'text-amber-600' : 'text-green-600'}`}>
                      {topperSec}/{s.maxScore}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>


        {/* ── Podium ── */}
        <div className="px-4 sm:px-6 pt-5 pb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Top Performers</p>
          <div className="flex items-end justify-center gap-3 px-2 mb-4">
            {/* Rank 2 */}
            {leaderboard[1] && (
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-extrabold border-4 border-white shadow-lg"
                  style={{ background: leaderboard[1].bg, color: leaderboard[1].fg }}>
                  {leaderboard[1].initials}
                </div>
                <p className="text-[10px] font-semibold text-gray-700 truncate max-w-[72px] text-center">{leaderboard[1].name}</p>
                <p className="text-xs font-extrabold text-gray-700">{leaderboard[1].score}</p>
                <div className="w-full rounded-t-xl flex items-start justify-center pt-2 shadow-inner"
                  style={{ height: '60px', background: 'linear-gradient(180deg,#d4d4d4,#a3a3a3)' }}>
                  <span className="text-white text-xl font-extrabold">2</span>
                </div>
              </div>
            )}
            {/* Rank 1 */}
            {leaderboard[0] && (
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="text-2xl leading-none animate-bounce">👑</div>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-base font-extrabold border-4 border-amber-400 shadow-xl ring-2 ring-amber-200"
                  style={{ background: leaderboard[0].bg, color: leaderboard[0].fg }}>
                  {leaderboard[0].initials}
                </div>
                <p className="text-[10px] font-semibold text-gray-700 truncate max-w-[80px] text-center">{leaderboard[0].name}</p>
                <p className="text-sm font-extrabold text-amber-600">{leaderboard[0].score}</p>
                <div className="w-full rounded-t-xl flex items-start justify-center pt-2 shadow-inner"
                  style={{ height: '84px', background: 'linear-gradient(180deg,#fbbf24,#d97706)' }}>
                  <span className="text-white text-xl font-extrabold">1</span>
                </div>
              </div>
            )}
            {/* Rank 3 */}
            {leaderboard[2] && (
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-extrabold border-4 border-white shadow-lg"
                  style={{ background: leaderboard[2].bg, color: leaderboard[2].fg }}>
                  {leaderboard[2].initials}
                </div>
                <p className="text-[10px] font-semibold text-gray-700 truncate max-w-[72px] text-center">{leaderboard[2].name}</p>
                <p className="text-xs font-extrabold text-amber-700">{leaderboard[2].score}</p>
                <div className="w-full rounded-t-xl flex items-start justify-center pt-2 shadow-inner"
                  style={{ height: '44px', background: 'linear-gradient(180deg,#d97706,#b45309)' }}>
                  <span className="text-white text-xl font-extrabold">3</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Ranked List ── */}
        <div className="px-4 sm:px-6 pb-5 space-y-2">
          {leaderboard.map((p, i) => {
            const barW = Math.round((p.score / (topScore + 5)) * 100);
            return (
              <div key={p.rank}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${i === 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                <span className={`text-sm font-bold w-5 text-center ${i === 0 ? 'text-amber-600' : 'text-gray-400'}`}>{p.rank}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2"
                  style={{ background: p.bg, color: p.fg, borderColor: p.bg }}>
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{p.sub}</p>
                </div>
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${barW}%`, background: i === 0 ? '#d97706' : '#9ca3af' }} />
                </div>
                <span className={`text-base font-extrabold w-8 text-right ${i === 0 ? 'text-amber-600' : 'text-gray-700'}`}>{p.score}</span>
              </div>
            );
          })}

          <div className="text-center text-xs text-gray-300 py-0.5">· · · ranks 6 – {Math.max(6, analysisData.rank - 1)} · · ·</div>

          {/* You */}
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-green-50 border-2 border-green-300">
            <span className="text-sm font-bold w-5 text-center text-green-700">{analysisData.rank}</span>
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 border-green-400">★</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-800">You</p>
              <p className="text-[10px] text-green-600 truncate">
                +{Math.max(0, totalScore - analysisData.comparisonData.averageScore)} above avg · {overallAccuracy}% accuracy
              </p>
            </div>
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.round((totalScore / (topScore + 5)) * 100)}%` }} />
            </div>
            <span className="text-base font-extrabold text-green-700 w-8 text-right">{totalScore}</span>
          </div>

          {/* Neighbour */}
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-gray-50 border border-gray-100">
            <span className="text-sm font-bold w-5 text-center text-gray-400">{analysisData.rank + 1}</span>
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 border-gray-300">RP</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700">Rohit P.</p>
              <p className="text-[10px] text-gray-400 truncate">{peerSubs[3]}</p>
            </div>
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gray-300" style={{ width: `${Math.round(((totalScore - 1) / (topScore + 5)) * 100)}%` }} />
            </div>
            <span className="text-base font-extrabold text-gray-700 w-8 text-right">{totalScore - 1}</span>
          </div>
        </div>

      </div>



    </div>
  );
};
