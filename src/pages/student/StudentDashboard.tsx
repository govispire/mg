import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/providers';
import {
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Bookmark,
  Play,
  Clock,
  FileText,
  CheckCircle,
  Trash2,
  Zap,
  ArrowRight,
  Target,
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Library,
} from 'lucide-react';
import NewsArticleDialog from '@/components/student/NewsArticleDialog';
import StatCardDialog from '@/components/student/StatCardDialog';
import { dailyQuizzes } from '@/data/dailyQuizzesData';
import QuizAttemptIBPS, { QuizResult } from '@/components/student/quiz/QuizAttemptIBPS';
import launchExamWindow from '@/utils/launchExam';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { differenceInDays } from 'date-fns';
import { CompulsoryFormModal, WelcomeMessageModal } from '@/components/auth/UpdatedAuthModal';
import { allArticles } from '@/components/current-affairs/articlesData';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { useCurrentAffairsStore } from '@/hooks/useCurrentAffairsStore';
import { UpcomingLiveTests } from '@/components/student/dashboard/UpcomingLiveTests';
import { UpcomingExamsWidget } from '@/components/student/dashboard/UpcomingExamsWidget';
import { TrendingExams } from '@/components/student/dashboard/TrendingExams';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ExamStatusSummary } from '@/components/student/dashboard/ExamStatusSummary';
import { StatsOverview } from '@/components/student/dashboard/StatsOverview';
import { PerformanceGraph } from '@/components/student/dashboard/PerformanceGraph';
import WordOfTheDayCard from '@/components/student/VocabularyWidget';
import TargetExamCard from '@/components/student/dashboard/TargetExamCard';
import RecentExamNotifications from '@/components/student/dashboard/RecentExamNotifications';
import { courses as allCourses } from '@/data/courseData';
import { DailyGoalsWidget } from '@/components/student/dashboard/DailyGoalsWidget';
import { StudyTimerWidget } from '@/components/student/dashboard/StudyTimerWidget';
import { AdsBanner } from '@/components/student/dashboard/AdsBanner';
import { useDashboardStats } from '@/hooks/useDashboardStats';

interface UserProfile {
  username: string;
  email: string;
  phone: string;
  examCategory: string;
  customExamCategory?: string;
  targetExam: string;
  customTargetExam?: string;
  preparationStartDate: Date | null;
  state: string;
  avatar?: string;
}

