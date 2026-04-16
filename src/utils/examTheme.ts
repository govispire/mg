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
  borderColor: '#10b981',                               // emerald-500
  gradientClass: 'from-emerald-500 to-teal-500',
  accentHex: '#10b981',
  activeTabBtn: 'bg-emerald-600 text-white hover:bg-emerald-700',
  progressColor: '#10b981',
  badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

/**
 * Always returns the same app-wide theme.
 * Signature kept compatible so ExamDetail doesn't need further changes.
 */
export function getExamTheme(_examId?: string, _examName?: string): ExamTheme {
  return APP_THEME;
}
