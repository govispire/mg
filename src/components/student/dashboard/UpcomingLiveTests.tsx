import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';

export const UpcomingLiveTests = () => {
    const upcomingTests = [
        {
            id: 1,
            title: 'All India IBPS PO Live Mock',
            date: '28 Jan, 2026',
            time: '10:00 AM',
            duration: '60 mins',
            registrations: '12.5k+',
        },
        {
            id: 2,
            title: 'SBI Clerk Prelims Maha-Mock',
            date: '30 Jan, 2026',
            time: '02:00 PM',
            duration: '60 mins',
            registrations: '8.2k+',
        },
        {
            id: 3,
            title: 'IBPS RRB Officer Scale-I Mock',
            date: '02 Feb, 2026',
            time: '11:00 AM',
            duration: '45 mins',
            registrations: '6.1k+',
        },
        {
            id: 4,
            title: 'RBI Assistant Prelims Mock',
            date: '05 Feb, 2026',
            time: '03:00 PM',
            duration: '60 mins',
            registrations: '4.8k+',
        },
        {
            id: 5,
            title: 'SBI PO Prelims Grand Mock',
            date: '08 Feb, 2026',
            time: '10:00 AM',
            duration: '60 mins',
            registrations: '9.3k+',
        },
    ];

    return (
        <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-orange-500 rounded-full" />
                    <h3 className="font-bold text-[15px] text-slate-800">Upcoming Live Tests</h3>
                </div>
                <span className="text-[11px] text-orange-600 font-semibold bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
                    </span>
                    Live
                </span>
            </div>

            {/* Test rows */}
            <div className="space-y-2.5 flex-1">
                {upcomingTests.slice(0, 5).map((test) => (
                    <div key={test.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="shrink-0 w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[12.5px] text-slate-800 truncate group-hover:text-orange-700 transition-colors">{test.title}</p>
                                <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                    <span>{test.date}</span>
                                    <span className="text-slate-300">•</span>
                                    <Clock className="h-2.5 w-2.5 text-slate-400" />
                                    <span>{test.time}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-medium text-slate-600">{test.registrations} registered</span>
                                </div>
                            </div>
                        </div>
                        <div className="shrink-0 ml-3">
                            <Button size="sm" className="h-7 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[11px] font-semibold shadow-sm" asChild>
                                <Link to="/student/live-tests">Register</Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <Button variant="outline" className="w-full mt-4 text-[13px] font-semibold text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 rounded-xl py-2.5" asChild>
                <Link to="/student/live-tests">View All Live Tests →</Link>
            </Button>
        </Card>
    );
};
