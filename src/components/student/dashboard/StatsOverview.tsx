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
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            accentColor: '#3b82f6',
            emptyPrompt: journeyDays === 0 ? 'Set your start date →' : null,
        },
        {
            id: 'hours',
            label: 'Total Study Hours',
            value: studyHours,
            subtext: studyHours > 0 ? 'From completed quizzes' : 'Complete quizzes to track',
            icon: Hourglass,
            iconBg: 'bg-violet-100',
            iconColor: 'text-violet-600',
            accentColor: '#8b5cf6',
            emptyPrompt: studyHours === 0 ? 'Start your first quiz →' : null,
        },
        {
            id: 'active',
            label: 'Active Days Streak',
            value: activeStreak,
            subtext: activeStreak > 0 ? `${activeStreak} day${activeStreak !== 1 ? 's' : ''} in a row 🔥` : 'Complete 2 quizzes today',
            icon: Flame,
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            accentColor: '#10b981',
            emptyPrompt: activeStreak === 0 ? 'Do 2 quizzes to start 🔥' : null,
        },
        {
            id: 'tests',
            label: 'Quizzes Completed',
            value: mockTestsTaken,
            subtext: mockTestsTaken > 0 ? `${mockTestsTaken} quiz${mockTestsTaken !== 1 ? 'zes' : ''} finished` : 'Start your first quiz!',
            icon: ClipboardCheck,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            accentColor: '#f97316',
            emptyPrompt: mockTestsTaken === 0 ? 'Try a free quiz →' : null,
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-md mb-6">
            {stats.map((stat) => (
                <button
                    key={stat.id}
                    onClick={() => onCardClick(stat.id as any)}
                    className="flex flex-col gap-2 px-3 sm:px-5 py-4 text-left bg-white relative group overflow-hidden"
                    style={{
                        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                    }}
                    onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = 'translateY(-2px)';
                        el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)';
                        el.style.zIndex = '10';
                    }}
                    onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = 'translateY(0)';
                        el.style.boxShadow = 'none';
                        el.style.zIndex = '1';
                    }}
                >
                    {/* Colored bottom accent bar (shows on hover) */}
                    <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: stat.accentColor }}
                    />

                    {/* Icon + label row */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className={`${stat.iconBg} ${stat.iconColor} flex items-center justify-center w-7 h-7 rounded-lg transition-transform duration-200 group-hover:scale-110`}>
                                <stat.icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-xs font-medium text-muted-foreground truncate">{stat.label}</span>
                        </div>
                        <div className="p-1.5 rounded-full bg-primary text-white shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </div>
                    </div>

                    {/* Value */}
                    <div className="text-2xl font-bold text-foreground tracking-tight leading-none">
                        {stat.value}
                    </div>

                    {/* Subtext / CTA */}
                    <div className={`text-[11px] leading-tight ${stat.value === 0 && stat.emptyPrompt ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        {stat.value === 0 && stat.emptyPrompt ? stat.emptyPrompt : stat.subtext}
                    </div>
                </button>
            ))}
        </div>
    );
};
