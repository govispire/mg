
// Logo URLs
export const SBI_LOGO = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp';
export const SSC_LOGO = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp';
export const IBPS_LOGO = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp';
export const IDBI_LOGO = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125078/idbi.png_lyvlvv.webp';
export const RAILWAY_LOGO = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp';
export const NIACL_LOGO = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125084/niacl_lqfem4.webp';
export const NICL_LOGO = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125084/niacl_lqfem4.webp';
export const UPSC_LOGO = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp';

export interface Exam {
  id: string;
  name: string;
  logo: string;
  logoAlt: string;
  isPopular: boolean;
}

export interface ExamCategory {
  id: string;
  name: string;
  description: string;
  logo: string;
  studentsEnrolled: number;
  examsAvailable: number;
  colorClass: string;
  isPopular: boolean;
}

export interface CategorySection {
  categoryId: string;
  categoryName: string;
  logo: string;
  exams: Exam[];
}

export interface GroupedExams {
  isGrouped: boolean;
  sections: CategorySection[];
}

// ... keep existing code (examCategories array, all exam arrays like bankingExams, sscExams, etc.) the same ...

export const examCategories: ExamCategory[] = [
  {
    id: 'banking-insurance',
    name: 'Banking & Insurance',
    description: 'Comprehensive preparation for banking and insurance sector exams including IBPS, SBI, NIACL, and more.',
    logo: SBI_LOGO,
    studentsEnrolled: 45320,
    examsAvailable: 12,
    colorClass: 'bg-blue-50 border-blue-200',
    isPopular: true
  },
  {
    id: 'ssc',
    name: 'SSC',
    description: 'Complete coverage for Staff Selection Commission exams including CGL, CHSL, MTS, and GD.',
    logo: SSC_LOGO,
    studentsEnrolled: 38750,
    examsAvailable: 4,
    colorClass: 'bg-green-50 border-green-200',
    isPopular: true
  },
  {
    id: 'railway',
    name: 'Railway',
    description: 'Specialized preparation for Railway Recruitment Board exams including NTPC, Group D, and ALP.',
    logo: RAILWAY_LOGO,
    studentsEnrolled: 28430,
    examsAvailable: 5,
    colorClass: 'bg-yellow-50 border-yellow-200',
    isPopular: true
  },
  {
    id: 'upsc',
    name: 'UPSC',
    description: 'Union Public Service Commission preparation for civil services and other central government exams.',
    logo: UPSC_LOGO,
    studentsEnrolled: 22150,
    examsAvailable: 8,
    colorClass: 'bg-red-50 border-red-200',
    isPopular: true
  },
  {
    id: 'state-psc',
    name: 'State PSC',
    description: 'State Public Service Commission exam preparation with state-specific content and syllabus.',
    logo: UPSC_LOGO,
    studentsEnrolled: 35420,
    examsAvailable: 28,
    colorClass: 'bg-orange-50 border-orange-200',
    isPopular: true
  },
  {
    id: 'judicial',
    name: 'Judicial Services',
    description: 'Judicial examination preparation for state and district level judicial officer positions.',
    logo: UPSC_LOGO,
    studentsEnrolled: 18920,
    examsAvailable: 28,
    colorClass: 'bg-indigo-50 border-indigo-200',
    isPopular: true
  },
  {
    id: 'defence',
    name: 'Defence',
    description: 'Military and paramilitary force exam preparation including NDA, CDS, and CAPF.',
    logo: RAILWAY_LOGO,
    studentsEnrolled: 18920,
    examsAvailable: 7,
    colorClass: 'bg-purple-50 border-purple-200',
    isPopular: false
  },
  {
    id: 'regulatory',
    name: 'Regulatory',
    description: 'Focused preparation for regulatory body exams and government sector positions.',
    logo: IBPS_LOGO,
    studentsEnrolled: 15680,
    examsAvailable: 3,
    colorClass: 'bg-purple-50 border-purple-200',
    isPopular: false
  },
  {
    id: 'tnpsc',
    name: 'TNPSC',
    description: 'Tamil Nadu Public Service Commission exam preparation with state-specific content.',
    logo: SSC_LOGO,
    studentsEnrolled: 12340,
    examsAvailable: 6,
    colorClass: 'bg-orange-50 border-orange-200',
    isPopular: false
  },
  {
    id: 'engineering',
    name: 'Engineering',
    description: 'Technical exam preparation for engineering graduates including GATE, PSUs, and technical services.',
    logo: IBPS_LOGO,
    studentsEnrolled: 31250,
    examsAvailable: 15,
    colorClass: 'bg-teal-50 border-teal-200',
    isPopular: true
  },
  {
    id: 'others',
    name: 'Others',
    description: 'Various other competitive exams and specialized test preparations.',
    logo: NIACL_LOGO,
    studentsEnrolled: 8750,
    examsAvailable: 10,
    colorClass: 'bg-gray-50 border-gray-200',
    isPopular: false
  },
  // Regular categories from ExamCategorySelection
  {
    id: 'jaiib-caiib',
    name: 'JAIIB/CAIIB',
    description: 'JAIIB, CAIIB, Bank Promotion Exams',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/jaiib_stprpj.png',
    studentsEnrolled: 8250,
    examsAvailable: 12,
    colorClass: 'bg-blue-50 border-blue-200',
    isPopular: false
  },
  {
    id: 'railways-rrb',
    name: 'Railways RRB',
    description: 'NTPC, JE, ALP, Group D',
    logo: RAILWAY_LOGO,
    studentsEnrolled: 18750,
    examsAvailable: 8,
    colorClass: 'bg-yellow-50 border-yellow-200',
    isPopular: true
  },
  {
    id: 'civil-services',
    name: 'Civil Services',
    description: 'UPSC, BPSC, TNPSC, UPPSC',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
    studentsEnrolled: 16800,
    examsAvailable: 10,
    colorClass: 'bg-red-50 border-red-200',
    isPopular: true
  },
  {
    id: 'ugc-net-ctet',
    name: 'UGC NET & CTET',
    description: 'UGC NET, CTET & Teaching Exams',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/ctet_neqteo.jpg',
    studentsEnrolled: 11280,
    examsAvailable: 8,
    colorClass: 'bg-green-50 border-green-200',
    isPopular: false
  },
  {
    id: 'agriculture-exams',
    name: 'Agriculture Exams',
    description: 'IBPS SO Agri, DSSSB, ICAR, BoM AFO',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/icar1_dwazuz.jpg',
    studentsEnrolled: 4800,
    examsAvailable: 5,
    colorClass: 'bg-green-50 border-green-200',
    isPopular: false
  },
  {
    id: 'mba-entrance',
    name: 'MBA Entrance',
    description: 'CAT, XAT, NMAT, SNAP, CMAT',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062183/mba_dh3xto.png',
    studentsEnrolled: 9400,
    examsAvailable: 7,
    colorClass: 'bg-purple-50 border-purple-200',
    isPopular: false
  },
  {
    id: 'jk-ladakh-exams',
    name: 'J&K + Ladakh Exams',
    description: 'JK Bank, JKSSB, Panchayat',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/jkssb1_cyoig9.jpg',
    studentsEnrolled: 5800,
    examsAvailable: 4,
    colorClass: 'bg-orange-50 border-orange-200',
    isPopular: false
  },
  {
    id: 'judiciary-exams',
    name: 'Judiciary Exams',
    description: 'Rajasthan, Haryana, Delhi, UP, MP',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062062/judi_ev3new.png',
    studentsEnrolled: 5200,
    examsAvailable: 6,
    colorClass: 'bg-indigo-50 border-indigo-200',
    isPopular: false
  },
  {
    id: 'uttar-pradesh-exams',
    name: 'Uttar Pradesh Exams',
    description: 'UP Police, Constable, SI',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744179613/Railway_Protection_Force_Logo_i5egw0.png',
    studentsEnrolled: 9200,
    examsAvailable: 5,
    colorClass: 'bg-orange-50 border-orange-200',
    isPopular: false
  },
  {
    id: 'banking',
    name: 'Banking',
    description: 'IBPS, SBI, RBI and other banking exams',
    logo: IBPS_LOGO,
    studentsEnrolled: 15420,
    examsAvailable: 12,
    colorClass: 'bg-blue-50 border-blue-200',
    isPopular: true
  },
  {
    id: 'upsc-epfo',
    name: 'UPSC EPFO',
    description: 'EO/AO, APFC, SSA',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/epfo_hkczjj.jpg',
    studentsEnrolled: 4200,
    examsAvailable: 3,
    colorClass: 'bg-red-50 border-red-200',
    isPopular: false
  },
  {
    id: 'karnataka-exams',
    name: 'Karnataka Exams',
    description: 'PSI, PWD, KAS',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/karn1_xl4tco.jpg',
    studentsEnrolled: 7600,
    examsAvailable: 4,
    colorClass: 'bg-orange-50 border-orange-200',
    isPopular: false
  },
  {
    id: 'tamil-nadu-exams',
    name: 'Tamil Nadu Exams',
    description: 'TNPSC Group 2, 4, VAO, TNUSRB SI',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061570/png-transparent-government-of-tamil-nadu-seal-of-tamil-nadu-tamil-nadu-legislative-assembly-state-emblem-of-india-others-miscellaneous-emblem-food-thumbnail_sy4peu.png',
    studentsEnrolled: 8960,
    examsAvailable: 6,
    colorClass: 'bg-orange-50 border-orange-200',
    isPopular: false
  },
  {
    id: 'bihar-exams',
    name: 'Bihar Exams',
    description: 'BPSC, Police, State Exams',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062062/biharpol_dpbgss.jpg',
    studentsEnrolled: 6800,
    examsAvailable: 4,
    colorClass: 'bg-orange-50 border-orange-200',
    isPopular: false
  },
  // Combo categories
  {
    id: 'banking-ssc-railway-combo',
    name: 'Banking + SSC + Railway',
    description: 'Combined prep for all major govt exams',
    logo: IBPS_LOGO,
    studentsEnrolled: 22500,
    examsAvailable: 35,
    colorClass: 'bg-gradient-to-r from-blue-50 to-green-50 border-blue-200',
    isPopular: true
  },
  {
    id: 'ssc-railway-combo',
    name: 'SSC + Railway',
    description: 'Optimized prep for both exam types',
    logo: SSC_LOGO,
    studentsEnrolled: 28700,
    examsAvailable: 23,
    colorClass: 'bg-gradient-to-r from-green-50 to-yellow-50 border-green-200',
    isPopular: true
  },
  {
    id: 'upsc-tnpsc-combo',
    name: 'UPSC + TNPSC',
    description: 'National and TN state civil services',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
    studentsEnrolled: 14200,
    examsAvailable: 16,
    colorClass: 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200',
    isPopular: false
  },
  {
    id: 'ssc-railway-defence-combo',
    name: 'SSC + Railway + Defence',
    description: 'Govt & defense services combined',
    logo: SSC_LOGO,
    studentsEnrolled: 19600,
    examsAvailable: 30,
    colorClass: 'bg-gradient-to-r from-green-50 to-purple-50 border-green-200',
    isPopular: true
  }
];

