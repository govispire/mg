
export interface CategoryPerformanceData {
  categoryId: string;
  categoryName: string;
  overallScore: number;
  percentile: number;
  rank: number;
  totalStudents: number;
  strongAreas: AreaPerformance[];
  weakAreas: AreaPerformance[];
  recentTests: CategoryTestResult[];
  progressTrend: ProgressPoint[];
  subjectPerformance: SubjectPerformance[];
}

export interface AreaPerformance {
  area: string;
  score: number;
  status: 'strong' | 'weak' | 'average';
  improvement?: string;
}

export interface CategoryTestResult {
  testName: string;
  date: string;
  score: number;
  maxScore: number;
  duration: string;
  categoryId: string;
}

export interface ProgressPoint {
  date: string;
  score: number;
  testType: string;
}

export interface SubjectPerformance {
  subject: string;
  score: number;
  average: number;
  percentile: number;
}

export const categoryPerformanceData: CategoryPerformanceData[] = [
  {
    categoryId: 'upsc',
    categoryName: 'UPSC Civil Services',
    overallScore: 72,
    percentile: 85,
    rank: 145,
    totalStudents: 1000,
    strongAreas: [
      { area: 'History', score: 85, status: 'strong' },
      { area: 'Geography', score: 80, status: 'strong' },
      { area: 'Polity', score: 78, status: 'average' }
    ],
    weakAreas: [
      { area: 'Economics', score: 58, status: 'weak', improvement: 'Focus on basic economic concepts and current economic policies' },
      { area: 'Environment', score: 62, status: 'weak', improvement: 'Study environmental laws and climate change topics' }
    ],
    recentTests: [
      { testName: 'UPSC Prelims Mock 1', date: '2024-01-28', score: 78, maxScore: 100, duration: '120 min', categoryId: 'upsc' },
      { testName: 'UPSC Prelims Mock 2', date: '2024-01-25', score: 75, maxScore: 100, duration: '120 min', categoryId: 'upsc' },
      { testName: 'CSAT Practice Test', date: '2024-01-22', score: 68, maxScore: 80, duration: '120 min', categoryId: 'upsc' }
    ],
    progressTrend: [
      { date: '2024-01-15', score: 65, testType: 'Mock Test' },
      { date: '2024-01-18', score: 70, testType: 'Sectional' },
      { date: '2024-01-22', score: 68, testType: 'CSAT' },
      { date: '2024-01-25', score: 75, testType: 'Mock Test' },
      { date: '2024-01-28', score: 78, testType: 'Mock Test' }
    ],
    subjectPerformance: [
      { subject: 'History', score: 85, average: 70, percentile: 92 },
      { subject: 'Geography', score: 80, average: 68, percentile: 88 },
      { subject: 'Polity', score: 78, average: 72, percentile: 82 },
      { subject: 'Economics', score: 58, average: 65, percentile: 45 },
      { subject: 'Environment', score: 62, average: 60, percentile: 55 }
    ]
  },
  {
    categoryId: 'banking-insurance',
    categoryName: 'Banking & Insurance',
    overallScore: 82,
    percentile: 92,
    rank: 45,
    totalStudents: 500,
    strongAreas: [
      { area: 'Banking Awareness', score: 90, status: 'strong' },
      { area: 'Computer Knowledge', score: 88, status: 'strong' },
      { area: 'English Language', score: 85, status: 'strong' }
    ],
    weakAreas: [
      { area: 'Quantitative Aptitude', score: 70, status: 'weak', improvement: 'Practice more word problems and data interpretation' },
      { area: 'Reasoning Ability', score: 75, status: 'average', improvement: 'Focus on puzzle and seating arrangement questions' }
    ],
    recentTests: [
      { testName: 'IBPS PO Mock Test 3', date: '2024-01-29', score: 85, maxScore: 100, duration: '180 min', categoryId: 'banking-insurance' },
      { testName: 'SBI Clerk Practice Test', date: '2024-01-26', score: 82, maxScore: 100, duration: '60 min', categoryId: 'banking-insurance' },
      { testName: 'Banking Awareness Test', date: '2024-01-24', score: 90, maxScore: 100, duration: '30 min', categoryId: 'banking-insurance' }
    ],
    progressTrend: [
      { date: '2024-01-10', score: 75, testType: 'Mock Test' },
      { date: '2024-01-15', score: 78, testType: 'Sectional' },
      { date: '2024-01-20', score: 80, testType: 'Speed Test' },
      { date: '2024-01-26', score: 82, testType: 'Practice Test' },
      { date: '2024-01-29', score: 85, testType: 'Mock Test' }
    ],
    subjectPerformance: [
      { subject: 'Banking Awareness', score: 90, average: 75, percentile: 95 },
      { subject: 'Computer Knowledge', score: 88, average: 70, percentile: 92 },
      { subject: 'English Language', score: 85, average: 68, percentile: 88 },
      { subject: 'Reasoning Ability', score: 75, average: 72, percentile: 68 },
      { subject: 'Quantitative Aptitude', score: 70, average: 65, percentile: 62 }
    ]
  },
  {
    categoryId: 'ssc',
    categoryName: 'SSC Exams',
    overallScore: 76,
    percentile: 80,
    rank: 180,
    totalStudents: 900,
    strongAreas: [
      { area: 'General Intelligence', score: 85, status: 'strong' },
      { area: 'English Comprehension', score: 82, status: 'strong' },
      { area: 'General Awareness', score: 78, status: 'average' }
    ],
    weakAreas: [
      { area: 'Quantitative Aptitude', score: 65, status: 'weak', improvement: 'Focus on basic mathematics and arithmetic' },
      { area: 'General Science', score: 68, status: 'weak', improvement: 'Study physics, chemistry, and biology basics' }
    ],
    recentTests: [
      { testName: 'SSC CGL Mock Test 2', date: '2024-01-30', score: 78, maxScore: 100, duration: '75 min', categoryId: 'ssc' },
      { testName: 'SSC CHSL Practice Test', date: '2024-01-27', score: 75, maxScore: 100, duration: '60 min', categoryId: 'ssc' },
      { testName: 'SSC MTS Mock Test', date: '2024-01-23', score: 72, maxScore: 100, duration: '90 min', categoryId: 'ssc' }
    ],
    progressTrend: [
      { date: '2024-01-12', score: 68, testType: 'Mock Test' },
      { date: '2024-01-17', score: 70, testType: 'Sectional' },
      { date: '2024-01-23', score: 72, testType: 'Mock Test' },
      { date: '2024-01-27', score: 75, testType: 'Practice Test' },
      { date: '2024-01-30', score: 78, testType: 'Mock Test' }
    ],
    subjectPerformance: [
      { subject: 'General Intelligence', score: 85, average: 70, percentile: 90 },
      { subject: 'English Comprehension', score: 82, average: 65, percentile: 88 },
      { subject: 'General Awareness', score: 78, average: 72, percentile: 75 },
      { subject: 'General Science', score: 68, average: 60, percentile: 65 },
      { subject: 'Quantitative Aptitude', score: 65, average: 58, percentile: 60 }
    ]
  },
  {
    categoryId: 'railways-rrb',
    categoryName: 'Railway Exams',
    overallScore: 74,
    percentile: 78,
    rank: 220,
    totalStudents: 1000,
    strongAreas: [
      { area: 'General Science', score: 82, status: 'strong' },
      { area: 'General Awareness', score: 80, status: 'strong' },
      { area: 'Mathematics', score: 75, status: 'average' }
    ],
    weakAreas: [
      { area: 'Reasoning', score: 66, status: 'weak', improvement: 'Practice logical reasoning and puzzles' },
      { area: 'Technical Ability', score: 68, status: 'weak', improvement: 'Study technical concepts related to your trade' }
    ],
    recentTests: [
      { testName: 'RRB NTPC Mock Test 1', date: '2024-01-31', score: 76, maxScore: 100, duration: '90 min', categoryId: 'railways-rrb' },
      { testName: 'RRB Group D Practice Test', date: '2024-01-28', score: 74, maxScore: 100, duration: '90 min', categoryId: 'railways-rrb' },
      { testName: 'Railway General Science Test', date: '2024-01-25', score: 82, maxScore: 100, duration: '45 min', categoryId: 'railways-rrb' }
    ],
    progressTrend: [
      { date: '2024-01-14', score: 70, testType: 'Mock Test' },
      { date: '2024-01-19', score: 72, testType: 'Sectional' },
      { date: '2024-01-25', score: 82, testType: 'Subject Test' },
      { date: '2024-01-28', score: 74, testType: 'Practice Test' },
      { date: '2024-01-31', score: 76, testType: 'Mock Test' }
    ],
    subjectPerformance: [
      { subject: 'General Science', score: 82, average: 68, percentile: 88 },
      { subject: 'General Awareness', score: 80, average: 70, percentile: 82 },
      { subject: 'Mathematics', score: 75, average: 65, percentile: 75 },
      { subject: 'Technical Ability', score: 68, average: 60, percentile: 65 },
      { subject: 'Reasoning', score: 66, average: 62, percentile: 58 }
    ]
  },
  {
    categoryId: 'cat',
    categoryName: 'CAT/MBA Entrance',
    overallScore: 68,
    percentile: 75,
    rank: 850,
    totalStudents: 3500,
    strongAreas: [
      { area: 'Verbal Ability', score: 78, status: 'strong' },
      { area: 'Reading Comprehension', score: 75, status: 'average' }
    ],
    weakAreas: [
      { area: 'Quantitative Aptitude', score: 58, status: 'weak', improvement: 'Focus on advanced mathematics and problem-solving techniques' },
      { area: 'Data Interpretation', score: 62, status: 'weak', improvement: 'Practice chart analysis and calculation speed' },
      { area: 'Logical Reasoning', score: 65, status: 'weak', improvement: 'Work on critical reasoning and logical puzzles' }
    ],
    recentTests: [
      { testName: 'CAT Mock Test 5', date: '2024-01-30', score: 70, maxScore: 100, duration: '180 min', categoryId: 'cat' },
      { testName: 'XAT Practice Test', date: '2024-01-26', score: 68, maxScore: 100, duration: '210 min', categoryId: 'cat' },
      { testName: 'SNAP Mock Test', date: '2024-01-22', score: 65, maxScore: 100, duration: '60 min', categoryId: 'cat' }
    ],
    progressTrend: [
      { date: '2024-01-08', score: 60, testType: 'Mock Test' },
      { date: '2024-01-15', score: 62, testType: 'Sectional' },
      { date: '2024-01-22', score: 65, testType: 'Mock Test' },
      { date: '2024-01-26', score: 68, testType: 'Practice Test' },
      { date: '2024-01-30', score: 70, testType: 'Mock Test' }
    ],
    subjectPerformance: [
      { subject: 'Verbal Ability', score: 78, average: 65, percentile: 85 },
      { subject: 'Reading Comprehension', score: 75, average: 68, percentile: 78 },
      { subject: 'Logical Reasoning', score: 65, average: 60, percentile: 68 },
      { subject: 'Data Interpretation', score: 62, average: 58, percentile: 65 },
      { subject: 'Quantitative Aptitude', score: 58, average: 55, percentile: 60 }
    ]
  }
];

export const getPerformanceDataByCategories = (categoryIds: string[]): CategoryPerformanceData[] => {
  if (categoryIds.length === 0) return categoryPerformanceData;
  
  return categoryPerformanceData.filter(data => 
    categoryIds.includes(data.categoryId)
  );
};

export const getAggregatedPerformanceStats = (categoryIds: string[]) => {
  const data = getPerformanceDataByCategories(categoryIds);
  
  if (data.length === 0) return null;
  
  const totalTests = data.reduce((sum, cat) => sum + cat.recentTests.length, 0);
  const avgScore = Math.round(data.reduce((sum, cat) => sum + cat.overallScore, 0) / data.length);
  const avgPercentile = Math.round(data.reduce((sum, cat) => sum + cat.percentile, 0) / data.length);
  
  return {
    categoriesCount: data.length,
    totalTests,
    averageScore: avgScore,
    averagePercentile: avgPercentile,
    strongAreas: data.flatMap(cat => cat.strongAreas).length,
    weakAreas: data.flatMap(cat => cat.weakAreas).length
  };
};
