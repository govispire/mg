import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Target, Trophy, Zap, Clock, TrendingUp, Users, Grid3X3, List, CheckCircle2, ShoppingCart, Calendar, Award, PlayCircle, Shield, Brain, HelpCircle, FileText, BookOpen } from 'lucide-react';
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
import { WeaknessDetectionModal } from '@/components/student/exam/WeaknessDetectionModal';
import { HowToStartModal } from '@/components/student/exam/HowToStartModal';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

/** Persist per-exam purchase state in localStorage */
const PURCHASE_KEY = (examId: string) => `exam_purchased_${examId}`;

const ExamDetail = () => {
  const { category, examId } = useParams();
  const [activeTab, setActiveTab] = useState("prelims");
  const [activeSubTab, setActiveSubTab] = useState("full");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [weaknessOpen, setWeaknessOpen] = useState(false);
  const [howToStartOpen, setHowToStartOpen] = useState(false);
  const [countdownSlide, setCountdownSlide] = useState(0);
  const { progressData, getTypeProgress, setProgressData, updateTestProgress } = useExamProgress(examId!);

  // Auto-slide countdown panel every 3 s
  useEffect(() => {
    const t = setInterval(() => setCountdownSlide(s => s + 1), 3000);
    return () => clearInterval(t);
  }, []);

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

  // Compute per-slot test totals grouped by main tab (Prelims / Mains / Live)
  // Total = ALL tests across ALL sub-tabs (full + sectional + speed + pyq) per main tab
  const tabGroupProgress = React.useMemo(() => {
    const getSlotData = (slotKey: string) => {
      // 1. Find tests in catalog slot
      let catalogTests: any[] = [];
      for (const cat of catalog) {
        for (const sec of cat.sections) {
          const found = sec.exams.find(e => e.id === examId);
          if (found) {
            const slot = found.testSlots?.find((s: any) => s.key === slotKey);
            if (slot) { catalogTests = (slot.tests || []).filter((t: any) => t.isVisible !== false); break; }
          }
        }
        if (catalogTests.length > 0) break;
      }
      // 2. Map slot key → progressData key for completed tracking
      const progKeyMap: Record<string, keyof typeof progressData.testTypes> = {
        'prelims_full': 'prelims',     'mains_full': 'mains',
        'prelims_sectional': 'sectional', 'mains_sectional': 'sectional',
        'prelims_speed': 'speed',      'mains_speed': 'speed',
        'prelims_pyq': 'pyq',          'mains_pyq': 'pyq',
        'live': 'live',
      };
      const progKey = progKeyMap[slotKey];
      const progressTests = progKey ? (progressData.testTypes[progKey] || []) : [];

      if (catalogTests.length > 0) {
        // Use catalog as source of truth for totals
        return {
          total: catalogTests.length,
          completed: catalogTests.filter(ct =>
            progressTests.find((p: any) => p.testId === ct.id)?.status === 'completed'
          ).length,
        };
      }
      // 3. Fallback to mock progressData for all slot types
      return {
        total: progressTests.length,
        completed: progressTests.filter((t: any) => t.status === 'completed').length,
      };
    };

    const p = {
      full:      getSlotData('prelims_full'),
      sectional: getSlotData('prelims_sectional'),
      speed:     getSlotData('prelims_speed'),
      pyq:       getSlotData('prelims_pyq'),
    };
    const m = {
      full:      getSlotData('mains_full'),
      sectional: getSlotData('mains_sectional'),
      speed:     getSlotData('mains_speed'),
      pyq:       getSlotData('mains_pyq'),
    };
    const live = getSlotData('live');
    const sum = (obj: Record<string, { total: number; completed: number }>) =>
      Object.values(obj).reduce((a, b) => ({ total: a.total + b.total, completed: a.completed + b.completed }), { total: 0, completed: 0 });
    const pt = sum(p);
    const mt = sum(m);
    return { p, m, live, pt, mt, grand: { total: pt.total + mt.total + live.total, completed: pt.completed + mt.completed + live.completed } };
  }, [catalog, examId, progressData.testTypes]);


  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* ══ LEFT PANEL ══ */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col gap-5">

            {/* Row 1: Identity + Progress Rings */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex-1">
                <div className="text-[10px] font-extrabold text-primary uppercase tracking-widest mb-2">Target Examination</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    {isLogoUrl
                      ? <img src={examLogo as string} alt={examName} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      : <span className="text-2xl">{examLogo}</span>}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-none">{examName}</h1>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Preliminary Examination · {(Math.floor(Math.random() * 5000) + 5000).toLocaleString()} Vacancies</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: <Calendar className="w-3.5 h-3.5" />, label: '5 Oct 2026' },
                    { icon: <Clock className="w-3.5 h-3.5" />, label: '45 min' },
                    { icon: <Award className="w-3.5 h-3.5" />, label: '80 Marks' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
                      <span className="text-primary">{icon}</span>{label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress rings — Overall prominent, subjects aligned */}
              <div className="flex items-end gap-5 flex-wrap shrink-0">
                {(() => {
                  const rings = [
                    { label: 'OVERALL',   pct: progressData.overallProgress || 0,                                          color: '#10b981', size: 82, stroke: 7, textSize: 14 },
                    { label: 'QUANT',     pct: Math.min(Math.round((progressData.overallProgress || 0) * 0.9 + 5), 100),   color: '#3b82f6', size: 60, stroke: 5, textSize: 11 },
                    { label: 'REASONING', pct: Math.min(Math.round((progressData.overallProgress || 0) * 1.1), 100),        color: '#8b5cf6', size: 60, stroke: 5, textSize: 11 },
                    { label: 'ENGLISH',   pct: Math.min(Math.round((progressData.overallProgress || 0) * 0.85 + 10), 100), color: '#f59e0b', size: 60, stroke: 5, textSize: 11 },
                    { label: 'GEN. AWR.', pct: Math.min(Math.round((progressData.overallProgress || 0) * 0.75 + 15), 100), color: '#ec4899', size: 60, stroke: 5, textSize: 11 },
                  ];
                  return rings.map((ring, idx) => {
                    const r = (ring.size - ring.stroke) / 2;
                    const circ = 2 * Math.PI * r;
                    const dash = (Math.max(0, Math.min(ring.pct, 100)) / 100) * circ;
                    return (
                      <div key={idx} className="flex flex-col items-center" style={{ gap: 5 }}>
                        <div className="relative" style={{ width: ring.size, height: ring.size }}>
                          <svg width={ring.size} height={ring.size} className="-rotate-90">
                            <circle cx={ring.size/2} cy={ring.size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={ring.stroke} />
                            <circle cx={ring.size/2} cy={ring.size/2} r={r} fill="none" stroke={ring.color} strokeWidth={ring.stroke} strokeLinecap="round"
                              strokeDasharray={`${dash} ${circ - dash}`} style={{ transition: 'stroke-dasharray 1s ease-out' }} />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center font-black text-gray-800" style={{ fontSize: ring.textSize }}>{ring.pct}%</span>
                        </div>
                        <span className="font-bold text-gray-400 uppercase tracking-wider text-center whitespace-nowrap" style={{ fontSize: 8 }}>{ring.label}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Row 2: Test completion cards */}
            {(() => {
              const { p, m, live, pt, mt, grand } = tabGroupProgress;
              const tabs = [
                {
                  label: 'Prelims', icon: <FileText className="w-4 h-4" />,
                  total: pt.total, completed: pt.completed,
                  accent: '#3b82f6', iconBg: '#eff6ff', iconColor: '#2563eb',
                  subs: [{ label: 'Full Test', ...p.full }, { label: 'Sectional', ...p.sectional }, { label: 'Speed', ...p.speed }, { label: 'PYQ', ...p.pyq }],
                },
                {
                  label: 'Mains', icon: <BookOpen className="w-4 h-4" />,
                  total: mt.total, completed: mt.completed,
                  accent: '#8b5cf6', iconBg: '#f5f3ff', iconColor: '#7c3aed',
                  subs: [{ label: 'Full Test', ...m.full }, { label: 'Sectional', ...m.sectional }, { label: 'Speed', ...m.speed }, { label: 'PYQ', ...m.pyq }],
                },
                {
                  label: 'Live Test', icon: <Zap className="w-4 h-4" />,
                  total: live.total, completed: live.completed,
                  accent: '#10b981', iconBg: '#ecfdf5', iconColor: '#059669',
                  subs: [],
                },
              ];
              return (
                <div className="rounded-2xl bg-gray-50/60 px-4 py-3">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Preparation Progress</span>
                    <span className="text-[10px] font-extrabold" style={{ color: '#16a34a' }}>{grand.completed} / {grand.total} Total</span>
                  </div>
                  {/* Horizontal 3-column white cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {tabs.map(tab => {
                      const pct = tab.total > 0 ? Math.round((tab.completed / tab.total) * 100) : 0;
                      return (
                        <div key={tab.label} className="bg-white rounded-xl px-3 py-2.5" style={{ border: '1px solid #EEF2F7', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
                          {/* Top row: icon + label + fraction */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: tab.iconBg, color: tab.iconColor }}>
                                {tab.icon}
                              </div>
                              <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: tab.iconColor }}>{tab.label}</span>
                            </div>
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-[18px] font-black" style={{ color: tab.iconColor }}>{tab.completed}</span>
                              <span className="text-[11px] font-bold text-gray-400">/{tab.total}</span>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: tab.accent }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Row 3: Action buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-5">
              <button onClick={() => setActiveTab('prelims')} className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl shadow-md shadow-primary/20 transition-all active:scale-95 text-sm">
                <PlayCircle className="w-4 h-4" /> Start Full Mock
              </button>
              <button className="border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" /> View Syllabus
              </button>
              <button onClick={() => setWeaknessOpen(true)} className="border border-violet-200 hover:border-violet-300 hover:bg-violet-50 text-violet-700 font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 text-sm flex items-center gap-2">
                <Brain className="w-4 h-4" /> Weakness Predictor
                <span className="text-[9px] font-black bg-violet-600 text-white px-1.5 py-0.5 rounded">AI</span>
              </button>
              <button onClick={() => setHowToStartOpen(true)} className="border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> How to Start
              </button>
              <WeaknessDetectionModal isOpen={weaknessOpen} onClose={() => setWeaknessOpen(false)} examId={examId} examName={examName} />
              <HowToStartModal isOpen={howToStartOpen} onClose={() => setHowToStartOpen(false)} examName={examName} examId={examId} />

            </div>
          </div>

          {/* ══ RIGHT PANEL — Auto-sliding Countdown ══ */}
          {(() => {
            const examPhases = [
              { label: 'Prelims', date: '5 Oct 2026', days: 150, gradient: 'linear-gradient(160deg,#2563eb,#0ea5e9,#06b6d4)' },
              { label: 'Mains',   date: '18 Jan 2027', days: 255, gradient: 'linear-gradient(160deg,#7c3aed,#6d28d9,#4f46e5)' },
            ];
            const slide = examPhases[countdownSlide % examPhases.length];
            return (
              <div className="md:w-[195px] flex flex-col items-center text-white relative overflow-hidden shrink-0 p-5 pt-4"
                style={{ background: slide.gradient, transition: 'background 0.6s ease' }}>
                {/* Decorative blobs */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-16 -left-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                {/* Top row: phase label + calendar */}
                <div className="relative z-10 w-full flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">{slide.label}</span>
                  <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                {/* Countdown block */}
                <div className="relative z-10 text-center flex-1 flex flex-col justify-center">
                  <div className="text-[11px] font-extrabold uppercase tracking-widest opacity-75 mb-1">Your Countdown</div>
                  <div className="font-black leading-none tabular-nums drop-shadow-lg" style={{ fontSize: 62, transition: 'opacity 0.4s' }}>{slide.days}</div>
                  <div className="text-[13px] font-black uppercase tracking-[0.2em] opacity-90 mt-1">Days Left</div>
                  <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-0.5">To {slide.label} Day</div>
                </div>
                {/* Date pill */}
                <div className="relative z-10 w-full bg-white/15 border border-white/25 rounded-xl px-3 py-2.5 flex items-center gap-2.5 mt-4">
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <div className="font-black text-white text-sm leading-tight">{slide.date}</div>
                    <div className="text-[9px] text-white/65 font-semibold">{slide.label} Exam Date</div>
                  </div>
                </div>
                {/* Dot indicators */}
                <div className="relative z-10 flex items-center gap-1.5 mt-3">
                  {examPhases.map((_, i) => (
                    <button key={i} onClick={() => setCountdownSlide(i)}
                      className="rounded-full transition-all duration-300"
                      style={{ width: i === countdownSlide % examPhases.length ? 16 : 6, height: 6, background: i === countdownSlide % examPhases.length ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)' }} />
                  ))}
                </div>
              </div>
            );
          })()}
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
