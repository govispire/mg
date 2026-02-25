import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, TrendingUp, Zap, BookOpen } from 'lucide-react';

export const NextAction = () => {
    return (
        <Card className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-100 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-base text-violet-900">Recommended for You</h3>
                        <p className="text-sm text-violet-700 mt-1">
                            Based on your recent performance, we suggest focusing on <strong>Numerical Ability</strong> today.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button className="flex-1 sm:flex-none bg-violet-600 hover:bg-violet-700 text-white gap-2">
                        <Play className="h-4 w-4" />
                        Subject Quiz
                    </Button>
                    <Button variant="outline" className="flex-1 sm:flex-none border-violet-200 text-violet-700 hover:bg-violet-100 gap-2">
                        <BookOpen className="h-4 w-4" />
                        Resume Mock 12
                    </Button>
                </div>
            </div>
        </Card>
    );
};
