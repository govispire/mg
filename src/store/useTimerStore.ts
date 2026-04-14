/**
 * useTimerStore — Single source of truth for the study timer.
 *
 * PRODUCT RULES (enforced here):
 *  ✅ Only ONE mode active at a time (fullscreen | widget | null)
 *  ✅ exitFullscreen() → timer STOPS immediately, no widget fallback
 *  ✅ startTimer() always resets any previous session (mutex)
 *  ✅ closeWidget() → timer STOPS completely (no background running)
 *  ✅ endTime-based countdown (no drift on refresh)
 *  ✅ Pause extends endTime to prevent cheating
 *  ✅ Tab-away invalidation for strict mode
 *  ✅ stopAndSave() → called before launching a test (mutual exclusivity)
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Constants ─────────────────────────────────────────────────────────────────
const STRICT_AWAY_LIMIT_MS = 5 * 60 * 1000;  // 5 min (invalidate)
const STRICT_WARN_MS       = 3 * 60 * 1000;  // 3 min (show warning)

// ── Types ─────────────────────────────────────────────────────────────────────
export type TimerMode = 'fullscreen' | 'widget' | null;
export type SessionSource = 'timer' | 'test';

export type StudySession = {
  date:   string;         // 'YYYY-MM-DD' (local)
  mins:   number;         // elapsed/spent minutes
  source: SessionSource;  // 'timer' = study timer, 'test' = exam
};

type State = {
  active:          boolean;
  mode:            TimerMode;
  selectedMins:    number;
  strictMode:      boolean;
  endTime:         number | null;   // absolute Date.now() when session ends
  pausedAt:        number | null;   // Date.now() when paused
  remaining:       number;          // seconds (updated by tick)
  running:         boolean;
  done:            boolean;
  invalidated:     boolean;
  tabAwayAt:          number | null;
  tabAwayWarning:     boolean;
  tabAwaySecsLeft:    number | null;
  tabAwayPhase:       'warn' | 'critical' | null;
  pauseWarnings:   number;
  focusSessions:   number;
  totalStudyMins:  number;
  widgetX:         number;
  widgetY:         number;
  // Exit-confirm modal (fullscreen normal mode only)
  showExitConfirm: boolean;
};

type Actions = {
  /** Start a timer. Calling this always stops any existing session first (mutex). */
  startTimer:         (mins: number, mode: TimerMode, strict: boolean) => void;
  pauseResume:        () => void;
  resetTimer:         () => void;
  /** Close widget → session ENDS (no background running). */
  closeWidget:        () => void;
  /**
   * Exit fullscreen.
   * Normal mode → shows confirmation modal first.
   * Strict mode → only allowed when done or invalidated.
   */
  requestExitFullscreen: () => void;
  /** Called when user confirms "End Session" in the modal. */
  confirmExitFullscreen: () => void;
  /** Called when user clicks "Continue Studying" in the modal. */
  cancelExitFullscreen:  () => void;
  tick:               () => void;
  setWidgetPos:       (x: number, y: number) => void;
  onTabHidden:        () => void;
  onTabVisible:       () => void;
  /**
   * MUTUAL EXCLUSIVITY — call before starting a test.
   * Calculates elapsed minutes, persists them to 'studyTimerSessions' LS key,
   * then fully resets the timer state.
   * Returns elapsed minutes so caller can show a toast.
   */
  stopAndSave: (source?: SessionSource) => number;
};

// ── Default position ──────────────────────────────────────────────────────────
const defX = () => (typeof window !== 'undefined' ? Math.max(0, window.innerWidth  - 272) : 80);
const defY = () => (typeof window !== 'undefined' ? Math.max(0, window.innerHeight - 340) : 80);

// ── Helper: local date string ─────────────────────────────────────────────────
const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ── Helper: save completed session to unified key ─────────────────────────────
const persistSession = (mins: number, source: SessionSource = 'timer') => {
  if (mins <= 0) return;
  try {
    const sessions: StudySession[] = JSON.parse(localStorage.getItem('studyTimerSessions') || '[]');
    sessions.push({ date: localDate(), mins, source });
    const serialized = JSON.stringify(sessions.slice(-200));
    localStorage.setItem('studyTimerSessions', serialized);
    // Fire a StorageEvent so same-tab listeners (useDashboardStats, StudyTimerWidget) react
    window.dispatchEvent(new StorageEvent('storage', { key: 'studyTimerSessions', newValue: serialized }));
  } catch {}
};

