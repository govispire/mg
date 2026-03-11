
export interface ExamNotification {
  id: string;
  examName: string;
  categoryIds: string[];
  vacancies: number;
  qualification: string;
  applicationPeriod: {
    startDate: string;
    endDate: string;
  };
  paymentLastDate: string;
  examDate: string;
  notificationStatus: 'new' | 'normal';
  applyStatus: 'new' | 'apply' | 'applied';
  resultStatus: 'pending' | 'declared' | 'upcoming';
  admitCardStatus: 'released' | 'pending';
  isUpcoming: boolean;
  urls: {
    notificationPdf?: string;
    applicationForm?: string;
    resultPage?: string;
    admitCardDownload?: string;
  };
}

export const examNotifications: ExamNotification[] = [
  // ── Banking ────────────────────────────────────────────────────────────────
  {
    id: 'ibps-po-2025',
    examName: 'IBPS PO 2025',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 4455,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '01/06/2025', endDate: '30/06/2025' },
    paymentLastDate: '15/06/2025',
    examDate: '10/09/2025',
    notificationStatus: 'new',
    applyStatus: 'new',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.ibps.in/notifications/ibps-po-2025.pdf',
      applicationForm: 'https://www.ibps.in/apply/po-2025'
    }
  },
  {
    id: 'ibps-clerk-2025',
    examName: 'IBPS Clerk 2025',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 6128,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '01/07/2025', endDate: '21/07/2025' },
    paymentLastDate: '15/07/2025',
    examDate: '25/10/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.ibps.in/notifications/ibps-clerk-2025.pdf',
      applicationForm: 'https://www.ibps.in/apply/clerk-2025'
    }
  },
  {
    id: 'sbi-po-2025',
    examName: 'SBI PO 2025',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 2000,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '05/07/2025', endDate: '25/07/2025' },
    paymentLastDate: '20/07/2025',
    examDate: '05/10/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://sbi.co.in/notifications/po-2025.pdf',
      applicationForm: 'https://sbi.co.in/careers/apply/po-2025'
    }
  },
  {
    id: 'sbi-clerk-2025',
    examName: 'SBI Clerk 2025',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 13735,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '20/05/2025', endDate: '10/06/2025' },
    paymentLastDate: '05/06/2025',
    examDate: '15/08/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'declared',
    admitCardStatus: 'released',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://sbi.co.in/notifications/clerk-2025.pdf',
      applicationForm: 'https://sbi.co.in/careers/apply/clerk-2025',
      admitCardDownload: 'https://sbi.co.in/admit-card/clerk-2025',
      resultPage: 'https://sbi.co.in/results/clerk-2025'
    }
  },
  {
    id: 'rrb-po-2025',
    examName: 'RRB PO 2025',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 9985,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '01/07/2025', endDate: '31/07/2025' },
    paymentLastDate: '25/07/2025',
    examDate: '05/10/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.rrbcdg.gov.in/notifications/po-2025.pdf',
      applicationForm: 'https://www.rrbcdg.gov.in/apply/po-2025'
    }
  },
  {
    id: 'rrb-clerk-2025',
    examName: 'RRB Clerk 2025',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 6160,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '05/08/2025', endDate: '01/09/2025' },
    paymentLastDate: '25/08/2025',
    examDate: '10/11/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.rrbcdg.gov.in/notifications/clerk-2025.pdf',
      applicationForm: 'https://www.rrbcdg.gov.in/apply/clerk-2025'
    }
  },
  {
    id: 'iob-lbo-2025',
    examName: 'Indian Overseas Bank LBO 2025',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 349,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '10/06/2025', endDate: '05/07/2025' },
    paymentLastDate: '30/06/2025',
    examDate: '20/09/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.iob.in/notifications/lbo-2025.pdf',
      applicationForm: 'https://www.iob.in/careers/apply/lbo-2025'
    }
  },
  {
    id: 'idbi-jam-2025',
    examName: 'IDBI JAM Grade O Officer 2025',
    categoryIds: ['banking-insurance', 'banking'],
    vacancies: 600,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '15/05/2025', endDate: '10/06/2025' },
    paymentLastDate: '31/05/2025',
    examDate: '25/08/2025',
    notificationStatus: 'normal',
    applyStatus: 'applied',
    resultStatus: 'pending',
    admitCardStatus: 'released',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.idbibank.in/notifications/jam-2025.pdf',
      applicationForm: 'https://www.idbibank.in/careers/apply/jam-2025',
      admitCardDownload: 'https://www.idbibank.in/admit-card/jam-2025'
    }
  },

  // ── Insurance ──────────────────────────────────────────────────────────────
  {
    id: 'lic-aao-2025',
    examName: 'LIC AAO 2025',
    categoryIds: ['banking-insurance'],
    vacancies: 300,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '20/06/2025', endDate: '10/07/2025' },
    paymentLastDate: '05/07/2025',
    examDate: '01/09/2025',
    notificationStatus: 'new',
    applyStatus: 'new',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://licindia.in/notifications/aao-2025.pdf',
      applicationForm: 'https://licindia.in/apply/aao-2025'
    }
  },
  {
    id: 'niacl-ao-2025',
    examName: 'NIACL AO 2025',
    categoryIds: ['banking-insurance'],
    vacancies: 160,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '01/08/2025', endDate: '21/08/2025' },
    paymentLastDate: '18/08/2025',
    examDate: '05/10/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://newindia.co.in/notifications/ao-2025.pdf',
      applicationForm: 'https://newindia.co.in/apply/ao-2025'
    }
  },

  // ── RBI / Regulatory ───────────────────────────────────────────────────────
  {
    id: 'rbi-grade-b-2025',
    examName: 'RBI Grade B Officer 2025',
    categoryIds: ['banking-insurance', 'regulatory'],
    vacancies: 291,
    qualification: 'Any Graduate (60%)',
    applicationPeriod: { startDate: '10/05/2025', endDate: '31/05/2025' },
    paymentLastDate: '28/05/2025',
    examDate: '01/08/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.rbi.org.in/notifications/grade-b-2025.pdf',
      applicationForm: 'https://www.rbi.org.in/apply/grade-b-2025'
    }
  },
  {
    id: 'nabard-grade-a-2025',
    examName: 'NABARD Grade A 2025',
    categoryIds: ['banking-insurance', 'regulatory'],
    vacancies: 102,
    qualification: 'Post Graduate / CA / CS',
    applicationPeriod: { startDate: '15/06/2025', endDate: '05/07/2025' },
    paymentLastDate: '02/07/2025',
    examDate: '25/08/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.nabard.org/notifications/grade-a-2025.pdf',
      applicationForm: 'https://www.nabard.org/apply/grade-a-2025'
    }
  },

  // ── SSC ────────────────────────────────────────────────────────────────────
  {
    id: 'ssc-cgl-2025',
    examName: 'SSC CGL 2025',
    categoryIds: ['ssc'],
    vacancies: 17727,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '15/06/2025', endDate: '15/07/2025' },
    paymentLastDate: '10/07/2025',
    examDate: '20/09/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://ssc.nic.in/notifications/cgl-2025.pdf',
      applicationForm: 'https://ssc.nic.in/apply/cgl-2025'
    }
  },
  {
    id: 'ssc-chsl-2025',
    examName: 'SSC CHSL 2025',
    categoryIds: ['ssc'],
    vacancies: 3712,
    qualification: '12th Pass',
    applicationPeriod: { startDate: '10/07/2025', endDate: '10/08/2025' },
    paymentLastDate: '05/08/2025',
    examDate: '15/10/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://ssc.nic.in/notifications/chsl-2025.pdf',
      applicationForm: 'https://ssc.nic.in/apply/chsl-2025'
    }
  },
  {
    id: 'ssc-mts-2025',
    examName: 'SSC MTS 2025',
    categoryIds: ['ssc'],
    vacancies: 8326,
    qualification: '10th Pass',
    applicationPeriod: { startDate: '01/09/2025', endDate: '30/09/2025' },
    paymentLastDate: '25/09/2025',
    examDate: '30/11/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://ssc.nic.in/notifications/mts-2025.pdf',
      applicationForm: 'https://ssc.nic.in/apply/mts-2025'
    }
  },
  {
    id: 'ssc-gd-2025',
    examName: 'SSC GD Constable 2025',
    categoryIds: ['ssc', 'defence'],
    vacancies: 26146,
    qualification: '10th Pass',
    applicationPeriod: { startDate: '15/10/2025', endDate: '15/11/2025' },
    paymentLastDate: '10/11/2025',
    examDate: '15/01/2026',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://ssc.nic.in/notifications/gd-2025.pdf',
      applicationForm: 'https://ssc.nic.in/apply/gd-2025'
    }
  },

  // ── Railway ────────────────────────────────────────────────────────────────
  {
    id: 'rrb-ntpc-2025',
    examName: 'RRB NTPC 2025',
    categoryIds: ['railways-rrb', 'railway'],
    vacancies: 11558,
    qualification: 'Any Graduate / 12th Pass',
    applicationPeriod: { startDate: '01/08/2025', endDate: '30/08/2025' },
    paymentLastDate: '25/08/2025',
    examDate: '15/11/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.rrbcdg.gov.in/notifications/ntpc-2025.pdf',
      applicationForm: 'https://www.rrbcdg.gov.in/apply/ntpc-2025'
    }
  },
  {
    id: 'rrb-group-d-2025',
    examName: 'RRB Group D 2025',
    categoryIds: ['railways-rrb', 'railway'],
    vacancies: 32438,
    qualification: '10th Pass / ITI',
    applicationPeriod: { startDate: '15/08/2025', endDate: '15/09/2025' },
    paymentLastDate: '10/09/2025',
    examDate: '25/11/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.rrbcdg.gov.in/notifications/group-d-2025.pdf',
      applicationForm: 'https://www.rrbcdg.gov.in/apply/group-d-2025'
    }
  },
  {
    id: 'rrb-je-2025',
    examName: 'RRB JE 2025',
    categoryIds: ['railways-rrb', 'railway'],
    vacancies: 7951,
    qualification: 'Diploma / B.E / B.Tech',
    applicationPeriod: { startDate: '20/09/2025', endDate: '20/10/2025' },
    paymentLastDate: '15/10/2025',
    examDate: '01/01/2026',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.rrbcdg.gov.in/notifications/je-2025.pdf',
      applicationForm: 'https://www.rrbcdg.gov.in/apply/je-2025'
    }
  },

  // ── UPSC ───────────────────────────────────────────────────────────────────
  {
    id: 'upsc-cse-2025',
    examName: 'UPSC Civil Services 2025',
    categoryIds: ['upsc', 'civil-services'],
    vacancies: 979,
    qualification: 'Any Graduate (Degree Level)',
    applicationPeriod: { startDate: '15/05/2025', endDate: '15/06/2025' },
    paymentLastDate: '10/06/2025',
    examDate: '20/08/2025',
    notificationStatus: 'normal',
    applyStatus: 'applied',
    resultStatus: 'declared',
    admitCardStatus: 'released',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.upsc.gov.in/notifications/cse-2025.pdf',
      applicationForm: 'https://www.upsc.gov.in/apply/cse-2025',
      resultPage: 'https://www.upsc.gov.in/results/cse-2025',
      admitCardDownload: 'https://www.upsc.gov.in/admit-card/cse-2025'
    }
  },
  {
    id: 'upsc-cds-2025',
    examName: 'UPSC CDS 2025',
    categoryIds: ['upsc', 'civil-services', 'defence'],
    vacancies: 457,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '20/06/2025', endDate: '20/07/2025' },
    paymentLastDate: '15/07/2025',
    examDate: '10/09/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.upsc.gov.in/notifications/cds-2025.pdf',
      applicationForm: 'https://www.upsc.gov.in/apply/cds-2025'
    }
  },
  {
    id: 'upsc-capf-2025',
    examName: 'UPSC CAPF AC 2025',
    categoryIds: ['upsc', 'defence'],
    vacancies: 506,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '10/07/2025', endDate: '31/07/2025' },
    paymentLastDate: '28/07/2025',
    examDate: '15/09/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.upsc.gov.in/notifications/capf-2025.pdf',
      applicationForm: 'https://www.upsc.gov.in/apply/capf-2025'
    }
  },

  // ── Defence ────────────────────────────────────────────────────────────────
  {
    id: 'afcat-2025',
    examName: 'AFCAT 2025',
    categoryIds: ['defence'],
    vacancies: 304,
    qualification: 'Any Graduate / B.Tech',
    applicationPeriod: { startDate: '01/06/2025', endDate: '30/06/2025' },
    paymentLastDate: '25/06/2025',
    examDate: '16/08/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://careerindianairforce.cdac.in/notifications/afcat-2025.pdf',
      applicationForm: 'https://careerindianairforce.cdac.in/apply/afcat-2025'
    }
  },
  {
    id: 'nda-2025',
    examName: 'NDA & NA Exam 2025',
    categoryIds: ['defence', 'upsc'],
    vacancies: 400,
    qualification: '12th Pass (PCM for Army/Navy/Air)',
    applicationPeriod: { startDate: '11/06/2025', endDate: '01/07/2025' },
    paymentLastDate: '28/06/2025',
    examDate: '14/09/2025',
    notificationStatus: 'new',
    applyStatus: 'new',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.upsc.gov.in/notifications/nda-2025.pdf',
      applicationForm: 'https://www.upsc.gov.in/apply/nda-2025'
    }
  },

  // ── State PSC ──────────────────────────────────────────────────────────────
  {
    id: 'tnpsc-group-2-2025',
    examName: 'TNPSC Group 2 2025',
    categoryIds: ['tamil-nadu-exams'],
    vacancies: 1145,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '01/07/2025', endDate: '01/08/2025' },
    paymentLastDate: '28/07/2025',
    examDate: '20/09/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.tnpsc.gov.in/notifications/group2-2025.pdf',
      applicationForm: 'https://www.tnpsc.gov.in/apply/group2-2025'
    }
  },
  {
    id: 'tnpsc-group-4-2025',
    examName: 'TNPSC Group 4 2025',
    categoryIds: ['tamil-nadu-exams'],
    vacancies: 6244,
    qualification: '12th Pass / Any Graduate',
    applicationPeriod: { startDate: '15/08/2025', endDate: '14/09/2025' },
    paymentLastDate: '10/09/2025',
    examDate: '23/11/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://www.tnpsc.gov.in/notifications/group4-2025.pdf',
      applicationForm: 'https://www.tnpsc.gov.in/apply/group4-2025'
    }
  },
  {
    id: 'mppsc-2025',
    examName: 'MPPSC State Service Exam 2025',
    categoryIds: ['civil-services'],
    vacancies: 220,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '20/06/2025', endDate: '20/07/2025' },
    paymentLastDate: '17/07/2025',
    examDate: '12/10/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://mppsc.mp.gov.in/notifications/sse-2025.pdf',
      applicationForm: 'https://mppsc.mp.gov.in/apply/sse-2025'
    }
  },
  {
    id: 'uppsc-2025',
    examName: 'UPPSC PCS 2025',
    categoryIds: ['civil-services'],
    vacancies: 350,
    qualification: 'Any Graduate',
    applicationPeriod: { startDate: '10/08/2025', endDate: '10/09/2025' },
    paymentLastDate: '07/09/2025',
    examDate: '15/12/2025',
    notificationStatus: 'normal',
    applyStatus: 'apply',
    resultStatus: 'pending',
    admitCardStatus: 'pending',
    isUpcoming: true,
    urls: {
      notificationPdf: 'https://uppsc.up.nic.in/notifications/pcs-2025.pdf',
      applicationForm: 'https://uppsc.up.nic.in/apply/pcs-2025'
    }
  },
];

export const getExamNotificationsByCategories = (categoryIds: string[]): ExamNotification[] => {
  if (categoryIds.length === 0) return examNotifications;
  return examNotifications.filter(exam =>
    exam.categoryIds.some(categoryId => categoryIds.includes(categoryId))
  );
};

export const getUpcomingExamNotifications = (categoryIds: string[] = []): ExamNotification[] => {
  const filteredExams = getExamNotificationsByCategories(categoryIds);
  return filteredExams.filter(exam => exam.isUpcoming);
};

export const getExamNotificationStats = (categoryIds: string[]) => {
  const exams = getExamNotificationsByCategories(categoryIds);
  return {
    total: exams.length,
    upcoming: exams.filter(e => e.isUpcoming).length,
    newNotifications: exams.filter(e => e.notificationStatus === 'new').length,
    applicationOpen: exams.filter(e => e.applyStatus === 'new' || e.applyStatus === 'apply').length
  };
};
