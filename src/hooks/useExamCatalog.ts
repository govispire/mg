/**
 * useExamCatalog
 * localStorage-backed store with real-time BroadcastChannel sync.
 * Every write immediately broadcasts to all consumers (superadmin + student)
 * so both sides update without a page refresh.
 */
import { useState, useEffect, useCallback } from 'react';
import { examCategories, getExamsByCategory, type Exam } from '@/data/examData';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'superadmin_exam_catalog';
const CHANNEL_NAME = 'exam_catalog_sync';

/** Bump this whenever the seed data changes to force all users to re-seed */
const SEED_VERSION = '2';
const SEED_VER_KEY = 'superadmin_catalog_seed_ver';

// ─── Migration: ensure every exam has all 10 slots ───────────────────────────

const migrate = (raw: CatalogCategory[]): { data: CatalogCategory[]; changed: boolean } => {
    let changed = false;
    const data = raw.map(cat => ({
        ...cat,
        sections: cat.sections.map(sec => ({
            ...sec,
            exams: sec.exams.map(exam => {
                const existing = new Set((exam.testSlots ?? []).map(s => s.key));
                const missing = DEFAULT_SLOT_TEMPLATES.filter(t => !existing.has(t.key));
                if (!exam.testSlots || exam.testSlots.length === 0 || missing.length > 0) {
                    changed = true;
                    return {
                        ...exam,
                        testSlots: [
                            ...(exam.testSlots ?? []),
                            ...missing.map(t => ({ ...t, tests: [] })),
                        ],
                    };
                }
                return exam;
            }),
        })),
    }));
    return { data, changed };
};

// ─── Sample tests (mirrors student useExamProgress data) ─────────────────────

const DIFFICULTIES: TestDifficulty[] = ['easy', 'medium', 'hard'];

