import React from 'react';
import { ExamSection } from '@/types/exam';
import { Badge } from '@/components/ui/badge';

interface SectionNavigatorProps {
    sections: ExamSection[];
    currentSectionIndex: number;
    onSectionChange: (index: number) => void;
    sectionStats?: Record<string, { answered: number; total: number }>;
}

export const SectionNavigator: React.FC<SectionNavigatorProps> = ({
    sections,
    currentSectionIndex,
    onSectionChange,
    sectionStats
}) => {
    return (
        <div className="bg-[#4a4a4a] border-b border-gray-600">
            <div className="flex items-center gap-2 px-4 overflow-x-auto">
                {sections.map((section, index) => {
                    const isActive = index === currentSectionIndex;
                    const stats = sectionStats?.[section.id];

                    return (
                        <button
                            key={section.id}
                            onClick={() => onSectionChange(index)}
                            className={`
                px-4 py-3 whitespace-nowrap font-medium transition-colors relative
                ${isActive
                                    ? 'bg-[#1976d2] text-white'
                                    : 'bg-transparent text-gray-300 hover:bg-gray-700'
                                }
              `}
                        >
                            <div className="flex items-center gap-2">
                                <span>{section.name}</span>
                                {stats && (
                                    <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                                        {stats.answered}/{stats.total}
                                    </Badge>
                                )}
                            </div>
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
