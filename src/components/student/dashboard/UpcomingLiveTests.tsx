import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Radio, Timer, CheckCircle, FileText, BarChart3, RotateCcw, Play, LayoutGrid, List, Trophy, Lock } from 'lucide-react';
import { toast } from 'sonner';
import QuizLeaderboardModal from '@/components/student/quiz/QuizLeaderboardModal';
import { getQuizLeaderboard } from '@/services/quizLeaderboardService';

// ── Countdown Hook ─────────────────────────────────────────────────────────────────
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
  const [remaining, setRemaining] = useState(getRemaining);
  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);
  return remaining;
};

// ── Types ─────────────────────────────────────────────────────────────────────────
interface LiveTest {
  id: number;
  title: string;
  questions: number;
  duration: number;
  marks: number;
  date: string;
  time: string;
  examDateTime: Date;
  registrations: number;
  status: 'upcoming' | 'live' | 'completed';
}

// ── Mock Data (Replace with real API calls later) ─────────────────────────────────
const liveTestsData: LiveTest[] = [
  {
    id: 1,
    title: 'All India IBPS PO Live Mock',
    questions: 100,
    duration: 60,
    marks: 100,
    date: '28 Apr, 2026',
    time: '10:00 AM',
    examDateTime: new Date(2026, 3, 28, 10, 0, 0),
    registrations: 12547,
    status: 'upcoming',
  },
  {
    id: 2,
    title: 'SBI Clerk Prelims Maha-Mock',
    questions: 80,
    duration: 60,
    marks: 80,
    date: '30 Apr, 2026',
    time: '02:00 PM',
    examDateTime: new Date(2026, 3, 30, 14, 0, 0),
    registrations: 8234,
    status: 'upcoming',
  },
  {
    id: 3,
    title: 'IBPS RRB Officer Scale-I Mock',
    questions: 80,
    duration: 45,
    marks: 80,
    date: '02 May, 2026',
    time: '11:00 AM',
    examDateTime: new Date(2026, 4, 2, 11, 0, 0),
    registrations: 6123,
    status: 'upcoming',
  },
  {
    id: 4,
    title: 'RBI Assistant Prelims Mock',
    questions: 80,
    duration: 60,
    marks: 80,
    date: '05 May, 2026',
    time: '03:00 PM',
    examDateTime: new Date(2026, 4, 5, 15, 0, 0),
    registrations: 4856,
    status: 'upcoming',
  },
  {
    id: 5,
    title: 'SBI PO Prelims Grand Mock',
    questions: 100,
    duration: 60,
    marks: 100,
    date: '08 May, 2026',
    time: '10:00 AM',
    examDateTime: new Date(2026, 4, 8, 10, 0, 0),
    registrations: 9312,
    status: 'upcoming',
  },
];

