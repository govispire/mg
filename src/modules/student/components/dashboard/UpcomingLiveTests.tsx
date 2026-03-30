import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertCircle, ArrowRight } from 'lucide-react';

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
    ];

    return (
        <Card className="p-4 bg-card border-2 border-primary/40 relative overflow-hidden shadow-lg shadow-primary/10">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-pulse pointer-events-none" />

            <div className="absolute -top-1 -right-1 z-10">
                <div className="relative">
                    <div className="absolute inset-0 bg-red-500 rounded-full blur-md animate-pulse" />
                    <div className="relative bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-lg">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                        LIVE
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mb-3 relative z-10">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                    </span>
                    Upcoming Live Tests
                    <span className="ml-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                        {upcomingTests.length}
                    </span>
                </h3>
                <span className="text-[10px] text-primary font-medium bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-full border border-primary/20">
                    Premium
                </span>
            </div>

            <div className="space-y-3 relative z-10">
                {upcomingTests.map((test) => (
                    <div key={test.id} className="bg-muted/30 rounded-lg p-3 border border-border/50 hover:border-primary/30 transition-all cursor-pointer group">
                        <h4 className="font-medium text-sm mb-2 group-hover:text-primary transition-colors line-clamp-1">
                            {test.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{test.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{test.time}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-[10px] text-muted-foreground">
                                <span className="font-medium text-foreground">{test.registrations}</span> registered
                            </div>
                            <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90 text-white border-none" asChild>
                                <Link to="/student/live-tests">Register</Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground bg-blue-50/50 dark:bg-blue-950/30 p-2 rounded relative z-10">
                <AlertCircle className="h-3 w-3 text-blue-500 shrink-0" />
                <span>Live tests simulate real exam environment.</span>
            </div>

            <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 h-8 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 gap-1 relative z-10"
                asChild
            >
                <Link to="/student/live-tests">
                    View All Live Tests
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </Button>
        </Card>
    );
};
