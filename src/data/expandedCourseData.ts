
export interface CategoryVideo {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  categoryId: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topic: string;
  isWatched?: boolean;
}

export interface CategoryCourse {
  id: string;
  title: string;
  instructor: string;
  categoryId: string;
  subjects: string[];
  thumbnail: string;
  rating: number;
  studentsCount: number;
  price: number;
  originalPrice?: number;
  duration: string;
  chaptersCount: number;
  videosCount: number;
  type: 'Live' | 'Recorded' | 'Hybrid';
  isTrending?: boolean;
  progress?: number;
}

// Category-specific video content
export const categoryVideos: CategoryVideo[] = [
  // UPSC Videos
  {
    id: 'upsc-v1',
    title: 'Indian Polity - Constitutional Framework',
    duration: '45:30',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
    categoryId: 'upsc',
    difficulty: 'Beginner',
    topic: 'Polity',
    isWatched: false
  },
  {
    id: 'upsc-v2',
    title: 'Indian Economy - Budget Analysis 2024',
    duration: '52:15',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
    categoryId: 'upsc',
    difficulty: 'Intermediate',
    topic: 'Economics',
    isWatched: false
  },
  {
    id: 'upsc-v3',
    title: 'Modern History - Freedom Struggle',
    duration: '38:45',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
    categoryId: 'upsc',
    difficulty: 'Intermediate',
    topic: 'History',
    isWatched: true
  },
  {
    id: 'upsc-v4',
    title: 'Geography - Climate and Weather',
    duration: '41:20',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
    categoryId: 'upsc',
    difficulty: 'Beginner',
    topic: 'Geography',
    isWatched: false
  },
  {
    id: 'upsc-v5',
    title: 'Current Affairs - Weekly Roundup',
    duration: '28:30',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
    categoryId: 'upsc',
    difficulty: 'Beginner',
    topic: 'Current Affairs',
    isWatched: false
  },

  // Banking Videos
  {
    id: 'banking-v1',
    title: 'Banking Awareness - RBI Functions',
    duration: '35:15',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
    categoryId: 'banking-insurance',
    difficulty: 'Beginner',
    topic: 'Banking Awareness',
    isWatched: false
  },
  {
    id: 'banking-v2',
    title: 'Quantitative Aptitude - Profit & Loss',
    duration: '42:30',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
    categoryId: 'banking-insurance',
    difficulty: 'Intermediate',
    topic: 'Quantitative Aptitude',
    isWatched: true
  },
  {
    id: 'banking-v3',
    title: 'Reasoning - Seating Arrangement',
    duration: '38:45',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
    categoryId: 'banking-insurance',
    difficulty: 'Advanced',
    topic: 'Reasoning',
    isWatched: false
  },
  {
    id: 'banking-v4',
    title: 'Computer Knowledge - MS Office',
    duration: '33:20',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
    categoryId: 'banking-insurance',
    difficulty: 'Beginner',
    topic: 'Computer Knowledge',
    isWatched: false
  },
  {
    id: 'banking-v5',
    title: 'English Language - Reading Comprehension',
    duration: '29:15',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
    categoryId: 'banking-insurance',
    difficulty: 'Intermediate',
    topic: 'English',
    isWatched: false
  },

  // SSC Videos
  {
    id: 'ssc-v1',
    title: 'Mathematics - Algebra Basics',
    duration: '40:30',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
    categoryId: 'ssc',
    difficulty: 'Beginner',
    topic: 'Mathematics',
    isWatched: false
  },
  {
    id: 'ssc-v2',
    title: 'General Science - Physics Laws',
    duration: '36:45',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
    categoryId: 'ssc',
    difficulty: 'Intermediate',
    topic: 'General Science',
    isWatched: true
  },
  {
    id: 'ssc-v3',
    title: 'Reasoning - Logical Sequences',
    duration: '32:15',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
    categoryId: 'ssc',
    difficulty: 'Beginner',
    topic: 'Reasoning',
    isWatched: false
  },
  {
    id: 'ssc-v4',
    title: 'English - Grammar Fundamentals',
    duration: '28:30',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
    categoryId: 'ssc',
    difficulty: 'Beginner',
    topic: 'English',
    isWatched: false
  },
  {
    id: 'ssc-v5',
    title: 'General Knowledge - Indian Constitution',
    duration: '44:20',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
    categoryId: 'ssc',
    difficulty: 'Intermediate',
    topic: 'General Knowledge',
    isWatched: false
  },

  // Railway Videos
  {
    id: 'railway-v1',
    title: 'Technical Ability - Mechanical Engineering',
    duration: '48:15',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
    categoryId: 'railway',
    difficulty: 'Advanced',
    topic: 'Technical Ability',
    isWatched: false
  },
  {
    id: 'railway-v2',
    title: 'General Awareness - Railway History',
    duration: '35:30',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
    categoryId: 'railway',
    difficulty: 'Beginner',
    topic: 'General Awareness',
    isWatched: true
  },
  {
    id: 'railway-v3',
    title: 'Mathematics - Speed, Time & Distance',
    duration: '42:45',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
    categoryId: 'railway',
    difficulty: 'Intermediate',
    topic: 'Mathematics',
    isWatched: false
  },
  {
    id: 'railway-v4',
    title: 'Reasoning - Coding-Decoding',
    duration: '31:20',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
    categoryId: 'railway',
    difficulty: 'Intermediate',
    topic: 'Reasoning',
    isWatched: false
  },
  {
    id: 'railway-v5',
    title: 'Current Affairs - Transportation Sector',
    duration: '26:15',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
    categoryId: 'railway',
    difficulty: 'Beginner',
    topic: 'Current Affairs',
    isWatched: false
  },

  // CAT/MBA Videos
  {
    id: 'cat-v1',
    title: 'Quantitative Aptitude - Advanced Algebra',
    duration: '55:30',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062183/mba_dh3xto.png',
    categoryId: 'cat',
    difficulty: 'Advanced',
    topic: 'Quantitative Aptitude',
    isWatched: false
  },
  {
    id: 'cat-v2',
    title: 'Verbal Ability - Reading Comprehension',
    duration: '47:15',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062183/mba_dh3xto.png',
    categoryId: 'cat',
    difficulty: 'Intermediate',
    topic: 'Verbal Ability',
    isWatched: true
  },
  {
    id: 'cat-v3',
    title: 'Data Interpretation - Charts & Graphs',
    duration: '52:45',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062183/mba_dh3xto.png',
    categoryId: 'cat',
    difficulty: 'Advanced',
    topic: 'Data Interpretation',
    isWatched: false
  },
  {
    id: 'cat-v4',
    title: 'Logical Reasoning - Critical Reasoning',
    duration: '43:20',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062183/mba_dh3xto.png',
    categoryId: 'cat',
    difficulty: 'Advanced',
    topic: 'Logical Reasoning',
    isWatched: false
  },
  {
    id: 'cat-v5',
    title: 'General Knowledge - Business Awareness',
    duration: '38:15',
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062183/mba_dh3xto.png',
    categoryId: 'cat',
    difficulty: 'Intermediate',
    topic: 'General Knowledge',
    isWatched: false
  }
];

