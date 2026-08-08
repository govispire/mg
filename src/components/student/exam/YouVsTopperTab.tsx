import React from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Clock, Target, TrendingUp, Zap, ArrowRight, Award } from 'lucide-react';
import { TestAnalysisData } from '@/data/testAnalysisData';

interface YouVsTopperTabProps {
  analysisData: TestAnalysisData;
}

export const YouVsTopperTab: React.FC<YouVsTopperTabProps> = ({ analysisData }) => {
  const totalScore = analysisData.sectionWiseData?.reduce((s, x) => s + x.score, 0) ?? analysisData.score ?? 0;
  const maxScore = analysisData.sectionWiseData?.reduce((s, x) => s + x.maxScore, 0) ?? analysisData.maxScore ?? 100;
  const topperScore = analysisData.comparisonData?.topperScore ?? Math.round(maxScore * 0.9);
  const averageScore = analysisData.comparisonData?.averageScore ?? Math.round(maxScore * 0.5);
  const totalAttempted = analysisData.sectionWiseData?.reduce((s, x) => s + x.attempted, 0) ?? 0;
  const totalCorrect = analysisData.sectionWiseData?.reduce((s, x) => s + x.correct, 0) ?? 0;
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const totalStudents = analysisData.totalStudents ?? 1800;
  const rank = analysisData.rank ?? 1;

  // Topper mock stats
  const topperAccuracy = 94;
  const topperTime = '52m 10s';
  const topperAttempted = Math.round(maxScore * 0.96);
  const yourTime = analysisData.sectionWiseData.reduce((s, x) => s + x.timeSpent, 0);

  // Section-wise comparison
  const sections = analysisData.sectionWiseData.map(s => {
    const topperSectionScore = Math.round(s.maxScore * (topperScore / maxScore) * (0.90 + Math.random() * 0.10));
    const gap = Math.max(0, topperSectionScore - s.score);
    return {
      name: s.sectionName,
      yours: s.score,
      topper: topperSectionScore,
      max: s.maxScore,
      gap,
      accuracy: s.accuracy,
    };
  });

  // Leaderboard
  const scoreGap = Math.max(1, Math.round((topperScore - totalScore) / Math.max(rank, 1)));
  const leaderboard = [
    { rank: 1, name: 'Aarav Sharma',  initials: 'AS', score: topperScore,           pct: 99.45, time: '52m 10s' },
    { rank: 2, name: 'Riya Singh',    initials: 'RS', score: topperScore - scoreGap,            pct: 99.12, time: '54m 32s' },
    { rank: 3, name: 'Karan Verma',   initials: 'KV', score: topperScore - scoreGap * 2,        pct: 98.21, time: '55m 47s' },
    { rank: 4, name: 'Neha Gupta',    initials: 'NG', score: topperScore - scoreGap * 3,        pct: 97.53, time: '57m 03s' },
    { rank: 5, name: 'Arjun Patel',   initials: 'AP', score: topperScore - scoreGap * 4,        pct: 96.81, time: '58m 21s' },
  ];

  const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32', '#6b7280', '#6b7280'];
  const pctBeat = Math.round(((totalStudents - rank) / totalStudents) * 100);

  return (
    <div className="p-4 space-y-4 bg-[#f8fafc] min-h-full">

      {/* ── Hero Comparison ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Your Score hero */}
        <Card className="p-5 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center text-sm font-extrabold text-indigo-700 mb-3">
            YOU
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{totalScore}</p>
          <p className="text-xs text-gray-400 font-medium mt-0.5">out of {maxScore}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-sm font-bold text-indigo-600">Rank #{rank}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">out of {totalStudents.toLocaleString()} students</p>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all"
              style={{ width: `${Math.round((totalScore / maxScore) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-indigo-600 font-semibold mt-1">{Math.round((totalScore / maxScore) * 100)}%</p>
        </Card>

        {/* VS divider */}
        <div className="hidden lg:flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-extrabold text-gray-400 border border-gray-200">VS</div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-20 h-1 rounded-full bg-indigo-300" />
              <span className="font-medium">You</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-20 h-1 rounded-full bg-amber-400" />
              <span className="font-medium">Topper</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-1">
            Gap: <span className="font-bold text-gray-600">{topperScore - totalScore} marks</span>
          </p>
        </div>

        {/* Topper hero */}
        <Card className="p-5 border border-amber-200 bg-amber-50/30 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-sm font-extrabold text-amber-700 mb-3">
              AS
            </div>
            <Trophy className="w-4 h-4 text-amber-500 absolute -top-1 -right-1" />
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{topperScore}</p>
          <p className="text-xs text-gray-400 font-medium mt-0.5">out of {maxScore}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-sm font-bold text-amber-600">Rank #1</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Aarav Sharma · Top 0.01%</p>
          <div className="mt-3 w-full bg-amber-100 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-amber-400 transition-all"
              style={{ width: `${Math.round((topperScore / maxScore) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-amber-600 font-semibold mt-1">{Math.round((topperScore / maxScore) * 100)}%</p>
        </Card>
      </div>

      {/* ── Quick stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'You beat', value: `${pctBeat}%`, sub: 'of students', color: '#10b981' },
          { label: 'Your Accuracy', value: `${overallAccuracy}%`, sub: `Topper: ${topperAccuracy}%`, color: '#6366f1' },
          { label: 'Your Time', value: `${yourTime}m`, sub: `Topper: ${topperTime}`, color: '#f59e0b' },
          { label: 'Score Gap', value: `${topperScore - totalScore}`, sub: 'marks to topper', color: '#ef4444' },
        ].map((stat, i) => (
          <Card key={i} className="p-3 border border-gray-200 shadow-sm text-center">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">{stat.label}</p>
            <p className="text-xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{stat.sub}</p>
          </Card>
        ))}
      </div>

      {/* ── Subject-wise Comparison ── */}
      <Card className="p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-gray-600" />
          <p className="text-sm font-bold text-gray-800">Subject-wise Score Comparison</p>
        </div>
        <div className="space-y-4">
          {sections.map((sec, i) => {
            const youPct = Math.round((sec.yours / sec.max) * 100);
            const topPct = Math.round((sec.topper / sec.max) * 100);
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-700">{sec.name}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-indigo-600 font-bold">{sec.yours}/{sec.max}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-amber-500 font-bold">{sec.topper}/{sec.max}</span>
                    {sec.gap > 0 && (
                      <span className="text-[10px] text-rose-500 font-semibold">−{sec.gap} gap</span>
                    )}
                  </div>
                </div>
                {/* Dual bars */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-400 w-10 text-right">You</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-indigo-400 transition-all" style={{ width: `${youPct}%` }} />
                    </div>
                    <span className="text-[9px] text-indigo-600 font-bold w-7">{youPct}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-400 w-10 text-right">Topper</span>
                    <div className="flex-1 bg-amber-50 rounded-full h-2">
                      <div className="h-2 rounded-full bg-amber-400 transition-all" style={{ width: `${topPct}%` }} />
                    </div>
                    <span className="text-[9px] text-amber-600 font-bold w-7">{topPct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gap action items */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-2">What it takes to reach topper</p>
          <div className="space-y-1.5">
            {sections
              .sort((a, b) => b.gap - a.gap)
              .slice(0, 3)
              .map((sec, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">
                    Score <span className="font-bold text-gray-800">{sec.gap} more marks</span> in{' '}
                    <span className="font-bold text-gray-800">{sec.name}</span>
                  </span>
                </div>
              ))}
          </div>
        </div>
      </Card>

      {/* ── Leaderboard ── */}
      <Card className="p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-gray-800">Leaderboard</p>
            <p className="text-xs text-gray-400 mt-0.5">Top performers in this test</p>
          </div>
          <Trophy className="w-4 h-4 text-amber-400" />
        </div>

        {/* Top 3 podium */}
        <div className="flex items-end justify-center gap-2 mb-4 bg-gradient-to-b from-slate-50 to-blue-50/30 border border-slate-100 rounded-xl p-3">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map(p => {
            const barH = p.rank === 1 ? 72 : p.rank === 2 ? 52 : 40;
            const isFirst = p.rank === 1;
            return (
              <div key={p.rank} className="flex flex-col items-center" style={{ minWidth: 64 }}>
                {isFirst && (
                  <div className="text-amber-400 mb-0.5">
                    <Trophy className="w-4 h-4" />
                  </div>
                )}
                {!isFirst && <div className="h-5" />}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-sm mb-0.5"
                  style={{
                    background: isFirst ? '#fef3c7' : '#f8fafc',
                    color: isFirst ? '#92400e' : '#374151',
                    border: `2.5px solid ${rankColors[p.rank - 1]}`,
                    boxShadow: isFirst ? `0 0 0 3px #fef3c7, 0 0 0 5px ${rankColors[0]}` : undefined,
                  }}
                >
                  {p.initials}
                </div>
                <p className="text-[9px] font-semibold text-gray-700 text-center leading-tight">
                  {p.name.split(' ')[0]}<br />
                  <span className="font-normal">{p.name.split(' ')[1] ?? ''}</span>
                </p>
                <p className="text-[9px] text-gray-400 font-medium mb-1">{p.pct.toFixed(2)}%ile</p>
                <div
                  className="w-14 rounded-t-lg flex items-center justify-center"
                  style={{
                    height: barH,
                    background: isFirst
                      ? 'linear-gradient(180deg,#fbbf24,#f59e0b)'
                      : p.rank === 2
                        ? 'linear-gradient(180deg,#94a3b8,#64748b)'
                        : 'linear-gradient(180deg,#fb923c,#ea580c)',
                  }}
                >
                  <span className="text-white text-xs font-extrabold">#{p.rank}</span>
                </div>
                <p className="text-[9px] font-bold text-gray-600 mt-1">{p.score} pts</p>
              </div>
            );
          })}
        </div>

        {/* Ranks 4–5 */}
        <div className="divide-y divide-gray-100 mb-3">
          {leaderboard.slice(3).map(row => (
            <div key={row.rank} className="flex items-center gap-3 py-2">
              <span className="w-6 text-xs font-semibold text-gray-400">#{row.rank}</span>
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 flex-shrink-0">
                {row.initials}
              </div>
              <span className="flex-1 text-xs font-medium text-gray-700">{row.name}</span>
              <span className="text-xs font-semibold text-gray-600">{row.score} pts</span>
              <span className="text-xs font-bold text-indigo-500">{row.pct.toFixed(2)}%</span>
            </div>
          ))}
        </div>

        {/* You — sticky row */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 px-3 py-2.5 flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500">#{rank}</span>
          <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
            SU
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">Student User <span className="text-gray-400 font-normal">(You)</span></p>
            <p className="text-[10px] text-gray-500">
              {rank <= 50 ? 'Amazing! You\'re in the top 50.' : rank <= 200 ? 'Great effort — top 200!' : 'Keep improving — top 100 is achievable!'}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-gray-700">{totalScore} pts</p>
            <p className="text-xs font-bold text-indigo-500">{analysisData.percentile}%ile</p>
          </div>
        </div>
      </Card>

    </div>
  );
};
