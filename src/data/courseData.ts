export interface Instructor {
  id: string;
  name: string;
  specialization: string;
  avatar: string;
  experience: string;
  studentsCount: number;
  coursesCount: number;
  rating: number;
  courses: string[];
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorId: string;
  category: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  rating: number;
  studentsCount: number;
  duration: string;
  isPopular: boolean;
  isTrending: boolean;
  type: 'Prelims' | 'Mains' | 'Interview' | 'Complete';
  subjects: string[];
  chaptersCount: number;
  videosCount: number;
  testsCount: number;
  progress?: number;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  chaptersCount: number;
  videosCount: number;
  testsCount: number;
  progress: number;
  color: string;
}

export interface Chapter {
  id: string;
  title: string;
  subjectId: string;
  duration: string;
  videosCount: number;
  testsCount: number;
  progress: number;
  isCompleted: boolean;
  videos: Video[];
  tests: Test[];
}

export interface Video {
  id: string;
  title: string;
  duration: string;
  isWatched: boolean;
  thumbnail: string;
}

export interface Test {
  id: string;
  title: string;
  questionsCount: number;
  duration: string;
  isCompleted: boolean;
  score?: number;
}

export const courseCategories = [
  { id: 'all', name: 'All Courses' },
  { id: 'banking', name: 'Banking' },
  { id: 'ssc', name: 'SSC' },
  { id: 'railway', name: 'Railway' },
  { id: 'upsc', name: 'UPSC' },
  { id: 'tnpsc', name: 'TNPSC' },
  { id: 'defence', name: 'Defence' }
];

export const instructors: Instructor[] = [
  {
    id: 'rajesh-kumar',
    name: 'Rajesh Kumar',
    specialization: 'Banking & Insurance Expert',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    experience: '8+ Years',
    studentsCount: 15420,
    coursesCount: 12,
    rating: 4.8,
    courses: ['banking-complete', 'ibps-po', 'sbi-clerk']
  },
  {
    id: 'priya-singh',
    name: 'Priya Singh',
    specialization: 'SSC & Government Exams',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b776?w=400&h=400&fit=crop&crop=face',
    experience: '6+ Years',
    studentsCount: 12350,
    coursesCount: 8,
    rating: 4.7,
    courses: ['ssc-complete', 'ssc-cgl', 'ssc-chsl']
  },
  {
    id: 'amit-sharma',
    name: 'Amit Sharma',
    specialization: 'Railway & Technical Exams',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    experience: '10+ Years',
    studentsCount: 9870,
    coursesCount: 6,
    rating: 4.9,
    courses: ['railway-complete', 'rrb-ntpc', 'rrb-group-d']
  }
];

