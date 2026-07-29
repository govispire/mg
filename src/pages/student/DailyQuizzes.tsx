import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Zap, Flame, Clock, FileText, ShieldCheck, Star,
  Search, X, RotateCcw, ArrowRight, LayoutGrid, List
} from 'lucide-react';
import { toast } from 'sonner';
import launchExamWindow from '@/utils/launchExam';
import QuizCard from '@/components/student/quiz/QuizCard';
import { ExtendedQuiz, QuizType } from '@/types/quizTypes';
import { getQuizCompletions } from '@/utils/quizAnalytics';

// ─── Lightweight static dummy quizzes (no heavy generator) ────────────────────
// Only ~20 quizzes dated today — completely separate from the Tests page catalog.
const today = new Date().toISOString().split('T')[0];

const DUMMY_FREE_QUIZZES: ExtendedQuiz[] = [
  // ── Rapid Fire ──────────────────────────────────────────────────────────────
  { id: 'free-rf-1', type: 'rapid-fire', title: 'Rapid Fire – Quantitative Aptitude', description: '10 quick questions to test your calculation speed', subject: 'Quantitative Aptitude', questions: 10, duration: 10, difficulty: 'Medium', scheduledDate: today, examLevel: 'prelims', isLocked: false, totalUsers: 1283 },
  { id: 'free-rf-2', type: 'rapid-fire', title: 'Rapid Fire – Reasoning', description: '10 questions to sharpen your logical reasoning', subject: 'Reasoning', questions: 10, duration: 10, difficulty: 'Medium', scheduledDate: today, examLevel: 'prelims', isLocked: false, totalUsers: 864 },
  { id: 'free-rf-3', type: 'rapid-fire', title: 'Rapid Fire – English', description: '10 vocabulary & grammar questions in 10 mins', subject: 'English', questions: 10, duration: 10, difficulty: 'Easy', scheduledDate: today, examLevel: 'prelims', isLocked: false, totalUsers: 959 },
  { id: 'free-rf-4', type: 'rapid-fire', title: 'Rapid Fire – General Awareness', description: 'Quick GK & current affairs round', subject: 'General Awareness', questions: 10, duration: 10, difficulty: 'Easy', scheduledDate: today, examLevel: 'prelims', isLocked: false, totalUsers: 1105 },

  // ── Speed Challenge ──────────────────────────────────────────────────────────
  { id: 'free-sc-1', type: 'speed-challenge', title: 'Speed Challenge 1', description: '20 questions in 15 minutes – test your limits!', subject: 'Mixed', questions: 20, duration: 15, difficulty: 'Hard', scheduledDate: today, examLevel: 'prelims', isLocked: false, totalUsers: 1974 },
  { id: 'free-sc-2', type: 'speed-challenge', title: 'Speed Challenge 2 – Arithmetic', description: 'Race through 20 arithmetic problems', subject: 'Quantitative Aptitude', questions: 20, duration: 15, difficulty: 'Hard', scheduledDate: today, examLevel: 'prelims', isLocked: false, totalUsers: 1340 },

  // ── Mini Test ───────────────────────────────────────────────────────────────
  { id: 'free-mt-1', type: 'mini-test', title: 'Mini Test – Number System', description: '30 questions on Number System', subject: 'Quantitative Aptitude', questions: 30, duration: 25, difficulty: 'Medium', scheduledDate: today, examLevel: 'both', isLocked: false, totalUsers: 908 },
  { id: 'free-mt-2', type: 'mini-test', title: 'Mini Test – Seating Arrangement', description: '30 questions on seating arrangement puzzles', subject: 'Reasoning', questions: 30, duration: 25, difficulty: 'Hard', scheduledDate: today, examLevel: 'both', isLocked: false, totalUsers: 730 },
  { id: 'free-mt-3', type: 'mini-test', title: 'Mini Test – Reading Comprehension', description: '30 questions covering reading passages', subject: 'English', questions: 30, duration: 25, difficulty: 'Medium', scheduledDate: today, examLevel: 'both', isLocked: false, totalUsers: 620 },

  // ── Full Test ────────────────────────────────────────────────────────────────
  { id: 'free-fp-1', type: 'full-prelims', title: 'Full Test – Prelims Pattern', description: '100 questions following exact prelims exam pattern', subject: 'All Subjects', questions: 100, duration: 60, difficulty: 'Hard', scheduledDate: today, examLevel: 'prelims', isLocked: false, totalUsers: 2480 },
  { id: 'free-fp-2', type: 'full-prelims', title: 'Full Test – SBI PO Prelims Mock', description: 'Complete SBI PO Prelims mock paper', subject: 'All Subjects', questions: 100, duration: 60, difficulty: 'Hard', scheduledDate: today, examLevel: 'prelims', isLocked: false, totalUsers: 3102 },

  // ── Mixed Practice (Daily) ───────────────────────────────────────────────────
  { id: 'free-d-1', type: 'daily', title: "Today's Mixed Practice 1", description: '15 questions covering all subjects', subject: 'Mixed', questions: 15, duration: 15, difficulty: 'Easy', scheduledDate: today, examLevel: 'prelims', isLocked: false, isNew: true, totalUsers: 2467 },
  { id: 'free-d-2', type: 'daily', title: "Today's Mixed Practice 2", description: '15 questions covering all subjects', subject: 'Mixed', questions: 15, duration: 15, difficulty: 'Medium', scheduledDate: today, examLevel: 'prelims', isLocked: false, totalUsers: 1629 },
  { id: 'free-d-3', type: 'daily', title: "Today's Mixed Practice 3", description: '15 questions covering all subjects', subject: 'Mixed', questions: 15, duration: 15, difficulty: 'Hard', scheduledDate: today, examLevel: 'prelims', isLocked: false, totalUsers: 1818 },
  { id: 'free-d-4', type: 'daily', title: "Today's Mixed Practice 4", description: '15 questions covering all subjects', subject: 'Mixed', questions: 15, duration: 15, difficulty: 'Easy', scheduledDate: today, examLevel: 'prelims', isLocked: false, totalUsers: 1919 },
  { id: 'free-d-5', type: 'daily', title: 'Banking Awareness Quick Test', description: 'Cover key banking terms & RBI policies', subject: 'General Awareness', questions: 15, duration: 12, difficulty: 'Medium', scheduledDate: today, examLevel: 'prelims', isLocked: false, totalUsers: 1540 },
  { id: 'free-d-6', type: 'daily', title: 'Current Affairs Daily Drill', description: 'Top 15 current affairs questions from this week', subject: 'Current Affairs', questions: 15, duration: 10, difficulty: 'Easy', scheduledDate: today, examLevel: 'prelims', isLocked: false, totalUsers: 2100 },
];

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS: { label: string; value: QuizType | 'all' }[] = [
  { label: "All",            value: "all"           },
  { label: "Rapid Fire",     value: "rapid-fire"    },
  { label: "Speed Test",     value: "speed-challenge"},
  { label: "Mini Test",      value: "mini-test"     },
  { label: "Full Test",      value: "full-prelims"  },
  { label: "Mixed Practice", value: "daily"         },
];

