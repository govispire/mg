import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useAuth } from '@/app/providers';
import {
  ChevronLeft, ChevronRight, Volume2, Check, RotateCcw,
  Flame, Trophy, ArrowRight, BookOpen, Clock, ExternalLink,
} from 'lucide-react';

// ─── Theme-Aware Image Map (mirrors StudentVocabulary.tsx) ──────────────────
const THEME_IMAGES: Record<string, string> = {
  nature:     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop&q=80',
  business:   'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&auto=format&fit=crop&q=80',
  emotion:    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=900&auto=format&fit=crop&q=80',
  science:    'https://images.unsplash.com/photo-1532094349884-543559c17b64?w=900&auto=format&fit=crop&q=80',
  history:    'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=900&auto=format&fit=crop&q=80',
  government: 'https://images.unsplash.com/photo-1529154166925-574a0236a4f4?w=900&auto=format&fit=crop&q=80',
  economy:    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&auto=format&fit=crop&q=80',
  leadership: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&auto=format&fit=crop&q=80',
  banking:    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&auto=format&fit=crop&q=80',
  ssc:        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop&q=80',
  upsc:       'https://images.unsplash.com/photo-1529154166925-574a0236a4f4?w=900&auto=format&fit=crop&q=80',
  railway:    'https://images.unsplash.com/photo-1474487548417-781cb6d646b3?w=900&auto=format&fit=crop&q=80',
  defence:    'https://images.unsplash.com/photo-1530988836461-f46b6d8e4e3c?w=900&auto=format&fit=crop&q=80',
  default:    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&auto=format&fit=crop&q=80',
};

// ─── Theme Engine (mirrors StudentVocabulary.tsx) ───────────────────────────
interface HeroTheme {
  bg: string; border: string; shadow: string;
  glow1: string; glow2: string;
  badgeBg: string; badgeBorder: string; badgeText: string;
  audioBg: string; audioBorder: string; audioText: string;
  wordColor: string; wordGlow: string;
  textPrimary: string; textSecondary: string; pronColor: string;
  synBg: string; synBorder: string; synColor: string;
  antBg: string; antBorder: string; antColor: string;
  revisionBorder: string; revisionText: string;
  imageKey: string;
}

