import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2, Circle, Plus, X, Target, ListChecks,
  FileText, Play, Trash2, Clock, Lock, RotateCcw,
  ChevronDown, AlertTriangle, TrendingUp, Zap
} from 'lucide-react';
import { dailyQuizzes } from '@/data/dailyQuizzesData';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_GOALS = 5;
const GOAL_WINDOW_HOUR = 9;        // 9 AM IST
const ONBOARDING_GRACE_HOUR = 12;  // 12 PM IST for first 3 days
const ONBOARDING_DAYS = 3;

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

const getISTHourDecimal = (): number => {
  const d = getISTDate();
  return d.getUTCHours() + d.getUTCMinutes() / 60;
};

const getYesterdayISTStr = (): string => {
  const d = getISTDate();
  d.setUTCDate(d.getUTCDate() - 1);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
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

const getYesterdayGoals = (all: Goal[]): Goal[] =>
  all.filter(g => g.createdAt === getYesterdayISTStr());

// Determine cutoff hour based on preparation start date
const getCutoffHour = (): number => {
  try {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (profile?.preparationStartDate) {
      const daysSinceStart = Math.floor(
        (Date.now() - new Date(profile.preparationStartDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceStart < ONBOARDING_DAYS) return ONBOARDING_GRACE_HOUR;
    }
  } catch { /* ignore */ }
  return GOAL_WINDOW_HOUR;
};

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
  const cutoffHour = getCutoffHour();
  const istHour = getISTHourDecimal();
  const windowOpen = istHour < cutoffHour;

  const [allGoals, setAllGoals] = useState<Goal[]>(loadAllGoals);
  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState<'manual' | 'test'>('manual');
  const [textInput, setTextInput] = useState('');
  const [estMins, setEstMins] = useState('');
  const [testSearch, setTestSearch] = useState('');
  const [testTypeFilter, setTestTypeFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null); // after-9AM confirmation
  const [timeLeft, setTimeLeft] = useState('');
  const [showMissedRecovery, setShowMissedRecovery] = useState(false);

  const todayGoals = useMemo(() => getTodayGoals(allGoals), [allGoals]);
  const yesterdayMissed = useMemo(
    () => getYesterdayGoals(allGoals).filter(g => g.status === 'missed'),
    [allGoals]
  );

  // Persist whenever goals change
  useEffect(() => { saveAllGoals(allGoals); }, [allGoals]);

  // Countdown timer to 9 AM
  useEffect(() => {
    const tick = () => {
      const now = getISTDate();
      const cutoff = new Date(now);
      cutoff.setUTCHours(cutoffHour, 0, 0, 0);
      if (now >= cutoff) { setTimeLeft(''); return; }
      const diffMs = cutoff.getTime() - now.getTime();
      const h = Math.floor(diffMs / 3600000);
      const m = Math.floor((diffMs % 3600000) / 60000);
      const s = Math.floor((diffMs % 60000) / 1000);
      setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cutoffHour]);

  // Midnight: mark unfinished as MISSED
  useEffect(() => {
    const allUpdated = allGoals.map(g => {
      if (g.createdAt < today && g.status === 'pending') {
        return { ...g, status: 'missed' as GoalStatus };
      }
      return g;
    });
    if (JSON.stringify(allUpdated) !== JSON.stringify(allGoals)) {
      setAllGoals(allUpdated);
    }
    if (yesterdayMissed.length > 0) setShowMissedRecovery(true);
  }, [today]);

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
  const canAdd = windowOpen && totalCount < MAX_GOALS;

  // ── Test picker data ───────────────────────────────────────────────────────
  const todayTestList = useMemo(() => dailyQuizzes.filter(q => q.scheduledDate === today), [today]);
  const allTestList = useMemo(() => {
    const unique = new Map<string, typeof dailyQuizzes[0]>();
    dailyQuizzes.forEach(q => { if (!unique.has(q.type + q.title)) unique.set(q.type + q.title, q); });
    return [...unique.values()].slice(0, 150);
  }, []);

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
    const s = new Set((todayTestList.length > 0 ? todayTestList : allTestList).map(q => q.type));
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
    if (windowOpen) {
      // Before cutoff — delete freely
      updateGoals(todayGoals.filter(g => g.id !== id));
    } else {
      setDeletingId(id);
    }
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    // Mark as missed then remove
    const updated = todayGoals.map(g =>
      g.id === deletingId ? { ...g, status: 'missed' as GoalStatus } : g
    ).filter(g => g.id !== deletingId);
    updateGoals(updated);
    setDeletingId(null);
  };

  const reAddMissed = (g: Goal) => {
    if (!canAdd) return;
    const newGoal: Goal = { ...g, id: `${g.id}-retry`, status: 'pending', createdAt: today };
    updateGoals([...todayGoals, newGoal]);
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
    <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="font-bold text-[15px] text-slate-800">Today's Goals</h3>
          {totalCount > 0 && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              allDone ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                      : 'text-primary bg-primary/10 border-primary/20'
            }`}>
              {completedCount}/{totalCount} done
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Time estimate */}
          {totalEstMins > 0 && (
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{totalEstMins >= 60
                ? `${Math.floor(totalEstMins / 60)}h ${totalEstMins % 60 > 0 ? `${totalEstMins % 60}m` : ''}`
                : `${totalEstMins}m`}
            </span>
          )}

          {/* Add button / Window status */}
          {canAdd ? (
            <button
              onClick={() => { setShowAdd(!showAdd); }}
              className="flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-2.5 py-1 rounded-full transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add {totalCount}/{MAX_GOALS}
            </button>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
              <Lock className="h-3 w-3" />
              Window closed
            </span>
          )}
        </div>
      </div>

      {/* ── Window Countdown ── */}
      {windowOpen && timeLeft && (
        <div className={`mb-3 flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 border ${
          timeLeft.includes('m') && !timeLeft.includes('h')
            ? 'bg-red-50 border-red-200 text-red-700' // < 1h left = urgent red
            : 'bg-amber-50 border-amber-200 text-amber-800' // otherwise amber
        }`}>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 animate-pulse" />
            <span className="text-[12px] font-semibold">
              Goal window closes at <strong>{cutoffHour}:00 AM IST</strong>
            </span>
          </div>
          <span className={`text-[13px] font-black tabular-nums shrink-0 ${
            timeLeft.includes('m') && !timeLeft.includes('h') ? 'text-red-600' : 'text-amber-700'
          }`}>{timeLeft}</span>
        </div>
      )}

      {/* ── Closed Window Message ── */}
      {!windowOpen && totalCount === 0 && (
        <div className="mb-3 flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
          <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>Goal setting closed for today — set goals <strong>tomorrow before {cutoffHour}:00 AM IST</strong> to build your streak.</span>
        </div>
      )}

      {/* ── Missed Recovery Banner ── */}
      {showMissedRecovery && yesterdayMissed.length > 0 && canAdd && (
        <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-bold text-orange-700 flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Yesterday you missed {yesterdayMissed.length} goal{yesterdayMissed.length > 1 ? 's' : ''}
            </span>
            <button onClick={() => setShowMissedRecovery(false)} className="text-orange-400 hover:text-orange-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {yesterdayMissed.slice(0, 3).map(g => (
              <div key={g.id} className="flex items-center justify-between">
                <span className="text-[11px] text-orange-700 truncate flex-1 mr-2">{g.label}</span>
                {totalCount < MAX_GOALS && (
                  <button
                    onClick={() => reAddMissed(g)}
                    className="shrink-0 text-[10px] font-bold text-orange-600 bg-orange-100 hover:bg-orange-200 border border-orange-200 px-2 py-0.5 rounded-full transition-colors"
                  >
                    + Add Today
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Progress Bar ── */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500">{completedCount} of {totalCount} goals done</span>
            <span className={`text-[11px] font-bold ${ allDone ? 'text-emerald-600' : progressPct >= 50 ? 'text-primary' : 'text-amber-600'}`}>{progressPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${allDone ? 'bg-emerald-500' : 'bg-primary'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {allDone && (
            <p className="text-[12px] text-emerald-600 font-bold mt-2 text-center animate-pulse">
              🎉 All goals completed! Amazing discipline today!
            </p>
          )}
        </div>
      )}

      {/* ── Empty State ── */}
      {totalCount === 0 && !showAdd && windowOpen && (
        <div className="flex flex-col items-center justify-center py-5 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <p className="text-[13px] font-bold text-slate-700 mb-1">No goals set for today</p>
          <p className="text-[11px] text-slate-400 mb-3">Set up to 5 goals before {cutoffHour}:00 AM IST</p>
          <button
            onClick={() => setShowAdd(true)}
            className="text-[12px] font-bold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 border border-primary/20 px-4 py-1.5 rounded-full transition-colors"
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
            return (
              <div
                key={goal.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${rowClass(goal.status)}`}
              >
                {/* Index */}
                <span className="shrink-0 w-5 text-center text-[11px] font-bold text-slate-400">{idx + 1}</span>

                {/* Status Icon — clickable for manual goals */}
                <button
                  onClick={() => goal.type === 'manual' && goal.status !== 'missed' && toggleManualGoal(goal.id)}
                  disabled={goal.type === 'test' || goal.status === 'missed'}
                  className="shrink-0"
                >
                  {statusIcon(goal.status)}
                </button>

                {/* Label + meta */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[12.5px] font-semibold leading-snug ${
                    goal.status === 'completed' ? 'line-through text-slate-400' :
                    goal.status === 'missed' ? 'text-slate-400' : 'text-slate-800'
                  }`}>
                    {goal.label}
                  </p>
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
                    {goal.status === 'completed' && goal.score !== undefined && (
                      <span className="text-[10px] font-bold text-emerald-600">Score: {goal.score}%</span>
                    )}
                    {goal.type === 'test' && goal.status === 'pending' && (
                      <span className="text-[9px] text-primary font-medium">Auto-completes on submit</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {goal.type === 'test' && goal.status === 'pending' && (
                    <Link
                      to="/student/daily-quizzes"
                      onClick={() => {
                        // Mark in_progress
                        const updated = todayGoals.map(g =>
                          g.id === goal.id ? { ...g, status: 'in_progress' as GoalStatus } : g
                        );
                        updateGoals(updated);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Play className="h-3 w-3" strokeWidth={3} />
                      Start
                    </Link>
                  )}
                  {goal.status !== 'missed' && (
                    <button
                      onClick={() => requestDelete(goal.id)}
                      className="p-1 text-slate-300 hover:text-red-400 transition-colors rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete After Window — Confirmation ── */}
      {deletingId && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-[12px] font-bold text-red-700">Delete after window closed?</p>
          </div>
          <p className="text-[11px] text-red-600 mb-3">
            Deleting a goal after 9 AM will count it as <strong>missed</strong>. This affects your completion rate.
          </p>
          <div className="flex gap-2">
            <button
              onClick={confirmDelete}
              className="flex-1 text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 py-1.5 rounded-lg transition-colors"
            >
              Delete (mark as missed)
            </button>
            <button
              onClick={() => setDeletingId(null)}
              className="flex-1 text-[12px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-1.5 rounded-lg transition-colors"
            >
              Keep it
            </button>
          </div>
        </div>
      )}

      {/* ── Add Goal Panel ── */}
      {showAdd && canAdd && (
        <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">

          {/* Mode Toggle */}
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

          {/* Manual Goal */}
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
                  className="h-9 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold shrink-0"
                  onClick={addManualGoal}
                  disabled={!textInput.trim()}
                >
                  Add Goal
                </Button>
              </div>
            </div>
          )}

          {/* Test Picker */}
          {addMode === 'test' && (
            <div className="space-y-2">
              <Input
                placeholder="Search tests by name or subject..."
                value={testSearch}
                onChange={e => setTestSearch(e.target.value)}
                className="text-sm h-9 border-slate-200 bg-white"
                autoFocus
              />

              {/* Type filter pills */}
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

              {/* Results */}
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

      {/* ── Stats Footer (when goals exist) ── */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <TrendingUp className="h-3 w-3" />
            <span>
              {completedCount === 0 && 'Get started on your goals!'}
              {completedCount > 0 && completedCount < totalCount && `${totalCount - completedCount} goal${totalCount - completedCount > 1 ? 's' : ''} remaining`}
              {allDone && 'Excellent work today!'}
            </span>
          </div>
          {!windowOpen && (
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              New goals from 3–{cutoffHour} AM
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
