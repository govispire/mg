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
  /** Sub-section header shown on the courses page (e.g. "Bank Foundation Courses") */
  subcategory: string;
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
  // ── Banking: All-in-one Subscriptions ──────────────────────────────────────
  {
    id: 'banking-complete',
    title: 'Banking Complete Course 2025',
    instructor: 'Rajesh Kumar',
    instructorId: 'rajesh-kumar',
    category: 'banking',
    subcategory: 'Bank Exam Subscriptions',
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
  // ── Banking: Foundation Courses ────────────────────────────────────────────
  {
    id: 'ibps-po-prelims',
    title: 'IBPS PO Prelims Course',
    instructor: 'Rajesh Kumar',
    instructorId: 'rajesh-kumar',
    category: 'banking',
    subcategory: 'Bank Foundation Courses',
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
  // ── Banking: SBI Clerk Courses ─────────────────────────────────────────────
  {
    id: 'sbi-clerk-complete',
    title: 'SBI Clerk Complete Course',
    instructor: 'Rajesh Kumar',
    instructorId: 'rajesh-kumar',
    category: 'banking',
    subcategory: 'SBI Clerk Courses',
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
  // ── SSC: CGL & CHSL Foundation ─────────────────────────────────────────────
  {
    id: 'ssc-complete',
    title: 'SSC CGL Complete Course',
    instructor: 'Priya Singh',
    instructorId: 'priya-singh',
    category: 'ssc',
    subcategory: 'SSC Foundation Courses',
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
  // ── Railway: Foundation ────────────────────────────────────────────────────
  {
    id: 'railway-complete',
    title: 'Railway NTPC Complete Course',
    instructor: 'Amit Sharma',
    instructorId: 'amit-sharma',
    category: 'railway',
    subcategory: 'Railway Foundation Courses',
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
  // ── UPSC: Foundation ───────────────────────────────────────────────────────
  {
    id: 'upsc-prelims',
    title: 'UPSC Prelims Foundation',
    instructor: 'Dr. Meera Joshi',
    instructorId: 'meera-joshi',
    category: 'upsc',
    subcategory: 'UPSC Foundation',
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
  // ── Banking: SBI PO ───────────────────────────────────────────────────────
  { id: 'sbi-po', title: 'SBI PO Complete Course 2025', instructor: 'Rajesh Kumar', instructorId: 'rajesh-kumar', category: 'banking', subcategory: 'SBI PO Courses', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.5, studentsCount: 5000, duration: '3 Months', isPopular: true, isTrending: true, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  // ── Banking: SBI Clerk ────────────────────────────────────────────────────
  { id: 'sbi-clerk', title: 'SBI Clerk Complete Course 2025', instructor: 'Priya Singh', instructorId: 'priya-singh', category: 'banking', subcategory: 'SBI Clerk Courses', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.6, studentsCount: 4800, duration: '3 Months', isPopular: true, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  // ── Banking: IBPS RRB ─────────────────────────────────────────────────────
  { id: 'ibps-rrb-officer', title: 'IBPS RRB Officer Course 2025', instructor: 'Amit Sharma', instructorId: 'amit-sharma', category: 'banking', subcategory: 'IBPS RRB Courses', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.7, studentsCount: 4700, duration: '3 Months', isPopular: true, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'ibps-rrb-assistant', title: 'IBPS RRB Assistant Course 2025', instructor: 'Rajesh Kumar', instructorId: 'rajesh-kumar', category: 'banking', subcategory: 'IBPS RRB Courses', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.5, studentsCount: 4600, duration: '3 Months', isPopular: true, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  // ── Banking: IBPS PO & Clerk ──────────────────────────────────────────────
  { id: 'ibps-po', title: 'IBPS PO Complete Course 2025', instructor: 'Rajesh Kumar', instructorId: 'rajesh-kumar', category: 'banking', subcategory: 'Bank Foundation Courses', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.5, studentsCount: 4500, duration: '3 Months', isPopular: true, isTrending: true, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'ibps-clerk', title: 'IBPS Clerk Complete Course 2025', instructor: 'Priya Singh', instructorId: 'priya-singh', category: 'banking', subcategory: 'Bank Foundation Courses', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.6, studentsCount: 4400, duration: '3 Months', isPopular: true, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  // ── Banking: Other Banks ──────────────────────────────────────────────────
  { id: 'tmb', title: 'Tamilnad Mercantile Bank Course 2025', instructor: 'Rajesh Kumar', instructorId: 'rajesh-kumar', category: 'banking', subcategory: 'Other Bank Courses', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.5, studentsCount: 4300, duration: '3 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'uco-bank-lbo', title: 'UCO Bank LBO Course 2025', instructor: 'Amit Sharma', instructorId: 'amit-sharma', category: 'banking', subcategory: 'Other Bank Courses', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.7, studentsCount: 4200, duration: '3 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'central-bank-pgdbf', title: 'Central Bank of India PGDBF Course 2025', instructor: 'Rajesh Kumar', instructorId: 'rajesh-kumar', category: 'banking', subcategory: 'Other Bank Courses', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.5, studentsCount: 4100, duration: '3 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'idbi-jam-pgdbf', title: 'IDBI JAM PGDBF Course 2025', instructor: 'Rajesh Kumar', instructorId: 'rajesh-kumar', category: 'banking', subcategory: 'Other Bank Courses', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.5, studentsCount: 4000, duration: '3 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  // ── Banking: Insurance ────────────────────────────────────────────────────
  { id: 'niacl-assistant', title: 'NIACL Assistant Course 2025', instructor: 'Priya Singh', instructorId: 'priya-singh', category: 'banking', subcategory: 'Insurance Courses', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.6, studentsCount: 3900, duration: '3 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'nicl-assistant', title: 'NICL Assistant Course 2025', instructor: 'Rajesh Kumar', instructorId: 'rajesh-kumar', category: 'banking', subcategory: 'Insurance Courses', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop', price: 1999, originalPrice: 3999, rating: 4.5, studentsCount: 3800, duration: '3 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness', 'computer'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  // ── SSC Courses ───────────────────────────────────────────────────────────
  { id: 'ssc-cgl', title: 'SSC CGL Complete Course 2025', instructor: 'Priya Singh', instructorId: 'priya-singh', category: 'ssc', subcategory: 'SSC Foundation Courses', thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop', price: 2199, originalPrice: 3999, rating: 4.7, studentsCount: 8500, duration: '4 Months', isPopular: true, isTrending: true, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 35, videosCount: 140, testsCount: 45, progress: 0 },
  { id: 'ssc-chsl', title: 'SSC CHSL Complete Course 2025', instructor: 'Priya Singh', instructorId: 'priya-singh', category: 'ssc', subcategory: 'SSC Foundation Courses', thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop', price: 1999, originalPrice: 3499, rating: 4.6, studentsCount: 7200, duration: '3 Months', isPopular: true, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 30, videosCount: 120, testsCount: 40, progress: 0 },
  { id: 'ssc-mts', title: 'SSC MTS Complete Course 2025', instructor: 'Priya Singh', instructorId: 'priya-singh', category: 'ssc', subcategory: 'SSC Other Courses', thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop', price: 1799, originalPrice: 2999, rating: 4.5, studentsCount: 6800, duration: '3 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 28, videosCount: 110, testsCount: 35, progress: 0 },
  { id: 'ssc-gd', title: 'SSC GD Complete Course 2025', instructor: 'Amit Sharma', instructorId: 'amit-sharma', category: 'ssc', subcategory: 'SSC Other Courses', thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop', price: 1799, originalPrice: 2999, rating: 4.6, studentsCount: 9200, duration: '3 Months', isPopular: true, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 28, videosCount: 110, testsCount: 35, progress: 0 },
  // ── Railway Courses ───────────────────────────────────────────────────────
  { id: 'rrb-ntpc', title: 'RRB NTPC Complete Course 2025', instructor: 'Amit Sharma', instructorId: 'amit-sharma', category: 'railway', subcategory: 'Railway Foundation Courses', thumbnail: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=400&fit=crop', price: 2199, originalPrice: 3999, rating: 4.8, studentsCount: 10500, duration: '4 Months', isPopular: true, isTrending: true, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 35, videosCount: 140, testsCount: 45, progress: 0 },
  { id: 'rrb-group-d', title: 'RRB Group D Complete Course 2025', instructor: 'Amit Sharma', instructorId: 'amit-sharma', category: 'railway', subcategory: 'Railway Foundation Courses', thumbnail: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=400&fit=crop', price: 1999, originalPrice: 3499, rating: 4.7, studentsCount: 12000, duration: '3 Months', isPopular: true, isTrending: true, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 32, videosCount: 128, testsCount: 40, progress: 0 },
  { id: 'rrb-alp', title: 'RRB ALP Complete Course 2025', instructor: 'Amit Sharma', instructorId: 'amit-sharma', category: 'railway', subcategory: 'Railway Technical Courses', thumbnail: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=400&fit=crop', price: 2199, originalPrice: 3999, rating: 4.7, studentsCount: 7800, duration: '4 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 35, videosCount: 140, testsCount: 45, progress: 0 },
  { id: 'rrb-je', title: 'RRB JE Complete Course 2025', instructor: 'Amit Sharma', instructorId: 'amit-sharma', category: 'railway', subcategory: 'Railway Technical Courses', thumbnail: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=400&fit=crop', price: 2499, originalPrice: 4499, rating: 4.8, studentsCount: 6500, duration: '5 Months', isPopular: false, isTrending: false, type: 'Complete', subjects: ['english', 'quantitative', 'reasoning', 'general-awareness'], chaptersCount: 40, videosCount: 160, testsCount: 50, progress: 0 },
];

export const subjects: { [key: string]: Subject } = {
  'english': {
    id: 'english',
    name: 'English Language',
    icon: '📝',
    chaptersCount: 5,
    videosCount: 10,
    testsCount: 25,
    progress: 75,
    color: 'bg-blue-500'
  },
  'quantitative': {
    id: 'quantitative',
    name: 'Quantitative Aptitude',
    icon: '🔢',
    chaptersCount: 3,
    videosCount: 8,
    testsCount: 11,
    progress: 60,
    color: 'bg-green-500'
  },
  'reasoning': {
    id: 'reasoning',
    name: 'Reasoning Ability',
    icon: '🧩',
    chaptersCount: 3,
    videosCount: 7,
    testsCount: 10,
    progress: 45,
    color: 'bg-purple-500'
  },
  'general-awareness': {
    id: 'general-awareness',
    name: 'General Awareness',
    icon: '🌍',
    chaptersCount: 3,
    videosCount: 8,
    testsCount: 10,
    progress: 30,
    color: 'bg-orange-500'
  },
  'computer': {
    id: 'computer',
    name: 'Computer Knowledge',
    icon: '💻',
    chaptersCount: 3,
    videosCount: 8,
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
  },
  // ── Quantitative Aptitude Chapters ─────────────────────────────────────────
  {
    id: 'numbers',
    title: 'Number System',
    subjectId: 'quantitative',
    duration: '2.5 hours',
    videosCount: 3,
    testsCount: 4,
    progress: 65,
    isCompleted: false,
    videos: [
      { id: 'number-basics', title: 'Number System Basics', duration: '40 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&h=400&fit=crop' },
      { id: 'types-of-numbers', title: 'Types of Numbers', duration: '35 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop' },
      { id: 'number-practice', title: 'Practice Problems', duration: '45 min', isWatched: false, thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=400&fit=crop' }
    ],
    tests: [
      { id: 'number-test-1', title: 'Number System Test 1', questionsCount: 20, duration: '25 min', isCompleted: true, score: 78 },
      { id: 'number-test-2', title: 'Number System Test 2', questionsCount: 20, duration: '25 min', isCompleted: true, score: 82 },
      { id: 'number-test-3', title: 'Number System Test 3', questionsCount: 20, duration: '25 min', isCompleted: false, score: null },
      { id: 'number-test-4', title: 'Number System Test 4', questionsCount: 20, duration: '25 min', isCompleted: false, score: null }
    ]
  },
  {
    id: 'percentage',
    title: 'Percentage',
    subjectId: 'quantitative',
    duration: '2 hours',
    videosCount: 2,
    testsCount: 3,
    progress: 50,
    isCompleted: false,
    videos: [
      { id: 'percentage-basics', title: 'Percentage Fundamentals', duration: '38 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&h=400&fit=crop' },
      { id: 'percentage-advanced', title: 'Advanced Percentage Problems', duration: '42 min', isWatched: false, thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop' }
    ],
    tests: [
      { id: 'pct-test-1', title: 'Percentage Test 1', questionsCount: 25, duration: '30 min', isCompleted: true, score: 70 },
      { id: 'pct-test-2', title: 'Percentage Test 2', questionsCount: 25, duration: '30 min', isCompleted: false, score: null },
      { id: 'pct-test-3', title: 'Percentage Test 3', questionsCount: 25, duration: '30 min', isCompleted: false, score: null }
    ]
  },
  {
    id: 'profit-loss',
    title: 'Profit & Loss',
    subjectId: 'quantitative',
    duration: '2.5 hours',
    videosCount: 3,
    testsCount: 4,
    progress: 30,
    isCompleted: false,
    videos: [
      { id: 'pl-basics', title: 'Profit & Loss Basics', duration: '40 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&h=400&fit=crop' },
      { id: 'pl-discount', title: 'Discount Problems', duration: '35 min', isWatched: false, thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop' },
      { id: 'pl-practice', title: 'Practice Session', duration: '45 min', isWatched: false, thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=400&fit=crop' }
    ],
    tests: [
      { id: 'pl-test-1', title: 'Profit & Loss Test 1', questionsCount: 20, duration: '25 min', isCompleted: true, score: 65 },
      { id: 'pl-test-2', title: 'Profit & Loss Test 2', questionsCount: 20, duration: '25 min', isCompleted: false, score: null },
      { id: 'pl-test-3', title: 'Profit & Loss Test 3', questionsCount: 20, duration: '25 min', isCompleted: false, score: null },
      { id: 'pl-test-4', title: 'Profit & Loss Test 4', questionsCount: 20, duration: '25 min', isCompleted: false, score: null }
    ]
  },
  // ── Reasoning Ability Chapters ─────────────────────────────────────────────
  {
    id: 'coding-decoding',
    title: 'Coding & Decoding',
    subjectId: 'reasoning',
    duration: '2 hours',
    videosCount: 2,
    testsCount: 3,
    progress: 55,
    isCompleted: false,
    videos: [
      { id: 'coding-basics', title: 'Coding Decoding Fundamentals', duration: '45 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop' },
      { id: 'coding-patterns', title: 'Pattern Based Coding', duration: '40 min', isWatched: false, thumbnail: 'https://images.unsplash.com/photo-1516110833967-0b5716085746?w=600&h=400&fit=crop' }
    ],
    tests: [
      { id: 'cd-test-1', title: 'Coding Test 1', questionsCount: 20, duration: '25 min', isCompleted: true, score: 72 },
      { id: 'cd-test-2', title: 'Coding Test 2', questionsCount: 20, duration: '25 min', isCompleted: true, score: 68 },
      { id: 'cd-test-3', title: 'Coding Test 3', questionsCount: 20, duration: '25 min', isCompleted: false, score: null }
    ]
  },
  {
    id: 'blood-relations',
    title: 'Blood Relations',
    subjectId: 'reasoning',
    duration: '1.5 hours',
    videosCount: 2,
    testsCount: 3,
    progress: 40,
    isCompleted: false,
    videos: [
      { id: 'br-basics', title: 'Blood Relations Basics', duration: '35 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop' },
      { id: 'br-family-tree', title: 'Family Tree Method', duration: '40 min', isWatched: false, thumbnail: 'https://images.unsplash.com/photo-1516110833967-0b5716085746?w=600&h=400&fit=crop' }
    ],
    tests: [
      { id: 'br-test-1', title: 'Blood Relations Test 1', questionsCount: 15, duration: '20 min', isCompleted: true, score: 60 },
      { id: 'br-test-2', title: 'Blood Relations Test 2', questionsCount: 15, duration: '20 min', isCompleted: false, score: null },
      { id: 'br-test-3', title: 'Blood Relations Test 3', questionsCount: 15, duration: '20 min', isCompleted: false, score: null }
    ]
  },
  {
    id: 'seating-arrangement',
    title: 'Seating Arrangement',
    subjectId: 'reasoning',
    duration: '3 hours',
    videosCount: 3,
    testsCount: 4,
    progress: 25,
    isCompleted: false,
    videos: [
      { id: 'sa-linear', title: 'Linear Arrangement', duration: '45 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop' },
      { id: 'sa-circular', title: 'Circular Arrangement', duration: '50 min', isWatched: false, thumbnail: 'https://images.unsplash.com/photo-1516110833967-0b5716085746?w=600&h=400&fit=crop' },
      { id: 'sa-practice', title: 'Practice Problems', duration: '45 min', isWatched: false, thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=400&fit=crop' }
    ],
    tests: [
      { id: 'sa-test-1', title: 'Seating Arrangement Test 1', questionsCount: 20, duration: '30 min', isCompleted: true, score: 55 },
      { id: 'sa-test-2', title: 'Seating Arrangement Test 2', questionsCount: 20, duration: '30 min', isCompleted: false, score: null },
      { id: 'sa-test-3', title: 'Seating Arrangement Test 3', questionsCount: 20, duration: '30 min', isCompleted: false, score: null },
      { id: 'sa-test-4', title: 'Seating Arrangement Test 4', questionsCount: 20, duration: '30 min', isCompleted: false, score: null }
    ]
  },
  // ── General Awareness Chapters ─────────────────────────────────────────────
  {
    id: 'indian-history',
    title: 'Indian History',
    subjectId: 'general-awareness',
    duration: '3 hours',
    videosCount: 3,
    testsCount: 4,
    progress: 35,
    isCompleted: false,
    videos: [
      { id: 'history-ancient', title: 'Ancient India', duration: '50 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop' },
      { id: 'history-medieval', title: 'Medieval Period', duration: '55 min', isWatched: false, thumbnail: 'https://images.unsplash.com/photo-1599940824399-b87987ce0799?w=600&h=400&fit=crop' },
      { id: 'history-modern', title: 'Modern India', duration: '60 min', isWatched: false, thumbnail: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=600&h=400&fit=crop' }
    ],
    tests: [
      { id: 'hist-test-1', title: 'History Test 1', questionsCount: 30, duration: '30 min', isCompleted: true, score: 58 },
      { id: 'hist-test-2', title: 'History Test 2', questionsCount: 30, duration: '30 min', isCompleted: false, score: null },
      { id: 'hist-test-3', title: 'History Test 3', questionsCount: 30, duration: '30 min', isCompleted: false, score: null },
      { id: 'hist-test-4', title: 'History Test 4', questionsCount: 30, duration: '30 min', isCompleted: false, score: null }
    ]
  },
  {
    id: 'indian-polity',
    title: 'Indian Polity',
    subjectId: 'general-awareness',
    duration: '2.5 hours',
    videosCount: 3,
    testsCount: 3,
    progress: 20,
    isCompleted: false,
    videos: [
      { id: 'polity-constitution', title: 'Constitution of India', duration: '50 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop' },
      { id: 'polity-rights', title: 'Fundamental Rights', duration: '45 min', isWatched: false, thumbnail: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=600&h=400&fit=crop' },
      { id: 'polity-governance', title: 'Governance Structure', duration: '40 min', isWatched: false, thumbnail: 'https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=600&h=400&fit=crop' }
    ],
    tests: [
      { id: 'polity-test-1', title: 'Polity Test 1', questionsCount: 25, duration: '25 min', isCompleted: true, score: 50 },
      { id: 'polity-test-2', title: 'Polity Test 2', questionsCount: 25, duration: '25 min', isCompleted: false, score: null },
      { id: 'polity-test-3', title: 'Polity Test 3', questionsCount: 25, duration: '25 min', isCompleted: false, score: null }
    ]
  },
  {
    id: 'geography',
    title: 'Geography',
    subjectId: 'general-awareness',
    duration: '2 hours',
    videosCount: 2,
    testsCount: 3,
    progress: 15,
    isCompleted: false,
    videos: [
      { id: 'geo-physical', title: 'Physical Geography', duration: '55 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1458668383970-8ddd3927deed?w=600&h=400&fit=crop' },
      { id: 'geo-india', title: 'Indian Geography', duration: '50 min', isWatched: false, thumbnail: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&h=400&fit=crop' }
    ],
    tests: [
      { id: 'geo-test-1', title: 'Geography Test 1', questionsCount: 25, duration: '25 min', isCompleted: true, score: 45 },
      { id: 'geo-test-2', title: 'Geography Test 2', questionsCount: 25, duration: '25 min', isCompleted: false, score: null },
      { id: 'geo-test-3', title: 'Geography Test 3', questionsCount: 25, duration: '25 min', isCompleted: false, score: null }
    ]
  },
  // ── Computer Knowledge Chapters ────────────────────────────────────────────
  {
    id: 'computer-basics',
    title: 'Computer Fundamentals',
    subjectId: 'computer',
    duration: '2 hours',
    videosCount: 3,
    testsCount: 3,
    progress: 80,
    isCompleted: false,
    videos: [
      { id: 'comp-intro', title: 'Introduction to Computers', duration: '35 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop' },
      { id: 'comp-hardware', title: 'Hardware Components', duration: '40 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop' },
      { id: 'comp-software', title: 'Software Types', duration: '38 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop' }
    ],
    tests: [
      { id: 'comp-test-1', title: 'Computer Basics Test 1', questionsCount: 20, duration: '20 min', isCompleted: true, score: 88 },
      { id: 'comp-test-2', title: 'Computer Basics Test 2', questionsCount: 20, duration: '20 min', isCompleted: true, score: 85 },
      { id: 'comp-test-3', title: 'Computer Basics Test 3', questionsCount: 20, duration: '20 min', isCompleted: false, score: null }
    ]
  },
  {
    id: 'ms-office',
    title: 'MS Office',
    subjectId: 'computer',
    duration: '2.5 hours',
    videosCount: 3,
    testsCount: 3,
    progress: 70,
    isCompleted: false,
    videos: [
      { id: 'ms-word', title: 'MS Word Essentials', duration: '45 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop' },
      { id: 'ms-excel', title: 'MS Excel Basics', duration: '50 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop' },
      { id: 'ms-powerpoint', title: 'MS PowerPoint', duration: '35 min', isWatched: false, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop' }
    ],
    tests: [
      { id: 'ms-test-1', title: 'MS Office Test 1', questionsCount: 20, duration: '20 min', isCompleted: true, score: 75 },
      { id: 'ms-test-2', title: 'MS Office Test 2', questionsCount: 20, duration: '20 min', isCompleted: true, score: 80 },
      { id: 'ms-test-3', title: 'MS Office Test 3', questionsCount: 20, duration: '20 min', isCompleted: false, score: null }
    ]
  },
  {
    id: 'internet-basics',
    title: 'Internet & Networking',
    subjectId: 'computer',
    duration: '1.5 hours',
    videosCount: 2,
    testsCount: 2,
    progress: 60,
    isCompleted: false,
    videos: [
      { id: 'internet-intro', title: 'Internet Fundamentals', duration: '40 min', isWatched: true, thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop' },
      { id: 'network-basics', title: 'Networking Basics', duration: '45 min', isWatched: false, thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop' }
    ],
    tests: [
      { id: 'net-test-1', title: 'Internet Test 1', questionsCount: 15, duration: '15 min', isCompleted: true, score: 72 },
      { id: 'net-test-2', title: 'Internet Test 2', questionsCount: 15, duration: '15 min', isCompleted: false, score: null }
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
