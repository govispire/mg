// ── Ads Store — localStorage-backed ad banner management ──────────────────────

export type AdType = 'exam' | 'promotional' | 'announcement' | 'course';

export interface AdBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  imageDataUrl: string;      // base64 full-HD cropped image
  imagePosition: 'left' | 'right' | 'center' | 'full'; // How image is placed
  bgColor: string;           // fallback gradient if no image
  adType: AdType;            // 'exam' = 10s, others = 5s
  isActive: boolean;
  priority: number;          // lower = shown first
  startDate: string;         // YYYY-MM-DD
  endDate: string;           // YYYY-MM-DD
  targetCategory: string;    // '' = all, 'banking' | 'ssc' | etc
  clicks: number;
  impressions: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'superadmin_ad_banners';

export const getAdBanners = (): AdBanner[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveAdBanners = (banners: AdBanner[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
  // Broadcast to other tabs/components
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
};

/** Get active ads for student display, filtered by date & category */
export const getActiveAds = (category = ''): AdBanner[] => {
  const now = new Date().toISOString().split('T')[0];
  return getAdBanners()
    .filter(ad =>
      ad.isActive &&
      ad.startDate <= now &&
      ad.endDate >= now &&
      (ad.targetCategory === '' || ad.targetCategory === category || category === '')
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
