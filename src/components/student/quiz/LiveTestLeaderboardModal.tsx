import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X, Trophy, Award, Medal, Clock, Target,
  TrendingUp, Users, Star, Crown
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar: string;
  score: number;
  timeTaken: number; // in seconds
  accuracy: number;
  completedAt: string;
  isCurrentUser?: boolean;
}

interface LiveTestLeaderboardModalProps {
  test: {
    id: number;
    title: string;
    questions: number;
    duration: number;
    marks: number;
  };
  onClose: () => void;
  userCompletion?: {
    score: number;
    completedAt: string;
  };
}

// ── Mock User Names ──────────────────────────────────────────────────────────
const MOCK_NAMES = [
  'Priya Sharma', 'Rahul Kumar', 'Anjali Singh', 'Vikram Patel',
  'Sneha Reddy', 'Amit Kumar', 'Pooja Gupta', 'Rohit Verma',
  'Kritika Joshi', 'Saurabh Tiwari', 'Neha Agarwal', 'Karan Malhotra',
  'Divya Nair', 'Aditya Singh', 'Ritu Chauhan', 'Manish Pandey',
  'Shreya Iyer', 'Nikhil Desai', 'Aarti Mehta', 'Varun Kapoor'
];

const AVATAR_COLORS = [
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
  'from-green-400 to-green-600',
  'from-yellow-400 to-yellow-600',
  'from-red-400 to-red-600',
  'from-indigo-400 to-indigo-600',
  'from-teal-400 to-teal-600',
];

// ── Helper Functions ─────────────────────────────────────────────────────────
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateMockLeaderboard = (
  testId: number,
  totalParticipants: number,
  userScore?: number,
  timestamp?: Date
): LeaderboardEntry[] => {
  const entries: LeaderboardEntry[] = [];
  
  // Use timestamp as seed for variation on each update
  const seedBase = timestamp ? timestamp.getTime() : Date.now();

  // Generate top performers
  for (let i = 0; i < Math.min(20, totalParticipants); i++) {
    const seed = testId * 1000 + i + Math.floor(seedBase / 1000);
    const baseScore = 95 - (i * 2) + seededRandom(seed) * 10;
    const score = Math.min(100, Math.max(60, baseScore));
    const timeTaken = 1800 + seededRandom(seed + 1) * 1800; // 30-60 mins
    const accuracy = 70 + seededRandom(seed + 2) * 25;

    entries.push({
      rank: i + 1,
      userId: `user_${i}`,
      userName: MOCK_NAMES[i % MOCK_NAMES.length],
      avatar: `AVATAR`,
      score: Math.round(score),
      timeTaken: Math.round(timeTaken),
      accuracy: Math.round(accuracy),
      completedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    });
  }

  // Insert user if they have a score
  if (userScore !== undefined) {
    const userRank = entries.filter(e => e.score > userScore).length + 1;
    entries.push({
      rank: userRank,
      userId: 'current_user',
      userName: 'You',
      avatar: 'YOU',
      score: userScore,
      timeTaken: 2400, // Mock 40 mins
      accuracy: 75,
      completedAt: new Date().toISOString(),
      isCurrentUser: true,
    });

    // Re-sort and update ranks
    entries.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);
    entries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });
  }

  return entries.slice(0, 50); // Top 50
};

// ── Format Helpers ───────────────────────────────────────────────────────────
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const formatRank = (rank: number) => {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
};

