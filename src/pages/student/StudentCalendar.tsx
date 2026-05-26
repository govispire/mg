
import React, { useMemo } from 'react';
import UniversalCalendar from '@/components/calendar/UniversalCalendar';
import { CalendarEvent } from '@/components/student/calendar/types';
import { useAllExamStages } from '@/hooks/useExamStages';
import { useTargetExams } from '@/hooks/useTargetExams';

// ─── Sample static study events ───────────────────────────────────────────────

const staticEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Mock Test - Banking Awareness',
    description: 'Practice section for IBPS PO',
    date: new Date(2026, 2, 12),
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
    date: new Date(2026, 2, 14),
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
    date: new Date(2026, 2, 18),
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
    date: new Date(2026, 2, 25),
    time: '11:00',
    category: 'practice',
    priority: 'medium',
    status: 'pending',
    taskType: 'practice',
    completed: false,
    images: []
  }
];

// ─── Component ────────────────────────────────────────────────────────────────

const StudentCalendar: React.FC = () => {
  const { allStages } = useAllExamStages();
  const { targetExams } = useTargetExams();

  // Convert live exam stages → CalendarEvents
  const stageEvents: CalendarEvent[] = useMemo(() => {
    return allStages
      .filter(stage => stage.isVisible && stage.date)
      .map(stage => ({
        id: `stage_${stage.id}`,
        title: `📅 ${stage.name}`,
        description: stage.notes || `Exam stage: ${stage.name}`,
        date: new Date(stage.date!),
        time: '09:00',
        category: 'exam' as const,
        priority: 'high' as const,
        status: stage.status === 'completed' ? 'completed' as const : 'pending' as const,
        taskType: 'exam' as const,
        completed: stage.status === 'completed',
        images: [],
        ...(stage.link ? { attachmentUrl: stage.link } : {}),
      }));
  }, [allStages]);

  const allEvents = useMemo(() => [...staticEvents, ...stageEvents], [stageEvents]);

  return (
    <UniversalCalendar 
      userRole="student" 
      initialEvents={allEvents}
    />
  );
};

export default StudentCalendar;

