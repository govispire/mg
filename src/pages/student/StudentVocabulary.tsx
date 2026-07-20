import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useAuth } from '@/app/providers';
import {
  BookOpen, CheckCircle, RotateCcw, Brain, Star, Zap, Award,
  Target, ChevronRight, ChevronLeft, X, Volume2, Bookmark,
  AlertCircle, Flame, Trophy, Clock, Layers, ListChecks,
  ArrowRight, Check, Eye, EyeOff, Sparkles, TrendingUp,
  BookMarked, Flag, MoreHorizontal, Search, Filter,
  GraduationCap, Home, BarChart3, RefreshCw,
  MapPin, XCircle, Lightbulb, ArrowLeft,
  VolumeX, PlayCircle, MessageCircle
} from 'lucide-react';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-red-600 bg-red-50 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <pre className="whitespace-pre-wrap">{this.state.error?.toString()}</pre>
          <pre className="whitespace-pre-wrap mt-4 text-xs">{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}


// ─── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | { type: 'home' }
  | { type: 'category'; categoryId: string }
  | { type: 'learning'; lessonId: string }
  | { type: 'stage-complete'; lessonId: string; phase: 'learning' | 'flashcards' | 'spelling'; score?: number; total?: number }
  | { type: 'flashcards'; lessonId: string }
  | { type: 'spelling'; lessonId: string }
  | { type: 'quiz'; lessonId: string }
  | { type: 'result'; lessonId: string }
  | { type: 'revision' }
  | { type: 'mywords' }
  | { type: 'wordofday'; index?: number };

// ─── Colour palette ───────────────────────────────────────────────────────────
const CAT_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-500',
];

const DIFF_BADGE: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
};

