
export interface TestAnalysisData {
  testId: string;
  testName: string;
  date: string;
  score: number;
  maxScore: number;
  rank: number;
  totalStudents: number;
  percentile: number;
  accuracy: number;
  timeTaken: number;
  maxTime: number;
  passed: boolean;
  sectionWiseData: SectionData[];
  topicWiseData: TopicData[];
  questionWiseData: QuestionData[];
  performanceHistory: PerformanceData[];
  strongAreas: AreaAnalysis[];
  weakAreas: AreaAnalysis[];
  speedAnalysis: SpeedData[];
  comparisonData: ComparisonData;
}

export interface SectionData {
  sectionName: string;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  unseen: number;
  score: number;
  maxScore: number;
  rank: number;
  percentile: number;
  accuracy: number;
  timeSpent: number;
}

export interface TopicData {
  topicName: string;
  subject: string;
  attempted: number;
  correct: number;
  accuracy: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeSpent: number;
  avgTime: number;
}

export interface QuestionData {
  questionId: number;
  section: string;
  topic: string;
  status: 'correct' | 'wrong' | 'unattempted' | 'marked';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeSpent: number;
  avgTime: number;
}

export interface PerformanceData {
  testName: string;
  date: string;
  score: number;
  accuracy: number;
  rank: number;
  percentile: number;
}

export interface AreaAnalysis {
  area: string;
  score: number;
  status: 'strong' | 'weak' | 'average';
  questions: number[];
  improvement?: string;
}

export interface SpeedData {
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  avgTime: number;
  yourTime: number;
  questionsAttempted: number;
}

export interface ComparisonData {
  yourScore: number;
  averageScore: number;
  topperScore: number;
  peerRankRange: string;
  strategies: Strategy[];
}

export interface Strategy {
  title: string;
  description: string;
  impact: 'Very High' | 'High' | 'Medium' | 'Low';
  color: string;
}

