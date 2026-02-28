import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
    ExamSessionState,
    QuestionState,
    QuestionStatus,
    ExamConfig,
} from '@/types/exam';

// ─────────────────────────────────────────────────────────────────────────────
// COMPUTED STATUS — never store status directly; always derive it from flags.
// This is the single source of truth for palette colours.
// ─────────────────────────────────────────────────────────────────────────────
export function getStatus(q: QuestionState): QuestionStatus {
    if (!q.isVisited) return QuestionStatus.NOT_VISITED;
    if (q.markedForReview && q.isSaved && q.selectedAnswer)
        return QuestionStatus.ANSWERED_AND_MARKED;
    if (q.markedForReview)
        return QuestionStatus.MARKED_FOR_REVIEW;
    if (q.isSaved && q.selectedAnswer)
        return QuestionStatus.ANSWERED;
    return QuestionStatus.NOT_ANSWERED;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build a pristine question state for all questions in an exam config
// ─────────────────────────────────────────────────────────────────────────────
function buildFreshStates(examConfig: ExamConfig): Record<string, QuestionState> {
    const states: Record<string, QuestionState> = {};
    examConfig.sections.forEach(section => {
        section.questions.forEach(q => {
            states[q.id] = {
                questionId: q.id,
                // ← always start NOT_VISITED; isVisited/isSaved drive getStatus()
                status: QuestionStatus.NOT_VISITED,
                isVisited: false,
                isSaved: false,
                selectedAnswer: null,
                markedForReview: false,
                timeTaken: 0,
            };
        });
    });
    return states;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useExamSession(examConfig: ExamConfig) {

    // All question IDs expected by this config
    const allQuestionIds = examConfig.sections.flatMap(s => s.questions.map(q => q.id));

    const [sessionState, setSessionState] = useLocalStorage<ExamSessionState>(
        `exam-session-${examConfig.id}`,
        {
            examId: examConfig.id,
            currentQuestionIndex: 0,
            currentSectionIndex: 0,
            questionStates: buildFreshStates(examConfig),
            startTime: Date.now(),
            endTime: Date.now() + examConfig.totalDuration * 60 * 1000,
            remainingTime: examConfig.totalDuration * 60,
            language: 'English',
            isSubmitted: false,
            isPaused: false,
        }
    );

    // ── Stale-session detection (runs once per examId change) ──────────────
    useEffect(() => {
        const storedIds = Object.keys(sessionState.questionStates ?? {});
        const isStale =
            sessionState.examId !== examConfig.id ||
            storedIds.length !== allQuestionIds.length ||
            allQuestionIds.some(id => !sessionState.questionStates[id]);

        if (isStale) {
            setSessionState({
                examId: examConfig.id,
                currentQuestionIndex: 0,
                currentSectionIndex: 0,
                questionStates: buildFreshStates(examConfig),
                startTime: Date.now(),
                endTime: Date.now() + examConfig.totalDuration * 60 * 1000,
                remainingTime: examConfig.totalDuration * 60,
                language: 'English',
                isSubmitted: false,
                isPaused: false,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [examConfig.id]);

    // Computed helpers
    const allQuestions = examConfig.sections.flatMap(s => s.questions);
    const currentQuestion = allQuestions[sessionState.currentQuestionIndex];
    const currentSection = examConfig.sections[sessionState.currentSectionIndex];

    // ── Single update helper — ensures atomic state update ─────────────────
    // Always use this instead of multiple setSessionState calls.
    const updateState = useCallback(
        (updater: (prev: ExamSessionState) => ExamSessionState) => {
            setSessionState(updater);
        },
        [setSessionState]
    );

    // ── Navigate to question ───────────────────────────────────────────────
    // Sets isVisited=true on the destination question (first visit).
    // Does NOT change current question's state.
    const navigateToQuestion = useCallback((index: number) => {
        if (index < 0 || index >= allQuestions.length) return;
        const destQuestion = allQuestions[index];

        // Determine which section this index belongs to
        let sectionIndex = 0;
        let count = 0;
        for (let i = 0; i < examConfig.sections.length; i++) {
            count += examConfig.sections[i].questions.length;
            if (index < count) { sectionIndex = i; break; }
        }

        updateState(prev => {
            const qs = prev.questionStates;
            const dest = qs[destQuestion.id];
            if (!dest) return prev;

            const visitedDest: QuestionState = dest.isVisited
                ? dest
                : { ...dest, isVisited: true };
            // Recompute status from flags
            const updatedDest: QuestionState = {
                ...visitedDest,
                status: getStatus(visitedDest),
            };

            return {
                ...prev,
                currentQuestionIndex: index,
                currentSectionIndex: sectionIndex,
                questionStates: dest.isVisited
                    ? { ...qs }      // no change if already visited
                    : { ...qs, [destQuestion.id]: updatedDest },
            };
        });
    }, [allQuestions, examConfig.sections, updateState]);

    const navigateToSection = useCallback((sectionIndex: number) => {
        if (sectionIndex < 0 || sectionIndex >= examConfig.sections.length) return;
        let startIdx = 0;
        for (let i = 0; i < sectionIndex; i++) {
            startIdx += examConfig.sections[i].questions.length;
        }
        navigateToQuestion(startIdx);
    }, [examConfig.sections, navigateToQuestion]);

    const goToNext = useCallback(() => {
        navigateToQuestion(sessionState.currentQuestionIndex + 1);
    }, [sessionState.currentQuestionIndex, navigateToQuestion]);

    const goToPrevious = useCallback(() => {
        navigateToQuestion(sessionState.currentQuestionIndex - 1);
    }, [sessionState.currentQuestionIndex, navigateToQuestion]);

    // ── Save answer — marks isSaved=true, recomputes status ────────────────
    const saveAnswer = useCallback((questionId: string, answer: string | string[]) => {
        updateState(prev => {
            const qs = prev.questionStates;
            const q = qs[questionId];
            if (!q) return prev;
            const updated: QuestionState = {
                ...q,
                isVisited: true,
                isSaved: true,
                selectedAnswer: answer,
                markedForReview: q.markedForReview,
            };
            updated.status = getStatus(updated);
            return { ...prev, questionStates: { ...qs, [questionId]: updated } };
        });
    }, [updateState]);

    // ── Save answer & navigate in ONE atomic update ─────────────────────────
    // This is the key: we do BOTH the save AND the navigate in a single
    // setSessionState call so there's no race condition between two batched calls.
    const saveAndNavigate = useCallback((
        questionId: string,
        answer: string | string[] | null,
        markForReviewFlag: boolean,
        nextIndex: number
    ) => {
        updateState(prev => {
            const qs = { ...prev.questionStates };

            // 1. Update current question state
            const currentQ = qs[questionId];
            if (currentQ) {
                const updated: QuestionState = {
                    ...currentQ,
                    isVisited: true,
                    isSaved: answer !== null,
                    selectedAnswer: answer,
                    markedForReview: markForReviewFlag,
                };
                updated.status = getStatus(updated);
                qs[questionId] = updated;
            }

            // 2. Mark destination question as visited (if valid and not visited)
            let newSectionIndex = prev.currentSectionIndex;
            if (nextIndex >= 0 && nextIndex < allQuestions.length) {
                const destQ = allQuestions[nextIndex];
                const dest = qs[destQ.id];
                if (dest && !dest.isVisited) {
                    const visitedDest: QuestionState = { ...dest, isVisited: true };
                    visitedDest.status = getStatus(visitedDest);
                    qs[destQ.id] = visitedDest;
                }
                // Compute new section index
                let count = 0;
                for (let i = 0; i < examConfig.sections.length; i++) {
                    count += examConfig.sections[i].questions.length;
                    if (nextIndex < count) { newSectionIndex = i; break; }
                }
            }

            return {
                ...prev,
                currentQuestionIndex: nextIndex >= 0 && nextIndex < allQuestions.length
                    ? nextIndex
                    : prev.currentQuestionIndex,
                currentSectionIndex: newSectionIndex,
                questionStates: qs,
            };
        });
    }, [allQuestions, examConfig.sections, updateState]);

    // ── Clear response ─────────────────────────────────────────────────────
    const clearResponse = useCallback((questionId: string) => {
        updateState(prev => {
            const qs = prev.questionStates;
            const q = qs[questionId];
            if (!q) return prev;
            const updated: QuestionState = {
                ...q,
                isVisited: true,
                isSaved: false,
                selectedAnswer: null,
            };
            updated.status = getStatus(updated);
            return { ...prev, questionStates: { ...qs, [questionId]: updated } };
        });
    }, [updateState]);

    // ── Mark for review ───────────────────────────────────────────────────
    const markForReview = useCallback((questionId: string) => {
        updateState(prev => {
            const qs = prev.questionStates;
            const q = qs[questionId];
            if (!q) return prev;
            const updated: QuestionState = {
                ...q,
                isVisited: true,
                markedForReview: !q.markedForReview,
            };
            updated.status = getStatus(updated);
            return { ...prev, questionStates: { ...qs, [questionId]: updated } };
        });
    }, [updateState]);

    // ── Mark & navigate atomically ─────────────────────────────────────────
    const markAndNavigate = useCallback((
        questionId: string,
        answer: string | string[] | null,
        nextIndex: number
    ) => {
        saveAndNavigate(questionId, answer, true, nextIndex);
    }, [saveAndNavigate]);

    // ── Palette stats ──────────────────────────────────────────────────────
    const getStats = useCallback(() => {
        const states = Object.values(sessionState.questionStates);
        return {
            answered: states.filter(q => getStatus(q) === QuestionStatus.ANSWERED).length,
            notAnswered: states.filter(q => getStatus(q) === QuestionStatus.NOT_ANSWERED).length,
            notVisited: states.filter(q => getStatus(q) === QuestionStatus.NOT_VISITED).length,
            markedForReview: states.filter(q => getStatus(q) === QuestionStatus.MARKED_FOR_REVIEW).length,
            answeredAndMarked: states.filter(q => getStatus(q) === QuestionStatus.ANSWERED_AND_MARKED).length,
            total: states.length,
        };
    }, [sessionState.questionStates]);

    // ── Pause / Resume ────────────────────────────────────────────────────
    const pauseExam = useCallback((remainingSeconds: number) => {
        updateState(prev => ({ ...prev, isPaused: true, remainingTime: remainingSeconds }));
    }, [updateState]);

    const resumeExam = useCallback(() => {
        updateState(prev => ({ ...prev, isPaused: false }));
    }, [updateState]);

    // ── Submit ────────────────────────────────────────────────────────────
    const submitExam = useCallback(() => {
        const responses: Record<string, string | string[] | null> = {};
        Object.entries(sessionState.questionStates).forEach(([qId, qs]) => {
            responses[qId] = qs.selectedAnswer;
        });
        return responses;
    }, [sessionState.questionStates]);

    // ── Language ──────────────────────────────────────────────────────────
    const setLanguage = useCallback((lang: 'English' | 'Hindi') => {
        updateState(prev => ({ ...prev, language: lang }));
    }, [updateState]);

    // ── Palette question states (re-computes status via getStatus) ─────────
    const questionStatesWithComputedStatus = useCallback(() => {
        const out: Record<string, QuestionState> = {};
        for (const [id, qs] of Object.entries(sessionState.questionStates)) {
            out[id] = { ...qs, status: getStatus(qs) };
        }
        return out;
    }, [sessionState.questionStates]);

    return {
        sessionState: {
            ...sessionState,
            // Always expose computed statuses for palette rendering
            questionStates: questionStatesWithComputedStatus(),
        },
        currentQuestion,
        currentSection,
        allQuestions,
        navigateToQuestion,
        navigateToSection,
        goToNext,
        goToPrevious,
        saveAnswer,
        saveAndNavigate,          // ← atomic save+navigate (USE THIS in ExamInterface)
        markAndNavigate,          // ← atomic mark+navigate
        markForReview,
        clearResponse,
        pauseExam,
        resumeExam,
        submitExam,
        setLanguage,
        getStats,
    };
}
