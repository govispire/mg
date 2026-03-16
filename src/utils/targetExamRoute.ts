/**
 * Maps a target exam name/id to its tests route category and examId.
 * Used for "Start Full Mock Test" dynamic routing.
 */

interface ExamRoute {
  category: string;
  examId: string;
}

// Normalize target exam string to a slug
const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

const EXAM_ROUTE_MAP: Record<string, ExamRoute> = {
  // Banking
  'sbi-po':          { category: 'banking-insurance', examId: 'sbi-po' },
  'sbi-clerk':       { category: 'banking-insurance', examId: 'sbi-clerk' },
  'ibps-po':         { category: 'banking-insurance', examId: 'ibps-po' },
  'ibps-clerk':      { category: 'banking-insurance', examId: 'ibps-clerk' },
  'ibps-rrb-officer':{ category: 'banking-insurance', examId: 'ibps-rrb-officer' },
  'ibps-rrb-assistant':{ category: 'banking-insurance', examId: 'ibps-rrb-assistant' },
  'ibps-rrb-po':     { category: 'banking-insurance', examId: 'ibps-rrb-po' },
  'ibps-rrb-clerk':  { category: 'banking-insurance', examId: 'ibps-rrb-clerk' },
  'rbi-grade-b':     { category: 'banking-insurance', examId: 'rbi-grade-b' },
  'rbi-assistant':   { category: 'banking-insurance', examId: 'rbi-assistant' },
  'lic-aao':         { category: 'banking-insurance', examId: 'lic-aao' },
  'lic-ado':         { category: 'banking-insurance', examId: 'lic-ado' },
  'niacl-ao':        { category: 'banking-insurance', examId: 'niacl-ao' },
  'niacl-assistant': { category: 'banking-insurance', examId: 'niacl-assistant' },
  'nabard-grade-a':  { category: 'banking-insurance', examId: 'nabard-grade-a' },
  'jaiib':           { category: 'jaiib-caiib', examId: 'jaiib' },
  'caiib':           { category: 'jaiib-caiib', examId: 'caiib' },
  // SSC
  'ssc-cgl':         { category: 'ssc', examId: 'ssc-cgl' },
  'ssc-chsl':        { category: 'ssc', examId: 'ssc-chsl' },
  'ssc-mts':         { category: 'ssc', examId: 'ssc-mts' },
  'ssc-gd':          { category: 'ssc', examId: 'ssc-gd' },
  // Railway
  'rrb-ntpc':        { category: 'railways-rrb', examId: 'rrb-ntpc' },
  'rrb-group-d':     { category: 'railways-rrb', examId: 'rrb-group-d' },
  'rrb-alp':         { category: 'railways-rrb', examId: 'rrb-alp' },
  'rrb-je':          { category: 'railways-rrb', examId: 'rrb-je' },
  // UPSC/Civil
  'upsc-cse':        { category: 'civil-services', examId: 'upsc-cse' },
  'upsc-cds':        { category: 'civil-services', examId: 'upsc-cds' },
  'upsc-nda':        { category: 'defence', examId: 'upsc-nda' },
  'upsc-capf':       { category: 'defence', examId: 'upsc-capf' },
  'nda':             { category: 'defence', examId: 'upsc-nda' },
  // State PSC
  'bpsc':            { category: 'civil-services', examId: 'bpsc' },
  'uppsc':           { category: 'civil-services', examId: 'uppsc' },
  'tnpsc':           { category: 'civil-services', examId: 'tnpsc' },
  'mppsc':           { category: 'civil-services', examId: 'mppsc' },
  'tnpsc-group1':    { category: 'civil-services', examId: 'tnpsc-group1' },
  'tnpsc-group2':    { category: 'civil-services', examId: 'tnpsc-group2' },
  'tnpsc-group4':    { category: 'civil-services', examId: 'tnpsc-group4' },
  // Regulatory
  'rbi':             { category: 'regulatory', examId: 'rbi' },
  'sebi':            { category: 'regulatory', examId: 'sebi' },
  'nabard':          { category: 'regulatory', examId: 'nabard' },
};

/**
 * Returns the tests route for a given target exam name.
 * Falls back to banking-insurance / sbi-po if no match.
 */
export function getTargetExamRoute(targetExam: string): string {
  const slug = normalize(targetExam);
  // Direct match
  if (EXAM_ROUTE_MAP[slug]) {
    const { category, examId } = EXAM_ROUTE_MAP[slug];
    return `/student/tests/${category}/${examId}`;
  }
  // Partial match
  for (const [key, val] of Object.entries(EXAM_ROUTE_MAP)) {
    if (slug.includes(key) || key.includes(slug)) {
      return `/student/tests/${val.category}/${val.examId}`;
    }
  }
  // Default fallback
  return '/student/tests/banking-insurance/ibps-po';
}

/**
 * Returns category for display purposes from exam name.
 */
export function getCategoryFromTargetExam(targetExam: string): string {
  const slug = normalize(targetExam);
  const route = EXAM_ROUTE_MAP[slug];
  if (route) return route.category;
  for (const [key, val] of Object.entries(EXAM_ROUTE_MAP)) {
    if (slug.includes(key) || key.includes(slug)) return val.category;
  }
  return 'banking-insurance';
}
