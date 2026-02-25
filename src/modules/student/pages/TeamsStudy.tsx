
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Users,
    Trophy,
    Calendar,
    Clock,
    Target,
    MessageSquare,
    Plus,
    Search,
    BookOpen,
    Filter,
    MoreVertical,
    X,
    Send,
    Zap,
    TrendingUp,
    Award,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    Timer,
    Lock,
    Globe,
    Settings,
    Eye,
    LogOut,
    ShieldCheck,
    Flame,
    Star,
    Sparkles,
    ArrowRight,
    Key
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './TeamsStudy.css';

// Import Data Sources
import { dailyQuizzes } from '@/data/dailyQuizzesData';
import { categoryCurrentAffairs } from '@/data/categoryCurrentAffairsData';
import { prelimsTests, mainsTests, sectionalTests } from '@/data/testData';
import { toast } from 'sonner';

// --- Types ---
interface Team {
    id: string;
    name: string;
    code: string;
    role: 'admin' | 'member';
    members: number;
    maxMembers: number | null;
    privacy: 'public' | 'private';
    rank: number;
    streak: number;
    avgScore: number;
    testsTaken: number;
    nextTest?: string;
    nextTestDate?: string;
    description: string;
    badges: string[];
    gradient: string; // New: distinctive gradient for each team
}

interface ScheduledTest {
    id: string;
    title: string;
    teamId: string;
    teamName: string;
    mode: 'anytime' | 'limited' | 'immediate';
    status: 'live' | 'upcoming' | 'expired';
    scheduledDate: string;
    questions: number;
    duration: number;
    completedCount: number;
    totalMembers: number;
    sourceType: 'quiz' | 'test' | 'current-affairs';
    sourceId: string;
    category?: string;
}

interface ChatMessage {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: string;
    avatarColor: string;
}

interface LeaderboardTeam {
    id: string;
    name: string;
    members: number;
    score: number;
    trend: number;
    rank: number;
}

// --- Mock Data (Teams & Leaderboard) ---
const myTeams: Team[] = [
    {
        id: 't1',
        name: 'Success Squad',
        code: 'SS2026',
        role: 'admin',
        members: 5,
        maxMembers: 10,
        privacy: 'private',
        rank: 12,
        streak: 15,
        avgScore: 76.5,
        testsTaken: 28,
        nextTest: 'General Studies Mock 5',
        nextTestDate: '2026-02-15T18:00:00',
        description: 'Dedicated group for UPSC 2026 attempt. Serious aspirants only.',
        badges: ['Top 20', '15 Day Streak'],
        gradient: 'from-violet-500 to-fuchsia-600'
    },
    {
        id: 't2',
        name: 'Banking Warriors',
        code: 'BW9988',
        role: 'member',
        members: 8,
        maxMembers: null, // Unlimited
        privacy: 'public',
        rank: 45,
        streak: 3,
        avgScore: 68.2,
        testsTaken: 12,
        nextTest: 'Reasoning Speed Test',
        nextTestDate: '2026-02-16T10:00:00',
        description: 'Focusing on IBPS PO and SBI Clerk exams.',
        badges: ['Rising Star'],
        gradient: 'from-cyan-400 to-blue-600'
    }
];

const publicTeams: Team[] = [
    {
        id: 'pt1',
        name: 'UPSC Aspirants 2026',
        code: 'UPSC26',
        role: 'member', // Not actually a member, just for type compatibility if needed, or handle in UI
        members: 145,
        maxMembers: 200,
        privacy: 'public',
        rank: 3,
        streak: 45,
        avgScore: 82.5,
        testsTaken: 120,
        description: 'Open group for serious UPSC aspirants. Daily styling and answer writing.',
        badges: ['Top 3', 'Active'],
        gradient: 'from-orange-400 to-red-500'
    },
    {
        id: 'pt2',
        name: 'SSC CGL Crackers',
        code: 'SSCGL1',
        role: 'member',
        members: 89,
        maxMembers: 100,
        privacy: 'public',
        rank: 8,
        streak: 12,
        avgScore: 71.0,
        testsTaken: 45,
        description: 'Targeting SSC CGL top ranks. Weekly full mocks.',
        badges: ['Fast Growing'],
        gradient: 'from-blue-400 to-indigo-500'
    },
    {
        id: 'pt3',
        name: 'Banking Elites',
        code: 'BANK24',
        role: 'member',
        members: 42,
        maxMembers: 50,
        privacy: 'private', // Can be found but needs request
        rank: 15,
        streak: 8,
        avgScore: 78.4,
        testsTaken: 60,
        description: 'Exclusive group for banking exam toppers.',
        badges: ['Elite'],
        gradient: 'from-emerald-400 to-teal-500'
    },
    {
        id: 'pt4',
        name: 'Railway Express',
        code: 'RRBEXP',
        role: 'member',
        members: 210,
        maxMembers: null,
        privacy: 'public',
        rank: 22,
        streak: 5,
        avgScore: 65.5,
        testsTaken: 30,
        description: 'Large community for Railway exams preparation.',
        badges: ['Popular'],
        gradient: 'from-violet-400 to-purple-500'
    }
];

