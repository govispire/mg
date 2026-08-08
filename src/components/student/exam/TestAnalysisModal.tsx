import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  BookOpen, FileText, TrendingUp, Award, BarChart3,
  X, Calendar, Clock, Timer, ChevronLeft, Target,
  Zap, Users, Brain, CheckCircle2, XCircle, ArrowLeft
} from 'lucide-react';
import { TestAnalysisData } from '@/data/testAnalysisData';
import { OverallAnalysisTab }   from './OverallAnalysisTab';
import { ScoreTrendTab }        from './ScoreTrendTab';
import { ExamReadinessTab }     from './ExamReadinessTab';
import { YouVsTopperTab }       from './YouVsTopperTab';
import { StrongWeakAnalysisTab } from './StrongWeakAnalysisTab';
import { useIsMobile }          from '@/hooks/use-mobile';

interface TestAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: TestAnalysisData;
  onViewSolutions?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Shorten exam name to ≤ 35 chars, removing verbose suffixes */
function shortenExamName(name: string): string {
  const cleaned = name
    .replace(/\bfull syllabus\b/gi, '')
    .replace(/\bmock test\b/gi, 'Mock')
    .replace(/\bpreliminary examination\b/gi, 'Prelims')
    .replace(/\bmain examination\b/gi, 'Mains')
    .replace(/\bexamination\b/gi, 'Exam')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned.length > 40 ? cleaned.slice(0, 38) + '…' : cleaned;
}

/** Infer test type label from test name / id */
function getTestTypeBadge(name: string): { label: string; color: string; bg: string } {
  const n = name.toLowerCase();
  if (n.includes('live'))       return { label: 'Live Test',      color: '#2563eb', bg: '#dbeafe' };
  if (n.includes('speed'))      return { label: 'Speed Test',     color: '#2563eb', bg: '#dbeafe' };
  if (n.includes('sectional'))  return { label: 'Sectional Test', color: '#2563eb', bg: '#dbeafe' };
  if (n.includes('main'))       return { label: 'Mains',          color: '#2563eb', bg: '#dbeafe' };
  if (n.includes('prelim'))     return { label: 'Prelims',        color: '#2563eb', bg: '#dbeafe' };
  if (n.includes('pyq') || n.includes('previous year')) return { label: 'PYQ', color: '#059669', bg: '#d1fae5' };
  return { label: 'Full Test', color: '#059669', bg: '#d1fae5' };
}

// ─── Tab definitions ─────────────────────────────────────────────────────────
const TABS = [
  { value: 'overview',    label: 'Overview',             icon: BarChart3  },
  { value: 'strengths',   label: 'Strengths & Weakness', icon: Brain      },
  { value: 'trend',       label: 'Score Trend',          icon: TrendingUp },
  { value: 'readiness',   label: 'Exam Readiness',       icon: Target     },
  { value: 'vstopper',    label: 'You vs Topper',        icon: Users      },
];

// ─── Hand-drawn Circle SVG Graphic ──────────────────────────────────────────
const HandDrawnCircleSVG: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#10b981' }) => (
  <div className="relative inline-flex items-center justify-center p-3">
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hand-drawn style double sketchy circle */}
      <path
        d="M 60,10 C 95,8 112,28 110,60 C 108,92 88,112 56,110 C 24,108 8,88 10,54 C 12,20 32,10 64,10 Z"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="180 6"
        className="opacity-85"
      />
      <path
        d="M 58,13 C 90,11 108,31 106,62 C 104,90 85,109 54,107 C 26,105 11,86 13,56 C 15,24 35,12 60,13 Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        className="opacity-50"
      />
    </svg>
    <div className="relative z-10 text-center flex flex-col items-center justify-center px-4 py-2">
      {children}
    </div>
  </div>
);