// Enhanced banking exams with proper logos
export const bankingExams: Exam[] = [
  { id: 'sbi-po', name: 'SBI PO', logo: SBI_LOGO, logoAlt: 'SBI', isPopular: true },
  { id: 'sbi-clerk', name: 'SBI Clerk', logo: SBI_LOGO, logoAlt: 'SBI', isPopular: true },
  { id: 'ibps-rrb-officer', name: 'IBPS RRB Officer', logo: IBPS_LOGO, logoAlt: 'IBPS', isPopular: true },
  { id: 'ibps-rrb-assistant', name: 'IBPS RRB Assistant', logo: IBPS_LOGO, logoAlt: 'IBPS', isPopular: true },
  { id: 'ibps-po', name: 'IBPS PO', logo: IBPS_LOGO, logoAlt: 'IBPS', isPopular: true },
  { id: 'ibps-clerk', name: 'IBPS Clerk', logo: IBPS_LOGO, logoAlt: 'IBPS', isPopular: true },
  { id: 'tmb', name: 'Tamilnad Mercantile Bank', logo: SBI_LOGO, logoAlt: 'TMB', isPopular: false },
  { id: 'uco-bank-lbo', name: 'UCO Bank LBO', logo: SBI_LOGO, logoAlt: 'UCO', isPopular: false },
  { id: 'central-bank-pgdbf', name: 'Central Bank of India PGDBF', logo: SBI_LOGO, logoAlt: 'Central Bank', isPopular: false },
  { id: 'idbi-jam-pgdbf', name: 'IDBI JAM PGDBF', logo: IDBI_LOGO, logoAlt: 'IDBI', isPopular: false },
  { id: 'niacl-assistant', name: 'NIACL Assistant', logo: NIACL_LOGO, logoAlt: 'NIACL', isPopular: false },
  { id: 'nicl-assistant', name: 'NICL Assistant', logo: NICL_LOGO, logoAlt: 'NICL', isPopular: false }
];