// ── Featured Courses (Udemy-style) ─────────────────────────────────────────
const FeaturedCoursesSection = ({ navigate }: { navigate: (path: string) => void }) => {
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll: advances every 3s, pauses on hover, loops back to start
  React.useEffect(() => {
    if (hoveredCourse) return; // pause when a card is hovered
    const interval = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 220, behavior: 'smooth' });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [hoveredCourse]);

  const enrolledIds: string[] = (() => {
    try { return JSON.parse(localStorage.getItem('enrolledCourseIds') || '[]'); } catch { return []; }
  })();

  // Only show Banking exam courses
  const filteredCourses = allCourses.filter(c => c.category === 'banking');

  const getBadge = (course: typeof allCourses[0]) => {
    if (course.isPopular && course.isTrending) return { label: 'Highest Rated', color: 'bg-amber-400 text-black' };
    if (course.isPopular) return { label: 'Bestseller', color: 'bg-amber-400 text-black' };
    if (course.isTrending) return { label: 'Trending', color: 'bg-orange-500 text-white' };
    return null;
  };

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  const getHighlights = (course: typeof allCourses[0]) => [
    `${course.videosCount}+ video lessons covering all topics`,
    `${course.testsCount} practice tests and mock exams`,
    `${course.chaptersCount} chapters across ${course.subjects.length} subjects`,
    'Expert faculty with proven track record',
  ];

  return (
    <div className="space-y-0 bg-white border border-border/60 rounded-2xl shadow-sm" style={{ overflow: 'visible' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center mb-1">
          <h3 className="font-bold text-base text-slate-900">Featured Courses</h3>
          <span className="ml-2 text-[11px] text-slate-400 font-medium">Banking Exams</span>
        </div>
      </div>

      {/* Scrollable Cards Row */}
      <div className="relative px-3 py-4" style={{ overflow: 'visible' }}>
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-slate-700" />
        </button>

        {/* Card scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth px-6 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overflowY: 'visible' } as React.CSSProperties}
        >
          {filteredCourses.map((course) => {
            const isEnrolled = !!course.progress || enrolledIds.includes(course.id);
            const badge = getBadge(course);

            return (
              <div
                key={course.id}
                className="relative flex-none w-48 group cursor-pointer"
                onMouseEnter={() => setHoveredCourse(course.id)}
                onMouseLeave={() => setHoveredCourse(null)}
                onClick={() => navigate(`/student/courses/${course.id}`)}
              >
                {/* Card */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-all h-full">
                  {/* Thumbnail */}
                  <div className="relative overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Card Body */}
                  <div className="p-2.5 space-y-1.5">
                    <h4 className="font-semibold text-[11px] leading-snug text-slate-900 line-clamp-2">{course.title}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{course.instructor}</p>

                    {/* Badge + Rating */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${badge.color}`}>
                          {badge.label}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-semibold">
                        ★ {course.rating}
                      </span>
                      <span className="text-[9px] text-slate-400">({course.studentsCount.toLocaleString()})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 pt-0.5">
                      <span className="text-sm font-bold text-slate-900">₹{course.price.toLocaleString()}</span>
                      {course.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through">₹{course.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Popout — vertically centered on the card so all content is visible */}
                {hoveredCourse === course.id && (
                  <div
                    className="absolute top-1/2 left-full ml-2 z-50 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl p-4"
                    style={{ minWidth: '240px', pointerEvents: 'auto', transform: 'translateY(-50%)' }}
                    onMouseEnter={() => setHoveredCourse(course.id)}
                    onMouseLeave={() => setHoveredCourse(null)}
                  >
                    <h4 className="font-bold text-sm text-slate-900 mb-2 leading-snug">{course.title}</h4>

                    {/* Badge + Updated */}
                    <div className="flex items-center gap-2 mb-2">
                      {badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${badge.color}`}>
                          {badge.label}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">Updated <strong>2025</strong></span>
                    </div>

                    <p className="text-[10px] text-slate-500 mb-2">
                      {course.videosCount} total hours · All Levels · Subtitles
                    </p>

                    <p className="text-xs text-slate-700 mb-3 leading-relaxed">
                      Master {course.title.split(' ').slice(0, 4).join(' ')} with comprehensive video lessons, mock tests and expert guidance.
                    </p>

                    {/* Bullet highlights */}
                    <ul className="space-y-1.5 mb-4">
                      {getHighlights(course).map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-700">
                          <span className="text-green-600 mt-0.5 shrink-0">✓</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      className="w-full bg-primary text-white text-xs font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      {isEnrolled ? 'Continue Course' : 'Enroll Now'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-slate-700" />
        </button>
      </div>

    </div>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attendanceView, setAttendanceView] = useState<'week' | 'month'>('week');
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [statDialogType, setStatDialogType] = useState<'journey' | 'hours' | 'active' | 'tests' | 'tasks' | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [isAutoSlide, setIsAutoSlide] = useState(true);

  // Post-signup modal states
  const [showCompulsoryForm, setShowCompulsoryForm] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  // Load presence and completions from localStorage
  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDateLocal(new Date());
  const [studentPresence, setStudentPresence] = useState(() =>
    JSON.parse(localStorage.getItem('studentPresence') || '{}')
  );
  const [quizCompletions, setQuizCompletions] = useState(() =>
    JSON.parse(localStorage.getItem('quizCompletions') || '{}')
  );

  const [hasTakenTestToday, setHasTakenTestToday] = useState(!!studentPresence[todayStr]);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Listen for changes in localStorage (in case quiz completed in another tab or same tab navigation)
  React.useEffect(() => {
    const checkPresence = () => {
      const pData = JSON.parse(localStorage.getItem('studentPresence') || '{}');
      const cData = JSON.parse(localStorage.getItem('quizCompletions') || '{}');
      setStudentPresence(pData);
      setQuizCompletions(cData);
      setHasTakenTestToday(!!pData[todayStr]);
    };
    window.addEventListener('storage', checkPresence);
    checkPresence(); // Initial check
    return () => window.removeEventListener('storage', checkPresence);
  }, [todayStr]);


  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('userProfile', null);

  // Check for profile completion on mount
  React.useEffect(() => {
    // Check if user has dismissed the form
    const hasUserDismissedForm = localStorage.getItem('compulsoryFormDismissed') === 'true';

    // For new users or incomplete profiles, show the form ONLY if not dismissed
    if (!userProfile?.preparationStartDate && !activeQuiz && !hasUserDismissedForm) {
      const timer = setTimeout(() => {
        setShowCompulsoryForm(true);
      }, 1000); // 1 second delay
      return () => clearTimeout(timer);
    }
  }, [userProfile?.preparationStartDate, activeQuiz, user?.id]);

  // Live store — picks up admin-created articles + cross-tab sync
  const { getNewsArticles } = useCurrentAffairsStore();

  // Saved Articles Logic for Sheet
  const { savedArticleIds, toggleSave, isSaved } = useSavedArticles();
  const safeAllArticlesList = Array.isArray(allArticles) ? allArticles : [];
  const safeSavedIds = Array.isArray(savedArticleIds) ? savedArticleIds : [];
  const savedArticlesList = safeAllArticlesList.filter(article => article && article.id && safeSavedIds.includes(article.id));
  const [savedSheetOpen, setSavedSheetOpen] = useState(false);

  const handleCompulsoryFormComplete = (data: any) => {
    // Store complete profile data locally
    const profileData: UserProfile = {
      username: user?.name || 'Student',
      email: user?.email || '',
      phone: '',
      examCategory: data.examCategory,
      customExamCategory: data.customExamCategory,
      targetExam: data.targetExam,
      customTargetExam: data.customTargetExam,
      preparationStartDate: data.preparationStartDate,
      state: data.state,
      avatar: data.avatar
    };
    setUserProfile(profileData);

    setShowCompulsoryForm(false);
    setShowWelcomeMessage(true);
  };

  const handleInstantUpdate = (data: Partial<UserProfile>) => {
    if (!userProfile) {
      setUserProfile({
        username: user?.name || 'Student',
        email: user?.email || '',
        phone: '',
        examCategory: 'banking',
        targetExam: '',
        preparationStartDate: null,
        state: '',
        ...data
      });
    } else {
      setUserProfile({
        ...userProfile,
        ...data
      });
    }
  };

  // Dynamic values from profile
  const targetExamName = userProfile?.targetExam === 'others'
    ? userProfile?.customTargetExam || 'General'
    : userProfile?.targetExam?.toUpperCase().replace('-', ' ') || 'IBPS PO';

  const examCategoryName = userProfile?.examCategory === 'others'
    ? userProfile?.customExamCategory || 'General'
    : userProfile?.examCategory?.charAt(0).toUpperCase() + userProfile?.examCategory?.slice(1) || 'Banking';

  // Calculate journey days
  const journeyDays = userProfile?.preparationStartDate
    ? differenceInDays(new Date(), new Date(userProfile.preparationStartDate))
    : 0;

  // Selected exams (fallback or personalized)
  const selectedExams = [targetExamName, 'SBI Clerk', 'RRB NTPC']; // You could fetch related exams based on category here

  // Current affairs — sourced from live store (includes admin-created articles)
  const sortedArticles = getNewsArticles(); // already sorted newest-first

  // Get visible articles based on current index (sliding window of 3)
  const visibleArticles = [];
  if (sortedArticles.length > 0) {
    for (let i = 0; i < 3; i++) {
      const index = (currentNewsIndex + i) % sortedArticles.length;
      if (sortedArticles[index]) {
        visibleArticles.push(sortedArticles[index]);
      }
    }
  }

  const currentAffairsData = visibleArticles
    .filter(article => article && article.id)
    .map(article => ({
      id: article.id,
      title: article.title,
      description: (article as any).excerpt || '',
      category: article.category || 'General',
      image: article.image || '',
      content: article.content || ''
    }));

  // Real stats from localStorage activity
  const dashStats = useDashboardStats();
  const performanceData = dashStats.performanceData;

  // Dynamic Date Logic
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();

  // Generate dynamic presence data
  // Week view data (Mon-Sun of current week)
  const getWeekDays = () => {
    const curr = new Date();
    const day = curr.getDay();
    const diff = curr.getDate() - (day === 0 ? 6 : day - 1); // Adjust for Monday start (0 is Sunday)
    const days = [];

    // Create new date object to avoid mutating 'curr'
    const monday = new Date(curr);
    monday.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const next = new Date(monday);
      next.setDate(monday.getDate() + i);
      days.push(next.getDate());
    }
    return days;
  };
  const weekDays = getWeekDays();

  // Free tests/quizzes data - Pull today's quizzes from centralized data
  // Free tests/quizzes data - Pull quizzes for SELECTED date
  const allFreteTestsForDate = dailyQuizzes.filter(q => q.scheduledDate === selectedDate);

  // Select diverse quiz types (one from each type) for better variety
  const getDeiverseQuizzes = (quizzes: any[], limit: number = 5) => {
    const quizzesByType = new Map<string, any[]>();

    // Group quizzes by type
    quizzes.forEach(quiz => {
      if (!quizzesByType.has(quiz.type)) {
        quizzesByType.set(quiz.type, []);
      }
      quizzesByType.get(quiz.type)!.push(quiz);
    });

    const selectedQuizzes: any[] = [];
    const types = Array.from(quizzesByType.keys());

    // Round-robin selection to ensure variety
    let typeIndex = 0;
    while (selectedQuizzes.length < limit && selectedQuizzes.length < quizzes.length) {
      const currentType = types[typeIndex % types.length];
      const quizzesOfType = quizzesByType.get(currentType);

      if (quizzesOfType && quizzesOfType.length > 0) {
        selectedQuizzes.push(quizzesOfType.shift()!);
      }

      typeIndex++;

      // If we've gone through all types and still have empty ones, remove them
      if (typeIndex % types.length === 0) {
        const emptyTypes = types.filter(t => quizzesByType.get(t)?.length === 0);
        emptyTypes.forEach(t => {
          const idx = types.indexOf(t);
          if (idx > -1) types.splice(idx, 1);
        });
        if (types.length === 0) break;
      }
    }

    return selectedQuizzes;
  };

  const freeTests = getDeiverseQuizzes(allFreteTestsForDate, 5);

  const handleNewsClick = (news: any) => {
    setSelectedNews(news);
    setNewsDialogOpen(true);
  };

  const handlePrevNews = () => {
    setCurrentNewsIndex((prev) => (prev - 1 + sortedArticles.length) % sortedArticles.length);
  };

  const handleNextNews = () => {
    setCurrentNewsIndex((prev) => (prev + 1) % sortedArticles.length);
  };

  // Auto-slide effect - Moved here to avoid ReferenceError
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoSlide && !newsDialogOpen && sortedArticles.length > 0) {
      interval = setInterval(() => {
        handleNextNews();
      }, 5000); // Slide every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isAutoSlide, newsDialogOpen, sortedArticles.length]);

  const handleStartTest = (quiz: any) => {
    launchExamWindow({
      quizId: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      duration: quiz.duration,
      questions: quiz.questions,
    });
  };

  const handleQuizComplete = (result: QuizResult) => {
    const cData = JSON.parse(localStorage.getItem('quizCompletions') || '{}');
    cData[result.quizId] = {
      completed: true,
      score: result.score,
      date: new Date().toISOString()
    };
    localStorage.setItem('quizCompletions', JSON.stringify(cData));
    setQuizCompletions(cData);

    // Count how many quizzes completed TODAY
    const completedToday = Object.values(cData).filter((q: any) =>
      q.completed && q.date.startsWith(todayStr)
    ).length;

    // Update presence in localStorage ONLY if at least 2 quizzes completed
    const pData = JSON.parse(localStorage.getItem('studentPresence') || '{}');
    if (completedToday >= 2) {
      pData[todayStr] = true;
      localStorage.setItem('studentPresence', JSON.stringify(pData));
      setHasTakenTestToday(true);
      setStudentPresence(pData);
      toast.success(`🎉 Daily goal reached! Presence marked for today.`);
    } else {
      toast.info(`One more to go! Complete 2 quizzes to mark today's presence.`);
    }


    toast.success(`🎉 Quiz completed! Score: ${result.score}%`);
  };

  const firstName = (userProfile?.username || user?.name || 'Student').split(' ')[0];

  // ── Tab state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'overview' | 'practice' | 'performance' | 'resources'>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard, description: 'Goals, stats & today\'s focus' },
    { id: 'practice' as const, label: 'Practice', icon: BookOpen, description: 'Tests, quizzes & study timer' },
    { id: 'performance' as const, label: 'Performance', icon: TrendingUp, description: 'Analytics & progress tracking' },
    { id: 'resources' as const, label: 'Resources', icon: Library, description: 'Courses, news & exam updates' },
  ] as const;

  return (
    <div className="min-h-screen db-bg">
    <div className="max-w-7xl mx-auto px-3 py-4">

      {/* ═══════════════════════════════════════════════════════
          TARGET EXAM BANNER — always visible
         ═══════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <TargetExamCard
          targetExam={targetExamName}
          examCategory={examCategoryName}
          userName={userProfile?.username || user?.name || 'Student'}
          preparationStartDate={userProfile?.preparationStartDate || null}
          liveOverallPct={dashStats.avgScore}
        />
      </div>

      {/* ADS BANNER is now embedded inside TargetExamCard above */}

      {/* ═══════════════════════════════════════════════════════
          TAB NAVIGATION — sticky header
         ═══════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 rounded-t-xl -mx-3 px-3 pt-0 pb-0 mb-6">
        <div className="flex items-center justify-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 flex-1 py-3.5 transition-all border-b-2 ${
                  isActive
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50/60 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB CONTENT — only active tab renders
         ═══════════════════════════════════════════════════════ */}
      <div className="space-y-8">

        {/* ──────────────────────────────────────────────────────
            OVERVIEW TAB — Daily focus & quick stats
           ────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">

            {/* Stats Row */}
            <StatsOverview
              journeyDays={journeyDays}
              userName={userProfile?.username || user?.name || 'Student'}
              studyHours={dashStats.studyHours}
              activeStreak={dashStats.activeStreak}
              mockTestsTaken={dashStats.mockTestsTaken}
              onCardClick={setStatDialogType}
            />

            {/* Goals + Timer */}
            <div className="flex flex-col xl:flex-row gap-6 items-stretch">
              <div className="flex-1 xl:w-[70%]">
                <DailyGoalsWidget />
              </div>
              <div className="flex-1 xl:w-[30%] bg-white rounded-xl border border-slate-200 p-4">
                <StudyTimerWidget />
              </div>
            </div>

            {/* Exam Status — Current Exams */}
            <ExamStatusSummary />

            {/* Upcoming Exams — immediately below current exams */}
            <UpcomingExamsWidget />
          </div>
        )}

        {/* ──────────────────────────────────────────────────────
            PRACTICE TAB — Tests, quizzes & timer
           ────────────────────────────────────────────────────── */}
        {activeTab === 'practice' && (
          <div className="space-y-8 animate-in fade-in duration-200">

            {/* Daily Free Tests - Full View */}
            <Card className="p-6 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center shadow-sm">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[16px] text-slate-800 leading-none">Daily Free Tests</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{freeTests.length} tests available today</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {freeTests.map((test, idx) => {
                  const isCompleted = !!quizCompletions[test.id];
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                        isCompleted
                          ? 'bg-slate-50 border-slate-100 opacity-70'
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                          isCompleted ? 'bg-slate-100' : 'bg-emerald-50'
                        }`}>
                          <FileText className={`h-5 w-5 ${isCompleted ? 'text-slate-400' : 'text-emerald-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-[13px] truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>{test.title}</p>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{test.questions} Questions</span>
                            <span className="text-slate-300">•</span>
                            <span>{test.duration} mins</span>
                            <span className="text-slate-300">•</span>
                            <span className="capitalize">{test.difficulty}</span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 ml-4">
                        {isCompleted ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Completed
                          </div>
                        ) : (
                          <Button size="sm" className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[12px] font-semibold" onClick={() => handleStartTest(test)}>
                            <Play className="h-3.5 w-3.5 mr-1.5" strokeWidth={3} />
                            Start Test
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Upcoming Live Tests */}
            <UpcomingLiveTests />
          </div>
        )}

        {/* ──────────────────────────────────────────────────────
            PERFORMANCE TAB — Analytics & progress
           ────────────────────────────────────────────────────── */}
        {activeTab === 'performance' && (
          <div className="space-y-6 animate-in fade-in duration-200">

            {/* ── Row 1: Graph (60%) + Percentile (40%) ── */}
            <div className="flex flex-col xl:flex-row gap-6 items-stretch">

              {/* Performance Graph — 60% */}
              <div className="flex-[3] min-w-0">
                <PerformanceGraph data={performanceData} />
              </div>

              {/* Exam Percentile — 40% */}
              <div className="flex-[2] min-w-0 bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-sm">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-[15px] text-slate-800">Exam Percentile</h3>
                </div>

                {/* Gauge */}
                <div className="relative w-full h-28 mb-3">
                  <svg className="w-full h-full" viewBox="0 0 200 100">
                    <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
                    <path d="M 20 90 A 80 80 0 0 1 68 24"  fill="none" stroke="#fca5a5" strokeWidth="14" strokeLinecap="round" />
                    <path d="M 68 24 A 80 80 0 0 1 132 24" fill="none" stroke="#fdba74" strokeWidth="14" strokeLinecap="round" />
                    <path d="M 132 24 A 80 80 0 0 1 180 90" fill="none" stroke="#86efac" strokeWidth="14" strokeLinecap="round" />
                    <path d="M 20 90 A 80 80 0 0 1 164 38" fill="none" stroke="hsl(var(--primary))" strokeWidth="10" strokeLinecap="round" />
                    <g transform="translate(100, 90)">
                      <line x1="0" y1="0" x2="0" y2="-62" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" transform="rotate(-43)" />
                      <circle cx="0" cy="0" r="5" fill="hsl(var(--primary))" />
                    </g>
                    <text x="12" y="96" fontSize="9" fill="#94a3b8">0</text>
                    <text x="89" y="13" fontSize="9" fill="#94a3b8">50</text>
                    <text x="185" y="96" fontSize="9" fill="#94a3b8" textAnchor="end">100</text>
                  </svg>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                    <div className="text-3xl font-black text-primary leading-none">{dashStats.percentile > 0 ? dashStats.percentile.toFixed(1) : '—'}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{dashStats.percentile > 0 ? 'Percentile' : 'No data yet'}</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-1 mt-auto">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-[12px] text-slate-500">Student</span>
                    <span className="text-[12px] font-semibold text-slate-800 truncate ml-2">{userProfile?.username || user?.name || 'Student'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-[12px] text-slate-500">Target Exam</span>
                    <span className="text-[12px] font-semibold text-primary">{targetExamName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-[12px] text-slate-500">Percentile</span>
                    <span className={`text-[12px] font-bold ${dashStats.percentile > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>{dashStats.percentile > 0 ? `${dashStats.percentile}` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <span className="text-lg">🏆</span>
                    <div>
                      <div className="text-[11px] font-bold text-emerald-700">Excellent Performance</div>
                      <div className="text-[10px] text-emerald-600">Top 12.5% of all aspirants</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Row 2: Recent Exam Notifications — full width ── */}
            <RecentExamNotifications />
          </div>
        )}

        {/* ──────────────────────────────────────────────────────
            RESOURCES TAB — Courses, news & exam updates
           ────────────────────────────────────────────────────── */}
        {activeTab === 'resources' && (
          <div className="space-y-8 animate-in fade-in duration-200">

            {/* Featured Courses */}
            <FeaturedCoursesSection navigate={navigate} />

            {/* Current Affairs Section */}
            <Card className="p-5 bg-white border border-slate-200 rounded-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Newspaper className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-slate-800 leading-none">Current Affairs</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Latest news &amp; updates</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Auto Slide Toggle */}
                  <button
                    onClick={() => setIsAutoSlide(!isAutoSlide)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${
                      isAutoSlide
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isAutoSlide ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {isAutoSlide ? 'Auto' : 'Manual'}
                  </button>

                  {/* Saved Articles Sheet */}
                  <Sheet open={savedSheetOpen} onOpenChange={setSavedSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                        <Bookmark className="h-4 w-4" />
                        {savedArticleIds.length > 0 && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px]">
                      <SheetHeader>
                        <SheetTitle>Saved Articles</SheetTitle>
                      </SheetHeader>
                      <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
                        {savedArticlesList.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">No saved articles yet</p>
                        ) : (
                          <div className="space-y-3">
                            {savedArticlesList.map(article => (
                              <div key={article.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <img src={(article as any).imageUrl || (article as any).image || ''} alt="" className="w-16 h-12 object-cover rounded-md shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium line-clamp-2">{article.title}</p>
                                  <p className="text-[10px] text-slate-400 mt-1">{(article as any).date}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-slate-400 hover:text-red-500 shrink-0"
                                  onClick={() => toggleSave(article.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>

                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setIsAutoSlide(false); setCurrentNewsIndex((prev) => (prev - 1 + sortedArticles.length) % sortedArticles.length); }}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setIsAutoSlide(false); setCurrentNewsIndex((prev) => (prev + 1) % sortedArticles.length); }}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Articles — 3-column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentAffairsData.map((item, idx) => (
                  <div
                    key={idx}
                    className="group cursor-pointer bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all duration-200 hover:-translate-y-0.5"
                    onClick={() => { setSelectedNews(item); setNewsDialogOpen(true); }}
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden h-36">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <Newspaper className="h-8 w-8 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {/* Category pill */}
                      <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wide bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    {/* Body */}
                    <div className="p-3">
                      <p className="font-semibold text-[13px] text-slate-800 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400">{(item as any).date || 'Today'}</span>
                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                          Read more <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Auto-slide progress bar */}
              {isAutoSlide && (
                <div className="h-0.5 bg-slate-100 mt-4 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-emerald-400/60 animate-pulse origin-left"></div>
                </div>
              )}
            </Card>
          </div>
        )}

      </div>{/* /tab content */}

      {/* ── Dialogs & Modals ── */}
      <NewsArticleDialog article={selectedNews} open={newsDialogOpen} onOpenChange={setNewsDialogOpen} />

      {/* Stat Card Detail Dialogs */}
      {statDialogType && (
        <StatCardDialog
          type={statDialogType}
          open={!!statDialogType}
          onOpenChange={(open) => !open && setStatDialogType(null)}
          preparationStartDate={userProfile?.preparationStartDate}
        />
      )}

      {/* Post-Signup Modals */}
      <CompulsoryFormModal
        open={showCompulsoryForm}
        onOpenChange={setShowCompulsoryForm}
        username={user?.name || 'Student'}
        onInstantUpdate={handleInstantUpdate}
        onComplete={handleCompulsoryFormComplete}
      />

      <WelcomeMessageModal
        open={showWelcomeMessage}
        onOpenChange={setShowWelcomeMessage}
        username={user?.name || 'Student'}
        userInitial={(user?.name || 'S').charAt(0).toUpperCase()}
        userAvatar={userProfile?.avatar}
      />
    </div>
    </div>
  );
};

export default StudentDashboard;
