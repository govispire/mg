export type MentorStudentStatus = 'excellent' | 'on-track' | 'needs-attention';

export interface MentorStudent {
  id: number;
  name: string;
  initials: string;
  exam: string;
  progress: number;
  attendance: number;
  avgScore: number;
  tasksCompleted: number;
  totalTasks: number;
  streak: number;
  risk: 'low' | 'medium' | 'high';
  status: MentorStudentStatus;
  weakArea: string;
  strongArea: string;
  lastActive: string;
  nextSession: string;
}

export interface MentorSession {
  id: number;
  student: string;
  exam: string;
  topic: string;
  date: string;
  time: string;
  duration: string;
  type: 'one-on-one' | 'group' | 'doubt-clearing' | 'review';
  status: 'confirmed' | 'pending' | 'completed';
  notes: string;
}

export interface MentorAlert {
  student: string;
  issue: string;
  action: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AvailabilitySlot {
  day: string;
  slots: string[];
  booked: number;
}

export const mentorStudents: MentorStudent[] = [
  {
    id: 1,
    name: 'Rahul Sharma',
    initials: 'RS',
    exam: 'IBPS PO',
    progress: 85,
    attendance: 92,
    avgScore: 78,
    tasksCompleted: 17,
    totalTasks: 20,
    streak: 12,
    risk: 'low',
    status: 'excellent',
    weakArea: 'Data Interpretation',
    strongArea: 'Reasoning',
    lastActive: '2 hours ago',
    nextSession: 'Today, 10:00 AM',
  },
  {
    id: 2,
    name: 'Priya Patel',
    initials: 'PP',
    exam: 'SSC CGL',
    progress: 74,
    attendance: 86,
    avgScore: 71,
    tasksCompleted: 13,
    totalTasks: 18,
    streak: 8,
    risk: 'medium',
    status: 'on-track',
    weakArea: 'Geometry',
    strongArea: 'English',
    lastActive: '4 hours ago',
    nextSession: 'Today, 2:00 PM',
  },
  {
    id: 3,
    name: 'Amit Kumar',
    initials: 'AK',
    exam: 'UPSC CSE',
    progress: 61,
    attendance: 68,
    avgScore: 58,
    tasksCompleted: 8,
    totalTasks: 16,
    streak: 3,
    risk: 'high',
    status: 'needs-attention',
    weakArea: 'Polity',
    strongArea: 'Current Affairs',
    lastActive: '1 day ago',
    nextSession: 'Tomorrow, 4:00 PM',
  },
  {
    id: 4,
    name: 'Sneha Gupta',
    initials: 'SG',
    exam: 'SBI Clerk',
    progress: 91,
    attendance: 96,
    avgScore: 84,
    tasksCompleted: 22,
    totalTasks: 24,
    streak: 19,
    risk: 'low',
    status: 'excellent',
    weakArea: 'Reading Comprehension',
    strongArea: 'Quantitative Aptitude',
    lastActive: '30 minutes ago',
    nextSession: 'Friday, 11:00 AM',
  },
  {
    id: 5,
    name: 'Karthik Menon',
    initials: 'KM',
    exam: 'IBPS Clerk',
    progress: 69,
    attendance: 78,
    avgScore: 66,
    tasksCompleted: 11,
    totalTasks: 17,
    streak: 5,
    risk: 'medium',
    status: 'on-track',
    weakArea: 'Puzzle Sets',
    strongArea: 'Banking Awareness',
    lastActive: '6 hours ago',
    nextSession: 'Saturday, 9:30 AM',
  },
];

export const mentorSessions: MentorSession[] = [
  {
    id: 1,
    student: 'Rahul Sharma',
    exam: 'IBPS PO',
    topic: 'Quant review and speed strategy',
    date: 'Today',
    time: '10:00 AM',
    duration: '45 min',
    type: 'review',
    status: 'confirmed',
    notes: 'Discuss DI mistakes from mock test 14.',
  },
  {
    id: 2,
    student: 'Priya Patel',
    exam: 'SSC CGL',
    topic: 'Geometry doubt clearing',
    date: 'Today',
    time: '2:00 PM',
    duration: '60 min',
    type: 'doubt-clearing',
    status: 'confirmed',
    notes: 'Bring formula sheet and last two tests.',
  },
  {
    id: 3,
    student: 'Amit Kumar',
    exam: 'UPSC CSE',
    topic: 'Weekly recovery plan',
    date: 'Tomorrow',
    time: '4:00 PM',
    duration: '30 min',
    type: 'one-on-one',
    status: 'pending',
    notes: 'Focus on missed tasks and study calendar reset.',
  },
  {
    id: 4,
    student: 'Group Batch A',
    exam: 'Banking Exams',
    topic: 'Live mock debrief',
    date: 'Friday',
    time: '6:00 PM',
    duration: '75 min',
    type: 'group',
    status: 'confirmed',
    notes: 'Review section-wise timing and top mistakes.',
  },
];

export const mentorAlerts: MentorAlert[] = [
  {
    student: 'Amit Kumar',
    issue: 'Missed 4 of last 7 assigned tasks',
    action: 'Schedule recovery call',
    severity: 'high',
  },
  {
    student: 'Karthik Menon',
    issue: 'Puzzle accuracy down 11 percent this week',
    action: 'Assign targeted practice set',
    severity: 'medium',
  },
  {
    student: 'Priya Patel',
    issue: 'Geometry attempts are slow despite good accuracy',
    action: 'Share timed drill',
    severity: 'medium',
  },
];

export const availabilitySlots: AvailabilitySlot[] = [
  { day: 'Mon', slots: ['9:00 AM', '11:00 AM', '4:00 PM'], booked: 2 },
  { day: 'Tue', slots: ['10:00 AM', '2:00 PM', '5:00 PM'], booked: 3 },
  { day: 'Wed', slots: ['9:30 AM', '1:00 PM', '6:00 PM'], booked: 1 },
  { day: 'Thu', slots: ['10:30 AM', '3:00 PM', '7:00 PM'], booked: 2 },
  { day: 'Fri', slots: ['9:00 AM', '12:00 PM', '6:00 PM'], booked: 2 },
  { day: 'Sat', slots: ['9:30 AM', '11:30 AM'], booked: 1 },
];

export const weeklyAnalytics = [
  { label: 'Mon', sessions: 4, tasks: 16, score: 70 },
  { label: 'Tue', sessions: 5, tasks: 19, score: 73 },
  { label: 'Wed', sessions: 3, tasks: 14, score: 71 },
  { label: 'Thu', sessions: 6, tasks: 22, score: 76 },
  { label: 'Fri', sessions: 4, tasks: 20, score: 78 },
  { label: 'Sat', sessions: 2, tasks: 11, score: 80 },
];

export const subjectPerformance = [
  { subject: 'Reasoning', score: 82, trend: '+6%' },
  { subject: 'Quantitative Aptitude', score: 74, trend: '+3%' },
  { subject: 'English', score: 69, trend: '+2%' },
  { subject: 'General Awareness', score: 63, trend: '-4%' },
  { subject: 'Current Affairs', score: 77, trend: '+8%' },
];

export const getRiskClasses = (risk: MentorStudent['risk']) => {
  switch (risk) {
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'medium':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
};

export const getSessionStatusClasses = (status: MentorSession['status']) => {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-700';
    case 'completed':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-amber-100 text-amber-700';
  }
};
