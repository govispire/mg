/**
 * StudyTimerWidget.tsx
 *
 * PRODUCT RULES:
 *  ✅ Dashboard card = static entry-point ONLY (no live countdown)
 *  ✅ Fullscreen timer = reads/writes useTimerStore
 *  ✅ Exit fullscreen = stops session (no floating widget fallback)
 *  ✅ Only one mode active at a time (mutex in useTimerStore)
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw, Maximize2, Play, Pause, Lock, Unlock, Shield,
  Flame, CheckCircle, AlertTriangle, Monitor, LayoutTemplate, X,
} from 'lucide-react';
import { useTimerStore } from '@/store/useTimerStore';
import { MOTIVATION_QUOTES, shuffleQuotes } from '@/data/motivationQuotes';

// ── Smart session logic ───────────────────────────────────────────────────────
const getUserTier = (): 'beginner' | 'regular' | 'advanced' => {
  try {
    const sessions = JSON.parse(localStorage.getItem('studyTimerSessions') || '[]');
    if (sessions.length >= 20) return 'advanced';
    if (sessions.length >= 7)  return 'regular';
    return 'beginner';
  } catch { return 'beginner'; }
};

const getRecommended = (tier: 'beginner' | 'regular' | 'advanced') => {
  if (tier === 'advanced') return 60;
  if (tier === 'regular')  return 45;
  return 25;
};

const QUICK_OPTIONS = [25, 30, 45, 60]; // minutes
const MAX_MINS      = 180;

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (secs: number) => {
  const m = Math.floor(Math.max(0, secs) / 60);
  const s = Math.max(0, secs) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const getLastSessionMins = (): number | null => {
  try {
    const sessions = JSON.parse(localStorage.getItem('studyTimerSessions') || '[]');
    if (sessions.length === 0) return null;
    return sessions[sessions.length - 1].mins;
  } catch { return null; }
};

const getStreakDays = (): number => {
  try {
    const sessions: { date: string }[] = JSON.parse(localStorage.getItem('studyTimerSessions') || '[]');
    if (sessions.length === 0) return 0;
    const days = new Set(sessions.map(s => s.date.slice(0, 10)));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (days.has(d.toISOString().slice(0, 10))) streak++;
      else if (i > 0) break;
    }
    return streak;
  } catch { return 0; }
};

// ── Glowing circular ring SVG ─────────────────────────────────────────────────
const GlowRing: React.FC<{
  progress:    number;
  running:     boolean;
  done:        boolean;
  urgent:      boolean;
  size:        number;
  strokeWidth?: number;
  children:    React.ReactNode;
}> = ({ progress, running, done, urgent, size, strokeWidth = 10, children }) => {
  const R    = (size - strokeWidth * 2) / 2;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - progress / 100);
  const color     = done ? '#10b981' : urgent ? '#ef4444' : '#22c55e';
  const glowColor = done ? 'rgba(16,185,129,0.35)' : urgent ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.3)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
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
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size/2} cy={size/2} r={R + strokeWidth/2 + 2} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
        <circle cx={size/2} cy={size/2} r={R - strokeWidth/2} fill="rgba(15,20,40,0.75)" />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth + 2} />
        <circle
          cx={size/2} cy={size/2} r={R}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={CIRC} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease', filter: `drop-shadow(0 0 8px ${color})` }}
        />
        {(running || progress > 0) && (
          <circle
            cx={size/2 + R * Math.cos((progress/100)*2*Math.PI - Math.PI/2)}
            cy={size/2 + R * Math.sin((progress/100)*2*Math.PI - Math.PI/2)}
            r={strokeWidth/2 + 1} fill={color}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">{children}</div>
    </div>
  );
};

// ── Motivational Quotes ───────────────────────────────────────────────────────
const QUOTE_INTERVAL_MS = 2 * 60 * 1000;

const MotivationalQuote: React.FC<{ running: boolean }> = ({ running }) => {
  const shuffled = useRef(shuffleQuotes(MOTIVATION_QUOTES));
  const [idx, setIdx]       = useState(0);
  const [visible, setVisible] = useState(true);
  const prevRunning = useRef(false);

  useEffect(() => {
    if (running && !prevRunning.current) {
      shuffled.current = shuffleQuotes(MOTIVATION_QUOTES);
      setIdx(0); setVisible(true);
    }
    prevRunning.current = running;
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % shuffled.current.length); setVisible(true); }, 700);
    }, QUOTE_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [running]);

  const q = shuffled.current[idx];
  return (
    <div
      className="w-full max-w-xl text-center transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)' }}
    >
      <p className="font-bold leading-snug"
        style={{ fontSize: 'clamp(1.15rem,2.6vw,1.7rem)', color: 'rgba(255,255,255,0.9)',
                 fontFamily: "'Outfit','Georgia',serif", letterSpacing: '-0.015em' }}>
        "{q.text}"
      </p>
      {q.author && <p className="text-sm text-emerald-400/70 mt-3 font-medium">— {q.author}</p>}
    </div>
  );
};

// ── Exit Confirmation Modal ───────────────────────────────────────────────────
const ExitConfirmModal: React.FC<{ onContinue: () => void; onEnd: () => void }> = ({ onContinue, onEnd }) => (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
    <div
      className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
      style={{ background: 'rgba(13,27,42,0.97)', border: '1px solid rgba(255,255,255,0.12)',
               boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}
    >
      <div className="px-6 pt-6 pb-4 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h3 className="text-white font-bold text-lg">Exit Study Session?</h3>
        <p className="text-white/50 text-sm mt-2">
          Your progress will be saved but the session will end.<br />
          You can start a new session anytime.
        </p>
      </div>
      <div className="px-6 pb-6 flex flex-col gap-3">
        <button
          onClick={onContinue}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff',
                   boxShadow: '0 4px 20px rgba(34,197,94,0.4)' }}
        >
          ✅ Continue Studying
        </button>
        <button
          onClick={onEnd}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all bg-white/8 hover:bg-white/15 text-white/70 hover:text-white border border-white/10"
        >
          End Session
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export const StudyTimerWidget: React.FC = () => {
  const tier        = getUserTier();
  const recommended = getRecommended(tier);

  // ── Local UI state (not part of the timer logic) ──────────────────────────
  const [selectedMins, setSelectedMins] = useState<number>(recommended);
  const [strictMode,   setStrictMode]   = useState(false);
  const [customInput,  setCustomInput]  = useState('');
  const [showCustom,   setShowCustom]   = useState(false);
  const [showPicker,   setShowPicker]   = useState(false);

  // ── Reactive stats (refresh when a session is saved) ─────────────────────
  const [lastSession,    setLastSession]    = useState<number | null>(() => getLastSessionMins());
  const [streak,         setStreak]         = useState<number>(() => getStreakDays());
  const [sessionCount,   setSessionCount]   = useState<number>(() => {
    try {
      return JSON.parse(localStorage.getItem('studyTimerSessions') || '[]').length;
    } catch { return 0; }
  });

  useEffect(() => {
    const refresh = () => {
      setLastSession(getLastSessionMins());
      setStreak(getStreakDays());
      try {
        setSessionCount(JSON.parse(localStorage.getItem('studyTimerSessions') || '[]').length);
      } catch {}
    };
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  // ── Global timer store ────────────────────────────────────────────────────
  const {
    active, mode, running, done, invalidated, remaining,
    selectedMins: storeMins, strictMode: storeStrict,
    showExitConfirm, tabAwayWarning, tabAwaySecsLeft, tabAwayPhase,
    pauseWarnings, focusSessions, totalStudyMins,
    startTimer, pauseResume, resetTimer,
    requestExitFullscreen, confirmExitFullscreen, cancelExitFullscreen,
    tick, onTabHidden, onTabVisible,
  } = useTimerStore();

  const isFullscreen = active && mode === 'fullscreen';
  const totalSecs    = storeMins * 60;
  const progress     = (totalSecs > 0 && isFullscreen)
    ? ((totalSecs - remaining) / totalSecs) * 100
    : 0;
  const urgent = remaining < 60 && running && isFullscreen;

  // ── Global tick (single interval for ALL modes) ───────────────────────────
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (!active || !running) return;
    tickRef.current = setInterval(() => tick(), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [active, running, tick]);

  // ── Tab-away events (strict mode) ─────────────────────────────────────────
  useEffect(() => {
    if (!active || !storeStrict) return;
    const h = () => document.hidden ? onTabHidden() : onTabVisible();
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, [active, storeStrict, onTabHidden, onTabVisible]);

  // ── ESC key shortcut (non-strict only) ────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen && !storeStrict) requestExitFullscreen();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isFullscreen, storeStrict, requestExitFullscreen]);

  // ── Duration picker helpers ───────────────────────────────────────────────
  const pickDuration = (mins: number) => {
    const clamped = Math.max(15, Math.min(MAX_MINS, mins));
    setSelectedMins(clamped);
  };

  const applyCustom = () => {
    const val = parseInt(customInput, 10);
    if (!isNaN(val)) pickDuration(val);
    setShowCustom(false);
    setCustomInput('');
  };

  // ── Start handlers ────────────────────────────────────────────────────────
  const startFullscreen = () => {
    setShowPicker(false);
    startTimer(selectedMins, 'fullscreen', strictMode);
  };

  const startWidget = () => {
    setShowPicker(false);
    startTimer(selectedMins, 'widget', strictMode);
  };

  // ── FULLSCREEN VIEW ───────────────────────────────────────────────────────
  if (isFullscreen) {
    return (
      <>
        <div
          className="fixed inset-0 z-[9999] flex flex-col overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1b2a 50%, #0a1628 100%)' }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-8 pt-6 pb-4">
            <div className="flex items-center gap-3">
              {storeStrict
                ? <Lock className="h-5 w-5 text-emerald-400" />
                : <Shield className="h-5 w-5 text-emerald-400" />}
              <div>
                <p className="text-white font-bold text-lg leading-none">
                  {storeStrict ? 'Strict Mode Study Session' : 'Study Timer'}
                </p>
                {running && !done && (
                  <p className="text-white/40 text-sm mt-0.5">{storeMins} min session</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Strict mode locked badge */}
              {storeStrict && running && !done && !invalidated && (
                <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                  style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                  <Lock className="h-3 w-3" /> Strict Mode · Exit locked until session ends
                </span>
              )}
              {/* Exit button — hidden in strict mode while running */}
              {(!storeStrict || done || invalidated) && (
                <button
                  onClick={requestExitFullscreen}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 hover:bg-white/15 text-white/60 hover:text-white text-sm font-medium transition-all border border-white/10"
                >
                  <X className="h-4 w-4" /> Exit Fullscreen <span className="text-white/30 text-xs ml-1">ESC</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab-away warning */}
          {tabAwayWarning && tabAwaySecsLeft !== null && (
            <div
              className="mx-auto max-w-lg rounded-xl px-4 py-3 text-sm flex items-center gap-3 mb-2 animate-pulse"
              style={{
                background: tabAwayPhase === 'critical' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.2)',
                border: `1px solid ${tabAwayPhase === 'critical' ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.4)'}`,
              }}
            >
              <AlertTriangle className="h-5 w-5 shrink-0" style={{ color: tabAwayPhase === 'critical' ? '#f87171' : '#fbbf24' }} />
              <div className="flex-1">
                <p className="font-bold" style={{ color: tabAwayPhase === 'critical' ? '#fca5a5' : '#fde68a' }}>
                  {tabAwayPhase === 'critical' ? '🚨 Return NOW — session closing soon!' : '⚠ You left the study tab!'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: tabAwayPhase === 'critical' ? 'rgba(252,165,165,0.8)' : 'rgba(253,230,138,0.7)' }}>
                  Session invalidates in{' '}
                  <span className="font-black" style={{ color: tabAwayPhase === 'critical' ? '#f87171' : '#fde68a' }}>
                    {fmt(tabAwaySecsLeft)}
                  </span>
                  {' '}· Return to this tab to cancel
                </p>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            {/* Clock */}
            <GlowRing progress={progress} running={running} done={done} urgent={urgent} size={300} strokeWidth={14}>
              {invalidated ? (
                <div className="text-center">
                  <div className="text-5xl mb-2">⛔</div>
                  <p className="font-bold text-lg" style={{ color: '#f87171' }}>Session Invalid</p>
                  <p className="text-white/40 text-xs mt-1">Away &gt; 5 min</p>
                </div>
              ) : done ? (
                <div className="text-center">
                  <div className="text-5xl mb-2">🎉</div>
                  <p className="text-emerald-400 font-bold text-xl">Complete!</p>
                  <p className="text-white/40 text-sm mt-1">+{storeMins} min logged</p>
                </div>
              ) : (
                <div className="text-center">
                  <p
                    className="font-black tabular-nums"
                    style={{ fontSize: 96, fontFamily: "'Outfit','Inter',sans-serif",
                             color: urgent ? '#ef4444' : '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}
                  >
                    {fmt(remaining)}
                  </p>
                  <p className="text-white/50 text-sm mt-2">{running ? '● Studying' : '⏸ Paused'}</p>
                </div>
              )}
            </GlowRing>

            {/* Progress text */}
            {running && !done && (
              <p className="text-white/30 text-sm">
                {Math.round(progress)}% elapsed · {fmt(remaining)} remaining
              </p>
            )}

            {/* Strict mode panel */}
            <div
              className="w-full max-w-lg rounded-2xl border px-6 py-4 space-y-4"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: storeStrict ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  <span className="text-white font-semibold text-sm">
                    Strict Mode <span className={storeStrict ? 'text-emerald-400' : 'text-white/40'}>{storeStrict ? 'Enabled' : 'Off'}</span>
                  </span>
                </div>
                <button
                  onClick={() => !running && useTimerStore.setState(s => ({ strictMode: !s.strictMode }))}
                  className={`relative w-12 h-6 rounded-full transition-all ${storeStrict ? 'bg-emerald-500' : 'bg-white/20'} ${running ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={running}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${storeStrict ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {storeStrict && !running && (
                <div className="space-y-1.5">
                  {['No app switching allowed', 'Exit is locked until session ends'].map(t => (
                    <div key={t} className="flex items-center gap-2 text-[13px] text-emerald-400/80">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0" /> {t}
                    </div>
                  ))}
                </div>
              )}

              {storeStrict && pauseWarnings > 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  You tried to pause {pauseWarnings} time{pauseWarnings > 1 ? 's' : ''}. Stay focused!
                </div>
              )}
            </div>

            {/* Motivational quote */}
            {running && !done && <MotivationalQuote running={running} />}

            {/* Strict mode info (while running) */}
            {running && !done && storeStrict && (
              <div
                className="w-full max-w-sm rounded-2xl px-5 py-4"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.22)', backdropFilter: 'blur(8px)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Strict Mode <span className="text-emerald-400">Enabled</span></span>
                </div>
                <div className="flex flex-col gap-2">
                  {['No app switching allowed', 'Exit is locked until session ends'].map(t => (
                    <div key={t} className="flex items-center gap-2 text-[13px] text-emerald-300/90">
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" /> {t}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            {running && !done && !invalidated && (
              <div className="flex gap-4">
                {storeStrict && running ? (
                  <div className="text-center px-4 py-3 rounded-2xl" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <p className="text-emerald-400 font-bold text-sm">🔥 Stay locked in. You're doing great!</p>
                    <p className="text-white/30 text-xs mt-1">Reset & exit are disabled in Strict Mode until session ends.</p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={pauseResume}
                      className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-base transition-all"
                      style={running
                        ? { background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }
                        : { background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', boxShadow: '0 0 24px rgba(34,197,94,0.4)' }}
                    >
                      {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      {running ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={resetTimer}
                      className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-base transition-all bg-white/8 text-white/60 hover:bg-white/15 hover:text-white border border-white/10"
                    >
                      <RotateCcw className="h-5 w-5" /> Reset
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Session outcome cards */}
            {invalidated && (
              <div className="w-full max-w-sm rounded-2xl px-6 py-5 text-center"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <p className="text-2xl mb-2">❌</p>
                <p className="font-bold text-red-400 text-base">Session Not Counted</p>
                <p className="text-white/40 text-xs mt-1.5">You were away for more than 5 minutes in Strict Mode.</p>
                <button onClick={resetTimer}
                  className="mt-4 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  Try Again
                </button>
              </div>
            )}
            {done && (
              <div className="w-full max-w-sm rounded-2xl px-6 py-5 text-center"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <p className="text-2xl mb-2">✅</p>
                <p className="font-bold text-emerald-400 text-base">+{storeMins} min added</p>
                <p className="text-white/40 text-xs mt-1.5">Valid session · 🔥 Keep the streak going!</p>
                <button onClick={resetTimer}
                  className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white mx-auto transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 0 20px rgba(34,197,94,0.4)' }}>
                  <RotateCcw className="h-4 w-4" /> New Session
                </button>
                <button onClick={requestExitFullscreen}
                  className="mt-2 w-full py-2 rounded-xl font-medium text-sm text-white/40 hover:text-white/70 transition-all">
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>

          {/* Bottom progress bar */}
          <div className="h-[3px] w-full bg-white/5">
            <div
              className="h-full transition-all duration-1000"
              style={{ width: `${progress}%`, background: done ? '#10b981' : urgent ? '#ef4444' : '#22c55e',
                       boxShadow: `0 0 8px ${done ? '#10b981' : '#22c55e'}` }}
            />
          </div>
        </div>

        {/* Exit confirmation modal */}
        {showExitConfirm && (
          <ExitConfirmModal
            onContinue={cancelExitFullscreen}
            onEnd={confirmExitFullscreen}
          />
        )}
      </>
    );
  }

  // ── DASHBOARD CARD (static entry-point, NO live timer) ────────────────────
  // lastSession, streak, sessionCount are reactive state updated via storage events

  return (
    <>
      <div
        className="relative flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        style={{ minHeight: 340 }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          {/* Left: icon + title */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 2px 10px rgba(16,185,129,0.35)' }}
            >
              <Shield className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h3 className="font-bold text-[14px] text-slate-900 leading-none">Study Timer</h3>
              <p className="text-[10px] mt-0.5 font-medium text-slate-400">Focused study sessions</p>
            </div>
          </div>

          {/* Right: Normal / Strict segmented toggle */}
          <div
            className="flex items-center rounded-lg overflow-hidden border border-slate-200"
            style={{ fontSize: 11 }}
          >
            <button
              onClick={() => setStrictMode(false)}
              className="flex items-center gap-1 px-3 py-1.5 font-semibold transition-all"
              style={!strictMode
                ? { background: '#f1f5f9', color: '#0f172a' }
                : { background: 'transparent', color: '#94a3b8' }}
            >
              <Unlock className="h-3 w-3" /> Normal
            </button>
            <div className="w-px self-stretch bg-slate-200" />
            <button
              onClick={() => setStrictMode(true)}
              className="flex items-center gap-1 px-3 py-1.5 font-semibold transition-all"
              style={strictMode
                ? { background: 'linear-gradient(135deg,#064e3b,#059669)', color: '#fff' }
                : { background: 'transparent', color: '#94a3b8' }}
            >
              <Lock className="h-3 w-3" /> Strict
            </button>
          </div>
        </div>

        {/* ── Clock display in bordered rounded box ───────────────────────── */}
        <div className="mx-4 mb-3 rounded-2xl border border-slate-200 bg-slate-50/70 py-4 px-3">
          <div className="flex items-end justify-center gap-0">

            {/* Hours */}
            <div className="flex flex-col items-center">
              <span
                className="font-black tabular-nums leading-none"
                style={{ fontSize: 'clamp(36px, 10vw, 68px)', fontFamily: "'Outfit','Inter',sans-serif", color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1 }}
              >
                {String(Math.floor(selectedMins / 60)).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">HR</span>
            </div>

            {/* Colon */}
            <span
              className="font-black text-slate-300 mx-1"
              style={{ fontSize: 'clamp(28px, 8vw, 52px)', lineHeight: 1, marginBottom: 18, fontFamily: "'Outfit','Inter',sans-serif" }}
            >:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <span
                className="font-black tabular-nums leading-none"
                style={{ fontSize: 'clamp(36px, 10vw, 68px)', fontFamily: "'Outfit','Inter',sans-serif", color: '#059669', letterSpacing: '-0.04em', lineHeight: 1 }}
              >
                {String(selectedMins % 60).padStart(2, '0')}
              </span>
              {/* MIN label with green pill */}
              <span
                className="text-[10px] font-bold uppercase tracking-widest mt-1.5 px-2 py-0.5 rounded-full"
                style={{ color: '#059669', background: 'rgba(5,150,105,0.1)' }}
              >MIN</span>
            </div>

            {/* Colon */}
            <span
              className="font-black text-slate-300 mx-1"
              style={{ fontSize: 'clamp(28px, 8vw, 52px)', lineHeight: 1, marginBottom: 18, fontFamily: "'Outfit','Inter',sans-serif" }}
            >:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <span
                className="font-black tabular-nums leading-none"
                style={{ fontSize: 'clamp(36px, 10vw, 68px)', fontFamily: "'Outfit','Inter',sans-serif", color: '#cbd5e1', letterSpacing: '-0.04em', lineHeight: 1 }}
              >00</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">SEC</span>
            </div>

          </div>
        </div>

        {/* ── Stats row (Last / Streak / Sessions) — compact ─────────────── */}
        <div className="mx-4 mb-3 rounded-xl border border-slate-200 overflow-hidden bg-white">
          <div className="flex divide-x divide-slate-200">
            {/* Last */}
            <div className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5">
              <span style={{ fontSize: 14 }}>⏱</span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">LAST</span>
              <span className="text-[12px] font-black text-slate-800">{lastSession ? `${lastSession}m` : '—'}</span>
            </div>
            {/* Streak */}
            <div className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5">
              <span style={{ fontSize: 14 }}>🔥</span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">STREAK</span>
              <span className="text-[12px] font-black text-slate-800">{streak > 0 ? `${streak}d` : '—'}</span>
            </div>
            {/* Sessions */}
            <div className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5">
              <span style={{ fontSize: 14 }}>🎯</span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">SESSIONS</span>
              <span className="text-[12px] font-black text-slate-800">{sessionCount || 0}</span>
            </div>
          </div>
        </div>

        {/* ── Duration selector ─────────────────────────────────────────────── */}
        <div className="px-4 pb-2">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
            🔥 <span>DURATION</span>
            <span className="text-slate-300 font-normal normal-case tracking-normal">— {recommended} min recommended</span>
          </p>

          {/* Quick pick pills */}
          <div className="flex flex-wrap gap-2 mb-2">
            {QUICK_OPTIONS.map(m => (
              <button
                key={m}
                onClick={() => pickDuration(m)}
                className="flex-1 min-w-[60px] py-2 rounded-full text-[12px] font-semibold transition-all border"
                style={selectedMins === m && !showCustom
                  ? { background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'transparent', boxShadow: '0 2px 8px rgba(34,197,94,0.35)' }
                  : { background: '#fff', color: '#64748b', border: '1.5px solid #e2e8f0' }}
              >
                {m} min
              </button>
            ))}
          </div>

          {/* Custom duration */}
          {showCustom ? (
            <div className="flex items-center gap-2 bg-slate-50 rounded-full px-4 py-2 border border-emerald-200">
              <span className="text-[10px] text-slate-400">Custom:</span>
              <input
                type="number" min={15} max={MAX_MINS}
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyCustom()}
                className="flex-1 bg-transparent text-slate-800 text-sm font-bold focus:outline-none"
                placeholder="enter minutes"
                autoFocus
              />
              <span className="text-[9px] text-slate-400 shrink-0">Max {MAX_MINS}</span>
              <button onClick={applyCustom}
                className="px-3 py-1 rounded-full text-white text-[11px] font-black shrink-0 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
                OK
              </button>
              <button onClick={() => setShowCustom(false)} className="text-slate-300 hover:text-slate-500 transition-colors shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustom(true)}
              className="w-full py-2 rounded-full text-[11px] text-slate-400 border border-slate-200 hover:border-slate-300 hover:text-slate-600 transition-all bg-slate-50 text-center"
            >
              Custom Duration — Max {MAX_MINS} min
            </button>
          )}
        </div>

        {/* ── CTA buttons ──────────────────────────────────────────────────── */}
        <div className="px-4 pb-4 mt-auto flex flex-row gap-2.5 pt-2">
          <button
            onClick={() => { setShowPicker(false); startFullscreen(); }}
            className="flex-1 py-3 rounded-2xl font-bold text-[13px] transition-all hover:opacity-95 active:scale-95 text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 4px 16px rgba(34,197,94,0.35)' }}
          >
            <Monitor style={{ width: 16, height: 16 }} /> Start Fullscreen
          </button>
          <button
            onClick={startWidget}
            className="flex-1 py-3 rounded-2xl font-bold text-[13px] transition-all hover:bg-slate-100 active:scale-95 flex items-center justify-center gap-2 border border-slate-200"
            style={{ background: '#f8fafc', color: '#2563eb' }}
          >
            <LayoutTemplate style={{ width: 16, height: 16 }} /> Start Mini Timer
          </button>
        </div>

        {/* Strict mode info strip */}
        {strictMode && (
          <div className="mx-4 mb-4 rounded-xl px-3 py-2 flex items-center gap-2"
            style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.2)' }}>
            <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
            <p className="text-[10px] text-emerald-700 font-semibold">
              Strict mode: exit locked · tab-switch tracked · no pausing
            </p>
          </div>
        )}
      </div>

      {/* Mode picker modal (kept for safety) */}
      {showPicker && (
        <div className="fixed inset-0 z-[9997] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm mx-4 overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Choose Study Mode</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedMins} min session · {strictMode ? '🔒 Strict mode on' : 'Normal mode'}
              </p>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <button onClick={startFullscreen}
                className="group w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                  <Monitor className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm">Fullscreen Mode</p>
                  <p className="text-xs text-slate-500 mt-0.5">Distraction-free focus. Covers entire screen.</p>
                  {strictMode && <p className="text-[10px] text-emerald-600 font-semibold mt-1">🔒 Exit locked until completion</p>}
                </div>
              </button>
              <button onClick={startWidget}
                className="group w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)' }}>
                  <LayoutTemplate className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm">Pop Widget Mode</p>
                  <p className="text-xs text-slate-500 mt-0.5">Timer stays visible while you browse.</p>
                </div>
              </button>
            </div>
            <div className="px-4 pb-4">
              <button onClick={() => setShowPicker(false)}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

