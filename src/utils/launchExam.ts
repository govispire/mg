/**
 * Utility function to launch exam in a new fullscreen window.
 *
 * PRODUCT RULE: Study Timer and Test Timer are MUTUALLY EXCLUSIVE.
 * Before launching any exam, this function:
 *   1. Checks if a study timer is active
 *   2. If yes → saves elapsed session, stops the timer
 *   3. Shows a toast notification to the student
 *   4. Records test duration as study time (for Total Study Hours calculation)
 *   5. Opens the exam window
 */
import { toast } from 'sonner';
import { useTimerStore } from '@/store/useTimerStore';
import type { StudySession } from '@/store/useTimerStore';

interface ExamLaunchParams {
    quizId: string;
    title: string;
    subject: string;
    duration: number;   // minutes
    questions: number;
    returnUrl?: string; // URL to return to after completing quiz
}

// Helper: local date string
const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Save test duration to studyTimerSessions (counts toward Total Study Hours)
const saveTestSession = (mins: number) => {
  if (mins <= 0) return;
  try {
    const sessions: StudySession[] = JSON.parse(localStorage.getItem('studyTimerSessions') || '[]');
    sessions.push({ date: localDate(), mins, source: 'test' });
    localStorage.setItem('studyTimerSessions', JSON.stringify(sessions.slice(-200)));
  } catch {}
};

export const launchExamWindow = (params: ExamLaunchParams) => {
    const { quizId, title, subject, duration, questions, returnUrl } = params;

    // ── MUTUAL EXCLUSIVITY CHECK ───────────────────────────────────────────
    const timerStore = useTimerStore.getState();
    if (timerStore.active) {
        const elapsed = timerStore.stopAndSave('timer');
        if (elapsed > 0) {
            toast.warning(
                `⏸ Study timer paused · ${elapsed} min saved. Starting "${title}" now.`,
                { duration: 5000, icon: '🧪' }
            );
        } else {
            toast.info(
                `📝 Study timer stopped. Starting "${title}" now.`,
                { duration: 4000 }
            );
        }
    }

    // ── RECORD TEST DURATION as study time ────────────────────────────────
    // This counts toward Total Study Hours (test time = productive study time)
    saveTestSession(duration);

    // ── BUILD EXAM URL ────────────────────────────────────────────────────
    const urlParams = new URLSearchParams({
        quizId,
        title,
        subject,
        duration: duration.toString(),
        questions: questions.toString(),
    });

    if (returnUrl) {
        urlParams.set('returnUrl', returnUrl);
        sessionStorage.setItem('examReturnUrl', returnUrl);
    }

    const examUrl = `/student/exam-window?${urlParams.toString()}`;

    // ── OPEN EXAM WINDOW ──────────────────────────────────────────────────
    const windowFeatures = 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no';
    const examWindow = window.open(examUrl, 'examWindow', windowFeatures);

    if (examWindow) {
        examWindow.focus();
    } else {
        alert('Please allow popups for this website to start the exam');
    }
};

export default launchExamWindow;
