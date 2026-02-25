
export interface MentorSession {
  id: string;
  date: string;
  time: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  topic: string;
}

export interface MentorProgress {
  totalSessions: number;
  completedSessions: number;
  progressPercentage: number;
  weeklyTarget: number;
  weeklyCompleted: number;
}

export interface RecentUpdate {
  id: string;
  type: 'message' | 'session' | 'progress' | 'assignment';
  content: string;
  timestamp: string;
  isUnread?: boolean;
}

export interface EnhancedMentor {
  id: number;
  name: string;
  qualification: string;
  experience: string;
  rating: number;
  reviews: number;
  price: number;
  subjects: string[];
  avatar: string;
  languages: string[];
  availability: string[];
  categoryId: string;
  bio: string;
  
  // Enhanced fields for "Your Mentors" page
  status: 'active' | 'completed';
  progress: MentorProgress;
  sessions: MentorSession[];
  recentUpdates: RecentUpdate[];
  unreadMessages: number;
  lastMessageTime: string;
  nextSession?: MentorSession;
  packageType: 'Basic' | 'Premium' | 'Elite';
  joinDate: string;
  isWishlisted: boolean;
  mentorshipEndDate?: string;
}

export const enhancedMentors: EnhancedMentor[] = [
  {
    id: 1,
    name: 'Dr. Rajesh Kumar',
    qualification: 'M.A. Economics, UPSC CSE 2015',
    experience: '8+ years',
    rating: 4.9,
    reviews: 1247,
    price: 2000,
    subjects: ['General Studies', 'Current Affairs', 'Economics'],
    avatar: '/placeholder.svg',
    languages: ['Hindi', 'English'],
    availability: ['Monday', 'Wednesday', 'Friday'],
    categoryId: 'upsc',
    bio: 'Former IAS officer with extensive experience in guiding UPSC aspirants.',
    status: 'active',
    progress: {
      totalSessions: 20,
      completedSessions: 12,
      progressPercentage: 60,
      weeklyTarget: 3,
      weeklyCompleted: 2
    },
    sessions: [
      {
        id: 's1',
        date: '2024-01-15',
        time: '10:00 AM',
        duration: 60,
        status: 'upcoming',
        topic: 'Current Affairs Discussion'
      }
    ],
    recentUpdates: [
      {
        id: 'u1',
        type: 'message',
        content: 'Shared study material for next session',
        timestamp: '2 hours ago',
        isUnread: true
      },
      {
        id: 'u2',
        type: 'session',
        content: 'Completed Mock Test Analysis session',
        timestamp: '1 day ago'
      }
    ],
    unreadMessages: 3,
    lastMessageTime: '2 hours ago',
    nextSession: {
      id: 's1',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: 60,
      status: 'upcoming',
      topic: 'Current Affairs Discussion'
    },
    packageType: 'Premium',
    joinDate: '2023-11-15',
    isWishlisted: true
  },
  {
    id: 2,
    name: 'Priya Sharma',
    qualification: 'M.Com, SBI PO 2018',
    experience: '6+ years',
    rating: 4.8,
    reviews: 892,
    price: 1500,
    subjects: ['Quantitative Aptitude', 'Reasoning', 'Banking Awareness'],
    avatar: '/placeholder.svg',
    languages: ['Hindi', 'English', 'Punjabi'],
    availability: ['Tuesday', 'Thursday', 'Saturday'],
    categoryId: 'banking-insurance',
    bio: 'Banking professional with proven track record in competitive exam guidance.',
    status: 'active',
    progress: {
      totalSessions: 15,
      completedSessions: 8,
      progressPercentage: 53,
      weeklyTarget: 2,
      weeklyCompleted: 1
    },
    sessions: [
      {
        id: 's2',
        date: '2024-01-16',
        time: '2:00 PM',
        duration: 90,
        status: 'upcoming',
        topic: 'Quantitative Aptitude Practice'
      }
    ],
    recentUpdates: [
      {
        id: 'u3',
        type: 'assignment',
        content: 'New practice set assigned',
        timestamp: '1 day ago',
        isUnread: true
      }
    ],
    unreadMessages: 1,
    lastMessageTime: '1 day ago',
    nextSession: {
      id: 's2',
      date: '2024-01-16',
      time: '2:00 PM',
      duration: 90,
      status: 'upcoming',
      topic: 'Quantitative Aptitude Practice'
    },
    packageType: 'Basic',
    joinDate: '2023-12-01',
    isWishlisted: false
  },
  {
    id: 3,
    name: 'Amit Singh',
    qualification: 'B.Tech, SSC CGL 2019',
    experience: '5+ years',
    rating: 4.7,
    reviews: 654,
    price: 1200,
    subjects: ['Mathematics', 'General Science', 'English'],
    avatar: '/placeholder.svg',
    languages: ['Hindi', 'English'],
    availability: ['Monday', 'Tuesday', 'Thursday'],
    categoryId: 'ssc',
    bio: 'SSC expert helping students crack government job exams with strategic preparation.',
    status: 'completed',
    progress: {
      totalSessions: 25,
      completedSessions: 25,
      progressPercentage: 100,
      weeklyTarget: 0,
      weeklyCompleted: 0
    },
    sessions: [],
    recentUpdates: [
      {
        id: 'u4',
        type: 'progress',
        content: 'Mentorship program completed successfully',
        timestamp: '1 week ago'
      }
    ],
    unreadMessages: 0,
    lastMessageTime: '1 week ago',
    packageType: 'Elite',
    joinDate: '2023-09-01',
    mentorshipEndDate: '2024-01-01',
    isWishlisted: true
  }
];
