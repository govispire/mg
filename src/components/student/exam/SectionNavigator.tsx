import React from 'react';
import { ExamSection } from '@/types/exam';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock } from 'lucide-react';

interface SectionNavigatorProps {
    sections: ExamSection[];
    currentSectionIndex: number;
    onSectionChange: (index: number) => void;
    sectionStats?: Record<string, { answered: number; total: number }>;
    submittedSections?: string[];
}

export const SectionNavigator: React.FC<SectionNavigatorProps> = ({
    sections,
    currentSectionIndex,
    onSectionChange,
    sectionStats,
    submittedSections = [],
}) => {
    return (
        <div className="bg-[#4a4a4a] border-b border-gray-600">
            <div className="flex items-center gap-0 px-2 overflow-x-auto">
                {sections.map((section, index) => {
                    const isActive = index === currentSectionIndex;
                    const isLocked = submittedSections.includes(section.id);
                    const tabStats = sectionStats?.[section.id];

                    return (
                        <button
                            key={section.id}
                            onClick={() => onSectionChange(index)}
                            title={isLocked ? 'Section submitted — cannot re-enter' : section.name}
                            className={`
                                relative px-4 py-3 whitespace-nowrap font-medium transition-colors flex items-center gap-2
                                ${isActive
                                    ? 'bg-[#1976d2] text-white'
                                    : isLocked
                                        ? 'bg-transparent text-gray-500 cursor-not-allowed opacity-60'
                                        : 'bg-transparent text-gray-300 hover:bg-gray-700 cursor-pointer'
                                }
                            `}
                        >
                            {isLocked && <Lock className="w-3.5 h-3.5 flex-shrink-0" />}
                            <span>{section.name}</span>
                            {tabStats && !isLocked && (
                                <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                                    {tabStats.answered}/{tabStats.total}
                                </Badge>
                            )}
                            {isLocked && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                            )}
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
