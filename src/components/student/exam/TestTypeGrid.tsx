
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, Play, PlayCircle, RotateCcw, Trophy, Calendar, BarChart3, BookOpen, Users, FileText, Award, Lock } from 'lucide-react';
import { TestProgress } from '@/hooks/useExamProgress';
import { Link, useParams } from 'react-router-dom';
import { TestAnalysisModal } from './TestAnalysisModal';

import { generateMockAnalysisData } from '@/data/testAnalysisData';
import { generateTestExam } from '@/utils/generateTestExam';
import { stopTimerAndLaunchTest } from '@/utils/stopTimerAndLaunchTest';
import { TestSubject } from '@/hooks/useExamCatalog';
import LiveTestLeaderboardModal from '@/components/student/quiz/LiveTestLeaderboardModal';

interface TestTypeGridProps {
  testType: string;
  tests: TestProgress[];
  progress: {
    completed: number;
    total: number;
    percentage: number;
    averageScore: number;
    bestScore: number;
    totalAttempts: number;
  };
  viewMode?: 'grid' | 'list';
  subjects?: TestSubject[]; // optional subject subsections
  isPurchased?: boolean;
}

export const TestTypeGrid: React.FC<TestTypeGridProps> = ({
  testType,
  tests,
  progress,
  viewMode = 'grid',
  subjects = [],
  isPurchased = true,
}) => {
  const { category, examId } = useParams();

  // Compact number formatter: 33549 → 33.5K
  const compactNum = (n: number): string => {
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return String(n);
  };

  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedTestForAnalysis, setSelectedTestForAnalysis] = useState<TestProgress | null>(null);
  const [showSolutionsModal, setShowSolutionsModal] = useState(false);
  const [selectedTestForSolutions, setSelectedTestForSolutions] = useState<TestProgress | null>(null);
  const [selectedTestForLeaderboard, setSelectedTestForLeaderboard] = useState<TestProgress | null>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null); // null = 'All'

  const handleAnalysisClick = (test: TestProgress) => {
    setSelectedTestForAnalysis(test);
    setShowAnalysisModal(true);
  };

  const handleSolutionClick = (test: TestProgress) => {
    window.open(
      `/student/solution-viewer?category=${category || ''}&examId=${examId || ''}&testId=${test.testId}&title=${encodeURIComponent(test.testName)}&duration=${test.totalDuration ?? 60}&questions=${test.totalQuestions ?? test.maxScore}`,
      '_blank',
      'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no'
    );
  };

  const getStatusIcon = (status: TestProgress['status'], isLocked?: boolean) => {
    if (isLocked) {
      return <Lock className="h-4 w-4 text-gray-400" />;
    }
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <RotateCcw className="h-4 w-4 text-orange-600" />;
      default:
        return <Play className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBackgroundColor = (status: TestProgress['status'], score?: number, maxScore?: number) => {
    switch (status) {
      case 'completed':
        // Check if test is cleared (assuming 50% is passing score)
        if (score !== undefined && maxScore !== undefined) {
          const percentage = (score / maxScore) * 100;
          return percentage >= 50 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
        }
        return 'bg-green-50 border-green-200';
      case 'in-progress':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-white border-gray-200 hover:bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty: TestProgress['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not attempted';
    return new Date(dateString).toLocaleDateString();
  };

  // Filter tests by selected subject
  const filteredTests = activeSubject
    ? tests.filter(t => t.subjectId === activeSubject)
    : tests;

  // Subject filter chips (shown for sectional/speed)
  const SubjectChips = subjects.length > 0 ? (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => setActiveSubject(null)}
        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeSubject === null
          ? 'bg-primary text-white border-primary shadow-sm'
          : 'bg-white text-gray-600 border-gray-300 bg-gray-100 text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary'
          }`}
      >
        All
      </button>
      {subjects.map(s => (
        <button
          key={s.id}
          onClick={() => setActiveSubject(s.id)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${activeSubject === s.id
            ? 'bg-primary text-white border-primary shadow-sm'
            : 'bg-white text-gray-600 border-gray-300 bg-gray-100 text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary'
            }`}
        >
          {s.name}
        </button>
      ))}
    </div>
  ) : null;

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        {/* Test Type Header with Progress */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold capitalize">{testType} Tests</h2>
            <p className="text-gray-600">{progress.completed} of {progress.total} tests completed</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="font-bold text-lg">{progress.averageScore}</p>
            </div>
          </div>
        </div>

        {SubjectChips}

        {/* Tests List View */}
        <div className="space-y-2">
          {filteredTests.map((test, idx) => {
            const totalStudents = test.totalStudents ?? 45320;
            const totalQuestions = test.totalQuestions ?? test.maxScore;
            const totalMarks = test.totalMarks ?? test.maxScore;
            const totalDuration = test.totalDuration ?? 60;
            const isCompleted = test.status === 'completed';
            const isInProgress = test.status === 'in-progress';
            const isLocked = !isPurchased && idx >= 3;
            // When locked, always treat as not-attempted to hide fake scores
            const effectiveCompleted = isLocked ? false : isCompleted;
            const effectiveInProgress = isLocked ? false : isInProgress;

            const accent = { border: "#cbd5e1", light: "#f8fafc", text: "#64748b" }; // slate-300, slate-50, slate-500
            const num = idx + 1;

            return (
              <div
                key={test.testId}
                className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col sm:flex-row items-center gap-4 p-4 ${isLocked ? 'bg-gray-50 opacity-80' : ''}`}
                style={{ borderLeft: `4px solid ${accent.border}` }}
              >
                {/* Left: Badge & Title */}
                <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                  <span
                    className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-base font-black shadow-sm flex-shrink-0"
                    style={{ background: accent.light, color: accent.text, border: `2px solid ${accent.border}` }}
                  >
                    {num}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-[16px] text-gray-900 leading-tight truncate">
                        {test.testName}
                      </h3>
                      {test.isFree && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider shrink-0">
                          Free
                        </span>
                      )}
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getDifficultyColor(test.difficulty)}`}>
                        {test.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs font-medium text-gray-500 capitalize">{testType} Test</p>
                      <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">{totalStudents.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle: Stats */}
                <div className="grid grid-cols-3 items-center justify-items-center gap-2 sm:px-2 sm:border-x border-gray-100 w-full sm:w-[280px] shrink-0 py-1">
                  {!effectiveCompleted ? (
                    <>
                      <div className="flex flex-col items-center">
                        <span className="text-[15px] font-black text-gray-900">{totalQuestions}</span>
                        <span className="text-[10px] font-medium text-gray-400">Questions</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[15px] font-black text-gray-900">{totalMarks}</span>
                        <span className="text-[10px] font-medium text-gray-400">Marks</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[15px] font-black text-gray-900">{totalDuration}</span>
                        <span className="text-[10px] font-medium text-gray-400">Min</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col items-center">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[15px] font-black text-gray-900">{test.score ?? 0}</span>
                          <span className="text-[10px] font-medium text-gray-400">/{test.maxScore}</span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-400">Score</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[15px] font-black text-gray-900">{test.rank ?? Math.floor(Math.random() * 50) + 1}</span>
                          <span className="text-[10px] font-medium text-gray-400">/{totalStudents > 0 ? totalStudents : '—'}</span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-400">Rank</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[15px] font-black text-gray-900">{test.timeSpent ? Math.floor(test.timeSpent / 60) : 0}m</span>
                        <span className="text-[10px] font-medium text-gray-400">Time</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Right: CTA */}
                <div className="flex items-center sm:justify-end gap-2 w-full sm:w-[220px] shrink-0 mt-2 sm:mt-0">
                  {effectiveCompleted ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none h-9 text-xs gap-1 border-gray-200 bg-white text-gray-700 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-semibold"
                        onClick={() => handleSolutionClick(test)}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Solution
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none h-9 text-xs gap-1 border-gray-200 bg-white text-gray-700 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-semibold"
                        onClick={() => handleAnalysisClick(test)}
                      >
                        <BarChart3 className="h-3.5 w-3.5" />
                        Analysis
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        title="Leaderboard"
                        className="h-9 w-9 p-0 border-gray-200 bg-white text-gray-700 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 shrink-0"
                        onClick={() => setSelectedTestForLeaderboard(test)}
                      >
                        <Trophy className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className={`
                        flex-1 sm:flex-none sm:w-[120px] h-9 rounded-lg text-sm font-semibold
                        flex items-center justify-center gap-1.5
                        transition-all duration-150 active:scale-[0.98]
                        ${isLocked
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        }
                      `}
                      onClick={() => {
                        if (isLocked) {
                          alert('This test is locked. Please purchase the full package to unlock.');
                          return;
                        }
                        const currentPath = window.location.pathname;
                        const url = `/student/test-window?category=${category}&examId=${examId}&testId=${test.testId}&returnUrl=${encodeURIComponent(currentPath)}`;
                        stopTimerAndLaunchTest({ url, testName: test.testName });
                      }}
                    >
                      {isLocked ? (
                        <><Lock className="h-3.5 w-3.5" /> Locked</>
                      ) : effectiveInProgress ? (
                        'Continue'
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-white text-white" />
                          Start
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>




        {/* Analysis Modal */}
        {selectedTestForAnalysis && (
          <TestAnalysisModal
            isOpen={showAnalysisModal}
            onClose={() => {
              setShowAnalysisModal(false);
              setSelectedTestForAnalysis(null);
            }}
            analysisData={generateMockAnalysisData(selectedTestForAnalysis.testId, selectedTestForAnalysis.testName)}
          />
        )}
      </div>
    );
  }

  // Grid View
  return (
    <div className="space-y-6">
      {/* Test Type Header with Progress */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold capitalize">{testType} Tests</h2>
          <p className="text-gray-600">{progress.completed} of {progress.total} tests completed</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Average Score</p>
          <p className="font-bold text-lg">{progress.averageScore}</p>
        </div>
      </div>

      {/* Subject Filter Chips */}
      {SubjectChips}

      {/* Tests Grid — 1 col on mobile, 2 on sm, 3 on md, etc. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
        {filteredTests.map((test, idx) => {
          // Safe fallbacks for backward-compat with old localStorage cache
          const totalQuestions = test.totalQuestions ?? test.maxScore;
          const totalMarks = test.totalMarks ?? test.maxScore;
          const totalDuration = test.totalDuration ?? 60;
          const totalStudents = test.totalStudents ?? 45320;
          const isLocked = !isPurchased && idx >= 3;
          // When locked, treat the card as fresh regardless of stored status
          const effectiveStatus = isLocked ? 'not-attempted' : test.status;

          // ── Result-based card tint ──────────────────────────────────────
          const cutoff = Math.round(totalMarks * 0.5); // 50% cutoff threshold
          const score  = test.score ?? 0;
          const cutoffCleared = effectiveStatus === 'completed' && score >= cutoff;
          const cutoffFailed  = effectiveStatus === 'completed' && score < cutoff;
          const inProgress    = effectiveStatus === 'in-progress';

          const cardBg     = 'bg-white';
          const cardBorder = 'border-slate-300';
          // ────────────────────────────────────────────────────────────────

          return (
            <Card
              key={test.testId}
              className={`overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${cardBg} border ${cardBorder} shadow-sm rounded-2xl ${isLocked ? 'opacity-75' : ''}`}
            >
              <div className="px-5 pt-5 pb-5 flex flex-col">

                {/* ── Header: badge + title ── */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-slate-500 font-black text-base shadow-sm bg-slate-50 border-2 border-slate-300"
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-[18px] text-gray-900 leading-tight">
                      {test.testName}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 mt-0.5">Full Length Mock Test</p>
                  </div>
                </div>

                {/* ── Students count ── */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-3">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{totalStudents.toLocaleString()} Students</span>
                </div>

                {/* ── Difficulty pill (auto-width, centered) ── */}
                <div className="flex justify-center mb-4">
                  {test.difficulty === 'easy' && (
                    <span className="inline-flex items-center justify-center px-6 py-1.5 rounded-full bg-green-50 border border-green-200 min-w-[110px]">
                      <span className="text-sm font-semibold text-green-600">Easy</span>
                    </span>
                  )}
                  {test.difficulty === 'medium' && (
                    <span className="inline-flex items-center justify-center px-6 py-1.5 rounded-full bg-yellow-50 border border-yellow-200 min-w-[110px]">
                      <span className="text-sm font-semibold text-yellow-600">Medium</span>
                    </span>
                  )}
                  {test.difficulty === 'hard' && (
                    <span className="inline-flex items-center justify-center px-6 py-1.5 rounded-full bg-red-50 border border-red-200 min-w-[110px]">
                      <span className="text-sm font-semibold text-red-500">Hard</span>
                    </span>
                  )}
                  {!test.difficulty && (
                    <span className="inline-flex items-center justify-center px-6 py-1.5 rounded-full bg-gray-50 border border-gray-200 min-w-[110px]">
                      <span className="text-sm font-semibold text-gray-400">—</span>
                    </span>
                  )}
                </div>

                {/* ── Horizontal divider ── */}
                <hr className="border-gray-100 mb-4" />

                {/* ── Stats grid ── */}
                {effectiveStatus === 'completed' ? (
                <div className="mb-4">
                    <div className="grid grid-cols-3">
                      {/* Score */}
                      <div className="flex flex-col items-center py-3 px-3">
                        <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                          <span className="text-base font-black text-gray-900">{test.score ?? 0}</span>
                          <span className="text-[10px] font-medium text-gray-400">/{totalMarks}</span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-400 mt-1">Score</span>
                      </div>
                      {/* Rank */}
                      <div className="flex flex-col items-center py-3 px-3 border-x border-gray-200">
                        <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                          {test.rank
                            ? <><span className="text-base font-black text-gray-900">{test.rank}</span><span className="text-[10px] font-medium text-gray-400">/{compactNum(totalStudents)}</span></>
                            : <span className="text-base font-black text-gray-900">—</span>
                          }
                        </div>
                        <span className="text-[10px] font-medium text-gray-400 mt-1">Rank</span>
                      </div>
              {/* Percentile */}
              <div className="flex flex-col items-center py-3 px-3">
                <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                  <span className="text-base font-black text-gray-900">{test.percentile !== undefined ? `${test.percentile}%` : '—'}</span>
                </div>
                <span className="text-[10px] font-medium text-gray-400 mt-1">Percentile</span>
              </div>
            </div>
                  </div>
      ) : (
      <div className="grid grid-cols-3 mb-4">
        <div className="flex flex-col items-center py-3">
          <span className="text-base font-black text-gray-900">{totalQuestions}</span>
          <span className="text-xs font-medium text-gray-400 mt-1">Questions</span>
        </div>
        <div className="flex flex-col items-center py-3 border-x border-gray-200">
          <span className="text-base font-black text-gray-900">{totalMarks}</span>
          <span className="text-xs font-medium text-gray-400 mt-1">Marks</span>
        </div>
        <div className="flex flex-col items-center py-3">
          <span className="text-base font-black text-gray-900">{totalDuration}</span>
          <span className="text-xs font-medium text-gray-400 mt-1">Min</span>
        </div>
      </div>
                )}

      {/* ── Action Buttons — always a single flex row ── */}
      {effectiveStatus === 'completed' ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSolutionClick(test)}
            className="flex-1 text-xs h-9 border-gray-300 bg-gray-100 text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary font-semibold"
          >
            <BookOpen className="h-3.5 w-3.5 mr-1" /> Solution
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAnalysisClick(test)}
            className="flex-1 text-xs h-9 border-gray-300 bg-gray-100 text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary font-semibold"
          >
            <BarChart3 className="h-3.5 w-3.5 mr-1" /> Analysis
          </Button>
          <Button
            size="sm"
            variant="outline"
            title="Leaderboard"
            className="h-9 w-9 p-0 border-gray-300 bg-gray-100 text-gray-700 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 flex-shrink-0"
            onClick={() => setSelectedTestForLeaderboard(test)}
          >
            <Trophy className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            className={`flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg font-semibold text-sm transition-all active:scale-95 ${
              isLocked
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 text-white shadow-sm'
            }`}
            onClick={() => {
              if (isLocked) {
                alert('This test is locked. Please purchase the full package to unlock.');
                return;
              }
              const currentPath = window.location.pathname;
              const url = `/student/test-window?category=${category}&examId=${examId}&testId=${test.testId}&returnUrl=${encodeURIComponent(currentPath)}`;
              stopTimerAndLaunchTest({ url, testName: test.testName });
            }}
          >
            {isLocked ? (
              <><Lock className="h-3.5 w-3.5" /> Locked</>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-white text-white" />
                {test.status === 'in-progress' ? 'Continue' : 'Start Test'}
              </>
            )}
          </button>
        </div>
      )}

    </div>
            </Card >
          );
        })}
      </div >



{/* Analysis Modal */ }
{
  selectedTestForAnalysis && (
    <TestAnalysisModal
      isOpen={showAnalysisModal}
      onClose={() => {
        setShowAnalysisModal(false);
        setSelectedTestForAnalysis(null);
      }}
      analysisData={generateMockAnalysisData(selectedTestForAnalysis.testId, selectedTestForAnalysis.testName)}
    />
  )
}
      {/* Leaderboard Modal */}
      {selectedTestForLeaderboard && (
        <LiveTestLeaderboardModal
          test={{
            id: parseInt(selectedTestForLeaderboard.testId) || Math.floor(Math.random() * 1000),
            title: selectedTestForLeaderboard.testName,
            questions: selectedTestForLeaderboard.totalQuestions ?? selectedTestForLeaderboard.maxScore ?? 100,
            duration: selectedTestForLeaderboard.totalDuration ?? 60,
            marks: selectedTestForLeaderboard.totalMarks ?? selectedTestForLeaderboard.maxScore ?? 100,
            examDateTime: new Date()
          }}
          onClose={() => setSelectedTestForLeaderboard(null)}
          userCompletion={{
            score: selectedTestForLeaderboard.score ?? 0,
            completedAt: new Date().toISOString()
          }}
        />
      )}
    </div >
  );
};

