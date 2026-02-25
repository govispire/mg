import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Search, Trophy, BookOpen, CheckCircle2, Clock, Calendar as CalendarIcon, Lock, Sparkles, Rocket } from 'lucide-react';
import MentorshipIntro from '@/components/student/mentorship/MentorshipIntro';
import YourMentorsPage from '@/components/student/mentorship/YourMentorsPage';
import FindMentorsPage from '@/components/student/mentorship/FindMentorsPage';
import SuccessStoriesPage from '@/components/student/mentorship/SuccessStoriesPage';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedBy: string;
}

interface SyllabusItem {
  id: string;
  day: number;
  topic: string;
  subtopics: string[];
  resources: string[];
  completed: boolean;
}

const MentorshipDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mentorshipSelection, setMentorshipSelection] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [hasCompletedWizard, setHasCompletedWizard] = useState(false);

  useEffect(() => {
    // Load mentorship selection from localStorage
    const storedSelection = localStorage.getItem('mentorshipSelection');
    if (storedSelection) {
      setMentorshipSelection(JSON.parse(storedSelection));
      setHasCompletedWizard(true);
    } else {
      setHasCompletedWizard(false);
    }

    // Mock tasks assigned by mentor
    setTasks([
      {
        id: '1',
        title: 'Complete Quantitative Aptitude Practice Set',
        description: 'Solve 50 questions from Chapter 5-7',
        dueDate: '2026-01-30',
        status: 'pending',
        assignedBy: 'Dr. Rajesh Kumar'
      },
      {
        id: '2',
        title: 'Weekly Reasoning Test',
        description: 'Attempt the mock test and submit solutions',
        dueDate: '2026-02-02',
        status: 'in-progress',
        assignedBy: 'Dr. Rajesh Kumar'
      },
      {
        id: '3',
        title: 'English Grammar Revision',
        description: 'Review error correction and comprehension',
        dueDate: '2026-01-28',
        status: 'completed',
        assignedBy: 'Dr. Rajesh Kumar'
      }
    ]);

    // Mock daily syllabus
    setSyllabus([
      {
        id: '1',
        day: 1,
        topic: 'Number Systems',
        subtopics: ['Basic number theory', 'Divisibility rules', 'HCF and LCM'],
        resources: ['Chapter 1 PDF', 'Video Lecture'],
        completed: true
      },
      {
        id: '2',
        day: 2,
        topic: 'Percentages',
        subtopics: ['Basic calculations', 'Successive percentages', 'Application problems'],
        resources: ['Practice Set 1', 'Mock Test'],
        completed: true
      },
      {
        id: '3',
        day: 3,
        topic: 'Profit and Loss',
        subtopics: ['Cost price and selling price', 'Discount', 'Partnership'],
        resources: ['Chapter 3 PDF', 'Quiz'],
        completed: false
      }
    ]);
  }, []);

  const hasMentorshipPlan = mentorshipSelection && mentorshipSelection.category;

  const handleStartWizard = () => {
    navigate('/student/mentorship/wizard');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl min-h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mentorship Program</h1>
        <p className="text-gray-600 mt-2">Connect with experts, track your progress, and achieve your goals</p>
      </div>

      {hasMentorshipPlan && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Active Plan</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-purple-100 text-sm">Category</p>
                  <p className="font-semibold">{mentorshipSelection.category?.name}</p>
                </div>
                <div>
                  <p className="text-purple-100 text-sm">Stage</p>
                  <p className="font-semibold">{mentorshipSelection.stage?.name}</p>
                </div>
                <div>
                  <p className="text-purple-100 text-sm">Duration</p>
                  <p className="font-semibold">{mentorshipSelection.duration?.name}</p>
                </div>
                <div>
                  <p className="text-purple-100 text-sm">Type</p>
                  <p className="font-semibold">{mentorshipSelection.type?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!hasCompletedWizard && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Rocket className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Get Started with Mentorship!</h3>
              <p className="text-gray-700 mb-4">
                Start your personalized mentorship journey by completing the selection wizard.
                Choose your exam category, preparation stage, duration, and mentorship type to unlock all features.
              </p>
              <Button
                onClick={handleStartWizard}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Start Mentorship Wizard
              </Button>
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-gray-100 rounded-xl">
          <TabsTrigger
            value="dashboard"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="font-medium">Overview</span>
          </TabsTrigger>

          <TabsTrigger
            value="tasks"
            disabled={!hasCompletedWizard}
            className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed relative"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">Tasks</span>
            {!hasCompletedWizard && <Lock className="h-3 w-3 absolute top-1 right-1 text-gray-400" />}
          </TabsTrigger>

          <TabsTrigger
            value="syllabus"
            disabled={!hasCompletedWizard}
            className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed relative"
          >
            <BookOpen className="h-4 w-4" />
            <span className="font-medium">Syllabus</span>
            {!hasCompletedWizard && <Lock className="h-3 w-3 absolute top-1 right-1 text-gray-400" />}
          </TabsTrigger>

          <TabsTrigger
            value="your-mentors"
            disabled={!hasCompletedWizard}
            className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed relative"
          >
            <Users className="h-4 w-4" />
            <span className="font-medium">Your Mentors</span>
            {!hasCompletedWizard && <Lock className="h-3 w-3 absolute top-1 right-1 text-gray-400" />}
          </TabsTrigger>

          <TabsTrigger
            value="find-mentors"
            disabled={!hasCompletedWizard}
            className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed relative"
          >
            <Search className="h-4 w-4" />
            <span className="font-medium">Find Mentors</span>
            {!hasCompletedWizard && <Lock className="h-3 w-3 absolute top-1 right-1 text-gray-400" />}
          </TabsTrigger>

          <TabsTrigger
            value="success-stories"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
          >
            <Trophy className="h-4 w-4" />
            <span className="font-medium">Stories</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0 focus-visible:outline-none">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <MentorshipIntro onNavigate={setActiveTab} />
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-0 focus-visible:outline-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Assigned Tasks</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {tasks.filter(t => t.status === 'pending').length} Pending
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {tasks.filter(t => t.status === 'completed').length} Completed
                </span>
              </div>
            </div>

            {tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">{task.title}</h3>
                    <p className="text-gray-600 mb-3">{task.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <span className="text-gray-500">Assigned by: {task.assignedBy}</span>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                      {task.status === 'completed' ? 'Completed' :
                        task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                </div>
                {task.status !== 'completed' && (
                  <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all">
                    Start Task
                  </button>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="syllabus" className="mt-0 focus-visible:outline-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Daily Syllabus Plan</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {syllabus.filter(s => s.completed).length} / {syllabus.length} Completed
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-purple-600" />
                Today's Focus
              </h3>
              <p className="text-gray-700">
                {syllabus.find(s => !s.completed)?.topic || 'All topics completed!'}
              </p>
            </div>

            {syllabus.map((item) => (
              <div key={item.id} className={`rounded-xl border-2 p-6 transition-all ${item.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:shadow-lg'
                }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${item.completed ? 'bg-green-500 text-white' : 'bg-purple-100 text-purple-700'
                      }`}>
                      {item.completed ? <CheckCircle2 className="w-6 h-6" /> : item.day}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">Day {item.day}: {item.topic}</h3>
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Subtopics:</p>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                          {item.subtopics.map((sub, idx) => (
                            <li key={idx}>{sub}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Resources:</p>
                        <div className="flex gap-2 flex-wrap">
                          {item.resources.map((resource, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                              {resource}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {!item.completed && (
                  <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all">
                    Mark as Completed
                  </button>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="your-mentors" className="mt-0 focus-visible:outline-none">
          <YourMentorsPage />
        </TabsContent>

        <TabsContent value="find-mentors" className="mt-0 focus-visible:outline-none">
          <FindMentorsPage />
        </TabsContent>

        <TabsContent value="success-stories" className="mt-0 focus-visible:outline-none">
          <SuccessStoriesPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MentorshipDashboard;
