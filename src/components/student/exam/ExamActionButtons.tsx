import React from 'react';
import { Button } from '@/components/ui/button';

interface ExamActionButtonsProps {
    onMarkAndNext: () => void;
    onClearResponse: () => void;
    onSaveAndNext: () => void;
    onPrevious?: () => void;
    onSubmitSection: () => void;
    hasPrevious: boolean;
    isLastSection: boolean;
    hasAnswer: boolean;
    hasUnsavedChange?: boolean;
    sectionLocked?: boolean;
}

export const ExamActionButtons: React.FC<ExamActionButtonsProps> = ({
    onMarkAndNext,
    onClearResponse,
    onSaveAndNext,
    onPrevious,
    onSubmitSection,
    hasPrevious,
    isLastSection,
    hasAnswer,
    hasUnsavedChange = false,
    sectionLocked = false,
}) => {
    return (
        <div className="bg-[#f5f5f5] border-t border-gray-300 flex flex-col sm:flex-row items-stretch sm:items-center">
            {/* ── Row 1 on mobile / Left group on desktop ── */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 flex-1 border-b sm:border-b-0 border-gray-200">
                <Button
                    variant="outline"
                    onClick={onMarkAndNext}
                    disabled={sectionLocked}
                    className="flex-1 sm:flex-none bg-white hover:bg-gray-100 text-gray-900 border-gray-400 text-xs sm:text-sm px-2 sm:px-4"
                >
                    Mark for Review &amp; Next
                </Button>
                <Button
                    variant="outline"
                    onClick={onClearResponse}
                    disabled={!hasAnswer || sectionLocked}
                    className="flex-1 sm:flex-none bg-white hover:bg-gray-100 text-gray-900 border-gray-400 text-xs sm:text-sm px-2 sm:px-4"
                >
                    Clear Response
                </Button>
            </div>

            {/* ── Row 2 on mobile / Right group on desktop ── */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2">
                <Button
                    variant="outline"
                    onClick={onPrevious}
                    disabled={!hasPrevious || !onPrevious || sectionLocked}
                    className="flex-1 sm:flex-none bg-white hover:bg-gray-100 text-gray-800 border-gray-400 text-xs sm:text-sm px-2 sm:px-4"
                >
                    Previous
                </Button>

                <Button
                    onClick={onSaveAndNext}
                    disabled={sectionLocked}
                    className={`flex-1 sm:flex-none text-white text-xs sm:text-sm px-2 sm:px-4 transition-all ${hasUnsavedChange
                        ? 'bg-[#1976d2] hover:bg-[#1565c0] ring-2 ring-yellow-400 ring-offset-1'
                        : 'bg-[#5b9dd9] hover:bg-[#4a8cc8]'
                        }`}
                    title="Save answer and go to next question (Ctrl+Enter)"
                >
                    Save &amp; Next
                </Button>

                <Button
                    onClick={onSubmitSection}
                    className={`flex-1 sm:flex-none text-white text-xs sm:text-sm font-semibold px-3 sm:px-8 py-2 ${isLastSection
                        ? 'bg-[#1976d2] hover:bg-[#1565c0]'
                        : 'bg-[#1976d2] hover:bg-[#1565c0]'
                        }`}
                    title={isLastSection ? 'Submit the entire test' : 'Submit this section and proceed to the next'}
                >
                    {isLastSection ? 'Submit' : 'Submit Section'}
                </Button>
            </div>
        </div>
    );
};
