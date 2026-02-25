import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    Trophy, Zap, Clock, Star, Award, Users
} from 'lucide-react';
import { QuizLeaderboard, LeaderboardRankingType, QuizLeaderboardEntry } from '@/services/quizLeaderboardService';

interface QuizLeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    leaderboard: QuizLeaderboard;
}

const QuizLeaderboardModal: React.FC<QuizLeaderboardModalProps> = ({
    isOpen,
    onClose,
    leaderboard
}) => {
    const [activeTab, setActiveTab] = useState<LeaderboardRankingType>('score');

    const getRankBadge = (rank: number) => {
        if (rank === 1) return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30' };
        if (rank === 2) return { icon: Award, color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-950/30' };
        if (rank === 3) return { icon: Award, color: 'text-amber-700', bg: 'bg-amber-50 dark:bg-amber-950/30' };
        return null;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderLeaderboardList = (entries: QuizLeaderboardEntry[], type: LeaderboardRankingType) => {
        return (
            <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-4">
                    {entries.map((entry) => {
                        const rankBadge = getRankBadge(entry.rank);

                        return (
                            <div
                                key={entry.userId}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${rankBadge
                                        ? `${rankBadge.bg} border-2 border-current ${rankBadge.color}`
                                        : 'bg-muted/30 hover:bg-muted/50'
                                    }`}
                            >
                                {/* Rank */}
                                <div className="w-10 flex justify-center items-center">
                                    {rankBadge ? (
                                        <rankBadge.icon className="h-6 w-6" />
                                    ) : (
                                        <span className="text-sm font-bold text-muted-foreground">
                                            #{entry.rank}
                                        </span>
                                    )}
                                </div>

                                {/* Avatar */}
                                <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm">
                                    {entry.avatar}
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">{entry.userName}</p>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        {type === 'score' && (
                                            <>
                                                <span>{entry.score}% score</span>
                                                <span>•</span>
                                                <span>{formatTime(entry.timeTaken)}</span>
                                            </>
                                        )}
                                        {type === 'speed' && (
                                            <>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(entry.timeTaken)}
                                                </span>
                                                <span>•</span>
                                                <span>{entry.accuracy}% accuracy</span>
                                            </>
                                        )}
                                        {type === 'completion' && (
                                            <>
                                                <span className="flex items-center gap-1">
                                                    <Star className="h-3 w-3" />
                                                    {new Date(entry.completedAt).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Primary Metric */}
                                <div className="text-right">
                                    {type === 'score' && (
                                        <p className="text-lg font-bold text-primary">{entry.score}%</p>
                                    )}
                                    {type === 'speed' && (
                                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                            {formatTime(entry.timeTaken)}
                                        </p>
                                    )}
                                    {type === 'completion' && (
                                        <Badge variant="secondary" className="text-xs">
                                            First {entry.rank}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <DialogTitle className="text-xl">Quiz Leaderboard</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">{leaderboard.quizTitle}</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-sm font-bold text-primary">
                                {leaderboard.totalParticipants.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as LeaderboardRankingType)}>
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="score" className="flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            Top Scores
                        </TabsTrigger>
                        <TabsTrigger value="speed" className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Fastest
                        </TabsTrigger>
                        <TabsTrigger value="completion" className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            First Complete
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-4">
                        <TabsContent value="score" className="mt-0">
                            {renderLeaderboardList(leaderboard.topByScore, 'score')}
                        </TabsContent>

                        <TabsContent value="speed" className="mt-0">
                            {renderLeaderboardList(leaderboard.topBySpeed, 'speed')}
                        </TabsContent>

                        <TabsContent value="completion" className="mt-0">
                            {renderLeaderboardList(leaderboard.topByCompletion, 'completion')}
                        </TabsContent>
                    </div>
                </Tabs>

                {/* User Rank */}
                {leaderboard.userRank && (
                    <div className="pt-4 border-t">
                        <p className="text-sm font-semibold mb-2">Your Ranking</p>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-primary">#{leaderboard.userRank.byScore}</p>
                                <p className="text-xs text-muted-foreground">By Score</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    #{leaderboard.userRank.bySpeed}
                                </p>
                                <p className="text-xs text-muted-foreground">By Speed</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    #{leaderboard.userRank.byCompletion}
                                </p>
                                <p className="text-xs text-muted-foreground">Completion</p>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default QuizLeaderboardModal;
