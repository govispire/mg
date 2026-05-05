import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, CheckCircle, Clock, Trophy, TrendingUp, AlertTriangle, Swords, BarChart2, MapPin, Brain, Info } from "lucide-react";
import { TestAnalysisData } from "@/data/testAnalysisData";
import { useIsMobile } from "@/hooks/use-mobile";

interface OverallAnalysisTabProps {
  analysisData: TestAnalysisData;
  defaultSection?: boolean;
}

const SH = ({ title, badge }: { title: string; badge?: string }) => (
  <div className="flex items-center gap-2 mb-4">
    <h3 className="text-sm font-bold text-gray-800">{title}</h3>
    {badge && <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{badge}</span>}
  </div>
);

export const OverallAnalysisTab: React.FC<OverallAnalysisTabProps> = ({ analysisData, defaultSection }) => {
  const isMobile = useIsMobile();

  const totalAttempted = analysisData.sectionWiseData.reduce((s, x) => s + x.attempted, 0);
  const totalCorrect   = analysisData.sectionWiseData.reduce((s, x) => s + x.correct, 0);
  const totalWrong     = analysisData.sectionWiseData.reduce((s, x) => s + x.wrong, 0);
  const totalSkipped   = analysisData.sectionWiseData.reduce((s, x) => s + x.skipped, 0);
  const totalScore     = analysisData.sectionWiseData.reduce((s, x) => s + x.score, 0);
  const sumMaxScore    = analysisData.sectionWiseData.reduce((s, x) => s + x.maxScore, 0);
  const totalTime      = analysisData.sectionWiseData.reduce((s, x) => s + x.timeSpent, 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const topScore       = analysisData.comparisonData.topperScore;

  // Performance history for chart
  const history = analysisData.performanceHistory ?? [];
  const chartH = 120, chartW = 340;
  const scores = history.map(h => h.score);
  const minS = Math.min(...scores, 0), maxS = Math.max(...scores, sumMaxScore);
  const toY = (v: number) => chartH - ((v - minS) / (maxS - minS + 1)) * chartH;
  const toX = (i: number) => scores.length > 1 ? (i / (scores.length - 1)) * chartW : chartW / 2;
  const avgScore = analysisData.comparisonData.averageScore;
  const topperScore = topScore;
  const yourPoints  = history.map((h, i) => `${toX(i)},${toY(h.score)}`).join(" ");
  const avgPoints   = history.map((_, i) => `${toX(i)},${toY(avgScore)}`).join(" ");
  const topPoints   = history.map((_, i) => `${toX(i)},${toY(topperScore)}`).join(" ");

  // Donut
  const donutTotal = totalCorrect + totalWrong + totalSkipped || 1;
  const R = 56, C = 2 * Math.PI * R;
  const cDash = (totalCorrect / donutTotal) * C;
  const wDash = (totalWrong / donutTotal) * C;
  const sDash = (totalSkipped / donutTotal) * C;

  // Leaderboard
  const scoreGap = Math.max(1, Math.round((topScore - totalScore) / Math.max(analysisData.rank, 1)));
  const leaders = [
    { rank: 2, name: "Riya Singh",    score: topScore - scoreGap,     acc: 99.12, time: "54m 32s", color: "#94a3b8" },
    { rank: 1, name: "Aarav Sharma",  score: topScore,                acc: 99.45, time: "52m 10s", color: "#f59e0b" },
    { rank: 3, name: "Karan Verma",   score: topScore - scoreGap * 2, acc: 98.21, time: "55m 47s", color: "#cd7f32" },
  ];
  const listLeaders = [
    ...leaders.sort((a, b) => a.rank - b.rank),
    { rank: 4, name: "Neha Gupta",   score: topScore - scoreGap * 3, acc: 96.81, time: "57m 03s", color: "#e2e8f0" },
    { rank: 5, name: "Arjun Patel",  score: topScore - scoreGap * 4, acc: 96.35, time: "58m 21s", color: "#e2e8f0" },
  ];

  // Section ideal times (mock ratio)
  const sectionIdealTime = analysisData.sectionWiseData.map(s => Math.round((s.maxScore / sumMaxScore) * totalTime * 0.92));

  return (
    <div className="p-4 space-y-4 bg-[#f8fafc] min-h-full">

      {/* ── Section-wise Performance Table ── */}
      <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm">
        <div className="px-4 pt-3 pb-1">
          <SH title="Section Wise Performance" />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-y border-gray-200">
                {["Section","Attempted","Correct / Wrong","Skipped","Score","Rank","Percentile","Accuracy","Time"].map(h => (
                  <TableHead key={h} className="text-[11px] font-semibold text-gray-500 px-3 py-2.5 whitespace-nowrap">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysisData.sectionWiseData.map((s, i) => (
                <TableRow key={s.sectionName} className="border-b border-gray-100 hover:bg-green-50/30">
                  <TableCell className="text-sm font-semibold text-gray-800 px-3 py-2.5">{s.sectionName}</TableCell>
                  <TableCell className="text-sm text-gray-600 px-3 py-2.5">{s.attempted}</TableCell>
                  <TableCell className="text-sm px-3 py-2.5">
                    <span className="text-green-600 font-bold">{s.correct}</span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className="text-red-500 font-bold">{s.wrong}</span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 px-3 py-2.5">{s.skipped}</TableCell>
                  <TableCell className="text-sm font-semibold text-gray-800 px-3 py-2.5">{s.score}/{s.maxScore}</TableCell>
                  <TableCell className="text-sm text-gray-600 px-3 py-2.5">{s.rank}</TableCell>
                  <TableCell className="text-sm font-semibold text-green-600 px-3 py-2.5">{s.percentile}%</TableCell>
                  <TableCell className="px-3 py-2.5">
                    <span className={`text-sm font-bold ${s.accuracy >= 85 ? "text-green-600" : s.accuracy >= 65 ? "text-blue-500" : "text-amber-500"}`}>{s.accuracy}%</span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 px-3 py-2.5 flex items-center gap-1"><Clock className="w-3 h-3"/>{s.timeSpent}m</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-50 border-t-2 border-gray-200">
                <TableCell className="text-sm font-bold text-gray-800 px-3 py-2.5">Overall</TableCell>
                <TableCell className="text-sm font-bold text-gray-700 px-3 py-2.5">{totalAttempted}</TableCell>
                <TableCell className="text-sm px-3 py-2.5">
                  <span className="text-green-600 font-bold">{totalCorrect}</span>
                  <span className="text-gray-300 mx-1">/</span>
                  <span className="text-red-500 font-bold">{totalWrong}</span>
                </TableCell>
                <TableCell className="text-sm font-bold text-gray-700 px-3 py-2.5">{totalSkipped}</TableCell>
                <TableCell className="text-sm font-bold text-gray-800 px-3 py-2.5">{totalScore}/{sumMaxScore}</TableCell>
                <TableCell className="text-sm font-bold text-gray-700 px-3 py-2.5">{analysisData.rank}</TableCell>
                <TableCell className="text-sm font-bold text-green-600 px-3 py-2.5">{analysisData.percentile}%</TableCell>
                <TableCell className="text-sm font-bold text-gray-700 px-3 py-2.5">{overallAccuracy}%</TableCell>
                <TableCell className="text-sm font-bold text-gray-700 px-3 py-2.5">{totalTime}m</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-green-600"/><span className="text-[11px] text-gray-500">Correct</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-500"/><span className="text-[11px] text-gray-500">Wrong</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-gray-300"/><span className="text-[11px] text-gray-500">Skipped</span></div>
        </div>
      </Card>

      {/* ── Performance Overview + Question Summary ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Performance Overview Chart — 3/5 */}
        <Card className="lg:col-span-3 p-4 border border-gray-200 shadow-sm">
          <SH title="Performance Overview" />
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            {[
              { label: "Your Score", color: "#16a34a", dash: "none" },
              { label: "Average Score", color: "#94a3b8", dash: "4" },
              { label: "Topper Score", color: "#3b82f6", dash: "none" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke={l.color} strokeWidth="2" strokeDasharray={l.dash}/></svg>
                <span className="text-[11px] text-gray-500 font-medium">{l.label}</span>
              </div>
            ))}
          </div>
          <div className="relative overflow-x-auto">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-28" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0,1,2,3].map(i => (
                <line key={i} x1={0} y1={i*(chartH/3)} x2={chartW} y2={i*(chartH/3)} stroke="#f1f5f9" strokeWidth="1"/>
              ))}
              {/* Average line */}
              {scores.length > 1 && <polyline points={avgPoints} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4"/>}
              {/* Topper line */}
              {scores.length > 1 && <polyline points={topPoints} fill="none" stroke="#3b82f6" strokeWidth="1.5"/>}
              {/* Your score line */}
              {scores.length > 1 && (
                <>
                  <polyline points={yourPoints} fill="none" stroke="#16a34a" strokeWidth="2"/>
                  {history.map((h, i) => (
                    <circle key={i} cx={toX(i)} cy={toY(h.score)} r="4" fill="#16a34a" stroke="white" strokeWidth="1.5"/>
                  ))}
                </>
              )}
              {/* Last score label */}
              {history.length > 0 && (
                <>
                  <rect x={toX(history.length-1)-16} y={toY(history[history.length-1].score)-22} width="32" height="18" rx="4" fill="#16a34a"/>
                  <text x={toX(history.length-1)} y={toY(history[history.length-1].score)-9} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">{history[history.length-1].score}</text>
                </>
              )}
            </svg>
            {/* X labels */}
            <div className="flex justify-between mt-1 px-0">
              {history.map((h, i) => (
                <span key={i} className="text-[9px] text-gray-400 font-medium">{h.testName.replace("Mock Test","Mock")}</span>
              ))}
            </div>
          </div>
          {/* Improvement note */}
          <div className="mt-3 flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2 border border-green-100">
            <TrendingUp className="w-3.5 h-3.5 text-green-600 flex-shrink-0"/>
            <p className="text-[11px] text-green-700 font-medium">Great! You have improved compared to your last test.</p>
          </div>
        </Card>

        {/* Question Summary Donut — 2/5 */}
        <Card className="lg:col-span-2 p-4 border border-gray-200 shadow-sm flex flex-col">
          <SH title="Question Summary" />
          <div className="flex-1 flex flex-col items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-36 h-36">
              <circle cx="80" cy="80" r={R} fill="none" stroke="#dcfce7" strokeWidth="22"/>
              {/* Green - correct */}
              <circle cx="80" cy="80" r={R} fill="none" stroke="#16a34a" strokeWidth="22"
                strokeDasharray={`${cDash} ${C - cDash}`}
                style={{transform:"rotate(-90deg)",transformOrigin:"80px 80px"}}/>
              {/* Red - wrong */}
              <circle cx="80" cy="80" r={R} fill="none" stroke="#ef4444" strokeWidth="22"
                strokeDasharray={`${wDash} ${C - wDash}`}
                strokeDashoffset={-cDash}
                style={{transform:"rotate(-90deg)",transformOrigin:"80px 80px"}}/>
              {/* Amber - unattempted */}
              <circle cx="80" cy="80" r={R} fill="none" stroke="#f59e0b" strokeWidth="22"
                strokeDasharray={`${sDash} ${C - sDash}`}
                strokeDashoffset={-(cDash + wDash)}
                style={{transform:"rotate(-90deg)",transformOrigin:"80px 80px"}}/>
              <text x="80" y="76" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1f2937">{donutTotal}</text>
              <text x="80" y="92" textAnchor="middle" fontSize="9" fill="#9ca3af" fontWeight="600" letterSpacing="0.5">Questions</text>
            </svg>
            {/* Legend */}
            <div className="space-y-1.5 w-full mt-3">
              {[
                { label: "Correct",      val: totalCorrect, pct: Math.round((totalCorrect/donutTotal)*100), color: "#16a34a" },
                { label: "Incorrect",    val: totalWrong,   pct: Math.round((totalWrong/donutTotal)*100),   color: "#ef4444" },
                { label: "Unattempted",  val: totalSkipped, pct: Math.round((totalSkipped/donutTotal)*100), color: "#f59e0b" },
              ].map(l => (
                <div key={l.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{background:l.color}}/>
                    <span className="text-xs text-gray-600">{l.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{l.val} ({l.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
          <button className="mt-3 w-full border border-green-300 text-green-700 text-xs font-semibold py-2 rounded-lg hover:bg-green-50 transition-colors">
            View All Questions
          </button>
        </Card>
      </div>

      {/* ── Time Analysis + Leaderboard ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Time Analysis */}
        <Card className="p-4 border border-gray-200 shadow-sm">
          <SH title="Time Analysis (Section Wise)" />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Section","Time Spent","Ideal Time","Time Diff","Accuracy"].map(h => (
                    <th key={h} className="text-left text-gray-400 font-semibold pb-2 pr-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analysisData.sectionWiseData.map((s, i) => {
                  const ideal = sectionIdealTime[i];
                  const diff = s.timeSpent - ideal;
                  return (
                    <tr key={s.sectionName} className="border-b border-gray-50">
                      <td className="py-2.5 pr-3 font-medium text-gray-700">{s.sectionName}</td>
                      <td className="py-2.5 pr-3 text-gray-600">{s.timeSpent}m</td>
                      <td className="py-2.5 pr-3 text-gray-600">{ideal}m</td>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold ${diff > 0 ? "text-red-500" : "text-green-600"}`}>
                            {diff > 0 ? `+${diff}m` : diff === 0 ? "0m" : `${diff}m`}
                          </span>
                          {diff !== 0 && (
                            <div className={`h-1.5 w-10 rounded-full ${diff > 0 ? "bg-red-400" : "bg-green-400"}`}/>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 font-semibold" style={{color: s.accuracy >= 85 ? "#16a34a" : "#f59e0b"}}>{s.accuracy}%</td>
                    </tr>
                  );
                })}
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td className="py-2.5 pr-3 font-bold text-gray-800">Overall</td>
                  <td className="py-2.5 pr-3 font-semibold text-gray-700">{totalTime}m</td>
                  <td className="py-2.5 pr-3 font-semibold text-gray-700">{Math.round(totalTime * 0.92)}m</td>
                  <td className="py-2.5 pr-3">
                    <span className="font-bold text-red-500">+{totalTime - Math.round(totalTime * 0.92)}m</span>
                  </td>
                  <td className="py-2.5 font-bold text-green-600">{overallAccuracy}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 bg-blue-50 rounded-lg px-3 py-2.5 border border-blue-100 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0"/>
            <p className="text-[11px] text-blue-700">You spent more time than ideal in some sections. Try to improve your speed while maintaining accuracy.</p>
          </div>
        </Card>

        {/* Leaderboard Top 5 */}
        <Card className="p-4 border border-gray-200 shadow-sm">
          <SH title="Leaderboard (Top 5)" />
          {/* Podium */}
          <div className="flex items-end justify-center gap-3 mb-4">
            {leaders.map(l => {
              const h = l.rank === 1 ? 64 : l.rank === 2 ? 44 : 34;
              return (
                <div key={l.rank} className="flex flex-col items-center gap-1">
                  {l.rank === 1 && <span className="text-base">👑</span>}
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow-md flex items-center justify-center text-xs font-bold"
                    style={{background: l.rank===1?"#fef3c7":l.rank===2?"#f1f5f9":"#fff7ed", color: l.rank===1?"#92400e":l.rank===2?"#374151":"#9a3412", outline:`2px solid ${l.color}`}}>
                    {l.name.split(" ").map(n=>n[0]).join("")}
                  </div>
                  <p className="text-[9px] font-semibold text-gray-600 max-w-[52px] text-center truncate">{l.name}</p>
                  <p className="text-[10px] font-bold" style={{color:l.color==="f59e0b"?"#d97706":"#374151"}}>{l.score}</p>
                  <div className="w-14 rounded-t flex items-start justify-center pt-1" style={{height:`${h}px`, background:l.rank===1?"linear-gradient(#fbbf24,#d97706)":l.rank===2?"linear-gradient(#d1d5db,#9ca3af)":"linear-gradient(#d97706,#b45309)"}}>
                    <span className="text-white text-sm font-extrabold">{l.rank}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* List */}
          <div className="space-y-1.5">
            {listLeaders.map((l, i) => (
              <div key={l.rank} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs ${i===0?"bg-amber-50 border-amber-200":i===1?"bg-green-50 border-green-200":"bg-gray-50 border-gray-100"}`}>
                <span className="w-4 font-bold text-gray-500 text-center">{l.rank}</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border" style={{background:"#f1f5f9",color:"#374151"}}>
                  {l.name.split(" ").map(n=>n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{l.name}</p>
                  <p className="text-[9px] text-gray-400">{l.score} / {sumMaxScore} · {l.acc}% · {l.time}</p>
                </div>
              </div>
            ))}
            {/* You row */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-green-50 border-green-300 text-xs">
              <span className="w-4 font-bold text-green-700 text-center">{analysisData.rank}</span>
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-[9px] font-bold border border-green-400">★</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-green-800">You (Your Rank)</p>
                <p className="text-[9px] text-green-600">{totalScore}/{sumMaxScore} · {overallAccuracy}% · {totalTime}m</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
};
