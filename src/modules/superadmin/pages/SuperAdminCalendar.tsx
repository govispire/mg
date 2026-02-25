
import React from 'react';
import UniversalCalendar from '@/components/calendar/UniversalCalendar';
import { CalendarEvent } from '@/components/student/calendar/types';

// Sample super-admin specific events
const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'System Maintenance Window',
    description: 'Scheduled maintenance for platform infrastructure updates',
    date: new Date(2025, 5, 2),
    time: '02:00',
    category: 'announcement',
    priority: 'high',
    status: 'pending',
    taskType: 'announcement',
    completed: false,
    assignedBy: 'system',
    images: []
  },
  {
    id: '2',
    title: 'Create New Admin Account',
    description: 'Set up admin access for new regional office',
    date: new Date(2025, 5, 4),
    time: '10:00',
    category: 'meeting',
    priority: 'medium',
    status: 'pending',
    taskType: 'meeting',
    completed: false,
    images: []
  },
  {
    id: '3',
    title: 'Platform Analytics Review',
    description: 'Monthly review of system performance and user analytics',
    date: new Date(2025, 5, 6),
    time: '15:00',
    category: 'meeting',
    priority: 'medium',
    status: 'pending',
    taskType: 'meeting',
    completed: false,
    images: []
  },
  {
    id: '4',
    title: 'User Management Audit',
    description: 'Quarterly audit of all user accounts and permissions',
    date: new Date(2025, 5, 8),
    time: '09:00',
    category: 'assignment',
    priority: 'high',
    status: 'pending',
    taskType: 'assignment',
    completed: false,
    images: []
  },
  {
    id: '5',
    title: 'Security Compliance Check',
    description: 'Review security protocols and compliance requirements',
    date: new Date(2025, 5, 10),
    time: '11:30',
    category: 'deadline',
    priority: 'urgent',
    status: 'pending',
    taskType: 'deadline',
    completed: false,
    images: []
  }
];

const SuperAdminCalendar: React.FC = () => {
  return (
    <UniversalCalendar 
      userRole="super-admin" 
      initialEvents={sampleEvents}
    />
  );
};

export default SuperAdminCalendar;