// Category-specific courses
export const categoryCourses: CategoryCourse[] = [
  // UPSC Courses
  {
    id: 'upsc-course-1',
    title: 'Complete UPSC Prelims 2024',
    instructor: 'Dr. Rajesh Kumar',
    categoryId: 'upsc',
    subjects: ['History', 'Geography', 'Polity', 'Economics', 'Environment'],
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
    rating: 4.8,
    studentsCount: 15420,
    price: 12999,
    originalPrice: 19999,
    duration: '120 hours',
    chaptersCount: 45,
    videosCount: 180,
    type: 'Hybrid',
    isTrending: true
  },
  {
    id: 'upsc-course-2',
    title: 'UPSC Mains Essay & Ethics',
    instructor: 'Dr. Priya Verma',
    categoryId: 'upsc',
    subjects: ['Essay Writing', 'Ethics', 'Case Studies'],
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
    rating: 4.9,
    studentsCount: 8900,
    price: 8999,
    originalPrice: 12999,
    duration: '80 hours',
    chaptersCount: 25,
    videosCount: 95,
    type: 'Live',
    isTrending: false
  },

  // Banking Courses
  {
    id: 'banking-course-1',
    title: 'IBPS PO Complete Course 2024',
    instructor: 'Priya Sharma',
    categoryId: 'banking-insurance',
    subjects: ['Quantitative Aptitude', 'Reasoning', 'English', 'Banking Awareness'],
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
    rating: 4.7,
    studentsCount: 22500,
    price: 7999,
    originalPrice: 11999,
    duration: '100 hours',
    chaptersCount: 35,
    videosCount: 150,
    type: 'Hybrid',
    isTrending: true
  },
  {
    id: 'banking-course-2',
    title: 'SBI Clerk Crash Course',
    instructor: 'Rajesh Agarwal',
    categoryId: 'banking-insurance',
    subjects: ['Numerical Ability', 'Reasoning', 'English', 'General Awareness'],
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
    rating: 4.6,
    studentsCount: 18700,
    price: 4999,
    originalPrice: 7999,
    duration: '60 hours',
    chaptersCount: 20,
    videosCount: 85,
    type: 'Recorded',
    isTrending: false
  },

  // SSC Courses
  {
    id: 'ssc-course-1',
    title: 'SSC CGL Complete Preparation',
    instructor: 'Amit Singh',
    categoryId: 'ssc',
    subjects: ['Mathematics', 'Reasoning', 'English', 'General Studies'],
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
    rating: 4.5,
    studentsCount: 28900,
    price: 5999,
    originalPrice: 9999,
    duration: '90 hours',
    chaptersCount: 30,
    videosCount: 120,
    type: 'Hybrid',
    isTrending: true
  },
  {
    id: 'ssc-course-2',
    title: 'SSC CHSL Foundation Course',
    instructor: 'Sunita Devi',
    categoryId: 'ssc',
    subjects: ['English', 'General Intelligence', 'Quantitative Aptitude', 'General Awareness'],
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
    rating: 4.4,
    studentsCount: 16800,
    price: 3999,
    originalPrice: 6999,
    duration: '70 hours',
    chaptersCount: 25,
    videosCount: 90,
    type: 'Recorded',
    isTrending: false
  },

  // Railway Courses
  {
    id: 'railway-course-1',
    title: 'RRB NTPC Complete Course',
    instructor: 'Rakesh Sharma',
    categoryId: 'railway',
    subjects: ['General Awareness', 'Mathematics', 'Reasoning', 'General Science'],
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
    rating: 4.6,
    studentsCount: 19500,
    price: 6999,
    originalPrice: 10999,
    duration: '85 hours',
    chaptersCount: 28,
    videosCount: 110,
    type: 'Hybrid',
    isTrending: true
  },
  {
    id: 'railway-course-2',
    title: 'RRB Group D Preparation',
    instructor: 'Sushma Devi',
    categoryId: 'railway',
    subjects: ['General Science', 'Mathematics', 'Reasoning', 'General Awareness'],
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
    rating: 4.3,
    studentsCount: 24600,
    price: 3999,
    originalPrice: 6999,
    duration: '65 hours',
    chaptersCount: 22,
    videosCount: 80,
    type: 'Recorded',
    isTrending: false
  },

  // CAT/MBA Courses
  {
    id: 'cat-course-1',
    title: 'CAT 2024 Complete Preparation',
    instructor: 'Dr. Arjun Malhotra',
    categoryId: 'cat',
    subjects: ['Quantitative Aptitude', 'Verbal Ability', 'Data Interpretation', 'Logical Reasoning'],
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062183/mba_dh3xto.png',
    rating: 4.9,
    studentsCount: 12800,
    price: 18999,
    originalPrice: 24999,
    duration: '150 hours',
    chaptersCount: 50,
    videosCount: 200,
    type: 'Live',
    isTrending: true
  },
  {
    id: 'cat-course-2',
    title: 'XAT & SNAP Preparation',
    instructor: 'Priya Agarwal',
    categoryId: 'cat',
    subjects: ['Verbal Ability', 'Quantitative Ability', 'General Knowledge', 'Decision Making'],
    thumbnail: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062183/mba_dh3xto.png',
    rating: 4.7,
    studentsCount: 8900,
    price: 14999,
    originalPrice: 19999,
    duration: '120 hours',
    chaptersCount: 40,
    videosCount: 160,
    type: 'Hybrid',
    isTrending: false
  }
];

