import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2, Circle, Plus, X, Target, ListChecks,
  FileText, Play, Trash2, Clock, RotateCcw,
  AlertTriangle, TrendingUp, Zap, Calendar, Edit2, Pencil
} from 'lucide-react';

// ─── Timer Presets ────────────────────────────────────────────────────────────
const TIMER_PRESETS = [
  { label: '30m',    secs: 30 * 60 },
  { label: '1 hr',   secs: 60 * 60 },
  { label: '1.5 hr', secs: 90 * 60 },
  { label: '2 hr',   secs: 2 * 60 * 60 },
  { label: '3 hr',   secs: 3 * 60 * 60 },
  { label: '4 hr',   secs: 4 * 60 * 60 },
  { label: '5 hr',   secs: 5 * 60 * 60 },
];
import { dailyQuizzes } from '@/data/dailyQuizzesData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_GOALS = 5;

// ─── Types ────────────────────────────────────────────────────────────────────
export type GoalStatus = 'pending' | 'in_progress' | 'completed' | 'missed';
export type GoalType = 'manual' | 'test';

export interface Goal {
  id: string;
  type: GoalType;
  label: string;
  status: GoalStatus;
  quizId?: string;
  quizType?: string;
  estimatedMins?: number;
  score?: number;
  accuracy?: number;
  createdAt: string;   // YYYY-MM-DD (IST)
}

// ─── IST Helpers ─────────────────────────────────────────────────────────────
const getISTDate = (): Date => {
  const now = new Date();
  return new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
};