// ─── Full-Screen Learning Mode ─────────────────────────────────────────────────
const UnifiedLearningView: React.FC<{
  words: any[];
  initialIndex?: number;
  mode: 'learning' | 'browse';
  lessonId?: string;
  onExit: () => void;
  onComplete?: () => void;
  selfAssessments?: Record<string, any>;
  onSelfAssess?: (lessonId: string, wordId: string, assessment: 'i_know' | 'need_revision') => void;
  onBookmark?: (wordId: string) => void;
  onDifficult?: (wordId: string) => void;
}> = ({ words, initialIndex = 0, mode, lessonId, onExit, onComplete, selfAssessments, onSelfAssess, onBookmark, onDifficult }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const word = words[currentIndex];
  
  const parsedTree = useMemo(() => {
    if (!word?.wordTree) return null;
    return word.wordTree.split('>').map((level: string) => level.split(',').map((s: string) => s.trim()));
  }, [word?.wordTree]);

  const progress = ((currentIndex + 1) / words.length) * 100;
  const isLast = currentIndex === words.length - 1;
  const assessment = word && selfAssessments ? selfAssessments[word.id] : null;

  const goNext = () => {
    if (isLast) { onComplete?.(); return; }
    setCurrentIndex(i => i + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  const playAudio = () => {
    if (word?.audioUrl) {
      new Audio(word.audioUrl).play().catch(() => {});
    } else if ('speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(word?.word || '');
      utt.lang = 'en-US';
      window.speechSynthesis.speak(utt);
    }
  };

  if (!word) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-white flex flex-col">
      {/* Top Header */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-slate-100 bg-white shrink-0 shadow-sm relative z-20">
        <div className="w-24">
          {mode === 'learning' && (
            <button onClick={onExit} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors">
              <X className="h-4 w-4" /> Exit
            </button>
          )}
        </div>
        
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-md flex items-center gap-3">
            <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-bold text-slate-500 shrink-0">
              {currentIndex + 1} / {words.length}
            </span>
          </div>
        </div>

        <div className="w-24 flex items-center justify-end gap-3">
          <button className="text-slate-400 hover:text-slate-600 transition-colors"><VolumeX className="h-4 w-4"/></button>
          <button className="text-slate-400 hover:text-slate-600 transition-colors"><PlayCircle className="h-4 w-4"/></button>
          <button onClick={onExit} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="h-5 w-5"/></button>
        </div>
      </div>

      {/* Sub-Header Word Carousel */}
      <div className="bg-white border-b border-slate-50 px-6 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2 justify-center shrink-0 shadow-sm relative z-10">
        {words.map((w, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${idx === currentIndex ? 'bg-blue-50 text-blue-600' : 'bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            {idx + 1}- {w.word}
          </button>
        ))}
      </div>

      {/* Floating Arrows */}
      <button onClick={goPrev} disabled={currentIndex === 0} className="fixed left-4 sm:left-6 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white border border-slate-100 shadow-lg flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all z-20 hover:scale-105 active:scale-95">
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      <button onClick={goNext} disabled={currentIndex === words.length - 1} className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white border border-slate-100 shadow-lg flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all z-20 hover:scale-105 active:scale-95">
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-white flex justify-center pb-24 sm:pb-32 pt-8 sm:pt-12 relative">
        <div className="max-w-[1000px] w-full px-12 sm:px-20 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-12 sm:gap-16">
          
          {/* Left Column (Word Details) */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{word.word}</h1>
                <button onClick={playAudio} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <Volume2 className="h-5 w-5"/>
                </button>
                {word.partOfSpeech && <span className="text-blue-600 font-bold text-sm bg-blue-50 px-2 py-0.5 rounded-md">{word.partOfSpeech}</span>}
              </div>
              
              {/* Pronunciation */}
              {word.pronunciation && (
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600">
                    <span className="font-bold text-slate-400 mr-2 uppercase text-[10px] tracking-wider">Pronunciation</span>
                    <span className="font-mono">{word.pronunciation}</span>
                  </div>
                </div>
              )}

              <p className="text-lg text-slate-700 font-medium leading-relaxed">{word.meaning}</p>
            </div>

            {/* Examples Card */}
            {(word.example || word.example2) && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 relative mt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" /> Examples
                </p>
                <div className="space-y-4">
                  {word.example && (
                    <div className="flex gap-3 text-slate-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                      <p className="text-sm font-medium leading-relaxed">
                        <span className="font-bold text-slate-900">{word.word}</span> {word.example.replace(word.word, '')}
                      </p>
                    </div>
                  )}
                  {word.example2 && (
                    <div className="flex gap-3 text-slate-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                      <p className="text-sm font-medium leading-relaxed">
                        {word.example2}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags row */}
            {(word.synonyms?.length > 0 || word.antonyms?.length > 0) && (
              <div className="flex flex-col gap-4 pt-4">
                {word.synonyms?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Similar words</p>
                    <div className="flex flex-wrap gap-2">
                      {word.synonyms.map((s: string) => (
                        <span key={`syn-${s}`} className="bg-red-50 text-red-600 px-3 py-1 rounded-md text-xs font-bold">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {word.antonyms?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Opposite meaning words</p>
                    <div className="flex flex-wrap gap-2">
                      {word.antonyms.map((a: string) => (
                        <span key={`ant-${a}`} className="bg-green-50 text-green-600 px-3 py-1 rounded-md text-xs font-bold">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column (Visuals & Relationships) */}
          <div className="flex flex-col gap-8">
            {word.imageUrl && (
              <div className="w-full flex justify-center">
                <img src={word.imageUrl} alt={word.word} className="w-64 h-64 sm:w-80 sm:h-80 object-contain drop-shadow-sm transition-transform hover:scale-105 duration-500" />
              </div>
            )}

            {/* Word Tree Card */}
            {parsedTree && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl pt-5 pb-0 text-center shadow-sm relative overflow-hidden flex flex-col group">
                <p className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 mb-6 text-slate-500">
                  <Layers className="h-3.5 w-3.5"/> Word tree
                </p>
                
                {/* Visual Tree */}
                <div className="relative flex flex-col items-center justify-end flex-1 w-full min-h-[280px]">
                  {/* SVG Paths for branches */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                    {/* The main trunk */}
                    <path d="M 50% 100% L 50% 20%" stroke="#94a3b8" strokeWidth="6" fill="none" strokeLinecap="round" />
                    
                    {/* Left branch */}
                    <path d="M 50% 60% Q 25% 60% 25% 30%" stroke="#94a3b8" strokeWidth="4" fill="none" strokeLinecap="round" />
                    {/* Right branch */}
                    <path d="M 50% 45% Q 75% 45% 75% 20%" stroke="#94a3b8" strokeWidth="4" fill="none" strokeLinecap="round" />
                    
                    {/* Leaves */}
                    <path d="M 35% 70% Q 25% 75% 25% 65% Q 35% 60% 35% 70%" fill="#cbd5e1" />
                    <path d="M 65% 60% Q 75% 65% 75% 55% Q 65% 50% 65% 60%" fill="#cbd5e1" />
                    <path d="M 40% 40% Q 30% 45% 30% 35% Q 40% 30% 40% 40%" fill="#cbd5e1" />
                    <path d="M 60% 30% Q 70% 35% 70% 25% Q 60% 20% 60% 30%" fill="#cbd5e1" />
                  </svg>

                  <div className="w-full flex flex-col items-center justify-end z-10 pb-6 gap-6 h-full absolute inset-0">
                    {/* Top Level (Siblings) */}
                    {parsedTree.length > 3 && (
                      <div className="flex gap-4">
                        {parsedTree[3].map((node: string, i: number) => (
                          <div key={`l3-${i}`} className="bg-white text-indigo-800 rounded-full px-4 py-1.5 shadow-sm border border-slate-200 text-xs font-black whitespace-nowrap">
                            {node}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Middle Levels */}
                    {parsedTree[2] && (
                      <div className="bg-white text-indigo-800 rounded-full px-5 py-2 shadow-sm border border-slate-200 text-sm font-black whitespace-nowrap mt-auto">
                        {parsedTree[2][0]}
                      </div>
                    )}
                    {parsedTree[1] && (
                      <div className="bg-white text-indigo-800 rounded-full px-5 py-2 shadow-sm border border-slate-200 text-sm font-black whitespace-nowrap">
                        {parsedTree[1][0]}
                      </div>
                    )}
                    <div className="h-6" /> {/* Spacer for ground */}
                  </div>
                  
                  {/* Ground Level / Root */}
                  <div className="w-full bg-slate-300 h-16 rounded-b-2xl relative z-10 flex items-center justify-center mt-auto">
                    {parsedTree[0] && (
                      <div className="bg-white text-slate-500 rounded-full px-6 py-1.5 shadow-sm font-black text-sm absolute -top-4">
                        {parsedTree[0][0]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar (Learning Mode Only) */}
      {mode === 'learning' && (
        <div className="bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-3 shrink-0 relative z-30 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 max-w-[1000px] w-full mx-auto">
            <button onClick={() => onDifficult?.(word.id)} className="flex items-center gap-1.5 hover:text-slate-600 transition-colors"><Flag className="h-3.5 w-3.5"/> Mark Difficult</button>
            <span className="font-medium hidden sm:inline">You know this word?</span>
            <button onClick={() => onBookmark?.(word.id)} className="flex items-center gap-1.5 hover:text-slate-600 transition-colors"><Bookmark className="h-3.5 w-3.5"/> Add to My Words</button>
          </div>
          <div className="flex items-center justify-between max-w-[1000px] w-full mx-auto gap-3">
            <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0} className="w-24 sm:w-28 text-slate-500 font-bold border-slate-200 hover:bg-slate-50 hidden sm:flex">
              <ChevronLeft className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Previous</span>
            </Button>
            <div className="flex gap-2 flex-1">
              <Button 
                variant="outline" 
                onClick={() => { onSelfAssess?.(lessonId || '', word.id, 'need_revision'); goNext(); }} 
                className={`flex-1 h-12 bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition-all ${assessment === 'need_revision' ? 'border-amber-400 text-amber-700 bg-amber-50 shadow-sm' : ''}`}
              >
                <RotateCcw className="h-4 w-4 mr-1.5"/> Need Revision
              </Button>
              <Button 
                onClick={() => { onSelfAssess?.(lessonId || '', word.id, 'i_know'); goNext(); }} 
                className={`flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold transition-all ${assessment === 'i_know' ? 'bg-emerald-800' : ''}`}
              >
                <Check className="h-4 w-4 mr-1.5"/> {isLast ? 'Finish' : 'I Know This'}
              </Button>
            </div>
            <Button variant="outline" onClick={goNext} className="w-24 sm:w-28 text-slate-500 font-bold border-slate-200 hover:bg-slate-50 hidden sm:flex">
              <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Stage Complete (between every phase) ───────────────────────────────
const PHASES = ['learning', 'flashcards', 'spelling', 'quiz'] as const;
type PhaseName = typeof PHASES[number];

const PHASE_CONFIG: Record<PhaseName, {
  emoji: string; color: string; bg: string; ring: string;
  label: string; completedMsg: string; nextLabel: string; icon: any;
  statLabel?: string;
}> = {
  learning: {
    emoji: '📖', color: 'text-blue-700', bg: 'bg-blue-600', ring: 'ring-blue-200',
    label: 'Learning', completedMsg: 'You reviewed all the words!',
    nextLabel: 'Start Flashcards', icon: BookOpen, statLabel: 'Words Reviewed',
  },
  flashcards: {
    emoji: '🃏', color: 'text-violet-700', bg: 'bg-violet-600', ring: 'ring-violet-200',
    label: 'Flashcards', completedMsg: 'Great recall on the flashcards!',
    nextLabel: 'Start Spelling Test', icon: Sparkles, statLabel: 'Cards Correct',
  },
  spelling: {
    emoji: '✏️', color: 'text-amber-700', bg: 'bg-amber-600', ring: 'ring-amber-200',
    label: 'Spelling', completedMsg: 'Well done on the spelling test!',
    nextLabel: 'Start Quiz', icon: GraduationCap, statLabel: 'Spelled Correctly',
  },
  quiz: {
    emoji: '🏆', color: 'text-emerald-700', bg: 'bg-emerald-600', ring: 'ring-emerald-200',
    label: 'Quiz', completedMsg: 'Lesson fully complete!',
    nextLabel: 'See My Results', icon: Brain, statLabel: 'Quiz Score',
  },
};

const StageComplete: React.FC<{
  phase: PhaseName;
  lessonName: string;
  wordCount: number;
  score?: number;
  total?: number;
  onNext: () => void;
  onExit: () => void;
}> = ({ phase, lessonName, wordCount, score, total, onNext, onExit }) => {
  const cfg = PHASE_CONFIG[phase];
  const phaseIdx = PHASES.indexOf(phase);
  const accuracy = total && total > 0 ? Math.round((score || 0) / total * 100) : null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, rgba(255,255,255,1) 70%)' }}>
      {/* Confetti dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(18)].map((_, i) => (
          <div key={i} className={`absolute rounded-full opacity-60 animate-bounce`}
            style={{
              width: `${6 + (i % 4) * 4}px`, height: `${6 + (i % 4) * 4}px`,
              left: `${(i * 37 + 11) % 100}%`, top: `${(i * 53 + 7) % 60}%`,
              background: ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6'][i % 6],
              animationDelay: `${(i * 0.15) % 1.2}s`, animationDuration: `${1.5 + (i % 3) * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm p-7 text-center space-y-5 relative z-10">
        {/* Big emoji */}
        <div className="text-7xl leading-none">{cfg.emoji}</div>

        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800">
            {phase === 'quiz' ? 'Congratulations!' : `${cfg.label} Complete!`}
          </h2>
          <p className="text-sm text-slate-500">{cfg.completedMsg}</p>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            {lessonName} · {wordCount} words
          </p>
        </div>

        {/* Score badge */}
        {score !== undefined && total !== undefined && (
          <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl ${
            (accuracy || 0) >= 70 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
          }`}>
            <div>
              <p className={`text-3xl font-black ${(accuracy || 0) >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {score}/{total}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{cfg.statLabel}</p>
            </div>
            {accuracy !== null && (
              <div className={`text-2xl font-black ${(accuracy || 0) >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {accuracy}%
              </div>
            )}
          </div>
        )}

        {/* Phase pipeline bar */}
        <div className="flex items-center gap-1 justify-center">
          {PHASES.map((p, i) => {
            const done = i <= phaseIdx;
            const isCurrent = i === phaseIdx;
            const PCfg = PHASE_CONFIG[p];
            return (
              <React.Fragment key={p}>
                <div className="flex flex-col items-center gap-0.5">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all
                    ${done ? (isCurrent ? `${PCfg.bg} text-white ring-4 ${PCfg.ring}` : 'bg-emerald-500 text-white') : 'bg-slate-100 text-slate-300'}`}>
                    {done && !isCurrent ? <Check className="h-4 w-4" /> : <PCfg.icon className="h-3.5 w-3.5" />}
                  </div>
                  <span className={`text-[8px] font-bold uppercase ${isCurrent ? PCfg.color : done ? 'text-emerald-600' : 'text-slate-300'}`}>
                    {PCfg.label}
                  </span>
                </div>
                {i < PHASES.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded mb-3 ${i < phaseIdx ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* CTA */}
        <Button onClick={onNext}
          className={`w-full h-12 text-base font-bold gap-2 ${cfg.bg} hover:opacity-90 text-white`}>
          {cfg.nextLabel} <ChevronRight className="h-5 w-5" />
        </Button>
        <button onClick={onExit} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
          Save progress & Exit
        </button>
      </div>
    </div>
  );
};

// ─── Flashcard Mode ────────────────────────────────────────────────────────────
const FlashcardMode: React.FC<{
  words: any[];
  onComplete: (score: number) => void;
  onExit: () => void;
}> = ({ words, onComplete, onExit }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [scores, setScores] = useState<Record<string, boolean>>({});
  const word = words[index];

  const handleRate = (correct: boolean) => {
    setScores(s => ({ ...s, [word.id]: correct }));
    if (index + 1 >= words.length) {
      const total = Object.values({ ...scores, [word.id]: correct }).filter(Boolean).length;
      onComplete(total);
    } else {
      setIndex(i => i + 1);
      setFlipped(false);
    }
  };

  if (!word) return null;
  const progress = ((index + 1) / words.length) * 100;

  return (
    <div className="fixed inset-0 z-[150] bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <button onClick={onExit} className="text-white/60 hover:text-white flex items-center gap-1.5 text-sm">
          <X className="h-4 w-4" /> Exit
        </button>
        <div className="flex-1 mx-6">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className="text-white/60 text-sm font-medium">{index + 1}/{words.length}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        <p className="text-white/50 text-sm font-medium uppercase tracking-widest">
          {flipped ? 'Answer' : 'Guess the word'}
        </p>

        {/* Card */}
        <div
          className="w-full max-w-md cursor-pointer"
          onClick={() => setFlipped(f => !f)}
          style={{ perspective: 1000 }}
        >
          <div
            className="relative transition-transform duration-500"
            style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* Front */}
            <div className="bg-white rounded-3xl p-8 text-center space-y-4 min-h-[280px] flex flex-col justify-center"
              style={{ backfaceVisibility: 'hidden' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Definition</p>
              <p className="text-xl font-semibold text-slate-700 leading-relaxed">{word.meaning}</p>
              {word.imageUrl && <img src={word.imageUrl} alt="" className="h-32 w-full object-cover rounded-xl mx-auto" />}
              <p className="text-xs text-indigo-500 font-medium mt-2">Tap to reveal word →</p>
            </div>
            {/* Back */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-center space-y-3 flex flex-col justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <h2 className="text-4xl font-black text-white">{word.word}</h2>
              {word.pronunciation && <p className="text-indigo-200 font-mono text-lg">/{word.pronunciation}/</p>}
              <p className="text-indigo-100 leading-relaxed text-sm">{word.meaning}</p>
            </div>
          </div>
        </div>

        {flipped && (
          <div className="flex gap-3 w-full max-w-md">
            <Button
              onClick={() => handleRate(false)}
              variant="outline"
              className="flex-1 h-12 font-bold text-red-600 border-red-300 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1.5" /> Incorrect
            </Button>
            <Button
              onClick={() => handleRate(true)}
              className="flex-1 h-12 font-bold bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Check className="h-4 w-4 mr-1.5" /> Correct
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Spelling Test ─────────────────────────────────────────────────────────────
const SpellingTest: React.FC<{
  words: any[];
  onComplete: (score: number) => void;
  onExit: () => void;
}> = ({ words, onComplete, onExit }) => {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const word = words[index];

  const check = () => {
    const isCorrect = input.trim().toLowerCase() === word.word.toLowerCase();
    setCorrect(isCorrect);
    setChecked(true);
    if (isCorrect) setScore(s => s + 1);
  };

  const next = () => {
    if (index + 1 >= words.length) {
      onComplete(score);
    } else {
      setIndex(i => i + 1);
      setInput('');
      setChecked(false);
      setCorrect(false);
    }
  };

  if (!word) return null;
  const progress = ((index + 1) / words.length) * 100;

  return (
    <div className="fixed inset-0 z-[150] bg-white flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <button onClick={onExit} className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
          <X className="h-4 w-4" /> Exit
        </button>
        <div className="flex-1 mx-6">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className="text-sm font-bold text-slate-500">{index + 1}/{words.length}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6 max-w-lg mx-auto w-full">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Spell the word</p>
          <p className="text-xl text-slate-700 font-semibold leading-relaxed">{word.meaning}</p>
        </div>

        {word.imageUrl && (
          <img src={word.imageUrl} alt="" className="h-40 w-full max-w-sm object-cover rounded-2xl shadow-md" />
        )}

        <div className="w-full space-y-3">
          <Input
            value={input}
            onChange={e => !checked && setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !checked) check(); }}
            placeholder="Type the word here..."
            className={`h-14 text-lg text-center font-bold rounded-xl border-2 transition-all
              ${checked && correct ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : ''}
              ${checked && !correct ? 'border-red-400 bg-red-50 text-red-700' : ''}
              ${!checked ? 'border-slate-200 focus:border-indigo-400' : ''}
            `}
            autoFocus
          />
          {checked && !correct && (
            <div className="text-center">
              <p className="text-xs text-red-500 font-medium">Correct answer:</p>
              <p className="text-2xl font-black text-emerald-600">{word.word}</p>
            </div>
          )}
        </div>

        {!checked ? (
          <Button onClick={check} disabled={!input.trim()} className="w-full h-12 font-bold text-base">
            Check Answer
          </Button>
        ) : (
          <Button onClick={next} className={`w-full h-12 font-bold text-base ${correct ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-600 hover:bg-slate-700'}`}>
            {index + 1 >= words.length ? 'See Results' : 'Next Word'} <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── Vocabulary Quiz ───────────────────────────────────────────────────────────
const VocabularyQuiz: React.FC<{
  questions: any[];
  words: any[];
  selfAssessments: Record<string, any>;
  onComplete: (results: { wordId: string; correct: boolean; selfAssessment: any }[]) => void;
  onExit: () => void;
}> = ({ questions, words, selfAssessments, onComplete, onExit }) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<{ wordId: string; correct: boolean; selfAssessment: any }[]>([]);

  // If no superadmin questions, auto-generate MCQs from words
  const allQuestions = useMemo(() => {
    if (questions.length > 0) return questions;
    return words.map(w => ({
      id: `auto_${w.id}`,
      wordId: w.id,
      type: 'mcq' as const,
      question: `What is the meaning of "${w.word}"?`,
      options: (() => {
        const others = words.filter(x => x.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3);
        return [...others.map((x: any) => x.meaning), w.meaning].sort(() => Math.random() - 0.5);
      })(),
      correctAnswer: w.meaning,
      difficulty: w.difficulty,
      marks: 1,
    }));
  }, [questions, words]);

  const q = allQuestions[index];
  const progress = ((index + 1) / allQuestions.length) * 100;

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const correct = opt === q.correctAnswer;
    const newResults = [...results, {
      wordId: q.wordId || '',
      correct,
      selfAssessment: selfAssessments[q.wordId || ''] || null
    }];
    setTimeout(() => {
      if (index + 1 >= allQuestions.length) {
        onComplete(newResults);
      } else {
        setResults(newResults);
        setIndex(i => i + 1);
        setSelected(null);
      }
    }, 1000);
  };

  if (!q) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-slate-50 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0">
        <button onClick={onExit} className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
          <X className="h-4 w-4" /> Exit
        </button>
        <div className="flex-1 mx-6">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className="text-sm font-bold text-slate-500">{index + 1}/{allQuestions.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 bg-violet-100 px-2.5 py-1 rounded-full">
              Question {index + 1}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{q.type?.replace('_', ' ')}</span>
          </div>

          {/* Question */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-center">
            {q.imageUrl && <img src={q.imageUrl} alt="" className="h-40 w-full object-cover rounded-xl mb-4" />}
            <p className="text-indigo-200 text-xs font-medium mb-2 uppercase tracking-wide">
              {q.type === 'synonym' ? 'Find the synonym' : q.type === 'antonym' ? 'Find the antonym' : 'Choose the correct answer'}
            </p>
            <p className="text-white text-xl font-bold leading-relaxed">{q.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt: string, i: number) => {
              const isCorrect = opt === q.correctAnswer;
              const isSel = selected === opt;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200
                    ${!selected ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer' : ''}
                    ${isSel && isCorrect ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : ''}
                    ${isSel && !isCorrect ? 'bg-red-50 border-red-400 text-red-800' : ''}
                    ${selected && isCorrect && !isSel ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : ''}
                    ${!isSel && !(selected && isCorrect) ? 'bg-white border-slate-200 text-slate-700' : ''}
                  `}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border
                      ${isSel && isCorrect ? 'bg-emerald-500 text-white border-emerald-500' :
                        isSel && !isCorrect ? 'bg-red-500 text-white border-red-500' :
                        selected && isCorrect ? 'bg-emerald-400 text-white border-emerald-400' :
                        'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          {selected && q.explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Explanation</p>
              <p className="text-sm text-blue-800">{q.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Lesson Result ─────────────────────────────────────────────────────────────
const LessonResult: React.FC<{
  lessonName: string;
  quizResults: { wordId: string; correct: boolean; selfAssessment: any }[];
  spellingScore: number;
  flashcardScore: number;
  wordCount: number;
  onBackToLesson: () => void;
  onApplyDecision: (wordId: string, selfAssessment: any, correct: boolean) => void;
}> = ({ lessonName, quizResults, spellingScore, flashcardScore, wordCount, onBackToLesson, onApplyDecision }) => {
  const [applied, setApplied] = useState(false);

  const quizScore = quizResults.filter(r => r.correct).length;
  const quizTotal = quizResults.length;
  const accuracy = quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0;
  const mastered = quizResults.filter(r => r.selfAssessment === 'i_know' && r.correct).length;
  const needRevision = quizResults.filter(r => !r.correct || r.selfAssessment === 'need_revision').length;

  useEffect(() => {
    if (!applied && quizResults.length > 0) {
      quizResults.forEach(r => {
        onApplyDecision(r.wordId, r.selfAssessment, r.correct);
      });
      setApplied(true);
    }
  }, []);

  const matrixRows = [
    { assessment: 'I Know This', result: '✅ Correct', status: 'Mastered', queue: 'No', color: 'text-emerald-700 bg-emerald-50', count: quizResults.filter(r => r.selfAssessment === 'i_know' && r.correct).length },
    { assessment: 'I Know This', result: '❌ Wrong', status: 'Learning', queue: 'Add', color: 'text-amber-700 bg-amber-50', count: quizResults.filter(r => r.selfAssessment === 'i_know' && !r.correct).length },
    { assessment: 'Need Revision', result: '❌ Wrong', status: 'Learning', queue: 'Keep', color: 'text-red-700 bg-red-50', count: quizResults.filter(r => r.selfAssessment === 'need_revision' && !r.correct).length },
    { assessment: 'Need Revision', result: '✅ Correct', status: 'Learned', queue: 'Keep', color: 'text-blue-700 bg-blue-50', count: quizResults.filter(r => r.selfAssessment === 'need_revision' && r.correct).length },
  ];

  return (
    <div className="fixed inset-0 z-[150] bg-gradient-to-br from-indigo-50 via-white to-violet-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">{accuracy >= 80 ? '🏆' : accuracy >= 50 ? '⭐' : '💪'}</div>
          <h1 className="text-2xl font-black text-slate-800">Lesson Complete!</h1>
          <p className="text-slate-500 mt-1">{lessonName}</p>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Quiz Score', value: `${quizScore}/${quizTotal}`, icon: Brain, color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Accuracy', value: `${accuracy}%`, icon: Target, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Mastered', value: mastered, icon: Trophy, color: 'text-amber-600 bg-amber-50' },
            { label: 'Need Revision', value: needRevision, icon: RotateCcw, color: 'text-red-600 bg-red-50' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl ${s.color.split(' ')[1]} p-4 text-center ring-1 ring-inset ring-black/5`}>
              <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color.split(' ')[0]}`} />
              <p className={`text-2xl font-black ${s.color.split(' ')[0]}`}>{s.value}</p>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Decision matrix results */}
        <div className="bg-white rounded-2xl border p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-indigo-600" /> Word Decision Breakdown
          </h3>
          <div className="space-y-2">
            {matrixRows.filter(r => r.count > 0).map((row, i) => (
              <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${row.color}`}>
                <div className="text-xs font-medium">
                  {row.assessment} + {row.result} → <span className="font-bold">{row.status}</span>
                </div>
                <span className="text-xs font-black">{row.count} words</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spaced repetition info */}
        {needRevision > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <RotateCcw className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">{needRevision} words added to Revision Queue</p>
                <p className="text-xs text-amber-700 mt-1">
                  They'll be scheduled for spaced repetition: tomorrow, then +3, +7, +15, +30 days until mastered.
                </p>
              </div>
            </div>
          </div>
        )}

        <Button onClick={onBackToLesson} className="w-full h-12 text-base font-bold">
          Back to Lesson
        </Button>
      </div>
    </div>
  );
};

// ─── Revision Center ───────────────────────────────────────────────────────────
const RevisionCenter: React.FC<{
  revisionQueue: any[];
  allEntries: any[];
  words: any[];
  onStartRevision: () => void;
  onAdvanceLevel: (wordId: string) => void;
}> = ({ revisionQueue, allEntries, words, onStartRevision, onAdvanceLevel }) => {
  const today = new Date().toISOString().split('T')[0];
  const dueToday = revisionQueue.filter(r => r.nextRevisionDate <= today);
  const upcoming = allEntries.filter(r => r.nextRevisionDate > today).sort((a, b) => a.nextRevisionDate.localeCompare(b.nextRevisionDate));

  const LEVEL_SCHEDULE = ['', 'Next Day', 'After 3 Days', 'After 7 Days', 'After 15 Days', 'After 30 Days'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black">Revision Center</h2>
            <p className="text-amber-100 text-sm mt-1">
              {dueToday.length} words due today · {allEntries.length} total in queue
            </p>
          </div>
          {dueToday.length > 0 && (
            <Button onClick={onStartRevision} className="bg-white text-amber-700 hover:bg-amber-50 font-bold gap-2 shrink-0">
              <Brain className="h-4 w-4" /> Start Revision
            </Button>
          )}
        </div>
      </div>

      {/* Due today */}
      {dueToday.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" /> Due Today ({dueToday.length})
          </h3>
          {dueToday.map(entry => {
            const word = words.find((w: any) => w.id === entry.wordId);
            if (!word) return null;
            return (
              <div key={entry.id} className="bg-white border-2 border-red-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <span className="text-lg font-black text-red-600">{entry.level}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800">{word.word}</p>
                  <p className="text-xs text-slate-500 truncate">{word.meaning}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-medium text-slate-400">
                      Level {entry.level} · {LEVEL_SCHEDULE[entry.level] || 'Final Level'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Accuracy: {entry.accuracy}%
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Attempts: {entry.attempts}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => onAdvanceLevel(entry.wordId)}
                  className="shrink-0 text-xs font-semibold text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                  Mark Done
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" /> Upcoming Revisions
          </h3>
          {upcoming.slice(0, 10).map(entry => {
            const word = words.find((w: any) => w.id === entry.wordId);
            if (!word) return null;
            const daysUntil = Math.ceil((new Date(entry.nextRevisionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div key={entry.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${entry.level >= 4 ? 'bg-emerald-100' : 'bg-indigo-100'}`}>
                  <span className={`text-lg font-black ${entry.level >= 4 ? 'text-emerald-600' : 'text-indigo-600'}`}>{entry.level}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800">{word.word}</p>
                  <p className="text-xs text-slate-500 truncate">{word.meaning}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-600">in {daysUntil}d</p>
                  <p className="text-[10px] text-slate-400">{entry.nextRevisionDate}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dueToday.length === 0 && upcoming.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🎯</div>
          <h3 className="text-lg font-bold text-slate-700">No revisions due!</h3>
          <p className="text-sm text-slate-500 mt-1">Complete lessons to build your revision queue</p>
        </div>
      )}
    </div>
  );
};

// ─── My Words ─────────────────────────────────────────────────────────────────
const MyWords: React.FC<{
  words: any[];
  userProgress: any[];
}> = ({ words, userProgress }) => {
  const [tab, setTab] = useState<'bookmarked' | 'difficult' | 'mastered'>('bookmarked');
  const bookmarked = userProgress.filter(p => p.isBookmarked).map(p => words.find((w: any) => w.id === p.wordId)).filter(Boolean);
  const difficult = userProgress.filter(p => p.isDifficult).map(p => words.find((w: any) => w.id === p.wordId)).filter(Boolean);
  const mastered = userProgress.filter(p => p.status === 'mastered').map(p => words.find((w: any) => w.id === p.wordId)).filter(Boolean);

  const lists: Record<string, any[]> = { bookmarked, difficult, mastered };
  const current = lists[tab] || [];

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {[
          { key: 'bookmarked', label: 'Bookmarked', icon: Bookmark, count: bookmarked.length },
          { key: 'difficult', label: 'Difficult', icon: Flag, count: difficult.length },
          { key: 'mastered', label: 'Mastered', icon: Trophy, count: mastered.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all text-xs font-bold
              ${tab === t.key ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${tab === t.key ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {current.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">📚</div>
          <p className="text-slate-500 font-medium">No words here yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {current.map((word: any) => (
            <div key={word.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
              {word.imageUrl && <img src={word.imageUrl} alt={word.word} className="h-12 w-12 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-slate-800">{word.word}</span>
                  {word.pronunciation && <span className="text-xs text-slate-400 font-mono">/{word.pronunciation}/</span>}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIFF_BADGE[word.difficulty]}`}>{word.difficulty}</span>
                </div>
                <p className="text-sm text-slate-600 mt-0.5">{word.meaning}</p>
                {word.synonyms?.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {word.synonyms.slice(0, 3).map((s: string) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Category Page ─────────────────────────────────────────────────────────────
const CategoryPage: React.FC<{
  categoryId: string;
  categories: any[];
  lessons: any[];
  lessonProgress: any[];
  words: any[];
  userProgress: any[];
  onStartLesson: (lessonId: string) => void;
  onBack: () => void;
}> = ({ categoryId, categories, lessons, lessonProgress, words, userProgress, onStartLesson, onBack }) => {
  const category = categories.find(c => c.id === categoryId);
  const catLessons = lessons.filter(l => l.categoryId === categoryId && l.status === 'published');

  const getLessonStats = (lesson: any) => {
    const lp = lessonProgress.find(lp => lp.lessonId === lesson.id);
    const lessonWordIds = lesson.wordIds || [];
    const masteredCount = userProgress.filter(p => lessonWordIds.includes(p.wordId) && p.status === 'mastered').length;
    const revisionCount = userProgress.filter(p => lessonWordIds.includes(p.wordId) && (p.status === 'learning' || p.status === 'learned')).length;
    const pct = lessonWordIds.length > 0 ? Math.round((masteredCount / lessonWordIds.length) * 100) : 0;
    return { lp, masteredCount, revisionCount, pct, phase: lp?.phase };
  };

  const totalWords = catLessons.reduce((sum, l) => sum + (l.wordIds?.length || 0), 0);
  const masteredTotal = userProgress.filter(p => {
    const inCat = catLessons.some(l => (l.wordIds || []).includes(p.wordId));
    return inCat && p.status === 'mastered';
  }).length;
  const revisionTotal = userProgress.filter(p => {
    const inCat = catLessons.some(l => (l.wordIds || []).includes(p.wordId));
    return inCat && (p.status === 'learning' || p.status === 'learned');
  }).length;

  if (!category) return null;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      {/* Category header */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${category.color || CAT_GRADIENTS[0]} flex items-center justify-center text-3xl shrink-0`}>
            {category.icon || '📚'}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">{category.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{category.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Words', value: totalWords, icon: BookOpen },
            { label: 'Mastered', value: masteredTotal, icon: Trophy },
            { label: 'Need Revision', value: revisionTotal, icon: RotateCcw },
            { label: 'Lessons', value: catLessons.length, icon: Layers },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
              <s.icon className="h-4 w-4 mx-auto text-slate-400 mb-1" />
              <p className="text-lg font-black text-slate-800">{s.value}</p>
              <p className="text-[9px] font-medium text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lessons */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3">Vocabulary Topics</h2>
        <div className="space-y-3">
          {catLessons.map((lesson, idx) => {
            const { masteredCount, revisionCount, pct, phase } = getLessonStats(lesson);
            const wordCount = lesson.wordIds?.length || 0;
            const started = pct > 0;
            const priorityBadge = lesson.priority === 'high' ? 'bg-red-100 text-red-600' : lesson.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500';

            return (
              <div key={lesson.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group">
                <div className="flex items-start gap-4">
                  {/* Progress ring */}
                  <div className="relative h-14 w-14 shrink-0">
                    <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15" fill="none"
                        stroke={pct >= 80 ? '#10b981' : '#6366f1'}
                        strokeWidth="3"
                        strokeDasharray={`${(pct / 100) * 94} 94`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-black text-slate-700">{pct}%</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                      <h3 className="font-black text-slate-800">{lesson.name}</h3>
                      {lesson.priority !== 'low' && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityBadge} capitalize`}>
                          {lesson.priority} Priority
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{lesson.description}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {wordCount} Words
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {lesson.estimatedMinutes} min
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${DIFF_BADGE[lesson.difficulty]}`}>{lesson.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] text-slate-400">
                        <span className="font-bold text-emerald-600">{masteredCount}</span> Mastered
                      </span>
                      {revisionCount > 0 && (
                        <span className="text-[10px] text-slate-400">
                          <span className="font-bold text-amber-600">{revisionCount}</span> Need Revision
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => onStartLesson(lesson.id)}
                    size="sm"
                    className="shrink-0 font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {started ? 'Continue' : 'Start'} <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
          {catLessons.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 font-medium">No lessons published yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Home Screen ───────────────────────────────────────────────────────────────
const HomeScreen: React.FC<{
  stats: any;
  categories: any[];
  lessons: any[];
  lessonProgress: any[];
  userProgress: any[];
  activeWords: any[];
  revisionQueue: any[];
  vocabStreak: number;
  onOpenCategory: (id: string) => void;
  onOpenRevision: () => void;
  onOpenWordOfDay: (index?: number) => void;
}> = ({ stats, categories, lessons, lessonProgress, userProgress, activeWords, revisionQueue, vocabStreak, onOpenCategory, onOpenRevision, onOpenWordOfDay }) => {
  const [catFilter, setCatFilter] = useState('all');
  const [currentWoDIndex, setCurrentWoDIndex] = useState(0);
  
  const dailyWords = activeWords.slice(0, 10);
  const wordOfDay = dailyWords[currentWoDIndex];

  
  const today = new Date().toISOString().split('T')[0];
  const dueToday = revisionQueue.filter(r => r.nextRevisionDate <= today).length;

  const filteredCats = catFilter === 'all' ? categories.filter(c => c.isActive) : categories.filter(c => c.isActive && c.examTags?.includes(catFilter));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header stats */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Vocabulary</h1>
          </div>
          <p className="text-sm text-slate-500 pl-11">Build your word power every day</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-black text-orange-600">{vocabStreak}</span>
            <span className="text-xs text-orange-500 font-medium">Day Streak</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-black text-amber-600">{stats.mastered || 0}</span>
            <span className="text-xs text-amber-500 font-medium">Mastered</span>
          </div>
        </div>
      </div>

      {/* Journey stats */}
      <div className="bg-white rounded-2xl border p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="font-bold text-slate-800">Your Vocabulary Journey</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track your progress and master new words every day</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Sets', value: categories.filter(c => c.isActive).length },
            { label: 'Total Words', value: activeWords.length },
            { label: 'Words Mastered', value: stats.mastered || 0 },
            { label: 'In Progress', value: stats.inProgress || userProgress.filter(p => p.status === 'learning' || p.status === 'learned').length },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-slate-800">{s.value}</p>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Revision alert */}
      {dueToday > 0 && (
        <button
          onClick={onOpenRevision}
          className="w-full bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center gap-3 hover:bg-amber-100 transition-all group"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-amber-800">You have {dueToday} words due for revision today!</p>
            <p className="text-xs text-amber-600">Regular revision is the key to long-term retention.</p>
          </div>
          <span className="text-xs font-bold text-amber-700 group-hover:gap-2 flex items-center gap-1">
            Review Now <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>
      )}

      {/* Word of the Day */}
      {wordOfDay && (
        <div 
          onClick={() => onOpenWordOfDay(currentWoDIndex)}
          className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 sm:p-6 relative cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="absolute top-5 right-5 flex items-center gap-2 z-20">
            <button 
              onClick={(e) => { e.stopPropagation(); setCurrentWoDIndex(i => Math.max(0, i - 1)); }}
              disabled={currentWoDIndex === 0}
              className="h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-slate-400">{currentWoDIndex + 1} / {dailyWords.length}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setCurrentWoDIndex(i => Math.min(dailyWords.length - 1, i + 1)); }}
              disabled={currentWoDIndex === dailyWords.length - 1}
              className="h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Left Content */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-1.5 mb-4">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Daily Words</span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors">{wordOfDay.word}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.speak(new SpeechSynthesisUtterance(wordOfDay.word));
                    }
                  }}
                  className="h-8 w-8 rounded-full bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors shrink-0"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                {wordOfDay.pronunciation && (
                  <span className="text-slate-400 font-mono text-sm">/ {wordOfDay.pronunciation} /</span>
                )}
                {wordOfDay.partOfSpeech && (
                  <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md capitalize">{wordOfDay.partOfSpeech}</span>
                )}
              </div>
              <p className="text-slate-700 text-base font-medium leading-relaxed mb-6 max-w-lg line-clamp-2">
                {wordOfDay.meaning}
              </p>
              <div className="mt-auto">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Example
                </p>
                <div className="space-y-2">
                  {wordOfDay.example && (
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-emerald-600" />
                      </div>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed line-clamp-1">
                        {wordOfDay.example}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Image & Floating Card */}
            <div className="w-full md:w-[40%] flex flex-col justify-end relative">
              {wordOfDay.imageUrl && (
                <div className="w-full h-48 md:h-56 rounded-[1.5rem] overflow-hidden shadow-sm relative md:mb-4">
                  <img src={wordOfDay.imageUrl} alt={wordOfDay.word} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-4 absolute -bottom-4 right-0 md:-bottom-2 md:-left-6 max-w-[280px] z-10 flex gap-3 items-center group-hover:-translate-y-1 transition-transform">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm mb-0.5">Explore Complete Word</p>
                  <p className="text-xs text-slate-500">Synonyms, word family, quizzes & more.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-10 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3" onClick={e => e.stopPropagation()}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 h-12 rounded-xl text-base font-bold gap-1.5 shadow-sm shadow-emerald-200">
              <Check className="h-4 w-4" /> I Know This
            </Button>
            <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50 h-12 rounded-xl text-base font-bold gap-1.5">
              <RotateCcw className="h-4 w-4" /> Need Revision
            </Button>
          </div>
        </div>
      )}

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'banking', 'ssc', 'upsc', 'railway', 'defence'].map(f => (
          <button
            key={f}
            onClick={() => setCatFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all
              ${catFilter === f ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
          >
            {f === 'all' ? 'All Sets' : f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Category cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredCats.map((cat, idx) => {
          const catLessons = lessons.filter(l => l.categoryId === cat.id && l.status === 'published');
          const totalWords = catLessons.reduce((sum, l) => sum + (l.wordIds?.length || 0), 0);
          const masteredCount = userProgress.filter(p => {
            const inCat = catLessons.some(l => (l.wordIds || []).includes(p.wordId));
            return inCat && p.status === 'mastered';
          }).length;
          const pct = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
          const lastLesson = lessonProgress.filter(lp => catLessons.some(l => l.id === lp.lessonId)).sort((a, b) => (b.startedAt || '').localeCompare(a.startedAt || ''))[0];
          const lastStudied = lastLesson ? new Date(lastLesson.startedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : null;

          return (
            <div
              key={cat.id}
              onClick={() => onOpenCategory(cat.id)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all group"
            >
              <div className={`bg-gradient-to-br ${cat.color || CAT_GRADIENTS[idx % CAT_GRADIENTS.length]} px-4 pt-4 pb-3`}>
                <div className="text-3xl mb-1">{cat.icon || '📚'}</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(cat.examTags || []).slice(0, 1).map((tag: string) => (
                    <span key={tag} className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/30 text-white">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="px-3 pb-3 pt-2">
                <h3 className="text-xs font-black text-slate-800 leading-snug mb-1 line-clamp-2">{cat.name}</h3>
                <p className="text-[10px] text-slate-400 mb-2">{totalWords} Words</p>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[9px] font-bold text-slate-400">{pct}%</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400">{lastStudied ? `Last studied ${lastStudied}` : 'Not started'}</span>
                  <button className="text-[9px] font-bold text-indigo-600 flex items-center gap-0.5 group-hover:gap-1 transition-all">
                    {pct > 0 ? 'Continue' : 'Start'} <ChevronRight className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCats.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">No categories available yet</p>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const StudentVocabulary: React.FC = () => {
  const { user } = useAuth();
  const vocab = useVocabulary(user?.id || 'student_1');
  const {
    activeWords, stats, categories, lessons, lessonProgress, userProgress,
    revisionQueue, allRevisionEntries, vocabStreak,
    lessonWords, getWordProgress, getLessonProgress,
    markWordSelfAssessment, applyDecisionLogic,
    updateLessonPhase, markBookmark, markDifficult,
    advanceRevisionLevel, recordQuizAttempt, quizAttempts,
    getQuestionsForLesson,
  } = vocab as any;

  const [screen, setScreen] = useState<Screen>({ type: 'home' });
  const [nav, setNav] = useState<'overview' | 'mywords' | 'quiz' | 'revision'>('overview');

  // Per-lesson state
  const [selfAssessments, setSelfAssessments] = useState<Record<string, Record<string, any>>>({});
  const [flashcardScore, setFlashcardScore] = useState(0);
  const [spellingScore, setSpellingScore] = useState(0);
  const [quizResults, setQuizResults] = useState<any[]>([]);

  const getSelfAssessments = (lessonId: string) => selfAssessments[lessonId] || {};

  const handleSelfAssess = (lessonId: string, wordId: string, assessment: 'i_know' | 'need_revision') => {
    setSelfAssessments(prev => ({
      ...prev,
      [lessonId]: { ...(prev[lessonId] || {}), [wordId]: assessment }
    }));
    if (markWordSelfAssessment) markWordSelfAssessment(wordId, lessonId, assessment);
  };

  const currentLessonId = (screen as any).lessonId;
  const currentLesson = lessons?.find((l: any) => l.id === currentLessonId);
  const currentLessonWords = currentLessonId ? (lessonWords ? lessonWords(currentLessonId) : []) : [];
  const lessonQuestions = currentLessonId && getQuestionsForLesson ? getQuestionsForLesson(currentLessonId) : [];

  const handleApplyDecision = (wordId: string, selfAssessment: any, correct: boolean) => {
    if (applyDecisionLogic) applyDecisionLogic(wordId, selfAssessment, correct);
  };

  // Word of Day
  const wodIndex = (screen.type === 'wordofday' && (screen as any).index) || 0;
  if (screen.type === 'wordofday') {
    const dailyWords = activeWords.slice(0, 10);
    return (
      <UnifiedLearningView
        words={dailyWords}
        initialIndex={wodIndex}
        mode="browse"
        onExit={() => setScreen({ type: 'home' })}
      />
    );
  }

  // ── Learning ──
  if (screen.type === 'learning' && currentLesson) {
    return (
      <UnifiedLearningView
        lessonId={currentLessonId}
        words={currentLessonWords}
        mode="learning"
        selfAssessments={getSelfAssessments(currentLessonId)}
        onSelfAssess={handleSelfAssess}
        onBookmark={markBookmark || (() => { })}
        onDifficult={markDifficult || (() => { })}
        onExit={() => setScreen({ type: 'category', categoryId: currentLesson?.categoryId })}
        onComplete={() => setScreen({
          type: 'stage-complete', lessonId: currentLessonId,
          phase: 'learning', score: currentLessonWords.length, total: currentLessonWords.length
        })}
      />
    );
  }

  // ── Stage Complete (between phases) ──
  if (screen.type === 'stage-complete') {
    const sc = screen as { type: 'stage-complete'; lessonId: string; phase: 'learning' | 'flashcards' | 'spelling' | 'quiz'; score?: number; total?: number };
    return (
      <StageComplete
        phase={sc.phase}
        lessonName={currentLesson?.name || 'Lesson'}
        wordCount={currentLessonWords.length}
        score={sc.score}
        total={sc.total}
        onNext={() => {
          if (sc.phase === 'learning') {
            if (currentLessonId && updateLessonPhase) updateLessonPhase(currentLessonId, 'flashcards');
            setScreen({ type: 'flashcards', lessonId: currentLessonId });
          } else if (sc.phase === 'flashcards') {
            if (currentLessonId && updateLessonPhase) updateLessonPhase(currentLessonId, 'spelling');
            setScreen({ type: 'spelling', lessonId: currentLessonId });
          } else if (sc.phase === 'spelling') {
            if (currentLessonId && updateLessonPhase) updateLessonPhase(currentLessonId, 'quiz');
            setScreen({ type: 'quiz', lessonId: currentLessonId });
          } else if (sc.phase === 'quiz') {
            if (currentLessonId && updateLessonPhase) updateLessonPhase(currentLessonId, 'completed');
            setScreen({ type: 'result', lessonId: currentLessonId });
          }
        }}
        onExit={() => setScreen({ type: 'category', categoryId: currentLesson?.categoryId })}
      />
    );
  }

  // ── Flashcards ──
  if (screen.type === 'flashcards') {
    return (
      <FlashcardMode
        words={currentLessonWords}
        onComplete={(s) => { 
            setFlashcardScore(s); 
            setScreen({ type: 'stage-complete', lessonId: currentLessonId, phase: 'flashcards', score: s, total: currentLessonWords.length }); 
        }}
        onExit={() => setScreen({ type: 'category', categoryId: currentLesson?.categoryId })}
      />
    );
  }

  if (screen.type === 'spelling') {
    return (
      <SpellingTest
        words={currentLessonWords}
        onComplete={(s) => { 
            setSpellingScore(s); 
            setScreen({ type: 'stage-complete', lessonId: currentLessonId, phase: 'spelling', score: s, total: currentLessonWords.length }); 
        }}
        onExit={() => setScreen({ type: 'category', categoryId: currentLesson?.categoryId })}
      />
    );
  }

  if (screen.type === 'quiz') {
    return (
      <VocabularyQuiz
        questions={lessonQuestions}
        words={currentLessonWords}
        selfAssessments={getSelfAssessments(currentLessonId)}
        onComplete={(results) => { 
            setQuizResults(results); 
            setScreen({ type: 'stage-complete', lessonId: currentLessonId, phase: 'quiz', score: results.filter(r => r.correct).length, total: results.length }); 
        }}
        onExit={() => setScreen({ type: 'category', categoryId: currentLesson?.categoryId })}
      />
    );
  }

  if (screen.type === 'result') {
    return (
      <LessonResult
        lessonName={currentLesson?.name || 'Lesson'}
        quizResults={quizResults}
        spellingScore={spellingScore}
        flashcardScore={flashcardScore}
        wordCount={currentLessonWords.length}
        onBackToLesson={() => setScreen({ type: 'category', categoryId: currentLesson?.categoryId })}
        onApplyDecision={handleApplyDecision}
      />
    );
  }

  // Main shell with sidebar tabs
  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Tab navigation */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {[
          { key: 'overview', label: 'Overview', icon: Home },
          { key: 'mywords', label: 'Your Words', icon: BookMarked },
          { key: 'quiz', label: "Quiz's", icon: Brain },
          { key: 'revision', label: 'Revision', icon: RotateCcw },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setNav(t.key as any); setScreen({ type: 'home' }); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all
              ${nav === t.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <t.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {nav === 'overview' && screen.type === 'home' && (
        <HomeScreen
          stats={stats}
          categories={categories || []}
          lessons={lessons || []}
          lessonProgress={lessonProgress || []}
          userProgress={userProgress || []}
          activeWords={activeWords || []}
          revisionQueue={revisionQueue || []}
          vocabStreak={vocabStreak || 0}
          onOpenCategory={(id) => setScreen({ type: 'category', categoryId: id })}
          onOpenRevision={() => { setNav('revision'); }}
          onOpenWordOfDay={(index) => setScreen({ type: 'wordofday', index })}
        />
      )}

      {nav === 'overview' && screen.type === 'category' && (
        <CategoryPage
          categoryId={(screen as any).categoryId}
          categories={categories || []}
          lessons={lessons || []}
          lessonProgress={lessonProgress || []}
          words={activeWords || []}
          userProgress={userProgress || []}
          onStartLesson={(lessonId) => setScreen({ type: 'learning', lessonId })}
          onBack={() => setScreen({ type: 'home' })}
        />
      )}

      {nav === 'revision' && (
        <RevisionCenter
          revisionQueue={revisionQueue || []}
          allEntries={allRevisionEntries || []}
          words={activeWords || []}
          onStartRevision={() => { }}
          onAdvanceLevel={advanceRevisionLevel || (() => { })}
        />
      )}

      {nav === 'mywords' && (
        <MyWords
          words={activeWords || []}
          userProgress={userProgress || []}
        />
      )}

      {nav === 'quiz' && (
        <div className="bg-white rounded-2xl border p-8 text-center">
          <Brain className="h-12 w-12 mx-auto mb-3 text-indigo-400" />
          <h2 className="text-xl font-black text-slate-800 mb-2">Quiz Center</h2>
          <p className="text-slate-500 text-sm mb-4">Complete lessons to unlock vocabulary quizzes</p>
          <Button onClick={() => { setNav('overview'); setScreen({ type: 'home' }); }} className="gap-2">
            <BookOpen className="h-4 w-4" /> Browse Lessons
          </Button>
        </div>
      )}
    </div>
  );
};

export default function StudentVocabularyWrapper() {
  return (
    <ErrorBoundary>
      <StudentVocabulary />
    </ErrorBoundary>
  );
}
