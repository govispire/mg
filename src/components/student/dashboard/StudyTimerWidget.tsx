import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Maximize2, Minimize2, Play, Pause, Timer } from 'lucide-react';

const TIMER_PRESETS = [
  { label: '30m',    secs: 30 * 60 },
  { label: '1 hr',   secs: 60 * 60 },
  { label: '1.5 hr', secs: 90 * 60 },
  { label: '2 hr',   secs: 2 * 60 * 60 },
  { label: '3 hr',   secs: 3 * 60 * 60 },
  { label: '4 hr',   secs: 4 * 60 * 60 },
  { label: '5 hr',   secs: 5 * 60 * 60 },
];

export const StudyTimerWidget: React.FC = () => {
  const [timerSelected, setTimerSelected] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = (secs: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerSelected(secs);
    setTimerRemaining(secs);
    setTimerRunning(true);
    setTimerDone(false);
  };

  const pauseResumeTimer = () => setTimerRunning(r => !r);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimerRemaining(timerSelected ?? 0);
    setTimerDone(false);
  }, [timerSelected]);

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

  // ESC key exits fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timerProgress = timerSelected ? ((timerSelected - timerRemaining) / timerSelected) * 100 : 0;

  // Ring config
  const R = isFullscreen ? 140 : 90;
  const SIZE = R * 2 + 24;
  const CIRC = 2 * Math.PI * R;
  const strokeColor = timerDone ? '#10b981' : timerRemaining < 60 ? '#ef4444' : timerRunning ? '#f59e0b' : '#6366f1';
  const presetLabel = TIMER_PRESETS.find(p => p.secs === timerSelected)?.label;

  const renderClock = () => (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      {/* Glow */}
      {timerRunning && (
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            width: R * 1.2, height: R * 1.2,
            background: timerRemaining < 60 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          }}
        />
      )}
      <svg className="-rotate-90 absolute inset-0 w-full h-full" viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Track */}
        <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none"
          stroke={isFullscreen ? 'rgba(255,255,255,0.1)' : '#f1f5f9'} strokeWidth={isFullscreen ? 12 : 8} />
        {/* Progress */}
        <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none"
          stroke={strokeColor} strokeWidth={isFullscreen ? 12 : 8}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - timerProgress / 100)}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
        />
      </svg>
      {/* Center display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {timerDone ? (
          <>
            <span style={{ fontSize: isFullscreen ? 56 : 32 }}>🎉</span>
            <p className={`font-bold mt-1 ${isFullscreen ? 'text-2xl text-emerald-300' : 'text-[11px] text-emerald-600'}`}>Done!</p>
          </>
        ) : timerSelected !== null ? (
          <>
            <p
              className="font-black tabular-nums leading-none"
              style={{
                fontFamily: "'Outfit', 'Inter', sans-serif",
                fontSize: isFullscreen ? 72 : 28,
                color: timerRemaining < 60 ? '#ef4444' : isFullscreen ? '#fff' : timerRunning ? '#f59e0b' : '#334155',
                letterSpacing: '-0.03em',
              }}
            >
              {formatTimer(timerRemaining)}
            </p>
            <p className={`mt-1 font-medium ${isFullscreen ? 'text-white/60 text-base' : 'text-[9px] text-slate-400'}`}>
              {timerRunning ? '▶ running' : '❚❚ paused'}
            </p>
          </>
        ) : (
          <>
            <Timer style={{ width: isFullscreen ? 48 : 28, height: isFullscreen ? 48 : 28, color: '#f59e0b' }} />
            <p className={`mt-1 ${isFullscreen ? 'text-white/50 text-sm' : 'text-[9px] text-slate-400'}`}>pick time</p>
          </>
        )}
      </div>
    </div>
  );

  // ── FULLSCREEN MODE ─────────────────────────────────────────────────────────
  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 40%, #0d1b2a 100%)',
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Timer className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">Study Timer</p>
              {presetLabel && <p className="text-white/40 text-sm mt-0.5">{presetLabel} session</p>}
            </div>
          </div>
          <button
            onClick={() => setIsFullscreen(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm font-medium transition-all"
          >
            <Minimize2 className="h-4 w-4" />
            Exit Fullscreen <span className="text-white/30 text-xs ml-1">ESC</span>
          </button>
        </div>

        {/* Main clock */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          {renderClock()}

          {/* Progress text */}
          {timerSelected !== null && !timerDone && (
            <p className="text-white/40 text-sm">
              {Math.round(timerProgress)}% elapsed · {formatTimer(timerRemaining)} remaining
            </p>
          )}

          {/* Preset pills */}
          <div className="flex gap-3 flex-wrap justify-center">
            {TIMER_PRESETS.map(p => (
              <button
                key={p.secs}
                onClick={() => startTimer(p.secs)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                  timerSelected === p.secs
                    ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          {timerSelected !== null && (
            <div className="flex gap-4">
              {!timerDone && (
                <button
                  onClick={pauseResumeTimer}
                  className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-base transition-all ${
                    timerRunning
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                      : 'bg-amber-500 text-white shadow-lg shadow-amber-500/40 hover:bg-amber-400'
                  }`}
                >
                  {timerRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  {timerRunning ? 'Pause' : 'Resume'}
                </button>
              )}
              <button
                onClick={resetTimer}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-base bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10 transition-all"
              >
                <RotateCcw className="h-5 w-5" />
                {timerDone ? 'New Session' : 'Reset'}
              </button>
            </div>
          )}
        </div>

        {/* Bottom thin progress bar */}
        {timerSelected !== null && (
          <div className="h-1 w-full bg-white/5">
            <div
              className="h-full transition-all duration-1000"
              style={{
                width: `${timerProgress}%`,
                background: timerDone ? '#10b981' : timerRemaining < 60 ? '#ef4444' : '#f59e0b',
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // ── NORMAL (inline) MODE ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-sm transition-all ${
            timerDone ? 'bg-gradient-to-br from-emerald-500 to-emerald-400'
            : timerRunning ? 'bg-gradient-to-br from-amber-500 to-amber-400'
            : 'bg-gradient-to-br from-amber-400 to-orange-400'
          }`}>
            <Timer className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[14px] text-slate-800 leading-none">Study Timer</h3>
            {timerRunning && <p className="text-[10px] text-amber-500 font-semibold mt-0.5 animate-pulse">● Session running</p>}
            {timerDone && <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">✓ Session complete!</p>}
            {!timerRunning && !timerDone && <p className="text-[10px] text-slate-400 mt-0.5">Pick a duration</p>}
          </div>
        </div>
        {/* Fullscreen button */}
        <button
          onClick={() => setIsFullscreen(true)}
          title="Full screen mode"
          className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-400 hover:text-amber-500 transition-all"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Preset pills */}
      <div className="grid grid-cols-4 gap-1 mb-4 p-1 bg-slate-50 border border-slate-100 rounded-xl">
        {TIMER_PRESETS.map(p => (
          <button
            key={p.secs}
            onClick={() => startTimer(p.secs)}
            className={`text-[10px] font-bold py-1.5 rounded-lg border transition-all duration-150 ${
              timerSelected === p.secs
                ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                : 'bg-white text-slate-500 border-slate-200 hover:border-amber-300 hover:text-amber-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Clock or placeholder */}
      {timerSelected !== null ? (
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col items-center justify-center flex-1 gap-2">
            {renderClock()}
            <p className="text-[11px] font-bold text-slate-700 text-center">
              {timerDone ? 'Great session! 💪' : presetLabel + ' study session'}
            </p>
            {!timerDone && (
              <p className="text-[10px] text-slate-400">{Math.round(timerProgress)}% elapsed</p>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${timerDone ? 'bg-emerald-400' : timerRemaining < 60 ? 'bg-red-400' : 'bg-amber-400'}`}
              style={{ width: `${timerProgress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {!timerDone && (
              <button
                onClick={pauseResumeTimer}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold shadow-sm transition-all ${
                  timerRunning
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                    : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200'
                }`}
              >
                {timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {timerRunning ? 'Pause' : 'Resume'}
              </button>
            )}
            <button
              onClick={resetTimer}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {timerDone ? 'New Session' : 'Reset'}
            </button>
          </div>
        </div>
      ) : (
        /* Placeholder */
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <div className="relative" style={{ width: 100, height: 100 }}>
            <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '12s' }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#fcd34d" strokeWidth="2.5" strokeDasharray="10 7" strokeLinecap="round" />
            </svg>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="34" fill="none" stroke="#f1f5f9" strokeWidth="5" />
            </svg>
            <div className="absolute inset-6 rounded-full bg-amber-50 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Timer className="h-9 w-9 text-amber-400" />
            </div>
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-700">Ready when you are</p>
            <p className="text-[11px] text-slate-400 mt-1">Select a duration above to begin your session</p>
          </div>
        </div>
      )}
    </div>
  );
};
