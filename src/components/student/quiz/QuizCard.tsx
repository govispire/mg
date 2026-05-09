import React, { useState } from 'react';
import {
    Play, Lock, Calendar as CalendarIcon,
    Bookmark, Clock, Users,
    BarChart3, RotateCcw, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExtendedQuiz } from '@/types/quizTypes';
import QuizLeaderboardModal from './QuizLeaderboardModal';
import { getQuizLeaderboard } from '@/services/quizLeaderboardService';

interface QuizCardProps {
    quiz: ExtendedQuiz;
    onStart: (quiz: ExtendedQuiz) => void;
    todayStr: string;
    index?: number;
}

// Rotating accent colors for the top border / number badge
const ACCENT_COLORS = [
    { border: "#ef4444", light: "#fef2f2", text: "#dc2626" },
    { border: "#f97316", light: "#fff7ed", text: "#ea580c" },
    { border: "#22c55e", light: "#f0fdf4", text: "#16a34a" },
    { border: "#06b6d4", light: "#ecfeff", text: "#0891b2" },
    { border: "#8b5cf6", light: "#f5f3ff", text: "#7c3aed" },
    { border: "#f59e0b", light: "#fffbeb", text: "#d97706" },
    { border: "#ec4899", light: "#fdf2f8", text: "#db2777" },
    { border: "#10b981", light: "#ecfdf5", text: "#059669" },
];

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart, todayStr, index = 0 }) => {
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    const isLocked    = quiz.isLocked;
    const isFuture    = quiz.scheduledDate > todayStr;
    const isCompleted = quiz.completed;
    const isDisabled  = isLocked || isFuture;

    const leaderboard = isCompleted
        ? getQuizLeaderboard(quiz.id, quiz.title, { score: quiz.score || 0, timeTaken: quiz.duration * 60 * 0.7 })
        : getQuizLeaderboard(quiz.id, quiz.title);

    const totalMarks    = quiz.questions * 2;
    const yourMarks     = quiz.score || 0;
    const timeSpent     = quiz.duration ? Math.floor(quiz.duration * 0.7) : 0;
    const yourRank      = isCompleted ? Math.floor(Math.random() * 50) + 1 : 0;
    const totalAttempts = quiz.totalUsers || 0;

    const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
    const num = index + 1;

    const quizTypeLabel =
        quiz.type === 'full-prelims' || quiz.type === 'full-mains' ? 'Full Length Mock Test'
        : quiz.type === 'sectional'       ? 'Sectional Test'
        : quiz.type === 'speed-challenge' ? 'Speed Challenge'
        : quiz.type === 'rapid-fire'      ? 'Rapid Fire Quiz'
        : quiz.type === 'mini-test'       ? 'Mini Mock Test'
        : 'Daily Quiz';

    return (
        <>
            <div
                className={`
                    bg-white rounded-2xl border border-gray-300 shadow-sm
                    hover:shadow-lg hover:-translate-y-0.5
                    transition-all duration-200
                    flex flex-col overflow-hidden
                    ${isDisabled ? 'opacity-70' : ''}
                `}
                style={{ borderTop: `3px solid ${accent.border}` }}
            >
                {/* Card body */}
                <div className="px-5 pt-5 pb-4 flex flex-col gap-3 flex-1">

                    {/* Row 1: number badge + bookmark */}
                    <div className="flex items-center justify-between">
                        <span
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full text-base font-black shadow-sm flex-shrink-0"
                            style={{ background: accent.light, color: accent.text, border: `2px solid ${accent.border}` }}
                        >
                            {num}
                        </span>
                        <button
                            onClick={() => setBookmarked(b => !b)}
                            className="text-gray-300 hover:text-gray-500 transition-colors p-0.5"
                            title="Bookmark"
                        >
                            <Bookmark
                                className="h-4 w-4"
                                style={bookmarked ? { fill: accent.border, color: accent.border } : {}}
                            />
                        </button>
                    </div>

                    {/* Title + type */}
                    <div>
                        <h3 className="font-extrabold text-[17px] text-gray-900 leading-tight line-clamp-1">
                            {quiz.title}
                        </h3>
                        <p className="text-sm font-medium text-gray-500 mt-0.5">{quizTypeLabel}</p>
                    </div>

                    {/* Students count */}
                    <div className="flex items-center justify-center gap-1.5 text-sm text-gray-500">
                        <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">{totalAttempts.toLocaleString()} Students</span>
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-100" />

                    {/* Stats grid */}
                    {!isCompleted ? (
                        <div className="grid grid-cols-3">
                            <div className="flex flex-col items-center py-2">
                                <span className="text-base font-black text-gray-900">{quiz.questions}</span>
                                <span className="text-xs font-medium text-gray-400 mt-1">Questions</span>
                            </div>
                            <div className="flex flex-col items-center py-2 border-x border-gray-200">
                                <span className="text-base font-black text-gray-900">{totalMarks}</span>
                                <span className="text-xs font-medium text-gray-400 mt-1">Marks</span>
                            </div>
                            <div className="flex flex-col items-center py-2">
                                <span className="text-base font-black text-gray-900">{quiz.duration}</span>
                                <span className="text-xs font-medium text-gray-400 mt-1">Min</span>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3">
                            <div className="flex flex-col items-center py-2">
                                <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                                    <span className="text-base font-black text-gray-900">{yourMarks}</span>
                                    <span className="text-[10px] font-medium text-gray-400">/{totalMarks}</span>
                                </div>
                                <span className="text-[10px] font-medium text-gray-400 mt-1">Score</span>
                            </div>
                            <div className="flex flex-col items-center py-2 border-x border-gray-200">
                                <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                                    <span className="text-base font-black text-gray-900">{yourRank}</span>
                                    <span className="text-[10px] font-medium text-gray-400">/{totalAttempts > 0 ? totalAttempts : '—'}</span>
                                </div>
                                <span className="text-[10px] font-medium text-gray-400 mt-1">Rank</span>
                            </div>
                            <div className="flex flex-col items-center py-2">
                                <span className="text-base font-black text-gray-900">{timeSpent}m</span>
                                <span className="text-[10px] font-medium text-gray-400 mt-1">Time</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── CTA — always a single h-9 flex row ── */}
                <div className="px-5 pb-5">
                    {isCompleted ? (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-9 text-xs gap-1 border-gray-300 bg-gray-100 text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary font-semibold"
                                onClick={() =>
                                    window.open(
                                        `/student/solution-viewer?quizId=${quiz.id}&title=${encodeURIComponent(quiz.title)}&subject=${encodeURIComponent(quiz.subject)}&duration=${quiz.duration}&questions=${quiz.questions}`,
                                        '_blank',
                                        'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no'
                                    )
                                }
                            >
                                <BookOpen className="h-3.5 w-3.5" /> Solution
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-9 text-xs gap-1 border-gray-300 bg-gray-100 text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary font-semibold"
                                onClick={() => setShowLeaderboard(true)}
                            >
                                <BarChart3 className="h-3.5 w-3.5" /> Analysis
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                title="Retry"
                                className="h-9 w-9 p-0 border-gray-300 bg-gray-100 text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary flex-shrink-0"
                                onClick={() => onStart(quiz)}
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => !isDisabled && onStart(quiz)}
                                disabled={isDisabled}
                                className={`
                                    flex-1 h-9 rounded-lg text-sm font-semibold
                                    flex items-center justify-center gap-1.5
                                    transition-all duration-150 active:scale-[0.98]
                                    ${isDisabled
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-primary hover:bg-primary/90 text-white shadow-sm'
                                    }
                                `}
                            >
                                {isLocked ? (
                                    <><Lock className="h-3.5 w-3.5" /> Locked</>
                                ) : isFuture ? (
                                    <><CalendarIcon className="h-3.5 w-3.5" /> Coming Soon</>
                                ) : (
                                    <>
                                        <Play className="h-3.5 w-3.5 fill-white text-white" />
                                        Start Test
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <QuizLeaderboardModal
                isOpen={showLeaderboard}
                onClose={() => setShowLeaderboard(false)}
                leaderboard={leaderboard}
            />
        </>
    );
};

export default QuizCard;
