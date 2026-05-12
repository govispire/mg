import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Radio, Clock, FileText, Users, ArrowLeft,
  CheckCircle, Timer, BarChart2, Target,
  Award, TrendingUp, Calendar, Play,
  LayoutGrid, List, Eye
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

const now = new Date();
const getRelDate = (daysOffset: number, hours: number = 9) => {
  const d = new Date(now);
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, 0, 0, 0);
  return d;
};
const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

const baseTests: LiveTest[] = [
  {
    id: 1, title: 'Target Bank PO Exams - Prelims (Skill Supremacy): Mini Live Test',
    questions: 30, duration: 20, marks: 30,
    startDate: `${formatDate(getRelDate(1))} 9:00`, endDate: `${formatDate(getRelDate(3))} 21:00`,
    examDateTime: getRelDate(1, 9),
    languages: ['English', 'Hindi'], status: 'registered',
  },
  {
    id: 2, title: 'LIC Assistant Prelims - (Learning Lab): Mini Live Test',
    questions: 30, duration: 20, marks: 30,
    startDate: `${formatDate(getRelDate(2))} 9:00`, endDate: `${formatDate(getRelDate(4))} 21:00`,
    examDateTime: getRelDate(2, 9),
    languages: ['English', 'Hindi'], status: 'register',
  },
  {
    id: 3, title: 'RBI Assistant Prelims - (Power Push): Mini Live Test',
    questions: 30, duration: 20, marks: 30,
    startDate: `${formatDate(getRelDate(1))} 9:00`, endDate: `${formatDate(getRelDate(3))} 21:00`,
    examDateTime: getRelDate(1, 9),
    languages: ['English', 'Hindi'], status: 'registered',
  },
  {
    id: 4, title: 'RBI Assistant (Current Affairs Special): Mini Live Test',
    questions: 20, duration: 8, marks: 20,
    startDate: `${formatDate(getRelDate(0))} 9:00`, endDate: `${formatDate(getRelDate(2))} 21:00`,
    examDateTime: getRelDate(0, 9),
    languages: ['English', 'Hindi'], status: 'start',
  },
  {
    id: 5, title: 'SBI PO Prelims - (Learning League): Mini Live Test',
    questions: 30, duration: 19, marks: 30,
    startDate: `${formatDate(getRelDate(0))} 9:00`, endDate: `${formatDate(getRelDate(2))} 21:00`,
    examDateTime: getRelDate(0, 9),
    languages: ['English', 'Hindi'], status: 'start',
  },
  {
    id: 6, title: 'SSC GD: हिंदी - PYQ Live Test',
    questions: 20, duration: 12, marks: 40,
    startDate: `${formatDate(getRelDate(0))} 9:00`, endDate: `${formatDate(getRelDate(2))} 21:00`,
    examDateTime: getRelDate(0, 9),
    languages: ['English', 'Hindi', '+4 More'], status: 'start',
  },
  {
    id: 7, title: 'IBPS Clerk Mains - Speed Booster Live Test',
    questions: 40, duration: 45, marks: 40,
    startDate: `${formatDate(getRelDate(3))} 10:00`, endDate: `${formatDate(getRelDate(5))} 21:00`,
    examDateTime: getRelDate(3, 10),
    languages: ['English', 'Hindi'], status: 'register',
  },
  {
    id: 8, title: 'NIACL AO Prelims: Full Mock Live Test',
    questions: 100, duration: 60, marks: 100,
    startDate: `${formatDate(getRelDate(4))} 9:00`, endDate: `${formatDate(getRelDate(6))} 21:00`,
    examDateTime: getRelDate(4, 9),
    languages: ['English'], status: 'register',
  },
  {
    id: 9, title: 'SBI Clerk - Current Affairs Booster Quiz',
    questions: 25, duration: 15, marks: 25,
    startDate: `${formatDate(getRelDate(5))} 9:00`, endDate: `${formatDate(getRelDate(6))} 21:00`,
    examDateTime: getRelDate(5, 9),
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
  onContinueTest,
  viewMode = 'grid',
  index = 0,
  status
}: { 
  test: LiveTest; 
  onRegister: (id: number) => void;
  onStartTest: (test: LiveTest) => void;
  onShowLeaderboard: (test: LiveTest) => void;
  isCompleted?: boolean;
  isInProgress?: boolean;
  onContinueTest?: (test: LiveTest) => void;
  viewMode?: 'grid' | 'list';
  index?: number;
  status?: 'upcoming' | 'registered' | 'live' | 'submitted' | 'result';
}) => {
  const num = (index || 0) + 1;
  const isEnded = new Date() > new Date(test.examDateTime.getTime() + test.duration * 60000);

  let currentStatus = status;
  if (!currentStatus) {
    if (isCompleted) currentStatus = 'result';
    else if (isInProgress) currentStatus = 'live'; // or submitted
    else if (test.status === 'start') currentStatus = 'live';
    else if (test.status === 'registered') currentStatus = 'registered';
    else currentStatus = 'upcoming';
  }

  const stateConfig = {
    upcoming: {
      badge: 'UPCOMING',
      badgeClass: 'bg-purple-100 text-purple-700',
      topBorderColor: '#a855f7',
      numBadge: { background: '#f3e8ff', color: '#7e22ce', border: '2px solid #e9d5ff' },
      buttonText: 'Register Now',
      buttonClass: 'bg-slate-800 hover:bg-slate-900 text-white',
      studentsLabel: 'Students',
      icon: Target
    },
    registered: {
      badge: 'REGISTERED',
      badgeClass: 'bg-blue-100 text-blue-700',
      topBorderColor: '#3b82f6',
      numBadge: { background: '#dbeafe', color: '#1d4ed8', border: '2px solid #bfdbfe' },
      buttonText: 'Enter Waiting Room',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      studentsLabel: 'Students Registered',
      icon: Play
    },
    live: {
      badge: 'LIVE NOW',
      badgeClass: 'bg-red-100 text-red-700',
      topBorderColor: '#ef4444',
      numBadge: { background: '#fee2e2', color: '#b91c1c', border: '2px solid #fca5a5' },
      buttonText: 'Start Test Now',
      buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
      studentsLabel: 'Students Attempting',
      icon: Play
    },
    submitted: {
      badge: 'SUBMITTED',
      badgeClass: 'bg-orange-100 text-orange-700',
      topBorderColor: '#f97316',
      numBadge: { background: '#ffedd5', color: '#c2410c', border: '2px solid #fed7aa' },
      buttonText: 'Processing Results...',
      buttonClass: 'bg-orange-100 text-orange-700 opacity-80 cursor-not-allowed',
      studentsLabel: 'Participants',
      icon: Clock
    },
    result: {
      badge: 'RESULTS',
      badgeClass: 'bg-emerald-100 text-emerald-700',
      topBorderColor: '#10b981',
      numBadge: { background: '#d1fae5', color: '#047857', border: '2px solid #a7f3d0' },
      buttonText: 'View Analysis',
      buttonClass: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      studentsLabel: 'Participants',
      icon: BarChart2
    }
  };

  const config = stateConfig[currentStatus || 'upcoming'];
  const ActionIcon = config.icon;

  const handleAction = () => {
    if (currentStatus === 'upcoming') onRegister(test.id);
    else if (currentStatus === 'registered' || currentStatus === 'live') onStartTest(test);
    else if (currentStatus === 'result') onShowLeaderboard(test);
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`
            bg-white rounded-xl border border-gray-200 shadow-sm
            hover:shadow-md transition-all duration-200
            flex flex-col sm:flex-row items-center gap-4 p-4
            ${currentStatus === 'live' ? 'border-red-200 hover:border-red-300 bg-red-50/10' : 'hover:border-slate-300'}
        `}
        style={{ borderLeft: `4px solid ${config.topBorderColor}` }}
      >
        {/* Left: Badge & Title */}
        <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
          <span
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-base font-black shadow-sm flex-shrink-0"
            style={config.numBadge}
          >
            {num}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-extrabold text-[16px] leading-tight truncate ${currentStatus === 'live' ? 'text-red-700' : 'text-gray-900'}`}>
                {test.title}
              </h3>
              <Badge className={`${config.badgeClass} border-none text-[10px] uppercase shrink-0 px-2 py-0`}>
                {currentStatus === 'live' && (
                  <span className="relative flex h-1.5 w-1.5 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600" />
                  </span>
                )}
                {config.badge}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-medium">12,438 {config.studentsLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Stats or Countdown */}
        <div className="flex flex-col items-center justify-center gap-2 sm:px-4 sm:border-x border-gray-100 w-full sm:w-[200px] shrink-0 py-1 min-h-[60px]">
          {currentStatus === 'upcoming' && (
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center">
                <span className="text-[15px] font-black text-gray-900">{test.questions}</span>
                <span className="text-[10px] font-medium text-gray-400">Questions</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[15px] font-black text-gray-900">{test.duration}</span>
                <span className="text-[10px] font-medium text-gray-400">Min</span>
              </div>
            </div>
          )}
          {currentStatus === 'registered' && (
            <CountdownStrip targetDate={test.examDateTime} />
          )}
          {currentStatus === 'live' && (
            <div className="flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
              <Radio className="h-4 w-4 animate-pulse" /> 
              <span>Test is LIVE</span>
            </div>
          )}
          {currentStatus === 'submitted' && (
            <div className="flex items-center gap-1.5 text-orange-600 font-bold bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
              <Radio className="h-4 w-4 animate-pulse" /> 
              <span>Calculating...</span>
            </div>
          )}
          {currentStatus === 'result' && (
            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                  <span className="text-xl font-black text-emerald-600">82.75</span>
                  <span className="text-[10px] font-medium text-gray-400">/100</span>
              </div>
              <span className="text-[10px] font-medium text-gray-400 mt-1">Score</span>
            </div>
          )}
        </div>

        {/* Right: CTA */}
        <div className="flex flex-col sm:justify-center gap-2 w-full sm:w-[220px] shrink-0 mt-2 sm:mt-0">
          <Button 
            size="sm" 
            className={`w-full h-8 text-xs font-semibold gap-1.5 ${config.buttonClass}`}
            onClick={currentStatus !== 'submitted' ? handleAction : undefined}
            disabled={currentStatus === 'submitted'}
          >
            <ActionIcon className="h-3.5 w-3.5" />
            {config.buttonText}
          </Button>
          {currentStatus === 'result' && (
             <Button 
               size="sm" 
               variant="outline"
               className="h-8 text-xs font-semibold gap-1.5"
             >
               <FileText className="h-3.5 w-3.5" />
               Solution
             </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
          bg-white rounded-2xl border shadow-sm
          hover:shadow-lg hover:-translate-y-0.5
          transition-all duration-200
          flex flex-col overflow-hidden
          ${currentStatus === 'live' ? 'border-red-300' : 'border-gray-200'}
      `}
      style={{ borderTop: `3px solid ${config.topBorderColor}` }}
    >
      {/* Card body */}
      <div className="px-5 pt-5 pb-4 flex flex-col gap-3 flex-1 relative">
        {/* Row 1: number badge + free/status badge */}
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center justify-center w-10 h-10 rounded-full text-base font-black shadow-sm flex-shrink-0"
            style={config.numBadge}
          >
            {num}
          </span>
          <div className="flex items-center gap-1.5">
            <Badge className={`${config.badgeClass} text-[10px] font-bold flex items-center gap-1 h-6 px-2.5 shadow-sm border-none uppercase`}>
              {currentStatus === 'live' && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600" />
                </span>
              )}
              {config.badge}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className={`font-extrabold text-[17px] leading-tight line-clamp-2 min-h-[2.5rem] mt-1 ${currentStatus === 'live' ? 'text-red-700' : 'text-gray-900'}`}>
            {test.title}
          </h3>
          <div className="text-xs text-gray-500 mt-1.5">
            {test.title.includes('Scholarship') ? 'Live Scholarship Test' : 'Mega Live Test'}
          </div>
        </div>

        {/* Dynamic Context Area (Date, Countdown, Score, Processing) */}
        <div className="bg-slate-50 rounded-lg p-3 min-h-[70px] flex items-center justify-center">
          {currentStatus === 'upcoming' && (
             <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
               <Calendar className="h-4 w-4 text-purple-500" />
               <span>🗓 25 May • 7:00 PM</span>
             </div>
          )}
          {currentStatus === 'registered' && (
             <div className="flex flex-col items-center w-full">
               <span className="text-xs font-semibold text-gray-500 mb-1">⏳ Starts In:</span>
               <div className="flex items-center gap-1 text-blue-700 font-bold text-lg">
                 <span>01<span className="text-xs text-blue-400">h</span></span> :
                 <span>12<span className="text-xs text-blue-400">m</span></span> :
                 <span>45<span className="text-xs text-blue-400">s</span></span>
               </div>
             </div>
          )}
          {currentStatus === 'live' && (
             <div className="flex flex-col items-center w-full">
               <span className="text-xs font-semibold text-gray-500 mb-1">⏰ Time Left:</span>
               <div className="flex items-center gap-1 text-red-600 font-bold text-lg">
                 <span>58<span className="text-xs text-red-400">m</span></span> :
                 <span>12<span className="text-xs text-red-400">s</span></span>
               </div>
               <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded uppercase">
                 <Radio className="h-3 w-3 animate-pulse" /> AIR Ranking Active
               </div>
             </div>
          )}
          {currentStatus === 'submitted' && (
             <div className="flex flex-col items-center w-full">
               <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 mb-1">
                 <CheckCircle className="h-4 w-4" /> Test Submitted
               </div>
               <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 animate-pulse">
                 ⚡ Calculating Rank...
               </div>
             </div>
          )}
          {currentStatus === 'result' && (
             <div className="grid grid-cols-3 gap-2 w-full text-center">
               <div className="flex flex-col">
                 <span className="text-xs text-gray-500 font-medium">Score</span>
                 <span className="text-sm font-black text-emerald-600">82<span className="text-[10px] text-gray-400">/100</span></span>
               </div>
               <div className="flex flex-col border-x border-gray-200">
                 <span className="text-xs text-gray-500 font-medium">AIR</span>
                 <span className="text-sm font-black text-gray-900">521</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-xs text-gray-500 font-medium">%ile</span>
                 <span className="text-sm font-black text-emerald-600">96.2%</span>
               </div>
             </div>
          )}
        </div>

        {/* Divider */}
        <hr className="border-gray-100 my-1" />

        {/* Students Count & Stats */}
        <div className="flex items-center justify-between text-xs font-medium text-gray-500">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gray-400" />
            <span>12,438 {config.studentsLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mt-1">
          <span>{test.questions} Questions</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{test.marks} Marks</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{test.duration} Min</span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <Button 
          size="sm" 
          className={`w-full h-9 text-sm font-bold gap-1.5 ${config.buttonClass} transition-all`}
          onClick={currentStatus !== 'submitted' ? handleAction : undefined}
          disabled={currentStatus === 'submitted'}
        >
          <ActionIcon className={`h-4 w-4 ${currentStatus === 'submitted' ? 'animate-spin' : ''}`} />
          {config.buttonText}
        </Button>
      </div>
    </div>
  );
};

