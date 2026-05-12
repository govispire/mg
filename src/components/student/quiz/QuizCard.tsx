import React, { useState } from 'react';
import {
    Play, Lock, Calendar as CalendarIcon,
    Bookmark, Clock, Users,
    BarChart3, RotateCcw, BookOpen, Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExtendedQuiz } from '@/types/quizTypes';
import QuizLeaderboardModal from './QuizLeaderboardModal';
import { getQuizLeaderboard } from '@/services/quizLeaderboardService';

interface QuizCardProps {
    quiz: ExtendedQuiz;
    onStart: (quiz: ExtendedQuiz) => void;
    todayStr: string;
    index?: number;
    viewMode?: 'grid' | 'list';
}

// Grey accent for the top border / number badge
const ACCENT_COLORS = [
    { border: "#cbd5e1", light: "#f8fafc", text: "#64748b" }, // slate-300, slate-50, slate-500
];

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart, todayStr, index = 0, viewMode = 'grid' }) => {
    const navigate = useNavigate();
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

    if (viewMode === 'list') {
        return (
            <>
                <div
                    className={`
                        bg-white rounded-xl border border-gray-200 shadow-sm
                        hover:shadow-md hover:border-emerald-200
                        transition-all duration-200
                        flex flex-col sm:flex-row items-center gap-4 p-4
                        ${isDisabled ? 'opacity-70' : ''}
                    `}
                    style={{ borderLeft: `4px solid ${accent.border}` }}
                >
                    {/* Left: Badge & Title */}
                    <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                         <span
                             className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-base font-black shadow-sm flex-shrink-0"
                             style={{ background: accent.light, color: accent.text, border: `2px solid ${accent.border}` }}
                         >
                             {num}
                         </span>
                         <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2">
                                 <h3 className="font-extrabold text-[16px] text-gray-900 leading-tight truncate">
                                     {quiz.title}
                                 </h3>
                                 <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider shrink-0">
                                     Free
                                 </span>
                             </div>
                             <div className="flex items-center gap-3 mt-1">
                                 <p className="text-xs font-medium text-gray-500">{quizTypeLabel}</p>
                                 <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                                 <div className="flex items-center gap-1 text-xs text-gray-500">
                                     <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                     <span className="font-medium">{totalAttempts.toLocaleString()}</span>
                                 </div>
                             </div>
                         </div>
                    </div>

                    {/* Middle: Stats */}
                    <div className="grid grid-cols-3 items-center justify-items-center gap-2 sm:px-2 sm:border-x border-gray-100 w-full sm:w-[280px] shrink-0 py-1">
                        {!isCompleted ? (
                            <>
                                <div className="flex flex-col items-center">
                                    <span className="text-[15px] font-black text-gray-900">{quiz.questions}</span>
                                    <span className="text-[10px] font-medium text-gray-400">Questions</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[15px] font-black text-gray-900">{totalMarks}</span>
                                    <span className="text-[10px] font-medium text-gray-400">Marks</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[15px] font-black text-gray-900">{quiz.duration}</span>
                                    <span className="text-[10px] font-medium text-gray-400">Min</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col items-center">
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-[15px] font-black text-gray-900">{yourMarks}</span>
                                        <span className="text-[10px] font-medium text-gray-400">/{totalMarks}</span>
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-400">Score</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-[15px] font-black text-gray-900">{yourRank}</span>
                                        <span className="text-[10px] font-medium text-gray-400">/{totalAttempts > 0 ? totalAttempts : '—'}</span>
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-400">Rank</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[15px] font-black text-gray-900">{timeSpent}m</span>
                                    <span className="text-[10px] font-medium text-gray-400">Time</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: CTA */}
                    <div className="flex items-center sm:justify-end gap-2 w-full sm:w-[220px] shrink-0 mt-2 sm:mt-0">
                        {isCompleted ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 sm:flex-none h-9 text-xs gap-1 border-gray-200 bg-white text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary font-semibold"
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
                                    className="flex-1 sm:flex-none h-9 text-xs gap-1 border-gray-200 bg-white text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary font-semibold"
                                    onClick={() => navigate('/student/test-analysis')}
                                >
                                    <BarChart3 className="h-3.5 w-3.5" /> Analysis
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    title="Leaderboard"
                                    className="h-9 w-9 p-0 border-gray-200 bg-white text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary shrink-0"
                                    onClick={() => setShowLeaderboard(true)}
                                >
                                    <Trophy className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <button
                                onClick={() => !isDisabled && onStart(quiz)}
                                disabled={isDisabled}
                                className={`
                                    flex-1 sm:flex-none sm:w-[120px] h-9 rounded-lg text-sm font-semibold
                                    flex items-center justify-center gap-1.5
                                    transition-all duration-150 active:scale-[0.98]
                                    ${isDisabled
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                        : 'bg-primary hover:bg-primary/90 text-white shadow-sm'
                                    }
                                `}
                            >
                                {isLocked ? (
                                    <><Lock className="h-3.5 w-3.5" /> Locked</>
                                ) : isFuture ? (
                                    <><CalendarIcon className="h-3.5 w-3.5" /> Soon</>
                                ) : (
                                    <>
                                        <Play className="h-3.5 w-3.5 fill-white text-white" />
                                        Start
                                    </>
                                )}
                            </button>
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
    }

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
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">
                            Free
                        </span>
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
                                onClick={() => navigate('/student/test-analysis')}
                            >
                                <BarChart3 className="h-3.5 w-3.5" /> Analysis
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                title="Leaderboard"
                                className="h-9 w-9 p-0 border-gray-300 bg-gray-100 text-gray-700 hover:border-primary hover:bg-primary/5 hover:text-primary flex-shrink-0"
                                onClick={() => setShowLeaderboard(true)}
                            >
                                <Trophy className="h-4 w-4" />
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
