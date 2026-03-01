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
import { QuestionButton } from '../../question-palette/QuestionButton';
import type { PaletteStatus } from '../../question-palette/QuestionButton';
import '../../question-palette/palette.css';

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

/** Map the app's QuestionStatus enum to sprite status key */
function toSpriteStatus(status: QuestionStatus): PaletteStatus {
    switch (status) {
        case QuestionStatus.ANSWERED: return 'answered';
        case QuestionStatus.NOT_ANSWERED: return 'not-answered';
        case QuestionStatus.NOT_VISITED: return 'not-visited';
        case QuestionStatus.MARKED_FOR_REVIEW: return 'marked';
        case QuestionStatus.ANSWERED_AND_MARKED: return 'answered-marked';
        default: return 'not-visited';
    }
}

// ── Shape styles for legend mini-icons (CSS only) ─────────────────
interface LegendShapeCfg {
    background: string;
    clipPath?: string;
    borderRadius?: string;
    border?: string;
    textColor: string;
}
const LEGEND_SHAPES: Record<PaletteStatus, LegendShapeCfg> = {
    answered: { background: 'linear-gradient(160deg,#5dce5d,#3cb83c)', clipPath: 'polygon(0% 0%,100% 0%,100% 68%,50% 100%,0% 68%)', textColor: '#fff' },
    'not-answered': { background: 'linear-gradient(160deg,#f05050,#d63232)', clipPath: 'polygon(5% 0%,95% 0%,100% 10%,100% 65%,50% 100%,0% 65%,0% 10%)', textColor: '#fff' },
    'not-visited': { background: '#f3f4f6', borderRadius: '4px', border: '1.5px solid #9ca3af', textColor: '#374151' },
    marked: { background: 'linear-gradient(135deg,#9966cc,#7c3aed)', borderRadius: '50%', textColor: '#fff' },
    'answered-marked': { background: 'linear-gradient(135deg,#9966cc,#7c3aed)', borderRadius: '50%', textColor: '#fff' },
};

/** Small shape icon for the legend row */
const LegendIcon: React.FC<{ status: PaletteStatus; count: number }> = ({ status, count }) => {
    const s = LEGEND_SHAPES[status];
    const SIZE = 28;
    return (
        <div style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
            {/* Shape layer */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute', inset: 0,
                    background: s.background,
                    clipPath: s.clipPath,
                    borderRadius: s.borderRadius,
                    border: s.border,
                }}
            />
            {/* Count number */}
            <span style={{
                position: 'absolute', inset: 0,
                display: 'grid', placeItems: 'center',
                fontWeight: 700, fontSize: 10, color: s.textColor,
                paddingBottom: s.clipPath ? '16%' : 0,
                lineHeight: 1,
            }}>
                {count}
            </span>
            {/* Green badge for answered-marked */}
            {status === 'answered-marked' && (
                <div style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 10, height: 10,
                    background: '#22c55e', borderRadius: '50%',
                    border: '1.5px solid white',
                }} />
            )}
        </div>
    );
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
    const counts = useMemo(() => ({
        answered: questions.filter(q => q.status === QuestionStatus.ANSWERED).length,
        notAnswered: questions.filter(q => q.status === QuestionStatus.NOT_ANSWERED).length,
        notVisited: questions.filter(q => q.status === QuestionStatus.NOT_VISITED).length,
        markedForReview: questions.filter(q => q.status === QuestionStatus.MARKED_FOR_REVIEW).length,
        answeredAndMarked: questions.filter(q => q.status === QuestionStatus.ANSWERED_AND_MARKED).length,
    }), [questions]);

    const legendItems: { status: PaletteStatus; count: number; label: string; subtitle?: string }[] = [
        { status: 'answered', count: counts.answered, label: 'Answered' },
        { status: 'not-answered', count: counts.notAnswered, label: 'Not Answered' },
        { status: 'not-visited', count: counts.notVisited, label: 'Not Visited' },
        { status: 'marked', count: counts.markedForReview, label: 'Marked for Review' },
        {
            status: 'answered-marked', count: counts.answeredAndMarked, label: 'Answered & Marked for Review',
            subtitle: '(will also be evaluated)'
        },
    ];

    return (
        <div className="relative flex h-full">
            {/* ── Collapse tab ── */}
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

                    {/* ── Status Legend ── */}
                    <div className="px-3 py-2 bg-white border-b border-gray-200 space-y-2">
                        {legendItems.map((item) => (
                            <div key={item.status} className="flex items-center gap-2">
                                <LegendIcon status={item.status} count={item.count} />
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

                    {/* ── Question Number Grid ── */}
                    <div className="flex-1 overflow-y-auto p-3 bg-white">
                        <div className="grid grid-cols-4 gap-2">
                            {questions.map((question, index) => (
                                <div key={question.id} className="flex items-center justify-center">
                                    <QuestionButton
                                        questionNumber={question.questionNumber}
                                        status={toSpriteStatus(question.status)}
                                        isCurrent={index === currentQuestionIndex}
                                        size={48}
                                        onClick={() => onQuestionSelect(index)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