const HERO_THEMES: Record<string, HeroTheme> = {
  nature: {
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 55%, #ecfdf5 100%)',
    border: '1px solid rgba(34,197,94,0.2)', shadow: '0 4px 32px rgba(34,197,94,0.12)',
    glow1: 'radial-gradient(circle, rgba(34,197,94,0.18), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)',
    badgeBg: 'rgba(16,185,129,0.12)', badgeBorder: 'rgba(16,185,129,0.3)', badgeText: '#059669',
    audioBg: 'rgba(16,185,129,0.12)', audioBorder: 'rgba(16,185,129,0.3)', audioText: '#059669',
    wordColor: '#064e3b', wordGlow: '0 1px 8px rgba(6,78,59,0.12)',
    textPrimary: '#065f46', textSecondary: '#6b7280', pronColor: '#9ca3af',
    synBg: 'rgba(16,185,129,0.1)', synBorder: 'rgba(16,185,129,0.25)', synColor: '#047857',
    antBg: 'rgba(251,146,60,0.1)', antBorder: 'rgba(251,146,60,0.25)', antColor: '#b45309',
    revisionBorder: 'rgba(217,119,6,0.4)', revisionText: '#b45309', imageKey: 'nature',
  },
  business: {
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 55%, #eff6ff 100%)',
    border: '1px solid rgba(96,165,250,0.2)', shadow: '0 4px 32px rgba(59,130,246,0.1)',
    glow1: 'radial-gradient(circle, rgba(96,165,250,0.2), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)',
    badgeBg: 'rgba(59,130,246,0.1)', badgeBorder: 'rgba(59,130,246,0.25)', badgeText: '#1d4ed8',
    audioBg: 'rgba(59,130,246,0.1)', audioBorder: 'rgba(59,130,246,0.25)', audioText: '#1d4ed8',
    wordColor: '#1e3a5f', wordGlow: '0 1px 8px rgba(30,58,95,0.12)',
    textPrimary: '#1e40af', textSecondary: '#64748b', pronColor: '#94a3b8',
    synBg: 'rgba(59,130,246,0.1)', synBorder: 'rgba(59,130,246,0.22)', synColor: '#1d4ed8',
    antBg: 'rgba(239,68,68,0.08)', antBorder: 'rgba(239,68,68,0.2)', antColor: '#b91c1c',
    revisionBorder: 'rgba(217,119,6,0.35)', revisionText: '#92400e', imageKey: 'business',
  },
  emotion: {
    bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 55%, #fff7f7 100%)',
    border: '1px solid rgba(251,113,133,0.2)', shadow: '0 4px 32px rgba(244,63,94,0.1)',
    glow1: 'radial-gradient(circle, rgba(251,113,133,0.2), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(236,72,153,0.12), transparent 70%)',
    badgeBg: 'rgba(236,72,153,0.1)', badgeBorder: 'rgba(236,72,153,0.25)', badgeText: '#be185d',
    audioBg: 'rgba(236,72,153,0.1)', audioBorder: 'rgba(236,72,153,0.25)', audioText: '#be185d',
    wordColor: '#831843', wordGlow: '0 1px 8px rgba(131,24,67,0.12)',
    textPrimary: '#9d174d', textSecondary: '#6b7280', pronColor: '#9ca3af',
    synBg: 'rgba(236,72,153,0.1)', synBorder: 'rgba(236,72,153,0.22)', synColor: '#be185d',
    antBg: 'rgba(251,146,60,0.1)', antBorder: 'rgba(251,146,60,0.22)', antColor: '#b45309',
    revisionBorder: 'rgba(217,119,6,0.35)', revisionText: '#92400e', imageKey: 'emotion',
  },
  science: {
    bg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 55%, #ecfeff 100%)',
    border: '1px solid rgba(34,211,238,0.2)', shadow: '0 4px 32px rgba(6,182,212,0.1)',
    glow1: 'radial-gradient(circle, rgba(34,211,238,0.2), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)',
    badgeBg: 'rgba(6,182,212,0.1)', badgeBorder: 'rgba(6,182,212,0.25)', badgeText: '#0e7490',
    audioBg: 'rgba(6,182,212,0.1)', audioBorder: 'rgba(6,182,212,0.25)', audioText: '#0e7490',
    wordColor: '#0c4a6e', wordGlow: '0 1px 8px rgba(12,74,110,0.12)',
    textPrimary: '#0e7490', textSecondary: '#64748b', pronColor: '#94a3b8',
    synBg: 'rgba(6,182,212,0.1)', synBorder: 'rgba(6,182,212,0.22)', synColor: '#0e7490',
    antBg: 'rgba(239,68,68,0.08)', antBorder: 'rgba(239,68,68,0.2)', antColor: '#b91c1c',
    revisionBorder: 'rgba(6,182,212,0.4)', revisionText: '#0e7490', imageKey: 'science',
  },
  history: {
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 55%, #fffbeb 100%)',
    border: '1px solid rgba(217,119,6,0.2)', shadow: '0 4px 32px rgba(180,83,9,0.1)',
    glow1: 'radial-gradient(circle, rgba(245,158,11,0.2), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(180,83,9,0.12), transparent 70%)',
    badgeBg: 'rgba(217,119,6,0.1)', badgeBorder: 'rgba(217,119,6,0.25)', badgeText: '#92400e',
    audioBg: 'rgba(217,119,6,0.1)', audioBorder: 'rgba(217,119,6,0.25)', audioText: '#92400e',
    wordColor: '#78350f', wordGlow: '0 1px 8px rgba(120,53,15,0.12)',
    textPrimary: '#92400e', textSecondary: '#6b7280', pronColor: '#9ca3af',
    synBg: 'rgba(217,119,6,0.1)', synBorder: 'rgba(217,119,6,0.22)', synColor: '#92400e',
    antBg: 'rgba(107,33,168,0.08)', antBorder: 'rgba(107,33,168,0.2)', antColor: '#6b21a8',
    revisionBorder: 'rgba(217,119,6,0.4)', revisionText: '#92400e', imageKey: 'history',
  },
  government: {
    bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 55%, #f5f3ff 100%)',
    border: '1px solid rgba(139,92,246,0.2)', shadow: '0 4px 32px rgba(124,58,237,0.1)',
    glow1: 'radial-gradient(circle, rgba(167,139,250,0.2), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)',
    badgeBg: 'rgba(124,58,237,0.1)', badgeBorder: 'rgba(124,58,237,0.25)', badgeText: '#6d28d9',
    audioBg: 'rgba(124,58,237,0.1)', audioBorder: 'rgba(124,58,237,0.25)', audioText: '#6d28d9',
    wordColor: '#3730a3', wordGlow: '0 1px 8px rgba(55,48,163,0.12)',
    textPrimary: '#4338ca', textSecondary: '#64748b', pronColor: '#94a3b8',
    synBg: 'rgba(124,58,237,0.1)', synBorder: 'rgba(124,58,237,0.22)', synColor: '#6d28d9',
    antBg: 'rgba(239,68,68,0.08)', antBorder: 'rgba(239,68,68,0.2)', antColor: '#b91c1c',
    revisionBorder: 'rgba(217,119,6,0.35)', revisionText: '#92400e', imageKey: 'government',
  },
  economy: {
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 55%, #ecfdf5 100%)',
    border: '1px solid rgba(16,185,129,0.2)', shadow: '0 4px 32px rgba(5,150,105,0.1)',
    glow1: 'radial-gradient(circle, rgba(52,211,153,0.2), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)',
    badgeBg: 'rgba(5,150,105,0.1)', badgeBorder: 'rgba(5,150,105,0.25)', badgeText: '#047857',
    audioBg: 'rgba(5,150,105,0.1)', audioBorder: 'rgba(5,150,105,0.25)', audioText: '#047857',
    wordColor: '#064e3b', wordGlow: '0 1px 8px rgba(6,78,59,0.12)',
    textPrimary: '#047857', textSecondary: '#6b7280', pronColor: '#9ca3af',
    synBg: 'rgba(5,150,105,0.1)', synBorder: 'rgba(5,150,105,0.22)', synColor: '#047857',
    antBg: 'rgba(234,179,8,0.1)', antBorder: 'rgba(234,179,8,0.22)', antColor: '#92400e',
    revisionBorder: 'rgba(217,119,6,0.35)', revisionText: '#92400e', imageKey: 'economy',
  },
  leadership: {
    bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 55%, #f1f5f9 100%)',
    border: '1px solid rgba(100,116,139,0.2)', shadow: '0 4px 32px rgba(71,85,105,0.1)',
    glow1: 'radial-gradient(circle, rgba(148,163,184,0.2), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)',
    badgeBg: 'rgba(71,85,105,0.1)', badgeBorder: 'rgba(71,85,105,0.22)', badgeText: '#334155',
    audioBg: 'rgba(71,85,105,0.1)', audioBorder: 'rgba(71,85,105,0.22)', audioText: '#334155',
    wordColor: '#0f172a', wordGlow: '0 1px 8px rgba(15,23,42,0.1)',
    textPrimary: '#1e293b', textSecondary: '#64748b', pronColor: '#94a3b8',
    synBg: 'rgba(71,85,105,0.1)', synBorder: 'rgba(71,85,105,0.2)', synColor: '#334155',
    antBg: 'rgba(239,68,68,0.08)', antBorder: 'rgba(239,68,68,0.18)', antColor: '#b91c1c',
    revisionBorder: 'rgba(217,119,6,0.35)', revisionText: '#92400e', imageKey: 'leadership',
  },
};

