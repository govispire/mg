
import React from 'react';
import UniversalCalendar from '@/components/calendar/UniversalCalendar';
import { CalendarEvent } from '@/components/student/calendar/types';

// Sample data with enhanced structure
const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Mock Test - Banking Awareness',
    description: 'Practice section for IBPS PO',
    date: new Date(2025, 5, 2),
    time: '10:00',
    category: 'test-prep',
    priority: 'high',
    status: 'pending',
    taskType: 'test-prep',
    completed: false,
    assignedBy: 'mentor',
    images: []
  },
  {
    id: '2',
    title: 'Reasoning Study Session',
    description: 'Focus on puzzles and seating arrangements',
    date: new Date(2025, 5, 2),
    time: '14:30',
    category: 'study',
    priority: 'medium',
    status: 'pending',
    taskType: 'study',
    completed: false,
    images: []
  },
  {
    id: '3',
    title: 'Assigned Homework - Mathematics',
    description: 'Complete the assignment by tomorrow',
    date: new Date(2025, 5, 3),
    time: '16:00',
    category: 'assignment',
    priority: 'high',
    status: 'pending',
    taskType: 'assignment',
    completed: false,
    isAssigned: true,
    assignedBy: 'mentor',
    images: []
  },
  {
    id: '4',
    title: 'Mock Interview Session',
    description: 'Online interview practice',
    date: new Date(2025, 5, 5),
    time: '11:00',
    category: 'practice',
    priority: 'medium',
    status: 'pending',
    taskType: 'practice',
    completed: false,
    images: []
  }
];

const StudentCalendar: React.FC = () => {
  return (
    <UniversalCalendar 
      userRole="student" 
      initialEvents={sampleEvents}
    />
  );
};

export default StudentCalendar;
