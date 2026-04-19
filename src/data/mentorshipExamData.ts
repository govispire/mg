// ─────────────────────────────────────────────────────────────────────────────
// Mentorship Exam Data — used by the onboarding wizard
// ─────────────────────────────────────────────────────────────────────────────

export interface TargetExam {
  id: string;
  name: string;
  category: string;
  popular?: boolean;
  tags?: string[];
}

export interface SubjectOption {
  id: string;
  name: string;
  icon: string;
  stages: ('prelims' | 'mains' | 'interview' | 'overall')[];
  color: string;
}

export interface LanguageOption {
  id: string;
  name: string;
  nativeScript: string;
  flag: string;
}

export interface DiagnosticTest {
  id: string;
  title: string;
  subject: string;
  duration: string;
  questions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  stages: ('prelims' | 'mains' | 'interview' | 'overall')[];
  categories: string[];
  color: string;
  bgColor: string;
}

// ─── Target Exams by Category ────────────────────────────────────────────────

export const targetExams: TargetExam[] = [
  // Banking
  { id: 'sbi-clerk', name: 'SBI Clerk', category: 'banking', popular: true, tags: ['Most Popular', 'High Demand'] },
  { id: 'sbi-po', name: 'SBI PO', category: 'banking', popular: true, tags: ['Most Popular'] },
  { id: 'ibps-clerk', name: 'IBPS Clerk', category: 'banking', popular: true },
  { id: 'ibps-po', name: 'IBPS PO', category: 'banking', popular: true },
  { id: 'ibps-rrb-clerk', name: 'IBPS RRB Office Assistant', category: 'banking' },
  { id: 'ibps-rrb-po', name: 'IBPS RRB Officer', category: 'banking' },
  { id: 'rbi-assistant', name: 'RBI Assistant', category: 'banking' },
  { id: 'rbi-grade-b', name: 'RBI Grade B', category: 'banking' },
  { id: 'nabard', name: 'NABARD Grade A', category: 'banking' },
  { id: 'sebi', name: 'SEBI Grade A', category: 'banking' },

  // SSC
  { id: 'ssc-cgl', name: 'SSC CGL', category: 'ssc', popular: true, tags: ['Most Popular'] },
  { id: 'ssc-chsl', name: 'SSC CHSL', category: 'ssc', popular: true },
  { id: 'ssc-mts', name: 'SSC MTS', category: 'ssc' },
  { id: 'ssc-cpo', name: 'SSC CPO', category: 'ssc' },
  { id: 'ssc-gd', name: 'SSC GD Constable', category: 'ssc' },
  { id: 'ssc-je', name: 'SSC JE', category: 'ssc' },

  // Railway
  { id: 'rrb-ntpc', name: 'RRB NTPC', category: 'railway', popular: true },
  { id: 'rrb-group-d', name: 'RRB Group D', category: 'railway', popular: true },
  { id: 'rrb-je', name: 'RRB JE', category: 'railway' },
  { id: 'rrb-alp', name: 'RRB ALP', category: 'railway' },
  { id: 'rpf', name: 'RPF Constable', category: 'railway' },

  // UPSC
  { id: 'upsc-cse', name: 'UPSC Civil Services (IAS)', category: 'upsc', popular: true },
  { id: 'upsc-capf', name: 'UPSC CAPF', category: 'upsc' },
  { id: 'upsc-cds', name: 'UPSC CDS', category: 'upsc' },

  // TNPSC
  { id: 'tnpsc-group-1', name: 'TNPSC Group 1', category: 'tnpsc', popular: true },
  { id: 'tnpsc-group-2', name: 'TNPSC Group 2', category: 'tnpsc', popular: true },
  { id: 'tnpsc-group-4', name: 'TNPSC Group 4', category: 'tnpsc' },
  { id: 'tnpsc-vao', name: 'TNPSC VAO', category: 'tnpsc' },

  // Insurance
  { id: 'lic-aao', name: 'LIC AAO', category: 'insurance', popular: true },
  { id: 'lic-agent', name: 'LIC ADO', category: 'insurance' },
  { id: 'niacl', name: 'NIACL Assistant', category: 'insurance' },
  { id: 'nicl', name: 'NICL Assistant', category: 'insurance' },
  { id: 'uiicl', name: 'UIICL Assistant', category: 'insurance' },

  // Teaching
  { id: 'ctet', name: 'CTET', category: 'teaching', popular: true },
  { id: 'tet', name: 'State TET', category: 'teaching' },
  { id: 'kv-tgt', name: 'KVS TGT', category: 'teaching' },
  { id: 'dsssb', name: 'DSSSB Teacher', category: 'teaching' },

  // State Exams
  { id: 'mppsc', name: 'MPPSC', category: 'state', popular: true },
  { id: 'uppsc', name: 'UPPSC', category: 'state' },
  { id: 'bpsc', name: 'BPSC', category: 'state' },
  { id: 'kpsc', name: 'KPSC', category: 'state' },
  { id: 'rpsc', name: 'RPSC', category: 'state' },
];

