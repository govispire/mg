export type ExamStatusType =
  | 'application-open'
  | 'notification-released'
  | 'hall-ticket-out'
  | 'prelims-result-out'
  | 'mains-result-out'
  | 'overall-result-out'
  | 'waiting-list-out'
  | 'upcoming';

export interface ExamAlertEntry {
  id: string;
  examName: string;
  organisation: string;
  categoryIds: string[];
  vacancies: number;
  qualification: string;
  ageLimit?: string;
  location: string;
  applicationStartDate: string; // ISO YYYY-MM-DD or 'TBA'
  applicationEndDate: string;
  examDate: string;             // free-text e.g. "Oct 2025"
  statusType: ExamStatusType;
  description: string;
  isNew: boolean;
  isHot: boolean;
  isActive: boolean;
  isBookmarked?: boolean;
  urls: {
    notificationPdf?: string;
    applicationForm?: string;
    resultPage?: string;
    admitCardDownload?: string;
  };
}

export const STATUS_LABELS: Record<ExamStatusType, string> = {
  'application-open':    'Applications Open',
  'notification-released': 'Notification Released',
  'hall-ticket-out':     'Hall Ticket Out',
  'prelims-result-out':  'Prelims Result Out',
  'mains-result-out':    'Mains Result Out',
  'overall-result-out':  'Result Out',
  'waiting-list-out':    'Waiting List Out',
  'upcoming':            'Upcoming',
};

export const STATUS_OPTIONS: { value: ExamStatusType; label: string }[] = [
  { value: 'application-open',    label: 'Applications Open' },
  { value: 'notification-released', label: 'Notification Released' },
  { value: 'hall-ticket-out',     label: 'Hall Ticket Out' },
  { value: 'prelims-result-out',  label: 'Prelims Result Out' },
  { value: 'mains-result-out',    label: 'Mains Result Out' },
  { value: 'overall-result-out',  label: 'Overall Result Out' },
  { value: 'waiting-list-out',    label: 'Waiting List Out' },
  { value: 'upcoming',            label: 'Upcoming' },
];

export const EXAM_CATEGORY_OPTIONS = [
  { value: 'all',              label: 'All Exams' },
  { value: 'banking',          label: '🏦 Banking & Insurance' },
  { value: 'ssc',              label: '📋 SSC' },
  { value: 'railways-rrb',     label: '🚂 Railways / RRB' },
  { value: 'upsc',             label: '🏛️ UPSC / IAS' },
  { value: 'defence',          label: '⚔️ Defence' },
  { value: 'state-psc',        label: '📜 State PSC' },
];

export const QUALIFICATION_OPTIONS = [
  { value: 'all',         label: 'All Qualifications' },
  { value: 'graduate',    label: 'Graduate' },
  { value: '12th',        label: '12th Pass' },
  { value: '10th',        label: '10th Pass' },
  { value: 'engineering', label: 'Engineering / CA' },
];

