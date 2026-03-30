import { useState, useEffect, useCallback } from 'react';
import { ExtendedArticle, QuizItem } from '@/types/currentAffairs';
import { allArticles as seedArticles } from '@/components/current-affairs/articlesData';

const STORE_KEY = 'prepsmart_current_affairs_v1';

// Convert seed articles to ExtendedArticle format (all seeded as 'news')
const convertSeedArticles = (): ExtendedArticle[] => {
  return seedArticles.map(article => ({
    ...article,
    publishType: 'news' as const,
    publishedAt: article.date,
    isAdminCreated: false,
    quizItems: [],
  }));
};

const loadFromStorage = (): ExtendedArticle[] => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ExtendedArticle[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // First load: seed from static data
  const seed = convertSeedArticles();
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(seed));
  } catch {}
  return seed;
};

const saveToStorage = (articles: ExtendedArticle[]) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(articles));
  } catch (e) {
    console.warn('Could not save current affairs to localStorage', e);
  }
};

export const useCurrentAffairsStore = () => {
  const [articles, setArticles] = useState<ExtendedArticle[]>(() => loadFromStorage());

  // Sync across tabs (admin writes → student tab picks it up immediately)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue) as ExtendedArticle[];
          setArticles(updated);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addArticle = useCallback((article: Omit<ExtendedArticle, 'id'>) => {
    const id = `admin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newArticle: ExtendedArticle = { ...article, id };
    setArticles(prev => {
      const updated = [newArticle, ...prev];
      saveToStorage(updated);
      // Dispatch storage event so same-tab listeners also pick it up
      window.dispatchEvent(new StorageEvent('storage', { key: STORE_KEY, newValue: JSON.stringify(updated) }));
      return updated;
    });
    return id;
  }, []);

  const updateArticle = useCallback((id: string, updates: Partial<ExtendedArticle>) => {
    setArticles(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      saveToStorage(updated);
      window.dispatchEvent(new StorageEvent('storage', { key: STORE_KEY, newValue: JSON.stringify(updated) }));
      return updated;
    });
  }, []);

  const deleteArticle = useCallback((id: string) => {
    setArticles(prev => {
      const updated = prev.filter(a => a.id !== id);
      saveToStorage(updated);
      window.dispatchEvent(new StorageEvent('storage', { key: STORE_KEY, newValue: JSON.stringify(updated) }));
      return updated;
    });
  }, []);

  const duplicateArticle = useCallback((id: string) => {
    setArticles(prev => {
      const source = prev.find(a => a.id === id);
      if (!source) return prev;
      const newId = `admin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const copy: ExtendedArticle = {
        ...source,
        id: newId,
        title: `${source.title} (Copy)`,
        publishedAt: new Date().toISOString().split('T')[0],
        isAdminCreated: true,
      };
      const updated = [copy, ...prev];
      saveToStorage(updated);
      window.dispatchEvent(new StorageEvent('storage', { key: STORE_KEY, newValue: JSON.stringify(updated) }));
      return updated;
    });
  }, []);

  // ─── Section Getters ──────────────────────────────────────────────────────────
  //
  // NEWS tab = ALL articles (includes everything — news + daily-news)
  // DAILY NEWS tab = only articles marked publishType === 'daily-news'
  // ALL IN ONE = all articles auto-grouped by CATEGORY (not a separate publishType)
  //

  /** All articles sorted newest-first — shown in the "News" tab */
  const getNewsArticles = useCallback(() =>
    [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [articles]
  );

  /** Only daily-news articles sorted newest-first — shown in "Daily News" tab */
  const getDailyNewsArticles = useCallback(() =>
    articles
      .filter(a => a.publishType === 'daily-news')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [articles]
  );

  /**
   * All in One — returns ALL articles grouped by category.
   * Record<category, articles[]> sorted by article date.
   */
  const getAllInOneByCategory = useCallback((): Record<string, ExtendedArticle[]> => {
    const grouped: Record<string, ExtendedArticle[]> = {};
    const sorted = [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const article of sorted) {
      const cat = article.category || 'General';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(article);
    }
    return grouped;
  }, [articles]);

  /** Flat list getter for backward compat — still sorted newest-first */
  const getAllInOneArticles = useCallback(() =>
    [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [articles]
  );

  /** Find any article by id (works for admin-created + seeded) */
  const getArticleFromStore = useCallback((id: string) =>
    articles.find(a => a.id === id),
    [articles]
  );

  return {
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    duplicateArticle,
    getNewsArticles,
    getDailyNewsArticles,
    getAllInOneArticles,
    getAllInOneByCategory,
    getArticleFromStore,
  };
};

export type { ExtendedArticle, QuizItem };
