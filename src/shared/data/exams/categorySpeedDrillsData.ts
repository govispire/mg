
export interface CategorySpeedDrill {
  id: string;
  title: string;
  categoryIds: string[];
  subject: string;
  questions: number;
  timeLimit: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isAttempted: boolean;
  averageScore?: number;
  topics: string[];
  icon?: string;
}

export const categorySpeedDrills: CategorySpeedDrill[] = [
  // UPSC Speed Drills
  {
    id: 'upsc-drill-1',
    title: 'CSAT Logical Reasoning',
    categoryIds: ['upsc', 'civil-services'],
    subject: 'reasoning',
    questions: 15,
    timeLimit: '10 min',
    difficulty: 'Medium',
    isAttempted: false,
    topics: ['Logical Reasoning', 'Analytical Ability'],
    icon: '🧩'
  },
  {
    id: 'upsc-drill-2',
    title: 'CSAT Data Interpretation',
    categoryIds: ['upsc', 'civil-services'],
    subject: 'quantitative',
    questions: 10,
    timeLimit: '12 min',
    difficulty: 'Hard',
    isAttempted: true,
    averageScore: 7,
    topics: ['Data Interpretation', 'Basic Numeracy'],
    icon: '📊'
  },
  {
    id: 'upsc-drill-3',
    title: 'Reading Comprehension for UPSC',
    categoryIds: ['upsc', 'civil-services'],
    subject: 'english',
    questions: 8,
    timeLimit: '8 min',
    difficulty: 'Medium',
    isAttempted: false,
    topics: ['Reading Comprehension', 'Passage Analysis'],
    icon: '🔤'
  },

  // Banking Speed Drills
  {
    id: 'banking-drill-1',
    title: 'Banking Quantitative Aptitude',
    categoryIds: ['banking-insurance', 'banking'],
    subject: 'quantitative',
    questions: 20,
    timeLimit: '15 min',
    difficulty: 'Medium',
    isAttempted: true,
    averageScore: 16,
    topics: ['Profit & Loss', 'Simple Interest', 'Compound Interest'],
    icon: '📊'
  },
  {
    id: 'banking-drill-2',
    title: 'Banking Reasoning Ability',
    categoryIds: ['banking-insurance', 'banking'],
    subject: 'reasoning',
    questions: 15,
    timeLimit: '10 min',
    difficulty: 'Medium',
    isAttempted: false,
    topics: ['Seating Arrangement', 'Syllogism', 'Blood Relations'],
    icon: '🧩'
  },
  {
    id: 'banking-drill-3',
    title: 'Banking English Language',
    categoryIds: ['banking-insurance', 'banking'],
    subject: 'english',
    questions: 12,
    timeLimit: '8 min',
    difficulty: 'Easy',
    isAttempted: true,
    averageScore: 10,
    topics: ['Error Spotting', 'Reading Comprehension', 'Vocabulary'],
    icon: '🔤'
  },
  {
    id: 'banking-drill-4',
    title: 'Banking Awareness Quick Test',
    categoryIds: ['banking-insurance', 'banking'],
    subject: 'gen-awareness',
    questions: 15,
    timeLimit: '6 min',
    difficulty: 'Easy',
    isAttempted: false,
    topics: ['RBI Functions', 'Banking Terms', 'Financial Institutions'],
    icon: '🌍'
  },
  {
    id: 'banking-drill-5',
    title: 'Computer Knowledge for Banking',
    categoryIds: ['banking-insurance', 'banking'],
    subject: 'computer',
    questions: 10,
    timeLimit: '5 min',
    difficulty: 'Easy',
    isAttempted: false,
    topics: ['MS Office', 'Internet', 'Computer Basics'],
    icon: '💻'
  },

  // SSC Speed Drills
  {
    id: 'ssc-drill-1',
    title: 'SSC Mathematics Speed Test',
    categoryIds: ['ssc'],
    subject: 'quantitative',
    questions: 25,
    timeLimit: '15 min',
    difficulty: 'Medium',
    isAttempted: true,
    averageScore: 20,
    topics: ['Algebra', 'Geometry', 'Arithmetic'],
    icon: '📊'
  },
  {
    id: 'ssc-drill-2',
    title: 'SSC General Intelligence',
    categoryIds: ['ssc'],
    subject: 'reasoning',
    questions: 20,
    timeLimit: '12 min',
    difficulty: 'Easy',
    isAttempted: false,
    topics: ['Analogies', 'Classification', 'Series'],
    icon: '🧩'
  },
  {
    id: 'ssc-drill-3',
    title: 'SSC English Comprehension',
    categoryIds: ['ssc'],
    subject: 'english',
    questions: 15,
    timeLimit: '10 min',
    difficulty: 'Easy',
    isAttempted: true,
    averageScore: 12,
    topics: ['Grammar', 'Vocabulary', 'Comprehension'],
    icon: '🔤'
  },
  {
    id: 'ssc-drill-4',
    title: 'SSC General Awareness',
    categoryIds: ['ssc'],
    subject: 'gen-awareness',
    questions: 20,
    timeLimit: '8 min',
    difficulty: 'Medium',
    isAttempted: false,
    topics: ['History', 'Geography', 'Polity', 'Current Affairs'],
    icon: '🌍'
  },

  // Railway Speed Drills
  {
    id: 'railway-drill-1',
    title: 'Railway Mathematics',
    categoryIds: ['railways-rrb', 'railway'],
    subject: 'quantitative',
    questions: 20,
    timeLimit: '15 min',
    difficulty: 'Medium',
    isAttempted: false,
    topics: ['Speed Time Distance', 'Percentage', 'Ratio'],
    icon: '📊'
  },
  {
    id: 'railway-drill-2',
    title: 'Railway General Science',
    categoryIds: ['railways-rrb', 'railway'],
    subject: 'gen-awareness',
    questions: 15,
    timeLimit: '10 min',
    difficulty: 'Easy',
    isAttempted: true,
    averageScore: 12,
    topics: ['Physics', 'Chemistry', 'Biology'],
    icon: '🌍'
  },
  {
    id: 'railway-drill-3',
    title: 'Railway Reasoning',
    categoryIds: ['railways-rrb', 'railway'],
    subject: 'reasoning',
    questions: 15,
    timeLimit: '10 min',
    difficulty: 'Medium',
    isAttempted: false,
    topics: ['Coding-Decoding', 'Direction Sense', 'Number Series'],
    icon: '🧩'
  },

  // CAT Speed Drills
  {
    id: 'cat-drill-1',
    title: 'CAT Quantitative Aptitude',
    categoryIds: ['cat', 'management-entrance'],
    subject: 'quantitative',
    questions: 12,
    timeLimit: '20 min',
    difficulty: 'Hard',
    isAttempted: false,
    topics: ['Advanced Algebra', 'Geometry', 'Number Systems'],
    icon: '📊'
  },
  {
    id: 'cat-drill-2',
    title: 'CAT Verbal Ability',
    categoryIds: ['cat', 'management-entrance'],
    subject: 'english',
    questions: 10,
    timeLimit: '15 min',
    difficulty: 'Hard',
    isAttempted: true,
    averageScore: 7,
    topics: ['Reading Comprehension', 'Para Jumbles', 'Critical Reasoning'],
    icon: '🔤'
  },
  {
    id: 'cat-drill-3',
    title: 'CAT Data Interpretation',
    categoryIds: ['cat', 'management-entrance'],
    subject: 'quantitative',
    questions: 8,
    timeLimit: '16 min',
    difficulty: 'Hard',
    isAttempted: false,
    topics: ['Charts & Graphs', 'Tables', 'Data Analysis'],
    icon: '📊'
  }
];

export const getSpeedDrillsByCategories = (categoryIds: string[]): CategorySpeedDrill[] => {
  if (categoryIds.length === 0) return categorySpeedDrills;
  
  return categorySpeedDrills.filter(drill => 
    drill.categoryIds.some(categoryId => categoryIds.includes(categoryId))
  );
};

export const getSpeedDrillsBySubject = (subject: string, categoryIds: string[] = []): CategorySpeedDrill[] => {
  const filteredByCategory = getSpeedDrillsByCategories(categoryIds);
  return filteredByCategory.filter(drill => drill.subject === subject);
};

export const getSpeedDrillsStats = (categoryIds: string[]) => {
  const drills = getSpeedDrillsByCategories(categoryIds);
  const attempted = drills.filter(d => d.isAttempted);
  
  return {
    total: drills.length,
    attempted: attempted.length,
    averageScore: attempted.length > 0 
      ? Math.round(attempted.reduce((sum, d) => sum + (d.averageScore || 0), 0) / attempted.length)
      : 0,
    totalQuestions: attempted.reduce((sum, d) => sum + d.questions, 0),
    subjects: [...new Set(drills.map(d => d.subject))].length
  };
};
