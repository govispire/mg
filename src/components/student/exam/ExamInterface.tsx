import React, { useState } from 'react';
import { ExamConfig } from '@/types/exam';
import { useExamSession } from '@/hooks/exam/useExamSession';
import { ExamTimer } from './ExamTimer';
import { QuestionPalette } from './QuestionPalette';
import { QuestionDisplay } from './QuestionDisplay';
import { SectionNavigator } from './SectionNavigator';
import { ExamActionButtons } from './ExamActionButtons';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
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
        saveAnswer,
        markForReview,
        clearResponse,
        saveAndNext,
        markAndNext,
        submitExam,
        setLanguage,
        getStats,
    } = useExamSession(examConfig);

    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    const handleTimeUp = () => {
        submitExam();
        // Extract all responses
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
        // Extract all responses
        const responses: Record<string, string | string[] | null> = {};
        Object.values(sessionState.questionStates).forEach(state => {
            responses[state.questionId] = state.selectedAnswer;
        });
        onSubmit(responses);
    };

    const handleAnswerChange = (answer: string | string[]) => {
        if (currentQuestion) {
            saveAnswer(currentQuestion.id, answer);
        }
    };

    const handleClearResponse = () => {
        if (currentQuestion) {
            clearResponse(currentQuestion.id);
        }
    };

    const handleMarkAndNext = () => {
        if (currentQuestion) {
            markForReview(currentQuestion.id);
        }
        goToNext();
    };

    // Calculate section statistics
    const sectionStats: Record<string, { answered: number; total: number }> = {};
    examConfig.sections.forEach(section => {
        const sectionQuestions = section.questions.map(q => sessionState.questionStates[q.id]).filter(Boolean);
        const answered = sectionQuestions.filter(q =>
            q.status === 2 || q.status === 4 // ANSWERED or ANSWERED_AND_MARKED
        ).length;
        sectionStats[section.id] = {
            answered,
            total: section.questions.length
        };
    });

    // Map questions for palette
    const paletteQuestions = allQuestions.map((q, index) => ({
        id: q.id,
        questionNumber: q.questionNumber,
        sectionId: q.sectionId,
        status: sessionState.questionStates[q.id]?.status || 0,
    }));

    const currentQuestionState = currentQuestion
        ? sessionState.questionStates[currentQuestion.id]
        : null;

    return (
        <div className="h-screen flex flex-col bg-white">
            {/* Warning Dialog */}
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

            {/* Submit Confirmation Dialog */}
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Submission</DialogTitle>
                        <DialogDescription>
                            <div className="space-y-2">
                                <div>You have:</div>
                                <ul className="list-disc list-inside ml-4">
                                    <li>{getStats().answered} answered question(s)</li>
                                    <li>{getStats().notAnswered} not answered question(s)</li>
                                    <li>{getStats().notVisited} not visited question(s)</li>
                                    <li>{getStats().markedForReview} marked for review</li>
                                </ul>
                                <p className="mt-4">Are you sure you want to submit?</p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleFinalSubmit} className="bg-[#5b9dd9] hover:bg-[#4a8cc8]">
                            Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="bg-[#4a4a4a] text-white px-6 py-3 flex items-center justify-between border-b border-gray-600">
                <div>
                    <h1 className="text-xl font-bold">{examConfig.title}</h1>
                    <div className="text-xs text-gray-300">{currentSection?.name}</div>
                </div>

                <div className="flex items-center gap-4">
                    <ExamTimer
                        totalDurationInSeconds={examConfig.totalDuration * 60}
                        onTimeUp={handleTimeUp}
                        onWarning={handleWarning}
                        isPaused={sessionState.isPaused}
                    />

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-gray-700"
                    >
                        <Info className="h-4 w-4 mr-2" />
                        Instructions
                    </Button>
                </div>
            </div>

            {/* Section Navigator */}
            <SectionNavigator
                sections={examConfig.sections}
                currentSectionIndex={sessionState.currentSectionIndex}
                onSectionChange={navigateToSection}
                sectionStats={sectionStats}
            />

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Question Display Area */}
                <div className={`flex-1 overflow-y-auto transition-all duration-300 ${isPaletteCollapsed ? 'mr-0' : 'mr-0'}`}>
                    {currentQuestion && currentQuestionState && (
                        <QuestionDisplay
                            question={currentQuestion}
                            selectedAnswer={currentQuestionState.selectedAnswer}
                            onAnswerChange={handleAnswerChange}
                            questionNumber={currentQuestion.questionNumber}
                        />
                    )}
                </div>

                {/* Question Palette */}
                {!isPaletteCollapsed && (
                    <QuestionPalette
                        questions={paletteQuestions}
                        currentQuestionIndex={sessionState.currentQuestionIndex}
                        onQuestionSelect={navigateToQuestion}
                        language={sessionState.language}
                        onLanguageChange={setLanguage}
                        sectionName={currentSection?.name || ''}
                        userName={userName}
                        userAvatar={userAvatar}
                        isCollapsed={isPaletteCollapsed}
                        onToggleCollapse={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
                    />
                )}

                {/* Collapsed Palette Toggle */}
                {isPaletteCollapsed && (
                    <QuestionPalette
                        questions={paletteQuestions}
                        currentQuestionIndex={sessionState.currentQuestionIndex}
                        onQuestionSelect={navigateToQuestion}
                        language={sessionState.language}
                        onLanguageChange={setLanguage}
                        sectionName={currentSection?.name || ''}
                        userName={userName}
                        userAvatar={userAvatar}
                        isCollapsed={isPaletteCollapsed}
                        onToggleCollapse={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
                    />
                )}
            </div>

            {/* Action Buttons */}
            <ExamActionButtons
                onMarkAndNext={handleMarkAndNext}
                onClearResponse={handleClearResponse}
                onSaveAndNext={saveAndNext}
                onPrevious={sessionState.currentQuestionIndex > 0 ? goToPrevious : undefined}
                onSubmit={handleSubmitClick}
                hasPrevious={sessionState.currentQuestionIndex > 0}
                isLastQuestion={sessionState.currentQuestionIndex === allQuestions.length - 1}
                hasAnswer={currentQuestionState?.selectedAnswer !== null}
            />
        </div>
    );
};
