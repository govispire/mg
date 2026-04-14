/**
 * stopTimerAndLaunchTest
 *
 * PRODUCT RULE: Study Timer and Test Timer are MUTUALLY EXCLUSIVE.
 * Call this instead of raw `window.open(url, '_blank', ...)` for every test launch.
 *
 * Steps:
 *  1. Check if study timer is running (via store)
 *  2. If yes → save elapsed session, stop timer, show toast
 *  3. Open the test window
 */
import { toast } from 'sonner';
import { useTimerStore } from '@/store/useTimerStore';

interface LaunchOptions {
  url: string;
  testName?: string;
  windowFeatures?: string;
}

const DEFAULT_FEATURES = 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no';

export function stopTimerAndLaunchTest({ url, testName = 'Test', windowFeatures = DEFAULT_FEATURES }: LaunchOptions) {
  // ── MUTUAL EXCLUSIVITY ────────────────────────────────────────────────────
  const store = useTimerStore.getState();

  if (store.active) {
    const elapsed = store.stopAndSave('timer');
    if (elapsed > 0) {
      toast.warning(
        `⏸ Study timer paused · ${elapsed} min saved. Starting "${testName}" now.`,
        { duration: 5000 }
      );
    } else {
      toast.info(`📝 Study timer stopped. Starting "${testName}" now.`, { duration: 3500 });
    }
  }

  // ── OPEN TEST WINDOW ──────────────────────────────────────────────────────
  const win = window.open(url, 'testWindow', windowFeatures);
  if (win) {
    win.focus();
  } else {
    alert('Please allow popups for this website to start the test.');
  }
}
