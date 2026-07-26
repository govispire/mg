import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap, Flame, CheckCircle, Target, Clock, Trophy, Users,
  LayoutGrid, List, BookOpen, FileText, ShieldCheck, Star,
  Search, X, RotateCcw, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import launchExamWindow from '@/utils/launchExam';
import QuizCard from '@/components/student/quiz/QuizCard';
import { useQuizzes } from '@/hooks/useQuizCatalog';
import { ExtendedQuiz, QuizType } from '@/types/quizTypes';
import { getQuizCompletions } from '@/utils/quizAnalytics';

import { dailyQuizzes as fallbackDailyQuizzes } from '@/data/dailyQuizzesData';

const TABS: { label: string; value: QuizType | 'all' }[] = [
  { label: "All", value: "all" },
  { label: "Rapid Fire", value: "rapid-fire" },
  { label: "Speed Test", value: "speed-challenge" },
  { label: "Mini Test", value: "mini-test" },
  { label: "Full Test", value: "full-prelims" },
  { label: "Mixed Practice", value: "daily" }
];

const WHY_PRACTICE = [
  { title: "Understand Exam Pattern", desc: "Get familiar with real exam style & difficulty", icon: FileText },
  { title: "Improve Speed & Accuracy", desc: "Regular practice helps you solve faster & better", icon: Clock },
  { title: "Boost Confidence", desc: "Track your progress and build exam confidence", icon: Star },
  { title: "100% Free Forever", desc: "Unlimited practice with no hidden charges", icon: ShieldCheck }
];

