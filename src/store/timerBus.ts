/**
 * timerBus.ts
 * Tiny pub/sub bus for the floating timer widget.
 * Using a module-level emitter avoids ANY React context/Portal issues.
 */

type StartPayload = {
  mins:   number;
  strict: boolean;
};

type Listener = (payload: StartPayload) => void;

const listeners = new Set<Listener>();

export const timerBus = {
  /** Fire "start widget mode" from anywhere */
  startWidget: (payload: StartPayload) => {
    listeners.forEach(fn => fn(payload));
  },
  /** Subscribe (returns unsubscribe fn) */
  onStart: (fn: Listener) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
