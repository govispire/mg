
export interface PDFItem {
  id: number;
  title: string;
  size: string;
  date: string;
  downloads: number;
  image: string;
  color: string;
  categories: string[];
  examType?: string;
}

export const pdfCategories = [
  { id: 'english', name: 'English Language', categories: ['banking', 'ssc', 'railways-rrb', 'civil-services'] },
  { id: 'reasoning', name: 'Reasoning Ability', categories: ['banking', 'ssc', 'railways-rrb'] },
  { id: 'quant', name: 'Quantitative Aptitude', categories: ['banking', 'ssc', 'railways-rrb'] },
  { id: 'gk', name: 'General Knowledge', categories: ['banking', 'ssc', 'railways-rrb', 'civil-services'] },
  { id: 'computer', name: 'Computer Awareness', categories: ['banking', 'ssc'] },
  { id: 'current', name: 'Current Affairs', categories: ['banking', 'ssc', 'railways-rrb', 'civil-services'] },
];

export const pdfData = {
  english: [
    { 
      id: 1, 
      title: 'English Grammar Basics', 
      size: '2.5 MB', 
      date: 'Apr 15, 2025', 
      downloads: 1250,
      image: '/placeholder.svg',
      color: 'bg-blue-50',
      categories: ['banking', 'ssc'],
      examType: 'General'
    },
    { 
      id: 2, 
      title: 'Reading Comprehension Guide', 
      size: '3.2 MB', 
      date: 'Apr 10, 2025', 
      downloads: 980,
      image: '/placeholder.svg',
      color: 'bg-green-50',
      categories: ['banking', 'civil-services'],
      examType: 'Advanced'
    },
    { 
      id: 3, 
      title: 'Vocabulary Builder', 
      size: '1.8 MB', 
      date: 'Mar 25, 2025', 
      downloads: 1540,
      image: '/placeholder.svg',
      color: 'bg-purple-50',
      categories: ['ssc', 'railways-rrb'],
      examType: 'General'
    },
    { 
      id: 4, 
      title: 'Sentence Correction Tips', 
      size: '1.2 MB', 
      date: 'Mar 20, 2025', 
      downloads: 720,
      image: '/placeholder.svg',
      color: 'bg-orange-50',
      categories: ['banking'],
      examType: 'Banking Specific'
    },
  ],
  reasoning: [
    { 
      id: 5, 
      title: 'Logical Reasoning Handbook', 
      size: '4.1 MB', 
      date: 'Apr 12, 2025', 
      downloads: 1650,
      image: '/placeholder.svg', 
      color: 'bg-indigo-50',
      categories: ['banking', 'ssc', 'railways-rrb'],
      examType: 'General'
    },
    { 
      id: 6, 
      title: 'Puzzles & Seating Arrangement', 
      size: '2.9 MB', 
      date: 'Apr 05, 2025', 
      downloads: 2150,
      image: '/placeholder.svg', 
      color: 'bg-pink-50',
      categories: ['banking'],
      examType: 'Banking Specific'
    },
    { 
      id: 7, 
      title: 'Syllogism Solving Techniques', 
      size: '1.5 MB', 
      date: 'Mar 28, 2025', 
      downloads: 890,
      image: '/placeholder.svg', 
      color: 'bg-yellow-50',
      categories: ['ssc', 'railways-rrb'],
      examType: 'General'
    },
  ],
  quant: [
    { 
      id: 8, 
      title: 'Quantitative Aptitude Formulas', 
      size: '3.7 MB', 
      date: 'Apr 18, 2025', 
      downloads: 3210,
      image: '/placeholder.svg', 
      color: 'bg-blue-50',
      categories: ['banking', 'ssc', 'railways-rrb'],
      examType: 'General'
    },
    { 
      id: 9, 
      title: 'Data Interpretation Strategies', 
      size: '2.8 MB', 
      date: 'Apr 08, 2025', 
      downloads: 1450,
      image: '/placeholder.svg', 
      color: 'bg-green-50',
      categories: ['banking', 'ssc'],
      examType: 'Advanced'
    },
    { 
      id: 10, 
      title: 'Number Series Shortcuts', 
      size: '2.1 MB', 
      date: 'Mar 15, 2025', 
      downloads: 1820,
      image: '/placeholder.svg', 
      color: 'bg-red-50',
      categories: ['railways-rrb'],
      examType: 'Railway Specific'
    },
  ],
  gk: [
    { 
      id: 11, 
      title: 'Banking & Financial Awareness', 
      size: '3.9 MB', 
      date: 'Apr 20, 2025', 
      downloads: 2750,
      image: '/placeholder.svg', 
      color: 'bg-teal-50',
      categories: ['banking'],
      examType: 'Banking Specific'
    },
    { 
      id: 12, 
      title: 'Indian Economy Digest', 
      size: '2.4 MB', 
      date: 'Apr 02, 2025', 
      downloads: 1920,
      image: '/placeholder.svg', 
      color: 'bg-cyan-50',
      categories: ['civil-services', 'banking'],
      examType: 'General'
    },
  ],
  computer: [
    { 
      id: 13, 
      title: 'Basic Computer Knowledge', 
      size: '3.3 MB', 
      date: 'Apr 16, 2025', 
      downloads: 1150,
      image: '/placeholder.svg', 
      color: 'bg-violet-50',
      categories: ['banking', 'ssc'],
      examType: 'General'
    },
    { 
      id: 14, 
      title: 'MS Office & Internet', 
      size: '2.7 MB', 
      date: 'Mar 30, 2025', 
      downloads: 980,
      image: '/placeholder.svg', 
      color: 'bg-sky-50',
      categories: ['ssc'],
      examType: 'SSC Specific'
    },
  ],
  current: [
    { 
      id: 15, 
      title: 'April 2025 Current Affairs', 
      size: '4.5 MB', 
      date: 'Apr 25, 2025', 
      downloads: 2340,
      image: '/placeholder.svg', 
      color: 'bg-blue-50',
      categories: ['banking', 'ssc', 'railways-rrb', 'civil-services'],
      examType: 'General'
    },
    { 
      id: 16, 
      title: 'March 2025 Current Affairs', 
      size: '4.2 MB', 
      date: 'Mar 31, 2025', 
      downloads: 3150,
      image: '/placeholder.svg', 
      color: 'bg-green-50',
      categories: ['banking', 'ssc', 'railways-rrb', 'civil-services'],
      examType: 'General'
    },
    { 
      id: 17, 
      title: 'February 2025 Current Affairs', 
      size: '3.9 MB', 
      date: 'Feb 28, 2025', 
      downloads: 2870,
      image: '/placeholder.svg', 
      color: 'bg-amber-50',
      categories: ['banking', 'ssc', 'railways-rrb', 'civil-services'],
      examType: 'General'
    },
  ],
};