// ── Main Component ───────────────────────────────────────────────────────────
const LiveTestLeaderboardModal: React.FC<LiveTestLeaderboardModalProps> = ({
  test,
  onClose,
  userCompletion,
}) => {
  const [activeTab, setActiveTab] = useState<'toppers' | 'fastest' | 'accuracy'>('toppers');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-refresh leaderboard every 10 seconds while test is live
  React.useEffect(() => {
    const isTestLive = new Date() >= test.examDateTime && 
                       new Date() <= new Date(test.examDateTime.getTime() + test.duration * 60000);
    
    if (isTestLive) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 10000); // Update every 10 seconds during live test
      
      return () => clearInterval(interval);
    }
  }, [test]);

  const leaderboard = useMemo(() => {
    // Regenerate leaderboard with latest timestamp for live tests
    return generateMockLeaderboard(test.id, 15000, userCompletion?.score, lastUpdate);
  }, [test.id, userCompletion?.score, lastUpdate]);

  const userEntry = leaderboard.find(e => e.isCurrentUser);

  // Sort by different criteria
  const sortedEntries = useMemo(() => {
    const entries = [...leaderboard];
    switch (activeTab) {
      case 'fastest':
        return entries.filter(e => e.accuracy >= 60).sort((a, b) => a.timeTaken - b.timeTaken);
      case 'accuracy':
        return entries.sort((a, b) => b.accuracy - a.accuracy);
      default:
        return entries.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);
    }
  }, [leaderboard, activeTab]);

  // Update ranks based on sorting
  const entriesWithRanks = sortedEntries.map((entry, idx) => ({
    ...entry,
    displayRank: idx + 1,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
                <Badge className="bg-white/20 text-white text-xs font-semibold border-0">
                  LIVE TEST LEADERBOARD
                </Badge>
                {/* Live indicator */}
                {new Date() >= test.examDateTime && new Date() <= new Date(test.examDateTime.getTime() + test.duration * 60000) && (
                  <Badge className="bg-red-500 text-white text-xs font-semibold border-0 flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    LIVE
                  </Badge>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold mb-1 line-clamp-2">{test.title}</h2>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-white/90">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{test.questions} Questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{test.duration} Minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{test.marks} Marks</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 shrink-0"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* User Stats Summary */}
        {userEntry && (
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-b-2 border-emerald-200 p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                {userEntry.userName[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-bold text-base sm:text-lg text-emerald-800">Your Performance</h3>
                </div>
                <p className="text-xs sm:text-sm text-emerald-700">
                  You ranked <span className="font-black text-lg sm:text-xl">#{userEntry.rank}</span> out of {leaderboard.length.toLocaleString()}+ participants
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 text-center border-2 border-emerald-200">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">{userEntry.score}%</div>
                <div className="text-[10px] sm:text-xs text-slate-600 font-medium">Score</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border-2 border-emerald-200">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">#{userEntry.rank}</div>
                <div className="text-[10px] sm:text-xs text-slate-600 font-medium">Rank</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border-2 border-emerald-200">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">{userEntry.accuracy}%</div>
                <div className="text-[10px] sm:text-xs text-slate-600 font-medium">Accuracy</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b-2 border-slate-200 px-4 sm:px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('toppers')}
              className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'toppers'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Trophy className="h-4 w-4 inline mr-1.5" />
              Top Scorers
            </button>
            <button
              onClick={() => setActiveTab('fastest')}
              className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'fastest'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Clock className="h-4 w-4 inline mr-1.5" />
              Fastest
            </button>
            <button
              onClick={() => setActiveTab('accuracy')}
              className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'accuracy'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Target className="h-4 w-4 inline mr-1.5" />
              Accuracy
            </button>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="overflow-y-auto max-h-[400px] sm:max-h-[500px] p-4 sm:p-6">
          <div className="space-y-2">
            {entriesWithRanks.slice(0, 20).map((entry, idx) => {
              const isTop3 = idx < 3;
              const isCurrentUser = entry.isCurrentUser;
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

              return (
                <div
                  key={entry.userId}
                  className={`relative rounded-xl border-2 p-3 sm:p-4 transition-all hover:shadow-md ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-300 shadow-md'
                      : isTop3
                      ? 'bg-gradient-to-r from-amber-50/50 to-white border-amber-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className="shrink-0 w-10 sm:w-12 text-center">
                      {idx === 0 && <Crown className="h-7 w-7 sm:h-8 sm:w-8 mx-auto text-yellow-500" />}
                      {idx === 1 && <Medal className="h-7 w-7 sm:h-8 sm:w-8 mx-auto text-slate-400" />}
                      {idx === 2 && <Award className="h-7 w-7 sm:h-8 sm:w-8 mx-auto text-amber-600" />}
                      {idx > 2 && (
                        <div className="text-lg sm:text-xl font-black text-slate-600">
                          {entry.displayRank}
                        </div>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md`}>
                      {entry.userName.split(' ').map(n => n[0]).join('')}
                    </div>

                    {/* Name & Stats */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm sm:text-base text-slate-800 truncate">
                          {entry.userName}
                          {isCurrentUser && (
                            <Badge className="ml-2 bg-emerald-500 text-white text-[10px] font-semibold">
                              YOU
                            </Badge>
                          )}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Target className="h-3.5 w-3.5" />
                          <span className="font-semibold">{entry.score}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-semibold">{formatTime(entry.timeTaken)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span className="font-semibold">{entry.accuracy}% accuracy</span>
                        </div>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div className="shrink-0">
                      <div className={`text-xl sm:text-2xl font-black ${
                        entry.score >= 80 ? 'text-emerald-600' :
                        entry.score >= 60 ? 'text-amber-600' : 'text-slate-600'
                      }`}>
                        {entry.score}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-slate-200 p-4 sm:p-5 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <Users className="h-4 w-4" />
                <span className="font-medium">{leaderboard.length.toLocaleString()}+ participants</span>
              </div>
              {/* Real-time update indicator */}
              {new Date() >= test.examDateTime && new Date() <= new Date(test.examDateTime.getTime() + test.duration * 60000) && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-pulse inline-flex h-full w-full rounded-full bg-emerald-500" />
                  </span>
                  <span>Updating live • Last: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
            <Button
              size="sm"
              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTestLeaderboardModal;
