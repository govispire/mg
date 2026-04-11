import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Maximize2, Minimize2, Play, Pause, Lock, Unlock, Shield, Flame, CheckCircle, AlertTriangle } from 'lucide-react';

// ── Smart session logic ──────────────────────────────────────────────────────

/** Determine user tier from localStorage study history */
const getUserTier = (): 'beginner' | 'regular' | 'advanced' => {
  try {
    const sessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
    if (sessions.length >= 20) return 'advanced';
    if (sessions.length >= 7) return 'regular';
    return 'beginner';
  } catch { return 'beginner'; }
};

const getMaxMinutes = (_tier: 'beginner' | 'regular' | 'advanced') => {
  return 180;
};

const getRecommended = (tier: 'beginner' | 'regular' | 'advanced') => {
  if (tier === 'advanced') return 60;
  if (tier === 'regular') return 45;
  return 25;
};

const QUICK_OPTIONS = [25, 30, 45, 60]; // minutes

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const saveSession = (mins: number) => {
  try {
    const sessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
    sessions.push({ mins, date: new Date().toISOString() });
    localStorage.setItem('study_sessions', JSON.stringify(sessions.slice(-50)));
  } catch {}
};

// ── Glowing circular ring SVG ────────────────────────────────────────────────
const GlowRing: React.FC<{
  progress: number;         // 0–100
  running: boolean;
  done: boolean;
  urgent: boolean;
  size: number;
  strokeWidth?: number;
  darkInner?: boolean;      // true = fullscreen dark bg, false = white card
  children: React.ReactNode;
}> = ({ progress, running, done, urgent, size, strokeWidth = 10, darkInner = false, children }) => {
  const R = (size - strokeWidth * 2) / 2;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - progress / 100);
  const innerFill = darkInner ? 'rgba(15,20,40,0.75)' : 'rgba(248,250,252,0.95)';

  const color = done ? '#10b981' : urgent ? '#ef4444' : running ? '#22c55e' : '#22c55e';
  const glowColor = done ? 'rgba(16,185,129,0.35)' : urgent ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.3)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Ambient glow behind the ring */}
      {(running || done) && (
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            width: R * 1.6, height: R * 1.6,
            background: glowColor,
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            filter: 'blur(14px)',
            opacity: 0.6,
          }}
        />
      )}

      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size} height={size}
        className="absolute inset-0 -rotate-90"
      >
        {/* Outer decorative track */}
        <circle
          cx={size / 2} cy={size / 2} r={R + strokeWidth / 2 + 2}
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1}
        />
        {/* Inner fill — light for white card, dark for fullscreen */}
        <circle
          cx={size / 2} cy={size / 2} r={R - strokeWidth / 2}
          fill={innerFill}
        />
        {/* Track ring */}
        <circle
          cx={size / 2} cy={size / 2} r={R}
          fill="none"
          stroke={darkInner ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}
          strokeWidth={strokeWidth + 2}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2} cy={size / 2} r={R}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease', filter: `drop-shadow(0 0 8px ${color})` }}
        />
        {/* Moving dot at tip */}
        {(running || progress > 0) && (
          <circle
            cx={size / 2 + R * Math.cos((progress / 100) * 2 * Math.PI - Math.PI / 2)}
            cy={size / 2 + R * Math.sin((progress / 100) * 2 * Math.PI - Math.PI / 2)}
            r={strokeWidth / 2 + 1}
            fill={color}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {children}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const StudyTimerWidget: React.FC = () => {
  const tier = getUserTier();
  const maxMins = getMaxMinutes(tier);
  const recommended = getRecommended(tier);

  const [selectedMins, setSelectedMins] = useState<number>(recommended);
  const [customInput, setCustomInput] = useState<string>('');
  const [showCustom, setShowCustom] = useState(false);
  const [remaining, setRemaining] = useState<number>(recommended * 60);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [strictMode, setStrictMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pauseWarnings, setPauseWarnings] = useState(0);
  const [tabWarning, setTabWarning] = useState(false);
  const [focusSessions, setFocusSessions] = useState(() => {
    try { return parseInt(localStorage.getItem('focus_sessions') || '0', 10); } catch { return 0; }
  });
  const [totalStudyMins, setTotalStudyMins] = useState(() => {
    try { return parseInt(localStorage.getItem('total_study_mins') || '0', 10); } catch { return 0; }
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSecs = selectedMins * 60;
  const progress = started ? ((totalSecs - remaining) / totalSecs) * 100 : 0;
  const urgent = remaining < 60 && started;

  // ── Pick duration ──────────────────────────────────────────────────────────
  const pickDuration = (mins: number) => {
    const clamped = Math.max(15, Math.min(maxMins, mins));
    setSelectedMins(clamped);
    setRemaining(clamped * 60);
    setStarted(false);
    setRunning(false);
    setDone(false);
    setPauseWarnings(0);
  };

  // ── Start session ──────────────────────────────────────────────────────────
  const startSession = () => {
    setStarted(true);
    setRunning(true);
    setDone(false);
    setPauseWarnings(0);
  };

  // ── Pause / resume ─────────────────────────────────────────────────────────
  const togglePause = () => {
    if (strictMode && running) {
      // Strict mode: count pause attempts
      setPauseWarnings(w => w + 1);
      return; // don't actually pause in strict mode
    }
    setRunning(r => !r);
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setStarted(false);
    setDone(false);
    setRemaining(selectedMins * 60);
    setPauseWarnings(0);
  };

  // ── Tick ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!running) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setRunning(false);
          setDone(true);
          saveSession(selectedMins);
          // Only count fully completed sessions
          const s = focusSessions + 1;
          setFocusSessions(s);
          localStorage.setItem('focus_sessions', String(s));
          const newMins = totalStudyMins + selectedMins;
          setTotalStudyMins(newMins);
          localStorage.setItem('total_study_mins', String(newMins));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, selectedMins, focusSessions]);

  // ── Strict mode: tab visibility warning ───────────────────────────────────
  useEffect(() => {
    if (!strictMode || !running) return;
    const onHide = () => { if (document.hidden) setTabWarning(true); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [strictMode, running]);

  // ── ESC + fullscreen sync ──────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !strictMode) setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [strictMode]);

  // ── Custom duration validation ─────────────────────────────────────────────
  const applyCustom = () => {
    const val = parseInt(customInput, 10);
    if (!isNaN(val)) pickDuration(val);
    setShowCustom(false);
    setCustomInput('');
  };

  const tierLabel = tier === 'advanced' ? 'Advanced' : tier === 'regular' ? 'Regular' : 'Beginner';

  // ── FULLSCREEN VIEW ────────────────────────────────────────────────────────
  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1b2a 50%, #0a1628 100%)' }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4">
          <div className="flex items-center gap-3">
            {strictMode ? (
              <Lock className="h-5 w-5 text-emerald-400" />
            ) : (
              <Shield className="h-5 w-5 text-emerald-400" />
            )}
            <div>
              <p className="text-white font-bold text-lg leading-none">
                {strictMode ? 'Strict Mode Study Session' : 'Study Timer'}
              </p>
              {started && !done && (
                <p className="text-white/40 text-sm mt-0.5">{selectedMins} min session</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Strict mode locked badge */}
            {strictMode && started && !done && (
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <Lock className="h-3 w-3" /> Strict Mode · Exit locked until session ends
              </span>
            )}
            {/* Exit button — hidden in strict mode until done */}
            {(!strictMode || done) && (
              <button
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 hover:bg-white/15 text-white/60 hover:text-white text-sm font-medium transition-all border border-white/10"
              >
                <Minimize2 className="h-4 w-4" /> Exit Fullscreen <span className="text-white/30 text-xs ml-1">ESC</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab warning */}
        {tabWarning && (
          <div className="mx-auto max-w-lg bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-2.5 text-sm flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            You left the tab! Stay focused — tab switching invalidates strict mode sessions.
            <button onClick={() => setTabWarning(false)} className="ml-auto text-red-400 hover:text-red-200">✕</button>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          {/* Clock */}
          <GlowRing progress={progress} running={running} done={done} urgent={urgent} size={300} strokeWidth={14} darkInner={true}>
            {done ? (
              <div className="text-center">
                <div className="text-5xl mb-2">🎉</div>
                <p className="text-emerald-400 font-bold text-xl">Complete!</p>
                <p className="text-white/40 text-sm mt-1">+1 Focus Session</p>
              </div>
            ) : started ? (
              <div className="text-center">
                <p
                  className="font-black tabular-nums"
                  style={{ fontSize: 72, fontFamily: "'Outfit','Inter',sans-serif", color: urgent ? '#ef4444' : '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}
                >
                  {fmt(remaining)}
                </p>
                <p className="text-white/50 text-sm mt-2">{running ? 'Ready to Study?' : '⏸ Paused'}</p>
                {!started && (
                  <button
                    onClick={startSession}
                    className="mt-3 px-6 py-2 rounded-full font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', boxShadow: '0 0 24px rgba(34,197,94,0.4)' }}
                  >
                    Start Focus Session
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p
                  className="font-black tabular-nums"
                  style={{ fontSize: 72, fontFamily: "'Outfit','Inter',sans-serif", color: '#22c55e', letterSpacing: '-0.03em', lineHeight: 1 }}
                >
                  {fmt(selectedMins * 60)}
                </p>
                <p className="text-white/50 text-sm mt-2">Ready to Study?</p>
                <button
                  onClick={startSession}
                  className="mt-4 px-8 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', boxShadow: '0 0 28px rgba(34,197,94,0.45)' }}
                >
                  Start Focus Session
                </button>
              </div>
            )}
          </GlowRing>

          {/* Progress text */}
          {started && !done && (
            <p className="text-white/30 text-sm">
              {Math.round(progress)}% elapsed · {fmt(remaining)} remaining
            </p>
          )}

          {/* Strict mode panel */}
          <div
            className="w-full max-w-lg rounded-2xl border px-6 py-4 space-y-4"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: strictMode ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)' }}
          >
            {/* Strict toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span className="text-white font-semibold text-sm">
                  Strict Mode <span className={strictMode ? 'text-emerald-400' : 'text-white/40'}>{strictMode ? 'Enabled' : 'Off'}</span>
                </span>
              </div>
              <button
                onClick={() => !running && setStrictMode(s => !s)}
                className={`relative w-12 h-6 rounded-full transition-all ${strictMode ? 'bg-emerald-500' : 'bg-white/20'} ${running ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={running}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${strictMode ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Quick options */}
            <div className="flex flex-wrap items-center gap-2">
              {QUICK_OPTIONS.filter(m => m <= maxMins).map(m => (
                <button
                  key={m}
                  onClick={() => !running && pickDuration(m)}
                  disabled={running}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border disabled:opacity-40 disabled:cursor-not-allowed ${
                    selectedMins === m && !showCustom
                      ? 'text-[#0d1b2a] border-transparent'
                      : 'text-white/70 border-white/20 hover:border-white/40 hover:text-white bg-white/5'
                  }`}
                  style={selectedMins === m && !showCustom ? { background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 0 16px rgba(34,197,94,0.4)' } : {}}
                >
                  {m} min
                </button>
              ))}
              {/* Custom */}
              {showCustom ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={15} max={maxMins}
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyCustom()}
                    className="w-20 text-center text-sm bg-white/10 border border-emerald-500/40 text-white rounded-full px-2 py-1 focus:outline-none focus:border-emerald-500"
                    placeholder="min"
                    autoFocus
                  />
                  <span className="text-white/40 text-xs">Max {maxMins}</span>
                  <button onClick={applyCustom} className="text-emerald-400 text-xs font-bold hover:text-emerald-300">Apply</button>
                </div>
              ) : (
                <button
                  onClick={() => !running && setShowCustom(true)}
                  disabled={running}
                  className="px-4 py-1.5 rounded-full text-sm text-white/40 border border-white/10 hover:border-white/30 hover:text-white/70 transition-all bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Custom Duration: <span className="text-white/25 text-xs">Max {maxMins}</span>
                </button>
              )}
            </div>

            {/* Strict mode info */}
            {strictMode && (
              <div className="space-y-1.5">
                {['No app switching allowed', 'Exit is locked until session ends', 'Keep focus, no distractions'].map(t => (
                  <div key={t} className="flex items-center gap-2 text-[13px] text-emerald-400/80">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" /> {t}
                  </div>
                ))}
              </div>
            )}

            {/* Lock notice */}
            {strictMode && (
              <div className="flex items-center gap-2 text-[11px] text-white/35">
                <Flame className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                Your screen is locked · In strict mode, you cannot exit fullscreen or switch apps until your session is over.
              </div>
            )}

            {/* Pause warning count */}
            {strictMode && pauseWarnings > 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                You tried to pause {pauseWarnings} time{pauseWarnings > 1 ? 's' : ''}. Stay focused!
              </div>
            )}
          </div>

          {/* Action buttons */}
          {started && !done && (
            <div className="flex gap-4">
              {!strictMode && (
                <button
                  onClick={togglePause}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-base transition-all"
                  style={running
                    ? { background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }
                    : { background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', boxShadow: '0 0 24px rgba(34,197,94,0.4)' }}
                >
                  {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  {running ? 'Pause' : 'Resume'}
                </button>
              )}
              <button
                onClick={reset}
                disabled={strictMode && running}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-base transition-all bg-white/8 text-white/60 hover:bg-white/15 hover:text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <RotateCcw className="h-5 w-5" /> Reset
              </button>
            </div>
          )}
          {done && (
            <button
              onClick={reset}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-base transition-all"
              style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', boxShadow: '0 0 24px rgba(34,197,94,0.4)' }}
            >
              <RotateCcw className="h-5 w-5" /> New Session
            </button>
          )}
        </div>

        {/* Bottom progress bar */}
        <div className="h-[3px] w-full bg-white/5">
          <div
            className="h-full transition-all duration-1000"
            style={{ width: `${progress}%`, background: done ? '#10b981' : urgent ? '#ef4444' : '#22c55e', boxShadow: `0 0 8px ${done ? '#10b981' : '#22c55e'}` }}
          />
        </div>
      </div>
    );
  }

  // ── INLINE (card) MODE ─────────────────────────────────────────────────────
  return (
    <div
      className="relative flex flex-col h-full rounded-2xl overflow-hidden p-4 bg-white border border-slate-200"
      style={{ minHeight: 320 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 2px 10px rgba(16,185,129,0.35)' }}>
            {strictMode ? <Lock className="h-4 w-4 text-white" /> : <Shield className="h-4 w-4 text-white" />}
          </div>
          <div>
            <h3 className="font-bold text-[13px] text-slate-800 leading-none">Study Timer</h3>
            <p className="text-[9px] mt-0.5 font-semibold">
              {running ? <span style={{ color: '#10b981' }} className="animate-pulse">● Session running</span>
               : done ? <span style={{ color: '#10b981' }}>✓ Session complete!</span>
               : <span className="text-slate-400">{tierLabel} · Max {maxMins} min</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Total study hours — only from fully completed sessions */}
          {totalStudyMins > 0 && (
            <div className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full border" style={{ color: '#10b981', background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
              <span>⏱</span>
              {totalStudyMins >= 60
                ? `${Math.floor(totalStudyMins / 60)}h${totalStudyMins % 60 > 0 ? ` ${totalStudyMins % 60}m` : ''}`
                : `${totalStudyMins}m`}
              <span className="text-slate-400 font-normal">studied</span>
            </div>
          )}
          {/* Strict mode mini toggle */}
          <button
            onClick={() => !running && setStrictMode(s => !s)}
            disabled={running}
            title={strictMode ? 'Strict Mode ON' : 'Enable Strict Mode'}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold transition-all border ${
              strictMode
                ? 'bg-emerald-500/20 text-emerald-600 border-emerald-300'
                : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Lock className="h-2.5 w-2.5" /> {strictMode ? 'Strict' : 'Normal'}
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-500 hover:text-emerald-600 transition-all"
            title="Open fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Duration selector */}
      {!started && (
        <div className="mb-4">
          {/* Recommended */}
          <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-2">
            🔥 Recommended · {recommended} min
          </p>
          {/* Quick options */}
          <div className="flex gap-1.5 flex-wrap mb-2">
            {QUICK_OPTIONS.filter(m => m <= maxMins).map(m => (
              <button
                key={m}
                onClick={() => pickDuration(m)}
                className={`flex-1 min-w-[52px] py-2 rounded-xl text-[11px] font-bold transition-all border ${
                  selectedMins === m && !showCustom
                    ? 'text-[#0a0f1e] border-transparent'
                    : 'text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-600 bg-white'
                }`}
                style={selectedMins === m && !showCustom
                  ? { background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 0 14px rgba(34,197,94,0.35)' }
                  : {}}
              >
                {m} min
              </button>
            ))}
          </div>
          {/* Custom */}
          {showCustom ? (
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-emerald-200">
              <span className="text-[10px] text-slate-400">Custom:</span>
              <input
                type="number" min={15} max={180}
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyCustom()}
                className="flex-1 bg-transparent text-slate-800 text-sm font-bold focus:outline-none"
                placeholder="min"
                autoFocus
              />
              <span className="text-[9px] text-slate-400">Max 180</span>
              <button onClick={applyCustom} className="text-emerald-600 text-[10px] font-bold hover:text-emerald-500">OK</button>
              <button onClick={() => setShowCustom(false)} className="text-slate-300 text-[10px] hover:text-slate-500">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustom(true)}
              className="w-full py-1.5 rounded-xl text-[10px] text-slate-400 border border-slate-200 hover:border-slate-300 hover:text-slate-600 transition-all bg-slate-50"
            >
              Custom Duration — Max 180 min
            </button>
          )}
        </div>
      )}

      {/* Clock */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <GlowRing progress={progress} running={running} done={done} urgent={urgent} size={160} strokeWidth={10} darkInner={false}>
          {done ? (
            <div className="text-center">
              <div className="text-2xl">🎉</div>
              <p className="text-emerald-400 font-bold text-[11px] mt-1">Done!</p>
            </div>
          ) : (
            <div className="text-center">
              <p
                className="font-black tabular-nums leading-none"
                style={{ fontSize: 30, fontFamily: "'Outfit','Inter',sans-serif", color: urgent ? '#ef4444' : '#1e293b', letterSpacing: '-0.02em' }}
              >
                {fmt(started ? remaining : selectedMins * 60)}
              </p>
              <p className="text-[9px] mt-1 font-medium" style={{ color: running ? '#16a34a' : '#94a3b8' }}>
                {running ? 'running' : started ? '❚❚ paused' : 'Ready to Study?'}
              </p>
            </div>
          )}
        </GlowRing>

        {/* Focus sessions streak */}
        {focusSessions > 0 && (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
            <Flame className="h-3 w-3 text-orange-400" />
            <span className="text-[10px] text-emerald-700 font-bold">{focusSessions} focus session{focusSessions > 1 ? 's' : ''} today</span>
          </div>
        )}
      </div>

      {/* CTA / Controls */}
      <div className="mt-3 space-y-2">
        {!started ? (
          <button
            onClick={startSession}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 text-white"
            style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 2px 16px rgba(16,185,129,0.35)' }}
          >
            <Play className="h-4 w-4 inline mr-2" />
            Start Focus Session
          </button>
        ) : done ? (
          <button
            onClick={reset}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all text-white"
            style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 2px 16px rgba(16,185,129,0.35)' }}
          >
            <RotateCcw className="h-4 w-4 inline mr-2" /> New Session
          </button>
        ) : (
          <div className="flex gap-2">
            {!strictMode && (
              <button
                onClick={togglePause}
                className="flex-1 py-2.5 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 transition-all"
                style={running
                  ? { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1.5px solid rgba(16,185,129,0.35)' }
                  : { background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', boxShadow: '0 2px 14px rgba(16,185,129,0.35)' }}
              >
                {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {running ? 'Pause' : 'Resume'}
              </button>
            )}
            {strictMode && running && (
              <div className="flex-1 py-2.5 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1.5" style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.06)' }}>
                <Lock className="h-3.5 w-3.5" /> Strict Lock Active
              </div>
            )}
            <button
              onClick={reset}
              disabled={strictMode && running}
              className="flex-1 py-2.5 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 transition-all border border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        )}

        {/* Strict mode pause warning */}
        {strictMode && pauseWarnings > 0 && (
          <p className="text-[9px] text-amber-400 text-center flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3" /> {pauseWarnings} pause attempt{pauseWarnings > 1 ? 's' : ''} — stay focused!
          </p>
        )}
      </div>
    </div>
  );
};
