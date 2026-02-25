
export interface ExamNotification {
  id: string;
  examName: string;
  categoryIds: string[];
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
  // Banking Exams
  {
    id: 'ibps-po-2025',
    examName: 'IBPS PO 2025',
    categoryIds: ['banking-insurance', 'banking'],
    applicationPeriod: {
      startDate: '01/06/2025',
      endDate: '30/06/2025'
    },
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
    id: 'sbi-clerk-2025',
    examName: 'SBI Clerk 2025',
    categoryIds: ['banking-insurance', 'banking'],
    applicationPeriod: {
      startDate: '20/05/2025',
      endDate: '10/06/2025'
    },
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
    categoryIds: ['banking-insurance', 'railways-rrb'],
    applicationPeriod: {
      startDate: '01/07/2025',
      endDate: '31/07/2025'
    },
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
    categoryIds: ['banking-insurance', 'railways-rrb'],
    applicationPeriod: {
      startDate: '05/08/2025',
      endDate: '01/09/2025'
    },
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
    applicationPeriod: {
      startDate: '10/06/2025',
      endDate: '05/07/2025'
    },
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
    applicationPeriod: {
      startDate: '15/05/2025',
      endDate: '10/06/2025'
    },
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

  // SSC Exams
  {
    id: 'ssc-cgl-2025',
    examName: 'SSC CGL 2025',
    categoryIds: ['ssc'],
    applicationPeriod: {
      startDate: '15/06/2025',
      endDate: '15/07/2025'
    },
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
    applicationPeriod: {
      startDate: '10/07/2025',
      endDate: '10/08/2025'
    },
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

  // Railway Exams
  {
    id: 'rrb-ntpc-2025',
    examName: 'RRB NTPC 2025',
    categoryIds: ['railways-rrb', 'railway'],
    applicationPeriod: {
      startDate: '01/08/2025',
      endDate: '30/08/2025'
    },
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
    applicationPeriod: {
      startDate: '15/08/2025',
      endDate: '15/09/2025'
    },
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

  // UPSC Exams
  {
    id: 'upsc-cse-2025',
    examName: 'UPSC Civil Services 2025',
    categoryIds: ['upsc', 'civil-services'],
    applicationPeriod: {
      startDate: '15/05/2025',
      endDate: '15/06/2025'
    },
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
    applicationPeriod: {
      startDate: '20/06/2025',
      endDate: '20/07/2025'
    },
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
  }
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
