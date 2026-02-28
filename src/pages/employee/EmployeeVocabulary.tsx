import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useVocabulary, VocabWord, DifficultyLevel, SituationCategory, ExamCategory, ContentStatus,
} from '@/hooks/useVocabulary';
import { useAuth } from '@/app/providers';
import {
    BookOpen, Plus, Save, X, ChevronDown, Clock, CheckCircle, AlertTriangle,
    Pencil, Eye, EyeOff, RotateCcw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const STATUS_META: Record<ContentStatus, { label: string; icon: string; cls: string }> = {
    draft: { label: 'Draft', icon: '📝', cls: 'bg-gray-100 text-gray-700' },
    pending_approval: { label: 'Pending Approval', icon: '⏳', cls: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Approved', icon: '✅', cls: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejected', icon: '❌', cls: 'bg-red-100 text-red-700' },
};

const BLANK_FORM = {
    word: '', meaning: '', example: '', difficulty: 'medium' as DifficultyLevel,
    situation: 'exam' as SituationCategory, examCategory: 'banking' as ExamCategory,
    synonyms: [] as string[], antonyms: [] as string[], pronunciation: '',
};

const EmployeeVocabulary: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const empId = user?.id || 'emp_1';
    const { getWordsForRole, addWord, updateWord } = useVocabulary(empId);
    const myWords = getWordsForRole('employee', empId);

    const [showForm, setShowForm] = useState(false);
    const [editWord, setEditWord] = useState<VocabWord | null>(null);
    const [form, setForm] = useState({ ...BLANK_FORM });
    const [synInput, setSynInput] = useState('');
    const [antInput, setAntInput] = useState('');
    const [saveDraft, setSaveDraft] = useState(false);

    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const handleEdit = (w: VocabWord) => {
        setEditWord(w);
        setForm({ word: w.word, meaning: w.meaning, example: w.example, difficulty: w.difficulty, situation: w.situation, examCategory: w.examCategory, synonyms: w.synonyms || [], antonyms: w.antonyms || [], pronunciation: w.pronunciation || '' });
        setShowForm(true);
    };

    const handleSubmit = (asDraft = false) => {
        if (!form.word.trim() || !form.meaning.trim() || !form.example.trim()) {
            toast({ title: 'Please fill word, meaning, and example', variant: 'destructive' });
            return;
        }
        if (editWord) {
            if (editWord.contentStatus === 'approved') {
                toast({ title: 'Cannot edit approved words. Contact superadmin.', variant: 'destructive' });
                return;
            }
            updateWord(editWord.id, { ...form, contentStatus: asDraft ? 'draft' : 'pending_approval' });
            toast({ title: asDraft ? '💾 Draft saved!' : '📤 Submitted for approval!' });
        } else {
            addWord({ ...form, uploadedBy: empId, uploadedByRole: 'employee', contentStatus: asDraft ? 'draft' : 'pending_approval', isActive: false });
            toast({ title: asDraft ? '💾 Draft saved!' : '📤 Submitted to superadmin for approval!' });
        }
        setShowForm(false);
        setEditWord(null);
        setForm({ ...BLANK_FORM });
    };

    const addTag = (type: 'synonyms' | 'antonyms', val: string, setVal: (v: string) => void) => {
        if (!val.trim()) return;
        set(type, [...form[type], val.trim()]);
        setVal('');
    };

    const stats = {
        total: myWords.length,
        draft: myWords.filter(w => w.contentStatus === 'draft').length,
        pending: myWords.filter(w => w.contentStatus === 'pending_approval').length,
        approved: myWords.filter(w => w.contentStatus === 'approved').length,
        rejected: myWords.filter(w => w.contentStatus === 'rejected').length,
    };

    return (
        <div className="max-w-4xl mx-auto p-4 py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6 text-violet-600" /> My Vocabulary Uploads</h1>
                    <p className="text-sm text-muted-foreground">Submit vocabulary words for superadmin approval</p>
                </div>
                <Button onClick={() => { setEditWord(null); setForm({ ...BLANK_FORM }); setShowForm(true); }} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Word
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Submitted', value: stats.total, icon: '📚', color: 'text-blue-700' },
                    { label: 'Pending Review', value: stats.pending, icon: '⏳', color: 'text-amber-700' },
                    { label: 'Approved', value: stats.approved, icon: '✅', color: 'text-green-700' },
                    { label: 'Rejected', value: stats.rejected, icon: '❌', color: 'text-red-600' },
                ].map(s => (
                    <Card key={s.label} className="p-3 flex items-center gap-3">
                        <span className="text-2xl">{s.icon}</span>
                        <div>
                            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] text-muted-foreground">{s.label}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Rules box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 space-y-1">
                <p className="font-semibold">📋 Employee Rules:</p>
                <ul className="list-disc list-inside text-xs space-y-0.5 text-blue-700">
                    <li>You can submit as <strong>Draft</strong> (saves locally) or <strong>Submit for Approval</strong></li>
                    <li>Approved words <strong>cannot be edited or deleted</strong> — contact superadmin</li>
                    <li>Rejected words can be revised and resubmitted</li>
                    <li>Words only appear to students after superadmin approval</li>
                </ul>
            </div>

            {/* Form */}
            {showForm && (
                <Card className="p-5 border-primary/30">
                    <h3 className="font-semibold text-sm mb-4">{editWord ? 'Edit Word' : 'Submit New Word'}</h3>
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-3">
                            <div className="space-y-1"><label className="text-xs font-medium">Word *</label><Input placeholder="e.g., Tenacious" value={form.word} onChange={e => set('word', e.target.value)} className="h-9 text-sm" /></div>
                            <div className="space-y-1"><label className="text-xs font-medium">Pronunciation</label><Input placeholder="e.g., /tɪˈneɪ.ʃəs/" value={form.pronunciation} onChange={e => set('pronunciation', e.target.value)} className="h-9 text-sm" /></div>
                        </div>
                        <div className="space-y-1"><label className="text-xs font-medium">Meaning *</label><Input placeholder="Clear definition" value={form.meaning} onChange={e => set('meaning', e.target.value)} className="h-9 text-sm" /></div>
                        <div className="space-y-1"><label className="text-xs font-medium">Example Sentence *</label><Input placeholder="Use the word in context" value={form.example} onChange={e => set('example', e.target.value)} className="h-9 text-sm" /></div>
                        <div className="grid md:grid-cols-3 gap-3">
                            <div className="space-y-1"><label className="text-xs font-medium">Difficulty</label>
                                <Select value={form.difficulty} onValueChange={v => set('difficulty', v)}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent>{DIFF_OPTS.map(d => <SelectItem key={d} value={d} className="text-xs capitalize">{d}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-1"><label className="text-xs font-medium">Situation</label>
                                <Select value={form.situation} onValueChange={v => set('situation', v)}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent>{SIT_OPTS.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-1"><label className="text-xs font-medium">Exam Category</label>
                                <Select value={form.examCategory} onValueChange={v => set('examCategory', v)}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent>{EXAM_OPTS.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}</SelectContent></Select></div>
                        </div>
                        {/* Tags */}
                        <div className="grid md:grid-cols-2 gap-3">
                            {[
                                { type: 'synonyms' as const, label: 'Synonyms', input: synInput, setInput: setSynInput, color: 'bg-blue-100 text-blue-700' },
                                { type: 'antonyms' as const, label: 'Antonyms', input: antInput, setInput: setAntInput, color: 'bg-red-100 text-red-600' },
                            ].map(({ type, label, input, setInput, color }) => (
                                <div key={type} className="space-y-1">
                                    <label className="text-xs font-medium">{label}</label>
                                    <div className="flex gap-1">
                                        <Input placeholder={`Add ${label.toLowerCase()}`} value={input} onChange={e => setInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(type, input, setInput); } }}
                                            className="h-8 text-xs" />
                                        <Button size="sm" variant="outline" className="h-8" onClick={() => addTag(type, input, setInput)}><Plus className="h-3 w-3" /></Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {form[type].map((t: string, i: number) => (
                                            <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${color}`}>
                                                {t}<button onClick={() => set(type, form[type].filter((_: string, idx: number) => idx !== i))}><X className="h-2.5 w-2.5" /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button onClick={() => handleSubmit(false)} className="gap-2"><Save className="h-4 w-4" /> Submit for Approval</Button>
                            <Button variant="outline" onClick={() => handleSubmit(true)} className="gap-2"><RotateCcw className="h-4 w-4" /> Save as Draft</Button>
                            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Word list */}
            <div className="space-y-2">
                <h3 className="font-semibold text-sm">My Submissions ({myWords.length})</h3>
                {myWords.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No words submitted yet. Add your first word!</p>
                    </div>
                ) : myWords.map(word => {
                    const sm = STATUS_META[word.contentStatus];
                    const canEdit = word.contentStatus !== 'approved';
                    return (
                        <div key={word.id} className="border rounded-xl p-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm">{word.word}</span>
                                    <Badge className={`text-[10px] border-0 ${sm.cls}`}>{sm.icon} {sm.label}</Badge>
                                    <Badge variant="outline" className="text-[10px] capitalize hidden sm:flex">{word.difficulty}</Badge>
                                    <Badge variant="outline" className="text-[10px] capitalize hidden sm:flex">{word.situation}</Badge>
                                </div>
                                {canEdit && (
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEdit(word)}>
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 pl-0">{word.meaning}</p>
                            {word.rejectionReason && (
                                <p className="text-[10px] text-red-600 bg-red-50 border border-red-200 rounded p-1.5 mt-1">
                                    ❌ Rejected: {word.rejectionReason}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EmployeeVocabulary;