const leaderboardData: LeaderboardTeam[] = [
    { id: 'l1', name: 'Elite Force', members: 6, score: 9945, trend: 2, rank: 1 },
    { id: 'l2', name: 'UPSC Achievers', members: 4, score: 9280, trend: -1, rank: 2 },
    { id: 'l3', name: 'Target 2026', members: 5, score: 9120, trend: 4, rank: 3 },
    { id: 'l4', name: 'Knowledge Hub', members: 12, score: 8950, trend: 0, rank: 4 },
    { id: 'l5', name: 'The Toppers', members: 3, score: 8890, trend: 1, rank: 5 },
    { id: 'l6', name: 'Study Circle', members: 8, score: 8750, trend: 3, rank: 6 },
    { id: 'l7', name: 'Rapid Readers', members: 15, score: 8600, trend: -2, rank: 7 },
    { id: 'l8', name: 'Focus Group A', members: 4, score: 8450, trend: 0, rank: 8 },
    { id: 'l9', name: 'Winners Club', members: 7, score: 8300, trend: 5, rank: 9 },
    { id: 'l10', name: 'Last Benchers', members: 10, score: 8150, trend: -1, rank: 10 },
    { id: 'l11', name: 'Early Risers', members: 5, score: 8000, trend: 2, rank: 11 },
];

const initialChatMessages: ChatMessage[] = [
    { id: 'm1', userId: 'u2', userName: 'Sarah', text: 'Has anyone attempted the mock yet?', timestamp: '10:30 AM', avatarColor: 'bg-emerald-500' },
    { id: 'm2', userId: 'u3', userName: 'Mike', text: 'Yes, the history section was tough!', timestamp: '10:32 AM', avatarColor: 'bg-blue-500' },
    { id: 'm3', userId: 'u1', userName: 'You', text: 'I am taking it tonight at 8 PM.', timestamp: '10:33 AM', avatarColor: 'bg-primary' },
];

