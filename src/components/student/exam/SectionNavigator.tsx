import React from 'react';
import { ExamSection } from '@/types/exam';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface SectionNavigatorProps {
    sections: ExamSection[];
    currentSectionIndex: number;
    onSectionChange: (index: number) => void;
    sectionStats?: Record<string, { answered: number; total: number }>;
    submittedSections?: string[];
    /** When true, students can only enter the next unsubmitted section sequentially */
    sectionLockEnabled?: boolean;
}

export const SectionNavigator: React.FC<SectionNavigatorProps> = ({
    sections,
    currentSectionIndex,
    onSectionChange,
    sectionStats,
    submittedSections = [],
    sectionLockEnabled = true,
}) => {
    /**
     * Index of the first section that has NOT yet been submitted.
     * In locked mode this is the only "next" section the student can navigate to.
     */
    const firstUnsubmittedIndex = sections.findIndex(
        (s) => !submittedSections.includes(s.id)
    );

    const handleTabClick = (index: number) => {
        const section = sections[index];
        if (!section) return;

        const isSubmitted = submittedSections.includes(section.id);
        const isActive    = index === currentSectionIndex;

        // Always block re-entry into already-submitted sections
        if (isSubmitted) {
            toast.warning('This section has already been submitted and cannot be re-opened.');
            return;
        }

        if (sectionLockEnabled) {
            // In locked mode: only allow navigating to the current active section
            // or the immediately next unlocked one.
            // Clicking any section beyond the first unsubmitted = blocked.
            if (index > firstUnsubmittedIndex) {
                toast.warning('Complete the current section before moving to the next one.');
                return;
            }
        }

        onSectionChange(index);
    };

    return (
        <div className="bg-[#4a4a4a] border-b border-gray-600">
            <div className="flex items-center gap-0 px-2 overflow-x-auto">
                {sections.map((section, index) => {
                    const isActive    = index === currentSectionIndex;
                    const isSubmitted = submittedSections.includes(section.id);

                    // In locked mode a "future" tab is any section beyond the
                    // currently reachable one (firstUnsubmittedIndex).
                    const isFutureLocked = sectionLockEnabled
                        && !isSubmitted
                        && !isActive
                        && index > firstUnsubmittedIndex;

                    const tabStats = sectionStats?.[section.id];

                    let tabClass = '';
                    if (isActive) {
                        tabClass = 'bg-[#1976d2] text-white';
                    } else if (isSubmitted) {
                        tabClass = 'bg-transparent text-gray-500 cursor-not-allowed opacity-60';
                    } else if (isFutureLocked) {
                        tabClass = 'bg-transparent text-gray-500 cursor-not-allowed opacity-40';
                    } else {
                        tabClass = 'bg-transparent text-gray-300 hover:bg-gray-700 cursor-pointer';
                    }

                    return (
                        <button
                            key={section.id}
                            onClick={() => handleTabClick(index)}
                            title={
                                isSubmitted
                                    ? 'Section submitted — cannot re-enter'
                                    : isFutureLocked
                                        ? 'Complete the current section first'
                                        : section.name
                            }
                            className={`
                                relative px-4 py-3 whitespace-nowrap font-medium transition-colors flex items-center gap-2
                                ${tabClass}
                            `}
                        >
                            {/* Left icon */}
                            {isSubmitted && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />}
                            {isFutureLocked && <Lock className="w-3 h-3 flex-shrink-0 text-gray-500" />}
                            {!isSubmitted && !isFutureLocked && isActive && (
                                <Lock className="w-3.5 h-3.5 flex-shrink-0 text-white opacity-70" />
                            )}

                            <span className="text-sm">{section.name}</span>

                            {/* Answered/total badge (only for the active, non-locked tab) */}
                            {tabStats && !isSubmitted && !isFutureLocked && (
                                <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                                    {tabStats.answered}/{tabStats.total}
                                </Badge>
                            )}

                            {/* Active underline */}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