// ── Countdown Strip Component ─────────────────────────────────────────────────────
const CountdownStrip = ({ targetDate, onEnd }: { targetDate: Date; onEnd?: () => void }) => {
  const r = useCountdown(targetDate);
  const pad = (n: number) => String(n).padStart(2, '0');
  
  useEffect(() => {
    if (!r && onEnd) {
      onEnd();
    }
  }, [r, onEnd]);

  if (!r) {
    return (
      <div className="flex items-center gap-1 text-emerald-600 text-[10px] sm:text-xs font-semibold mt-1.5">
        <Radio className="h-3 w-3 animate-pulse" /> 
        <span>Exam is LIVE Now!</span>
      </div>
    );
  }
  
  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 mb-1">
        <Timer className="h-3 w-3 text-emerald-600" />
        <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Starts in</span>
      </div>
      <div className="flex items-center gap-1">
        {r.days > 0 && (
          <>
            <div className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-1.5 py-0.5 rounded">{r.days}d</div>
            <span className="text-slate-400 text-[10px]">:</span>
          </>
        )}
        <div className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-1.5 py-0.5 rounded">{pad(r.hours)}h</div>
        <span className="text-slate-400 text-[10px]">:</span>
        <div className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-1.5 py-0.5 rounded">{pad(r.mins)}m</div>
        <span className="text-slate-400 text-[10px]">:</span>
        <div className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-1.5 py-0.5 rounded min-w-[26px] text-center">{pad(r.secs)}s</div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────────
export const UpcomingLiveTests = () => {
  const [registrations, setRegistrations] = useState<Record<number, { registeredAt: string; completed?: boolean; score?: number }>>({});
  const [selectedTestForAnalysis, setSelectedTestForAnalysis] = useState<LiveTest | null>(null);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [, setTick] = useState(0);

  // Re-render every minute to update live status automatically
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // Load registrations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('liveTestRegistrations');
    if (saved) {
      try {
        setRegistrations(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse live test registrations:', e);
      }
    }
  }, []);

  // Save registrations to localStorage
  const saveRegistrations = (newRegistrations: typeof registrations) => {
    setRegistrations(newRegistrations);
    localStorage.setItem('liveTestRegistrations', JSON.stringify(newRegistrations));
  };

  // Handle registration
  const handleRegister = (testId: number) => {
    setShowRegisterConfirm(testId);
  };

  const confirmRegister = (testId: number) => {
    const newRegistrations = {
      ...registrations,
      [testId]: { registeredAt: new Date().toISOString() }
    };
    saveRegistrations(newRegistrations);
    setShowRegisterConfirm(null);
    toast.success('✅ Successfully registered for the test!');
  };

  // Handle start test
  const handleStartTest = (test: LiveTest) => {
    window.open(
      `/student/exam-window?testId=${test.id}&title=${encodeURIComponent(test.title)}&duration=${test.duration}&questions=${test.questions}&mode=exam`,
      '_blank',
      'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no'
    );
  };

  // Handle test completion (mock)
  const handleTestComplete = (test: LiveTest, score: number) => {
    const newRegistrations = {
      ...registrations,
      [test.id]: { 
        ...registrations[test.id], 
        completed: true, 
        score 
      }
    };
    saveRegistrations(newRegistrations);
    toast.success(`🎉 Test completed! Score: ${score}%`);
  };

  // Format registrations count
  const formatRegistrations = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k+`;
    }
    return `${count}`;
  };

  // Check if test is live (within exam time window)
  const isTestLive = (test: LiveTest) => {
    const now = new Date();
    const examTime = test.examDateTime;
    const endTime = new Date(examTime.getTime() + test.duration * 60000);
    return now >= examTime && now <= endTime;
  };

  // Check if test has ended
  const hasTestEnded = (test: LiveTest) => {
    const now = new Date();
    const examTime = test.examDateTime;
    const endTime = new Date(examTime.getTime() + test.duration * 60000);
    return now > endTime;
  };

  const ACCENT_COLORS = [
    { border: "#cbd5e1", light: "#f8fafc", text: "#64748b" }, // slate-300, slate-50, slate-500
  ];

  return (
    <>
      <Card className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center shadow-sm">
              <Radio className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-800 leading-none">Upcoming Live Tests</h3>
                <Badge className="bg-red-500 text-white text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                  </span>
                  LIVE
                </Badge>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">Register & compete with peers across India</p>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${viewMode === 'grid' ? 'bg-red-50 text-red-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid className="h-4 w-4" /> Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${viewMode === 'list' ? 'bg-red-50 text-red-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List className="h-4 w-4" /> List
            </button>
          </div>
        </div>

        {/* Test List/Grid */}
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
          {liveTestsData.map((test, index) => {
            const isRegistered = !!registrations[test.id];
            const isCompleted = registrations[test.id]?.completed;
            const testLive = isTestLive(test);
            const testEnded = hasTestEnded(test);
            const currentRegistrations = test.registrations + (isRegistered ? 1 : 0);
            const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

            if (viewMode === 'list') {
              return (
                <div
                  key={test.id}
                  className={`
                      bg-white rounded-xl border border-gray-200 shadow-sm
                      hover:shadow-md transition-all duration-200
                      flex flex-col sm:flex-row items-center gap-4 p-4
                      ${testLive ? 'border-red-200 hover:border-red-300 bg-red-50/10' : 'hover:border-slate-300'}
                  `}
                  style={{ borderLeft: testLive ? `4px solid #ef4444` : `4px solid ${accent.border}` }}
                >
                  {/* Left: Badge & Title */}
                  <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                       <span
                           className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-base font-black shadow-sm flex-shrink-0"
                           style={testLive ? { background: '#fee2e2', color: '#b91c1c', border: `2px solid #fca5a5` } : { background: accent.light, color: accent.text, border: `2px solid ${accent.border}` }}
                       >
                           {index + 1}
                       </span>
                       <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2">
                               <h3 className={`font-extrabold text-[16px] leading-tight truncate ${testLive ? 'text-red-700' : 'text-gray-900'}`}>
                                   {test.title}
                               </h3>
                               {testLive && (
                                 <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none text-[10px] uppercase shrink-0 px-2 py-0">Live Now</Badge>
                               )}
                           </div>
                           <div className="flex items-center gap-3 mt-1 flex-wrap">
                               <div className="flex items-center gap-1 text-xs text-gray-500">
                                   <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                   <span className="font-medium">{test.date}</span>
                               </div>
                               <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                               <div className="flex items-center gap-1 text-xs text-gray-500">
                                   <Clock className="h-3.5 w-3.5 text-gray-400" />
                                   <span className="font-medium">{test.time}</span>
                               </div>
                               <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                               <div className="flex items-center gap-1 text-xs text-gray-500">
                                   <Users className="h-3.5 w-3.5 text-gray-400" />
                                   <span className="font-medium">{formatRegistrations(currentRegistrations)}</span>
                               </div>
                           </div>
                       </div>
                  </div>

                  {/* Middle: Stats or Countdown */}
                  <div className="flex flex-col items-center justify-center gap-2 sm:px-4 sm:border-x border-gray-100 w-full sm:w-[200px] shrink-0 py-1 min-h-[60px]">
                    {(!isRegistered || testEnded) && (
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
                    {isRegistered && !testEnded && !testLive && (
                      <CountdownStrip targetDate={test.examDateTime} />
                    )}
                    {isRegistered && testLive && !isCompleted && (
                       <div className="flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                         <Radio className="h-4 w-4 animate-pulse" /> 
                         <span>Test is LIVE</span>
                       </div>
                    )}
                  </div>

                  {/* Right: CTA */}
                  <div className="flex items-center sm:justify-end gap-2 w-full sm:w-[220px] shrink-0 mt-2 sm:mt-0">
                      {isCompleted ? (
                          testEnded ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 sm:flex-none h-9 text-xs gap-1 border-gray-200 bg-white text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary font-semibold"
                                    onClick={() =>
                                        window.open(
                                            `/student/solution-viewer?examId=live&testId=${test.id}&title=${encodeURIComponent(test.title)}&duration=${test.duration}&questions=${test.questions}`,
                                            '_blank',
                                            'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no'
                                        )
                                    }
                                >
                                    <BookOpen className="h-3.5 w-3.5" /> Solution
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 sm:flex-none h-9 w-9 p-0 border-gray-200 bg-white text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary shrink-0"
                                    title="Analysis & Leaderboard"
                                    onClick={() => setSelectedTestForAnalysis(test)}
                                >
                                    <BarChart3 className="h-4 w-4" />
                                </Button>
                            </>
                          ) : (
                            <div className="flex-1 text-center bg-gray-50 border border-gray-200 rounded-lg py-2 px-3">
                               <p className="text-xs font-semibold text-gray-600">Test Submitted</p>
                               <p className="text-[10px] text-gray-500 mt-0.5">Results announced after test ends</p>
                            </div>
                          )
                      ) : (
                          !isRegistered && !testEnded ? (
                            <Button 
                              className={`flex-1 sm:flex-none h-9 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 w-full sm:w-[130px] ${testLive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}
                              onClick={() => handleRegister(test.id)}
                            >
                              {testLive ? <Radio className="h-3.5 w-3.5 animate-pulse" /> : <CheckCircle className="h-3.5 w-3.5" />}
                              <span>Register</span>
                            </Button>
                          ) : isRegistered && !testEnded && testLive ? (
                            <Button 
                              className="flex-1 sm:flex-none h-9 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white w-full sm:w-[130px]"
                              onClick={() => handleStartTest(test)}
                            >
                              <Play className="h-3.5 w-3.5 fill-white text-white" />
                              <span>Start Test</span>
                            </Button>
                          ) : isRegistered && !testEnded && !testLive ? (
                            <Button 
                              variant="outline"
                              className="flex-1 sm:flex-none h-9 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 w-full sm:w-[130px] cursor-default hover:bg-emerald-50"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Registered</span>
                            </Button>
                          ) : (
                            <Button 
                              disabled
                              className="flex-1 sm:flex-none h-9 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 bg-gray-100 text-gray-400 border border-gray-200 w-full sm:w-[130px]"
                            >
                              <Lock className="h-3.5 w-3.5" />
                              <span>Ended</span>
                            </Button>
                          )
                      )}
                  </div>
                </div>
              );
            }

            // GRID VIEW
            return (
              <div
                  key={test.id}
                  className={`
                      bg-white rounded-2xl border border-gray-300 shadow-sm
                      hover:shadow-lg hover:-translate-y-0.5
                      transition-all duration-200
                      flex flex-col overflow-hidden
                      ${testLive ? 'border-red-300 shadow-red-100' : ''}
                  `}
                  style={{ borderTop: testLive ? `3px solid #ef4444` : `3px solid ${accent.border}` }}
              >
                  {/* Card body */}
                  <div className="px-5 pt-5 pb-4 flex flex-col gap-3 flex-1">

                      {/* Row 1: number badge + Live Status */}
                      <div className="flex items-center justify-between">
                          <span
                              className="inline-flex items-center justify-center w-10 h-10 rounded-full text-base font-black shadow-sm flex-shrink-0"
                              style={testLive ? { background: '#fee2e2', color: '#b91c1c', border: `2px solid #fca5a5` } : { background: accent.light, color: accent.text, border: `2px solid ${accent.border}` }}
                          >
                              {index + 1}
                          </span>
                          {testLive && (
                             <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none text-[10px] uppercase font-bold tracking-wider px-2.5 py-1">Live Now</Badge>
                          )}
                          {!testLive && isRegistered && !testEnded && (
                             <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Registered</Badge>
                          )}
                          {testEnded && (
                             <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-none text-[10px] uppercase font-bold tracking-wider px-2.5 py-1">Ended</Badge>
                          )}
                      </div>

                      {/* Title + time */}
                      <div>
                          <h3 className={`font-extrabold text-[17px] leading-tight line-clamp-1 ${testLive ? 'text-red-700' : 'text-gray-900'}`}>
                              {test.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5 text-xs font-medium text-gray-500">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{test.date}</span>
                              <span>•</span>
                              <Clock className="h-3.5 w-3.5" />
                              <span>{test.time}</span>
                          </div>
                      </div>

                      {/* Students count */}
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                          <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium">{formatRegistrations(currentRegistrations)} Students</span>
                      </div>

                      {/* Divider */}
                      <hr className="border-gray-100 my-1" />

                      {/* Stats or Countdown */}
                      {isRegistered && !testEnded && !testLive ? (
                        <div className="py-2 flex justify-center bg-gray-50 rounded-lg">
                           <CountdownStrip targetDate={test.examDateTime} />
                        </div>
                      ) : isRegistered && testLive && !isCompleted ? (
                        <div className="py-4 flex justify-center bg-red-50 rounded-lg border border-red-100 items-center gap-2 text-red-600 font-bold">
                           <Radio className="h-5 w-5 animate-pulse" /> Test is Live
                        </div>
                      ) : (
                        <div className="grid grid-cols-2">
                            <div className="flex flex-col items-center py-2">
                                <span className="text-base font-black text-gray-900">{test.questions}</span>
                                <span className="text-xs font-medium text-gray-400 mt-1">Questions</span>
                            </div>
                            <div className="flex flex-col items-center py-2 border-l border-gray-200">
                                <span className="text-base font-black text-gray-900">{test.duration}</span>
                                <span className="text-xs font-medium text-gray-400 mt-1">Min</span>
                            </div>
                        </div>
                      )}
                  </div>

                  {/* ── CTA ── */}
                  <div className="px-5 pb-5">
                      {isCompleted ? (
                          testEnded ? (
                              <div className="flex gap-2">
                                  <Button
                                      variant="outline"
                                      className="flex-1 h-9 text-xs gap-1 border-gray-300 bg-gray-100 text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary font-semibold"
                                      onClick={() =>
                                          window.open(
                                              `/student/solution-viewer?examId=live&testId=${test.id}&title=${encodeURIComponent(test.title)}&duration=${test.duration}&questions=${test.questions}`,
                                              '_blank',
                                              'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no'
                                          )
                                      }
                                  >
                                      <BookOpen className="h-3.5 w-3.5" /> Solution
                                  </Button>
                                  <Button
                                      variant="outline"
                                      className="flex-1 h-9 text-xs gap-1 border-gray-300 bg-gray-100 text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary font-semibold"
                                      onClick={() => setSelectedTestForAnalysis(test)}
                                  >
                                      <BarChart3 className="h-3.5 w-3.5" /> Analysis & Rank
                                  </Button>
                              </div>
                          ) : (
                              <div className="w-full text-center bg-gray-50 border border-gray-200 rounded-lg py-2 px-3">
                                 <p className="text-xs font-semibold text-gray-600">Test Submitted Successfully</p>
                                 <p className="text-[10px] text-gray-500 mt-0.5">Results will be announced after test ends</p>
                              </div>
                          )
                      ) : (
                          <div className="flex gap-2">
                              {!isRegistered && !testEnded ? (
                                <button
                                    onClick={() => handleRegister(test.id)}
                                    className={`
                                        flex-1 h-9 rounded-lg text-sm font-semibold
                                        flex items-center justify-center gap-1.5
                                        transition-all duration-150 active:scale-[0.98]
                                        ${testLive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-primary hover:bg-primary/90 text-white'}
                                    `}
                                >
                                    {testLive ? <Radio className="h-3.5 w-3.5 animate-pulse" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                    Register Now
                                </button>
                              ) : isRegistered && !testEnded && testLive ? (
                                <button
                                    onClick={() => handleStartTest(test)}
                                    className="flex-1 h-9 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white transition-all duration-150 active:scale-[0.98]"
                                >
                                    <Play className="h-3.5 w-3.5 fill-white" />
                                    Start Test
                                </button>
                              ) : isRegistered && !testEnded && !testLive ? (
                                <Button 
                                    variant="outline"
                                    className="flex-1 h-9 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default hover:bg-emerald-50 w-full"
                                >
                                    <CheckCircle className="h-4 w-4" /> You are Registered
                                </Button>
                              ) : (
                                <button
                                    disabled
                                    className="flex-1 h-9 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 bg-gray-100 text-gray-400 border border-gray-200"
                                >
                                    <Lock className="h-3.5 w-3.5" />
                                    Test Ended
                                </button>
                              )}
                          </div>
                      )}
                  </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <Button 
          variant="outline" 
          className="w-full mt-6 text-sm font-semibold text-gray-700 border-gray-300 bg-white hover:bg-gray-50 rounded-xl py-2.5 shadow-sm" 
          asChild
        >
          <Link to="/student/live-tests">View All Upcoming Live Tests →</Link>
        </Button>
      </Card>

      {/* Registration Confirmation Dialog */}
      {showRegisterConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-base sm:text-lg text-slate-800 mb-2">Register for Test?</h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              Do you want to register for this exam? You'll be notified when it goes live.
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-9 sm:h-10 text-xs sm:text-sm"
                onClick={() => setShowRegisterConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 h-9 sm:h-10 text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => confirmRegister(showRegisterConfirm)}
              >
                Yes, Register
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Leaderboard Modal for Analysis */}
      {selectedTestForAnalysis && (
        <QuizLeaderboardModal
          isOpen={!!selectedTestForAnalysis}
          onClose={() => setSelectedTestForAnalysis(null)}
          leaderboard={getQuizLeaderboard(
            selectedTestForAnalysis.id,
            selectedTestForAnalysis.title,
            registrations[selectedTestForAnalysis.id]?.score 
              ? { 
                  score: registrations[selectedTestForAnalysis.id].score!, 
                  timeTaken: selectedTestForAnalysis.duration * 60 * 0.7 
                }
              : undefined
          )}
        />
      )}
    </>
  );
};

