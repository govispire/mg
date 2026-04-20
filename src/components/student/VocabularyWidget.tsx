import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useVocabulary, VocabWord } from '@/hooks/useVocabulary';
import { useAuth } from '@/app/providers';
import {
    BookOpen, ChevronRight, ChevronLeft, ExternalLink,
    Volume2, CheckCircle2, RotateCcw, MessageSquare
} from 'lucide-react';

// Part of speech detection
const guessPos = (word: string): string => {
    const w = word.toLowerCase();
    if (w.endsWith('ous') || w.endsWith('ive') || w.endsWith('al') || w.endsWith('ent') ||
        w.endsWith('ant') || w.endsWith('ful') || w.endsWith('less') || w.endsWith('ic')) return 'Adjective';
    if (w.endsWith('ly')) return 'Adverb';
    if (w.endsWith('ize') || w.endsWith('ise') || w.endsWith('ate') || w.endsWith('ify')) return 'Verb';
    return 'Noun';
};

export default function WordOfTheDayCard() {
    const { user } = useAuth();
    const { todayWords, markWord, getWordProgress } = useVocabulary(user?.id || 'student_1');
    const [wordIndex, setWordIndex] = useState(0);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgFailed, setImgFailed] = useState(false);

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    const word: VocabWord | undefined = todayWords[wordIndex];
    const pos = word ? guessPos(word.word) : 'Noun';

    const progress = word ? getWordProgress(word.id) : undefined;
    const isLearned = progress?.status === 'learned';
    const hasImage = !!(word?.imageUrl) && !imgFailed;

    React.useEffect(() => {
        setImgLoaded(false);
        setImgFailed(false);
    }, [wordIndex]);

    const handleSave = () => { if (word) markWord(word.id, 'learned', word.difficulty); };
    const handleSkip = () => {
        if (word) markWord(word.id, 'pending');
        if (wordIndex < todayWords.length - 1) setWordIndex(i => i + 1);
    };

    // ── All words done state ────────────────────────────────────────────────
    if (!word) {
        return (
            <div className="rounded-2xl overflow-hidden border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm w-full">
                <div className="flex items-center justify-between px-4 py-3 bg-white/60 border-b border-emerald-100">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-bold text-slate-700">Today's Vocabulary Challenge</span>
                    </div>
                    <Link to="/student/vocabulary" className="text-emerald-600 hover:text-emerald-700">
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                </div>
                <div className="px-5 py-8 text-center space-y-3">
                    <div className="text-4xl">🎉</div>
                    <h3 className="font-black text-base text-emerald-800">All 5 Words Done!</h3>
                    <p className="text-xs text-emerald-600 font-medium">Come back tomorrow for new words</p>
                    <div className="flex items-center justify-center gap-2 py-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300" />
                        ))}
                    </div>
                    <Link
                        to="/student/vocabulary"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md mt-2"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" /> See My Learned Words
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white w-full h-full flex flex-col">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <div>
                        <span className="text-sm font-bold text-slate-800">Today's Vocabulary Challenge</span>
                        <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                            Learn 1 new word daily and track progress automatically.
                        </p>
                    </div>
                </div>
                <Link to="/student/vocabulary" className="text-slate-400 hover:text-emerald-600 transition-colors ml-2 shrink-0">
                    <ExternalLink className="h-3.5 w-3.5" />
                </Link>
            </div>

            {/* ── Image Card area (matches reference) ── */}
            <div className="relative mx-3 mt-3 rounded-2xl overflow-hidden shadow-sm" style={{ minHeight: 200 }}>

                {/* Counter + close area */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                    <span className="text-[11px] text-white/90 font-semibold bg-black/30 px-2 py-0.5 rounded-full">
                        {wordIndex + 1}/{todayWords.length}
                    </span>
                </div>

                {/* Nav arrows */}
                {todayWords.length > 1 && (
                    <>
                        <button
                            onClick={() => setWordIndex(i => Math.max(0, i - 1))}
                            disabled={wordIndex === 0}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-black/25 hover:bg-black/40 flex items-center justify-center text-white disabled:opacity-30 transition"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setWordIndex(i => Math.min(todayWords.length - 1, i + 1))}
                            disabled={wordIndex === todayWords.length - 1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-black/25 hover:bg-black/40 flex items-center justify-center text-white disabled:opacity-30 transition"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </>
                )}

                {/* Image */}
                {hasImage ? (
                    <img
                        src={word.imageUrl}
                        alt={word.word}
                        className={`w-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                        style={{ height: '100%', minHeight: 200 }}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgFailed(true)}
                    />
                ) : (
                    <div
                        className="w-full flex items-center justify-center"
                        style={{
                            height: 200,
                            background: 'linear-gradient(135deg,#059669,#10b981)',
                        }}
                    >
                        <span className="text-6xl font-black text-white/20 select-none">{word.word[0]}</span>
                    </div>
                )}

                {/* Skeleton while loading */}
                {hasImage && !imgLoaded && (
                    <div className="absolute inset-0 bg-slate-200 animate-pulse rounded-2xl" />
                )}

                {/* Bottom gradient overlay with word */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pt-10 pb-3"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.68) 0%, transparent 100%)' }}>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-black text-white leading-none tracking-tight drop-shadow">
                            {word.word}
                        </h2>
                        {word.pronunciation && (
                            <span className="text-white/70 text-xs font-medium">{word.pronunciation}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-white/80 font-semibold">Word of the Day</span>
                        <span className="text-white/50 text-[10px]">·</span>
                        <span className="text-[10px] text-white/70 font-medium">{wordIndex + 1}/{todayWords.length}</span>
                    </div>
                </div>
            </div>

            {/* ── Content below image ── */}
            <div className="px-4 pt-3 pb-3 flex-1 flex flex-col gap-2.5">

                {/* Meaning */}
                <p className="text-[13px] text-slate-700 font-medium leading-snug">
                    {word.meaning}
                </p>

                {/* Example */}
                {word.example && (
                    <div className="bg-slate-50 rounded-lg px-3 py-2 border-l-2 border-slate-300">
                        <p className="text-[11px] text-slate-500 italic leading-relaxed">
                            "{word.example}"
                        </p>
                    </div>
                )}

                {/* Synonyms */}
                {(word.synonyms?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-0.5">Synonyms</span>
                        {word.synonyms!.map(syn => (
                            <span
                                key={syn}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600"
                            >
                                {syn}
                            </span>
                        ))}
                        {(word.antonyms?.length ?? 0) > 0 && word.antonyms!.slice(0, 1).map(ant => (
                            <span
                                key={ant}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-500"
                            >
                                {ant}
                            </span>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1 mt-auto">
                    {isLearned ? (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Saved to Vocabulary ✓
                            </div>
                            <Link to="/student/vocabulary" className="text-[10px] text-emerald-600 hover:underline font-medium">
                                See All →
                            </Link>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={handleSkip}
                                className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-[12px] font-bold hover:bg-slate-50 transition-all"
                            >
                                Skip Today
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-2.5 rounded-xl text-white text-[12px] font-bold transition-all hover:opacity-90 active:scale-95"
                                style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 3px 10px rgba(16,185,129,0.35)' }}
                            >
                                Mark as Learned
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
