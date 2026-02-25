import { useLocalStorage } from '@/hooks/useLocalStorage';

export function useSavedArticles() {
    const [savedArticleIds, setSavedArticleIds] = useLocalStorage<string[]>('savedArticles', []);

    const isSaved = (articleId: string) => {
        return savedArticleIds.includes(articleId);
    };

    const toggleSave = (articleId: string) => {
        if (isSaved(articleId)) {
            setSavedArticleIds(savedArticleIds.filter(id => id !== articleId));
        } else {
            setSavedArticleIds([...savedArticleIds, articleId]);
        }
    };

    return {
        savedArticleIds,
        isSaved,
        toggleSave
    };
}