const generateSampleTests = (
    type: 'prelims' | 'mains' | 'speed' | 'live',
    subType: 'full' | 'sectional' | 'speed' | 'pyq' | null,
    count: number,
): CatalogTestItem[] => {
    const labelBase = (() => {
        if (type === 'live') return 'Live Test';
        if (subType === 'full') return `${type.charAt(0).toUpperCase() + type.slice(1)} Full Test`;
        if (subType === 'sectional') return `${type.charAt(0).toUpperCase() + type.slice(1)} Sectional`;
        if (subType === 'speed') return `Speed Test`;
        if (subType === 'pyq') return `PYQ ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        return `${type.charAt(0).toUpperCase() + type.slice(1)} Test`;
    })();

    const maxScore = type === 'speed' || subType === 'speed' ? 50 :
        type === 'mains' || subType === 'full' ? 200 : 100;
    const duration = type === 'live' ? 180 :
        type === 'mains' ? 180 : subType === 'speed' || type === 'speed' ? 15 : 60;

    return Array.from({ length: count }, (_, i) => ({
        id: `${type}_${subType ?? 'main'}_${i + 1}`,
        name: `${labelBase} ${i + 1}`,
        maxScore,
        totalQuestions: maxScore === 200 ? 155 : maxScore === 50 ? 20 : 100,
        durationMinutes: duration,
        difficulty: DIFFICULTIES[i % 3],
        isVisible: true,
        createdAt: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000).toISOString(),
    }));
};

/** Build test slots pre-populated with 20 sample tests each */
const makeSampleSlots = (): TestTypeSlot[] => [
    { key: 'prelims_full', tab: 'prelims', subTab: 'full', label: 'Prelims – Full Test', tests: generateSampleTests('prelims', 'full', 20) },
    { key: 'prelims_sectional', tab: 'prelims', subTab: 'sectional', label: 'Prelims – Sectional Test', tests: generateSampleTests('prelims', 'sectional', 20) },
    { key: 'prelims_speed', tab: 'prelims', subTab: 'speed', label: 'Prelims – Speed Test', tests: generateSampleTests('prelims', 'speed', 20) },
    { key: 'prelims_pyq', tab: 'prelims', subTab: 'pyq', label: 'Prelims – PYQ Test', tests: generateSampleTests('prelims', 'pyq', 20) },
    { key: 'mains_full', tab: 'mains', subTab: 'full', label: 'Mains – Full Test', tests: generateSampleTests('mains', 'full', 20) },
    { key: 'mains_sectional', tab: 'mains', subTab: 'sectional', label: 'Mains – Sectional Test', tests: generateSampleTests('mains', 'sectional', 20) },
    { key: 'mains_speed', tab: 'mains', subTab: 'speed', label: 'Mains – Speed Test', tests: generateSampleTests('mains', 'speed', 20) },
    { key: 'mains_pyq', tab: 'mains', subTab: 'pyq', label: 'Mains – PYQ Test', tests: generateSampleTests('mains', 'pyq', 20) },
    { key: 'speed', tab: 'speed', subTab: null, label: 'Speed Test', tests: generateSampleTests('speed', null, 20) },
    { key: 'live', tab: 'live', subTab: null, label: 'Live Test', tests: generateSampleTests('live', null, 20) },
];

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
                    testSlots: makeSampleSlots(),
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

    // ── Load + force-migrate existing data ─────────────────────────────────────
    useEffect(() => {
        try {
            const storedVer = localStorage.getItem(SEED_VER_KEY);
            const raw = localStorage.getItem(STORAGE_KEY);

            // Force re-seed when SEED_VERSION bumped OR first run
            if (!raw || storedVer !== SEED_VERSION) {
                const seeded = seedFromStatic();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
                localStorage.setItem(SEED_VER_KEY, SEED_VERSION);
                setCatalog(seeded);
            } else {
                const { data, changed } = migrate(JSON.parse(raw));
                if (changed) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                }
                setCatalog(data);
            }
        } catch {
            setCatalog(seedFromStatic());
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Real-time sync listener ─────────────────────────────────────────────────
    useEffect(() => {
        // Cross-tab only: BroadcastChannel
        // The same tab already has up-to-date state via setCatalog — no same-tab event needed.
        let channel: BroadcastChannel | null = null;
        try {
            channel = new BroadcastChannel(CHANNEL_NAME);
            channel.onmessage = (evt: MessageEvent) => {
                if (evt.data?.type === 'catalog_updated') {
                    setCatalog(evt.data.catalog as CatalogCategory[]);
                }
            };
        } catch { /* BroadcastChannel not available */ }

        return () => {
            channel?.close();
        };
    }, []);

    // ── Broadcast helper ────────────────────────────────────────────────────────
    // Persists to localStorage and notifies OTHER tabs via BroadcastChannel.
    // Must NOT be called inside a setCatalog() updater — use setTimeout(() => broadcast(next), 0).
    // IMPORTANT: also stamps SEED_VER_KEY so the load logic won't re-seed this data.
    // persist synchronously to localStorage + notify other tabs
    const persist = useCallback((next: CatalogCategory[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        localStorage.setItem(SEED_VER_KEY, SEED_VERSION);
        try {
            const ch = new BroadcastChannel(CHANNEL_NAME);
            ch.postMessage({ type: 'catalog_updated', catalog: next });
            ch.close();
        } catch { /* not supported */ }
    }, []);

    // Keep backward-compat alias (used elsewhere in file)
    const broadcast = persist;

    // ── Category CRUD ──────────────────────────────────────────────────────────

    const addCategory = useCallback((cat: Omit<CatalogCategory, 'createdAt' | 'updatedAt' | 'sections'>) => {
        const now = new Date().toISOString();
        setCatalog(prev => {
            const next = [...prev, { ...cat, sections: [], createdAt: now, updatedAt: now }];
            persist(next); // synchronous — must happen inside updater before any navigation
            return next;
        });
    }, [persist]);

    const updateCategory = useCallback((id: string, updates: Partial<Omit<CatalogCategory, 'id' | 'sections' | 'createdAt'>>) => {
        setCatalog(prev => {
            const next = prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c);
            persist(next);
            return next;
        });
    }, [persist]);

    const deleteCategory = useCallback((id: string) => {
        setCatalog(prev => {
            const next = prev.filter(c => c.id !== id);
            persist(next);
            return next;
        });
    }, [persist]);

    const toggleCategoryVisibility = useCallback((id: string) => {
        setCatalog(prev => {
            const next = prev.map(c =>
                c.id === id ? { ...c, isVisible: !c.isVisible, updatedAt: new Date().toISOString() } : c,
            );
            persist(next);
            return next;
        });
    }, [persist]);

    // ── Section CRUD ───────────────────────────────────────────────────────────

    const addSection = useCallback((categoryId: string, section: Omit<CatalogSection, 'exams'>) => {
        setCatalog(prev => {
            const next = prev.map(c =>
                c.id === categoryId
                    ? { ...c, sections: [...c.sections, { ...section, exams: [] }], updatedAt: new Date().toISOString() }
                    : c,
            );
            persist(next);
            return next;
        });
    }, [persist]);

    const updateSection = useCallback((categoryId: string, sectionId: string, updates: Partial<Omit<CatalogSection, 'exams'>>) => {
        setCatalog(prev => {
            const next = prev.map(c =>
                c.id === categoryId
                    ? { ...c, sections: c.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s), updatedAt: new Date().toISOString() }
                    : c,
            );
            persist(next);
            return next;
        });
    }, [persist]);

    const deleteSection = useCallback((categoryId: string, sectionId: string) => {
        setCatalog(prev => {
            const next = prev.map(c =>
                c.id === categoryId
                    ? { ...c, sections: c.sections.filter(s => s.id !== sectionId), updatedAt: new Date().toISOString() }
                    : c,
            );
            persist(next);
            return next;
        });
    }, [persist]);

    // ── Exam CRUD ──────────────────────────────────────────────────────────────

    const addExam = useCallback((categoryId: string, sectionId: string, exam: Omit<CatalogExam, 'testSlots'>) => {
        const full: CatalogExam = { ...exam, testSlots: makeDefaultSlots() };
        setCatalog(prev => {
            const next = prev.map(c =>
                c.id === categoryId
                    ? {
                        ...c,
                        sections: c.sections.map(s =>
                            s.id === sectionId ? { ...s, exams: [...s.exams, full] } : s,
                        ),
                        updatedAt: new Date().toISOString(),
                    }
                    : c,
            );
            // CRITICAL: write synchronously so any immediate navigate() finds the exam in localStorage
            persist(next);
            return next;
        });
    }, [persist]);

    const updateExam = useCallback((categoryId: string, sectionId: string, examId: string, updates: Partial<Omit<CatalogExam, 'testSlots'>>) => {
        setCatalog(prev => {
            const next = prev.map(c =>
                c.id === categoryId
                    ? {
                        ...c,
                        sections: c.sections.map(s =>
                            s.id === sectionId
                                ? { ...s, exams: s.exams.map(e => e.id === examId ? { ...e, ...updates } : e) }
                                : s,
                        ),
                        updatedAt: new Date().toISOString(),
                    }
                    : c,
            );
            persist(next);
            return next;
        });
    }, [persist]);

    const removeExam = useCallback((categoryId: string, sectionId: string, examId: string) => {
        setCatalog(prev => {
            const next = prev.map(c =>
                c.id === categoryId
                    ? {
                        ...c,
                        sections: c.sections.map(s =>
                            s.id === sectionId
                                ? { ...s, exams: s.exams.filter(e => e.id !== examId) }
                                : s,
                        ),
                        updatedAt: new Date().toISOString(),
                    }
                    : c,
            );
            persist(next);
            return next;
        });
    }, [persist]);

    // ── Test CRUD ──────────────────────────────────────────────────────────────

    const addTest = useCallback((
        categoryId: string, sectionId: string, examId: string,
        slotKey: string, test: Omit<CatalogTestItem, 'createdAt'>,
    ) => {
        const now = new Date().toISOString();
        setCatalog(prev => {
            const next = prev.map(c =>
                c.id !== categoryId ? c : {
                    ...c,
                    sections: c.sections.map(s =>
                        s.id !== sectionId ? s : {
                            ...s,
                            exams: s.exams.map(e =>
                                e.id !== examId ? e : {
                                    ...e,
                                    testSlots: e.testSlots.map(slot =>
                                        slot.key !== slotKey ? slot : {
                                            ...slot,
                                            tests: [...slot.tests, { ...test, createdAt: now }],
                                        },
                                    ),
                                },
                            ),
                        },
                    ),
                    updatedAt: now,
                },
            );
            broadcast(next);
            return next;
        });
    }, [broadcast]);

    const updateTest = useCallback((
        categoryId: string, sectionId: string, examId: string,
        slotKey: string, testId: string, updates: Partial<CatalogTestItem>,
    ) => {
        setCatalog(prev => {
            const next = prev.map(c =>
                c.id !== categoryId ? c : {
                    ...c,
                    sections: c.sections.map(s =>
                        s.id !== sectionId ? s : {
                            ...s,
                            exams: s.exams.map(e =>
                                e.id !== examId ? e : {
                                    ...e,
                                    testSlots: e.testSlots.map(slot =>
                                        slot.key !== slotKey ? slot : {
                                            ...slot,
                                            tests: slot.tests.map(t => t.id !== testId ? t : { ...t, ...updates }),
                                        },
                                    ),
                                },
                            ),
                        },
                    ),
                    updatedAt: new Date().toISOString(),
                },
            );
            broadcast(next);
            return next;
        });
    }, [broadcast]);

    const deleteTest = useCallback((
        categoryId: string, sectionId: string, examId: string,
        slotKey: string, testId: string,
    ) => {
        setCatalog(prev => {
            const next = prev.map(c =>
                c.id !== categoryId ? c : {
                    ...c,
                    sections: c.sections.map(s =>
                        s.id !== sectionId ? s : {
                            ...s,
                            exams: s.exams.map(e =>
                                e.id !== examId ? e : {
                                    ...e,
                                    testSlots: e.testSlots.map(slot =>
                                        slot.key !== slotKey ? slot : {
                                            ...slot,
                                            tests: slot.tests.filter(t => t.id !== testId),
                                        },
                                    ),
                                },
                            ),
                        },
                    ),
                    updatedAt: new Date().toISOString(),
                },
            );
            broadcast(next);
            return next;
        });
    }, [broadcast]);

    const resetToDefaults = useCallback(() => {
        const seeded = seedFromStatic();
        setCatalog(seeded);
        broadcast(seeded);
    }, [broadcast]);

    const findExam = useCallback((categoryId: string, sectionId: string, examId: string): CatalogExam | undefined =>
        catalog
            .find(c => c.id === categoryId)
            ?.sections.find(s => s.id === sectionId)
            ?.exams.find(e => e.id === examId),
        [catalog]);

    return {
        catalog, loading,
        addCategory, updateCategory, deleteCategory, toggleCategoryVisibility,
        addSection, updateSection, deleteSection,
        addExam, updateExam, removeExam,
        addTest, updateTest, deleteTest,
        resetToDefaults, findExam,
    };
};
