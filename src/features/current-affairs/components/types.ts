export interface Article {
  id: string;
  title: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  excerpt: string;
  content?: string;
  readTime: string;
  date: string;
  image?: string;
  tags: string[];
  topic: string;
  relatedIds: string[];
  hasQuiz: boolean;
  quizQuestions?: number;
}

export interface ReadingSettings {
  isDarkMode: boolean;
  fontSize: number;
  lineHeight: number;
  fontFamily: 'sans' | 'serif' | 'mono';
}

export interface DigestPreferences {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  categories: string[];
  email: string;
}

export interface ReadingProgress {
  articleId: string;
  progress: number;
  scrollPosition: number;
  lastRead: string;
}
