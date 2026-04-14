// ── Ads Store — localStorage-backed ad banner management ──────────────────────

export type AdType = 'exam' | 'promotional' | 'announcement' | 'course';
export type AdPlacement = '' | 'days_left_panel' | 'dashboard_banner' | 'test_page' | 'popup_modal';
export type TargetScope = 'all' | 'category' | 'exam' | 'student' | 'performance' | 'behavior';
export type DisplayMode = 'days_left_only' | 'ads_only' | 'auto_slide';

export interface TargetConditions {
  quantLt?: number;
  reasoningLt?: number;
  accuracyLt?: number;
  speedLt?: number;
  inactiveDaysGt?: number;
  noTestDaysGt?: number;
  skippedWeakTopics?: boolean;
}

export interface AdBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  imageDataUrl: string;
  imagePosition: 'left' | 'right' | 'center' | 'full';
  bgColor: string;
  adType: AdType;
  placement: AdPlacement;
  isActive: boolean;
  priority: number;
  startDate: string;   // YYYY-MM-DD
  endDate: string;     // YYYY-MM-DD
  clicks: number;
  impressions: number;
  createdAt: string;
  updatedAt: string;

  // ── Targeting Engine (NEW) ──────────────────────────────
  targetScope: TargetScope;          // default: 'all'
  targetCategoryIds: string[];       // e.g. ['banking','ssc']
  targetExamIds: string[];           // e.g. ['ibps-clerk','sbi-po']
  targetEmails: string[];            // specific student emails
  targetConditions: TargetConditions;

  // ── Frequency Control (NEW) ─────────────────────────────
  maxViewsPerDay: number;            // default: 3
  maxPerSession: number;             // default: 1

  // ── Right Panel Settings (NEW) ────────────────────────────
  rightPanelEnabled: boolean;        // default: true
  displayMode: DisplayMode;          // default: 'auto_slide'
  defaultSlide: 'days_left' | 'ad'; // default: 'days_left'

  /** @deprecated use targetScope/targetCategoryIds instead */
  targetCategory?: string;
}

/** Student context passed to matching engine */
export interface StudentContext {
  id?: string;
  email?: string;
  categoryId?: string;   // 'banking' | 'ssc' etc
  examId?: string;       // 'ibps-clerk' | 'sbi-po' etc
  performance?: {
    quant?: number;
    reasoning?: number;
    accuracy?: number;
    speed?: number;
  };
  behavior?: {
    inactiveDays?: number;
    noTestDays?: number;
    skippedWeakTopics?: boolean;
  };
}

const STORAGE_KEY = 'superadmin_ad_banners';

/** Settings stored separately (global) */
const SETTINGS_KEY = 'superadmin_ads_settings';
export interface AdsSettings {
  maxRotationSec: number;     // 15
  defaultCpc: number;         // 5.00
  viewabilityLimit: number;   // 5
  minCtrPct: number;          // 5.00
}
export const DEFAULT_SETTINGS: AdsSettings = {
  maxRotationSec: 15,
  defaultCpc: 5.0,
  viewabilityLimit: 5,
  minCtrPct: 5.0,
};
export const getAdsSettings = (): AdsSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
};
export const saveAdsSettings = (s: AdsSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
};

export const getAdBanners = (): AdBanner[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    // Migrate old ads: fill in missing new fields with defaults
    const parsed: any[] = JSON.parse(raw);
    return parsed.map(ad => ({
      targetScope: 'all',
      targetCategoryIds: [],
      targetExamIds: [],
      targetEmails: [],
      targetConditions: {},
      maxViewsPerDay: 3,
      maxPerSession: 1,
      rightPanelEnabled: true,
      displayMode: 'auto_slide',
      defaultSlide: 'days_left',
      ...ad,
    })) as AdBanner[];
  } catch { return []; }
};

export const saveAdBanners = (banners: AdBanner[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
};

/**
 * Check if an ad matches a given student context.
 * Returns true if the ad is eligible to be shown to this student.
 */
export const matchesStudent = (ad: AdBanner, ctx: StudentContext): boolean => {
  const scope = ad.targetScope ?? 'all';

  // Legacy fallback
  if (scope === 'all') {
    if (ad.targetCategory && ctx.categoryId && ad.targetCategory !== ctx.categoryId) return false;
    return true;
  }
  if (scope === 'category') {
    if (!ad.targetCategoryIds.length) return true;
    return !!ctx.categoryId && ad.targetCategoryIds.includes(ctx.categoryId);
  }
  if (scope === 'exam') {
    if (!ad.targetExamIds.length) return true;
    return !!ctx.examId && ad.targetExamIds.includes(ctx.examId);
  }
  if (scope === 'student') {
    if (!ad.targetEmails.length) return true;
    return !!ctx.email && ad.targetEmails.includes(ctx.email.toLowerCase().trim());
  }
  if (scope === 'performance') {
    const c = ad.targetConditions;
    const p = ctx.performance ?? {};
    if (c.quantLt !== undefined && (p.quant ?? 100) >= c.quantLt) return false;
    if (c.reasoningLt !== undefined && (p.reasoning ?? 100) >= c.reasoningLt) return false;
    if (c.accuracyLt !== undefined && (p.accuracy ?? 100) >= c.accuracyLt) return false;
    if (c.speedLt !== undefined && (p.speed ?? 100) >= c.speedLt) return false;
    return true;
  }
  if (scope === 'behavior') {
    const c = ad.targetConditions;
    const b = ctx.behavior ?? {};
    if (c.inactiveDaysGt !== undefined && (b.inactiveDays ?? 0) <= c.inactiveDaysGt) return false;
    if (c.noTestDaysGt !== undefined && (b.noTestDays ?? 0) <= c.noTestDaysGt) return false;
    if (c.skippedWeakTopics && !b.skippedWeakTopics) return false;
    return true;
  }
  return true;
};

/** Get active ads for student display, filtered by date, placement & student context */
export const getActiveAds = (
  ctx: StudentContext | string = '',
  placement: AdPlacement | 'any' = 'any',
): AdBanner[] => {
  const now = new Date().toISOString().split('T')[0];
  // Backward-compat: if ctx is a string (old category-only call), wrap it
  const context: StudentContext = typeof ctx === 'string'
    ? { categoryId: ctx || undefined }
    : ctx;

  return getAdBanners()
    .filter(ad =>
      ad.isActive &&
      ad.startDate <= now &&
      ad.endDate >= now &&
      (placement === 'any' || ad.placement === placement) &&
      matchesStudent(ad, context)
    )
    .sort((a, b) => a.priority - b.priority);
};

export const recordImpression = (id: string): void => {
  const banners = getAdBanners();
  const updated = banners.map(b =>
    b.id === id ? { ...b, impressions: b.impressions + 1 } : b
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const recordClick = (id: string): void => {
  const banners = getAdBanners();
  const updated = banners.map(b =>
    b.id === id ? { ...b, clicks: b.clicks + 1 } : b
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

/** Slide duration in ms based on ad type */
export const getSlideDuration = (adType: AdType): number => {
  return adType === 'exam' ? 10000 : 5000;
};
