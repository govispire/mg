import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Users, MessageSquare, Trophy, BookOpen,
  CheckCircle2, Clock, Sparkles, Rocket, Lock, FlaskConical,
  TrendingUp, Pin, Paperclip, Star, ArrowRight, Bell,
} from 'lucide-react';
import MentorshipIntro from '@/components/student/mentorship/MentorshipIntro';
import YourMentorsPage from '@/components/student/mentorship/YourMentorsPage';
import SuccessStoriesPage from '@/components/student/mentorship/SuccessStoriesPage';
import StudentChatPage from '@/components/student/mentorship/StudentChatPage';
import DiagnosticTestPage from '@/components/student/mentorship/DiagnosticTestPage';
import ProgressPage from '@/components/student/mentorship/ProgressPage';
import { predefinedDailyTasks, type DailyTask } from '@/data/mentorshipExamData';

// ─── Pinned Mentor Notice ──────────────────────────────────────────────────────

const PinnedNotice = ({ text, mentorName }: { text: string; mentorName: string }) => (
  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
    <Pin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
    <div>
      <span className="text-xs font-bold text-amber-700">📌 Pinned by {mentorName}: </span>
      <span className="text-xs text-amber-800">{text}</span>
    </div>
    <button className="ml-auto text-amber-400 hover:text-amber-600 text-xs">✕</button>
  </div>
);

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({
  label, value, sub, icon: Icon, color, bg,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; bg: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
  </div>
);

// ─── Task Card ────────────────────────────────────────────────────────────────

const TaskCard = ({
  task, onToggle,
}: {
  task: DailyTask; onToggle: (id: string) => void;
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
    <div className={`rounded-xl border-2 p-4 transition-all duration-200 ${
      task.completed
        ? 'bg-green-50 border-green-200 opacity-75'
        : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
    }`}>
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(task.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${
            task.completed
              ? 'border-green-500 bg-green-500 hover:bg-green-600'
              : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
          }`}
          aria-label={`${task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}: ${task.title}`}
          aria-pressed={task.completed}
        >
          {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-bold ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </h3>

          <div className="flex items-center flex-wrap gap-2 mt-1.5">
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${typeColors[task.type] ?? 'bg-gray-100 text-gray-600'}`}>
              {task.type.replace('-', ' ')}
            </span>
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {task.duration}
            </span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${priorityColors[task.priority] ?? 'bg-gray-100 text-gray-700'}`}>
              {task.priority}
            </span>
            {task.assignedBy === 'mentor' && (
              <span className="text-[11px] text-purple-600 font-medium flex items-center gap-1">
                <Star className="w-2.5 h-2.5" /> By Mentor
              </span>
            )}
          </div>

          {task.mentorNote && (
            <p className="text-[11px] text-blue-600 italic mt-1.5 leading-relaxed bg-blue-50 px-2 py-1 rounded">
              💬 Mentor: {task.mentorNote}
            </p>
          )}

          {task.attachment && (
            <button className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-500 hover:text-blue-600">
              <Paperclip className="w-3 h-3" /> {task.attachment}
            </button>
          )}
        </div>

        {!task.completed && (
          <button className="text-xs text-blue-600 font-semibold hover:underline flex-shrink-0">
            Start
          </button>
        )}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════

const MentorshipDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mentorshipSelection, setMentorshipSelection] = useState<any>(null);
  const [hasCompletedWizard, setHasCompletedWizard] = useState(true); // Force true for testing
  const [tasks, setTasks] = useState<DailyTask[]>(predefinedDailyTasks);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratedTask, setCelebratedTask] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('mentorshipSelection');
    if (stored) {
      setMentorshipSelection(JSON.parse(stored));
      setHasCompletedWizard(true);
    } else {
      // For development/testing: set default mentorship selection
      const defaultSelection = {
        category: { id: 'banking', name: 'Banking & Insurance' },
        stage: { id: 'prelims', name: 'Prelims' },
        targetExam: { id: 'sbi-clerk', name: 'SBI Clerk' },
        language: { id: 'english', name: 'English' },
        assignedMentor: {
          id: 'mentor-1',
          name: 'Rajesh Kumar',
          avatar: 'https://i.pravatar.cc/150?u=rajesh',
          rating: 4.9
        }
      };
      setMentorshipSelection(defaultSelection);
      setHasCompletedWizard(true);
      localStorage.setItem('mentorshipSelection', JSON.stringify(defaultSelection));
    }
  }, []);

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;
  const mentor = mentorshipSelection?.assignedMentor;

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const wasCompleted = t.completed;
        const nowCompleted = !wasCompleted;
        if (nowCompleted && !wasCompleted) {
          // Task just completed - show celebration
          setCelebratedTask(t.title);
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
        }
        return { ...t, completed: nowCompleted };
      }
      return t;
    }));
  };

  const filteredTasks = tasks.filter(task => {
    switch (taskFilter) {
      case 'pending': return !task.completed;
      case 'completed': return task.completed;
      default: return true;
    }
  });

  return (
    <main className="container mx-auto p-6 max-w-7xl min-h-[calc(100vh-4rem)]" role="main" aria-label="Mentorship Dashboard">

      {/* Page header */}
      <header className="mb-6" role="banner">
        <h1 className="text-2xl font-bold text-gray-900">Mentorship Program</h1>
        <p className="text-gray-500 text-sm mt-1">Connect with your mentor, track daily tasks, and improve every day</p>
      </header>

      {/* Active plan banner */}
      {mentorshipSelection?.category && (
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-5 mb-6" aria-label="Active mentorship plan">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-blue-200 text-xs font-medium mb-1">YOUR ACTIVE PLAN</p>
              <h2 className="text-lg font-bold">
                {mentorshipSelection.targetExam?.name ?? mentorshipSelection.category?.name}
                {mentorshipSelection.stage && ` · ${mentorshipSelection.stage.name}`}
              </h2>
              {mentorshipSelection.language && (
                <p className="text-blue-200 text-xs mt-1">
                  Language: {mentorshipSelection.language.name}
                </p>
              )}
            </div>
            {mentor && (
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                <img 
                  src={mentor.avatar} 
                  alt={mentor.name} 
                  className="w-10 h-10 rounded-full border-2 border-blue-400 object-cover" 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{mentor.name}</p>
                  <p className="text-xs text-blue-200">Your Mentor · {mentor.rating}⭐</p>
                </div>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px]"
                  aria-label="Chat with mentor"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> <span className="whitespace-nowrap">Chat</span>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Setup prompt */}
      {!hasCompletedWizard && (
        <section className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6" aria-label="Setup wizard prompt">
          <div className="flex items-start gap-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Rocket className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Get Started with Mentorship!</h2>
              <p className="text-gray-600 text-sm mb-4">
                Complete the 9-step setup wizard to get matched with the perfect mentor for your exam.
              </p>
              <Button onClick={() => navigate('/student/mentorship/wizard')} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Sparkles className="mr-2 h-4 w-4" />
                Start Mentorship Wizard
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <nav role="navigation" aria-label="Mentorship sections">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1 bg-gray-100 rounded-xl" role="tablist">
          {[
            { value: 'dashboard', icon: LayoutDashboard, label: 'Overview', locked: false },
            { value: 'tasks', icon: CheckCircle2, label: 'Daily Tasks', locked: !hasCompletedWizard },
            { value: 'chat', icon: MessageSquare, label: 'Chat', locked: !hasCompletedWizard },
            { value: 'diagnostic', icon: FlaskConical, label: 'Tests', locked: !hasCompletedWizard },
            { value: 'progress', icon: TrendingUp, label: 'Progress', locked: !hasCompletedWizard },
            { value: 'your-mentors', icon: Users, label: 'My Mentor', locked: !hasCompletedWizard },
            { value: 'success-stories', icon: Trophy, label: 'Stories', locked: false },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.locked}
                className="flex items-center gap-1.5 py-2.5 text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed relative font-medium transition-all"
                role="tab"
                aria-selected={activeTab === tab.value}
                aria-controls={`tabpanel-${tab.value}`}
                id={`tab-${tab.value}`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.locked && <Lock className="h-2.5 w-2.5 absolute top-1 right-1 text-gray-400" aria-label="Feature locked - complete mentorship setup first" />}
              </TabsTrigger>
            );
          })}
        </TabsList>
        </nav>

        {/* ── Overview ── */}
        <TabsContent value="dashboard" className="mt-0 focus-visible:outline-none" role="tabpanel" aria-labelledby="tab-dashboard" id="tabpanel-dashboard">
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm" aria-label="Mentorship overview">
            <MentorshipIntro onNavigate={setActiveTab} />
          </section>
        </TabsContent>

        {/* ── Daily Tasks ── */}
        <TabsContent value="tasks" className="mt-0 focus-visible:outline-none" role="tabpanel" aria-labelledby="tab-tasks" id="tabpanel-tasks">
          <section aria-label="Daily tasks">
            {/* Header */}
            <header className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Daily Tasks</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {completedCount} Completed
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                  {pendingCount} Pending
                </span>
              </div>
            </header>

            {/* Pinned */}
            <PinnedNotice
              mentorName="Rajesh"
              text="Arjun, do NOT skip GA this week. SBI PO 2025 cut-off for GA is expected to rise. Start with 5 current affairs questions every morning before any other task."
            />

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="TODAY'S TASKS"
                value={tasks.length}
                sub="assigned by mentor"
                icon={BookOpen}
                color="text-gray-900"
                bg=""
              />
              <StatCard
                label="COMPLETED"
                value={completedCount}
                sub={`↑ ${Math.round((completedCount / tasks.length) * 100)}%`}
                icon={CheckCircle2}
                color="text-green-600"
                bg=""
              />
              <StatCard
                label="PENDING"
                value={pendingCount}
                sub="due by 11 PM"
                icon={Clock}
                color="text-orange-500"
                bg=""
              />
              <StatCard
                label="STREAK 🔥"
                value="18"
                sub="days consistent"
                icon={TrendingUp}
                color="text-purple-600"
                bg=""
              />
            </div>

            {/* Task filter buttons */}
            <div className="flex gap-2 mb-4">
              {[
                { key: 'all', label: 'All Tasks', count: tasks.length },
                { key: 'pending', label: 'Pending', count: tasks.filter(t => !t.completed).length },
                { key: 'completed', label: 'Completed', count: tasks.filter(t => t.completed).length },
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setTaskFilter(filter.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    taskFilter === filter.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Task list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">
                  {taskFilter === 'all' ? 'All Tasks' : taskFilter === 'pending' ? 'Pending Tasks' : 'Completed Tasks'}
                </h3>
                <span className="text-xs text-gray-400">Tap to mark done</span>
              </div>
              {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task} onToggle={toggleTask} />
              ))}
              {filteredTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No {taskFilter} tasks found</p>
                </div>
              )}
            </div>
          </section>
        </TabsContent>

        {/* ── Chat ── */}
        <TabsContent value="chat" className="mt-0 focus-visible:outline-none" role="tabpanel" aria-labelledby="tab-chat" id="tabpanel-chat">
          <section aria-label="Mentor chat">
            <StudentChatPage
              mentorName={mentor?.name ?? 'Rajesh Kumar'}
              mentorAvatar={mentor?.avatar ?? 'https://i.pravatar.cc/150?u=rajesh'}
              mentorOnline={true}
            />
          </section>
        </TabsContent>

        {/* ── Diagnostic ── */}
        <TabsContent value="diagnostic" className="mt-0 focus-visible:outline-none" role="tabpanel" aria-labelledby="tab-diagnostic" id="tabpanel-diagnostic">
          <section aria-label="Diagnostic tests">
            <DiagnosticTestPage
              categoryId={mentorshipSelection?.category?.id ?? 'banking'}
              stageId={mentorshipSelection?.stage?.id ?? 'prelims'}
            />
          </section>
        </TabsContent>

        {/* ── Progress ── */}
        <TabsContent value="progress" className="mt-0 focus-visible:outline-none" role="tabpanel" aria-labelledby="tab-progress" id="tabpanel-progress">
          <section aria-label="Progress tracking">
            <ProgressPage />
          </section>
        </TabsContent>

        {/* ── My Mentor ── */}
        <TabsContent value="your-mentors" className="mt-0 focus-visible:outline-none" role="tabpanel" aria-labelledby="tab-your-mentors" id="tabpanel-your-mentors">
          <section aria-label="Your mentors">
            <YourMentorsPage />
          </section>
        </TabsContent>

        {/* ── Stories ── */}
        <TabsContent value="success-stories" className="mt-0 focus-visible:outline-none" role="tabpanel" aria-labelledby="tab-success-stories" id="tabpanel-success-stories">
          <section aria-label="Success stories">
            <SuccessStoriesPage />
          </section>
        </TabsContent>
      </Tabs>

      {/* Task Completion Celebration */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="celebration-title">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 animate-in zoom-in-50 duration-300">
            <div className="text-6xl mb-4">🎉</div>
            <h2 id="celebration-title" className="text-xl font-bold text-gray-900 mb-2">Task Completed!</h2>
            <p className="text-gray-600 text-sm mb-4">Great job on completing:</p>
            <p className="font-semibold text-blue-600 text-sm bg-blue-50 px-3 py-2 rounded-lg">{celebratedTask}</p>
            <button
              onClick={() => setShowCelebration(false)}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
              Keep Going! →
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default MentorshipDashboard;
