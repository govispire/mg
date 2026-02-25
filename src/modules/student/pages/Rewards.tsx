import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, Medal, Award, Star, Zap, Target, Flame, Crown, 
  Sparkles, Gift, Lock, CheckCircle, TrendingUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  requirement: string;
  unlocked: boolean;
  color: string;
  bgColor: string;
}

interface StreakMilestone {
  days: number;
  reward: string;
  description: string;
  unlocked: boolean;
  icon: React.ElementType;
  color: string;
}

const Rewards = () => {
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalQuizzes: 0,
    totalPoints: 0
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('streak_data');
      if (stored) {
        setStreakData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  }, []);

  const allBadges: BadgeData[] = [
    { 
      id: 'first_quiz', 
      name: 'First Steps', 
      description: 'Complete your first quiz',
      icon: Star, 
      requirement: '1 quiz completed',
      unlocked: streakData.totalQuizzes >= 1,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    { 
      id: 'streak_3', 
      name: 'Getting Started', 
      description: '3-day streak achieved',
      icon: Flame, 
      requirement: '3 day streak',
      unlocked: streakData.longestStreak >= 3,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100'
    },
    { 
      id: 'streak_7', 
      name: 'Week Warrior', 
      description: '7-day streak achieved',
      icon: Trophy, 
      requirement: '7 day streak',
      unlocked: streakData.longestStreak >= 7,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100'
    },
    { 
      id: 'streak_14', 
      name: 'Fortnight Fighter', 
      description: '14-day streak achieved',
      icon: Medal, 
      requirement: '14 day streak',
      unlocked: streakData.longestStreak >= 14,
      color: 'text-gray-400',
      bgColor: 'bg-gray-100'
    },
    { 
      id: 'streak_30', 
      name: 'Monthly Master', 
      description: '30-day streak achieved',
      icon: Crown, 
      requirement: '30 day streak',
      unlocked: streakData.longestStreak >= 30,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-50'
    },
    { 
      id: 'streak_50', 
      name: 'Quiz Champion', 
      description: '50-day streak achieved',
      icon: Award, 
      requirement: '50 day streak',
      unlocked: streakData.longestStreak >= 50,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    { 
      id: 'streak_100', 
      name: 'Legendary', 
      description: '100-day streak achieved',
      icon: Sparkles, 
      requirement: '100 day streak',
      unlocked: streakData.longestStreak >= 100,
      color: 'text-red-500',
      bgColor: 'bg-red-100'
    },
    { 
      id: 'quizzes_10', 
      name: 'Quiz Enthusiast', 
      description: 'Complete 10 quizzes',
      icon: Target, 
      requirement: '10 quizzes',
      unlocked: streakData.totalQuizzes >= 10,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    { 
      id: 'quizzes_50', 
      name: 'Quiz Expert', 
      description: 'Complete 50 quizzes',
      icon: Zap, 
      requirement: '50 quizzes',
      unlocked: streakData.totalQuizzes >= 50,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100'
    },
    { 
      id: 'quizzes_100', 
      name: 'Quiz Master', 
      description: 'Complete 100 quizzes',
      icon: Crown, 
      requirement: '100 quizzes',
      unlocked: streakData.totalQuizzes >= 100,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100'
    },
    { 
      id: 'points_500', 
      name: 'Point Collector', 
      description: 'Earn 500 points',
      icon: Gift, 
      requirement: '500 points',
      unlocked: streakData.totalPoints >= 500,
      color: 'text-pink-500',
      bgColor: 'bg-pink-100'
    },
    { 
      id: 'points_2000', 
      name: 'Point Master', 
      description: 'Earn 2000 points',
      icon: Sparkles, 
      requirement: '2000 points',
      unlocked: streakData.totalPoints >= 2000,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-100'
    },
  ];

  const milestones: StreakMilestone[] = [
    { days: 3, reward: 'Bronze Badge', description: 'Unlock bronze badge and 50 bonus points', unlocked: streakData.currentStreak >= 3, icon: Award, color: 'text-amber-600' },
    { days: 7, reward: '7-Day Champion', description: 'Weekly champion title and 100 bonus points', unlocked: streakData.currentStreak >= 7, icon: Trophy, color: 'text-yellow-500' },
    { days: 14, reward: 'Silver Badge', description: 'Silver badge and exclusive avatar frame', unlocked: streakData.currentStreak >= 14, icon: Medal, color: 'text-gray-400' },
    { days: 30, reward: 'Gold Badge', description: 'Gold badge and 500 bonus points', unlocked: streakData.currentStreak >= 30, icon: Crown, color: 'text-yellow-400' },
    { days: 50, reward: 'Quiz Master Title', description: 'Exclusive Quiz Master title', unlocked: streakData.currentStreak >= 50, icon: Award, color: 'text-purple-500' },
    { days: 100, reward: 'Legend Status', description: 'Legendary status and 2000 bonus points', unlocked: streakData.currentStreak >= 100, icon: Sparkles, color: 'text-red-500' },
  ];

  const unlockedBadges = allBadges.filter(b => b.unlocked);
  const lockedBadges = allBadges.filter(b => !b.unlocked);
  const nextMilestone = milestones.find(m => !m.unlocked);
  const progressToNext = nextMilestone ? (streakData.currentStreak / nextMilestone.days) * 100 : 100;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Hero Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 text-white border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30" />
          <CardContent className="p-6 md:p-8 relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Achievements</h1>
                <p className="text-orange-100 text-lg">Keep the streak alive!</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Flame className="h-8 w-8 text-yellow-300 animate-pulse" />
                    <span className="text-5xl font-bold">{streakData.currentStreak}</span>
                  </div>
                  <p className="text-orange-100 text-sm">Day Streak</p>
                </div>
                <div className="h-16 w-px bg-white/20" />
                <div className="text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-1 text-yellow-300" />
                  <span className="text-2xl font-bold">{unlockedBadges.length}</span>
                  <p className="text-orange-100 text-sm">/{allBadges.length} Badges</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Current Streak', value: `${streakData.currentStreak} days`, icon: Flame, color: 'text-orange-500' },
          { label: 'Best Streak', value: `${streakData.longestStreak} days`, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Total Quizzes', value: streakData.totalQuizzes, icon: Target, color: 'text-blue-500' },
          { label: 'Total Points', value: streakData.totalPoints, icon: Star, color: 'text-yellow-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Next Milestone Progress */}
      {nextMilestone && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <nextMilestone.icon className={`h-8 w-8 ${nextMilestone.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">Next Milestone: {nextMilestone.reward}</h3>
                      <p className="text-sm text-muted-foreground">{nextMilestone.description}</p>
                    </div>
                    <Badge variant="outline" className="text-lg font-bold">
                      {streakData.currentStreak}/{nextMilestone.days}
                    </Badge>
                  </div>
                  <Progress value={progressToNext} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Streak Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Streak Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.days}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  milestone.unlocked 
                    ? 'border-green-300 bg-green-50/50 dark:bg-green-900/20' 
                    : 'border-muted bg-muted/30 opacity-60'
                }`}
              >
                {milestone.unlocked && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-full ${milestone.unlocked ? 'bg-white shadow' : 'bg-muted'}`}>
                    <milestone.icon className={`h-5 w-5 ${milestone.unlocked ? milestone.color : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{milestone.days}-Day Streak</h4>
                    <p className="text-sm text-muted-foreground">{milestone.reward}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{milestone.description}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unlocked Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Unlocked Badges ({unlockedBadges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unlockedBadges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <AnimatePresence>
                {unlockedBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05, type: 'spring' }}
                    whileHover={{ scale: 1.05 }}
                    className="relative p-4 rounded-xl text-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700"
                  >
                    <div className="absolute -top-1 -right-1">
                      <span className="text-lg">✨</span>
                    </div>
                    <div className={`w-12 h-12 mx-auto ${badge.bgColor} rounded-full flex items-center justify-center mb-2 shadow-lg`}>
                      <badge.icon className={`h-6 w-6 ${badge.color}`} />
                    </div>
                    <h4 className="font-semibold text-sm">{badge.name}</h4>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No badges unlocked yet</p>
              <p className="text-sm">Complete quizzes and maintain streaks to earn badges!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Locked Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Locked Badges ({lockedBadges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {lockedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className="p-4 rounded-xl text-center bg-muted/50 border-2 border-dashed border-muted-foreground/20 opacity-60"
              >
                <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-sm text-muted-foreground">{badge.name}</h4>
                <p className="text-xs text-muted-foreground">{badge.requirement}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Rewards;
