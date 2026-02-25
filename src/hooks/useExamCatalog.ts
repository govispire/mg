/**
 * useExamCatalog
 * localStorage-backed store with real-time BroadcastChannel sync.
 * SuperAdmin writes → student view re-renders instantly (same tab or other tabs).
 */
import { useState, useEffect, useCallback } from 'react';
import { examCategories, getExamsByCategory, type Exam } from '@/data/examData';

// ─── Types ───────────────────────────────────────────────────────────────────

export type TestDifficulty = 'easy' | 'medium' | 'hard';

export interface CatalogTestItem {
    id: string;
    name: string;
    maxScore: number;
    totalQuestions: number;
    durationMinutes: number;
    difficulty: TestDifficulty;
    isVisible: boolean;
    createdAt: string;
}

export interface TestTypeSlot {
    key: string;
    tab: 'prelims' | 'mains' | 'speed' | 'live';
    subTab: 'full' | 'sectional' | 'speed' | 'pyq' | null;
    label: string;
    tests: CatalogTestItem[];
}

export interface CatalogSection {
    id: string;
    name: string;
    description?: string;
    exams: CatalogExam[];
}

export interface CatalogExam {
    id: string;
    name: string;
    logo: string;
    isPopular: boolean;
    testSlots: TestTypeSlot[];
}

export interface CatalogCategory {
    id: string;
    name: string;
    description: string;
    logo: string;
    studentsEnrolled: number;
    examsAvailable: number;
    colorClass: string;
    isPopular: boolean;
    isVisible: boolean;
    sections: CatalogSection[];
    createdAt: string;
    updatedAt: string;
}

// ─── Default slot templates ───────────────────────────────────────────────────

export const DEFAULT_SLOT_TEMPLATES: Omit<TestTypeSlot, 'tests'>[] = [
    { key: 'prelims_full', tab: 'prelims', subTab: 'full', label: 'Prelims – Full Test' },
    { key: 'prelims_sectional', tab: 'prelims', subTab: 'sectional', label: 'Prelims – Sectional Test' },
    { key: 'prelims_speed', tab: 'prelims', subTab: 'speed', label: 'Prelims – Speed Test' },
    { key: 'prelims_pyq', tab: 'prelims', subTab: 'pyq', label: 'Prelims – PYQ Test' },
    { key: 'mains_full', tab: 'mains', subTab: 'full', label: 'Mains – Full Test' },
    { key: 'mains_sectional', tab: 'mains', subTab: 'sectional', label: 'Mains – Sectional Test' },
    { key: 'mains_speed', tab: 'mains', subTab: 'speed', label: 'Mains – Speed Test' },
    { key: 'mains_pyq', tab: 'mains', subTab: 'pyq', label: 'Mains – PYQ Test' },
    { key: 'speed', tab: 'speed', subTab: null, label: 'Speed Test' },
    { key: 'live', tab: 'live', subTab: null, label: 'Live Test' },
];

export const makeDefaultSlots = (): TestTypeSlot[] =>
    DEFAULT_SLOT_TEMPLATES.map(t => ({ ...t, tests: [] }));

// ─── Storage / channel ────────────────────────────────────────────────────────

const STORAGE_KEY = 'superadmin_exam_catalog';
const CHANNEL_NAME = 'exam_catalog_sync';

// ─── Migration: add missing testSlots to every exam ──────────────────────────

const migrate = (raw: CatalogCategory[]): { data: CatalogCategory[]; changed: boolean } => {
    let changed = false;
    const data = raw.map(cat => ({
        ...cat,
        sections: cat.sections.map(sec => ({
            ...sec,
            exams: sec.exams.map(exam => {
                if (!exam.testSlots || exam.testSlots.length === 0) {
                    changed = true;
                    return { ...exam, testSlots: makeDefaultSlots() };
                }
                // Ensure all 10 slots exist (some may have been added later)
                const existing = new Set(exam.testSlots.map(s => s.key));
                const missing = DEFAULT_SLOT_TEMPLATES.filter(t => !existing.has(t.key));
                if (missing.length > 0) {
                    changed = true;
                    return {
                        ...exam,
                        testSlots: [...exam.testSlots, ...missing.map(t => ({ ...t, tests: [] }))],
                    };
                }
                return exam;
            }),
        })),
    }));
    return { data, changed };
};

