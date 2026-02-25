import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AuthModal from '@/components/auth/AuthModal';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Newspaper,
  Target,
  Zap,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   SLIDES — 6 tabs mapped to real app screenshots
───────────────────────────────────────────── */
const SLIDES = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    image: '/screenshots/app-dashboard.png',
    caption: 'Track your progress, rankings & study streak at a glance',
    accentColor: '#818cf8',
    glowColor: 'rgba(129,140,248,0.35)',
  },
  {
    id: 'mentorship',
    label: 'Mentorship',
    icon: Users,
    image: '/screenshots/app-mentorship.png',
    caption: '1-on-1 sessions with toppers & domain experts',
    accentColor: '#34d399',
    glowColor: 'rgba(52,211,153,0.30)',
  },
  {
    id: 'test',
    label: 'Test',
    icon: ClipboardList,
    image: '/screenshots/app-tests.png',
    caption: 'SBI PO, IBPS PO, RBI Grade B & 120+ live mock tests',
    accentColor: '#fbbf24',
    glowColor: 'rgba(251,191,36,0.30)',
  },
  {
    id: 'current-affairs',
    label: 'Current Affairs',
    icon: Newspaper,
    image: '/screenshots/app-current-affairs.png',
    caption: 'Daily news digest with high-priority exam tags',
    accentColor: '#f472b6',
    glowColor: 'rgba(244,114,182,0.30)',
  },
  {
    id: 'exam-tracker',
    label: 'Exam Tracker',
    icon: Target,
    image: '/screenshots/app-exam-tracker.png',
    caption: 'Monitor every stage — Prelims, Mains, Interview, Final',
    accentColor: '#2dd4bf',
    glowColor: 'rgba(45,212,191,0.28)',
  },
  {
    id: 'daily-free-quiz',
    label: 'Daily Free Quiz',
    icon: Zap,
    image: '/screenshots/app-daily-quiz.png',
    caption: 'Free daily quizzes — practice without signing up',
    accentColor: '#c084fc',
    glowColor: 'rgba(192,132,252,0.32)',
  },
] as const;

type SlideId = typeof SLIDES[number]['id'];

