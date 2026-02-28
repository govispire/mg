import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVocabulary, VocabWord, DifficultyLevel, SituationCategory } from '@/hooks/useVocabulary';
import { useAuth } from '@/app/providers';
import {
    BookOpen, CheckCircle, ChevronLeft, Search,
    CalendarDays, RotateCcw, Brain,
    Eye, EyeOff, Sparkles, Star, Layers,
    TrendingUp, Target, Zap, Award, ChevronRight,
    CheckCircle2,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const SITUATION_META: Record<SituationCategory, { label: string; emoji: string; gradient: string; textColor: string }> = {
    interview: { label: 'Interview English', emoji: '🎤', gradient: 'from-blue-500 to-indigo-600', textColor: 'text-blue-700' },
    essay: { label: 'Essay Writing', emoji: '✍️', gradient: 'from-purple-500 to-violet-600', textColor: 'text-purple-700' },
    business: { label: 'Business English', emoji: '💼', gradient: 'from-teal-500 to-green-600', textColor: 'text-teal-700' },
    daily: { label: 'Daily Usage', emoji: '🗣️', gradient: 'from-amber-500 to-orange-500', textColor: 'text-amber-700' },
    exam: { label: 'Exam High Frequency', emoji: '📝', gradient: 'from-rose-500 to-pink-600', textColor: 'text-rose-700' },
};

const DIFF_CONFIG: Record<DifficultyLevel, { label: string; bg: string; text: string; dot: string }> = {
    easy: { label: 'Easy', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    medium: { label: 'Medium', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    hard: { label: 'Hard', bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' },
};

const guessPos = (word: string): string => {
    const w = word.toLowerCase();
    if (w.endsWith('ous') || w.endsWith('ive') || w.endsWith('al') || w.endsWith('ent') ||
        w.endsWith('ant') || w.endsWith('ful') || w.endsWith('less') || w.endsWith('ic')) return 'Adjective';
    if (w.endsWith('ly')) return 'Adverb';
    if (w.endsWith('ize') || w.endsWith('ise') || w.endsWith('ate') || w.endsWith('ify')) return 'Verb';
    return 'Noun';
};

const WORD_GRADIENTS = [
    'from-blue-600 to-indigo-700',
    'from-violet-600 to-purple-700',
    'from-teal-500 to-cyan-700',
    'from-rose-500 to-pink-700',
    'from-amber-500 to-orange-600',
];

// ─── WordFlipCard ─────────────────────────────────────────────────────────────
const WordFlipCard: React.FC<{
    word: VocabWord;
    index: number;
    status: 'new' | 'pending' | 'learned';
    onMarkLearned: () => void;
    onMarkPending: () => void;
}> = ({ word, index, status, onMarkLearned, onMarkPending }) => {
    const [flipped, setFlipped] = useState(status === 'learned');
    const diff = DIFF_CONFIG[word.difficulty];
    const pos = guessPos(word.word);
    const gradient = WORD_GRADIENTS[index % WORD_GRADIENTS.length];
    const isLearned = status === 'learned';

    return (
        <div className={`rounded-2xl overflow-hidden border transition-all duration-300 ${isLearned ? 'border-emerald-200 bg-emerald-50/60' : 'border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5'}`}>
            {/* ── Gradient word banner ── */}
            <div
                className={`bg-gradient-to-r ${gradient} px-5 py-4 cursor-pointer relative`}
                onClick={() => !isLearned && setFlipped(f => !f)}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1.5">
                            {word.word}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">{pos}</span>
                            <span className="w-1 h-1 rounded-full bg-white/40" />
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wide`}>
                                {diff.label}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/40" />
                            <span className="text-[10px] text-white/70 capitalize">{word.situation}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {isLearned ? (
                            <div className="h-7 w-7 rounded-full bg-white/30 flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                        ) : (
                            <div className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
                                {flipped ? <EyeOff className="h-3.5 w-3.5 text-white/80" /> : <Eye className="h-3.5 w-3.5 text-white/80" />}
                            </div>
                        )}
                    </div>
                </div>
                {!flipped && !isLearned && (
                    <p className="text-white/60 text-[10px] mt-2 flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Tap to reveal meaning
                    </p>
                )}
            </div>

            {/* ── Expanded content ── */}
            {(flipped || isLearned) && (
                <div className="px-5 py-4 space-y-3 bg-card">
                    {/* Meaning */}
                    <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Meaning</p>
                        <p className="text-sm font-medium text-foreground leading-snug">{word.meaning}</p>
                    </div>

                    {/* Example */}
                    <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Example</p>
                        <p className="text-xs text-muted-foreground italic leading-relaxed border-l-2 border-primary/40 pl-2.5">
                            "{word.example}"
                        </p>
                    </div>

                    {/* Synonyms + Antonyms */}
                    {(word.synonyms?.length || word.antonyms?.length) ? (
                        <div className="flex flex-wrap gap-1.5">
                            {word.synonyms?.map(s => (
                                <span key={s} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700">↑ {s}</span>
                            ))}
                            {word.antonyms?.map(a => (
                                <span key={a} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-red-600">↓ {a}</span>
                            ))}
                        </div>
                    ) : null}

                    {/* Actions */}
                    {!isLearned ? (
                        <div className="flex gap-2 pt-1">
                            <Button
                                size="sm"
                                className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200 flex-1 text-xs font-semibold"
                                onClick={onMarkLearned}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Learned
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 text-xs"
                                onClick={onMarkPending}
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                            <CheckCircle2 className="h-4 w-4" /> Learned · Well done!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Quiz Session ─────────────────────────────────────────────────────────────
const QuizSession: React.FC<{
    words: VocabWord[];
    onRecord: (wordId: string, selected: string, correct: string) => boolean;
    onClose: () => void;
}> = ({ words, onRecord, onClose }) => {
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const word = words[qIndex];
    const others = words.filter(w => w.id !== word?.id).slice(0, 3);
    const options = useMemo(() =>
        [...others.map(w => w.meaning), word?.meaning].filter(Boolean).sort(() => Math.random() - 0.5) as string[]
        , [qIndex]); // eslint-disable-line

    const handleSelect = (opt: string) => {
        if (selected || !word) return;
        setSelected(opt);
        const correct = onRecord(word.id, opt, word.meaning);
        if (correct) setScore(s => s + 1);
        setTimeout(() => {
            if (qIndex + 1 >= words.length) setDone(true);
            else { setQIndex(i => i + 1); setSelected(null); }
        }, 1200);
    };

    const pct = Math.round((score / Math.max(words.length, 1)) * 100);

    if (done) {
        return (
            <div className="text-center py-10 space-y-4">
                <div className="text-6xl">{pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💪'}</div>
                <div>
                    <h3 className="text-2xl font-black">{score}/{words.length}</h3>
                    <p className="text-muted-foreground text-sm">{pct}% accuracy</p>
                </div>
                <p className="text-sm text-muted-foreground">{pct === 100 ? 'Perfect! All words mastered!' : 'Wrong answers moved to Pending for revision.'}</p>
                <Button onClick={onClose} variant="outline" className="gap-2"><ChevronLeft className="h-4 w-4" /> Back to Words</Button>
            </div>
        );
    }

    if (!word) return null;

    return (
        <div className="space-y-5 max-w-lg mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Question {qIndex + 1} of {words.length}</span>
                <span className="font-bold text-emerald-600">{score} correct</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${(qIndex / words.length) * 100}%` }} />
            </div>

            {/* Word prompt */}
            <div className={`rounded-2xl bg-gradient-to-br ${WORD_GRADIENTS[qIndex % WORD_GRADIENTS.length]} p-8 text-center`}>
                <p className="text-white/70 text-xs mb-2 uppercase tracking-wider font-semibold">What is the meaning of</p>
                <h2 className="text-3xl font-black text-white">{word.word}</h2>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
                {options.map((opt, i) => {
                    const isCorr = opt === word.meaning;
                    const isSel = selected === opt;
                    return (
                        <button
                            key={i}
                            onClick={() => handleSelect(opt)}
                            className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-200
                ${!selected ? 'hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm cursor-pointer bg-card' : ''}
                ${isSel && isCorr ? 'bg-emerald-100 border-emerald-400 text-emerald-800 shadow-sm' : ''}
                ${isSel && !isCorr ? 'bg-red-100 border-red-400 text-red-800' : ''}
                ${selected && isCorr && !isSel ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : ''}
                ${!isSel && !(selected && isCorr) ? 'bg-card border-border' : ''}
              `}
                        >
                            <span className="flex items-center gap-3">
                                <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 ${isSel && isCorr ? 'bg-emerald-500 text-white border-emerald-500' :
                                    isSel && !isCorr ? 'bg-red-500 text-white border-red-500' :
                                        selected && isCorr ? 'bg-emerald-400 text-white border-emerald-400' :
                                            'bg-muted text-muted-foreground border-border'
                                    }`}>
                                    {String.fromCharCode(65 + i)}
                                </span>
                                {opt}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const StudentVocabulary: React.FC = () => {
    const { user } = useAuth();
    const {
        todayWords, activeWords, stats, vocabStreak,
        wordsByDate, wordsBySituation, userProgress,
        markWord, recordQuizAttempt, getWordProgress,
    } = useVocabulary(user?.id || 'student_1');

    const [activeTab, setActiveTab] = useState('today');
    const [quizActive, setQuizActive] = useState(false);
    const [searchQ, setSearchQ] = useState('');
    const [filterDiff, setFilterDiff] = useState('all');
    const [filterSituation, setFilterSituation] = useState('all');

    const learnedIds = new Set(userProgress.filter(p => p.status === 'learned').map(p => p.wordId));
    const pendingIds = new Set(userProgress.filter(p => p.status === 'pending').map(p => p.wordId));
    const learnedWords = activeWords.filter(w => learnedIds.has(w.id));
    const pendingWords = activeWords.filter(w => pendingIds.has(w.id));

    const filteredLearned = useMemo(() => learnedWords.filter(w => {
        const matchSearch = !searchQ || w.word.toLowerCase().includes(searchQ.toLowerCase()) || w.meaning.toLowerCase().includes(searchQ.toLowerCase());
        const matchDiff = filterDiff === 'all' || w.difficulty === filterDiff;
        const matchSit = filterSituation === 'all' || w.situation === filterSituation;
        return matchSearch && matchDiff && matchSit;
    }), [learnedWords, searchQ, filterDiff, filterSituation]);

    const learnedToday = todayWords.filter(w => learnedIds.has(w.id)).length;
    const levelPct = stats.learned < 20 ? (stats.learned / 20) * 100
        : stats.learned < 50 ? ((stats.learned - 20) / 30) * 100
            : stats.learned < 100 ? ((stats.learned - 50) / 50) * 100 : 100;

    const sortedDates = Object.keys(wordsByDate).sort((a, b) => b.localeCompare(a));

    const statCards = [
        { label: 'Words Seen', value: stats.totalSeen, icon: <Eye className="h-5 w-5" />, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-700' },
        { label: 'Learned', value: stats.learned, icon: <CheckCircle className="h-5 w-5" />, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-700' },
        { label: 'Pending', value: stats.pending, icon: <RotateCcw className="h-5 w-5" />, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700' },
        { label: 'Accuracy', value: `${stats.accuracy}%`, icon: <Target className="h-5 w-5" />, gradient: 'from-purple-500 to-violet-600', bg: 'bg-purple-50', text: 'text-purple-700' },
        { label: 'Streak', value: `${vocabStreak}🔥`, icon: <Zap className="h-5 w-5" />, gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', text: 'text-rose-700' },
        { label: 'Level', value: stats.level, icon: <Award className="h-5 w-5" />, gradient: 'from-violet-500 to-indigo-600', bg: 'bg-violet-50', text: 'text-violet-700' },
    ];

    if (quizActive) {
        const quizWords = todayWords.filter(w => !learnedIds.has(w.id));
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => setQuizActive(false)} className="h-9 w-9 rounded-xl border flex items-center justify-center text-muted-foreground hover:bg-muted transition-all">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2"><Brain className="h-5 w-5 text-violet-600" /> Vocabulary Quiz</h2>
                        <p className="text-xs text-muted-foreground">Test your knowledge</p>
                    </div>
                </div>
                {quizWords.length < 2 ? (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">🎉</div>
                        <h3 className="text-xl font-bold mb-2">All words learned!</h3>
                        <p className="text-muted-foreground mb-4 text-sm">No pending words to quiz on</p>
                        <Button onClick={() => setQuizActive(false)} variant="outline">Go Back</Button>
                    </div>
                ) : (
                    <QuizSession words={quizWords} onRecord={recordQuizAttempt} onClose={() => setQuizActive(false)} />
                )}
            </div>
        );
    }

    return (
        <div className="w-full px-4 py-6 space-y-6">
            {/* ── Page Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight">Vocabulary Builder</h1>
                    </div>
                    <p className="text-sm text-muted-foreground pl-11">Daily English skill — your competitive edge</p>
                </div>
                <Button
                    onClick={() => setQuizActive(true)}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-200 border-0 font-semibold"
                >
                    <Brain className="h-4 w-4" /> Take Quiz
                </Button>
            </div>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {statCards.map(s => (
                    <div key={s.label} className={`rounded-2xl ${s.bg} p-3 flex flex-col items-center gap-1 ring-1 ring-inset ring-border/40`}>
                        <div className={`${s.text} opacity-70`}>{s.icon}</div>
                        <p className={`text-lg font-black leading-none ${s.text}`}>{s.value}</p>
                        <p className="text-[10px] text-muted-foreground font-medium text-center">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Level progress ── */}
            <div className="rounded-2xl bg-card border p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-violet-600 fill-violet-600" />
                        <span className="text-sm font-bold">Vocabulary Level</span>
                        <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                            {stats.level}
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{stats.learned} words learned</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 transition-all duration-1000 ease-out"
                        style={{ width: `${Math.max(levelPct, 3)}%` }}
                    />
                </div>
                <div className="grid grid-cols-4 text-[9px] text-muted-foreground font-medium">
                    <span>Beginner</span>
                    <span className="text-center">Intermediate</span>
                    <span className="text-center">Advanced</span>
                    <span className="text-right">Expert</span>
                </div>
            </div>

            {/* ── Today's progress banner ── */}
            {learnedToday > 0 && (
                <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-4 flex items-center justify-between text-white">
                    <div>
                        <p className="font-black text-lg">{learnedToday}/{todayWords.length} words learned today! 🎯</p>
                        <p className="text-emerald-100 text-xs">Keep it up — consistency builds excellence</p>
                    </div>
                    {learnedToday === todayWords.length && <div className="text-4xl">🏆</div>}
                </div>
            )}

            {/* ── Tabs ── */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted/50 p-1 h-auto gap-0.5 rounded-xl flex-wrap">
                    {[
                        { value: 'today', label: 'Today', icon: <Sparkles className="h-3.5 w-3.5" />, count: todayWords.length },
                        { value: 'learned', label: 'Learned', icon: <CheckCircle className="h-3.5 w-3.5" />, count: stats.learned },
                        { value: 'pending', label: 'Pending', icon: <RotateCcw className="h-3.5 w-3.5" />, count: stats.pending },
                        { value: 'daywise', label: 'Day-wise', icon: <CalendarDays className="h-3.5 w-3.5" /> },
                        { value: 'situation', label: 'Situation', icon: <Layers className="h-3.5 w-3.5" /> },
                    ].map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value} className="text-xs gap-1.5 rounded-lg data-[state=active]:shadow-sm">
                            {tab.icon}
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.value ? 'bg-white/20' : 'bg-muted-foreground/20'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* TAB: Today */}
                <TabsContent value="today" className="mt-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-muted-foreground">{learnedToday}/{todayWords.length} words completed</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQuizActive(true)}
                            className="h-8 text-xs gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50 font-semibold"
                        >
                            <Brain className="h-3.5 w-3.5" /> Quiz Me
                        </Button>
                    </div>
                    {todayWords.length === 0 ? (
                        <div className="text-center py-16">
                            <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                            <p className="text-muted-foreground font-medium">No words assigned yet.</p>
                            <p className="text-xs text-muted-foreground mt-1">Check back soon!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todayWords.map((word, idx) => (
                                <WordFlipCard
                                    key={word.id}
                                    word={word}
                                    index={idx}
                                    status={learnedIds.has(word.id) ? 'learned' : pendingIds.has(word.id) ? 'pending' : 'new'}
                                    onMarkLearned={() => markWord(word.id, 'learned', word.difficulty)}
                                    onMarkPending={() => markWord(word.id, 'pending')}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* TAB: Learned */}
                <TabsContent value="learned" className="mt-5 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <div className="relative flex-1 min-w-[180px]">
                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input placeholder="Search learned words..." className="h-9 text-xs pl-9 rounded-xl" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                        </div>
                        <Select value={filterDiff} onValueChange={setFilterDiff}>
                            <SelectTrigger className="h-9 text-xs w-32 rounded-xl"><SelectValue placeholder="Level" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">All Levels</SelectItem><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
                        </Select>
                        <Select value={filterSituation} onValueChange={setFilterSituation}>
                            <SelectTrigger className="h-9 text-xs w-36 rounded-xl"><SelectValue placeholder="Situation" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Situations</SelectItem>
                                {(Object.entries(SITUATION_META) as [SituationCategory, any][]).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {filteredLearned.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">No learned words match your filter</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                            {filteredLearned.map((w, i) => (
                                <WordFlipCard key={w.id} word={w} index={i} status="learned" onMarkLearned={() => { }} onMarkPending={() => { }} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* TAB: Pending */}
                <TabsContent value="pending" className="mt-5 space-y-3">
                    {pendingWords.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-3">🎉</div>
                            <p className="font-semibold text-foreground">No pending words!</p>
                            <p className="text-xs text-muted-foreground mt-1">You're all caught up</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground font-medium">{pendingWords.length} words need revision</p>
                            <div className="space-y-3">
                                {pendingWords.map((w, i) => (
                                    <WordFlipCard
                                        key={w.id} word={w} index={i} status="pending"
                                        onMarkLearned={() => markWord(w.id, 'learned', w.difficulty)}
                                        onMarkPending={() => markWord(w.id, 'pending')}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </TabsContent>

                {/* TAB: Day-wise */}
                <TabsContent value="daywise" className="mt-5 space-y-5">
                    {sortedDates.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No history yet</p>
                        </div>
                    ) : sortedDates.map(date => (
                        <div key={date}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-px flex-1 bg-border" />
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                                    <CalendarDays className="h-3 w-3" />
                                    {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[9px] font-bold">{wordsByDate[date].length}</span>
                                </div>
                                <div className="h-px flex-1 bg-border" />
                            </div>
                            <div className="space-y-2">
                                {wordsByDate[date].map((w, i) => (
                                    <WordFlipCard
                                        key={w.id} word={w} index={i}
                                        status={learnedIds.has(w.id) ? 'learned' : pendingIds.has(w.id) ? 'pending' : 'new'}
                                        onMarkLearned={() => markWord(w.id, 'learned', w.difficulty)}
                                        onMarkPending={() => markWord(w.id, 'pending')}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </TabsContent>

                {/* TAB: Situation */}
                <TabsContent value="situation" className="mt-5">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(Object.entries(SITUATION_META) as [SituationCategory, typeof SITUATION_META['interview']][]).map(([key, meta]) => {
                            const situWords = wordsBySituation[key] || [];
                            const learnedCount = situWords.filter(w => learnedIds.has(w.id)).length;
                            return (
                                <div
                                    key={key}
                                    className="rounded-2xl overflow-hidden border hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer group"
                                >
                                    {/* Gradient header */}
                                    <div className={`bg-gradient-to-br ${meta.gradient} px-4 py-4`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-3xl">{meta.emoji}</span>
                                            <div className="text-right">
                                                <p className="text-white/90 text-lg font-black">{situWords.length}</p>
                                                <p className="text-white/60 text-[10px]">words</p>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-white text-sm">{meta.label}</h4>
                                        {/* Mini progress bar */}
                                        {situWords.length > 0 && (
                                            <div className="mt-2">
                                                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                                    <div className="h-full bg-white/60 rounded-full transition-all" style={{ width: `${(learnedCount / situWords.length) * 100}%` }} />
                                                </div>
                                                <p className="text-white/60 text-[10px] mt-1">{learnedCount}/{situWords.length} learned</p>
                                            </div>
                                        )}
                                    </div>
                                    {/* Word list preview */}
                                    <div className="bg-card px-4 py-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            {situWords.slice(0, 5).map(w => (
                                                <span
                                                    key={w.id}
                                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${learnedIds.has(w.id) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-muted border-border text-muted-foreground'}`}
                                                >
                                                    {w.word}
                                                </span>
                                            ))}
                                            {situWords.length > 5 && (
                                                <span className="text-[10px] text-muted-foreground font-medium px-1 self-center">
                                                    +{situWords.length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StudentVocabulary;