// ─── Seed from static examData ────────────────────────────────────────────────

const seedFromStatic = (): CatalogCategory[] =>
    examCategories.map(cat => {
        const staticExams: Exam[] = getExamsByCategory(cat.id);
        return {
            ...cat,
            isVisible: true,
            sections: [{
                id: 'default',
                name: 'All Exams',
                exams: staticExams.map(e => ({
                    id: e.id,
                    name: e.name,
                    logo: e.logo,
                    isPopular: e.isPopular,
                    testSlots: makeDefaultSlots(),
                })),
            }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    });

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useExamCatalog = () => {
    const [catalog, setCatalog] = useState<CatalogCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Initial load + force-migration ─────────────────────────────────────────
    useEffect(() => {
        const load = () => {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const { data, changed } = migrate(JSON.parse(raw));
                    if (changed) {
                        // Write migrated data back so existing exams get testSlots immediately
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                    }
                    setCatalog(data);
                } else {
                    const seeded = seedFromStatic();
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
                    setCatalog(seeded);
                }
            } catch {
                const seeded = seedFromStatic();
                setCatalog(seeded);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    // ── Real-time sync via BroadcastChannel ─────────────────────────────────────
    useEffect(() => {
        // BroadcastChannel syncs across tabs in the same origin
        let channel: BroadcastChannel | null = null;
        try {
            channel = new BroadcastChannel(CHANNEL_NAME);
            channel.onmessage = (event) => {
                if (event.data?.type === 'catalog_updated' && event.data?.catalog) {
                    setCatalog(event.data.catalog);
                }
            };
        } catch { /* BroadcastChannel not supported */ }

        // Also listen for the custom same-tab event
        const handleSameTab = (e: Event) => {
            const ce = e as CustomEvent<CatalogCategory[]>;
            if (ce.detail) setCatalog(ce.detail);
        };
        window.addEventListener('catalog_updated', handleSameTab);

        return () => {
            channel?.close();
            window.removeEventListener('catalog_updated', handleSameTab);
        };
    }, []);

    // ── Persist + broadcast ────────────────────────────────────────────────────
    const persist = useCallback((next: CatalogCategory[]) => {
        setCatalog(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

        // Broadcast to all other tabs
        try {
            const ch = new BroadcastChannel(CHANNEL_NAME);
            ch.postMessage({ type: 'catalog_updated', catalog: next });
            ch.close();
        } catch { /* not supported */ }

        // Dispatch custom event for same-tab listeners (e.g., StudentTests on the same tab)
        window.dispatchEvent(new CustomEvent('catalog_updated', { detail: next }));
    }, []);

    // ── Category CRUD ──────────────────────────────────────────────────────────

    const addCategory = useCallback((cat: Omit<CatalogCategory, 'createdAt' | 'updatedAt' | 'sections'>) => {
        const now = new Date().toISOString();
        persist(prev => {
            const next = [...prev, { ...cat, sections: [], createdAt: now, updatedAt: now }];
            return next;
        } as unknown as CatalogCategory[]);
    }, [persist]);

    const addCategory2 = useCallback((cat: Omit<CatalogCategory, 'createdAt' | 'updatedAt' | 'sections'>) => {
        setCatalog(prev => {
            const now = new Date().toISOString();
            const next = [...prev, { ...cat, sections: [], createdAt: now, updatedAt: now }];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            try {
                const ch = new BroadcastChannel(CHANNEL_NAME);
                ch.postMessage({ type: 'catalog_updated', catalog: next });
                ch.close();
            } catch { /* */ }
            window.dispatchEvent(new CustomEvent('catalog_updated', { detail: next }));
            return next;
        });
    }, []);

    const updateCategory = useCallback((id: string, updates: Partial<Omit<CatalogCategory, 'id' | 'sections' | 'createdAt'>>) => {
        setCatalog(prev => {
            const next = prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            try { const ch = new BroadcastChannel(CHANNEL_NAME); ch.postMessage({ type: 'catalog_updated', catalog: next }); ch.close(); } catch { /* */ }
            window.dispatchEvent(new CustomEvent('catalog_updated', { detail: next }));
            return next;
        });
    }, []);

    const deleteCategory = useCallback((id: string) => {
        setCatalog(prev => {
            const next = prev.filter(c => c.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            try { const ch = new BroadcastChannel(CHANNEL_NAME); ch.postMessage({ type: 'catalog_updated', catalog: next }); ch.close(); } catch { /* */ }
            window.dispatchEvent(new CustomEvent('catalog_updated', { detail: next }));
            return next;
        });
    }, []);

    const toggleCategoryVisibility = useCallback((id: string) => {
        setCatalog(prev => {
            const next = prev.map(c => c.id === id ? { ...c, isVisible: !c.isVisible, updatedAt: new Date().toISOString() } : c);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            try { const ch = new BroadcastChannel(CHANNEL_NAME); ch.postMessage({ type: 'catalog_updated', catalog: next }); ch.close(); } catch { /* */ }
            window.dispatchEvent(new CustomEvent('catalog_updated', { detail: next }));
            return next;
        });
    }, []);

    // ── Section CRUD ───────────────────────────────────────────────────────────

    const broadcast = useCallback((next: CatalogCategory[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        try { const ch = new BroadcastChannel(CHANNEL_NAME); ch.postMessage({ type: 'catalog_updated', catalog: next }); ch.close(); } catch { /* */ }
        window.dispatchEvent(new CustomEvent('catalog_updated', { detail: next }));
    }, []);

    const addSection = useCallback((categoryId: string, section: Omit<CatalogSection, 'exams'>) => {
        setCatalog(prev => {
            const next = prev.map(c => c.id === categoryId
                ? { ...c, sections: [...c.sections, { ...section, exams: [] }], updatedAt: new Date().toISOString() }
                : c);
            broadcast(next);
            return next;
        });
    }, [broadcast]);

    const updateSection = useCallback((categoryId: string, sectionId: string, updates: Partial<Omit<CatalogSection, 'exams'>>) => {
        setCatalog(prev => {
            const next = prev.map(c => c.id === categoryId
                ? { ...c, sections: c.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s), updatedAt: new Date().toISOString() }
                : c);
            broadcast(next);
            return next;
        });
    }, [broadcast]);

    const deleteSection = useCallback((categoryId: string, sectionId: string) => {
        setCatalog(prev => {
            const next = prev.map(c => c.id === categoryId
                ? { ...c, sections: c.sections.filter(s => s.id !== sectionId), updatedAt: new Date().toISOString() }
                : c);
            broadcast(next);
            return next;
        });
    }, [broadcast]);

    // ── Exam CRUD ──────────────────────────────────────────────────────────────

    const addExam = useCallback((categoryId: string, sectionId: string, exam: Omit<CatalogExam, 'testSlots'>) => {
        const full: CatalogExam = { ...exam, testSlots: makeDefaultSlots() };
        setCatalog(prev => {
            const next = prev.map(c => c.id === categoryId
                ? { ...c, sections: c.sections.map(s => s.id === sectionId ? { ...s, exams: [...s.exams, full] } : s), updatedAt: new Date().toISOString() }
                : c);
            broadcast(next);
            return next;
        });
    }, [broadcast]);

    const updateExam = useCallback((categoryId: string, sectionId: string, examId: string, updates: Partial<Omit<CatalogExam, 'testSlots'>>) => {
        setCatalog(prev => {
            const next = prev.map(c => c.id === categoryId
                ? { ...c, sections: c.sections.map(s => s.id === sectionId ? { ...s, exams: s.exams.map(e => e.id === examId ? { ...e, ...updates } : e) } : s), updatedAt: new Date().toISOString() }
                : c);
            broadcast(next);
            return next;
        });
    }, [broadcast]);

    const removeExam = useCallback((categoryId: string, sectionId: string, examId: string) => {
        setCatalog(prev => {
            const next = prev.map(c => c.id === categoryId
                ? { ...c, sections: c.sections.map(s => s.id === sectionId ? { ...s, exams: s.exams.filter(e => e.id !== examId) } : s), updatedAt: new Date().toISOString() }
                : c);
            broadcast(next);
            return next;
        });
    }, [broadcast]);

    // ── Test CRUD ──────────────────────────────────────────────────────────────

    const addTest = useCallback((categoryId: string, sectionId: string, examId: string, slotKey: string, test: Omit<CatalogTestItem, 'createdAt'>) => {
        const now = new Date().toISOString();
        setCatalog(prev => {
            const next = prev.map(c => c.id === categoryId
                ? {
                    ...c,
                    sections: c.sections.map(s => s.id === sectionId
                        ? { ...s, exams: s.exams.map(e => e.id === examId ? { ...e, testSlots: e.testSlots.map(slot => slot.key === slotKey ? { ...slot, tests: [...slot.tests, { ...test, createdAt: now }] } : slot) } : e) }
                        : s),
                    updatedAt: now,
                }
                : c);
            broadcast(next);
            return next;
        });
    }, [broadcast]);

    const updateTest = useCallback((categoryId: string, sectionId: string, examId: string, slotKey: string, testId: string, updates: Partial<CatalogTestItem>) => {
        setCatalog(prev => {
            const next = prev.map(c => c.id === categoryId
                ? {
                    ...c,
                    sections: c.sections.map(s => s.id === sectionId
                        ? { ...s, exams: s.exams.map(e => e.id === examId ? { ...e, testSlots: e.testSlots.map(slot => slot.key === slotKey ? { ...slot, tests: slot.tests.map(t => t.id === testId ? { ...t, ...updates } : t) } : slot) } : e) }
                        : s),
                    updatedAt: new Date().toISOString(),
                }
                : c);
            broadcast(next);
            return next;
        });
    }, [broadcast]);

    const deleteTest = useCallback((categoryId: string, sectionId: string, examId: string, slotKey: string, testId: string) => {
        setCatalog(prev => {
            const next = prev.map(c => c.id === categoryId
                ? {
                    ...c,
                    sections: c.sections.map(s => s.id === sectionId
                        ? { ...s, exams: s.exams.map(e => e.id === examId ? { ...e, testSlots: e.testSlots.map(slot => slot.key === slotKey ? { ...slot, tests: slot.tests.filter(t => t.id !== testId) } : slot) } : e) }
                        : s),
                    updatedAt: new Date().toISOString(),
                }
                : c);
            broadcast(next);
            return next;
        });
    }, [broadcast]);

    const resetToDefaults = useCallback(() => {
        const seeded = seedFromStatic();
        setCatalog(seeded);
        broadcast(seeded);
    }, [broadcast]);

    const findExam = useCallback((categoryId: string, sectionId: string, examId: string): CatalogExam | undefined => {
        return catalog
            .find(c => c.id === categoryId)
            ?.sections.find(s => s.id === sectionId)
            ?.exams.find(e => e.id === examId);
    }, [catalog]);

    return {
        catalog, loading,
        addCategory: addCategory2, updateCategory, deleteCategory, toggleCategoryVisibility,
        addSection, updateSection, deleteSection,
        addExam, updateExam, removeExam,
        addTest, updateTest, deleteTest,
        resetToDefaults, findExam,
    };
};
