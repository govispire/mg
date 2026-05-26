/**
 * useExamStages
 * ─────────────────────────────────────────────────────────────────────────────
 * Stores exam stages per examId in localStorage.
 *
 * Three-layer sync so SuperAdmin changes reflect INSTANTLY everywhere:
 *
 *   1. CustomEvent('exam_stages_updated')
 *      → Works within the SAME browser tab (SPA route changes, same-tab preview)
 *
 *   2. window 'storage' event
 *      → Fires in OTHER tabs whenever localStorage is written
 *
 *   3. BroadcastChannel('exam_stages_sync')
 *      → Additional cross-tab / cross-worker channel
 *
 * This covers every scenario: same tab, different tab, different window.
 *
 * Stage model:
 *   id, name (free text), order, date, status, isVisible, notes, link
 *
 * Usage:
 *   const { stages, addStage, updateStage, deleteStage, reorder } = useExamStages(examId);
 */

import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StageStatus =
  | 'upcoming'
  | 'live'
  | 'completed'
  | 'postponed'
  | 'cancelled';

export interface ExamStageItem {
  id: string;
  examId: string;          // which exam this belongs to
  name: string;            // free-text: "Prelims", "Mains", "Interview", "Document Verification"…
  order: number;           // 1-based sort order
  date: string | null;     // ISO date string, e.g. "2026-10-05"
  status: StageStatus | string; // allow custom status labels
  isVisible: boolean;      // whether students can see this stage
  notes: string;           // optional admin notes (not shown to students)
  link: string;            // optional attachment/official notice URL
  color: string;           // custom gradient/color set by SuperAdmin (CSS gradient string)
  createdAt: string;
  updatedAt: string;
}

// ─── Storage constants ────────────────────────────────────────────────────────

const STORAGE_KEY  = 'exam_stages_v1';
const CHANNEL_NAME = 'exam_stages_sync';
const CUSTOM_EVENT = 'exam_stages_updated'; // same-tab CustomEvent name

/** Normalize any exam ID to a consistent slug: lowercase, spaces→hyphens, strip non-alphanumeric */
export function slugifyExamId(id: string): string {
  return id.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadAll(): Record<string, ExamStageItem[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: Record<string, ExamStageItem[]> = raw ? JSON.parse(raw) : {};

    // ── Migration: normalize all keys to slug form ──────────────────────────
    // This handles old data stored under 'sbi po' (space) → merge into 'sbi-po' (slug).
    // If both exist, keep the entry with the most recent updatedAt per stage.
    const normalized: Record<string, ExamStageItem[]> = {};
    for (const [key, stages] of Object.entries(parsed)) {
      const slug = slugifyExamId(key);
      if (!normalized[slug]) {
        normalized[slug] = stages;
      } else {
        // Merge: for each stage id prefer the one with later updatedAt
        const existing = normalized[slug];
        const mergeMap = new Map<string, ExamStageItem>();
        for (const s of [...existing, ...stages]) {
          const prev = mergeMap.get(s.id);
          if (!prev || s.updatedAt > prev.updatedAt) mergeMap.set(s.id, s);
        }
        normalized[slug] = Array.from(mergeMap.values());
      }
    }

    // If anything changed during migration, persist the cleaned data
    if (JSON.stringify(normalized) !== JSON.stringify(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }

    return normalized;
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, ExamStageItem[]>): void {
  // 1. Persist to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  // 2. Same-tab notification (SPA: SuperAdmin → Student in the same browser tab)
  try {
    window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: data }));
  } catch { /* ignore */ }

  // 3. Cross-tab via BroadcastChannel (different browser tabs / windows)
  try {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.postMessage({ type: 'stages_updated', data });
    ch.close();
  } catch { /* BroadcastChannel not available in all environments */ }
}

// ─── Pure helpers (no hooks) ──────────────────────────────────────────────────