const TeamsStudy = () => {
    const navigate = useNavigate();

    // --- State ---
    const [viewMode, setViewMode] = useState<'dashboard' | 'find-teams' | 'leaderboard'>('dashboard');
    const [activeTab, setActiveTab] = useState('my-teams');
    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    // Modals
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
    const [isTeamResultModalOpen, setIsTeamResultModalOpen] = useState(false);

    // Create Team State
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDesc, setNewTeamDesc] = useState('');
    const [newTeamPrivacy, setNewTeamPrivacy] = useState<'public' | 'private'>('public');
    const [newTeamLimit, setNewTeamLimit] = useState<string>('');

    // Scheduling State
    const [scheduleStep, setScheduleStep] = useState(1);
    const [scheduleSource, setScheduleSource] = useState<'quiz' | 'test' | 'current-affairs'>('test');
    const [selectedSourceItem, setSelectedSourceItem] = useState<any>(null);
    const [scheduleMode, setScheduleMode] = useState<'anytime' | 'limited' | 'immediate'>('anytime');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [schedulingTeamId, setSchedulingTeamId] = useState<string>('');

    // Data State
    const [scheduledTests, setScheduledTests] = useState<ScheduledTest[]>([
        {
            id: 'st1',
            title: 'Current Affairs Daily Quiz',
            teamId: 't1',
            teamName: 'Success Squad',
            mode: 'anytime',
            status: 'live',
            scheduledDate: new Date().toISOString(),
            questions: 10,
            duration: 15,
            completedCount: 3,
            totalMembers: 5,
            sourceType: 'quiz',
            sourceId: 'quiz-1'
        },
        {
            id: 'st2',
            title: 'IBPS PO Prelims Mock',
            teamId: 't2',
            teamName: 'Banking Warriors',
            mode: 'limited',
            status: 'upcoming',
            scheduledDate: new Date(Date.now() + 86400000).toISOString(),
            questions: 100,
            duration: 60,
            completedCount: 0,
            totalMembers: 8,
            sourceType: 'test',
            sourceId: 'test-1',
            category: 'banking'
        }
    ]);

    // --- Memoized Data Sources ---
    const availableTests = useMemo(() => {
        return [
            ...prelimsTests.map(t => ({ ...t, type: 'Prelims', categoryId: 'banking' })),
            ...mainsTests.map(t => ({ ...t, type: 'Mains', categoryId: 'banking' })),
            ...sectionalTests.map(t => ({ ...t, type: 'Sectional', categoryId: 'banking' }))
        ];
    }, []);

    const availableQuizzes = useMemo(() => dailyQuizzes.slice(0, 50), []);
    const availableCurrentAffairs = useMemo(() => categoryCurrentAffairs, []);

    // --- Helpers ---
    const getNextTestCountdown = () => {
        return { hours: 4, minutes: 25, seconds: 12 };
    };

    const timer = getNextTestCountdown();

    const handleCreateTeam = () => {
        if (!newTeamName) {
            toast.error("Please enter a team name");
            return;
        }

        const newTeam: Team = {
            id: `t-${Date.now()}`,
            name: newTeamName,
            code: (newTeamName.substring(0, 3) + Math.floor(Math.random() * 1000)).toUpperCase().replace(/\s/g, ''),
            role: 'admin',
            members: 1,
            maxMembers: newTeamLimit ? parseInt(newTeamLimit) : null,
            privacy: newTeamPrivacy,
            rank: 0,
            streak: 0,
            avgScore: 0,
            testsTaken: 0,
            description: newTeamDesc,
            badges: [],
            gradient: 'from-orange-400 to-pink-500' // Default random gradient
        };

        myTeams.push(newTeam);
        toast.success("Team created successfully!");
        setIsCreateTeamModalOpen(false);
    };

    const handleOpenSchedule = (teamId: string) => {
        setSchedulingTeamId(teamId);
        setScheduleStep(1);
        setSelectedSourceItem(null);
        setIsScheduleModalOpen(true);
    };

    const handleCompleteSchedule = () => {
        if (!selectedSourceItem) return;

        const newTest: ScheduledTest = {
            id: `st-${Date.now()}`,
            title: selectedSourceItem.title || selectedSourceItem.name,
            teamId: schedulingTeamId,
            teamName: myTeams.find(t => t.id === schedulingTeamId)?.name || 'Team',
            mode: scheduleMode,
            status: 'upcoming',
            scheduledDate: `${scheduleDate}T${scheduleTime}`,
            questions: selectedSourceItem.questions || 20,
            duration: parseInt(selectedSourceItem.duration) || 15,
            completedCount: 0,
            totalMembers: myTeams.find(t => t.id === schedulingTeamId)?.members || 1,
            sourceType: scheduleSource,
            sourceId: selectedSourceItem.id,
            category: selectedSourceItem.categoryId || 'general'
        };

        setScheduledTests(prev => [newTest, ...prev]);
        setIsScheduleModalOpen(false);
        toast.success("Test scheduled successfully!");
    };

    const handleTakeTest = (test: ScheduledTest) => {
        if (test.sourceType === 'test') {
            const category = test.category || 'general';
            navigate(`/student/exam/${category}/${test.sourceId}`);
        } else if (test.sourceType === 'quiz') {
            navigate(`/student/daily-quiz/${test.sourceId}`);
        } else {
            navigate(`/student/current-affairs/${test.sourceId}`);
        }
    };

    return (
        <div className="teams-study-page min-h-screen bg-background text-foreground pb-20 font-sans">

            {/* --- Page Header --- */}
            <div className="sticky top-0 z-40 px-6 py-3 flex justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="header-left">
                    <h1 className="text-xl font-bold tracking-tight">
                        Ultimate Teams
                    </h1>
                </div>
                <div className="header-actions flex gap-2">
                    <Button
                        variant={viewMode === 'dashboard' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('dashboard')}
                    >
                        My Dashboard
                    </Button>
                    <Button
                        variant={viewMode === 'find-teams' ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                        onClick={() => setViewMode('find-teams')}
                    >
                        <Search className="h-4 w-4" /> Find Squads
                    </Button>
                    <Button
                        variant={viewMode === 'leaderboard' ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                        onClick={() => setViewMode('leaderboard')}
                    >
                        <Trophy className="h-4 w-4" /> Leaderboard
                    </Button>
                    <Button onClick={() => setIsCreateTeamModalOpen(true)} size="sm" className="gap-2 ml-2">
                        <Plus className="h-4 w-4" /> Create Squad
                    </Button>
                </div>
            </div>

            {/* --- Main Content Area --- */}
            {viewMode === 'dashboard' && (
                <div className="max-w-[1400px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

                    {/* --- Left Content (Main) --- */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Welcome & Stats */}
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Your Dashboard
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: 'Active Squads', value: myTeams.length, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                    { label: 'Global Rank', value: `#${myTeams[0]?.rank || '-'}`, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                    { label: 'Day Streak', value: myTeams[0]?.streak || 0, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                    { label: 'Tests Aced', value: myTeams.reduce((acc, t) => acc + t.testsTaken, 0), icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                ].map((stat, i) => (
                                    <Card key={i} className="p-4 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                                        <div className={`w-10 h-10 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        <div className="text-2xl font-bold mb-1">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* Upcoming Tests */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    Upcoming Tests
                                </h2>
                                <div className="flex bg-muted rounded-lg p-1">
                                    <button className="px-3 py-1 text-xs font-medium bg-background text-foreground rounded shadow-sm">All</button>
                                    <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Live</button>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {scheduledTests.length === 0 ? (
                                    <Card className="p-8 text-center border-dashed">
                                        <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                        <h3 className="font-semibold text-lg">No Tests Active</h3>
                                        <p className="text-muted-foreground text-sm mt-1">Schedule a test to ignite your squad's competitive spirit.</p>
                                    </Card>
                                ) : (
                                    scheduledTests.map(test => (
                                        <Card key={test.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                                            <div className="flex flex-col md:flex-row items-center p-4 gap-4">
                                                <div className={`w-1 self-stretch rounded-full 
                                                ${test.status === 'live' ? 'bg-emerald-500' : test.status === 'upcoming' ? 'bg-amber-500' : 'bg-slate-300'}
                                            `}></div>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border
                                                        ${test.status === 'live' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' :
                                                                'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'}
                                                    `}>
                                                            {test.status === 'live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>}
                                                            {test.status}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border">
                                                            {test.mode}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-base font-bold mb-1">{test.title}</h3>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {test.teamName}</div>
                                                        <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {test.duration} mins</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {test.status === 'live' ? (
                                                        <Button onClick={() => handleTakeTest(test)} size="sm">
                                                            Take Test
                                                        </Button>
                                                    ) : (
                                                        <Button disabled size="sm" variant="secondary">
                                                            Soon
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* My Squads */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    My Squads
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myTeams.map(team => (
                                    <Card key={team.id} className="overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group">
                                        <div className={`h-24 bg-gradient-to-r ${team.gradient} relative`}>
                                            <div className="absolute inset-0 bg-black/10 dark:bg-black/40"></div>
                                            <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                                {team.privacy === 'private' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                                {team.privacy === 'private' ? 'Private' : 'Public'}
                                            </div>

                                            <div className="absolute -bottom-6 left-4">
                                                <div className="w-16 h-16 rounded-xl bg-card p-1 shadow-md">
                                                    <div className={`w-full h-full rounded-lg bg-gradient-to-br ${team.gradient} flex items-center justify-center text-xl font-black text-white`}>
                                                        {team.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-4 pb-4 pt-8 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold leading-tight">{team.name}</h3>
                                                    <div className="flex items-center text-xs text-muted-foreground font-medium mt-1">
                                                        <span className="bg-muted px-1.5 py-0.5 rounded">{team.code}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{team.members} / {team.maxMembers || '∞'} members</span>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border
                                                ${team.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800' :
                                                        'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-800'}`}>
                                                    {team.role}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-4 mt-2">
                                                <div className="bg-muted/50 p-2 rounded-lg text-center">
                                                    <div className="text-[10px] uppercase text-muted-foreground font-bold mb-0.5">Rank</div>
                                                    <div className="font-bold text-lg">#{team.rank}</div>
                                                </div>
                                                <div className="bg-muted/50 p-2 rounded-lg text-center">
                                                    <div className="text-[10px] uppercase text-muted-foreground font-bold mb-0.5">Streak</div>
                                                    <div className="font-bold text-lg flex items-center justify-center gap-1">
                                                        <Zap className="h-4 w-4 text-orange-500 fill-orange-500" /> {team.streak}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-3 border-t flex items-center justify-between gap-3">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowChat(!showChat)}>
                                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                </Button>

                                                <Button size="sm" className="h-8 flex-1 text-xs font-bold" onClick={() => handleOpenSchedule(team.id)}>
                                                    Schedule Test
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* --- Right Sidebar --- */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Live Timer Widget */}
                        <Card className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-5 -mb-5 pointer-events-none"></div>

                            <div className="flex justify-between items-center mb-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <Timer className="w-4 h-4 text-white/80" />
                                    <span className="text-xs font-bold uppercase tracking-wide text-white/90">Next Battle</span>
                                </div>
                                <span className="text-[10px] text-white/70 font-mono">Starts in</span>
                            </div>

                            <div className="flex items-end justify-between gap-2 relative z-10">
                                {['Hours', 'Mins', 'Secs'].map((label, i) => {
                                    const val = i === 0 ? timer.hours : i === 1 ? timer.minutes : timer.seconds;
                                    return (
                                        <div key={label} className="text-center bg-white/10 rounded-lg p-2 flex-1 backdrop-blur-sm border border-white/10">
                                            <div className="text-2xl font-black font-mono">
                                                {val.toString().padStart(2, '0')}
                                            </div>
                                            <div className="text-[10px] font-bold text-white/70 uppercase mt-1">{label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Global Leaderboard */}
                        <Card className="overflow-hidden">
                            <div className="p-4 border-b flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <Award className="h-5 w-5 text-amber-500" /> Rankings
                                    </h3>
                                </div>
                                {/* Filters */}
                                <div className="flex bg-muted rounded-lg p-1">
                                    {['Daily', 'Weekly', 'Monthly', 'All-Time'].map(f => (
                                        <button key={f} className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${f === 'Monthly' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-muted/30">
                                {/* Podium (Top 3) */}
                                <div className="flex justify-center items-end gap-2 mb-6 h-32">
                                    {/* 2nd Place */}
                                    <div className="flex flex-col items-center w-1/3 animate-float" style={{ animationDelay: '1s' }}>
                                        <div className="w-10 h-10 rounded-full border-2 border-slate-300 mb-2 overflow-hidden bg-background shadow-sm">
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">AC</div>
                                        </div>
                                        <div className="text-[10px] font-bold text-center leading-tight mb-1 truncate w-full">{leaderboardData[1].name}</div>
                                        <div className="text-[9px] text-muted-foreground mb-1">{leaderboardData[1].score}</div>
                                        <div className="w-full h-16 bg-slate-300 dark:bg-slate-700/50 rounded-t-lg flex items-start justify-center pt-2 relative">
                                            <span className="text-lg font-black text-slate-500 dark:text-slate-400">2</span>
                                        </div>
                                    </div>

                                    {/* 1st Place */}
                                    <div className="flex flex-col items-center w-1/3 animate-float" style={{ animationDelay: '0s' }}>
                                        <div className="w-14 h-14 rounded-full border-2 border-yellow-400 mb-2 overflow-hidden bg-background shadow-lg shadow-yellow-500/20 relative z-10 animate-pulse-glow">
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">👑</div>
                                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-yellow-600 dark:text-yellow-400">EF</div>
                                        </div>
                                        <div className="text-[11px] font-bold text-center leading-tight mb-1 truncate w-full">{leaderboardData[0].name}</div>
                                        <div className="text-[10px] text-muted-foreground mb-1 font-bold">{leaderboardData[0].score}</div>
                                        <div className="w-full h-24 bg-yellow-400 dark:bg-yellow-500/20 rounded-t-lg flex items-start justify-center pt-2 border-t border-yellow-200">
                                            <span className="text-2xl font-black text-yellow-700 dark:text-yellow-500">1</span>
                                        </div>
                                    </div>

                                    {/* 3rd Place */}
                                    <div className="flex flex-col items-center w-1/3 animate-float" style={{ animationDelay: '2s' }}>
                                        <div className="w-10 h-10 rounded-full border-2 border-orange-300 mb-2 overflow-hidden bg-background shadow-sm">
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">T26</div>
                                        </div>
                                        <div className="text-[10px] font-bold text-center leading-tight mb-1 truncate w-full">{leaderboardData[2].name}</div>
                                        <div className="text-[9px] text-muted-foreground mb-1">{leaderboardData[2].score}</div>
                                        <div className="w-full h-12 bg-orange-300 dark:bg-orange-800/20 rounded-t-lg flex items-start justify-center pt-2">
                                            <span className="text-lg font-black text-orange-600 dark:text-orange-500">3</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="divide-y">
                                    {leaderboardData.slice(3).map((team, idx) => (
                                        <div key={team.id} className="py-3 hover:bg-muted/50 transition-colors flex items-center gap-3">
                                            <div className="w-6 text-center text-xs font-bold text-muted-foreground">
                                                {team.rank}
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-background border flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                {team.name.substring(0, 2)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm truncate">{team.name}</div>
                                                <div className="text-[10px] text-muted-foreground">{team.members} members</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold font-mono text-xs">{team.score.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 border-t text-center">
                                <Button variant="link" size="sm" className="text-xs" onClick={() => setViewMode('leaderboard')}>View Full Leaderboard →</Button>
                            </div>
                        </Card>

                        {/* Team Chat Preview */}
                        {showChat && (
                            <div className="fixed bottom-6 right-6 w-[360px] z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                                <Card className="rounded-2xl shadow-xl overflow-hidden flex flex-col h-[450px] border">

                                    {/* Header */}
                                    <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur text-sm font-bold flex items-center justify-center border border-white/10">SS</div>
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-primary"></div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm leading-none">Success Squad</h4>
                                                <span className="text-[10px] opacity-80">5 members online</span>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowChat(false)} className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20 scrollbar-thin">
                                        {initialChatMessages.map(msg => (
                                            <div key={msg.id} className={`flex gap-3 ${msg.userId === 'u1' ? 'flex-row-reverse' : ''}`}>
                                                {msg.userId !== 'u1' && (
                                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] text-primary-foreground font-bold ${msg.avatarColor} shadow-md`}>
                                                        {msg.userName[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className={`max-w-[240px] rounded-2xl px-4 py-2.5 text-xs font-medium shadow-sm leading-relaxed
                                            ${msg.userId === 'u1'
                                                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                                            : 'bg-muted text-foreground rounded-tl-sm border'}
                                        `}>
                                                        <p>{msg.text}</p>
                                                    </div>
                                                    <span className={`text-[9px] text-muted-foreground font-medium block mt-1.5 ${msg.userId === 'u1' ? 'text-right' : 'text-left'}`}>{msg.timestamp}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Input */}
                                    <div className="p-4 bg-card border-t">
                                        <form className="flex gap-2 items-center" onSubmit={(e) => e.preventDefault()}>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            <Input placeholder="Type message..." className="h-10 text-xs bg-muted border-transparent focus:border-primary text-foreground rounded-full px-4" />
                                            <Button size="icon" className="h-10 w-10 shrink-0 rounded-full shadow-lg">
                                                <Send className="h-4 w-4 ml-0.5" />
                                            </Button>
                                        </form>
                                    </div>
                                </Card>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* --- Find Teams View --- */}
            {viewMode === 'find-teams' && (
                <div className="max-w-[1400px] mx-auto px-4 py-8 animate-in fade-in duration-300">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold mb-2">Discover Your Squad</h2>
                        <p className="text-muted-foreground">Join a community of like-minded aspirants and accelerate your growth.</p>

                        <div className="mt-6 max-w-md mx-auto relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search teams by name, exam, or code..." className="pl-10 h-11 bg-muted/50 rounded-full" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {publicTeams.map(team => (
                            <Card key={team.id} className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group border-primary/10 hover:border-primary/30">
                                <div className={`h-24 bg-gradient-to-r ${team.gradient} relative`}>
                                    <div className="absolute inset-0 bg-black/10 dark:bg-black/40"></div>
                                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                        {team.privacy === 'private' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                        {team.privacy === 'private' ? 'Private' : 'Public'}
                                    </div>

                                    <div className="absolute -bottom-6 left-6">
                                        <div className="w-16 h-16 rounded-xl bg-card p-1 shadow-md">
                                            <div className={`w-full h-full rounded-lg bg-gradient-to-br ${team.gradient} flex items-center justify-center text-xl font-black text-white`}>
                                                {team.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 pb-6 pt-8 flex-1 flex flex-col">
                                    <div className="mb-3 mt-1">
                                        <h3 className="text-lg font-bold leading-tight">{team.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{team.description}</p>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-4">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" />
                                            {team.members} Members
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                            #{team.rank} Rank
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Zap className="w-3.5 h-3.5 text-orange-500" />
                                            {team.streak} Days
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {team.badges.map((badge, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded uppercase tracking-wider border border-primary/10">
                                                {badge}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-auto flex gap-2">
                                        {team.privacy === 'public' ? (
                                            <Button className="flex-1 gap-2" onClick={() => toast.success(`Joined ${team.name} successfully!`)}>
                                                Join Now <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        ) : (
                                            <Button variant="secondary" className="flex-1 gap-2" onClick={() => toast.success(`Request sent to ${team.name}`)}>
                                                Request to Join
                                            </Button>
                                        )}
                                        <Button variant="outline" size="icon">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        {/* Join by Code Card */}
                        <Card className="flex flex-col items-center justify-center p-8 border-dashed border-2 bg-muted/10 hover:bg-muted/30 transition-colors text-center group cursor-pointer hover:border-primary/50">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-border">
                                <Lock className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">Have a Team Code?</h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-[200px]">Enter the unique code shared by your friend to unlock their private squad.</p>
                            <div className="flex gap-2 w-full max-w-xs relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="ENTER CODE"
                                    className="pl-9 h-11 text-center font-mono uppercase tracking-widest font-bold bg-background border-2 focus-visible:ring-0 focus-visible:border-primary transition-all"
                                    onChange={(e) => setJoinCodeInput(e.target.value)}
                                    value={joinCodeInput || ''}
                                />
                                <Button size="icon" className="h-11 w-11 shrink-0" onClick={() => {
                                    if (joinCodeInput) {
                                        toast.success(`Joined team with code: ${joinCodeInput}`);
                                        setJoinCodeInput('');
                                    } else {
                                        toast.error("Please enter a code");
                                    }
                                }}>
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* --- Leaderboard View --- */}
            {viewMode === 'leaderboard' && (
                <div className="max-w-[1200px] mx-auto px-4 py-8 animate-in fade-in duration-300">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold mb-2">Global Leaderboards</h2>
                        <p className="text-muted-foreground">See who's leading the pack in the pursuit of excellence.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Top 3 Podium Cards */}
                        {leaderboardData.slice(0, 3).map((team, idx) => (
                            <Card key={team.id} className={`p-6 flex flex-col items-center relative overflow-hidden border-2 ${idx === 0 ? 'border-yellow-400/50 bg-yellow-50/50 dark:bg-yellow-950/10' : ''}`}>
                                {idx === 0 && <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg">#1 CHAMPION</div>}

                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg
                                    ${idx === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900' :
                                        idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800' :
                                            'bg-gradient-to-br from-orange-300 to-orange-400 text-orange-900'}
                                `}>
                                    {team.name.substring(0, 2)}
                                </div>
                                <div className="text-2xl font-bold mb-1">{team.score}</div>
                                <div className="text-sm font-bold text-muted-foreground mb-4">{team.name}</div>
                                <div className="grid grid-cols-2 gap-4 w-full text-center">
                                    <div className="bg-background/80 p-2 rounded-lg">
                                        <div className="text-[10px] uppercase text-muted-foreground font-bold">Members</div>
                                        <div className="font-bold">{team.members}</div>
                                    </div>
                                    <div className="bg-background/80 p-2 rounded-lg">
                                        <div className="text-[10px] uppercase text-muted-foreground font-bold">Trend</div>
                                        <div className={`font-bold ${team.trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {team.trend > 0 ? '+' : ''}{team.trend}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Card className="overflow-hidden">
                        <div className="p-4 bg-muted/40 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">Full Rankings</h3>
                            <div className="flex bg-background rounded-lg p-1 border">
                                {['Daily', 'Weekly', 'Monthly'].map(period => (
                                    <button key={period} className="px-3 py-1 text-xs font-bold hover:bg-muted rounded transition-colors first:bg-muted first:text-foreground text-muted-foreground">
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="divide-y text-sm">
                            <div className="grid grid-cols-12 gap-4 p-3 bg-muted/20 font-bold text-xs text-muted-foreground uppercase tracking-wider">
                                <div className="col-span-1 text-center">Rank</div>
                                <div className="col-span-1"></div>
                                <div className="col-span-4">Team</div>
                                <div className="col-span-2 text-center">Members</div>
                                <div className="col-span-2 text-center">Trend</div>
                                <div className="col-span-2 text-right">Score</div>
                            </div>
                            {leaderboardData.map((team, idx) => (
                                <div key={team.id} className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-muted/30 transition-colors">
                                    <div className="col-span-1 text-center font-bold text-muted-foreground">#{team.rank}</div>
                                    <div className="col-span-1 flex justify-center">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                                            {team.name.substring(0, 2)}
                                        </div>
                                    </div>
                                    <div className="col-span-4 font-bold">{team.name}</div>
                                    <div className="col-span-2 text-center text-muted-foreground">{team.members}</div>
                                    <div className={`col-span-2 text-center font-bold ${team.trend > 0 ? 'text-emerald-500' : team.trend < 0 ? 'text-rose-500' : 'text-muted-foreground'}`}>
                                        {team.trend > 0 ? '↑' : team.trend < 0 ? '↓' : '-'}{Math.abs(team.trend)}
                                    </div>
                                    <div className="col-span-2 text-right font-mono font-bold">{team.score.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* --- Schedule Test Modal (Dark Themed) --- */}
            {
                isScheduleModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <Card className="border shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-300 relative">

                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b flex justify-between items-center bg-muted/10">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Target className="w-5 h-5 text-primary" />
                                        Schedule Challenge
                                    </h2>
                                    <p className="text-xs text-muted-foreground">Configure a competitive test for your team.</p>
                                </div>
                                <button onClick={() => setIsScheduleModalOpen(false)} className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6">

                                {scheduleStep === 1 ? (
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Source</label>
                                                <span className="text-xs text-primary font-mono">Step 1/2</span>
                                            </div>

                                            <Tabs defaultValue="test" value={scheduleSource} onValueChange={(v: any) => setScheduleSource(v)} className="w-full">
                                                <TabsList className="w-full grid grid-cols-3">
                                                    <TabsTrigger value="test">Most Tests</TabsTrigger>
                                                    <TabsTrigger value="quiz">Daily Quizzes</TabsTrigger>
                                                    <TabsTrigger value="current-affairs">Current Affairs</TabsTrigger>
                                                </TabsList>

                                                <div className="mt-4 rounded-xl h-[320px] overflow-y-auto border p-2 scrollbar-thin">
                                                    {scheduleSource === 'test' && availableTests.map((t, i) => (
                                                        <div
                                                            key={i}
                                                            className={`p-3.5 mb-2 rounded-lg cursor-pointer transition-all flex items-center justify-between group
                                            ${selectedSourceItem?.title === t.title ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted border border-transparent'}
                                        `}
                                                            onClick={() => setSelectedSourceItem(t)}
                                                        >
                                                            <div className="min-w-0 pr-4">
                                                                <div className={`font-bold text-sm mb-1 ${selectedSourceItem?.title === t.title ? 'text-primary' : ''} `}>{t.title}</div>
                                                                <div className="text-xs text-muted-foreground flex gap-2 font-mono">
                                                                    <span className="bg-muted px-1.5 py-0.5 rounded border">{t.questions} Qs</span>
                                                                    <span className="bg-muted px-1.5 py-0.5 rounded border">{t.duration}</span>
                                                                    <span className={`px-1.5 py-0.5 rounded ${t.difficulty === 'Hard' ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'}`}>{t.difficulty}</span>
                                                                </div>
                                                            </div>
                                                            {selectedSourceItem?.title === t.title && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                                                        </div>
                                                    ))}

                                                    {scheduleSource === 'quiz' && availableQuizzes.map((q, i) => (
                                                        <div
                                                            key={q.id}
                                                            className={`p-3.5 mb-2 rounded-lg cursor-pointer transition-all flex items-center justify-between
                                            ${selectedSourceItem?.id === q.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted border border-transparent'}
                                        `}
                                                            onClick={() => setSelectedSourceItem(q)}
                                                        >
                                                            <div className="min-w-0 pr-4">
                                                                <div className={`font-bold text-sm mb-1 ${selectedSourceItem?.id === q.id ? 'text-primary' : ''} `}>{q.topic}</div>
                                                                <div className="text-xs text-muted-foreground flex gap-2 font-mono">
                                                                    <span className="bg-muted px-1.5 py-0.5 rounded border">{q.scheduledDate}</span>
                                                                    <span className="bg-muted px-1.5 py-0.5 rounded border">{q.questions.length} Qs</span>
                                                                </div>
                                                            </div>
                                                            {selectedSourceItem?.id === q.id && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                                                        </div>
                                                    ))}

                                                    {scheduleSource === 'current-affairs' && availableCurrentAffairs.map((ca, i) => (
                                                        <div
                                                            key={ca.id}
                                                            className={`p-3.5 mb-2 rounded-lg cursor-pointer transition-all flex items-center justify-between
                                            ${selectedSourceItem?.id === ca.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted border border-transparent'}
                                        `}
                                                            onClick={() => setSelectedSourceItem(ca)}
                                                        >
                                                            <div className="min-w-0 pr-4">
                                                                <div className={`font-bold text-sm mb-1 ${selectedSourceItem?.id === ca.id ? 'text-primary' : ''} `}>{ca.title}</div>
                                                                <div className="text-xs text-muted-foreground flex gap-2 font-mono">
                                                                    <span className="bg-muted px-1.5 py-0.5 rounded border">{ca.questions} Qs</span>
                                                                    <span className="uppercase text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-1.5 py-0.5 rounded">{ca.type}</span>
                                                                </div>
                                                            </div>
                                                            {selectedSourceItem?.id === ca.id && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </Tabs>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <div className="bg-muted p-4 rounded-xl border mb-6 flex justify-between items-center relative overflow-hidden">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                                                <div>
                                                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Selected Content</div>
                                                    <div className="font-bold text-sm">{selectedSourceItem?.title || selectedSourceItem?.name || selectedSourceItem?.topic}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-mono text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 inline-block font-bold">
                                                        {selectedSourceItem?.questions || selectedSourceItem?.questions?.length}Qs • {parseInt(selectedSourceItem?.duration) || 15}m
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Access Mode</label>

                                                {/* Option 1: Anytime */}
                                                <div
                                                    onClick={() => setScheduleMode('anytime')}
                                                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all group
                                                    ${scheduleMode === 'anytime'
                                                            ? 'bg-primary/5 border-primary'
                                                            : 'hover:bg-muted'}
                                                `}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0
                                                    ${scheduleMode === 'anytime' ? 'border-primary' : 'border-muted-foreground'}
                                                `}>
                                                        {scheduleMode === 'anytime' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-bold text-sm mb-1 ${scheduleMode === 'anytime' ? 'text-primary' : ''}`}>Anytime Access</h4>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">Members can start the test individually at their convenience within a deadline.</p>
                                                    </div>
                                                </div>

                                                {/* Option 2: Time-Limited */}
                                                <div
                                                    onClick={() => setScheduleMode('limited')}
                                                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all group
                                                    ${scheduleMode === 'limited'
                                                            ? 'bg-primary/5 border-primary'
                                                            : 'hover:bg-muted'}
                                                `}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0
                                                    ${scheduleMode === 'limited' ? 'border-primary' : 'border-muted-foreground'}
                                                `}>
                                                        {scheduleMode === 'limited' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-bold text-sm mb-1 ${scheduleMode === 'limited' ? 'text-primary' : ''}`}>Time-Limited Window</h4>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">Test is only available during a specific 4-hour slot (e.g., Sunday 6PM-10PM).</p>
                                                    </div>
                                                </div>

                                                {/* Option 3: Immediate */}
                                                <div
                                                    onClick={() => setScheduleMode('immediate')}
                                                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all group
                                                    ${scheduleMode === 'immediate'
                                                            ? 'bg-primary/5 border-primary'
                                                            : 'hover:bg-muted'}
                                                `}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0
                                                    ${scheduleMode === 'immediate' ? 'border-primary' : 'border-muted-foreground'}
                                                `}>
                                                        {scheduleMode === 'immediate' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-bold text-sm mb-1 ${scheduleMode === 'immediate' ? 'text-primary' : ''}`}>Immediate Start (Live)</h4>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">Force all online members to start immediately. Synchronous mode.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-wider">Start Date</label>
                                                    <Input type="date" className="h-11" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-wider">Start Time</label>
                                                    <Input type="time" className="h-11" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                            <div className="px-6 py-4 border-t bg-muted/20 flex justify-end gap-3">
                                {scheduleStep === 1 ? (
                                    <Button disabled={!selectedSourceItem} onClick={() => setScheduleStep(2)} className="font-bold px-6">
                                        Procced
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="outline" onClick={() => setScheduleStep(1)} className="hover:bg-muted">
                                            Back
                                        </Button>
                                        <Button onClick={handleCompleteSchedule} className="font-bold px-6">
                                            Launch Challenge <Zap className="w-4 h-4 ml-2" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </Card>
                    </div>
                )
            }

            {/* --- Team Result Modal --- */}
            {
                isTeamResultModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <Card className="max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
                            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-6 border-b border-white/10 flex justify-between items-start relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                                <div className="relative z-10">
                                    <div className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider mb-2 bg-black/20 inline-block px-2 py-1 rounded backdrop-blur-sm">Leaderboard Results</div>
                                    <h3 className="font-bold text-xl text-white">IBPS PO Prelims Mock</h3>
                                </div>
                                <button onClick={() => setIsTeamResultModalOpen(false)} className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors relative z-10">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="p-0">
                                <div className="divide-y max-h-[350px] overflow-y-auto">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors group">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm
                                ${i === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-white border-yellow-400' :
                                                    i === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white border-slate-400' :
                                                        i === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-600 text-white border-orange-400' :
                                                            'bg-muted text-muted-foreground border'}
                           `}>
                                                {i}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-sm hover:text-primary transition-colors">Alex Thompson</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 45m 12s</span>
                                                    <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                                                    <span className="text-emerald-500">92% Accuracy</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-xl">{95 - (i * 4)}</div>
                                                <div className="text-[10px] text-muted-foreground font-bold tracking-wider">POINTS</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-5 border-t text-center">
                                <Button className="w-full py-6">Share Full Report</Button>
                            </div>
                        </Card>
                    </div>
                )
            }

            {/* --- Create Team Modal --- */}
            {
                isCreateTeamModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <Card className="max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
                            <div className="px-6 py-6 border-b bg-muted/10">
                                <h2 className="text-xl font-bold mb-1">Create New Squad</h2>
                                <p className="text-sm text-muted-foreground">Forge a new alliance for academic excellence.</p>
                            </div>

                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Squad Name</label>
                                    <Input
                                        placeholder="e.g. UPSC Warriors 2026"
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        className="h-11 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Description</label>
                                    <Input
                                        placeholder="What is this team's mission?"
                                        value={newTeamDesc}
                                        onChange={(e) => setNewTeamDesc(e.target.value)}
                                        className="h-11 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Privacy</label>
                                        <div className="flex bg-muted p-1 rounded-xl border">
                                            <button
                                                className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${newTeamPrivacy === 'public' ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'}`}
                                                onClick={() => setNewTeamPrivacy('public')}
                                            >Public</button>
                                            <button
                                                className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${newTeamPrivacy === 'private' ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'}`}
                                                onClick={() => setNewTeamPrivacy('private')}
                                            >Private</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Member Limit</label>
                                        <Input
                                            type="number"
                                            placeholder="∞"
                                            className="h-11"
                                            value={newTeamLimit}
                                            onChange={(e) => setNewTeamLimit(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-5 border-t bg-muted/10 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setIsCreateTeamModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateTeam} className="font-bold px-6">Create Squad</Button>
                            </div>
                        </Card>
                    </div>
                )
            }

        </div >
    );
};

export default TeamsStudy;
