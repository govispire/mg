import React from 'react';
import { Map, Hourglass, Flame, ClipboardCheck, ArrowUpRight } from 'lucide-react';

interface StatsOverviewProps {
    journeyDays: number;
    userName: string;
    onCardClick: (type: 'journey' | 'hours' | 'active' | 'tests') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ journeyDays, onCardClick }) => {
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
            value: 195,
            subtext: '12 hrs more than last week',
            icon: Hourglass,
            iconColor: 'text-violet-500',
        },
        {
            id: 'active',
            label: 'Active Days Streak',
            value: 67,
            subtext: 'Personal best: 72 days',
            icon: Flame,
            iconColor: 'text-emerald-500',
        },
        {
            id: 'tests',
            label: 'Mock Tests Taken',
            value: 40,
            subtext: '2 tests pending review',
            icon: ClipboardCheck,
            iconColor: 'text-orange-500',
        },
    ];

    return (
        <div className="flex bg-white dark:bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm mb-6">
            {stats.map((stat, index) => (
                <button
                    key={stat.id}
                    onClick={() => onCardClick(stat.id as any)}
                    className={`
                        flex-1 flex flex-col gap-2 px-5 py-4 text-left
                        hover:bg-muted/40 transition-colors duration-200 group
                        ${index !== stats.length - 1 ? 'border-r border-border/60' : ''}
                    `}
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
