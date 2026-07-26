import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Calendar as CalendarIcon,
  Target,
  Flame,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Clock,
  FileText,
  Video,
  ExternalLink,
  Play,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Filter,
  Send,
  X,
  Award,
  Check,
  AlertCircle,
  HelpCircle,
  Lock,
  Zap
} from 'lucide-react';
import SubjectManagementModal from './SubjectManagementModal';

interface TaskResource {
  type: 'pdf' | 'video' | 'link';
  title: string;
  url?: string;
  duration?: string;
}

interface PlanTask {
  id: number;
  priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  tags: { label: string; bg: string; text: string }[];
  durationMinutes: number;
  note: string;
  resources: TaskResource[];
  completionPercentage: number;
  progressText: string;
  ctaText: string;
  ctaAction: string;
  completed?: boolean;
  completedAt?: string;
  scorePercent?: number;
}

// Sample test questions for in-app task test execution
interface TestQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const SAMPLE_QUESTIONS: Record<number, TestQuestion[]> = {
  1: [
    {
      id: 1,
      question: 'What is the simplified value of (144 ÷ 12) × 15 + 85?',
      options: ['265', '245', '255', '275'],
      correctAnswer: 0,
      explanation: '144 ÷ 12 = 12. 12 × 15 = 180. 180 + 85 = 265.'
    },
    {
      id: 2,
      question: 'Find x: 45% of 600 + x = 380',
      options: ['110', '120', '130', '100'],
      correctAnswer: 0,
      explanation: '45% of 600 = 270. 270 + x = 380 => x = 110.'
    },
    {
      id: 3,
      question: 'Evaluate: (18)² - (14)² + 50 = ?',
      options: ['178', '168', '158', '188'],
      correctAnswer: 0,
      explanation: '324 - 196 = 128. 128 + 50 = 178.'
    },
    {
      id: 4,
      question: 'What is (25 × 16) ÷ 4 + 75?',
      options: ['175', '165', '185', '150'],
      correctAnswer: 0,
      explanation: '25 × 16 = 400. 400 ÷ 4 = 100. 100 + 75 = 175.'
    },
    {
      id: 5,
      question: 'Simplify: 35% of 400 + 60% of 150 = ?',
      options: ['230', '220', '240', '210'],
      correctAnswer: 0,
      explanation: '140 + 90 = 230.'
    }
  ]
};

const DEFAULT_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    question: 'Who won the RBI Governor of the Year Award 2024?',
    options: ['Shaktikanta Das', 'Raghuram Rajan', 'Urjit Patel', 'D. Subbarao'],
    correctAnswer: 0,
    explanation: 'Shaktikanta Das was awarded Governor of the Year.'
  },
  {
    id: 2,
    question: 'What is the current Repo Rate set by the RBI?',
    options: ['6.50%', '6.25%', '6.75%', '6.00%'],
    correctAnswer: 0,
    explanation: 'The RBI Repo Rate stands at 6.50%.'
  },
  {
    id: 3,
    question: 'In Banking terminology, what does "NPA" stand for?',
    options: ['Non-Performing Asset', 'Net Profit Association', 'National Payment Account', 'Non-Primary Asset'],
    correctAnswer: 0,
    explanation: 'NPA stands for Non-Performing Asset.'
  }
];

