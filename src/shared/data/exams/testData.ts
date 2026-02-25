
export interface TestItem {
  id: string;
  title: string;
  duration: string;
  questions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  attempts: number;
  completed: boolean;
  bestScore?: number;
  category: string;
  subject?: string;
}

export const sectionalTests: TestItem[] = [
  {
    id: 'reasoning-1',
    title: 'Logical Reasoning - Basic',
    duration: '45 min',
    questions: 30,
    difficulty: 'Easy',
    attempts: 156,
    completed: true,
    bestScore: 85,
    category: 'sectional',
    subject: 'reasoning'
  },
  {
    id: 'reasoning-2',
    title: 'Puzzles & Seating Arrangement',
    duration: '60 min',
    questions: 40,
    difficulty: 'Medium',
    attempts: 89,
    completed: false,
    category: 'sectional',
    subject: 'reasoning'
  },
  {
    id: 'english-1',
    title: 'Reading Comprehension',
    duration: '30 min',
    questions: 25,
    difficulty: 'Medium',
    attempts: 120,
    completed: true,
    bestScore: 78,
    category: 'sectional',
    subject: 'english'
  },
  {
    id: 'english-2',
    title: 'Grammar & Vocabulary',
    duration: '45 min',
    questions: 35,
    difficulty: 'Easy',
    attempts: 203,
    completed: false,
    category: 'sectional',
    subject: 'english'
  },
  {
    id: 'quant-1',
    title: 'Number Systems',
    duration: '40 min',
    questions: 30,
    difficulty: 'Medium',
    attempts: 95,
    completed: true,
    bestScore: 92,
    category: 'sectional',
    subject: 'quantitative'
  },
  {
    id: 'quant-2',
    title: 'Data Interpretation',
    duration: '50 min',
    questions: 25,
    difficulty: 'Hard',
    attempts: 67,
    completed: false,
    category: 'sectional',
    subject: 'quantitative'
  }
];

export const prelimsTests: TestItem[] = [
  {
    id: 'prelims-1',
    title: 'IBPS PO Prelims Mock 1',
    duration: '60 min',
    questions: 100,
    difficulty: 'Medium',
    attempts: 234,
    completed: true,
    bestScore: 76,
    category: 'prelims',
    subject: 'reasoning'
  },
  {
    id: 'prelims-2',
    title: 'SBI Clerk Prelims Mock 2',
    duration: '60 min',
    questions: 100,
    difficulty: 'Easy',
    attempts: 189,
    completed: false,
    category: 'prelims',
    subject: 'english'
  }
];

export const mainsTests: TestItem[] = [
  {
    id: 'mains-1',
    title: 'IBPS PO Mains Mock 1',
    duration: '180 min',
    questions: 155,
    difficulty: 'Hard',
    attempts: 98,
    completed: true,
    bestScore: 68,
    category: 'mains',
    subject: 'quantitative'
  }
];

export const speedTests: TestItem[] = [
  {
    id: 'speed-1',
    title: 'Quick Math - 15 min Challenge',
    duration: '15 min',
    questions: 20,
    difficulty: 'Medium',
    attempts: 345,
    completed: true,
    bestScore: 95,
    category: 'speed'
  }
];

export const pyqTests: TestItem[] = [
  {
    id: 'pyq-1',
    title: 'IBPS PO 2023 Questions',
    duration: '120 min',
    questions: 80,
    difficulty: 'Hard',
    attempts: 156,
    completed: false,
    category: 'pyq'
  }
];

export const liveTests: TestItem[] = [
  {
    id: 'live-1',
    title: 'Weekly Banking Live Test',
    duration: '180 min',
    questions: 200,
    difficulty: 'Hard',
    attempts: 567,
    completed: false,
    category: 'live'
  }
];
