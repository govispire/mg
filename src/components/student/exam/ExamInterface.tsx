import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ExamConfig } from '@/types/exam';
import { useExamSession } from '@/hooks/exam/useExamSession';
import { ExamTimer } from './ExamTimer';
import { QuestionPalette } from './QuestionPalette';
import { QuestionDisplay } from './QuestionDisplay';
import { SectionNavigator } from './SectionNavigator';
import { ExamActionButtons } from './ExamActionButtons';
import { Button } from '@/components/ui/button';
import { Info, Pause, Play, WifiOff, Wifi, CheckCircle2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ExamInterfaceProps {
    examConfig: ExamConfig;
    onSubmit: (responses: Record<string, string | string[] | null>) => void;
    userName?: string;
    userAvatar?: string;
}

export const ExamInterface: React.FC<ExamInterfaceProps> = ({
    examConfig,
    onSubmit,
    userName,
    userAvatar
}) => {
    const {
        sessionState,
        currentQuestion,
        currentSection,
        allQuestions,
        navigateToQuestion,
        navigateToSection,
        goToNext,
        goToPrevious,
        saveAndNavigate,      // ← atomic: save + navigate in one setState
        markAndNavigate,      // ← atomic: mark + save + navigate in one setState
        markForReview,
        clearResponse,
        pauseExam,
        resumeExam,
        submitExam,
        setLanguage,
        getStats,
    } = useExamSession(examConfig);

    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showOfflineBanner, setShowOfflineBanner] = useState(false);

    // ── LOCAL answer state (not persisted until Save & Next) ──────────
    // This keeps the radio selection separate from the saved palette state.
    const [localAnswer, setLocalAnswer] = useState<string | string[] | null>(null);
    const [hasUnsavedChange, setHasUnsavedChange] = useState(false);
    const [savedFlash, setSavedFlash] = useState(false);   // "Saved ✓" flash

    // Sync local answer when question changes (load saved answer into local display)
    useEffect(() => {
        const saved = currentQuestion
            ? sessionState.questionStates[currentQuestion.id]?.selectedAnswer ?? null
            : null;
        setLocalAnswer(saved);
        setHasUnsavedChange(false);
    }, [currentQuestion?.id]);

    // Track remaining seconds for pause/save
    const remainingSecondsRef = useRef<number>(
        sessionState.remainingTime ?? examConfig.totalDuration * 60
    );

    // ── Network Online / Offline ──────────────────────────────────────
    useEffect(() => {
        const handleOffline = () => {
            setIsOnline(false);
            setShowOfflineBanner(true);
            pauseExam(remainingSecondsRef.current);
        };
        const handleOnline = () => {
            setIsOnline(true);
            setShowOfflineBanner(true);
            setTimeout(() => setShowOfflineBanner(false), 3000);
        };
        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, [pauseExam]);

    // ── Auto-save on hide/close ───────────────────────────────────────
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !sessionState.isPaused) {
                pauseExam(remainingSecondsRef.current);
            }
        };
        const handleBeforeUnload = () => {
            pauseExam(remainingSecondsRef.current);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [sessionState.isPaused, pauseExam]);

    // ── Keyboard shortcut: Ctrl+Enter = Save & Next ───────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSaveAndNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [localAnswer, currentQuestion]);

    // ── Timer ─────────────────────────────────────────────────────────
    const handleTick = useCallback((remaining: number) => {
        remainingSecondsRef.current = remaining;
    }, []);

    const handleTimeUp = () => {
        // Auto-submit with whatever is saved in sessionState
        submitExam();
        const responses: Record<string, string | string[] | null> = {};
        Object.values(sessionState.questionStates).forEach(state => {
            responses[state.questionId] = state.selectedAnswer;
        });
        onSubmit(responses);
    };

    const handleWarning = (remainingSeconds: number) => {
        const minutes = Math.floor(remainingSeconds / 60);
        setWarningMessage(`Only ${minutes} minute${minutes !== 1 ? 's' : ''} remaining!`);
        setShowWarningDialog(true);
    };

    // ── Pause / Resume ────────────────────────────────────────────────
    const handlePause = () => pauseExam(remainingSecondsRef.current);
    const handleResume = () => resumeExam();

    // ── LOCAL answer change (no palette update yet) ───────────────────
    const handleAnswerChange = (answer: string | string[]) => {
        setLocalAnswer(answer);
        // Check if this differs from the persisted saved answer
        const saved = currentQuestion
            ? sessionState.questionStates[currentQuestion.id]?.selectedAnswer
            : null;
        setHasUnsavedChange(JSON.stringify(answer) !== JSON.stringify(saved));
    };

    // ── CLEAR RESPONSE ────────────────────────────────────────────────
    // Per spec: Only clears local display. Does NOT update palette.
    const handleClearResponse = () => {
        setLocalAnswer(null);
        setHasUnsavedChange(true);
    };

    // ── SAVE & NEXT (core action) — ATOMIC ───────────────────────────
    // saveAndNavigate does save + navigate in ONE setSessionState call.
    // This eliminates the race condition from two batched updates.
    const handleSaveAndNext = useCallback(() => {
        if (!currentQuestion) return;
        const nextIndex = sessionState.currentQuestionIndex + 1;
        const answer = (localAnswer !== null && localAnswer !== '') ? localAnswer : null;

        saveAndNavigate(
            currentQuestion.id,
            answer,
            false,        // mark for review = false
            nextIndex     // navigate to next
        );

        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1200);
        setHasUnsavedChange(false);
    }, [currentQuestion, localAnswer, saveAndNavigate, sessionState.currentQuestionIndex]);

    // ── MARK FOR REVIEW & NEXT — ATOMIC ──────────────────────────────
    const handleMarkAndNext = () => {
        if (!currentQuestion) return;
        const nextIndex = sessionState.currentQuestionIndex + 1;
        const answer = (localAnswer !== null && localAnswer !== '') ? localAnswer : null;

        markAndNavigate(
            currentQuestion.id,
            answer,
            nextIndex
        );
        setHasUnsavedChange(false);
    };

    // ── PREVIOUS (no save) ────────────────────────────────────────────
    const handlePrevious = () => {
        // Per spec: Previous does NOT save current answer
        goToPrevious();
    };

    // ── SUBMIT ────────────────────────────────────────────────────────
    const handleSubmitClick = () => {
        const stats = getStats();
        if (stats.notAnswered > 0 || stats.notVisited > 0) {
            setShowSubmitDialog(true);
        } else {
            handleFinalSubmit();
        }
    };

    const handleFinalSubmit = () => {
        submitExam();
        const responses: Record<string, string | string[] | null> = {};
        Object.values(sessionState.questionStates).forEach(state => {
            responses[state.questionId] = state.selectedAnswer;
        });
        onSubmit(responses);
    };

    // ── Section stats ─────────────────────────────────────────────────
    const sectionStats: Record<string, { answered: number; total: number }> = {};
    examConfig.sections.forEach(section => {
        const sectionQs = section.questions
            .map(q => sessionState.questionStates[q.id])
            .filter(Boolean);
        const answered = sectionQs.filter(q => q.status === 2 || q.status === 4).length;
        sectionStats[section.id] = { answered, total: section.questions.length };
    });

    // ── Section-scoped palette (ONLY current section's questions) ────────
    const currentSectionStart = examConfig.sections
        .slice(0, sessionState.currentSectionIndex)
        .reduce((acc, s) => acc + s.questions.length, 0);

    const currentSectionQuestions = (currentSection?.questions ?? []).map((q, localIdx) => ({
        id: q.id,
        questionNumber: localIdx + 1,           // ← section-local: 1, 2, 3…
        sectionId: q.sectionId,
        status: sessionState.questionStates[q.id]?.status ?? 0,
        globalIndex: currentSectionStart + localIdx,
    }));

    // Section-local index for palette highlight
    const paletteCurrentIndex = Math.max(
        0,
        sessionState.currentQuestionIndex - currentSectionStart
    );

    // Section-local question number shown in "Question No. X" header
    const sectionLocalQuestionNumber = sessionState.currentQuestionIndex - currentSectionStart + 1;

    const currentQuestionState = currentQuestion
        ? sessionState.questionStates[currentQuestion.id]
        : null;

    const isPaused = sessionState.isPaused;

    // ── Computed flags ────────────────────────────────────────────────
    const isLastQuestion = sessionState.currentQuestionIndex === allQuestions.length - 1;
    const hasPrevious = sessionState.currentQuestionIndex > 0;

    return (
        <div className="h-screen flex flex-col bg-white">

            {/* ── Offline Banner ── */}
            {showOfflineBanner && (
                <div className={`px-4 py-1.5 text-sm font-medium flex items-center gap-2 justify-center
                    ${isOnline ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {isOnline
                        ? <><Wifi className="h-4 w-4" /> Connection restored — your progress was saved. You can resume.</>
                        : <><WifiOff className="h-4 w-4" /> Network lost — exam paused &amp; progress auto-saved.</>
                    }
                </div>
            )}

            {/* ── Warning Dialog ── */}
            <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-yellow-600" />
                            Time Warning
                        </DialogTitle>
                        <DialogDescription>{warningMessage}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowWarningDialog(false)}>OK</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Submit Confirmation Dialog ── */}
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Submission</DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-2 text-sm text-gray-700">
                                <div>You still have unanswered questions:</div>
                                <ul className="list-disc list-inside ml-2 space-y-1">
                                    <li><span className="font-semibold text-green-700">{getStats().answered}</span> answered</li>
                                    <li><span className="font-semibold text-red-600">{getStats().notAnswered}</span> not answered</li>
                                    <li><span className="font-semibold text-gray-500">{getStats().notVisited}</span> not visited</li>
                                    <li><span className="font-semibold text-purple-700">{getStats().markedForReview}</span> marked for review</li>
                                </ul>
                                <p className="pt-2 font-medium">Are you sure you want to submit?</p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Go Back</Button>
                        <Button onClick={handleFinalSubmit} className="bg-[#5b9dd9] hover:bg-[#4a8cc8]">Yes, Submit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Header ── */}
            <div className="bg-[#4a4a4a] text-white px-6 py-3 flex items-center justify-between border-b border-gray-600">
                <div>
                    <h1 className="text-xl font-bold">{examConfig.title}</h1>
                    <div className="text-xs text-gray-300">{currentSection?.name}</div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Saved flash indicator */}
                    {savedFlash && (
                        <div className="flex items-center gap-1.5 text-green-300 text-sm font-medium animate-pulse">
                            <CheckCircle2 className="h-4 w-4" />
                            Saved ✓
                        </div>
                    )}
                    {/* Unsaved change dot */}
                    {hasUnsavedChange && !savedFlash && (
                        <div className="flex items-center gap-1.5 text-yellow-300 text-xs">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                            Unsaved change
                        </div>
                    )}

                    <ExamTimer
                        totalDurationInSeconds={examConfig.totalDuration * 60}
                        initialRemainingSeconds={sessionState.remainingTime}
                        onTimeUp={handleTimeUp}
                        onWarning={handleWarning}
                        isPaused={isPaused}
                        onTick={handleTick}
                    />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={isPaused ? handleResume : handlePause}
                        className={`text-white hover:bg-gray-700 border gap-2 ${isPaused
                            ? 'border-green-400 bg-green-700/30 hover:bg-green-700/50'
                            : 'border-yellow-400 bg-yellow-700/20 hover:bg-yellow-700/40'
                            }`}
                    >
                        {isPaused
                            ? <><Play className="h-4 w-4" /> Resume</>
                            : <><Pause className="h-4 w-4" /> Pause</>
                        }
                    </Button>

                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                        <Info className="h-4 w-4 mr-2" />
                        Instructions
                    </Button>
                </div>
            </div>

            {/* ── Section Navigator ── */}
            <SectionNavigator
                sections={examConfig.sections}
                currentSectionIndex={sessionState.currentSectionIndex}
                onSectionChange={navigateToSection}
                sectionStats={sectionStats}
            />

            {/* ── PAUSED OVERLAY ── */}
            {isPaused && (
                <div className="flex-1 flex items-center justify-center bg-gray-900/95">
                    <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full mx-4 text-center">
                        <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
                            <Pause className="h-10 w-10 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Paused</h2>
                        <p className="text-gray-600 mb-2">Your progress has been saved automatically.</p>
                        <p className="text-sm text-gray-500 mb-8">
                            Resume from <strong>Question No. {sectionLocalQuestionNumber}</strong>,{' '}
                            Section: <strong>{currentSection?.name}</strong>
                        </p>
                        <Button
                            onClick={handleResume}
                            size="lg"
                            className="w-full bg-[#2196f3] hover:bg-[#1976d2] text-white gap-2 text-base"
                        >
                            <Play className="h-5 w-5" /> Resume Exam
                        </Button>
                        {!isOnline && (
                            <p className="mt-4 text-sm text-red-600 flex items-center justify-center gap-1">
                                <WifiOff className="h-4 w-4" /> No internet — reconnect before resuming.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ── Main Content ── */}
            {!isPaused && (
                <div className="flex flex-1 overflow-hidden relative">
                    {/* Question Area */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {currentQuestion && (
                            <QuestionDisplay
                                question={currentQuestion}
                                /* Use LOCAL answer for display — not the saved state */
                                selectedAnswer={localAnswer}
                                onAnswerChange={handleAnswerChange}
                                questionNumber={sectionLocalQuestionNumber}
                            />
                        )}
                    </div>

                    {/* Question Palette — section-scoped */}
                    <QuestionPalette
                        questions={currentSectionQuestions}
                        currentQuestionIndex={paletteCurrentIndex}
                        onQuestionSelect={(localIdx) => {
                            const item = currentSectionQuestions[localIdx];
                            if (item) navigateToQuestion(item.globalIndex);
                        }}
                        language={sessionState.language}
                        onLanguageChange={setLanguage}
                        sectionName={currentSection?.name || ''}
                        userName={userName}
                        userAvatar={userAvatar}
                        isCollapsed={isPaletteCollapsed}
                        onToggleCollapse={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
                    />
                </div>
            )}

            {/* ── Action Buttons — shows keyboard hint ── */}
            {!isPaused && (
                <ExamActionButtons
                    onMarkAndNext={handleMarkAndNext}
                    onClearResponse={handleClearResponse}
                    onSaveAndNext={handleSaveAndNext}
                    onPrevious={hasPrevious ? handlePrevious : undefined}
                    onSubmit={handleSubmitClick}
                    hasPrevious={hasPrevious}
                    isLastQuestion={isLastQuestion}
                    hasAnswer={localAnswer !== null && localAnswer !== ''}
                    hasUnsavedChange={hasUnsavedChange}
                />
            )}
        </div>
    );
};
