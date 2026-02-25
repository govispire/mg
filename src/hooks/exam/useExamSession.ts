import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
    ExamSessionState,
    QuestionState,
    QuestionStatus,
    ExamConfig,
    ExamQuestion
} from '@/types/exam';

export function useExamSession(examConfig: ExamConfig) {
    const [sessionState, setSessionState] = useLocalStorage<ExamSessionState>(
        `exam-session-${examConfig.id}`,
        {
            examId: examConfig.id,
            currentQuestionIndex: 0,
            currentSectionIndex: 0,
            questionStates: {},
            startTime: Date.now(),
            endTime: Date.now() + examConfig.totalDuration * 60 * 1000,
            remainingTime: examConfig.totalDuration * 60,
            language: 'English',
            isSubmitted: false,
            isPaused: false,
        }
    );

    // Initialize question states if empty
    useEffect(() => {
        if (Object.keys(sessionState.questionStates).length === 0) {
            const initialStates: Record<string, QuestionState> = {};
            examConfig.sections.forEach(section => {
                section.questions.forEach(question => {
                    initialStates[question.id] = {
                        questionId: question.id,
                        status: QuestionStatus.NOT_VISITED,
                        selectedAnswer: null,
                        markedForReview: false,
                        timeTaken: 0,
                    };
                });
            });
            setSessionState(prev => ({ ...prev, questionStates: initialStates }));
        }
    }, [examConfig, sessionState.questionStates, setSessionState]);

    // Get all questions across all sections
    const allQuestions = examConfig.sections.flatMap(s => s.questions);
    const currentQuestion = allQuestions[sessionState.currentQuestionIndex];
    const currentSection = examConfig.sections[sessionState.currentSectionIndex];

    // Navigation functions
    const navigateToQuestion = useCallback((index: number) => {
        if (index >= 0 && index < allQuestions.length) {
            // Mark current question as visited
            const question = allQuestions[index];
            setSessionState(prev => {
                const currentState = prev.questionStates[question.id];
                if (currentState.status === QuestionStatus.NOT_VISITED) {
                    return {
                        ...prev,
                        currentQuestionIndex: index,
                        questionStates: {
                            ...prev.questionStates,
                            [question.id]: {
                                ...currentState,
                                status: QuestionStatus.NOT_ANSWERED,
                                visitedAt: Date.now(),
                            },
                        },
                    };
                }
                return {
                    ...prev,
                    currentQuestionIndex: index,
                };
            });
        }
    }, [allQuestions, setSessionState]);

    const navigateToSection = useCallback((sectionIndex: number) => {
        if (sectionIndex >= 0 && sectionIndex < examConfig.sections.length) {
            // Find first question of that section
            let questionIndex = 0;
            for (let i = 0; i < sectionIndex; i++) {
                questionIndex += examConfig.sections[i].questions.length;
            }
            setSessionState(prev => ({
                ...prev,
                currentSectionIndex: sectionIndex,
            }));
            navigateToQuestion(questionIndex);
        }
    }, [examConfig.sections, navigateToQuestion, setSessionState]);

    const goToNext = useCallback(() => {
        navigateToQuestion(sessionState.currentQuestionIndex + 1);
    }, [sessionState.currentQuestionIndex, navigateToQuestion]);

    const goToPrevious = useCallback(() => {
        navigateToQuestion(sessionState.currentQuestionIndex - 1);
    }, [sessionState.currentQuestionIndex, navigateToQuestion]);

    // Answer functions
    const saveAnswer = useCallback((questionId: string, answer: string | string[]) => {
        setSessionState(prev => {
            const currentState = prev.questionStates[questionId];
            return {
                ...prev,
                questionStates: {
                    ...prev.questionStates,
                    [questionId]: {
                        ...currentState,
                        selectedAnswer: answer,
                        status: currentState.markedForReview
                            ? QuestionStatus.ANSWERED_AND_MARKED
                            : QuestionStatus.ANSWERED,
                    },
                },
            };
        });
    }, [setSessionState]);

    const markForReview = useCallback((questionId: string) => {
        setSessionState(prev => {
            const currentState = prev.questionStates[questionId];
            const isMarked = !currentState.markedForReview;
            let newStatus = currentState.status;

            if (isMarked) {
                newStatus = currentState.selectedAnswer
                    ? QuestionStatus.ANSWERED_AND_MARKED
                    : QuestionStatus.MARKED_FOR_REVIEW;
            } else {
                newStatus = currentState.selectedAnswer
                    ? QuestionStatus.ANSWERED
                    : QuestionStatus.NOT_ANSWERED;
            }

            return {
                ...prev,
                questionStates: {
                    ...prev.questionStates,
                    [questionId]: {
                        ...currentState,
                        markedForReview: isMarked,
                        status: newStatus,
                    },
                },
            };
        });
    }, [setSessionState]);

    const clearResponse = useCallback((questionId: string) => {
        setSessionState(prev => {
            const currentState = prev.questionStates[questionId];
            return {
                ...prev,
                questionStates: {
                    ...prev.questionStates,
                    [questionId]: {
                        ...currentState,
                        selectedAnswer: null,
                        status: currentState.markedForReview
                            ? QuestionStatus.MARKED_FOR_REVIEW
                            : QuestionStatus.NOT_ANSWERED,
                    },
                },
            };
        });
    }, [setSessionState]);

    const saveAndNext = useCallback(() => {
        if (currentQuestion && sessionState.questionStates[currentQuestion.id]?.selectedAnswer) {
            goToNext();
        }
    }, [currentQuestion, sessionState.questionStates, goToNext]);

    const markAndNext = useCallback(() => {
        if (currentQuestion) {
            markForReview(currentQuestion.id);
            goToNext();
        }
    }, [currentQuestion, markForReview, goToNext]);

    // Submit exam
    const submitExam = useCallback(() => {
        setSessionState(prev => ({
            ...prev,
            isSubmitted: true,
            endTime: Date.now(),
        }));
    }, [setSessionState]);

    // Change language
    const setLanguage = useCallback((lang: 'English' | 'Hindi') => {
        setSessionState(prev => ({ ...prev, language: lang }));
    }, [setSessionState]);

    // Get statistics
    const getStats = useCallback(() => {
        const states = Object.values(sessionState.questionStates);
        return {
            total: states.length,
            answered: states.filter(s => s.status === QuestionStatus.ANSWERED || s.status === QuestionStatus.ANSWERED_AND_MARKED).length,
            notAnswered: states.filter(s => s.status === QuestionStatus.NOT_ANSWERED).length,
            notVisited: states.filter(s => s.status === QuestionStatus.NOT_VISITED).length,
            markedForReview: states.filter(s => s.markedForReview).length,
        };
    }, [sessionState.questionStates]);

    // Reset session
    const resetSession = useCallback(() => {
        const initialStates: Record<string, QuestionState> = {};
        examConfig.sections.forEach(section => {
            section.questions.forEach(question => {
                initialStates[question.id] = {
                    questionId: question.id,
                    status: QuestionStatus.NOT_VISITED,
                    selectedAnswer: null,
                    markedForReview: false,
                    timeTaken: 0,
                };
            });
        });

        setSessionState({
            examId: examConfig.id,
            currentQuestionIndex: 0,
            currentSectionIndex: 0,
            questionStates: initialStates,
            startTime: Date.now(),
            endTime: Date.now() + examConfig.totalDuration * 60 * 1000,
            remainingTime: examConfig.totalDuration * 60,
            language: 'English',
            isSubmitted: false,
            isPaused: false,
        });
    }, [examConfig, setSessionState]);

    return {
        sessionState,
        currentQuestion,
        currentSection,
        allQuestions,
        // Navigation
        navigateToQuestion,
        navigateToSection,
        goToNext,
        goToPrevious,
        // Answer actions
        saveAnswer,
        markForReview,
        clearResponse,
        saveAndNext,
        markAndNext,
        // Exam actions
        submitExam,
        setLanguage,
        resetSession,
        // Stats
        getStats,
    };
}
