
import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/components/student/calendar/types';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'calendar_tasks';

export const useCalendarTaskManager = (initialEvents: CalendarEvent[] = []) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { toast } = useToast();

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem(STORAGE_KEY);
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
        setEvents(parsedEvents);
      } catch (error) {
        console.error('Error loading events from localStorage:', error);
        setEvents(initialEvents);
      }
    } else {
      setEvents(initialEvents);
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    if (events.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }
  }, [events]);

  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    setEvents(prev => [...prev, newEvent]);
    toast({
      title: "Task added!",
      description: `"${eventData.title}" has been scheduled.`,
    });
    return newEvent;
  };

  const updateEvent = (eventId: string, eventData: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...eventData } : event
    ));
    toast({
      title: "Task updated!",
      description: "Task has been successfully updated.",
    });
  };

  const deleteEvent = (eventId: string) => {
    const eventToDelete = events.find(e => e.id === eventId);
    setEvents(prev => prev.filter(event => event.id !== eventId));
    toast({
      title: "Task deleted",
      description: `"${eventToDelete?.title}" has been removed.`,
    });
  };

  const toggleTask = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            completed: !event.completed,
            status: !event.completed ? 'completed' : 'pending'
          }
        : event
    ));
  };

  // Calculate progress statistics
  const getProgressStats = () => {
    const total = events.length;
    const completed = events.filter(e => e.completed).length;
    const pending = events.filter(e => !e.completed && !e.missed).length;
    const overdue = events.filter(e => e.missed).length;
    
    return {
      total,
      completed,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleTask,
    getProgressStats
  };
};
