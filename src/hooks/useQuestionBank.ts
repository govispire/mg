/**
 * useQuestionBank
 * localStorage-backed store for exam questions with real-time BroadcastChannel sync.
 * Key format: `qbank_${testId}`
 */

const CHANNEL_NAME = 'qbank_sync';
const KEY_PREFIX = 'qbank_';

// ─── Question Types ────────────────────────────────────────────────────────────

export type QuestionType =
    | 'mcq'            // Single-correct MCQ
    | 'msq'            // Multi-select (checkboxes)
    | 'numerical'      // Integer / decimal answer input
    | 'multi'          // Multi-correct MCQ (admin internal label)
    | 'comprehension'  // Reading Comprehension (passage + sub-questions)
    | 'puzzle'         // Puzzle / Seating Arrangement (setup + sub-questions)
    | 'di'             // Data Interpretation (chart image / SVG + sub-questions)
    | 'caselet'        // Caselet DI (short paragraph + sub-questions)
    | 'input_output'   // Input-Output / Word Transformation (rules + sub-questions)
    | 'fillblank'      // Fill in the blank
    | 'truefalse';     // True / False

export interface Option {
    id: string;   // a, b, c, d, e
    text: string;
}

/** A sub-question used inside comprehension/puzzle/di/caselet/input_output */
export interface SubQuestion {
    id: string;
    text: string;
    options: Option[];
    correctOptions: string[];  // option ids
    explanation?: string;
}

// Discriminated union by type
export interface MCQQuestion {
    id: string;
    type: 'mcq' | 'msq';
    text: string;
    options: Option[];
    correctOption: string; // single for mcq, space-separated for msq
    explanation?: string;
    marks: number;
    negativeMark: number;
    imageUrl?: string; // optional image with the question
}

export interface NumericalQuestion {
    id: string;
    type: 'numerical';
    text: string;
    correctAnswer: number | string; // exact numeric answer
    tolerance?: number; // acceptable range ±
    explanation?: string;
    marks: number;
    negativeMark: number;
    imageUrl?: string;
}

export interface MultiQuestion {
    id: string;
    type: 'multi';
    text: string;
    options: Option[];
    correctOptions: string[]; // multiple option ids
    explanation?: string;
    marks: number;
    negativeMark: number;
}

export interface ComprehensionQuestion {
    id: string;
    type: 'comprehension';
    passage: string;  // left-panel passage text (HTML or plain)
    subQuestions: SubQuestion[];
    marks: number;         // per sub-question
    negativeMark: number;
}

export interface PuzzleQuestion {
    id: string;
    type: 'puzzle';
    setup: string;    // the puzzle/arrangement description paragraph
    clues?: string;   // optional additional clues
    subQuestions: SubQuestion[];
    marks: number;
    negativeMark: number;
}

/** Data Interpretation — shared content is an image/SVG/table */
export interface DIQuestion {
    id: string;
    type: 'di';
    title: string;           // "Study the following bar graph..."
    sharedContent: string;   // HTML with SVG chart / <img> / <table>
    imageUrl?: string;       // optional uploaded chart image URL
    subQuestions: SubQuestion[];
    marks: number;
    negativeMark: number;
}

/** Caselet DI — short paragraph followed by sub-questions */
export interface CaseletQuestion {
    id: string;
    type: 'caselet';
    title: string;
    passage: string;   // short paragraph
    subQuestions: SubQuestion[];
    marks: number;
    negativeMark: number;
}

/** Input-Output / Word Transformation */
export interface InputOutputQuestion {
    id: string;
    type: 'input_output';
    title: string;
    rules: string;   // transformation rules / step description
    example?: string; // optional worked example
    subQuestions: SubQuestion[];
    marks: number;
    negativeMark: number;
}

export interface FillBlankQuestion {
    id: string;
    type: 'fillblank';
    text: string;    // sentence with ___ for blank
    options: Option[];
    correctOption: string;
    explanation?: string;
    marks: number;
    negativeMark: number;
}

export interface TrueFalseQuestion {
    id: string;
    type: 'truefalse';
    text: string;
    correct: 'true' | 'false';
    explanation?: string;
    marks: number;
    negativeMark: number;
}

export type Question =
    | MCQQuestion
    | NumericalQuestion
    | MultiQuestion
    | ComprehensionQuestion
    | PuzzleQuestion
    | DIQuestion
    | CaseletQuestion
    | InputOutputQuestion
    | FillBlankQuestion
    | TrueFalseQuestion;

// ─── Storage helpers ──────────────────────────────────────────────────────────

const storageKey = (testId: string) => `${KEY_PREFIX}${testId}`;

const load = (testId: string): Question[] => {
    try {
        const raw = localStorage.getItem(storageKey(testId));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const save = (testId: string, questions: Question[]): void => {
    localStorage.setItem(storageKey(testId), JSON.stringify(questions));
};

// ─── ID helper ────────────────────────────────────────────────────────────────

export const newId = () => Math.random().toString(36).slice(2, 10);

export const defaultOptions = (): Option[] => [
    { id: 'a', text: '' },
    { id: 'b', text: '' },
    { id: 'c', text: '' },
    { id: 'd', text: '' },
];

export const defaultSubQuestion = (): SubQuestion => ({
    id: newId(),
    text: '',
    options: [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' },
        { id: 'e', text: '' },
    ],
    correctOptions: [],
    explanation: '',
});

// ─── Hook ─────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';

export function useQuestionBank(testId: string) {
    const [questions, setQuestions] = useState<Question[]>(() => load(testId));

    // BroadcastChannel for cross-tab sync
    useEffect(() => {
        const ch = new BroadcastChannel(CHANNEL_NAME);
        ch.onmessage = (e) => {
            if (e.data?.testId === testId) {
                setQuestions(load(testId));
            }
        };
        return () => ch.close();
    }, [testId]);

    // Same-tab sync
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.testId === testId) setQuestions(load(testId));
        };
        window.addEventListener('qbank_updated', handler);
        return () => window.removeEventListener('qbank_updated', handler);
    }, [testId]);

    const broadcast = useCallback(() => {
        try {
            const ch = new BroadcastChannel(CHANNEL_NAME);
            ch.postMessage({ testId });
            ch.close();
        } catch { /* ignore */ }
        window.dispatchEvent(new CustomEvent('qbank_updated', { detail: { testId } }));
    }, [testId]);

    const persist = useCallback((qs: Question[]) => {
        save(testId, qs);
        setQuestions(qs);
        broadcast();
    }, [testId, broadcast]);

    const addQuestion = useCallback((q: Question) => {
        const next = [...questions, q];
        persist(next);
    }, [questions, persist]);

    const updateQuestion = useCallback((id: string, updated: Partial<Question>) => {
        const next = questions.map(q => q.id === id ? { ...q, ...updated } as Question : q);
        persist(next);
    }, [questions, persist]);

    const deleteQuestion = useCallback((id: string) => {
        persist(questions.filter(q => q.id !== id));
    }, [questions, persist]);

    const reorderQuestions = useCallback((newOrder: Question[]) => {
        persist(newOrder);
    }, [persist]);

    const importBulk = useCallback((incoming: Question[]) => {
        persist([...questions, ...incoming]);
    }, [questions, persist]);

    const clearAll = useCallback(() => persist([]), [persist]);

    return {
        questions,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        reorderQuestions,
        importBulk,
        clearAll,
        totalCount: questions.length,
    };
}
