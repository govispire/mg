import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { getActiveAds, recordImpression, recordClick, type AdBanner } from '@/data/adsStore';

interface Props {
  examCategory: string;
}

const DashboardBannerStrip: React.FC<Props> = ({ examCategory }) => {
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackedRef = useRef<Set<string>>(new Set());

  const loadAds = useCallback(() => {
    setAds(getActiveAds({ categoryId: examCategory.toLowerCase() || undefined }, 'dashboard_banner'));
  }, [examCategory]);

  useEffect(() => {
    loadAds();
    const h = (e: StorageEvent) => { if (e.key === 'superadmin_ad_banners') loadAds(); };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, [loadAds]);

  // Bounds guard — if ads drop, reset index
  useEffect(() => {
    if (idx >= ads.length && ads.length > 0) setIdx(0);
  }, [ads.length]);

  // Auto-advance every 6s
  useEffect(() => {
    if (ads.length <= 1) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIdx(p => (p + 1) % ads.length), 6000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx, ads.length]);

  // Impression tracking
  useEffect(() => {
    const ad = ads[idx];
    if (ad && !trackedRef.current.has(ad.id)) {
      trackedRef.current.add(ad.id);
      recordImpression(ad.id);
    }
  }, [idx, ads]);

  if (ads.length === 0) return null;

  const ad = ads[idx];
  const handleClick = () => {
    recordClick(ad.id);
    if (ad.ctaUrl) window.open(ad.ctaUrl.startsWith('http') ? ad.ctaUrl : window.location.origin + ad.ctaUrl, '_blank');
  };

  return (
    <div className="mb-4 sm:mb-6 group select-none">
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-md"
        style={{ aspectRatio: '1200/300', background: ad.bgColor || 'linear-gradient(135deg,#1e40af,#10b981)' }}
      >
        {/* Image */}
        {ad.imageDataUrl && (
          <img
            src={ad.imageDataUrl}
            alt={ad.title || 'Banner'}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        )}

        {/* TEXT MODE overlay */}
        {ad.title && (
          <>
            {ad.imageDataUrl && <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />}
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 z-10">
              <p className="text-white font-black text-lg sm:text-2xl leading-tight drop-shadow-md max-w-xl line-clamp-2"
                style={{ fontFamily: "'Outfit', sans-serif" }}>
                {ad.title}
              </p>
              {ad.subtitle && (
                <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-md line-clamp-1">{ad.subtitle}</p>
              )}
              {ad.ctaText && (
                <button type="button" onClick={handleClick}
                  className="mt-3 inline-flex items-center gap-1.5 self-start bg-white text-slate-900 font-bold text-xs sm:text-sm px-4 py-2 rounded-full shadow hover:scale-105 transition-transform">
                  {ad.ctaText} <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          </>
        )}

        {/* IMAGE-ONLY MODE: just CTA if set */}
        {!ad.title && ad.ctaText && (
          <>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <div className="absolute bottom-3 right-4 z-20">
              <button type="button" onClick={handleClick}
                className="inline-flex items-center gap-1.5 bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-full shadow hover:scale-105 transition-transform">
                {ad.ctaText} <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </>
        )}

        {/* Navigation — only when multiple ads */}
        {ads.length > 1 && (
          <>
            <button type="button" onClick={() => setIdx(p => (p - 1 + ads.length) % ads.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setIdx(p => (p + 1) % ads.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="h-4 w-4" />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
              {ads.map((_, i) => (
                <button key={i} type="button" onClick={() => setIdx(i)}
                  className={`rounded-full transition-all duration-300 ${i === idx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardBannerStrip;
