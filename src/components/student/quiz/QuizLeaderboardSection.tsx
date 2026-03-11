import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Medal, Crown, Zap, BookOpen, Target, Clock, Flame, Users } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface LeaderEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  testsTaken: number;
  streak: number;
  isCurrentUser?: boolean;
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const NAMES = [
  'Rahul Sharma','Priya Singh','Amit Kumar','Sneha Reddy','Vikram Patel',
  'Anjali Verma','Rohan Gupta','Neha Agarwal','Arjun Mehta','Pooja Das',
  'Karan Joshi','Divya Iyer','Sanjay Nair','Kavita Rao','Manish Desai',
  'Ritu Chauhan','Aditya M.','Swati Kapoor','Deepak Bose','Shweta Shah',
];
const init = (n: string) => n.split(' ').map(x => x[0]).join('').slice(0,2);

function mockBoard(seed: number, size = 12): LeaderEntry[] {
  return Array.from({ length: size }, (_, i) => {
    const nm = NAMES[(seed + i * 3) % NAMES.length];
    const isYou = i === size - 3;
    return {
      rank: i + 1,
      name: isYou ? 'You' : nm,
      avatar: isYou ? 'YO' : init(nm),
      score: Math.max(50, 98 - i * 3 - (seed % 5)),
      testsTaken: Math.max(8, 80 - i * 4 - (seed % 8)),
      streak: Math.max(1, 28 - i * 2),
      isCurrentUser: isYou,
    };
  });
}

// ── Quiz type configs ─────────────────────────────────────────────────────────
const QUIZ_TYPES = [
  { type: 'daily',           label: 'Daily Quiz',      dotColor: 'bg-blue-500',   textColor: 'text-blue-700',   icon: <BookOpen className="h-3 w-3 text-blue-500" /> },
  { type: 'rapid-fire',     label: 'Rapid Fire',       dotColor: 'bg-orange-500', textColor: 'text-orange-700', icon: <Zap className="h-3 w-3 text-orange-500" /> },
  { type: 'speed-challenge',label: 'Speed Challenge',  dotColor: 'bg-purple-500', textColor: 'text-purple-700', icon: <Clock className="h-3 w-3 text-purple-500" /> },
  { type: 'mini-test',      label: 'Mini Test',        dotColor: 'bg-green-500',  textColor: 'text-green-700',  icon: <Target className="h-3 w-3 text-green-500" /> },
  { type: 'sectional',      label: 'Sectional',        dotColor: 'bg-pink-500',   textColor: 'text-pink-700',   icon: <Target className="h-3 w-3 text-pink-500" /> },
  { type: 'full-prelims',   label: 'Full Prelims',     dotColor: 'bg-indigo-500', textColor: 'text-indigo-700', icon: <Trophy className="h-3 w-3 text-indigo-500" /> },
  { type: 'full-mains',     label: 'Full Mains',       dotColor: 'bg-red-500',    textColor: 'text-red-700',    icon: <Trophy className="h-3 w-3 text-red-500" /> },
];

// ── Podium slot ───────────────────────────────────────────────────────────────
interface PodiumSlotProps {
  entry: LeaderEntry;
  position: 1 | 2 | 3;
}
const PodiumSlot: React.FC<PodiumSlotProps> = ({ entry, position }) => {
  const configs = {
    1: { icon: <Crown className="h-4 w-4 text-yellow-500" />, avatarRing: 'ring-2 ring-yellow-400', avatarBg: 'bg-yellow-100 text-yellow-800', badgeClass: 'bg-yellow-500 text-white', height: 'pt-0' },
    2: { icon: <Medal className="h-4 w-4 text-slate-400" />,  avatarRing: 'ring-2 ring-slate-300',  avatarBg: 'bg-slate-100 text-slate-700',    badgeClass: 'bg-slate-400 text-white',  height: 'pt-4' },
    3: { icon: <Medal className="h-4 w-4 text-amber-600" />,  avatarRing: 'ring-2 ring-amber-300',  avatarBg: 'bg-amber-50 text-amber-800',    badgeClass: 'bg-amber-500 text-white',  height: 'pt-4' },
  };
  const c = configs[position];
  const avatarSize = position === 1 ? 'w-12 h-12 text-sm' : 'w-10 h-10 text-xs';

  return (
    <div className={`flex flex-col items-center gap-1 flex-1 ${c.height}`}>
      {c.icon}
      <div className={`${avatarSize} rounded-full ${c.avatarBg} ${c.avatarRing} flex items-center justify-center font-bold`}>
        {entry.avatar}
      </div>
      <p className="text-[10px] font-semibold text-center leading-tight w-full px-1 truncate">{entry.name}</p>
      <Badge className={`text-[9px] px-1.5 py-0 h-4 ${c.badgeClass} hover:opacity-100`}>{entry.testsTaken}t</Badge>
      <p className="text-[9px] text-muted-foreground">{entry.score}% avg</p>
    </div>
  );
};

