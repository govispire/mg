import React, { useState, useCallback, useRef, useEffect, useId } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Pencil, Trash2, Clock, BookOpen, Target, CheckSquare, Hash, ListChecks, AlertTriangle, Save, FileQuestion, Upload, Download, BarChart2, FilePlus2, CheckCircle2, XCircle, Layers, FileSpreadsheet, Copy, MoveRight, Tag, AlignLeft, Send, Lock, Unlock, ArrowUp, ArrowDown, Settings } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

// ── Types ──────────────────────────────────────────────────────────────────
type QType = 'mcq' | 'msq' | 'numerical' | 'comprehension';
interface QOpt { id: string; text: string; }
interface BQ {
    id: string; type: QType; questionText: string;
    options: QOpt[]; correctAnswer: string | string[];
    marks: number; negativeMarks: number;
    imageUrl?: string; explanation?: string;
    topic?: string;        // e.g. "Reading Comprehension", "Algebra"
    passageText?: string;  // for comprehension type: the passage shown on left
}
interface BS { id: string; name: string; durationMinutes: number; questions: BQ[]; }
interface BT { testId: string; sections: BS[]; sectionLockEnabled: boolean; }

// ── Helpers ────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const emptyOpt = (): QOpt => ({ id: uid(), text: '' });
const blankQ = (): BQ => ({
    id: uid(), type: 'mcq', questionText: '',
    options: [emptyOpt(), emptyOpt(), emptyOpt(), emptyOpt()],
    correctAnswer: '', marks: 1, negativeMarks: 0.25,
    imageUrl: '', explanation: '', topic: '', passageText: '',
});

