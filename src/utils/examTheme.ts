/**
 * examTheme.ts
 * Single, consistent colour scheme applied to ALL exam pages.
 * One brand — one palette. No per-exam colour switching.
 */

export interface ExamTheme {
  borderColor: string;
  gradientClass: string;
  accentHex: string;
  activeTabBtn: string;
  progressColor: string;
  badgeClass: string;
}

/** App-wide single primary theme (emerald/green) */
export const APP_THEME: ExamTheme = {
  borderColor: '#2563eb',                               // Royal Blue #2563EB
  gradientClass: 'from-blue-600 to-indigo-600',
  accentHex: '#2563eb',
  activeTabBtn: 'bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-sm',
  progressColor: '#2563eb',
  badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
};

/**
 * Always returns the same app-wide theme.
 * Signature kept compatible so ExamDetail doesn't need further changes.
 */
export function getExamTheme(_examId?: string, _examName?: string): ExamTheme {
  return APP_THEME;
}
