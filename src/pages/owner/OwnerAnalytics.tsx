import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Users, Globe, Eye, Clock, MousePointer, TrendingUp, TrendingDown,
    BookOpen, FileText, CheckSquare, Layers, Trophy, Target, BarChart3,
    Newspaper, Star, ArrowUpRight, ArrowDownRight, Download, Filter,
    GraduationCap, AlertTriangle, Lightbulb, Zap, ChevronRight, Activity,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────────
const ProgressBar: React.FC<{ pct: number; color?: string }> = ({ pct, color = 'bg-primary' }) => (
    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
);

const StatCard: React.FC<{ label: string; value: string | number; sub?: string; up?: boolean | null; icon?: React.ReactNode; color?: string }> =
    ({ label, value, sub, up, icon, color = 'text-primary' }) => (
        <Card className="p-4">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    {sub && (
                        <p className={`text-xs mt-1 flex items-center gap-0.5 ${up === true ? 'text-green-600' : up === false ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {up === true && <ArrowUpRight className="h-3 w-3" />}
                            {up === false && <ArrowDownRight className="h-3 w-3" />}
                            {sub}
                        </p>
                    )}
                </div>
                {icon && <div className={`${color} opacity-80`}>{icon}</div>}
            </div>
        </Card>
    );

// ─── MOCK DATA ────────────────────────────────────────────────────────────────────

// Traffic
const trafficData = {
    totalVisitors: 124600,
    registered: 31200,
    notRegistered: 93400,
    avgViewTimeMin: 4.7,
    avgStayTimeMin: 12.3,
    bounceRate: 38,
    mostVisitedPages: [
        { page: 'Home / Landing', visits: 124600, avgTime: '1m 20s', returning: 42 },
        { page: 'Tests & Exams', visits: 48200, avgTime: '18m 40s', returning: 78 },
        { page: 'Current Affairs', visits: 29400, avgTime: '9m 12s', returning: 65 },
        { page: 'Student Dashboard', visits: 27800, avgTime: '14m 33s', returning: 91 },
        { page: 'Daily Free Quiz', visits: 22100, avgTime: '7m 55s', returning: 58 },
        { page: 'Syllabus', visits: 18900, avgTime: '6m 20s', returning: 47 },
        { page: 'PDF Courses', visits: 15400, avgTime: '5m 10s', returning: 39 },
        { page: 'Mentorship', visits: 11200, avgTime: '8m 45s', returning: 62 },
        { page: 'Blog', visits: 9800, avgTime: '4m 30s', returning: 28 },
        { page: 'Exam Tracker', visits: 7600, avgTime: '11m 20s', returning: 82 },
    ],
};

// Exam Analytics
const examCategories = ['All Categories', 'Banking', 'SSC', 'Railway', 'UPSC', 'State PSC', 'Defence'];
const examsByCategory: Record<string, string[]> = {
    'Banking': ['SBI PO', 'IBPS PO', 'IBPS Clerk', 'RBI Grade B', 'SBI Clerk'],
    'SSC': ['SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC GD'],
    'Railway': ['RRB NTPC', 'RRB Group D', 'RRB JE'],
    'UPSC': ['UPSC CSE', 'UPSC CDS'],
    'State PSC': ['TNPSC Group 1', 'MPSC', 'KPSC'],
    'Defence': ['NDA', 'CDS', 'AFCAT'],
};

const examSubscriptionData = [
    { category: 'Banking', exams: 5, students: 18400, subscribed: 9200, tests: 240, growth: +14, color: 'bg-blue-500' },
    { category: 'SSC', exams: 4, students: 12800, subscribed: 6100, tests: 180, growth: +9, color: 'bg-green-500' },
    { category: 'Railway', exams: 3, students: 8200, subscribed: 4300, tests: 120, growth: +18, color: 'bg-orange-500' },
    { category: 'UPSC', exams: 2, students: 5600, subscribed: 2800, tests: 80, growth: +6, color: 'bg-purple-500' },
    { category: 'State PSC', exams: 3, students: 4100, subscribed: 1900, tests: 60, growth: +11, color: 'bg-teal-500' },
    { category: 'Defence', exams: 3, students: 2300, subscribed: 980, tests: 45, growth: +4, color: 'bg-red-400' },
];

const examDetailData = [
    { exam: 'IBPS PO', category: 'Banking', students: 6800, subscribed: 3400, tests: 48, passRate: 72 },
    { exam: 'SBI PO', category: 'Banking', students: 5200, subscribed: 2600, tests: 42, passRate: 68 },
    { exam: 'SSC CGL', category: 'SSC', students: 4900, subscribed: 2200, tests: 36, passRate: 65 },
    { exam: 'RRB NTPC', category: 'Railway', students: 4100, subscribed: 2100, tests: 30, passRate: 78 },
    { exam: 'IBPS Clerk', category: 'Banking', students: 3800, subscribed: 1800, tests: 38, passRate: 80 },
    { exam: 'UPSC CSE', category: 'UPSC', students: 3600, subscribed: 1900, tests: 52, passRate: 45 },
    { exam: 'SSC CHSL', category: 'SSC', students: 3200, subscribed: 1500, tests: 28, passRate: 70 },
    { exam: 'RRB Group D', category: 'Railway', students: 2800, subscribed: 1400, tests: 24, passRate: 82 },
];

// Content Inventory
const contentData = {
    totalCourses: 148,
    totalTests: 1240,
    totalQuestions: 82400,
    totalCurrentAffairs: 3600,
    totalBlogs: 420,
    totalPDFs: 310,
    totalVideos: 890,
    byCategory: [
        { category: 'Banking', courses: 42, tests: 340, questions: 24000 },
        { category: 'SSC', courses: 31, tests: 260, questions: 18200 },
        { category: 'Railway', courses: 24, tests: 200, questions: 14800 },
        { category: 'UPSC', courses: 28, tests: 240, questions: 16400 },
        { category: 'State PSC', courses: 14, tests: 120, questions: 8200 },
        { category: 'Defence', courses: 9, tests: 80, questions: 1800 },
    ],
};

// Exam Tracker Cohort (SelfCare stage progression)
const examTrackerData = {
    totalUsed: 8420,
    totalExamsRegistered: 12800,
    stage1PrelimsCleared: 4200,
    stage2MainsCleared: 1840,
    stage3InterviewCleared: 620,
    byCategory: [
        { category: 'Banking', registered: 4800, prelims: 1920, mains: 840, interview: 280 },
        { category: 'UPSC', registered: 3200, prelims: 960, mains: 480, interview: 180 },
        { category: 'SSC', registered: 2400, prelims: 960, mains: 360, interview: 100 },
        { category: 'State PSC', registered: 1600, prelims: 560, mains: 200, interview: 60 },
        { category: 'Defence', registered: 800, prelims: 280, mains: 0, interview: 0 },
    ],
};

// Page Usage health scores
const pageUsageData = [
    { page: 'Student Tests', dau: 8200, wau: 22000, mau: 38000, health: 96, trend: +12, status: '🔥 Excellent' },
    { page: 'Current Affairs', dau: 5100, wau: 14800, mau: 28000, health: 88, trend: +22, status: '✅ Growing' },
    { page: 'Daily Quiz', dau: 4200, wau: 12200, mau: 21000, health: 84, trend: +8, status: '✅ Growing' },
    { page: 'Student Dashboard', dau: 9800, wau: 24000, mau: 42000, health: 92, trend: +5, status: '✅ Good' },
    { page: 'Syllabus Tracker', dau: 3100, wau: 9200, mau: 18000, health: 76, trend: +4, status: '⚠️ Moderate' },
    { page: 'Mentorship', dau: 1800, wau: 5400, mau: 11200, health: 71, trend: +14, status: '⚠️ Moderate' },
    { page: 'PDF Courses', dau: 2400, wau: 7100, mau: 14000, health: 69, trend: +1, status: '⚠️ Moderate' },
    { page: 'Exam Tracker', dau: 1200, wau: 3800, mau: 8400, health: 82, trend: +31, status: '✅ Growing' },
    { page: 'Teams Study', dau: 900, wau: 2800, mau: 6200, health: 60, trend: -3, status: '❌ Needs Work' },
    { page: 'Doubt Forum', dau: 600, wau: 2100, mau: 4800, health: 55, trend: -8, status: '❌ Struggling' },
    { page: 'Speed Drills', dau: 1100, wau: 3400, mau: 7200, health: 72, trend: +6, status: '⚠️ Moderate' },
    { page: 'Blog', dau: 400, wau: 1800, mau: 4200, health: 42, trend: -5, status: '❌ Low usage' },
];

// Strategy Insights
const strategyInsights = [
    {
        type: 'opportunity',
        icon: '🚀',
        title: 'Railway Category Growth +18% — Fastest Rising',
        detail: 'Railway has the highest growth rate but lowest content depth (least tests per exam). Invest in content here to capture this surge before competitors.',
        action: 'Assign 2 employees to Railway content creation immediately.',
        impact: 'High',
    },
    {
        type: 'warning',
        icon: '⚠️',
        title: '83% of visitors leave without registering',
        detail: 'Only 25% of visitors sign up. Your landing page or demo experience is not compelling enough. The book you referenced (Lean Analytics) shows that "Registered → Active" is the critical cohort to watch.',
        action: 'A/B test a new landing CTA — specifically offer one free full-length test with no signup friction.',
        impact: 'Very High',
    },
    {
        type: 'opportunity',
        icon: '📈',
        title: 'Exam Tracker converts casual users to power users',
        detail: '82% of Exam Tracker users return regularly (vs 42% for homepage). This is your highest-retention feature. Promote it harder on the dashboard.',
        action: 'Add "Set Your Exam Goal" prompt on every first login. Make Exam Tracker the default first action.',
        impact: 'High',
    },
    {
        type: 'warning',
        icon: '🔴',
        title: 'Doubt Forum & Blog are underperforming',
        detail: 'Forum DAU is 600 (vs 9,800 for Dashboard). The content-to-engagement ratio is poor. Community features need critical mass to succeed.',
        action: 'Either invest in seeding the forum with expert answers, or merge it into Mentorship. Consider making Blog SEO-optimised for cold traffic.',
        impact: 'Medium',
    },
    {
        type: 'opportunity',
        icon: '💰',
        title: 'Mains + Interview stage drastically drops off',
        detail: 'Of 12,800 exam registrations, only 14% reach mains and 5% interview. This means most students need prelims coaching — double down on Stage 1 test series.',
        action: 'Create a "Prelims Mastery" premium pack. Price at ₹799 targeting Banking + SSC.',
        impact: 'High',
    },
    {
        type: 'opportunity',
        icon: '🎯',
        title: 'Average session time 12.3 min — room to grow',
        detail: 'EdTech leaders see 25-35 min average sessions. Your 12.3 min indicates users do quick tasks and leave. Streak + daily quiz are good drivers but must create habit loops.',
        action: 'Introduce a "Daily Study Target" timer that shows students how much they studied today. Gamify it.',
        impact: 'High',
    },
];

// ─── SUB-PANELS ──────────────────────────────────────────────────────────────────

const TrafficPanel: React.FC = () => {
    const regPct = Math.round((trafficData.registered / trafficData.totalVisitors) * 100);
    return (
        <div className="space-y-6">
            {/* Top stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard label="Total Visitors" value={trafficData.totalVisitors.toLocaleString('en-IN')} sub="+18% MoM" up icon={<Globe className="h-5 w-5" />} />
                <StatCard label="Registered" value={trafficData.registered.toLocaleString('en-IN')} sub={`${regPct}% of visitors`} up icon={<Users className="h-5 w-5" />} color="text-blue-600" />
                <StatCard label="Not Registered" value={trafficData.notRegistered.toLocaleString('en-IN')} sub="Lost audience" up={false} icon={<Users className="h-5 w-5" />} color="text-red-500" />
                <StatCard label="Avg. Page Views" value="4.7 min" sub="Per session" icon={<Eye className="h-5 w-5" />} color="text-purple-600" />
                <StatCard label="Avg. Stay Time" value="12.3 min" sub="Per session" up icon={<Clock className="h-5 w-5" />} color="text-green-600" />
                <StatCard label="Bounce Rate" value={`${trafficData.bounceRate}%`} sub="↓ improving" up icon={<MousePointer className="h-5 w-5" />} color="text-amber-600" />
            </div>

            {/* Visitor funnel visual */}
            <Card className="p-5">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Visitor Conversion Funnel</h3>
                <div className="space-y-3">
                    {[
                        { label: 'Total Website Visitors', value: trafficData.totalVisitors, pct: 100, color: 'bg-slate-400' },
                        { label: `Registered Users (${regPct}%)`, value: trafficData.registered, pct: regPct, color: 'bg-blue-500' },
                        { label: 'Not Registered — lost leads', value: trafficData.notRegistered, pct: 100 - regPct, color: 'bg-red-400' },
                        { label: 'Paid/Subscribed (20.6% of reg)', value: Math.round(trafficData.registered * 0.206), pct: 20.6, color: 'bg-green-500' },
                    ].map(row => (
                        <div key={row.label} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{row.label}</span>
                                <span className="font-semibold">{row.value.toLocaleString('en-IN')}</span>
                            </div>
                            <ProgressBar pct={row.pct} color={row.color} />
                        </div>
                    ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    💡 <strong>Key Insight:</strong> {100 - regPct}% of visitors ({trafficData.notRegistered.toLocaleString('en-IN')}) leave without registering.
                    This is your biggest growth lever — improving this by just 5% adds ~6,230 new users.
                </div>
            </Card>

            {/* Most visited pages */}
            <Card className="p-5">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Most Visited Pages</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 text-muted-foreground font-medium">#</th>
                                <th className="text-left py-2 text-muted-foreground font-medium">Page</th>
                                <th className="text-right py-2 text-muted-foreground font-medium">Visits</th>
                                <th className="text-right py-2 text-muted-foreground font-medium">Avg. Time</th>
                                <th className="text-right py-2 text-muted-foreground font-medium">Returning %</th>
                                <th className="text-left py-2 pl-4 text-muted-foreground font-medium">Engagement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trafficData.mostVisitedPages.map((p, i) => (
                                <tr key={p.page} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="py-2.5 text-muted-foreground">{i + 1}</td>
                                    <td className="py-2.5 font-medium">{p.page}</td>
                                    <td className="py-2.5 text-right">{p.visits.toLocaleString('en-IN')}</td>
                                    <td className="py-2.5 text-right text-muted-foreground">{p.avgTime}</td>
                                    <td className="py-2.5 text-right">
                                        <span className={`font-semibold ${p.returning > 70 ? 'text-green-600' : p.returning > 45 ? 'text-amber-600' : 'text-red-500'}`}>
                                            {p.returning}%
                                        </span>
                                    </td>
                                    <td className="py-2.5 pl-4 w-32">
                                        <ProgressBar pct={p.returning} color={p.returning > 70 ? 'bg-green-500' : p.returning > 45 ? 'bg-amber-500' : 'bg-red-400'} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const ExamAnalyticsPanel: React.FC = () => {
    const [filterCategory, setFilterCategory] = useState('All Categories');
    const [filterView, setFilterView] = useState<'category' | 'exam'>('category');

    const filteredExams = useMemo(() =>
        filterCategory === 'All Categories'
            ? examDetailData
            : examDetailData.filter(e => e.category === filterCategory),
        [filterCategory]
    );

    const sortedCategories = [...examSubscriptionData].sort((a, b) => b.students - a.students);
    const topCategory = sortedCategories[0];
    const leastCategory = sortedCategories[sortedCategories.length - 1];

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Total Students" value={examSubscriptionData.reduce((a, b) => a + b.students, 0).toLocaleString('en-IN')} sub="+11% MoM" up icon={<Users className="h-5 w-5" />} />
                <StatCard label="Total Subscribed" value={examSubscriptionData.reduce((a, b) => a + b.subscribed, 0).toLocaleString('en-IN')} sub="Paid subscribers" up icon={<Star className="h-5 w-5" />} color="text-green-600" />
                <StatCard label="Most Popular" value={topCategory.category} sub={`${topCategory.students.toLocaleString('en-IN')} students`} up icon={<Trophy className="h-5 w-5" />} color="text-amber-600" />
                <StatCard label="Least Popular" value={leastCategory.category} sub={`${leastCategory.students.toLocaleString('en-IN')} students`} up={false} icon={<AlertTriangle className="h-5 w-5" />} color="text-red-500" />
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-1.5">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">Filter by:</span>
                </div>
                <div className="flex gap-2">
                    {['category', 'exam'].map(v => (
                        <Button key={v} size="sm" variant={filterView === v ? 'default' : 'outline'} className="text-xs h-7 capitalize"
                            onClick={() => setFilterView(v as 'category' | 'exam')}>
                            {v === 'category' ? 'By Category' : 'By Exam'}
                        </Button>
                    ))}
                </div>
                {filterView === 'exam' && (
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="h-7 text-xs w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {examCategories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {filterView === 'category' ? (
                /* Category view */
                <Card className="p-5">
                    <h3 className="font-semibold text-sm mb-4">Exam Category — Subscription & Student Count</h3>
                    <div className="space-y-4">
                        {sortedCategories.map((cat) => {
                            const subPct = Math.round((cat.subscribed / cat.students) * 100);
                            return (
                                <div key={cat.category} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                                            <span className="font-semibold">{cat.category}</span>
                                            <Badge variant="outline" className="text-[10px]">{cat.exams} exams</Badge>
                                            <Badge variant="outline" className="text-[10px]">{cat.tests} tests</Badge>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-muted-foreground">{cat.students.toLocaleString('en-IN')} students</span>
                                            <span className="font-semibold text-green-700">{cat.subscribed.toLocaleString('en-IN')} subscribed ({subPct}%)</span>
                                            <Badge className={`text-[10px] ${cat.growth > 12 ? 'bg-green-100 text-green-700' : cat.growth > 7 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'} border-0`}>
                                                +{cat.growth}%
                                            </Badge>
                                        </div>
                                    </div>
                                    <ProgressBar pct={subPct} color={cat.color} />
                                </div>
                            );
                        })}
                    </div>
                </Card>
            ) : (
                /* Exam view */
                <Card className="p-5">
                    <h3 className="font-semibold text-sm mb-4">Exam-wise Subscription Detail</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 text-muted-foreground font-medium">Exam</th>
                                    <th className="text-left py-2 text-muted-foreground font-medium">Category</th>
                                    <th className="text-right py-2 text-muted-foreground font-medium">Students</th>
                                    <th className="text-right py-2 text-muted-foreground font-medium">Subscribed</th>
                                    <th className="text-right py-2 text-muted-foreground font-medium">Tests</th>
                                    <th className="text-right py-2 text-muted-foreground font-medium">Pass Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExams.map(exam => (
                                    <tr key={exam.exam} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="py-2.5 font-semibold">{exam.exam}</td>
                                        <td className="py-2.5 text-muted-foreground">{exam.category}</td>
                                        <td className="py-2.5 text-right">{exam.students.toLocaleString('en-IN')}</td>
                                        <td className="py-2.5 text-right text-green-700 font-medium">{exam.subscribed.toLocaleString('en-IN')}</td>
                                        <td className="py-2.5 text-right">{exam.tests}</td>
                                        <td className="py-2.5 text-right">
                                            <span className={`font-bold ${exam.passRate > 70 ? 'text-green-600' : exam.passRate > 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                                {exam.passRate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

const ContentPanel: React.FC = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Courses Uploaded" value={contentData.totalCourses} sub="+8 this month" up icon={<BookOpen className="h-5 w-5" />} />
            <StatCard label="Tests Uploaded" value={contentData.totalTests.toLocaleString()} sub="+124 this month" up icon={<CheckSquare className="h-5 w-5" />} color="text-green-600" />
            <StatCard label="Total Questions" value={`${(contentData.totalQuestions / 1000).toFixed(1)}K`} sub="in question bank" icon={<FileText className="h-5 w-5" />} color="text-purple-600" />
            <StatCard label="Current Affairs" value={contentData.totalCurrentAffairs.toLocaleString()} sub="Total articles" icon={<Newspaper className="h-5 w-5" />} color="text-blue-600" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard label="Blog Articles" value={contentData.totalBlogs} icon={<FileText className="h-5 w-5" />} color="text-orange-500" />
            <StatCard label="PDF Courses" value={contentData.totalPDFs} icon={<Layers className="h-5 w-5" />} color="text-teal-600" />
            <StatCard label="Video Lessons" value={contentData.totalVideos} icon={<GraduationCap className="h-5 w-5" />} color="text-red-500" />
        </div>

        <Card className="p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Content by Exam Category</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2 text-muted-foreground">Category</th>
                            <th className="text-right py-2 text-muted-foreground">Courses</th>
                            <th className="text-right py-2 text-muted-foreground">Tests</th>
                            <th className="text-right py-2 text-muted-foreground">Questions</th>
                            <th className="text-left py-2 pl-4 text-muted-foreground">Coverage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contentData.byCategory.map(cat => {
                            const maxQ = Math.max(...contentData.byCategory.map(c => c.questions));
                            return (
                                <tr key={cat.category} className="border-b last:border-0 hover:bg-muted/30">
                                    <td className="py-2.5 font-medium">{cat.category}</td>
                                    <td className="py-2.5 text-right">{cat.courses}</td>
                                    <td className="py-2.5 text-right">{cat.tests}</td>
                                    <td className="py-2.5 text-right">{cat.questions.toLocaleString('en-IN')}</td>
                                    <td className="py-2.5 pl-4 w-28">
                                        <ProgressBar pct={Math.round((cat.questions / maxQ) * 100)} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
);

const ExamTrackerPanel: React.FC = () => {
    const overallPrelimsRate = Math.round((examTrackerData.stage1PrelimsCleared / examTrackerData.totalExamsRegistered) * 100);
    const overallMainsRate = Math.round((examTrackerData.stage2MainsCleared / examTrackerData.totalExamsRegistered) * 100);
    const overallInterviewRate = Math.round((examTrackerData.stage3InterviewCleared / examTrackerData.totalExamsRegistered) * 100);

    return (
        <div className="space-y-6">
            {/* Overall cohort */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard label="Total Users (Exam Tracker)" value={examTrackerData.totalUsed.toLocaleString('en-IN')} sub="+31% MoM" up icon={<Activity className="h-5 w-5" />} />
                <StatCard label="Exams Registered" value={examTrackerData.totalExamsRegistered.toLocaleString('en-IN')} icon={<Target className="h-5 w-5" />} color="text-blue-600" />
                <StatCard label="Stage 1: Prelims ✅" value={`${examTrackerData.stage1PrelimsCleared.toLocaleString('en-IN')} (${overallPrelimsRate}%)`} icon={<CheckSquare className="h-5 w-5" />} color="text-green-600" />
                <StatCard label="Stage 2: Mains ✅" value={`${examTrackerData.stage2MainsCleared.toLocaleString('en-IN')} (${overallMainsRate}%)`} icon={<Trophy className="h-5 w-5" />} color="text-amber-600" />
                <StatCard label="Stage 3: Interview ✅" value={`${examTrackerData.stage3InterviewCleared.toLocaleString('en-IN')} (${overallInterviewRate}%)`} icon={<Star className="h-5 w-5" />} color="text-purple-600" />
            </div>

            {/* Stage funnel visualization */}
            <Card className="p-5">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> Stage Progression Funnel</h3>
                <div className="space-y-3">
                    {[
                        { label: 'Registered for Exam', value: examTrackerData.totalExamsRegistered, pct: 100, color: 'bg-slate-500' },
                        { label: 'Stage 1 — Prelims Cleared', value: examTrackerData.stage1PrelimsCleared, pct: overallPrelimsRate, color: 'bg-blue-500' },
                        { label: 'Stage 2 — Mains Cleared', value: examTrackerData.stage2MainsCleared, pct: overallMainsRate, color: 'bg-amber-500' },
                        { label: 'Stage 3 — Interview Cleared 🎉', value: examTrackerData.stage3InterviewCleared, pct: overallInterviewRate, color: 'bg-green-500' },
                    ].map(row => (
                        <div key={row.label} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span>{row.label}</span>
                                <span className="font-semibold">{row.value.toLocaleString('en-IN')} <span className="text-muted-foreground">({row.pct}%)</span></span>
                            </div>
                            <ProgressBar pct={row.pct} color={row.color} />
                        </div>
                    ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                    📊 <strong>Cohort Insight:</strong> The significant drop from Prelims to Mains ({overallPrelimsRate}% → {overallMainsRate}%)
                    indicates students need more intensive mains preparation content. This is a premium upsell opportunity.
                </div>
            </Card>

            {/* Category breakdown */}
            <Card className="p-5">
                <h3 className="font-semibold text-sm mb-4">Category-wise Stage Breakdown</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 text-muted-foreground">Category</th>
                                <th className="text-right py-2 text-muted-foreground">Registered</th>
                                <th className="text-right py-2 text-muted-foreground">Prelims ✅</th>
                                <th className="text-right py-2 text-muted-foreground">Mains ✅</th>
                                <th className="text-right py-2 text-muted-foreground">Interview ✅</th>
                                <th className="text-right py-2 text-muted-foreground">Final Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {examTrackerData.byCategory.map(cat => {
                                const finalRate = cat.interview > 0 ? Math.round((cat.interview / cat.registered) * 100) : 0;
                                return (
                                    <tr key={cat.category} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="py-2.5 font-medium">{cat.category}</td>
                                        <td className="py-2.5 text-right">{cat.registered.toLocaleString('en-IN')}</td>
                                        <td className="py-2.5 text-right text-blue-700">{cat.prelims.toLocaleString('en-IN')} ({Math.round((cat.prelims / cat.registered) * 100)}%)</td>
                                        <td className="py-2.5 text-right text-amber-700">{cat.mains > 0 ? `${cat.mains.toLocaleString('en-IN')} (${Math.round((cat.mains / cat.registered) * 100)}%)` : '—'}</td>
                                        <td className="py-2.5 text-right text-green-700">{cat.interview > 0 ? `${cat.interview.toLocaleString('en-IN')} (${Math.round((cat.interview / cat.registered) * 100)}%)` : '—'}</td>
                                        <td className="py-2.5 text-right font-bold">{finalRate > 0 ? `${finalRate}%` : '—'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const PageUsagePanel: React.FC = () => {
    const [sortKey, setSortKey] = useState<'dau' | 'mau' | 'health' | 'trend'>('health');
    const sorted = useMemo(() => [...pageUsageData].sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number)), [sortKey]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-3 items-center">
                <span className="text-xs text-muted-foreground font-medium">Sort by:</span>
                {(['health', 'dau', 'mau', 'trend'] as const).map(k => (
                    <Button key={k} size="sm" variant={sortKey === k ? 'default' : 'outline'} className="text-xs h-7 uppercase" onClick={() => setSortKey(k)}>
                        {k === 'dau' ? 'Daily Users' : k === 'mau' ? 'Monthly Users' : k === 'trend' ? 'Growth' : 'Health Score'}
                    </Button>
                ))}
            </div>

            <Card className="p-5">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Page-wise Usage Report</h3>
                <div className="space-y-3">
                    {sorted.map(p => (
                        <div key={p.page} className="p-3 rounded-lg border hover:border-primary/30 hover:bg-muted/20 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">{p.page}</span>
                                    <span className="text-xs">{p.status}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="text-muted-foreground">DAU: <strong>{p.dau.toLocaleString('en-IN')}</strong></span>
                                    <span className="text-muted-foreground">MAU: <strong>{p.mau.toLocaleString('en-IN')}</strong></span>
                                    <span className={`font-bold ${p.trend > 0 ? 'text-green-600' : 'text-red-500'}`}>{p.trend > 0 ? '+' : ''}{p.trend}%</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <ProgressBar pct={p.health} color={p.health >= 80 ? 'bg-green-500' : p.health >= 65 ? 'bg-amber-500' : 'bg-red-400'} />
                                <span className="text-xs font-semibold text-muted-foreground w-10">{p.health}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

const StrategyPanel: React.FC = () => (
    <div className="space-y-4">
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <h3 className="font-bold text-sm mb-1 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /> Strategic Analysis — Owner's Business Intelligence</h3>
            <p className="text-xs text-muted-foreground">
                Based on the Lean Analytics "Cumulative Metrics" framework you referenced, here is the critical analysis of what's working, what's not, and exactly how to improve.
            </p>
        </div>

        {strategyInsights.map((insight, i) => (
            <Card key={i} className={`p-5 border-l-4 ${insight.type === 'opportunity' ? 'border-l-green-500' : 'border-l-amber-500'}`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{insight.icon}</span>
                            <h4 className="font-semibold text-sm">{insight.title}</h4>
                            <Badge className={`text-[10px] ${insight.impact === 'Very High' ? 'bg-red-100 text-red-700' : insight.impact === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'} border-0`}>
                                {insight.impact} Impact
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{insight.detail}</p>
                        <div className="flex items-start gap-2 bg-muted/40 rounded-lg p-2.5">
                            <Zap className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                            <p className="text-xs font-medium"><strong>Action:</strong> {insight.action}</p>
                        </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
            </Card>
        ))}

        <Card className="p-5 bg-gradient-to-br from-primary/5 to-blue-50 border-primary/20">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Your Lean Analytics Cohort (Based on the book)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Registered', value: '31,200', color: 'text-blue-700', bar: 100, bg: 'bg-blue-500' },
                    { label: 'Logged in Once', value: '26,800', color: 'text-teal-700', bar: 86, bg: 'bg-teal-500' },
                    { label: 'Activated (≥3 sessions)', value: '18,400', color: 'text-green-700', bar: 59, bg: 'bg-green-500' },
                    { label: 'Active (weekly)', value: '9,200', color: 'text-amber-700', bar: 30, bg: 'bg-amber-500' },
                ].map(c => (
                    <div key={c.label} className="text-center space-y-1">
                        <div className={`text-xl font-black ${c.color}`}>{c.value}</div>
                        <div className="text-[10px] text-muted-foreground">{c.label}</div>
                        <ProgressBar pct={c.bar} color={c.bg} />
                    </div>
                ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
                Your <strong>Activation rate is 59%</strong> — good. But only <strong>30% are truly weekly-active</strong>.
                The gap between "logged in once" and "activated" is your core product problem to solve.
            </p>
        </Card>
    </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────────
const OwnerAnalytics: React.FC = () => {
    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-primary" /> Platform Analytics
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Deep-dive analytics across traffic, exams, content, and user progression
                    </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" /> Export Report
                </Button>
            </div>

            <Tabs defaultValue="traffic">
                <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
                    <TabsTrigger value="traffic" className="text-xs gap-1"><Globe className="h-3 w-3" /> Traffic</TabsTrigger>
                    <TabsTrigger value="exams" className="text-xs gap-1"><GraduationCap className="h-3 w-3" /> Exam Analytics</TabsTrigger>
                    <TabsTrigger value="content" className="text-xs gap-1"><Layers className="h-3 w-3" /> Content</TabsTrigger>
                    <TabsTrigger value="tracker" className="text-xs gap-1"><Trophy className="h-3 w-3" /> Exam Tracker</TabsTrigger>
                    <TabsTrigger value="pages" className="text-xs gap-1"><Activity className="h-3 w-3" /> Page Usage</TabsTrigger>
                    <TabsTrigger value="strategy" className="text-xs gap-1"><Lightbulb className="h-3 w-3" /> Strategy</TabsTrigger>
                </TabsList>
                <div className="mt-4">
                    <TabsContent value="traffic"><TrafficPanel /></TabsContent>
                    <TabsContent value="exams"><ExamAnalyticsPanel /></TabsContent>
                    <TabsContent value="content"><ContentPanel /></TabsContent>
                    <TabsContent value="tracker"><ExamTrackerPanel /></TabsContent>
                    <TabsContent value="pages"><PageUsagePanel /></TabsContent>
                    <TabsContent value="strategy"><StrategyPanel /></TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default OwnerAnalytics;