// ── Attempted Card ─────────────────────────────────────────────────────────────
const AttemptedCard = ({ test, viewMode = 'grid', index = 0 }: { test: AttemptedTest, viewMode?: 'grid' | 'list', index?: number }) => {
  const percentage = Math.round((test.score / test.totalMarks) * 100);
  const scoreColor = percentage >= 70 ? 'text-emerald-600' : percentage >= 50 ? 'text-amber-500' : 'text-red-500';
  const scoreGradient = percentage >= 70 
    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
    : percentage >= 50 
    ? 'bg-gradient-to-r from-amber-400 to-amber-500' 
    : 'bg-gradient-to-r from-red-400 to-red-500';
  const scoreBg = percentage >= 70 
    ? 'bg-emerald-50 border-emerald-200' 
    : percentage >= 50 
    ? 'bg-amber-50 border-amber-200' 
    : 'bg-red-50 border-red-200';
  const accent = { border: "#cbd5e1", light: "#f8fafc", text: "#64748b" };
  const num = index + 1;

  if (viewMode === 'list') {
    return (
      <div
        className={`
            bg-white rounded-xl border border-gray-200 shadow-sm
            hover:shadow-md transition-all duration-200
            flex flex-col sm:flex-row items-center gap-4 p-4 hover:border-slate-300
        `}
        style={{ borderLeft: `4px solid ${accent.border}` }}
      >
        {/* Left: Badge & Title */}
        <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
          <span
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-base font-black shadow-sm flex-shrink-0"
            style={{ background: accent.light, color: accent.text, border: `2px solid ${accent.border}` }}
          >
            {num}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-[16px] leading-tight truncate text-gray-900">
              {test.title}
            </h3>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-medium">Attempted {test.attemptedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Stats */}
        <div className="flex flex-col items-center justify-center gap-2 sm:px-4 sm:border-x border-gray-100 w-full sm:w-[200px] shrink-0 py-1 min-h-[60px]">
           <div className="flex items-baseline gap-1">
             <span className={`text-2xl font-black ${scoreColor}`}>{percentage}</span>
             <span className={`text-sm font-semibold ${scoreColor}`}>%</span>
           </div>
           <div className="text-[10px] text-slate-500 font-medium">
             Score: {test.score}/{test.totalMarks} • Rank: #{test.rank}
           </div>
        </div>

        {/* Right: CTA */}
        <div className="flex flex-col sm:justify-center gap-2 w-full sm:w-[220px] shrink-0 mt-2 sm:mt-0">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1 hover:bg-slate-50 border-gray-200">
              <Eye className="h-3.5 w-3.5" />
              Result
            </Button>
            <Button size="sm" className="h-8 text-xs font-semibold gap-1 bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition-all">
              <TrendingUp className="h-3.5 w-3.5" />
              Analysis
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
          bg-white rounded-2xl border border-gray-300 shadow-sm
          hover:shadow-lg hover:-translate-y-0.5
          transition-all duration-200
          flex flex-col overflow-hidden
      `}
      style={{ borderTop: `3px solid ${accent.border}` }}
    >
      {/* Top gradient bar */}
      <div className={`h-1.5 ${scoreGradient}`} />
      
      {/* Card body */}
      <div className="px-5 pt-5 pb-4 flex flex-col gap-3 flex-1">
        
        {/* Row 1: number badge + free badge */}
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center justify-center w-10 h-10 rounded-full text-base font-black shadow-sm flex-shrink-0"
            style={{ background: accent.light, color: accent.text, border: `2px solid ${accent.border}` }}
          >
            {num}
          </span>
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">
            Free
          </span>
        </div>

        {/* Title */}
        <div>
          <h3 className="font-extrabold text-[17px] text-gray-900 leading-tight line-clamp-2 min-h-[2.5rem]">
            {test.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-medium">Attempted {test.attemptedDate}</span>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-100 my-1" />

        {/* Stats grid */}
        <div className="grid grid-cols-3">
            <div className="flex flex-col items-center py-2">
                <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                    <span className="text-base font-black text-gray-900">{test.score}</span>
                    <span className="text-[10px] font-medium text-gray-400">/{test.totalMarks}</span>
                </div>
                <span className="text-[10px] font-medium text-gray-400 mt-1">Score</span>
            </div>
            <div className="flex flex-col items-center py-2 border-x border-gray-200">
                <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                    <span className="text-base font-black text-gray-900">{test.rank}</span>
                    <span className="text-[10px] font-medium text-gray-400">/{test.totalAttempts > 0 ? test.totalAttempts.toLocaleString() : '—'}</span>
                </div>
                <span className="text-[10px] font-medium text-gray-400 mt-1">Rank</span>
            </div>
            <div className="flex flex-col items-center py-2">
                <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                    <span className={`text-base font-black ${scoreColor}`}>{percentage}</span>
                    <span className={`text-[10px] font-medium ${scoreColor}`}>%</span>
                </div>
                <span className="text-[10px] font-medium text-gray-400 mt-1">Accuracy</span>
            </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 text-xs gap-1 border-gray-300 bg-gray-100 text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary font-semibold"
            >
                <Eye className="h-3.5 w-3.5" /> Result
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 text-xs gap-1 border-gray-300 bg-gray-100 text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary font-semibold"
            >
                <BarChart2 className="h-3.5 w-3.5" /> Analysis
            </Button>
        </div>
      </div>
    </div>
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

      {/* Tabs and View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2 sm:pb-0">
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium border-b-2 transition-all sm:-mb-[1px] ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center bg-slate-100/80 p-1 rounded-lg self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 sm:p-2 rounded-md transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-emerald-600 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 sm:p-2 rounded-md transition-all ${
              viewMode === 'list'
                ? 'bg-white text-emerald-600 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            title="List View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cards */}
      {activeTab === 'attempted' ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5" : "flex flex-col gap-3"}>
          {attemptedTests.map((test, index) => <AttemptedCard key={test.id} test={test} viewMode={viewMode} index={index} />)}
        </div>
      ) : (
        filteredTests.length === 0 ? (
          <div className="text-center py-16 sm:py-20 text-muted-foreground">
            <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tests in this category</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5" : "flex flex-col gap-3"}>
            {filteredTests.map((test, index) => (
              <LiveTestCard
                key={test.id}
                test={test}
                index={index}
                viewMode={viewMode}
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