export function getDaysLeft(dateStr: string | null): number | null {
  if (!dateStr) return null;
  try {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

/** Returns the next upcoming visible stage (soonest future date) */
export function getNextStage(stages: ExamStageItem[]): ExamStageItem | null {
  const visible = stages
    .filter(s => s.isVisible && s.date && s.status !== 'completed' && s.status !== 'cancelled')
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
  return visible.find(s => getDaysLeft(s.date) !== null && getDaysLeft(s.date)! >= 0) ?? null;
}

/** Returns ALL visible stages sorted by admin-defined order */
export function getVisibleStages(stages: ExamStageItem[]): ExamStageItem[] {
  return stages.filter(s => s.isVisible).sort((a, b) => a.order - b.order);
}

// ─── Internal: attach all three sync listeners ────────────────────────────────

function attachSyncListeners(onUpdate: (data: Record<string, ExamStageItem[]>) => void) {
  // Layer 1: CustomEvent — same-tab (SPA navigation: admin saves → student page updates)
  const onCustom = (e: Event) => {
    const data = (e as CustomEvent<Record<string, ExamStageItem[]>>).detail;
    if (data && typeof data === 'object') onUpdate(data);
  };

  // Layer 2: storage event — cross-tab (another tab writes localStorage, fires here)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onUpdate(loadAll());
  };

  window.addEventListener(CUSTOM_EVENT, onCustom);
  window.addEventListener('storage', onStorage);

  // Layer 3: BroadcastChannel — cross-tab / cross-worker
  let ch: BroadcastChannel | null = null;
  try {
    ch = new BroadcastChannel(CHANNEL_NAME);
    ch.onmessage = (evt: MessageEvent) => {
      if (evt.data?.type === 'stages_updated' && evt.data.data) {
        onUpdate(evt.data.data);
      }
    };
  } catch { /* not available in some environments */ }

  // Return cleanup function
  return () => {
    window.removeEventListener(CUSTOM_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
    ch?.close();
  };
}

// ─── Hook (per exam) ──────────────────────────────────────────────────────────

export function useExamStages(rawExamId: string) {
  // Always use the slug form — same key regardless of whether caller passes
  // "sbi po", "SBI PO", "sbi-po", or "SBI-PO".
  const examId = slugifyExamId(rawExamId);
  const [all, setAll] = useState<Record<string, ExamStageItem[]>>(loadAll);

  const stages: ExamStageItem[] = (all[examId] ?? []).sort((a, b) => a.order - b.order);

  // Persist + broadcast on every mutation
  const persist = useCallback((next: Record<string, ExamStageItem[]>) => {
    setAll(next);
    saveAll(next);
  }, []);

  // Attach all three sync listeners
  useEffect(() => {
    return attachSyncListeners(setAll);
  }, []); // intentionally empty — listeners are stable

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const addStage = useCallback((stage: Omit<ExamStageItem, 'id' | 'examId' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const id = `stage_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const next = {
      ...all,
      [examId]: [...(all[examId] ?? []), { ...stage, id, examId, createdAt: now, updatedAt: now }],
    };
    persist(next);
  }, [all, examId, persist]);

  const updateStage = useCallback((stageId: string, updates: Partial<Omit<ExamStageItem, 'id' | 'examId' | 'createdAt'>>) => {
    const next = {
      ...all,
      [examId]: (all[examId] ?? []).map(s =>
        s.id === stageId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s,
      ),
    };
    persist(next);
  }, [all, examId, persist]);

  const deleteStage = useCallback((stageId: string) => {
    const next = {
      ...all,
      [examId]: (all[examId] ?? []).filter(s => s.id !== stageId),
    };
    persist(next);
  }, [all, examId, persist]);

  const toggleVisibility = useCallback((stageId: string) => {
    const next = {
      ...all,
      [examId]: (all[examId] ?? []).map(s =>
        s.id === stageId ? { ...s, isVisible: !s.isVisible, updatedAt: new Date().toISOString() } : s,
      ),
    };
    persist(next);
  }, [all, examId, persist]);

  const reorder = useCallback((stageId: string, direction: 'up' | 'down') => {
    const sorted = [...(all[examId] ?? [])].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(s => s.id === stageId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    const reordered = sorted.map((s, i) => {
      if (i === idx)     return { ...b, order: a.order };
      if (i === swapIdx) return { ...a, order: b.order };
      return s;
    });
    persist({ ...all, [examId]: reordered });
  }, [all, examId, persist]);

  return {
    stages,
    addStage,
    updateStage,
    deleteStage,
    toggleVisibility,
    reorder,
    // Derived helpers (pre-computed)
    nextStage: getNextStage(stages),
    visibleStages: getVisibleStages(stages),
  };
}

// ─── Cross-exam reader (calendar, notifications) ──────────────────────────────

/**
 * Returns ALL stages across ALL exams, flat-sorted by date.
 * Used by: StudentCalendar, ExamNotifications
 */
export function useAllExamStages() {
  const [all, setAll] = useState<Record<string, ExamStageItem[]>>(loadAll);

  useEffect(() => {
    return attachSyncListeners(setAll);
  }, []);

  const allStages = Object.values(all)
    .flat()
    .filter(s => s.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  return { all, allStages };
}
