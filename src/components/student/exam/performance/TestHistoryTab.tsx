import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Clock, Trophy, Target, Search, Filter,
    CheckCircle2, PlayCircle, Circle, TrendingUp, Calendar,
    ChevronUp, ChevronDown, History
} from 'lucide-react';
import { TestProgress, ExamProgressData } from '@/hooks/useExamProgress';

interface TestHistoryTabProps {
    examId: string;
    examName: string;
    testTypes: ExamProgressData['testTypes'];
}

type SortKey = 'name' | 'score' | 'date' | 'rank' | 'attempts';
type SortDir = 'asc' | 'desc';

// Type display config
const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    prelims: { label: 'Prelims', color: 'text-blue-700', bg: 'bg-blue-100' },
    mains: { label: 'Mains', color: 'text-red-700', bg: 'bg-red-100' },
    sectional: { label: 'Sectional', color: 'text-pink-700', bg: 'bg-pink-100' },
    speed: { label: 'Speed', color: 'text-purple-700', bg: 'bg-purple-100' },
    pyq: { label: 'PYQ', color: 'text-amber-700', bg: 'bg-amber-100' },
    live: { label: 'Live', color: 'text-green-700', bg: 'bg-green-100' },
};

const DIFFICULTY_CONFIG = {
    easy: { label: 'Easy', cls: 'bg-green-100 text-green-700' },
    medium: { label: 'Medium', cls: 'bg-yellow-100 text-yellow-700' },
    hard: { label: 'Hard', cls: 'bg-red-100 text-red-700' },
};

const STATUS_ICON = {
    'completed': <CheckCircle2 className="h-4 w-4 text-green-500" />,
    'in-progress': <PlayCircle className="h-4 w-4 text-blue-400" />,
    'not-attempted': <Circle className="h-4 w-4 text-gray-300" />,
};

interface FlatTest extends TestProgress {
    testType: string;
    scorePercent: number | null;
}