// ── Type meta ──────────────────────────────────────────────────────────────
const TM: Record<QType, { label: string; cls: string; icon: React.ReactNode }> = {
    mcq: { label: 'MCQ', cls: 'bg-blue-100 text-blue-700', icon: <CheckSquare className="w-3 h-3" /> },
    msq: { label: 'MSQ', cls: 'bg-purple-100 text-purple-700', icon: <ListChecks className="w-3 h-3" /> },
    numerical: { label: 'Numerical', cls: 'bg-amber-100 text-amber-700', icon: <Hash className="w-3 h-3" /> },
    comprehension: { label: 'Comprehension', cls: 'bg-teal-100 text-teal-700', icon: <AlignLeft className="w-3 h-3" /> },
};
const TypeChip = ({ type }: { type: QType }) => {
    const { label, cls, icon } = TM[type];
    return <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cls}`}>{icon}{label}</span>;
};

// ── CSV Parser ─────────────────────────────────────────────────────────────
interface ParseResult { questions: BQ[]; warnings: string[]; }
function parseCsvToQuestions(text: string): ParseResult {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());
    if (lines.length < 2) return { questions: [], warnings: ['File is empty or has no data rows'] };
    const splitLine = (l: string) => l.split(',').map(c => c.replace(/^"|"$/g, '').trim());
    const headers = splitLine(lines[0]).map(h => h.toLowerCase().replace(/\s/g, ''));
    const col = (keys: string[]) => {
        for (const k of keys) { const i = headers.findIndex(h => h.includes(k)); if (i >= 0) return i; }
        return -1;
    };
    const qi = col(['question']); const ai = col(['optiona', 'a']); const bi = col(['optionb', 'b']);
    const ci = col(['optionc', 'c']); const di = col(['optiond', 'd']);
    const ansi = col(['answer', 'correct']); const mi = col(['marks', 'score']);
    const negi = col(['negative']); const ti = col(['type']); const ei = col(['explanation']);
    const topi = col(['topic']); const passi = col(['passage']);
    const L2I: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
    const questions: BQ[] = []; const warnings: string[] = [];
    lines.slice(1).forEach((line, rowIdx) => {
        const r = splitLine(line);
        const rowNum = rowIdx + 2; // 1-based, skip header
        const qtext = r[qi]?.trim(); if (!qtext) return;
        const rowWarns: string[] = [];
        const opts = [ai, bi, ci, di].map(i => i >= 0 ? r[i]?.trim() || '' : '').filter(Boolean).map(t => ({ id: uid(), text: t }));
        const rawAns = r[ansi]?.trim() ?? '';
        const rawType = (r[ti] ?? '').toLowerCase();
        let type: QType = rawType.includes('comp') ? 'comprehension' : rawType.includes('num') ? 'numerical' : rawType.includes('msq') ? 'msq' : 'mcq';
        if (!rawType && rawAns.match(/[a-d][,\s]+[a-d]/i)) type = 'msq';
        // Validate
        if (!rawAns && type !== 'comprehension') rowWarns.push(`Row ${rowNum}: Missing Answer`);
        if (opts.length < 2 && type === 'mcq') rowWarns.push(`Row ${rowNum}: Less than 2 options for MCQ`);
        if (!r[ei]?.trim()) rowWarns.push(`Row ${rowNum}: Explanation is empty (recommended)`);
        if (!r[topi]?.trim()) rowWarns.push(`Row ${rowNum}: Topic not specified`);
        if (type === 'comprehension' && !r[passi]?.trim()) rowWarns.push(`Row ${rowNum}: Passage text is empty for Comprehension type`);
        warnings.push(...rowWarns);
        let correctAnswer: string | string[] = '';
        if (type === 'numerical' || type === 'comprehension') { correctAnswer = rawAns; }
        else if (type === 'msq') {
            correctAnswer = (rawAns.match(/[a-dA-D]/g) ?? []).map(l => opts[L2I[l.toLowerCase()]]?.id).filter(Boolean) as string[];
        } else {
            const l = rawAns.match(/[a-dA-D]/)?.[0]?.toLowerCase() ?? '';
            correctAnswer = opts[L2I[l]]?.id ?? '';
        }
        questions.push({ id: uid(), type, questionText: qtext, options: opts, correctAnswer, marks: Number(r[mi] ?? 1) || 1, negativeMarks: Number(r[negi] ?? 0.25) || 0, imageUrl: '', explanation: r[ei]?.trim() ?? '', topic: r[topi]?.trim() ?? '', passageText: r[passi]?.trim() ?? '' });
    });
    return { questions, warnings };
}

function downloadTemplate() {
    const rows = [
        ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Answer', 'Type', 'Marks', 'Negative Marks', 'Explanation', 'Topic', 'Passage'],
        ['What is 2+2?', '3', '4', '5', '6', 'B', 'MCQ', '1', '0.25', '2+2=4', 'Arithmetic', ''],
        ['Select all primes < 6:', '2', '3', '4', '5', 'A,B,D', 'MSQ', '2', '0.5', '2,3,5 are prime', 'Number Theory', ''],
        ['Value of pi?', '', '', '', '', '3.14', 'Numerical', '1', '0', 'Pi≈3.14', 'Constants', ''],
        ['Based on passage: Author\'s tone is?', 'Critical', 'Neutral', 'Positive', 'Sarcastic', 'B', 'Comprehension', '1', '0.25', 'Passage uses neutral language.', 'Reading Comprehension', 'The industrial revolution changed society in many ways...'],
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'question_template.csv' });
    a.click();
}

// ── Section Modal ──────────────────────────────────────────────────────────
const SectionModal = ({ open, editing, onSave, onClose }: { open: boolean; editing: BS | null; onSave: (d: Pick<BS, 'id' | 'name' | 'durationMinutes'>) => void; onClose: () => void }) => {
    const [form, setForm] = useState({ name: '', durationMinutes: 20 });
    useEffect(() => { setForm(editing ? { name: editing.name, durationMinutes: editing.durationMinutes } : { name: '', durationMinutes: 20 }); }, [editing, open]);
    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>{editing ? 'Edit Section' : 'Add Section'}</DialogTitle></DialogHeader>
                <div className="space-y-3 py-1">
                    <div className="space-y-1"><Label className="text-xs">Section Name *</Label>
                        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Reasoning Ability" autoFocus /></div>
                    <div className="space-y-1"><Label className="text-xs"><Clock className="inline w-3 h-3 mr-1" />Timer (min)</Label>
                        <Input type="number" min={1} max={180} value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))} />
                        <p className="text-[11px] text-gray-400">Section auto-submits when timer expires</p></div>
                </div>
                <DialogFooter>
                    <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                    <Button size="sm" disabled={!form.name.trim()} onClick={() => { if (form.name.trim()) onSave({ id: editing?.id ?? uid(), ...form }); }}>{editing ? 'Save' : 'Add'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// ── Question Editor (right panel) ──────────────────────────────────────────
const QEditor = ({ q, onChange, onSave, onSaveNext, onCancel, isNew, sectionName }: {
    q: BQ; onChange: (q: BQ) => void; onSave: () => void; onSaveNext: () => void;
    onCancel: () => void; isNew: boolean; sectionName: string;
}) => {
    const fid = useId();
    const set = <K extends keyof BQ>(k: K, v: BQ[K]) => onChange({ ...q, [k]: v });
    const updOpt = (i: number, text: string) => { const opts = [...q.options]; opts[i] = { ...opts[i], text }; onChange({ ...q, options: opts }); };
    const toggleMsq = (id: string) => { const cur = Array.isArray(q.correctAnswer) ? q.correctAnswer : []; set('correctAnswer', cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]); };
    const changeType = (t: QType) => onChange({ ...q, type: t, options: t === 'numerical' || t === 'comprehension' ? [] : (q.options.length >= 2 ? q.options : [emptyOpt(), emptyOpt(), emptyOpt(), emptyOpt()]), correctAnswer: t === 'msq' ? [] : '' });
    const isNum = q.type === 'numerical'; const isMsq = q.type === 'msq'; const isComp = q.type === 'comprehension';
    const canSave = !!q.questionText.trim();
    // Inline warnings
    const editorWarnings: string[] = [];
    if (!q.explanation?.trim()) editorWarnings.push('Explanation is empty — students won\'t see a hint');
    if (!q.topic?.trim()) editorWarnings.push('Topic not set — useful for analytics & filtering');
    if (isComp && !q.passageText?.trim()) editorWarnings.push('Passage text is empty for Comprehension question');
    if (!isNum && !isComp && !q.correctAnswer && !(Array.isArray(q.correctAnswer) && q.correctAnswer.length > 0)) editorWarnings.push('No correct answer marked');
    const FormArea = (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Type */}
            <div>
                <Label className="text-xs text-gray-500 mb-1.5 block">Question Type</Label>
                <div className="grid grid-cols-2 gap-2">
                    {(['mcq', 'msq', 'numerical', 'comprehension'] as QType[]).map(t => (
                        <button key={t} onClick={() => changeType(t)} className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 text-xs font-semibold transition-all ${q.type === t ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-500 hover:border-primary/30'}`}>
                            {TM[t].icon}{TM[t].label}
                        </button>
                    ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{q.type === 'mcq' ? 'One correct answer' : q.type === 'msq' ? 'Multiple correct answers' : q.type === 'numerical' ? 'Student types a number' : 'Passage shown on left; question on right'}</p>
            </div>
            {/* Topic */}
            <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1"><Tag className="w-3 h-3" />Topic <span className="text-amber-500 font-normal">(recommended)</span></Label>
                <Input value={q.topic ?? ''} onChange={e => set('topic', e.target.value)} placeholder="e.g. Reading Comprehension, Algebra, Data Interpretation" className="text-xs h-8" />
            </div>
            {/* Passage (comprehension only) */}
            {isComp && (
                <div className="space-y-1 border border-teal-200 rounded-lg p-3 bg-teal-50/40">
                    <Label className="text-xs text-teal-700 flex items-center gap-1"><AlignLeft className="w-3 h-3" />Passage / Reading Text *</Label>
                    <Textarea value={q.passageText ?? ''} onChange={e => set('passageText', e.target.value)} rows={6} placeholder="Paste the passage/comprehension text here. This will be shown on the LEFT side during the exam." />
                    <p className="text-[10px] text-teal-600">💡 Students see this on the left panel; the question + options on the right.</p>
                </div>
            )}
            {/* Question Text */}
            <div className="space-y-1"><Label htmlFor={`${fid}-q`} className="text-xs">Question Text *</Label>
                <Textarea id={`${fid}-q`} value={q.questionText} onChange={e => set('questionText', e.target.value)} rows={isComp ? 2 : 3} placeholder={isComp ? 'Question based on the passage above…' : 'Type question here…'} autoFocus /></div>
            {/* Image */}
            <div className="space-y-1"><Label className="text-xs">Image URL (optional)</Label>
                <Input value={q.imageUrl ?? ''} onChange={e => set('imageUrl', e.target.value)} placeholder="https://…" className="text-xs h-8" />
                {q.imageUrl && <img src={q.imageUrl} alt="preview" className="mt-1 max-h-28 rounded border" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}</div>
            {/* Options (MCQ/MSQ/Comprehension) */}
            {!isNum && (
                <div className="space-y-2">
                    <Label className="text-xs">Options <span className="text-gray-400 font-normal">(click ✓ to mark correct)</span></Label>
                    {(q.options.length === 0 ? [emptyOpt(), emptyOpt(), emptyOpt(), emptyOpt()] : q.options).map((opt, i) => {
                        const correct = isMsq ? (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt.id)) : q.correctAnswer === opt.id;
                        return (
                            <div key={opt.id} className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 w-4 shrink-0">{String.fromCharCode(65 + i)}.</span>
                                <Input value={opt.text} onChange={e => updOpt(i, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + i)}`} className="flex-1 text-xs h-8" />
                                <button onClick={() => isMsq ? toggleMsq(opt.id) : set('correctAnswer', opt.id)} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs shrink-0 transition-all ${correct ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-400 hover:border-green-400'}`}>✓</button>
                                {q.options.length > 2 && <button onClick={() => onChange({ ...q, options: q.options.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>}
                            </div>
                        );
                    })}
                    {q.options.length < 6 && <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary h-7" onClick={() => onChange({ ...q, options: [...q.options, emptyOpt()] })}><Plus className="w-3 h-3" />Add Option</Button>}
                </div>
            )}
            {isNum && (
                <div className="space-y-1"><Label className="text-xs">Correct Answer (number)</Label>
                    <Input value={typeof q.correctAnswer === 'string' ? q.correctAnswer : ''} onChange={e => set('correctAnswer', e.target.value)} placeholder="e.g. 3.14" className="text-xs h-8" /></div>
            )}
            {/* Marks */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs"><span className="text-green-600">+</span> Marks</Label>
                    <Input type="number" min={0} step={0.25} value={q.marks} onChange={e => set('marks', Number(e.target.value))} className="text-xs h-8" /></div>
                <div className="space-y-1"><Label className="text-xs"><span className="text-red-500">−</span> Negative</Label>
                    <Input type="number" min={0} step={0.25} value={q.negativeMarks} onChange={e => set('negativeMarks', Number(e.target.value))} className="text-xs h-8" /></div>
            </div>
            {/* Explanation */}
            <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">Explanation <span className="text-amber-500 font-normal">(shown after answer)</span></Label>
                <Textarea value={q.explanation ?? ''} rows={2} onChange={e => set('explanation', e.target.value)} placeholder="Why is this the correct answer?" className="text-xs" />
            </div>
            {/* Inline warnings */}
            {editorWarnings.length > 0 && (
                <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 space-y-1">
                    <p className="text-[11px] font-semibold text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Missing fields:</p>
                    {editorWarnings.map((w, i) => <p key={i} className="text-[11px] text-amber-600 pl-4">• {w}</p>)}
                </div>
            )}
        </div>
    );
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 border-b px-4 py-2.5 flex-shrink-0 bg-gray-50">
                <span className="text-xs font-semibold text-gray-700 flex-1">{isNew ? '➕ New Question' : '✏️ Edit Question'} <span className="font-normal text-gray-400">· {sectionName}</span></span>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onCancel}>Cancel</Button>
                {isNew && <Button variant="outline" size="sm" className="h-7 text-xs gap-1" disabled={!canSave} onClick={onSaveNext}><Save className="w-3 h-3" />Save + Next</Button>}
                <Button size="sm" className="h-7 text-xs gap-1" disabled={!canSave} onClick={onSave}><Save className="w-3 h-3" />{isNew ? 'Save' : 'Update'}</Button>
            </div>
            {/* Comprehension: dual split (passage left | question right) */}
            {isComp ? (
                <div className="flex-1 flex overflow-hidden">
                    <div className="w-1/2 border-r flex flex-col overflow-y-auto p-4 space-y-3 bg-teal-50/30">
                        <div className="text-xs font-semibold text-teal-700 flex items-center gap-1"><AlignLeft className="w-3.5 h-3.5" />PASSAGE (Left Panel – Student View)</div>
                        <div className="space-y-1">
                            <Label className="text-xs flex items-center gap-1"><Tag className="w-3 h-3" />Topic</Label>
                            <Input value={q.topic ?? ''} onChange={e => set('topic', e.target.value)} placeholder="e.g. Reading Comprehension" className="text-xs h-8" />
                        </div>
                        <div className="space-y-1 flex-1">
                            <Label className="text-xs">Passage / Reading Text *</Label>
                            <Textarea value={q.passageText ?? ''} onChange={e => set('passageText', e.target.value)} rows={14} placeholder="Paste passage here…" className="resize-none text-xs" />
                        </div>
                    </div>
                    <div className="w-1/2 overflow-y-auto p-4 space-y-4">
                        <div className="text-xs font-semibold text-gray-600">QUESTION (Right Panel – Student View)</div>
                        <div className="space-y-1"><Label className="text-xs">Question Text *</Label>
                            <Textarea value={q.questionText} onChange={e => set('questionText', e.target.value)} rows={3} placeholder="Question based on passage…" autoFocus /></div>
                        <div className="space-y-2">
                            <Label className="text-xs">Options <span className="text-gray-400 font-normal">(click ✓ to mark correct)</span></Label>
                            {(q.options.length === 0 ? [emptyOpt(), emptyOpt(), emptyOpt(), emptyOpt()] : q.options).map((opt, i) => {
                                const correct = q.correctAnswer === opt.id;
                                return (
                                    <div key={opt.id} className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 w-4 shrink-0">{String.fromCharCode(65 + i)}.</span>
                                        <Input value={opt.text} onChange={e => updOpt(i, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + i)}`} className="flex-1 text-xs h-8" />
                                        <button onClick={() => set('correctAnswer', opt.id)} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs shrink-0 transition-all ${correct ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-400 hover:border-green-400'}`}>✓</button>
                                        {q.options.length > 2 && <button onClick={() => onChange({ ...q, options: q.options.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>}
                                    </div>
                                );
                            })}
                            {q.options.length < 6 && <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary h-7" onClick={() => onChange({ ...q, options: [...q.options, emptyOpt()] })}><Plus className="w-3 h-3" />Add Option</Button>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1"><Label className="text-xs"><span className="text-green-600">+</span> Marks</Label>
                                <Input type="number" min={0} step={0.25} value={q.marks} onChange={e => set('marks', Number(e.target.value))} className="text-xs h-8" /></div>
                            <div className="space-y-1"><Label className="text-xs"><span className="text-red-500">−</span> Negative</Label>
                                <Input type="number" min={0} step={0.25} value={q.negativeMarks} onChange={e => set('negativeMarks', Number(e.target.value))} className="text-xs h-8" /></div>
                        </div>
                        <div className="space-y-1"><Label className="text-xs">Explanation</Label>
                            <Textarea value={q.explanation ?? ''} rows={2} onChange={e => set('explanation', e.target.value)} placeholder="Why is this correct?" className="text-xs" /></div>
                        {editorWarnings.length > 0 && (
                            <div className="border border-amber-200 bg-amber-50 rounded-lg p-2 space-y-1">
                                <p className="text-[11px] font-semibold text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Missing:</p>
                                {editorWarnings.map((w, i) => <p key={i} className="text-[11px] text-amber-600 pl-3">• {w}</p>)}
                            </div>
                        )}
                    </div>
                </div>
            ) : FormArea}
        </div>
    );
};

// ── Question Card (left panel) ─────────────────────────────────────────────
const QCard = ({ q, num, active, onEdit, onDelete, onDuplicate, onMove, sectionNames }: {
    q: BQ; num: number; active: boolean;
    onEdit: () => void; onDelete: () => void; onDuplicate: () => void;
    onMove: (targetSId: string) => void; sectionNames: { id: string; name: string }[];
}) => {
    const [showMove, setShowMove] = useState(false);
    const hasAnswer = q.type === 'numerical' ? !!q.correctAnswer : !!q.correctAnswer && !(Array.isArray(q.correctAnswer) && q.correctAnswer.length === 0);
    return (
        <div onClick={onEdit} className={`border rounded-lg cursor-pointer transition-all hover:shadow-sm ${active ? 'border-primary ring-1 ring-primary/20 bg-blue-50/40' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <div className="flex items-start gap-2 p-2.5">
                <span className={`text-xs font-bold shrink-0 mt-0.5 w-5 text-center rounded ${active ? 'text-primary' : 'text-gray-400'}`}>{num}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800 leading-snug line-clamp-2 font-medium">
                        {q.questionText || <em className="text-gray-400 font-normal">No text yet</em>}
                    </p>
                    {q.topic && <p className="text-[10px] text-teal-600 flex items-center gap-0.5 mt-0.5"><Tag className="w-2.5 h-2.5" />{q.topic}</p>}
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <TypeChip type={q.type} />
                        <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-1 py-0.5 rounded">+{q.marks}</span>
                        <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-1 py-0.5 rounded">−{q.negativeMarks}</span>
                        {!hasAnswer && <span className="text-[10px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" />No ans</span>}
                        {!q.explanation && <span className="text-[10px] text-gray-400 bg-gray-50 px-1 py-0.5 rounded">No expl.</span>}
                    </div>
                </div>
                <div className="flex gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={onDuplicate} title="Duplicate" className="p-1 text-gray-300 hover:text-primary transition-colors rounded"><Copy className="w-3 h-3" /></button>
                    <button onClick={() => setShowMove(!showMove)} title="Move to section" className="p-1 text-gray-300 hover:text-primary transition-colors rounded"><MoveRight className="w-3 h-3" /></button>
                    <button onClick={onDelete} title="Delete" className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded"><Trash2 className="w-3 h-3" /></button>
                </div>
            </div>
            {/* Options preview */}
            {q.type !== 'numerical' && q.options.filter(o => o.text).length > 0 && (
                <div className="px-2.5 pb-2.5 grid grid-cols-2 gap-x-3 gap-y-0.5">
                    {q.options.filter(o => o.text).map((opt, i) => {
                        const correct = q.type === 'msq' ? (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt.id)) : q.correctAnswer === opt.id;
                        return (
                            <div key={opt.id} className={`flex items-center gap-1 text-[10px] ${correct ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
                                <span className="shrink-0">{String.fromCharCode(65 + i)}.</span>
                                <span className="truncate">{opt.text}</span>
                                {correct && <CheckCircle2 className="w-2.5 h-2.5 text-green-500 shrink-0" />}
                            </div>
                        );
                    })}
                </div>
            )}
            {q.type === 'numerical' && q.correctAnswer && (
                <p className="px-2.5 pb-2 text-[10px] text-gray-500">Ans: <strong>{String(q.correctAnswer)}</strong></p>
            )}
            {/* Move to section inline picker */}
            {showMove && sectionNames.length > 1 && (
                <div className="border-t px-2.5 py-1.5 bg-gray-50" onClick={e => e.stopPropagation()}>
                    <p className="text-[10px] text-gray-500 mb-1">Move to:</p>
                    <div className="flex flex-wrap gap-1">
                        {sectionNames.map(s => (
                            <button key={s.id} onClick={() => { onMove(s.id); setShowMove(false); }} className="text-[10px] border rounded px-1.5 py-0.5 hover:bg-primary hover:text-white transition-colors">
                                {s.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Analysis Tab ───────────────────────────────────────────────────────────
const AnalysisTab = ({ sections, onPublish }: { sections: BS[]; onPublish: () => void }) => {
    const allQ = sections.flatMap(s => s.questions);
    const total = allQ.length;
    const totalMarks = allQ.reduce((a, q) => a + q.marks, 0);
    const totalDur = sections.reduce((a, s) => a + s.durationMinutes, 0);
    const tc = { mcq: 0, msq: 0, numerical: 0 };
    allQ.forEach(q => tc[q.type]++);
    const pct = (n: number) => total > 0 ? Math.round(n / total * 100) : 0;
    const warnings: string[] = [];
    sections.forEach(s => {
        if (s.questions.length === 0) warnings.push(`"${s.name}" has no questions`);
        const no = s.questions.filter(q => !q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer.length === 0)).length;
        if (no > 0) warnings.push(`"${s.name}": ${no} question(s) missing correct answer`);
    });
    const ready = warnings.length === 0 && total > 0;
    return (
        <div className="space-y-5 max-w-3xl">
            <div className="grid grid-cols-4 gap-3">
                {[{ l: 'Sections', v: sections.length, c: 'text-blue-700 bg-blue-50 border-blue-100' }, { l: 'Questions', v: total, c: 'text-purple-700 bg-purple-50 border-purple-100' }, { l: 'Total Marks', v: totalMarks, c: 'text-green-700 bg-green-50 border-green-100' }, { l: 'Duration', v: `${totalDur}m`, c: 'text-amber-700 bg-amber-50 border-amber-100' }].map(x => (
                    <div key={x.l} className={`border rounded-xl px-4 py-3 text-center ${x.c}`}>
                        <div className="text-2xl font-bold">{x.v}</div><div className="text-xs uppercase tracking-wide">{x.l}</div>
                    </div>
                ))}
            </div>
            <div className="border rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary" />Type Distribution</h3>
                {(['mcq', 'msq', 'numerical'] as QType[]).map(t => (
                    <div key={t} className="space-y-1">
                        <div className="flex justify-between text-xs"><TypeChip type={t} /><span className="font-medium">{tc[t]} ({pct(tc[t])}%)</span></div>
                        <Progress value={pct(tc[t])} className="h-2" />
                    </div>
                ))}
            </div>
            <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2.5 border-b"><h3 className="text-sm font-semibold">Section Breakdown</h3></div>
                {sections.map((s, i) => {
                    const sm = s.questions.reduce((a, q) => a + q.marks, 0);
                    const noAns = s.questions.filter(q => !q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer.length === 0)).length;
                    return (
                        <div key={s.id} className="px-4 py-3 flex items-center gap-3 border-b last:border-0">
                            <div className="flex-1 text-sm font-medium"><span className="text-gray-400 mr-1">S{i + 1}.</span>{s.name}</div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span><Clock className="inline w-3 h-3 mr-0.5" />{s.durationMinutes}m</span>
                                <span><BookOpen className="inline w-3 h-3 mr-0.5" />{s.questions.length}Qs</span>
                                <span className="text-green-600 font-medium">{sm}pts</span>
                                {noAns > 0 && <span className="text-red-500 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" />{noAns} no-ans</span>}
                                {s.questions.length > 0 && noAns === 0 && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                            </div>
                        </div>
                    );
                })}
            </div>
            {warnings.length > 0 && (
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-1.5">
                    <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" />Issues ({warnings.length})</h3>
                    {warnings.map((w, i) => <p key={i} className="text-xs text-amber-700 flex items-start gap-1.5"><XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{w}</p>)}
                </div>
            )}
            {ready && <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center gap-2 text-green-800 text-sm"><CheckCircle2 className="w-5 h-5 shrink-0" />All sections complete. Test is ready to publish!</div>}
            <Button onClick={onPublish} disabled={!ready} size="lg" className="w-full gap-2">{ready ? '🚀 Publish Test' : '⚠️ Fix issues to publish'}</Button>
        </div>
    );
};

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
const TestBuilderPage: React.FC = () => {
    const { categoryId, sectionId, examId, slotKey, testId } = useParams<{ categoryId: string; sectionId: string; examId: string; slotKey: string; testId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [data, setData] = useLocalStorage<BT>(`test-builder-${testId}`, { testId: testId ?? '', sections: [], sectionLockEnabled: true });

    const [activeSIdx, setActiveSIdx] = useState(0);
    const [sectionModal, setSectionModal] = useState(false);
    const [editingSec, setEditingSec] = useState<BS | null>(null);
    const [deleteSec, setDeleteSec] = useState<BS | null>(null);
    const [draftQ, setDraftQ] = useState<BQ | null>(null);
    const [activeQId, setActiveQId] = useState<string | null>(null);
    const [isNewQ, setIsNewQ] = useState(false);
    const [deleteQ, setDeleteQ] = useState<{ sId: string; qId: string } | null>(null);
    const [tab, setTab] = useState('builder');
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploadSId, setUploadSId] = useState<string | null>(null);

    const activeSection = data.sections[activeSIdx] ?? null;

    useEffect(() => {
        if (activeSIdx >= data.sections.length && data.sections.length > 0) setActiveSIdx(data.sections.length - 1);
    }, [data.sections.length, activeSIdx]);

    // Section CRUD
    const saveSection = useCallback((d: Pick<BS, 'id' | 'name' | 'durationMinutes'>) => {
        setData(prev => {
            const exists = prev.sections.some(s => s.id === d.id);
            return { ...prev, sections: exists ? prev.sections.map(s => s.id === d.id ? { ...s, ...d } : s) : [...prev.sections, { ...d, questions: [] }] };
        });
        if (!editingSec) setActiveSIdx(data.sections.length);
        setSectionModal(false); setEditingSec(null);
        toast({ title: editingSec ? 'Section updated' : 'Section added ✓', description: d.name });
    }, [editingSec, data.sections.length, setData, toast]);

    const delSection = useCallback(() => {
        if (!deleteSec) return;
        setData(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== deleteSec.id) }));
        setActiveSIdx(0); setDraftQ(null); setActiveQId(null); setDeleteSec(null);
        toast({ title: 'Section deleted' });
    }, [deleteSec, setData, toast]);

    // Question CRUD
    const startAdd = () => { const q = blankQ(); setIsNewQ(true); setActiveQId(q.id); setDraftQ({ ...q }); };
    const startEdit = (q: BQ) => { setIsNewQ(false); setActiveQId(q.id); setDraftQ({ ...q }); };
    const cancelEdit = () => { setDraftQ(null); setActiveQId(null); };

    const commitQ = useCallback((andNext: boolean) => {
        if (!draftQ || !activeSection) return;
        const sid = activeSection.id;
        setData(prev => ({
            ...prev, sections: prev.sections.map(s => {
                if (s.id !== sid) return s;
                const exists = s.questions.some(q => q.id === draftQ.id);
                return { ...s, questions: exists ? s.questions.map(q => q.id === draftQ.id ? draftQ : q) : [...s.questions, draftQ] };
            })
        }));
        toast({ title: isNewQ ? 'Question added ✓' : 'Question updated ✓' });
        if (andNext) { const q = blankQ(); setIsNewQ(true); setActiveQId(q.id); setDraftQ({ ...q }); }
        else { setDraftQ({ ...draftQ }); setActiveQId(draftQ.id); setIsNewQ(false); }
    }, [draftQ, activeSection, isNewQ, setData, toast]);

    const duplicateQ = useCallback((sid: string, q: BQ) => {
        const newQ = { ...q, id: uid() };
        setData(prev => ({ ...prev, sections: prev.sections.map(s => s.id !== sid ? s : { ...s, questions: [...s.questions, newQ] }) }));
        toast({ title: 'Question duplicated' });
    }, [setData, toast]);

    const moveQ = useCallback((fromSId: string, qId: string, toSId: string) => {
        if (fromSId === toSId) return;
        let movingQ: BQ | null = null;
        setData(prev => ({
            ...prev, sections: prev.sections.map(s => {
                if (s.id === fromSId) { movingQ = s.questions.find(q => q.id === qId) || null; return { ...s, questions: s.questions.filter(q => q.id !== qId) }; }
                if (s.id === toSId && movingQ) return { ...s, questions: [...s.questions, movingQ] };
                return s;
            })
        }));
        toast({ title: 'Question moved ✓' });
    }, [setData, toast]);

    const delQ = useCallback(() => {
        if (!deleteQ) return;
        setData(prev => ({ ...prev, sections: prev.sections.map(s => s.id !== deleteQ.sId ? s : { ...s, questions: s.questions.filter(q => q.id !== deleteQ.qId) }) }));
        if (activeQId === deleteQ.qId) { setDraftQ(null); setActiveQId(null); }
        setDeleteQ(null); toast({ title: 'Question deleted' });
    }, [deleteQ, activeQId, setData, toast]);

    // Section reorder
    const moveSectionUp = useCallback((idx: number) => {
        if (idx === 0) return;
        setData(prev => {
            const secs = [...prev.sections];
            [secs[idx - 1], secs[idx]] = [secs[idx], secs[idx - 1]];
            return { ...prev, sections: secs };
        });
        setActiveSIdx(idx - 1);
    }, [setData]);

    const moveSectionDown = useCallback((idx: number) => {
        setData(prev => {
            if (idx >= prev.sections.length - 1) return prev;
            const secs = [...prev.sections];
            [secs[idx], secs[idx + 1]] = [secs[idx + 1], secs[idx]];
            return { ...prev, sections: secs };
        });
        setActiveSIdx(idx + 1);
    }, [setData]);

    // Excel upload
    const doUpload = (sId: string) => { setUploadSId(sId); fileRef.current?.click(); };
    const onFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f || !uploadSId) return; e.target.value = '';
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const { questions, warnings } = parseCsvToQuestions(ev.target?.result as string);
                if (!questions.length) {
                    toast({ title: 'No questions found', description: 'Check CSV format. Download the template for reference.', variant: 'destructive' });
                    setUploadSId(null); return;
                }
                const sid = uploadSId;
                setData(prev => ({ ...prev, sections: prev.sections.map(s => s.id !== sid ? s : { ...s, questions: [...s.questions, ...questions] }) }));
                if (warnings.length > 0) {
                    // Show warnings toast for missing fields
                    toast({
                        title: `⚠️ Imported ${questions.length} questions with ${warnings.length} warning(s)`,
                        description: warnings.slice(0, 5).join(' | ') + (warnings.length > 5 ? ` …and ${warnings.length - 5} more` : ''),
                        variant: 'destructive',
                    });
                } else {
                    toast({ title: `✅ Imported ${questions.length} questions`, description: 'All questions imported with options and answers auto-detected.' });
                }
            } catch { toast({ title: 'Parse error', description: 'Could not read the file. Ensure it is a valid CSV.', variant: 'destructive' }); }
            setUploadSId(null);
        };
        reader.readAsText(f);
    }, [uploadSId, setData, toast]);

    const totalQ = data.sections.reduce((a, s) => a + s.questions.length, 0);
    const totalM = data.sections.reduce((a, s) => a + s.questions.reduce((b, q) => b + q.marks, 0), 0);
    const totalD = data.sections.reduce((a, s) => a + s.durationMinutes, 0);
    const secNames = data.sections.map(s => ({ id: s.id, name: s.name }));

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={onFile} />

            {/* Header */}
            <div className="bg-white border-b px-4 py-2.5 flex items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => navigate(`/super-admin/test-catalog/${categoryId}/${sectionId}/${examId}`)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0">
                        <ArrowLeft className="h-3.5 w-3.5" />Back
                    </button>
                    <span className="text-gray-300 text-xs">/</span>
                    <h1 className="text-sm font-semibold truncate"><FileQuestion className="inline w-4 h-4 mr-1 text-primary" />Test Builder</h1>
                    <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 hidden sm:block">{testId}</code>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    <span><Layers className="inline w-3 h-3 mr-0.5" />{data.sections.length} sections</span>
                    <span><BookOpen className="inline w-3 h-3 mr-0.5" />{totalQ} Qs</span>
                    <span className="text-green-700 font-medium">{totalM} marks</span>
                    <span><Clock className="inline w-3 h-3 mr-0.5" />{totalD}min</span>
                </div>
                <Button size="sm" className="gap-1 shrink-0 h-8 text-xs" onClick={() => { setSectionModal(true); setEditingSec(null); }}>
                    <Plus className="h-3.5 w-3.5" />Add Section
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white border-b px-4 flex-shrink-0">
                    <TabsList className="h-9 bg-transparent gap-0 p-0">
                        <TabsTrigger value="builder" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-9 text-xs gap-1.5">
                            <FilePlus2 className="w-3.5 h-3.5" />Builder
                        </TabsTrigger>
                        <TabsTrigger value="analysis" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-9 text-xs gap-1.5">
                            <BarChart2 className="w-3.5 h-3.5" />Analysis
                            {totalQ > 0 && <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 h-4">{totalQ}</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-9 text-xs gap-1.5">
                            <Settings className="w-3.5 h-3.5" />Settings
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="builder" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                    {data.sections.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center max-w-sm">
                                <BookOpen className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                                <h2 className="text-lg font-semibold text-gray-600 mb-2">No sections yet</h2>
                                <p className="text-sm text-gray-400 mb-6">Add a section, then add questions manually or upload a CSV file.</p>
                                <Button onClick={() => { setSectionModal(true); setEditingSec(null); }} className="gap-2"><Plus className="h-4 w-4" />Add First Section</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex overflow-hidden">
                            {/* ── LEFT PANEL ── */}
                            <div className="w-[340px] min-w-[260px] max-w-[360px] border-r flex flex-col bg-white overflow-hidden">
                                {/* Section tabs with reorder */}
                                <div className="border-b bg-gray-50 flex-shrink-0 overflow-x-auto">
                                    <div className="flex min-w-max">
                                        {data.sections.map((s, i) => (
                                            <div key={s.id} className="flex items-stretch">
                                                <button onClick={() => { setActiveSIdx(i); setDraftQ(null); setActiveQId(null); }}
                                                    className={`px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1 ${i === activeSIdx ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                                                    <span className="text-[9px] text-gray-400 mr-0.5">{i + 1}.</span>
                                                    {s.name}
                                                    <span className="text-[9px] bg-gray-100 text-gray-500 rounded-full px-1.5">{s.questions.length}</span>
                                                </button>
                                                {/* Up/Down reorder buttons */}
                                                <div className="flex flex-col justify-center pr-1 gap-0.5">
                                                    <button onClick={() => moveSectionUp(i)} disabled={i === 0} title="Move section up" className="text-gray-300 hover:text-primary disabled:opacity-20 transition-colors"><ArrowUp className="w-2.5 h-2.5" /></button>
                                                    <button onClick={() => moveSectionDown(i)} disabled={i === data.sections.length - 1} title="Move section down" className="text-gray-300 hover:text-primary disabled:opacity-20 transition-colors"><ArrowDown className="w-2.5 h-2.5" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Section controls */}
                                {activeSection && (
                                    <div className="px-3 py-2 border-b flex items-center justify-between flex-shrink-0 bg-gray-50/50">
                                        <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                                            <Clock className="w-3 h-3" />{activeSection.durationMinutes}m
                                            <span>·</span>{activeSection.questions.reduce((a, q) => a + q.marks, 0)} marks
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => doUpload(activeSection.id)} className="flex items-center gap-1 text-[10px] text-primary border border-primary/30 rounded px-1.5 py-0.5 hover:bg-primary/5">
                                                <Upload className="w-2.5 h-2.5" />CSV
                                            </button>
                                            <button onClick={() => { setEditingSec(activeSection); setSectionModal(true); }} className="p-1 text-gray-400 hover:text-primary rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => setDeleteSec(activeSection)} className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                )}
                                {/* Question list — flex-1 with overflow-y-auto */}
                                <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
                                    {activeSection?.questions.length === 0 && (
                                        <div className="text-center py-8 text-gray-400">
                                            <Target className="w-8 w-8 mx-auto mb-2 text-gray-200" />
                                            <p className="text-xs">No questions yet</p>
                                        </div>
                                    )}
                                    {activeSection?.questions.map((q, qi) => (
                                        <QCard key={q.id} q={q} num={qi + 1} active={activeQId === q.id}
                                            onEdit={() => startEdit(q)}
                                            onDelete={() => setDeleteQ({ sId: activeSection.id, qId: q.id })}
                                            onDuplicate={() => duplicateQ(activeSection.id, q)}
                                            onMove={toSId => moveQ(activeSection.id, q.id, toSId)}
                                            sectionNames={secNames.filter(s => s.id !== activeSection.id)}
                                        />
                                    ))}
                                </div>
                                {/* Footer — always visible */}
                                {activeSection && (
                                    <div className="border-t p-2 flex gap-2 flex-shrink-0 bg-white">
                                        <Button size="sm" className="flex-1 gap-1 h-8 text-xs" onClick={startAdd}><Plus className="w-3.5 h-3.5" />Add Question</Button>
                                        <Button size="sm" variant="outline" className="gap-1 h-8 text-xs text-muted-foreground" onClick={downloadTemplate} title="Download CSV template"><Download className="w-3 h-3" />Template</Button>
                                    </div>
                                )}
                            </div>

                            {/* ── RIGHT PANEL ── */}
                            <div className="flex-1 overflow-hidden flex flex-col bg-white">
                                {draftQ && activeSection ? (
                                    <QEditor q={draftQ} onChange={setDraftQ}
                                        onSave={() => commitQ(false)}
                                        onSaveNext={() => commitQ(true)}
                                        onCancel={cancelEdit}
                                        isNew={isNewQ}
                                        sectionName={activeSection.name}
                                    />
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-center p-8">
                                        <div>
                                            <FileSpreadsheet className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                                            <h3 className="text-sm font-semibold text-gray-500 mb-1">Question Editor</h3>
                                            <p className="text-xs text-gray-400 mb-5">Click a question on the left to edit,<br />or add a new one.</p>
                                            <div className="flex flex-col items-center gap-2">
                                                <Button size="sm" className="gap-1.5" onClick={startAdd}><Plus className="w-4 h-4" />Add Question</Button>
                                                <button onClick={() => activeSection && doUpload(activeSection.id)} className="text-xs text-primary flex items-center gap-1 hover:underline"><Upload className="w-3 h-3" />Upload CSV</button>
                                                <button onClick={downloadTemplate} className="text-[11px] text-gray-400 flex items-center gap-1 hover:underline"><Download className="w-3 h-3" />Download template</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="analysis" className="flex-1 overflow-y-auto mt-0 p-5">
                    <AnalysisTab sections={data.sections} onPublish={() => toast({ title: '✅ Test published!', description: 'Students can now access this test.' })} />
                </TabsContent>

                <TabsContent value="settings" className="flex-1 overflow-y-auto mt-0 p-6">
                    <div className="max-w-2xl space-y-6">
                        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Settings className="w-4 h-4 text-primary" />Test Settings</h2>

                        {/* Section Lock */}
                        <div className="border rounded-xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        {data.sectionLockEnabled ? <Lock className="w-4 h-4 text-red-500" /> : <Unlock className="w-4 h-4 text-green-500" />}
                                        Section Lock
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {data.sectionLockEnabled
                                            ? 'Students must submit one section before moving to the next. Cannot go back.'
                                            : 'Students can freely switch between sections at any time during the exam.'}
                                    </p>
                                </div>
                                <Switch
                                    checked={data.sectionLockEnabled}
                                    onCheckedChange={(v) => setData(prev => ({ ...prev, sectionLockEnabled: v }))}
                                />
                            </div>
                            <div className={`text-xs px-3 py-2 rounded-lg ${data.sectionLockEnabled ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                {data.sectionLockEnabled
                                    ? '🔒 Locked mode — once a section is submitted, it cannot be re-opened. Sections proceed sequentially.'
                                    : '🔓 Free mode — students can navigate between sections freely. All sections remain accessible throughout.'}
                            </div>
                        </div>

        {/* Section Order */}
                        <div className="border rounded-xl p-5 space-y-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2"><Layers className="w-4 h-4 text-primary" />Section Order &amp; Lock Preview</h3>
                            <p className="text-xs text-muted-foreground">
                                {data.sectionLockEnabled
                                    ? 'Students will unlock sections sequentially in this order. Use the ▲▼ arrows in the Builder tab to reorder.'
                                    : 'Students will see sections in this order. Use the ▲▼ arrows in the Builder tab to reorder.'}
                            </p>
                            {data.sectionLockEnabled && data.sections.length > 1 && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-700">
                                    <Lock className="w-3.5 h-3.5 shrink-0" />
                                    <span>Sections are sequential — students must submit each section before the next one unlocks. They cannot go back.</span>
                                </div>
                            )}
                            {data.sections.length === 0
                                ? <p className="text-xs text-gray-400 italic">No sections added yet.</p>
                                : (
                                    <div className="space-y-2">
                                        {data.sections.map((s, i) => (
                                            <div key={s.id} className="flex items-center gap-3 bg-gray-50 border rounded-lg px-3 py-2.5">
                                                {/* Order number */}
                                                <span className="text-xs font-bold text-primary w-6 text-center shrink-0">{i + 1}</span>

                                                {/* Lock state icon */}
                                                {data.sectionLockEnabled ? (
                                                    i === 0
                                                        ? <Unlock className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                                        : <Lock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                                ) : (
                                                    <Unlock className="w-3.5 h-3.5 text-green-400 shrink-0" />
                                                )}

                                                {/* Section info */}
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <span className="text-xs font-medium truncate">{s.name}</span>
                                                    <span className="text-[10px] text-muted-foreground shrink-0">· {s.questions.length} Qs · {s.durationMinutes}min</span>
                                                </div>

                                                {/* Lock badge */}
                                                {data.sectionLockEnabled && (
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                                        i === 0
                                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                                            : 'bg-red-50 text-red-600 border border-red-100'
                                                    }`}>
                                                        {i === 0
                                                            ? '🔓 Opens First'
                                                            : `🔒 Unlocks after §${i}`}
                                                    </span>
                                                )}

                                                {/* Reorder */}
                                                <div className="flex gap-1 shrink-0">
                                                    <button onClick={() => moveSectionUp(i)} disabled={i === 0} className="p-1 text-gray-300 hover:text-primary disabled:opacity-20 rounded"><ArrowUp className="w-3 h-3" /></button>
                                                    <button onClick={() => moveSectionDown(i)} disabled={i === data.sections.length - 1} className="p-1 text-gray-300 hover:text-primary disabled:opacity-20 rounded"><ArrowDown className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                        ))}
                                        <p className="text-[11px] text-muted-foreground pt-1">
                                            Student starts from: <strong>{data.sections[0]?.name ?? '—'}</strong>
                                            {data.sectionLockEnabled && data.sections.length > 1 && (
                                                <span className="ml-1 text-red-500">· cannot go back once submitted</span>
                                            )}
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <SectionModal open={sectionModal} editing={editingSec} onSave={saveSection} onClose={() => { setSectionModal(false); setEditingSec(null); }} />

            <AlertDialog open={!!deleteSec} onOpenChange={o => !o && setDeleteSec(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />Delete "{deleteSec?.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>This will delete {deleteSec?.questions.length} question(s). Cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-white" onClick={delSection}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!deleteQ} onOpenChange={o => !o && setDeleteQ(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete question?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-white" onClick={delQ}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TestBuilderPage;
