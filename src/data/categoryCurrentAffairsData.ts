
export interface CategoryCurrentAffair {
  id: string;
  title: string;
  date: string;
  categoryIds: string[];
  type: 'daily' | 'weekly' | 'monthly';
  questions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  isAttempted: boolean;
  description: string;
}

export const categoryCurrentAffairs: CategoryCurrentAffair[] = [
  // UPSC Current Affairs
  {
    id: 'upsc-ca-1',
    title: 'Union Budget 2024-25 Analysis',
    date: '2024-02-01',
    categoryIds: ['upsc', 'civil-services'],
    type: 'monthly',
    questions: 25,
    difficulty: 'Medium',
    topics: ['Economics', 'Budget', 'Fiscal Policy'],
    isAttempted: false,
    description: 'Comprehensive analysis of Union Budget 2024-25 with focus on economic reforms'
  },
  {
    id: 'upsc-ca-2',
    title: 'International Relations Weekly Update',
    date: '2024-01-29',
    categoryIds: ['upsc', 'civil-services'],
    type: 'weekly',
    questions: 15,
    difficulty: 'Hard',
    topics: ['International Relations', 'Diplomacy', 'Foreign Policy'],
    isAttempted: true,
    description: 'Latest developments in India\'s foreign policy and international agreements'
  },
  {
    id: 'upsc-ca-3',
    title: 'Supreme Court Landmark Judgments',
    date: '2024-01-28',
    categoryIds: ['upsc', 'civil-services'],
    type: 'daily',
    questions: 10,
    difficulty: 'Medium',
    topics: ['Polity', 'Constitutional Law', 'Judiciary'],
    isAttempted: false,
    description: 'Recent Supreme Court judgments and their constitutional significance'
  },

  // Banking Current Affairs
  {
    id: 'banking-ca-1',
    title: 'RBI Monetary Policy Review',
    date: '2024-02-01',
    categoryIds: ['banking-insurance', 'banking'],
    type: 'monthly',
    questions: 20,
    difficulty: 'Medium',
    topics: ['Monetary Policy', 'Interest Rates', 'Banking Regulations'],
    isAttempted: false,
    description: 'Analysis of latest RBI monetary policy decisions and their impact'
  },
  {
    id: 'banking-ca-2',
    title: 'Digital Banking Initiatives',
    date: '2024-01-30',
    categoryIds: ['banking-insurance', 'banking'],
    type: 'weekly',
    questions: 12,
    difficulty: 'Easy',
    topics: ['Digital Banking', 'Fintech', 'UPI'],
    isAttempted: true,
    description: 'Latest updates on digital banking services and fintech partnerships'
  },
  {
    id: 'banking-ca-3',
    title: 'Banking Sector Performance Q3 FY24',
    date: '2024-01-25',
    categoryIds: ['banking-insurance', 'banking'],
    type: 'monthly',
    questions: 18,
    difficulty: 'Hard',
    topics: ['Banking Performance', 'NPAs', 'Credit Growth'],
    isAttempted: false,
    description: 'Quarterly performance analysis of major banks in India'
  },

  // SSC Current Affairs
  {
    id: 'ssc-ca-1',
    title: 'Government Schemes Update',
    date: '2024-01-31',
    categoryIds: ['ssc'],
    type: 'weekly',
    questions: 15,
    difficulty: 'Easy',
    topics: ['Government Schemes', 'Social Welfare', 'Public Policy'],
    isAttempted: false,
    description: 'Latest government schemes and their implementation status'
  },
  {
    id: 'ssc-ca-2',
    title: 'National Awards and Honors',
    date: '2024-01-26',
    categoryIds: ['ssc'],
    type: 'daily',
    questions: 8,
    difficulty: 'Easy',
    topics: ['Awards', 'Honors', 'Personalities'],
    isAttempted: true,
    description: 'Republic Day awards and other national honors announced'
  },
  {
    id: 'ssc-ca-3',
    title: 'Science and Technology Updates',
    date: '2024-01-29',
    categoryIds: ['ssc'],
    type: 'weekly',
    questions: 12,
    difficulty: 'Medium',
    topics: ['Science', 'Technology', 'Innovation'],
    isAttempted: false,
    description: 'Recent developments in science and technology sector'
  },

  // Railway Current Affairs
  {
    id: 'railway-ca-1',
    title: 'Railway Infrastructure Projects',
    date: '2024-02-01',
    categoryIds: ['railways-rrb', 'railway'],
    type: 'monthly',
    questions: 20,
    difficulty: 'Medium',
    topics: ['Railway Infrastructure', 'Transportation', 'Development'],
    isAttempted: false,
    description: 'Major railway infrastructure projects and modernization initiatives'
  },
  {
    id: 'railway-ca-2',
    title: 'Railway Safety Measures',
    date: '2024-01-28',
    categoryIds: ['railways-rrb', 'railway'],
    type: 'weekly',
    questions: 10,
    difficulty: 'Easy',
    topics: ['Safety', 'Technology', 'Operations'],
    isAttempted: true,
    description: 'New safety technologies and protocols implemented by Indian Railways'
  },

  // CAT/MBA Current Affairs
  {
    id: 'cat-ca-1',
    title: 'Business and Economy Weekly',
    date: '2024-01-30',
    categoryIds: ['cat', 'management-entrance'],
    type: 'weekly',
    questions: 15,
    difficulty: 'Hard',
    topics: ['Business', 'Economy', 'Corporate News'],
    isAttempted: false,
    description: 'Important business developments and corporate announcements'
  },
  {
    id: 'cat-ca-2',
    title: 'Market Analysis and Trends',
    date: '2024-01-29',
    categoryIds: ['cat', 'management-entrance'],
    type: 'daily',
    questions: 10,
    difficulty: 'Medium',
    topics: ['Stock Market', 'Economic Indicators', 'Financial Markets'],
    isAttempted: false,
    description: 'Stock market trends and economic indicators analysis'
  }
];

export const getCurrentAffairsByCategories = (categoryIds: string[]): CategoryCurrentAffair[] => {
  if (categoryIds.length === 0) return categoryCurrentAffairs;
  
  return categoryCurrentAffairs.filter(affair => 
    affair.categoryIds.some(categoryId => categoryIds.includes(categoryId))
  );
};

export const getCurrentAffairsByType = (type: 'daily' | 'weekly' | 'monthly', categoryIds: string[] = []): CategoryCurrentAffair[] => {
  const filteredByCategory = getCurrentAffairsByCategories(categoryIds);
  return filteredByCategory.filter(affair => affair.type === type);
};

export const getCurrentAffairsStats = (categoryIds: string[]) => {
  const affairs = getCurrentAffairsByCategories(categoryIds);
  return {
    total: affairs.length,
    attempted: affairs.filter(a => a.isAttempted).length,
    daily: affairs.filter(a => a.type === 'daily').length,
    weekly: affairs.filter(a => a.type === 'weekly').length,
    monthly: affairs.filter(a => a.type === 'monthly').length
  };
};
