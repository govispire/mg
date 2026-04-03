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

  return (
    <div className="min-h-screen bg-slate-50">
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-2">

        {/* ── TOP ROW: Target Exam Card — full width ── */}
        <div className="w-full">
          <TargetExamCard
            targetExam={targetExamName}
            examCategory={examCategoryName}
            userName={userProfile?.username || user?.name || 'Student'}
            preparationStartDate={userProfile?.preparationStartDate || null}
          />
        </div>

        {/* ── MAIN 2-COLUMN LAYOUT: Stats + Content | Sidebar ── */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-5 w-full lg:w-auto">

          {/* 1. Stats Cards */}
          <StatsOverview
            journeyDays={journeyDays}
            userName={userProfile?.username || user?.name || 'Student'}
            studyHours={dashStats.studyHours}
            activeStreak={dashStats.activeStreak}
            mockTestsTaken={dashStats.mockTestsTaken}
            onCardClick={setStatDialogType}
          />

          {/* 2. Daily Goals — most important, shown first */}
          <DailyGoalsWidget />

          {/* 3. Performance Graph + Percentile + Word of the Day */}
          <div className="flex flex-col xl:flex-row gap-4">
            {/* Performance Graph */}
            <div className="w-full xl:w-1/2 flex flex-col">
              <PerformanceGraph data={performanceData} />
            </div>

            {/* Percentile Speedometer */}
            <div className="w-full xl:w-1/4 flex flex-col">
              <Card className="p-6 bg-white border border-slate-200 shadow-sm flex flex-col items-center relative overflow-hidden rounded-2xl h-full w-full">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 w-full text-left">Your Bank Exam Percentile</h3>

                {/* Speedometer Gauge */}
                <div className="relative w-48 h-24 mb-4">
                  <svg className="w-full h-full" viewBox="0 0 200 100">
                    {/* Background Arc */}
                    <path
                      d="M 20 90 A 80 80 0 0 1 180 90"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />

                    {/* Colored Segments */}
                    {/* Red segment (0-40) */}
                    <path
                      d="M 20 90 A 80 80 0 0 1 68 24"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="12"
                      strokeLinecap="round"
                      opacity="0.3"
                    />

                    {/* Orange segment (40-70) */}
                    <path
                      d="M 68 24 A 80 80 0 0 1 132 24"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="12"
                      strokeLinecap="round"
                      opacity="0.3"
                    />

                    {/* Green segment (70-100) */}
                    <path
                      d="M 132 24 A 80 80 0 0 1 180 90"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="12"
                      strokeLinecap="round"
                      opacity="0.3"
                    />

                    {/* Active Progress - 87.5% (example) */}
                    <path
                      d="M 20 90 A 80 80 0 0 1 164 38"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="12"
                      strokeLinecap="round"
                      className="drop-shadow-lg"
                    />

                    {/* Needle - pointing to 87.5 */}
                    <g transform="translate(100, 90)">
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="-65"
                        stroke="hsl(var(--foreground))"
                        strokeWidth="3"
                        strokeLinecap="round"
                        transform="rotate(-43)"
                        className="drop-shadow-md"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="6"
                        fill="hsl(var(--primary))"
                        className="drop-shadow-lg"
                      />
                    </g>

                    {/* Scale markers */}
                    <text x="10" y="95" className="text-xs fill-muted-foreground" fontSize="10">0</text>
                    <text x="90" y="15" className="text-xs fill-muted-foreground" fontSize="10">50</text>
                    <text x="185" y="95" className="text-xs fill-muted-foreground" fontSize="10" textAnchor="end">100</text>
                  </svg>

                  {/* Center Value */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                    <div className="text-3xl font-bold text-primary">{dashStats.percentile > 0 ? dashStats.percentile.toFixed(1) : '—'}</div>
                    <div className="text-xs text-muted-foreground">{dashStats.percentile > 0 ? 'Percentile' : 'No data yet'}</div>
                  </div>
                </div>

                {/* Student Info */}
                <div className="w-full space-y-2 mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Student:</span>
                    <span className="font-semibold">{userProfile?.username || user?.name || 'Student User'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-semibold text-primary">{targetExamName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Avg Percentile:</span>
                    <span className={`font-bold ${dashStats.percentile > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                      {dashStats.percentile > 0 ? `${dashStats.percentile}` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Performance Badge */}
                <div className="mt-4 w-full">
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 text-center">
                    <div className="text-xs text-green-700 dark:text-green-300 font-semibold">🎯 Excellent Performance</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">Top 12.5% of all students</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Word of the Day */}
            <div className="w-full xl:w-1/4 flex flex-col">
              <WordOfTheDayCard />
            </div>
          </div>

          {/* 4. Featured Courses — Udemy-style */}
          <FeaturedCoursesSection navigate={navigate} />

          {/* 4. Trending Exams */}
          <TrendingExams />

          {/* 5. Exam Status Summary */}
          <ExamStatusSummary />

          {/* 6. Recent Exam Notifications */}
          <RecentExamNotifications />


          {/* 8. Free Test/Quiz + Upcoming Live Tests */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
            {/* Free Test/Quiz */}
            <Card className="p-5 bg-white border border-slate-200 shadow-md rounded-2xl flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h3 className="font-bold text-[15px] text-slate-800">Daily Free Quiz</h3>
                </div>
                <span className="text-[11px] text-primary font-semibold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  {freeTests.length} tests today
                </span>
              </div>
              <div className="space-y-2.5 flex-1">
                {freeTests.slice(0, 5).map((test, idx) => {
                  const isCompleted = !!quizCompletions[test.id];
                  return (
                    <div key={idx} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[12.5px] text-slate-800 truncate group-hover:text-primary transition-colors">{test.title}</p>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{test.questions} Questions</span>
                            <span className="text-slate-300">•</span>
                            <Clock className="h-2.5 w-2.5 text-slate-400" />
                            <span>{test.duration} mins</span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 ml-3">
                        {isCompleted ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-semibold text-[10px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle className="h-3 w-3" />
                            Done
                          </div>
                        ) : (
                          <Button size="sm" className="h-7 px-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-[11px] font-semibold shadow-sm" onClick={() => handleStartTest(test)}>
                            <Play className="h-2.5 w-2.5 mr-1" strokeWidth={3} />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" className="w-full mt-4 text-[13px] font-semibold text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-xl py-2.5" asChild>
                <Link to="/student/daily-quizzes">View All Tests →</Link>
              </Button>
            </Card>

            {/* Upcoming Live Tests (restored) */}
            <UpcomingLiveTests />
          </div>

          {/* 9. Your Current Affairs Section */}
          <Card className="p-4 bg-white border border-slate-200 shadow-md rounded-2xl group/card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-base">Current Affairs</h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Auto Slide Toggle — compact pill */}
                <button
                  onClick={() => setIsAutoSlide(!isAutoSlide)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border transition-colors ${
                    isAutoSlide
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isAutoSlide ? 'bg-primary animate-pulse' : 'bg-slate-400'}`} />
                  {isAutoSlide ? 'Auto' : 'Manual'}
                </button>

                {/* Saved Articles Sheet Trigger */}
                <Sheet open={savedSheetOpen} onOpenChange={setSavedSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                      <Bookmark className="h-4 w-4" />
                      {savedArticleIds.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-card"></span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md p-0 flex flex-col z-[100]">
                    <SheetHeader className="p-6 border-b">
                      <SheetTitle className="flex items-center gap-2">
                        <Bookmark className="h-5 w-5 text-primary" />
                        Saved Articles
                      </SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-1 p-6">
                      {savedArticlesList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12 text-muted-foreground">
                          <div className="bg-muted p-4 rounded-full mb-4">
                            <Bookmark className="h-8 w-8 opacity-50" />
                          </div>
                          <p className="font-medium mb-1">No saved articles</p>
                          <p className="text-sm">Bookmark articles to read them later</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {savedArticlesList.map(article => (
                            <div key={article.id} className="relative group bg-card border rounded-lg overflow-hidden hover:shadow-md transition-all">
                              <div className="p-4 cursor-pointer" onClick={() => { setSavedSheetOpen(false); setSelectedNews(article); setNewsDialogOpen(true); }}>
                                <div className="flex justify-between items-start gap-3 mb-2">
                                  <Badge variant="outline" className="text-xs">{article.category}</Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive -mt-1 -mr-1"
                                    onClick={(e) => { e.stopPropagation(); toggleSave(article.id); }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <h4 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                  {article.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{article.date}</span>
                                  <span>•</span>
                                  <span>{article.readTime}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </SheetContent>
                </Sheet>

                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setIsAutoSlide(false); handlePrevNews(); }}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setIsAutoSlide(false); handleNextNews(); }}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentAffairsData.map((item, idx) => (
                <div
                  key={idx}
                  className="group cursor-pointer bg-slate-50 border border-border/50 rounded-xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all"
                  onClick={() => handleNewsClick(item)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-24 object-cover transition-transform group-hover:scale-105"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1.5 right-1.5 h-7 w-7 bg-white/80 hover:bg-white rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.id) toggleSave(item.id);
                      }}
                    >
                      <Bookmark className={`h-3.5 w-3.5 ${item.id && isSaved(item.id) ? "fill-primary text-primary" : ""}`} />
                    </Button>
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-white/90 text-slate-600 px-1.5 py-0.5 rounded-md uppercase tracking-wide">{item.category}</span>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-[12.5px] text-slate-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {isAutoSlide && (
              <div className="h-0.5 bg-muted mt-4 rounded-full overflow-hidden">
                <div className="h-full w-full bg-primary/50 animate-pulse origin-left"></div>
              </div>
            )}
          </Card>

          {/* Mobile Right Sidebar Content */}
          <div className="lg:hidden space-y-4">
            {/* Your Presence - Mobile */}
            <Card className="p-4 bg-white border border-slate-200 shadow-md rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Your presence</h3>
                <div className="flex gap-1">
                  <Button
                    variant={attendanceView === 'week' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs px-3"
                    onClick={() => setAttendanceView('week')}
                  >
                    Week
                  </Button>
                  <Button
                    variant={attendanceView === 'month' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs px-3"
                    onClick={() => setAttendanceView('month')}
                  >
                    Month
                  </Button>
                </div>
              </div>

              {/* Presence Grid */}
              <div className="space-y-4 mb-4">
                {attendanceView === 'week' ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => <div key={idx}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {/* Simplified Week View */}
                      {weekDays.map((dayNum, idx) => {
                        const curr = new Date();
                        const currentDay = curr.getDay();
                        const mondayOffset = curr.getDate() - (currentDay === 0 ? 6 : currentDay - 1);
                        const mondayDate = new Date(curr);
                        mondayDate.setDate(mondayOffset);

                        const date = new Date(mondayDate);
                        date.setDate(mondayDate.getDate() + idx);
                        const dateKey = formatDateLocal(date);
                        const active = !!studentPresence[dateKey];
                        const isToday = dateKey === todayStr;

                        return (
                          <div
                            key={idx}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border
                              ${isToday ? (active ? 'bg-green-500 text-white border-green-500' : 'bg-background border-primary text-primary') :
                                active ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-transparent'}
                            `}
                          >
                            {isToday ? 'Today' : active ? '✓' : ''}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Month View */
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <h4 className="font-semibold text-sm">{currentMonth} {currentYear}</h4>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(currentYear, today.getMonth(), day);
                        const dateKey = formatDateLocal(date);
                        const isToday = day === currentDay;
                        const wasActive = !!studentPresence[dateKey];
                        const isActiveToday = isToday && hasTakenTestToday;
                        const isSelected = dateKey === selectedDate;

                        return (
                          <div
                            key={day}
                            onClick={() => setSelectedDate(dateKey)}
                            className={`
                              w-8 h-8 flex items-center justify-center rounded-lg text-xs cursor-pointer transition-all
                              ${isSelected ? 'bg-primary text-primary-foreground shadow-md scale-105 font-bold' : ''}
                              ${!isSelected && isToday ? 'border-2 border-primary font-bold' : ''}
                              ${!isSelected && isActiveToday ? 'bg-green-500 text-white border-green-500' : ''}
                              ${!isSelected && !isActiveToday && wasActive ? 'bg-primary/10 text-primary' : ''}
                              ${!isSelected && !isToday && !wasActive ? 'hover:bg-muted' : ''}
                            `}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>


          </div>
        </div>
      </div>

      {/* News Article Dialog */}
      <NewsArticleDialog
        article={selectedNews}
        open={newsDialogOpen}
        onOpenChange={setNewsDialogOpen}
      />

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
