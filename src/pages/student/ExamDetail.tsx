import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Target, Trophy, Zap, Clock, TrendingUp, Users, Grid3X3, List, CheckCircle2, ShoppingCart, Calendar, Award, PlayCircle, Shield, Brain } from 'lucide-react';
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
          NEW EXAM HEADER CARD
      ══════════════════════════════════════════════════════════════════════ */}
      {!isPurchased ? (
        /* ── BEFORE PURCHASE ── */
        <div className="flex flex-col sm:flex-row bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
          {/* LEFT SIDE */}
          <div className="flex-1 p-5 sm:p-7">
            <div className="text-[10px] font-bold text-blue-600 mb-1 tracking-wider uppercase">TARGET EXAMINATION</div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-50 flex items-center justify-center rounded-xl border border-gray-100 flex-shrink-0">
                {isLogoUrl ? (
                  <img src={examLogo as string} alt={examName} className="w-9 h-9 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <span className="text-3xl">{examLogo}</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{examName}</h1>
            </div>
            <p className="text-sm font-bold text-gray-500 mt-2 mb-6">Prelims + Mains + Interview</p>

            {/* STATS */}
            <div className="flex flex-wrap gap-y-2 sm:divide-x divide-blue-100 py-3 border-t border-b border-blue-100 mb-4 bg-white/70 rounded-t-xl px-2 overflow-x-auto">
              <div className="flex-1 min-w-[80px] text-center py-2 sm:py-1">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Users</div>
                <div className="text-xl font-black text-gray-900 mt-1">3,435</div>
              </div>
              <div className="flex-1 min-w-[80px] text-center py-2 sm:py-1">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Tests Available</div>
                <div className="text-xl font-black text-gray-900 mt-1">120</div>
              </div>
              <div className="flex-1 min-w-[80px] text-center py-2 sm:py-1">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total People Cleared</div>
                <div className="text-xl font-black text-gray-900 mt-1">567</div>
              </div>
            </div>

            {/* TEST TYPE COUNTS */}
            <div className="flex flex-wrap py-3 border-b border-blue-100 px-2 gap-y-4 overflow-x-auto">
              <div className="w-1/2 sm:flex-1 text-center py-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Test Prelims</div>
                <div className="text-lg font-bold text-gray-700 mt-1">60</div>
              </div>
              <div className="hidden sm:block w-px bg-gray-200 mx-2"></div>
              <div className="w-1/2 sm:flex-1 text-center py-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Test Mains</div>
                <div className="text-lg font-bold text-gray-700 mt-1">60</div>
              </div>
              <div className="hidden sm:block w-px bg-gray-200 mx-2"></div>
              <div className="w-1/2 sm:flex-1 text-center py-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sectional Test</div>
                <div className="text-lg font-bold text-gray-700 mt-1">40</div>
              </div>
              <div className="hidden sm:block w-px bg-gray-200 mx-2"></div>
              <div className="w-1/2 sm:flex-1 text-center py-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Speed Test</div>
                <div className="text-lg font-bold text-gray-700 mt-1">30</div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="sm:w-[280px] border-t-4 sm:border-t-0 sm:border-l-[6px] border-green-500 p-5 sm:p-6 flex flex-col justify-center items-center text-center bg-[#f8fafc]">
            <div className="bg-green-500 text-white font-bold text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Validity : 12 Month</div>
            <div className="font-semibold text-gray-500 text-sm">Prelims + Mains</div>
            <div className="font-black text-gray-900 text-xl mt-1.5 mb-5">{examName.split(' ').slice(0, 3).join(' ')} Full Package</div>
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-gray-400 font-bold text-lg line-through">₹999</span>
              <span className="text-gray-900 font-black text-4xl">₹299</span>
            </div>
            <button onClick={handleBuy} className="bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-3.5 px-6 rounded-full shadow-lg shadow-green-500/30 transition-all w-full flex items-center justify-center gap-2 active:scale-95">
              <ShoppingCart className="w-5 h-5"/> Buy Now
            </button>
          </div>
        </div>
      ) : (
        /* ── AFTER PURCHASE ── */
        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* LEFT SIDE */}
          <div className="flex-1 p-5 sm:p-7 flex flex-col">
            <div className="flex flex-col xl:flex-row gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-gray-50 flex items-center justify-center rounded-xl border border-gray-100 flex-shrink-0">
                    {isLogoUrl ? (
                      <img src={examLogo as string} alt={examName} className="w-9 h-9 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <span className="text-3xl">{examLogo}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">Target Examination</div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{examName}</h1>
                    <p className="text-sm font-semibold text-gray-500 mt-1">Preliminary Examination - {(Math.floor(Math.random() * 5000) + 5000).toLocaleString()} Vacancies</p>
                  </div>
                </div>
                {/* Meta details */}
                <div className="flex flex-wrap gap-4 mt-5">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-gray-700">
                    <Calendar className="w-4 h-4 text-primary" /> <span className="font-bold text-[13px]">5 Oct 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-gray-700">
                    <Clock className="w-4 h-4 text-primary" /> <span className="font-bold text-[13px]">45 min</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-gray-700">
                    <Award className="w-4 h-4 text-primary" /> <span className="font-bold text-[13px]">80 Marks</span>
                  </div>
                </div>
              </div>

              {/* Progress Rings */}
              <div className="flex items-center flex-wrap gap-3 xl:justify-end shrink-0 overflow-x-auto">
                {(() => {
                  /* Calculate simple progress percentages for visual purposes based on the user's data */
                  const typeKeys = Object.keys(progressData.testTypes) as (keyof typeof progressData.testTypes)[];
                  const totalCompleted = typeKeys.reduce((s, k) => s + getTypeProgress(k).completed, 0);
                  const totalTests = typeKeys.reduce((s, k) => s + getTypeProgress(k).total, 0) || 120;
                  
                  const ringData = [
                    { label: 'Overall', pct: progressData.overallProgress || 0, color: '#10b981' },
                    { label: 'Quantitative', pct: Math.min(Math.round((progressData.overallProgress || 0) * 0.9 + 5), 100), color: '#3b82f6' },
                    { label: 'Reasoning', pct: Math.min(Math.round((progressData.overallProgress || 0) * 1.1), 100), color: '#8b5cf6' },
                    { label: 'English', pct: Math.min(Math.round((progressData.overallProgress || 0) * 0.85 + 10), 100), color: '#f59e0b' },
                    { label: 'Gen. Aware', pct: Math.min(Math.round((progressData.overallProgress || 0) * 0.75 + 15), 100), color: '#ec4899' },
                  ];

                  return ringData.map((ring, idx) => {
                    const size = 68;
                    const stroke = 6;
                    const r = (size - stroke) / 2;
                    const circ = 2 * Math.PI * r;
                    const dash = (Math.max(0, Math.min(ring.pct, 100)) / 100) * circ;
                    
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="relative" style={{ width: size, height: size }}>
                          <svg width={size} height={size} className="block -rotate-90">
                            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
                            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={ring.color} strokeWidth={stroke} strokeLinecap="round" 
                              strokeDasharray={`${dash} ${circ - dash}`} 
                              style={{ transition: 'stroke-dasharray 1s ease-out' }} />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center font-bold text-gray-800" style={{ fontSize: 13 }}>
                            {ring.pct}%
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-2">{ring.label}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Action Buttons */}
            {/* Tests Completed Summary Cards */}
            {(() => {
              const typeKeys = Object.keys(progressData.testTypes) as (keyof typeof progressData.testTypes)[];
              const totalCompleted = typeKeys.reduce((s, k) => s + getTypeProgress(k).completed, 0);
              const totalTests = typeKeys.reduce((s, k) => s + getTypeProgress(k).total, 0) || 120;
              const types = [
                { label: 'Prelims', key: 'prelims' as const, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { label: 'Mains', key: 'mains' as const, color: 'bg-purple-50 border-purple-200 text-purple-700' },
                { label: 'Sectional', key: 'sectional' as const, color: 'bg-green-50 border-green-200 text-green-700' },
                { label: 'Speed', key: 'speed' as const, color: 'bg-orange-50 border-orange-200 text-orange-700' },
              ];
              return (
                <div className="mb-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tests Completed</span>
                    <span className="text-[11px] font-bold text-primary">{totalCompleted} / {totalTests} Total</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {types.map(t => {
                      const prog = getTypeProgress(t.key);
                      const pct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
                      return (
                        <div key={t.key} className={`rounded-xl border px-3 py-2.5 ${t.color}`}>
                          <div className="text-[10px] font-bold uppercase tracking-wide opacity-70 mb-1">{t.label}</div>
                          <div className="text-lg font-black leading-none">{prog.completed}<span className="text-xs font-semibold opacity-60">/{prog.total}</span></div>
                          <div className="mt-1.5 h-1 bg-black/10 rounded-full overflow-hidden">
                            <div className="h-full bg-current rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <div className="mt-auto flex flex-wrap items-center gap-2 sm:gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setActiveTab('prelims')} className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-xs sm:text-sm">
                <PlayCircle className="w-4 sm:w-5 h-4 sm:h-5"/> Start Full Mock
              </button>
              <button className="border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all active:scale-95 text-xs sm:text-sm">
                View Syllabus
              </button>
              <button className="border-2 border-violet-200 hover:border-violet-300 hover:bg-violet-50 text-violet-700 font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all active:scale-95 text-xs sm:text-sm flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Weakness Predictor
              </button>
            </div>
          </div>

          {/* RIGHT SIDE Gradient Countdown */}
          <div className="md:w-[260px] bg-gradient-to-br from-blue-600 to-teal-400 p-8 flex flex-col justify-center items-center text-white relative overflow-hidden shrink-0">
             {/* Decorative background circles */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
             <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
             
             <div className="text-[72px] font-black leading-none drop-shadow-md pb-2 z-10 flex items-baseline">
               170
             </div>
             <div className="text-sm font-black uppercase tracking-[0.25em] opacity-90 pb-1 z-10">Days Left</div>
             <div className="text-[10px] uppercase font-bold opacity-75 tracking-wider mt-1 border-t border-white/20 pt-2 w-full text-center z-10">To Exam Day</div>
          </div>
        </div>
      )}

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
                    isPurchased={isPurchased}
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