// ─── Subjects by Stage ────────────────────────────────────────────────────────

export const subjectOptions: SubjectOption[] = [
  {
    id: 'english',
    name: 'English Language',
    icon: '📖',
    stages: ['prelims', 'mains', 'overall'],
    color: 'text-blue-700',
  },
  {
    id: 'quant',
    name: 'Quantitative Aptitude',
    icon: '🔢',
    stages: ['prelims', 'mains', 'overall'],
    color: 'text-green-700',
  },
  {
    id: 'reasoning',
    name: 'Reasoning Ability',
    icon: '🧩',
    stages: ['prelims', 'mains', 'overall'],
    color: 'text-purple-700',
  },
  {
    id: 'gk',
    name: 'General Awareness',
    icon: '🌍',
    stages: ['prelims', 'mains', 'overall'],
    color: 'text-orange-700',
  },
  {
    id: 'computer',
    name: 'Computer Knowledge',
    icon: '💻',
    stages: ['prelims', 'mains', 'overall'],
    color: 'text-cyan-700',
  },
  {
    id: 'interview',
    name: 'Interview / Descriptive',
    icon: '🎤',
    stages: ['mains', 'interview', 'overall'],
    color: 'text-rose-700',
  },
  {
    id: 'gs',
    name: 'General Studies',
    icon: '📚',
    stages: ['mains', 'overall'],
    color: 'text-amber-700',
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis & Interpretation',
    icon: '📊',
    stages: ['mains', 'overall'],
    color: 'text-teal-700',
  },
];

// ─── Recommended subjects per exam ─────────────────────────────────────────

export const recommendedSubjects: Record<string, string[]> = {
  'sbi-clerk': ['english', 'quant', 'reasoning', 'gk'],
  'sbi-po': ['english', 'quant', 'reasoning', 'gk', 'computer'],
  'ibps-clerk': ['english', 'quant', 'reasoning', 'gk', 'computer'],
  'ibps-po': ['english', 'quant', 'reasoning', 'gk', 'data-analysis'],
  'ssc-cgl': ['english', 'quant', 'reasoning', 'gk'],
  'ssc-chsl': ['english', 'quant', 'reasoning', 'gk'],
  'rrb-ntpc': ['english', 'quant', 'reasoning', 'gk'],
  'upsc-cse': ['gs', 'english', 'reasoning', 'interview'],
  'tnpsc-group-1': ['english', 'gk', 'reasoning', 'gs'],
  'tnpsc-group-2': ['english', 'gk', 'reasoning'],
  'tnpsc-group-4': ['english', 'gk', 'reasoning'],
  'lic-aao': ['english', 'quant', 'reasoning', 'gk', 'interview'],
  'ctet': ['english', 'reasoning', 'gk'],
};

// ─── Languages ───────────────────────────────────────────────────────────────

export const languageOptions: LanguageOption[] = [
  { id: 'english', name: 'English', nativeScript: 'English', flag: '🇬🇧' },
  { id: 'hindi', name: 'Hindi', nativeScript: 'हिन्दी', flag: '🇮🇳' },
  { id: 'tamil', name: 'Tamil', nativeScript: 'தமிழ்', flag: '🌟' },
  { id: 'malayalam', name: 'Malayalam', nativeScript: 'മലയാളം', flag: '🌴' },
  { id: 'kannada', name: 'Kannada', nativeScript: 'ಕನ್ನಡ', flag: '🏺' },
  { id: 'telugu', name: 'Telugu', nativeScript: 'తెలుగు', flag: '✨' },
];

// ─── Diagnostic Tests ─────────────────────────────────────────────────────────

