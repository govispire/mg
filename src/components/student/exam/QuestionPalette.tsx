import React from 'react';
import { QuestionStatus } from '@/types/exam';
import { User } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface QuestionPaletteProps {
    questions: Array<{
        id: string;
        questionNumber: number;
        sectionId: string;
        status: QuestionStatus;
    }>;
    currentQuestionIndex: number;
    onQuestionSelect: (index: number) => void;
    language: 'English' | 'Hindi';
    onLanguageChange: (lang: 'English' | 'Hindi') => void;
    sectionName: string;
    userName?: string;
    userAvatar?: string;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

// IBPS Standard Colors - Exact match
const getStatusStyle = (status: QuestionStatus, isAnsweredAndMarked: boolean = false) => {
    switch (status) {
        case QuestionStatus.NOT_VISITED:
            return 'bg-white border-2 border-gray-400 text-gray-700';
        case QuestionStatus.NOT_ANSWERED:
            return 'bg-[#ee4444] text-white border-0';
        case QuestionStatus.ANSWERED:
            return 'bg-[#55cc55] text-white border-0';
        case QuestionStatus.MARKED_FOR_REVIEW:
            return 'bg-[#9966cc] text-white border-0';
        case QuestionStatus.ANSWERED_AND_MARKED:
            return 'bg-[#9966cc] text-white border-0 relative';
        default:
            return 'bg-white border-2 border-gray-400 text-gray-700';
    }
};

const STATUS_LEGEND = [
    { number: '3', label: 'Answered', color: 'bg-[#55cc55] text-white' },
    { number: '6', label: 'Not Answered', color: 'bg-[#ee4444] text-white' },
    { number: '34', label: 'Not Visited', color: 'bg-white border-2 border-gray-400 text-gray-700' },
    { number: '5', label: 'Marked for Review', color: 'bg-[#9966cc] text-white' },
    { number: '2', label: 'Answered & Marked for Review', color: 'bg-[#9966cc] text-white', hasGreenDot: true, subtitle: '(will also be evaluated)' },
];

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
    questions,
    currentQuestionIndex,
    onQuestionSelect,
    language,
    onLanguageChange,
    sectionName,
    userName = 'John Smith',
    userAvatar,
    isCollapsed = false,
    onToggleCollapse
}) => {
    if (isCollapsed) {
        return (
            <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
                <button
                    onClick={onToggleCollapse}
                    className="bg-black text-white px-2 py-8 text-xs font-medium hover:bg-gray-800 transition-colors rounded-l-md shadow-lg whitespace-nowrap"
                    aria-label="Show question palette"
                >
                    Show Question No. Panel
                </button>
            </div>
        );
    }

    return (
        <div className="w-[280px] bg-[#e3f2fd] border-l border-gray-300 flex flex-col h-full overflow-hidden relative">
            {/* Profile Section */}
            <div className="bg-white p-3 border-b border-gray-300 flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden">
                    {userAvatar ? (
                        <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-7 h-7 text-white" />
                    )}
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">{userName}</div>
                </div>
            </div>

            {/* Language Selector */}
            <div className="px-3 py-2 bg-white border-b border-gray-300">
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">View in:</label>
                <Select value={language} onValueChange={(val) => onLanguageChange(val as 'English' | 'Hindi')}>
                    <SelectTrigger className="w-full h-8 text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Status Legend */}
            <div className="px-3 py-3 bg-[#d6ebf5] border-b border-gray-300 space-y-2.5">
                {STATUS_LEGEND.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                        <div className="relative flex-shrink-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${item.color}`}>
                                {item.number}
                            </div>
                            {item.hasGreenDot && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#55cc55] rounded-full border-2 border-white"></div>
                            )}
                        </div>
                        <div className="flex-1 pt-0.5">
                            <div className="text-[11px] text-gray-800 leading-tight font-medium">{item.label}</div>
                            {item.subtitle && (
                                <div className="text-[10px] text-gray-600 leading-tight">{item.subtitle}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Section Info */}
            <div className="bg-[#2196f3] text-white px-3 py-2.5 text-center font-semibold text-sm">
                {sectionName}
            </div>

            {/* Question Grid Header with Collapse Button */}
            <div className="px-3 py-2 bg-white border-b border-gray-200 flex items-center justify-between">
                <div className="text-xs font-semibold text-gray-900">Choose a Question</div>
                {onToggleCollapse && (
                    <button
                        onClick={onToggleCollapse}
                        className="bg-black text-white px-2 py-1 text-[10px] font-medium hover:bg-gray-800 transition-colors rounded whitespace-nowrap"
                        aria-label="Collapse question palette"
                    >
                        Collapse Question No. Panel
                    </button>
                )}
            </div>

            {/* Question Grid */}
            <div className="flex-1 overflow-y-auto p-3 bg-white">
                <div className="grid grid-cols-4 gap-2.5">
                    {questions.map((question, index) => {
                        const isAnsweredAndMarked = question.status === QuestionStatus.ANSWERED_AND_MARKED;
                        return (
                            <button
                                key={question.id}
                                onClick={() => onQuestionSelect(index)}
                                className={`
                                    relative h-9 w-9 rounded-full flex items-center justify-center 
                                    font-bold text-sm transition-all
                                    ${getStatusStyle(question.status, isAnsweredAndMarked)}
                                    ${index === currentQuestionIndex ? 'ring-2 ring-offset-2 ring-blue-600' : ''}
                                    hover:scale-110 active:scale-95 cursor-pointer
                                `}
                            >
                                {question.questionNumber}
                                {isAnsweredAndMarked && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#55cc55] rounded-full border-2 border-white"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
