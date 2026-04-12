/**
 * useTimerStore — Zustand v5 store for the persistent floating study timer.
 *
 * Key design:
 *  - endTime-based countdown (no drift on refresh)
 *  - Full localStorage persistence (Zustand v5 `persist` API)
 *  - Pause extends endTime to prevent cheating
 *  - Tab-away invalidation for strict mode
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Constants ─────────────────────────────────────────────────────────────────
const STRICT_AWAY_LIMIT_MS = 10 * 60 * 1000; // 10 min

// ── Types ─────────────────────────────────────────────────────────────────────
export type TimerMode = 'fullscreen' | 'widget' | null;

type State = {
  active:       boolean;
  mode:         TimerMode;
  selectedMins: number;
  strictMode:   boolean;
  endTime:      number | null;   // absolute Date.now() when session ends
  pausedAt:     number | null;   // Date.now() when paused
  remaining:    number;          // seconds (updated by tick)
  running:      boolean;
  done:         boolean;
  invalidated:  boolean;
  tabAwayAt:       number | null;
  tabAwayWarning:  boolean;
  tabAwaySecsLeft: number | null;
  pauseWarnings:   number;
  focusSessions:   number;
  totalStudyMins:  number;
  widgetX: number;
  widgetY: number;
};

type Actions = {
  startTimer:         (mins: number, mode: TimerMode, strict: boolean) => void;
  pauseResume:        () => void;
  resetTimer:         () => void;
  closeWidget:        () => void;
  switchToFullscreen: () => void;
  tick:               () => void;
  setWidgetPos:       (x: number, y: number) => void;
  onTabHidden:        () => void;
  onTabVisible:       () => void;
};

// ── Default position ──────────────────────────────────────────────────────────
const defX = () => (typeof window !== 'undefined' ? Math.max(0, window.innerWidth  - 260) : 80);
const defY = () => (typeof window !== 'undefined' ? Math.max(0, window.innerHeight - 320) : 80);

// ── Store ─────────────────────────────────────────────────────────────────────
export const useTimerStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      // initial state
      active:          false,
      mode:            null as TimerMode,
      selectedMins:    25,
      strictMode:      false,
      endTime:         null,
      pausedAt:        null,
      remaining:       25 * 60,
      running:         false,
      done:            false,
      invalidated:     false,
      tabAwayAt:       null,
      tabAwayWarning:  false,
      tabAwaySecsLeft: null,
      pauseWarnings:   0,
      focusSessions:   0,
      totalStudyMins:  0,
      widgetX:         defX(),
      widgetY:         defY(),

      // ── actions ─────────────────────────────────────────────────────────────
      startTimer: (mins, mode, strict) => {
        set({
          active:          true,
          mode,
          selectedMins:    mins,
          strictMode:      strict,
          endTime:         Date.now() + mins * 60_000,
          pausedAt:        null,
          remaining:       mins * 60,
          running:         true,
          done:            false,
          invalidated:     false,
          tabAwayAt:       null,
          tabAwayWarning:  false,
          tabAwaySecsLeft: null,
          pauseWarnings:   0,
        });
      },

      tick: () => {
        const s = get();
        if (!s.running || s.done || !s.endTime) return;

        // Strict: check if tab has been away too long
        if (s.strictMode && s.tabAwayAt !== null) {
          const awayMs = Date.now() - s.tabAwayAt;
          if (awayMs >= STRICT_AWAY_LIMIT_MS) {
            set({ running: false, invalidated: true, tabAwayWarning: false, tabAwaySecsLeft: null });
            return;
          }
          const secsLeft = Math.max(0, Math.round((s.endTime - Date.now()) / 1000));
          const awayLeft = Math.round((STRICT_AWAY_LIMIT_MS - awayMs) / 1000);
          set({ remaining: secsLeft, tabAwaySecsLeft: awayLeft });
          return;
        }

        const secsLeft = Math.max(0, Math.round((s.endTime - Date.now()) / 1000));

        if (secsLeft <= 0) {
          // Session complete!
          const sessions = s.focusSessions + 1;
          const total    = s.totalStudyMins + s.selectedMins;
          try {
            localStorage.setItem('focus_sessions',   String(sessions));
            localStorage.setItem('total_study_mins', String(total));
            const arr = JSON.parse(localStorage.getItem('study_sessions') || '[]');
            arr.push({ mins: s.selectedMins, date: new Date().toISOString() });
            localStorage.setItem('study_sessions', JSON.stringify(arr.slice(-50)));
          } catch {}
          set({ remaining: 0, running: false, done: true, focusSessions: sessions, totalStudyMins: total });
        } else {
          set({ remaining: secsLeft });
        }
      },

      pauseResume: () => {
        const s = get();
        if (s.strictMode && s.running) {
          set({ pauseWarnings: s.pauseWarnings + 1 });
          return;
        }
        if (s.running) {
          set({ running: false, pausedAt: Date.now() });
        } else if (s.pausedAt !== null && s.endTime !== null) {
          // Shift endTime forward by the time we were paused
          const pausedFor = Date.now() - s.pausedAt;
          set({ running: true, pausedAt: null, endTime: s.endTime + pausedFor });
        } else {
          set({ running: true, pausedAt: null });
        }
      },

      resetTimer: () => {
        const s = get();
        set({
          running:         false,
          done:            false,
          invalidated:     false,
          endTime:         null,
          pausedAt:        null,
          remaining:       s.selectedMins * 60,
          pauseWarnings:   0,
          tabAwayAt:       null,
          tabAwayWarning:  false,
          tabAwaySecsLeft: null,
        });
      },

      closeWidget: () => {
        set({
          active:          false,
          mode:            null,
          running:         false,
          done:            false,
          invalidated:     false,
          endTime:         null,
          pausedAt:        null,
          tabAwayAt:       null,
          tabAwayWarning:  false,
          tabAwaySecsLeft: null,
        });
      },

      switchToFullscreen: () => set({ mode: 'fullscreen' }),

      setWidgetPos: (x, y) => set({ widgetX: x, widgetY: y }),

      onTabHidden: () => {
        const s = get();
        if (!s.strictMode || !s.running || s.done) return;
        set({ tabAwayAt: Date.now(), tabAwayWarning: true });
      },

      onTabVisible: () => {
        const s = get();
        if (s.tabAwayAt === null) return;
        if (!s.invalidated) {
          set({ tabAwayAt: null, tabAwayWarning: false, tabAwaySecsLeft: null });
        } else {
          set({ tabAwayAt: null });
        }
      },
    }),
    {
      name:    'study-timer-v2',          // new key to avoid stale v1 data
      storage: createJSONStorage(() => localStorage),
      // Only persist session-critical fields + position
      partialize: (s): Partial<State> => ({
        active:       s.active,
        mode:         s.mode,
        selectedMins: s.selectedMins,
        strictMode:   s.strictMode,
        endTime:      s.endTime,
        pausedAt:     s.pausedAt,
        remaining:    s.remaining,
        running:      s.running,
        done:         s.done,
        invalidated:  s.invalidated,
        focusSessions:  s.focusSessions,
        totalStudyMins: s.totalStudyMins,
        widgetX: s.widgetX,
        widgetY: s.widgetY,
      }),
      // On rehydration, if the stored endTime is in the past and timer was running,
      // auto-complete the session instead of leaving it in a stale running state.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.running && state.endTime && state.endTime < Date.now()) {
          // Session would have finished while the page was closed
          state.running   = false;
          state.done      = true;
          state.remaining = 0;
        }
      },
    },
  ),
);
