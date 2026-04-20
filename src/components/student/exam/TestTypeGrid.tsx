
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, Play, RotateCcw, Trophy, Calendar, BarChart3, BookOpen, Users, FileText, Award, Lock } from 'lucide-react';
import { TestProgress } from '@/hooks/useExamProgress';
import { Link, useParams } from 'react-router-dom';
import { TestAnalysisModal } from './TestAnalysisModal';
import { TestSolutions } from './TestSolutions';
import { generateMockAnalysisData } from '@/data/testAnalysisData';
import { generateTestExam } from '@/utils/generateTestExam';
import { stopTimerAndLaunchTest } from '@/utils/stopTimerAndLaunchTest';
import { TestSubject } from '@/hooks/useExamCatalog';

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
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedTestForAnalysis, setSelectedTestForAnalysis] = useState<TestProgress | null>(null);
  const [showSolutionsModal, setShowSolutionsModal] = useState(false);
  const [selectedTestForSolutions, setSelectedTestForSolutions] = useState<TestProgress | null>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null); // null = 'All'

  const handleAnalysisClick = (test: TestProgress) => {
    setSelectedTestForAnalysis(test);
    setShowAnalysisModal(true);
  };

  const handleSolutionClick = (test: TestProgress) => {
    setSelectedTestForSolutions(test);
    setShowSolutionsModal(true);
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
          : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
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
            : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
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

            return (
              <div
                key={test.testId}
                className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 bg-white border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-md hover:border-gray-300 ${
                  isLocked
                    ? 'border-l-4 border-l-gray-200 bg-gray-50'
                    : effectiveCompleted
                    ? (test.score !== undefined && test.maxScore > 0 && (test.score / test.maxScore) >= 0.5
                      ? 'border-l-4 border-l-green-400'
                      : 'border-l-4 border-l-red-400')
                    : effectiveInProgress
                    ? 'border-l-4 border-l-orange-400'
                    : 'border-l-4 border-l-gray-200'
                }`}
              >
                {/* ── Top row on mobile: icon + name/meta + button ── */}
                <div className="flex items-start gap-2 sm:contents">

                  {/* Status icon */}
                  <div className="shrink-0 mt-0.5 sm:mt-0">
                    {getStatusIcon(test.status, isLocked)}
                  </div>

                  {/* Test Name + meta */}
                  <div className="flex-1 min-w-0 sm:w-52 sm:flex-none sm:shrink-0">
                    <h3 className="font-semibold text-sm text-gray-800 leading-snug line-clamp-2 sm:truncate">
                      {test.testName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getDifficultyColor(test.difficulty)}`}>
                        {test.difficulty}
                      </Badge>
                      {test.lastAttempted && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <Calendar className="h-2.5 w-2.5" />
                          {formatDate(test.lastAttempted)}
                        </span>
                      )}
                    </div>
                  </div>


                </div>

                {/* ── Stats row — shown below name on mobile, inline on desktop ── */}
                <div className="flex items-center flex-1 min-w-0 ml-5 sm:ml-0 sm:contents">
                  {/* Stats columns */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-1 flex-1 min-w-0">
                    {effectiveCompleted ? (
                      <>
                        <div className="text-center shrink-0">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Score</p>
                          <p className="text-xs font-bold text-green-600">{test.score ?? 0}/{test.maxScore}</p>
                        </div>
                        {test.timeSpent && (
                          <div className="text-center shrink-0">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Time</p>
                            <p className="text-xs font-semibold text-gray-700">{Math.floor(test.timeSpent / 60)}m</p>
                          </div>
                        )}
                        {test.rank && (
                          <div className="text-center shrink-0">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Rank</p>
                            <p className="text-xs font-semibold text-yellow-600 flex items-center gap-0.5">
                              <Trophy className="h-2.5 w-2.5" />
                              #{test.rank}/{totalStudents.toLocaleString()}
                            </p>
                          </div>
                        )}
                        <div className="flex-1 min-w-[80px]">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Percentile</p>
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                                style={{ width: `${test.percentile ?? 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 shrink-0">
                              {test.percentile !== undefined ? `${test.percentile}%` : '—'}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center shrink-0">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Questions</p>
                          <p className="text-xs font-semibold text-gray-700">{totalQuestions}</p>
                        </div>
                        <div className="text-center shrink-0">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Marks</p>
                          <p className="text-xs font-semibold text-gray-700">{totalMarks}</p>
                        </div>
                        <div className="text-center shrink-0">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Time</p>
                          <p className="text-xs font-semibold text-gray-700">{totalDuration} min</p>
                        </div>
                        <div className="text-center shrink-0">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Students</p>
                          <p className="text-xs font-semibold text-gray-700">{totalStudents.toLocaleString()}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* ── Action Buttons — desktop only (mobile shows them inline above) ── */}
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    {effectiveCompleted ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSolutionClick(test)}
                          className="h-8 text-xs flex items-center gap-1 border-gray-200 hover:border-primary hover:text-primary"
                        >
                          <BookOpen className="h-3 w-3" />
                          Solution
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAnalysisClick(test)}
                          className="h-8 text-xs flex items-center gap-1 border-gray-200 hover:border-primary hover:text-primary"
                        >
                          <BarChart3 className="h-3 w-3" />
                          Analysis
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-gray-200 hover:border-primary hover:text-primary"
                          onClick={() => {
                            const currentPath = window.location.pathname;
                            const url = `/student/test-window?category=${category}&examId=${examId}&testId=${test.testId}&returnUrl=${encodeURIComponent(currentPath)}`;
                            stopTimerAndLaunchTest({ url, testName: test.testName });
                          }}
                        >
                          Reattempt
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="h-8 text-xs font-semibold min-w-[96px]"
                        variant={isLocked ? 'secondary' : 'default'}
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
                           <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Locked</span>
                        ) : effectiveInProgress ? 'Continue' : 'Start Test'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* ── Action Buttons — mobile only (below stats) ── */}
                <div className="sm:hidden pt-3 mt-1 border-t border-gray-100">
                  {effectiveCompleted ? (
                    <div className="space-y-2">
                       <div className="flex gap-2">
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleSolutionClick(test)}
                           className="flex-1 h-9 text-xs border-gray-200 hover:border-primary hover:text-primary shadow-sm"
                         >
                           <BookOpen className="h-3.5 w-3.5 mr-1" />
                           Solution
                         </Button>
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleAnalysisClick(test)}
                           className="flex-1 h-9 text-xs border-gray-200 hover:border-primary hover:text-primary shadow-sm"
                         >
                           <BarChart3 className="h-3.5 w-3.5 mr-1" />
                           Analysis
                         </Button>
                       </div>
                       <Button
                         size="sm"
                         variant="outline"
                         className="w-full h-9 text-xs border-gray-200 bg-gray-50/50 hover:bg-gray-100 text-gray-700 shadow-sm"
                         onClick={() => {
                           const currentPath = window.location.pathname;
                           const url = `/student/test-window?category=${category}&examId=${examId}&testId=${test.testId}&returnUrl=${encodeURIComponent(currentPath)}`;
                           stopTimerAndLaunchTest({ url, testName: test.testName });
                         }}
                       >
                         Reattempt
                       </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full h-9 text-xs font-bold shadow-sm"
                      variant={isLocked ? 'secondary' : 'default'}
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
                         <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Locked</span>
                      ) : effectiveInProgress ? 'Continue' : 'Start Test'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>


        {/* Solutions Modal */}
        {selectedTestForSolutions && (() => {
          const examConfig = generateTestExam(category || '', examId || '', selectedTestForSolutions.testId);
          let storedResponses: Record<string, string | string[] | null> = {};
          try {
            const raw = localStorage.getItem(`exam-responses-${selectedTestForSolutions.testId}`);
            if (raw) storedResponses = JSON.parse(raw);
          } catch { /* ignore */ }
          return (
            <TestSolutions
              isOpen={showSolutionsModal}
              onClose={() => { setShowSolutionsModal(false); setSelectedTestForSolutions(null); }}
              examConfig={examConfig}
              responses={storedResponses}
            />
          );
        })()}

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
        {filteredTests.map((test, idx) => {
          // Safe fallbacks for backward-compat with old localStorage cache
          const totalQuestions = test.totalQuestions ?? test.maxScore;
          const totalMarks = test.totalMarks ?? test.maxScore;
          const totalDuration = test.totalDuration ?? 60;
          const totalStudents = test.totalStudents ?? 45320;
          const isLocked = !isPurchased && idx >= 3;
          // When locked, treat the card as fresh regardless of stored status
          const effectiveStatus = isLocked ? 'not-attempted' : test.status;
          return (
            <Card key={test.testId} className={`p-3 transition-all duration-200 hover:shadow-md ${
              isLocked
                ? 'bg-gray-50 border-gray-200 border-dashed'
                : getStatusBackgroundColor(test.status, test.score, test.maxScore)
            }`}>
              <div className="space-y-3">
                {/* Test Number Badge + Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-start gap-2">
                    {/* Test number badge */}
                    <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-tight">{test.testName} {isLocked && <Badge variant="secondary" className="text-[9px] px-1 ml-1 leading-none py-0.5 align-middle bg-gray-100 text-gray-500">Locked</Badge>}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {getStatusIcon(test.status, isLocked)}
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(test.difficulty)}`}>
                          {test.difficulty}
                        </Badge>
                        {test.lastAttempted && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(test.lastAttempted)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Stats */}
                <div className="space-y-2 text-xs text-gray-600">
                  {effectiveStatus === 'completed' ? (
                    // ── COMPLETED: show result stats ──
                    <>
                      <div className="flex justify-between">
                        <span>Your Score:</span>
                        <span className="font-medium text-green-600">
                          {test.score ?? 0}/{test.maxScore}
                        </span>
                      </div>
                      {test.timeSpent && (
                        <div className="flex justify-between">
                          <span>Time Spent:</span>
                          <span className="font-medium">{Math.floor(test.timeSpent / 60)} min</span>
                        </div>
                      )}
                      {test.rank && (
                        <div className="flex justify-between items-center">
                          <span>Rank:</span>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-3 w-3 text-yellow-500" />
                            <span className="font-medium">#{test.rank}/{totalStudents.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                    </>
                  ) : (
                    // ── FRESH / IN-PROGRESS: show test meta ──
                    <>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" />Questions:</span>
                        <span className="font-medium">{totalQuestions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><Award className="h-3 w-3" />Marks:</span>
                        <span className="font-medium">{totalMarks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Time:</span>
                        <span className="font-medium">{totalDuration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />Students:</span>
                        <span className="font-medium">{totalStudents.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Percentile Bar (completed only) */}
                {effectiveStatus === 'completed' && (
                  <div className="space-y-1">
                    <Progress value={test.percentile ?? 0} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Percentile</span>
                      <span className="font-medium text-blue-600">
                        {test.percentile !== undefined ? `${test.percentile}%` : '—'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t">
                  {effectiveStatus === 'completed' ? (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSolutionClick(test)}
                          className="flex-1 text-xs"
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          Solution
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAnalysisClick(test)}
                          className="flex-1 text-xs"
                        >
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Analysis
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => {
                          const currentPath = window.location.pathname;
                          const url = `/student/test-window?category=${category}&examId=${examId}&testId=${test.testId}&returnUrl=${encodeURIComponent(currentPath)}`;
                          stopTimerAndLaunchTest({ url, testName: test.testName });
                        }}
                      >
                        Reattempt
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      variant={isLocked ? 'secondary' : 'default'}
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
                           <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Locked</span>
                      ) : test.status === 'in-progress' ? 'Continue' : 'Start Test'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Solutions Modal */}
      {selectedTestForSolutions && (() => {
        const examConfig = generateTestExam(category || '', examId || '', selectedTestForSolutions.testId);
        let storedResponses: Record<string, string | string[] | null> = {};
        try {
          const raw = localStorage.getItem(`exam-responses-${selectedTestForSolutions.testId}`);
          if (raw) storedResponses = JSON.parse(raw);
        } catch { /* ignore */ }
        return (
          <TestSolutions
            isOpen={showSolutionsModal}
            onClose={() => { setShowSolutionsModal(false); setSelectedTestForSolutions(null); }}
            examConfig={examConfig}
            responses={storedResponses}
          />
        );
      })()}

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
};