// ─── Component ───────────────────────────────────────────────────────────────
export const TestAnalysisModal: React.FC<TestAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysisData,
  onViewSolutions,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();

  if (!isOpen || !analysisData) return null;

  // Defensive safe defaults for sectionWiseData and analysis properties
  const sectionWiseData = analysisData.sectionWiseData ?? [];
  const sumMaxScore    = sectionWiseData.reduce((s, sec) => s + (sec.maxScore ?? 0), 0) || analysisData.maxScore || 100;
  const totalCorrect   = sectionWiseData.reduce((s, sec) => s + (sec.correct ?? 0), 0);
  const totalWrong     = sectionWiseData.reduce((s, sec) => s + (sec.wrong ?? 0), 0);
  const totalSkipped   = sectionWiseData.reduce((s, sec) => s + (sec.skipped ?? 0), 0);
  const totalAttempted = totalCorrect + totalWrong;
  const totalQuestions = totalAttempted + totalSkipped;

  // Mathematically calculated score (Correct * 1 - Wrong * 0.25)
  const calculatedScore = sectionWiseData.reduce((s, sec) => s + (sec.score ?? 0), 0);
  const totalScore     = analysisData.score ?? calculatedScore;
  const overallAccuracy = analysisData.accuracy ?? (totalAttempted > 0
    ? parseFloat(((totalCorrect / totalAttempted) * 100).toFixed(1))
    : 0);

  // Cutoff calculation
  const totalCutoff = sectionWiseData.reduce((acc, sec) => acc + (sec.cutOff ?? Math.round((sec.maxScore ?? 0) * 0.6)), 0) || Math.round(sumMaxScore * 0.64);
  const isCleared = totalScore >= totalCutoff;

  // Safe properties
  const rank = analysisData.rank ?? 1;
  const totalStudents = analysisData.totalStudents ?? 1800;
  const percentile = analysisData.percentile ?? 85;
  const shortName = shortenExamName(analysisData.testName || 'Mock Test');
  const typeBadge = getTestTypeBadge(analysisData.testName || 'Full Test');

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto w-screen h-screen flex flex-col text-slate-900 font-sans">

      {/* ════════════════════════════════════════════════════════════════
          TOP NAVIGATION HEADER — Back button pinned to left edge
      ════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">

          {/* ← Back — always left-most */}
          <button
            onClick={onClose}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors text-xs font-bold text-slate-700"
            title="Return to tests"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Exam Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 truncate tracking-tight">{shortName}</span>
              <span
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: typeBadge.bg, color: typeBadge.color }}
              >
                {typeBadge.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" />{analysisData.date}</span>
              <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5 text-slate-400" />{analysisData.maxTime}m</span>
            </div>
          </div>

          {/* Action CTAs — right-aligned */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 h-9 rounded-xl shadow-sm gap-2 text-xs"
              onClick={onViewSolutions}
              disabled={!onViewSolutions}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">View Solutions</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('strengths')}
              className="text-xs font-bold border-slate-200 hover:bg-slate-100 px-3.5 py-2 h-9 rounded-xl gap-1.5 text-slate-700"
            >
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Weakness Analysis</span>
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
              title="Close Analysis"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════
          HERO METRICS SECTION — Green & Blue palette only
      ════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-200 py-5 px-4 sm:px-6 shadow-xs flex-shrink-0">
        <div className="max-w-7xl mx-auto">

          {/* Row 1: The 3 Big Hero Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

            {/* HERO CARD 1: SCORE */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-xs relative overflow-hidden min-h-[110px]">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mb-1">Your Total Score</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-emerald-700 tracking-tight">{totalScore}</span>
                  <span className="text-base font-bold text-emerald-600/70">/ {sumMaxScore}</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                  {isCleared ? '✓ Cleared Cut-off' : '⚠ Below Cut-off'}
                </div>
              </div>
              <HandDrawnCircleSVG color={isCleared ? '#059669' : '#ef4444'}>
                <span className="text-2xl font-black text-slate-900 leading-none">{totalScore}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">SCORE</span>
              </HandDrawnCircleSVG>
            </div>

            {/* HERO CARD 2: RANK */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-xs min-h-[110px]">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest block mb-1">All India Rank</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-blue-700 tracking-tight">#{rank.toLocaleString()}</span>
                </div>
                <p className="text-xs text-blue-600 font-semibold mt-1">
                  out of <span className="font-extrabold text-blue-900">{totalStudents.toLocaleString()}</span> test takers
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                <Award className="w-7 h-7" />
              </div>
            </div>

            {/* HERO CARD 3: CUT-OFF */}
            <div className={`border rounded-2xl p-5 flex items-center justify-between gap-4 shadow-xs min-h-[110px] ${
              isCleared ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
            }`}>
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${isCleared ? 'text-emerald-700' : 'text-red-700'}`}>
                  Official Cut-Off Mark
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-4xl font-black tracking-tight ${isCleared ? 'text-emerald-700' : 'text-red-700'}`}>{totalCutoff}</span>
                  <span className="text-xs font-bold text-slate-500">Marks</span>
                </div>
                <p className={`text-xs font-bold mt-1 ${isCleared ? 'text-emerald-700' : 'text-red-700'}`}>
                  {isCleared
                    ? `+${(totalScore - totalCutoff).toFixed(1)} marks above cutoff`
                    : `Need ${(totalCutoff - totalScore).toFixed(1)} more marks to qualify`}
                </p>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0 ${
                isCleared ? 'bg-emerald-600' : 'bg-red-500'
              }`}>
                <Target className="w-7 h-7" />
              </div>
            </div>

          </div>

          {/* Row 2: Secondary Metric Strip — Blue & Green only */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100">

            {/* Percentile */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Percentile</span>
                <span className="text-sm font-extrabold text-blue-900 leading-none">{percentile.toFixed(1)}%</span>
                <span className="text-[10px] text-blue-600 block font-medium mt-0.5">Top {(100 - percentile).toFixed(1)}%</span>
              </div>
            </div>

            {/* Accuracy */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Accuracy</span>
                <span className="text-sm font-extrabold text-emerald-900 leading-none">{overallAccuracy}%</span>
                <span className="text-[10px] text-emerald-700 block font-medium mt-0.5">{totalCorrect}✓ | {totalWrong}✗</span>
              </div>
            </div>

            {/* Attempted */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Attempted</span>
                <span className="text-sm font-extrabold text-blue-900 leading-none">{totalAttempted}</span>
                <span className="text-[10px] text-blue-600 block font-medium mt-0.5">of {totalQuestions} Qs</span>
              </div>
            </div>

            {/* Correct */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Correct</span>
                <span className="text-sm font-extrabold text-emerald-900 leading-none">{totalCorrect} Qs</span>
                <span className="text-[10px] text-emerald-700 block font-semibold mt-0.5">+{totalCorrect.toFixed(0)} marks</span>
              </div>
            </div>

            {/* Wrong */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">Wrong</span>
                <span className="text-sm font-extrabold text-red-900 leading-none">{totalWrong} Qs</span>
                <span className="text-[10px] text-red-700 block font-semibold mt-0.5">-{(totalWrong * 0.25).toFixed(2)} negative</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          NAVIGATION TABS BAR — Full-width pill tabs, well-spaced
      ════════════════════════════════════════════════════════════════ */}
      <nav className="bg-white border-b border-slate-200 sticky top-[61px] z-30 shadow-xs flex-shrink-0 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 min-w-max">
            {TABS.map(tab => {
              const active = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800'
                  }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════
          MAIN TAB CONTENT AREA
      ════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'overview'  && <OverallAnalysisTab    analysisData={analysisData} />}
        {activeTab === 'strengths' && <StrongWeakAnalysisTab analysisData={analysisData} />}
        {activeTab === 'trend'     && <ScoreTrendTab         analysisData={analysisData} />}
        {activeTab === 'readiness' && <ExamReadinessTab      analysisData={analysisData} />}
        {activeTab === 'vstopper'  && <YouVsTopperTab        analysisData={analysisData} />}
      </main>

    </div>
  );
};
