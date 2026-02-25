import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

export const UpcomingLiveTests = () => {
    // Dummy data for upcoming tests
    const upcomingTests = [
        {
            id: 1,
            title: 'All India IBPS PO Live Mock',
            date: '28 Jan, 2026',
            time: '10:00 AM',
            duration: '60 mins',
            status: 'Registration Open',
            registrations: '12.5k+'
        },
        {
            id: 2,
            title: 'SBI Clerk Prelims Maha-Mock',
            date: '30 Jan, 2026',
            time: '02:00 PM',
            duration: '60 mins',
            status: 'Coming Soon',
            registrations: '8.2k+'
        }
    ];

    return (
        <Card className="p-4 bg-card border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    Upcoming Live Tests
                </h3>
                <span className="text-[10px] text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                    Premium
                </span>
            </div>

            <div className="space-y-3">
                {upcomingTests.map((test) => (
                    <div key={test.id} className="bg-muted/30 rounded-lg p-3 border border-border/50 hover:border-primary/20 transition-all cursor-pointer group">
                        <h4 className="font-medium text-sm mb-2 group-hover:text-primary transition-colors">{test.title}</h4>
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
                            <Button size="sm" className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white border-none">
                                Register
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground bg-blue-50/50 p-2 rounded">
                <AlertCircle className="h-3 w-3 text-blue-500" />
                <span>Live tests simulate real exam environment.</span>
            </div>
        </Card>
    );
};
