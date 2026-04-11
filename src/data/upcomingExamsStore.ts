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
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
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
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
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
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
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
      let entries = JSON.parse(raw) as UpcomingExamEntry[];

      // ── Patch stale Wikipedia/broken logo URLs ──────────────────
      const logoFixes: Record<string, string> = {
        'wikipedia.org': '', // will trigger keyword fallback below
        'ibps_logo':      'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
      };
      const cloudinaryMap: Record<string, string> = {
        ibps:   'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
        sbi:    'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
        ssc:    'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
        rrb:    'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
        upsc:   'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
        rbi:    'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp',
      };
      const getCloudinaryLogo = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('ibps'))                       return cloudinaryMap.ibps;
        if (n.includes('sbi'))                        return cloudinaryMap.sbi;
        if (n.includes('ssc'))                        return cloudinaryMap.ssc;
        if (n.includes('rrb') || n.includes('rail'))  return cloudinaryMap.rrb;
        if (n.includes('upsc'))                       return cloudinaryMap.upsc;
        if (n.includes('rbi') || n.includes('nabard'))return cloudinaryMap.rbi;
        return '';
      };

      let patched = false;
      entries = entries.map(entry => {
        // Replace broken Wikipedia or empty logos
        if (!entry.logo || entry.logo.includes('wikipedia.org') || entry.logo.includes('wikimed')) {
          const fix = getCloudinaryLogo(entry.examName);
          if (fix) { patched = true; return { ...entry, logo: fix }; }
        }
        return entry;
      });

      // Also auto-patch from catalog (original logic)
      const catalogRaw = localStorage.getItem('superadmin_exam_catalog');
      const catalog = catalogRaw ? JSON.parse(catalogRaw) : null;
      entries = entries.map(entry => {
        if (entry.logo && !entry.logo.includes('wikipedia.org')) return entry;
        if (!catalog) return entry;
        for (const cat of catalog)
          for (const sec of cat.sections)
            for (const exam of sec.exams)
              if (exam.name?.toLowerCase() === entry.examName?.toLowerCase() && exam.logo) {
                patched = true;
                return { ...entry, logo: exam.logo };
              }
        return entry;
      });

      if (patched) localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      return entries;
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
