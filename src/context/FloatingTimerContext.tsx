import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export type TimerMode = 'fullscreen' | 'widget' | null;

const STRICT_TAB_LIMIT_SECS = 10 * 60; // 10 minutes away → auto-invalidate

interface FloatingTimerState {
  active: boolean;
  mode: TimerMode;
  selectedMins: number;
  remaining: number;
  running: boolean;
  done: boolean;
  strictMode: boolean;
  pauseWarnings: number;
  tabAwayWarning: boolean;      // visible "you left!" banner
  tabAwaySecsLeft: number | null; // countdown before invalidation
  invalidated: boolean;         // session was killed due to tab-away
  focusSessions: number;
  totalStudyMins: number;
}

interface FloatingTimerCtx extends FloatingTimerState {
  startTimer: (mins: number, mode: TimerMode, strict: boolean) => void;
  pauseResume: () => void;
  resetTimer: () => void;
  closeWidget: () => void;
  switchToFullscreen: () => void;
  dismissTabWarning: () => void;
}

const defaultState: FloatingTimerState = {
  active: false,
  mode: null,
  selectedMins: 25,
  remaining: 25 * 60,
  running: false,
  done: false,
  strictMode: false,
  pauseWarnings: 0,
  tabAwayWarning: false,
  tabAwaySecsLeft: null,
  invalidated: false,
  focusSessions: parseInt(localStorage.getItem('focus_sessions') || '0', 10),
  totalStudyMins: parseInt(localStorage.getItem('total_study_mins') || '0', 10),
};

const FloatingTimerContext = createContext<FloatingTimerCtx>({
  ...defaultState,
  startTimer: () => {},
  pauseResume: () => {},
  resetTimer: () => {},
  closeWidget: () => {},
  switchToFullscreen: () => {},
  dismissTabWarning: () => {},
});

export const FloatingTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FloatingTimerState>(defaultState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabAwayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabHiddenAtRef = useRef<number | null>(null);

  const clearTick = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const clearTabTimer = () => { if (tabAwayRef.current) clearInterval(tabAwayRef.current); tabHiddenAtRef.current = null; };

  // ── Main countdown tick ───────────────────────────────────────────────────
  useEffect(() => {
    if (!state.running || state.done) { clearTick(); return; }
    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.remaining <= 1) {
          clearTick();
          const sessions = prev.focusSessions + 1;
          const total = prev.totalStudyMins + prev.selectedMins;
          localStorage.setItem('focus_sessions', String(sessions));
          localStorage.setItem('total_study_mins', String(total));
          try {
            const arr = JSON.parse(localStorage.getItem('studyTimerSessions') || '[]');
            arr.push({ mins: prev.selectedMins, date: new Date().toISOString(), source: 'timer' });
            const serialized = JSON.stringify(arr.slice(-200));
            localStorage.setItem('studyTimerSessions', serialized);
            window.dispatchEvent(new StorageEvent('storage', { key: 'studyTimerSessions', newValue: serialized }));
          } catch {}
          return { ...prev, remaining: 0, running: false, done: true, focusSessions: sessions, totalStudyMins: total };
        }
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);
    return clearTick;
  }, [state.running, state.done]);

  // ── Strict mode: tab-away auto-invalidation after 10 min ─────────────────
  useEffect(() => {
    if (!state.strictMode || !state.running || state.done) {
      clearTabTimer();
      return;
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden — start the 10-min countdown
        tabHiddenAtRef.current = Date.now();
        setState(prev => ({ ...prev, tabAwayWarning: true, tabAwaySecsLeft: STRICT_TAB_LIMIT_SECS }));

        tabAwayRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - (tabHiddenAtRef.current ?? Date.now())) / 1000);
          const left = STRICT_TAB_LIMIT_SECS - elapsed;

          if (left <= 0) {
            // AUTO-INVALIDATE: student was away for 10+ minutes
            clearTick();
            clearTabTimer();
            setState(prev => ({
              ...prev,
              running: false,
              invalidated: true,
              tabAwayWarning: false,
              tabAwaySecsLeft: null,
            }));
          } else {
            setState(prev => ({ ...prev, tabAwaySecsLeft: left }));
          }
        }, 1000);
      } else {
        // Tab visible again — cancel countdown, stay running
        clearTabTimer();
        setState(prev => ({ ...prev, tabAwayWarning: false, tabAwaySecsLeft: null }));
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearTabTimer();
    };
  }, [state.strictMode, state.running, state.done]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const startTimer = useCallback((mins: number, mode: TimerMode, strict: boolean) => {
    clearTick();
    clearTabTimer();
    setState(prev => ({
      ...prev,
      active: true,
      mode,
      selectedMins: mins,
      remaining: mins * 60,
      running: true,
      done: false,
      invalidated: false,
      strictMode: strict,
      pauseWarnings: 0,
      tabAwayWarning: false,
      tabAwaySecsLeft: null,
    }));
  }, []);

  const pauseResume = useCallback(() => {
    setState(prev => {
      if (prev.strictMode && prev.running) {
        return { ...prev, pauseWarnings: prev.pauseWarnings + 1 };
      }
      return { ...prev, running: !prev.running };
    });
  }, []);

  const resetTimer = useCallback(() => {
    clearTick();
    clearTabTimer();
    setState(prev => ({
      ...prev,
      running: false,
      done: false,
      invalidated: false,
      remaining: prev.selectedMins * 60,
      pauseWarnings: 0,
      tabAwayWarning: false,
      tabAwaySecsLeft: null,
    }));
  }, []);

  const closeWidget = useCallback(() => {
    clearTick();
    clearTabTimer();
    setState(prev => ({ ...prev, active: false, mode: null, running: false, tabAwayWarning: false }));
  }, []);

  const switchToFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, mode: 'fullscreen' }));
  }, []);

  const dismissTabWarning = useCallback(() => {
    setState(prev => ({ ...prev, tabAwayWarning: false }));
  }, []);

  return (
    <FloatingTimerContext.Provider
      value={{ ...state, startTimer, pauseResume, resetTimer, closeWidget, switchToFullscreen, dismissTabWarning }}
    >
      {children}
    </FloatingTimerContext.Provider>
  );
};

export const useFloatingTimer = () => useContext(FloatingTimerContext);
