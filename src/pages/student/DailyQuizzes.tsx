import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap, Flame, CheckCircle, Target, ArrowLeft,
  ChevronLeft, ChevronRight, Calendar, Clock, Trophy, Users,
  ChevronDown, LayoutGrid, List, Filter, BookOpen, FileText,
  ShieldCheck, BarChart3, Star, Lightbulb, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import launchExamWindow from '@/utils/launchExam';
import QuizCard from '@/components/student/quiz/QuizCard';
import { dailyQuizzes } from '@/data/dailyQuizzesData';
import { ExtendedQuiz, QuizType } from '@/types/quizTypes';
import { getQuizCompletions } from '@/utils/quizAnalytics';

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
  const [selectedType, setSelectedType] = useState<QuizType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const todayStr = new Date().toISOString().split('T')[0];

  const [quizzes, setQuizzes] = useState<ExtendedQuiz[]>(() => {
    const completions = getQuizCompletions();
    return dailyQuizzes.map(q => ({
      ...q,
      completed: !!completions[q.id],
      score: completions[q.id]?.score
    }));
  });

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

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => {
      // Basic filter: only show today's and past quizzes for now
      if (q.scheduledDate > todayStr) return false;
      if (selectedType !== 'all' && q.type !== selectedType) return false;
      return true;
    }).sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate)).slice(0, 12);
  }, [quizzes, selectedType, todayStr]);

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
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto bg-gray-50/50 min-h-screen">


      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-2">
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Free Quizzes & Tests</h1>
            <p className="text-lg text-slate-600 mt-3 max-w-2xl leading-relaxed">
              Practice unlimited free tests designed to help you prepare better and score higher in real exams.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">100% Free</h3>
                <p className="text-xs text-slate-500 mt-0.5">Always free, no hidden charges</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Exam Focused</h3>
                <p className="text-xs text-slate-500 mt-0.5">Based on latest exam pattern</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-orange-100 rounded-xl text-orange-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Performance Insights</h3>
                <p className="text-xs text-slate-500 mt-0.5">Detailed analysis to track progress</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Trusted by Students</h3>
                <p className="text-xs text-slate-500 mt-0.5">Used by 10L+ aspirants across India</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Illustration */}
        <div className="hidden lg:flex shrink-0 relative items-center justify-center w-[340px] h-[240px]">
          {/* Decorative background blobs */}
          <div className="absolute w-[240px] h-[240px] bg-emerald-100/60 rounded-full blur-3xl -z-10 right-10 top-0"></div>
          <div className="absolute w-[180px] h-[180px] bg-purple-100/60 rounded-full blur-3xl -z-10 left-0 bottom-0"></div>
          
          <div className="relative">
            <div className="w-[140px] h-[180px] bg-white border-[3px] border-emerald-500 rounded-xl shadow-xl shadow-emerald-500/10 flex flex-col items-center pt-6 px-4 z-10 transform -rotate-3">
               <div className="absolute -top-4 w-12 h-6 bg-slate-800 rounded-md"></div>
               <div className="absolute -top-6 w-6 h-4 bg-slate-800 rounded-full"></div>
               <div className="space-y-4 w-full">
                  <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle className="h-3 w-3" /></div> <div className="h-2.5 bg-slate-100 rounded-full flex-1"></div></div>
                  <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle className="h-3 w-3" /></div> <div className="h-2.5 bg-slate-100 rounded-full flex-1"></div></div>
                  <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle className="h-3 w-3" /></div> <div className="h-2.5 bg-slate-100 rounded-full w-2/3"></div></div>
               </div>
            </div>
            
            <div className="absolute -bottom-4 -left-12 w-20 h-20 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shadow-lg z-20">
              <Clock className="w-10 h-10 text-slate-800" />
            </div>

            <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-28 h-28 bg-purple-600 text-white rounded-full flex flex-col items-center justify-center shadow-lg shadow-purple-600/30 rotate-12 z-20">
              <span className="font-black text-xl leading-tight">FREE</span>
              <span className="font-bold text-[10px] tracking-wider opacity-90">FOREVER</span>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="absolute top-2 left-2 w-2 h-2 bg-purple-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-gray-200 pb-4">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setSelectedType(tab.value)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              selectedType === tab.value 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
              : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 flex items-center gap-2">
          More <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* All Free Tests */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">All Free Tests</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${viewMode === 'grid' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid className="h-4 w-4" /> Grid View
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${viewMode === 'list' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List className="h-4 w-4" /> List View
              </button>
            </div>
            <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-slate-700 font-semibold shadow-sm flex items-center gap-2 bg-white">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
          {filteredQuizzes.length > 0 ? (
            filteredQuizzes.map((quiz, index) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onStart={handleStartQuiz}
                todayStr={todayStr}
                index={index}
                viewMode={viewMode}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700">No Tests Found</h3>
              <p className="text-sm text-slate-500 mt-1">Try changing your filters or category</p>
            </div>
          )}
        </div>

        {filteredQuizzes.length > 0 && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" className="rounded-xl border-slate-200 text-slate-700 font-bold bg-white shadow-sm px-6 h-11 hover:bg-slate-50 flex items-center gap-2">
              View More Tests <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Why Practice Free Quizzes */}
      <div className="mt-12 bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Why Practice Free Quizzes?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_PRACTICE.map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Banner */}
      <div className="mt-8 bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-amber-800">
          <Lightbulb className="h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm font-medium">
            These tests are completely free and designed for practice purpose only. 
            <span className="hidden sm:inline"> For advanced analysis and All India Rank, upgrade to Premium.</span>
          </p>
        </div>
        <Button className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-6 shadow-sm">
          Upgrade Now
        </Button>
      </div>

    </div>
  );
};

export default FreeQuizzes;
