import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Clock, Play, Lock, Calendar as CalendarIcon,
    Trophy, Users, RotateCcw, BarChart3, FileText
} from 'lucide-react';
import { ExtendedQuiz, QuizType } from '@/types/quizTypes';
import QuizLeaderboardModal from './QuizLeaderboardModal';
import { getQuizLeaderboard } from '@/services/quizLeaderboardService';

interface QuizCardProps {
    quiz: ExtendedQuiz;
    onStart: (quiz: ExtendedQuiz) => void;
    todayStr: string;
}

// Type colors matching the image
const TYPE_COLORS: Record<QuizType, string> = {
    'daily': 'bg-blue-500',
    'rapid-fire': 'bg-orange-500',
    'speed-challenge': 'bg-purple-500',
    'mini-test': 'bg-green-500',
    'sectional': 'bg-pink-500',
    'full-prelims': 'bg-indigo-500',
    'full-mains': 'bg-red-500',
};

// Dynamic shadow colors that match each card header
const TYPE_SHADOWS: Record<QuizType, string> = {
    'daily': '0 4px 14px rgba(59,130,246,0.45)',
    'rapid-fire': '0 4px 14px rgba(249,115,22,0.45)',
    'speed-challenge': '0 4px 14px rgba(168,85,247,0.45)',
    'mini-test': '0 4px 14px rgba(34,197,94,0.45)',
    'sectional': '0 4px 14px rgba(236,72,153,0.45)',
    'full-prelims': '0 4px 14px rgba(99,102,241,0.45)',
    'full-mains': '0 4px 14px rgba(239,68,68,0.45)',
};

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart, todayStr }) => {
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    const isLocked = quiz.isLocked;
    const isFuture = quiz.scheduledDate > todayStr;
    const isCompleted = quiz.completed;
    const isDisabled = isLocked || isFuture;

    const leaderboard = isCompleted
        ? getQuizLeaderboard(quiz.id, quiz.title, { score: quiz.score || 0, timeTaken: quiz.duration * 60 * 0.7 })
        : getQuizLeaderboard(quiz.id, quiz.title);

    const totalMarks = quiz.questions * 2;
    const yourMarks = quiz.score || 0;
    const timeSpent = quiz.duration ? Math.floor(quiz.duration * 0.7) : 0; // Mock time spent
    const yourRank = isCompleted ? Math.floor(Math.random() * 50) + 1 : 0; // Mock rank
    const totalAttempts = quiz.totalUsers || 0;

    return (
        <>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                {/* Colored Header with Quiz Type */}
                <div className={`${TYPE_COLORS[quiz.type]} text-white px-3 py-2`}>
                    <p className="text-xs font-semibold uppercase tracking-wide">
                        {quiz.type.replace('-', ' ')}
                    </p>
                </div>

                <CardContent className="p-4">
                    {!isCompleted ? (
                        // BEFORE ATTENDING - Not Completed State
                        <>
                            {/* Quiz Title */}
                            <h3 className="font-bold text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                                {quiz.title}
                            </h3>

                            {/* Stats Grid - 3 columns */}
                            <div className="space-y-1.5 mb-3 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Questions:</span>
                                    <span className="font-semibold">{quiz.questions}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Total Marks:</span>
                                    <span className="font-semibold">{totalMarks}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Duration:</span>
                                    <span className="font-semibold">{quiz.duration} mins</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Attempted:</span>
                                    <span className="font-semibold">{totalAttempts}</span>
                                </div>
                            </div>

                            {/* Start Button */}
                            <button
                                onClick={() => !isDisabled && onStart(quiz)}
                                disabled={isDisabled}
                                style={{
                                    backgroundColor: 'hsl(0deg 0% 100%)',
                                    border: '1px solid #e9e9e9',
                                    boxShadow: isDisabled ? 'none' : TYPE_SHADOWS[quiz.type],
                                }}
                                className={`w-full h-9 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200
                                    ${isDisabled
                                        ? 'cursor-not-allowed opacity-60 text-gray-400'
                                        : 'text-gray-900 hover:brightness-95 cursor-pointer'
                                    }`}
                            >
                                {isLocked ? (
                                    <>
                                        <Lock className="h-3.5 w-3.5" />
                                        Locked
                                    </>
                                ) : isFuture ? (
                                    <>
                                        <CalendarIcon className="h-3.5 w-3.5" />
                                        Coming Soon
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-3.5 w-3.5" style={{ fill: '#111827', color: '#111827' }} />
                                        <span style={{ color: '#111827' }}>Start Quiz</span>
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        // AFTER ATTENDING - Completed State
                        <>
                            {/* Quiz Title */}
                            <h3 className="font-bold text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                                {quiz.title}
                            </h3>

                            {/* Results Grid */}
                            <div className="space-y-1.5 mb-3 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Max Mark:</span>
                                    <span className="font-semibold">{totalMarks}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Your Marks:</span>
                                    <span className="font-semibold text-green-600">{yourMarks}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Time Spent:</span>
                                    <span className="font-semibold">{timeSpent} mins</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Your Rank:</span>
                                    <span className="font-semibold text-purple-600">#{yourRank}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Total Attempts:</span>
                                    <span className="font-semibold">{totalAttempts}</span>
                                </div>
                            </div>

                            {/* Action Buttons Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                {/* Solution Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs flex items-center justify-center gap-1"
                                    onClick={() => {
                                        // Launch quiz in solution mode
                                        window.open(
                                            `/student/exam-window?quizId=${quiz.id}&title=${encodeURIComponent(quiz.title)}&subject=${encodeURIComponent(quiz.subject)}&duration=${quiz.duration}&questions=${quiz.questions}&mode=solution`,
                                            '_blank',
                                            'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no'
                                        );
                                    }}
                                >
                                    <FileText className="h-3 w-3" />
                                    Solution
                                </Button>

                                {/* Analysis Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs flex items-center justify-center gap-1"
                                    onClick={() => setShowLeaderboard(true)}
                                >
                                    <BarChart3 className="h-3 w-3" />
                                    Analysis
                                </Button>

                                {/* Retest Button (Icon) */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-full flex items-center justify-center"
                                    onClick={() => onStart(quiz)}
                                    title="Retake Quiz"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Leaderboard Modal */}
            <QuizLeaderboardModal
                isOpen={showLeaderboard}
                onClose={() => setShowLeaderboard(false)}
                leaderboard={leaderboard}
            />
        </>
    );
};

export default QuizCard;
