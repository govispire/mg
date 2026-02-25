import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Clock, Calendar, CheckCircle, FileText, Map, Hourglass, Flame, ClipboardCheck } from 'lucide-react';

interface StatsOverviewProps {
    journeyDays: number;
    userName: string;
    onCardClick: (type: 'journey' | 'hours' | 'active' | 'tests') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ journeyDays, userName, onCardClick }) => {
    // Mock data for trends (in a real app, these would come from props/API)
    const stats = [
        {
            id: 'journey',
            label: 'Total Journey Days',
            value: Math.max(0, journeyDays),
            subtext: `Since start of prep`,
            trend: '+1 day',
            trendUp: true,
            icon: Map,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100'
        },
        {
            id: 'hours',
            label: 'Total Study Hours',
            value: 195,
            subtext: '↑ 12 hrs more than last week',
            trend: '+12 hrs',
            trendUp: true,
            icon: Hourglass,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-100'
        },
        {
            id: 'active',
            label: 'Active Days Streak',
            value: 67,
            subtext: 'Personal best: 72 days!',
            trend: '+5 days',
            trendUp: true,
            icon: Flame,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-100'
        },
        {
            id: 'tests',
            label: 'Mock Tests Taken',
            value: 40,
            subtext: '2 tests pending review',
            trend: '+3 tests',
            trendUp: true,
            icon: ClipboardCheck,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            border: 'border-orange-100'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {stats.map((stat) => (
                <Card
                    key={stat.id}
                    className={`p-4 cursor-pointer hover:shadow-lg transition-all duration-300 group relative overflow-hidden border ${stat.border}`}
                    onClick={() => onCardClick(stat.id as any)}
                >
                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500`} />

                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {stat.trend}
                                </div>
                                <div className="p-2 rounded-full bg-primary text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <ArrowUpRight className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-foreground mb-1 font-mono tracking-tight">{stat.value}</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                                {stat.subtext}
                            </p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
