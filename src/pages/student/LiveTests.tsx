import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Radio, Globe, Clock, FileText, Users, ArrowLeft,
  CheckCircle, Timer, BarChart2, Eye
} from 'lucide-react';
import { toast } from 'sonner';

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
const LiveTestCard = ({ test, onRegister }: { test: LiveTest; onRegister: (id: number) => void }) => {
  const getAction = () => {
    if (test.status === 'registered') {
      return (
        <div className="flex items-center gap-1 text-emerald-600 font-semibold text-[10px] sm:text-xs bg-emerald-50 dark:bg-emerald-950 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Registered</span>
        </div>
      );
    }
    if (test.status === 'start') {
      return <Button size="sm" className="h-7 sm:h-8 text-[10px] sm:text-xs px-2.5 sm:px-4">Start Now</Button>;
    }
    return (
      <Button size="sm" className="h-7 sm:h-8 text-[10px] sm:text-xs px-2.5 sm:px-4" onClick={() => onRegister(test.id)}>
        Register
      </Button>
    );
  };

  return (
    <Card className={`p-3 sm:p-4 border hover:shadow-md transition-all group ${test.status === 'registered' ? 'border-emerald-200 dark:border-emerald-800' : ''}`}>
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <Badge className="bg-red-500 text-white text-[9px] sm:text-[10px] font-bold flex items-center gap-1 h-4.5 sm:h-5 px-1.5 sm:px-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
          </span>
          <span className="hidden xs:inline">LIVE TEST</span>
        </Badge>
        <Badge className="bg-emerald-500 text-white text-[9px] sm:text-[10px] font-bold h-4.5 sm:h-5 px-1.5 sm:px-2">FREE</Badge>
      </div>

      <h3 className="font-semibold text-xs sm:text-sm leading-snug mb-2 sm:mb-3 group-hover:text-primary transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
        {test.title}
      </h3>

      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3 flex-wrap">
        <span className="flex items-center gap-1"><FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{test.questions} Qs</span>
        <span className="opacity-40">|</span>
        <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{test.duration} Mins</span>
        <span className="opacity-40">|</span>
        <span>{test.marks} Marks</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] sm:text-[11px] text-muted-foreground flex items-center gap-1 min-w-0">
          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
          <span className="truncate">{test.startDate} to {test.endDate}</span>
        </span>
        <div className="shrink-0">{getAction()}</div>
      </div>

      {test.status === 'registered' && <CountdownStrip targetDate={test.examDateTime} />}

      <div className="flex items-center gap-1.5 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t">
        <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground shrink-0" />
        <p className="text-[9px] sm:text-[11px] text-muted-foreground">
          {test.languages.map((lang, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-0.5">,</span>}
              <span className={lang.startsWith('+') ? 'text-primary font-medium' : ''}>{lang}</span>
            </span>
          ))}
        </p>
      </div>
    </Card>
  );
};

// ── Attempted Card ─────────────────────────────────────────────────────────────
const AttemptedCard = ({ test }: { test: AttemptedTest }) => {
  const percentage = Math.round((test.score / test.totalMarks) * 100);
  const scoreColor = percentage >= 70 ? 'text-emerald-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-500';
  const scoreBg = percentage >= 70 ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200' : percentage >= 50 ? 'bg-amber-50 dark:bg-amber-950 border-amber-200' : 'bg-red-50 dark:bg-red-950 border-red-200';

  return (
    <Card className="p-3 sm:p-4 border hover:shadow-md transition-all">
      {/* Title */}
      <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3 min-h-[2rem] sm:min-h-[2.5rem]">{test.title}</h3>

      {/* Meta */}
      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3 flex-wrap">
        <span className="flex items-center gap-1"><FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{test.questions} Qs</span>
        <span className="opacity-40">|</span>
        <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{test.duration} Mins</span>
        <span className="opacity-40">|</span>
        <span className="flex items-center gap-1"><Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{test.totalAttempts.toLocaleString()}</span>
      </div>

      {/* Score strip */}
      <div className={`flex items-center justify-between rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 border mb-2 sm:mb-3 ${scoreBg}`}>
        <div>
          <div className={`text-lg sm:text-xl font-bold ${scoreColor}`}>{percentage}%</div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground">Score: {test.score}/{test.totalMarks}</div>
        </div>
        <div className="text-right">
          <div className="text-xs sm:text-sm font-bold">Rank #{test.rank}</div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground">Accuracy {test.accuracy}%</div>
        </div>
      </div>

      {/* Date */}
      <div className="text-[9px] sm:text-[11px] text-muted-foreground mb-2 sm:mb-3 flex items-center gap-1">
        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Attempted on {test.attemptedDate}
      </div>

      {/* Action buttons */}
      <div className="flex gap-1.5 sm:gap-2">
        <Button variant="outline" size="sm" className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs gap-1">
          <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Result</span>
        </Button>
        <Button size="sm" className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs gap-1">
          <BarChart2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="hidden xs:inline">Analysis</span>
        </Button>
      </div>
    </Card>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
type TabType = 'all' | 'quizzes' | 'attempted';

const LiveTests = () => {
  const [tests, setTests] = React.useState<LiveTest[]>(baseTests);
  const [activeTab, setActiveTab] = React.useState<TabType>('all');

  const handleRegister = (id: number) => {
    const test = tests.find(t => t.id === id);
    if (!test) return;
    setTests(prev => prev.map(t => t.id === id ? { ...t, status: 'registered' as TestStatus } : t));
    const stored = JSON.parse(localStorage.getItem('liveTestRegistrations') || '{}');
    stored[id] = { registeredAt: new Date().toISOString(), title: test.title };
    localStorage.setItem('liveTestRegistrations', JSON.stringify(stored));
    toast.success(`You have successfully registered for\n${test.title}`, {
      description: `Exam on ${test.startDate}. A live countdown will appear on your card.`,
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
              <LiveTestCard key={test.id} test={test} onRegister={handleRegister} />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default LiveTests;
