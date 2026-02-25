// Local storage utilities for syllabus progress tracking

const STORAGE_KEYS = {
    TOPIC_PROGRESS: 'syllabus_topic_progress',
    VIDEO_PROGRESS: 'syllabus_video_progress',
    BOOKMARKS: 'syllabus_bookmarks',
    RECENTLY_VIEWED: 'syllabus_recently_viewed',
    COMPLETED_TOPICS: 'syllabus_completed_topics',
} as const;

// Topic Progress Types
export interface TopicProgress {
    topicId: string;
    progress: number;
    lastAccessed: string;
    completed: boolean;
}

export interface VideoProgress {
    videoId: string;
    timestamp: number;
    duration: number;
    completed: boolean;
}

export interface Bookmark {
    id: string;
    examId: string;
    topicId: string;
    topicName: string;
    subjectName: string;
    resourceId: string;
    resourceType: 'video' | 'pdf' | 'test';
    resourceTitle: string;
    createdAt: string;
}

export interface RecentlyViewed {
    topicId: string;
    topicName: string;
    subjectName: string;
    examId: string;
    viewedAt: string;
}

// Helper to safely get from localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage (${key}):`, error);
        return defaultValue;
    }
};

// Helper to safely set to localStorage
const setToStorage = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage (${key}):`, error);
    }
};

// Topic Progress Functions
export const saveTopicProgress = (
    examId: string,
    topicId: string,
    progress: number,
    completed: boolean = false
): void => {
    const allProgress = getFromStorage<Record<string, Record<string, TopicProgress>>>(
        STORAGE_KEYS.TOPIC_PROGRESS,
        {}
    );

    if (!allProgress[examId]) {
        allProgress[examId] = {};
    }

    allProgress[examId][topicId] = {
        topicId,
        progress,
        lastAccessed: new Date().toISOString(),
        completed,
    };

    setToStorage(STORAGE_KEYS.TOPIC_PROGRESS, allProgress);
};

export const loadTopicProgress = (examId: string): Record<string, TopicProgress> => {
    const allProgress = getFromStorage<Record<string, Record<string, TopicProgress>>>(
        STORAGE_KEYS.TOPIC_PROGRESS,
        {}
    );
    return allProgress[examId] || {};
};

export const getTopicProgress = (examId: string, topicId: string): TopicProgress | null => {
    const examProgress = loadTopicProgress(examId);
    return examProgress[topicId] || null;
};

// Video Progress Functions
export const saveVideoProgress = (
    examId: string,
    videoId: string,
    timestamp: number,
    duration: number,
    completed: boolean = false
): void => {
    const allProgress = getFromStorage<Record<string, Record<string, VideoProgress>>>(
        STORAGE_KEYS.VIDEO_PROGRESS,
        {}
    );

    if (!allProgress[examId]) {
        allProgress[examId] = {};
    }

    allProgress[examId][videoId] = {
        videoId,
        timestamp,
        duration,
        completed,
    };

    setToStorage(STORAGE_KEYS.VIDEO_PROGRESS, allProgress);
};

export const loadVideoProgress = (examId: string, videoId: string): VideoProgress | null => {
    const allProgress = getFromStorage<Record<string, Record<string, VideoProgress>>>(
        STORAGE_KEYS.VIDEO_PROGRESS,
        {}
    );
    return allProgress[examId]?.[videoId] || null;
};

// Completed Topics Functions
export const toggleTopicCompletion = (
    examId: string,
    topicId: string,
    completed: boolean
): void => {
    const allCompleted = getFromStorage<Record<string, Set<string>>>(
        STORAGE_KEYS.COMPLETED_TOPICS,
        {}
    );

    if (!allCompleted[examId]) {
        allCompleted[examId] = new Set();
    } else {
        // Convert array back to Set (since JSON doesn't preserve Sets)
        allCompleted[examId] = new Set(allCompleted[examId] as unknown as string[]);
    }

    if (completed) {
        allCompleted[examId].add(topicId);
    } else {
        allCompleted[examId].delete(topicId);
    }

    // Convert Set to array for JSON serialization
    const serializable = Object.fromEntries(
        Object.entries(allCompleted).map(([key, value]) => [key, Array.from(value)])
    );

    setToStorage(STORAGE_KEYS.COMPLETED_TOPICS, serializable);

    // Also update topic progress
    saveTopicProgress(examId, topicId, completed ? 100 : 0, completed);
};

export const isTopicCompleted = (examId: string, topicId: string): boolean => {
    const allCompleted = getFromStorage<Record<string, string[]>>(
        STORAGE_KEYS.COMPLETED_TOPICS,
        {}
    );
    const examCompleted = allCompleted[examId] || [];
    return examCompleted.includes(topicId);
};

export const getCompletedTopicsCount = (examId: string): number => {
    const allCompleted = getFromStorage<Record<string, string[]>>(
        STORAGE_KEYS.COMPLETED_TOPICS,
        {}
    );
    return (allCompleted[examId] || []).length;
};

// Bookmark Functions
export const saveBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt'>): void => {
    const bookmarks = getFromStorage<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);

    const newBookmark: Bookmark = {
        ...bookmark,
        id: `${bookmark.examId}-${bookmark.topicId}-${bookmark.resourceId}-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };

    bookmarks.push(newBookmark);
    setToStorage(STORAGE_KEYS.BOOKMARKS, bookmarks);
};