const getISTDateStr = (): string => {
  const d = getISTDate();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

const getYesterdayISTStr = (): string => {
  const d = getISTDate();
  d.setUTCDate(d.getUTCDate() - 1);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

const getTomorrowISTStr = (): string => {
  const d = getISTDate();
  d.setUTCDate(d.getUTCDate() + 1);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

const formatDisplayDate = (dateStr: string): string => {
  const today = getISTDateStr();
  const yesterday = getYesterdayISTStr();
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch { return dateStr; }
};

// ─── LocalStorage Helpers ─────────────────────────────────────────────────────
const STORAGE_KEY = 'dailyGoals_v2';

const loadAllGoals = (): Goal[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
};

const saveAllGoals = (goals: Goal[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(goals)); }
  catch { /* ignore */ }
};

const getTodayGoals = (all: Goal[]): Goal[] =>
  all.filter(g => g.createdAt === getISTDateStr());

// ─── Quiz Type Labels ──────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  'daily':           { label: 'Daily Practice', icon: '📅', color: 'text-primary bg-primary/10' },
  'rapid-fire':      { label: 'Rapid Fire',     icon: '⚡', color: 'text-amber-600 bg-amber-50' },
  'speed-challenge': { label: 'Speed Challenge', icon: '🏃', color: 'text-amber-600 bg-amber-50' },
  'mini-test':       { label: 'Mini Test',       icon: '📝', color: 'text-primary bg-primary/10' },
  'sectional':       { label: 'Sectional Test',  icon: '📚', color: 'text-primary bg-primary/10' },
  'full-prelims':    { label: 'Full Mock (Prelims)', icon: '🎯', color: 'text-red-600 bg-red-50' },
  'full-mains':      { label: 'Full Mock (Mains)',   icon: '🏆', color: 'text-primary bg-primary/10' },
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const DailyGoalsWidget: React.FC = () => {
  const today = getISTDateStr();

  const [allGoals, setAllGoals] = useState<Goal[]>(loadAllGoals);
  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState<'manual' | 'test'>('manual');
  const [textInput, setTextInput] = useState('');
  const [estMins, setEstMins] = useState('');
  const [testSearch, setTestSearch] = useState('');
  const [testTypeFilter, setTestTypeFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  // Shift-goals state: which day is being acted on
  const [shiftConfirmDate, setShiftConfirmDate] = useState<string | null>(null);
  const [selectedShiftIds, setSelectedShiftIds] = useState<Set<string>>(new Set());

  // ── Study Timer State ──────────────────────────────────────────────────────
  const [timerSelected, setTimerSelected] = useState<number | null>(null); // secs
  const [timerRemaining, setTimerRemaining] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = (secs: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerSelected(secs);
    setTimerRemaining(secs);
    setTimerRunning(true);
    setTimerDone(false);
  };

  const pauseResumeTimer = () => setTimerRunning(r => !r);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimerRemaining(timerSelected ?? 0);
    setTimerDone(false);
  };

  useEffect(() => {
    if (!timerRunning) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimerRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimerRunning(false);
          setTimerDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timerProgress = timerSelected ? ((timerSelected - timerRemaining) / timerSelected) * 100 : 0;

  const todayGoals = useMemo(() => getTodayGoals(allGoals), [allGoals]);

  // Get completed goals count for today to determine if user can add more batches
  const completedToday = useMemo(() =>
    todayGoals.filter(g => g.status === 'completed').length
  , [todayGoals]);

  // Calculate batch: every 5 completed goals unlocks a new batch
  const batchNumber = Math.floor(completedToday / MAX_GOALS) + 1;
  const goalsInCurrentBatch = todayGoals.length - (batchNumber - 1) * MAX_GOALS;
  const canAdd = goalsInCurrentBatch < MAX_GOALS;

  // Get past goals grouped by date (excluding today)
  const pastGoalsByDate = useMemo(() => {
    const map = new Map<string, Goal[]>();
    allGoals
      .filter(g => g.createdAt !== today)
      .forEach(g => {
        if (!map.has(g.createdAt)) map.set(g.createdAt, []);
        map.get(g.createdAt)!.push(g);
      });
    // Sort dates descending, return as array of [date, goals[]]
    return [...map.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 14); // last 14 days
  }, [allGoals, today]);

  const hasPastGoals = pastGoalsByDate.length > 0;

  // Get target exam from localStorage for filtering tests
  const targetExam = useMemo(() => {
    try {
      const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      return (profile?.targetExam || profile?.customTargetExam || '').toLowerCase();
    } catch { return ''; }
  }, []);

  // Persist whenever goals change
  useEffect(() => { saveAllGoals(allGoals); }, [allGoals]);

  // Auto-complete test goals when quiz is submitted
  const syncCompletions = useCallback(() => {
    let completions: Record<string, { completed: boolean; score?: number }> = {};
    try { completions = JSON.parse(localStorage.getItem('quizCompletions') || '{}'); } catch { /**/ }

    setAllGoals(prev => {
      let changed = false;
      const updated = prev.map(g => {
        if (g.type === 'test' && g.quizId && g.status === 'pending') {
          const c = completions[g.quizId];
          if (c?.completed) {
            changed = true;
            return { ...g, status: 'completed' as GoalStatus, score: c.score };
          }
        }
        return g;
      });
      return changed ? updated : prev;
    });
  }, []);

  useEffect(() => {
    syncCompletions();
    const h = () => syncCompletions();
    window.addEventListener('storage', h);
    const t = setInterval(syncCompletions, 5000); // poll every 5s
    return () => { window.removeEventListener('storage', h); clearInterval(t); };
  }, [syncCompletions]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const completedCount = todayGoals.filter(g => g.status === 'completed').length;
  const totalCount = todayGoals.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const allDone = totalCount > 0 && completedCount === totalCount;
  const totalEstMins = todayGoals.reduce((acc, g) => acc + (g.estimatedMins ?? 0), 0);

  // Helper to check if test is related to target exam
  const isTestRelatedToTargetExam = (quiz: typeof dailyQuizzes[0]): boolean => {
    if (!targetExam) return true; // Show all if no target exam set

    const title = (quiz.title || '').toLowerCase();
    const subject = (quiz.subject || '').toLowerCase();
    const type = (quiz.type || '').toLowerCase();
    const examText = `${title} ${subject} ${type}`;

    // Map target exam keywords to filter tests
    const examKeywords: Record<string, string[]> = {
      'sbi clerk': ['sbi', 'clerk'],
      'sbi po': ['sbi', 'po'],
      'ibps clerk': ['ibps', 'clerk'],
      'ibps po': ['ibps', 'po'],
      'ibps rrb': ['rrb', 'ibps'],
      'rrb po': ['rrb', 'po'],
      'rrb clerk': ['rrb', 'clerk'],
      'lic ado': ['lic', 'ado'],
      'lic aao': ['lic', 'aao'],
      'rbi grade b': ['rbi', 'grade'],
      'ssc cgl': ['ssc', 'cgl'],
      'ssc chsl': ['ssc', 'chsl'],
      'ssc mts': ['ssc', 'mts'],
      'upsc': ['upsc'],
      'rrb ntpc': ['rrb', 'ntpc'],
      'rrb group d': ['rrb', 'group'],
    };

    const keywords = examKeywords[targetExam] || [];
    return keywords.some(kw => examText.includes(kw));
  };

  // ── Test picker data — filtered by target exam ────────────────────────────
  const todayTestList = useMemo(() =>
    dailyQuizzes.filter(q => q.scheduledDate === today && isTestRelatedToTargetExam(q))
  , [today, targetExam]);

  const allTestList = useMemo(() => {
    const unique = new Map<string, typeof dailyQuizzes[0]>();
    dailyQuizzes.forEach(q => {
      const key = q.type + q.title;
      if (!unique.has(key) && isTestRelatedToTargetExam(q)) {
        unique.set(key, q);
      }
    });
    return [...unique.values()].slice(0, 150);
  }, [targetExam]);

  const filteredTests = useMemo(() => {
    let list = todayTestList.length > 0 ? todayTestList : allTestList;
    if (testTypeFilter !== 'all') list = list.filter(q => q.type === testTypeFilter);
    if (testSearch.trim()) {
      const s = testSearch.toLowerCase();
      list = list.filter(q => q.title.toLowerCase().includes(s) || (q.subject || '').toLowerCase().includes(s));
    }
    return list.slice(0, 15);
  }, [todayTestList, allTestList, testTypeFilter, testSearch]);

  const availableTypes = useMemo(() => {
    const list = todayTestList.length > 0 ? todayTestList : allTestList;
    const s = new Set(list.map(q => q.type));
    return ['all', ...Array.from(s)];
  }, [todayTestList, allTestList]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const updateGoals = (updated: Goal[]) => {
    const pastGoals = allGoals.filter(g => g.createdAt !== today);
    setAllGoals([...pastGoals, ...updated]);
  };

  const addManualGoal = () => {
    if (!textInput.trim() || !canAdd) return;
    const g: Goal = {
      id: `manual-${Date.now()}`,
      type: 'manual',
      label: textInput.trim(),
      status: 'pending',
      estimatedMins: parseInt(estMins) > 0 ? parseInt(estMins) : undefined,
      createdAt: today,
    };
    updateGoals([...todayGoals, g]);
    setTextInput(''); setEstMins(''); setShowAdd(false);
  };

  const addTestGoal = (quiz: typeof dailyQuizzes[0]) => {
    if (!canAdd) return;
    if (todayGoals.some(g => g.quizId === quiz.id)) return;
    const g: Goal = {
      id: `test-${quiz.id}-${Date.now()}`,
      type: 'test',
      label: quiz.title,
      status: 'pending',
      quizId: quiz.id,
      quizType: quiz.type,
      estimatedMins: quiz.duration,
      createdAt: today,
    };
    updateGoals([...todayGoals, g]);
    setShowAdd(false); setTestSearch('');
  };

  const toggleManualGoal = (id: string) => {
    const updated = todayGoals.map(g =>
      g.id === id && g.type === 'manual'
        ? { ...g, status: (g.status === 'completed' ? 'pending' : 'completed') as GoalStatus }
        : g
    );
    updateGoals(updated);
  };

  const requestDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    updateGoals(todayGoals.filter(g => g.id !== deletingId));
    setDeletingId(null);
  };

  const startEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setEditText(goal.label);
  };

  const saveEditGoal = (id: string) => {
    if (!editText.trim()) return;
    const updated = todayGoals.map(g =>
      g.id === id ? { ...g, label: editText.trim() } : g
    );
    updateGoals(updated);
    setEditingId(null);
    setEditText('');
  };

  const reAddMissed = (g: Goal) => {
    if (!canAdd) return;
    const newGoal: Goal = { ...g, id: `${g.id}-retry`, status: 'pending', createdAt: today };
    updateGoals([...todayGoals, newGoal]);
  };

  // ── Shift unfinished goals to tomorrow (with OK confirmation) ──────────────
  const openShiftConfirm = (date: string, pendingGoals: Goal[]) => {
    setShiftConfirmDate(date);
    setSelectedShiftIds(new Set(pendingGoals.map(g => g.id)));
  };

  const toggleShiftId = (id: string) => {
    setSelectedShiftIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const confirmShift = () => {
    if (!shiftConfirmDate) return;
    const tomorrow = getTomorrowISTStr();
    setAllGoals(prev => {
      return prev.map(g => {
        if (g.createdAt !== shiftConfirmDate) return g;
        if (selectedShiftIds.has(g.id)) {
          // Move to tomorrow
          return { ...g, id: `${g.id}-shifted`, status: 'pending', createdAt: tomorrow };
        }
        // Mark remaining as missed
        if (g.status === 'pending') return { ...g, status: 'missed' as GoalStatus };
        return g;
      });
    });
    setShiftConfirmDate(null);
    setSelectedShiftIds(new Set());
  };

  const dismissAsMissed = (date: string) => {
    setAllGoals(prev =>
      prev.map(g =>
        g.createdAt === date && g.status === 'pending'
          ? { ...g, status: 'missed' as GoalStatus }
          : g
      )
    );
    setShiftConfirmDate(null);
  };

  // ── Status Renderers ───────────────────────────────────────────────────────
  const statusIcon = (status: GoalStatus) => {
    if (status === 'completed') return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
    if (status === 'missed')    return <X className="h-5 w-5 text-red-400 shrink-0" />;
    if (status === 'in_progress') return <Zap className="h-5 w-5 text-amber-500 shrink-0 animate-pulse" />;
    return <Circle className="h-5 w-5 text-slate-300 shrink-0" />;
  };

  const rowClass = (status: GoalStatus) => {
    if (status === 'completed') return 'bg-emerald-50 border-emerald-100';
    if (status === 'missed')    return 'bg-red-50 border-red-100 opacity-60';
    if (status === 'in_progress') return 'bg-amber-50 border-amber-200';
    return 'bg-slate-50 border-slate-100 hover:border-primary/30';
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Card className="bg-white border border-slate-200 rounded-xl overflow-hidden h-full flex flex-col" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.07)' }}>
      <div className="flex flex-col min-h-0 flex-1">

        {/* ════════════════════════════════════════════════
             HEADER
            ════════════════════════════════════════════════ */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                <Target className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[14px] text-slate-800 leading-none">Today's Goals</h3>
                {totalCount > 0 && (
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    Batch #{batchNumber} · {completedCount} of {totalCount} completed
                    <span className={`ml-1.5 font-bold ${goalsInCurrentBatch >= MAX_GOALS ? 'text-amber-500' : 'text-emerald-500'}`}>
                      · {goalsInCurrentBatch}/{MAX_GOALS} slots
                    </span>
                  </p>
                )}
              </div>
              {allDone && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">🎉 Done!</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {totalEstMins > 0 && (
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  ~{totalEstMins >= 60
                    ? `${Math.floor(totalEstMins / 60)}h ${totalEstMins % 60 > 0 ? `${totalEstMins % 60}m` : ''}`
                    : `${totalEstMins}m`}
                </span>
              )}
              {canAdd ? (
                <button
                  onClick={() => { setShowAdd(!showAdd); setShowHistory(false); }}
                  className="flex items-center gap-1 text-[10px] font-bold text-white px-2.5 py-1 rounded-full shadow-sm transition-all hover:shadow-md"
                  style={{ background: '#10b981' }}
                >
                  <Plus className="h-3 w-3" />
                  Add Goal
                </button>
              ) : (
                <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  5/5 · Complete goals to add more
                </span>
              )}
              {/* History button */}
              {hasPastGoals && (
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  <Calendar className="h-3 w-3" />
                  History
                </button>
              )}
            </div>
          </div>

          {/* ── Segmented Progress ── */}
          {totalCount > 0 && !showHistory && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-slate-600">{completedCount}/{totalCount} tasks complete</span>
                <span className={`text-[11px] font-black tabular-nums ${ allDone ? 'text-emerald-600' : progressPct >= 50 ? 'text-primary' : 'text-amber-600'}`}>{progressPct}%</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: MAX_GOALS }).map((_, i) => {
                  const isDone = i < completedCount;
                  const isAdded = i < totalCount;
                  return (
                    <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        background: isDone ? '#10b981' : isAdded ? 'var(--color-primary, #6366f1)' : '#e2e8f0',
                        opacity: isAdded ? 1 : 0.4,
                        transitionDelay: `${i * 80}ms`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════
             CONTENT AREA — scrollable
            ════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">

          {/* ── Empty State ── */}
          {totalCount === 0 && !showAdd && (
            <div className="flex flex-col items-center justify-center py-5 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[13px] font-bold text-slate-700 mb-1">No goals set for today</p>
              <p className="text-[11px] text-slate-400 mb-3">Set up to 5 goals to get started</p>
              <button
                onClick={() => setShowAdd(true)}
              className="text-[12px] font-bold hover:opacity-80 border px-4 py-1.5 rounded-full transition-colors"
                style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }}
              >
                + Set your goals for today
              </button>
            </div>
          )}

          {/* ── Goals List ── */}
          {totalCount > 0 && (
            <div className="space-y-2 mb-4">
              {todayGoals.map((goal, idx) => {
                const typeInfo = goal.quizType ? TYPE_LABELS[goal.quizType] : null;
                const isDone = goal.status === 'completed';
                const isMissed = goal.status === 'missed';
                const isInProgress = goal.status === 'in_progress';
                return (
                  <div
                    key={goal.id}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all relative overflow-hidden ${
                      isDone ? 'bg-emerald-50/60 border-emerald-100' :
                      isMissed ? 'bg-red-50/50 border-red-100 opacity-60' :
                      isInProgress ? 'bg-amber-50/60 border-amber-200' :
                      'bg-white border-slate-100 hover:border-primary/30 hover:shadow-sm'
                    }`}
                  >
                    {/* Left accent strip */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
                      style={{ background: isDone ? '#10b981' : isMissed ? '#f87171' : isInProgress ? '#f59e0b' : 'var(--color-primary,#6366f1)' }}
                    />
                    <span className="shrink-0 w-5 text-center text-[10px] font-black text-slate-300">{idx + 1}</span>
                    <button
                      onClick={() => goal.type === 'manual' && !isMissed && toggleManualGoal(goal.id)}
                      disabled={goal.type === 'test' || isMissed}
                      className="shrink-0 transition-transform hover:scale-110"
                    >
                      {statusIcon(goal.status)}
                    </button>
                    <div className="flex-1 min-w-0">
                      {editingId === goal.id ? (
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditGoal(goal.id)}
                          className="text-[13px] h-7 px-2 py-1 border-slate-200 bg-white"
                          autoFocus
                          maxLength={80}
                        />
                      ) : (
                        <p className={`text-[13px] font-semibold leading-snug ${
                          isDone ? 'line-through text-slate-400' :
                          isMissed ? 'text-slate-400' : 'text-slate-800'
                        }`}>
                          {goal.label}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {typeInfo && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${typeInfo.color}`}>
                            {typeInfo.icon} {typeInfo.label}
                          </span>
                        )}
                        {goal.estimatedMins && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />{goal.estimatedMins} min
                          </span>
                        )}
                        {isDone && goal.score !== undefined && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded-full">Score: {goal.score}%</span>
                        )}
                        {goal.type === 'test' && goal.status === 'pending' && (
                          <span className="text-[9px] text-primary/70 font-medium">Auto-completes on submit</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {goal.type === 'test' && goal.status === 'pending' && (
                        <Link
                          to="/student/daily-quizzes"
                          onClick={() => {
                            const updated = todayGoals.map(g =>
                              g.id === goal.id ? { ...g, status: 'in_progress' as GoalStatus } : g
                            );
                            updateGoals(updated);
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold text-white bg-primary hover:bg-primary/90 px-2 py-1 rounded-lg shadow-sm transition-all"
                        >
                          <Play className="h-3 w-3" strokeWidth={3} />
                          Start
                        </Link>
                      )}
                      {/* Delete only — goal name is final after creation */}
                      <button
                        onClick={() => requestDelete(goal.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Delete Confirmation ── */}
          {deletingId && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-[12px] font-bold text-red-700">Delete this goal?</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={confirmDelete}
                  className="flex-1 text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 py-1.5 rounded-lg transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 text-[12px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-1.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── Add Goal Panel ── */}
          {showAdd && canAdd && (
            <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                <button
                  onClick={() => setAddMode('manual')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[12px] font-bold transition-all ${
                    addMode === 'manual' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <ListChecks className="h-3.5 w-3.5" />
                  Custom Goal
                </button>
                <button
                  onClick={() => setAddMode('test')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[12px] font-bold transition-all ${
                    addMode === 'test' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Pick a Test
                </button>
              </div>

              {addMode === 'manual' && (
                <div className="space-y-2">
                  <Input
                    placeholder="e.g. Revise Profit & Loss chapter"
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addManualGoal()}
                    className="text-sm h-9 border-slate-200 bg-white"
                    maxLength={80}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        placeholder="Est. mins (optional)"
                        value={estMins}
                        onChange={e => setEstMins(e.target.value.replace(/\D/g, ''))}
                        className="text-sm h-9 border-slate-200 bg-white pl-8"
                        maxLength={3}
                        type="number"
                        min={1}
                        max={240}
                      />
                    </div>
                    <Button
                      size="sm"
                      className="h-9 px-4 text-white rounded-lg font-bold shrink-0"
                      style={{ background: '#10b981' }}
                      onClick={addManualGoal}
                      disabled={!textInput.trim()}
                    >
                      Add Goal
                    </Button>
                  </div>
                </div>
              )}

              {addMode === 'test' && (
                <div className="space-y-2">
                  <Input
                    placeholder="Search tests by name or subject..."
                    value={testSearch}
                    onChange={e => setTestSearch(e.target.value)}
                    className="text-sm h-9 border-slate-200 bg-white"
                    autoFocus
                  />
                  <div className="flex gap-1 flex-wrap">
                    {availableTypes.map(t => (
                      <button
                        key={t}
                        onClick={() => setTestTypeFilter(t)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                          testTypeFilter === t
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-primary/40'
                        }`}
                      >
                        {t === 'all' ? 'All Types' : TYPE_LABELS[t]?.label || t}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1 max-h-52 overflow-y-auto pr-0.5">
                    {filteredTests.length === 0 && (
                      <p className="text-[11px] text-slate-400 text-center py-4">No tests found</p>
                    )}
                    {filteredTests.map(quiz => {
                      const alreadyAdded = todayGoals.some(g => g.quizId === quiz.id);
                      const typeInfo = TYPE_LABELS[quiz.type];
                      return (
                        <button
                          key={quiz.id}
                          onClick={() => !alreadyAdded && addTestGoal(quiz)}
                          disabled={alreadyAdded}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${
                            alreadyAdded
                              ? 'opacity-40 cursor-not-allowed bg-slate-100 border border-slate-100'
                              : 'bg-white hover:bg-primary/5 hover:border-primary/30 border border-slate-100'
                          }`}
                        >
                          {typeInfo && (
                            <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${typeInfo.color}`}>
                              {typeInfo.icon}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-slate-800 truncate">{quiz.title}</p>
                            <p className="text-[10px] text-slate-500">
                              {quiz.subject} · {quiz.questions} Qs · {quiz.duration} min · {quiz.difficulty}
                            </p>
                          </div>
                          {alreadyAdded
                            ? <span className="text-[10px] text-slate-400 shrink-0 font-medium">Added</span>
                            : <span className="text-[10px] text-primary font-bold shrink-0">Set Goal →</span>
                          }
                        </button>
                      );
                    })}
                  </div>
                  {todayTestList.length > 0 && testSearch === '' && testTypeFilter === 'all' && (
                    <p className="text-[10px] text-slate-400 text-center">
                      Showing today's {todayTestList.length} scheduled tests · Search for more
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => { setShowAdd(false); setTextInput(''); setTestSearch(''); setEstMins(''); }}
                className="text-[11px] text-slate-400 hover:text-slate-600 w-full text-center pt-1"
              >
                Cancel
              </button>
            </div>
          )}

          {/* ── Stats Footer ── */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3">
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <TrendingUp className="h-3 w-3" />
                <span>
                  {completedCount === 0 && 'Get started on your goals!'}
                  {completedCount > 0 && completedCount < totalCount && `${totalCount - completedCount} goal${totalCount - completedCount > 1 ? 's' : ''} remaining`}
                  {allDone && 'Excellent work today! 🎉'}
                </span>
              </div>
              {batchNumber > 1 && (
                <span className="text-[10px] text-primary font-semibold">Batch #{batchNumber}</span>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── History Dialog — Day-wise grouped ── */}
      <Dialog open={showHistory} onOpenChange={open => { setShowHistory(open); if (!open) setShiftConfirmDate(null); }}>
        <DialogContent className="max-w-md max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100">
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Calendar className="h-4 w-4 text-primary" />
              Goals History
            </DialogTitle>
            <p className="text-[11px] text-slate-400 mt-0.5">Your past goals day by day · Shift incomplete ones to tomorrow</p>
          </DialogHeader>

          <ScrollArea className="h-[65vh]">
            <div className="px-4 py-4 space-y-4">
              {pastGoalsByDate.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No past goals to show</p>
              ) : pastGoalsByDate.map(([date, goals]) => {
                const done    = goals.filter(g => g.status === 'completed').length;
                const missed  = goals.filter(g => g.status === 'missed').length;
                const pending = goals.filter(g => g.status === 'pending').length;
                const total   = goals.length;
                const allDone = done === total;
                const hasPending = pending > 0;
                const isShiftable = hasPending && date !== getISTDateStr();
                const isShifting  = shiftConfirmDate === date;

                return (
                  <div key={date} className="rounded-2xl border overflow-hidden"
                    style={{ borderColor: allDone ? 'rgba(16,185,129,0.25)' : hasPending ? 'rgba(251,146,60,0.3)' : 'rgba(241,245,249,1)' }}>

                    {/* Day header */}
                    <div className="flex items-center justify-between px-4 py-2.5"
                      style={{ background: allDone ? 'rgba(16,185,129,0.07)' : hasPending ? 'rgba(251,146,60,0.07)' : '#f8fafc' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-black text-slate-800">{formatDisplayDate(date)}</span>
                        <span className="text-[10px] text-slate-400">{date}</span>
                      </div>
                      {/* Summary pill */}
                      <div className="flex items-center gap-1.5">
                        {done > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✅ {done}</span>}
                        {missed > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">❌ {missed}</span>}
                        {pending > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">○ {pending} pending</span>}
                        <span className="text-[9px] text-slate-400">{done}/{total}</span>
                      </div>
                    </div>

                    {/* Goals list */}
                    <div className="divide-y divide-slate-50">
                      {goals.map(g => (
                        <div key={g.id} className="flex items-center gap-3 px-4 py-2.5"
                          style={{ background: g.status === 'completed' ? 'rgba(240,253,244,0.5)' : g.status === 'missed' ? 'rgba(254,242,242,0.5)' : '#fff' }}>

                          {isShifting && g.status === 'pending' ? (
                            // Checkbox for selection during shift
                            <button
                              onClick={() => toggleShiftId(g.id)}
                              className="shrink-0 w-4 h-4 rounded border-2 transition-all flex items-center justify-center"
                              style={{
                                borderColor: selectedShiftIds.has(g.id) ? '#10b981' : '#cbd5e1',
                                background:  selectedShiftIds.has(g.id) ? '#10b981' : '#fff',
                              }}
                            >
                              {selectedShiftIds.has(g.id) && <span style={{ color: '#fff', fontSize: 9, fontWeight: 900 }}>✓</span>}
                            </button>
                          ) : (
                            <span className="shrink-0">
                              {g.status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
                               g.status === 'missed'    ? <X className="h-4 w-4 text-red-400" /> :
                               <Circle className="h-4 w-4 text-slate-300" />}
                            </span>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className={`text-[12px] font-semibold truncate ${
                              g.status === 'completed' ? 'text-slate-500 line-through' :
                              g.status === 'missed'    ? 'text-red-400' :
                              'text-slate-700'
                            }`}>{g.label}</p>
                            {g.estimatedMins && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5" />{g.estimatedMins} min
                              </span>
                            )}
                          </div>

                          {g.score !== undefined && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">Score: {g.score}%</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Shift action row — only for days with pending goals */}
                    {isShiftable && !isShifting && (
                      <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-100 flex items-center justify-between">
                        <p className="text-[11px] text-amber-700 font-semibold">{pending} goal{pending > 1 ? 's' : ''} not completed</p>
                        <button
                          onClick={() => openShiftConfirm(date, goals.filter(g => g.status === 'pending'))}
                          className="text-[10px] font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}
                        >
                          Move to Tomorrow →
                        </button>
                      </div>
                    )}

                    {/* Shift confirmation row */}
                    {isShifting && (
                      <div className="px-4 py-3 bg-amber-50 border-t border-amber-200 space-y-2">
                        <p className="text-[11px] text-amber-800 font-bold">Select goals to move to tomorrow (deselect to mark as missed):</p>
                        <div className="flex gap-2">
                          <button
                            onClick={confirmShift}
                            disabled={selectedShiftIds.size === 0 && pending > 0}
                            className="flex-1 py-2 rounded-xl text-white text-[12px] font-black transition-all hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 2px 8px rgba(34,197,94,0.4)' }}
                          >
                            ✓ OK — Move Selected
                          </button>
                          <button
                            onClick={() => dismissAsMissed(date)}
                            className="px-4 py-2 rounded-xl text-red-600 text-[11px] font-bold bg-red-50 border border-red-200 hover:bg-red-100 transition-all"
                          >
                            Mark All Missed
                          </button>
                        </div>
                        <button
                          onClick={() => setShiftConfirmDate(null)}
                          className="w-full text-[10px] text-slate-400 hover:text-slate-600 pt-0.5"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Delete Goal?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600">This goal will be permanently removed from your list.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeletingId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