const detectThemeKey = (word: any): string => {
  const tags = (word?.examTags || []).map((t: string) => t.toLowerCase());
  const combined = `${(word?.meaning || '')} ${(word?.word || '')} ${(word?.category || '')}`.toLowerCase();
  if (tags.includes('upsc') || tags.includes('government')) return 'government';
  if (tags.includes('banking') || tags.includes('economy') || tags.includes('finance')) return 'economy';
  if (tags.includes('ssc')) return 'business';
  if (tags.includes('railway') || tags.includes('defence')) return 'leadership';
  const KEYWORD_MAP: [string[], string][] = [
    [['nature','plant','grow','forest','tree','green','earth','abundant','lush','bloom','river','valley','mountain','wildlife','flora','fauna','ecosystem'], 'nature'],
    [['feel','emotion','love','fear','joy','sad','anger','fragile','warm','compassion','empathy','grief','passion','sorrow','hope','happiness','anxiety'], 'emotion'],
    [['science','technology','data','research','experiment','digital','innovation','complex','analysis','physics','chemistry','biology','tech','compute','algorithm'], 'science'],
    [['history','ancient','tradition','heritage','culture','past','era','century','classical','medieval','civilization','empire','dynasty','historical','mythology'], 'history'],
    [['market','trade','profit','wealth','business','finance','stock','invest','economic','revenue','gdp','commerce','monetary','fiscal','inflation'], 'economy'],
    [['government','policy','law','parliament','constitution','democracy','election','political','governance','legislation','sovereignty','diplomatic'], 'government'],
    [['lead','leader','strength','power','summit','command','authority','resilient','overcome','conquer','bold','courage','inspire','motivate','persevere','discipline'], 'leadership'],
    [['strategy','plan','business','corporate','company','executive','manage','negotiate','acumen','shrewd','decision','judgement','analytical'], 'business'],
  ];
  for (const [keywords, themeKey] of KEYWORD_MAP) {
    if (keywords.some(k => combined.includes(k))) return themeKey;
  }
  const fallbacks = ['business', 'government', 'science', 'leadership', 'economy', 'nature'];
  return fallbacks[(word?.word?.length || 0) % fallbacks.length];
};

