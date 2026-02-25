
import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface TestProgress {
  testId: string;
  testName: string;
  status: 'not-attempted' | 'in-progress' | 'completed';
  score?: number;
  maxScore: number;
  timeSpent?: number;
  attempts: number;
  lastAttempted?: string;
  rank?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ExamProgressData {
  examId: string;
  examName: string;
  totalUsers: number;
  userRank?: number;
  overallProgress: number;
  testTypes: {
    prelims: TestProgress[];
    mains: TestProgress[];
    sectional: TestProgress[];
    speed: TestProgress[];
    pyq: TestProgress[];
    live: TestProgress[];
  };
}

export const useExamProgress = (examId: string) => {
  const [progressData, setProgressData] = useLocalStorage<ExamProgressData>(`exam-progress-${examId}`, {
    examId,
    examName: '',
    totalUsers: 45320,
    userRank: 1243,
    overallProgress: 35,
    testTypes: {
      prelims: generateMockTests('prelims', 20),
      mains: generateMockTests('mains', 20),
      sectional: generateMockTests('sectional', 20),
      speed: generateMockTests('speed', 20),
      pyq: generateMockTests('pyq', 20),
      live: generateMockTests('live', 20)
    }
  });

  const updateTestProgress = (testType: keyof ExamProgressData['testTypes'], testId: string, updates: Partial<TestProgress>) => {
    setProgressData(prev => ({
      ...prev,
      testTypes: {
        ...prev.testTypes,
        [testType]: prev.testTypes[testType].map(test => 
          test.testId === testId ? { ...test, ...updates } : test
        )
      }
    }));
  };

  const getTypeProgress = (testType: keyof ExamProgressData['testTypes']) => {
    const tests = progressData.testTypes[testType];
    const completed = tests.filter(test => test.status === 'completed').length;
    const totalScore = tests.reduce((sum, test) => sum + (test.score || 0), 0);
    const maxPossibleScore = tests.reduce((sum, test) => sum + test.maxScore, 0);
    const averageScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    
    return {
      completed,
      total: tests.length,
      percentage: Math.round((completed / tests.length) * 100),
      averageScore: Math.round(averageScore),
      bestScore: Math.max(...tests.map(test => test.score || 0)),
      totalAttempts: tests.reduce((sum, test) => sum + test.attempts, 0)
    };
  };

  return {
    progressData,
    updateTestProgress,
    getTypeProgress,
    setProgressData
  };
};

function generateMockTests(type: string, count: number): TestProgress[] {
  const tests: TestProgress[] = [];
  const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
  
  for (let i = 1; i <= count; i++) {
    const status = Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'in-progress' : 'not-attempted';
    const maxScore = type === 'speed' ? 50 : type === 'sectional' ? 75 : 100;
    
    tests.push({
      testId: `${type}-${i}`,
      testName: `${type.charAt(0).toUpperCase() + type.slice(1)} Test ${i}`,
      status,
      score: status === 'completed' ? Math.floor(Math.random() * maxScore) + 20 : undefined,
      maxScore,
      timeSpent: status !== 'not-attempted' ? Math.floor(Math.random() * 3600) + 1800 : undefined,
      attempts: status === 'not-attempted' ? 0 : Math.floor(Math.random() * 3) + 1,
      lastAttempted: status !== 'not-attempted' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      rank: status === 'completed' ? Math.floor(Math.random() * 1000) + 1 : undefined,
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)]
    });
  }
  
  return tests;
}
