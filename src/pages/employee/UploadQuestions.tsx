
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  CheckSquare, List, Hash, AlignLeft, Puzzle, BarChart2,
  Layers, ArrowRightLeft, FileText, ToggleLeft, Upload, Download,
  Plus, X, Check, BookOpen, AlertCircle, Image,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useQuestionBank, newId, defaultOptions, defaultSubQuestion,
  type Question, type QuestionType, type Option, type SubQuestion,
  type MCQQuestion, type NumericalQuestion, type MultiQuestion,
  type ComprehensionQuestion, type PuzzleQuestion,
  type DIQuestion, type CaseletQuestion, type InputOutputQuestion,
  type FillBlankQuestion, type TrueFalseQuestion,
} from '@/hooks/useQuestionBank';

// ─── Type metadata ─────────────────────────────────────────────────────────────

const QUESTION_TYPE_META: Record<QuestionType, {
  label: string; icon: React.ReactNode; color: string; description: string; panel: 'single' | 'dual';
}> = {
  mcq: { label: 'MCQ – Single Correct', icon: <CheckSquare className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700 border-blue-200', description: 'One correct answer from 4–5 options', panel: 'single' },
  msq: { label: 'MSQ – Multi Select', icon: <List className="h-4 w-4" />, color: 'bg-indigo-100 text-indigo-700 border-indigo-200', description: 'Multiple correct answers (checkboxes)', panel: 'single' },
  numerical: { label: 'Numerical / Integer', icon: <Hash className="h-4 w-4" />, color: 'bg-violet-100 text-violet-700 border-violet-200', description: 'Type exact number as answer', panel: 'single' },
  multi: { label: 'MCQ – Multi Correct', icon: <List className="h-4 w-4" />, color: 'bg-purple-100 text-purple-700 border-purple-200', description: 'One or more correct answers', panel: 'single' },
  comprehension: { label: 'Reading Comprehension', icon: <AlignLeft className="h-4 w-4" />, color: 'bg-green-100 text-green-700 border-green-200', description: 'Passage + sub-questions (DualPanel)', panel: 'dual' },
  puzzle: { label: 'Puzzle / Seating', icon: <Puzzle className="h-4 w-4" />, color: 'bg-orange-100 text-orange-700 border-orange-200', description: 'Setup + clues + sub-questions (DualPanel)', panel: 'dual' },
  di: { label: 'Data Interpretation (DI)', icon: <BarChart2 className="h-4 w-4" />, color: 'bg-sky-100 text-sky-700 border-sky-200', description: 'Chart/table/image + sub-questions (DualPanel)', panel: 'dual' },
  caselet: { label: 'Caselet DI', icon: <Layers className="h-4 w-4" />, color: 'bg-emerald-100 text-emerald-700 border-emerald-200', description: 'Short paragraph + sub-questions (DualPanel)', panel: 'dual' },
  input_output: { label: 'Input-Output / Word Shift', icon: <ArrowRightLeft className="h-4 w-4" />, color: 'bg-rose-100 text-rose-700 border-rose-200', description: 'Rules + transformation sub-questions (DualPanel)', panel: 'dual' },
  fillblank: { label: 'Fill in the Blank', icon: <FileText className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', description: 'Sentence with blank + options', panel: 'single' },
  truefalse: { label: 'True / False', icon: <ToggleLeft className="h-4 w-4" />, color: 'bg-teal-100 text-teal-700 border-teal-200', description: 'Statement with true or false answer', panel: 'single' },
};

// ─── OptionEditor ──────────────────────────────────────────────────────────────
const OptionEditor: React.FC<{
  options: Option[]; correct: string | string[]; multi?: boolean;
  onChange: (opts: Option[]) => void; onCorrectChange: (c: string | string[]) => void;
}> = ({ options, correct, multi = false, onChange, onCorrectChange }) => {
  const toggle = (id: string) => {
    if (multi) {
      const arr = correct as string[];
      onCorrectChange(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
    } else onCorrectChange(id);
  };
  return (
    <div className="space-y-2">
      {options.map((opt, idx) => {
        const isCorrect = multi ? (correct as string[]).includes(opt.id) : correct === opt.id;
        return (
          <div key={opt.id} className={cn('flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors', isCorrect ? 'border-green-400 bg-green-50' : 'border-gray-200')}>
            <button type="button" onClick={() => toggle(opt.id)}
              className={cn('shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center', isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300')}>
              {isCorrect && <Check className="h-3 w-3 text-white" />}
            </button>
            <span className="font-bold text-xs text-gray-500 w-4">{opt.id.toUpperCase()}.</span>
            <Input value={opt.text} placeholder={`Option ${opt.id.toUpperCase()}`}
              onChange={(e) => { const u = [...options]; u[idx] = { ...opt, text: e.target.value }; onChange(u); }}
              className="h-7 text-sm border-0 bg-transparent p-0 focus-visible:ring-0" />
          </div>
        );
      })}
      {options.length < 5 && (
        <Button type="button" variant="ghost" size="sm" className="text-xs h-7"
          onClick={() => onChange([...options, { id: String.fromCharCode(97 + options.length), text: '' }])}>
          <Plus className="h-3 w-3 mr-1" /> Add Option
        </Button>
      )}
    </div>
  );
};

// ─── SubQuestionEditor ─────────────────────────────────────────────────────────
const SubQuestionEditor: React.FC<{
  sub: SubQuestion; index: number; onChange: (u: SubQuestion) => void; onDelete: () => void;
}> = ({ sub, index, onChange, onDelete }) => (
  <div className="border rounded-lg p-3 space-y-3 bg-gray-50">
    <div className="flex items-center justify-between">
      <Label className="text-xs font-semibold text-gray-600">Sub-Question {index + 1}</Label>
      <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={onDelete}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
    <Textarea value={sub.text} onChange={e => onChange({ ...sub, text: e.target.value })}
      placeholder="Sub-question text..." rows={2} className="text-sm" />
    <OptionEditor options={sub.options} correct={sub.correctOptions} multi
      onChange={opts => onChange({ ...sub, options: opts })}
      onCorrectChange={c => onChange({ ...sub, correctOptions: c as string[] })} />
    <Input value={sub.explanation || ''} onChange={e => onChange({ ...sub, explanation: e.target.value })}
      placeholder="Explanation (optional)" className="text-xs h-7" />
  </div>
);

// ─── QuestionBuilder ────────────────────────────────────────────────────────────
const QuestionBuilder: React.FC<{ onSave: (q: Question) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
  const [type, setType] = useState<QuestionType>('mcq');
  const [marks, setMarks] = useState(1);
  const [neg, setNeg] = useState(0.25);
  const [text, setText] = useState('');
  const [options, setOptions] = useState<Option[]>(defaultOptions());
  const [correctOption, setCorrectOption] = useState('a');
  const [correctOptions, setCorrectOptions] = useState<string[]>([]);
  const [tfCorrect, setTfCorrect] = useState<'true' | 'false'>('true');
  const [explanation, setExplanation] = useState('');
  const [numericalAnswer, setNumericalAnswer] = useState('');
  const [numericalTolerance, setNumericalTolerance] = useState('0');
  const [imageUrl, setImageUrl] = useState('');
  const [passage, setPassage] = useState('');
  const [setup, setSetup] = useState('');
  const [clues, setClues] = useState('');
  const [diTitle, setDiTitle] = useState('');
  const [diContent, setDiContent] = useState('');
  const [ioRules, setIoRules] = useState('');
  const [ioExample, setIoExample] = useState('');
  const [subQs, setSubQs] = useState<SubQuestion[]>([defaultSubQuestion()]);
  const updateSub = (idx: number, u: SubQuestion) => setSubQs(p => p.map((s, i) => i === idx ? u : s));

  const isSimple = ['mcq', 'msq', 'multi', 'fillblank', 'truefalse'].includes(type);

  const save = () => {
    const base = { id: newId(), marks, negativeMark: neg };
    switch (type) {
      case 'mcq': return onSave({ ...base, type, text, options, correctOption, explanation, imageUrl: imageUrl || undefined } as MCQQuestion);
      case 'msq': return onSave({ ...base, type, text, options, correctOption: correctOptions.join(','), explanation, imageUrl: imageUrl || undefined } as MCQQuestion);
      case 'multi': return onSave({ ...base, type, text, options, correctOptions, explanation } as MultiQuestion);
      case 'fillblank': return onSave({ ...base, type, text, options, correctOption, explanation } as FillBlankQuestion);
      case 'truefalse': return onSave({ ...base, type, text, correct: tfCorrect, explanation } as TrueFalseQuestion);
      case 'numerical': return onSave({ ...base, type, text, correctAnswer: isNaN(Number(numericalAnswer)) ? numericalAnswer : Number(numericalAnswer), tolerance: Number(numericalTolerance) || undefined, explanation, imageUrl: imageUrl || undefined } as NumericalQuestion);
      case 'comprehension': return onSave({ ...base, type, passage, subQuestions: subQs } as ComprehensionQuestion);
      case 'puzzle': return onSave({ ...base, type, setup, clues, subQuestions: subQs } as PuzzleQuestion);
      case 'di': return onSave({ ...base, type, title: diTitle, sharedContent: diContent, imageUrl: imageUrl || undefined, subQuestions: subQs } as DIQuestion);
      case 'caselet': return onSave({ ...base, type, title: diTitle, passage, subQuestions: subQs } as CaseletQuestion);
      case 'input_output': return onSave({ ...base, type, title: diTitle, rules: ioRules, example: ioExample || undefined, subQuestions: subQs } as InputOutputQuestion);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Type Selector ── */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Question Type</Label>
        <p className="text-[10px] text-muted-foreground">
          Types labelled <span className="font-semibold text-sky-600">DualPanel</span> render a split left-right view in the exam.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
          {(Object.entries(QUESTION_TYPE_META) as [QuestionType, typeof QUESTION_TYPE_META[QuestionType]][]).map(([key, meta]) => (
            <button key={key} type="button" onClick={() => setType(key)}
              className={cn('flex items-start gap-2 rounded-xl border-2 px-3 py-2.5 text-left transition-all hover:shadow-sm',
                type === key ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200'
              )}>
              <span className={cn('p-1 rounded mt-0.5 shrink-0', meta.color)}>{meta.icon}</span>
              <div>
                <p className="text-xs font-semibold leading-tight">{meta.label}</p>
                <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{meta.description}</p>
                {meta.panel === 'dual' && (
                  <span className="text-[8px] font-semibold text-sky-600 bg-sky-50 border border-sky-200 rounded px-1 mt-1 inline-block">DualPanel</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Marks row ── */}
      <div className="flex gap-4 pt-2 border-t">
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

      {/* ── Form fields by type ── */}
      <div className="space-y-4">

        {/* Numerical */}
        {type === 'numerical' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Question Text</Label>
              <Textarea value={text} onChange={e => setText(e.target.value)}
                placeholder="e.g. A train travels 360 km in 4 hours. Find its speed in km/h."
                rows={3} className="text-sm" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Correct Answer</Label>
                <Input value={numericalAnswer} onChange={e => setNumericalAnswer(e.target.value)}
                  placeholder="e.g. 90 or 3.14" className="h-8" />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Tolerance ± (optional)</Label>
                <Input type="number" value={numericalTolerance} onChange={e => setNumericalTolerance(e.target.value)}
                  placeholder="0" className="h-8" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1"><Image className="h-3 w-3" /> Question Image URL (optional)</Label>
              <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="h-8" />
              {imageUrl && <img src={imageUrl} alt="preview" className="mt-1 max-h-32 rounded border" />}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Explanation (optional)</Label>
              <Input value={explanation} onChange={e => setExplanation(e.target.value)}
                placeholder="Brief explanation of the correct answer" className="h-8" />
            </div>
          </div>
        )}

        {/* DI */}
        {type === 'di' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5"><BarChart2 className="h-3.5 w-3.5 text-sky-600" /> Direction / Title</Label>
              <Input value={diTitle} onChange={e => setDiTitle(e.target.value)}
                placeholder="Study the following bar graph carefully and answer the questions." />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Shared Content — Left Panel</Label>
                <p className="text-[10px] text-muted-foreground">Paste HTML with SVG chart, &lt;table&gt;, or &lt;img&gt;. Students see this alongside all sub-questions.</p>
                <Textarea value={diContent} onChange={e => setDiContent(e.target.value)}
                  placeholder={`<p><strong>Sales Data 2024</strong></p>\n<svg viewBox="0 0 400 200">...</svg>\n<!-- OR -->\n<table>...</table>`}
                  rows={9} className="text-xs font-mono resize-none" />
                <div className="flex gap-2 items-center">
                  <Image className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                    placeholder="Or paste chart image URL" className="h-7 text-xs" />
                </div>
                {imageUrl && <img src={imageUrl} alt="chart preview" className="mt-1 max-h-40 rounded border" />}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Sub-Questions — Right Panel</Label>
                  <Button type="button" variant="outline" size="sm" className="h-7 text-xs"
                    onClick={() => setSubQs(p => [...p, defaultSubQuestion()])}>
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {subQs.map((sq, i) => (
                    <SubQuestionEditor key={sq.id} sub={sq} index={i}
                      onChange={u => updateSub(i, u)}
                      onDelete={() => setSubQs(p => p.filter((_, idx) => idx !== i))} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Caselet */}
        {type === 'caselet' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Direction / Title</Label>
              <Input value={diTitle} onChange={e => setDiTitle(e.target.value)}
                placeholder="Read the following caselet carefully and answer the questions." />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-emerald-600" /> Caselet Paragraph — Left Panel</Label>
                <Textarea value={passage} onChange={e => setPassage(e.target.value)}
                  placeholder="A company manufactures 3 products X, Y and Z. In 2023, the total production was 12,000 units..."
                  rows={10} className="text-sm resize-none" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Sub-Questions — Right Panel</Label>
                  <Button type="button" variant="outline" size="sm" className="h-7 text-xs"
                    onClick={() => setSubQs(p => [...p, defaultSubQuestion()])}>
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {subQs.map((sq, i) => (
                    <SubQuestionEditor key={sq.id} sub={sq} index={i}
                      onChange={u => updateSub(i, u)}
                      onDelete={() => setSubQs(p => p.filter((_, idx) => idx !== i))} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Input-Output */}
        {type === 'input_output' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Direction / Title</Label>
              <Input value={diTitle} onChange={e => setDiTitle(e.target.value)}
                placeholder="A word arrangement machine follows a specific rule to rearrange words..." />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5"><ArrowRightLeft className="h-3.5 w-3.5 text-rose-600" /> Rules / Steps — Left Panel</Label>
                  <Textarea value={ioRules} onChange={e => setIoRules(e.target.value)}
                    placeholder={`Step 1: Numbers arranged from smallest to largest.\nStep 2: Words arranged in reverse alphabetical order.\n...`}
                    rows={6} className="text-sm resize-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Worked Example (optional)</Label>
                  <Textarea value={ioExample} onChange={e => setIoExample(e.target.value)}
                    placeholder={`Input: 25 ball 16 mango 49 apple\nStep 1: apple 16 ball mango 25 49\nOutput: apple ball mango 16 25 49`}
                    rows={4} className="text-xs resize-none" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Sub-Questions — Right Panel</Label>
                  <Button type="button" variant="outline" size="sm" className="h-7 text-xs"
                    onClick={() => setSubQs(p => [...p, defaultSubQuestion()])}>
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {subQs.map((sq, i) => (
                    <SubQuestionEditor key={sq.id} sub={sq} index={i}
                      onChange={u => updateSub(i, u)}
                      onDelete={() => setSubQs(p => p.filter((_, idx) => idx !== i))} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RC Comprehension */}
        {type === 'comprehension' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5"><AlignLeft className="h-3.5 w-3.5" /> Passage — Left Panel</Label>
              <Textarea value={passage} onChange={e => setPassage(e.target.value)}
                placeholder="Enter the reading comprehension passage here..."
                rows={12} className="text-sm resize-none" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Sub-Questions — Right Panel</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs"
                  onClick={() => setSubQs(p => [...p, defaultSubQuestion()])}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {subQs.map((sq, i) => (
                  <SubQuestionEditor key={sq.id} sub={sq} index={i}
                    onChange={u => updateSub(i, u)}
                    onDelete={() => setSubQs(p => p.filter((_, idx) => idx !== i))} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Puzzle */}
        {type === 'puzzle' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5"><Puzzle className="h-3.5 w-3.5" /> Setup / Description — Left Panel</Label>
              <Textarea value={setup} onChange={e => setSetup(e.target.value)}
                placeholder="e.g. Six persons A, B, C, D, E and F are sitting in a row facing North..."
                rows={4} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Clues / Conditions</Label>
              <Textarea value={clues} onChange={e => setClues(e.target.value)}
                placeholder={"I. A sits to the immediate right of B.\nII. C sits at one of the extreme ends..."}
                rows={4} className="text-sm" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Sub-Questions</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs"
                  onClick={() => setSubQs(p => [...p, defaultSubQuestion()])}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              {subQs.map((sq, i) => (
                <SubQuestionEditor key={sq.id} sub={sq} index={i}
                  onChange={u => updateSub(i, u)}
                  onDelete={() => setSubQs(p => p.filter((_, idx) => idx !== i))} />
              ))}
            </div>
          </div>
        )}

        {/* Simple types */}
        {isSimple && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {type === 'fillblank' ? 'Sentence (use ___ for blank)' : 'Question Text'}
              </Label>
              <Textarea value={text} onChange={e => setText(e.target.value)}
                placeholder={type === 'fillblank' ? 'He ___ to school every day.' : 'Enter question text...'}
                rows={3} />
            </div>
            {(type === 'mcq' || type === 'msq') && (
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1"><Image className="h-3 w-3" /> Question Image URL (optional)</Label>
                <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..." className="h-8 text-xs" />
                {imageUrl && <img src={imageUrl} alt="preview" className="mt-1 max-h-32 rounded border" />}
              </div>
            )}
            {type === 'truefalse' ? (
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Correct Answer</Label>
                <div className="flex gap-3">
                  {(['true', 'false'] as const).map(v => (
                    <button key={v} type="button" onClick={() => setTfCorrect(v)}
                      className={cn('flex-1 py-2 rounded-lg border-2 font-semibold text-sm capitalize transition-colors',
                        tfCorrect === v
                          ? v === 'true' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 text-gray-500'
                      )}>{v}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Options
                  <span className="ml-2 text-[10px] text-muted-foreground font-normal">
                    {type === 'msq' ? '(check all correct answers)' : '(click circle to mark correct answer)'}
                  </span>
                </Label>
                <OptionEditor
                  options={options}
                  correct={type === 'multi' || type === 'msq' ? correctOptions : correctOption}
                  multi={type === 'multi' || type === 'msq'}
                  onChange={setOptions}
                  onCorrectChange={c => {
                    if (type === 'multi' || type === 'msq') setCorrectOptions(c as string[]);
                    else setCorrectOption(c as string);
                  }} />
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs">Explanation (optional)</Label>
              <Input value={explanation} onChange={e => setExplanation(e.target.value)}
                placeholder="Brief explanation of the correct answer" className="h-8" />
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="button" onClick={save}>
          <Plus className="h-4 w-4 mr-1" /> Add to Question Bank
        </Button>
      </div>
    </div>
  );
};

// ─── QuestionRow ───────────────────────────────────────────────────────────────
const QuestionRow: React.FC<{ q: Question; index: number; onDelete: () => void }> = ({ q, index, onDelete }) => {
  const meta = QUESTION_TYPE_META[q.type];
  const preview = () => {
    if (q.type === 'comprehension') return `[RC Passage] + ${q.subQuestions.length} sub-question(s)`;
    if (q.type === 'puzzle') return `[Puzzle/SA] + ${q.subQuestions.length} sub-question(s)`;
    if (q.type === 'di') return `[DI: ${q.title?.slice(0, 45) || 'Chart'}] + ${q.subQuestions.length} sub-question(s)`;
    if (q.type === 'caselet') return `[Caselet: ${q.title?.slice(0, 45) || 'Paragraph'}] + ${q.subQuestions.length} sub-question(s)`;
    if (q.type === 'input_output') return `[I/O: ${q.title?.slice(0, 45) || 'Rules'}] + ${q.subQuestions.length} sub-question(s)`;
    if (q.type === 'truefalse') return q.text;
    if (q.type === 'numerical') return `${q.text} → Ans: ${q.correctAnswer}`;
    return (q as MCQQuestion).text;
  };
  return (
    <div className="border rounded-lg bg-white hover:shadow-sm transition-shadow px-4 py-3 flex items-start gap-3">
      <span className="text-xs font-bold text-gray-400 mt-0.5 w-6 shrink-0">Q{index + 1}</span>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Badge variant="outline" className={cn('text-[10px] px-1.5', meta.color)}>
            {meta.icon}<span className="ml-1">{meta.label}</span>
          </Badge>
          <span className="text-[10px] text-muted-foreground">{q.marks}m | -{q.negativeMark} neg</span>
        </div>
        <p className="text-sm text-gray-700 line-clamp-2">{preview()}</p>
      </div>
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive shrink-0" onClick={onDelete}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

// ─── CSV Template & Download ───────────────────────────────────────────────────
const CSV_TEMPLATE = `type,question,optionA,optionB,optionC,optionD,optionE,correct,marks,negative_mark,explanation
mcq,What is 2+2?,3,4,5,6,,b,1,0.25,Because 2+2=4
msq,"Which are even numbers?",2,4,5,6,8,"a,b,d,e",1,0,2 4 6 8 are even
numerical,"Square root of 144?",,,,,, 12,1,0,sqrt(144)=12
fillblank,"He ___ to school every day.",goes,going,gone,go,,a,1,0.25,
truefalse,The Earth is flat.,,,,,, false,1,0.25,Earth is a sphere
# DI, Caselet, Input-Output, RC, Puzzle — use the Create tab (complex content not CSV-compatible)`;

const downloadTemplate = () => {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'question_upload_template.csv'; a.click();
  URL.revokeObjectURL(url);
};

const parseCSV = (text: string): Question[] => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  if (lines.length < 2) return [];
  const results: Question[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
    const [type, question, a, b, c, d, e, correct, marks, neg, explanation] = cols;
    const m = parseFloat(marks) || 1;
    const n = parseFloat(neg) || 0;
    const opts: Option[] = [{ id: 'a', text: a || '' }, { id: 'b', text: b || '' }, { id: 'c', text: c || '' }, { id: 'd', text: d || '' }];
    if (e) opts.push({ id: 'e', text: e });
    if (type === 'mcq' || type === 'fillblank')
      results.push({ id: newId(), type: type as 'mcq' | 'fillblank', text: question, options: opts, correctOption: correct || 'a', explanation, marks: m, negativeMark: n } as MCQQuestion | FillBlankQuestion);
    else if (type === 'msq')
      results.push({ id: newId(), type: 'mcq', text: question, options: opts, correctOption: correct || 'a', explanation, marks: m, negativeMark: n } as MCQQuestion);
    else if (type === 'numerical')
      results.push({ id: newId(), type: 'numerical', text: question, correctAnswer: isNaN(Number(correct)) ? correct : Number(correct), explanation, marks: m, negativeMark: n } as NumericalQuestion);
    else if (type === 'truefalse')
      results.push({ id: newId(), type: 'truefalse', text: question, correct: ((correct || 'true').trim() as 'true' | 'false'), explanation, marks: m, negativeMark: n } as TrueFalseQuestion);
  }
  return results;
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const UploadQuestions = () => {
  const { toast } = useToast();
  // Employee uses a generic shared bank ID; in production this would be the assigned test ID
  const BANK_ID = 'employee_bank';
  const { questions, addQuestion, deleteQuestion } = useQuestionBank(BANK_ID);
  const [tab, setTab] = useState<'create' | 'bulk' | 'bank'>('create');
  const [showBuilder, setShowBuilder] = useState(false);

  const handleSave = (q: Question) => {
    addQuestion(q);
    toast({ title: 'Question added', description: `Q${questions.length + 1} saved to bank` });
    setShowBuilder(false);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target?.result as string);
      if (!parsed.length) {
        toast({ title: 'No questions found', description: 'Check your file matches the template format', variant: 'destructive' });
      } else {
        parsed.forEach(q => addQuestion(q));
        toast({ title: `${parsed.length} questions imported`, description: 'Added to your question bank' });
        setTab('bank');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="w-full px-4 lg:px-6 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Upload Questions</h1>
        <p className="text-sm text-muted-foreground mt-1">Create and manage questions for your assigned tests. Supports all 11 IBPS exam question types.</p>
      </div>

      {/* Type legend chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.entries(QUESTION_TYPE_META) as [QuestionType, typeof QUESTION_TYPE_META[QuestionType]][]).map(([key, meta]) => (
          <div key={key} className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium', meta.color)}>
            {meta.icon}
            {meta.label}
            {meta.panel === 'dual' && <span className="text-[8px] font-semibold text-sky-600 bg-sky-50 border border-sky-200 rounded px-1">DP</span>}
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={v => { setTab(v as typeof tab); setShowBuilder(false); }}>
        <TabsList className="mb-6">
          <TabsTrigger value="create"><Plus className="h-3.5 w-3.5 mr-1.5" /> Create Question</TabsTrigger>
          <TabsTrigger value="bulk"><Upload className="h-3.5 w-3.5 mr-1.5" /> Bulk Upload (CSV)</TabsTrigger>
          <TabsTrigger value="bank"><BookOpen className="h-3.5 w-3.5 mr-1.5" /> Question Bank ({questions.length})</TabsTrigger>
        </TabsList>

        {/* ── Create ── */}
        <TabsContent value="create">
          <Card className="p-5 sm:p-7">
            {!showBuilder ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Create a New Question</h3>
                  <p className="text-sm text-muted-foreground mt-1">Choose from 11 question types including DI, RC, Puzzle (DualPanel) and standard MCQ/Numerical.</p>
                </div>
                <Button size="lg" onClick={() => setShowBuilder(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Start Building
                </Button>
              </div>
            ) : (
              <QuestionBuilder
                onSave={handleSave}
                onCancel={() => setShowBuilder(false)}
              />
            )}
          </Card>
        </TabsContent>

        {/* ── Bulk Upload ── */}
        <TabsContent value="bulk">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Template card */}
            <Card className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100"><Download className="h-5 w-5 text-blue-600" /></div>
                <div>
                  <h3 className="font-semibold text-sm">Download CSV Template</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Pre-formatted template matching all supported types</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1.5">
                <p className="text-[10px] font-semibold text-gray-500 mb-2">CSV-compatible types:</p>
                {(['mcq', 'msq', 'numerical', 'fillblank', 'truefalse'] as QuestionType[]).map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <Badge variant="outline" className={cn('text-[9px] px-1', QUESTION_TYPE_META[key].color)}>{key}</Badge>
                    <span className="text-muted-foreground">{QUESTION_TYPE_META[key].description}</span>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t flex items-start gap-1.5 text-amber-700">
                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>RC, DI, Puzzle, Caselet, I/O must be created via the Create tab (image/SVG content not CSV-compatible)</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" /> Download Template
              </Button>
            </Card>

            {/* Upload card */}
            <Card className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-100"><Upload className="h-5 w-5 text-green-600" /></div>
                <div>
                  <h3 className="font-semibold text-sm">Upload CSV File</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Upload filled template to bulk import questions</p>
                </div>
              </div>
              <label className="block border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                <input type="file" accept=".csv,.txt" className="hidden" onChange={handleCSVUpload} />
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Click to select file</p>
                <p className="text-xs text-muted-foreground mt-1">.csv or .txt</p>
              </label>
            </Card>
          </div>
        </TabsContent>

        {/* ── Bank ── */}
        <TabsContent value="bank">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">{questions.length} question{questions.length !== 1 ? 's' : ''} in your bank</p>
              <Button size="sm" onClick={() => { setTab('create'); setShowBuilder(true); }}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
              </Button>
            </div>
            {questions.length === 0 ? (
              <Card className="p-10 text-center">
                <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No questions yet</p>
                <p className="text-sm text-muted-foreground mt-1">Create questions or upload a CSV to get started.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <QuestionRow key={q.id} q={q} index={i} onDelete={() => deleteQuestion(q.id)} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UploadQuestions;
