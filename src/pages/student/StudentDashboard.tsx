import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/providers';
import {
  Target,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Bookmark,
  LayoutGrid,
  Play,
  Clock,
  FileText,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import NewsArticleDialog from '@/components/student/NewsArticleDialog';
import StatCardDialog from '@/components/student/StatCardDialog';
import { dailyQuizzes } from '@/data/dailyQuizzesData';
import QuizAttemptIBPS, { QuizResult } from '@/components/student/quiz/QuizAttemptIBPS';
import launchExamWindow from '@/utils/launchExam';
import { getQuestionsForQuiz } from '@/data/quizQuestionsData';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { differenceInDays } from 'date-fns';
import { CompulsoryFormModal, WelcomeMessageModal } from '@/components/auth/UpdatedAuthModal';
import { allArticles } from '@/components/current-affairs/articlesData';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { UpcomingLiveTests } from '@/components/student/dashboard/UpcomingLiveTests';
import { TrendingExams } from '@/components/student/dashboard/TrendingExams';
import { YourExams } from '@/components/student/dashboard/YourExams';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ExamStatusSummary } from '@/components/student/dashboard/ExamStatusSummary';
import { StatsOverview } from '@/components/student/dashboard/StatsOverview';
import { PerformanceGraph } from '@/components/student/dashboard/PerformanceGraph';
import { NextAction } from '@/components/student/dashboard/NextAction';

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

