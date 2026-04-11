import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import {
  AdBanner,
  getActiveAds,
  recordClick,
  recordImpression,
  getSlideDuration,
} from '@/data/adsStore';

interface AdsBannerProps {
  category?: string;
}

export const AdsBanner: React.FC<AdsBannerProps> = ({ category = '' }) => {
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const impressionTracked = useRef<Set<string>>(new Set());

  const loadAds = useCallback(() => {
    const active = getActiveAds(category);
    setAds(active);
    setCurrent(0);
    setProgress(0);
  }, [category]);

  useEffect(() => {
    loadAds();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'superadmin_ad_banners') loadAds();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadAds]);

  // Track impression when ad is shown
  useEffect(() => {
    if (ads[current] && !impressionTracked.current.has(ads[current].id)) {
      impressionTracked.current.add(ads[current].id);
      recordImpression(ads[current].id);
    }
  }, [ads, current]);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    setProgress(0);
  }, []);

  const goNext = useCallback(() => {
    setProgress(0);
    setCurrent(prev => (prev + 1) % ads.length);
  }, [ads.length]);

  const goPrev = useCallback(() => {
    setProgress(0);
    setCurrent(prev => (prev - 1 + ads.length) % ads.length);
  }, [ads.length]);

  // Auto-advance with progress tracking
  useEffect(() => {
    if (ads.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }

    const duration = ads[current] ? getSlideDuration(ads[current].adType) : 5000;
    const tickMs = 50;
    const steps = duration / tickMs;

    setProgress(0);

    progressRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / steps);
        return next >= 100 ? 100 : next;
      });
    }, tickMs);

    timerRef.current = setTimeout(() => {
      goNext();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [current, ads, isPaused, goNext]);

  const handleCtaClick = (ad: AdBanner) => {
    recordClick(ad.id);
    if (ad.ctaUrl) {
      if (ad.ctaUrl.startsWith('/')) {
        window.location.href = ad.ctaUrl;
      } else {
        window.open(ad.ctaUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  if (ads.length === 0) return null;

  const ad = ads[current];
  const isExamAd = ad.adType === 'exam';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 group select-none">
      {/* ── Slide container ── */}
      <div className="relative">
        {ads.map((a, idx) => (
          <div
            key={a.id}
            className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? 'opacity-100 relative' : 'opacity-0 pointer-events-none'}`}
          >
            {/* Background */}
            <div
              className="w-full min-h-[140px] sm:min-h-[180px] flex items-center relative overflow-hidden"
              style={{
                background: a.imageDataUrl
                  ? undefined
                  : a.bgColor || 'linear-gradient(135deg,#1e40af,#10b981)',
              }}
            >
              {/* Full-bg image */}
              {a.imageDataUrl && a.imagePosition === 'full' && (
                <img
                  src={a.imageDataUrl}
                  alt={a.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              )}
              {/* Overlay for full-bg */}
              {a.imageDataUrl && a.imagePosition === 'full' && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              )}

              {/* Side image — right */}
              {a.imageDataUrl && a.imagePosition === 'right' && (
                <div className="absolute right-0 top-0 h-full w-2/5 overflow-hidden">
                  <img src={a.imageDataUrl} alt={a.title} className="h-full w-full object-cover" draggable={false} />
                  <div className="absolute inset-0 bg-gradient-to-r from-current to-transparent" style={{ color: 'inherit' }} />
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 flex items-center gap-6 px-6 py-5 w-full">
                {/* Left image */}
                {a.imageDataUrl && a.imagePosition === 'left' && (
                  <img
                    src={a.imageDataUrl}
                    alt={a.title}
                    className="h-24 w-24 object-contain rounded-xl shadow-lg flex-shrink-0 hidden sm:block"
                    draggable={false}
                  />
                )}

                {/* Text */}
                <div className="flex-1 min-w-0">
                  {/* Ad type badge */}
                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2 ${
                    isExamAd
                      ? 'bg-white/20 text-white'
                      : 'bg-white/20 text-white'
                  }`}>
                    {a.adType === 'exam' ? '🎯 Exam Update' :
                     a.adType === 'course' ? '📚 Course Offer' :
                     a.adType === 'announcement' ? '📢 Announcement' : '🔥 Special Offer'}
                  </span>

                  <h3 className="font-black text-white text-xl sm:text-2xl leading-tight mb-1 drop-shadow-sm">
                    {a.title}
                  </h3>
                  {a.subtitle && (
                    <p className="text-white/80 text-sm leading-snug mb-3 max-w-xl line-clamp-2">
                      {a.subtitle}
                    </p>
                  )}
                  {a.ctaText && (
                    <button
                      onClick={() => handleCtaClick(a)}
                      className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold text-xs px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      {a.ctaText}
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Center image */}
                {a.imageDataUrl && a.imagePosition === 'center' && (
                  <img
                    src={a.imageDataUrl}
                    alt={a.title}
                    className="h-28 w-28 sm:h-36 sm:w-36 object-contain rounded-2xl shadow-xl flex-shrink-0 hidden sm:block"
                    draggable={false}
                  />
                )}
              </div>

              {/* Right image overlay */}
              {a.imageDataUrl && a.imagePosition === 'right' && (
                <div className="absolute right-0 top-0 h-full w-2/5 overflow-hidden hidden sm:block">
                  <img src={a.imageDataUrl} alt={a.title} className="h-full w-full object-cover" draggable={false} />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Controls (only if multiple ads) ── */}
      {ads.length > 1 && (
        <>
          {/* Prev / Next arrows */}
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Pause/play */}
          <button
            onClick={() => setIsPaused(p => !p)}
            className="absolute top-2 right-2 w-7 h-7 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {ads.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === current
                    ? 'w-5 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-20">
            <div
              className="h-full bg-white/70 transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      )}

      {/* Duration badge */}
      <div className="absolute top-2 left-2 z-20">
        <span className="text-[9px] font-bold text-white/60 bg-black/20 px-1.5 py-0.5 rounded-full">
          {ad.adType === 'exam' ? '10s' : '5s'}
        </span>
      </div>
    </div>
  );
};

export default AdsBanner;
