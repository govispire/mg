import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Zap, Flame, CheckCircle, Target, ArrowLeft,
  ChevronLeft, ChevronRight, Calendar, Clock, Trophy, Users,
  LayoutGrid, List, Play, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import launchExamWindow from '@/utils/launchExam';
import StreakRewards from '@/components/student/quiz/StreakRewards';
import SmartRecommendations from '@/components/student/quiz/SmartRecommendations';
import Leaderboard from '@/components/student/quiz/Leaderboard';
import QuizCard from '@/components/student/quiz/QuizCard';
import QuizTypeSelector from '@/components/student/quiz/QuizTypeSelector';
import { getQuestionsForQuiz } from '@/data/quizQuestionsData';
import { dailyQuizzes, getQuizzesByDateAndType } from '@/data/dailyQuizzesData';
import { ExtendedQuiz } from '@/types/quizTypes';
import { QuizType } from '@/types/quizTypes';
import {
  getQuizCompletions,
  saveQuizCompletion,
  calculateStreakData,
  identifyWeakAreas,
  getOverallStatistics,
  QuizCompletion
} from '@/utils/quizAnalytics';
import {
  getLeaderboardData,
  calculateUserScore,
  LeaderboardPeriod
} from '@/services/leaderboardService';

const FreeQuizzes = () => {
  const [selectedType, setSelectedType] = useState<QuizType | 'all'>('all');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('daily');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [quizzes, setQuizzes] = useState<ExtendedQuiz[]>(() => {
    const completions = getQuizCompletions();
    return dailyQuizzes.map(q => ({
      ...q,
      completed: !!completions[q.id],
      score: completions[q.id]?.score
    }));
  });

  // Refresh quiz data when component mounts (e.g., after returning from exam)
  useEffect(() => {
    const completions = getQuizCompletions();
    setQuizzes(dailyQuizzes.map(q => ({
      ...q,
      completed: !!completions[q.id],
      score: completions[q.id]?.score
    })));
  }, []);

  // Refresh quiz data when window regains focus (user returns from exam window)
  useEffect(() => {
    const handleFocus = () => {
      const completions = getQuizCompletions();
      setQuizzes(dailyQuizzes.map(q => ({
        ...q,
        completed: !!completions[q.id],
        score: completions[q.id]?.score
      })));
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const [streakData, setStreakData] = useState(() => calculateStreakData());
  const [weakAreas, setWeakAreas] = useState(() => {
    const completions = getQuizCompletions();
    return identifyWeakAreas(completions);
  });

  const stats = getOverallStatistics();
  const completions = getQuizCompletions();
  const userScore = calculateUserScore(Object.values(completions));
  const leaderboard = getLeaderboardData(
    leaderboardPeriod,
    userScore,
    streakData.currentStreak,
    streakData.totalQuizzesCompleted
  );

  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(dailyQuizzes.map(q => q.scheduledDate)))
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 30);
    return dates;
  }, []);

  const filteredQuizzes = useMemo(() => {
    return getQuizzesByDateAndType(quizzes, selectedDate, selectedType === 'all' ? undefined : selectedType);
  }, [quizzes, selectedDate, selectedType]);

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
      if (stat.completed > 0) {
        stat.averageScore = Math.round(stat.averageScore / stat.completed);
      }
    });

    return typeStats;
  }, [quizzes]);

  const completedToday = quizzes.filter(q => q.scheduledDate === selectedDate && q.completed).length;
  const totalToday = quizzes.filter(q => q.scheduledDate === selectedDate && !q.isLocked).length;

  const goToPreviousDate = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex < availableDates.length - 1) {
      setSelectedDate(availableDates[currentIndex + 1]);
    }
  };

  const goToNextDate = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex > 0) {
      setSelectedDate(availableDates[currentIndex - 1]);
    }
  };

  const handleStartQuiz = (quiz: ExtendedQuiz) => {
    if (quiz.isLocked) {
      toast.error('This quiz is locked!');
      return;
    }
    if (quiz.scheduledDate > todayStr) {
      toast.error('This quiz is scheduled for the future!');
      return;
    }
    // Launch exam in new fullscreen window with return URL
    launchExamWindow({
      quizId: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      duration: quiz.duration,
      questions: quiz.questions,
      returnUrl: '/student/daily-quizzes', // Return to daily quizzes page
    });
  };

  // handleQuizComplete and the if (activeQuiz) block are removed as quiz attempts are now in a separate window.

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Free Quiz Practice</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedDate === todayStr ? 'Today' : new Date(selectedDate).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric'
            })} • {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'} available
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xl font-bold">{streakData.currentStreak}</span>
              <span className="text-sm text-muted-foreground">day streak</span>
            </div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-right">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xl font-bold">{completedToday}/{totalToday}</span>
              <span className="text-sm text-muted-foreground">completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Type Selector */}
      <QuizTypeSelector
        selectedType={selectedType}
        onTypeSelect={setSelectedType}
        stats={quizTypeStats}
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Main Content */}
        <div className="space-y-4">
          {/* Date Navigation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {selectedDate === todayStr ? 'Today' : new Date(selectedDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousDate}
                    disabled={availableDates.indexOf(selectedDate) === availableDates.length - 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {selectedDate !== todayStr && (
                    <Button size="sm" onClick={() => setSelectedDate(todayStr)}>
                      Today
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextDate}
                    disabled={availableDates.indexOf(selectedDate) === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* View toggle */}
                  <div className="flex gap-1 border rounded-lg p-1 ml-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setViewMode('grid')}
                      title="Grid view"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setViewMode('list')}
                      title="List view"
                    >
                      <List className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Grid or List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {filteredQuizzes.length > 0 ? (
                filteredQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onStart={handleStartQuiz}
                    todayStr={todayStr}
                  />
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Quizzes Available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No quizzes found for this date
                      {selectedType !== 'all' && ` in ${selectedType.replace('-', ' ')} category`}.
                    </p>
                    {selectedDate !== todayStr && (
                      <Button onClick={() => setSelectedDate(todayStr)}>Go to Today</Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* ── List view ── */
            <div className="space-y-2">
              {filteredQuizzes.length > 0 ? (
                filteredQuizzes.map((quiz) => {
                  const isLocked = quiz.isLocked;
                  const isFuture = quiz.scheduledDate > todayStr;
                  const isDisabled = isLocked || isFuture;
                  const typeColors: Record<string, string> = {
                    'daily': 'bg-blue-500',
                    'rapid-fire': 'bg-orange-500',
                    'speed-challenge': 'bg-purple-500',
                    'mini-test': 'bg-green-500',
                    'sectional': 'bg-pink-500',
                    'full-prelims': 'bg-indigo-500',
                    'full-mains': 'bg-red-500',
                  };
                  const color = typeColors[quiz.type] || 'bg-gray-500';

                  return (
                    <div
                      key={quiz.id}
                      className={`flex items-center gap-3 bg-white dark:bg-gray-900 border rounded-xl px-4 py-3 hover:shadow-md transition-all ${isDisabled ? 'opacity-60' : ''
                        }`}
                    >
                      {/* Type badge */}
                      <span className={`shrink-0 text-[10px] font-bold text-white px-2 py-1 rounded-md uppercase tracking-wide ${color}`}>
                        {quiz.type.replace('-', ' ')}
                      </span>

                      {/* Title + subject */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{quiz.title}</p>
                        {quiz.subject && (
                          <p className="text-xs text-muted-foreground truncate">{quiz.subject}</p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />{quiz.questions} Qs
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{quiz.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />{quiz.totalUsers || 0}
                        </span>
                      </div>

                      {/* Score badge */}
                      {quiz.completed && quiz.score !== undefined ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0 text-xs">
                          Score: {quiz.score}%
                        </Badge>
                      ) : isFuture ? (
                        <Badge variant="outline" className="text-xs shrink-0">
                          Upcoming
                        </Badge>
                      ) : isLocked ? (
                        <Badge variant="outline" className="text-xs shrink-0 text-gray-400">
                          <Lock className="h-3 w-3 mr-1" />Locked
                        </Badge>
                      ) : null}

                      {/* Action button */}
                      <Button
                        size="sm"
                        variant={quiz.completed ? 'outline' : 'default'}
                        disabled={isDisabled}
                        onClick={() => handleStartQuiz(quiz)}
                        className="shrink-0 h-8 text-xs gap-1"
                      >
                        <Play className="h-3 w-3" />
                        {quiz.completed ? 'Retry' : 'Start'}
                      </Button>
                    </div>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Quizzes Available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No quizzes found for this date
                      {selectedType !== 'all' && ` in ${selectedType.replace('-', ' ')} category`}.
                    </p>
                    {selectedDate !== todayStr && (
                      <Button onClick={() => setSelectedDate(todayStr)}>Go to Today</Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Hidden to allow full width for grid */}
        <div className="hidden space-y-4">
          <StreakRewards
            streakData={streakData}
            onClaimReward={() => console.log('Claim reward')}
          />
          <SmartRecommendations
            weakAreas={weakAreas}
            onViewFullAnalysis={() => console.log('View full analysis')}
          />
          <Leaderboard
            leaderboardData={leaderboard}
            period={leaderboardPeriod}
            onPeriodChange={setLeaderboardPeriod}
          />
        </div>
      </div>
    </div>
  );
};

export default FreeQuizzes;