const getWordTheme = (word: any): HeroTheme => {
  const key = detectThemeKey(word);
  return HERO_THEMES[key] || HERO_THEMES.business;
};

const getContextualImage = (word: any): string => {
  if (word?.imageUrl) return word.imageUrl;
  const tags = (word?.examTags || []).map((t: string) => t.toLowerCase());
  for (const tag of tags) {
    if (THEME_IMAGES[tag]) return THEME_IMAGES[tag];
  }
  const themeKey = detectThemeKey(word);
  return THEME_IMAGES[themeKey] || THEME_IMAGES.default;
};

// ─── Dashboard Vocabulary Section ───────────────────────────────────────────
const DashboardVocabularySection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const vocab = useVocabulary(user?.id || 'student_1') as any;
  const { activeWords, stats, vocabStreak, markWordSelfAssessment } = vocab;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const [assessed, setAssessed] = useState<'i_know' | 'need_revision' | null>(null);

  const dailyWords = (activeWords || []).slice(0, 10);
  const word = dailyWords[currentIndex];

  useEffect(() => { setImgFailed(false); setAssessed(null); }, [currentIndex]);

  // Revision alert: words due today
  const today = new Date().toISOString().split('T')[0];
  const revisionQueue = (vocab?.revisionQueue || []);
  const dueToday = revisionQueue.filter((r: any) => r.nextRevisionDate <= today).length;

  if (!word) {
    // Empty / loading state
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
        <BookOpen className="h-10 w-10 mx-auto mb-3 text-indigo-300" />
        <h3 className="font-bold text-slate-700 mb-1">No vocabulary words yet</h3>
        <p className="text-sm text-slate-400 mb-4">Start your vocabulary journey from English Hub</p>
        <Link
          to="/student/vocabulary"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          <BookOpen className="h-4 w-4" /> Go to Vocabulary
        </Link>
      </div>
    );
  }

  const theme = getWordTheme(word);
  const imgSrc = !imgFailed ? getContextualImage(word) : THEME_IMAGES.default;

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((word as any).audioUrl) {
      new Audio((word as any).audioUrl).play().catch(() => {});
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(word.word));
    }
  };

  return (
    <div className="space-y-3">
      {/* ── Section header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 leading-none">Daily Vocabulary</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Word of the Day · Learn & track progress</p>
          </div>
        </div>
        <Link
          to="/student/vocabulary"
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg transition-all hover:bg-indigo-100"
        >
          View All <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* ── Revision alert (matches vocabulary page) ── */}
      {dueToday > 0 && (
        <button
          onClick={() => navigate('/student/vocabulary')}
          className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-3 hover:bg-amber-100 transition-all group text-left"
        >
          <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">You have {dueToday} words due for revision today!</p>
            <p className="text-xs text-amber-600 mt-0.5">Regular revision is the key to long-term retention.</p>
          </div>
          <span className="text-xs font-bold text-amber-700 flex items-center gap-1 shrink-0">
            Review Now <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>
      )}

      {/* ── Hero Word Card (matches HeroWordOfDay from vocabulary page) ── */}
      <div
        onClick={() => navigate('/student/vocabulary')}
        className="relative w-full rounded-3xl overflow-hidden cursor-pointer group"
        style={{ background: theme.bg, border: theme.border, boxShadow: theme.shadow, minHeight: '300px' }}
      >
        {/* Ambient glow orbs */}
        <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: theme.glow1, filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: theme.glow2, filter: 'blur(55px)' }} />

        {/* Right contextual image */}
        <div
          className="absolute top-0 right-0 bottom-0 w-[46%] pointer-events-none overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 100%)',
          }}
        >
          <img
            src={imgSrc}
            alt={word.word}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700"
            onError={() => setImgFailed(true)}
          />
        </div>

        {/* Top-right controls */}
        <div className="absolute top-5 right-5 z-20 flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {/* Streak badge */}
          <div className="flex items-center gap-1.5 bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-full px-3 py-1.5 shadow-sm">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-xs font-black text-slate-800">{vocabStreak || 0}</span>
            <span className="text-[10px] font-medium text-slate-500 hidden sm:inline">streak</span>
          </div>
          {/* Word counter + nav */}
          {dailyWords.length > 1 && (
            <div className="flex items-center gap-1 bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-full px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
              <button
                onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="hover:text-slate-900 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-1">{currentIndex + 1} / {dailyWords.length}</span>
              <button
                onClick={() => setCurrentIndex(i => Math.min(dailyWords.length - 1, i + 1))}
                disabled={currentIndex === dailyWords.length - 1}
                className="hover:text-slate-900 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Mastered badge — bottom right */}
        <div className="absolute bottom-5 right-5 z-10 flex items-center gap-1.5 bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-full px-3 py-1.5 shadow-sm">
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs font-black text-slate-800">{stats?.mastered || 0}</span>
          <span className="text-[10px] font-medium text-slate-500">mastered</span>
        </div>

        {/* Left content area */}
        <div className="relative z-10 flex flex-col justify-center p-7 sm:p-9 lg:p-10 max-w-[62%]" style={{ minHeight: '300px' }}>
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full shadow-sm"
              style={{ background: theme.badgeBg, border: `1px solid ${theme.badgeBorder}`, color: theme.badgeText }}
            >
              <span>👑</span> Word of the Day
            </span>
          </div>

          {/* Word + audio */}
          <div className="flex items-center gap-3 mb-2">
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none"
              style={{ color: theme.wordColor, textShadow: theme.wordGlow }}
            >
              {word.word}
            </h2>
            <button
              onClick={playAudio}
              className="h-9 w-9 rounded-xl flex items-center justify-center transition-all shrink-0 shadow-sm hover:scale-110 active:scale-95"
              style={{ background: theme.audioBg, border: `1px solid ${theme.audioBorder}`, color: theme.audioText }}
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>

          {/* Pronunciation + POS */}
          <div className="flex items-center gap-2 mb-4">
            {word.pronunciation && (
              <span className="font-mono text-xs" style={{ color: theme.pronColor }}>[ {word.pronunciation} ]</span>
            )}
            {word.partOfSpeech && (
              <span
                className="text-[11px] font-bold capitalize px-2.5 py-0.5 rounded-full"
                style={{ background: theme.badgeBg, border: `1px solid ${theme.badgeBorder}`, color: theme.badgeText }}
              >
                {word.partOfSpeech}
              </span>
            )}
          </div>

          {/* Meaning */}
          <p className="text-sm sm:text-base font-semibold leading-relaxed mb-3 max-w-[440px]" style={{ color: theme.textPrimary }}>
            {word.meaning}
          </p>

          {/* Example */}
          {word.example && (
            <p className="text-xs sm:text-sm leading-relaxed italic mb-4 max-w-[440px]" style={{ color: theme.textSecondary }}>
              <span className="font-bold not-italic" style={{ color: theme.textPrimary }}>Example: </span>
              {word.example}
            </p>
          )}

          {/* Synonyms + Antonyms */}
          {(word.synonyms?.length > 0 || word.antonyms?.length > 0) && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {word.synonyms?.slice(0, 3).map((s: string) => (
                <span key={`syn-${s}`}
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ background: theme.synBg, border: `1px solid ${theme.synBorder}`, color: theme.synColor }}>
                  {s}
                </span>
              ))}
              {word.antonyms?.slice(0, 2).map((a: string) => (
                <span key={`ant-${a}`}
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ background: theme.antBg, border: `1px solid ${theme.antBorder}`, color: theme.antColor }}>
                  ≠ {a}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { if (markWordSelfAssessment) markWordSelfAssessment(word.id, '', 'i_know'); setAssessed('i_know'); }}
              className={`inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-full transition-all ${
                assessed === 'i_know'
                  ? 'bg-emerald-500 text-white scale-95'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-200 hover:-translate-y-0.5 active:scale-95'
              }`}
            >
              <Check className="h-4 w-4" /> I Know This
            </button>
            <button
              onClick={() => { if (markWordSelfAssessment) markWordSelfAssessment(word.id, '', 'need_revision'); setAssessed('need_revision'); }}
              className={`inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-full transition-all border ${
                assessed === 'need_revision' ? 'scale-95' : 'hover:-translate-y-0.5 active:scale-95'
              }`}
              style={{
                background: assessed === 'need_revision' ? `${theme.revisionText}18` : 'rgba(255,255,255,0.7)',
                borderColor: theme.revisionBorder,
                color: theme.revisionText,
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Need Revision
            </button>
          </div>
        </div>
      </div>

      {/* ── Learning Paths strip (mirrors HomeScreen from vocabulary page) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-black text-slate-800">Learning Paths</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Pick a category and continue your journey</p>
          </div>
          <Link
            to="/student/vocabulary"
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            See All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3" style={{ scrollbarWidth: 'none' }}>
          {['All Sets', 'BANKING', 'SSC', 'UPSC', 'RAILWAY', 'DEFENCE'].map((label, i) => (
            <span
              key={label}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-none ${
                i === 0
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Category cards from vocabulary */}
        {(() => {
          const categories = (vocab?.categories || []).filter((c: any) => c.isActive).slice(0, 3);
          const lessons = vocab?.lessons || [];
          const CAT_GRADIENTS = [
            'from-blue-500 to-indigo-600',
            'from-emerald-500 to-teal-600',
            'from-violet-500 to-purple-600',
          ];

          if (categories.length === 0) {
            return (
              <div className="text-center py-6">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-400">No categories available yet</p>
                <Link to="/student/vocabulary" className="text-xs text-indigo-600 font-bold mt-1 hover:underline inline-block">
                  Visit Vocabulary →
                </Link>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {categories.map((cat: any, idx: number) => {
                const catLessons = lessons.filter((l: any) => l.categoryId === cat.id && l.status === 'published');
                const totalWords = catLessons.reduce((sum: number, l: any) => sum + (l.wordIds?.length || 0), 0);
                const topicsCount = catLessons.length;

                return (
                  <div
                    key={cat.id}
                    onClick={() => navigate('/student/vocabulary')}
                    className="rounded-2xl overflow-hidden cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all duration-300 group border border-slate-200"
                  >
                    {/* Gradient header */}
                    <div className={`bg-gradient-to-br ${cat.color || CAT_GRADIENTS[idx % CAT_GRADIENTS.length]} px-4 py-3`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
                            {cat.icon || '📚'}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-black text-white text-xs leading-snug truncate">{cat.name}</h3>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-white/75 text-[10px] font-semibold">{topicsCount} {topicsCount === 1 ? 'Topic' : 'Topics'}</span>
                              <span className="text-white/40 text-[10px]">·</span>
                              <span className="text-white/75 text-[10px] font-semibold">{totalWords} Words</span>
                            </div>
                          </div>
                        </div>
                        <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:bg-white/30 transition-all ml-1">
                          <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 bg-white flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {totalWords > 0 ? `${totalWords} words` : 'Not started'}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-black text-indigo-600">
                        Start <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default DashboardVocabularySection;
