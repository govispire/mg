
import React from 'react';
import UniversalCalendar from '@/components/calendar/UniversalCalendar';
import { CalendarEvent } from '@/components/student/calendar/types';

// Sample admin events
const sampleAdminEvents: CalendarEvent[] = [
  {
    id: 'admin-1',
    title: 'System Maintenance',
    description: 'Scheduled server maintenance and updates',
    date: new Date(2025, 5, 3),
    time: '02:00',
    category: 'system-maintenance',
    priority: 'high',
    status: 'pending',
    taskType: 'system-maintenance',
    completed: false,
    assignedBy: 'admin',
    images: []
  },
  {
    id: 'admin-2',
    title: 'Review New User Applications',
    description: 'Process pending mentor and student applications',
    date: new Date(2025, 5, 4),
    time: '10:00',
    category: 'user-management',
    priority: 'medium',
    status: 'pending',
    taskType: 'user-management',
    completed: false,
    assignedTo: 'admin',
    images: []
  },
  {
    id: 'admin-3',
    title: 'Content Quality Review',
    description: 'Review and approve new course materials',
    date: new Date(2025, 5, 5),
    time: '14:00',
    category: 'content-review',
    priority: 'medium',
    status: 'pending',
    taskType: 'content-review',
    completed: false,
    assignedTo: 'mentor',
    assignedBy: 'admin',
    images: []
  },
  {
    id: 'admin-4',
    title: 'Monthly Analytics Review',
    description: 'Analyze platform usage and performance metrics',
    date: new Date(2025, 5, 6),
    time: '11:00',
    category: 'analytics-review',
    priority: 'low',
    status: 'pending',
    taskType: 'analytics-review',
    completed: false,
    images: []
  }
];

const AdminCalendar: React.FC = () => {
  return (
    <UniversalCalendar 
      userRole="admin" 
      initialEvents={sampleAdminEvents}
    />
  );
};

export default AdminCalendar;