const DURATION = 4000;

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
const Hero = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(Date.now());

  const slide = SLIDES[activeIdx];

  const goTo = useCallback((idx: number) => {
    setActiveIdx(idx);
    setAnimKey(k => k + 1);
    setProgress(0);
    startRef.current = Date.now();
  }, []);

  const goNext = useCallback(() => {
    setActiveIdx(prev => {
      const next = (prev + 1) % SLIDES.length;
      setAnimKey(k => k + 1);
      setProgress(0);
      startRef.current = Date.now();
      return next;
    });
  }, []);

  const goPrev = useCallback(() => {
    setActiveIdx(prev => {
      const next = (prev - 1 + SLIDES.length) % SLIDES.length;
      setAnimKey(k => k + 1);
      setProgress(0);
      startRef.current = Date.now();
      return next;
    });
  }, []);

  // Auto-cycle with smooth progress bar
  useEffect(() => {
    setProgress(0);
    startRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));
      if (elapsed < DURATION) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    timerRef.current = setTimeout(goNext, DURATION);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIdx, goNext]);

  const stats = [
    { value: '50,000+', label: 'Students' },
    { value: '98%', label: 'Success Rate' },
    { value: '500+', label: 'Expert Mentors' },
    { value: '15+', label: 'Exam Categories' },
  ];

  return (
    <section style={{
      background: 'linear-gradient(160deg, #0d1117 0%, #161b22 35%, #1c1545 70%, #0f0c29 100%)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    }}>
      {/* ── Background glow blobs ── */}
      <div style={{
        position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '1100px', height: '800px',
        background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.14) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', right: '-80px', width: '550px', height: '550px',
        background: `radial-gradient(ellipse, ${slide.glowColor} 0%, transparent 65%)`,
        transition: 'background 0.8s ease',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', top: '30%', left: '-60px', width: '380px', height: '380px',
        background: 'radial-gradient(ellipse, rgba(168,85,247,0.09) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '72px 24px 64px', position: 'relative', zIndex: 1 }}>

        {/* ── Badge ── */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '7px 18px', borderRadius: '9999px', fontSize: '13px', fontWeight: 600,
            background: 'rgba(99,102,241,0.12)', color: '#a5b4fc',
            border: '1px solid rgba(99,102,241,0.28)', letterSpacing: '0.015em',
          }}>
            <Zap style={{ width: 13, height: 13 }} />
            India's #1 AI-Powered Exam Prep Platform
          </span>
        </div>

        {/* ── Headline ── */}
        <h1 style={{
          textAlign: 'center', fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 800,
          color: '#f0f6fc', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: '18px',
        }}>
          Your mission to crack{' '}
          <span style={{
            background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 50%, #fb7185 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            competitive exams
          </span>
          {' '}starts here.
        </h1>

        {/* ── Subtitle ── */}
        <p style={{
          textAlign: 'center', color: '#8b949e', fontSize: '1.05rem', lineHeight: 1.7,
          maxWidth: '580px', margin: '0 auto 36px',
        }}>
          Expert mentorship, AI analytics, live tests, daily current affairs and free quizzes —
          everything you need to succeed, in one place.
        </p>

        {/* ── CTA Buttons ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '52px' }}>
          <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
            <DialogTrigger asChild>
              <button
                onClick={() => { setAuthTab('register'); setRegisterOpen(true); }}
                style={{
                  padding: '13px 32px', borderRadius: '8px', fontWeight: 700, fontSize: '15px',
                  cursor: 'pointer', border: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#fff', boxShadow: '0 0 30px rgba(99,102,241,0.5), 0 4px 15px rgba(99,102,241,0.3)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 0 45px rgba(99,102,241,0.65), 0 8px 20px rgba(99,102,241,0.4)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 0 30px rgba(99,102,241,0.5), 0 4px 15px rgba(99,102,241,0.3)'; }}
              >
                Start for Free →
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
              <AuthModal activeTab={authTab} setActiveTab={setAuthTab} onClose={() => setRegisterOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
            <DialogTrigger asChild>
              <button
                onClick={() => { setAuthTab('login'); setLoginOpen(true); }}
                style={{
                  padding: '13px 32px', borderRadius: '8px', fontWeight: 600, fontSize: '15px',
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', color: '#e6edf3',
                  border: '1px solid rgba(255,255,255,0.18)', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.10)'; el.style.borderColor = 'rgba(255,255,255,0.28)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.borderColor = 'rgba(255,255,255,0.18)'; }}
              >
                Sign In
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
              <AuthModal activeTab={authTab} setActiveTab={setAuthTab} onClose={() => setLoginOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap', marginBottom: '56px' }}>
          {stats.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 28px' }} />}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f0f6fc', letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '3px' }}>{s.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            GITHUB-STYLE GLASSY CARD WITH SCREENSHOT SLIDER
        ════════════════════════════════════════════ */}
        <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative' }}>

          {/* Outer glow ring — the "glassy border" effect */}
          <div style={{
            position: 'absolute', inset: '-1px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${slide.accentColor}55 0%, rgba(255,255,255,0.08) 40%, ${slide.accentColor}33 100%)`,
            transition: 'background 0.6s ease',
            zIndex: 0,
          }} />

          {/* Blur bloom behind the card */}
          <div style={{
            position: 'absolute', inset: '-24px',
            borderRadius: '32px',
            background: `radial-gradient(ellipse at 50% 80%, ${slide.glowColor} 0%, transparent 70%)`,
            filter: 'blur(16px)',
            transition: 'background 0.6s ease',
            zIndex: 0,
            pointerEvents: 'none',
          }} />

          {/* Main card */}
          <div style={{
            position: 'relative', zIndex: 1,
            borderRadius: '14px',
            background: 'rgba(13, 17, 23, 0.82)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: `0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.03)`,
            overflow: 'hidden',
          }}>

            {/* ─ macOS Title Bar ─ */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px',
              background: 'rgba(255,255,255,0.025)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
              {/* Traffic-light dots */}
              <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
                {[
                  { c: '#ff5f57', s: '#e0443e' },
                  { c: '#febc2e', s: '#d4a017' },
                  { c: '#28c840', s: '#1aab2a' },
                ].map(({ c, s }) => (
                  <div key={c} style={{
                    width: 13, height: 13, borderRadius: '50%', background: c,
                    boxShadow: `0 0 6px ${s}88`,
                  }} />
                ))}
              </div>

              {/* File tabs */}
              <div style={{ flex: 1, display: 'flex', gap: '2px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {SLIDES.map((s, i) => {
                  const isActive = i === activeIdx;
                  return (
                    <button
                      key={s.id}
                      onClick={() => goTo(i)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '5px 13px', borderRadius: '6px 6px 0 0',
                        fontSize: '11.5px', fontWeight: isActive ? 600 : 400,
                        cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                        background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                        color: isActive ? '#e6edf3' : '#484f58',
                        borderBottom: isActive ? `2px solid ${s.accentColor}` : '2px solid transparent',
                      }}
                    >
                      <s.icon style={{ width: 11, height: 11 }} />
                      {s.label}
                    </button>
                  );
                })}
              </div>

              {/* Counter badge */}
              <span style={{
                fontSize: '11px', color: '#484f58', padding: '2px 8px',
                background: 'rgba(255,255,255,0.04)', borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
                {activeIdx + 1}/{SLIDES.length}
              </span>
            </div>

            {/* ─ Screenshot Panel ─ */}
            <div style={{ position: 'relative', overflow: 'hidden', background: '#f0f2f5', lineHeight: 0 }}>
              <div key={animKey} style={{ animation: 'imgSlideIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards' }}>
                <img
                  src={slide.image}
                  alt={`${slide.label} preview`}
                  style={{
                    display: 'block', width: '100%',
                    maxHeight: '400px', objectFit: 'cover', objectPosition: 'top center',
                  }}
                />
              </div>

              {/* Bottom gradient overlay with caption + controls */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(13,17,23,0.95) 0%, rgba(13,17,23,0.4) 60%, transparent 100%)',
                padding: '40px 20px 18px',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '6px',
                      background: `${slide.accentColor}22`, border: `1px solid ${slide.accentColor}55`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <slide.icon style={{ width: 12, height: 12, color: slide.accentColor }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: slide.accentColor }}>{slide.label}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#8b949e', margin: 0, lineHeight: 1.4 }}>{slide.caption}</p>
                </div>
                {/* Prev / Next */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {([goPrev, goNext] as const).map((fn, i) => {
                    const Icon = i === 0 ? ChevronLeft : ChevronRight;
                    return (
                      <button
                        key={i}
                        onClick={fn}
                        style={{
                          width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
                          background: 'rgba(255,255,255,0.10)', color: '#e6edf3',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backdropFilter: 'blur(8px)', transition: 'background 0.18s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.22)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)'; }}
                      >
                        <Icon style={{ width: 16, height: 16 }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ─ Progress bar ─ */}
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: `linear-gradient(90deg, ${slide.accentColor}, ${slide.accentColor}bb)`,
                boxShadow: `0 0 8px ${slide.accentColor}88`,
                transition: 'width 0.1s linear, background 0.4s ease',
              }} />
            </div>

            {/* ─ Bottom Tab Bar ─ */}
            <div style={{
              padding: '12px 16px 10px',
              display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'wrap',
              background: 'rgba(0,0,0,0.25)',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              {SLIDES.map((s, i) => {
                const isActive = i === activeIdx;
                return (
                  <button
                    key={s.id}
                    onClick={() => goTo(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '7px 14px', borderRadius: '9999px',
                      fontSize: '12.5px', fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                      background: isActive ? `${s.accentColor}20` : 'transparent',
                      color: isActive ? s.accentColor : '#6b7280',
                      outline: isActive ? `1px solid ${s.accentColor}40` : '1px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#c9d1d9'; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
                  >
                    <s.icon style={{ width: 13, height: 13 }} />
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* ─ Dot indicators ─ */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '7px', padding: '8px 0 14px' }}>
              {SLIDES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  title={s.label}
                  style={{
                    width: i === activeIdx ? 22 : 7, height: 7, borderRadius: '9999px',
                    border: 'none', cursor: 'pointer', padding: 0,
                    background: i === activeIdx ? slide.accentColor : 'rgba(255,255,255,0.16)',
                    boxShadow: i === activeIdx ? `0 0 8px ${slide.accentColor}` : 'none',
                    transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Sub-caption ── */}
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#30363d' }}>
          Auto-sliding every 4 seconds · click a tab or arrow to navigate
        </p>

        {/* ── Features checklist ── */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '24px 32px',
          flexWrap: 'wrap', marginTop: '52px',
        }}>
          {[
            'AI-Powered Analytics', 'Expert 1-on-1 Mentorship', 'Live Mock Tests',
            'Daily Current Affairs', 'Exam Countdown Tracker', 'Free Daily Quiz',
          ].map((f, i) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#8b949e', fontSize: '13px' }}>
              <CheckCircle2 style={{ width: 14, height: 14, color: SLIDES[i % SLIDES.length].accentColor, flexShrink: 0 }} />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes imgSlideIn {
          from { opacity: 0; transform: scale(1.02) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
