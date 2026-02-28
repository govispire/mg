import { useState, useEffect, useRef } from 'react';
import { QuestionSet } from '@/types/exam';

// Module-level cache so sets are shared across all hook instances
// and survive component re-mounts within the same page session.
const setCache = new Map<string, QuestionSet>();

type Status = 'idle' | 'loading' | 'success' | 'error';

interface UseQuestionSetResult {
    questionSet: QuestionSet | null;
    status: Status;
    error: string | null;
}

/**
 * Fetches a QuestionSet by ID and caches it for the lifetime of the page.
 *
 * Usage:
 *   const { questionSet, status } = useQuestionSet(question.setId, question.set);
 *
 * - If `inlineSet` is provided (bundled with the question payload), it is used
 *   immediately with no network request.
 * - Otherwise fetches GET /api/sets/{setId} once and caches the result.
 * - Returns null while loading or on error.
 */
export function useQuestionSet(
    setId: string | undefined,
    inlineSet?: QuestionSet
): UseQuestionSetResult {
    const [questionSet, setQuestionSet] = useState<QuestionSet | null>(
        inlineSet ?? (setId ? (setCache.get(setId) ?? null) : null)
    );
    const [status, setStatus] = useState<Status>(
        inlineSet || (setId && setCache.has(setId)) ? 'success' : setId ? 'idle' : 'idle'
    );
    const [error, setError] = useState<string | null>(null);
    const fetchedRef = useRef(false);

    useEffect(() => {
        // Use inline data if available
        if (inlineSet) {
            setQuestionSet(inlineSet);
            setStatus('success');
            if (setId) setCache.set(setId, inlineSet);
            return;
        }

        if (!setId) return;

        // Already cached
        if (setCache.has(setId)) {
            setQuestionSet(setCache.get(setId)!);
            setStatus('success');
            return;
        }

        // Avoid duplicate fetches in StrictMode double-invoke
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        setStatus('loading');
        fetch(`/api/sets/${setId}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<QuestionSet>;
            })
            .then(data => {
                setCache.set(setId, data);
                setQuestionSet(data);
                setStatus('success');
            })
            .catch(err => {
                setError(err instanceof Error ? err.message : 'Failed to load set');
                setStatus('error');
            });
    }, [setId, inlineSet]);

    return { questionSet, status, error };
}
