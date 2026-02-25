
import React from 'react';
import UniversalCalendar from '@/components/calendar/UniversalCalendar';
import { CalendarEvent } from '@/components/student/calendar/types';

// Sample employee-specific events
const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Upload Question Bank - Mathematics',
    description: 'Upload new set of mathematics questions for upcoming tests',
    date: new Date(2025, 5, 3),
    time: '09:00',
    category: 'assignment',
    priority: 'high',
    status: 'pending',
    taskType: 'assignment',
    completed: false,
    assignedBy: 'admin',
    images: []
  },
  {
    id: '2',
    title: 'Review Study Materials - Physics',
    description: 'Quality check and approve uploaded physics study materials',
    date: new Date(2025, 5, 4),
    time: '11:00',
    category: 'practice',
    priority: 'medium',
    status: 'pending',
    taskType: 'practice',
    completed: false,
    images: []
  },
  {
    id: '3',
    title: 'Test Preview Session',
    description: 'Preview and validate upcoming mock tests before publication',
    date: new Date(2025, 5, 5),
    time: '14:30',
    category: 'test',
    priority: 'high',
    status: 'pending',
    taskType: 'test',
    completed: false,
    images: []
  },
  {
    id: '4',
    title: 'Content Approval Deadline',
    description: 'Final approval deadline for current affairs content',
    date: new Date(2025, 5, 6),
    time: '16:00',
    category: 'deadline',
    priority: 'urgent',
    status: 'pending',
    taskType: 'deadline',
    completed: false,
    images: []
  },
  {
    id: '5',
    title: 'Upload Study Materials - English',
    description: 'Upload comprehensive English grammar and vocabulary materials',
    date: new Date(2025, 5, 7),
    time: '10:00',
    category: 'assignment',
    priority: 'medium',
    status: 'pending',
    taskType: 'assignment',
    completed: false,
    images: []
  }
];

const EmployeeCalendar: React.FC = () => {
  return (
    <UniversalCalendar 
      userRole="employee" 
      initialEvents={sampleEvents}
    />
  );
};

export default EmployeeCalendar;
