import { useState, useEffect, useCallback, useRef, Dispatch, SetStateAction } from 'react';

/**
 * useLocalStorage — drop-in for useState that also persists to localStorage.
 *
 * KEY FIX: The setValue function now mirrors React's own useState by using a
 * ref to track the *latest committed value* so that chained functional updates
 * (setState(prev => ...) called multiple times in the same batch) correctly
 * compose — each call receives the result of the previous call, not a stale
 * snapshot of the last render's value.
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, Dispatch<SetStateAction<T>>] {

    const readValue = (): T => {
        if (typeof window === 'undefined') return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch {
            return initialValue;
        }
    };

    const [storedValue, setStoredValue] = useState<T>(readValue);

    // Keep a ref that always holds the latest value so functional updaters
    // can chain correctly even when batched in the same React flush.
    const latestRef = useRef<T>(storedValue);
    // Sync ref on every render
    latestRef.current = storedValue;

    const setValue: Dispatch<SetStateAction<T>> = useCallback((action) => {
        setStoredValue(prev => {
            // Resolve the new value: if action is a function, call it with the
            // latest committed value (from ref) so chained calls compose properly.
            const next =
                typeof action === 'function'
                    ? (action as (prev: T) => T)(latestRef.current)
                    : action;

            // Update the ref immediately so next chained call sees latest value
            latestRef.current = next;

            // Persist to localStorage (best-effort)
            try {
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(next));
                }
            } catch {
                // ignore quota / serialization errors
            }

            return next;
        });
    }, [key]);

    // Re-hydrate if the key changes
    useEffect(() => {
        const v = readValue();
        latestRef.current = v;
        setStoredValue(v);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return [storedValue, setValue];
}
