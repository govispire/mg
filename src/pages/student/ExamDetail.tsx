import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Target, Trophy, Zap, Clock, TrendingUp, Users, Grid3X3, List, CheckCircle2, ShoppingCart } from 'lucide-react';
import { ExamProgressDashboard } from '@/components/student/exam/ExamProgressDashboard';
import { TestTypeGrid } from '@/components/student/exam/TestTypeGrid';
import { ExamPerformanceTab } from '@/components/student/exam/ExamPerformanceTab';
import { SuccessStoriesTab } from '@/components/student/exam/SuccessStoriesTab';
import { HowToStartTab } from '@/components/student/exam/HowToStartTab';
import { SyllabusTab } from '@/components/student/exam/SyllabusTab';
import { PreviousCutoffTab } from '@/components/student/exam/PreviousCutoffTab';
import { DoubtsTab } from '@/components/student/exam/DoubtsTab';
import { useExamProgress } from '@/hooks/useExamProgress';
import { getExamsByCategory } from '@/data/examData';
import { useExamCatalog, type TestSubject } from '@/hooks/useExamCatalog';
import { getExamTheme } from '@/utils/examTheme';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

/** Persist per-exam purchase state in localStorage */
const PURCHASE_KEY = (examId: string) => `exam_purchased_${examId}`;

