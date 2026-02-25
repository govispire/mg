import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Flame, Award, Trophy, Zap, Star, Gift, CheckCircle2
} from 'lucide-react';
import { StreakData } from '@/utils/quizAnalytics';

interface StreakRewardsProps {
  streakData: StreakData;
  onClaimReward?: (rewardId: string) => void;
}

const MILESTONES = [
  { days: 3, title: '3-Day Starter', icon: Zap, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { days: 7, title: 'Week Warrior', icon: Star, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { days: 14, title: 'Fortnight Fighter', icon: Award, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { days: 30, title: 'Monthly Master', icon: Trophy, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { days: 60, title: 'Consistent Champion', icon: Gift, color: 'text-green-500', bgColor: 'bg-green-500/10' },
];

const StreakRewards: React.FC<StreakRewardsProps> = ({ streakData, onClaimReward }) => {
  const currentMilestone = MILESTONES.find((m, index) => {
    return streakData.currentStreak >= m.days &&
      (MILESTONES[index + 1] ? streakData.currentStreak < MILESTONES[index + 1].days : true);
  }) || MILESTONES[0];

  const nextMilestone = MILESTONES.find(m => m.days > streakData.currentStreak);
  const progressToNext = nextMilestone
    ? ((streakData.currentStreak % nextMilestone.days) / nextMilestone.days) * 100
    : 100;

  return (
    <Card className="overflow-hidden border-orange-200/50 dark:border-orange-800/50">
      <CardHeader className="pb-3 bg-gradient-to-br from-orange-50/50 to-red-50/30 dark:from-orange-950/20 dark:to-red-950/10">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-bold">
            Streak Rewards
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Current Streak Display */}
        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-200/50 dark:border-orange-800/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
            <span className="text-5xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {streakData.currentStreak}
            </span>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            {streakData.currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
          </p>
          {streakData.longestStreak > streakData.currentStreak && (
            <p className="text-xs text-muted-foreground mt-1">
              Personal Best: {streakData.longestStreak} days
            </p>
          )}
        </div>

        {/* Weekly Progress */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            This Week's Progress
          </p>
          <div className="flex gap-1.5">
            {streakData.weeklyProgress.map((completed, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${completed
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-muted'
                  }`}
                title={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <span key={index} className="text-[10px] text-muted-foreground flex-1 text-center">
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Next Milestone</span>
              <span className="font-bold text-primary">
                {nextMilestone.days} days
              </span>
            </div>
            <Progress value={progressToNext} className="h-2" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {nextMilestone.days - streakData.currentStreak} more {nextMilestone.days - streakData.currentStreak === 1 ? 'day' : 'days'}
              </span>
              <span className="text-xs font-semibold">{nextMilestone.title}</span>
            </div>
          </div>
        )}

        {/* Achievements */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Achievements
          </p>
          <div className="grid grid-cols-2 gap-2">
            {MILESTONES.slice(0, 4).map((milestone) => {
              const achieved = streakData.longestStreak >= milestone.days;
              const Icon = milestone.icon;

              return (
                <div
                  key={milestone.days}
                  className={`p-3 rounded-xl border transition-all duration-300 ${achieved
                    ? `${milestone.bgColor} border-current ${milestone.color}`
                    : 'bg-muted/30 border-muted text-muted-foreground'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 ${achieved ? '' : 'opacity-50'}`} />
                    {achieved && <CheckCircle2 className="h-3 w-3" />}
                  </div>
                  <p className="text-xs font-bold leading-tight">{milestone.title}</p>
                  <p className="text-[10px] opacity-75 mt-0.5">{milestone.days} days</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{streakData.longestStreak}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Best Streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{streakData.totalQuizzesCompleted}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Quizzes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakRewards;
