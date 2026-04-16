import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Radio, Clock, FileText, Users, ArrowLeft,
  CheckCircle, Timer, BarChart2, Target,
  Award, TrendingUp, Calendar, Play
} from 'lucide-react';
import { toast } from 'sonner';
import LiveTestLeaderboardModal from '@/components/student/quiz/LiveTestLeaderboardModal';

// ── Data ──────────────────────────────────────────────────────────────────────
type TestStatus = 'register' | 'registered' | 'start';

interface LiveTest {
  id: number;
  title: string;
  questions: number;
  duration: number;
  marks: number;
  startDate: string;
  endDate: string;
  examDateTime: Date;
  languages: string[];
  status: TestStatus;
}

const baseTests: LiveTest[] = [
  {
    id: 1, title: 'Target Bank PO Exams - Prelims (Skill Supremacy): Mini Live Test',
    questions: 30, duration: 20, marks: 30,
    startDate: '13 Mar, 9:00', endDate: '15 Mar, 21:00',
    examDateTime: new Date(2026, 2, 13, 9, 0, 0),
    languages: ['English', 'Hindi'], status: 'registered',
  },
  {
    id: 2, title: 'LIC Assistant Prelims - (Learning Lab): Mini Live Test',
    questions: 30, duration: 20, marks: 30,
    startDate: '14 Mar, 9:00', endDate: '16 Mar, 21:00',
    examDateTime: new Date(2026, 2, 14, 9, 0, 0),
    languages: ['English', 'Hindi'], status: 'register',
  },
  {
    id: 3, title: 'RBI Assistant Prelims - (Power Push): Mini Live Test',
    questions: 30, duration: 20, marks: 30,
    startDate: '13 Mar, 9:00', endDate: '15 Mar, 21:00',
    examDateTime: new Date(2026, 2, 13, 9, 0, 0),
    languages: ['English', 'Hindi'], status: 'registered',
  },
  {
    id: 4, title: 'RBI Assistant (Current Affairs Special): Mini Live Test',
    questions: 20, duration: 8, marks: 20,
    startDate: '12 Mar, 9:00', endDate: '14 Mar, 21:00',
    examDateTime: new Date(2026, 2, 12, 9, 0, 0),
    languages: ['English', 'Hindi'], status: 'start',
  },
  {
    id: 5, title: 'SBI PO Prelims - (Learning League): Mini Live Test',
    questions: 30, duration: 19, marks: 30,
    startDate: '11 Mar, 9:00', endDate: '13 Mar, 21:00',
    examDateTime: new Date(2026, 2, 11, 9, 0, 0),
    languages: ['English', 'Hindi'], status: 'start',
  },
  {
    id: 6, title: 'SSC GD: हिंदी - PYQ Live Test',
    questions: 20, duration: 12, marks: 40,
    startDate: '11 Mar, 9:00', endDate: '13 Mar, 21:00',
    examDateTime: new Date(2026, 2, 11, 9, 0, 0),
    languages: ['English', 'Hindi', '+4 More'], status: 'start',
  },
  {
    id: 7, title: 'IBPS Clerk Mains - Speed Booster Live Test',
    questions: 40, duration: 45, marks: 40,
    startDate: '15 Mar, 10:00', endDate: '17 Mar, 21:00',
    examDateTime: new Date(2026, 2, 15, 10, 0, 0),
    languages: ['English', 'Hindi'], status: 'register',
  },
  {
    id: 8, title: 'NIACL AO Prelims: Full Mock Live Test',
    questions: 100, duration: 60, marks: 100,
    startDate: '16 Mar, 9:00', endDate: '18 Mar, 21:00',
    examDateTime: new Date(2026, 2, 16, 9, 0, 0),
    languages: ['English'], status: 'register',
  },
  {
    id: 9, title: 'SBI Clerk - Current Affairs Booster Quiz',
    questions: 25, duration: 15, marks: 25,
    startDate: '17 Mar, 9:00', endDate: '18 Mar, 21:00',
    examDateTime: new Date(2026, 2, 17, 9, 0, 0),
    languages: ['English', 'Hindi'], status: 'register',
  },
];

// Attempted tests (hardcoded demo data)
interface AttemptedTest {
  id: number;
  title: string;
  questions: number;
  duration: number;
  marks: number;
  attemptedDate: string;
  score: number;
  totalMarks: number;
  rank: number;
  totalAttempts: number;
  accuracy: number;
}

