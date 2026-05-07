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

// Rotating accent colors for the top border / badge
const ACCENT_COLORS = [
    { border: "#ef4444", light: "#fef2f2", text: "#dc2626" },  // red
    { border: "#f97316", light: "#fff7ed", text: "#ea580c" },  // orange
    { border: "#22c55e", light: "#f0fdf4", text: "#16a34a" },  // green
    { border: "#06b6d4", light: "#ecfeff", text: "#0891b2" },  // cyan
    { border: "#8b5cf6", light: "#f5f3ff", text: "#7c3aed" },  // purple
    { border: "#f59e0b", light: "#fffbeb", text: "#d97706" },  // amber
    { border: "#ec4899", light: "#fdf2f8", text: "#db2777" },  // pink
    { border: "#10b981", light: "#ecfdf5", text: "#059669" },  // emerald
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

    return (
        <>
            <div
                className={`
                    bg-white
                    rounded-xl shadow-sm
                    hover:shadow-md hover:-translate-y-0.5
                    transition-all duration-200
                    flex flex-col overflow-hidden
                    border border-gray-100
                    ${isDisabled ? 'opacity-70' : ''}
                `}
                style={{ borderTop: `3px solid ${accent.border}` }}
            >
                {/* Card body */}
                <div className="p-4 flex flex-col gap-3 flex-1">

                    {/* Row 1: number badge + bookmark */}
                    <div className="flex items-start justify-between">
                        {/* Numbered badge */}
                        <span
                            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-extrabold shadow-sm flex-shrink-0"
                            style={{ background: accent.light, color: accent.text, border: `2px solid ${accent.border}` }}
                        >
                            {num}
                        </span>

                        {/* Bookmark */}
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

                    {/* Title */}
                    <div>
                        <h3 className="font-bold text-[15px] text-gray-900 leading-snug line-clamp-1">
                            {quiz.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">
                            {quiz.type === 'full-prelims' || quiz.type === 'full-mains'
                                ? 'Full Length Mock Test'
                                : quiz.type === 'sectional'
                                    ? 'Sectional Test'
                                    : quiz.type === 'speed-challenge'
                                        ? 'Speed Challenge'
                                        : quiz.type === 'rapid-fire'
                                            ? 'Rapid Fire Quiz'
                                            : quiz.type === 'mini-test'
                                                ? 'Mini Mock Test'
                                                : 'Daily Quiz'}
                        </p>
                    </div>

                    {/* Students row */}
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                        <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">{totalAttempts.toLocaleString()} Students</span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Stats grid: Questions / Marks / Min */}
                    {!isCompleted ? (
                        <div className="grid grid-cols-3 gap-2 text-center">
                            {[
                                { val: quiz.questions, label: "Questions" },
                                { val: totalMarks,     label: "Marks" },
                                { val: quiz.duration,  label: "Min" },
                            ].map(stat => (
                                <div key={stat.label}>
                                    <p className="text-lg font-extrabold text-gray-800 leading-tight">{stat.val}</p>
                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2 text-center">
                            {[
                                { val: `${yourMarks}/${totalMarks}`, label: "Score",   color: "#16a34a" },
                                { val: `${timeSpent}m`,              label: "Time",    color: "#374151" },
                                { val: `#${yourRank}`,               label: "Rank",    color: "#7c3aed" },
                            ].map(stat => (
                                <div key={stat.label}>
                                    <p className="text-base font-extrabold leading-tight" style={{ color: stat.color }}>{stat.val}</p>
                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="px-4 pb-4">
                    {!isCompleted ? (
                        <button
                            onClick={() => !isDisabled && onStart(quiz)}
                            disabled={isDisabled}
                            className={`
                                w-full h-11 rounded-lg text-sm font-bold
                                flex items-center justify-center gap-2
                                transition-all duration-150
                                ${isDisabled
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'text-white cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98]'
                                }
                            `}
                            style={!isDisabled ? {
                                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
                            } : undefined}
                        >
                            {isLocked ? (
                                <><Lock className="h-4 w-4" /> Locked</>
                            ) : isFuture ? (
                                <><CalendarIcon className="h-4 w-4" /> Coming Soon</>
                            ) : (
                                <>
                                    {/* Play icon filled circle */}
                                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Play className="h-3 w-3 fill-white text-white ml-0.5" />
                                    </span>
                                    Start Test
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 text-xs gap-1 border-gray-200 font-medium"
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
                                className="h-9 text-xs gap-1 border-gray-200 font-medium"
                                onClick={() => setShowLeaderboard(true)}
                            >
                                <BarChart3 className="h-3 w-3" />
                                Analysis
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 flex items-center justify-center border-gray-200"
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
