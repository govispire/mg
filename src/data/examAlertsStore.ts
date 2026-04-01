
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
  location: string;
  applicationStartDate: string; // ISO YYYY-MM-DD or 'TBA'
  applicationEndDate: string;
  examDate: string;             // free-text e.g. "Oct 2025"
  statusType: ExamStatusType;
  description: string;
  isNew: boolean;
  isHot: boolean;
  isActive: boolean;
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
  { value: 'banking',          label: '🏦 Banking' },
  { value: 'banking-insurance', label: '🛡️ Banking & Insurance' },
  { value: 'ssc',              label: '📋 SSC' },
  { value: 'railways-rrb',     label: '🚂 Railways / RRB' },
  { value: 'upsc',             label: '🏛️ UPSC' },
  { value: 'civil-services',   label: '🏛️ Civil Services' },
  { value: 'defence',          label: '⚔️ Defence' },
  { value: 'regulatory',       label: '📊 Regulatory' },
  { value: 'state-psc',        label: '📜 State PSC' },
  { value: 'insurance',        label: '🛡️ Insurance' },
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

const STORAGE_KEY = 'exam_alerts_store_v2';

const SEED_DATA: ExamAlertEntry[] = [
  {
    id: 'ibps-po-2025',
    examName: 'IBPS PO 2025',
    organisation: 'Institute of Banking Personnel Selection',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 4455, qualification: 'Any Graduate', location: 'Pan India',
    applicationStartDate: '2025-06-01', applicationEndDate: '2025-06-30', examDate: 'Oct 2025',
    statusType: 'application-open',
    description: 'IBPS PO Prelims consists of 100 marks in 60 minutes. Mains exam is 200 marks in 180 minutes. Interview and document verification follows.',
    isNew: true, isHot: true, isActive: true,
    urls: { notificationPdf: 'https://www.ibps.in/notifications/ibps-po-2025.pdf', applicationForm: 'https://www.ibps.in/apply/po-2025' },
  },
  {
    id: 'ibps-clerk-2025',
    examName: 'IBPS Clerk 2025',
    organisation: 'Institute of Banking Personnel Selection',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 6128, qualification: 'Any Graduate', location: 'Pan India',
    applicationStartDate: '2025-07-01', applicationEndDate: '2025-07-21', examDate: 'Oct 2025',
    statusType: 'application-open',
    description: 'IBPS Clerk recruitment for clerical cadre positions across participating public sector banks. Prelims followed by Mains written exam.',
    isNew: false, isHot: false, isActive: true,
    urls: { notificationPdf: 'https://www.ibps.in/notifications/ibps-clerk-2025.pdf', applicationForm: 'https://www.ibps.in/apply/clerk-2025' },
  },
  {
    id: 'sbi-po-2025',
    examName: 'SBI PO 2025',
    organisation: 'State Bank of India',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 2000, qualification: 'Any Graduate', location: 'Pan India',
    applicationStartDate: '2025-07-05', applicationEndDate: '2025-07-25', examDate: 'Oct 2025',
    statusType: 'application-open',
    description: 'SBI PO recruitment for Probationary Officers. Selection through Prelims, Mains, and Group Exercise & Interview.',
    isNew: true, isHot: false, isActive: true,
    urls: { notificationPdf: 'https://sbi.co.in/notifications/po-2025.pdf', applicationForm: 'https://sbi.co.in/careers/apply/po-2025' },
  },
  {
    id: 'sbi-clerk-2025',
    examName: 'SBI Clerk 2025',
    organisation: 'State Bank of India',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 13735, qualification: 'Any Graduate', location: 'Pan India',
    applicationStartDate: '2025-06-17', applicationEndDate: '2025-07-07', examDate: 'Sep 2025',
    statusType: 'overall-result-out',
    description: 'Result has been declared. Download your scorecard from the official SBI website. Joining formalities will begin shortly.',
    isNew: false, isHot: false, isActive: true,
    urls: { notificationPdf: 'https://sbi.co.in/notifications/clerk-2025.pdf', resultPage: 'https://sbi.co.in/results/clerk-2025' },
  },
  {
    id: 'rrb-po-2025',
    examName: 'RRB PO 2025',
    organisation: 'Regional Rural Banks',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 9985, qualification: 'Any Graduate', location: 'Pan India',
    applicationStartDate: '2025-07-01', applicationEndDate: '2025-07-31', examDate: 'Oct 2025',
    statusType: 'application-open',
    description: 'Regional Rural Bank Officer Scale-I recruitment. Selection via Online Prelims, Mains, and Interview.',
    isNew: false, isHot: false, isActive: true,
    urls: { notificationPdf: 'https://www.rrbcdg.gov.in/notifications/po-2025.pdf', applicationForm: 'https://www.rrbcdg.gov.in/apply/po-2025' },
  },
  {
    id: 'rrb-clerk-2025',
    examName: 'RRB Clerk 2025',
    organisation: 'Institute of Banking Personnel Selection',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 6160, qualification: 'Any Graduate', location: 'Pan India',
    applicationStartDate: '2025-06-01', applicationEndDate: '2025-06-30', examDate: 'Aug 2025',
    statusType: 'hall-ticket-out',
    description: 'RRB Office Assistants (Multipurpose) recruitment. Admit card has been released. Download it now and check your exam centre.',
    isNew: false, isHot: false, isActive: true,
    urls: { notificationPdf: 'https://www.rrbcdg.gov.in/notifications/clerk-2025.pdf', admitCardDownload: 'https://www.rrbcdg.gov.in/admit-card/clerk-2025' },
  },
  {
    id: 'iob-lbo-2025',
    examName: 'Indian Overseas Bank LBO 2025',
    organisation: 'Indian Overseas Bank',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 349, qualification: 'Any Graduate', location: 'Pan India',
    applicationStartDate: '2025-06-10', applicationEndDate: '2025-07-05', examDate: 'Sep 2025',
    statusType: 'application-open',
    description: 'Indian Overseas Bank Local Bank Officer recruitment. Candidates with CA/MBA/Post Graduate preferred.',
    isNew: false, isHot: false, isActive: true,
    urls: { notificationPdf: 'https://www.iob.in/notifications/lbo-2025.pdf', applicationForm: 'https://www.iob.in/careers/apply/lbo-2025' },
  },
  {
    id: 'idbi-jam-2025',
    examName: 'IDBI JAM Grade O Officer 2025',
    organisation: 'Industrial Development Bank of India',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 600, qualification: 'Any Graduate', location: 'Pan India',
    applicationStartDate: 'TBA', applicationEndDate: 'TBA', examDate: 'Nov 2025',
    statusType: 'upcoming',
    description: 'IDBI Bank Junior Assistant Manager recruitment. Notification expected soon. Prepare early to get a head start.',
    isNew: false, isHot: false, isActive: true,
    urls: { notificationPdf: 'https://www.idbibank.in/notifications/jam-2025.pdf' },
  },
  {
    id: 'lic-aao-2025',
    examName: 'LIC AAO 2025',
    organisation: 'Life Insurance Corporation of India',
    categoryIds: ['banking-insurance'],
    vacancies: 300, qualification: 'Any Graduate', location: 'Pan India',
    applicationStartDate: '2025-06-20', applicationEndDate: '2025-07-10', examDate: 'Sep 2025',
    statusType: 'application-open',
    description: 'LIC Assistant Administrative Officer recruitment. Selection through Online Prelims, Mains, and Interview cum Medical Examination.',
    isNew: true, isHot: true, isActive: true,
    urls: { notificationPdf: 'https://licindia.in/notifications/aao-2025.pdf', applicationForm: 'https://licindia.in/apply/aao-2025' },
  },
  {
    id: 'niacl-ao-2025',
    examName: 'NIACL AO 2025',
    organisation: 'New India Assurance Company Limited',
    categoryIds: ['banking-insurance'],
    vacancies: 160, qualification: 'Any Graduate', location: 'Pan India',
    applicationStartDate: '2025-08-01', applicationEndDate: '2025-08-21', examDate: 'Oct 2025',
    statusType: 'application-open',
    description: 'New India Assurance Administrative Officer Scale-I recruitment. Computer proficiency test mandatory for qualified candidates.',
    isNew: false, isHot: false, isActive: true,
    urls: { notificationPdf: 'https://newindia.co.in/notifications/ao-2025.pdf', applicationForm: 'https://newindia.co.in/apply/ao-2025' },
  },
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