const attemptedTests: AttemptedTest[] = [
  {
    id: 101, title: 'IBPS PO Prelims: Speed Round Live Test',
    questions: 30, duration: 20, marks: 30,
    attemptedDate: '10 Mar, 2026', score: 22, totalMarks: 30,
    rank: 142, totalAttempts: 8420, accuracy: 78,
  },
  {
    id: 102, title: 'SBI Clerk Mini Live Test - Quantitative Aptitude',
    questions: 20, duration: 15, marks: 20,
    attemptedDate: '9 Mar, 2026', score: 16, totalMarks: 20,
    rank: 89, totalAttempts: 5230, accuracy: 85,
  },
  {
    id: 103, title: 'RRB NTPC - Current Affairs Booster Live Test',
    questions: 25, duration: 18, marks: 25,
    attemptedDate: '7 Mar, 2026', score: 18, totalMarks: 25,
    rank: 234, totalAttempts: 12340, accuracy: 72,
  },
];

// ── Countdown ─────────────────────────────────────────────────────────────────
const useCountdown = (targetDate: Date) => {
  const getRemaining = () => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins: Math.floor((diff % 3600000) / 60000),
      secs: Math.floor((diff % 60000) / 1000),
    };
  };
  const [remaining, setRemaining] = React.useState(getRemaining);
  React.useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);
  return remaining;
};

const CountdownStrip = ({ targetDate }: { targetDate: Date }) => {
  const r = useCountdown(targetDate);
  const pad = (n: number) => String(n).padStart(2, '0');
  if (!r) return (
    <div className="mt-2 flex items-center gap-1.5 text-emerald-600 text-[10px] sm:text-xs font-semibold">
      <Radio className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-pulse" /> Exam is Live Now!
    </div>
  );
  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 mb-1">
        <Timer className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
        <span className="text-[9px] sm:text-[11px] text-muted-foreground font-medium">Exam starts in</span>
      </div>
      <div className="flex items-center gap-0.5 sm:gap-1">
        {r.days > 0 && <><div className="bg-primary/10 text-primary font-bold text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded">{r.days}d</div><span className="text-muted-foreground text-[9px] sm:text-xs">:</span></>}
        <div className="bg-primary/10 text-primary font-bold text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded">{pad(r.hours)}h</div>
        <span className="text-muted-foreground text-[9px] sm:text-xs">:</span>
        <div className="bg-primary/10 text-primary font-bold text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded">{pad(r.mins)}m</div>
        <span className="text-muted-foreground text-[9px] sm:text-xs">:</span>
        <div className="bg-primary/10 text-primary font-bold text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded min-w-[28px] sm:min-w-[32px] text-center">{pad(r.secs)}s</div>
      </div>
    </div>
  );
};

