import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  FlaskConical,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Paperclip,
  Pin,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import MentorshipIntro from '@/components/student/mentorship/MentorshipIntro';
import YourMentorsPage from '@/components/student/mentorship/YourMentorsPage';
import FindMentorsPage from '@/components/student/mentorship/FindMentorsPage';
import SuccessStoriesPage from '@/components/student/mentorship/SuccessStoriesPage';
import SubjectManagementModal from '@/components/student/mentorship/SubjectManagementModal';
import StudentChatPage from '@/components/student/mentorship/StudentChatPage';
import DiagnosticTestPage from '@/components/student/mentorship/DiagnosticTestPage';
import ProgressPage from '@/components/student/mentorship/ProgressPage';
import TodayPlanView from '@/components/student/mentorship/TodayPlanView';
import { predefinedDailyTasks, type DailyTask } from '@/data/mentorshipExamData';

type TaskFilter = 'all' | 'pending' | 'completed';

interface MentorshipSelection {
  category?: { id: string; name: string };
  stage?: { id: string; name: string };
  targetExam?: { id: string; name: string };
  language?: { id: string; name: string };
  assignedMentor?: {
    id: string;
    name: string;
    avatar: string;
    rating?: number;
  };
}

const formatToday = () =>
  new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const PinnedNotice = ({ text, mentorName }: { text: string; mentorName: string }) => (
  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
    <Pin className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
    <div className="flex-1">
      <span className="text-xs font-bold text-amber-700">Pinned by {mentorName}: </span>
      <span className="text-xs text-amber-800">{text}</span>
    </div>
  </div>
);

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) => (
  <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
  </div>
);