// Utility functions for filtering content
export const getVideosByCategory = (categoryId: string): CategoryVideo[] => {
  return categoryVideos.filter(video => video.categoryId === categoryId);
};

export const getCoursesByCategory = (categoryId: string): CategoryCourse[] => {
  return categoryCourses.filter(course => course.categoryId === categoryId);
};

export const getVideosByCategories = (categoryIds: string[]): CategoryVideo[] => {
  if (categoryIds.length === 0) return categoryVideos;
  return categoryVideos.filter(video => categoryIds.includes(video.categoryId));
};

export const getCoursesByCategories = (categoryIds: string[]): CategoryCourse[] => {
  if (categoryIds.length === 0) return categoryCourses;
  return categoryCourses.filter(course => categoryIds.includes(course.categoryId));
};

export const getContentStatsByCategory = (categoryId: string) => {
  const videos = getVideosByCategory(categoryId);
  const courses = getCoursesByCategory(categoryId);
  
  return {
    videoCount: videos.length,
    courseCount: courses.length,
    watchedVideos: videos.filter(v => v.isWatched).length,
    totalDuration: videos.reduce((total, video) => {
      const [minutes, seconds] = video.duration.split(':').map(Number);
      return total + minutes + (seconds / 60);
    }, 0)
  };
};