export const diagnosticTests: DiagnosticTest[] = [
  {
    id: 'english-diag',
    title: 'English Language Diagnostic',
    subject: 'English',
    duration: '15 min',
    questions: 20,
    difficulty: 'Medium',
    stages: ['prelims', 'overall'],
    categories: ['banking', 'ssc', 'railway', 'insurance', 'teaching', 'state'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'quant-diag',
    title: 'Quantitative Aptitude Diagnostic',
    subject: 'Quantitative Aptitude',
    duration: '20 min',
    questions: 25,
    difficulty: 'Medium',
    stages: ['prelims', 'overall'],
    categories: ['banking', 'ssc', 'railway', 'insurance'],
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  },
  {
    id: 'reasoning-diag',
    title: 'Reasoning Ability Diagnostic',
    subject: 'Reasoning',
    duration: '15 min',
    questions: 20,
    difficulty: 'Medium',
    stages: ['prelims', 'overall'],
    categories: ['banking', 'ssc', 'railway', 'insurance', 'teaching', 'state'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  {
    id: 'gk-diag',
    title: 'General Awareness Diagnostic',
    subject: 'General Awareness',
    duration: '10 min',
    questions: 25,
    difficulty: 'Easy',
    stages: ['prelims', 'mains', 'overall'],
    categories: ['banking', 'ssc', 'railway', 'insurance', 'tnpsc', 'state'],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
  },
  {
    id: 'mini-mock',
    title: 'Full Mini Mock Test',
    subject: 'All Subjects',
    duration: '30 min',
    questions: 50,
    difficulty: 'Hard',
    stages: ['prelims', 'mains', 'overall'],
    categories: ['banking', 'ssc', 'railway', 'insurance', 'upsc', 'tnpsc', 'state', 'teaching'],
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
  },
  // Mains-specific
  {
    id: 'desc-english',
    title: 'Descriptive English Test',
    subject: 'English (Mains)',
    duration: '20 min',
    questions: 10,
    difficulty: 'Hard',
    stages: ['mains', 'interview'],
    categories: ['banking', 'ssc', 'upsc', 'tnpsc'],
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
  },
  {
    id: 'data-analysis-diag',
    title: 'Data Analysis & DI Test',
    subject: 'Data Interpretation',
    duration: '25 min',
    questions: 20,
    difficulty: 'Hard',
    stages: ['mains'],
    categories: ['banking', 'ssc'],
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 border-teal-200',
  },
  {
    id: 'gs-diag',
    title: 'General Studies Diagnostic',
    subject: 'General Studies',
    duration: '20 min',
    questions: 30,
    difficulty: 'Medium',
    stages: ['mains', 'interview'],
    categories: ['upsc', 'tnpsc', 'state'],
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
  },
];

// ─── Mentor Pool (mock data for auto-assignment) ───────────────────────────

export interface MentorProfile {
  id: string;
  name: string;
  avatar: string;
  languages: string[];
  stages: string[];
  categories: string[];
  studentCount: number;
  maxStudents: number;
  rating: number;
  expertise: string[];
  bio: string;
  responseTime: string;
}

export const mentorPool: MentorProfile[] = [
  {
    id: 'mentor-1',
    name: 'Rajesh Kumar',
    avatar: 'https://i.pravatar.cc/150?u=rajesh',
    languages: ['english', 'hindi', 'tamil'],
    stages: ['prelims', 'overall'],
    categories: ['banking', 'ssc'],
    studentCount: 14,
    maxStudents: 20,
    rating: 4.9,
    expertise: ['SBI PO', 'IBPS PO', 'SSC CGL'],
    bio: 'Ex-SBI PO with 6 years of mentoring experience. Focus on accuracy and time management.',
    responseTime: '< 2 hours',
  },
  {
    id: 'mentor-2',
    name: 'Priya Nair',
    avatar: 'https://i.pravatar.cc/150?u=priya',
    languages: ['english', 'malayalam', 'tamil'],
    stages: ['prelims', 'mains'],
    categories: ['banking', 'tnpsc', 'insurance'],
    studentCount: 18,
    maxStudents: 20,
    rating: 4.8,
    expertise: ['IBPS Clerk', 'TNPSC Group 2', 'LIC AAO'],
    bio: 'Cleared IBPS PO and TNPSC Group 2. Specialist in reasoning and English for South Indian students.',
    responseTime: '< 4 hours',
  },
  {
    id: 'mentor-3',
    name: 'Arjun Verma',
    avatar: 'https://i.pravatar.cc/150?u=arjun',
    languages: ['english', 'hindi'],
    stages: ['mains', 'interview', 'overall'],
    categories: ['banking', 'upsc', 'ssc'],
    studentCount: 10,
    maxStudents: 20,
    rating: 4.7,
    expertise: ['RBI Grade B', 'UPSC CSE', 'SSC CGL Mains'],
    bio: 'Former RBI Grade B officer. Expert in mains and interview preparation.',
    responseTime: '< 6 hours',
  },
  {
    id: 'mentor-4',
    name: 'Kavitha Sreeram',
    avatar: 'https://i.pravatar.cc/150?u=kavitha',
    languages: ['tamil', 'english', 'kannada'],
    stages: ['prelims', 'overall'],
    categories: ['tnpsc', 'railway', 'ssc', 'banking'],
    studentCount: 16,
    maxStudents: 20,
    rating: 4.8,
    expertise: ['TNPSC Group 4', 'RRB NTPC', 'SSC CHSL'],
    bio: 'Cleared TNPSC Group 2 and RRB NTPC. Specialist for Tamil Nadu government exams.',
    responseTime: '< 3 hours',
  },
  {
    id: 'mentor-5',
    name: 'Vikram Reddy',
    avatar: 'https://i.pravatar.cc/150?u=vikram',
    languages: ['telugu', 'english', 'hindi'],
    stages: ['prelims', 'mains', 'overall'],
    categories: ['banking', 'ssc', 'railway', 'state'],
    studentCount: 12,
    maxStudents: 20,
    rating: 4.6,
    expertise: ['SBI Clerk', 'RRB Group D', 'APPSC'],
    bio: 'Cleared SBI Clerk and APPSC. Expert in Telangana & AP state exams alongside banking.',
    responseTime: '< 4 hours',
  },
  {
    id: 'mentor-6',
    name: 'Suresh Kannan',
    avatar: 'https://i.pravatar.cc/150?u=suresh',
    languages: ['kannada', 'english', 'tamil'],
    stages: ['prelims', 'mains', 'overall'],
    categories: ['banking', 'ssc', 'state', 'tnpsc'],
    studentCount: 8,
    maxStudents: 20,
    rating: 4.7,
    expertise: ['KPSC KAS', 'SBI PO', 'SSC CGL'],
    bio: 'KPSC KAS selected officer. Expert in Karnataka state exams and banking.',
    responseTime: '< 2 hours',
  },
];

// ─── Auto-assignment logic ────────────────────────────────────────────────────

export function assignMentor(
  language: string,
  stage: string,
  category: string,
): MentorProfile | null {
  const available = mentorPool.filter(m => m.studentCount < m.maxStudents);

  // Priority 1: Language + Stage + Category exact match
  const exact = available.filter(
    m =>
      m.languages.includes(language) &&
      m.stages.includes(stage) &&
      m.categories.includes(category)
  );
  if (exact.length > 0) return exact.sort((a, b) => a.studentCount - b.studentCount)[0];

  // Priority 2: Language + Stage
  const langStage = available.filter(
    m => m.languages.includes(language) && m.stages.includes(stage)
  );
  if (langStage.length > 0) return langStage.sort((a, b) => a.studentCount - b.studentCount)[0];

  // Priority 3: Language only
  const langOnly = available.filter(m => m.languages.includes(language));
  if (langOnly.length > 0) return langOnly.sort((a, b) => a.studentCount - b.studentCount)[0];

  // Priority 4: Any available mentor
  return available.sort((a, b) => a.studentCount - b.studentCount)[0] ?? null;
}

// ─── Daily predefined tasks ───────────────────────────────────────────────────

export interface DailyTask {
  id: string;
  title: string;
  subject: string;
  type: 'practice' | 'mock' | 'revision' | 'reading' | 'weak-area';
  duration: string;
  priority: 'high' | 'medium' | 'low';
  assignedBy: 'system' | 'mentor';
  completed: boolean;
  mentorNote?: string;
  attachment?: string;
}

export const predefinedDailyTasks: DailyTask[] = [
  {
    id: 'task-1',
    title: 'Simplification Practice — 30 Questions',
    subject: 'Quantitative Aptitude',
    type: 'practice',
    duration: '40 min',
    priority: 'high',
    assignedBy: 'system',
    completed: false,
    mentorNote: 'Focus on accuracy, not speed today.',
    attachment: 'Simplification_Formula_Sheet.pdf',
  },
  {
    id: 'task-2',
    title: 'Number Series Drill — Set B',
    subject: 'Quantitative Aptitude',
    type: 'practice',
    duration: '20 min',
    priority: 'medium',
    assignedBy: 'system',
    completed: false,
  },
  {
    id: 'task-3',
    title: 'Reading Comprehension — SBI PO 2023 Paper (2 sets)',
    subject: 'English',
    type: 'mock',
    duration: '30 min',
    priority: 'high',
    assignedBy: 'mentor',
    completed: false,
    mentorNote: "Don't rush 2nd passage. Slow down.",
  },
  {
    id: 'task-4',
    title: 'Current Affairs — May Capsule (5 questions)',
    subject: 'General Awareness',
    type: 'revision',
    duration: '15 min',
    priority: 'medium',
    assignedBy: 'system',
    completed: false,
  },
  {
    id: 'task-5',
    title: 'Seating Arrangement — Advanced Puzzle Set',
    subject: 'Reasoning',
    type: 'weak-area',
    duration: '25 min',
    priority: 'high',
    assignedBy: 'mentor',
    completed: false,
    mentorNote: 'You scored only 40% last week. Attempt slowly.',
  },
  {
    id: 'task-6',
    title: 'Banking Awareness — 2024 Highlights',
    subject: 'General Awareness',
    type: 'reading',
    duration: '10 min',
    priority: 'low',
    assignedBy: 'system',
    completed: false,
  },
];