// ── Live Test Card ─────────────────────────────────────────────────────────────
const LiveTestCard = ({ 
  test, 
  onRegister, 
  onStartTest,
  onShowLeaderboard,
  isCompleted,
  isInProgress,
  onContinueTest
}: { 
  test: LiveTest; 
  onRegister: (id: number) => void;
  onStartTest: (test: LiveTest) => void;
  onShowLeaderboard: (test: LiveTest) => void;
  isCompleted?: boolean;
  isInProgress?: boolean;
  onContinueTest?: (test: LiveTest) => void;
}) => {
  const isLive = test.status === 'start';
  const isEnded = new Date() > new Date(test.examDateTime.getTime() + test.duration * 60000);

  const getAction = () => {
    // After test ends - Show only Leaderboard, Solution, Analysis
    if (isEnded) {
      return (
        <div className="space-y-2">
          <Button 
            size="sm" 
            className="w-full h-8 text-xs font-semibold gap-1.5 bg-slate-800 hover:bg-slate-900 text-white"
            onClick={() => onShowLeaderboard(test)}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            View Leaderboard
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 text-xs font-semibold gap-1.5"
              onClick={() => {
                window.open(
                  `/student/exam-window?testId=${test.id}&title=${encodeURIComponent(test.title)}&duration=${test.duration}&questions=${test.questions}&mode=solution`,
                  '_blank',
                  'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no'
                );
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              Solution
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 text-xs font-semibold gap-1.5"
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Analysis
            </Button>
          </div>
        </div>
      );
    }

    // Test completed
    if (isCompleted) {
      return (
        <div className="space-y-2">
          <Button 
            size="sm" 
            className="w-full h-8 text-xs font-semibold gap-1.5 bg-slate-800 hover:bg-slate-900 text-white"
            onClick={() => onShowLeaderboard(test)}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            View Leaderboard
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 text-xs font-semibold gap-1.5"
              onClick={() => {
                window.open(
                  `/student/exam-window?testId=${test.id}&title=${encodeURIComponent(test.title)}&duration=${test.duration}&questions=${test.questions}&mode=solution`,
                  '_blank',
                  'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no'
                );
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              Solution
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 text-xs font-semibold gap-1.5"
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Analysis
            </Button>
          </div>
        </div>
      );
    }

    // In progress (paused)
    if (isInProgress) {
      return (
        <div className="space-y-2">
          <Button 
            size="sm" 
            className="w-full h-8 text-xs font-semibold gap-1.5 bg-slate-800 hover:bg-slate-900 text-white"
            onClick={() => onContinueTest?.(test)}
          >
            <Play className="h-3.5 w-3.5" />
            Continue Test
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="w-full h-8 text-xs font-semibold gap-1.5"
            onClick={() => onShowLeaderboard(test)}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            View Leaderboard
          </Button>
        </div>
      );
    }

    // Test is live - Show Leaderboard and Start
    if (isLive) {
      return (
        <div className="space-y-2">
          <Button 
            size="sm" 
            className="w-full h-8 text-xs font-semibold gap-1.5 bg-slate-800 hover:bg-slate-900 text-white"
            onClick={() => onStartTest(test)}
          >
            <Play className="h-3.5 w-3.5" />
            Start Test
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="w-full h-8 text-xs font-semibold gap-1.5"
            onClick={() => onShowLeaderboard(test)}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            View Leaderboard
          </Button>
        </div>
      );
    }

    // Registered - Show Start Test
    if (test.status === 'registered') {
      return (
        <div className="space-y-2">
          <Button 
            size="sm" 
            className="w-full h-8 text-xs font-semibold gap-1.5 bg-slate-800 hover:bg-slate-900 text-white"
            onClick={() => onStartTest(test)}
          >
            <Play className="h-3.5 w-3.5" />
            Start Test
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="w-full h-8 text-xs font-semibold gap-1.5"
            onClick={() => onShowLeaderboard(test)}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            View Leaderboard
          </Button>
        </div>
      );
    }

    // Not registered - Show Register
    return (
      <Button 
        size="sm" 
        className="w-full h-8 text-xs font-semibold gap-1.5 bg-slate-800 hover:bg-slate-900 text-white" 
        onClick={() => onRegister(test.id)}
      >
        <Target className="h-3.5 w-3.5" />
        Register Now
      </Button>
    );
  };

  return (
    <Card className="group relative border-2 border-slate-200 bg-white transition-all duration-200 hover:shadow-lg hover:border-slate-300">
      <div className="p-3">
        {/* Header: Badges */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {isLive && (
              <Badge className="bg-red-500 text-white text-[10px] font-bold flex items-center gap-1 h-5 px-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                LIVE
              </Badge>
            )}
            <Badge className="bg-slate-600 text-white text-[10px] font-bold h-5 px-2">
              FREE
            </Badge>
          </div>
          <div className="text-[10px] font-semibold text-slate-400">
            #{test.id}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-xs leading-tight text-slate-800 mb-2 line-clamp-2 min-h-[2rem]">
          {test.title}
        </h3>

        {/* Stats Row */}
        <div className="flex items-center gap-2 mb-2 text-xs text-slate-600">
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
            <FileText className="h-3 w-3" />
            <span className="font-medium">{test.questions} Qs</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
            <Clock className="h-3 w-3" />
            <span className="font-medium">{test.duration} Min</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
            <Award className="h-3 w-3" />
            <span className="font-medium">{test.marks} Marks</span>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-3">
          <Calendar className="h-3.5 w-3.5" />
          <span className="truncate">{test.startDate} to {test.endDate}</span>
        </div>

        {/* Countdown for registered tests */}
        {test.status === 'registered' && !isLive && (
          <div className="mb-3">
            <CountdownStrip targetDate={test.examDateTime} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t border-slate-100 pt-3">
          {getAction()}
        </div>

        {/* Completed badge */}
        {isCompleted && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 text-slate-600 font-semibold text-[10px] bg-slate-100 px-2 py-1 rounded border border-slate-200">
              <CheckCircle className="h-3 w-3" />
              <span>Done</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ── Attempted Card ─────────────────────────────────────────────────────────────
const AttemptedCard = ({ test }: { test: AttemptedTest }) => {
  const percentage = Math.round((test.score / test.totalMarks) * 100);
  const scoreColor = percentage >= 70 ? 'text-emerald-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-500';
  const scoreGradient = percentage >= 70 
    ? 'from-emerald-500 to-emerald-600 bg-gradient-to-br' 
    : percentage >= 50 
    ? 'from-amber-500 to-amber-600 bg-gradient-to-br'
    : 'from-red-500 to-red-600 bg-gradient-to-br';
  const scoreBg = percentage >= 70 
    ? 'bg-emerald-50 border-emerald-200' 
    : percentage >= 50 
    ? 'bg-amber-50 border-amber-200' 
    : 'bg-red-50 border-red-200';

  return (
    <Card className="group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
      {/* Top gradient bar */}
      <div className={`h-1.5 ${scoreGradient}`} />
      
      <div className="p-4">
        {/* Title */}
        <h3 className="font-bold text-sm leading-snug text-slate-800 mb-3 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {test.title}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-slate-600 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-slate-500" />
            <span className="font-medium">{test.questions} Questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-500" />
            <span className="font-medium">{test.duration} Minutes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="font-medium">{test.totalAttempts.toLocaleString()} Attempts</span>
          </div>
        </div>

        {/* Score Card */}
        <div className={`rounded-xl p-4 border-2 mb-4 ${scoreBg}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className={`text-3xl font-black ${scoreColor}`}>{percentage}</span>
                <span className={`text-lg font-semibold ${scoreColor}`}>%</span>
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Score: <span className="font-bold">{test.score}</span> / {test.totalMarks}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 mb-1">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-xl font-black text-slate-800">#{test.rank}</span>
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Accuracy: <span className="font-bold">{test.accuracy}%</span>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span className="font-medium">Performance</span>
              <span className="font-bold">{percentage}%</span>
            </div>
            <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-slate-200">
              <div 
                className={`h-full ${scoreGradient} transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Attempt Date */}
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span className="font-medium">Attempted on {test.attemptedDate}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="h-10 text-xs font-semibold gap-2 hover:bg-slate-50 border-2">
            <Eye className="h-4 w-4" />
            Result
          </Button>
          <Button size="sm" className="h-10 text-xs font-semibold gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all">
            <TrendingUp className="h-4 w-4" />
            Analysis
          </Button>
        </div>
      </div>
    </Card>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
type TabType = 'all' | 'quizzes' | 'attempted';

const LiveTests = () => {
  const [tests, setTests] = React.useState<LiveTest[]>(baseTests);
  const [activeTab, setActiveTab] = React.useState<TabType>('all');
  const [selectedTestForLeaderboard, setSelectedTestForLeaderboard] = useState<LiveTest | null>(null);
  const [testCompletions, setTestCompletions] = useState<Record<number, { score: number; completedAt: string }>>({});
  const [inProgressTests, setInProgressTests] = useState<Record<number, { startTime: string; lastSaved: string }>>({});

  // Load test completions from localStorage
  React.useEffect(() => {
    const savedCompletions = localStorage.getItem('liveTestCompletions');
    if (savedCompletions) {
      try {
        setTestCompletions(JSON.parse(savedCompletions));
      } catch (e) {
        console.error('Failed to parse test completions:', e);
      }
    }
    
    const savedInProgress = localStorage.getItem('liveTestInProgress');
    if (savedInProgress) {
      try {
        setInProgressTests(JSON.parse(savedInProgress));
      } catch (e) {
        console.error('Failed to parse in-progress tests:', e);
      }
    }
  }, []);

  // Real-time leaderboard update every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Trigger re-render of leaderboard modal if open
      if (selectedTestForLeaderboard) {
        setSelectedTestForLeaderboard({ ...selectedTestForLeaderboard });
      }
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [selectedTestForLeaderboard]);

  const handleRegister = (id: number) => {
    const test = tests.find(t => t.id === id);
    if (!test) return;
    setTests(prev => prev.map(t => t.id === id ? { ...t, status: 'registered' as TestStatus } : t));
    const stored = JSON.parse(localStorage.getItem('liveTestRegistrations') || '{}');
    stored[id] = { registeredAt: new Date().toISOString(), title: test.title };
    localStorage.setItem('liveTestRegistrations', JSON.stringify(stored));
    toast.success(`Successfully registered for ${test.title}`, {
      duration: 3000,
    });
  };

  const handleStartTest = (test: LiveTest) => {
    // Save in-progress state
    const newInProgress = {
      ...inProgressTests,
      [test.id]: {
        startTime: new Date().toISOString(),
        lastSaved: new Date().toISOString()
      }
    };
    setInProgressTests(newInProgress);
    localStorage.setItem('liveTestInProgress', JSON.stringify(newInProgress));
    
    // Open exam window for the live test
    window.open(
      `/student/exam-window?testId=${test.id}&title=${encodeURIComponent(test.title)}&duration=${test.duration}&questions=${test.questions}&marks=${test.marks}&mode=exam`,
      '_blank',
      'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no'
    );
    
    toast.info('📝 Exam window opened. Good luck!', {
      duration: 3000,
    });
  };

  const handleContinueTest = (test: LiveTest) => {
    // Open exam window to continue
    window.open(
      `/student/exam-window?testId=${test.id}&title=${encodeURIComponent(test.title)}&duration=${test.duration}&questions=${test.questions}&marks=${test.marks}&mode=continue`,
      '_blank',
      'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no'
    );
    
    toast.info('📝 Continuing your exam...', {
      duration: 3000,
    });
  };

  const handleTestComplete = (testId: number, score: number) => {
    const completions = {
      ...testCompletions,
      [testId]: {
        score,
        completedAt: new Date().toISOString()
      }
    };
    setTestCompletions(completions);
    localStorage.setItem('liveTestCompletions', JSON.stringify(completions));
    
    // Remove from in-progress
    const newInProgress = { ...inProgressTests };
    delete newInProgress[testId];
    setInProgressTests(newInProgress);
    localStorage.setItem('liveTestInProgress', JSON.stringify(newInProgress));
    
    toast.success(`🎉 Test completed! Score: ${score}%`, {
      duration: 5000,
    });
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: 'All Tests' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'attempted', label: `Attempted (${attemptedTests.length})` },
  ];

  const filteredTests = activeTab === 'quizzes'
    ? tests.filter(t => t.questions <= 25)
    : tests;

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" asChild>
          <Link to="/student/dashboard"><ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Radio className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 animate-pulse" />
            Live Tests
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {activeTab === 'attempted' ? `${attemptedTests.length} tests attempted` : `${filteredTests.length} live tests available`}
          </p>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary/20">
        <h2 className="font-bold text-sm sm:text-base mb-1">Recommended Live Tests &amp; <span className="text-primary">Free Quizzes</span></h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Specially crafted for you! Attempt 150+ daily Live tests &amp; quizzes and test your all India ranking.<br />
          Improve your scores and chances of selection in your target exam.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {activeTab === 'attempted' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {attemptedTests.map(test => <AttemptedCard key={test.id} test={test} />)}
        </div>
      ) : (
        filteredTests.length === 0 ? (
          <div className="text-center py-16 sm:py-20 text-muted-foreground">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tests in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {filteredTests.map(test => (
              <LiveTestCard
                key={test.id}
                test={test}
                onRegister={handleRegister}
                onStartTest={handleStartTest}
                onContinueTest={handleContinueTest}
                onShowLeaderboard={setSelectedTestForLeaderboard}
                isCompleted={!!testCompletions[test.id]}
                isInProgress={!!inProgressTests[test.id]}
              />
            ))}
          </div>
        )
      )}

      {/* Live Test Leaderboard Modal */}
      {selectedTestForLeaderboard && (
        <LiveTestLeaderboardModal
          test={selectedTestForLeaderboard}
          onClose={() => setSelectedTestForLeaderboard(null)}
          userCompletion={testCompletions[selectedTestForLeaderboard.id]}
        />
      )}
    </div>
  );
};

export default LiveTests;