export const mockTestAnalysis: TestAnalysisData = {
  testId: 'sbi-po-mock-1',
  testName: 'SBI PO Mock Test 1',
  date: 'May 18, 2025',
  score: 78,
  maxScore: 100,
  rank: 18,
  totalStudents: 1800,
  percentile: 94,
  accuracy: 90,
  timeTaken: 120,
  maxTime: 180,
  passed: true,
  sectionWiseData: [
    {
      sectionName: 'Reasoning Ability',
      attempted: 30,
      correct: 28,
      wrong: 2,
      skipped: 5,
      unseen: 0,
      score: 28,
      maxScore: 35,
      rank: 15,
      percentile: 92,
      accuracy: 93.3,
      timeSpent: 45
    },
    {
      sectionName: 'English Language',
      attempted: 25,
      correct: 22,
      wrong: 3,
      skipped: 5,
      unseen: 0,
      score: 22,
      maxScore: 30,
      rank: 25,
      percentile: 88,
      accuracy: 88,
      timeSpent: 35
    },
    {
      sectionName: 'Quantitative Aptitude',
      attempted: 25,
      correct: 20,
      wrong: 5,
      skipped: 10,
      unseen: 0,
      score: 20,
      maxScore: 35,
      rank: 30,
      percentile: 85,
      accuracy: 80,
      timeSpent: 40
    }
  ],
  topicWiseData: [
    {
      topicName: 'Logical Reasoning',
      subject: 'Reasoning',
      attempted: 15,
      correct: 14,
      accuracy: 93.3,
      difficulty: 'Medium',
      timeSpent: 25,
      avgTime: 1.8
    },
    {
      topicName: 'Data Interpretation',
      subject: 'Quantitative',
      attempted: 10,
      correct: 7,
      accuracy: 70,
      difficulty: 'Hard',
      timeSpent: 20,
      avgTime: 2.5
    },
    {
      topicName: 'Reading Comprehension',
      subject: 'English',
      attempted: 12,
      correct: 10,
      accuracy: 83.3,
      difficulty: 'Medium',
      timeSpent: 18,
      avgTime: 2.1
    },
    {
      topicName: 'Vocabulary',
      subject: 'English',
      attempted: 8,
      correct: 7,
      accuracy: 87.5,
      difficulty: 'Easy',
      timeSpent: 10,
      avgTime: 1.5
    },
    {
      topicName: 'Arithmetic',
      subject: 'Quantitative',
      attempted: 15,
      correct: 13,
      accuracy: 86.7,
      difficulty: 'Medium',
      timeSpent: 20,
      avgTime: 1.9
    }
  ],
  questionWiseData: Array.from({ length: 100 }, (_, i) => ({
    questionId: i + 1,
    section: i < 35 ? 'Reasoning' : i < 65 ? 'English' : 'Quantitative',
    topic: 'Sample Topic',
    status: i < 70 ? (Math.random() > 0.1 ? 'correct' : 'wrong') : 'unattempted',
    difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)] as 'Easy' | 'Medium' | 'Hard',
    timeSpent: Math.floor(Math.random() * 3) + 1,
    avgTime: 2
  })),
  performanceHistory: [
    { testName: 'Mock Test 1', date: '2025-05-18', score: 78, accuracy: 90, rank: 18, percentile: 94 },
    { testName: 'Mock Test 2', date: '2025-05-15', score: 72, accuracy: 85, rank: 25, percentile: 89 },
    { testName: 'Mock Test 3', date: '2025-05-12', score: 65, accuracy: 78, rank: 45, percentile: 82 },
    { testName: 'Mock Test 4', date: '2025-05-09', score: 58, accuracy: 72, rank: 68, percentile: 75 }
  ],
  strongAreas: [
    { area: 'Reading Comprehension', score: 85, status: 'strong', questions: [1, 2, 3, 4, 5] },
    { area: 'Vocabulary', score: 92, status: 'strong', questions: [6, 7, 8, 9] },
    { area: 'Grammar', score: 78, status: 'average', questions: [10, 11, 12] }
  ],
  weakAreas: [
    { area: 'Para Jumbles', score: 45, status: 'weak', questions: [13, 14, 15], improvement: 'Practice more passage ordering' },
    { area: 'Error Spotting', score: 52, status: 'weak', questions: [16, 17, 18, 19], improvement: 'Focus on grammar rules' }
  ],
  speedAnalysis: [
    { topic: 'Reading Comprehension', difficulty: 'Easy', avgTime: 2.5, yourTime: 2.1, questionsAttempted: 12 },
    { topic: 'Logical Reasoning', difficulty: 'Medium', avgTime: 1.8, yourTime: 1.6, questionsAttempted: 15 },
    { topic: 'Data Interpretation', difficulty: 'Hard', avgTime: 3.2, yourTime: 4.1, questionsAttempted: 10 }
  ],
  comparisonData: {
    yourScore: 78,
    averageScore: 45,
    topperScore: 90,
    peerRankRange: "15-25",
    strategies: [
      {
        title: "Time Management",
        description: "Completed test 15 minutes early",
        impact: "Very High",
        color: "green"
      },
      {
        title: "Accuracy Focus",
        description: "95% accuracy with selective attempts",
        impact: "High",
        color: "blue"
      },
      {
        title: "Sectional Strategy",
        description: "Balanced performance across all sections",
        impact: "High",
        color: "purple"
      },
      {
        title: "Question Selection",
        description: "Skipped difficult questions strategically",
        impact: "Medium",
        color: "orange"
      }
    ]
  }
};

export const generateMockAnalysisData = (testId: string, testName: string): TestAnalysisData => {
  const baseData = { ...mockTestAnalysis };
  baseData.testId = testId;
  baseData.testName = testName;
  baseData.score = Math.floor(Math.random() * 40) + 60; // 60-100
  baseData.rank = Math.floor(Math.random() * 50) + 1; // 1-50
  baseData.percentile = Math.floor(Math.random() * 30) + 70; // 70-100
  baseData.accuracy = Math.floor(Math.random() * 30) + 70; // 70-100
  baseData.passed = baseData.score >= 65;
  
  return baseData;
};
