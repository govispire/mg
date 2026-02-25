import { useState, useEffect } from 'react';
import { ReadingProgress } from '@/components/current-affairs/types';

export const useReadingProgress = () => {
  const [readingProgressMap, setReadingProgressMap] = useState<Record<string, ReadingProgress>>(() => {
    const saved = localStorage.getItem('readingProgressMap');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('readingProgressMap', JSON.stringify(readingProgressMap));
  }, [readingProgressMap]);

  const getReadingProgress = (articleId: string): number => {
    return readingProgressMap[articleId]?.progress || 0;
  };

  const updateReadingProgress = (articleId: string, progress: number, scrollPosition: number) => {
    setReadingProgressMap(prev => ({
      ...prev,
      [articleId]: {
        articleId,
        progress: Math.min(100, Math.max(0, progress)),
        scrollPosition,
        lastRead: new Date().toISOString()
      }
    }));
  };

  const getResumePosition = (articleId: string): number => {
    return readingProgressMap[articleId]?.scrollPosition || 0;
  };

  const markAsRead = (articleId: string) => {
    setReadingProgressMap(prev => ({
      ...prev,
      [articleId]: {
        articleId,
        progress: 100,
        scrollPosition: 0,
        lastRead: new Date().toISOString()
      }
    }));
  };

  const getContinueReadingArticles = (limit: number = 5): ReadingProgress[] => {
    return Object.values(readingProgressMap)
      .filter(p => p.progress > 0 && p.progress < 100)
      .sort((a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime())
      .slice(0, limit);
  };

  const getRecentlyReadArticles = (limit: number = 5): ReadingProgress[] => {
    return Object.values(readingProgressMap)
      .sort((a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime())
      .slice(0, limit);
  };

  return {
    readingProgressMap,
    getReadingProgress,
    updateReadingProgress,
    getResumePosition,
    markAsRead,
    getContinueReadingArticles,
    getRecentlyReadArticles
  };
};
