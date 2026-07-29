export interface PDFCollection {
  id: string;
  title: string;
  icon: string;
  description: string;
  pdfCount: number;
  questionCount: string;
  metric3Label: string;
  metric3Value: string;
  badge?: string;
  rating?: string;
  color: string;
  bgGradient: string;
  popular?: boolean;
}

export interface PDFSubject {
  id: string;
  name: string;
  icon: string;
  topicsCount: number;
  pdfCount: number;
  color: string;
}

export interface PDFTopic {
  id: string;
  subjectId: string;
  name: string;
  subtopicsCount: number;
  pdfCount: number;
}

export interface PDFSubtopic {
  id: string;
  topicId: string;
  name: string;
  pdfCount: number;
}

export interface PDFDocument {
  id: string;
  subtopicId: string;
  title: string;
  size: string;
  date: string;
  downloads: number;
  pages: number;
  questionsCount: number;
  examType: string;
  isNew?: boolean;
}

export const PDF_COLLECTIONS: PDFCollection[] = [
  {
    id: 'topic-wise',
    title: 'Topic-wise PDF Course',
    icon: '🎯',
    description: 'Practice by individual topics with step-by-step solutions',
    pdfCount: 1245,
    questionCount: '14,000',
    metric3Label: 'Topics',
    metric3Value: '399',
    badge: 'Most Popular',
    rating: '4.9 ★',
    color: 'border-blue-200 text-blue-700 bg-blue-50',
    bgGradient: 'from-blue-600 to-indigo-700',
    popular: true,
  },
  {
    id: 'section-wise',
    title: 'Section-wise PDF Course',
    icon: '📖',
    description: 'Complete section preparation modules for thorough mastery',
    pdfCount: 860,
    questionCount: '10,500',
    metric3Label: 'Sections',
    metric3Value: '150',
    badge: 'Top Rated',
    rating: '4.8 ★',
    color: 'border-violet-200 text-violet-700 bg-violet-50',
    bgGradient: 'from-violet-600 to-purple-700',
    popular: true,
  },
  {
    id: 'bank-prelims',
    title: 'All Bank Prelims PDF',
    icon: '🏦',
    description: 'SBI, IBPS, RBI, RRB Prelims complete exam sets',
    pdfCount: 520,
    questionCount: '25,400',
    metric3Label: 'Exams Covered',
    metric3Value: '18 Exams',
    badge: 'High Value',
    rating: '4.9 ★',
    color: 'border-emerald-200 text-emerald-700 bg-emerald-50',
    bgGradient: 'from-emerald-600 to-teal-700',
    popular: true,
  },
  {
    id: 'bank-mains',
    title: 'All Bank Mains PDF',
    icon: '🏆',
    description: 'Advanced level preparation & high-difficulty problem sets',
    pdfCount: 460,
    questionCount: '18,200',
    metric3Label: 'Exams Covered',
    metric3Value: '12 Exams',
    badge: 'Advanced',
    rating: '4.9 ★',
    color: 'border-amber-200 text-amber-700 bg-amber-50',
    bgGradient: 'from-amber-500 to-orange-600',
    popular: true,
  },
  {
    id: 'booster-bundle',
    title: 'Booster Bundle',
    icon: '🚀',
    description: 'Last-minute revision sets and speed calculation drills',
    pdfCount: 320,
    questionCount: '9,600',
    metric3Label: 'Revision Sets',
    metric3Value: '45 Sets',
    badge: 'Rapid Practice',
    rating: '4.7 ★',
    color: 'border-rose-200 text-rose-700 bg-rose-50',
    bgGradient: 'from-rose-500 to-pink-600',
    popular: false,
  },
  {
    id: 'memory-based',
    title: 'Memory Based Papers',
    icon: '🧠',
    description: 'Previous year exam memory questions collected from aspirants',
    pdfCount: 275,
    questionCount: '12,000',
    metric3Label: 'Coverage',
    metric3Value: '5 Years',
    badge: 'Most Downloaded',
    rating: '4.9 ★',
    color: 'border-cyan-200 text-cyan-700 bg-cyan-50',
    bgGradient: 'from-cyan-600 to-blue-700',
    popular: false,
  },
  {
    id: 'editorial-english',
    title: 'Editorial English',
    icon: '📝',
    description: 'Daily editorial analysis, vocabulary breakdown & grammar takeaways',
    pdfCount: 180,
    questionCount: '4,500',
    metric3Label: 'Daily Updates',
    metric3Value: '365 Days',
    badge: 'Daily Updated',
    rating: '4.8 ★',
    color: 'border-indigo-200 text-indigo-700 bg-indigo-50',
    bgGradient: 'from-indigo-600 to-violet-700',
    popular: false,
  },
  {
    id: 'quiz-collections',
    title: 'Quiz Collections',
    icon: '🎲',
    description: 'Topic-wise timed quiz papers with answer keys',
    pdfCount: 980,
    questionCount: '15,000',
    metric3Label: 'Topics',
    metric3Value: '250',
    badge: 'Interactive',
    rating: '4.7 ★',
    color: 'border-teal-200 text-teal-700 bg-teal-50',
    bgGradient: 'from-teal-600 to-emerald-700',
    popular: false,
  },
  {
    id: 'pyq-library',
    title: 'Previous Year Papers',
    icon: '📊',
    description: '10 years PYQ library with detailed explanatory solutions',
    pdfCount: 650,
    questionCount: '22,000',
    metric3Label: 'Years PYQ',
    metric3Value: '10 Years',
    badge: 'Essential',
    rating: '4.9 ★',
    color: 'border-slate-200 text-slate-700 bg-slate-100',
    bgGradient: 'from-slate-700 to-slate-900',
    popular: false,
  },
  {
    id: 'premium-bundles',
    title: 'Premium Bundles',
    icon: '⭐',
    description: 'All-in-one complete preparation packages for targeted exams',
    pdfCount: 85,
    questionCount: '50,000+',
    metric3Label: 'Full Bundles',
    metric3Value: '85',
    badge: 'VIP Package',
    rating: '5.0 ★',
    color: 'border-amber-300 text-amber-800 bg-amber-100',
    bgGradient: 'from-amber-400 to-yellow-600',
    popular: false,
  },
];

