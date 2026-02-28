import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useVocabulary,
    VocabWord,
    DifficultyLevel,
    SituationCategory,
    ExamCategory,
    ContentStatus,
} from '@/hooks/useVocabulary';
import {
    BookOpen, Plus, Search, CheckCircle, X, Pencil, Trash2,
    Eye, EyeOff, Filter, AlertTriangle, ChevronDown, Save, RotateCcw,
    Users, BarChart3, Upload,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ─── Form State ───────────────────────────────────────────────────────────────
const BLANK: Omit<VocabWord, 'id' | 'createdAt' | 'contentStatus' | 'uploadedBy' | 'uploadedByRole'> = {
    word: '', meaning: '', example: '', difficulty: 'medium', situation: 'exam',
    examCategory: 'banking', synonyms: [], antonyms: [],
    isActive: true, pronunciation: '',
};

const DIFF_OPTS: DifficultyLevel[] = ['easy', 'medium', 'hard'];
const SIT_OPTS: { value: SituationCategory; label: string }[] = [
    { value: 'interview', label: '🎤 Interview' },
    { value: 'essay', label: '✍️ Essay' },
    { value: 'business', label: '💼 Business' },
    { value: 'daily', label: '🗣️ Daily' },
    { value: 'exam', label: '📝 Exam' },
];
const EXAM_OPTS: { value: ExamCategory; label: string }[] = [
    { value: 'banking', label: 'Banking' },
    { value: 'ssc', label: 'SSC' },
    { value: 'railway', label: 'Railway' },
    { value: 'upsc', label: 'UPSC' },
    { value: 'state-psc', label: 'State PSC' },
    { value: 'defence', label: 'Defence' },
    { value: 'general', label: 'General' },
];

const STATUS_BADGE: Record<ContentStatus, { label: string; cls: string }> = {
    draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-700' },
    pending_approval: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Approved', cls: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
};

// ─── Word Form ────────────────────────────────────────────────────────────────
const WordForm: React.FC<{
    initial?: Partial<VocabWord>;
    onSave: (data: any) => void;
    onCancel: () => void;
    isEdit?: boolean;
}> = ({ initial, onSave, onCancel, isEdit }) => {
    const [form, setForm] = useState({ ...BLANK, ...initial });
    const [synonymInput, setSynonymInput] = useState('');
    const [antonymInput, setAntonymInput] = useState('');

    const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

    const addTag = (type: 'synonyms' | 'antonyms', val: string, setVal: (v: string) => void) => {
        if (!val.trim()) return;
        set(type, [...(form[type] || []), val.trim()]);
        setVal('');
    };

    const removeTag = (type: 'synonyms' | 'antonyms', idx: number) => {
        set(type, (form[type] || []).filter((_: string, i: number) => i !== idx));
    };

    const valid = form.word.trim() && form.meaning.trim() && form.example.trim();

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium">Word *</label>
                    <Input placeholder="e.g., Acumen" value={form.word} onChange={e => set('word', e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">Pronunciation (optional)</label>
                    <Input placeholder="e.g., /ˈæk.jʊ.mən/" value={form.pronunciation} onChange={e => set('pronunciation', e.target.value)} className="h-9 text-sm" />
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-medium">Meaning *</label>
                <Input placeholder="Clear, concise definition" value={form.meaning} onChange={e => set('meaning', e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-medium">Example Sentence *</label>
                <Input placeholder="Use the word in context..." value={form.example} onChange={e => set('example', e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
                <div className="space-y-1">
                    <label className="text-xs font-medium">Difficulty</label>
                    <Select value={form.difficulty} onValueChange={v => set('difficulty', v)}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{DIFF_OPTS.map(d => <SelectItem key={d} value={d} className="text-xs capitalize">{d}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">Situation</label>
                    <Select value={form.situation} onValueChange={v => set('situation', v)}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{SIT_OPTS.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">Exam Category</label>
                    <Select value={form.examCategory} onValueChange={v => set('examCategory', v)}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{EXAM_OPTS.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>
            {/* Tags */}
            <div className="grid md:grid-cols-2 gap-4">
                {[
                    { type: 'synonyms' as const, label: 'Synonyms', input: synonymInput, setInput: setSynonymInput, color: 'bg-blue-100 text-blue-700' },
                    { type: 'antonyms' as const, label: 'Antonyms', input: antonymInput, setInput: setAntonymInput, color: 'bg-red-100 text-red-600' },
                ].map(({ type, label, input, setInput, color }) => (
                    <div key={type} className="space-y-1">
                        <label className="text-xs font-medium">{label}</label>
                        <div className="flex gap-1">
                            <Input placeholder={`Add ${label.toLowerCase()}...`} value={input} onChange={e => setInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(type, input, setInput); } }}
                                className="h-8 text-xs" />
                            <Button size="sm" variant="outline" className="h-8" onClick={() => addTag(type, input, setInput)}><Plus className="h-3 w-3" /></Button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {(form[type] || []).map((tag: string, i: number) => (
                                <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${color}`}>
                                    {tag}
                                    <button onClick={() => removeTag(type, i)}><X className="h-2.5 w-2.5" /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 pt-2">
                <Button disabled={!valid} onClick={() => onSave(form)} className="gap-2"><Save className="h-4 w-4" />{isEdit ? 'Update Word' : 'Add Word'}</Button>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
            </div>
        </div>
    );
};

// ─── Word Row ─────────────────────────────────────────────────────────────────
const WordRow: React.FC<{
    word: VocabWord;
    onEdit: () => void;
    onDelete: () => void;
    onToggleActive: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    isSuperAdmin: boolean;
}> = ({ word, onEdit, onDelete, onToggleActive, onApprove, onReject, isSuperAdmin }) => {
    const [expanded, setExpanded] = useState(false);
    const sb = STATUS_BADGE[word.contentStatus];
    return (
        <div className={`border rounded-xl p-3 transition-all ${!word.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button onClick={() => setExpanded(e => !e)} className="text-muted-foreground hover:text-primary">
                        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                    <span className="font-bold text-sm">{word.word}</span>
                    <Badge className={`text-[10px] border-0 ${word.difficulty === 'easy' ? 'bg-green-100 text-green-700' : word.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{word.difficulty}</Badge>
                    <Badge variant="outline" className="text-[10px] capitalize hidden sm:flex">{word.situation}</Badge>
                    <Badge className={`text-[10px] border-0 ${sb.cls}`}>{sb.label}</Badge>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {isSuperAdmin && word.contentStatus === 'pending_approval' && (
                        <>
                            <Button size="sm" className="h-6 text-[10px] bg-green-600 hover:bg-green-700 px-2" onClick={onApprove}>✓ Approve</Button>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] text-red-600 px-2" onClick={onReject}>✗ Reject</Button>
                        </>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className={`h-7 w-7 p-0 ${word.isActive ? 'text-muted-foreground' : 'text-primary'}`} onClick={onToggleActive}>
                        {word.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                    {isSuperAdmin && <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>}
                </div>
            </div>
            {expanded && (
                <div className="mt-2 pl-6 space-y-1">
                    <p className="text-xs text-foreground">{word.meaning}</p>
                    <p className="text-xs text-muted-foreground italic">"{word.example}"</p>
                    {word.synonyms?.length ? <p className="text-[10px] text-blue-700">Syn: {word.synonyms.join(', ')}</p> : null}
                    {word.rejectionReason && <p className="text-[10px] text-red-600 bg-red-50 p-1 rounded">❌ Rejected: {word.rejectionReason}</p>}
                </div>
            )}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const SuperAdminVocabulary: React.FC = () => {
    const { toast } = useToast();
    const { words, addWord, updateWord, deleteWord, approveWord, rejectWord, activeWords, stats } = useVocabulary('superadmin_1');
    const [tab, setTab] = useState('manage');
    const [showForm, setShowForm] = useState(false);
    const [editWord, setEditWord] = useState<VocabWord | null>(null);
    const [searchQ, setSearchQ] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterExam, setFilterExam] = useState('all');

    const filteredWords = words.filter(w => {
        const matchSearch = !searchQ || w.word.toLowerCase().includes(searchQ.toLowerCase());
        const matchStatus = filterStatus === 'all' || w.contentStatus === filterStatus;
        const matchExam = filterExam === 'all' || w.examCategory === filterExam;
        return matchSearch && matchStatus && matchExam;
    });

    const pending = words.filter(w => w.contentStatus === 'pending_approval');

    const handleSave = (data: any) => {
        if (editWord) {
            updateWord(editWord.id, data);
            toast({ title: '✅ Word updated!' });
        } else {
            addWord({ ...data, uploadedBy: 'superadmin_1', uploadedByRole: 'super-admin', contentStatus: 'approved' });
            toast({ title: '✅ Word added and approved!' });
        }
        setShowForm(false);
        setEditWord(null);
    };

    const handleReject = (id: string) => {
        const reason = prompt('Rejection reason (optional):') || 'Does not meet quality standards';
        rejectWord(id, reason);
        toast({ title: '❌ Word rejected', variant: 'destructive' });
    };

    return (
        <div className="max-w-5xl mx-auto p-4 py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-violet-600" /> Vocabulary Manager
                    </h1>
                    <p className="text-sm text-muted-foreground">Add, manage, and approve vocabulary words</p>
                </div>
                <Button onClick={() => { setEditWord(null); setShowForm(true); }} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Word
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Words', value: words.length, color: 'text-blue-700', icon: '📚' },
                    { label: 'Active', value: words.filter(w => w.isActive && w.contentStatus === 'approved').length, color: 'text-green-700', icon: '✅' },
                    { label: 'Pending Approval', value: pending.length, color: 'text-amber-700', icon: '⏳' },
                    { label: 'Rejected', value: words.filter(w => w.contentStatus === 'rejected').length, color: 'text-red-700', icon: '❌' },
                ].map(s => (
                    <Card key={s.label} className="p-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{s.icon}</span>
                            <div>
                                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Pending approval alert */}
            {pending.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800">
                        <strong>{pending.length} words</strong> from employees are awaiting your approval.
                    </p>
                    <Button size="sm" className="ml-auto h-7 text-xs bg-amber-600 hover:bg-amber-700" onClick={() => setFilterStatus('pending_approval')}>
                        Review Now
                    </Button>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <Card className="p-5">
                    <h3 className="font-semibold text-sm mb-4">{editWord ? 'Edit Word' : 'Add New Word'}</h3>
                    <WordForm
                        initial={editWord || {}}
                        onSave={handleSave}
                        onCancel={() => { setShowForm(false); setEditWord(null); }}
                        isEdit={!!editWord}
                    />
                </Card>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Search words..." className="h-8 text-xs pl-8" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-8 text-xs w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="approved">✅ Approved</SelectItem>
                        <SelectItem value="pending_approval">⏳ Pending</SelectItem>
                        <SelectItem value="rejected">❌ Rejected</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterExam} onValueChange={setFilterExam}>
                    <SelectTrigger className="h-8 text-xs w-36"><SelectValue placeholder="Exam" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Exams</SelectItem>
                        {EXAM_OPTS.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Word list */}
            <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{filteredWords.length} words shown</p>
                {filteredWords.map(word => (
                    <WordRow
                        key={word.id}
                        word={word}
                        isSuperAdmin
                        onEdit={() => { setEditWord(word); setShowForm(true); }}
                        onDelete={() => {
                            if (confirm(`Delete "${word.word}"?`)) {
                                deleteWord(word.id);
                                toast({ title: 'Word deleted', variant: 'destructive' });
                            }
                        }}
                        onToggleActive={() => updateWord(word.id, { isActive: !word.isActive })}
                        onApprove={() => { approveWord(word.id); toast({ title: `✅ "${word.word}" approved!` }); }}
                        onReject={() => handleReject(word.id)}
                    />
                ))}
                {filteredWords.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No words found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminVocabulary;
