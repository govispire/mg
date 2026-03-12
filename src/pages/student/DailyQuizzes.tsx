import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import QuizLeaderboardSection from '@/components/student/quiz/QuizLeaderboardSection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Flame, CheckCircle, Target, ChevronLeft, ChevronRight,
  Calendar, Clock, Users, LayoutGrid, List, Play, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import launchExamWindow from '@/utils/launchExam';
import QuizCard from '@/components/student/quiz/QuizCard';
import QuizTypeSelector from '@/components/student/quiz/QuizTypeSelector';
import { dailyQuizzes, getQuizzesByDateAndType } from '@/data/dailyQuizzesData';
import { ExtendedQuiz, QuizType } from '@/types/quizTypes';
import {
  getQuizCompletions,
  calculateStreakData,
} from '@/utils/quizAnalytics';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, addMonths, subMonths, isToday,
  isSameMonth, format,
} from 'date-fns';

// ── helpers ───────────────────────────────────────────────────────────────────
const formatLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// ── Component ─────────────────────────────────────────────────────────────────
const FreeQuizzes = () => {
  const [selectedType, setSelectedType] = useState<QuizType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const todayStr = formatLocal(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [quizzes, setQuizzes] = useState<ExtendedQuiz[]>(() => {
    const completions = getQuizCompletions();
    return dailyQuizzes.map(q => ({
      ...q,
      completed: !!completions[q.id],
      score: completions[q.id]?.score
    }));
  });

  useEffect(() => {
    const refresh = () => {
      const completions = getQuizCompletions();
      setQuizzes(dailyQuizzes.map(q => ({
        ...q,
        completed: !!completions[q.id],
        score: completions[q.id]?.score
      })));
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const streakData = useMemo(() => calculateStreakData(), []);

  // Set of dates that have quizzes
  const datesWithQuizzes = useMemo(() => new Set(dailyQuizzes.map(q => q.scheduledDate)), []);

  // Calendar grid days for the displayed month
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(calendarMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(calendarMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [calendarMonth]);

  const filteredQuizzes = useMemo(() =>
    getQuizzesByDateAndType(quizzes, selectedDate, selectedType === 'all' ? undefined : selectedType),
    [quizzes, selectedDate, selectedType]
  );

  const quizTypeStats = useMemo(() => {
    const typeStats: Record<QuizType | 'all', { total: number; completed: number; averageScore: number }> = {
      'all': { total: 0, completed: 0, averageScore: 0 },
      'daily': { total: 0, completed: 0, averageScore: 0 },
      'rapid-fire': { total: 0, completed: 0, averageScore: 0 },
      'speed-challenge': { total: 0, completed: 0, averageScore: 0 },
      'mini-test': { total: 0, completed: 0, averageScore: 0 },
      'sectional': { total: 0, completed: 0, averageScore: 0 },
      'full-prelims': { total: 0, completed: 0, averageScore: 0 },
      'full-mains': { total: 0, completed: 0, averageScore: 0 },
    };
    quizzes.forEach(quiz => {
      typeStats['all'].total++;
      typeStats[quiz.type].total++;
      if (quiz.completed && quiz.score !== undefined) {
        typeStats['all'].completed++;
        typeStats['all'].averageScore += quiz.score;
        typeStats[quiz.type].completed++;
        typeStats[quiz.type].averageScore += quiz.score;
      }
    });
    Object.values(typeStats).forEach(stat => {
      if (stat.completed > 0) stat.averageScore = Math.round(stat.averageScore / stat.completed);
    });
    return typeStats;
  }, [quizzes]);

  const completedToday = quizzes.filter(q => q.scheduledDate === selectedDate && q.completed).length;
  const totalToday = quizzes.filter(q => q.scheduledDate === selectedDate && !q.isLocked).length;

  const handleStartQuiz = (quiz: ExtendedQuiz) => {
    if (quiz.isLocked) { toast.error('This quiz is locked!'); return; }
    if (quiz.scheduledDate > todayStr) { toast.error('This quiz is scheduled for the future!'); return; }
    launchExamWindow({
      quizId: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      duration: quiz.duration,
      questions: quiz.questions,
      returnUrl: '/student/daily-quizzes',
    });
  };

  const handleDayClick = (day: Date) => {
    const ds = formatLocal(day);
    if (ds > todayStr) return;
    if (!isSameMonth(day, calendarMonth)) return;
    setSelectedDate(ds);
  };

  const getDayClasses = (day: Date) => {
    const ds = formatLocal(day);
    const isSelected = ds === selectedDate;
    const isTodayDate = isToday(day);
    const isFuture = ds > todayStr;
    const inMonth = isSameMonth(day, calendarMonth);

    let base = 'w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs font-medium transition-all ';

    if (!inMonth) return base + 'text-gray-200 pointer-events-none';
    if (isFuture) return base + 'text-gray-300 cursor-not-allowed';
    if (isSelected) return base + 'bg-blue-600 text-white shadow cursor-pointer';
    if (isTodayDate) return base + 'ring-2 ring-blue-500 text-blue-700 cursor-pointer hover:bg-blue-50';
    return base + 'text-gray-700 cursor-pointer hover:bg-blue-50';
  };

  const selectedDateLabel = selectedDate === todayStr
    ? 'Today'
    : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Free Quiz Practice</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {selectedDateLabel} • {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'} available
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xl font-bold">{streakData.currentStreak}</span>
            <span className="text-sm text-muted-foreground">streak</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xl font-bold">{completedToday}/{totalToday}</span>
            <span className="text-sm text-muted-foreground">done</span>
          </div>
        </div>
      </div>

      {/* Quiz Type Selector */}
      <QuizTypeSelector selectedType={selectedType} onTypeSelect={setSelectedType} stats={quizTypeStats} />

      {/* Live Tests Banner Card */}
      <Link to="/student/live-tests" className="block">
        <div className="flex items-center gap-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-xl p-4 hover:shadow-md transition-all group">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-md shadow-red-500/30">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Live Tests</span>
              <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">FREE</span>
            </div>
            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
              Attempt All India Live Tests &amp; check your ranking
            </p>
            <p className="text-xs text-muted-foreground">9+ live tests available today</p>
          </div>
          <div className="shrink-0 text-sm font-semibold text-orange-600 group-hover:translate-x-1 transition-transform">
            View All →
          </div>
        </div>
      </Link>

      {/* Two-column layout: Quiz list LEFT | Calendar+Leaderboard RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">

        {/* ── Left: Quizzes ─────────────────────────────────── */}  
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'zes' : ''} for {selectedDateLabel}
            </p>
            <div className="flex gap-1 border rounded-lg p-1">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0" onClick={() => setViewMode('list')}>
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {filteredQuizzes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Quizzes Available</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No quizzes found for {selectedDateLabel}
                  {selectedType !== 'all' && ` in the "${selectedType.replace('-', ' ')}" category`}.
                </p>
                <Button variant="outline" onClick={() => { setSelectedDate(todayStr); setCalendarMonth(new Date()); }}>
                  Go to Today
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredQuizzes.map(quiz => (
                <QuizCard key={quiz.id} quiz={quiz} onStart={handleStartQuiz} todayStr={todayStr} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredQuizzes.map(quiz => {
                const isLocked = quiz.isLocked;
                const isFuture = quiz.scheduledDate > todayStr;
                const isDisabled = isLocked || isFuture;
                const typeColors: Record<string, string> = {
                  'daily': 'bg-blue-500', 'rapid-fire': 'bg-orange-500',
                  'speed-challenge': 'bg-purple-500', 'mini-test': 'bg-green-500',
                  'sectional': 'bg-pink-500', 'full-prelims': 'bg-indigo-500', 'full-mains': 'bg-red-500',
                };
                return (
                  <div key={quiz.id} className={`flex items-center gap-3 bg-white dark:bg-gray-900 border rounded-xl px-4 py-3 hover:shadow-md transition-all ${isDisabled ? 'opacity-60' : ''}`}>
                    <span className={`shrink-0 text-[10px] font-bold text-white px-2 py-1 rounded-md uppercase tracking-wide ${typeColors[quiz.type] || 'bg-gray-500'}`}>
                      {quiz.type.replace('-', ' ')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{quiz.title}</p>
                      {quiz.subject && <p className="text-xs text-muted-foreground truncate">{quiz.subject}</p>}
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1"><Target className="h-3 w-3" />{quiz.questions} Qs</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{quiz.duration} min</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{quiz.totalUsers || 0}</span>
                    </div>
                    {quiz.completed && quiz.score !== undefined ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0 text-xs">Score: {quiz.score}%</Badge>
                    ) : isFuture ? (
                      <Badge variant="outline" className="text-xs shrink-0">Upcoming</Badge>
                    ) : isLocked ? (
                      <Badge variant="outline" className="text-xs shrink-0 text-gray-400"><Lock className="h-3 w-3 mr-1" />Locked</Badge>
                    ) : null}
                    <Button
                      size="sm" variant={quiz.completed ? 'outline' : 'default'}
                      disabled={isDisabled} onClick={() => handleStartQuiz(quiz)}
                      className="shrink-0 h-8 text-xs gap-1"
                    >
                      <Play className="h-3 w-3" />
                      {quiz.completed ? 'Retry' : 'Start'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: Calendar + Leaderboard ───────────────────── */}
        <div className="space-y-4 sticky top-4">
          <Card>
            <CardContent className="p-4">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-3">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCalendarMonth(prev => subMonths(prev, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold">{format(calendarMonth, 'MMMM yyyy')}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCalendarMonth(prev => addMonths(prev, 1))} disabled={isSameMonth(calendarMonth, new Date())}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 mb-1.5">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                  <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-0.5">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-0.5">
                {calendarDays.map((day, i) => {
                  const ds = formatLocal(day);
                  const hasQuizzes = datesWithQuizzes.has(ds);
                  const isFuture = ds > todayStr;
                  const inMonth = isSameMonth(day, calendarMonth);
                  const isSelected = ds === selectedDate;
                  return (
                    <div key={i} className="flex flex-col items-center mb-0.5">
                      <button className={getDayClasses(day)} onClick={() => handleDayClick(day)} disabled={isFuture || !inMonth}>
                        {format(day, 'd')}
                      </button>
                      <div className={`w-1 h-1 rounded-full mt-0.5 ${inMonth && hasQuizzes && !isFuture && !isSelected ? 'bg-blue-400' : 'bg-transparent'}`} />
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" /> Has quizzes</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full ring-2 ring-blue-500 inline-block" /> Today</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Selected</span>
              </div>
              {selectedDate !== todayStr && (
                <Button variant="outline" size="sm" className="w-full mt-3 text-xs h-8" onClick={() => { setSelectedDate(todayStr); setCalendarMonth(new Date()); }}>
                  <Calendar className="h-3 w-3 mr-1" /> Go to Today
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard directly below calendar */}
          <QuizLeaderboardSection />
        </div>
      </div>
    </div>
  );
};

export default FreeQuizzes;