export const sscExams: Exam[] = [
  { id: 'ssc-cgl', name: 'SSC CGL', logo: SSC_LOGO, logoAlt: 'SSC CGL', isPopular: true },
  { id: 'ssc-chsl', name: 'SSC CHSL', logo: SSC_LOGO, logoAlt: 'SSC CHSL', isPopular: true },
  { id: 'ssc-mts', name: 'SSC MTS', logo: SSC_LOGO, logoAlt: 'SSC MTS', isPopular: false },
  { id: 'ssc-gd', name: 'SSC GD', logo: SSC_LOGO, logoAlt: 'SSC GD', isPopular: false }
];

export const railwayExams: Exam[] = [
  { id: 'rrb-ntpc', name: 'RRB NTPC', logo: RAILWAY_LOGO, logoAlt: 'RRB NTPC', isPopular: true },
  { id: 'rrb-group-d', name: 'RRB Group D', logo: RAILWAY_LOGO, logoAlt: 'RRB Group D', isPopular: true },
  { id: 'rrb-alp', name: 'RRB ALP', logo: RAILWAY_LOGO, logoAlt: 'RRB ALP', isPopular: false },
  { id: 'rrb-scale2-eng', name: 'RRB Scale2 Officer [Eng]', logo: RAILWAY_LOGO, logoAlt: 'RRB Scale2 Officer', isPopular: false },
  { id: 'rrb-scale2-hin', name: 'RRB Scale2 Officer [Hin]', logo: RAILWAY_LOGO, logoAlt: 'RRB Scale2 Officer', isPopular: false }
];

