import { useState, useEffect, useCallback, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type SituationCategory = 'interview' | 'essay' | 'business' | 'daily' | 'exam';
export type ExamCategory = 'banking' | 'ssc' | 'railway' | 'upsc' | 'state-psc' | 'defence' | 'general';
export type VocabStatus = 'new' | 'pending' | 'learned';
export type ContentStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

export interface VocabWord {
    id: string;
    word: string;
    meaning: string;
    example: string;
    difficulty: DifficultyLevel;
    situation: SituationCategory;
    examCategory: ExamCategory;
    synonyms?: string[];
    antonyms?: string[];
    pronunciation?: string;
    isActive: boolean;
    uploadedBy: string; // userId
    uploadedByRole: 'super-admin' | 'employee';
    contentStatus: ContentStatus;
    rejectionReason?: string;
    createdAt: string;
}

export interface VocabProgress {
    id: string;
    userId: string;
    wordId: string;
    status: VocabStatus;
    assignedDate: string;
    timesShown: number;
    quizAttempts: number;
    quizAccuracy: number;
    learnedDate?: string;
    nextRevisionDate?: string;
}

export interface QuizAttempt {
    id: string;
    userId: string;
    wordId: string;
    selectedOption: string;
    correctOption: string;
    isCorrect: boolean;
    attemptDate: string;
}

// ─── Mock Seed Data ───────────────────────────────────────────────────────────
const SEED_WORDS: VocabWord[] = [
    { id: 'w1', word: 'Acumen', meaning: 'The ability to make good judgments and quick decisions', example: 'Her business acumen helped the company grow rapidly.', difficulty: 'medium', situation: 'business', examCategory: 'banking', synonyms: ['shrewdness', 'insight'], antonyms: ['stupidity'], isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin', contentStatus: 'approved', createdAt: '2025-02-01T00:00:00Z' },
    { id: 'w2', word: 'Cogent', meaning: 'Clear, logical, and convincing', example: 'The lawyer presented a cogent argument in court.', difficulty: 'hard', situation: 'essay', examCategory: 'upsc', synonyms: ['compelling', 'persuasive'], antonyms: ['weak', 'vague'], isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin', contentStatus: 'approved', createdAt: '2025-02-01T00:00:00Z' },
    { id: 'w3', word: 'Prudent', meaning: 'Acting with care and thought for the future', example: 'It is prudent to save money for emergencies.', difficulty: 'medium', situation: 'daily', examCategory: 'ssc', synonyms: ['wise', 'cautious'], antonyms: ['reckless', 'imprudent'], isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin', contentStatus: 'approved', createdAt: '2025-02-01T00:00:00Z' },
    { id: 'w4', word: 'Arduous', meaning: 'Involving or requiring strenuous effort; difficult', example: 'Climbing Mount Everest is an arduous task.', difficulty: 'medium', situation: 'exam', examCategory: 'banking', synonyms: ['difficult', 'laborious'], antonyms: ['easy', 'effortless'], isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin', contentStatus: 'approved', createdAt: '2025-02-02T00:00:00Z' },
    { id: 'w5', word: 'Tenacious', meaning: 'Not readily relinquishing a position, holding firmly', example: 'The tenacious athlete never gave up despite losing.', difficulty: 'easy', situation: 'interview', examCategory: 'ssc', synonyms: ['persistent', 'determined'], antonyms: ['weak', 'irresolute'], isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin', contentStatus: 'approved', createdAt: '2025-02-02T00:00:00Z' },
    { id: 'w6', word: 'Salient', meaning: 'Most noticeable or important', example: 'The report highlighted the salient points of the investigation.', difficulty: 'medium', situation: 'essay', examCategory: 'upsc', synonyms: ['prominent', 'notable'], antonyms: ['minor', 'trivial'], isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin', contentStatus: 'approved', createdAt: '2025-02-03T00:00:00Z' },
    { id: 'w7', word: 'Verbose', meaning: 'Using more words than needed; wordy', example: 'His verbose speech bored the audience.', difficulty: 'easy', situation: 'exam', examCategory: 'ssc', synonyms: ['wordy', 'long-winded'], antonyms: ['concise', 'brief'], isActive: true, uploadedBy: 'e1', uploadedByRole: 'employee', contentStatus: 'approved', createdAt: '2025-02-03T00:00:00Z' },
    { id: 'w8', word: 'Magnanimous', meaning: 'Very generous or forgiving, especially towards a rival', example: 'The magnanimous winner congratulated the loser graciously.', difficulty: 'hard', situation: 'interview', examCategory: 'banking', synonyms: ['generous', 'noble'], antonyms: ['selfish', 'mean'], isActive: true, uploadedBy: 'e1', uploadedByRole: 'employee', contentStatus: 'approved', createdAt: '2025-02-04T00:00:00Z' },
    { id: 'w9', word: 'Pragmatic', meaning: 'Dealing with things sensibly and realistically', example: 'A pragmatic approach to solving the problem was adopted.', difficulty: 'medium', situation: 'business', examCategory: 'upsc', synonyms: ['practical', 'realistic'], antonyms: ['idealistic', 'impractical'], isActive: true, uploadedBy: 'e1', uploadedByRole: 'employee', contentStatus: 'approved', createdAt: '2025-02-04T00:00:00Z' },
    { id: 'w10', word: 'Ephemeral', meaning: 'Lasting for a very short time', example: 'Fame is often ephemeral.', difficulty: 'hard', situation: 'essay', examCategory: 'upsc', synonyms: ['fleeting', 'transient'], antonyms: ['permanent', 'eternal'], isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin', contentStatus: 'approved', createdAt: '2025-02-05T00:00:00Z' },
    { id: 'w11', word: 'Loquacious', meaning: 'Tending to talk a great deal; talkative', example: 'The loquacious student always dominated discussions.', difficulty: 'hard', situation: 'daily', examCategory: 'ssc', synonyms: ['talkative', 'garrulous'], antonyms: ['taciturn', 'reserved'], isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin', contentStatus: 'approved', createdAt: '2025-02-05T00:00:00Z' },
    { id: 'w12', word: 'Intrepid', meaning: 'Fearless; adventurous', example: 'The intrepid explorer ventured into the unknown jungle.', difficulty: 'medium', situation: 'interview', examCategory: 'defence', synonyms: ['brave', 'fearless'], antonyms: ['cowardly', 'timid'], isActive: true, uploadedBy: 'e1', uploadedByRole: 'employee', contentStatus: 'approved', createdAt: '2025-02-06T00:00:00Z' },
    { id: 'w13', word: 'Lucid', meaning: 'Expressed clearly; easy to understand', example: 'The professor gave a lucid explanation of the topic.', difficulty: 'easy', situation: 'exam', examCategory: 'banking', synonyms: ['clear', 'intelligible'], antonyms: ['vague', 'unclear'], isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin', contentStatus: 'approved', createdAt: '2025-02-06T00:00:00Z' },
    { id: 'w14', word: 'Zeal', meaning: 'Great energy or enthusiasm in pursuit of a cause', example: 'She pursued her studies with great zeal.', difficulty: 'easy', situation: 'daily', examCategory: 'general', synonyms: ['enthusiasm', 'passion'], antonyms: ['apathy', 'indifference'], isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin', contentStatus: 'approved', createdAt: '2025-02-07T00:00:00Z' },
    { id: 'w15', word: 'Meticulous', meaning: 'Showing great attention to detail or being very careful', example: 'The meticulous accountant checked every figure twice.', difficulty: 'medium', situation: 'business', examCategory: 'banking', synonyms: ['careful', 'thorough'], antonyms: ['careless', 'sloppy'], isActive: true, uploadedBy: 'e1', uploadedByRole: 'employee', contentStatus: 'approved', createdAt: '2025-02-07T00:00:00Z' },
    // Pending approval
    { id: 'w16', word: 'Candid', meaning: 'Truthful and straightforward; frank', example: 'She was candid about her mistakes in the interview.', difficulty: 'easy', situation: 'interview', examCategory: 'general', synonyms: ['frank', 'honest'], antonyms: ['evasive'], isActive: true, uploadedBy: 'e1', uploadedByRole: 'employee', contentStatus: 'pending_approval', createdAt: '2025-02-08T00:00:00Z' },
    { id: 'w17', word: 'Disparate', meaning: 'Essentially different in kind; not comparable', example: 'The committee had disparate views on the proposal.', difficulty: 'hard', situation: 'essay', examCategory: 'upsc', synonyms: ['different', 'dissimilar'], antonyms: ['similar', 'alike'], isActive: true, uploadedBy: 'e1', uploadedByRole: 'employee', contentStatus: 'pending_approval', createdAt: '2025-02-08T00:00:00Z' },
];

const STORAGE_KEYS = {
    WORDS: 'vocab_master',
    PROGRESS: 'vocab_progress',
    QUIZ_ATTEMPTS: 'vocab_quiz_attempts',
    STREAK: 'vocab_streak',
};

const todayStr = () => new Date().toISOString().split('T')[0];

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useVocabulary(userId: string = 'student_1') {
    const [words, setWords] = useState<VocabWord[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.WORDS);
            if (stored) return JSON.parse(stored);
            localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(SEED_WORDS));
            return SEED_WORDS;
        } catch { return SEED_WORDS; }
    });

    const [progress, setProgress] = useState<VocabProgress[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });

    const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });

    const [vocabStreak, setVocabStreak] = useState<number>(() => {
        try { return parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0'); } catch { return 0; }
    });

    // Persist
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words)); }, [words]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress)); }, [progress]);
    useEffect(() => { localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(quizAttempts)); }, [quizAttempts]);

    // Only approved + active words visible to students
    const activeWords = useMemo(() => words.filter(w => w.isActive && w.contentStatus === 'approved'), [words]);

    // Get progress for this user
    const userProgress = useMemo(() => progress.filter(p => p.userId === userId), [progress, userId]);

    const getWordProgress = useCallback((wordId: string) =>
        userProgress.find(p => p.wordId === wordId), [userProgress]);

    // Today's 5 words (spaced repetition algorithm)
    const todayWords = useMemo(() => {
        const today = todayStr();
        // Check for overdue revision
        const overdueWords = userProgress
            .filter(p => p.status === 'learned' && p.nextRevisionDate && p.nextRevisionDate <= today)
            .map(p => activeWords.find(w => w.id === p.wordId))
            .filter(Boolean) as VocabWord[];

        // Get PENDING
        const pendingWords = userProgress
            .filter(p => p.status === 'pending')
            .sort((a, b) => a.assignedDate.localeCompare(b.assignedDate))
            .map(p => activeWords.find(w => w.id === p.wordId))
            .filter(Boolean) as VocabWord[];

        // Get NEW (no progress entry)
        const seenIds = new Set(userProgress.map(p => p.wordId));
        const newWords = activeWords.filter(w => !seenIds.has(w.id));

        const result: VocabWord[] = [];
        const addUnique = (w: VocabWord) => { if (result.length < 5 && !result.find(r => r.id === w.id)) result.push(w); };

        [...overdueWords, ...pendingWords, ...newWords].forEach(addUnique);
        return result;
    }, [activeWords, userProgress]);

    // Stats
    const stats = useMemo(() => {
        const total = activeWords.length;
        const learned = userProgress.filter(p => p.status === 'learned').length;
        const pending = userProgress.filter(p => p.status === 'pending').length;
        const seenIds = new Set(userProgress.map(p => p.wordId));
        const totalSeen = seenIds.size;
        const allAttempts = quizAttempts.filter(a => a.userId === userId);
        const correct = allAttempts.filter(a => a.isCorrect).length;
        const accuracy = allAttempts.length > 0 ? Math.round((correct / allAttempts.length) * 100) : 0;
        const level = learned < 20 ? 'Beginner' : learned < 50 ? 'Intermediate' : learned < 100 ? 'Advanced' : 'Expert';
        return { total, learned, pending, totalSeen, accuracy, level };
    }, [activeWords, userProgress, quizAttempts, userId]);

    // Mark a word's status
    const markWord = useCallback((wordId: string, status: VocabStatus, difficulty?: DifficultyLevel) => {
        const today = todayStr();
        let nextRevisionDate: string | undefined;
        if (status === 'learned' && difficulty) {
            const days = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 3 : 1;
            const next = new Date();
            next.setDate(next.getDate() + days);
            nextRevisionDate = next.toISOString().split('T')[0];
        }
        setProgress(prev => {
            const existing = prev.findIndex(p => p.userId === userId && p.wordId === wordId);
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = { ...updated[existing], status, learnedDate: status === 'learned' ? today : undefined, nextRevisionDate };
                return updated;
            }
            const newEntry: VocabProgress = {
                id: `${userId}_${wordId}`,
                userId,
                wordId,
                status,
                assignedDate: today,
                timesShown: 1,
                quizAttempts: 0,
                quizAccuracy: 0,
                learnedDate: status === 'learned' ? today : undefined,
                nextRevisionDate,
            };
            return [...prev, newEntry];
        });
    }, [userId]);

    // Record showing a word
    const recordShown = useCallback((wordId: string) => {
        const today = todayStr();
        setProgress(prev => {
            const existing = prev.findIndex(p => p.userId === userId && p.wordId === wordId);
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = { ...updated[existing], timesShown: updated[existing].timesShown + 1 };
                return updated;
            }
            return [...prev, { id: `${userId}_${wordId}`, userId, wordId, status: 'new', assignedDate: today, timesShown: 1, quizAttempts: 0, quizAccuracy: 0 }];
        });
    }, [userId]);

    // Record quiz attempt
    const recordQuizAttempt = useCallback((wordId: string, selected: string, correct: string) => {
        const isCorrect = selected === correct;
        const attempt: QuizAttempt = {
            id: `${Date.now()}`,
            userId,
            wordId,
            selectedOption: selected,
            correctOption: correct,
            isCorrect,
            attemptDate: new Date().toISOString(),
        };
        setQuizAttempts(prev => [...prev, attempt]);
        if (!isCorrect) markWord(wordId, 'pending');
        return isCorrect;
    }, [userId, markWord]);

    // Generate MCQ options for a word
    const generateQuizOptions = useCallback((word: VocabWord) => {
        const others = activeWords.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [...others.map(w => w.meaning), word.meaning].sort(() => Math.random() - 0.5);
        return { question: `What is the meaning of "${word.word}"?`, options, correctAnswer: word.meaning };
    }, [activeWords]);

    // Group words by date
    const wordsByDate = useMemo(() => {
        const map: Record<string, VocabWord[]> = {};
        userProgress.forEach(p => {
            const word = activeWords.find(w => w.id === p.wordId);
            if (word) {
                if (!map[p.assignedDate]) map[p.assignedDate] = [];
                if (!map[p.assignedDate].find(w => w.id === word.id)) map[p.assignedDate].push(word);
            }
        });
        return map;
    }, [activeWords, userProgress]);

    // Words by situation
    const wordsBySituation = useMemo(() => {
        const map: Record<SituationCategory, VocabWord[]> = { interview: [], essay: [], business: [], daily: [], exam: [] };
        activeWords.forEach(w => { if (map[w.situation]) map[w.situation].push(w); });
        return map;
    }, [activeWords]);

    // ─── Superadmin / Employee functions ────────────────────────────────────────
    const addWord = useCallback((word: Omit<VocabWord, 'id' | 'createdAt'>) => {
        const newWord: VocabWord = { ...word, id: `w${Date.now()}`, createdAt: new Date().toISOString() };
        setWords(prev => [...prev, newWord]);
        return newWord;
    }, []);

    const updateWord = useCallback((id: string, updates: Partial<VocabWord>) => {
        setWords(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    }, []);

    const deleteWord = useCallback((id: string) => {
        setWords(prev => prev.filter(w => w.id !== id));
    }, []);

    const approveWord = useCallback((id: string) => {
        updateWord(id, { contentStatus: 'approved' });
    }, [updateWord]);

    const rejectWord = useCallback((id: string, reason: string) => {
        updateWord(id, { contentStatus: 'rejected', rejectionReason: reason });
    }, [updateWord]);

    // For superadmin: all words
    // For employee: only their own words
    const getWordsForRole = useCallback((role: 'super-admin' | 'employee', empId?: string) => {
        if (role === 'super-admin') return words;
        return words.filter(w => w.uploadedBy === (empId || userId));
    }, [words, userId]);

    return {
        // Student data
        activeWords,
        todayWords,
        stats,
        vocabStreak,
        wordsByDate,
        wordsBySituation,
        userProgress,
        quizAttempts: quizAttempts.filter(a => a.userId === userId),
        getWordProgress,
        markWord,
        recordShown,
        recordQuizAttempt,
        generateQuizOptions,
        // Management
        words,
        addWord,
        updateWord,
        deleteWord,
        approveWord,
        rejectWord,
        getWordsForRole,
    };
}
