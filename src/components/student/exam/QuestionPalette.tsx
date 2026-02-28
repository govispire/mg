import React, { useMemo } from 'react';
import { QuestionStatus } from '@/types/exam';
import { User, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface PaletteQuestion {
    id: string;
    questionNumber: number;
    sectionId: string;
    status: QuestionStatus;
}

interface QuestionPaletteProps {
    questions: PaletteQuestion[];
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

// IBPS Standard Colors
const getStatusStyle = (status: QuestionStatus) => {
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

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
    questions,
    currentQuestionIndex,
    onQuestionSelect,
    language,
    onLanguageChange,
    sectionName,
    userName = 'Student',
    userAvatar,
    isCollapsed = false,
    onToggleCollapse,
}) => {
    // ── Compute counts dynamically from live question states ──────────
    const counts = useMemo(() => ({
        answered: questions.filter(q => q.status === QuestionStatus.ANSWERED).length,
        notAnswered: questions.filter(q => q.status === QuestionStatus.NOT_ANSWERED).length,
        notVisited: questions.filter(q => q.status === QuestionStatus.NOT_VISITED).length,
        markedForReview: questions.filter(q => q.status === QuestionStatus.MARKED_FOR_REVIEW).length,
        answeredAndMarked: questions.filter(q => q.status === QuestionStatus.ANSWERED_AND_MARKED).length,
    }), [questions]);

    const legendItems = [
        {
            count: counts.answered,
            label: 'Answered',
            color: 'bg-[#55cc55] text-white',
            hasGreenDot: false,
            subtitle: undefined,
        },
        {
            count: counts.notAnswered,
            label: 'Not Answered',
            color: 'bg-[#ee4444] text-white',
            hasGreenDot: false,
            subtitle: undefined,
        },
        {
            count: counts.notVisited,
            label: 'Not Visited',
            color: 'bg-white border-2 border-gray-400 text-gray-700',
            hasGreenDot: false,
            subtitle: undefined,
        },
        {
            count: counts.markedForReview,
            label: 'Marked for Review',
            color: 'bg-[#9966cc] text-white',
            hasGreenDot: false,
            subtitle: undefined,
        },
        {
            count: counts.answeredAndMarked,
            label: 'Answered & Marked for Review',
            color: 'bg-[#9966cc] text-white',
            hasGreenDot: true,
            subtitle: '(will also be evaluated)',
        },
    ];

    return (
        <div className="relative flex h-full">
            {/* ── IBPS-style left-edge collapse arrow tab ── */}
            {onToggleCollapse && (
                <button
                    onClick={onToggleCollapse}
                    title={isCollapsed ? 'Show Question No. Panel' : 'Collapse Question No. Panel'}
                    aria-label={isCollapsed ? 'Show Question No. Panel' : 'Collapse Question No. Panel'}
                    className="
                        absolute left-0 top-1/2 -translate-y-1/2 z-10
                        -translate-x-full
                        bg-[#2d2d2d] hover:bg-[#444] text-white
                        w-5 h-16
                        flex items-center justify-center
                        rounded-l-md shadow-md
                        transition-colors cursor-pointer
                        border-r-0
                    "
                >
                    {isCollapsed
                        ? <ChevronRight className="w-3.5 h-3.5" />
                        : <ChevronLeft className="w-3.5 h-3.5" />
                    }
                </button>
            )}

            {/* ── Palette Panel ── */}
            {!isCollapsed && (
                <div className="w-[280px] bg-[#e3f2fd] border-l border-gray-300 flex flex-col h-full overflow-hidden">
                    {/* Profile */}
                    <div className="bg-white p-3 border-b border-gray-300 flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {userAvatar
                                ? <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                                : <User className="w-7 h-7 text-white" />
                            }
                        </div>
                        <div className="font-semibold text-sm text-gray-900">{userName}</div>
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

                    {/* ── Status Legend — FULLY DYNAMIC counts ── */}
                    <div className="px-3 py-2 bg-white border-b border-gray-200 space-y-2">
                        {legendItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="relative flex-shrink-0">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${item.color}`}>
                                        {item.count}
                                    </div>
                                    {item.hasGreenDot && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#55cc55] rounded-full border-2 border-white" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="text-[11px] text-gray-800 leading-tight font-medium">{item.label}</div>
                                    {item.subtitle && (
                                        <div className="text-[10px] text-gray-500 leading-tight">{item.subtitle}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Section Header */}
                    <div className="bg-[#2196f3] text-white px-3 py-2.5 text-center font-semibold text-sm">
                        {sectionName}
                    </div>

                    {/* Choose a Question label */}
                    <div className="px-3 py-2 bg-white border-b border-gray-200">
                        <div className="text-xs font-semibold text-gray-900">Choose a Question</div>
                    </div>

                    {/* Question Number Grid */}
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
                                            ${getStatusStyle(question.status)}
                                            ${index === currentQuestionIndex ? 'ring-2 ring-offset-2 ring-blue-600' : ''}
                                            hover:scale-110 active:scale-95 cursor-pointer
                                        `}
                                    >
                                        {question.questionNumber}
                                        {isAnsweredAndMarked && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#55cc55] rounded-full border-2 border-white" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
