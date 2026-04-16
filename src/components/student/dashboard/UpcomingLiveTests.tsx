import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Radio, Timer, CheckCircle, FileText, BarChart3, RotateCcw, Play } from 'lucide-react';
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
const CountdownStrip = ({ targetDate }: { targetDate: Date }) => {
  const r = useCountdown(targetDate);
  const pad = (n: number) => String(n).padStart(2, '0');
  
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

  return (
    <>
      <Card className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center shadow-sm">
              <Radio className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-800 leading-none">Upcoming Live Tests</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Register & compete with peers</p>
            </div>
          </div>
          <Badge className="bg-red-500 text-white text-[10px] sm:text-[11px] font-semibold px-2 py-1 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500" />
            </span>
            LIVE
          </Badge>
        </div>

        {/* Test List */}
        <div className="space-y-3 sm:space-y-4">
          {liveTestsData.map((test) => {
            const isRegistered = !!registrations[test.id];
            const isCompleted = registrations[test.id]?.completed;
            const testLive = isTestLive(test);
            const testEnded = hasTestEnded(test);
            const currentRegistrations = test.registrations + (isRegistered ? 0 : 0); // Real-time count

            return (
              <div
                key={test.id}
                className={`px-3 sm:px-4 py-3 sm:py-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-gradient-to-r from-emerald-50/50 to-green-50/30 border-emerald-200'
                    : testLive
                    ? 'bg-gradient-to-r from-red-50/50 to-orange-50/30 border-red-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                }`}
              >
                {/* Top Row: Icon + Title + Status */}
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                    testLive ? 'bg-red-100' : 'bg-slate-100'
                  }`}>
                    <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 ${testLive ? 'text-red-600' : 'text-slate-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-xs sm:text-[13px] ${
                          isCompleted ? 'text-emerald-700' : testLive ? 'text-red-700' : 'text-slate-800'
                        }`}>
                          {test.title}
                        </p>
                        
                        {/* Meta Info: Date, Time, Registrations */}
                        <div className="flex items-center gap-2 sm:gap-3 mt-1.5 flex-wrap text-[10px] sm:text-[11px]">
                          <div className="flex items-center gap-1 text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span>{test.date}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="h-3 w-3" />
                            <span>{test.time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <Users className="h-3 w-3" />
                            <span className="font-medium">{formatRegistrations(currentRegistrations)} registered</span>
                          </div>
                          <div className="text-slate-400">•</div>
                          <div className="text-slate-600 font-medium">{test.duration} mins</div>
                        </div>

                        {/* Countdown or Status */}
                        {isRegistered && !testEnded && !isCompleted && (
                          testLive ? (
                            <div className="flex items-center gap-1 text-red-600 text-[10px] sm:text-xs font-semibold mt-1.5">
                              <Radio className="h-3 w-3 animate-pulse" /> 
                              <span>Exam is LIVE Now!</span>
                            </div>
                          ) : (
                            <CountdownStrip targetDate={test.examDateTime} />
                          )
                        )}

                        {/* Completed Badge */}
                        {isCompleted && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <div className="bg-emerald-100 text-emerald-700 px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Score: {registrations[test.id].score}%
                              </div>
                            </div>
                            {/* Action buttons: Solution, Analysis */}
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-[11px] font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => {
                                  window.open(
                                    `/student/exam-window?testId=${test.id}&title=${encodeURIComponent(test.title)}&duration=${test.duration}&questions=${test.questions}&mode=solution`,
                                    '_blank',
                                    'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no'
                                  );
                                }}
                              >
                                <FileText className="h-3 w-3 sm:mr-1" />
                                <span className="hidden sm:inline">Solution</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-[11px] font-semibold border-blue-300 text-blue-700 hover:bg-blue-50"
                                onClick={() => setSelectedTestForAnalysis(test)}
                              >
                                <BarChart3 className="h-3 w-3 sm:mr-1" />
                                <span className="hidden sm:inline">Analysis</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-[11px] font-semibold border-slate-300 text-slate-700 hover:bg-slate-50"
                                onClick={() => handleStartTest(test)}
                              >
                                <RotateCcw className="h-3 w-3 sm:mr-1" />
                                <span className="hidden sm:inline">Retest</span>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0">
                        {!isRegistered && !testEnded ? (
                          testLive ? (
                            <Button 
                              size="sm" 
                              className="h-8 sm:h-9 px-3 sm:px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] sm:text-[12px] font-semibold shadow-sm"
                              onClick={() => handleRegister(test.id)}
                            >
                              <Radio className="h-3.5 w-3.5 sm:mr-1.5 animate-pulse" />
                              <span>Register & Start</span>
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              className="h-8 sm:h-9 px-3 sm:px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] sm:text-[12px] font-semibold shadow-sm"
                              onClick={() => handleRegister(test.id)}
                            >
                              <CheckCircle className="h-3.5 w-3.5 sm:mr-1.5" />
                              <span>Register</span>
                            </Button>
                          )
                        ) : isRegistered && !isCompleted ? (
                          testLive ? (
                            <Button 
                              size="sm" 
                              className="h-8 sm:h-9 px-3 sm:px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] sm:text-[12px] font-semibold shadow-sm"
                              onClick={() => handleStartTest(test)}
                            >
                              <Play className="h-3.5 w-3.5 sm:mr-1.5" />
                              <span>Start Test</span>
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1 text-emerald-600 font-semibold text-[10px] sm:text-[11px] bg-emerald-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-emerald-200">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Registered</span>
                            </div>
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <Button 
          variant="outline" 
          className="w-full mt-4 text-[11px] sm:text-[12px] font-semibold text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 rounded-xl py-2 sm:py-2.5" 
          asChild
        >
          <Link to="/student/live-tests">View All Live Tests →</Link>
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