const ExamDetail = () => {
  const { category, examId } = useParams();
  const [activeTab, setActiveTab] = useState("prelims");
  const [activeSubTab, setActiveSubTab] = useState("full");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { progressData, getTypeProgress, setProgressData, updateTestProgress } = useExamProgress(examId!);

  /* ─── purchase state ─── */
  const [isPurchased, setIsPurchased] = useState<boolean>(() => {
    if (!examId) return false;
    return localStorage.getItem(PURCHASE_KEY(examId)) === 'true';
  });

  const handleBuy = () => {
    if (!examId) return;
    localStorage.setItem(PURCHASE_KEY(examId), 'true');
    setIsPurchased(true);
  };

  const { catalog } = useExamCatalog();

  // Get exam name — try catalog first (for superadmin-created exams), then static examData
  const examName = React.useMemo(() => {
    for (const cat of catalog) {
      for (const sec of cat.sections) {
        const found = sec.exams.find(e => e.id === examId);
        if (found) return found.name;
      }
    }
    const exams = getExamsByCategory(category!);
    const exam = exams.find(e => e.id === examId);
    return exam?.name || (examId ? examId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Exam');
  }, [category, examId, catalog]);

  // Check for test completions on mount and update progress
  useEffect(() => {
    const checkTestCompletions = () => {
      // Check all test types for completions
      Object.keys(progressData.testTypes).forEach((testType) => {
        const tests = progressData.testTypes[testType as keyof typeof progressData.testTypes];
        tests.forEach((test) => {
          const resultKey = `test_result_${test.testId}`;
          const resultStr = localStorage.getItem(resultKey);
          if (resultStr) {
            try {
              const result = JSON.parse(resultStr);
              // Update test progress if it's newly completed
              if (test.status !== 'completed' || test.score !== result.score) {
                updateTestProgress(testType as keyof typeof progressData.testTypes, test.testId, {
                  status: 'completed',
                  score: result.score,
                  timeSpent: result.timeTaken,
                  attempts: (test.attempts || 0) + 1,
                  lastAttempted: new Date().toISOString().split('T')[0]
                });
              }
              // Clean up the result
              localStorage.removeItem(resultKey);
            } catch (error) {
              console.error('Error parsing test result:', error);
            }
          }
        });
      });
    };

    checkTestCompletions();
  }, [progressData.testTypes, updateTestProgress]);

  // Refresh test data when window regains focus (user returns from test window)
  useEffect(() => {
    const handleFocus = () => {
      // Recheck for test completions when user comes back
      Object.keys(progressData.testTypes).forEach((testType) => {
        const tests = progressData.testTypes[testType as keyof typeof progressData.testTypes];
        tests.forEach((test) => {
          const resultKey = `test_result_${test.testId}`;
          const resultStr = localStorage.getItem(resultKey);
          if (resultStr) {
            try {
              const result = JSON.parse(resultStr);
              if (test.status !== 'completed' || test.score !== result.score) {
                updateTestProgress(testType as keyof typeof progressData.testTypes, test.testId, {
                  status: 'completed',
                  score: result.score,
                  timeSpent: result.timeTaken,
                  attempts: (test.attempts || 0) + 1,
                  lastAttempted: new Date().toISOString().split('T')[0]
                });
              }
              localStorage.removeItem(resultKey);
            } catch (error) {
              console.error('Error parsing test result:', error);
            }
          }
        });
      });
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [progressData.testTypes, updateTestProgress]);

  // Update progress data with exam name
  useEffect(() => {
    if (progressData.examName !== examName) {
      setProgressData(prev => ({
        ...prev,
        examName
      }));
    }
  }, [examName, progressData.examName, setProgressData]);

  // Get exam logo — try catalog first, then static examData
  const examLogo = React.useMemo(() => {
    for (const cat of catalog) {
      for (const sec of cat.sections) {
        const found = sec.exams.find(e => e.id === examId);
        if (found) return found.logo;
      }
    }
    const exams = getExamsByCategory(category!);
    const exam = exams.find(e => e.id === examId);
    return exam?.logo || '📚';
  }, [category, examId, catalog]);

  // Check if logo is a URL (contains http/https or starts with /)
  const isLogoUrl = React.useMemo(() => {
    if (typeof examLogo === 'string') {
      return examLogo.includes('http') || examLogo.startsWith('/') || examLogo.includes('cloudinary');
    }
    return false;
  }, [examLogo]);

  const mainTabs = [
    { value: "prelims", label: "Prelims" },
    { value: "mains", label: "Mains" },
    { value: "live", label: "Live" },
    { value: "performance", label: "Performance" },
    { value: "success-stories", label: "Success Stories" },
    { value: "info", label: "Info" }
  ];

  const subTabs = [
    { value: "full", label: "Full Test", type: "prelims" },
    { value: "sectional", label: "Sectional Test", type: "sectional" },
    { value: "speed", label: "Speed Test", type: "speed" },
    { value: "pyq", label: "PYQ Test", type: "pyq" }
  ];

  const getCurrentTestType = () => {
    if (activeTab === "live") return "live";
    if (activeTab === "info") return null;
    if (activeTab === "prelims") {
      switch (activeSubTab) {
        case "full": return "prelims";
        case "sectional": return "sectional";
        case "speed": return "speed";
        case "pyq": return "pyq";
        default: return "prelims";
      }
    }
    if (activeTab === "mains") {
      switch (activeSubTab) {
        case "full": return "mains";
        case "sectional": return "sectional";
        case "speed": return "speed";
        case "pyq": return "pyq";
        default: return "mains";
      }
    }
    return null;
  };

  // Derive the active test slot's subjects from the catalog
  const currentSlotKey = React.useMemo(() => {
    if (activeTab === 'speed') return 'speed';
    if (activeTab === 'live') return 'live';
    if (activeTab === 'prelims' || activeTab === 'mains') {
      return activeSubTab === 'full' ? `${activeTab}_full`
        : activeSubTab === 'sectional' ? `${activeTab}_sectional`
          : activeSubTab === 'speed' ? `${activeTab}_speed`
            : activeSubTab === 'pyq' ? `${activeTab}_pyq`
              : `${activeTab}_full`;
    }
    return '';
  }, [activeTab, activeSubTab]);

  const activeSlotSubjects = React.useMemo((): TestSubject[] => {
    if (!currentSlotKey) return [];
    // Find the current exam in the catalog
    for (const cat of catalog) {
      for (const sec of cat.sections) {
        const found = sec.exams.find(e => e.id === examId);
        if (found) {
          const slot = found.testSlots?.find(s => s.key === currentSlotKey);
          return slot?.subjects ?? [];
        }
      }
    }
    return [];
  }, [catalog, examId, currentSlotKey]);

  // Combine SuperAdmin-created Tests with Mock Progress Data
  const activeSlotTests = React.useMemo((): any[] => {
    if (!currentSlotKey) return [];
    
    // 1. Get tests from catalog
    let catalogSlot: any = null;
    for (const cat of catalog) {
      for (const sec of cat.sections) {
        const found = sec.exams.find(e => e.id === examId);
        if (found) {
          catalogSlot = found.testSlots?.find(s => s.key === currentSlotKey);
        }
      }
    }

    const testTypeKey = getCurrentTestType();
    const progressTests = testTypeKey ? (progressData.testTypes[testTypeKey as keyof typeof progressData.testTypes] || []) : [];

    // Map catalog tests to TestProgress format
    const mappedCatalogTests: any[] = (catalogSlot?.tests || []).filter((t: any) => t.isVisible !== false).map((ct: any) => {
      const prog = progressTests.find((p: any) => p.testId === ct.id);
      return {
        testId: ct.id,
        testName: ct.name,
        status: prog?.status || 'not-attempted',
        score: prog?.score,
        maxScore: ct.maxScore,
        totalQuestions: ct.totalQuestions,
        totalMarks: ct.maxScore,
        totalDuration: ct.durationMinutes,
        totalStudents: prog?.totalStudents || 45320,
        timeSpent: prog?.timeSpent,
        attempts: prog?.attempts || 0,
        lastAttempted: prog?.lastAttempted,
        rank: prog?.rank,
        percentile: prog?.percentile,
        difficulty: ct.difficulty,
        subjectId: ct.subjectId // Only present if SuperAdmin UI allows assigning (not implemented yet, defaults undefined)
      };
    });

    // 2. Filter Mock Tests specifically for the active subTab to avoid showing "Full Tests" under "Sectional Tests".
    let filteredMockTests = progressTests;
    if (currentSlotKey === 'prelims_full') filteredMockTests = progressData.testTypes.prelims;
    else if (currentSlotKey === 'mains_full') filteredMockTests = progressData.testTypes.mains;
    else if (currentSlotKey.includes('sectional')) filteredMockTests = progressData.testTypes.sectional;
    else if (currentSlotKey.includes('speed') || currentSlotKey === 'speed') filteredMockTests = progressData.testTypes.speed;
    else if (currentSlotKey.includes('pyq')) filteredMockTests = progressData.testTypes.pyq;
    else if (currentSlotKey === 'live') filteredMockTests = progressData.testTypes.live;
    else filteredMockTests = [];

    const existingIds = new Set(mappedCatalogTests.map(t => t.testId));
    const uniqueMockTests = filteredMockTests.filter(t => !existingIds.has(t.testId));

    return [...mappedCatalogTests, ...uniqueMockTests];
  }, [catalog, examId, currentSlotKey, progressData.testTypes]);

  // Compute stats on the dynamically merged active tests
  const activeSlotProgress = React.useMemo(() => {
    const completed = activeSlotTests.filter(t => t.status === 'completed').length;
    const totalScore = activeSlotTests.reduce((sum, t) => sum + (t.score || 0), 0);
    const maxPossibleScore = activeSlotTests.reduce((sum, t) => sum + t.maxScore, 0);
    const averageScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    
    return {
      completed,
      total: activeSlotTests.length,
      percentage: activeSlotTests.length > 0 ? Math.round((completed / activeSlotTests.length) * 100) : 0,
      averageScore: Math.round(averageScore),
      bestScore: activeSlotTests.length > 0 ? Math.max(...activeSlotTests.map(t => t.score || 0)) : 0,
      totalAttempts: activeSlotTests.reduce((sum, t) => sum + t.attempts, 0)
    };
  }, [activeSlotTests]);

  // ── Exam theme (unique colour identity per exam) ──────────────────────────
  const theme = React.useMemo(() => getExamTheme(examId, examName), [examId, examName]);

  return (
    <div className="space-y-6">
      {/* ── Back link ── */}
      <div>
        <Link to={`/student/tests/${category}`} className="text-gray-500 flex items-center hover:text-gray-700 text-sm font-medium gap-1.5 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to {category?.replace('-', ' & ')}</span>
        </Link>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          EXAM HEADER CARD  ·  unified surface, state-aware left + right
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl border border-slate-200 overflow-hidden"
        style={{
          borderTop: `3px solid ${theme.borderColor}`,
          boxShadow: '0 2px 12px 0 rgba(0,0,0,.07)',
          background: '#fff',
        }}
      >
        <div className="flex flex-col sm:flex-row items-stretch min-h-[160px]">

          {/* ── LEFT  ── logo · title · stats ── */}
          <div className="flex-1 p-5 sm:p-6 flex gap-4 items-start">

            {/* Logo — 48 × 48, tinted ring that picks up the exam colour */}
            <div
              className="flex-shrink-0 rounded-xl overflow-hidden"
              style={{
                width: 48, height: 48,
                background: `${theme.borderColor}14`,
                border: `2px solid ${theme.borderColor}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 2,
              }}
            >
              {isLogoUrl ? (
                <img
                  src={examLogo as string} alt={examName}
                  style={{ width: 34, height: 34, objectFit: 'contain' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <span style={{ fontSize: 22 }}>{examLogo}</span>
              )}
            </div>

            {/* Title + dashboard */}
            <div className="flex-1 min-w-0">
              {/* Exam name — 22 px / 800 weight */}
              <h1
                className="font-extrabold text-slate-900 leading-tight"
                style={{ fontSize: 22 }}
              >
                {examName}
              </h1>

              {/* State-aware progress dashboard */}
              <ExamProgressDashboard
                progressData={progressData}
                getTypeProgress={getTypeProgress}
                isPurchased={isPurchased}
                totalUsersPublic={3435}
                totalTestsAvailable={120}
                totalCleared={567}
              />
            </div>
          </div>

          {/* ── RIGHT  ── purchase / unlocked panel ─────────────────────── */}
          {/*  Uses a soft tinted column that shares the card's corner radius
               and has matching 24 px internal padding.  No inner border box,
               no extra shadow — it IS part of the card, not on top of it.   */}
          <div
            className="sm:w-60 flex-shrink-0 flex flex-col"
            style={{
              background: isPurchased ? '#f0fdf4' : '#f8fafc',
              borderLeft: '1px solid',
              borderColor: isPurchased ? '#d1fae5' : '#e2e8f0',
              /* inherit the card's rounded-right corners */
              borderRadius: '0 16px 16px 0',
              padding: 24,
            }}
          >
            {isPurchased ? (
              /* ── AFTER PURCHASE: Course Unlocked ── */
              <div className="flex flex-col items-center justify-center gap-3 h-full text-center">
                {/* circle tick */}
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 56, height: 56,
                    background: theme.borderColor,
                    boxShadow: `0 4px 14px 0 ${theme.borderColor}45`,
                  }}
                >
                  <CheckCircle2 style={{ width: 28, height: 28, color: '#fff' }} />
                </div>

                {/* text */}
                <div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>Course Unlocked!</p>
                  <p style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>You have unlocked the full course</p>
                </div>

                {/* CTA */}
                <button
                  onClick={() => setActiveTab('prelims')}
                  className="w-full font-bold text-white transition-opacity hover:opacity-90 active:scale-95"
                  style={{
                    fontSize: 13,
                    padding: '10px 0',
                    borderRadius: 12,
                    background: theme.borderColor,
                    boxShadow: `0 2px 8px 0 ${theme.borderColor}40`,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'opacity .15s, transform .1s',
                  }}
                >
                  Continue Learning
                </button>

                {/* validity */}
                <div
                  className="flex items-center gap-1.5"
                  style={{ fontSize: 11, color: '#94a3b8' }}
                >
                  <Clock style={{ width: 12, height: 12 }} />
                  <span>Valid for 256 days</span>
                </div>
              </div>
            ) : (
              /* ── BEFORE PURCHASE: Buy CTA ── */
              <div className="flex flex-col gap-3 h-full">
                {/* validity badge */}
                <span
                  className="self-start font-bold text-white"
                  style={{
                    fontSize: 10,
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: theme.borderColor,
                  }}
                >
                  Valid for 12 months
                </span>

                {/* package name */}
                <div>
                  <p
                    className="font-extrabold text-slate-800 leading-snug"
                    style={{ fontSize: 14 }}
                  >
                    Get the {examName.split(' ').slice(0, 3).join(' ')} Full Package
                  </p>
                  <span
                    className="inline-block font-semibold"
                    style={{
                      fontSize: 11,
                      marginTop: 6,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: `${theme.borderColor}18`,
                      color: theme.borderColor,
                    }}
                  >
                    Prelims + Mains
                  </span>
                </div>

                {/* price — push to bottom */}
                <div className="mt-auto flex items-baseline gap-2">
                  <span style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'line-through' }}>₹999</span>
                  <span style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>₹299</span>
                </div>

                {/* buy button */}
                <button
                  id="exam-buy-btn"
                  onClick={handleBuy}
                  className="w-full flex items-center justify-center gap-2 font-bold text-white
                             hover:opacity-90 active:scale-95 transition-all"
                  style={{
                    fontSize: 14,
                    padding: '11px 0',
                    borderRadius: 12,
                    background: theme.borderColor,
                    boxShadow: `0 3px 10px 0 ${theme.borderColor}50`,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <ShoppingCart style={{ width: 16, height: 16 }} />
                  Buy
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Main card with tabs + inline progress ── */}
      <Card className="overflow-hidden" style={{ borderTop: `3px solid ${theme.borderColor}` }}>
        <Tabs defaultValue="prelims" value={activeTab} onValueChange={setActiveTab}>
          <div className="bg-gray-50 p-3 sm:p-4 border-b">
            {/* Gradient top stripe */}
            <div className={`h-0.5 w-full bg-gradient-to-r ${theme.gradientClass} mb-3 rounded-full opacity-60`} />
            {/* Main Tabs */}
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-6 min-w-max lg:min-w-0">
                {mainTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="whitespace-nowrap text-xs sm:text-sm"
                    style={activeTab === tab.value ? { color: theme.borderColor, borderBottom: `2px solid ${theme.borderColor}` } : {}}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Sub Tabs for Prelims and Mains */}
            {(activeTab === "prelims" || activeTab === "mains") && (
              <div className="mt-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="overflow-x-auto w-full sm:w-auto">
                    <div className="flex gap-2 min-w-max">
                      {subTabs.map((subTab) => (
                        <Button
                          key={subTab.value}
                          size="sm"
                          onClick={() => setActiveSubTab(subTab.value)}
                          className={`whitespace-nowrap text-xs transition-all ${
                            activeSubTab === subTab.value
                              ? theme.activeTabBtn
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {subTab.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex gap-1 border rounded-lg p-1">
                    <Button
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${ viewMode === 'grid' ? theme.activeTabBtn : 'ghost' }`}
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      style={viewMode === 'grid' ? { backgroundColor: theme.borderColor, color: '#fff' } : {}}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setViewMode('list')}
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      className="p-2"
                      style={viewMode === 'list' ? { backgroundColor: theme.borderColor, color: '#fff' } : {}}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* View Mode Toggle for Live tab */}
            {activeTab === "live" && (
              <div className="mt-4 flex justify-end">
                <div className="flex gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="p-2"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="p-2"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5">
            {/* Prelims / Mains / Live tabs */}
            {['prelims', 'mains', 'live'].map((tabVal) => (
              <TabsContent key={tabVal} value={tabVal} className="mt-0">
                {getCurrentTestType() && (
                  <TestTypeGrid
                    testType={getCurrentTestType()!}
                    tests={activeSlotTests}
                    progress={activeSlotProgress}
                    viewMode={viewMode}
                    subjects={activeSlotSubjects}
                  />
                )}
              </TabsContent>
            ))}

            <TabsContent value="performance" className="mt-0">
              <ExamPerformanceTab examId={examId!} examName={examName} />
            </TabsContent>

            <TabsContent value="success-stories" className="mt-0">
              <SuccessStoriesTab examId={examId!} examName={examName} />
            </TabsContent>

            <TabsContent value="info" className="mt-0">
              <Card className="border-t-4" style={{ borderTopColor: theme.borderColor }}>
                <Tabs defaultValue="how-to-start" className="w-full">
                  <div className="border-b bg-muted/30">
                    <TabsList className="w-full grid grid-cols-4 h-auto p-2 bg-transparent">
                      <TabsTrigger value="how-to-start" className="text-xs sm:text-sm">How to Start</TabsTrigger>
                      <TabsTrigger value="syllabus" className="text-xs sm:text-sm">Syllabus</TabsTrigger>
                      <TabsTrigger value="cutoff" className="text-xs sm:text-sm">Previous Cutoff</TabsTrigger>
                      <TabsTrigger value="doubts" className="text-xs sm:text-sm">Doubts</TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="p-4">
                    <TabsContent value="how-to-start" className="mt-0"><HowToStartTab examId={examId!} examName={examName} /></TabsContent>
                    <TabsContent value="syllabus" className="mt-0"><SyllabusTab examId={examId!} examName={examName} /></TabsContent>
                    <TabsContent value="cutoff" className="mt-0"><PreviousCutoffTab examId={examId!} examName={examName} /></TabsContent>
                    <TabsContent value="doubts" className="mt-0"><DoubtsTab examId={examId!} examName={examName} /></TabsContent>
                  </div>
                </Tabs>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default ExamDetail;
