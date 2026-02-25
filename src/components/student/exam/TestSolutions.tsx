import React, { useState } from 'react';
import { ExamConfig } from '@/types/exam';
import { QuestionPalette } from './QuestionPalette';
import { SectionNavigator } from './SectionNavigator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, Circle, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface TestSolutionsProps {
    examConfig: ExamConfig;
    responses: Record<string, string | string[] | null>;
    isOpen: boolean;
    onClose: () => void;
}

export const TestSolutions: React.FC<TestSolutionsProps> = ({
    examConfig,
    responses,
    isOpen,
    onClose
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);

    if (!isOpen) return null;

    // Flatten all questions
    const allQuestions = examConfig.sections.flatMap(section => section.questions);
    const currentQuestion = allQuestions[currentQuestionIndex];
    const currentSection = examConfig.sections[currentSectionIndex];

    // Calculate question status for palette
    const paletteQuestions = allQuestions.map((q, index) => {
        const response = responses[q.id];
        const isCorrect = Array.isArray(response)
            ? JSON.stringify(response.sort()) === JSON.stringify(q.correctAnswer)
            : response === q.correctAnswer;

        let status = 0; // NOT_VISITED
        if (response) {
            status = isCorrect ? 2 : 1; // ANSWERED : NOT_ANSWERED (wrong)
        }

        return {
            id: q.id,
            questionNumber: q.questionNumber,
            sectionId: q.sectionId,
            status,
        };
    });

    const navigateToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
        // Update section index based on question
        const question = allQuestions[index];
        const sectionIdx = examConfig.sections.findIndex(s => s.id === question.sectionId);
        if (sectionIdx !== -1) setCurrentSectionIndex(sectionIdx);
    };

    const navigateToSection = (index: number) => {
        setCurrentSectionIndex(index);
        // Navigate to first question of that section
        const firstQuestionOfSection = allQuestions.findIndex(
            q => q.sectionId === examConfig.sections[index].id
        );
        if (firstQuestionOfSection !== -1) {
            setCurrentQuestionIndex(firstQuestionOfSection);
        }
    };

    const goToNext = () => {
        if (currentQuestionIndex < allQuestions.length - 1) {
            navigateToQuestion(currentQuestionIndex + 1);
        }
    };

    const goToPrevious = () => {
        if (currentQuestionIndex > 0) {
            navigateToQuestion(currentQuestionIndex - 1);
        }
    };

    // Calculate section statistics
    const sectionStats: Record<string, { answered: number; total: number }> = {};
    examConfig.sections.forEach(section => {
        const sectionQuestions = section.questions;
        const answered = sectionQuestions.filter(q => responses[q.id]).length;
        sectionStats[section.id] = {
            answered,
            total: section.questions.length
        };
    });

    // Get student's response
    const studentResponse = responses[currentQuestion.id];
    const isCorrect = Array.isArray(studentResponse)
        ? JSON.stringify(studentResponse.sort()) === JSON.stringify(currentQuestion.correctAnswer)
        : studentResponse === currentQuestion.correctAnswer;

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            {/* Header */}
            <div className="bg-[#4a4a4a] text-white px-6 py-3 flex items-center justify-between border-b border-gray-600">
                <div>
                    <h1 className="text-xl font-bold">Solutions - {examConfig.title}</h1>
                    <div className="text-xs text-gray-300">{currentSection?.name}</div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-gray-700"
                    onClick={onClose}
                >
                    <X className="h-4 w-4 mr-2" />
                    Close Solutions
                </Button>
            </div>

            {/* Section Navigator */}
            <SectionNavigator
                sections={examConfig.sections}
                currentSectionIndex={currentSectionIndex}
                onSectionChange={navigateToSection}
                sectionStats={sectionStats}
            />

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Question Display Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <Card className="max-w-4xl mx-auto p-6 bg-white shadow-md">
                        {/* Question Header with Status */}
                        <div className="bg-[#4a90e2] text-white px-4 py-3 rounded-t-md flex items-center justify-between mb-4">
                            <div className="font-semibold">
                                Question No. {currentQuestion.questionNumber}
                            </div>
                            <div className="flex items-center gap-2">
                                {studentResponse ? (
                                    isCorrect ? (
                                        <span className="flex items-center gap-1 text-green-300">
                                            <CheckCircle className="h-4 w-4" />
                                            Correct
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-300">
                                            <XCircle className="h-4 w-4" />
                                            Wrong
                                        </span>
                                    )
                                ) : (
                                    <span className="flex items-center gap-1 text-gray-300">
                                        <Circle className="h-4 w-4" />
                                        Not Attempted
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="mb-6">
                            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {currentQuestion.question}
                            </div>
                            {currentQuestion.imageUrl && (
                                <img
                                    src={currentQuestion.imageUrl}
                                    alt="Question"
                                    className="mt-4 max-w-full rounded border"
                                />
                            )}
                        </div>

                        {/* Options */}
                        {currentQuestion.options && (
                            <div className="space-y-3 mb-6">
                                {currentQuestion.options.map((option) => {
                                    const isCorrectAnswer = Array.isArray(currentQuestion.correctAnswer)
                                        ? currentQuestion.correctAnswer.includes(option.id)
                                        : currentQuestion.correctAnswer === option.id;

                                    const isStudentAnswer = Array.isArray(studentResponse)
                                        ? studentResponse.includes(option.id)
                                        : studentResponse === option.id;

                                    return (
                                        <div
                                            key={option.id}
                                            className={`p-4 rounded-lg border-2 transition-all ${isCorrectAnswer
                                                    ? 'bg-green-50 border-green-500'
                                                    : isStudentAnswer && !isCorrect
                                                        ? 'bg-red-50 border-red-500'
                                                        : 'bg-white border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {isCorrectAnswer ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                ) : isStudentAnswer && !isCorrect ? (
                                                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                                )}
                                                <div className="flex-1">
                                                    <div className={`${isCorrectAnswer ? 'font-semibold text-green-900' : isStudentAnswer ? 'font-medium text-red-900' : 'text-gray-700'}`}>
                                                        {option.text}
                                                    </div>
                                                    {isCorrectAnswer && (
                                                        <div className="text-xs text-green-700 mt-1">✓ Correct Answer</div>
                                                    )}
                                                    {isStudentAnswer && !isCorrect && (
                                                        <div className="text-xs text-red-700 mt-1">✗ Your Answer</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Explanation Section */}
                        {currentQuestion.explanation && (
                            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                                <div className="flex items-start gap-2">
                                    <div className="text-blue-700 font-semibold text-sm">📖 Explanation:</div>
                                </div>
                                <div className="text-gray-700 mt-2 leading-relaxed">
                                    {currentQuestion.explanation}
                                </div>
                            </div>
                        )}

                        {/* If no explanation, show placeholder */}
                        {!currentQuestion.explanation && (
                            <div className="mt-6 p-4 bg-gray-50 border-l-4 border-gray-300 rounded">
                                <div className="text-gray-500 text-sm italic">
                                    No explanation available for this question.
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Question Palette */}
                {!isPaletteCollapsed && (
                    <QuestionPalette
                        questions={paletteQuestions}
                        currentQuestionIndex={currentQuestionIndex}
                        onQuestionSelect={navigateToQuestion}
                        language="English"
                        onLanguageChange={() => { }}
                        sectionName={currentSection?.name || ''}
                        userName="Solutions"
                        isCollapsed={isPaletteCollapsed}
                        onToggleCollapse={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
                    />
                )}

                {/* Collapsed Palette Toggle */}
                {isPaletteCollapsed && (
                    <QuestionPalette
                        questions={paletteQuestions}
                        currentQuestionIndex={currentQuestionIndex}
                        onQuestionSelect={navigateToQuestion}
                        language="English"
                        onLanguageChange={() => { }}
                        sectionName={currentSection?.name || ''}
                        userName="Solutions"
                        isCollapsed={isPaletteCollapsed}
                        onToggleCollapse={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
                    />
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="bg-white border-t border-gray-300 px-6 py-4 flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={goToPrevious}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>

                <div className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {allQuestions.length}
                </div>

                <Button
                    onClick={goToNext}
                    disabled={currentQuestionIndex === allQuestions.length - 1}
                    className="flex items-center gap-2 bg-[#5b9dd9] hover:bg-[#4a8cc8]"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
