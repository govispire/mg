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
    practice: 'bg-blue-100 text-blue-700',
    mock: 'bg-purple-100 text-purple-700',
    revision: 'bg-green-100 text-green-700',
    reading: 'bg-orange-100 text-orange-700',
    'weak-area': 'bg-red-100 text-red-700',
  };

  return (
    <div className={`rounded-xl border-2 p-4 transition-all ${task.completed ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'}`}>
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(task.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
            ${task.completed ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-blue-500'}`}
        >
          {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-bold ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </h4>

          <div className="flex items-center flex-wrap gap-2 mt-1.5">
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${typeColors[task.type] ?? 'bg-gray-100 text-gray-600'}`}>
              {task.type.replace('-', ' ')}
            </span>
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {task.duration}
            </span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium
              ${task.priority === 'high' ? 'bg-red-50 text-red-600' :
                task.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-500'}`}>
              {task.priority}
            </span>
            {task.assignedBy === 'mentor' && (
              <span className="text-[11px] text-purple-600 font-medium flex items-center gap-1">
                <Star className="w-2.5 h-2.5" /> By Mentor
              </span>
            )}
          </div>

          {task.mentorNote && (
            <p className="text-[11px] text-blue-600 italic mt-1.5 leading-relaxed">
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
  const [hasCompletedWizard, setHasCompletedWizard] = useState(false);
  const [tasks, setTasks] = useState<DailyTask[]>(predefinedDailyTasks);

  useEffect(() => {
    const stored = localStorage.getItem('mentorshipSelection');
    if (stored) {
      setMentorshipSelection(JSON.parse(stored));
      setHasCompletedWizard(true);
    }
  }, []);

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const mentor = mentorshipSelection?.assignedMentor;

  return (
    <div className="container mx-auto p-6 max-w-7xl min-h-[calc(100vh-4rem)]">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mentorship Program</h1>
        <p className="text-gray-500 text-sm mt-1">Connect with your mentor, track daily tasks, and improve every day</p>
      </div>

      {/* Active plan banner */}
      {mentorshipSelection?.category && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
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
              <div className="flex items-center gap-3">
                <img src={mentor.avatar} alt={mentor.name} className="w-10 h-10 rounded-full border-2 border-blue-400" />
                <div>
                  <p className="text-sm font-bold">{mentor.name}</p>
                  <p className="text-xs text-blue-200">Your Mentor · {mentor.rating}⭐</p>
                </div>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Chat
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Setup prompt */}
      {!hasCompletedWizard && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Rocket className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Get Started with Mentorship!</h3>
              <p className="text-gray-600 text-sm mb-4">
                Complete the 9-step setup wizard to get matched with the perfect mentor for your exam.
              </p>
              <Button onClick={() => navigate('/student/mentorship/wizard')} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Sparkles className="mr-2 h-4 w-4" />
                Start Mentorship Wizard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1 bg-gray-100 rounded-xl">
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
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.locked && <Lock className="h-2.5 w-2.5 absolute top-1 right-1 text-gray-400" />}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="dashboard" className="mt-0 focus-visible:outline-none">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <MentorshipIntro onNavigate={setActiveTab} />
          </div>
        </TabsContent>

        {/* ── Daily Tasks ── */}
        <TabsContent value="tasks" className="mt-0 focus-visible:outline-none">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
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
            </div>

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

            {/* Task list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700">Today's Tasks</h3>
                <span className="text-xs text-gray-400">Tap to mark done</span>
              </div>
              {tasks.map(task => (
                <TaskCard key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Chat ── */}
        <TabsContent value="chat" className="mt-0 focus-visible:outline-none">
          <StudentChatPage
            mentorName={mentor?.name ?? 'Rajesh Kumar'}
            mentorAvatar={mentor?.avatar ?? 'https://i.pravatar.cc/150?u=rajesh'}
            mentorOnline={true}
          />
        </TabsContent>

        {/* ── Diagnostic ── */}
        <TabsContent value="diagnostic" className="mt-0 focus-visible:outline-none">
          <DiagnosticTestPage
            categoryId={mentorshipSelection?.category?.id ?? 'banking'}
            stageId={mentorshipSelection?.stage?.id ?? 'prelims'}
          />
        </TabsContent>

        {/* ── Progress ── */}
        <TabsContent value="progress" className="mt-0 focus-visible:outline-none">
          <ProgressPage />
        </TabsContent>

        {/* ── My Mentor ── */}
        <TabsContent value="your-mentors" className="mt-0 focus-visible:outline-none">
          <YourMentorsPage />
        </TabsContent>

        {/* ── Stories ── */}
        <TabsContent value="success-stories" className="mt-0 focus-visible:outline-none">
          <SuccessStoriesPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MentorshipDashboard;
