import { useState, useEffect, useCallback } from 'react';

export interface SuccessStory {
  id: string;
  name: string;
  air: number;
  year: string;
  avatar: string; // URL or data-URL
  score: number;
  maxScore: number;
  testimonial: string;
  tips: string[];
  isVisible: boolean;
  createdAt: string;
}

const STORE_KEY = 'prepsmart_success_stories_v1';

type StoriesMap = Record<string, SuccessStory[]>; // examId → stories[]

const load = (): StoriesMap => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as StoriesMap;
  } catch {}
  return {};
};

const save = (data: StoriesMap) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch {}
};

export const useSuccessStoriesStore = (examId?: string) => {
  const [allStories, setAllStories] = useState<StoriesMap>(() => load());

  // Cross-tab sync
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORE_KEY && e.newValue) {
        try { setAllStories(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const examStories: SuccessStory[] = examId
    ? (allStories[examId] ?? []).filter(s => s.isVisible !== false || true) // admin sees all
    : [];

  const getVisibleStories = useCallback((id: string): SuccessStory[] => {
    return (allStories[id] ?? []).filter(s => s.isVisible !== false);
  }, [allStories]);

  const addStory = useCallback((id: string, story: Omit<SuccessStory, 'id' | 'createdAt'>) => {
    const newStory: SuccessStory = {
      ...story,
      id: `story-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setAllStories(prev => {
      const updated = { ...prev, [id]: [newStory, ...(prev[id] ?? [])] };
      save(updated);
      window.dispatchEvent(new StorageEvent('storage', { key: STORE_KEY, newValue: JSON.stringify(updated) }));
      return updated;
    });
    return newStory.id;
  }, []);

  const updateStory = useCallback((id: string, storyId: string, changes: Partial<SuccessStory>) => {
    setAllStories(prev => {
      const updated = {
        ...prev,
        [id]: (prev[id] ?? []).map(s => s.id === storyId ? { ...s, ...changes } : s),
      };
      save(updated);
      window.dispatchEvent(new StorageEvent('storage', { key: STORE_KEY, newValue: JSON.stringify(updated) }));
      return updated;
    });
  }, []);

  const deleteStory = useCallback((id: string, storyId: string) => {
    setAllStories(prev => {
      const updated = { ...prev, [id]: (prev[id] ?? []).filter(s => s.id !== storyId) };
      save(updated);
      window.dispatchEvent(new StorageEvent('storage', { key: STORE_KEY, newValue: JSON.stringify(updated) }));
      return updated;
    });
  }, []);

  return {
    examStories,
    getVisibleStories,
    addStory,
    updateStory,
    deleteStory,
  };
};
