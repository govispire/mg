import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Trophy, Award, Flame
} from 'lucide-react';
import { LeaderboardEntry, LeaderboardPeriod } from '@/services/leaderboardService';

interface LeaderboardProps {
    leaderboardData: LeaderboardEntry[];
    period: LeaderboardPeriod;
    onPeriodChange: (period: LeaderboardPeriod) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
    leaderboardData,
    period,
    onPeriodChange
}) => {
    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
        if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />;
        if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
        return (
            <span className="text-sm font-semibold text-muted-foreground w-5 text-center">
                {rank}
            </span>
        );
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Leaderboard
                </CardTitle>
            </CardHeader>

            <CardContent>
                <Tabs value={period} onValueChange={(val) => onPeriodChange(val as LeaderboardPeriod)}>
                    <TabsList className="w-full grid grid-cols-3 mb-4">
                        <TabsTrigger value="daily" className="text-xs">
                            Today
                        </TabsTrigger>
                        <TabsTrigger value="weekly" className="text-xs">
                            Week
                        </TabsTrigger>
                        <TabsTrigger value="monthly" className="text-xs">
                            Month
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={period} className="mt-0">
                        <ScrollArea className="h-[340px] pr-4">
                            <div className="space-y-2">
                                {leaderboardData.map((entry) => {
                                    const isCurrentUser = entry.name === 'You';

                                    return (
                                        <div
                                            key={entry.rank}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isCurrentUser
                                                    ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/30 shadow-sm'
                                                    : 'bg-muted/30 hover:bg-muted/50'
                                                }`}
                                        >
                                            {/* Rank Badge */}
                                            <div className="w-8 flex justify-center items-center">
                                                {getRankBadge(entry.rank)}
                                            </div>

                                            {/* Avatar */}
                                            <div
                                                className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm ${isCurrentUser
                                                        ? 'bg-gradient-to-br from-primary to-primary/80 text-white'
                                                        : 'bg-primary/20 text-primary'
                                                    }`}
                                            >
                                                {entry.avatar}
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`font-semibold text-sm truncate ${isCurrentUser ? 'text-primary' : ''
                                                        }`}
                                                >
                                                    {entry.name}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Flame className="h-3 w-3 text-orange-500" />
                                                        {entry.streak} {entry.streak === 1 ? 'day' : 'days'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{entry.quizzesCompleted} quizzes</span>
                                                </div>
                                            </div>

                                            {/* Score */}
                                            <div className="text-right">
                                                <p
                                                    className={`font-bold text-sm ${isCurrentUser
                                                            ? 'bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent text-base'
                                                            : ''
                                                        }`}
                                                >
                                                    {entry.score.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">pts</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default Leaderboard;