export const formatAlertDate = (dateStr: string): string => {
  if (!dateStr || dateStr === 'TBA') return dateStr || 'TBA';
  if (dateStr.includes(' ') || dateStr.length === 8 || !dateStr.includes('-')) return dateStr;
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const STORAGE_KEY = 'exam_alerts_store_v3';

const SEED_DATA: ExamAlertEntry[] = [
  {
    id: 'ibps-po-2025',
    examName: 'IBPS PO 2025',
    organisation: 'Institute of Banking Personnel Selection',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 4455,
    qualification: 'Any Graduate',
    ageLimit: '20–30 yrs',
    location: 'Pan India',
    applicationStartDate: '2025-06-01',
    applicationEndDate: '2025-08-15',
    examDate: 'Oct 2025',
    statusType: 'application-open',
    description: 'IBPS PO Prelims consists of 100 marks in 60 minutes. Mains exam is 200 marks in 180 minutes. Interview and document verification follows.',
    isNew: true,
    isHot: true,
    isActive: true,
    isBookmarked: true,
    urls: { notificationPdf: 'https://www.ibps.in/notifications/ibps-po-2025.pdf', applicationForm: 'https://www.ibps.in/apply/po-2025' },
  },
  {
    id: 'sbi-po-2025',
    examName: 'SBI PO 2025',
    organisation: 'State Bank of India',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 2000,
    qualification: 'Any Graduate',
    ageLimit: '21–30 yrs',
    location: 'Pan India',
    applicationStartDate: '2025-07-05',
    applicationEndDate: '2025-08-25',
    examDate: 'Oct 2025',
    statusType: 'application-open',
    description: 'SBI PO recruitment for Probationary Officers. Selection through Prelims, Mains, and Group Exercise & Interview.',
    isNew: true,
    isHot: false,
    isActive: true,
    isBookmarked: true,
    urls: { notificationPdf: 'https://sbi.co.in/notifications/po-2025.pdf', applicationForm: 'https://sbi.co.in/careers/apply/po-2025' },
  },
  {
    id: 'ssc-cgl-2025',
    examName: 'SSC CGL 2025',
    organisation: 'Staff Selection Commission',
    categoryIds: ['ssc'],
    vacancies: 17727,
    qualification: 'Any Graduate',
    ageLimit: '18–32 yrs',
    location: 'Pan India',
    applicationStartDate: '2025-06-24',
    applicationEndDate: '2025-07-24',
    examDate: 'Sep–Oct 2025',
    statusType: 'application-open',
    description: 'SSC Combined Graduate Level recruitment for Assistant Audit Officer, Inspector, Tax Assistant, and Executive positions.',
    isNew: true,
    isHot: true,
    isActive: true,
    isBookmarked: false,
    urls: { notificationPdf: 'https://ssc.gov.in/notifications/cgl-2025.pdf', applicationForm: 'https://ssc.gov.in/apply/cgl-2025' },
  },
  {
    id: 'rrb-ntpc-2025',
    examName: 'RRB NTPC 2025',
    organisation: 'Railway Recruitment Boards',
    categoryIds: ['railways-rrb'],
    vacancies: 11558,
    qualification: '12th / Any Graduate',
    ageLimit: '18–33 yrs',
    location: 'Pan India',
    applicationStartDate: '2025-09-14',
    applicationEndDate: '2025-10-20',
    examDate: 'Dec 2025',
    statusType: 'application-open',
    description: 'RRB Non-Technical Popular Categories recruitment for Station Master, Goods Guard, Senior Clerk, and Commercial Apprentice.',
    isNew: false,
    isHot: true,
    isActive: true,
    isBookmarked: false,
    urls: { notificationPdf: 'https://www.rrbcdg.gov.in/notifications/ntpc-2025.pdf', applicationForm: 'https://www.rrbcdg.gov.in/apply/ntpc-2025' },
  },
  {
    id: 'upsc-ias-2025',
    examName: 'UPSC Civil Services (IAS) 2025',
    organisation: 'Union Public Service Commission',
    categoryIds: ['upsc'],
    vacancies: 1056,
    qualification: 'Any Graduate',
    ageLimit: '21–32 yrs',
    location: 'Pan India',
    applicationStartDate: '2025-02-14',
    applicationEndDate: '2025-03-05',
    examDate: 'May 2025',
    statusType: 'mains-result-out',
    description: 'UPSC IAS, IPS, and IFS Examination. Mains results declared. Interview schedule published.',
    isNew: false,
    isHot: true,
    isActive: true,
    isBookmarked: true,
    urls: { notificationPdf: 'https://upsc.gov.in/notifications/cse-2025.pdf', resultPage: 'https://upsc.gov.in/results/cse-2025' },
  },
  {
    id: 'ssc-chsl-2025',
    examName: 'SSC CHSL 2025',
    organisation: 'Staff Selection Commission',
    categoryIds: ['ssc'],
    vacancies: 3712,
    qualification: '12th Pass',
    ageLimit: '18–27 yrs',
    location: 'Pan India',
    applicationStartDate: '2025-04-08',
    applicationEndDate: '2025-05-07',
    examDate: 'Jul 2025',
    statusType: 'prelims-result-out',
    description: 'SSC Combined Higher Secondary Level for LDC, DEO, and Postal Assistant. Tier-1 results out now.',
    isNew: false,
    isHot: false,
    isActive: true,
    isBookmarked: false,
    urls: { notificationPdf: 'https://ssc.gov.in/notifications/chsl-2025.pdf', resultPage: 'https://ssc.gov.in/results/chsl-2025' },
  },
  {
    id: 'nda-ii-2025',
    examName: 'NDA & NA II 2025',
    organisation: 'Union Public Service Commission',
    categoryIds: ['defence', 'upsc'],
    vacancies: 404,
    qualification: '12th Pass',
    ageLimit: '16.5–19.5 yrs',
    location: 'Pan India',
    applicationStartDate: '2025-05-15',
    applicationEndDate: '2025-06-04',
    examDate: 'Sep 2025',
    statusType: 'hall-ticket-out',
    description: 'National Defence Academy and Naval Academy II recruitment. Admit card released.',
    isNew: true,
    isHot: false,
    isActive: true,
    isBookmarked: false,
    urls: { notificationPdf: 'https://upsc.gov.in/notifications/nda-2-2025.pdf', admitCardDownload: 'https://upsc.gov.in/admitcard/nda-2-2025' },
  },
  {
    id: 'lic-aao-2025',
    examName: 'LIC AAO 2025',
    organisation: 'Life Insurance Corporation of India',
    categoryIds: ['banking-insurance'],
    vacancies: 300,
    qualification: 'Any Graduate',
    ageLimit: '21–30 yrs',
    location: 'Pan India',
    applicationStartDate: '2025-06-20',
    applicationEndDate: '2025-08-10',
    examDate: 'Sep 2025',
    statusType: 'application-open',
    description: 'LIC Assistant Administrative Officer recruitment. Selection through Online Prelims, Mains, and Interview.',
    isNew: true,
    isHot: true,
    isActive: true,
    isBookmarked: false,
    urls: { notificationPdf: 'https://licindia.in/notifications/aao-2025.pdf', applicationForm: 'https://licindia.in/apply/aao-2025' },
  },
  {
    id: 'rrb-clerk-2025',
    examName: 'RRB Clerk 2025',
    organisation: 'Institute of Banking Personnel Selection',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 6160,
    qualification: 'Any Graduate',
    ageLimit: '18–28 yrs',
    location: 'Pan India',
    applicationStartDate: '2025-06-01',
    applicationEndDate: '2025-06-30',
    examDate: 'Aug 2025',
    statusType: 'hall-ticket-out',
    description: 'RRB Office Assistants (Multipurpose) recruitment. Admit card has been released. Download it now.',
    isNew: false,
    isHot: false,
    isActive: true,
    isBookmarked: false,
    urls: { notificationPdf: 'https://www.rrbcdg.gov.in/notifications/clerk-2025.pdf', admitCardDownload: 'https://www.rrbcdg.gov.in/admit-card/clerk-2025' },
  },
  {
    id: 'tnpsc-group4-2025',
    examName: 'TNPSC Group 4 2025',
    organisation: 'Tamil Nadu Public Service Commission',
    categoryIds: ['state-psc'],
    vacancies: 6244,
    qualification: '10th Pass',
    ageLimit: '18–37 yrs',
    location: 'Tamil Nadu',
    applicationStartDate: '2025-01-30',
    applicationEndDate: '2025-02-28',
    examDate: 'Jun 2025',
    statusType: 'overall-result-out',
    description: 'TNPSC Group 4 recruitment for VAO, Junior Assistant, Typist, and Bill Collector.',
    isNew: false,
    isHot: false,
    isActive: true,
    isBookmarked: false,
    urls: { notificationPdf: 'https://tnpsc.gov.in/notifications/group4-2025.pdf', resultPage: 'https://tnpsc.gov.in/results/group4-2025' },
  }
];

export const getExamAlerts = (): ExamAlertEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  saveExamAlerts(SEED_DATA);
  return SEED_DATA;
};

export const saveExamAlerts = (entries: ExamAlertEntry[]): void => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch { /* ignore */ }
};
