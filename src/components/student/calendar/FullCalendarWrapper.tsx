
import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Task } from '@/hooks/useCalendarTasks';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface FullCalendarWrapperProps {
  tasks: Task[];
  view: 'daily' | 'weekly' | 'monthly';
  onTaskClick: (taskId: number) => void;
  onDateClick: (date: Date) => void;
}

const FullCalendarWrapper: React.FC<FullCalendarWrapperProps> = ({ 
  tasks, 
  view,
  onTaskClick,
  onDateClick 
}) => {
  const calendarRef = useRef(null);
  const isMobile = useIsMobile();
  
  // Convert tasks to FullCalendar events
  const events = tasks.map(task => {
    // Parse the time from HH:MM format
    const [hours, minutes] = task.startTime.split(':').map(Number);
    const start = new Date(task.date);
    start.setHours(hours, minutes, 0);
    
    let end;
    if (task.endTime) {
      const [endHours, endMinutes] = task.endTime.split(':').map(Number);
      end = new Date(task.date);
      end.setHours(endHours, endMinutes, 0);
    } else {
      end = new Date(start);
      end.setHours(start.getHours() + 1); // Default to 1 hour if no end time
    }
    
    // Determine color based on task type or priority
    let backgroundColor;
    let textColor = '#FFFFFF';
    let borderColor;
    
    switch(task.type) {
      case 'study':
        backgroundColor = '#9b87f5'; // purple
        borderColor = '#8a74e8';
        break;
      case 'test':
        backgroundColor = '#F97316'; // orange
        borderColor = '#ea6504';
        break;
      case 'revision':
        backgroundColor = '#0EA5E9'; // blue
        borderColor = '#0993d3';
        break;
      case 'break':
        backgroundColor = '#10B981'; // green
        borderColor = '#0ea371';
        break;
      default:
        backgroundColor = '#8E9196'; // gray
        borderColor = '#7a7d82';
    }
    
    // Add different styling for completed tasks
    if (task.completed) {
      backgroundColor = '#D1D5DB'; // light gray for completed tasks
      borderColor = '#B8BDC5';
      textColor = '#6B7280';
    }
    
    return {
      id: task.id.toString(),
      title: task.title,
      start,
      end,
      backgroundColor,
      borderColor,
      textColor,
      extendedProps: {
        description: task.description,
        type: task.type,
        priority: task.priority,
        subject: task.subject,
        completed: task.completed,
        missed: task.missed
      },
      classNames: [
        task.priority === 'high' ? 'priority-high' : '',
        task.completed ? 'completed-task' : '',
        task.missed ? 'missed-task' : '',
        `task-type-${task.type}`
      ]
    };
  });
  
  // Determine calendar view based on prop
  const getCalendarView = () => {
    switch(view) {
      case 'daily':
        return 'timeGridDay';
      case 'weekly':
        return 'timeGridWeek';
      case 'monthly':
        return 'dayGridMonth';
      default:
        return 'dayGridMonth';
    }
  };
  
  useEffect(() => {
    // Add custom styles to calendar when it's rendered
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.render(); // Re-render to apply any changes
    }
  }, [view]);

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border-purple-100 dark:border-gray-700">
      <div className="h-[calc(100vh-150px)] md:h-[calc(100vh-180px)] custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={getCalendarView()}
          headerToolbar={false} // We're handling header separately
          events={events}
          eventClick={(info) => {
            onTaskClick(parseInt(info.event.id));
          }}
          dateClick={(info) => {
            onDateClick(info.date);
          }}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          height="100%"
          nowIndicator={true}
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          stickyHeaderDates={true}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
          dayHeaderFormat={{
            weekday: isMobile ? 'short' : 'long',
            month: isMobile ? 'numeric' : 'long',
            day: 'numeric',
            omitCommas: true
          }}
          eventDidMount={(info) => {
            // Add tooltip with description - using textContent to prevent XSS
            if (info.event.extendedProps.description) {
              const tooltip = document.createElement('div');
              tooltip.className = 'calendar-tooltip bg-white dark:bg-gray-800 p-2 rounded shadow-lg text-sm max-w-xs';
              // Use textContent instead of innerHTML to prevent XSS attacks
              tooltip.textContent = info.event.extendedProps.description;
              
              const eventEl = info.el;
              eventEl.addEventListener('mouseover', () => {
                document.body.appendChild(tooltip);
                const rect = eventEl.getBoundingClientRect();
                tooltip.style.position = 'absolute';
                tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
                tooltip.style.left = `${rect.left + window.scrollX}px`;
                tooltip.style.zIndex = '10000';
              });
              
              eventEl.addEventListener('mouseout', () => {
                if (document.body.contains(tooltip)) {
                  document.body.removeChild(tooltip);
                }
              });
            }
          }}
          eventContent={(arg) => {
            return (
              <div className="event-content flex items-center gap-1 p-1 overflow-hidden">
                <div 
                  className={`flex-shrink-0 w-2 h-2 rounded-full ${
                    arg.event.extendedProps.priority === 'high' ? 'bg-red-500' :
                    arg.event.extendedProps.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                />
                <div className="truncate text-xs font-medium">{arg.event.title}</div>
              </div>
            );
          }}
          dragScroll={true}
          eventDurationEditable={true}
          eventDrop={(info) => {
            // Would update the task in a real implementation
            const taskId = parseInt(info.event.id);
            const newStart = info.event.start;
            
            console.log(`Task ${taskId} moved to ${newStart}`);
          }}
          eventResize={(info) => {
            // Would update the task duration in a real implementation
            const taskId = parseInt(info.event.id);
            const newEnd = info.event.end;
            
            console.log(`Task ${taskId} resized to end at ${newEnd}`);
          }}
        />
      </div>
    </Card>
  );
};

export default FullCalendarWrapper;
