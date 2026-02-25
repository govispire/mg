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
}

export const ExamActionButtons: React.FC<ExamActionButtonsProps> = ({
    onMarkAndNext,
    onClearResponse,
    onSaveAndNext,
    onPrevious,
    onSubmit,
    hasPrevious,
    isLastQuestion,
    hasAnswer
}) => {
    return (
        <div className="bg-[#4a4a4a] p-4 flex items-center justify-between border-t border-gray-600">
            {/* Left Side Actions */}
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    onClick={onMarkAndNext}
                    className="bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
                >
                    Mark for Review & Next
                </Button>
                <Button
                    variant="outline"
                    onClick={onClearResponse}
                    className="bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
                    disabled={!hasAnswer}
                >
                    Clear Response
                </Button>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
                {hasPrevious && onPrevious && (
                    <Button
                        variant="outline"
                        onClick={onPrevious}
                        className="bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
                    >
                        Previous
                    </Button>
                )}

                {!isLastQuestion ? (
                    <Button
                        onClick={onSaveAndNext}
                        className="bg-[#5b9dd9] hover:bg-[#4a8cc8] text-white"
                    >
                        Save & Next
                    </Button>
                ) : (
                    <Button
                        onClick={onSubmit}
                        className="bg-[#5b9dd9] hover:bg-[#4a8cc8] text-white"
                    >
                        Submit
                    </Button>
                )}
            </div>
        </div>
    );
};