export const courses: Course[] = [
  {
    id: 'banking-complete',
    title: 'Banking Complete Course 2025',
    instructor: 'Rajesh Kumar',
    instructorId: 'rajesh-kumar',
    category: 'banking',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop',
    price: 2999,
    originalPrice: 4999,
    rating: 4.8,
    studentsCount: 15420,
    duration: '6 Months',
    isPopular: true,
    isTrending: true,
    type: 'Complete',
    subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'],
    chaptersCount: 45,
    videosCount: 180,
    testsCount: 60,
    progress: 65
  },
  {
    id: 'ibps-po-prelims',
    title: 'IBPS PO Prelims Course',
    instructor: 'Rajesh Kumar',
    instructorId: 'rajesh-kumar',
    category: 'banking',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
    price: 1499,
    rating: 4.7,
    studentsCount: 8930,
    duration: '3 Months',
    isPopular: true,
    isTrending: false,
    type: 'Prelims',
    subjects: ['english', 'quantitative', 'reasoning'],
    chaptersCount: 25,
    videosCount: 100,
    testsCount: 30,
    progress: 32
  },
  {
    id: 'sbi-clerk-complete',
    title: 'SBI Clerk Complete Course',
    instructor: 'Rajesh Kumar',
    instructorId: 'rajesh-kumar',
    category: 'banking',
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
    price: 2499,
    originalPrice: 3999,
    rating: 4.6,
    studentsCount: 12100,
    duration: '4 Months',
    isPopular: false,
    isTrending: true,
    type: 'Complete',
    subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'],
    chaptersCount: 35,
    videosCount: 140,
    testsCount: 45,
    progress: 12
  },
  {
    id: 'ssc-complete',
    title: 'SSC CGL Complete Course',
    instructor: 'Priya Singh',
    instructorId: 'priya-singh',
    category: 'ssc',
    thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop',
    price: 2799,
    rating: 4.7,
    studentsCount: 11250,
    duration: '5 Months',
    isPopular: true,
    isTrending: false,
    type: 'Complete',
    subjects: ['english', 'quantitative', 'reasoning', 'general-studies'],
    chaptersCount: 40,
    videosCount: 160,
    testsCount: 50,
    progress: 85
  },
  {
    id: 'railway-complete',
    title: 'Railway NTPC Complete Course',
    instructor: 'Amit Sharma',
    instructorId: 'amit-sharma',
    category: 'railway',
    thumbnail: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=400&fit=crop',
    price: 2299,
    rating: 4.9,
    studentsCount: 9870,
    duration: '4 Months',
    isPopular: true,
    isTrending: true,
    type: 'Complete',
    subjects: ['mathematics', 'reasoning', 'general-awareness', 'general-science'],
    chaptersCount: 32,
    videosCount: 128,
    testsCount: 40,
    progress: 0
  },
  {
    id: 'upsc-prelims',
    title: 'UPSC Prelims Foundation',
    instructor: 'Dr. Meera Joshi',
    instructorId: 'meera-joshi',
    category: 'upsc',
    thumbnail: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=400&fit=crop',
    price: 3999,
    rating: 4.8,
    studentsCount: 7650,
    duration: '8 Months',
    isPopular: false,
    isTrending: false,
    type: 'Prelims',
    subjects: ['history', 'geography', 'polity', 'economics', 'environment'],
    chaptersCount: 60,
    videosCount: 240,
    testsCount: 80,
    progress: 0
  },
  // Dummy courses for all banking exams (temporary)
  { id: 'sbi-po', title: 'SBI PO Complete Course 2025', instructor: 'Rajesh Kumar', instructorId: 'rajesh-kumar', category: 'banking', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.5, studentsCount: 5000, duration: '3 Months', isPopular: true, isTrending: true, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'sbi-clerk', title: 'SBI Clerk Complete Course 2025', instructor: 'Priya Singh', instructorId: 'priya-singh', category: 'banking', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.6, studentsCount: 4800, duration: '3 Months', isPopular: true, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'ibps-rrb-officer', title: 'IBPS RRB Officer Course 2025', instructor: 'Amit Sharma', instructorId: 'amit-sharma', category: 'banking', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.7, studentsCount: 4700, duration: '3 Months', isPopular: true, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'ibps-rrb-assistant', title: 'IBPS RRB Assistant Course 2025', instructor: 'Rajesh Kumar', instructorId: 'rajesh-kumar', category: 'banking', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.5, studentsCount: 4600, duration: '3 Months', isPopular: true, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'ibps-po', title: 'IBPS PO Complete Course 2025', instructor: 'Rajesh Kumar', instructorId: 'rajesh-kumar', category: 'banking', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.5, studentsCount: 4500, duration: '3 Months', isPopular: true, isTrending: true, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'ibps-clerk', title: 'IBPS Clerk Complete Course 2025', instructor: 'Priya Singh', instructorId: 'priya-singh', category: 'banking', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.6, studentsCount: 4400, duration: '3 Months', isPopular: true, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'tmb', title: 'Tamilnad Mercantile Bank Course 2025', instructor: 'Rajesh Kumar', instructorId: 'rajesh-kumar', category: 'banking', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.5, studentsCount: 4300, duration: '3 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'uco-bank-lbo', title: 'UCO Bank LBO Course 2025', instructor: 'Amit Sharma', instructorId: 'amit-sharma', category: 'banking', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.7, studentsCount: 4200, duration: '3 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'central-bank-pgdbf', title: 'Central Bank of India PGDBF Course 2025', instructor: 'Rajesh Kumar', instructorId: 'rajesh-kumar', category: 'banking', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.5, studentsCount: 4100, duration: '3 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'idbi-jam-pgdbf', title: 'IDBI JAM PGDBF Course 2025', instructor: 'Rajesh Kumar', instructorId: 'rajesh-kumar', category: 'banking', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.5, studentsCount: 4000, duration: '3 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'niacl-assistant', title: 'NIACL Assistant Course 2025', instructor: 'Priya Singh', instructorId: 'priya-singh', category: 'banking', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.6, studentsCount: 3900, duration: '3 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'nicl-assistant', title: 'NICL Assistant Course 2025', instructor: 'Rajesh Kumar', instructorId: 'rajesh-kumar', category: 'banking', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.5, studentsCount: 3800, duration: '3 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  // SSC Courses
  { id: 'ssc-cgl', title: 'SSC CGL Complete Course 2025', instructor: 'Priya Singh', instructorId: 'priya-singh', category: 'ssc', thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop', price: 2199, originalPrice: 3999, rating: 4.7, studentsCount: 8500, duration: '4 Months', isPopular: true, isTrending: true, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 35, videosCount: 140, testsCount: 45, progress: 0 },
  { id: 'ssc-chsl', title: 'SSC CHSL Complete Course 2025', instructor: 'Priya Singh', instructorId: 'priya-singh', category: 'ssc', thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop', price: 1999, originalPrice: 3499, rating: 4.6, studentsCount: 7200, duration: '3 Months', isPopular: true, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'ssc-mts', title: 'SSC MTS Complete Course 2025', instructor: 'Priya Singh', instructorId: 'priya-singh', category: 'ssc', thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop', price: 1799, originalPrice: 2999, rating: 4.5, studentsCount: 6800, duration: '3 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 28, videosCount: 110, testsCount: 35, progress: 0 },
  { id: 'ssc-gd', title: 'SSC GD Complete Course 2025', instructor: 'Amit Sharma', instructorId: 'amit-sharma', category: 'ssc', thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop', price: 1799, originalPrice: 2999, rating: 4.6, studentsCount: 9200, duration: '3 Months', isPopular: true, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 28, videosCount: 110, testsCount: 35, progress: 0 },
  // Railway Courses  
  { id: 'rrb-ntpc', title: 'RRB NTPC Complete Course 2025', instructor: 'Amit Sharma', instructorId: 'amit-sharma', category: 'railway', thumbnail: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=400&fit=crop', price: 2199, originalPrice: 3999, rating: 4.8, studentsCount: 10500, duration: '4 Months', isPopular: true, isTrending: true, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 35, videosCount: 140, testsCount: 45, progress: 0 },
  { id: 'rrb-group-d', title: 'RRB Group D Complete Course 2025', instructor: 'Amit Sharma', instructorId: 'amit-sharma', category: 'railway', thumbnail: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=400&fit=crop', price: 1999, originalPrice: 3499, rating: 4.7, studentsCount: 12000, duration: '3 Months', isPopular: true, isTrending: true, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 32, videosCount: 128, testsCount: 40, progress: 0 },
  { id: 'rrb-alp', title: 'RRB ALP Complete Course 2025', instructor: 'Amit Sharma', instructorId: 'amit-sharma', category: 'railway', thumbnail: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=400&fit=crop', price: 2199, originalPrice: 3999, rating: 4.7, studentsCount: 7800, duration: '4 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 35, videosCount: 140, testsCount: 45, progress: 0 },
  { id: 'rrb-je', title: 'RRB JE Complete Course 2025', instructor: 'Amit Sharma', instructorId: 'amit-sharma', category: 'railway', thumbnail: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=400&fit=crop', price: 2499, originalPrice: 4499, rating: 4.8, studentsCount: 6500, duration: '5 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 40, videosCount: 160, testsCount: 50, progress: 0 },
];

export const subjects: { [key: string]: Subject } = {
  'english': {
    id: 'english',
    name: 'English Language',
    icon: '📝',
    chaptersCount: 8,
    videosCount: 32,
    testsCount: 12,
    progress: 75,
    color: 'bg-blue-500'
  },
  'quantitative': {
    id: 'quantitative',
    name: 'Quantitative Aptitude',
    icon: '🔢',
    chaptersCount: 12,
    videosCount: 48,
    testsCount: 18,
    progress: 60,
    color: 'bg-green-500'
  },
  'reasoning': {
    id: 'reasoning',
    name: 'Reasoning Ability',
    icon: '🧩',
    chaptersCount: 10,
    videosCount: 40,
    testsCount: 15,
    progress: 45,
    color: 'bg-purple-500'
  },
  'general-awareness': {
    id: 'general-awareness',
    name: 'General Awareness',
    icon: '🌍',
    chaptersCount: 15,
    videosCount: 60,
    testsCount: 20,
    progress: 30,
    color: 'bg-orange-500'
  },
  'computer': {
    id: 'computer',
    name: 'Computer Knowledge',
    icon: '💻',
    chaptersCount: 6,
    videosCount: 24,
    testsCount: 8,
    progress: 90,
    color: 'bg-indigo-500'
  }
};

export const chapters = [
  {
    id: 'grammar',
    title: 'Grammar',
    subjectId: 'english',
    duration: '2 hours',
    videosCount: 2,
    testsCount: 5,
    progress: 80,
    isCompleted: false,
    videos: [
      {
        id: 'basic-grammar',
        title: 'Basic Grammar Rules',
        duration: '45 min',
        isWatched: true,
        thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop'
      },
      {
        id: 'advanced-grammar',
        title: 'Advanced Grammar',
        duration: '38 min',
        isWatched: false,
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop'
      }
    ],
    tests: [
      {
        id: 'grammar-test-1',
        title: 'Grammar Test 1',
        questionsCount: 25,
        duration: '30 min',
        isCompleted: true,
        score: 85
      },
      {
        id: 'grammar-test-2',
        title: 'Grammar Test 2',
        questionsCount: 25,
        duration: '30 min',
        isCompleted: true,
        score: 90
      },
      {
        id: 'grammar-test-3',
        title: 'Grammar Test 3',
        questionsCount: 25,
        duration: '30 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'grammar-test-4',
        title: 'Grammar Test 4',
        questionsCount: 25,
        duration: '30 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'grammar-test-5',
        title: 'Grammar Test 5',
        questionsCount: 25,
        duration: '30 min',
        isCompleted: false,
        score: null
      }
    ]
  },
  {
    id: 'tense',
    title: 'Tense',
    subjectId: 'english',
    duration: '1.5 hours',
    videosCount: 2,
    testsCount: 5,
    progress: 60,
    isCompleted: false,
    videos: [
      {
        id: 'tense-basics',
        title: 'Tense Basics',
        duration: '30 min',
        isWatched: false,
        thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop'
      },
      {
        id: 'tense-advanced',
        title: 'Advanced Tense Rules',
        duration: '25 min',
        isWatched: false,
        thumbnail: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=600&h=400&fit=crop'
      }
    ],
    tests: [
      {
        id: 'tense-test-1',
        title: 'Tense Test 1',
        questionsCount: 20,
        duration: '25 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'tense-test-2',
        title: 'Tense Test 2',
        questionsCount: 20,
        duration: '25 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'tense-test-3',
        title: 'Tense Test 3',
        questionsCount: 20,
        duration: '25 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'tense-test-4',
        title: 'Tense Test 4',
        questionsCount: 20,
        duration: '25 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'tense-test-5',
        title: 'Tense Test 5',
        questionsCount: 20,
        duration: '25 min',
        isCompleted: false,
        score: null
      }
    ]
  },
  {
    id: 'articles',
    title: 'Articles',
    subjectId: 'english',
    duration: '1 hour',
    videosCount: 1,
    testsCount: 5,
    progress: 20,
    isCompleted: false,
    videos: [
      {
        id: 'articles-basics',
        title: 'Articles Usage',
        duration: '35 min',
        isWatched: false,
        thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop'
      }
    ],
    tests: [
      {
        id: 'articles-test-1',
        title: 'Articles Test 1',
        questionsCount: 15,
        duration: '20 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'articles-test-2',
        title: 'Articles Test 2',
        questionsCount: 15,
        duration: '20 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'articles-test-3',
        title: 'Articles Test 3',
        questionsCount: 15,
        duration: '20 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'articles-test-4',
        title: 'Articles Test 4',
        questionsCount: 15,
        duration: '20 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'articles-test-5',
        title: 'Articles Test 5',
        questionsCount: 15,
        duration: '20 min',
        isCompleted: false,
        score: null
      }
    ]
  },
  {
    id: 'cloze-test',
    title: 'Cloze Test',
    subjectId: 'english',
    duration: '45 min',
    videosCount: 1,
    testsCount: 5,
    progress: 0,
    isCompleted: false,
    videos: [
      {
        id: 'cloze-strategies',
        title: 'Cloze Test Strategies',
        duration: '30 min',
        isWatched: false,
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop'
      }
    ],
    tests: [
      {
        id: 'cloze-test-1',
        title: 'Cloze Test 1',
        questionsCount: 10,
        duration: '15 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'cloze-test-2',
        title: 'Cloze Test 2',
        questionsCount: 10,
        duration: '15 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'cloze-test-3',
        title: 'Cloze Test 3',
        questionsCount: 10,
        duration: '15 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'cloze-test-4',
        title: 'Cloze Test 4',
        questionsCount: 10,
        duration: '15 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'cloze-test-5',
        title: 'Cloze Test 5',
        questionsCount: 10,
        duration: '15 min',
        isCompleted: false,
        score: null
      }
    ]
  },
  {
    id: 'reading-comprehension',
    title: 'Reading Comprehension',
    subjectId: 'english',
    duration: '1 hour',
    videosCount: 1,
    testsCount: 5,
    progress: 0,
    isCompleted: false,
    videos: [
      {
        id: 'rc-strategies',
        title: 'RC Strategies',
        duration: '55 min',
        isWatched: false,
        thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop'
      }
    ],
    tests: [
      {
        id: 'rc-test-1',
        title: 'RC Test 1',
        questionsCount: 15,
        duration: '20 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'rc-test-2',
        title: 'RC Test 2',
        questionsCount: 15,
        duration: '20 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'rc-test-3',
        title: 'RC Test 3',
        questionsCount: 15,
        duration: '20 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'rc-test-4',
        title: 'RC Test 4',
        questionsCount: 15,
        duration: '20 min',
        isCompleted: false,
        score: null
      },
      {
        id: 'rc-test-5',
        title: 'RC Test 5',
        questionsCount: 15,
        duration: '20 min',
        isCompleted: false,
        score: null
      }
    ]
  }
];

export const getCoursesByCategory = (category: string): Course[] => {
  if (category === 'all') return courses;
  return courses.filter(course => course.category === category);
};

export const getCourseById = (id: string): Course | undefined => {
  return courses.find(course => course.id === id);
};

export const getInstructorById = (id: string): Instructor | undefined => {
  return instructors.find(instructor => instructor.id === id);
};

export const getCoursesByInstructor = (instructorId: string): Course[] => {
  return courses.filter(course => course.instructorId === instructorId);
};

export const getChaptersBySubject = (subjectId: string): Chapter[] => {
  return chapters.filter(chapter => chapter.subjectId === subjectId);
};

export const getAllVideosBySubject = (subjectId: string) => {
  const subjectChapters = getChaptersBySubject(subjectId);
  return subjectChapters.flatMap(chapter => chapter.videos);
};

export const getChapterById = (chapterId: string): Chapter | undefined => {
  return chapters.find(chapter => chapter.id === chapterId);
};
