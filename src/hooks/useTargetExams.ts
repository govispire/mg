/**
 * useTargetExams — Priority-Based Target Exam System
 *
 * Rules:
 *  - Minimum 1 exam, Maximum 3 exams
 *  - Position in array = priority (#0 = Main Focus, #1 = Secondary Focus, #2 = Backup Goal)
 *  - Deleting position #0 auto-promotes the next exam
 *  - No swap/promote/demote logic needed — just reorder the array
 */

import { useLocalStorage } from './useLocalStorage';

export interface TargetExam {
  id: string;           // e.g. "sbi-po"
  name: string;         // e.g. "SBI PO"
  category: string;     // e.g. "banking"
  addedAt: number;      // timestamp
  examDate?: string;    // ISO date string
}

const STORAGE_KEY = 'targetExams_v2';

/** Human-readable label for each position */
export const getPriorityLabel = (index: number): string => {
  if (index === 0) return 'Main Focus';
  if (index === 1) return 'Secondary Focus';
  return 'Backup Goal';
};

/** Colour accent for each priority level */
export const getPriorityColor = (index: number) => {
  if (index === 0) return { bg: '#10b981', light: '#ecfdf5', text: '#065f46', badge: 'emerald' };
  if (index === 1) return { bg: '#3b82f6', light: '#eff6ff', text: '#1e3a8a', badge: 'blue' };
  return { bg: '#f59e0b', light: '#fffbeb', text: '#78350f', badge: 'amber' };
};

export const useTargetExams = () => {
  const [targetExams, setTargetExams] = useLocalStorage<TargetExam[]>(STORAGE_KEY, []);

  /** Add a new exam (max 3). Returns false if already at limit. */
  const addTargetExam = (exam: Omit<TargetExam, 'addedAt'>): boolean => {
    if (targetExams.length >= 3) return false;
    if (targetExams.some(e => e.id === exam.id)) return false;
    setTargetExams([...targetExams, { ...exam, addedAt: Date.now() }]);
    return true;
  };

  /** Remove an exam by id. Auto-promotes remaining. Min 1 enforced externally. */
  const removeTargetExam = (examId: string) => {
    const next = targetExams.filter(e => e.id !== examId);
    setTargetExams(next);
  };

  /** Replace an exam at a specific position */
  const replaceTargetExam = (index: number, exam: Omit<TargetExam, 'addedAt'>) => {
    const next = [...targetExams];
    next[index] = { ...exam, addedAt: Date.now() };
    setTargetExams(next);
  };

  /** Move an exam up in priority (swap with previous) */
  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...targetExams];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setTargetExams(next);
  };

  /** Move an exam down in priority (swap with next) */
  const moveDown = (index: number) => {
    if (index >= targetExams.length - 1) return;
    const next = [...targetExams];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setTargetExams(next);
  };

  /** Drag-and-drop reorder — move from one index to another */
  const reorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const next = [...targetExams];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setTargetExams(next);
  };

  /** Main exam (position 0) — drives the dashboard hero */
  const primaryExam = targetExams[0] ?? null;

  /** True if we can add more exams */
  const canAddMore = targetExams.length < 3;

  return {
    targetExams,
    setTargetExams,
    primaryExam,
    canAddMore,
    addTargetExam,
    removeTargetExam,
    replaceTargetExam,
    moveUp,
    moveDown,
    reorder,
  };
};