export const upscExams: Exam[] = [
  { id: 'upsc-cse', name: 'UPSC Civil Services', logo: UPSC_LOGO, logoAlt: 'UPSC CSE', isPopular: true },
  { id: 'upsc-cds', name: 'UPSC CDS', logo: UPSC_LOGO, logoAlt: 'UPSC CDS', isPopular: true },
  { id: 'upsc-nda', name: 'UPSC NDA', logo: UPSC_LOGO, logoAlt: 'UPSC NDA', isPopular: true },
  { id: 'upsc-capf', name: 'UPSC CAPF', logo: UPSC_LOGO, logoAlt: 'UPSC CAPF', isPopular: false }
];

export const statePscExams: Exam[] = [
  { id: 'tnpsc-group1', name: 'TNPSC Group 1', logo: UPSC_LOGO, logoAlt: 'TNPSC', isPopular: true },
  { id: 'tnpsc-group2', name: 'TNPSC Group 2', logo: UPSC_LOGO, logoAlt: 'TNPSC', isPopular: true },
  { id: 'tnpsc-group4', name: 'TNPSC Group 4', logo: UPSC_LOGO, logoAlt: 'TNPSC', isPopular: true },
  { id: 'uppsc-pcs', name: 'UPPSC PCS', logo: UPSC_LOGO, logoAlt: 'UPPSC', isPopular: true },
  { id: 'mppsc-pcs', name: 'MPPSC PCS', logo: UPSC_LOGO, logoAlt: 'MPPSC', isPopular: true },
  { id: 'bpsc-pcs', name: 'BPSC PCS', logo: UPSC_LOGO, logoAlt: 'BPSC', isPopular: true },
  { id: 'opsc-pcs', name: 'OPSC PCS', logo: UPSC_LOGO, logoAlt: 'OPSC', isPopular: false },
  { id: 'rpsc-pcs', name: 'RPSC PCS', logo: UPSC_LOGO, logoAlt: 'RPSC', isPopular: true },
  { id: 'gpsc-pcs', name: 'GPSC PCS', logo: UPSC_LOGO, logoAlt: 'GPSC', isPopular: false },
  { id: 'hpsc-pcs', name: 'HPSC PCS', logo: UPSC_LOGO, logoAlt: 'HPSC', isPopular: false },
  { id: 'jpsc-pcs', name: 'JPSC PCS', logo: UPSC_LOGO, logoAlt: 'JPSC', isPopular: false },
  { id: 'kpsc-pcs', name: 'KPSC PCS', logo: UPSC_LOGO, logoAlt: 'KPSC', isPopular: true },
  { id: 'cgpsc-pcs', name: 'CGPSC PCS', logo: UPSC_LOGO, logoAlt: 'CGPSC', isPopular: false },
  { id: 'appsc-pcs', name: 'APPSC PCS', logo: UPSC_LOGO, logoAlt: 'APPSC', isPopular: true },
  { id: 'tspsc-pcs', name: 'TSPSC PCS', logo: UPSC_LOGO, logoAlt: 'TSPSC', isPopular: true }
];

export const judicialExams: Exam[] = [
  { id: 'tn-judicial', name: 'TN Judicial Services', logo: UPSC_LOGO, logoAlt: 'TN Judicial', isPopular: true },
  { id: 'up-judicial', name: 'UP Judicial Services', logo: UPSC_LOGO, logoAlt: 'UP Judicial', isPopular: true },
  { id: 'bihar-judicial', name: 'Bihar Judicial Services', logo: UPSC_LOGO, logoAlt: 'Bihar Judicial', isPopular: true },
  { id: 'mp-judicial', name: 'MP Judicial Services', logo: UPSC_LOGO, logoAlt: 'MP Judicial', isPopular: true },
  { id: 'rajasthan-judicial', name: 'Rajasthan Judicial Services', logo: UPSC_LOGO, logoAlt: 'Rajasthan Judicial', isPopular: true },
  { id: 'karnataka-judicial', name: 'Karnataka Judicial Services', logo: UPSC_LOGO, logoAlt: 'Karnataka Judicial', isPopular: true },
  { id: 'gujarat-judicial', name: 'Gujarat Judicial Services', logo: UPSC_LOGO, logoAlt: 'Gujarat Judicial', isPopular: false },
  { id: 'ap-judicial', name: 'AP Judicial Services', logo: UPSC_LOGO, logoAlt: 'AP Judicial', isPopular: true },
  { id: 'telangana-judicial', name: 'Telangana Judicial Services', logo: UPSC_LOGO, logoAlt: 'Telangana Judicial', isPopular: true },
  { id: 'haryana-judicial', name: 'Haryana Judicial Services', logo: UPSC_LOGO, logoAlt: 'Haryana Judicial', isPopular: false }
];