// ── Store ─────────────────────────────────────────────────────────────────────
export const useTimerStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      // ── initial state ──────────────────────────────────────────────────────
      active:          false,
      mode:            null,
      selectedMins:    25,
      strictMode:      false,
      endTime:         null,
      pausedAt:        null,
      remaining:       25 * 60,
      running:         false,
      done:            false,
      invalidated:     false,
      tabAwayAt:          null,
      tabAwayWarning:     false,
      tabAwaySecsLeft:    null,
      tabAwayPhase:       null,
      pauseWarnings:   0,
      focusSessions:   0,
      totalStudyMins:  0,
      widgetX:         defX(),
      widgetY:         defY(),
      showExitConfirm: false,

      // ── actions ────────────────────────────────────────────────────────────

      /**
       * MUTEX start: always kills existing session before starting new one.
       */
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
          tabAwayPhase:    null,
          pauseWarnings:   0,
          showExitConfirm: false,
        });
      },

      /**
       * MUTUAL EXCLUSIVITY: Stop the current timer, save elapsed minutes,
       * then fully reset. Returns elapsed mins for toast display.
       */
      stopAndSave: (source = 'timer') => {
        const s = get();
        if (!s.active) return 0;

        // Calculate elapsed mins (selectedMins - remaining secs / 60)
        const elapsed = Math.max(0, Math.floor((s.selectedMins * 60 - s.remaining) / 60));
        persistSession(elapsed, source);

        // Full reset
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
          tabAwayPhase:    null,
          showExitConfirm: false,
        });

        return elapsed;
      },

      tick: () => {
        const s = get();
        if (!s.running || s.done || !s.endTime) return;

        // Strict: check if tab has been away too long
        if (s.strictMode && s.tabAwayAt !== null) {
          const awayMs   = Date.now() - s.tabAwayAt;
          const awayLeft = Math.round((STRICT_AWAY_LIMIT_MS - awayMs) / 1000);
          const phase: State['tabAwayPhase'] = awayMs >= STRICT_WARN_MS
            ? (awayLeft <= 60 ? 'critical' : 'warn')
            : null;

          if (awayMs >= STRICT_AWAY_LIMIT_MS) {
            set({ running: false, invalidated: true, active: false, mode: null,
                  tabAwayWarning: false, tabAwaySecsLeft: null, tabAwayPhase: null });
            return;
          }
          set({ tabAwaySecsLeft: awayLeft, tabAwayPhase: phase,
                tabAwayWarning: awayMs >= STRICT_WARN_MS });
          return;
        }

        const secsLeft = Math.max(0, Math.round((s.endTime - Date.now()) / 1000));

        if (secsLeft <= 0) {
          // Session complete → persist full session
          const sessions = s.focusSessions + 1;
          const total    = s.totalStudyMins + s.selectedMins;
          try {
            localStorage.setItem('focus_sessions',   String(sessions));
            localStorage.setItem('total_study_mins', String(total));
            persistSession(s.selectedMins, 'timer'); // unified key
          } catch {}
          set({ remaining: 0, running: false, done: true,
                focusSessions: sessions, totalStudyMins: total });
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
          tabAwayPhase:    null,
          showExitConfirm: false,
        });
      },

      /** Widget close → FULL stop, no background timer */
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
          tabAwayPhase:    null,
          showExitConfirm: false,
        });
      },

      requestExitFullscreen: () => {
        const s = get();
        // In strict mode, exit is only allowed when done or invalidated
        if (s.strictMode && s.running) return;
        // If session is over or invalidated, exit immediately
        if (s.done || s.invalidated || !s.running) {
          set({ active: false, mode: null, running: false,
                endTime: null, showExitConfirm: false });
          return;
        }
        // Normal mode while running → show confirm modal
        set({ showExitConfirm: true });
      },

      confirmExitFullscreen: () => {
        // Save whatever elapsed before confirming exit
        const s = get();
        const elapsed = Math.max(0, Math.floor((s.selectedMins * 60 - s.remaining) / 60));
        persistSession(elapsed, 'timer');
        set({
          active:          false,
          mode:            null,
          running:         false,
          done:            false,
          invalidated:     false,
          endTime:         null,
          pausedAt:        null,
          showExitConfirm: false,
        });
      },

      cancelExitFullscreen: () => set({ showExitConfirm: false }),

      setWidgetPos: (x, y) => set({ widgetX: x, widgetY: y }),

      onTabHidden: () => {
        const s = get();
        if (!s.strictMode || !s.running || s.done) return;
        set({ tabAwayAt: Date.now(), tabAwayWarning: false });
      },

      onTabVisible: () => {
        const s = get();
        if (s.tabAwayAt === null) return;
        // If already invalidated by background tick, just clear the away marker
        set({ tabAwayAt: null, tabAwayWarning: false,
              tabAwaySecsLeft: null, tabAwayPhase: null });
      },
    }),
    {
      name:    'study-timer-v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (s): Partial<State> => ({
        active:         s.active,
        mode:           s.mode,
        selectedMins:   s.selectedMins,
        strictMode:     s.strictMode,
        endTime:        s.endTime,
        pausedAt:       s.pausedAt,
        remaining:      s.remaining,
        running:        s.running,
        done:           s.done,
        invalidated:    s.invalidated,
        focusSessions:  s.focusSessions,
        totalStudyMins: s.totalStudyMins,
        widgetX:        s.widgetX,
        widgetY:        s.widgetY,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // If tab was closed while timer was running and the time has passed, auto-complete
        if (state.running && state.endTime && state.endTime < Date.now()) {
          state.running   = false;
          state.done      = true;
          state.remaining = 0;
        }
        // Always reset the exit confirm on page load
        state.showExitConfirm = false;
      },
    },
  ),
);
