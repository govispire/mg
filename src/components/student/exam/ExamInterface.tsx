import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ExamConfig } from '@/types/exam';
import { useExamSession } from '@/hooks/exam/useExamSession';

import { SectionTimer } from './SectionTimer';
import { QuestionPalette } from './QuestionPalette';
import { QuestionDisplay } from './QuestionDisplay';
import { SectionNavigator } from './SectionNavigator';
import { ExamActionButtons } from './ExamActionButtons';
import { SectionSummaryModal } from './SectionSummaryModal';
import { Button } from '@/components/ui/button';
import { Info, Pause, Play, WifiOff, Wifi, CheckCircle2, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
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
    returnUrl?: string; // URL of the listing page this exam was launched from
}

// ── Helper: format seconds to mm:ss ───────────────────────────────────────
function fmtTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ── Per-section duration: use explicit duration, else split total evenly ──
function getSectionDurationSec(examConfig: ExamConfig, sectionIdx: number): number {
    const section = examConfig.sections[sectionIdx];
    if (section?.duration) return section.duration * 60;
    return Math.floor((examConfig.totalDuration / examConfig.sections.length) * 60);
}

export const ExamInterface: React.FC<ExamInterfaceProps> = ({
    examConfig,
    onSubmit,
    userName,
    userAvatar,
    returnUrl,
}) => {
    const {
        sessionState,
        currentQuestion,
        currentSection,
        allQuestions,
        navigateToQuestion,
        navigateToSection,
        goToPrevious,
        saveAndNavigate,
        markAndNavigate,
        pauseExam,
        resumeExam,
        submitExam,
        submitSection,
        tickSectionTime,
        setLanguage,
        getStats,
    } = useExamSession(examConfig);

    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fontSize, setFontSize] = useState(100);
    const [showPauseConfirm, setShowPauseConfirm] = useState(false);
    const incFont = useCallback(() => setFontSize(f => Math.min(140, f + 10)), []);
    const decFont = useCallback(() => setFontSize(f => Math.max(80, f - 10)), []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(() => { });
            setIsFullscreen(false);
        }
    }, []);

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    // ── LOCAL answer state ─────────────────────────────────────────────
    const [localAnswer, setLocalAnswer] = useState<string | string[] | null>(null);
    const [hasUnsavedChange, setHasUnsavedChange] = useState(false);
    const [savedFlash, setSavedFlash] = useState(false);

    // ── Section Summary Modal ──────────────────────────────────────────
    const [showSectionSummary, setShowSectionSummary] = useState(false);
    const [pendingSectionIndex, setPendingSectionIndex] = useState<number | null>(null);

    // ── Misc dialogs ───────────────────────────────────────────────────
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showOfflineBanner, setShowOfflineBanner] = useState(false);

    // ── Submit guards ──────────────────────────────────────────────────
    const sectionSubmitLockRef = useRef(false);
    const lastModalAtRef = useRef(0);

    // ── Refs ───────────────────────────────────────────────────────────
    const remainingSecondsRef = useRef<number>(
        sessionState.remainingTime ?? examConfig.totalDuration * 60
    );

    const currentSectionId = currentSection?.id ?? '';
    const currentSectionIdx = sessionState.currentSectionIndex;
    const isLastSection = currentSectionIdx === examConfig.sections.length - 1;
    const isSectionLocked = sessionState.submittedSections.includes(currentSectionId);

    // ── Sync local answer on question change ───────────────────────────
    useEffect(() => {
        const saved = currentQuestion
            ? sessionState.questionStates[currentQuestion.id]?.selectedAnswer ?? null
            : null;
        setLocalAnswer(saved);
        setHasUnsavedChange(false);
    }, [currentQuestion?.id]);

    // ── Network events ─────────────────────────────────────────────────
    useEffect(() => {
        const off = () => { setIsOnline(false); setShowOfflineBanner(true); pauseExam(remainingSecondsRef.current); };
        const on = () => { setIsOnline(true); setShowOfflineBanner(true); setTimeout(() => setShowOfflineBanner(false), 3000); };
        window.addEventListener('offline', off);
        window.addEventListener('online', on);
        return () => { window.removeEventListener('offline', off); window.removeEventListener('online', on); };
    }, [pauseExam]);

    // ── Visibility / beforeunload ──────────────────────────────────────
    useEffect(() => {
        const vis = () => { if (document.hidden && !sessionState.isPaused) pauseExam(remainingSecondsRef.current); };
        const bef = () => pauseExam(remainingSecondsRef.current);
        document.addEventListener('visibilitychange', vis);
        window.addEventListener('beforeunload', bef);
        return () => { document.removeEventListener('visibilitychange', vis); window.removeEventListener('beforeunload', bef); };
    }, [sessionState.isPaused, pauseExam]);

    // ── Ctrl+Enter shortcut ────────────────────────────────────────────
    useEffect(() => {
        const kd = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleSaveAndNext(); }
        };
        window.addEventListener('keydown', kd);
        return () => window.removeEventListener('keydown', kd);
    }, [localAnswer, currentQuestion]);

    // ─────────────────────────────────────────────────────────────────
    // PER-SECTION TIMER — handled via <SectionTimer key={sectionId} />
    // ─────────────────────────────────────────────────────────────────
    const sectionDurationSec = getSectionDurationSec(examConfig, currentSectionIdx);
    const storedSectionRemaining = sessionState.sectionRemainingTime[currentSectionId];
    const initialSectionRemaining = storedSectionRemaining !== undefined
        ? storedSectionRemaining
        : sectionDurationSec;

    const handleSectionTick = useCallback((remaining: number) => {
        tickSectionTime(currentSectionId, remaining);
    }, [currentSectionId, tickSectionTime]);

    /** Called when THIS section's timer expires — silent auto-submit */
    const handleSectionTimeUp = useCallback(() => {
        if (sectionSubmitLockRef.current) return;
        sectionSubmitLockRef.current = true;

        submitSection(currentSectionId);

        const nextIdx = currentSectionIdx + 1;
        if (nextIdx < examConfig.sections.length) {
            // Navigate to next section silently
            navigateToSection(nextIdx);
            toast.info(`"${currentSection?.name}" submitted — moving to next section.`, { duration: 4000 });
        } else {
            // Last section — end the exam
            toast.info('Time up! Submitting your test…', { duration: 3000 });
            handleFinalSubmit();
        }

        setTimeout(() => { sectionSubmitLockRef.current = false; }, 1000);
    }, [currentSectionId, currentSectionIdx, examConfig.sections.length, submitSection, navigateToSection, currentSection?.name]);

    // ── Total exam timer (for the header display) ──────────────────────
    const handleTick = useCallback((remaining: number) => {
        remainingSecondsRef.current = remaining;
    }, []);

    const handleTimeUp = useCallback(() => {
        // Total exam time up — auto-submit everything
        handleFinalSubmit();
    }, []);

    const handleWarning = (remainingSeconds: number) => {
        const minutes = Math.floor(remainingSeconds / 60);
        setWarningMessage(`Only ${minutes} minute${minutes !== 1 ? 's' : ''} remaining!`);
        setShowWarningDialog(true);
    };

    // ── Pause / Resume ─────────────────────────────────────────────────
    const handlePause = () => pauseExam(remainingSecondsRef.current);
    const handleResume = () => resumeExam();

    // ── Answer change ──────────────────────────────────────────────────
    const handleAnswerChange = (answer: string | string[]) => {
        setLocalAnswer(answer);
        const saved = currentQuestion
            ? sessionState.questionStates[currentQuestion.id]?.selectedAnswer
            : null;
        setHasUnsavedChange(JSON.stringify(answer) !== JSON.stringify(saved));
    };

    const handleClearResponse = () => {
        setLocalAnswer(null);
        setHasUnsavedChange(true);
    };

    //  SAVE & NEXT (clamped within current section) 
    // Section boundaries
    const sectionStartIndex = examConfig.sections
        .slice(0, currentSectionIdx)
        .reduce((acc, s) => acc + s.questions.length, 0);
    const sectionEndIndex = sectionStartIndex + (currentSection?.questions.length ?? 0) - 1;

    const handleSaveAndNext = useCallback(() => {
        if (!currentQuestion || isSectionLocked) return;
        // Do NOT jump past the last question of this section
        const nextIndex = Math.min(sessionState.currentQuestionIndex + 1, sectionEndIndex);
        const answer = (localAnswer !== null && localAnswer !== '') ? localAnswer : null;
        saveAndNavigate(currentQuestion.id, answer, false, nextIndex);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1200);
        setHasUnsavedChange(false);
    }, [currentQuestion, localAnswer, saveAndNavigate, sessionState.currentQuestionIndex, isSectionLocked, sectionEndIndex]);

    //  MARK & NEXT (clamped within current section) 
    const handleMarkAndNext = () => {
        if (!currentQuestion || isSectionLocked) return;
        const nextIndex = Math.min(sessionState.currentQuestionIndex + 1, sectionEndIndex);
        const answer = (localAnswer !== null && localAnswer !== '') ? localAnswer : null;
        markAndNavigate(currentQuestion.id, answer, nextIndex);
        setHasUnsavedChange(false);
    };

    const handlePrevious = () => {
        if (isSectionLocked) return;
        // Do NOT jump into the previous section
        const prevIndex = Math.max(sessionState.currentQuestionIndex - 1, sectionStartIndex);
        navigateToQuestion(prevIndex);
    };

    // ── FINAL EXAM SUBMIT ──────────────────────────────────────────────
    const handleFinalSubmit = useCallback(() => {
        submitExam();
        const responses: Record<string, string | string[] | null> = {};
        Object.values(sessionState.questionStates).forEach(state => {
            responses[state.questionId] = state.selectedAnswer;
        });
        onSubmit(responses);
    }, [submitExam, sessionState.questionStates, onSubmit]);

    // ─────────────────────────────────────────────────────────────────
    // SECTION SUBMIT FLOW
    // ─────────────────────────────────────────────────────────────────

    /** Compute stats for the summary modal */
    const getSectionStats = useCallback((sIdx: number) => {
        const section = examConfig.sections[sIdx];
        if (!section) return { total: 0, answered: 0, notAnswered: 0, marked: 0, notVisited: 0 };
        let answered = 0, notAnswered = 0, marked = 0, notVisited = 0;
        section.questions.forEach(q => {
            const qs = sessionState.questionStates[q.id];
            if (!qs || !qs.isVisited) { notVisited++; return; }
            if (qs.isSaved && qs.selectedAnswer) { answered++; }
            else { notAnswered++; }
            if (qs.markedForReview) { marked++; }
        });
        return { total: section.questions.length, answered, notAnswered, marked, notVisited };
    }, [examConfig.sections, sessionState.questionStates]);

    /** Open modal — always (no debounce for explicit Submit Section click) */
    const handleSubmitSectionClick = useCallback(() => {
        if (sectionSubmitLockRef.current) return;
        setPendingSectionIndex(currentSectionIdx);
        setShowSectionSummary(true);
    }, [currentSectionIdx]);

    /**
     * Section tab click — behaviour depends on sectionLockEnabled:
     *   true (default):  show confirm modal before leaving the section.
     *   false:           navigate freely between sections with no modal.
     */
    const sectionLockEnabled = examConfig.sectionLockEnabled !== false; // default true

    const handleSectionTabClick = useCallback((targetIdx: number) => {
        const targetSectionId = examConfig.sections[targetIdx]?.id;

        // Always block re-entry into already-submitted sections
        if (targetSectionId && sessionState.submittedSections.includes(targetSectionId)) {
            toast.warning('This section has already been submitted and cannot be re-opened.');
            return;
        }

        // Same section tab clicked — open submit modal (in both modes)
        if (targetIdx === currentSectionIdx) {
            handleSubmitSectionClick();
            return;
        }

        if (!sectionLockEnabled) {
            // FREE MODE: just navigate, no confirmation needed
            navigateToSection(targetIdx);
            return;
        }

        // LOCKED MODE: debounce rapid clicks, show confirm modal
        const now = Date.now();
        if (now - lastModalAtRef.current < 1500) {
            navigateToSection(targetIdx);
            return;
        }
        lastModalAtRef.current = now;
        setPendingSectionIndex(targetIdx);
        setShowSectionSummary(true);
    }, [currentSectionIdx, sessionState.submittedSections, examConfig.sections, sectionLockEnabled, navigateToSection, handleSubmitSectionClick]);

    /** Student confirms submit in the modal */
    const handleSectionSubmitConfirm = useCallback(() => {
        if (sectionSubmitLockRef.current) return;
        sectionSubmitLockRef.current = true;

        setShowSectionSummary(false);

        // Lock the current section
        submitSection(currentSectionId);

        if (pendingSectionIndex !== null && pendingSectionIndex !== currentSectionIdx) {
            // Going to a different (next) section
            const targetId = examConfig.sections[pendingSectionIndex]?.id;
            if (!targetId || !sessionState.submittedSections.includes(targetId)) {
                navigateToSection(pendingSectionIndex);
            }
        } else {
            // Advance to next unsubmitted section
            const nextUnsubmitted = examConfig.sections.findIndex(
                (s, i) => i > currentSectionIdx && !sessionState.submittedSections.includes(s.id) && s.id !== currentSectionId
            );
            if (nextUnsubmitted !== -1) {
                navigateToSection(nextUnsubmitted);
            } else {
                // All sections done — end exam
                toast.success('All sections submitted! Finishing test…', { duration: 2000 });
                setTimeout(() => handleFinalSubmit(), 1500);
            }
        }

        setPendingSectionIndex(null);
        setTimeout(() => { sectionSubmitLockRef.current = false; }, 500);
    }, [
        currentSectionId, currentSectionIdx, pendingSectionIndex,
        submitSection, navigateToSection, examConfig.sections,
        sessionState.submittedSections, handleFinalSubmit,
    ]);

    const handleSectionSummaryCancel = () => {
        setShowSectionSummary(false);
        setPendingSectionIndex(null);
    };

    // ── Section stats for navigator badges ────────────────────────────
    const sectionStats: Record<string, { answered: number; total: number }> = {};
    examConfig.sections.forEach(section => {
        const qs = section.questions.map(q => sessionState.questionStates[q.id]).filter(Boolean);
        const answered = qs.filter(q => q.status === 2 || q.status === 4).length;
        sectionStats[section.id] = { answered, total: section.questions.length };
    });

    // ── Section-scoped palette data ────────────────────────────────────
    const currentSectionStart = examConfig.sections
        .slice(0, currentSectionIdx)
        .reduce((acc, s) => acc + s.questions.length, 0);

    const currentSectionQuestions = (currentSection?.questions ?? []).map((q, localIdx) => ({
        id: q.id,
        questionNumber: localIdx + 1,
        sectionId: q.sectionId,
        status: sessionState.questionStates[q.id]?.status ?? 0,
        globalIndex: currentSectionStart + localIdx,
    }));

    const paletteCurrentIndex = Math.max(0, sessionState.currentQuestionIndex - currentSectionStart);
    const sectionLocalQuestionNumber = sessionState.currentQuestionIndex - currentSectionStart + 1;
    const isPaused = sessionState.isPaused;
    const hasPrevious = sessionState.currentQuestionIndex > 0;

    // Modal data
    const modalSectionIdx = pendingSectionIndex ?? currentSectionIdx;
    const modalSectionName = examConfig.sections[modalSectionIdx]?.name ?? '';
    const modalStats = getSectionStats(modalSectionIdx);

    return (
        <div className="h-screen flex flex-col bg-white">

            {/* ── Offline Banner ── */}
            {showOfflineBanner && (
                <div className={`px-4 py-1.5 text-sm font-medium flex items-center gap-2 justify-center
                    ${isOnline ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {isOnline
                        ? <><Wifi className="h-4 w-4" />Connection restored — your progress was saved.</>
                        : <><WifiOff className="h-4 w-4" />Network lost — exam paused &amp; progress auto-saved.</>
                    }
                </div>
            )}

            {/* ── Time Warning Dialog ── */}
            <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-yellow-600" /> Time Warning
                        </DialogTitle>
                        <DialogDescription>{warningMessage}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowWarningDialog(false)}>OK</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Section Summary Modal (full-screen overlay) ── */}
            <SectionSummaryModal
                open={showSectionSummary}
                sectionName={modalSectionName}
                stats={modalStats}
                onConfirm={handleSectionSubmitConfirm}
                onCancel={handleSectionSummaryCancel}
            />

            {/* ── Header ── */}
            <div className="bg-[#4a4a4a] text-white px-4 py-2.5 flex items-center border-b border-gray-600 relative">
                {/* Left — Logo */}
                <div className="flex items-center gap-2 w-1/4">
                    <div className="w-8 h-8 rounded bg-[#1976d2] flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                        P
                    </div>
                    <span className="text-xs text-gray-300 font-semibold hidden sm:block">PrepSmart</span>
                </div>

                {/* Centre — Exam title + section name */}
                <div className="flex-1 text-center">
                    <h1 className="text-base font-bold leading-tight">{examConfig.title}</h1>
                    <div className="text-[10px] text-gray-400">{currentSection?.name}</div>
                </div>

                {/* Right — Fullscreen only */}
                <div className="w-1/4 flex justify-end items-center gap-2">
                    {/* Saved flash */}
                    {savedFlash && (
                        <div className="flex items-center gap-1.5 text-green-300 text-xs font-medium animate-pulse">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                        </div>
                    )}
                    {hasUnsavedChange && !savedFlash && (
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    )}
                    {/* Hidden timer — drives tick & time-up */}
                    <span className="hidden">
                        <SectionTimer
                            key={currentSectionId}
                            totalSeconds={sectionDurationSec}
                            initialRemainingSeconds={initialSectionRemaining}
                            isPaused={isPaused}
                            onTimeUp={handleSectionTimeUp}
                            onTick={handleSectionTick}
                            isLocked={isSectionLocked}
                        />
                    </span>

                    <div className="flex items-center border border-gray-500 rounded overflow-hidden">
                        <button
                            onClick={decFont}
                            disabled={fontSize <= 80}
                            title="Decrease font size"
                            className="px-2 py-1 text-white bg-gray-600 hover:bg-gray-500 disabled:opacity-40 text-sm font-bold leading-none"
                        >A⁻</button>
                        <span className="px-1.5 text-xs text-gray-300 bg-gray-700 select-none">{fontSize}%</span>
                        <button
                            onClick={incFont}
                            disabled={fontSize >= 140}
                            title="Increase font size"
                            className="px-2 py-1 text-white bg-gray-600 hover:bg-gray-500 disabled:opacity-40 text-sm font-bold leading-none"
                        >A⁺</button>
                    </div>

                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 p-1.5" onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <SectionNavigator
                sections={examConfig.sections}
                currentSectionIndex={currentSectionIdx}
                onSectionChange={handleSectionTabClick}
                sectionStats={sectionStats}
                submittedSections={sessionState.submittedSections}
            />

            {/* ── Section info row: Sections label + Time Left + Pause ── */}
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-1.5 flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Sections</span>
                <div className="flex items-center gap-3">
                    <span className="text-gray-700 font-semibold border border-gray-400 rounded px-2.5 py-0.5 bg-white text-sm">
                        Time Left :&nbsp;{fmtTime(sessionState.sectionRemainingTime[currentSectionId] ?? initialSectionRemaining)}
                    </span>
                    <Button
                        variant="ghost" size="icon"
                        onClick={isPaused ? handleResume : () => setShowPauseConfirm(true)}
                        className="h-7 w-7 text-gray-600 hover:text-gray-900 hover:bg-transparent"
                        title={isPaused ? 'Resume exam' : 'Pause exam'}
                    >
                        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* ── Pause Confirmation Dialog ── */}
            {showPauseConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
                        <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                            <Pause className="h-7 w-7 text-yellow-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Pause the Exam?</h2>
                        <p className="text-sm text-gray-600 mb-1">The timer will stop while the exam is paused.</p>
                        <p className="text-sm text-red-500 font-medium mb-6">⚠ Do not pause unless necessary — it may affect your score.</p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowPauseConfirm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                                onClick={() => { setShowPauseConfirm(false); handlePause(); }}
                            >
                                Yes, Pause
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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

                        {/* Primary: Resume */}
                        <Button
                            onClick={handleResume}
                            size="lg"
                            className="w-full bg-[#2196f3] hover:bg-[#1976d2] text-white gap-2 text-base mb-3"
                        >
                            <Play className="h-5 w-5" /> Resume Exam
                        </Button>

                        {/* Secondary: Go to Test Page */}
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full gap-2 text-base border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => {
                                // Navigate the parent window back to wherever this exam was launched from
                                const destination = returnUrl || '/student/tests';
                                try {
                                    if (window.opener && !window.opener.closed) {
                                        window.opener.postMessage(
                                            { type: 'NAVIGATE_TO', path: destination },
                                            window.location.origin
                                        );
                                        window.close();
                                        return;
                                    }
                                } catch (_) {}
                                // Fallback: navigate current tab
                                window.location.href = window.location.origin + destination;
                            }}
                        >
                            <ExternalLink className="h-5 w-5" /> Go to Test Page
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
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {isSectionLocked ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center space-y-3">
                                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-8 h-8 text-gray-500" />
                                    </div>
                                    <p className="text-lg font-semibold text-gray-600">Section Submitted</p>
                                    <p className="text-sm text-gray-500">This section has been locked and cannot be re-opened.</p>
                                </div>
                            </div>
                        ) : (
                            currentQuestion && (
                                <div style={{ zoom: fontSize / 100 }} className="flex-1 flex flex-col overflow-hidden">
                                    <QuestionDisplay
                                        question={currentQuestion}
                                        selectedAnswer={localAnswer}
                                        onAnswerChange={handleAnswerChange}
                                        questionNumber={sectionLocalQuestionNumber}
                                        language={sessionState.language}
                                        onLanguageChange={setLanguage}
                                    />
                                </div>
                            )
                        )}
                    </div>

                    <QuestionPalette
                        questions={currentSectionQuestions}
                        currentQuestionIndex={paletteCurrentIndex}
                        onQuestionSelect={(localIdx) => {
                            if (isSectionLocked) return;
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

            {/* ── Action Buttons ── */}
            {!isPaused && (
                <ExamActionButtons
                    onMarkAndNext={handleMarkAndNext}
                    onClearResponse={handleClearResponse}
                    onSaveAndNext={handleSaveAndNext}
                    onPrevious={hasPrevious ? handlePrevious : undefined}
                    onSubmitSection={handleSubmitSectionClick}
                    hasPrevious={hasPrevious}
                    isLastSection={isLastSection}
                    hasAnswer={localAnswer !== null && localAnswer !== ''}
                    hasUnsavedChange={hasUnsavedChange}
                    sectionLocked={isSectionLocked}
                />
            )}
        </div>
    );
};
