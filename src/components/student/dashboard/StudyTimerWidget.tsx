import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Maximize2, Minimize2, Play, Pause, Lock, Unlock, Shield, Flame, CheckCircle, AlertTriangle, Monitor, LayoutTemplate } from 'lucide-react';
import { useFloatingTimer } from '@/context/FloatingTimerContext';
import { MOTIVATION_QUOTES, shuffleQuotes } from '@/data/motivationQuotes';
import { timerBus } from '@/store/timerBus';

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

// ── Motivational Quotes ───────────────────────────────────────────────────────
const QUOTE_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

const MotivationalQuote: React.FC<{ running: boolean }> = ({ running }) => {
  const shuffled = useRef(shuffleQuotes(MOTIVATION_QUOTES));
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  // Re-shuffle every time a NEW session starts (running flips false→true)
  const prevRunning = useRef(false);
  useEffect(() => {
    if (running && !prevRunning.current) {
      shuffled.current = shuffleQuotes(MOTIVATION_QUOTES);
      setIdx(0);
      setVisible(true);
    }
    prevRunning.current = running;
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % shuffled.current.length);
        setVisible(true);
      }, 700);
    }, QUOTE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [running]);

  const q = shuffled.current[idx];
  return (
    <div
      className="w-full max-w-xl text-center transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)' }}
    >
      <p
        className="font-bold leading-snug"
        style={{
          fontSize: 'clamp(1.15rem, 2.6vw, 1.7rem)',
          color: 'rgba(255,255,255,0.9)',
          fontFamily: "'Outfit','Georgia',serif",
          letterSpacing: '-0.015em',
        }}
      >
        "{q.text}"
      </p>
      {q.author && (
        <p className="text-sm text-emerald-400/70 mt-3 font-medium">— {q.author}</p>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const StudyTimerWidget: React.FC = () => {
  const tier = getUserTier();
  const maxMins = getMaxMinutes(tier);
  const recommended = getRecommended(tier);
  const floatingTimer = useFloatingTimer();

  const [selectedMins, setSelectedMins] = useState<number>(recommended);
  const [customInput, setCustomInput] = useState<string>('');
  const [showCustom, setShowCustom] = useState(false);
  const [remaining, setRemaining] = useState<number>(recommended * 60);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [tabInvalidated, setTabInvalidated] = useState(false); // session ended due to away violation
  const [strictMode, setStrictMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showModePicker, setShowModePicker] = useState(false);
  const [pauseWarnings, setPauseWarnings] = useState(0);
  const [tabWarning, setTabWarning] = useState(false);
  const [tabAwayPhase, setTabAwayPhase] = useState<'warn' | 'critical' | null>(null); // warn=3-5min, critical=<1min left
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

  // ── Open mode picker ───────────────────────────────────────────────────────
  const openModePicker = () => setShowModePicker(true);

  // ── Start fullscreen session ───────────────────────────────────────────────
  const startSession = () => {
    setShowModePicker(false);
    setStarted(true);
    setRunning(true);
    setDone(false);
    setPauseWarnings(0);
  };

  // ── Start widget session ───────────────────────────────────────────────────
  const startWidgetSession = () => {
    setShowModePicker(false);
    // Fire the event bus — FloatingTimerWidget listens at the module level,
    // completely bypassing React context and rendering order.
    timerBus.startWidget({ mins: selectedMins, strict: strictMode });
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
    setTabInvalidated(false);
    setTabWarning(false);
    setTabAwayPhase(null);
    setRemaining(selectedMins * 60);
    setPauseWarnings(0);
  };

  // ── Monthly aggregation helper ─────────────────────────────────────────────
  const recordValidSession = useCallback((mins: number) => {
    try {
      const key = `study_monthly_${new Date().toISOString().slice(0, 7)}`;
      const cur = JSON.parse(localStorage.getItem(key) || '{"mins":0,"sessions":0}');
      localStorage.setItem(key, JSON.stringify({ mins: cur.mins + mins, sessions: cur.sessions + 1 }));
    } catch {}
  }, []);

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
          // Only count fully completed (valid) sessions
          const s = focusSessions + 1;
          setFocusSessions(s);
          localStorage.setItem('focus_sessions', String(s));
          const newMins = totalStudyMins + selectedMins;
          setTotalStudyMins(newMins);
          localStorage.setItem('total_study_mins', String(newMins));
          recordValidSession(selectedMins);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, selectedMins, focusSessions, recordValidSession]);

  // ── Strict mode: tab-away logic (warn @ 3 min, invalidate @ 5 min) ─────────
  //   Normal mode: no tab tracking at all
  const tabHiddenAt = useRef<number | null>(null);
  const tabCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [tabAwaySecsLeft, setTabAwaySecsLeft] = useState<number | null>(null);

  const AWAY_WARN_SECS  = 3 * 60; // show warning after 3 min away
  const AWAY_LIMIT_SECS = 5 * 60; // invalidate after 5 min away

  useEffect(() => {
    if (!strictMode || !running) {
      if (tabCountdownRef.current) clearInterval(tabCountdownRef.current);
      tabHiddenAt.current = null;
      setTabWarning(false);
      setTabAwaySecsLeft(null);
      setTabAwayPhase(null);
      return;
    }

    const onVisibility = () => {
      if (document.hidden) {
        // Student left the tab
        tabHiddenAt.current = Date.now();
        setTabAwaySecsLeft(AWAY_LIMIT_SECS);

        tabCountdownRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - (tabHiddenAt.current ?? Date.now())) / 1000);
          const left = AWAY_LIMIT_SECS - elapsed;

          if (left <= 0) {
            // ❌ INVALIDATE — student was away > 5 min
            clearInterval(tabCountdownRef.current!);
            tabHiddenAt.current = null;
            if (timerRef.current) clearInterval(timerRef.current);
            setRunning(false);
            setStarted(false);
            setTabWarning(false);
            setTabAwaySecsLeft(null);
            setTabAwayPhase(null);
            setTabInvalidated(true); // show INVALID result card
            setIsFullscreen(false);
          } else {
            setTabAwaySecsLeft(left);
            // Show warning only after 3 min away
            if (elapsed >= AWAY_WARN_SECS) {
              setTabWarning(true);
              setTabAwayPhase(left <= 60 ? 'critical' : 'warn');
            }
          }
        }, 1000);
      } else {
        // Student returned — cancel countdown
        if (tabCountdownRef.current) clearInterval(tabCountdownRef.current);
        tabHiddenAt.current = null;
        setTabWarning(false);
        setTabAwaySecsLeft(null);
        setTabAwayPhase(null);
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (tabCountdownRef.current) clearInterval(tabCountdownRef.current);
    };
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
            {strictMode && started && !done && !tabInvalidated && (
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <Lock className="h-3 w-3" /> Strict Mode · Exit locked until session ends
              </span>
            )}
            {/* Exit button — hidden in strict mode until done or invalidated */}
            {(!strictMode || done || tabInvalidated) && (
              <button
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 hover:bg-white/15 text-white/60 hover:text-white text-sm font-medium transition-all border border-white/10"
              >
                <Minimize2 className="h-4 w-4" /> Exit Fullscreen <span className="text-white/30 text-xs ml-1">ESC</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab-away countdown warning (only shown after 3 min away) */}
        {tabWarning && tabAwaySecsLeft !== null && (
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
                <span className="font-black" style={{ color: tabAwayPhase === 'critical' ? '#f87171' : '#fde68a' }}>{fmt(tabAwaySecsLeft)}</span>
                {' '}· Return to this tab to cancel
              </p>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          {/* Clock */}
          <GlowRing progress={progress} running={running} done={done} urgent={urgent} size={300} strokeWidth={14} darkInner={true}>
            {tabInvalidated ? (
              <div className="text-center">
                <div className="text-5xl mb-2">⛔</div>
                <p className="font-bold text-lg" style={{ color: '#f87171' }}>Session Invalid</p>
                <p className="text-white/40 text-xs mt-1">Away &gt; 5 min</p>
              </div>
            ) : done ? (
              <div className="text-center">
                <div className="text-5xl mb-2">🎉</div>
                <p className="text-emerald-400 font-bold text-xl">Complete!</p>
                <p className="text-white/40 text-sm mt-1">+1 Valid Session</p>
              </div>
            ) : started ? (
              <div className="text-center">
                <p
                  className="font-black tabular-nums"
                  style={{ fontSize: 96, fontFamily: "'Outfit','Inter',sans-serif", color: urgent ? '#ef4444' : '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}
                >
                  {fmt(remaining)}
                </p>
                <p className="text-white/50 text-sm mt-2">{running ? '● Studying' : '⏸ Paused'}</p>
              </div>
            ) : (
              <div className="text-center">
                <p
                  className="font-black tabular-nums"
                  style={{ fontSize: 96, fontFamily: "'Outfit','Inter',sans-serif", color: '#22c55e', letterSpacing: '-0.03em', lineHeight: 1 }}
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

          {/* Strict mode panel — hidden once running */}
          <div
            className="w-full max-w-lg rounded-2xl border px-6 py-4 space-y-4"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: strictMode ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)' }}
          >
            {/* Strict toggle — always visible but locked when running */}
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

            {/* Duration pickers — hidden once session starts */}
            {!started && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  {QUICK_OPTIONS.filter(m => m <= maxMins).map(m => (
                    <button
                      key={m}
                      onClick={() => pickDuration(m)}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${
                        selectedMins === m && !showCustom
                          ? 'text-[#0d1b2a] border-transparent'
                          : 'text-white/70 border-white/20 hover:border-white/40 hover:text-white bg-white/5'
                      }`}
                      style={selectedMins === m && !showCustom ? { background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 0 16px rgba(34,197,94,0.4)' } : {}}
                    >
                      {m} min
                    </button>
                  ))}
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
                      onClick={() => setShowCustom(true)}
                      className="px-4 py-1.5 rounded-full text-sm text-white/40 border border-white/10 hover:border-white/30 hover:text-white/70 transition-all bg-white/5"
                    >
                      Custom Duration: <span className="text-white/25 text-xs">Max {maxMins}</span>
                    </button>
                  )}
                </div>

                {/* Strict info shown only BEFORE session starts */}
                {strictMode && (
                  <div className="space-y-1.5">
                    {['No app switching allowed', 'Exit is locked until session ends'].map(t => (
                      <div key={t} className="flex items-center gap-2 text-[13px] text-emerald-400/80">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" /> {t}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}


            {/* Pause warning count */}
            {strictMode && pauseWarnings > 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                You tried to pause {pauseWarnings} time{pauseWarnings > 1 ? 's' : ''}. Stay focused!
              </div>
            )}
          </div>

          {/* Motivational quotes — only shown when running in fullscreen (big view) */}
          {started && !done && <MotivationalQuote running={running} />}

          {/* Strict Mode info window — shown BELOW the quote when session is running */}
          {started && !done && strictMode && (
            <div
              className="w-full max-w-sm rounded-2xl px-5 py-4"
              style={{
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.22)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Header row */}
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">
                  Strict Mode{' '}
                  <span className="text-emerald-400">Enabled</span>
                </span>
              </div>
              {/* Info lines */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[13px] text-emerald-300/90">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                  No app switching allowed
                </div>
                <div className="flex items-center gap-2 text-[13px] text-emerald-300/90">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                  Exit is locked until session ends
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {started && !done && (
            <div className="flex gap-4">
              {strictMode && running ? (
                <div className="text-center px-4 py-3 rounded-2xl w-full" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p className="text-emerald-400 font-bold text-sm">🔥 Stay locked in. You're doing great!</p>
                  <p className="text-white/30 text-xs mt-1">Reset &amp; exit are disabled in Strict Mode until session ends.</p>
                </div>
              ) : (
                <>
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
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-base transition-all bg-white/8 text-white/60 hover:bg-white/15 hover:text-white border border-white/10"
                  >
                    <RotateCcw className="h-5 w-5" /> Reset
                  </button>
                </>
              )}
            </div>
          )}
          {/* Session outcome cards */}
          {tabInvalidated && (
            <div className="w-full max-w-sm rounded-2xl px-6 py-5 text-center"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-2xl mb-2">❌</p>
              <p className="font-bold text-red-400 text-base">Session Not Counted</p>
              <p className="text-white/40 text-xs mt-1.5">You were away for more than 5 minutes in Strict Mode.</p>
              <button
                onClick={reset}
                className="mt-4 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                Try Again
              </button>
            </div>
          )}
          {done && (
            <div className="w-full max-w-sm rounded-2xl px-6 py-5 text-center"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <p className="text-2xl mb-2">✅</p>
              <p className="font-bold text-emerald-400 text-base">+{selectedMins} min added</p>
              <p className="text-white/40 text-xs mt-1.5">Valid session · 🔥 Keep the streak going!</p>
              <button
                onClick={reset}
                className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white mx-auto transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 0 20px rgba(34,197,94,0.4)' }}
              >
                <RotateCcw className="h-4 w-4" /> New Session
              </button>
            </div>
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
    <>
    <div
      className="relative flex flex-col h-full rounded-2xl overflow-hidden bg-white border border-slate-200"
      style={{ minHeight: 340 }}
    >
      {/* ── Top Header bar ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-0">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 2px 10px rgba(16,185,129,0.35)' }}
          >
            {strictMode ? <Lock className="h-4 w-4 text-white" /> : <Shield className="h-4 w-4 text-white" />}
          </div>
          <div>
            <h3 className="font-bold text-[13px] text-slate-800 leading-none">Study Timer</h3>
            <p className="text-[9px] mt-0.5 font-semibold">
              {tabInvalidated
                ? <span style={{ color: '#ef4444' }}>⛔ Session invalid</span>
                : running
                  ? <span style={{ color: '#10b981' }} className="animate-pulse">● Session running</span>
                  : done
                    ? <span style={{ color: '#10b981' }}>✓ Complete!</span>
                    : <span className="text-slate-400">{tierLabel} · Max {maxMins} min</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode pill toggle: Normal | Strict */}
          <div
            className={`flex items-center rounded-xl border text-[10px] font-bold overflow-hidden transition-all ${running ? 'opacity-50 pointer-events-none' : ''}`}
            style={{ border: strictMode ? '1px solid rgba(16,185,129,0.4)' : '1px solid #e2e8f0' }}
            title={running ? 'Mode cannot be changed while session is running' : ''}
          >
            <button
              onClick={() => !running && setStrictMode(false)}
              className="flex items-center gap-1 px-2.5 py-1.5 transition-all"
              style={!strictMode
                ? { background: '#f1f5f9', color: '#0f172a', fontWeight: 800 }
                : { background: 'transparent', color: '#94a3b8' }}
            >
              <Unlock className="h-3 w-3" /> Normal
            </button>
            <div style={{ width: 1, background: strictMode ? 'rgba(16,185,129,0.3)' : '#e2e8f0', alignSelf: 'stretch' }} />
            <button
              onClick={() => !running && setStrictMode(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 transition-all"
              style={strictMode
                ? { background: 'linear-gradient(135deg,#064e3b,#059669)', color: '#fff', fontWeight: 800 }
                : { background: 'transparent', color: '#94a3b8' }}
            >
              <Lock className="h-3 w-3" /> Strict
            </button>
          </div>
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-500 hover:text-emerald-600 transition-all"
            title="Open fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── HERO: Timer ring ── */}
      <div className="flex flex-col items-center justify-center pt-3 pb-2">
        <GlowRing progress={progress} running={running} done={done} urgent={urgent} size={200} strokeWidth={14} darkInner={false}>
          {tabInvalidated ? (
            <div className="text-center">
              <div className="text-3xl">⛔</div>
              <p className="text-red-500 font-bold text-xs mt-1">Invalid</p>
            </div>
          ) : done ? (
            <div className="text-center">
              <div className="text-3xl">🎉</div>
              <p className="text-emerald-500 font-bold text-xs mt-1">Valid!</p>
            </div>
          ) : (
            <div className="text-center">
              <p
                className="font-black tabular-nums leading-none"
                style={{ fontSize: 42, fontFamily: "'Outfit','Inter',sans-serif", color: urgent ? '#ef4444' : '#0f172a', letterSpacing: '-0.03em' }}
              >
                {fmt(started ? remaining : selectedMins * 60)}
              </p>
              <p className="text-[10px] mt-1.5 font-semibold" style={{ color: running ? '#16a34a' : '#94a3b8' }}>
                {running ? '● running' : started ? '❚❚ paused' : 'Ready to study'}
              </p>
            </div>
          )}
        </GlowRing>

        {/* ── Start button lives RIGHT under the clock ── */}
        <div className="mt-4 w-full max-w-[200px]">
          {tabInvalidated ? (
            <button
              onClick={reset}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}
            >
              <RotateCcw className="h-4 w-4" /> Try Again
            </button>
          ) : !started ? (
            <button
              onClick={openModePicker}
              className="w-full py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.03] active:scale-95 text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 4px 20px rgba(34,197,94,0.45)' }}
            >
              <Play className="h-4 w-4" />
              Start Session
            </button>
          ) : done ? (
            <button
              onClick={reset}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 4px 20px rgba(34,197,94,0.45)' }}
            >
              <RotateCcw className="h-4 w-4" /> New Session
            </button>
          ) : (
            <div className="flex gap-2">
              {!strictMode && (
                <button
                  onClick={togglePause}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all"
                  style={running
                    ? { background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1.5px solid rgba(16,185,129,0.3)' }
                    : { background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', boxShadow: '0 2px 12px rgba(34,197,94,0.4)' }}
                >
                  {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {running ? 'Pause' : 'Resume'}
                </button>
              )}
              {strictMode && running && (
                <div className="flex-1 py-2.5 rounded-xl text-[10px] font-semibold border flex items-center justify-center gap-1"
                  style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
                  <Lock className="h-3 w-3" /> Locked
                </div>
              )}
              <button
                onClick={reset}
                disabled={strictMode && running}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Duration options — only before session starts ── */}
      {!started && (
        <div className="px-4 pb-2">
          <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-2">
            🔥 Recommended · {recommended} min
          </p>
          <div className="flex gap-1.5 flex-wrap mb-2">
            {QUICK_OPTIONS.filter(m => m <= maxMins).map(m => (
              <button
                key={m}
                onClick={() => pickDuration(m)}
                className={`flex-1 min-w-[46px] py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                  selectedMins === m && !showCustom
                    ? 'text-white border-transparent'
                    : 'text-slate-500 border-slate-200 hover:border-emerald-400 hover:text-emerald-600 bg-white'
                }`}
                style={selectedMins === m && !showCustom
                  ? { background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 0 10px rgba(34,197,94,0.3)' }
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
                placeholder="enter minutes"
                autoFocus
              />
              <span className="text-[9px] text-slate-400 shrink-0">Max 180</span>
              <button
                onClick={applyCustom}
                className="px-3 py-1 rounded-lg text-white text-[11px] font-black shrink-0 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 2px 8px rgba(34,197,94,0.4)' }}
              >
                OK
              </button>
              <button onClick={() => setShowCustom(false)} className="text-slate-300 hover:text-slate-500 transition-colors shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
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

      {/* Bottom progress bar */}
      <div className="h-[3px] w-full bg-slate-100">
        <div
          className="h-full transition-all duration-1000"
          style={{ width: `${progress}%`, background: done ? '#10b981' : urgent ? '#ef4444' : 'linear-gradient(90deg,#16a34a,#22c55e)', boxShadow: `0 0 8px ${done ? '#10b981' : '#22c55e'}` }}
        />
      </div>
    </div>

    {/* ── MODE PICKER MODAL ── */}
    {showModePicker && (
      <div className="fixed inset-0 z-[9997] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm mx-4 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Choose Study Mode</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedMins} min session · {strictMode ? '🔒 Strict mode on' : 'Normal mode'}
            </p>
          </div>

          {/* Options */}
          <div className="p-4 flex flex-col gap-3">
            {/* Fullscreen */}
            <button
              onClick={() => { setShowModePicker(false); setIsFullscreen(true); startSession(); }}
              className="group w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm">Fullscreen Mode</p>
                <p className="text-xs text-slate-500 mt-0.5">Distraction-free focus. Covers entire screen.</p>
                {strictMode && <p className="text-[10px] text-emerald-600 font-semibold mt-1">🔒 Exit locked until completion</p>}
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-emerald-500 flex-shrink-0 transition-colors" />
            </button>

            {/* Widget / Pop mode */}
            <button
              onClick={startWidgetSession}
              className="group w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)' }}>
                <LayoutTemplate className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm">Pop Widget Mode</p>
                <p className="text-xs text-slate-500 mt-0.5">Timer stays visible while you browse other pages.</p>
                <p className="text-[10px] text-blue-600 font-semibold mt-1">⚡ Perfect for reading Current Affairs while timing</p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-blue-500 flex-shrink-0 transition-colors" />
            </button>
          </div>

          {/* Cancel */}
          <div className="px-4 pb-4">
            <button
              onClick={() => setShowModePicker(false)}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
