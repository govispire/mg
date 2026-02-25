import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Circle
} from 'lucide-react';

interface CalendarViewProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    quizAvailability: Record<string, number>; // date -> count of quizzes
    completedDates: Set<string>;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarView: React.FC<CalendarViewProps> = ({
    selectedDate,
    onDateSelect,
    quizAvailability,
    completedDates
}) => {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const date = new Date(selectedDate);
        return new Date(date.getFullYear(), date.getMonth(), 1);
    });

    const goToPreviousMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
        onDateSelect(today.toISOString().split('T')[0]);
    };

    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDaysInMonth = (): Date[] => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days: Date[] = [];

        // Add previous month's trailing days
        const firstDayOfWeek = firstDay.getDay();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            days.push(date);
        }

        // Add current month's days
        for (let date = 1; date <= lastDay.getDate(); date++) {
            days.push(new Date(year, month, date));
        }

        // Add next month's leading days to complete the grid
        const remainingDays = 42 - days.length; // Always show 6 weeks
        for (let i = 1; i <= remainingDays; i++) {
            days.push(new Date(year, month + 1, i));
        }

        return days;
    };

    const days = getDaysInMonth();
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <Card>
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold">
                            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPreviousMonth}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToToday}
                            className="h-8 px-3 text-xs font-semibold"
                        >
                            Today
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextMonth}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS.map(day => (
                        <div
                            key={day}
                            className="text-center text-xs font-semibold text-muted-foreground py-2"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((date, index) => {
                        const dateStr = formatDate(date);
                        const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                        const isToday = dateStr === todayStr;
                        const isSelected = dateStr === selectedDate;
                        const quizCount = quizAvailability[dateStr] || 0;
                        const isCompleted = completedDates.has(dateStr);
                        const isFuture = date > new Date();

                        return (
                            <button
                                key={index}
                                onClick={() => onDateSelect(dateStr)}
                                disabled={quizCount === 0 && !isToday}
                                className={`
                  relative aspect-square p-1 rounded-lg text-sm font-medium transition-all
                  ${!isCurrentMonth ? 'text-muted-foreground/30' : ''}
                  ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                  ${isSelected ? 'bg-primary text-primary-foreground shadow-md' : ''}
                  ${!isSelected && quizCount > 0 ? 'hover:bg-muted' : ''}
                  ${quizCount === 0 && !isToday ? 'opacity-40 cursor-not-allowed' : ''}
                  ${!isSelected && isToday ? 'bg-primary/10' : ''}
                `}
                            >
                                <div className="flex flex-col items-center justify-center h-full">
                                    <span>{date.getDate()}</span>

                                    {/* Quiz Count Badge */}
                                    {quizCount > 0 && !isSelected && (
                                        <Badge
                                            variant="secondary"
                                            className="absolute top-0.5 right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px] rounded-full"
                                        >
                                            {quizCount}
                                        </Badge>
                                    )}

                                    {/* Completion Indicator */}
                                    {isCompleted && isCurrentMonth && (
                                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        </div>
                                    )}

                                    {/* Available but not completed */}
                                    {quizCount > 0 && !isCompleted && isCurrentMonth && !isSelected && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                                            <Circle className="h-2 w-2 fill-primary text-primary" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Circle className="h-2 w-2 fill-primary text-primary" />
                        <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-sm ring-2 ring-primary" />
                        <span>Today</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CalendarView;
