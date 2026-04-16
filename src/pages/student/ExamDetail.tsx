import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Target, Trophy, Zap, Clock, TrendingUp, Users, Grid3X3, List } from 'lucide-react';
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

const ExamDetail = () => {
  const { category, examId } = useParams();
  const [activeTab, setActiveTab] = useState("prelims");
  const [activeSubTab, setActiveSubTab] = useState("full");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { progressData, getTypeProgress, setProgressData, updateTestProgress } = useExamProgress(examId!);

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

      {/* ── Header card (testbook-style) ── */}
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        style={{ borderTop: `3px solid ${theme.borderColor}` }}
      >
        <div className="flex flex-col sm:flex-row items-start gap-0">

          {/* LEFT — logo + title + chips */}
          <div className="flex-1 p-4 sm:p-5 flex gap-3 sm:gap-4 items-start">
            {/* Logo */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden mt-0.5"
              style={{ background: `${theme.borderColor}18`, border: `1.5px solid ${theme.borderColor}40` }}
            >
              {isLogoUrl ? (
                <img src={examLogo as string} alt={examName} className="w-8 h-8 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <span className="text-2xl">{examLogo}</span>
              )}
            </div>

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">{examName}</h1>

              {/* Compact stats + rings — inside header */}
              <div className="mt-3">
                <ExamProgressDashboard
                  progressData={progressData}
                  getTypeProgress={getTypeProgress}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — price panel (sticky top-right) */}
          <div
            className="sm:w-52 border-t sm:border-t-0 sm:border-l border-slate-200 p-4 flex flex-col gap-3 bg-slate-50 sm:rounded-tr-2xl sm:sticky sm:top-4 self-start"
          >
            {/* Validity badge */}
            <span
              className="self-start text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: theme.borderColor }}
            >
              Validity: 12 Month(s)
            </span>

            {/* Pack name + desc */}
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">{examName.split(' ').slice(0, 2).join(' ')} PRE</p>
              <p className="text-[11px] text-slate-500 mt-0.5">15 + 15 (2025 + 2026) Mock Tests</p>
            </div>

            {/* Price row */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 line-through">₹379</span>
              <span className="text-lg font-extrabold text-slate-900">₹199</span>
              <button
                className="ml-auto text-xs font-bold text-white px-3 py-1.5 rounded-lg"
                style={{ background: theme.borderColor }}
              >
                Buy Now
              </button>
            </div>
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
