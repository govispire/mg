/**
 * timerBus.ts
 *
 * Legacy shim — now proxies directly into useTimerStore.
 * Kept for backwards-compatibility only; prefer calling useTimerStore directly.
 */
import { useTimerStore } from '@/store/useTimerStore';

export const timerBus = {
  /** @deprecated Use useTimerStore().startTimer(mins, 'widget', strict) directly */
  startWidget: (payload: { mins: number; strict: boolean }) => {
    useTimerStore.getState().startTimer(payload.mins, 'widget', payload.strict);
  },
};
