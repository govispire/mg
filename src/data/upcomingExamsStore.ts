// ─── Superadmin-controlled Upcoming Exams Store ─────────────────────────────
// SuperAdmin writes here; Student Dashboard reads here.
// Source of truth: localStorage key = 'superadmin_upcoming_exams'

export interface UpcomingExamEntry {
  id: string;
  examName: string;        // e.g. "IBPS PO"
  fullName: string;        // e.g. "Institute of Banking Personnel Selection — Probationary Officer"
  stage: string;           // e.g. "Prelims"
  examDate: string;        // ISO date string "2026-10-15"
  registrationDeadline?: string; // ISO date string (optional)
  logo?: string;           // URL
  category: string;        // e.g. "banking"
  isActive: boolean;       // Superadmin can hide without deleting
  note?: string;           // Optional short note for students
}

const STORAGE_KEY = 'superadmin_upcoming_exams';

// Seed data — defaults if superadmin hasn't saved anything yet
const DEFAULT_ENTRIES: UpcomingExamEntry[] = [
  {
    id: 'upcoming-ibps-po-2026',
    examName: 'IBPS PO',
    fullName: 'Probationary Officer Prelims',
    stage: 'Prelims',
    examDate: '2026-10-15',
    registrationDeadline: '2026-09-10',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0e/IBPS_logo.svg/200px-IBPS_logo.svg.png',
    category: 'banking',
    isActive: true,
    note: 'Notification expected in August',
  },
  {
    id: 'upcoming-sbi-po-2026',
    examName: 'SBI PO',
    fullName: 'State Bank of India — Probationary Officer',
    stage: 'Prelims',
    examDate: '2026-12-05',
    registrationDeadline: '2026-11-01',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/200px-SBI-logo.svg.png',
    category: 'banking',
    isActive: true,
    note: '',
  },
  {
    id: 'upcoming-ibps-clerk-2026',
    examName: 'IBPS Clerk',
    fullName: 'Institute of Banking Personnel Selection — Clerk',
    stage: 'Prelims',
    examDate: '2026-11-20',
    registrationDeadline: '2026-10-15',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0e/IBPS_logo.svg/200px-IBPS_logo.svg.png',
    category: 'banking',
    isActive: true,
    note: '',
  },
  {
    id: 'upcoming-ssc-cgl-2026',
    examName: 'SSC CGL',
    fullName: 'Staff Selection Commission — Combined Graduate Level',
    stage: 'Tier I',
    examDate: '2026-09-01',
    registrationDeadline: '2026-07-20',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
    category: 'ssc',
    isActive: true,
    note: '',
  },
];

export const getUpcomingExams = (): UpcomingExamEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const entries = JSON.parse(raw) as UpcomingExamEntry[];
      // Auto-patch missing logos from exam catalog
      let patched = false;
      const catalogRaw = localStorage.getItem('superadmin_exam_catalog');
      const catalog = catalogRaw ? JSON.parse(catalogRaw) : null;
      const result = entries.map(entry => {
        if (entry.logo) return entry;
        if (!catalog) return entry;
        for (const cat of catalog) {
          for (const sec of cat.sections) {
            for (const exam of sec.exams) {
              if (exam.name?.toLowerCase() === entry.examName?.toLowerCase() && exam.logo) {
                patched = true;
                return { ...entry, logo: exam.logo };
              }
            }
          }
        }
        return entry;
      });
      if (patched) localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      return result;
    }
  } catch { /* ignore */ }
  return DEFAULT_ENTRIES;
};

export const saveUpcomingExams = (entries: UpcomingExamEntry[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const daysUntil = (isoDate: string): number => {
  const target = new Date(isoDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const formatDisplayDate = (isoDate: string): string => {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