const StudentDashboard = () => {
  const { user } = useAuth();
  const [attendanceView, setAttendanceView] = useState<'week' | 'month'>('week');
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [statDialogType, setStatDialogType] = useState<'journey' | 'hours' | 'active' | 'tests' | null>(null);
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

  // Current affairs data - taking top sorted latest articles
  // Sort by date descending
  // Current affairs data - taking top sorted latest articles
  // Sort by date descending safely
  const safeArticles = Array.isArray(allArticles) ? allArticles : [];
  const sortedArticles = [...safeArticles].sort((a, b) => {
    try {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } catch (e) {
      return 0;
    }
  });

  // Get visible articles based on current index (sliding window of 3)
  const visibleArticles = [];
  if (sortedArticles.length > 0) {
    for (let i = 0; i < 3; i++) {
      // Safe modulo arithmetic
      const index = (currentNewsIndex + i) % sortedArticles.length;
      if (sortedArticles[index]) {
        visibleArticles.push(sortedArticles[index]);
      }
    }
  }

  const currentAffairsData = visibleArticles
    .filter(article => article && article.id) // Filter out undefined or invalid
    .map(article => ({
      id: article.id,
      title: article.title,
      description: article.excerpt || '',
      category: article.category || 'General',
      image: article.image || '',
      content: article.content || ''
    }));

  // Performance data for chart
  const performanceData = [
    { week: 'Week 1', tests: 45, quizzes: 52 },
    { week: 'Week 2', tests: 52, quizzes: 58 },
    { week: 'Week 3', tests: 48, quizzes: 62 },
    { week: 'Week 4', tests: 62, quizzes: 72 },
    { week: 'Week 5', tests: 68, quizzes: 78 },
    { week: 'Week 6', tests: 72, quizzes: 82 },
    { week: 'Week 7', tests: 78, quizzes: 85 },
    { week: 'Week 8', tests: 82, quizzes: 88 },
  ];

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

  return (
    <div className="h-screen overflow-y-auto bg-muted/30">
      <div className="flex flex-col lg:flex-row gap-3 p-2 sm:p-3 max-w-full">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4 w-full lg:w-auto">
          {/* Greeting Section */}
          <div className="mb-5">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              Hello, {userProfile?.username || user?.name || 'Student'} <span className="text-xl animate-wave">👋</span>
            </h1>
            <p className="text-sm text-muted-foreground">Let's learn something new today!</p>
          </div>

          {/* Stats Cards */}
          <StatsOverview
            journeyDays={journeyDays}
            userName={userProfile?.username || user?.name || 'Student'}
            onCardClick={setStatDialogType}
          />



          {/* Performance Section */}
          <div className="flex flex-col xl:flex-row gap-3">
            {/* Performance Graph */}
            <PerformanceGraph data={performanceData} />

            {/* Target Exam Performance - Concentric Circles */}
            <Card className="p-4 bg-card w-full xl:w-72 flex flex-col justify-between shadow-sm">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                Target Performance
              </h3>

              <div className="flex-1 flex items-center justify-center py-2">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Prelims Track & Progress (Outer) */}
                    <circle cx="50" cy="50" r="45" fill="none" strokeWidth="7" stroke="hsl(var(--muted))" opacity="0.12" />
                    <circle cx="50" cy="50" r="45" fill="none" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 45}`} strokeDashoffset={`${2 * Math.PI * 45 * (1 - 0.85)}`} className="text-sky-500 stroke-current transition-all duration-1000 ease-out" style={{ filter: 'drop-shadow(0 0 3px rgba(14,165,233,0.3))' }} />

                    {/* Mains Track & Progress (Middle) */}
                    <circle cx="50" cy="50" r="35" fill="none" strokeWidth="7" stroke="hsl(var(--muted))" opacity="0.12" />
                    <circle cx="50" cy="50" r="35" fill="none" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 35}`} strokeDashoffset={`${2 * Math.PI * 35 * (1 - 0.60)}`} className="text-violet-500 stroke-current transition-all duration-1000 ease-out" style={{ filter: 'drop-shadow(0 0 3px rgba(139,92,246,0.3))' }} />

                    {/* Sectional Track & Progress (Inner) */}
                    <circle cx="50" cy="50" r="25" fill="none" strokeWidth="7" stroke="hsl(var(--muted))" opacity="0.12" />
                    <circle cx="50" cy="50" r="25" fill="none" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 25}`} strokeDashoffset={`${2 * Math.PI * 25 * (1 - 0.92)}`} className="text-amber-500 stroke-current transition-all duration-1000 ease-out" style={{ filter: 'drop-shadow(0 0 3px rgba(245,158,11,0.3))' }} />
                  </svg>

                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Overall</span>
                    <span className="text-2xl font-bold text-foreground leading-none mt-0.5">79%</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="flex flex-col items-center text-center">
                  <div className="w-2 h-2 rounded-full bg-sky-500 mb-1"></div>
                  <span className="text-[10px] text-muted-foreground font-medium mb-0.5">Prelims</span>
                  <span className="text-sm font-bold text-sky-500">85%</span>
                </div>
                <div className="flex flex-col items-center text-center border-l border-r border-border/50">
                  <div className="w-2 h-2 rounded-full bg-violet-500 mb-1"></div>
                  <span className="text-[10px] text-muted-foreground font-medium mb-0.5">Mains</span>
                  <span className="text-sm font-bold text-violet-500">60%</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mb-1"></div>
                  <span className="text-[10px] text-muted-foreground font-medium mb-0.5">Sectional</span>
                  <span className="text-sm font-bold text-amber-500">92%</span>
                </div>
              </div>
            </Card>
          </div>




          {/* Exam Status Summary (Self Care) */}
          <ExamStatusSummary />

          {/* Trending Exams Section */}
          <TrendingExams />

          {/* Your Exams Section */}
          <YourExams />

          {/* Your Current Affairs Section */}
          <Card className="p-4 bg-card group/card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-base">Your Current Affairs</h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Auto Slide Toggle */}
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-colors ${isAutoSlide ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                  onClick={() => setIsAutoSlide(!isAutoSlide)}
                  title={isAutoSlide ? "Pause Auto-Slide" : "Enable Auto-Slide"}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isAutoSlide ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`}></div>
                  <span>{isAutoSlide ? 'Auto On' : 'Auto Off'}</span>
                </div>

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

                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <div className="w-10 h-5 bg-primary rounded-full relative mx-1">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-primary-foreground rounded-full"></div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setIsAutoSlide(false); handlePrevNews(); }}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setIsAutoSlide(false); handleNextNews(); }}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {currentAffairsData.map((item, idx) => (
                <div
                  key={idx}
                  className="group cursor-pointer"
                  onClick={() => handleNewsClick(item)}
                >
                  <div className="relative rounded-lg overflow-hidden mb-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-36 object-cover transition-transform group-hover:scale-105"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 bg-card/80 hover:bg-card"
                      onClick={(e) => {
                        e.stopPropagation();
                        // item is mapped from allArticles, so item.id exists
                        if (item.id) toggleSave(item.id);
                      }}
                    >
                      <Bookmark className={`h-4 w-4 ${item.id && isSaved(item.id) ? "fill-primary text-primary" : ""}`} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{item.category}</p>
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                </div>
              ))}
            </div>
            {isAutoSlide && (
              <div className="h-0.5 bg-muted mt-4 rounded-full overflow-hidden">
                <div className="h-full w-full bg-primary/50 animate-pulse origin-left"></div>
              </div>
            )}
          </Card>

          {/* Next Best Action */}
          <NextAction />

          {/* Mobile Right Sidebar Content */}
          <div className="lg:hidden space-y-4">
            {/* Your Presence - Mobile */}
            <Card className="p-4 bg-card">
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


            {/* Free Test/Quiz - Mobile */}
            <Card className="p-4 bg-card">
              <h3 className="font-semibold text-sm mb-3">Free Test/Quiz</h3>
              <div className="space-y-2">
                {freeTests.slice(0, 5).map((test, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{test.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{test.questions} Qs</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {test.duration} mins
                          </span>
                        </p>
                      </div>
                    </div>
                    {quizCompletions[test.id] ? (
                      <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Completed
                      </div>
                    ) : (
                      <Button size="sm" className="h-8 gap-1" onClick={() => handleStartTest(test)}>
                        <Play className="h-3 w-3" />
                        Start
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {allFreteTestsForDate.length > 5 && (
                <Button variant="outline" className="w-full mt-3" asChild>
                  <Link to="/student/daily-quizzes">View All Tests ({allFreteTestsForDate.length})</Link>
                </Button>
              )}
            </Card>
            {/* Upcoming Live Tests - Mobile */}
            <UpcomingLiveTests />
          </div>
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="hidden lg:block w-72 flex-shrink-0 space-y-4">
          {/* Upcoming Live Tests */}
          <UpcomingLiveTests />

          {/* Percentile Speedometer */}
          <Card className="p-6 bg-card flex flex-col items-center relative overflow-hidden">
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
                <div className="text-3xl font-bold text-primary">87.5</div>
                <div className="text-xs text-muted-foreground">Percentile</div>
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
                <span className="font-bold text-green-600">85.2</span>
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

          {/* Free Test/Quiz */}
          <Card className="p-4 bg-card">
            <h3 className="font-semibold text-sm mb-3">
              Free Test/Quiz <span className="text-xs font-normal text-muted-foreground ml-2">({new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})</span>
            </h3>
            <div className="space-y-2">
              {freeTests.slice(0, 5).map((test, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{test.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{test.questions} Qs</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {test.duration} mins
                        </span>
                      </p>
                    </div>
                  </div>
                  {quizCompletions[test.id] ? (
                    <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 shadow-sm">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Completed
                    </div>
                  ) : (
                    <Button size="sm" className="h-8 gap-1 shadow-md shadow-primary/20" onClick={() => handleStartTest(test)}>
                      <Play className="h-3 w-3" />
                      Start
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {allFreteTestsForDate.length > 5 && (
              <Button variant="outline" className="w-full mt-3" asChild>
                <Link to="/student/daily-quizzes">View All Tests ({allFreteTestsForDate.length})</Link>
              </Button>
            )}
          </Card>

          {/* Your Presence */}
          <Card className="p-4 bg-card">
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
                    {/* Simplified Week View: Just showing last 7 active days simulation for demo */}
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
  );
};

export default StudentDashboard;
