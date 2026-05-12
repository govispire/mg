import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Target, Trophy, Zap, Clock, TrendingUp, Users, Grid3X3, List, CheckCircle2, ShoppingCart, Calendar, Award, PlayCircle, Shield, Brain, HelpCircle, FileText, BookOpen, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { getActiveAds, recordClick, recordImpression, getSlideDuration, type AdBanner } from '@/data/adsStore';
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

  // ── Ads panel state (same system as TargetExamCard) ──────────────────────
  const [panelAds, setPanelAds] = useState<AdBanner[]>([]);
  const [panelSlideIdx, setPanelSlideIdx] = useState(0);
  const panelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelImpressionTracked = useRef<Set<string>>(new Set());

  const loadPanelAds = useCallback(() => {
    setPanelAds(getActiveAds(
      { categoryId: category?.toLowerCase(), examId: examId?.toLowerCase() },
      'days_left_panel',
    ));
  }, [category, examId]);

  useEffect(() => {
    loadPanelAds();
    const h = (e: StorageEvent) => { if (e.key === 'superadmin_ad_banners') loadPanelAds(); };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, [loadPanelAds]);

  const panelTotalSlides = 1 + panelAds.length;

  // Track impressions for ads
  useEffect(() => {
    if (panelSlideIdx === 0) return;
    const ad = panelAds[panelSlideIdx - 1];
    if (ad && !panelImpressionTracked.current.has(ad.id)) {
      panelImpressionTracked.current.add(ad.id);
      recordImpression(ad.id);
    }
  }, [panelSlideIdx, panelAds]);

  // Auto-advance panel slides
  useEffect(() => {
    if (panelTotalSlides <= 1) return;
    if (panelTimerRef.current) clearTimeout(panelTimerRef.current);
    const currentAd = panelSlideIdx > 0 ? panelAds[panelSlideIdx - 1] : null;
    const ms = currentAd ? getSlideDuration(currentAd.adType) : 6000;
    panelTimerRef.current = setTimeout(() => {
      setPanelSlideIdx(prev => (prev + 1) % panelTotalSlides);
    }, ms);
    return () => { if (panelTimerRef.current) clearTimeout(panelTimerRef.current); };
  }, [panelSlideIdx, panelTotalSlides, panelAds]);

  // Guard: reset if ads removed
  useEffect(() => {
    if (panelSlideIdx >= panelTotalSlides) setPanelSlideIdx(0);
  }, [panelTotalSlides]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePanelAdClick = (ad: AdBanner) => {
    recordClick(ad.id);
    if (ad.ctaUrl) {
      ad.ctaUrl.startsWith('/') ? (window.location.href = ad.ctaUrl) : window.open(ad.ctaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  /* ─── purchase state ─── */
  const [isPurchased, setIsPurchased] = useState<boolean>(() => {
    if (!examId) return false;
    return localStorage.getItem(PURCHASE_KEY(examId)) === 'true';
  });

  const handleBuy = () => {
    if (!examId) return;
    localStorage.setItem(PURCHASE_KEY(examId), 'true');
    // ── Sync selected exam to dashboard TargetExamCard ───────────────────
    localStorage.setItem('student_selected_exam', JSON.stringify({
      examId,
      examName: examName || examId,
      category: category || '',
      purchasedAt: new Date().toISOString(),
    }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'student_selected_exam' }));
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
        /* ── BEFORE PURCHASE — Premium redesign ── */
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ══ LEFT — Exam Info ══ */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* ── Hero Section ── */}
            <div className="p-6 pb-5 relative overflow-hidden bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/30">
              {/* Decorative blobs */}
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-20 w-24 h-24 bg-blue-100/30 rounded-full blur-xl pointer-events-none" />

              {/* TARGET EXAMINATION badge */}
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                <CheckCircle2 className="w-3 h-3" /> TARGET EXAMINATION
              </div>

              {/* Logo + Name + Cap row */}
              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    {isLogoUrl ? (
                      <img src={examLogo as string} alt={examName} className="w-11 h-11 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <span className="text-4xl">{examLogo}</span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">{examName}</h1>
                    <p className="text-sm font-semibold text-gray-500 mt-0.5">Prelims + Mains</p>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                      Crack {examName} with smart mock tests,<br />AI analysis &amp; structured preparation.
                    </p>
                  </div>
                </div>
                {/* Graduation cap decoration */}
                <div className="hidden sm:flex flex-col items-center justify-center flex-shrink-0 relative">
                  <div className="text-7xl select-none drop-shadow-md">🎓</div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center shadow">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>

              {/* Feature chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { icon: '📈', label: 'AI Performance Analysis' },
                  { icon: '📄', label: 'Detailed Solutions' },
                  { icon: '🏆', label: 'All India Ranking' },
                  { icon: '🖥️', label: 'Real Exam Interface' },
                ].map(chip => (
                  <div key={chip.label} className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <span className="text-sm">{chip.icon}</span> {chip.label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Compact Stats Row ── */}
            <div className="grid grid-cols-3 border-t border-b border-gray-100 bg-slate-50/60">
              {[
                { icon: <Users className="w-4 h-4 text-blue-500" />, value: '3.4K+', label: 'Students Enrolled', color: 'text-blue-700' },
                { icon: <FileText className="w-4 h-4 text-violet-500" />, value: '120', label: 'Mock Tests', color: 'text-violet-700' },
                { icon: <Trophy className="w-4 h-4 text-amber-500" />, value: '567', label: 'Selections Achieved', color: 'text-amber-700' },
              ].map((s, i) => (
                <div key={s.label} className={`flex items-center gap-2.5 px-4 py-3 ${i < 2 ? 'border-r border-gray-100' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0">{s.icon}</div>
                  <div>
                    <div className={`text-xl font-black ${s.color} leading-none`}>{s.value}</div>
                    <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Mock Tests Included ── */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-800">Mock Tests Included</span>
                <span className="text-xs font-bold text-gray-400">Total <span className="text-gray-700">210 Tests</span></span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <FileText className="w-5 h-5" />, label: 'Prelims Mock Tests', count: 60, sub: 'Full Length Tests', color: 'text-emerald-600', iconBg: 'bg-emerald-50', border: 'border-emerald-300', primary: true },
                  { icon: <BookOpen className="w-5 h-5" />, label: 'Mains Mock Tests', count: 60, sub: 'Full Length Tests', color: 'text-violet-600', iconBg: 'bg-violet-50', border: 'border-gray-200', primary: false },
                  { icon: <Grid3X3 className="w-5 h-5" />, label: 'Sectional Tests', count: 40, sub: 'Topic Wise Tests', color: 'text-amber-600', iconBg: 'bg-amber-50', border: 'border-gray-200', primary: false },
                  { icon: <Zap className="w-5 h-5" />, label: 'Speed Tests', count: 30, sub: 'Time Based Tests', color: 'text-rose-600', iconBg: 'bg-rose-50', border: 'border-gray-200', primary: false },
                ].map(t => (
                  <div key={t.label}
                    className={`rounded-xl border-2 ${t.border} p-3 flex flex-col gap-2 hover:shadow-md transition-shadow cursor-pointer ${t.primary ? 'bg-emerald-50/40' : 'bg-white'}`}>
                    <div className={`w-9 h-9 rounded-lg ${t.iconBg} ${t.color} flex items-center justify-center`}>{t.icon}</div>
                    <div className="text-[11px] font-bold text-gray-700 leading-tight">{t.label}</div>
                    <div className={`text-lg font-black ${t.color}`}>{t.count} Tests</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-medium">{t.sub}</span>
                      <div className={`w-5 h-5 rounded-full border-2 ${t.border} flex items-center justify-center`}>
                        <ArrowLeft className={`w-3 h-3 ${t.color} rotate-180`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Social Proof Bar ── */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50/60">
              <div className="flex -space-x-2">
                {['🧑🏫', '👩‍💻', '👨‍🎓', '👩‍🏫'].map((e, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-white border-2 border-white shadow text-sm flex items-center justify-center">{e}</div>
                ))}
              </div>
              <span className="text-xs text-gray-500 font-semibold flex-1">
                Trusted by <span className="font-black text-gray-800">1,00,000+</span> aspirants across India
              </span>
              <div className="flex items-center gap-1 ml-auto">
                <div className="flex">{'⭐⭐⭐⭐⭐'.split('').map((s, i) => <span key={i} className="text-sm">{s}</span>)}</div>
                <span className="text-xs font-bold text-gray-600">4.8/5</span>
              </div>
              <span className="text-xs text-gray-400 font-semibold hidden sm:block">12,000+ Reviews</span>
            </div>
          </div>

          {/* ══ RIGHT — Pricing Card ══ */}
          <div className="lg:w-[300px] w-full bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex-shrink-0 flex flex-col">
            {/* Validity header */}
            <div className="flex items-center justify-center gap-1.5 bg-emerald-500 py-3">
              <Shield className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">12 Month Validity</span>
            </div>

            <div className="p-5 flex flex-col">
              {/* Most Popular badge */}
              <div className="flex justify-center mb-3">
                <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-600 text-[11px] font-bold px-3 py-1 rounded-full">
                  🔥 MOST POPULAR
                </div>
              </div>

              {/* Package name */}
              <div className="text-center mb-4">
                <div className="font-black text-gray-900 text-lg leading-snug">{examName.split(' ').slice(0, 4).join(' ')} Full Package</div>
                <div className="text-xs text-gray-400 font-semibold mt-0.5">Prelims + Mains</div>
              </div>

              {/* Pricing */}
              <div className="flex items-center justify-center gap-3 mb-1">
                <span className="text-gray-400 font-bold text-base line-through">₹1,999</span>
                <span className="bg-red-500 text-white font-bold text-xs px-2.5 py-1 rounded-full">85% OFF</span>
              </div>
              <div className="text-center mb-2">
                <span className="text-6xl font-black text-gray-900">₹<span>299</span></span>
              </div>
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold px-3 py-1 rounded-full">
                  🏷️ You Save ₹1,700
                </div>
              </div>

              {/* Benefits checklist */}
              <div className="space-y-2 mb-5">
                {[
                  'Instant Access After Payment',
                  '12 Month Validity',
                  'Updated as per latest syllabus',
                  'Mock Tests + AI Performance Analysis',
                  'Detailed Solutions & Explanations',
                ].map(b => (
                  <div key={b} className="flex items-start gap-2.5 text-xs text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{b}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={handleBuy}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-base py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" /> Start Preparation →
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] text-gray-400 font-semibold">
                <Shield className="w-3 h-3 text-emerald-500" /> Secure &amp; Safe Payment
              </div>

              {/* Urgency strip */}
              <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-[11px] font-bold text-emerald-700">342 students enrolled this week</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 ml-auto flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

      ) : (
        /* ── AFTER PURCHASE ── */
        <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* ══ LEFT PANEL ══ */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col gap-4">

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
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <div className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        <Users className="w-3 h-3" /> 3.4K+ Students Enrolled
                      </div>
                      <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        <Trophy className="w-3 h-3" /> 567 People Cleared
                      </div>
                    </div>
                  </div>
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

          {/* ══ RIGHT PANEL — Countdown + Superadmin Ads ══ */}
          <div
            className="md:w-[260px] flex-shrink-0 relative overflow-hidden group select-none"
            style={{ background: 'linear-gradient(160deg,#2563eb,#0ea5e9,#06b6d4)', minHeight: 220 }}
          >
            {/* Slide 0 — Days Left */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-white transition-opacity duration-500 p-6"
              style={{ opacity: panelSlideIdx === 0 ? 1 : 0, pointerEvents: panelSlideIdx === 0 ? 'auto' : 'none' }}
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-8 -left-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="text-[10px] font-extrabold uppercase tracking-widest opacity-75 mb-1">Your Countdown</div>
                <div className="font-black leading-none tabular-nums drop-shadow-lg" style={{ fontSize: 68 }}>150</div>
                <div className="text-[13px] font-black uppercase tracking-[0.2em] opacity-90 mt-1">Days Left</div>
                <div className="mt-2 w-10 h-0.5 bg-white/40 rounded-full" />
                <div className="mt-1.5 text-[10px] opacity-70 tracking-wide font-medium uppercase">To Prelims Day</div>
                <div className="mt-4 bg-white/15 border border-white/25 rounded-xl px-3 py-2 flex items-center gap-2 w-full">
                  <Calendar className="w-3.5 h-3.5 text-white flex-shrink-0" />
                  <div>
                    <div className="font-black text-white text-xs leading-tight">5 Oct 2026</div>
                    <div className="text-[9px] text-white/65 font-semibold">Prelims Exam Date</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slides 1..n — Superadmin Ads */}
            {panelAds.map((ad, idx) => (
              <div
                key={ad.id}
                className="absolute inset-0 flex flex-col transition-opacity duration-500"
                style={{
                  opacity: panelSlideIdx === idx + 1 ? 1 : 0,
                  pointerEvents: panelSlideIdx === idx + 1 ? 'auto' : 'none',
                  background: ad.imageDataUrl ? undefined : (ad.bgColor || 'linear-gradient(135deg,#1e40af,#10b981)'),
                }}
              >
                {ad.imageDataUrl && (
                  <img src={ad.imageDataUrl} alt={ad.title || 'Ad'} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                )}
                {ad.title ? (
                  <>
                    {ad.imageDataUrl && <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/65" />}
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="pt-3 px-3 shrink-0">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/70 bg-black/25 px-2 py-0.5 rounded-full">
                          {ad.adType === 'exam' ? '🎯 Exam' : ad.adType === 'course' ? '📚 Course' : ad.adType === 'announcement' ? '📢 News' : '🔥 Offer'}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center text-center px-3 py-2 gap-1.5">
                        <p className="font-black text-white text-sm leading-tight line-clamp-4" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{ad.title}</p>
                        {ad.subtitle && <p className="text-white/80 text-[10px] leading-snug line-clamp-2">{ad.subtitle}</p>}
                      </div>
                      <div className="shrink-0 pb-8 px-3 flex justify-center">
                        {ad.ctaText && (
                          <button type="button" onClick={() => handlePanelAdClick(ad)}
                            className="inline-flex items-center gap-1 bg-white text-slate-900 font-bold text-[10px] px-3 py-1.5 rounded-full shadow-md hover:scale-105 transition-transform">
                            {ad.ctaText} <ExternalLink className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  ad.ctaText && (
                    <>
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent z-10" />
                      <div className="absolute bottom-7 left-0 right-0 z-20 flex justify-center">
                        <button type="button" onClick={() => handlePanelAdClick(ad)}
                          className="inline-flex items-center gap-1 bg-white text-slate-900 font-bold text-[10px] px-3 py-1.5 rounded-full shadow-md hover:scale-105 transition-transform">
                          {ad.ctaText} <ExternalLink className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </>
                  )
                )}
              </div>
            ))}

            {/* Navigation — only when ads exist */}
            {panelAds.length > 0 && (
              <>
                <button type="button" onClick={() => setPanelSlideIdx(p => (p - 1 + panelTotalSlides) % panelTotalSlides)}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => setPanelSlideIdx(p => (p + 1) % panelTotalSlides)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-3 w-3" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-30">
                  {Array.from({ length: panelTotalSlides }).map((_, i) => (
                    <button type="button" key={i} onClick={() => setPanelSlideIdx(i)}
                      className={`rounded-full transition-all duration-300 ${i === panelSlideIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}




      {/* ── Main card with tabs + inline progress ── */}

      <Card className="overflow-hidden" style={{ borderTop: `3px solid ${theme.borderColor}` }}>
        <Tabs defaultValue="prelims" value={activeTab} onValueChange={setActiveTab}>
          <div className="bg-slate-50 p-3 sm:p-4 border-b">
            {/* Gradient top stripe */}
            <div className={`h-0.5 w-full bg-gradient-to-r ${theme.gradientClass} mb-3 rounded-full opacity-60`} />
            {/* Main Tabs — pill style matching dashboard */}
            <div className="bg-white border border-slate-200 rounded-xl flex items-center gap-1 px-1 py-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {mainTabs.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`flex-1 py-2.5 px-3 sm:px-4 rounded-lg transition-all text-xs sm:text-sm whitespace-nowrap text-center ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200 font-semibold'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
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

          <div className="p-4 sm:p-5 bg-slate-50">
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
