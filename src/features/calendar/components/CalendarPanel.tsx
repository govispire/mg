
import React, { useState, useRef, useEffect } from 'react';
import { Calendar as FullCalendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/hooks/useTasks';
import { useTaskModal } from '@/hooks/useTaskModal';
import { EventModalContent } from './EventModalContent';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { EventClickArg, DateSelectArg, EventInput } from '@fullcalendar/core';

export const CalendarPanel: React.FC = () => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarApi, setCalendarApi] = useState<FullCalendar | null>(null);
  const [view, setView] = useState<'timeGridDay' | 'timeGridWeek' | 'dayGridMonth'>('timeGridWeek');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedRange, setSelectedRange] = useState<DateSelectArg | null>(null);
  
  const { tasks } = useTasks();
  const { openModal } = useTaskModal();
  
  // Initialize FullCalendar
  useEffect(() => {
    if (!calendarRef.current) return;
    
    const calendar = new FullCalendar(calendarRef.current, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
      initialView: view,
      headerToolbar: false, // we'll use our own custom header
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      weekends: true,
      nowIndicator: true,
      height: '100%',
      
      // Event handling
      select: (selectInfo: DateSelectArg) => {
        setSelectedRange(selectInfo);
        setSelectedEvent(null);
        setModalOpen(true);
      },
      eventClick: (clickInfo: EventClickArg) => {
        setSelectedEvent({
          id: clickInfo.event.id,
          title: clickInfo.event.title,
          start: clickInfo.event.start,
          end: clickInfo.event.end,
          allDay: clickInfo.event.allDay,
          backgroundColor: clickInfo.event.backgroundColor
        });
        setSelectedRange(null);
        setModalOpen(true);
      }
    });
    
    calendar.render();
    setCalendarApi(calendar);
    
    return () => {
      calendar.destroy();
    };
  }, []);
  
  // Update view when it changes
  useEffect(() => {
    if (calendarApi) {
      calendarApi.changeView(view);
    }
  }, [view, calendarApi]);
  
  // Map tasks to calendar events
  useEffect(() => {
    if (calendarApi) {
      const events: EventInput[] = tasks.map(task => ({
        id: task.id.toString(),
        title: task.title,
        start: task.dueDate,
        backgroundColor: task.completed ? '#cbd5e1' : getCategoryColor(task.category),
        textColor: task.completed ? '#64748b' : '#ffffff',
        borderColor: task.completed ? '#cbd5e1' : getCategoryColor(task.category),
      }));
      
      calendarApi.removeAllEvents();
      calendarApi.addEventSource(events);
    }
  }, [tasks, calendarApi]);
  
  // Helper function to get color based on category
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'study': return '#3b82f6'; // blue
      case 'practice': return '#22c55e'; // green
      case 'revision': return '#eab308'; // yellow
      case 'exams': return '#ef4444'; // red
      case 'important': return '#8b5cf6'; // purple
      default: return '#6366f1'; // indigo
    }
  };
  
  // Calendar navigation
  const handleToday = () => {
    if (calendarApi) {
      calendarApi.today();
      setSelectedDate(new Date());
    }
  };
  
  const handlePrev = () => {
    if (calendarApi) {
      calendarApi.prev();
      setSelectedDate(calendarApi.getDate());
    }
  };
  
  const handleNext = () => {
    if (calendarApi) {
      calendarApi.next();
      setSelectedDate(calendarApi.getDate());
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
            <h3 className="text-lg font-medium ml-2">
              {calendarApi && new Intl.DateTimeFormat('en-US', { 
                month: 'long', 
                year: 'numeric',
                day: view === 'timeGridDay' ? 'numeric' : undefined
              }).format(selectedDate)}
            </h3>
          </div>
          
          <div className="flex gap-2">
            <Tabs value={view} onValueChange={(v: string) => setView(v as any)} className="w-full">
              <TabsList>
                <TabsTrigger value="timeGridDay">Day</TabsTrigger>
                <TabsTrigger value="timeGridWeek">Week</TabsTrigger>
                <TabsTrigger value="dayGridMonth">Month</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={() => openModal()}>Add Task</Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div ref={calendarRef} className="h-full"></div>
      </div>
      
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <EventModalContent 
            event={selectedEvent} 
            dateRange={selectedRange}
            onClose={() => setModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