const WHY_PRACTICE = [
  { title: "Understand Exam Pattern",  desc: "Get familiar with real exam style & difficulty",       icon: FileText   },
  { title: "Improve Speed & Accuracy", desc: "Regular practice helps you solve faster & better",     icon: Clock      },
  { title: "Boost Confidence",         desc: "Track your progress and build exam confidence",         icon: Star       },
  { title: "100% Free Forever",        desc: "Unlimited practice with no hidden charges",             icon: ShieldCheck},
];

// ─── Component ────────────────────────────────────────────────────────────────
const FreeQuizzes = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<QuizType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Attach completion state from localStorage — only runs once, no heavy deps
  const quizzes = useMemo<ExtendedQuiz[]>(() => {
    const completions = getQuizCompletions();
    return DUMMY_FREE_QUIZZES.map(q => ({
      ...q,
      completed: !!completions[q.id],
      score: completions[q.id]?.score,
    }));
  }, []); // intentionally static; re-mount updates on focus (see window.focus below)

  // Live count badges per tab
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: quizzes.length };
    quizzes.forEach(q => {
      counts[q.type] = (counts[q.type] || 0) + 1;
    });
    return counts;
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(q => {
      if (selectedType !== 'all' && q.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const lq = searchQuery.toLowerCase();
        return q.title.toLowerCase().includes(lq) || q.subject.toLowerCase().includes(lq);
      }
      return true;
    });
  }, [quizzes, selectedType, searchQuery]);

  const firstAvailable = filteredQuizzes.find(q => !q.completed && !q.isLocked) ?? filteredQuizzes[0];

  const handleStartQuiz = (quiz: ExtendedQuiz) => {
    if (quiz.isLocked) { toast.error('This quiz is locked!'); return; }
    launchExamWindow({
      quizId:    quiz.id,
      title:     quiz.title,
      subject:   quiz.subject,
      duration:  quiz.duration,
      questions: quiz.questions,
      returnUrl: '/student/daily-quizzes',
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto bg-gray-50/50 min-h-screen">

      {/* ── Hero Header ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Daily Free Quizzes</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Streak
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Free
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Exam-pattern practice tests refreshed daily — completely free, no sign-up needed.
          </p>
        </div>

        {firstAvailable && (
          <Button
            onClick={() => handleStartQuiz(firstAvailable)}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-5 h-11 rounded-xl shadow-md shadow-emerald-600/20 shrink-0 flex items-center gap-2 transition-all"
          >
            <Zap className="w-4 h-4 fill-white" /> Start Today's Quick Quiz
          </Button>
        )}
      </div>

      {/* ── Unified Toolbar ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

          {/* Category chips with count badges */}
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
                  {tab.label}
                  <span className={`text-[10px] px-1.5 rounded-full font-black ${
                    isActive ? 'bg-emerald-700 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + View switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-48">
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
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5">
              <button onClick={() => setViewMode('grid')} title="Grid View"
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setViewMode('list')} title="List View"
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quiz Cards ── */}
      {filteredQuizzes.length > 0 ? (
        <div className={viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          : "flex flex-col gap-4"
        }>
          {filteredQuizzes.map((quiz, index) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onStart={handleStartQuiz}
              todayStr={today}
              index={index}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        /* Actionable empty state */
        <div className="py-16 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
            <Search className="h-7 w-7" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="font-extrabold text-base text-slate-800">No Quizzes Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No quizzes match your current filters. Try resetting them.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              onClick={() => { setSelectedType('all'); setSearchQuery(''); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
            </Button>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="space-y-5 pt-2">
        {/* Why Practice */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Why Practice Daily Free Quizzes?
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

        {/* Upgrade banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
              <Star className="w-3 h-3 fill-emerald-300" /> Examerit Premium
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white">Unlock All India Rank & In-Depth Solutions</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Upgrade to Premium for detailed performance analysis, percentile ranks, and video solutions.
            </p>
          </div>
          <Button
            onClick={() => navigate('/student/pricing')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-10 px-5 rounded-xl shrink-0 shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            Upgrade Now <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

    </div>
  );
};

export default FreeQuizzes;
