
import { useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface TestProgress {
  testId: string;
  testName: string;
  status: 'not-attempted' | 'in-progress' | 'completed';
  score?: number;
  maxScore: number;
  totalQuestions: number;
  totalMarks: number;
  totalDuration: number; // in minutes
  totalStudents: number; // total students who attempted this test
  timeSpent?: number;
  attempts: number;
  lastAttempted?: string;
  rank?: number;
  percentile?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  subjectId?: string; // which subject subsection this test belongs to
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
      sectional: generateMockTests('sectional', 30),
      speed: generateMockTests('speed', 30),
      pyq: generateMockTests('pyq', 20),
      live: generateMockTests('live', 20)
    }
  });

  // Migrate stale cached tests (old format missing rank / totalStudents / subjectId)
  useEffect(() => {
    const missingRank = (tests: TestProgress[]) =>
      tests.some(t => t.status === 'completed' && (t.rank === undefined || t.totalStudents === undefined));

    const needsMigration = (
      progressData.testTypes.sectional.some(t => !t.subjectId) ||
      progressData.testTypes.speed.some(t => !t.subjectId) ||
      progressData.testTypes.sectional.length !== 30 ||
      progressData.testTypes.speed.length !== 30 ||
      missingRank(progressData.testTypes.prelims) ||
      missingRank(progressData.testTypes.mains) ||
      missingRank(progressData.testTypes.pyq) ||
      missingRank(progressData.testTypes.live)
    );
    if (needsMigration) {
      setProgressData(prev => ({
        ...prev,
        testTypes: {
          sectional: generateMockTests('sectional', 30),
          speed: generateMockTests('speed', 30),
          prelims: missingRank(prev.testTypes.prelims) ? generateMockTests('prelims', 20) : prev.testTypes.prelims,
          mains: missingRank(prev.testTypes.mains) ? generateMockTests('mains', 20) : prev.testTypes.mains,
          pyq: missingRank(prev.testTypes.pyq) ? generateMockTests('pyq', 20) : prev.testTypes.pyq,
          live: missingRank(prev.testTypes.live) ? generateMockTests('live', 20) : prev.testTypes.live,
        },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);
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

  // For sectional and speed types, generate 10 tests per subject with subject-prefixed names
  const subjectGroups = [
    { id: 'reasoning', label: 'Reasoning Ability' },
    { id: 'english', label: 'English Language' },
    { id: 'quantitative', label: 'Quantitative Aptitude' },
  ];

  const typeLabel = type === 'sectional' ? 'Sectional' : 'Speed';
  const testsPerSubject = 10;

  if (type === 'sectional' || type === 'speed') {
    for (const subject of subjectGroups) {
      for (let i = 1; i <= testsPerSubject; i++) {
        const status = Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'in-progress' : 'not-attempted';
        const totalQuestions = type === 'speed' ? 30 : 50;
        const totalMarks = totalQuestions;
        const totalDuration = type === 'speed' ? 20 : 30;
        const totalStudents = Math.floor(Math.random() * 30000) + 10000;
        const maxScore = totalMarks;
        const rank = status === 'completed' ? Math.floor(Math.random() * totalStudents * 0.5) + 1 : undefined;
        const score = status === 'completed' ? Math.floor(Math.random() * maxScore) + 10 : undefined;
        const percentile = (rank && totalStudents) ? Math.round(((totalStudents - rank) / totalStudents) * 100 * 10) / 10 : undefined;

        tests.push({
          testId: `${type}-${subject.id}-${i}`,
          testName: `${subject.label} ${typeLabel} Test ${i}`,
          status,
          score,
          maxScore,
          totalQuestions,
          totalMarks,
          totalDuration,
          totalStudents,
          timeSpent: status !== 'not-attempted' ? Math.floor(Math.random() * 1800) + 600 : undefined,
          attempts: status === 'not-attempted' ? 0 : Math.floor(Math.random() * 3) + 1,
          lastAttempted: status !== 'not-attempted' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
          rank,
          percentile,
          difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
          subjectId: subject.id,
        });
      }
    }
    return tests;
  }

  // For other types (prelims, mains, pyq, live) — standard flat generation
  for (let i = 1; i <= count; i++) {
    const status = Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'in-progress' : 'not-attempted';
    const totalQuestions = 100;
    const totalMarks = totalQuestions;
    const totalDuration = 60;
    const totalStudents = Math.floor(Math.random() * 30000) + 10000;
    const maxScore = totalMarks;
    const rank = status === 'completed' ? Math.floor(Math.random() * totalStudents * 0.5) + 1 : undefined;
    const score = status === 'completed' ? Math.floor(Math.random() * maxScore) + 20 : undefined;
    const percentile = (rank && totalStudents) ? Math.round(((totalStudents - rank) / totalStudents) * 100 * 10) / 10 : undefined;

    tests.push({
      testId: `${type}-${i}`,
      testName: `${type.charAt(0).toUpperCase() + type.slice(1)} Test ${i}`,
      status,
      score,
      maxScore,
      totalQuestions,
      totalMarks,
      totalDuration,
      totalStudents,
      timeSpent: status !== 'not-attempted' ? Math.floor(Math.random() * 3600) + 1800 : undefined,
      attempts: status === 'not-attempted' ? 0 : Math.floor(Math.random() * 3) + 1,
      lastAttempted: status !== 'not-attempted' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      rank,
      percentile,
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      subjectId: undefined,
    });
  }

  return tests;
}