const DATE_WISER_TASKS: Record<string, PlanTask[]> = {
  'Apr 03, 2026': [
    {
      id: 1,
      priorityLevel: 'HIGH',
      title: 'Simplification Practice – 30 Questions',
      tags: [
        { label: 'Quantitative Aptitude', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
        { label: 'Practice', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
        { label: 'High', bg: 'bg-red-50 border-red-200', text: 'text-red-600' }
      ],
      durationMinutes: 40,
      note: 'Focus on accuracy, not speed. Avoid calculation mistakes.',
      resources: [
        { type: 'pdf', title: 'Formula Sheet.pdf' },
        { type: 'video', title: 'Watch Concept Video (12:45)' }
      ],
      completionPercentage: 0,
      progressText: '0/30 Qs',
      ctaText: 'Start Focus Session',
      ctaAction: 'focus',
      completed: false
    },
    {
      id: 2,
      priorityLevel: 'HIGH',
      title: 'Current Affairs Quiz',
      tags: [
        { label: 'General Awareness', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
        { label: 'Quiz', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
        { label: 'Must Do', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' }
      ],
      durationMinutes: 15,
      note: 'Daily quiz is important for consistency.',
      resources: [
        { type: 'pdf', title: "Today's CA PDF" }
      ],
      completionPercentage: 0,
      progressText: '0/20 Qs',
      ctaText: 'Continue Quiz',
      ctaAction: 'quiz',
      completed: false
    },
    {
      id: 3,
      priorityLevel: 'MEDIUM',
      title: 'Reasoning – Square Seating Arrangement',
      tags: [
        { label: 'Reasoning Ability', bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
        { label: 'Practice', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
        { label: 'Medium', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' }
      ],
      durationMinutes: 45,
      note: 'Focus on table based questions and corner cases.',
      resources: [
        { type: 'video', title: 'Concept Video (18:30)' },
        { type: 'pdf', title: 'Practice Set (PDF)' }
      ],
      completionPercentage: 0,
      progressText: '0/25 Qs',
      ctaText: 'Start Focus Session',
      ctaAction: 'focus',
      completed: false
    },
    {
      id: 4,
      priorityLevel: 'MEDIUM',
      title: 'English – Para Jumble & Cloze Test',
      tags: [
        { label: 'English Language', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
        { label: 'Practice', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
        { label: 'Medium', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' }
      ],
      durationMinutes: 30,
      note: "Read passage carefully. Don't rush.",
      resources: [
        { type: 'pdf', title: 'Tricks PDF' },
        { type: 'pdf', title: 'Practice Set' }
      ],
      completionPercentage: 0,
      progressText: '0/20 Qs',
      ctaText: 'Start Focus Session',
      ctaAction: 'focus',
      completed: false
    },
    {
      id: 5,
      priorityLevel: 'LOW',
      title: 'Vocabulary – 15 New Words',
      tags: [
        { label: 'English Language', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
        { label: 'Learn', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
        { label: 'Low', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600' }
      ],
      durationMinutes: 15,
      note: 'Learn with examples and use in sentences.',
      resources: [
        { type: 'pdf', title: 'Word List PDF' },
        { type: 'pdf', title: 'Flash Cards' }
      ],
      completionPercentage: 0,
      progressText: '0/15 Words',
      ctaText: 'Start Learning',
      ctaAction: 'learn',
      completed: false
    },
    {
      id: 6,
      priorityLevel: 'LOW',
      title: 'Computer Awareness – Quiz',
      tags: [
        { label: 'Computer Awareness', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
        { label: 'Quiz', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
        { label: 'Low', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600' }
      ],
      durationMinutes: 10,
      note: 'Quick revision quiz.',
      resources: [
        { type: 'link', title: 'Quiz Link' }
      ],
      completionPercentage: 0,
      progressText: '0/10 Qs',
      ctaText: 'Start Quiz',
      ctaAction: 'quiz',
      completed: false
    }
  ],
  'Apr 02, 2026': [
    {
      id: 101,
      priorityLevel: 'HIGH',
      title: 'Data Interpretation – Line & Bar Graphs',
      tags: [{ label: 'Quantitative Aptitude', bg: 'bg-purple-50', text: 'text-purple-700' }],
      durationMinutes: 45,
      note: 'Completed yesterday with 92% accuracy.',
      resources: [],
      completionPercentage: 100,
      progressText: '25/25 Qs',
      ctaText: 'View Result',
      ctaAction: 'result',
      completed: true,
      completedAt: 'Yesterday at 4:30 PM',
      scorePercent: 92
    },
    {
      id: 102,
      priorityLevel: 'MEDIUM',
      title: 'English Reading Comprehension Drill',
      tags: [{ label: 'English Language', bg: 'bg-amber-50', text: 'text-amber-700' }],
      durationMinutes: 30,
      note: 'Completed yesterday with 85% accuracy.',
      resources: [],
      completionPercentage: 100,
      progressText: '15/15 Qs',
      ctaText: 'View Result',
      ctaAction: 'result',
      completed: true,
      completedAt: 'Yesterday at 6:15 PM',
      scorePercent: 85
    }
  ]
};

const DATES_STRIP = [
  { label: 'TODAY', date: 'Apr 03, 2026', active: true },
  { label: 'SAT', date: 'Apr 04', active: false },
  { label: 'SUN', date: 'Apr 05', active: false },
  { label: 'MON', date: 'Apr 06', active: false },
  { label: 'TUE', date: 'Apr 07', active: false },
  { label: 'WED', date: 'Apr 08', active: false },
  { label: 'THU', date: 'Apr 09', active: false },
];

const TodayPlanView: React.FC<{
  onNavigateToChat?: () => void;
}> = ({ onNavigateToChat }) => {
  const [selectedDate, setSelectedDate] = useState('Apr 03, 2026');
  const [allDateTasks, setAllDateTasks] = useState<Record<string, PlanTask[]>>(DATE_WISER_TASKS);
  const [sortBy, setSortBy] = useState<'priority' | 'time'>('priority');

  // Modal States
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isManagePlanOpen, setIsManagePlanOpen] = useState(false);
  const [activeTestTask, setActiveTestTask] = useState<PlanTask | null>(null);
  const [activeResultTask, setActiveResultTask] = useState<{ task: PlanTask; score: number; userAnswers: number[] } | null>(null);

  // Active tasks for current selected date
  const currentTasks = allDateTasks[selectedDate] || DATE_WISER_TASKS['Apr 03, 2026'] || [];

  const pendingTasks = currentTasks.filter(t => !t.completed);
  const completedTasks = currentTasks.filter(t => t.completed);

  const completedCount = completedTasks.length;
  const totalTasks = currentTasks.length || 6;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  // Dynamic estimated time left calculation based on uncompleted tasks
  const remainingMinutes = pendingTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const remHours = Math.floor(remainingMinutes / 60);
  const remMins = remainingMinutes % 60;
  const formattedTimeLeft = remainingMinutes > 0 ? (remHours > 0 ? `${remHours}h ${remMins}m` : `${remMins}m`) : '0m (Done!)';

  const handleStartTaskTest = (task: PlanTask) => {
    if (task.completed) {
      // Show result
      setActiveResultTask({
        task,
        score: task.scorePercent || 85,
        userAnswers: [0, 0, 0, 0, 0]
      });
    } else {
      setActiveTestTask(task);
    }
  };

  const handleTestSubmitted = (task: PlanTask, scorePercent: number, userAnswers: number[]) => {
    // Complete task and update state
    const updatedTasks = currentTasks.map(t => {
      if (t.id === task.id) {
        return {
          ...t,
          completed: true,
          completionPercentage: 100,
          completedAt: 'Just now',
          scorePercent: scorePercent,
          progressText: 'Completed'
        };
      }
      return t;
    });

    setAllDateTasks(prev => ({ ...prev, [selectedDate]: updatedTasks }));
    setActiveTestTask(null);

    // Trigger Result Modal
    setActiveResultTask({
      task: { ...task, completed: true, scorePercent },
      score: scorePercent,
      userAnswers
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. DATE NAVIGATOR & CALENDAR ACTION BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Date Pill Tabs Row - CENTER ALIGNED TEXT */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
          {DATES_STRIP.map((d, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDate(d.date)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center text-center shrink-0 min-w-[80px] border ${
                selectedDate.includes(d.date)
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] uppercase opacity-80 text-center block w-full">{d.label}</span>
              <span className="text-xs text-center block w-full">{d.date}</span>
            </button>
          ))}
          <button className="w-8 h-8 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 shrink-0">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View Calendar Action Button */}
        <Button
          onClick={() => setIsCalendarOpen(true)}
          variant="outline"
          className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl gap-2 self-start sm:self-auto shadow-2xs shrink-0"
        >
          <CalendarIcon className="w-4 h-4 text-blue-600" />
          <span>View Calendar</span>
        </Button>
      </div>

      {/* ── 2. HERO MISSION BANNER (Clean White Card with Subtle Border) ── */}
      <div className="relative rounded-3xl bg-white border border-slate-200/90 text-slate-900 p-6 sm:p-7 shadow-2xs overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Target Icon + Goal Description */}
          <div className="md:col-span-8 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              <Target className="w-7 h-7 text-blue-600" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                  TODAY'S MISSION 🚀
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                Complete {totalTasks} tasks to achieve your daily target
              </h2>

              {/* Progress Bar */}
              <div className="space-y-1.5 max-w-md pt-1">
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>{completedCount} / {totalTasks} Tasks Completed</span>
                  <span className="text-blue-600 font-extrabold">{progressPercent}% Complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Time Left Metric */}
          <div className="md:col-span-4 flex flex-col md:items-end justify-center space-y-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="text-left md:text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Estimated Time Left
              </span>
              <p className="text-3xl font-black text-slate-900 leading-none mt-1">{formattedTimeLeft}</p>
            </div>

            <Button
              onClick={() => {
                if (pendingTasks.length > 0) handleStartTaskTest(pendingTasks[0]);
                else alert('All tasks for today are completed! Great job!');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-2xl shadow-xs gap-2 transition-all"
            >
              <span>{pendingTasks.length > 0 ? 'Continue Study' : 'Review Tasks'}</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Pending & Completed Tasks Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section A: Pending Tasks */}
          <div className="space-y-6">
            {pendingTasks.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-extrabold text-emerald-900 text-base">All Pending Tasks Completed!</h3>
                <p className="text-xs text-emerald-700">Awesome work! You have finished all daily targets for {selectedDate}.</p>
              </div>
            ) : (
              <div className="relative space-y-6">
                <div className="absolute top-5 bottom-5 left-4 sm:left-5 w-0.5 bg-slate-200 pointer-events-none z-0" />

                {pendingTasks.map(task => {
                  const isHigh = task.priorityLevel === 'HIGH';
                  const isMedium = task.priorityLevel === 'MEDIUM';
                  const isLockedSubject = task.title.includes('Computer Awareness');

                  if (isLockedSubject) {
                    return (
                      <div key={task.id} className="relative z-10 group">
                        {/* Locked Task Card (In-Feed Upsell) */}
                        <div className="bg-slate-50/80 border-2 border-dashed border-slate-300 rounded-2xl p-5 space-y-3.5 transition-all">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-700 bg-slate-200/80 px-2.5 py-1 rounded-md">
                                Task #{task.id}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[11px] font-extrabold bg-slate-200 text-slate-700 border border-slate-300 px-3 py-0.5 rounded-full flex items-center gap-1.5">
                                <Lock className="w-3 h-3 text-slate-600" />
                                <span>Locked Subject (Not Enrolled)</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{task.durationMinutes} min</span>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-extrabold text-slate-800 text-base sm:text-lg leading-snug">
                              {task.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                              Computer Awareness · Daily Quizzes & Personal Guidance
                            </p>
                          </div>

                          {/* Contextual Lock Banner & CTA */}
                          <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                                🔒
                              </div>
                              <p className="text-xs text-amber-900 font-semibold">
                                Mentor guidance & custom daily tasks for Computer Awareness are locked in your plan.
                              </p>
                            </div>

                            <Button
                              onClick={() => setIsManagePlanOpen(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shrink-0 shadow-xs gap-1"
                            >
                              <span>Unlock Subject (₹149/mo)</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={task.id} className="relative z-10 group">
                      {/* Task Card */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-3.5">
                        {/* Consolidated Top Row Header: Task #1 • [🔴 High Priority] • ⏱️ 40 min */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-slate-800 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-md">
                              Task #{task.id}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className={`text-[11px] font-extrabold px-3 py-0.5 rounded-full border flex items-center gap-1.5 ${
                              isHigh
                                ? 'bg-rose-50 border-rose-200 text-rose-700'
                                : isMedium
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}>
                              <span>{isHigh ? '🔴' : isMedium ? '🟡' : '🟢'}</span>
                              <span>{task.priorityLevel} Priority</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{task.durationMinutes} min</span>
                          </div>
                        </div>

                        {/* Title & Neutral Gray Metadata Tags */}
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-blue-600 transition-colors">
                            {task.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {task.tags.filter(t => t.label !== 'High' && t.label !== 'Medium' && t.label !== 'Low').map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700"
                              >
                                {tag.label}
                              </span>
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {task.note}
                        </p>

                        {task.resources.length > 0 && (
                          <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                              Resources
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              {task.resources.map((res, rIdx) => (
                                <button
                                  key={rIdx}
                                  onClick={() => alert(`Opening resource: ${res.title}`)}
                                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all shadow-2xs"
                                >
                                  {res.type === 'pdf' ? (
                                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                  ) : res.type === 'video' ? (
                                    <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                                  ) : (
                                    <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                                  )}
                                  <span>{res.title}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="relative w-11 h-11 flex items-center justify-center">
                              <svg className="w-11 h-11 transform -rotate-90">
                                <circle cx="22" cy="22" r="18" stroke="#F1F5F9" strokeWidth="4" fill="transparent" />
                                <circle
                                  cx="22"
                                  cy="22"
                                  r="18"
                                  stroke={task.completionPercentage > 0 ? '#10B981' : '#CBD5E1'}
                                  strokeWidth="4"
                                  fill="transparent"
                                  strokeDasharray="113"
                                  strokeDashoffset={113 - (113 * task.completionPercentage) / 100}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute text-[11px] font-black text-slate-800">
                                {task.completionPercentage}%
                              </span>
                            </div>

                            <div>
                              <span className="text-xs font-bold text-slate-700">{task.progressText}</span>
                              <p className="text-[10px] text-slate-400 font-medium">Target progress</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            <Button
                              onClick={() => handleStartTaskTest(task)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs gap-1.5 transition-all active:scale-95"
                            >
                              <span>{task.ctaText}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section B: Completed Tasks List (Date-Wise) */}
          {completedTasks.length > 0 && (
            <div className="pt-6 border-t border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Completed Tasks ({selectedDate})
                </h3>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                  {completedTasks.length} Completed
                </span>
              </div>

              <div className="space-y-3">
                {completedTasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm line-through text-slate-500">
                          {task.title}
                        </h4>
                        <p className="text-xs text-emerald-700 font-bold mt-0.5">
                          Score: {task.scorePercent ?? 90}% · Completed {task.completedAt ?? 'Today'}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleStartTaskTest(task)}
                      variant="outline"
                      className="border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold rounded-xl"
                    >
                      View Result Page
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sidebar Widgets (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Widget 0: Solution C - Your Mentorship Plan & Coverage Widget */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">💳</span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Your Mentorship Coverage</h3>
                  <p className="text-[10px] text-slate-400 font-medium">NABARD Grade A · 2 of 5 Active</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Quantitative Aptitude
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 uppercase bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">Active</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Reasoning Ability
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 uppercase bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">Active</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-medium text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> English Language
                </span>
                <button onClick={() => setIsManagePlanOpen(true)} className="text-[11px] font-extrabold text-blue-600 hover:underline">+ Add</button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-medium text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> General Awareness
                </span>
                <button onClick={() => setIsManagePlanOpen(true)} className="text-[11px] font-extrabold text-blue-600 hover:underline">+ Add</button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-medium text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Computer Awareness
                </span>
                <button onClick={() => setIsManagePlanOpen(true)} className="text-[11px] font-extrabold text-blue-600 hover:underline">+ Add</button>
              </div>
            </div>

            <Button
              onClick={() => setIsManagePlanOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-10 rounded-xl shadow-xs gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Add Remaining Subjects (Save 20%)</span>
            </Button>
          </div>

          {/* Widget 1: Mentor Feedback Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs border border-blue-200/60">
                  💬
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Mentor Feedback</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Last session • 20 Apr 2026</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
              <p className="text-xs text-slate-700 italic font-medium leading-relaxed">
                “Good start Sivakumar! Your accuracy in Quant is improving. Focus more on Puzzle speed and keep practicing daily. Avoid silly mistakes.”
              </p>
              <p className="text-xs font-bold text-slate-900 text-right">— Rajesh Kumar</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={() => onNavigateToChat?.()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-10 rounded-xl shadow-xs"
              >
                Reply to Mentor
              </Button>

              <button
                onClick={() => onNavigateToChat?.()}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 shrink-0 transition-colors"
                title="Open Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Widget 2: Today's Streak Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Today's Streak</h3>

            <div className="flex items-center gap-4 bg-orange-50/50 border border-orange-100 rounded-2xl p-4">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="#FFE4E6" strokeWidth="5" fill="transparent" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#F97316"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray="163"
                    strokeDashoffset="35"
                    strokeLinecap="round"
                  />
                </svg>
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500 absolute" />
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900 leading-none">
                  18 Days <span className="text-orange-500">🔥</span>
                </div>
                <p className="text-xs font-bold text-slate-700 mt-1">You are on a roll!</p>
                <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                  Complete all tasks to extend your streak.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Management Modal */}
      <SubjectManagementModal
        isOpen={isManagePlanOpen}
        examName="NABARD Grade A (Mains)"
        onClose={() => setIsManagePlanOpen(false)}
        onUpgradeSuccess={() => setIsManagePlanOpen(false)}
      />

      {/* ── 4. VIEW CALENDAR INTERACTIVE MODAL ── */}
      {isCalendarOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Mentorship Calendar & Task Tracker</h3>
                  <p className="text-xs text-slate-400 font-medium">April 2026 Schedule</p>
                </div>
              </div>

              <button
                onClick={() => setIsCalendarOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Calendar Month Grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-400 uppercase">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1;
                  const isToday = day === 3;
                  const isCompletedDay = day < 3;
                  return (
                    <div
                      key={day}
                      onClick={() => {
                        setSelectedDate(`Apr 0${day}, 2026`);
                        setIsCalendarOpen(false);
                      }}
                      className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                        isToday
                          ? 'bg-indigo-600 text-white font-black border-indigo-600 shadow-md'
                          : isCompletedDay
                          ? 'bg-emerald-50 text-emerald-800 font-bold border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-50 text-slate-700 font-medium border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-sm block">{day}</span>
                      <span className="text-[9px] block opacity-80 mt-0.5">
                        {isToday ? 'Today' : isCompletedDay ? '✓ 6/6' : 'Scheduled'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" /> Completed (6/6)
                </span>
                <span className="flex items-center gap-1 text-indigo-700 font-bold">
                  <div className="w-3 h-3 rounded-full bg-indigo-600" /> Today
                </span>
              </div>

              <Button onClick={() => setIsCalendarOpen(false)} className="bg-slate-900 text-white font-bold text-xs">
                Close Calendar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. REAL TASK TEST TAKING MODAL ── */}
      {activeTestTask && (
        <TaskTestTakingModal
          task={activeTestTask}
          onClose={() => setActiveTestTask(null)}
          onSubmit={(score, answers) => handleTestSubmitted(activeTestTask, score, answers)}
        />
      )}

      {/* ── 6. REAL TASK TEST RESULT MODAL ── */}
      {activeResultTask && (
        <TaskTestResultModal
          task={activeResultTask.task}
          score={activeResultTask.score}
          onClose={() => setActiveResultTask(null)}
        />
      )}
    </div>
  );
};

// ── IN-APP TEST TAKING INTERFACE MODAL ──
const TaskTestTakingModal: React.FC<{
  task: PlanTask;
  onClose: () => void;
  onSubmit: (scorePercent: number, answers: number[]) => void;
}> = ({ task, onClose, onSubmit }) => {
  const questions = SAMPLE_QUESTIONS[task.id] || DEFAULT_QUESTIONS;
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const currentQ = questions[currentQIndex];

  const handleSelectOption = (optIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQIndex]: optIdx }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) correctCount++;
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const answersArr = questions.map((_, i) => selectedAnswers[i] ?? -1);
    onSubmit(scorePercent, answersArr);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Test Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
              IN-APP TEST ENGINE · {task.priorityLevel} PRIORITY
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">{task.title}</h2>
          </div>

          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Question Counter Bar */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <span className="text-xs font-black text-slate-700">
            Question {currentQIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-1.5">
            {questions.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentQIndex(idx)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
                  currentQIndex === idx
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                    : selectedAnswers[idx] !== undefined
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Question Content */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 leading-snug">
            Q{currentQIndex + 1}. {currentQ.question}
          </h3>

          <div className="space-y-2.5">
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = selectedAnswers[currentQIndex] === oIdx;
              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm font-bold transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-indigo-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button
            disabled={currentQIndex === 0}
            onClick={() => setCurrentQIndex(p => p - 1)}
            variant="outline"
            className="border-slate-200 text-xs font-bold rounded-xl"
          >
            Previous
          </Button>

          {currentQIndex < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQIndex(p => p + 1)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 rounded-xl"
            >
              Next Question
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 rounded-xl shadow-md"
            >
              Submit Test & Complete Task
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── TEST RESULT MODAL VIEW ──
const TaskTestResultModal: React.FC<{
  task: PlanTask;
  score: number;
  onClose: () => void;
}> = ({ task, score, onClose }) => {
  const isPass = score >= 70;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-600">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            TASK COMPLETED SUCCESSFULLY ✓
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">{task.title}</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Test Performance & Analysis Summary</p>
        </div>

        {/* Score Card */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-md space-y-2">
          <span className="text-xs font-black uppercase tracking-wider opacity-90">Test Score</span>
          <div className="text-5xl font-black">{score}%</div>
          <p className="text-xs font-bold opacity-90">
            {isPass ? 'Excellent Accuracy! Target Achieved.' : 'Good effort! Review weak areas to improve.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Status</span>
            <span className="text-sm font-black text-emerald-600 mt-0.5 block">Completed</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Time Spent</span>
            <span className="text-sm font-black text-slate-900 mt-0.5 block">{task.durationMinutes} mins</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Saved to</span>
            <span className="text-sm font-black text-indigo-600 mt-0.5 block">Daily Log</span>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-2xl text-sm"
        >
          Done & Return to Today's Tasks
        </Button>
      </div>
    </div>
  );
};

export default TodayPlanView;
