
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';

interface CalendarCardProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  calendarView: 'month' | 'week';
  setCalendarView: (view: 'month' | 'week') => void;
  taskDates: Date[];
}

const CalendarCard: React.FC<CalendarCardProps> = ({
  date,
  setDate,
  calendarView,
  setCalendarView,
  taskDates
}) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
          Calendar
        </h2>
        <div className="flex">
          <Button 
            variant={calendarView === 'month' ? 'default' : 'outline'} 
            size="sm" 
            className="text-xs h-8"
            onClick={() => setCalendarView('month')}
          >
            Month
          </Button>
          <Button 
            variant={calendarView === 'week' ? 'default' : 'outline'} 
            size="sm" 
            className="text-xs h-8 ml-1"
            onClick={() => setCalendarView('week')}
          >
            Week
          </Button>
        </div>
      </div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border pointer-events-auto"
        modifiers={{
          taskDay: taskDates
        }}
        modifiersStyles={{
          taskDay: {
            fontWeight: 'bold',
            backgroundColor: 'rgba(91, 187, 252, 0.15)',
            color: '#097ff5',
            transform: 'scale(0.95)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '2px solid rgba(91, 187, 252, 0.5)',
          }
        }}
      />
    </Card>
  );
};

export default CalendarCard;