export const removeBookmark = (bookmarkId: string): void => {
    const bookmarks = getFromStorage<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
    const filtered = bookmarks.filter(b => b.id !== bookmarkId);
    setToStorage(STORAGE_KEYS.BOOKMARKS, filtered);
};

export const loadBookmarks = (examId?: string): Bookmark[] => {
    const bookmarks = getFromStorage<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
    return examId ? bookmarks.filter(b => b.examId === examId) : bookmarks;
};

export const isBookmarked = (examId: string, resourceId: string): boolean => {
    const bookmarks = loadBookmarks(examId);
    return bookmarks.some(b => b.resourceId === resourceId);
};

// Recently Viewed Functions
export const saveRecentlyViewed = (item: Omit<RecentlyViewed, 'viewedAt'>): void => {
    const recentlyViewed = getFromStorage<RecentlyViewed[]>(STORAGE_KEYS.RECENTLY_VIEWED, []);

    // Remove if already exists
    const filtered = recentlyViewed.filter(
        r => !(r.examId === item.examId && r.topicId === item.topicId)
    );

    // Add to front
    const newItem: RecentlyViewed = {
        ...item,
        viewedAt: new Date().toISOString(),
    };

    filtered.unshift(newItem);

    // Keep only last 10 items
    const limited = filtered.slice(0, 10);

    setToStorage(STORAGE_KEYS.RECENTLY_VIEWED, limited);
};

export const loadRecentlyViewed = (examId?: string, limit: number = 5): RecentlyViewed[] => {
    const recentlyViewed = getFromStorage<RecentlyViewed[]>(STORAGE_KEYS.RECENTLY_VIEWED, []);
    const filtered = examId ? recentlyViewed.filter(r => r.examId === examId) : recentlyViewed;
    return filtered.slice(0, limit);
};

// Clear all data for an exam
export const clearExamData = (examId: string): void => {
    // Clear topic progress
    const topicProgress = getFromStorage<Record<string, Record<string, TopicProgress>>>(
        STORAGE_KEYS.TOPIC_PROGRESS,
        {}
    );
    delete topicProgress[examId];
    setToStorage(STORAGE_KEYS.TOPIC_PROGRESS, topicProgress);

    // Clear video progress
    const videoProgress = getFromStorage<Record<string, Record<string, VideoProgress>>>(
        STORAGE_KEYS.VIDEO_PROGRESS,
        {}
    );
    delete videoProgress[examId];
    setToStorage(STORAGE_KEYS.VIDEO_PROGRESS, videoProgress);

    // Clear completed topics
    const completedTopics = getFromStorage<Record<string, string[]>>(
        STORAGE_KEYS.COMPLETED_TOPICS,
        {}
    );
    delete completedTopics[examId];
    setToStorage(STORAGE_KEYS.COMPLETED_TOPICS, completedTopics);

    // Clear bookmarks
    const bookmarks = getFromStorage<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
    const filtered = bookmarks.filter(b => b.examId !== examId);
    setToStorage(STORAGE_KEYS.BOOKMARKS, filtered);

    // Clear recently viewed
    const recentlyViewed = getFromStorage<RecentlyViewed[]>(STORAGE_KEYS.RECENTLY_VIEWED, []);
    const filteredRecent = recentlyViewed.filter(r => r.examId !== examId);
    setToStorage(STORAGE_KEYS.RECENTLY_VIEWED, filteredRecent);
};

// Clear all syllabus data
export const clearAllSyllabusData = (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
};
