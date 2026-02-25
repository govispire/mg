import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronRight, TrendingUp } from 'lucide-react';

interface UpcomingExam {
    id: string;
    examId: string;     // specific exam ID for deep link
    name: string;
    logo: string;
    examDate: string;    // e.g. "Mon, 24 Feb"
    daysLeft: number;   // days until exam
    category: string;   // used for navigation: /student/tests/:category/:examId
    tag?: 'Hot' | 'New' | 'Closing Soon';
}

const upcomingExams: UpcomingExam[] = [
    {
        id: 'ibps-rrb-po',
        examId: 'ibps-rrb-officer',
        name: 'IBPS RRB PO',
        logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
        examDate: 'Mon, 24 Feb',
        daysLeft: 2,
        category: 'banking',
        tag: 'Hot',
    },
    {
        id: 'ibps-rrb-clerk',
        examId: 'ibps-rrb-assistant',
        name: 'IBPS RRB Clerk',
        logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
        examDate: 'Wed, 26 Feb',
        daysLeft: 4,
        category: 'banking',
        tag: 'Hot',
    },
    {
        id: 'niacl-ao-mains',
        examId: 'niacl-assistant',
        name: 'NIACL AO Mains',
        logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125084/niacl_lqfem4.webp',
        examDate: 'Sat, 1 Mar',
        daysLeft: 7,
        category: 'banking',
    },
    {
        id: 'lic-aao-mains',
        examId: 'lic-aao',
        name: 'LIC AAO Mains',
        logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125084/niacl_lqfem4.webp',
        examDate: 'Sun, 2 Mar',
        daysLeft: 8,
        category: 'banking',
    },
    {
        id: 'ssc-cgl',
        examId: 'ssc-cgl',
        name: 'SSC CGL Tier 1',
        logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
        examDate: 'Mon, 10 Mar',
        daysLeft: 16,
        category: 'ssc',
        tag: 'New',
    },
    {
        id: 'rrb-ntpc',
        examId: 'rrb-ntpc',
        name: 'RRB NTPC',
        logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
        examDate: 'Sat, 15 Mar',
        daysLeft: 21,
        category: 'railways-rrb',
    },
    {
        id: 'sbi-po',
        examId: 'sbi-po',
        name: 'SBI PO Prelims',
        logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
        examDate: 'Sun, 23 Mar',
        daysLeft: 29,
        category: 'banking',
        tag: 'Closing Soon',
    },
    {
        id: 'upsc-cse',
        examId: 'upsc-cse',
        name: 'UPSC CSE Prelims',
        logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
        examDate: 'Sun, 25 May',
        daysLeft: 91,
        category: 'civil-services',
    },
];

const tagConfig = {
    Hot: { label: '🔥 Hot', className: 'bg-red-100 text-red-600' },
    New: { label: '✨ New', className: 'bg-green-100 text-green-700' },
    'Closing Soon': { label: '⏰ Closing', className: 'bg-amber-100 text-amber-700' },
};

const getDaysLeftColor = (days: number) => {
    if (days <= 3) return 'text-red-500';
    if (days <= 10) return 'text-amber-500';
    return 'text-primary';
};

export const TrendingExams: React.FC = () => {
    const navigate = useNavigate();

    const handleExamClick = (exam: UpcomingExam) => {
        navigate(`/student/tests/${exam.category}/${exam.examId}`);
    };

    return (
        <Card className="p-4 bg-card">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base">Upcoming Exams</h3>
                </div>
                <button
                    onClick={() => navigate('/student/all-exams')}
                    className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                >
                    View More
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Horizontally scrollable exam cards */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {upcomingExams.map((exam) => (
                    <button
                        key={exam.id}
                        onClick={() => handleExamClick(exam)}
                        className="flex-shrink-0 w-32 flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-white dark:bg-card hover:bg-primary/5 hover:border-primary/40 hover:shadow-md transition-all duration-200 group text-center"
                    >
                        {/* Logo box */}
                        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-muted/50 border border-border/60 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                            <img
                                src={exam.logo}
                                alt={exam.name}
                                className="w-12 h-12 object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125084/niacl_lqfem4.webp';
                                }}
                            />
                        </div>

                        {/* Exam Name */}
                        <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors w-full">
                            {exam.name}
                        </p>

                        {/* Date */}
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span>{exam.examDate}</span>
                        </div>

                        {/* Days left OR tag */}
                        {exam.tag ? (
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${tagConfig[exam.tag].className}`}>
                                {tagConfig[exam.tag].label}
                            </span>
                        ) : (
                            <span className={`text-[10px] font-bold ${getDaysLeftColor(exam.daysLeft)}`}>
                                {exam.daysLeft}d left
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </Card>
    );
};
