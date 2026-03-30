import React from 'react';
import { Map, Hourglass, Flame, ClipboardCheck, ArrowUpRight } from 'lucide-react';

interface StatsOverviewProps {
    journeyDays: number;
    userName: string;
    studyHours: number;
    activeStreak: number;
    mockTestsTaken: number;
    onCardClick: (type: 'journey' | 'hours' | 'active' | 'tests') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
    journeyDays,
    studyHours,
    activeStreak,
    mockTestsTaken,
    onCardClick
}) => {
    const stats = [
        {
            id: 'journey',
            label: 'Total Journey Days',
            value: Math.max(0, journeyDays),
            subtext: 'Since start of prep',
            icon: Map,
            iconColor: 'text-blue-500',
        },
        {
            id: 'hours',
            label: 'Total Study Hours',
            value: studyHours,
            subtext: studyHours > 0 ? 'From completed quizzes' : 'Complete quizzes to track',
            icon: Hourglass,
            iconColor: 'text-violet-500',
        },
        {
            id: 'active',
            label: 'Active Days Streak',
            value: activeStreak,
            subtext: activeStreak > 0 ? `${activeStreak} day${activeStreak !== 1 ? 's' : ''} in a row 🔥` : 'Complete 2 quizzes today',
            icon: Flame,
            iconColor: 'text-emerald-500',
        },
        {
            id: 'tests',
            label: 'Quizzes Completed',
            value: mockTestsTaken,
            subtext: mockTestsTaken > 0 ? `${mockTestsTaken} quiz${mockTestsTaken !== 1 ? 'zes' : ''} finished` : 'Start your first quiz!',
            icon: ClipboardCheck,
            iconColor: 'text-orange-500',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border/60 border border-border/60 rounded-2xl overflow-hidden shadow-sm mb-6">
            {stats.map((stat) => (
                <button
                    key={stat.id}
                    onClick={() => onCardClick(stat.id as any)}
                    className="flex flex-col gap-2 px-3 sm:px-5 py-4 text-left bg-white dark:bg-card hover:bg-muted/40 transition-colors duration-200 group relative"
                >
                    {/* Icon + label row */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className={`${stat.iconColor} opacity-80 group-hover:opacity-100 transition-opacity`}>
                                <stat.icon className="h-4 w-4" />
                            </span>
                            <span className="text-xs font-medium text-muted-foreground truncate">{stat.label}</span>
                        </div>
                        <div className="p-1.5 rounded-full bg-primary text-white shadow-sm group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </div>
                    </div>

                    {/* Value */}
                    <div className="text-2xl font-bold text-foreground tracking-tight leading-none">
                        {stat.value}
                    </div>

                    {/* Subtext */}
                    <div className="text-[11px] text-muted-foreground leading-tight">
                        {stat.subtext}
                    </div>
                </button>
            ))}
        </div>
    );
};
