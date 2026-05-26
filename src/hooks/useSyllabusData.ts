/**
 * useSyllabusData
 * ─────────────────────────────────────────────────────────────────────────────
 * Reactive syllabus data hook.
 *
 * Priority:
 *   1. SuperAdmin-saved data in localStorage (key: 'syllabusData_v1')
 *   2. Static allSyllabusData (bundled fallback)
 *
 * Sync strategy (same as useExamStages — 3 layers):
 *   1. CustomEvent('syllabus_data_updated') — same-tab SPA updates
 *   2. window 'storage' event — cross-tab localStorage updates
 *   3. BroadcastChannel('syllabus_sync') — additional cross-tab/worker channel
 *
 * Usage:
 *   const { getExamConfig, allData } = useSyllabusData();
 *   const examConfig = getExamConfig('sbi-po');
 */

import { useState, useEffect, useCallback } from 'react';
import { allSyllabusData, type ExamSyllabusConfig } from '@/data/syllabusData';

// ─── Constants ────────────────────────────────────────────────────────────────

export const SYLLABUS_STORAGE_KEY = 'syllabusData_v1';
export const SYLLABUS_CUSTOM_EVENT = 'syllabus_data_updated';
export const SYLLABUS_CHANNEL_NAME = 'syllabus_sync';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Load SuperAdmin-saved overrides from localStorage */
export function loadSyllabusStore(): Record<string, ExamSyllabusConfig> {
  try {
    const raw = localStorage.getItem(SYLLABUS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Save SuperAdmin overrides to localStorage and broadcast to all tabs */
export function saveSyllabusStore(data: Record<string, ExamSyllabusConfig>) {
  localStorage.setItem(SYLLABUS_STORAGE_KEY, JSON.stringify(data));

  // Layer 1: same-tab CustomEvent
  try {
    window.dispatchEvent(new CustomEvent(SYLLABUS_CUSTOM_EVENT, { detail: data }));
  } catch { /* ignore */ }

  // Layer 3: BroadcastChannel
  try {
    const ch = new BroadcastChannel(SYLLABUS_CHANNEL_NAME);
    ch.postMessage({ type: 'syllabus_updated', data });
    ch.close();
  } catch { /* not available in all envs */ }
}

/** Merge static fallback with SuperAdmin overrides.
 *  SuperAdmin data wins for any exam that has been saved. */
function buildMergedData(store: Record<string, ExamSyllabusConfig>): Record<string, ExamSyllabusConfig> {
  return { ...allSyllabusData, ...store };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSyllabusData() {
  const [store, setStore] = useState<Record<string, ExamSyllabusConfig>>(loadSyllabusStore);

  // Attach 3-layer sync listeners
  useEffect(() => {
    // Layer 1: CustomEvent (same-tab)
    const onCustom = (e: Event) => {
      const data = (e as CustomEvent<Record<string, ExamSyllabusConfig>>).detail;
      if (data && typeof data === 'object') setStore(data);
    };

    // Layer 2: storage event (cross-tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === SYLLABUS_STORAGE_KEY && e.newValue) {
        try { setStore(JSON.parse(e.newValue)); } catch { /* ignore */ }
      }
    };

    // Layer 3: BroadcastChannel (cross-tab/worker)
    let ch: BroadcastChannel | null = null;
    try {
      ch = new BroadcastChannel(SYLLABUS_CHANNEL_NAME);
      ch.onmessage = (e) => {
        if (e.data?.type === 'syllabus_updated' && e.data.data) {
          setStore(e.data.data);
        }
      };
    } catch { /* not available */ }

    window.addEventListener(SYLLABUS_CUSTOM_EVENT, onCustom);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(SYLLABUS_CUSTOM_EVENT, onCustom);
      window.removeEventListener('storage', onStorage);
      ch?.close();
    };
  }, []);

  /** Get merged data (static fallback + SuperAdmin overrides) */
  const allData = buildMergedData(store);

  /** Get syllabus config for a specific exam — SuperAdmin override wins */
  const getExamConfig = useCallback(
    (examId: string): ExamSyllabusConfig | undefined => {
      return store[examId] ?? allSyllabusData[examId];
    },
    [store]
  );

  return { allData, store, getExamConfig };
}

/** Non-hook version for use outside React (e.g., utility functions) */
export function getExamSyllabusLive(examId: string): ExamSyllabusConfig | undefined {
  const store = loadSyllabusStore();
  return store[examId] ?? allSyllabusData[examId];
}
