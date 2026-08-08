import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useVocabulary } from '@/hooks/useVocabulary';
import { useAuth } from '@/app/providers';
import GrammarSyllabusView from '@/components/student/grammar/GrammarSyllabusView';
import {
  BookOpen, CheckCircle, RotateCcw, Brain, Star, Zap, Award,
  Target, ChevronRight, ChevronLeft, X, Volume2, Bookmark,
  AlertCircle, Flame, Trophy, Clock, Layers, ListChecks,
  ArrowRight, Check, Eye, EyeOff, Sparkles, TrendingUp,
  BookMarked, Flag, MoreHorizontal, Search, Filter,
  GraduationCap, Home, BarChart3, RefreshCw,
  MapPin, XCircle, Lightbulb, ArrowLeft,
  VolumeX, PlayCircle, MessageCircle,
  CalendarDays, Newspaper, FileText, Globe, PenTool, BookType,
  Shuffle, Edit3, HelpCircle, Timer, Pencil, Crosshair,
  Repeat2, AlignJustify
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
  const [popImgFailed, setPopImgFailed] = useState(false);
  const [toast, setToast] = useState<{ text: string; isRevision: boolean } | null>(null);

  const stockPhotoFallback = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop';

  useEffect(() => {
    setPopImgFailed(false);
  }, [currentIndex]);

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

  const handleAssessmentClick = (type: 'i_know' | 'need_revision') => {
    if (!word) return;
    onSelfAssess?.(lessonId || '', word.id, type);
    if (type === 'need_revision') {
      setToast({ text: `📌 "${word.word}" added to Tomorrow's Revision Queue!`, isRevision: true });
    } else {
      setToast({ text: `✨ "${word.word}" marked Mastered! Skipped from Revision`, isRevision: false });
    }
    setTimeout(() => setToast(null), 2200);
    goNext();
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

          {/* Right Column (Visual Image & Relationships) */}
          <div className="flex flex-col gap-8">
            {/* SuperAdmin Uploaded / Configured Image Display */}
            <div className="w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-md relative bg-slate-50 group">
              <img 
                src={(!popImgFailed && word.imageUrl) ? word.imageUrl : stockPhotoFallback} 
                alt={word.word} 
                className="w-full h-64 sm:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-700" 
                onError={() => setPopImgFailed(true)}
              />
            </div>

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

      {/* Toast Feedback Notification */}
      {toast && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-[600] px-4 py-2.5 rounded-full text-xs font-black shadow-xl animate-in fade-in slide-in-from-top-4 duration-200 flex items-center gap-2 ${
          toast.isRevision ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-emerald-600 text-white shadow-emerald-600/20'
        }`}>
          <span>{toast.text}</span>
        </div>
      )}

      {/* Bottom Action Bar (Learning & Daily Vocabulary Modes) */}
      {(mode === 'learning' || mode === 'browse') && (
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
                onClick={() => handleAssessmentClick('need_revision')} 
                className={`flex-1 h-12 bg-amber-50/80 border-amber-200 text-amber-800 hover:bg-amber-100 font-bold transition-all ${assessment === 'need_revision' ? 'border-amber-400 text-amber-900 bg-amber-100 shadow-xs' : ''}`}
              >
                <RotateCcw className="h-4 w-4 mr-1.5 text-amber-600"/> Need Revision
              </Button>
              <Button 
                onClick={() => handleAssessmentClick('i_know')} 
                className={`flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-bold transition-all ${assessment === 'i_know' ? 'bg-emerald-800' : ''}`}
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

// ─── Theme-Aware Image Map ─────────────────────────────────────────────────────
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

// ─── Word Theme Engine ──────────────────────────────────────────────────────────────
interface HeroTheme {
  bg: string;
  border: string;
  shadow: string;
  glow1: string;
  glow2: string;
  overlay: string;
  // badge + pos pill
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  // audio button
  audioBg: string;
  audioBorder: string;
  audioText: string;
  // text
  wordColor: string;
  wordGlow: string;
  textPrimary: string;
  textSecondary: string;
  pronColor: string;
  // chips
  synBg: string;
  synBorder: string;
  synColor: string;
  antBg: string;
  antBorder: string;
  antColor: string;
  // revision button
  revisionBorder: string;
  revisionText: string;
  // top-right controls (streak, nav)
  ctrlBg: string;
  ctrlBorder: string;
  ctrlText: string;
  // mastered badge
  mastBg: string;
  mastBorder: string;
  mastText: string;
  imageKey: string;
}

const HERO_THEMES: Record<string, HeroTheme> = {
  nature: {
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 55%, #ecfdf5 100%)',
    border: '1px solid rgba(34,197,94,0.2)',
    shadow: '0 4px 32px rgba(34,197,94,0.12)',
    glow1: 'radial-gradient(circle, rgba(34,197,94,0.18), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)',
    overlay: 'linear-gradient(to right, #f0fdf4 0%, rgba(240,253,244,0.9) 30%, rgba(240,253,244,0.2) 62%, transparent 100%)',
    badgeBg: 'rgba(16,185,129,0.12)', badgeBorder: 'rgba(16,185,129,0.3)', badgeText: '#059669',
    audioBg: 'rgba(16,185,129,0.12)', audioBorder: 'rgba(16,185,129,0.3)', audioText: '#059669',
    wordColor: '#064e3b', wordGlow: '0 1px 8px rgba(6,78,59,0.12)',
    textPrimary: '#065f46', textSecondary: '#6b7280', pronColor: '#9ca3af',
    synBg: 'rgba(16,185,129,0.1)', synBorder: 'rgba(16,185,129,0.25)', synColor: '#047857',
    antBg: 'rgba(251,146,60,0.1)', antBorder: 'rgba(251,146,60,0.25)', antColor: '#b45309',
    revisionBorder: 'rgba(217,119,6,0.4)', revisionText: '#b45309',
    ctrlBg: 'rgba(0,0,0,0.06)', ctrlBorder: 'rgba(0,0,0,0.1)', ctrlText: '#374151',
    mastBg: 'rgba(0,0,0,0.06)', mastBorder: 'rgba(0,0,0,0.1)', mastText: '#374151',
    imageKey: 'nature',
  },
  business: {
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 55%, #eff6ff 100%)',
    border: '1px solid rgba(96,165,250,0.2)',
    shadow: '0 4px 32px rgba(59,130,246,0.1)',
    glow1: 'radial-gradient(circle, rgba(96,165,250,0.2), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)',
    overlay: 'linear-gradient(to right, #eff6ff 0%, rgba(239,246,255,0.9) 30%, rgba(239,246,255,0.2) 62%, transparent 100%)',
    badgeBg: 'rgba(59,130,246,0.1)', badgeBorder: 'rgba(59,130,246,0.25)', badgeText: '#1d4ed8',
    audioBg: 'rgba(59,130,246,0.1)', audioBorder: 'rgba(59,130,246,0.25)', audioText: '#1d4ed8',
    wordColor: '#1e3a5f', wordGlow: '0 1px 8px rgba(30,58,95,0.12)',
    textPrimary: '#1e40af', textSecondary: '#64748b', pronColor: '#94a3b8',
    synBg: 'rgba(59,130,246,0.1)', synBorder: 'rgba(59,130,246,0.22)', synColor: '#1d4ed8',
    antBg: 'rgba(239,68,68,0.08)', antBorder: 'rgba(239,68,68,0.2)', antColor: '#b91c1c',
    revisionBorder: 'rgba(217,119,6,0.35)', revisionText: '#92400e',
    ctrlBg: 'rgba(0,0,0,0.06)', ctrlBorder: 'rgba(0,0,0,0.1)', ctrlText: '#374151',
    mastBg: 'rgba(0,0,0,0.06)', mastBorder: 'rgba(0,0,0,0.1)', mastText: '#374151',
    imageKey: 'business',
  },
  emotion: {
    bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 55%, #fff7f7 100%)',
    border: '1px solid rgba(251,113,133,0.2)',
    shadow: '0 4px 32px rgba(244,63,94,0.1)',
    glow1: 'radial-gradient(circle, rgba(251,113,133,0.2), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(236,72,153,0.12), transparent 70%)',
    overlay: 'linear-gradient(to right, #fff1f2 0%, rgba(255,241,242,0.9) 30%, rgba(255,241,242,0.2) 62%, transparent 100%)',
    badgeBg: 'rgba(236,72,153,0.1)', badgeBorder: 'rgba(236,72,153,0.25)', badgeText: '#be185d',
    audioBg: 'rgba(236,72,153,0.1)', audioBorder: 'rgba(236,72,153,0.25)', audioText: '#be185d',
    wordColor: '#831843', wordGlow: '0 1px 8px rgba(131,24,67,0.12)',
    textPrimary: '#9d174d', textSecondary: '#6b7280', pronColor: '#9ca3af',
    synBg: 'rgba(236,72,153,0.1)', synBorder: 'rgba(236,72,153,0.22)', synColor: '#be185d',
    antBg: 'rgba(251,146,60,0.1)', antBorder: 'rgba(251,146,60,0.22)', antColor: '#b45309',
    revisionBorder: 'rgba(217,119,6,0.35)', revisionText: '#92400e',
    ctrlBg: 'rgba(0,0,0,0.06)', ctrlBorder: 'rgba(0,0,0,0.1)', ctrlText: '#374151',
    mastBg: 'rgba(0,0,0,0.06)', mastBorder: 'rgba(0,0,0,0.1)', mastText: '#374151',
    imageKey: 'emotion',
  },
  science: {
    bg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 55%, #ecfeff 100%)',
    border: '1px solid rgba(34,211,238,0.2)',
    shadow: '0 4px 32px rgba(6,182,212,0.1)',
    glow1: 'radial-gradient(circle, rgba(34,211,238,0.2), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)',
    overlay: 'linear-gradient(to right, #ecfeff 0%, rgba(236,254,255,0.9) 30%, rgba(236,254,255,0.2) 62%, transparent 100%)',
    badgeBg: 'rgba(6,182,212,0.1)', badgeBorder: 'rgba(6,182,212,0.25)', badgeText: '#0e7490',
    audioBg: 'rgba(6,182,212,0.1)', audioBorder: 'rgba(6,182,212,0.25)', audioText: '#0e7490',
    wordColor: '#0c4a6e', wordGlow: '0 1px 8px rgba(12,74,110,0.12)',
    textPrimary: '#0e7490', textSecondary: '#64748b', pronColor: '#94a3b8',
    synBg: 'rgba(6,182,212,0.1)', synBorder: 'rgba(6,182,212,0.22)', synColor: '#0e7490',
    antBg: 'rgba(239,68,68,0.08)', antBorder: 'rgba(239,68,68,0.2)', antColor: '#b91c1c',
    revisionBorder: 'rgba(6,182,212,0.4)', revisionText: '#0e7490',
    ctrlBg: 'rgba(0,0,0,0.06)', ctrlBorder: 'rgba(0,0,0,0.1)', ctrlText: '#374151',
    mastBg: 'rgba(0,0,0,0.06)', mastBorder: 'rgba(0,0,0,0.1)', mastText: '#374151',
    imageKey: 'science',
  },
  history: {
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 55%, #fffbeb 100%)',
    border: '1px solid rgba(217,119,6,0.2)',
    shadow: '0 4px 32px rgba(180,83,9,0.1)',
    glow1: 'radial-gradient(circle, rgba(245,158,11,0.2), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(180,83,9,0.12), transparent 70%)',
    overlay: 'linear-gradient(to right, #fffbeb 0%, rgba(255,251,235,0.9) 30%, rgba(255,251,235,0.2) 62%, transparent 100%)',
    badgeBg: 'rgba(217,119,6,0.1)', badgeBorder: 'rgba(217,119,6,0.25)', badgeText: '#92400e',
    audioBg: 'rgba(217,119,6,0.1)', audioBorder: 'rgba(217,119,6,0.25)', audioText: '#92400e',
    wordColor: '#78350f', wordGlow: '0 1px 8px rgba(120,53,15,0.12)',
    textPrimary: '#92400e', textSecondary: '#6b7280', pronColor: '#9ca3af',
    synBg: 'rgba(217,119,6,0.1)', synBorder: 'rgba(217,119,6,0.22)', synColor: '#92400e',
    antBg: 'rgba(107,33,168,0.08)', antBorder: 'rgba(107,33,168,0.2)', antColor: '#6b21a8',
    revisionBorder: 'rgba(217,119,6,0.4)', revisionText: '#92400e',
    ctrlBg: 'rgba(0,0,0,0.06)', ctrlBorder: 'rgba(0,0,0,0.1)', ctrlText: '#374151',
    mastBg: 'rgba(0,0,0,0.06)', mastBorder: 'rgba(0,0,0,0.1)', mastText: '#374151',
    imageKey: 'history',
  },
  government: {
    bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 55%, #f5f3ff 100%)',
    border: '1px solid rgba(139,92,246,0.2)',
    shadow: '0 4px 32px rgba(124,58,237,0.1)',
    glow1: 'radial-gradient(circle, rgba(167,139,250,0.2), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)',
    overlay: 'linear-gradient(to right, #f5f3ff 0%, rgba(245,243,255,0.9) 30%, rgba(245,243,255,0.2) 62%, transparent 100%)',
    badgeBg: 'rgba(124,58,237,0.1)', badgeBorder: 'rgba(124,58,237,0.25)', badgeText: '#6d28d9',
    audioBg: 'rgba(124,58,237,0.1)', audioBorder: 'rgba(124,58,237,0.25)', audioText: '#6d28d9',
    wordColor: '#3730a3', wordGlow: '0 1px 8px rgba(55,48,163,0.12)',
    textPrimary: '#4338ca', textSecondary: '#64748b', pronColor: '#94a3b8',
    synBg: 'rgba(124,58,237,0.1)', synBorder: 'rgba(124,58,237,0.22)', synColor: '#6d28d9',
    antBg: 'rgba(239,68,68,0.08)', antBorder: 'rgba(239,68,68,0.2)', antColor: '#b91c1c',
    revisionBorder: 'rgba(217,119,6,0.35)', revisionText: '#92400e',
    ctrlBg: 'rgba(0,0,0,0.06)', ctrlBorder: 'rgba(0,0,0,0.1)', ctrlText: '#374151',
    mastBg: 'rgba(0,0,0,0.06)', mastBorder: 'rgba(0,0,0,0.1)', mastText: '#374151',
    imageKey: 'government',
  },
  economy: {
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 55%, #ecfdf5 100%)',
    border: '1px solid rgba(16,185,129,0.2)',
    shadow: '0 4px 32px rgba(5,150,105,0.1)',
    glow1: 'radial-gradient(circle, rgba(52,211,153,0.2), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)',
    overlay: 'linear-gradient(to right, #f0fdf4 0%, rgba(240,253,244,0.9) 30%, rgba(240,253,244,0.2) 62%, transparent 100%)',
    badgeBg: 'rgba(5,150,105,0.1)', badgeBorder: 'rgba(5,150,105,0.25)', badgeText: '#047857',
    audioBg: 'rgba(5,150,105,0.1)', audioBorder: 'rgba(5,150,105,0.25)', audioText: '#047857',
    wordColor: '#064e3b', wordGlow: '0 1px 8px rgba(6,78,59,0.12)',
    textPrimary: '#047857', textSecondary: '#6b7280', pronColor: '#9ca3af',
    synBg: 'rgba(5,150,105,0.1)', synBorder: 'rgba(5,150,105,0.22)', synColor: '#047857',
    antBg: 'rgba(234,179,8,0.1)', antBorder: 'rgba(234,179,8,0.22)', antColor: '#92400e',
    revisionBorder: 'rgba(217,119,6,0.35)', revisionText: '#92400e',
    ctrlBg: 'rgba(0,0,0,0.06)', ctrlBorder: 'rgba(0,0,0,0.1)', ctrlText: '#374151',
    mastBg: 'rgba(0,0,0,0.06)', mastBorder: 'rgba(0,0,0,0.1)', mastText: '#374151',
    imageKey: 'economy',
  },
  leadership: {
    bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 55%, #f1f5f9 100%)',
    border: '1px solid rgba(100,116,139,0.2)',
    shadow: '0 4px 32px rgba(71,85,105,0.1)',
    glow1: 'radial-gradient(circle, rgba(148,163,184,0.2), transparent 70%)',
    glow2: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)',
    overlay: 'linear-gradient(to right, #f8fafc 0%, rgba(248,250,252,0.9) 30%, rgba(248,250,252,0.2) 62%, transparent 100%)',
    badgeBg: 'rgba(71,85,105,0.1)', badgeBorder: 'rgba(71,85,105,0.22)', badgeText: '#334155',
    audioBg: 'rgba(71,85,105,0.1)', audioBorder: 'rgba(71,85,105,0.22)', audioText: '#334155',
    wordColor: '#0f172a', wordGlow: '0 1px 8px rgba(15,23,42,0.1)',
    textPrimary: '#1e293b', textSecondary: '#64748b', pronColor: '#94a3b8',
    synBg: 'rgba(71,85,105,0.1)', synBorder: 'rgba(71,85,105,0.2)', synColor: '#334155',
    antBg: 'rgba(239,68,68,0.08)', antBorder: 'rgba(239,68,68,0.18)', antColor: '#b91c1c',
    revisionBorder: 'rgba(217,119,6,0.35)', revisionText: '#92400e',
    ctrlBg: 'rgba(0,0,0,0.06)', ctrlBorder: 'rgba(0,0,0,0.1)', ctrlText: '#374151',
    mastBg: 'rgba(0,0,0,0.06)', mastBorder: 'rgba(0,0,0,0.1)', mastText: '#374151',
    imageKey: 'leadership',
  },
};

const detectThemeKey = (word: any): string => {
  const tags = (word?.examTags || []).map((t: string) => t.toLowerCase());
  const combined = `${(word?.meaning || '')} ${(word?.word || '')} ${(word?.category || '')}`.toLowerCase();

  // Exam tag fast-paths
  if (tags.includes('upsc') || tags.includes('government')) return 'government';
  if (tags.includes('banking') || tags.includes('economy') || tags.includes('finance')) return 'economy';
  if (tags.includes('ssc')) return 'business';
  if (tags.includes('railway') || tags.includes('defence')) return 'leadership';

  // Semantic keyword detection
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

  // Deterministic rotation by word length to ensure variety
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

// ─── Hero Word of the Day ─────────────────────────────────────────────────────
const HeroWordOfDay: React.FC<{
  activeWords: any[];
  userProgress: any[];
  vocabStreak: number;
  stats: any;
  onOpenWordOfDay: (index?: number) => void;
  onIKnowThis: (wordId: string) => void;
  onNeedRevision: (wordId: string) => void;
}> = ({ activeWords, userProgress, vocabStreak, stats, onOpenWordOfDay, onIKnowThis, onNeedRevision }) => {
  const [currentWoDIndex, setCurrentWoDIndex] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const [assessed, setAssessed] = useState<'i_know' | 'need_revision' | null>(null);

  const dailyWords = activeWords.slice(0, 10);
  const wordOfDay = dailyWords[currentWoDIndex];

  useEffect(() => { setImgFailed(false); setAssessed(null); }, [currentWoDIndex]);

  if (!wordOfDay) return null;

  const theme = getWordTheme(wordOfDay);
  const imgSrc = !imgFailed ? getContextualImage(wordOfDay) : THEME_IMAGES.default;

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((wordOfDay as any).audioUrl) {
      new Audio((wordOfDay as any).audioUrl).play().catch(() => {});
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(wordOfDay.word));
    }
  };

  return (
    <div
      onClick={() => onOpenWordOfDay(currentWoDIndex)}
      className="relative w-full rounded-3xl overflow-hidden cursor-pointer group"
      style={{ background: theme.bg, border: theme.border, boxShadow: theme.shadow, minHeight: '300px' }}
    >
      {/* Ambient glow orbs — theme-colored (placed under text area only) */}
      <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: theme.glow1, filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: theme.glow2, filter: 'blur(55px)' }} />

      {/* Right contextual image — sharp, vivid, 100% clear (no white haze/overlay) */}
      <div
        className="absolute top-0 right-0 bottom-0 w-[46%] pointer-events-none overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 100%)',
        }}
      >
        <img
          src={imgSrc}
          alt={wordOfDay.word}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700"
          onError={() => setImgFailed(true)}
        />
      </div>

      {/* Top-right controls */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1.5 bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-full px-3 py-1.5 shadow-sm">
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          <span className="text-xs font-black text-slate-800">{vocabStreak}</span>
          <span className="text-[10px] font-medium text-slate-500 hidden sm:inline">streak</span>
        </div>
        {dailyWords.length > 1 && (
          <div className="flex items-center gap-1 bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-full px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
            <button onClick={() => setCurrentWoDIndex(i => Math.max(0, i - 1))} disabled={currentWoDIndex === 0}
              className="hover:text-slate-900 disabled:opacity-30 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-1">{currentWoDIndex + 1} / {dailyWords.length}</span>
            <button onClick={() => setCurrentWoDIndex(i => Math.min(dailyWords.length - 1, i + 1))} disabled={currentWoDIndex === dailyWords.length - 1}
              className="hover:text-slate-900 disabled:opacity-30 transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Left content */}
      <div className="relative z-10 flex flex-col justify-center p-7 sm:p-9 lg:p-10 max-w-[62%]" style={{ minHeight: '300px' }}>
        {/* Theme-colored badge */}
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
            {wordOfDay.word}
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
          {wordOfDay.pronunciation && (
            <span className="font-mono text-xs" style={{ color: theme.pronColor }}>[ {wordOfDay.pronunciation} ]</span>
          )}
          {wordOfDay.partOfSpeech && (
            <span
              className="text-[11px] font-bold capitalize px-2.5 py-0.5 rounded-full"
              style={{ background: theme.badgeBg, border: `1px solid ${theme.badgeBorder}`, color: theme.badgeText }}
            >
              {wordOfDay.partOfSpeech}
            </span>
          )}
        </div>

        {/* Meaning */}
        <p className="text-sm sm:text-base font-semibold leading-relaxed mb-3 max-w-[440px]" style={{ color: theme.textPrimary }}>
          {wordOfDay.meaning}
        </p>

        {/* Example */}
        {wordOfDay.example && (
          <p className="text-xs sm:text-sm leading-relaxed italic mb-4 max-w-[440px]" style={{ color: theme.textSecondary }}>
            <span className="font-bold not-italic" style={{ color: theme.textPrimary }}>Example: </span>
            {wordOfDay.example}
          </p>
        )}

        {/* Synonyms + Antonyms — theme-colored chips */}
        {(wordOfDay.synonyms?.length > 0 || wordOfDay.antonyms?.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {wordOfDay.synonyms?.slice(0, 3).map((s: string) => (
              <span key={`hsy-${s}`}
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                style={{ background: theme.synBg, border: `1px solid ${theme.synBorder}`, color: theme.synColor }}>
                {s}
              </span>
            ))}
            {wordOfDay.antonyms?.slice(0, 2).map((a: string) => (
              <span key={`han-${a}`}
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
            onClick={(e) => {
              e.stopPropagation();
              onIKnowThis(wordOfDay.id);
              setAssessed('i_know');
              setTimeout(() => {
                setCurrentWoDIndex(i => Math.min(dailyWords.length - 1, i + 1));
              }, 200);
            }}
            className={`inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-full transition-all ${
              assessed === 'i_know'
                ? 'bg-emerald-500 text-white scale-95'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-200 hover:-translate-y-0.5 active:scale-95'
            }`}
          >
            <Check className="h-4 w-4" /> I Know This
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNeedRevision(wordOfDay.id);
              setAssessed('need_revision');
              setTimeout(() => {
                setCurrentWoDIndex(i => Math.min(dailyWords.length - 1, i + 1));
              }, 200);
            }}
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

      {/* Bottom-right mastered badge */}
      <div className="absolute bottom-5 right-5 z-10 flex items-center gap-1.5 bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-full px-3 py-1.5 shadow-sm">
        <Trophy className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-xs font-black text-slate-800">{stats?.mastered || 0}</span>
        <span className="text-[10px] font-medium text-slate-500">mastered</span>
      </div>
    </div>
  );
};

// ─── Home Screen ───────────────────────────────────────────────────────────────
const HomeScreen: React.FC<{
  categories: any[];
  lessons: any[];
  lessonProgress: any[];
  userProgress: any[];
  revisionQueue: any[];
  onOpenCategory: (id: string) => void;
  onOpenRevision: () => void;
}> = ({ categories, lessons, lessonProgress, userProgress, revisionQueue, onOpenCategory, onOpenRevision }) => {
  const [catFilter, setCatFilter] = useState('all');

  const today = new Date().toISOString().split('T')[0];
  const dueToday = revisionQueue.filter(r => r.nextRevisionDate <= today).length;

  const filteredCats = catFilter === 'all'
    ? categories.filter(c => c.isActive)
    : categories.filter(c => c.isActive && c.examTags?.includes(catFilter));

  return (
    <div className="space-y-5">
      {/* Revision alert */}
      {dueToday > 0 && (
        <button
          onClick={onOpenRevision}
          className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 hover:bg-amber-100 transition-all group text-left"
        >
          <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="h-5 w-5" />
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

      {/* Section header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-base font-black text-slate-800">Learning Paths</h2>
          <p className="text-xs text-slate-500 mt-0.5">Pick a category and continue your journey</p>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {['all', 'banking', 'ssc', 'upsc', 'railway', 'defence'].map(f => (
          <button
            key={f}
            onClick={() => setCatFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all
              ${catFilter === f
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'}`}
          >
            {f === 'all' ? 'All Sets' : f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Learning path cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCats.map((cat, idx) => {
          const catLessons = lessons.filter(l => l.categoryId === cat.id && l.status === 'published');
          const topicsCount = catLessons.length;
          const totalWords = catLessons.reduce((sum, l) => sum + (l.wordIds?.length || 0), 0);
          const masteredCount = userProgress.filter(p => {
            const inCat = catLessons.some(l => (l.wordIds || []).includes(p.wordId));
            return inCat && p.status === 'mastered';
          }).length;
          const revisionCount = userProgress.filter(p => {
            const inCat = catLessons.some(l => (l.wordIds || []).includes(p.wordId));
            return inCat && (p.status === 'learning' || p.status === 'learned');
          }).length;
          const pct = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
          const lastLesson = lessonProgress
            .filter(lp => catLessons.some(l => l.id === lp.lessonId))
            .sort((a, b) => (b.startedAt || '').localeCompare(a.startedAt || ''))[0];
          const lastStudied = lastLesson
            ? new Date(lastLesson.startedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
            : null;

          return (
            <div
              key={cat.id}
              onClick={() => onOpenCategory(cat.id)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group"
            >
              {/* Gradient header */}
              <div className={`bg-gradient-to-br ${cat.color || CAT_GRADIENTS[idx % CAT_GRADIENTS.length]} px-5 py-4`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
                      {cat.icon || '📚'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-white text-sm leading-snug truncate">{cat.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-white/75 text-[10px] font-semibold">
                          {topicsCount} {topicsCount === 1 ? 'Topic' : 'Topics'}
                        </span>
                        <span className="text-white/40 text-[10px]">·</span>
                        <span className="text-white/75 text-[10px] font-semibold">{totalWords} Words</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:bg-white/30 group-hover:translate-x-0.5 transition-all ml-2">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Stats + progress */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-4 mb-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-600">{masteredCount} Mastered</span>
                  </div>
                  {revisionCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-amber-600">{revisionCount} Need Revision</span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2.5">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 80 ? '#10b981' : pct >= 40 ? 'linear-gradient(to right, #6366f1, #8b5cf6)' : '#94a3b8',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {lastStudied ? `Last: ${lastStudied}` : pct > 0 ? `${pct}% done` : 'Not started'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-black text-indigo-600 group-hover:gap-1.5 transition-all">
                    {pct > 0 ? 'Continue' : 'Start'} <ArrowRight className="h-3 w-3" />
                  </span>
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

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GRAMMAR HUB ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

type GrammarNav = 'daily' | 'editorial' | 'reading' | 'lessons' | 'affairs' | 'practice';

// ── Grammar data ──────────────────────────────────────────────────────────────
const GRAMMAR_LESSONS = [
  { id: 'tenses', title: 'Tenses', icon: '⏱️', desc: 'Simple, Perfect, Continuous, Perfect Continuous — all 12 tenses with rules & examples', topics: 12, difficulty: 'Medium', color: 'from-violet-500 to-purple-600', tag: 'Core' },
  { id: 'articles', title: 'Articles', icon: '📰', desc: 'Definite & indefinite articles (a, an, the) — when to use and when to omit', topics: 6, difficulty: 'Easy', color: 'from-blue-500 to-indigo-600', tag: 'Core' },
  { id: 'subject-verb', title: 'Subject-Verb Agreement', icon: '🤝', desc: 'Singular/plural concord, collective nouns, indefinite pronouns, either/neither', topics: 8, difficulty: 'Medium', color: 'from-emerald-500 to-teal-600', tag: 'Core' },
  { id: 'prepositions', title: 'Prepositions', icon: '📍', desc: 'Prepositions of time, place, direction, and commonly confused pairs', topics: 10, difficulty: 'Hard', color: 'from-rose-500 to-pink-600', tag: 'Tricky' },
  { id: 'voice', title: 'Active & Passive Voice', icon: '🔄', desc: 'Converting sentences across all tenses; impersonal passive; modal passives', topics: 7, difficulty: 'Medium', color: 'from-amber-500 to-orange-500', tag: 'Exam' },
  { id: 'narration', title: 'Direct & Indirect Speech', icon: '💬', desc: 'Reporting statements, questions, orders, exclamations — with tense shifts', topics: 8, difficulty: 'Hard', color: 'from-cyan-500 to-blue-500', tag: 'Exam' },
  { id: 'modifiers', title: 'Modifiers & Clauses', icon: '✏️', desc: 'Adjective clauses, adverb clauses, dangling modifiers, misplaced modifiers', topics: 9, difficulty: 'Hard', color: 'from-fuchsia-500 to-pink-500', tag: 'Advanced' },
  { id: 'conditionals', title: 'Conditionals', icon: '🔀', desc: 'Zero, First, Second, Third and Mixed conditionals with exam applications', topics: 5, difficulty: 'Hard', color: 'from-indigo-500 to-violet-600', tag: 'Advanced' },
  { id: 'conjunctions', title: 'Conjunctions', icon: '🔗', desc: 'Co-ordinating, subordinating, correlative conjunctions and their correct use', topics: 6, difficulty: 'Medium', color: 'from-sky-500 to-cyan-600', tag: 'Core' },
  { id: 'pronouns', title: 'Pronouns', icon: '👤', desc: 'Personal, reflexive, relative, interrogative, indefinite pronouns', topics: 7, difficulty: 'Medium', color: 'from-lime-500 to-green-600', tag: 'Core' },
  { id: 'degrees', title: 'Degrees of Comparison', icon: '📊', desc: 'Positive, comparative, superlative — irregular forms and exam traps', topics: 5, difficulty: 'Easy', color: 'from-teal-500 to-emerald-600', tag: 'Core' },
  { id: 'punctuation', title: 'Punctuation & Capitalization', icon: '✍️', desc: 'Comma, semicolon, colon, apostrophe — usage rules and common errors', topics: 6, difficulty: 'Medium', color: 'from-orange-500 to-red-500', tag: 'Core' },
  { id: 'gerunds', title: 'Gerunds & Infinitives', icon: '🎯', desc: 'Verbs followed by gerunds vs infinitives; participial phrases', topics: 6, difficulty: 'Hard', color: 'from-pink-500 to-rose-600', tag: 'Advanced' },
  { id: 'determiners', title: 'Determiners', icon: '🎲', desc: 'Articles, demonstratives, possessives, quantifiers — placement and use', topics: 5, difficulty: 'Easy', color: 'from-violet-400 to-purple-500', tag: 'Core' },
  { id: 'concord', title: 'Rules of Concord', icon: '📐', desc: 'Collective nouns, intervening phrases, either/or, neither/nor agreement', topics: 7, difficulty: 'Medium', color: 'from-blue-400 to-indigo-500', tag: 'Tricky' },
  { id: 'parallelism', title: 'Parallelism', icon: '⚖️', desc: 'Parallel structure in lists, comparisons, correlative conjunctions', topics: 4, difficulty: 'Hard', color: 'from-emerald-400 to-teal-500', tag: 'Advanced' },
];

const PRACTICE_SECTIONS = [
  { id: 'error-spotting', title: 'Error Spotting', icon: Crosshair, color: 'from-red-500 to-rose-600', bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', desc: 'Identify grammatical errors in sentences', count: 50, tag: 'Popular' },
  { id: 'sentence-improvement', title: 'Sentence Improvement', icon: Edit3, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', desc: 'Choose the correct improved version', count: 40, tag: 'SSC · IBPS' },
  { id: 'fill-blanks', title: 'Fill in the Blanks', icon: PenTool, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', desc: 'Fill with correct grammar/vocabulary', count: 60, tag: 'Core' },
  { id: 'para-jumbles', title: 'Para Jumbles', icon: Shuffle, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', desc: 'Rearrange sentences to form a coherent paragraph', count: 30, tag: 'Exam' },
  { id: 'cloze-test', title: 'Cloze Test', icon: AlignJustify, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', desc: 'Fill blanks in a connected passage', count: 25, tag: 'Bank PO' },
  { id: 'reading-comp', title: 'Reading Comprehension', icon: BookOpen, color: 'from-sky-500 to-blue-600', bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700', desc: 'Passage-based comprehension questions', count: 20, tag: 'High Value' },
  { id: 'idioms', title: 'Idioms & Phrases', icon: Sparkles, color: 'from-fuchsia-500 to-pink-600', bg: 'bg-fuchsia-50', border: 'border-fuchsia-100', text: 'text-fuchsia-700', desc: 'Meaning and usage of common idioms', count: 80, tag: 'SSC · Railway' },
  { id: 'one-word', title: 'One Word Substitution', icon: Zap, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-700', desc: 'Single word for a group of words', count: 100, tag: 'All Exams' },
  { id: 'phrasal-verbs', title: 'Phrasal Verbs', icon: Repeat2, color: 'from-lime-500 to-green-600', bg: 'bg-lime-50', border: 'border-lime-100', text: 'text-lime-700', desc: 'Meaning and use of common phrasal verbs', count: 70, tag: 'Bank · SSC' },
];

const EDITORIAL_DATA = {
  title: 'Bridging the Divide: India\'s Digital Equity Challenge',
  date: 'Today · 29 Jul 2026',
  source: 'The Hindu Editorial',
  summary: 'India\'s ambitious digital push has accelerated growth in urban centres, yet a vast rural-urban divide persists in internet access, digital literacy, and financial inclusion. The article argues for a holistic policy framework that goes beyond mere infrastructure.',
  toughLines: [
    { line: '"The euphoria surrounding fintech must not obfuscate the systemic inequities that digital adoption has simultaneously exacerbated."', meaning: 'The excitement about financial technology should not hide the existing inequalities that digital growth has made worse.' },
    { line: '"Inclusive growth mandates equitable access — not the mere proliferation of devices."', meaning: 'Real inclusive growth requires fair access for everyone, not just spreading gadgets around.' },
  ],
  vocabWords: [
    { word: 'Obfuscate', meaning: 'To make something unclear or confusing', pos: 'verb' },
    { word: 'Exacerbate', meaning: 'To make a problem worse', pos: 'verb' },
    { word: 'Proliferation', meaning: 'Rapid increase in number', pos: 'noun' },
    { word: 'Mandates', meaning: 'Officially requires', pos: 'verb' },
    { word: 'Euphoria', meaning: 'Intense happiness or excitement', pos: 'noun' },
    { word: 'Equitable', meaning: 'Fair and impartial', pos: 'adjective' },
  ],
  comprehension: [
    'What does the author mean by "digital equity" in the context of this article?',
    'Which two sectors does the author primarily focus on as measures of digital inclusion?',
    'What is the author\'s primary recommendation for policymakers?',
  ],
  grammarTakeaway: 'The editorial uses passive voice extensively ("must not obfuscate", "has exacerbated") to maintain objectivity. Notice how impersonal constructions lend authority to arguments.',
};

const DAILY_GRAMMAR_RULE = {
  rule: 'Use "fewer" for countable nouns and "less" for uncountable nouns.',
  wrong: 'There are less students in the class today.',
  right: 'There are fewer students in the class today.',
  why: '"Students" is countable (you can count them individually), so "fewer" is grammatically correct. "Less" is reserved for uncountable quantities like water, time, or information.',
};

const READING_PASSAGES = [
  {
    id: 'p1', title: 'The Paradox of Choice', level: 'Medium', time: '5 min', words: 280,
    tag: 'Psychology',
    text: 'In a world overflowing with options, consumers often find themselves paralysed rather than empowered. Psychologist Barry Schwartz termed this phenomenon the "paradox of choice" — the counterintuitive finding that too many options can lead to anxiety, regret, and diminished satisfaction. Studies show that when shoppers are presented with fewer varieties of jam, they are more likely to make a purchase than when offered a wider selection. The implication for modern life is profound: abundance, rather than liberating us, can be a source of paralysis.',
    questions: [
      { q: 'The word "paralysed" in context most nearly means:', options: ['Physically disabled', 'Unable to decide', 'Overjoyed', 'Energised'], ans: 1 },
      { q: 'The tone of the passage is best described as:', options: ['Celebratory', 'Neutral-analytical', 'Alarmist', 'Sarcastic'], ans: 1 },
      { q: 'What is the central paradox discussed?', options: ['More choices lead to less happiness', 'Choices are always beneficial', 'Anxiety leads to better choices', 'Consumers prefer no choices'], ans: 0 },
    ],
  },
  {
    id: 'p2', title: 'Arctic Ice and Climate Signals', level: 'Hard', time: '7 min', words: 350,
    tag: 'Environment',
    text: 'The Arctic, often described as Earth\'s air conditioner, is warming four times faster than the global average. This accelerated warming, termed Arctic amplification, has far-reaching consequences — from disrupting the jet stream to threatening indigenous communities whose livelihoods depend on ice. Sea ice extent, which scientists have monitored since the 1970s, has declined sharply, with summer minimums breaking records almost every decade. The feedback loop is self-reinforcing: as ice melts, the dark ocean absorbs more heat, accelerating further melting.',
    questions: [
      { q: 'Why is the Arctic called "Earth\'s air conditioner"?', options: ['It cools polar regions', 'It regulates global temperatures', 'It absorbs pollution', 'It produces cold air'], ans: 1 },
      { q: 'The word "amplification" most nearly means:', options: ['Reduction', 'Stabilisation', 'Intensification', 'Confusion'], ans: 2 },
      { q: 'Which group is mentioned as being directly threatened?', options: ['Scientists', 'Governments', 'Indigenous communities', 'Corporations'], ans: 2 },
    ],
  },
];

const CURRENT_AFFAIRS_WORDS = [
  { word: 'Disinvestment', meaning: 'Government sale of its shares in public sector companies', context: 'Budget & Economy', tag: 'UPSC · Banking' },
  { word: 'Fiscal Consolidation', meaning: 'Policies to reduce government deficit and debt', context: 'Budget & Economy', tag: 'UPSC · Banking' },
  { word: 'Sovereign Green Bonds', meaning: 'Government bonds issued to fund eco-friendly projects', context: 'Finance', tag: 'Banking PO' },
  { word: 'Sanctions Regime', meaning: 'System of penalties imposed on a country by others', context: 'International Relations', tag: 'UPSC' },
  { word: 'Monsoon Trough', meaning: 'Low pressure zone that drives monsoon rains in India', context: 'Geography', tag: 'All Exams' },
  { word: 'Unicorn Startup', meaning: 'A privately held startup valued at over $1 billion', context: 'Economy & Tech', tag: 'Banking · SSC' },
  { word: 'Pandemic Treaty', meaning: 'International agreement on global disease preparedness', context: 'International Affairs', tag: 'UPSC · GK' },
  { word: 'Delimitation', meaning: 'Process of redrawing electoral constituency boundaries', context: 'Polity', tag: 'UPSC · SSC' },
  { word: 'Quantum Computing', meaning: 'Computing using quantum-mechanical phenomena', context: 'Science & Tech', tag: 'UPSC · CDS' },
  { word: 'Urban Heat Island', meaning: 'Urban area significantly warmer than surrounding rural areas', context: 'Environment', tag: 'UPSC · SSC' },
];

// ── GrammarHubPage ────────────────────────────────────────────────────────────
const GrammarHubPage: React.FC = () => {
  const [grammarNav, setGrammarNav] = useState<GrammarNav>('daily');
  const [grammarStreak] = useState(7);
  const [selectedPassage, setSelectedPassage] = useState<typeof READING_PASSAGES[0] | null>(null);
  const [passageAnswers, setPassageAnswers] = useState<Record<string, number>>({});
  const [passageSubmitted, setPassageSubmitted] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dailyDone, setDailyDone] = useState<Record<string, boolean>>({});

  const GRAMMAR_NAV_TABS: { key: GrammarNav; label: string; icon: React.ElementType }[] = [
    { key: 'daily', label: 'Daily Practice', icon: CalendarDays },
    { key: 'editorial', label: 'Editorial', icon: Newspaper },
    { key: 'reading', label: 'Reading', icon: FileText },
    { key: 'lessons', label: 'Lessons', icon: BookType },
    { key: 'affairs', label: 'Current Affairs', icon: Globe },
    { key: 'practice', label: 'Practice Hub', icon: PenTool },
  ];

  const filteredLessons = GRAMMAR_LESSONS.filter(l => {
    const matchDiff = difficultyFilter === 'All' || l.difficulty === difficultyFilter;
    const matchSearch = !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDiff && matchSearch;
  });

  // ── Daily Practice ──
  const renderDaily = () => (
    <div className="space-y-4">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #6d28d9 100%)', minHeight: 160 }}>
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full" style={{ background: 'rgba(167,139,250,0.2)', filter: 'blur(40px)' }} />
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-200 bg-white/10 px-3 py-1 rounded-full">📅 Daily Practice</span>
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
              <Flame className="h-3.5 w-3.5 text-orange-300" />
              <span className="text-xs font-black text-white">{grammarStreak}</span>
              <span className="text-[10px] text-purple-200">day streak</span>
            </div>
          </div>
          <h2 className="text-2xl font-black text-white mb-1">Today's Grammar Drill</h2>
          <p className="text-purple-200 text-sm">Complete all 5 tasks to maintain your streak</p>
          <div className="flex gap-2 mt-4 flex-wrap">
            {['Rule', 'Fix It', 'Passage', 'Quiz', 'Word'].map((t, i) => (
              <div key={t} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                dailyDone[t] ? 'bg-emerald-400 text-white' : 'bg-white/15 text-purple-200'
              }`}>
                {dailyDone[t] ? <Check className="h-3 w-3" /> : <span className="text-[10px] opacity-60">{i + 1}</span>}
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grammar Rule of the Day */}
      <div className="bg-white rounded-2xl border border-violet-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-xl bg-violet-100 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">Rule of the Day</p>
            <h3 className="text-sm font-black text-slate-800">Fewer vs Less</h3>
          </div>
          <button onClick={() => setDailyDone(p => ({ ...p, Rule: true }))} className="ml-auto flex items-center gap-1 text-[11px] font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full hover:bg-violet-100 transition-all">
            <Check className="h-3 w-3" /> Got It
          </button>
        </div>
        <div className="bg-violet-50 rounded-xl p-4 mb-3">
          <p className="text-sm font-semibold text-violet-900">{DAILY_GRAMMAR_RULE.rule}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-50 border border-red-100 rounded-xl p-3">
            <p className="text-[10px] font-black text-red-500 uppercase mb-1">✗ Incorrect</p>
            <p className="text-xs text-red-800">{DAILY_GRAMMAR_RULE.wrong}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
            <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">✓ Correct</p>
            <p className="text-xs text-emerald-800">{DAILY_GRAMMAR_RULE.right}</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">{DAILY_GRAMMAR_RULE.why}</p>
      </div>

      {/* Fix It — Sentence Correction */}
      <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center">
            <Edit3 className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Fix It</p>
            <h3 className="text-sm font-black text-slate-800">Spot the Error</h3>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 mb-3">
          <p className="text-sm text-slate-700">
            "Each of the students <span className="bg-amber-200 px-1 rounded font-bold text-amber-900">have</span> submitted their assignment on time."
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['has', 'have', 'had', 'having'].map((opt, i) => (
            <button
              key={opt}
              onClick={() => setDailyDone(p => ({ ...p, 'Fix It': true }))}
              className={`px-3 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                opt === 'has'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-700'
              }`}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Mini quiz */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-xl bg-indigo-100 flex items-center justify-center">
            <HelpCircle className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Mini Quiz</p>
            <h3 className="text-sm font-black text-slate-800">Grammar Quick Fire</h3>
          </div>
          <span className="ml-auto text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">3 Qs</span>
        </div>
        <p className="text-sm font-semibold text-slate-700 mb-3">Which sentence uses the correct tense?</p>
        <div className="space-y-2">
          {[
            'By the time she arrived, he has already left.',
            'By the time she arrived, he had already left.',
            'By the time she arrives, he had already left.',
            'By the time she had arrived, he has left.',
          ].map((opt, i) => (
            <button
              key={i}
              onClick={() => setDailyDone(p => ({ ...p, Quiz: true }))}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all ${
                i === 1 ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold hover:bg-emerald-100' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Editorial ──
  const renderEditorial = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 bg-white/10 px-2.5 py-1 rounded-full">{EDITORIAL_DATA.source}</span>
            <span className="text-[10px] text-slate-400">{EDITORIAL_DATA.date}</span>
          </div>
          <h2 className="text-lg font-black text-white leading-snug">{EDITORIAL_DATA.title}</h2>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">📋 Summary</p>
            <p className="text-sm text-slate-600 leading-relaxed">{EDITORIAL_DATA.summary}</p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">🔍 Tough Lines Decoded</p>
            <div className="space-y-3">
              {EDITORIAL_DATA.toughLines.map((tl, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-xs italic text-slate-700 mb-2">{tl.line}</p>
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-600">{tl.meaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">📖 Words from This Editorial</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EDITORIAL_DATA.vocabWords.map(vw => (
                <div key={vw.word} className="flex items-start gap-3 bg-violet-50 border border-violet-100 rounded-xl p-3">
                  <div className="shrink-0">
                    <span className="font-black text-sm text-violet-700">{vw.word}</span>
                    <span className="text-[10px] text-violet-400 ml-1.5 font-medium">({vw.pos})</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{vw.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">❓ Comprehension Questions</p>
            <div className="space-y-2">
              {EDITORIAL_DATA.comprehension.map((q, i) => (
                <div key={i} className="flex items-start gap-3 bg-white border border-slate-100 rounded-xl p-3">
                  <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                  <p className="text-xs text-slate-700">{q}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">✍️ Grammar Takeaway</p>
            <p className="text-xs text-amber-900 leading-relaxed">{EDITORIAL_DATA.grammarTakeaway}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Reading Comprehension ──
  const renderReading = () => {
    if (selectedPassage) {
      const allAnswered = selectedPassage.questions.every((_, i) => passageAnswers[`${selectedPassage.id}-${i}`] !== undefined);
      return (
        <div className="space-y-4">
          <button onClick={() => { setSelectedPassage(null); setPassageAnswers({}); setPassageSubmitted(false); }}
            className="flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-800 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Passages
          </button>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                selectedPassage.level === 'Hard' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>{selectedPassage.level}</span>
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Timer className="h-3 w-3" />{selectedPassage.time}</span>
              <span className="text-[10px] text-slate-400 font-medium">{selectedPassage.words} words</span>
              <span className="ml-auto text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-1 rounded-full">{selectedPassage.tag}</span>
            </div>
            <h3 className="text-base font-black text-slate-800 mb-3">{selectedPassage.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">{selectedPassage.text}</p>
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comprehension Questions</p>
              {selectedPassage.questions.map((q, qi) => {
                const key = `${selectedPassage.id}-${qi}`;
                const chosen = passageAnswers[key];
                return (
                  <div key={qi}>
                    <p className="text-sm font-bold text-slate-700 mb-2">{qi + 1}. {q.q}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, oi) => {
                        let cls = 'border-slate-100 bg-slate-50 text-slate-600 hover:border-violet-200 hover:bg-violet-50';
                        if (passageSubmitted) {
                          if (oi === q.ans) cls = 'border-emerald-200 bg-emerald-50 text-emerald-800 font-bold';
                          else if (oi === chosen) cls = 'border-red-200 bg-red-50 text-red-700';
                        } else if (oi === chosen) cls = 'border-violet-300 bg-violet-50 text-violet-700 font-bold';
                        return (
                          <button key={oi} onClick={() => !passageSubmitted && setPassageAnswers(p => ({ ...p, [key]: oi }))}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all ${cls}`}>
                            <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            {!passageSubmitted ? (
              <button
                onClick={() => allAnswered && setPassageSubmitted(true)}
                className={`mt-4 w-full py-3 rounded-xl font-bold text-sm transition-all ${
                  allAnswered ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Submit Answers
              </button>
            ) : (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <Trophy className="h-6 w-6 text-amber-500 mx-auto mb-1" />
                <p className="text-sm font-black text-emerald-800">
                  Score: {selectedPassage.questions.filter((q, qi) => passageAnswers[`${selectedPassage.id}-${qi}`] === q.ans).length} / {selectedPassage.questions.length}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-800">Reading Comprehension</h3>
          <p className="text-xs text-slate-500 mt-0.5">Exam-level passages with inference, vocabulary in context, and timed practice</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Easy', 'Medium', 'Hard'].map(f => (
            <button key={f} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              f === 'All' ? 'bg-violet-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600'
            }`}>{f}</button>
          ))}
        </div>
        <div className="space-y-3">
          {READING_PASSAGES.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-violet-200 transition-all cursor-pointer group"
              onClick={() => { setSelectedPassage(p); setPassageAnswers({}); setPassageSubmitted(false); }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      p.level === 'Hard' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>{p.level}</span>
                    <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{p.tag}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto"><Timer className="h-3 w-3" />{p.time}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-800 mb-1">{p.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{p.text}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-violet-500 transition-colors ml-3 shrink-0 mt-1" />
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50">
                <span className="text-[11px] text-slate-400">{p.words} words</span>
                <span className="text-[11px] text-slate-400">{p.questions.length} questions</span>
                <span className="ml-auto text-[11px] font-bold text-violet-600 flex items-center gap-1 group-hover:gap-1.5 transition-all">Start <ArrowRight className="h-3 w-3" /></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Grammar Lessons ──
  const renderLessons = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search grammar topics…"
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:border-violet-400 transition-all"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['All', 'Easy', 'Medium', 'Hard'].map(f => (
          <button
            key={f}
            onClick={() => setDifficultyFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              difficultyFilter === f ? 'bg-violet-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300'
            }`}
          >{f}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map(lesson => (
          <div
            key={lesson.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl hover:border-violet-200 transition-all duration-300 group"
          >
            <div className={`bg-gradient-to-br ${lesson.color} px-5 py-4`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">{lesson.icon}</div>
                  <div>
                    <h3 className="font-black text-white text-sm leading-snug">{lesson.title}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-white/75 text-[10px] font-semibold">{lesson.topics} subtopics</span>
                      <span className="text-white/40 text-[10px]">·</span>
                      <span className="text-white/75 text-[10px] font-semibold">{lesson.difficulty}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full shrink-0">{lesson.tag}</span>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-slate-500 leading-relaxed mb-3">{lesson.desc}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Lessons</span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Quiz</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-black text-violet-600 group-hover:gap-1.5 transition-all">
                  Start <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredLessons.length === 0 && (
        <div className="text-center py-12">
          <BookType className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">No topics match your filter</p>
        </div>
      )}
    </div>
  );

  // ── Current Affairs ──
  const renderAffairs = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Current Affairs English</span>
        </div>
        <h2 className="text-lg font-black text-white">News-Based Vocabulary</h2>
        <p className="text-slate-400 text-xs mt-1">Important words from today's headlines — explained in plain English</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CURRENT_AFFAIRS_WORDS.map(w => (
          <div key={w.word} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md hover:border-violet-200 transition-all">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-black text-slate-800 text-sm">{w.word}</h3>
              <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full shrink-0 ml-2">{w.tag}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">{w.meaning}</p>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-slate-400" />
              <span className="text-[10px] text-slate-400 font-medium">{w.context}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Practice Hub ──
  const renderPractice = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-black text-slate-800">Practice Hub</h3>
        <p className="text-xs text-slate-500 mt-0.5">All exam-relevant practice formats in one place</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRACTICE_SECTIONS.map(sec => (
          <div
            key={sec.id}
            className={`bg-white rounded-2xl border ${sec.border} p-5 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${sec.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl ${sec.bg} flex items-center justify-center`}>
                  <sec.icon className={`h-5 w-5 ${sec.text}`} />
                </div>
                {sec.tag && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${sec.bg} ${sec.text}`}>{sec.tag}</span>
                )}
              </div>
              <h3 className="font-black text-slate-800 text-sm mb-1">{sec.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">{sec.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">{sec.count}+ questions</span>
                <span className={`flex items-center gap-1 text-[11px] font-black ${sec.text} group-hover:gap-1.5 transition-all`}>
                  Practice <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Grammar Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden" style={{
        background: 'linear-gradient(135deg, #3b0764 0%, #581c87 40%, #4c1d95 100%)',
        minHeight: 180,
        boxShadow: '0 8px 40px rgba(91,33,182,0.25)',
      }}>
        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full" style={{ background: 'rgba(167,139,250,0.15)', filter: 'blur(50px)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full" style={{ background: 'rgba(139,92,246,0.12)', filter: 'blur(60px)' }} />
        <div className="relative z-10 p-7">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-200 bg-white/10 border border-white/10 px-3 py-1 rounded-full">🎓 Grammar Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2">
            Master English<br /><span className="text-purple-300">Grammar</span>
          </h1>
          <p className="text-purple-200 text-sm max-w-lg">Topic-wise lessons, daily drills, editorial analysis, and full exam practice — all in one place.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            {[{label: `${GRAMMAR_LESSONS.length} Topics`, icon: '📖'}, {label: '500+ Questions', icon: '✍️'}, {label: 'Daily Editorial', icon: '📰'}].map(s => (
              <div key={s.label} className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1.5">
                <span>{s.icon}</span>
                <span className="text-xs font-bold text-white">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inner tab nav */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {GRAMMAR_NAV_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setGrammarNav(t.key)}
            className={`flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap
              ${grammarNav === t.key ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {grammarNav === 'daily' && renderDaily()}
      {grammarNav === 'editorial' && renderEditorial()}
      {grammarNav === 'reading' && renderReading()}
      {grammarNav === 'lessons' && renderLessons()}
      {grammarNav === 'affairs' && renderAffairs()}
      {grammarNav === 'practice' && renderPractice()}
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
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'grammar' ? 'grammar' : 'vocabulary';
  const [mainTab, setMainTab] = useState<'vocabulary' | 'grammar'>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'grammar' || tabParam === 'vocabulary') {
      setMainTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'vocabulary' | 'grammar') => {
    setMainTab(tab);
    setSearchParams({ tab });
  };

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
  const isWordOfDayFlow = currentLessonId === 'wordofday' || screen.type === 'wordofday';

  const currentLesson = isWordOfDayFlow
    ? { id: 'wordofday', name: 'Word of the Day', categoryId: 'home' }
    : lessons?.find((l: any) => l.id === currentLessonId);

  const currentLessonWords = isWordOfDayFlow
    ? (activeWords ? activeWords.slice(0, 10) : [])
    : (currentLessonId ? (lessonWords ? lessonWords(currentLessonId) : []) : []);

  const lessonQuestions = isWordOfDayFlow
    ? currentLessonWords.map((w: any, idx: number) => ({
        id: `q_wod_${w.id}_${idx}`,
        lessonId: 'wordofday',
        type: 'mcq',
        question: `What is the primary meaning of "${w.word}"?`,
        options: [
          w.meaning,
          'To express doubt or hesitation in formal writing',
          'Relating to ancient cultural traditions and beliefs',
          'Causing sudden confusion or astonishment'
        ].sort(() => Math.random() - 0.5),
        correctAnswer: w.meaning,
        explanation: `Meaning: ${w.meaning}`,
        difficulty: w.difficulty || 'medium',
        marks: 1
      }))
    : (currentLessonId && getQuestionsForLesson ? getQuestionsForLesson(currentLessonId) : []);

  const handleApplyDecision = (wordId: string, selfAssessment: any, correct: boolean) => {
    if (applyDecisionLogic) applyDecisionLogic(wordId, selfAssessment, correct);
  };

  const getExitTarget = () => isWordOfDayFlow ? { type: 'home' as const } : { type: 'category' as const, categoryId: currentLesson?.categoryId };

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
        onComplete={() => setScreen({
          type: 'stage-complete',
          lessonId: 'wordofday',
          phase: 'learning',
          score: dailyWords.length,
          total: dailyWords.length
        })}
        selfAssessments={getSelfAssessments('wordofday')}
        onSelfAssess={handleSelfAssess}
        onBookmark={markBookmark}
        onDifficult={markDifficult}
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
        onExit={() => setScreen(getExitTarget())}
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
        lessonName={currentLesson?.name || 'Word of the Day'}
        wordCount={currentLessonWords.length}
        score={sc.score}
        total={sc.total}
        onNext={() => {
          if (sc.phase === 'learning') {
            if (currentLessonId && currentLessonId !== 'wordofday' && updateLessonPhase) updateLessonPhase(currentLessonId, 'flashcards');
            setScreen({ type: 'flashcards', lessonId: currentLessonId || 'wordofday' });
          } else if (sc.phase === 'flashcards') {
            if (currentLessonId && currentLessonId !== 'wordofday' && updateLessonPhase) updateLessonPhase(currentLessonId, 'spelling');
            setScreen({ type: 'spelling', lessonId: currentLessonId || 'wordofday' });
          } else if (sc.phase === 'spelling') {
            if (currentLessonId && currentLessonId !== 'wordofday' && updateLessonPhase) updateLessonPhase(currentLessonId, 'quiz');
            setScreen({ type: 'quiz', lessonId: currentLessonId || 'wordofday' });
          } else if (sc.phase === 'quiz') {
            if (currentLessonId && currentLessonId !== 'wordofday' && updateLessonPhase) updateLessonPhase(currentLessonId, 'completed');
            setScreen({ type: 'result', lessonId: currentLessonId || 'wordofday' });
          }
        }}
        onExit={() => setScreen(getExitTarget())}
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
            setScreen({ type: 'stage-complete', lessonId: currentLessonId || 'wordofday', phase: 'flashcards', score: s, total: currentLessonWords.length }); 
        }}
        onExit={() => setScreen(getExitTarget())}
      />
    );
  }

  if (screen.type === 'spelling') {
    return (
      <SpellingTest
        words={currentLessonWords}
        onComplete={(s) => { 
            setSpellingScore(s); 
            setScreen({ type: 'stage-complete', lessonId: currentLessonId || 'wordofday', phase: 'spelling', score: s, total: currentLessonWords.length }); 
        }}
        onExit={() => setScreen(getExitTarget())}
      />
    );
  }

  if (screen.type === 'quiz') {
    return (
      <VocabularyQuiz
        questions={lessonQuestions}
        words={currentLessonWords}
        selfAssessments={getSelfAssessments(currentLessonId || 'wordofday')}
        onComplete={(results) => { 
            setQuizResults(results); 
            setScreen({ type: 'stage-complete', lessonId: currentLessonId || 'wordofday', phase: 'quiz', score: results.filter(r => r.correct).length, total: results.length }); 
        }}
        onExit={() => setScreen(getExitTarget())}
      />
    );
  }

  if (screen.type === 'result') {
    return (
      <LessonResult
        lessonName={currentLesson?.name || 'Word of the Day'}
        quizResults={quizResults}
        spellingScore={spellingScore}
        flashcardScore={flashcardScore}
        wordCount={currentLessonWords.length}
        onBackToLesson={() => setScreen(getExitTarget())}
        onApplyDecision={handleApplyDecision}
      />
    );
  }

  // Main shell with tab navigation
  return (
    <div className="max-w-7xl mx-auto space-y-4">

      {/* ── Top-Level Vocabulary / Grammar Switcher ── */}
      <div className="flex gap-0 bg-white rounded-2xl border border-slate-200 p-1 shadow-sm overflow-hidden">
        <button
          onClick={() => handleTabChange('vocabulary')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${
            mainTab === 'vocabulary'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Vocabulary
        </button>
        <button
          onClick={() => handleTabChange('grammar')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${
            mainTab === 'grammar'
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          Grammar
        </button>
      </div>

      {/* Grammar Tab */}
      {mainTab === 'grammar' && <GrammarSyllabusView />}

      {/* Vocabulary Tab */}
      {mainTab === 'vocabulary' && (
        <>
          {/* Word of the Day Hero — shown on home screen */}
          {screen.type === 'home' && (
            <HeroWordOfDay
              activeWords={activeWords || []}
              userProgress={userProgress || []}
              vocabStreak={vocabStreak || 0}
              stats={stats}
              onOpenWordOfDay={(index) => setScreen({ type: 'wordofday', index })}
              onIKnowThis={(wordId) => { if (markWordSelfAssessment) markWordSelfAssessment(wordId, '', 'i_know'); }}
              onNeedRevision={(wordId) => { if (markWordSelfAssessment) markWordSelfAssessment(wordId, '', 'need_revision'); }}
            />
          )}

          {/* Tab navigation — below hero */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { key: 'overview', label: 'Vocabulary', icon: BookOpen },
              { key: 'mywords', label: 'My Words', icon: BookMarked },
              { key: 'quiz', label: 'Practice', icon: Brain },
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
              categories={categories || []}
              lessons={lessons || []}
              lessonProgress={lessonProgress || []}
              userProgress={userProgress || []}
              revisionQueue={revisionQueue || []}
              onOpenCategory={(id) => setScreen({ type: 'category', categoryId: id })}
              onOpenRevision={() => { setNav('revision'); }}
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
              <h2 className="text-xl font-black text-slate-800 mb-2">Practice Center</h2>
              <p className="text-slate-500 text-sm mb-4">Complete lessons to unlock vocabulary practice</p>
              <Button onClick={() => { setNav('overview'); setScreen({ type: 'home' }); }} className="gap-2">
                <BookOpen className="h-4 w-4" /> Browse Lessons
              </Button>
            </div>
          )}
        </>
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