// Additional exam arrays for categories from ExamCategorySelection
export const jaibCaibExams: Exam[] = [
  { id: 'jaiib', name: 'JAIIB', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/jaiib_stprpj.png', logoAlt: 'JAIIB', isPopular: true },
  { id: 'caiib', name: 'CAIIB', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/jaiib_stprpj.png', logoAlt: 'CAIIB', isPopular: true },
  { id: 'bank-promotion', name: 'Bank Promotion', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/jaiib_stprpj.png', logoAlt: 'Bank Promotion', isPopular: false }
];

export const railwaysRrbExams: Exam[] = [
  { id: 'rrb-ntpc', name: 'RRB NTPC', logo: RAILWAY_LOGO, logoAlt: 'RRB NTPC', isPopular: true },
  { id: 'rrb-je', name: 'RRB JE', logo: RAILWAY_LOGO, logoAlt: 'RRB JE', isPopular: true },
  { id: 'rrb-alp', name: 'RRB ALP', logo: RAILWAY_LOGO, logoAlt: 'RRB ALP', isPopular: false },
  { id: 'rrb-group-d', name: 'RRB Group D', logo: RAILWAY_LOGO, logoAlt: 'RRB Group D', isPopular: true }
];

export const civilServicesExams: Exam[] = [
  { id: 'upsc-cse', name: 'UPSC CSE', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png', logoAlt: 'UPSC CSE', isPopular: true },
  { id: 'bpsc', name: 'BPSC', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png', logoAlt: 'BPSC', isPopular: true },
  { id: 'tnpsc', name: 'TNPSC', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png', logoAlt: 'TNPSC', isPopular: true },
  { id: 'uppsc', name: 'UPPSC', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png', logoAlt: 'UPPSC', isPopular: true }
];

export const regulatoryExams: Exam[] = [
  { id: 'rbi', name: 'RBI', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp', logoAlt: 'RBI', isPopular: true },
  { id: 'nabard', name: 'NABARD', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp', logoAlt: 'NABARD', isPopular: false },
  { id: 'sebi', name: 'SEBI', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp', logoAlt: 'SEBI', isPopular: false },
  { id: 'irdai', name: 'IRDAI', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp', logoAlt: 'IRDAI', isPopular: false },
  { id: 'sidbi', name: 'SIDBI', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp', logoAlt: 'SIDBI', isPopular: false }
];

export const ugcNetCtetExams: Exam[] = [
  { id: 'ugc-net', name: 'UGC NET', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/ctet_neqteo.jpg', logoAlt: 'UGC NET', isPopular: true },
  { id: 'ctet', name: 'CTET', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/ctet_neqteo.jpg', logoAlt: 'CTET', isPopular: true },
  { id: 'teaching-exams', name: 'Teaching Exams', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/ctet_neqteo.jpg', logoAlt: 'Teaching Exams', isPopular: false }
];

export const agricultureExams: Exam[] = [
  { id: 'ibps-so-agri', name: 'IBPS SO Agriculture', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/icar1_dwazuz.jpg', logoAlt: 'IBPS SO Agriculture', isPopular: true },
  { id: 'dsssb', name: 'DSSSB', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/icar1_dwazuz.jpg', logoAlt: 'DSSSB', isPopular: false },
  { id: 'icar', name: 'ICAR', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/icar1_dwazuz.jpg', logoAlt: 'ICAR', isPopular: false },
  { id: 'bom-afo', name: 'BoM AFO', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/icar1_dwazuz.jpg', logoAlt: 'BoM AFO', isPopular: false }
];

export const mbaEntranceExams: Exam[] = [
  { id: 'cat', name: 'CAT', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062183/mba_dh3xto.png', logoAlt: 'CAT', isPopular: true },
  { id: 'xat', name: 'XAT', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062183/mba_dh3xto.png', logoAlt: 'XAT', isPopular: true },
  { id: 'nmat', name: 'NMAT', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062183/mba_dh3xto.png', logoAlt: 'NMAT', isPopular: false },
  { id: 'snap', name: 'SNAP', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062183/mba_dh3xto.png', logoAlt: 'SNAP', isPopular: false },
  { id: 'cmat', name: 'CMAT', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062183/mba_dh3xto.png', logoAlt: 'CMAT', isPopular: false }
];

export const bankingExamsMain: Exam[] = [
  { id: 'sbi-po', name: 'SBI PO', logo: SBI_LOGO, logoAlt: 'SBI', isPopular: true },
  { id: 'sbi-clerk', name: 'SBI Clerk', logo: SBI_LOGO, logoAlt: 'SBI', isPopular: true },
  { id: 'ibps-po', name: 'IBPS PO', logo: IBPS_LOGO, logoAlt: 'IBPS', isPopular: true },
  { id: 'ibps-clerk', name: 'IBPS Clerk', logo: IBPS_LOGO, logoAlt: 'IBPS', isPopular: true },
  { id: 'ibps-rrb-po', name: 'IBPS RRB PO', logo: IBPS_LOGO, logoAlt: 'IBPS', isPopular: true },
  { id: 'ibps-rrb-clerk', name: 'IBPS RRB Clerk', logo: IBPS_LOGO, logoAlt: 'IBPS', isPopular: true },
  { id: 'rbi-grade-b', name: 'RBI Grade B', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp', logoAlt: 'RBI', isPopular: true },
  { id: 'rbi-assistant', name: 'RBI Assistant', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp', logoAlt: 'RBI', isPopular: true },
  { id: 'lic-aao', name: 'LIC AAO', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/jaiib_stprpj.png', logoAlt: 'LIC', isPopular: false },
  { id: 'lic-ado', name: 'LIC ADO', logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/jaiib_stprpj.png', logoAlt: 'LIC', isPopular: false },
  { id: 'uiic-ao', name: 'UIIC AO', logo: NIACL_LOGO, logoAlt: 'UIIC', isPopular: false },
  { id: 'niacl-ao', name: 'NIACL AO', logo: NIACL_LOGO, logoAlt: 'NIACL', isPopular: false }
];

// Create exam arrays for missing categories
export const jkLadakhExams: Exam[] = [
  { id: 'jk-ssc', name: 'J&K SSC', logo: SSC_LOGO, logoAlt: 'J&K SSC', isPopular: true },
  { id: 'jk-police', name: 'J&K Police', logo: SSC_LOGO, logoAlt: 'J&K Police', isPopular: true },
  { id: 'ladakh-ut', name: 'Ladakh UT Exams', logo: SSC_LOGO, logoAlt: 'Ladakh UT', isPopular: false }
];

export const judiciaryExams: Exam[] = [
  { id: 'delhi-judicial', name: 'Delhi Judicial Service', logo: UPSC_LOGO, logoAlt: 'Delhi Judicial', isPopular: true },
  { id: 'punjab-judicial', name: 'Punjab Judicial Service', logo: UPSC_LOGO, logoAlt: 'Punjab Judicial', isPopular: true },
  { id: 'himachal-judicial', name: 'Himachal Judicial Service', logo: UPSC_LOGO, logoAlt: 'Himachal Judicial', isPopular: false }
];

export const uttarPradeshExams: Exam[] = [
  { id: 'up-si', name: 'UP SI', logo: SSC_LOGO, logoAlt: 'UP SI', isPopular: true },
  { id: 'up-constable', name: 'UP Police Constable', logo: SSC_LOGO, logoAlt: 'UP Police', isPopular: true },
  { id: 'up-lekhpal', name: 'UP Lekhpal', logo: SSC_LOGO, logoAlt: 'UP Lekhpal', isPopular: false }
];

export const upscEpfoExams: Exam[] = [
  { id: 'epfo-assistant', name: 'EPFO Assistant', logo: UPSC_LOGO, logoAlt: 'EPFO Assistant', isPopular: true },
  { id: 'epfo-officer', name: 'EPFO Social Security Officer', logo: UPSC_LOGO, logoAlt: 'EPFO Officer', isPopular: true }
];

export const karnatakaExams: Exam[] = [
  { id: 'karnataka-police', name: 'Karnataka Police', logo: SSC_LOGO, logoAlt: 'Karnataka Police', isPopular: true },
  { id: 'karnataka-bank', name: 'Karnataka Bank', logo: SBI_LOGO, logoAlt: 'Karnataka Bank', isPopular: false },
  { id: 'kpsc-exams', name: 'KPSC Exams', logo: UPSC_LOGO, logoAlt: 'KPSC', isPopular: true }
];

export const tamilNaduExams: Exam[] = [
  { id: 'tn-police', name: 'TN Police', logo: SSC_LOGO, logoAlt: 'TN Police', isPopular: true },
  { id: 'tn-mts', name: 'TN MTS', logo: SSC_LOGO, logoAlt: 'TN MTS', isPopular: true },
  { id: 'tnpsc-vao', name: 'TNPSC VAO', logo: UPSC_LOGO, logoAlt: 'TNPSC VAO', isPopular: false }
];

export const biharExams: Exam[] = [
  { id: 'bihar-police', name: 'Bihar Police', logo: SSC_LOGO, logoAlt: 'Bihar Police', isPopular: true },
  { id: 'bihar-stet', name: 'Bihar STET', logo: SSC_LOGO, logoAlt: 'Bihar STET', isPopular: true },
  { id: 'bssc-exams', name: 'BSSC Exams', logo: SSC_LOGO, logoAlt: 'BSSC', isPopular: false }
];

// Added test types and question types for admin functions
export const testTypes = [
  { id: 'prelims', name: 'Prelims' },
  { id: 'mains', name: 'Mains' },
  { id: 'pyq', name: 'PYQ (Previous Year Questions)' },
  { id: 'sectional', name: 'Sectional Test' }
];

export const questionTypes = [
  { id: 'mcq', name: 'Multiple Choice Question' },
  { id: 'di', name: 'Data Interpretation (Image/Chart)' },
  { id: 'paragraph', name: 'Paragraph Based' },
  { id: 'matching', name: 'Match the Following' },
  { id: 'truefalse', name: 'True/False' },
  { id: 'comprehensive', name: 'Comprehensive Reading' }
];

export const sections = {
  'banking-insurance': [
    { id: 'quantitative-aptitude', name: 'Quantitative Aptitude' },
    { id: 'reasoning', name: 'Reasoning Ability' },
    { id: 'english', name: 'English Language' },
    { id: 'general-awareness', name: 'General Awareness' },
    { id: 'computer', name: 'Computer Knowledge' }
  ],
  'ssc': [
    { id: 'quantitative-aptitude', name: 'Quantitative Aptitude' },
    { id: 'reasoning', name: 'Reasoning Ability' },
    { id: 'english', name: 'English Language' },
    { id: 'general-awareness', name: 'General Studies' }
  ],
  'railway': [
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'reasoning', name: 'Reasoning' },
    { id: 'general-awareness', name: 'General Awareness' },
    { id: 'general-science', name: 'General Science' }
  ],
  'upsc': [
    { id: 'history', name: 'History' },
    { id: 'geography', name: 'Geography' },
    { id: 'polity', name: 'Indian Polity' },
    { id: 'economics', name: 'Economics' },
    { id: 'environment', name: 'Environment & Ecology' },
    { id: 'science-technology', name: 'Science & Technology' },
    { id: 'current-affairs', name: 'Current Affairs' }
  ],
  'state-psc': [
    { id: 'history', name: 'History' },
    { id: 'geography', name: 'Geography' },
    { id: 'polity', name: 'Indian Polity' },
    { id: 'economics', name: 'Economics' },
    { id: 'state-affairs', name: 'State Affairs' },
    { id: 'current-affairs', name: 'Current Affairs' }
  ],
  'judicial': [
    { id: 'constitutional-law', name: 'Constitutional Law' },
    { id: 'criminal-law', name: 'Criminal Law' },
    { id: 'civil-law', name: 'Civil Law' },
    { id: 'evidence-law', name: 'Evidence Law' },
    { id: 'legal-aptitude', name: 'Legal Aptitude' }
  ],
  'defence': [
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'physics', name: 'Physics' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'general-knowledge', name: 'General Knowledge' },
    { id: 'english', name: 'English' }
  ],
  'default': [
    { id: 'section-1', name: 'Section 1' },
    { id: 'section-2', name: 'Section 2' },
    { id: 'section-3', name: 'Section 3' }
  ]
};

// Helper function to get category info by ID
const getCategoryInfo = (categoryId: string) => {
  const category = examCategories.find(cat => cat.id === categoryId);
  return {
    name: category?.name || categoryId,
    logo: category?.logo || NIACL_LOGO
  };
};

// New function to get grouped exams for combo categories
export const getExamsByCategoryGrouped = (category: string): GroupedExams => {
  console.log('Getting grouped exams for category:', category);

  // Handle combo categories by creating sections for each constituent category
  if (category === 'banking-ssc-railway-combo') {
    const bankingInfo = getCategoryInfo('banking-insurance');
    const sscInfo = getCategoryInfo('ssc');
    const railwayInfo = getCategoryInfo('railway');

    return {
      isGrouped: true,
      sections: [
        {
          categoryId: 'banking-insurance',
          categoryName: bankingInfo.name,
          logo: bankingInfo.logo,
          exams: bankingExams
        },
        {
          categoryId: 'ssc',
          categoryName: sscInfo.name,
          logo: sscInfo.logo,
          exams: sscExams
        },
        {
          categoryId: 'railway',
          categoryName: railwayInfo.name,
          logo: railwayInfo.logo,
          exams: railwayExams
        }
      ]
    };
  }

  if (category === 'ssc-railway-combo') {
    const sscInfo = getCategoryInfo('ssc');
    const railwayInfo = getCategoryInfo('railway');

    return {
      isGrouped: true,
      sections: [
        {
          categoryId: 'ssc',
          categoryName: sscInfo.name,
          logo: sscInfo.logo,
          exams: sscExams
        },
        {
          categoryId: 'railway',
          categoryName: railwayInfo.name,
          logo: railwayInfo.logo,
          exams: railwayExams
        }
      ]
    };
  }

  if (category === 'upsc-tnpsc-combo') {
    const upscInfo = getCategoryInfo('upsc');
    const tnpscInfo = getCategoryInfo('tnpsc');

    return {
      isGrouped: true,
      sections: [
        {
          categoryId: 'upsc',
          categoryName: upscInfo.name,
          logo: upscInfo.logo,
          exams: upscExams
        },
        {
          categoryId: 'tnpsc',
          categoryName: tnpscInfo.name,
          logo: tnpscInfo.logo,
          exams: tamilNaduExams
        }
      ]
    };
  }

  if (category === 'ssc-railway-defence-combo') {
    const sscInfo = getCategoryInfo('ssc');
    const railwayInfo = getCategoryInfo('railway');
    const defenceInfo = getCategoryInfo('defence');

    return {
      isGrouped: true,
      sections: [
        {
          categoryId: 'ssc',
          categoryName: sscInfo.name,
          logo: sscInfo.logo,
          exams: sscExams
        },
        {
          categoryId: 'railway',
          categoryName: railwayInfo.name,
          logo: railwayInfo.logo,
          exams: railwayExams
        },
        {
          categoryId: 'defence',
          categoryName: defenceInfo.name,
          logo: defenceInfo.logo,
          exams: upscExams.filter(exam => exam.id.includes('nda') || exam.id.includes('cds'))
        }
      ]
    };
  }

  // For regular categories, return single section
  const regularExams = getExamsByCategory(category);
  const categoryInfo = getCategoryInfo(category);

  return {
    isGrouped: false,
    sections: [
      {
        categoryId: category,
        categoryName: categoryInfo.name,
        logo: categoryInfo.logo,
        exams: regularExams
      }
    ]
  };
};

export const getExamsByCategory = (category: string): Exam[] => {
  console.log('Getting exams for category:', category);

  // Handle combo categories by combining exams from multiple categories
  if (category === 'banking-ssc-railway-combo') {
    return [...bankingExams, ...sscExams, ...railwayExams];
  }

  if (category === 'ssc-railway-combo') {
    return [...sscExams, ...railwayExams];
  }

  if (category === 'upsc-tnpsc-combo') {
    return [...upscExams, ...tamilNaduExams];
  }

  if (category === 'ssc-railway-defence-combo') {
    return [...sscExams, ...railwayExams, ...upscExams.filter(exam => exam.id.includes('nda') || exam.id.includes('cds'))];
  }

  switch (category) {
    // Original categories
    case 'banking-insurance':
      return bankingExams;
    case 'ssc':
      return sscExams;
    case 'railway':
      return railwayExams;
    case 'upsc':
      return upscExams;
    case 'state-psc':
      return statePscExams;
    case 'judicial':
      return judicialExams;

    // New categories from ExamCategorySelection
    case 'jaiib-caiib':
      return jaibCaibExams;
    case 'railways-rrb':
      return railwaysRrbExams;
    case 'civil-services':
      return civilServicesExams;
    case 'regulatory':
      return regulatoryExams;
    case 'ugc-net-ctet':
      return ugcNetCtetExams;
    case 'agriculture-exams':
      return agricultureExams;
    case 'mba-entrance':
      return mbaEntranceExams;
    case 'banking':
      return bankingExamsMain;

    // Additional categories with proper exam arrays
    case 'jk-ladakh-exams':
      return jkLadakhExams;
    case 'judiciary-exams':
      return judiciaryExams;
    case 'uttar-pradesh-exams':
      return uttarPradeshExams;
    case 'upsc-epfo':
      return upscEpfoExams;
    case 'karnataka-exams':
      return karnatakaExams;
    case 'tamil-nadu-exams':
      return tamilNaduExams;
    case 'bihar-exams':
      return biharExams;

    default:
      console.log('No exams found for category:', category);
      return [];
  }
};

export const getSectionsByCategory = (category: string) => {
  return sections[category as keyof typeof sections] || sections.default;
};

// For use in the exam interface - status colors and labels
export const questionStatusColors = {
  answered: {
    bg: 'bg-green-500',
    text: 'text-white',
    label: 'Answered'
  },
  notAnswered: {
    bg: 'bg-red-500',
    text: 'text-white',
    label: 'Not Answered'
  },
  notVisited: {
    bg: 'bg-gray-200',
    text: 'text-gray-800',
    label: 'Not Visited'
  },
  marked: {
    bg: 'bg-purple-600',
    text: 'text-white',
    label: 'Marked for Review'
  },
  answeredMarked: {
    bg: 'bg-orange-500',
    text: 'text-white',
    label: 'Answered & Marked for Review'
  }
};
