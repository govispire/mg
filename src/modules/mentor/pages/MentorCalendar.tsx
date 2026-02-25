
import React from 'react';
import UniversalCalendar from '@/components/calendar/UniversalCalendar';
import { CalendarEvent } from '@/components/student/calendar/types';

// Sample mentor events
const sampleMentorEvents: CalendarEvent[] = [
  {
    id: 'mentor-1',
    title: 'Student Progress Review - John Doe',
    description: 'Weekly progress check and feedback session',
    date: new Date(2025, 5, 3),
    time: '10:00',
    category: 'progress-review',
    priority: 'high',
    status: 'pending',
    taskType: 'progress-review',
    completed: false,
    assignedBy: 'mentor',
    images: []
  },
  {
    id: 'mentor-2',
    title: 'Group Study Session Planning',
    description: 'Prepare materials for upcoming group session',
    date: new Date(2025, 5, 4),
    time: '15:00',
    category: 'session-planning',
    priority: 'medium',
    status: 'pending',
    taskType: 'session-planning',
    completed: false,
    images: []
  },
  {
    id: 'mentor-3',
    title: 'Student Guidance - Career Path',
    description: 'One-on-one career guidance session',
    date: new Date(2025, 5, 5),
    time: '14:00',
    category: 'student-guidance',
    priority: 'high',
    status: 'pending',
    taskType: 'student-guidance',
    completed: false,
    assignedTo: 'student',
    assignedBy: 'mentor',
    images: []
  },
  {
    id: 'mentor-4',
    title: 'Assessment Creation',
    description: 'Create weekly assessment for mathematics',
    date: new Date(2025, 5, 6),
    time: '09:00',
    category: 'assessment',
    priority: 'medium',
    status: 'pending',
    taskType: 'assessment',
    completed: false,
    images: []
  }
];

const MentorCalendar: React.FC = () => {
  return (
    <UniversalCalendar 
      userRole="mentor" 
      initialEvents={sampleMentorEvents}
    />
  );
};

export default MentorCalendar;
