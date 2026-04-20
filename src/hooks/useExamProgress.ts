
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
    userRank: undefined,
    overallProgress: 0,
    testTypes: {
      prelims: generateMockTests('prelims', 20),
      mains: generateMockTests('mains', 20),
      sectional: generateMockTests('sectional', 30),
      speed: generateMockTests('speed', 30),
      pyq: generateMockTests('pyq', 20),
      live: generateMockTests('live', 20)
    }
  });

  // Migrate stale cached tests — wipe any tests that were randomly set to
  // 'completed' or 'in-progress' without actual user action (old format).
  useEffect(() => {
    const hasRandomCompleted = (tests: TestProgress[]) =>
      tests.some(t => t.status !== 'not-attempted' && !t.lastAttempted);

    const missingRank = (tests: TestProgress[]) =>
      tests.some(t => t.status === 'completed' && (t.rank === undefined || t.totalStudents === undefined));

    const needsMigration = (
      progressData.testTypes.sectional.some(t => !t.subjectId) ||
      progressData.testTypes.speed.some(t => !t.subjectId) ||
      progressData.testTypes.sectional.length !== 30 ||
      progressData.testTypes.speed.length !== 30 ||
      // Re-generate any type that has phantom completions (no lastAttempted = was randomly seeded)
      hasRandomCompleted(progressData.testTypes.prelims) ||
      hasRandomCompleted(progressData.testTypes.mains) ||
      hasRandomCompleted(progressData.testTypes.sectional) ||
      hasRandomCompleted(progressData.testTypes.speed) ||
      hasRandomCompleted(progressData.testTypes.pyq) ||
      hasRandomCompleted(progressData.testTypes.live) ||
      missingRank(progressData.testTypes.prelims) ||
      missingRank(progressData.testTypes.mains) ||
      missingRank(progressData.testTypes.pyq) ||
      missingRank(progressData.testTypes.live)
    );
    if (needsMigration) {
      setProgressData(prev => ({
        ...prev,
        overallProgress: 0,
        userRank: undefined,
        testTypes: {
          prelims: generateMockTests('prelims', 20),
          mains: generateMockTests('mains', 20),
          sectional: generateMockTests('sectional', 30),
          speed: generateMockTests('speed', 30),
          pyq: generateMockTests('pyq', 20),
          live: generateMockTests('live', 20),
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
        // All tests start as not-attempted — status only changes when a student actually submits
        const totalQuestions = type === 'speed' ? 30 : 50;
        const totalMarks = totalQuestions;
        const totalDuration = type === 'speed' ? 20 : 30;
        const totalStudents = Math.floor(Math.random() * 30000) + 10000;
        const maxScore = totalMarks;

        tests.push({
          testId: `${type}-${subject.id}-${i}`,
          testName: `${subject.label} ${typeLabel} Test ${i}`,
          status: 'not-attempted',
          score: undefined,
          maxScore,
          totalQuestions,
          totalMarks,
          totalDuration,
          totalStudents,
          timeSpent: undefined,
          attempts: 0,
          lastAttempted: undefined,
          rank: undefined,
          percentile: undefined,
          difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
          subjectId: subject.id,
        });
      }
    }
    return tests;
  }

  // For other types (prelims, mains, pyq, live) — all start as not-attempted
  for (let i = 1; i <= count; i++) {
    const totalQuestions = 100;
    const totalMarks = totalQuestions;
    const totalDuration = 60;
    const totalStudents = Math.floor(Math.random() * 30000) + 10000;
    const maxScore = totalMarks;

    tests.push({
      testId: `${type}-${i}`,
      testName: `${type.charAt(0).toUpperCase() + type.slice(1)} Test ${i}`,
      status: 'not-attempted',
      score: undefined,
      maxScore,
      totalQuestions,
      totalMarks,
      totalDuration,
      totalStudents,
      timeSpent: undefined,
      attempts: 0,
      lastAttempted: undefined,
      rank: undefined,
      percentile: undefined,
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      subjectId: undefined,
    });
  }

  return tests;
}
