
import React from 'react';
import UniversalCalendar from '@/components/calendar/UniversalCalendar';
import { CalendarEvent } from '@/components/student/calendar/types';

// Sample owner-specific events
const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Board Meeting - Q2 Review',
    description: 'Quarterly business review with board members and stakeholders',
    date: new Date(2025, 5, 3),
    time: '10:00',
    category: 'meeting',
    priority: 'urgent',
    status: 'pending',
    taskType: 'meeting',
    completed: false,
    assignedBy: 'board',
    images: []
  },
  {
    id: '2',
    title: 'Financial Performance Analysis',
    description: 'Review monthly revenue, costs, and profit margins',
    date: new Date(2025, 5, 5),
    time: '14:00',
    category: 'assignment',
    priority: 'high',
    status: 'pending',
    taskType: 'assignment',
    completed: false,
    images: []
  },
  {
    id: '3',
    title: 'Product Strategy Meeting',
    description: 'Plan new features and platform enhancements for next quarter',
    date: new Date(2025, 5, 7),
    time: '11:00',
    category: 'meeting',
    priority: 'high',
    status: 'pending',
    taskType: 'meeting',
    completed: false,
    images: []
  },
  {
    id: '4',
    title: 'Investor Presentation',
    description: 'Present growth metrics and expansion plans to potential investors',
    date: new Date(2025, 5, 9),
    time: '16:00',
    category: 'presentation',
    priority: 'urgent',
    status: 'pending',
    taskType: 'presentation',
    completed: false,
    images: []
  },
  {
    id: '5',
    title: 'Team Lead Sync',
    description: 'Weekly sync with department heads and team leaders',
    date: new Date(2025, 5, 6),
    time: '09:00',
    category: 'meeting',
    priority: 'medium',
    status: 'pending',
    taskType: 'meeting',
    completed: false,
    images: []
  },
  {
    id: '6',
    title: 'Market Research Review',
    description: 'Analyze competitor landscape and market opportunities',
    date: new Date(2025, 5, 11),
    time: '13:00',
    category: 'assignment',
    priority: 'medium',
    status: 'pending',
    taskType: 'assignment',
    completed: false,
    images: []
  }
];

const OwnerCalendar: React.FC = () => {
  return (
    <UniversalCalendar 
      userRole="owner" 
      initialEvents={sampleEvents}
    />
  );
};

export default OwnerCalendar;
