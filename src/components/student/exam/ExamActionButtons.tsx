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
        <div className="bg-[#f5f5f5] border-t border-gray-300 flex items-center">
            {/* ── Left group: Mark for Review & Clear Response ── */}
            <div className="flex items-center gap-2 px-4 py-2.5 flex-1">
                <Button
                    variant="outline"
                    onClick={onMarkAndNext}
                    disabled={sectionLocked}
                    className="bg-white hover:bg-gray-100 text-gray-900 border-gray-400 text-sm"
                >
                    Mark for Review &amp; Next
                </Button>
                <Button
                    variant="outline"
                    onClick={onClearResponse}
                    disabled={!hasAnswer || sectionLocked}
                    className="bg-white hover:bg-gray-100 text-gray-900 border-gray-400 text-sm"
                >
                    Clear Response
                </Button>
            </div>

            {/* ── Centre-right group: Previous + Save & Next ── */}
            <div className="flex items-center gap-2 px-4 py-2.5">
                <Button
                    variant="outline"
                    onClick={onPrevious}
                    disabled={!hasPrevious || !onPrevious || sectionLocked}
                    className="bg-white hover:bg-gray-100 text-gray-800 border-gray-400 text-sm"
                >
                    Previous
                </Button>

                <Button
                    onClick={onSaveAndNext}
                    disabled={sectionLocked}
                    className={`text-white text-sm transition-all ${hasUnsavedChange
                        ? 'bg-[#1976d2] hover:bg-[#1565c0] ring-2 ring-yellow-400 ring-offset-1'
                        : 'bg-[#5b9dd9] hover:bg-[#4a8cc8]'
                        }`}
                    title="Save answer and go to next question (Ctrl+Enter)"
                >
                    Save &amp; Next
                </Button>
            </div>

            {/* ── Submit panel: fixed width matching the right palette ── */}
            <div
                className="flex items-center justify-center border-l border-gray-300 py-2.5"
                style={{ width: 280 }}
            >
                <Button
                    onClick={onSubmitSection}
                    className={`text-white text-sm font-semibold px-8 py-2 ${isLastSection
                        ? 'bg-[#d32f2f] hover:bg-[#b71c1c]'
                        : 'bg-[#e65100] hover:bg-[#bf360c]'
                        }`}
                    title={isLastSection ? 'Submit the entire test' : 'Submit this section and proceed to the next'}
                >
                    {isLastSection ? 'Submit' : 'Submit Section'}
                </Button>
            </div>
        </div>
    );
};
