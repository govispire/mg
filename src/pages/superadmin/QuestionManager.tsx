import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useExamCatalog } from '@/hooks/useExamCatalog';
import {
    useQuestionBank, newId, defaultOptions, defaultSubQuestion,
    type Question, type QuestionType, type Option, type SubQuestion,
    type MCQQuestion, type MultiQuestion, type ComprehensionQuestion,
    type PuzzleQuestion, type FillBlankQuestion, type TrueFalseQuestion,
} from '@/hooks/useQuestionBank';
import {
    ArrowLeft, Plus, Trash2, Pencil, Upload, Download, FileText,
    BookOpen, AlignLeft, Puzzle, CheckSquare, ToggleLeft, ChevronDown, ChevronUp,
    GripVertical, Eye, List, X, Check, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUESTION_TYPE_META: Record<QuestionType, { label: string; icon: React.ReactNode; color: string; description: string }> = {
    mcq: {
        label: 'MCQ – Single Correct',
        icon: <CheckSquare className="h-4 w-4" />,
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        description: 'One correct answer from 4 options',
    },
    multi: {
        label: 'MCQ – Multi Correct',
        icon: <List className="h-4 w-4" />,
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        description: 'One or more correct answers',
    },
    comprehension: {
        label: 'Reading Comprehension',
        icon: <AlignLeft className="h-4 w-4" />,
        color: 'bg-green-100 text-green-700 border-green-200',
        description: 'Passage on left, questions on right',
    },
    puzzle: {
        label: 'Puzzle / Seating Arrangement',
        icon: <Puzzle className="h-4 w-4" />,
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        description: 'Setup paragraph + multiple sub-questions',
    },
    fillblank: {
        label: 'Fill in the Blank',
        icon: <FileText className="h-4 w-4" />,
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        description: 'Sentence with blank + options',
    },
    truefalse: {
        label: 'True / False',
        icon: <ToggleLeft className="h-4 w-4" />,
        color: 'bg-teal-100 text-teal-700 border-teal-200',
        description: 'Statement with true or false answer',
    },
};

// ─── CSV Template ─────────────────────────────────────────────────────────────

const CSV_TEMPLATE = `type,question,optionA,optionB,optionC,optionD,optionE,correct,marks,negative_mark,explanation
mcq,What is 2+2?,3,4,5,6,,b,1,0.25,Because 2+2=4
multi,Which of these are prime numbers?,2,3,4,5,6,"a,b,d",1,0,2 3 and 5 are prime
fillblank,"He ___ to school every day.",goes,going,gone,go,,a,1,0.25,
truefalse,The Earth is flat.,,,,,, false,1,0.25,Earth is a sphere
comprehension,PASSAGE: Once upon a time...|Q1: Who lived in the forest?,Deer,Fox,Lion,Bear,,c,1,0.25,The fox
puzzle,SETUP: 6 people A-F sit in a row|CLUES: A sits next to B|Q1: Who sits in the middle?,A,B,C,D,,c,1,0.25,`;

const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_upload_template.csv';
    a.click();
    URL.revokeObjectURL(url);
};

// ─── Parse uploaded CSV ────────────────────────────────────────────────────────

const parseCSV = (text: string): Question[] => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    const results: Question[] = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
        const [type, question, a, b, c, d, e, correct, marks, neg, explanation] = cols;
        const m = parseFloat(marks) || 1;
        const n = parseFloat(neg) || 0;
        const opts: Option[] = [
            { id: 'a', text: a || '' },
            { id: 'b', text: b || '' },
            { id: 'c', text: c || '' },
            { id: 'd', text: d || '' },
        ];
        if (e) opts.push({ id: 'e', text: e });

        if (type === 'mcq' || type === 'fillblank') {
            results.push({
                id: newId(), type: type as 'mcq' | 'fillblank',
                text: question, options: opts, correctOption: correct || 'a',
                explanation, marks: m, negativeMark: n,
            } as MCQQuestion | FillBlankQuestion);
        } else if (type === 'multi') {
            results.push({
                id: newId(), type: 'multi',
                text: question, options: opts,
                correctOptions: (correct || '').split(',').map(s => s.trim()),
                explanation, marks: m, negativeMark: n,
            } as MultiQuestion);
        } else if (type === 'truefalse') {
            results.push({
                id: newId(), type: 'truefalse',
                text: question, correct: (correct || 'true').trim() as 'true' | 'false',
                explanation, marks: m, negativeMark: n,
            } as TrueFalseQuestion);
        }
        // comprehension/puzzle rows are complex — skip for now (handled in UI)
    }
    return results;
};

