import React from 'react';
import { Button } from '@/components/ui/button';

interface ExamActionButtonsProps {
    onMarkAndNext: () => void;
    onClearResponse: () => void;
    onSaveAndNext: () => void;
    onPrevious?: () => void;
    onSubmit?: () => void;
    hasPrevious: boolean;
    isLastQuestion: boolean;
    hasAnswer: boolean;
    hasUnsavedChange?: boolean;
}

export const ExamActionButtons: React.FC<ExamActionButtonsProps> = ({
    onMarkAndNext,
    onClearResponse,
    onSaveAndNext,
    onPrevious,
    onSubmit,
    hasPrevious,
    isLastQuestion,
    hasAnswer,
    hasUnsavedChange = false,
}) => {
    return (
        <div className="bg-[#4a4a4a] px-4 py-3 flex items-center justify-between border-t border-gray-600">
            {/* Left: Mark for Review & Clear */}
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    onClick={onMarkAndNext}
                    className="bg-white hover:bg-gray-100 text-gray-900 border-gray-300 text-sm"
                >
                    Mark for Review &amp; Next
                </Button>
                <Button
                    variant="outline"
                    onClick={onClearResponse}
                    className="bg-white hover:bg-gray-100 text-gray-900 border-gray-300 text-sm"
                    disabled={!hasAnswer}
                >
                    Clear Response
                </Button>
            </div>

            {/* Right: Previous + Save/Submit with keyboard hint */}
            <div className="flex items-center gap-3">
                {hasPrevious && onPrevious && (
                    <Button
                        variant="outline"
                        onClick={onPrevious}
                        className="bg-white hover:bg-gray-100 text-gray-900 border-gray-300 text-sm"
                        title="Go to previous question (answer not saved)"
                    >
                        Previous
                    </Button>
                )}

                {!isLastQuestion ? (
                    <Button
                        onClick={onSaveAndNext}
                        className={`text-white text-sm transition-all ${hasUnsavedChange
                                ? 'bg-[#1976d2] hover:bg-[#1565c0] ring-2 ring-yellow-400 ring-offset-1'
                                : 'bg-[#5b9dd9] hover:bg-[#4a8cc8]'
                            }`}
                        title="Save answer and go to next question"
                    >
                        Save &amp; Next
                    </Button>
                ) : (
                    <Button
                        onClick={onSubmit}
                        className="bg-[#d32f2f] hover:bg-[#b71c1c] text-white text-sm"
                        title="Submit your exam"
                    >
                        Submit
                    </Button>
                )}
            </div>
        </div>
    );
};