// ── Rank row (4th and below) ──────────────────────────────────────────────────
const RankRow: React.FC<{ entry: LeaderEntry }> = ({ entry }) => (
  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${
    entry.isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/40'
  }`}>
    <span className="w-5 text-center text-[11px] font-bold text-muted-foreground shrink-0">{entry.rank}</span>
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
      entry.isCurrentUser ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
    }`}>
      {entry.avatar}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`font-medium truncate text-[11px] ${entry.isCurrentUser ? 'text-primary' : ''}`}>{entry.name}</p>
      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-0.5"><Flame className="h-2.5 w-2.5 text-orange-400" />{entry.streak}d</span>
        <span>·</span>
        <span>{entry.testsTaken} tests</span>
      </div>
    </div>
    <span className={`font-bold text-[11px] shrink-0 ${entry.isCurrentUser ? 'text-primary' : ''}`}>{entry.score}%</span>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const QuizLeaderboardSection: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const typeLeaders = useMemo(() =>
    QUIZ_TYPES.map((cfg, idx) => ({ cfg, top: mockBoard(idx * 7, 3)[0] })),
    []
  );

  const overallData = useMemo(() => {
    const seeds = { daily: 3, weekly: 17, monthly: 31 };
    return mockBoard(seeds[period], 12)
      .sort((a, b) => b.testsTaken - a.testsTaken)
      .map((e, i) => ({ ...e, rank: i + 1 }));
  }, [period]);

  const [p1, p2, p3] = [overallData[0], overallData[1], overallData[2]];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <Trophy className="h-4 w-4 text-yellow-500" />
        <h2 className="text-sm font-bold">Leaderboards</h2>
      </div>

      {/* ── Quiz Type Toppers ───────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quiz Type Toppers</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-1.5">
          {typeLeaders.map(({ cfg, top }) => (
            <div key={cfg.type} className="flex items-center gap-2.5 py-1 border-b last:border-0">
              {/* Type icon + label */}
              <div className="flex items-center gap-1.5 w-24 shrink-0">
                {cfg.icon}
                <span className={`text-[10px] font-semibold truncate ${cfg.textColor}`}>{cfg.label}</span>
              </div>
              {/* Crown */}
              <Crown className="h-3 w-3 text-yellow-500 shrink-0" />
              {/* Avatar */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${cfg.dotColor} text-white`}>
                {top.avatar}
              </div>
              {/* Name + stats */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium truncate">{top.name}</p>
                <p className="text-[9px] text-muted-foreground">{top.testsTaken} tests · {top.score}%</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Overall Leaderboard ─────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              <CardTitle className="text-xs font-bold leading-tight">Most Tests Taken</CardTitle>
            </div>
            <Tabs value={period} onValueChange={v => setPeriod(v as typeof period)}>
              <TabsList className="h-6 p-0.5">
                <TabsTrigger value="daily"   className="text-[10px] px-1.5 h-5">Today</TabsTrigger>
                <TabsTrigger value="weekly"  className="text-[10px] px-1.5 h-5">Week</TabsTrigger>
                <TabsTrigger value="monthly" className="text-[10px] px-1.5 h-5">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="px-3 pb-3">
          {/* Podium — order: 2nd | 1st | 3rd */}
          <div className="flex items-end justify-center gap-2 mb-3 bg-gradient-to-b from-muted/40 to-transparent rounded-xl py-3 px-2">
            {p2 && <PodiumSlot entry={p2} position={2} />}
            {p1 && <PodiumSlot entry={p1} position={1} />}
            {p3 && <PodiumSlot entry={p3} position={3} />}
          </div>

          {/* Podium base bar */}
          <div className="flex gap-1 mb-3 h-1.5 rounded-full overflow-hidden">
            <div className="flex-1 bg-slate-300 rounded-full" />
            <div className="flex-[1.4] bg-yellow-400 rounded-full" />
            <div className="flex-1 bg-amber-400 rounded-full" />
          </div>

          {/* Rank list 4th onwards */}
          <ScrollArea className="h-48">
            <div className="space-y-0.5">
              {overallData.slice(3).map(entry => (
                <RankRow key={entry.rank} entry={entry} />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizLeaderboardSection;
