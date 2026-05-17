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
import StudentChatPage from '@/components/student/mentorship/StudentChatPage';
import DiagnosticTestPage from '@/components/student/mentorship/DiagnosticTestPage';
import ProgressPage from '@/components/student/mentorship/ProgressPage';
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mentorshipSelection, setMentorshipSelection] = useState<MentorshipSelection | null>(null);
  const [hasCompletedWizard, setHasCompletedWizard] = useState(false);
  const [tasks, setTasks] = useState<DailyTask[]>(predefinedDailyTasks);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratedTask, setCelebratedTask] = useState('');

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

  const completedCount = tasks.filter(task => task.completed).length;
  const pendingCount = tasks.length - completedCount;
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const mentor = mentorshipSelection?.assignedMentor;
  const mentorName = mentor?.name ?? 'Your mentor';

  const filteredTasks = useMemo(() => {
    switch (taskFilter) {
      case 'pending':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  }, [taskFilter, tasks]);

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== id) return task;

        const nowCompleted = !task.completed;
        if (nowCompleted) {
          setCelebratedTask(task.title);
          setShowCelebration(true);
          window.setTimeout(() => setShowCelebration(false), 2500);
        }

        return { ...task, completed: nowCompleted };
      }),
    );
  };

  const startWizard = () => navigate('/student/mentorship/wizard');

  return (
    <main className="container mx-auto min-h-[calc(100vh-4rem)] max-w-7xl p-6" role="main" aria-label="Mentorship Dashboard">
      <header className="mb-6" role="banner">
        <h1 className="text-2xl font-bold text-gray-900">Mentorship Program</h1>
        <p className="mt-1 text-sm text-gray-500">Connect with your mentor, track daily tasks, and improve every day.</p>
      </header>

      {mentorshipSelection?.category && (
        <section className="mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white" aria-label="Active mentorship plan">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-100">Active plan</p>
              <h2 className="text-lg font-bold">
                {mentorshipSelection.targetExam?.name ?? mentorshipSelection.category?.name}
                {mentorshipSelection.stage && ` - ${mentorshipSelection.stage.name}`}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-blue-100">
                {mentorshipSelection.category?.name && <span>{mentorshipSelection.category.name}</span>}
                {mentorshipSelection.language?.name && <span>Language: {mentorshipSelection.language.name}</span>}
                <span>{progressPercent}% today complete</span>
              </div>
            </div>

            {mentor && (
              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-nowrap">
                <img src={mentor.avatar} alt={mentor.name} className="h-10 w-10 rounded-full border-2 border-blue-300 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">{mentor.name}</p>
                  <p className="text-xs text-blue-100">Your mentor{mentor.rating ? ` - ${mentor.rating}/5` : ''}</p>
                </div>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg bg-white/20 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/30"
                  aria-label="Chat with mentor"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="whitespace-nowrap">Chat</span>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

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
        <nav role="navigation" aria-label="Mentorship sections">
          <TabsList className="grid h-auto w-full grid-cols-4 rounded-xl bg-gray-100 p-1 lg:grid-cols-8" role="tablist">
            {[
              { value: 'dashboard', icon: LayoutDashboard, label: 'Overview', locked: false },
              { value: 'tasks', icon: CheckCircle2, label: 'Tasks', locked: !hasCompletedWizard },
              { value: 'chat', icon: MessageSquare, label: 'Chat', locked: !hasCompletedWizard },
              { value: 'diagnostic', icon: FlaskConical, label: 'Tests', locked: !hasCompletedWizard },
              { value: 'progress', icon: TrendingUp, label: 'Progress', locked: !hasCompletedWizard },
              { value: 'your-mentors', icon: Users, label: 'Mentor', locked: !hasCompletedWizard },
              { value: 'find-mentors', icon: Search, label: 'Find', locked: !hasCompletedWizard },
              { value: 'success-stories', icon: Trophy, label: 'Stories', locked: false },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  disabled={tab.locked}
                  className="relative flex items-center gap-1.5 py-2.5 text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                  role="tab"
                  aria-selected={activeTab === tab.value}
                  aria-controls={`tabpanel-${tab.value}`}
                  id={`tab-${tab.value}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.locked && <Lock className="absolute right-1 top-1 h-2.5 w-2.5 text-gray-400" aria-label="Feature locked until mentorship setup is complete" />}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </nav>

        <TabsContent value="dashboard" className="mt-0 focus-visible:outline-none" role="tabpanel" aria-labelledby="tab-dashboard" id="tabpanel-dashboard">
          {hasCompletedWizard ? (
            <TodayOverview
              tasks={tasks}
              completedCount={completedCount}
              pendingCount={pendingCount}
              progressPercent={progressPercent}
              mentorName={mentorName}
              onNavigate={setActiveTab}
            />
          ) : (
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm" aria-label="Mentorship introduction">
              <MentorshipIntro onNavigate={setActiveTab} onStartWizard={startWizard} />
            </section>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-0 focus-visible:outline-none" role="tabpanel" aria-labelledby="tab-tasks" id="tabpanel-tasks">
          <section aria-label="Daily tasks">
            <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Daily Tasks</h2>
                <p className="mt-0.5 text-xs text-gray-500">{formatToday()}</p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">{completedCount} Completed</span>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">{pendingCount} Pending</span>
              </div>
            </header>

            <div className="mb-5">
              <PinnedNotice
                mentorName={mentor?.name?.split(' ')[0] ?? 'Mentor'}
                text="Start with GA warm-up, then complete the high-priority weak-area tasks before any new mock attempt."
              />
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Tasks" value={tasks.length} sub="assigned today" icon={BookOpen} color="text-blue-600" bg="bg-blue-50" />
              <StatCard label="Completed" value={completedCount} sub={`${progressPercent}% complete`} icon={CheckCircle2} color="text-green-600" bg="bg-green-50" />
              <StatCard label="Pending" value={pendingCount} sub="due by 11 PM" icon={Clock} color="text-orange-500" bg="bg-orange-50" />
              <StatCard label="Streak" value="18" sub="days consistent" icon={TrendingUp} color="text-purple-600" bg="bg-purple-50" />
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Tasks', count: tasks.length },
                { key: 'pending', label: 'Pending', count: tasks.filter(task => !task.completed).length },
                { key: 'completed', label: 'Completed', count: tasks.filter(task => task.completed).length },
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setTaskFilter(filter.key as TaskFilter)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    taskFilter === filter.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">
                  {taskFilter === 'all' ? 'All Tasks' : taskFilter === 'pending' ? 'Pending Tasks' : 'Completed Tasks'}
                </h3>
                <span className="text-xs text-gray-400">Tap the circle to mark done</span>
              </div>
              {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task} onToggle={toggleTask} />
              ))}
              {filteredTasks.length === 0 && (
                <div className="rounded-xl border border-gray-100 bg-white py-8 text-center text-gray-500">
                  <p className="text-sm">No {taskFilter} tasks found</p>
                </div>
              )}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="chat" className="mt-0 focus-visible:outline-none" role="tabpanel" aria-labelledby="tab-chat" id="tabpanel-chat">
          <section aria-label="Mentor chat">
            <StudentChatPage
              mentorName={mentor?.name ?? 'Rajesh Kumar'}
              mentorAvatar={mentor?.avatar ?? 'https://i.pravatar.cc/150?u=rajesh'}
              mentorOnline={true}
            />
          </section>
        </TabsContent>

        <TabsContent value="diagnostic" className="mt-0 focus-visible:outline-none" role="tabpanel" aria-labelledby="tab-diagnostic" id="tabpanel-diagnostic">
          <section aria-label="Diagnostic tests">
            <DiagnosticTestPage
              categoryId={mentorshipSelection?.category?.id ?? 'banking'}
              stageId={mentorshipSelection?.stage?.id ?? 'prelims'}
            />
          </section>
        </TabsContent>

        <TabsContent value="progress" className="mt-0 focus-visible:outline-none" role="tabpanel" aria-labelledby="tab-progress" id="tabpanel-progress">
          <section aria-label="Progress tracking">
            <ProgressPage />
          </section>
        </TabsContent>

        <TabsContent value="your-mentors" className="mt-0 focus-visible:outline-none" role="tabpanel" aria-labelledby="tab-your-mentors" id="tabpanel-your-mentors">
          <section aria-label="Your mentors">
            <YourMentorsPage />
          </section>
        </TabsContent>

        <TabsContent value="find-mentors" className="mt-0 focus-visible:outline-none" role="tabpanel" aria-labelledby="tab-find-mentors" id="tabpanel-find-mentors">
          <section aria-label="Find mentors">
            <FindMentorsPage />
          </section>
        </TabsContent>

        <TabsContent value="success-stories" className="mt-0 focus-visible:outline-none" role="tabpanel" aria-labelledby="tab-success-stories" id="tabpanel-success-stories">
          <section aria-label="Success stories">
            <SuccessStoriesPage />
          </section>
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
