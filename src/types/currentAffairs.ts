import { Article } from '@/components/current-affairs/types';

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ExtendedArticle extends Article {
  /** Which tab the article appears in on the student page */
  publishType: 'news' | 'daily-news' | 'all-in-one';
  /** ISO date string for the actual publish time */
  publishedAt: string;
  /** Whether this article was created via admin panel */
  isAdminCreated?: boolean;
  /** Inline quiz questions */
  quizItems?: QuizItem[];
}