// ─── Option Editor ─────────────────────────────────────────────────────────────

const OptionEditor: React.FC<{
    options: Option[];
    correct: string | string[];
    multi?: boolean;
    onChange: (opts: Option[]) => void;
    onCorrectChange: (c: string | string[]) => void;
}> = ({ options, correct, multi = false, onChange, onCorrectChange }) => {
    const toggleCorrect = (id: string) => {
        if (multi) {
            const arr = correct as string[];
            onCorrectChange(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
        } else {
            onCorrectChange(id);
        }
    };

    return (
        <div className="space-y-2">
            {options.map((opt, idx) => {
                const isCorrect = multi
                    ? (correct as string[]).includes(opt.id)
                    : correct === opt.id;
                return (
                    <div key={opt.id} className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors',
                        isCorrect ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'
                    )}>
                        <button
                            type="button"
                            onClick={() => toggleCorrect(opt.id)}
                            className={cn(
                                'shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
                                isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300'
                            )}
                        >
                            {isCorrect && <Check className="h-3 w-3 text-white" />}
                        </button>
                        <span className="font-bold text-xs text-gray-500 w-4">{opt.id.toUpperCase()}.</span>
                        <Input
                            value={opt.text}
                            onChange={(e) => {
                                const updated = [...options];
                                updated[idx] = { ...opt, text: e.target.value };
                                onChange(updated);
                            }}
                            placeholder={`Option ${opt.id.toUpperCase()}`}
                            className="h-7 text-sm border-0 bg-transparent p-0 focus-visible:ring-0"
                        />
                    </div>
                );
            })}
            {options.length < 5 && (
                <Button
                    type="button" variant="ghost" size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                        const nextId = String.fromCharCode(97 + options.length); // a=97
                        onChange([...options, { id: nextId, text: '' }]);
                    }}
                >
                    <Plus className="h-3 w-3 mr-1" /> Add Option
                </Button>
            )}
        </div>
    );
};

// ─── Sub-Question Editor ───────────────────────────────────────────────────────

const SubQuestionEditor: React.FC<{
    sub: SubQuestion;
    index: number;
    onChange: (updated: SubQuestion) => void;
    onDelete: () => void;
}> = ({ sub, index, onChange, onDelete }) => {
    return (
        <div className="border rounded-lg p-3 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-gray-600">Sub-Question {index + 1}</Label>
                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={onDelete}>
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>
            <Textarea
                value={sub.text}
                onChange={(e) => onChange({ ...sub, text: e.target.value })}
                placeholder="Sub-question text..."
                rows={2}
                className="text-sm"
            />
            <OptionEditor
                options={sub.options}
                correct={sub.correctOptions}
                multi
                onChange={(opts) => onChange({ ...sub, options: opts })}
                onCorrectChange={(c) => onChange({ ...sub, correctOptions: c as string[] })}
            />
            <Input
                value={sub.explanation || ''}
                onChange={(e) => onChange({ ...sub, explanation: e.target.value })}
                placeholder="Explanation (optional)"
                className="text-xs h-7"
            />
        </div>
    );
};

// ─── Question Builder ──────────────────────────────────────────────────────────

interface BuilderProps {
    initial?: Question | null;
    onSave: (q: Question) => void;
    onCancel: () => void;
}

