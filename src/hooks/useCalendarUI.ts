
import { useState } from 'react';

export const useCalendarUI = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [calendarView, setCalendarView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [otherCalendarEvents, setOtherCalendarEvents] = useState([
    { id: 1, title: 'Indonesian National Holiday', isChecked: true },
    { id: 2, title: 'Saturday Holiday With The Team', isChecked: true },
    { id: 3, title: 'Important Family Events', isChecked: false }
  ]);

  // Toggle dark mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // In real implementation, you'd also toggle classes on the document body
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Toggle other calendar event
  const toggleOtherCalendarEvent = (id: number) => {
    setOtherCalendarEvents(events => 
      events.map(event => 
        event.id === id ? { ...event, isChecked: !event.isChecked } : event
      )
    );
  };

  return {
    isDarkMode,
    toggleTheme,
    calendarView,
    setCalendarView,
    otherCalendarEvents,
    toggleOtherCalendarEvent
  };
};