const TaskCard = ({
  task,
  onToggle,
}: {
  task: DailyTask;
  onToggle: (id: string) => void;
}) => {
  const typeColors: Record<string, string> = {
    practice: 'bg-blue-100 text-blue-700 border-blue-200',
    mock: 'bg-purple-100 text-purple-700 border-purple-200',
    revision: 'bg-green-100 text-green-700 border-green-200',
    reading: 'bg-orange-100 text-orange-700 border-orange-200',
    'weak-area': 'bg-red-100 text-red-700 border-red-200',
  };

  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-700',
  };

  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all duration-200 ${
        task.completed
          ? 'border-green-200 bg-green-50 opacity-75'
          : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
            task.completed
              ? 'border-green-500 bg-green-500 hover:bg-green-600'
              : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
          }`}
          aria-label={`${task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}: ${task.title}`}
          aria-pressed={task.completed}
        >
          {task.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className={`text-sm font-bold ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-gray-500">{task.subject}</p>
            </div>
            {!task.completed && (
              <button className="flex-shrink-0 text-xs font-semibold text-blue-600 hover:underline">
                Start
              </button>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${typeColors[task.type] ?? 'bg-gray-100 text-gray-600'}`}>
              {task.type.replace('-', ' ')}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock className="h-3 w-3" /> {task.duration}
            </span>
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${priorityColors[task.priority] ?? 'bg-gray-100 text-gray-700'}`}>
              {task.priority}
            </span>
            {task.assignedBy === 'mentor' && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-purple-600">
                <Star className="h-2.5 w-2.5" /> By mentor
              </span>
            )}
          </div>

          {task.mentorNote && (
            <p className="mt-2 rounded bg-blue-50 px-2 py-1 text-[11px] leading-relaxed text-blue-700">
              Mentor note: {task.mentorNote}
            </p>
          )}

          {task.attachment && (
            <button className="mt-2 flex items-center gap-1 text-[11px] text-gray-500 hover:text-blue-600">
              <Paperclip className="h-3 w-3" /> {task.attachment}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TodayOverview = ({
  tasks,
  completedCount,
  pendingCount,
  progressPercent,
  mentorName,
  onNavigate,
}: {
  tasks: DailyTask[];
  completedCount: number;
  pendingCount: number;
  progressPercent: number;
  mentorName: string;
  onNavigate: (tab: string) => void;
}) => {
  const nextTask = tasks.find(task => !task.completed) ?? tasks[0];
  const mentorTasks = tasks.filter(task => task.assignedBy === 'mentor' && !task.completed);
  const priorityTasks = tasks.filter(task => !task.completed).slice(0, 3);

  return (
    <section className="space-y-6" aria-label="Mentorship overview">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">{formatToday()}</p>
          <h2 className="mt-2 text-2xl font-bold">Today&apos;s mentorship plan</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100">
            Start with the next assigned task, then review your weak area notes before messaging your mentor.
          </p>

          {nextTask && (
            <div className="mt-6 rounded-xl bg-white/12 p-4 ring-1 ring-white/15">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Next best action</p>
              <h3 className="mt-1 text-lg font-bold">{nextTask.title}</h3>
              <p className="mt-1 text-sm text-blue-100">
                {nextTask.subject} - {nextTask.duration} - {nextTask.priority} priority
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => onNavigate('tasks')}
            >
              Continue Today&apos;s Tasks <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onClick={() => onNavigate('chat')}
            >
              Message Mentor <MessageSquare className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Next mentor review</p>
              <p className="text-xs text-gray-500">Today, 8:00 PM</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-medium">
                <span className="text-gray-500">Today&apos;s completion</span>
                <span className="text-gray-900">{progressPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-500">Mentor focus</p>
              <p className="mt-1 text-sm font-bold text-gray-900">
                {mentorTasks[0]?.subject ?? 'Quantitative Aptitude'} accuracy and RC pacing
              </p>
            </div>
          </div>
        </div>
      </div>

      <PinnedNotice
        mentorName={mentorName}
        text="Do the high-priority tasks before any new mock test. Today is for fixing repeated mistakes, not adding more attempts."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Tasks Today" value={tasks.length} sub="assigned plan" icon={BookOpen} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Completed" value={completedCount} sub={`${progressPercent}% done`} icon={CheckCircle2} color="text-green-600" bg="bg-green-50" />
        <StatCard label="Pending" value={pendingCount} sub="due by 11 PM" icon={Clock} color="text-orange-500" bg="bg-orange-50" />
        <StatCard label="Weak Areas" value={mentorTasks.length || 2} sub="mentor watched" icon={Target} color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Priority tasks</h3>
              <p className="text-sm text-gray-500">The shortest path to today&apos;s progress.</p>
            </div>
            <button onClick={() => onNavigate('tasks')} className="text-sm font-semibold text-blue-600 hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {priorityTasks.map(task => (
              <TaskCard key={task.id} task={task} onToggle={() => onNavigate('tasks')} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Weakness repair plan</h3>
              <p className="text-xs text-gray-500">Based on recent tasks and mentor notes</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { topic: 'Seating Arrangement', action: 'Attempt slowly, then compare errors' },
              { topic: 'Reading Comprehension', action: 'One passage untimed, one timed' },
              { topic: 'Simplification', action: 'Target fewer than 5 wrong answers' },
            ].map(item => (
              <div key={item.topic} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-sm font-bold text-gray-900">{item.topic}</p>
                <p className="mt-1 text-xs text-gray-500">{item.action}</p>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" variant="outline" onClick={() => onNavigate('progress')}>
            Open Progress Analysis
          </Button>
        </div>
      </div>
    </section>
  );
};

const MentorshipDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today-plan');
  const [mentorshipSelection, setMentorshipSelection] = useState<MentorshipSelection | null>(null);
  const [hasCompletedWizard, setHasCompletedWizard] = useState(false);
  const [tasks, setTasks] = useState<DailyTask[]>(predefinedDailyTasks);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratedTask, setCelebratedTask] = useState('');
  const [isManagePlanOpen, setIsManagePlanOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('mentorshipSelection');
    if (!stored) {
      setMentorshipSelection(null);
      setHasCompletedWizard(false);
      return;
    }

    try {
      setMentorshipSelection(JSON.parse(stored));
      setHasCompletedWizard(true);
    } catch (error) {
      console.error('Failed to parse mentorship selection', error);
      localStorage.removeItem('mentorshipSelection');
      setMentorshipSelection(null);
      setHasCompletedWizard(false);
    }
  }, []);

  const mentor = mentorshipSelection?.assignedMentor;
  const mentorName = mentor?.name ?? 'Rajesh Kumar';

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextState = !t.completed;
          if (nextState) {
            setCelebratedTask(t.title);
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'pending') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    return true;
  });

  const formatToday = () => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const startWizard = () => navigate('/student/mentorship/wizard');

  return (
    <main className="container mx-auto min-h-[calc(100vh-4rem)] max-w-7xl p-6" role="main" aria-label="Mentorship Dashboard">
      {/* ── TOP HEADER: ENROLLED SUBJECT CHIPS & UPGRADE ENTRY STRIP ── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Mentorship Program</h1>

            {mentorshipSelection?.category && (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 font-bold text-xs px-3 py-1 rounded-full border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>
                  {mentorshipSelection.targetExam?.name ?? mentorshipSelection.category?.name}
                  {mentorshipSelection.stage && ` - ${mentorshipSelection.stage.name}`}
                </span>
              </span>
            )}
          </div>

          {/* Enrolled Subject Chips Bar */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span className="text-xs font-bold text-slate-400">Enrolled:</span>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
              <span>Quant</span> <span className="text-[10px]">🟢</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
              <span>Reasoning</span> <span className="text-[10px]">🟢</span>
            </span>

            {/* Add Subject Entry Point Button */}
            <button
              onClick={() => setIsManagePlanOpen(true)}
              className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-extrabold px-3 py-1 rounded-full transition-all shadow-2xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add / Upgrade Subjects</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subject Management Modal */}
      <SubjectManagementModal
        isOpen={isManagePlanOpen}
        examName={mentorshipSelection?.targetExam?.name ?? 'NABARD Grade A (Mains)'}
        onClose={() => setIsManagePlanOpen(false)}
        onUpgradeSuccess={() => setIsManagePlanOpen(false)}
      />

      {!hasCompletedWizard && (
        <section className="mb-6 rounded-xl border-2 border-orange-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-6" aria-label="Setup wizard prompt">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-orange-100 p-3">
              <Rocket className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="mb-1 text-lg font-bold text-gray-900">Set up your mentorship plan</h2>
              <p className="mb-4 text-sm text-gray-600">
                Complete the setup wizard to match your target exam, stage, language, and mentor before daily tasks unlock.
              </p>
              <Button onClick={startWizard} className="bg-blue-600 text-white hover:bg-blue-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Start Mentorship Wizard
              </Button>
            </div>
          </div>
        </section>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <nav role="navigation" aria-label="Mentorship navigation" className="border-b border-slate-200">
          <TabsList className="flex items-center gap-6 bg-transparent p-0 rounded-none w-full justify-start overflow-x-auto shadow-none border-0 h-auto" role="tablist">
            {[
              { value: 'today-plan', icon: Target, label: "Today's Plan", badge: '🎯' },
              { value: 'mentor-chat', icon: MessageSquare, label: 'Mentor & Chat', badge: '💬' },
              { value: 'progress', icon: TrendingUp, label: 'My Progress', badge: '📊' },
              { value: 'success-stories', icon: Trophy, label: 'Success Stories', badge: '🌟' },
            ].map(tab => {
              const isActive = activeTab === tab.value || (activeTab === 'dashboard' && tab.value === 'today-plan');
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 pb-3 pt-1 px-1 text-sm font-bold text-slate-500 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent shadow-none transition-all hover:text-slate-900"
                  role="tab"
                  aria-selected={isActive}
                >
                  <span className="text-base leading-none">{tab.badge}</span>
                  <span className="whitespace-nowrap">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </nav>

        {/* ── TAB 1: TODAY'S PLAN ── */}
        <TabsContent value="today-plan" className="mt-0 space-y-6 focus-visible:outline-none">
          {hasCompletedWizard ? (
            <TodayPlanView onNavigateToChat={() => setActiveTab('mentor-chat')} />
          ) : (
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm" aria-label="Mentorship introduction">
              <MentorshipIntro onNavigate={setActiveTab} onStartWizard={startWizard} />
            </section>
          )}
        </TabsContent>

        {/* ── TAB 2: MENTOR & CHAT ── */}
        <TabsContent value="mentor-chat" className="mt-0 space-y-6 focus-visible:outline-none">
          <div className="space-y-6">
            {/* Sub-navigation for Chat vs Mentor Team */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200">
              <button
                onClick={() => setTaskFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  taskFilter !== 'pending'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Chat with Mentor</span>
              </button>

              <button
                onClick={() => setTaskFilter('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  taskFilter === 'pending'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Support & Mentor Team</span>
              </button>
            </div>

            {/* View 1: Live Chat */}
            {taskFilter !== 'pending' && (
              <div className="w-full">
                <StudentChatPage
                  mentorName={mentor?.name ?? 'Rajesh Kumar'}
                  mentorAvatar={mentor?.avatar ?? 'https://i.pravatar.cc/150?u=rajesh'}
                  mentorOnline={true}
                />
              </div>
            )}

            {/* View 2: Support & Mentor Team Cards */}
            {taskFilter === 'pending' && (
              <div className="w-full max-w-5xl mx-auto">
                <YourMentorsPage />
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── TAB 3: MY PROGRESS ── */}
        <TabsContent value="progress" className="mt-0 space-y-6 focus-visible:outline-none">
          <ProgressPage />
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">Diagnostic & Sectional Tests</h3>
            <DiagnosticTestPage
              categoryId={mentorshipSelection?.category?.id ?? 'banking'}
              stageId={mentorshipSelection?.stage?.id ?? 'prelims'}
            />
          </div>
        </TabsContent>

        {/* ── TAB 4: SUCCESS STORIES ── */}
        <TabsContent value="success-stories" className="mt-0 focus-visible:outline-none">
          <SuccessStoriesPage />
        </TabsContent>
      </Tabs>

      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="celebration-title">
          <div className="mx-4 max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl animate-in zoom-in-50 duration-300">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <h2 id="celebration-title" className="mb-2 text-xl font-bold text-gray-900">Task completed</h2>
            <p className="mb-4 text-sm text-gray-600">Nice work. You completed:</p>
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600">{celebratedTask}</p>
            <button
              onClick={() => setShowCelebration(false)}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Keep going
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default MentorshipDashboard;
