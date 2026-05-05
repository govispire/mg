import React, { useState } from 'react';
import {
    Play, Lock, Calendar as CalendarIcon,
    Bookmark, FileText, Clock, Users,
    BarChart3, RotateCcw, BookOpen, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExtendedQuiz, QuizType } from '@/types/quizTypes';
import QuizLeaderboardModal from './QuizLeaderboardModal';
import { getQuizLeaderboard } from '@/services/quizLeaderboardService';

interface QuizCardProps {
    quiz: ExtendedQuiz;
    onStart: (quiz: ExtendedQuiz) => void;
    todayStr: string;
    index?: number;
}

// Difficulty derived from quiz type (fallback mapping)
const getDifficulty = (quiz: ExtendedQuiz): { label: string; color: string; bg: string } => {
    if ((quiz as any).difficulty === 'easy')   return { label: 'Easy',   color: '#16a34a', bg: '#dcfce7' };
    if ((quiz as any).difficulty === 'hard')   return { label: 'Hard',   color: '#dc2626', bg: '#fee2e2' };
    if ((quiz as any).difficulty === 'medium') return { label: 'Medium', color: '#ca8a04', bg: '#fef9c3' };
    // default by type
    const hardTypes: QuizType[] = ['full-prelims', 'full-mains'];
    const easyTypes: QuizType[] = ['daily', 'mini-test'];
    if (hardTypes.includes(quiz.type))  return { label: 'Hard',   color: '#dc2626', bg: '#fee2e2' };
    if (easyTypes.includes(quiz.type))  return { label: 'Easy',   color: '#16a34a', bg: '#dcfce7' };
    return { label: 'Medium', color: '#ca8a04', bg: '#fef9c3' };
};

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
    const difficulty    = getDifficulty(quiz);

    // Card number label: pad to 2 digits
    const numLabel = String(index + 1).padStart(2, '0');

    return (
        <>
            <div
                className={`
                    bg-white dark:bg-gray-900
                    border border-gray-200 dark:border-gray-700
                    rounded-xl shadow-sm
                    hover:shadow-md hover:-translate-y-0.5
                    transition-all duration-200
                    flex flex-col
                    ${isDisabled ? 'opacity-70' : ''}
                `}
            >
                {/* ── Card body ── */}
                <div className="p-4 flex flex-col gap-3 flex-1">

                    {/* Row 1: number badge + bookmark */}
                    <div className="flex items-start justify-between">
                        {/* Number badge */}
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold">
                            {numLabel}
                        </span>

                        {/* Bookmark */}
                        <button
                            onClick={() => setBookmarked(b => !b)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-0.5"
                            title="Bookmark"
                        >
                            <Bookmark
                                className="h-4 w-4"
                                style={bookmarked ? { fill: 'currentColor', color: '#1d4ed8' } : {}}
                            />
                        </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 min-h-[2.5rem]">
                        {quiz.title}
                    </h3>

                    {/* Difficulty badge */}
                    <div>
                        <span
                            className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-md"
                            style={{ color: difficulty.color, backgroundColor: difficulty.bg }}
                        >
                            {difficulty.label}
                        </span>
                    </div>

                    {/* Stats row */}
                    {!isCompleted ? (
                        <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3 shrink-0" />
                                <span>{quiz.questions}</span>
                                <span className="text-gray-400">Qs</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3 shrink-0" />
                                <span>{totalMarks}</span>
                                <span className="text-gray-400">Marks</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span>{quiz.duration}</span>
                                <span className="text-gray-400">Mins</span>
                            </span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                            <span className="text-gray-400">Score</span>
                            <span className="font-semibold text-emerald-600 text-right">{yourMarks}/{totalMarks}</span>
                            <span className="text-gray-400">Time</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300 text-right">{timeSpent}m</span>
                            <span className="text-gray-400">Rank</span>
                            <span className="font-semibold text-violet-600 text-right flex items-center justify-end gap-0.5">
                                <Trophy className="h-3 w-3" />#{yourRank}
                            </span>
                        </div>
                    )}

                    {/* Attempted count */}
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                        <Users className="h-3 w-3 shrink-0" />
                        <span>{totalAttempts.toLocaleString()} students attempted</span>
                    </div>
                </div>

                {/* ── CTA / action buttons ── */}
                <div className="px-4 pb-4">
                    {!isCompleted ? (
                        <button
                            onClick={() => !isDisabled && onStart(quiz)}
                            disabled={isDisabled}
                            className={`
                                w-full h-10 rounded-lg text-sm font-semibold
                                flex items-center justify-center gap-2
                                transition-all duration-150
                                ${isDisabled
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                    : 'bg-[#1a9e5c] hover:bg-[#168a50] text-white cursor-pointer shadow-sm hover:shadow'
                                }
                            `}
                        >
                            {isLocked ? (
                                <><Lock className="h-4 w-4" /> Locked</>
                            ) : isFuture ? (
                                <><CalendarIcon className="h-4 w-4" /> Coming Soon</>
                            ) : (
                                <><Play className="h-4 w-4 fill-white" /> Start Quiz →</>
                            )}
                        </button>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 text-xs gap-1 border-gray-200 dark:border-gray-700 font-medium"
                                onClick={() =>
                                    window.open(
                                        `/student/exam-window?quizId=${quiz.id}&title=${encodeURIComponent(quiz.title)}&subject=${encodeURIComponent(quiz.subject)}&duration=${quiz.duration}&questions=${quiz.questions}&mode=solution`,
                                        '_blank',
                                        'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no'
                                    )
                                }
                            >
                                <BookOpen className="h-3 w-3" />
                                Solution
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 text-xs gap-1 border-gray-200 dark:border-gray-700 font-medium"
                                onClick={() => setShowLeaderboard(true)}
                            >
                                <BarChart3 className="h-3 w-3" />
                                Analysis
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 flex items-center justify-center border-gray-200 dark:border-gray-700"
                                onClick={() => onStart(quiz)}
                                title="Retry Quiz"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
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
