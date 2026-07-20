/**
 * useAccessControl
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads the exam's accessTier (set by Super Admin) and the student's current
 * subscription (from usePricingStore / localStorage) and returns whether the
 * student can access that exam's tests.
 *
 * Role separation:
 *   Super Admin → sets accessTier ('free' | 'plan' | 'package' | 'both')
 *   Owner       → sets prices for plans and packages
 *   Student     → purchases plans / packages → gets access
 *
 * This hook is real-time: it re-checks on every localStorage change via
 * the storage event + BroadcastChannel so the UI updates instantly when
 * the Owner toggles prices or the student completes a purchase.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ExamAccessTier } from '@/hooks/useExamCatalog';

// ─── Constants ─────────────────────────────────────────────────────────────────

/** LocalStorage keys — must match usePricingStore */
const PRICING_STORE_KEY = 'exament_pricing_store';
const PURCHASE_KEY = (examId: string) => `exam_purchased_${examId}`;

// Category → package IDs mapping (mirrors usePricingStore seed data)
const CATEGORY_TO_PACKAGE: Record<string, string[]> = {
  'banking':  ['pkg-banking'],
  'banking-insurance': ['pkg-banking'],
  'ssc':      ['pkg-ssc'],
  'railway':  ['pkg-railway'],
  'railways': ['pkg-railway'],
  'upsc':     ['pkg-upsc'],
  'tnpsc':    ['pkg-tnpsc'],
};

// Plans that are considered "paid" (i.e., have a subscription)
const PAID_PLAN_IDS = ['smart', 'pro', 'pro-max'];

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AccessResult =
  | { hasAccess: true }
  | { hasAccess: false; reason: 'needs_plan'; planRequired: 'any_paid' }
  | { hasAccess: false; reason: 'needs_package'; category: string }
  | { hasAccess: false; reason: 'needs_plan_or_package'; category: string };

interface StudentState {
  planId: string | null;       // active plan id
  activePackages: string[];    // list of active package ids
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readStudentState(): StudentState {
  try {
    const raw = localStorage.getItem(PRICING_STORE_KEY);
    if (!raw) return { planId: null, activePackages: [] };
    const store = JSON.parse(raw);

    // Current plan — read from studentAccess or mock (free by default)
    const studentAccess = store.studentAccess;
    const planId: string | null = studentAccess?.currentPlanId ?? null;

    // Active packages — read from transactions with type 'package'
    const transactions: any[] = store.transactions ?? [];
    const activePackages: string[] = transactions
      .filter((t: any) => t.status === 'completed')
      .flatMap((t: any) => t.items ?? [])
      .filter((item: any) => item.type === 'package')
      .map((item: any) => item.id);

    return { planId, activePackages };
  } catch {
    return { planId: null, activePackages: [] };
  }
}

function hasPaidPlan(state: StudentState): boolean {
  return PAID_PLAN_IDS.includes(state.planId ?? '');
}

function hasPackageForCategory(state: StudentState, category: string): boolean {
  const pkgIds = CATEGORY_TO_PACKAGE[category.toLowerCase()] ?? [];
  return pkgIds.some(pkgId => state.activePackages.includes(pkgId));
}

function checkAccess(
  accessTier: ExamAccessTier,
  isPurchased: boolean,
  category: string,
  state: StudentState,
): AccessResult {
  // Legacy individual purchase (old handleBuy in ExamDetail) always grants access
  if (isPurchased) return { hasAccess: true };

  switch (accessTier) {
    case 'free':
      return { hasAccess: true };

    case 'plan':
      if (hasPaidPlan(state)) return { hasAccess: true };
      return { hasAccess: false, reason: 'needs_plan', planRequired: 'any_paid' };

    case 'package':
      if (hasPackageForCategory(state, category)) return { hasAccess: true };
      return { hasAccess: false, reason: 'needs_package', category };

    case 'both':
      if (hasPaidPlan(state) || hasPackageForCategory(state, category)) return { hasAccess: true };
      return { hasAccess: false, reason: 'needs_plan_or_package', category };

    default:
      return { hasAccess: true }; // safe default for unknown tiers
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAccessControl(
  examId: string | undefined,
  accessTier: ExamAccessTier,
  category: string | undefined,
): AccessResult {
  const [studentState, setStudentState] = useState<StudentState>(() => readStudentState());
  const [isPurchased, setIsPurchased] = useState<boolean>(() => {
    if (!examId) return false;
    return localStorage.getItem(PURCHASE_KEY(examId)) === 'true';
  });

  const refresh = useCallback(() => {
    setStudentState(readStudentState());
    if (examId) {
      setIsPurchased(localStorage.getItem(PURCHASE_KEY(examId)) === 'true');
    }
  }, [examId]);

  useEffect(() => {
    // Listen for ANY localStorage change (purchases, plan upgrades, etc.)
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === PRICING_STORE_KEY ||
        (examId && e.key === PURCHASE_KEY(examId))
      ) {
        refresh();
      }
    };

    window.addEventListener('storage', handleStorage);

    // Also poll on focus (user returns from checkout tab)
    window.addEventListener('focus', refresh);

    // BroadcastChannel for same-tab updates (checkout → exam detail)
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('pricing_store_sync');
      channel.onmessage = refresh;
    } catch {
      // BroadcastChannel not supported in all envs
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', refresh);
      channel?.close();
    };
  }, [examId, refresh]);

  return checkAccess(accessTier, isPurchased, category ?? '', studentState);
}

// ─── Utility: label helpers for UI ────────────────────────────────────────────

export const ACCESS_TIER_LABELS: Record<ExamAccessTier, string> = {
  free:    'Free',
  plan:    'Subscription Required',
  package: 'Package Required',
  both:    'Plan or Package',
};

export const ACCESS_TIER_COLORS: Record<ExamAccessTier, { bg: string; text: string; border: string }> = {
  free:    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  plan:    { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
  package: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  both:    { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200' },
};