export const TestHistoryTab: React.FC<TestHistoryTabProps> = ({ examId, examName, testTypes }) => {
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    // Flatten all test types into one list
    const allTests: FlatTest[] = useMemo(() => {
        return (Object.entries(testTypes) as [string, TestProgress[]][]).flatMap(([type, tests]) =>
            tests.map(t => ({
                ...t,
                testType: type,
                scorePercent: t.score != null && t.maxScore > 0
                    ? Math.round((t.score / t.maxScore) * 100)
                    : null,
            }))
        );
    }, [testTypes]);

    // Stats
    const stats = useMemo(() => {
        const completed = allTests.filter(t => t.status === 'completed');
        const scores = completed.map(t => t.scorePercent ?? 0);
        return {
            total: allTests.length,
            completed: completed.length,
            avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
            bestScore: scores.length ? Math.max(...scores) : 0,
            totalAttempts: allTests.reduce((a, t) => a + t.attempts, 0),
        };
    }, [allTests]);

    // Filter + search + sort
    const filtered = useMemo(() => {
        let list = allTests;

        if (filterType !== 'all') list = list.filter(t => t.testType === filterType);
        if (filterStatus !== 'all') list = list.filter(t => t.status === filterStatus);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(t =>
                t.testName.toLowerCase().includes(q) ||
                t.testType.toLowerCase().includes(q)
            );
        }

        list = [...list].sort((a, b) => {
            let va: number | string = 0;
            let vb: number | string = 0;
            if (sortKey === 'name') { va = a.testName; vb = b.testName; }
            if (sortKey === 'score') { va = a.scorePercent ?? -1; vb = b.scorePercent ?? -1; }
            if (sortKey === 'date') { va = a.lastAttempted ?? ''; vb = b.lastAttempted ?? ''; }
            if (sortKey === 'rank') { va = a.rank ?? 99999; vb = b.rank ?? 99999; }
            if (sortKey === 'attempts') { va = a.attempts; vb = b.attempts; }

            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return list;
    }, [allTests, filterType, filterStatus, search, sortKey, sortDir]);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const SortIcon = ({ k }: { k: SortKey }) =>
        sortKey === k
            ? (sortDir === 'asc' ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />)
            : null;

    const formatTime = (secs?: number) => {
        if (!secs) return '—';
        const m = Math.floor(secs / 60);
        return `${m} min`;
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">{examName} — Test History</h3>
                    <p className="text-sm text-muted-foreground">All tests taken across every exam type</p>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                    { label: 'Total Tests', value: stats.total, icon: <Target className="h-4 w-4 text-blue-500" />, color: 'bg-blue-50 border-blue-100' },
                    { label: 'Completed', value: stats.completed, icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, color: 'bg-green-50 border-green-100' },
                    { label: 'Avg Score', value: `${stats.avgScore}%`, icon: <TrendingUp className="h-4 w-4 text-purple-500" />, color: 'bg-purple-50 border-purple-100' },
                    { label: 'Best Score', value: `${stats.bestScore}%`, icon: <Trophy className="h-4 w-4 text-amber-500" />, color: 'bg-amber-50 border-amber-100' },
                    { label: 'Total Attempts', value: stats.totalAttempts, icon: <PlayCircle className="h-4 w-4 text-pink-500" />, color: 'bg-pink-50 border-pink-100' },
                ].map(s => (
                    <Card key={s.label} className={`border ${s.color}`}>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-1">{s.icon}<span className="text-xs text-muted-foreground">{s.label}</span></div>
                            <div className="text-xl font-bold">{s.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search tests…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-8 h-8 text-sm"
                    />
                </div>

                {/* Type filter */}
                <div className="flex gap-1 flex-wrap">
                    {['all', 'prelims', 'mains', 'sectional', 'speed', 'pyq', 'live'].map(type => {
                        const cfg = type === 'all' ? null : TYPE_CONFIG[type];
                        const isActive = filterType === type;
                        return (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${isActive
                                        ? `${cfg ? cfg.bg : 'bg-gray-900'} ${cfg ? cfg.color : 'text-white'} border-transparent`
                                        : 'bg-white text-muted-foreground border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {type === 'all' ? 'All Types' : TYPE_CONFIG[type].label}
                            </button>
                        );
                    })}
                </div>

                {/* Status filter */}
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="h-8 text-xs border rounded-lg px-2 bg-white dark:bg-gray-900"
                >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="not-attempted">Not Attempted</option>
                </select>
            </div>

            {/* Results count */}
            <p className="text-xs text-muted-foreground">
                Showing {filtered.length} of {allTests.length} tests
            </p>

            {/* Table */}
            {filtered.length > 0 ? (
                <div className="rounded-xl border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-muted-foreground">
                                    <th className="text-left px-4 py-3 font-medium">Status</th>
                                    <th
                                        className="text-left px-4 py-3 font-medium cursor-pointer hover:text-foreground"
                                        onClick={() => toggleSort('name')}
                                    >
                                        Test Name<SortIcon k="name" />
                                    </th>
                                    <th className="text-left px-4 py-3 font-medium">Type</th>
                                    <th className="text-left px-4 py-3 font-medium">Difficulty</th>
                                    <th
                                        className="text-left px-4 py-3 font-medium cursor-pointer hover:text-foreground"
                                        onClick={() => toggleSort('score')}
                                    >
                                        Score<SortIcon k="score" />
                                    </th>
                                    <th
                                        className="text-left px-4 py-3 font-medium cursor-pointer hover:text-foreground"
                                        onClick={() => toggleSort('rank')}
                                    >
                                        Rank<SortIcon k="rank" />
                                    </th>
                                    <th className="text-left px-4 py-3 font-medium">Time Spent</th>
                                    <th
                                        className="text-left px-4 py-3 font-medium cursor-pointer hover:text-foreground"
                                        onClick={() => toggleSort('attempts')}
                                    >
                                        Attempts<SortIcon k="attempts" />
                                    </th>
                                    <th
                                        className="text-left px-4 py-3 font-medium cursor-pointer hover:text-foreground"
                                        onClick={() => toggleSort('date')}
                                    >
                                        Last Attempted<SortIcon k="date" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filtered.map((test) => {
                                    const tc = TYPE_CONFIG[test.testType] || { label: test.testType, color: 'text-gray-600', bg: 'bg-gray-100' };
                                    const dc = DIFFICULTY_CONFIG[test.difficulty];
                                    const scoreColor =
                                        test.scorePercent == null ? '' :
                                            test.scorePercent >= 70 ? 'text-green-600 font-bold' :
                                                test.scorePercent >= 40 ? 'text-amber-600 font-semibold' :
                                                    'text-red-600 font-semibold';

                                    return (
                                        <tr
                                            key={`${test.testType}-${test.testId}`}
                                            className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                {STATUS_ICON[test.status]}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{test.testName}</p>
                                                <p className="text-xs text-muted-foreground">Max: {test.maxScore} marks</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>
                                                    {tc.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dc.cls}`}>
                                                    {dc.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {test.scorePercent != null ? (
                                                    <div>
                                                        <span className={scoreColor}>{test.scorePercent}%</span>
                                                        <span className="text-xs text-muted-foreground ml-1">({test.score}/{test.maxScore})</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {test.rank ? (
                                                    <span className="flex items-center gap-1 text-amber-600 font-medium">
                                                        <Trophy className="h-3 w-3" />#{test.rank}
                                                    </span>
                                                ) : <span className="text-muted-foreground text-xs">—</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-1 text-muted-foreground text-xs">
                                                    <Clock className="h-3 w-3" />{formatTime(test.timeSpent)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-sm font-medium ${test.attempts > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {test.attempts}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {test.lastAttempted ? (
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(test.lastAttempted).toLocaleDateString('en-IN', {
                                                            day: '2-digit', month: 'short', year: 'numeric'
                                                        })}
                                                    </span>
                                                ) : <span className="text-muted-foreground text-xs">Not taken</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16">
                    <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-medium mb-1">No tests found</p>
                    <p className="text-sm text-muted-foreground">
                        {search || filterType !== 'all' || filterStatus !== 'all'
                            ? 'Try changing the filters.'
                            : 'You haven\'t taken any tests for this exam yet.'}
                    </p>
                    {(search || filterType !== 'all' || filterStatus !== 'all') && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => { setSearch(''); setFilterType('all'); setFilterStatus('all'); }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};