const QuestionBuilder: React.FC<BuilderProps> = ({ initial, onSave, onCancel }) => {
    const [type, setType] = useState<QuestionType>(initial?.type || 'mcq');
    const [marks, setMarks] = useState(initial?.marks ?? 1);
    const [neg, setNeg] = useState(initial?.negativeMark ?? 0.25);

    // MCQ / fillblank state
    const [text, setText] = useState(
        (initial as MCQQuestion | FillBlankQuestion | TrueFalseQuestion)?.text || ''
    );
    const [options, setOptions] = useState<Option[]>(
        (initial as MCQQuestion)?.options || defaultOptions()
    );
    const [correctOption, setCorrectOption] = useState(
        (initial as MCQQuestion | FillBlankQuestion)?.correctOption || 'a'
    );
    const [correctOptions, setCorrectOptions] = useState<string[]>(
        (initial as MultiQuestion)?.correctOptions || []
    );
    const [tfCorrect, setTfCorrect] = useState<'true' | 'false'>(
        (initial as TrueFalseQuestion)?.correct || 'true'
    );
    const [explanation, setExplanation] = useState(
        (initial as MCQQuestion)?.explanation || ''
    );

    // Comprehension state
    const [passage, setPassage] = useState(
        (initial as ComprehensionQuestion)?.passage || ''
    );

    // Puzzle state
    const [setup, setSetup] = useState(
        (initial as PuzzleQuestion)?.setup || ''
    );
    const [clues, setClues] = useState(
        (initial as PuzzleQuestion)?.clues || ''
    );

    // Sub-questions (comprehension + puzzle)
    const [subQs, setSubQs] = useState<SubQuestion[]>(
        (initial as ComprehensionQuestion | PuzzleQuestion)?.subQuestions || [defaultSubQuestion()]
    );

    const updateSub = (idx: number, updated: SubQuestion) =>
        setSubQs(prev => prev.map((s, i) => i === idx ? updated : s));

    const handleSave = () => {
        const base = { id: initial?.id || newId(), marks, negativeMark: neg };
        switch (type) {
            case 'mcq': return onSave({ ...base, type, text, options, correctOption, explanation } as MCQQuestion);
            case 'multi': return onSave({ ...base, type, text, options, correctOptions, explanation } as MultiQuestion);
            case 'fillblank': return onSave({ ...base, type, text, options, correctOption, explanation } as FillBlankQuestion);
            case 'truefalse': return onSave({ ...base, type, text, correct: tfCorrect, explanation } as TrueFalseQuestion);
            case 'comprehension': return onSave({ ...base, type, passage, subQuestions: subQs } as ComprehensionQuestion);
            case 'puzzle': return onSave({ ...base, type, setup, clues, subQuestions: subQs } as PuzzleQuestion);
        }
    };

    const isComprehensionLike = type === 'comprehension' || type === 'puzzle';

    return (
        <div className="space-y-4">
            {/* Type selector */}
            <div className="space-y-2">
                <Label className="text-xs font-semibold">Question Type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.entries(QUESTION_TYPE_META) as [QuestionType, typeof QUESTION_TYPE_META[QuestionType]][]).map(([key, meta]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setType(key)}
                            className={cn(
                                'flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-left transition-all hover:shadow-sm',
                                type === key ? 'border-primary bg-primary/5' : 'border-gray-200'
                            )}
                        >
                            <span className={cn('p-1 rounded', meta.color)}>{meta.icon}</span>
                            <span className="text-xs font-medium leading-tight">{meta.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Marks row */}
            <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                    <Label className="text-xs">Marks</Label>
                    <Input type="number" min={0} step={0.5} value={marks}
                        onChange={e => setMarks(parseFloat(e.target.value) || 0)} className="h-8" />
                </div>
                <div className="flex-1 space-y-1">
                    <Label className="text-xs">Negative Mark</Label>
                    <Input type="number" min={0} step={0.25} value={neg}
                        onChange={e => setNeg(parseFloat(e.target.value) || 0)} className="h-8" />
                </div>
            </div>

            <div className="border-t pt-4 space-y-4">
                {/* ── Simple types (mcq, multi, fillblank, truefalse) ── */}
                {!isComprehensionLike && (
                    <>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                {type === 'fillblank' ? 'Sentence (use ___ for blank)' : 'Question Text'}
                            </Label>
                            <Textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder={type === 'fillblank' ? 'He ___ to school every day.' : 'Enter question text...'}
                                rows={3}
                            />
                        </div>

                        {type === 'truefalse' ? (
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Correct Answer</Label>
                                <div className="flex gap-3">
                                    {(['true', 'false'] as const).map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => setTfCorrect(v)}
                                            className={cn(
                                                'flex-1 py-2 rounded-lg border-2 font-semibold text-sm capitalize transition-colors',
                                                tfCorrect === v
                                                    ? v === 'true' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700'
                                                    : 'border-gray-200 text-gray-500'
                                            )}
                                        >{v}</button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Options
                                    <span className="ml-2 text-[10px] text-muted-foreground font-normal">
                                        (click circle to mark correct answer)
                                    </span>
                                </Label>
                                <OptionEditor
                                    options={options}
                                    correct={type === 'multi' ? correctOptions : correctOption}
                                    multi={type === 'multi'}
                                    onChange={setOptions}
                                    onCorrectChange={(c) => {
                                        if (type === 'multi') setCorrectOptions(c as string[]);
                                        else setCorrectOption(c as string);
                                    }}
                                />
                            </div>
                        )}

                        <div className="space-y-1">
                            <Label className="text-xs">Explanation (optional)</Label>
                            <Input
                                value={explanation}
                                onChange={e => setExplanation(e.target.value)}
                                placeholder="Brief explanation of the correct answer"
                                className="h-8"
                            />
                        </div>
                    </>
                )}

                {/* ── Comprehension ── */}
                {type === 'comprehension' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                                <AlignLeft className="h-3.5 w-3.5" /> Passage (Left Panel)
                            </Label>
                            <Textarea
                                value={passage}
                                onChange={e => setPassage(e.target.value)}
                                placeholder="Enter the reading comprehension passage here..."
                                rows={12}
                                className="text-sm resize-none"
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold">Questions (Right Panel)</Label>
                                <Button
                                    type="button" variant="outline" size="sm" className="h-7 text-xs"
                                    onClick={() => setSubQs(prev => [...prev, defaultSubQuestion()])}
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add Question
                                </Button>
                            </div>
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                {subQs.map((sq, i) => (
                                    <SubQuestionEditor
                                        key={sq.id} sub={sq} index={i}
                                        onChange={(u) => updateSub(i, u)}
                                        onDelete={() => setSubQs(prev => prev.filter((_, idx) => idx !== i))}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Puzzle / Seating Arrangement ── */}
                {type === 'puzzle' && (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                                <Puzzle className="h-3.5 w-3.5" /> Setup / Description
                            </Label>
                            <Textarea
                                value={setup}
                                onChange={e => setSetup(e.target.value)}
                                placeholder="e.g. Six persons A, B, C, D, E and F are sitting in a row facing North..."
                                rows={4}
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Clues / Conditions</Label>
                            <Textarea
                                value={clues}
                                onChange={e => setClues(e.target.value)}
                                placeholder="I. A sits to the immediate right of B.&#10;II. C sits at one of the extreme ends..."
                                rows={4}
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold">Questions</Label>
                                <Button
                                    type="button" variant="outline" size="sm" className="h-7 text-xs"
                                    onClick={() => setSubQs(prev => [...prev, defaultSubQuestion()])}
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add Question
                                </Button>
                            </div>
                            {subQs.map((sq, i) => (
                                <SubQuestionEditor
                                    key={sq.id} sub={sq} index={i}
                                    onChange={(u) => updateSub(i, u)}
                                    onDelete={() => setSubQs(prev => prev.filter((_, idx) => idx !== i))}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="button" onClick={handleSave}>
                    {initial ? 'Update Question' : 'Add Question'}
                </Button>
            </div>
        </div>
    );
};

// ─── Question Row / Card ──────────────────────────────────────────────────────

const QuestionRow: React.FC<{
    q: Question;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ q, index, onEdit, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const meta = QUESTION_TYPE_META[q.type];

    const preview = () => {
        if (q.type === 'comprehension') return `[Passage] + ${q.subQuestions.length} sub-question(s)`;
        if (q.type === 'puzzle') return `[Puzzle/SA] + ${q.subQuestions.length} sub-question(s)`;
        if (q.type === 'truefalse') return q.text;
        return (q as MCQQuestion).text;
    };

    return (
        <div className="border rounded-lg bg-white hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-xs font-bold text-gray-400 mt-0.5 w-6 shrink-0">Q{index + 1}</span>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant="outline" className={cn('text-[10px] px-1.5', meta.color)}>
                            {meta.icon} <span className="ml-1">{meta.label}</span>
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{q.marks} mark{q.marks !== 1 ? 's' : ''} | -{q.negativeMark} negative</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{preview()}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={onEdit}>
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={onDelete}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {expanded && (
                <div className="border-t px-4 py-3 bg-gray-50/60">
                    {(q.type === 'mcq' || q.type === 'fillblank') && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">{q.text}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {q.options.map(opt => (
                                    <div key={opt.id} className={cn(
                                        'flex items-center gap-2 rounded px-2 py-1 text-sm',
                                        q.correctOption === opt.id ? 'bg-green-100 text-green-800 font-semibold' : 'bg-white border'
                                    )}>
                                        <span className="font-bold text-xs">{opt.id.toUpperCase()}.</span> {opt.text}
                                        {q.correctOption === opt.id && <Check className="h-3 w-3 ml-auto" />}
                                    </div>
                                ))}
                            </div>
                            {q.explanation && <p className="text-xs text-muted-foreground italic">💡 {q.explanation}</p>}
                        </div>
                    )}
                    {q.type === 'multi' && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">{q.text}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {q.options.map(opt => (
                                    <div key={opt.id} className={cn(
                                        'flex items-center gap-2 rounded px-2 py-1 text-sm',
                                        q.correctOptions.includes(opt.id) ? 'bg-green-100 text-green-800 font-semibold' : 'bg-white border'
                                    )}>
                                        <span className="font-bold text-xs">{opt.id.toUpperCase()}.</span> {opt.text}
                                        {q.correctOptions.includes(opt.id) && <Check className="h-3 w-3 ml-auto" />}
                                    </div>
                                ))}
                            </div>
                            {q.explanation && <p className="text-xs text-muted-foreground italic">💡 {q.explanation}</p>}
                        </div>
                    )}
                    {q.type === 'truefalse' && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">{q.text}</p>
                            <p className={cn(
                                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold',
                                q.correct === 'true' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            )}>
                                <Check className="h-3.5 w-3.5" /> {q.correct === 'true' ? 'True' : 'False'}
                            </p>
                            {q.explanation && <p className="text-xs text-muted-foreground italic">💡 {q.explanation}</p>}
                        </div>
                    )}
                    {q.type === 'comprehension' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                <p className="text-xs font-semibold text-blue-700 mb-1">📖 Passage</p>
                                <p className="text-xs text-gray-700 whitespace-pre-line line-clamp-6">{q.passage}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-600">{q.subQuestions.length} Sub-Questions</p>
                                {q.subQuestions.map((sq, i) => (
                                    <div key={sq.id} className="bg-white border rounded p-2">
                                        <p className="text-xs font-medium mb-1">Q{i + 1}: {sq.text}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {sq.options.map(o => (
                                                <span key={o.id} className={cn(
                                                    'text-[10px] px-2 py-0.5 rounded-full border',
                                                    sq.correctOptions.includes(o.id) ? 'bg-green-100 text-green-700 border-green-300' : 'border-gray-200'
                                                )}>
                                                    {o.id.toUpperCase()}. {o.text}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {q.type === 'puzzle' && (
                        <div className="space-y-3">
                            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                                <p className="text-xs font-semibold text-orange-700 mb-1">🧩 Setup</p>
                                <p className="text-sm whitespace-pre-line">{q.setup}</p>
                                {q.clues && (
                                    <>
                                        <p className="text-xs font-semibold text-orange-700 mt-2 mb-1">Clues</p>
                                        <p className="text-xs text-gray-700 whitespace-pre-line">{q.clues}</p>
                                    </>
                                )}
                            </div>
                            {q.subQuestions.map((sq, i) => (
                                <div key={sq.id} className="bg-white border rounded p-2">
                                    <p className="text-xs font-medium mb-1">Q{i + 1}: {sq.text}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {sq.options.map(o => (
                                            <span key={o.id} className={cn(
                                                'text-[10px] px-2 py-0.5 rounded-full border',
                                                sq.correctOptions.includes(o.id) ? 'bg-green-100 text-green-700 border-green-300' : 'border-gray-200'
                                            )}>
                                                {o.id.toUpperCase()}. {o.text}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const QuestionManager: React.FC = () => {
    const { categoryId, sectionId, examId, slotKey, testId } = useParams<{
        categoryId: string; sectionId: string; examId: string; slotKey: string; testId: string;
    }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { catalog } = useExamCatalog();
    const { questions, addQuestion, updateQuestion, deleteQuestion, importBulk, clearAll } = useQuestionBank(testId!);

    // Lookup names for breadcrumb
    const cat = catalog.find(c => c.id === categoryId);
    const section = cat?.sections.find(s => s.id === sectionId);
    const exam = section?.exams.find(e => e.id === examId);
    const slot = exam?.testSlots.find(s => s.key === slotKey);
    const test = slot?.tests.find(t => t.id === testId);

    // UI state
    const [tab, setTab] = useState<'questions' | 'create' | 'upload'>('questions');
    const [editTarget, setEditTarget] = useState<Question | null>(null);
    const [showBuilder, setShowBuilder] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleSaveQuestion = (q: Question) => {
        if (editTarget) {
            updateQuestion(editTarget.id, q);
            toast({ title: 'Question updated' });
        } else {
            addQuestion(q);
            toast({ title: 'Question added', description: `Q${questions.length + 1} added` });
        }
        setShowBuilder(false);
        setEditTarget(null);
        setTab('questions');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            const parsed = parseCSV(text);
            if (parsed.length === 0) {
                toast({ title: 'No questions found', description: 'Check your file format matches the template', variant: 'destructive' });
            } else {
                importBulk(parsed);
                toast({ title: `${parsed.length} questions imported`, description: 'Questions added to the bank' });
                setTab('questions');
            }
            setUploading(false);
        };
        reader.readAsText(file);
        if (fileRef.current) fileRef.current.value = '';
    };

    const back = () => navigate(
        `/super-admin/test-catalog/${categoryId}/${sectionId}/${examId}`
    );

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="bg-white border-b px-4 sm:px-6 py-3 sticky top-0 z-10">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 flex-wrap">
                    <button onClick={back} className="hover:text-primary transition-colors flex items-center gap-1">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>{exam?.name || examId}</span>
                    </button>
                    <span>/</span>
                    <span className="font-medium text-gray-700">{slot?.label || slotKey}</span>
                    <span>/</span>
                    <span className="font-medium text-primary">{test?.name || testId}</span>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Question Manager</h1>
                        <p className="text-xs text-muted-foreground">
                            {questions.length} question{questions.length !== 1 ? 's' : ''} •{' '}
                            {test?.totalQuestions} expected •{' '}
                            {cat?.name} › {section?.name} › {exam?.name}
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {questions.length > 0 && (
                            <Button variant="outline" size="sm" className="h-8 text-xs"
                                onClick={() => { if (confirm('Clear ALL questions?')) { clearAll(); toast({ title: 'All questions cleared', variant: 'destructive' }); } }}>
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear All
                            </Button>
                        )}
                        <Button size="sm" className="h-8 text-xs"
                            onClick={() => { setEditTarget(null); setShowBuilder(true); setTab('create'); }}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Body ───────────────────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                <Tabs value={tab} onValueChange={(v) => { setTab(v as typeof tab); if (v !== 'create') { setShowBuilder(false); setEditTarget(null); } }}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="questions" className="text-xs">
                            <BookOpen className="h-3.5 w-3.5 mr-1" /> Questions ({questions.length})
                        </TabsTrigger>
                        <TabsTrigger value="create" className="text-xs">
                            <Plus className="h-3.5 w-3.5 mr-1" /> {editTarget ? 'Edit' : 'Create'} Question
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="text-xs">
                            <Upload className="h-3.5 w-3.5 mr-1" /> Bulk Upload
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Question List ── */}
                    <TabsContent value="questions">
                        {questions.length === 0 ? (
                            <div className="text-center py-16 space-y-3">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                                    <BookOpen className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">No questions yet</p>
                                <p className="text-sm text-muted-foreground">Create questions manually or bulk upload via CSV</p>
                                <div className="flex gap-2 justify-center">
                                    <Button size="sm" onClick={() => setTab('create')}>
                                        <Plus className="h-3.5 w-3.5 mr-1" /> Create Question
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setTab('upload')}>
                                        <Upload className="h-3.5 w-3.5 mr-1" /> Bulk Upload
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {questions.map((q, i) => (
                                    <QuestionRow
                                        key={q.id}
                                        q={q}
                                        index={i}
                                        onEdit={() => { setEditTarget(q); setShowBuilder(true); setTab('create'); }}
                                        onDelete={() => setDeleteTarget(q.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ── Question Builder ── */}
                    <TabsContent value="create">
                        <div className="bg-white border rounded-xl p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <Plus className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-sm">
                                        {editTarget ? 'Edit Question' : 'Create New Question'}
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Choose question type and fill in the details
                                    </p>
                                </div>
                            </div>
                            {(showBuilder || tab === 'create') && (
                                <QuestionBuilder
                                    initial={editTarget}
                                    onSave={handleSaveQuestion}
                                    onCancel={() => { setTab('questions'); setShowBuilder(false); setEditTarget(null); }}
                                />
                            )}
                        </div>
                    </TabsContent>

                    {/* ── Bulk Upload ── */}
                    <TabsContent value="upload">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Template card */}
                            <div className="bg-white border rounded-xl p-5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-blue-100">
                                        <Download className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Download Template</h3>
                                        <p className="text-xs text-muted-foreground">CSV template with all question types</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1 font-mono text-gray-600">
                                    <p className="text-[10px] font-semibold text-gray-500 mb-2">Supported question types:</p>
                                    {Object.entries(QUESTION_TYPE_META).map(([key, meta]) => (
                                        <div key={key} className="flex items-center gap-2">
                                            <Badge variant="outline" className={cn('text-[9px] px-1', meta.color)}>{key}</Badge>
                                            <span className="text-[10px]">{meta.description}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button className="w-full" variant="outline" onClick={downloadTemplate}>
                                    <Download className="h-4 w-4 mr-2" /> Download CSV Template
                                </Button>
                                <p className="text-[10px] text-muted-foreground">
                                    After filling the template, upload it below. Excel (.xlsx) files should be saved as CSV first.
                                </p>
                            </div>

                            {/* Upload card */}
                            <div className="bg-white border rounded-xl p-5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-green-100">
                                        <Upload className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Upload Questions</h3>
                                        <p className="text-xs text-muted-foreground">CSV or TXT file (max 500 questions)</p>
                                    </div>
                                </div>

                                <div
                                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept=".csv,.txt"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-600">Click to select file</p>
                                    <p className="text-xs text-muted-foreground mt-1">CSV or TXT format</p>
                                </div>

                                {uploading && (
                                    <div className="flex items-center gap-2 text-sm text-primary">
                                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        Processing file...
                                    </div>
                                )}

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <div className="flex gap-2">
                                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                        <div className="text-xs text-amber-700 space-y-1">
                                            <p className="font-semibold">Important Notes</p>
                                            <ul className="list-disc pl-3 space-y-0.5">
                                                <li>Reading Comprehension and Puzzle questions must be created manually via the Create tab</li>
                                                <li>Uploaded questions are added to existing questions (not replaced)</li>
                                                <li>Use the template to ensure correct format</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* ── Delete Confirm ─────────────────────────────────────────────── */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                                if (deleteTarget) {
                                    deleteQuestion(deleteTarget);
                                    toast({ title: 'Question deleted', variant: 'destructive' });
                                    setDeleteTarget(null);
                                }
                            }}
                        >Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default QuestionManager;