const FreeQuizzes = () => {
  const navigate = useNavigate();
  const { data: apiQuizzes = [], isLoading } = useQuizzes();
  const [selectedType, setSelectedType] = useState<QuizType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Merge API quizzes with fallback dummy quizzes so every tab always has quizzes
  const allAvailableQuizzes = useMemo(() => {
    const combinedMap = new Map<string, ExtendedQuiz>();
    
    // Add fallback generator quizzes first (covers all categories & dates)
    fallbackDailyQuizzes.forEach(q => combinedMap.set(q.id, q));
    
    // Add or override with API quizzes if present
    if (Array.isArray(apiQuizzes) && apiQuizzes.length > 0) {
      apiQuizzes.forEach((q: any) => {
        combinedMap.set(q.id || `api-${q.title}`, {
          id: q.id || `api-${q.title}`,
          type: (q.type as QuizType) || 'daily',
          title: q.title || 'Practice Quiz',
          description: q.description || 'Interactive practice test',
          subject: q.subject || 'General',
          questions: q.questions_count || q.questions || 15,
          duration: q.duration_minutes || q.duration || 15,
          difficulty: q.difficulty || 'Medium',
          scheduledDate: q.scheduled_date || q.scheduledDate || todayStr,
          examLevel: q.exam_level || q.examLevel || 'prelims',
          isLocked: !!q.is_locked,
          totalUsers: q.total_users || 1200,
        });
      });
    }

    return Array.from(combinedMap.values());
  }, [apiQuizzes, todayStr]);

  const [quizzes, setQuizzes] = useState<ExtendedQuiz[]>(() => {
    const completions = getQuizCompletions();
    return allAvailableQuizzes.map(q => ({
      ...q,
      completed: !!completions[q.id],
      score: completions[q.id]?.score
    }));
  });

  useEffect(() => {
    const completions = getQuizCompletions();
    setQuizzes(allAvailableQuizzes.map(q => ({
      ...q,
      completed: !!completions[q.id],
      score: completions[q.id]?.score
    })));
  }, [allAvailableQuizzes]);

  useEffect(() => {
    const handleFocus = () => {
      const completions = getQuizCompletions();
      setQuizzes(allAvailableQuizzes.map(q => ({
        ...q,
        completed: !!completions[q.id],
        score: completions[q.id]?.score
      })));
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [allAvailableQuizzes]);

  // Count completions today
  const completedTodayCount = useMemo(() => {
    const completions = getQuizCompletions();
    return Object.values(completions).filter((c: any) => c.completed && c.date?.startsWith(todayStr)).length;
  }, [todayStr, quizzes]);

  // Compute live item count per category
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    quizzes.forEach(q => {
      if (q.scheduledDate <= todayStr) {
        counts.all = (counts.all || 0) + 1;
        counts[q.type] = (counts[q.type] || 0) + 1;
      }
    });
    return counts;
  }, [quizzes, todayStr]);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => {
      if (q.scheduledDate > todayStr) return false;
      if (selectedType !== 'all' && q.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return q.title.toLowerCase().includes(query) || q.subject.toLowerCase().includes(query);
      }
      return true;
    }).sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
  }, [quizzes, selectedType, searchQuery, todayStr]);

  const firstIncompleteQuiz = useMemo(() => {
    return filteredQuizzes.find(q => !q.completed && !q.isLocked) || filteredQuizzes[0];
  }, [filteredQuizzes]);

  const handleStartQuiz = (quiz: ExtendedQuiz) => {
    if (quiz.isLocked) {
      toast.error('This quiz is locked!');
      return;
    }
    launchExamWindow({
      quizId: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      duration: quiz.duration,
      questions: quiz.questions,
      returnUrl: '/student/daily-quizzes',
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto bg-gray-50/50 min-h-screen">

      {/* ── 1. Compact High-Utility Hero Header ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Daily Free Quizzes</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 3-Day Streak
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Free
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Targeted exam-pattern practice tests updated daily to boost speed, accuracy, and confidence.
          </p>


        </div>

        {/* Quick Quiz CTA */}
        {firstIncompleteQuiz && (
          <Button
            onClick={() => handleStartQuiz(firstIncompleteQuiz)}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-2.5 h-11 rounded-xl shadow-md shadow-emerald-600/20 shrink-0 flex items-center gap-2 transition-all"
          >
            <Zap className="w-4 h-4 fill-white" />
            Start Today's Quick Quiz
          </Button>
        )}
      </div>

      {/* ── 2. Unified Control Toolbar & Category Chips ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Pill Chips with Live Item Counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {TABS.map(tab => {
              const count = typeCounts[tab.value] ?? 0;
              const isActive = selectedType === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedType(tab.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-emerald-700 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + View Mode Switcher */}
          <div className="flex items-center gap-2 shrink-0 justify-between md:justify-end">
            {/* Search Input */}
            <div className="relative flex-1 md:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search quizzes…"
                className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Grid / List View Switcher */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
                title="List View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Quiz Cards Grid / List or Actionable Empty State ── */}
      <div className="space-y-6">
        {filteredQuizzes.length > 0 ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" : "flex flex-col gap-4"}>
            {filteredQuizzes.map((quiz, index) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onStart={handleStartQuiz}
                todayStr={todayStr}
                index={index}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          /* Actionable Empty State UX */
          <div className="py-16 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
              <Target className="h-7 w-7" />
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h3 className="font-extrabold text-base text-slate-800">No Quizzes Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No quizzes available under "{selectedType === 'all' ? 'All' : selectedType}" {searchQuery ? `matching "${searchQuery}"` : ''}.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <Button
                onClick={() => { setSelectedType('all'); setSearchQuery(''); }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedType('all')}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs h-9 px-4 rounded-xl"
              >
                View Past Archived Quizzes
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. Unified Footer & Upgrade Callout ── */}
      <div className="pt-4 space-y-6">
        {/* Why Practice Section - Unified Emerald & Slate Badges */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Why Practice Free Daily Quizzes?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY_PRACTICE.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Upgrade Banner — Unified Emerald & Slate Palette */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
              <Star className="w-3 h-3 fill-emerald-300" /> Examerit Premium Analytics
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white">Unlock All India Rank & In-Depth Solutions</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Free quizzes let you practice speed and accuracy. Upgrade to Premium for detailed subject performance analysis, percentile ranks, and video solutions.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/student/pricing')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-10 px-5 rounded-xl shrink-0 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            Upgrade Now <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

    </div>
  );
};

export default FreeQuizzes;