export const SUBJECTS: PDFSubject[] = [
  { id: 'reasoning', name: 'Reasoning Ability', icon: '🧩', topicsCount: 18, pdfCount: 340, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { id: 'quant', name: 'Quantitative Aptitude', icon: '📐', topicsCount: 22, pdfCount: 380, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'english', name: 'English Language', icon: '📖', topicsCount: 14, pdfCount: 240, color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { id: 'computer', name: 'Computer Knowledge', icon: '💻', topicsCount: 10, pdfCount: 125, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id: 'ga', name: 'General Awareness & Banking', icon: '🏛️', topicsCount: 16, pdfCount: 160, color: 'bg-amber-50 border-amber-200 text-amber-700' },
];

export const TOPICS_BY_SUBJECT: Record<string, { id: string; name: string; subtopicsCount: number; pdfCount: number }[]> = {
  reasoning: [
    { id: 'puzzle', name: 'Puzzles', subtopicsCount: 7, pdfCount: 85 },
    { id: 'seating', name: 'Seating Arrangement', subtopicsCount: 6, pdfCount: 70 },
    { id: 'syllogism', name: 'Syllogism', subtopicsCount: 4, pdfCount: 45 },
    { id: 'blood-relation', name: 'Blood Relation', subtopicsCount: 3, pdfCount: 35 },
    { id: 'direction', name: 'Direction Sense', subtopicsCount: 3, pdfCount: 30 },
    { id: 'coding', name: 'Coding & Decoding', subtopicsCount: 4, pdfCount: 40 },
    { id: 'inequality', name: 'Coded Inequalities', subtopicsCount: 3, pdfCount: 35 },
  ],
  quant: [
    { id: 'di', name: 'Data Interpretation', subtopicsCount: 6, pdfCount: 95 },
    { id: 'simplification', name: 'Simplification & Approximation', subtopicsCount: 4, pdfCount: 65 },
    { id: 'number-series', name: 'Number Series (Missing & Wrong)', subtopicsCount: 3, pdfCount: 50 },
    { id: 'quadratic', name: 'Quadratic Equations', subtopicsCount: 3, pdfCount: 40 },
    { id: 'arithmetic', name: 'Arithmetic Word Problems', subtopicsCount: 8, pdfCount: 130 },
  ],
  english: [
    { id: 'rc', name: 'Reading Comprehension', subtopicsCount: 5, pdfCount: 60 },
    { id: 'cloze', name: 'Cloze Test', subtopicsCount: 4, pdfCount: 45 },
    { id: 'error-spotting', name: 'Error Spotting & Grammar', subtopicsCount: 5, pdfCount: 55 },
    { id: 'parajumbles', name: 'Para Jumbles & Sentence Rearrangement', subtopicsCount: 3, pdfCount: 40 },
    { id: 'vocab-pdf', name: 'Vocabulary & Idioms', subtopicsCount: 4, pdfCount: 40 },
  ],
  computer: [
    { id: 'basics', name: 'Computer Fundamentals & Hardware', subtopicsCount: 4, pdfCount: 35 },
    { id: 'networking', name: 'Networking & Internet Protocols', subtopicsCount: 3, pdfCount: 30 },
    { id: 'dbms', name: 'DBMS & Software Concepts', subtopicsCount: 3, pdfCount: 30 },
    { id: 'abbreviations', name: 'Computer Abbreviations & Shortcuts', subtopicsCount: 2, pdfCount: 30 },
  ],
  ga: [
    { id: 'financial', name: 'Banking & Financial Awareness', subtopicsCount: 5, pdfCount: 50 },
    { id: 'current-affairs-pdf', name: 'Monthly Current Affairs', subtopicsCount: 6, pdfCount: 55 },
    { id: 'static-gk', name: 'Static General Knowledge', subtopicsCount: 5, pdfCount: 55 },
  ],
};

export const SUBTOPICS_BY_TOPIC: Record<string, { id: string; name: string; pdfCount: number }[]> = {
  puzzle: [
    { id: 'linear-puzzle', name: 'Linear Puzzle (Single & Double Line)', pdfCount: 15 },
    { id: 'circular-puzzle', name: 'Circular Puzzle (Inward & Outward)', pdfCount: 14 },
    { id: 'floor-puzzle', name: 'Floor & Flat Based Puzzle', pdfCount: 12 },
    { id: 'box-puzzle', name: 'Box & Stack Based Puzzle', pdfCount: 12 },
    { id: 'scheduling-puzzle', name: 'Scheduling Puzzle (Month, Day & Year)', pdfCount: 12 },
    { id: 'matrix-puzzle', name: 'Matrix & Unknown Persons Puzzle', pdfCount: 10 },
    { id: 'category-puzzle', name: 'Category & Designation Based Puzzle', pdfCount: 10 },
  ],
  seating: [
    { id: 'square-seating', name: 'Square & Rectangular Seating', pdfCount: 15 },
    { id: 'parallel-line', name: 'Parallel Row Seating', pdfCount: 15 },
    { id: 'triangular', name: 'Triangular & Hexagonal Seating', pdfCount: 12 },
    { id: 'concentric', name: 'Concentric Circle Seating', pdfCount: 10 },
  ],
  di: [
    { id: 'bar-graph', name: 'Bar Graph & Line Chart DI', pdfCount: 20 },
    { id: 'pie-chart', name: 'Pie Chart & Table DI', pdfCount: 20 },
    { id: 'caselet', name: 'Caselet & Paragraph DI', pdfCount: 20 },
    { id: 'missing-di', name: 'Missing Data & Arithmetic DI', pdfCount: 20 },
  ],
  rc: [
    { id: 'economy-rc', name: 'Economy & Business Passages', pdfCount: 15 },
    { id: 'science-rc', name: 'Science & Environment Passages', pdfCount: 15 },
    { id: 'social-rc', name: 'Social Issues & History Passages', pdfCount: 15 },
    { id: 'inference-rc', name: 'Inference & Vocabulary Based RC', pdfCount: 15 },
  ],
};

export const MOCK_PDF_ITEMS: Record<string, PDFDocument[]> = {
  'linear-puzzle': [
    { id: 'pdf-lp-1', subtopicId: 'linear-puzzle', title: 'Linear Puzzle Practice Set 1 (SBI PO Prelims)', size: '2.4 MB', date: 'Yesterday', downloads: 1420, pages: 12, questionsCount: 25, examType: 'SBI PO' },
    { id: 'pdf-lp-2', subtopicId: 'linear-puzzle', title: 'Linear Puzzle Practice Set 2 (IBPS PO Prelims)', size: '2.8 MB', date: '2 days ago', downloads: 1180, pages: 14, questionsCount: 25, examType: 'IBPS PO' },
    { id: 'pdf-lp-3', subtopicId: 'linear-puzzle', title: 'Linear Puzzle Advanced Level (Mains Pattern)', size: '3.5 MB', date: '3 days ago', downloads: 950, pages: 18, questionsCount: 30, examType: 'SBI Mains', isNew: true },
    { id: 'pdf-lp-4', subtopicId: 'linear-puzzle', title: 'Single Row Facing North & South (20 Sets)', size: '3.1 MB', date: '1 week ago', downloads: 2100, pages: 16, questionsCount: 50, examType: 'RRB PO' },
    { id: 'pdf-lp-5', subtopicId: 'linear-puzzle', title: 'Double Row Parallel Line Puzzles', size: '2.9 MB', date: '2 weeks ago', downloads: 1840, pages: 15, questionsCount: 40, examType: 'IBPS Clerk' },
  ],
  'circular-puzzle': [
    { id: 'pdf-cp-1', subtopicId: 'circular-puzzle', title: 'Circular Arrangement Facing Inside/Outside Set 1', size: '2.6 MB', date: 'Yesterday', downloads: 1310, pages: 13, questionsCount: 25, examType: 'SBI PO' },
    { id: 'pdf-cp-2', subtopicId: 'circular-puzzle', title: 'Circular Seating with Variable Parameters Set 2', size: '3.4 MB', date: '4 days ago', downloads: 890, pages: 17, questionsCount: 30, examType: 'RBI Grade B' },
  ],
  'bar-graph': [
    { id: 'pdf-bg-1', subtopicId: 'bar-graph', title: 'Bar Graph DI 50 High-Yield Questions', size: '4.2 MB', date: 'Yesterday', downloads: 2400, pages: 22, questionsCount: 50, examType: 'IBPS PO', isNew: true },
    { id: 'pdf-bg-2', subtopicId: 'bar-graph', title: 'Double Bar Graph & Cumulative DI Sets', size: '3.8 MB', date: '3 days ago', downloads: 1750, pages: 20, questionsCount: 40, examType: 'SBI PO' },
  ],
  'economy-rc': [
    { id: 'pdf-erc-1', subtopicId: 'economy-rc', title: 'Editorial Reading Passages (Financial Times & Hindu)', size: '2.1 MB', date: 'Today', downloads: 3100, pages: 10, questionsCount: 30, examType: 'All Banking', isNew: true },
    { id: 'pdf-erc-2', subtopicId: 'economy-rc', title: 'Economic Survey Based Passages & Vocab', size: '2.7 MB', date: 'Yesterday', downloads: 1950, pages: 14, questionsCount: 35, examType: 'UPSC / RBI' },
  ],
};

export const getSubtopicPDFs = (subtopicId: string, subtopicName: string): PDFDocument[] => {
  if (MOCK_PDF_ITEMS[subtopicId]) return MOCK_PDF_ITEMS[subtopicId];
  return [
    { id: `gen-pdf-1-${subtopicId}`, subtopicId, title: `${subtopicName} - Practice Set 1 (Basic to Advanced)`, size: '2.5 MB', date: '2 days ago', downloads: 1250, pages: 12, questionsCount: 30, examType: 'Banking PO' },
    { id: `gen-pdf-2-${subtopicId}`, subtopicId, title: `${subtopicName} - High Level Exam Questions`, size: '3.1 MB', date: '4 days ago', downloads: 980, pages: 16, questionsCount: 35, examType: 'SBI / IBPS', isNew: true },
    { id: `gen-pdf-3-${subtopicId}`, subtopicId, title: `${subtopicName} - Previous 5 Years Collection`, size: '4.0 MB', date: '1 week ago', downloads: 1890, pages: 24, questionsCount: 50, examType: 'All Exams' },
    { id: `gen-pdf-4-${subtopicId}`, subtopicId, title: `${subtopicName} - Speed Booster & Shortcut Tricks`, size: '2.1 MB', date: '2 weeks ago', downloads: 1540, pages: 10, questionsCount: 25, examType: 'SSC / RRB' },
  ];
};

// Legacy exports preserved for backwards compatibility
export const pdfCategories = [
  { id: 'english', name: 'English Language', categories: ['banking', 'ssc', 'railways-rrb', 'civil-services'] },
  { id: 'reasoning', name: 'Reasoning Ability', categories: ['banking', 'ssc', 'railways-rrb'] },
  { id: 'quant', name: 'Quantitative Aptitude', categories: ['banking', 'ssc', 'railways-rrb'] },
  { id: 'gk', name: 'General Knowledge', categories: ['banking', 'ssc', 'railways-rrb', 'civil-services'] },
  { id: 'computer', name: 'Computer Awareness', categories: ['banking', 'ssc'] },
  { id: 'current', name: 'Current Affairs', categories: ['banking', 'ssc', 'railways-rrb', 'civil-services'] },
];

export const pdfData = {
  english: [
    { id: 1, title: 'English Grammar Basics', size: '2.5 MB', date: 'Apr 15, 2025', downloads: 1250, image: '/placeholder.svg', color: 'bg-blue-50', categories: ['banking', 'ssc'], examType: 'General' },
  ],
  reasoning: [
    { id: 5, title: 'Logical Reasoning Handbook', size: '4.1 MB', date: 'Apr 12, 2025', downloads: 1650, image: '/placeholder.svg', color: 'bg-indigo-50', categories: ['banking', 'ssc', 'railways-rrb'], examType: 'General' },
  ],
  quant: [
    { id: 8, title: 'Quantitative Aptitude Formulas', size: '3.7 MB', date: 'Apr 18, 2025', downloads: 3210, image: '/placeholder.svg', color: 'bg-blue-50', categories: ['banking', 'ssc', 'railways-rrb'], examType: 'General' },
  ],
  gk: [
    { id: 11, title: 'Banking & Financial Awareness', size: '3.9 MB', date: 'Apr 20, 2025', downloads: 2750, image: '/placeholder.svg', color: 'bg-teal-50', categories: ['banking'], examType: 'Banking Specific' },
  ],
};
