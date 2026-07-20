import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Plus, ChevronRight, Pencil, Trash2, BookOpen, FileQuestion, Check,
  Upload, Download, X, Search, Eye, EyeOff, ChevronLeft, Layers,
  Zap, Brain, MoreVertical, CheckCircle, AlertCircle, ArrowUp, ArrowDown,
  FileSpreadsheet, Table2, RefreshCw, Star, Globe, Clock, Target,
  Sparkles, Volume2, Tag, LayoutGrid, List, GripVertical, BookMarked,
  FolderOpen, AlertTriangle, Save, PlusCircle, TrendingUp, CheckSquare,
  Square, RotateCcw, ArrowRight, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  useVocabulary, VocabCategory, VocabLesson, VocabWord,
  QuizQuestion, DifficultyLevel, ExamCategory, ContentStatus, SituationCategory
} from '@/hooks/useVocabulary';

// ─── Types & Constants ────────────────────────────────────────────────────────
type AdminView =
  | { type: 'categories' }
  | { type: 'category'; id: string }
  | { type: 'lesson'; categoryId: string; lessonId: string };

const DIFF_COLOR: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
};

const GRADIENT_PRESETS = [
  { label: 'Blue-Indigo', value: 'from-blue-500 to-indigo-600', preview: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
  { label: 'Green-Teal', value: 'from-emerald-500 to-teal-600', preview: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
  { label: 'Purple', value: 'from-violet-500 to-purple-600', preview: 'bg-gradient-to-br from-violet-500 to-purple-600' },
  { label: 'Rose-Pink', value: 'from-rose-500 to-pink-600', preview: 'bg-gradient-to-br from-rose-500 to-pink-600' },
  { label: 'Amber-Orange', value: 'from-amber-500 to-orange-500', preview: 'bg-gradient-to-br from-amber-500 to-orange-500' },
  { label: 'Cyan-Blue', value: 'from-cyan-500 to-blue-600', preview: 'bg-gradient-to-br from-cyan-500 to-blue-600' },
  { label: 'Slate', value: 'from-slate-600 to-slate-800', preview: 'bg-gradient-to-br from-slate-600 to-slate-800' },
  { label: 'Fuchsia', value: 'from-fuchsia-500 to-purple-600', preview: 'bg-gradient-to-br from-fuchsia-500 to-purple-600' },
];

const EXAM_TAGS: ExamCategory[] = ['banking', 'ssc', 'railway', 'upsc', 'state-psc', 'defence', 'general'];
const POS_OPTIONS = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Phrase', 'Idiom', 'Conjunction', 'Preposition'];

const EXCEL_SAMPLE = [
  ['word', 'pronunciation', 'partOfSpeech', 'meaning', 'example', 'example2', 'synonyms', 'antonyms', 'memoryTrick', 'wordFamily', 'wordTreeRoot', 'wordTree', 'difficulty', 'imageUrl'],
  ['Perspicacious', 'pɜːspɪˈkeɪʃəs', 'Adjective', 'Having a ready insight into things; shrewd', 'Her perspicacious analysis impressed the board.', 'A perspicacious judge can read between the lines.', 'shrewd,astute,insightful', 'obtuse,dull,stupid', 'PER-SPICA-CIOUS = can SPICE up any conversation with sharp insight!', 'Perspicacity:Noun|Perspicaciously:Adverb', 'spicere (Latin: to look)', '', 'hard', ''],
  ['Verbose', 'vɜːrbˈoʊs', 'Adjective', 'Using or expressed in more words than needed', 'His verbose speech bored the audience.', '', 'wordy,garrulous,prolix', 'concise,brief,terse', 'VERB + OSE = too many verbs = too many words', 'Verbosity:Noun|Verbosely:Adverb', 'verbum (Latin: word)', '', 'easy', ''],
];

// ─── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSV(text: string): string[][] {
  return text.trim().split('\n').map(line =>
    line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
  );
}

function csvToWords(rows: string[][], headers: string[], lessonId: string, categoryExam: ExamCategory): Omit<VocabWord, 'id' | 'createdAt'>[] {
  const idx = (field: string) => headers.findIndex(h => h.toLowerCase().includes(field.toLowerCase()));
  const iWord = idx('word'); const iMeaning = idx('meaning'); const iExample = idx('example');
  return rows.map(row => {
    // Parse wordFamily: "Perspicacity:Noun|Perspicaciously:Adverb"
    const wfRaw = row[idx('wordFamily')] || '';
    const wordFamily = wfRaw
      ? wfRaw.split('|').map(s => { const [word, pos] = s.split(':'); return { word: word?.trim() || '', pos: pos?.trim() || 'Noun' }; }).filter(x => x.word)
      : [];
    return {
      word: row[iWord] || '',
      pronunciation: row[idx('pronunciation')] || '',
      partOfSpeech: row[idx('partOfSpeech') >= 0 ? idx('partOfSpeech') : idx('pos')] || 'Noun',
      meaning: row[iMeaning] || '',
      example: row[iExample] || '',
      example2: row[idx('example2')] || '',
      synonyms: (row[idx('synonyms')] || '').split(',').map(s => s.trim()).filter(Boolean),
      antonyms: (row[idx('antonyms')] || '').split(',').map(s => s.trim()).filter(Boolean),
      memoryTrick: row[idx('memoryTrick')] || '',
      wordFamily,
      wordTreeRoot: row[idx('wordTreeRoot')] || row[idx('root')] || '',
      wordTree: row[idx('wordTree')] || '',
      imageUrl: row[idx('imageUrl')] || '',
      audioUrl: '',
      difficulty: (row[idx('difficulty')] as DifficultyLevel) || 'medium',
      situation: 'exam' as SituationCategory,
      examCategory: categoryExam,
      isActive: true,
      uploadedBy: 'superadmin_1',
      uploadedByRole: 'super-admin' as const,
      contentStatus: 'approved' as ContentStatus,
    };
  }).filter(w => w.word && w.meaning);
}

// ─── Image Upload Panel ─────────────────────────────────────────────────────────────────────
const ImageUploadPanel: React.FC<{
  words: VocabWord[];
  onUpdateImage: (wordId: string, url: string) => void;
  onClose: () => void;
}> = ({ words, onUpdateImage, onClose }) => {
  const missingImages = words.filter(w => !w.imageUrl);
  const [urls, setUrls] = React.useState<Record<string, string>>({});
  const [saved, setSaved] = React.useState<Record<string, boolean>>({});
  const fileRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  const handleFile = (wordId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      setUrls(p => ({ ...p, [wordId]: url }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (wordId: string) => {
    const url = urls[wordId];
    if (!url) return;
    onUpdateImage(wordId, url);
    setSaved(p => ({ ...p, [wordId]: true }));
  };

  if (missingImages.length === 0) {
    return (
      <div className="fixed inset-0 z-[400] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="font-black text-slate-800 text-lg">All words have images!</h3>
          <p className="text-slate-500 text-sm mt-1">Every word already has an image URL.</p>
          <Button onClick={onClose} className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700">Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
              <span>🖼️</span> Upload Word Images
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{missingImages.length} words are missing images — add them now</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {missingImages.map(word => (
            <div key={word.id} className={`border rounded-xl p-4 transition-all ${saved[word.id] ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <div className="flex items-start gap-4">
                {/* Word info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-800">{word.word}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{word.partOfSpeech}</span>
                    {saved[word.id] && <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><CheckCircle className="h-3 w-3" /> Saved</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{word.meaning}</p>

                  {/* URL input */}
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={urls[word.id] || ''}
                      onChange={e => setUrls(p => ({ ...p, [word.id]: e.target.value }))}
                      placeholder="Paste image URL or upload file..."
                      className="h-8 text-xs flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs gap-1 border-slate-300 shrink-0"
                      onClick={() => fileRefs.current[word.id]?.click()}
                    >
                      <Upload className="h-3 w-3" /> File
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 shrink-0"
                      onClick={() => handleSave(word.id)}
                      disabled={!urls[word.id] || saved[word.id]}
                    >
                      Save
                    </Button>
                    <input
                      ref={el => { fileRefs.current[word.id] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => { if (e.target.files?.[0]) handleFile(word.id, e.target.files[0]); }}
                    />
                  </div>
                </div>

                {/* Image preview */}
                <div className="h-20 w-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                  {urls[word.id] ? (
                    <img src={urls[word.id]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl text-slate-300">🖼️</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t px-6 py-3 flex items-center justify-between shrink-0 bg-white">
          <p className="text-xs text-slate-500">
            {Object.values(saved).filter(Boolean).length} of {missingImages.length} images added
          </p>
          <Button onClick={onClose} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <CheckCircle className="h-4 w-4" /> Done
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Tag Input ────────────────────────────────────────────────────────────────
const TagInput: React.FC<{
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  colorClass?: string;
}> = ({ tags, onChange, placeholder = 'Add tag...', colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-200' }) => {
  const [val, setVal] = useState('');
  const add = () => {
    const t = val.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setVal('');
  };
  return (
    <div className="flex flex-wrap gap-1.5 items-center min-h-[36px] px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-200 transition-all">
      {tags.map(t => (
        <span key={t} className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
          {t}
          <button onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-red-500 transition-colors">
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[80px] text-xs outline-none bg-transparent"
      />
    </div>
  );
};

// ─── Word Form (Right Panel) ──────────────────────────────────────────────────
const WordFormPanel: React.FC<{
  lessonId: string;
  categoryExam: ExamCategory;
  lessonDifficulty: DifficultyLevel;
  editingWord: VocabWord | null;
  onSave: (word: Omit<VocabWord, 'id' | 'createdAt'>, autoGenQuiz: boolean, quizTypes: string[]) => void;
  onCancel: () => void;
}> = ({ lessonId, categoryExam, lessonDifficulty, editingWord, onSave, onCancel }) => {
  const blank: Omit<VocabWord, 'id' | 'createdAt'> = {
    word: '', pronunciation: '', partOfSpeech: 'Adjective', meaning: '',
    example: '', example2: '', synonyms: [], antonyms: [],
    memoryTrick: '', wordFamily: [], imageUrl: '', audioUrl: '',
    difficulty: lessonDifficulty, situation: 'exam', examCategory: categoryExam,
    isActive: true, uploadedBy: 'superadmin_1', uploadedByRole: 'super-admin',
    contentStatus: 'approved',
  };

  const [form, setForm] = useState<Omit<VocabWord, 'id' | 'createdAt'>>(
    editingWord
      ? {
          word: editingWord.word, pronunciation: editingWord.pronunciation || '',
          partOfSpeech: editingWord.partOfSpeech || 'Adjective', meaning: editingWord.meaning,
          example: editingWord.example, example2: editingWord.example2 || '',
          synonyms: editingWord.synonyms || [], antonyms: editingWord.antonyms || [],
          memoryTrick: editingWord.memoryTrick || '', wordFamily: editingWord.wordFamily || [],
          imageUrl: editingWord.imageUrl || '', audioUrl: editingWord.audioUrl || '',
          difficulty: editingWord.difficulty, situation: editingWord.situation,
          examCategory: editingWord.examCategory, isActive: true,
          uploadedBy: 'superadmin_1', uploadedByRole: 'super-admin',
          contentStatus: editingWord.contentStatus,
        }
      : blank
  );

  const [autoGenQuiz, setAutoGenQuiz] = useState(!editingWord);
  const [quizTypes, setQuizTypes] = useState(['mcq', 'synonym', 'antonym', 'fill_blank']);
  const [wfInput, setWfInput] = useState({ word: '', pos: 'Noun' });

  const toggleQuizType = (t: string) =>
    setQuizTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const f = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const canSave = form.word.trim() && form.meaning.trim() && form.example.trim();

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-slate-50 shrink-0">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">{editingWord ? 'Edit Word' : 'Add New Word'}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Fill details below. Quiz auto-generated on save.</p>
        </div>
        <button onClick={onCancel} className="h-7 w-7 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* Word + Pronunciation + POS — one row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1 space-y-1">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Word *</Label>
            <Input value={form.word} onChange={e => f('word', e.target.value)}
              placeholder="e.g. Resilient" className="font-bold text-base h-9" />
          </div>
          <div className="col-span-1 space-y-1">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pronunciation</Label>
            <Input value={form.pronunciation} onChange={e => f('pronunciation', e.target.value)}
              placeholder="/rɪˈzɪliənt/" className="font-mono text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Part of Speech</Label>
            <Select value={form.partOfSpeech} onValueChange={v => f('partOfSpeech', v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{POS_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        {/* Meaning */}
        <div className="space-y-1">
          <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Meaning *</Label>
          <Textarea value={form.meaning} onChange={e => f('meaning', e.target.value)}
            placeholder="Core definition students will learn..." rows={2}
            className="text-sm resize-none" />
        </div>

        {/* Examples */}
        <div className="space-y-2">
          <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Examples *</Label>
          <Input value={form.example} onChange={e => f('example', e.target.value)}
            placeholder="Example 1 (required) — use the word in context" className="text-sm h-9" />
          <Input value={form.example2} onChange={e => f('example2', e.target.value)}
            placeholder="Example 2 (optional)" className="text-sm h-9" />
        </div>

        {/* Synonyms + Antonyms */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">Synonyms</Label>
            <TagInput tags={form.synonyms || []} onChange={v => f('synonyms', v)}
              placeholder="Type + Enter..." colorClass="bg-emerald-50 text-emerald-700 border-emerald-200" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-red-500 uppercase tracking-wide">Antonyms</Label>
            <TagInput tags={form.antonyms || []} onChange={v => f('antonyms', v)}
              placeholder="Type + Enter..." colorClass="bg-red-50 text-red-600 border-red-200" />
          </div>
        </div>

        {/* Memory Trick */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-amber-600 uppercase tracking-wide flex items-center gap-1">
            <Zap className="h-3 w-3" /> Memory Trick
          </Label>
          <Textarea value={form.memoryTrick} onChange={e => f('memoryTrick', e.target.value)}
            placeholder="A fun mnemonic to remember this word..." rows={2}
            className="text-sm resize-none" />
        </div>

        {/* Word Family */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-violet-600 uppercase tracking-wide flex items-center gap-1">
            <Layers className="h-3 w-3" /> Word Family
          </Label>
          <div className="flex gap-2">
            <Input value={wfInput.word} onChange={e => setWfInput(p => ({ ...p, word: e.target.value }))}
              placeholder="Word form" className="text-sm h-8 flex-1" />
            <Select value={wfInput.pos} onValueChange={v => setWfInput(p => ({ ...p, pos: v }))}>
              <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
              <SelectContent>{POS_OPTIONS.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}</SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="h-8 px-2"
              onClick={() => {
                if (wfInput.word) {
                  f('wordFamily', [...(form.wordFamily || []), { word: wfInput.word, pos: wfInput.pos }]);
                  setWfInput({ word: '', pos: 'Noun' });
                }
              }}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(form.wordFamily || []).map((wf, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-medium">
                {wf.word} <span className="text-violet-400">({wf.pos})</span>
                <button onClick={() => f('wordFamily', (form.wordFamily || []).filter((_, j) => j !== i))}>
                  <X className="h-2.5 w-2.5 text-violet-400 hover:text-red-500" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Image URL */}
        <div className="space-y-1.5">
          <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Image URL</Label>
          <Input value={form.imageUrl} onChange={e => f('imageUrl', e.target.value)}
            placeholder="https://images.unsplash.com/..." className="text-sm h-9" />
          {form.imageUrl && (
            <img src={form.imageUrl} alt="" className="h-24 w-full object-cover rounded-lg mt-1" />
          )}
        </div>

        {/* Difficulty + Exam */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Difficulty</Label>
            <Select value={form.difficulty} onValueChange={v => f('difficulty', v as DifficultyLevel)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Exam Focus</Label>
            <Select value={form.examCategory} onValueChange={v => f('examCategory', v as ExamCategory)}>
              <SelectTrigger className="h-9 text-sm capitalize"><SelectValue /></SelectTrigger>
              <SelectContent>{EXAM_TAGS.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Auto-generate Quiz ────────────────────────────────── */}
        <div className="border-2 border-dashed border-indigo-200 rounded-xl p-4 bg-indigo-50/50 space-y-3">
          <button
            onClick={() => setAutoGenQuiz(!autoGenQuiz)}
            className="flex items-center gap-2.5 w-full"
          >
            <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${autoGenQuiz ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
              {autoGenQuiz && <Check className="h-3 w-3 text-white" />}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-indigo-600" />
                Auto-Generate Quiz Questions
              </p>
              <p className="text-[11px] text-slate-500">Creates quiz questions automatically from this word</p>
            </div>
          </button>

          {autoGenQuiz && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { key: 'mcq', label: 'Meaning MCQ', icon: '🧠' },
                { key: 'synonym', label: 'Synonym', icon: '✅' },
                { key: 'antonym', label: 'Antonym', icon: '🔄' },
                { key: 'fill_blank', label: 'Fill Blank', icon: '✏️' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => toggleQuizType(t.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all
                    ${quizTypes.includes(t.key) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-5 py-3 flex gap-2 shrink-0 bg-white">
        <Button variant="outline" onClick={onCancel} className="flex-1 h-10 text-sm">Cancel</Button>
        <Button
          disabled={!canSave}
          onClick={() => onSave(form, autoGenQuiz, quizTypes)}
          className="flex-1 h-10 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 gap-2"
        >
          <Save className="h-4 w-4" />
          {editingWord ? 'Update' : 'Save'} Word{autoGenQuiz && ' + Quiz'}
        </Button>
      </div>
    </div>
  );
};

// ─── Excel Import Modal ────────────────────────────────────────────────────────
const ExcelImportModal: React.FC<{
  lessonId: string;
  categoryExam: ExamCategory;
  onImport: (words: Omit<VocabWord, 'id' | 'createdAt'>[], autoQuiz: boolean) => VocabWord[];
  onUpdateImage: (wordId: string, url: string) => void;
  onClose: () => void;
}> = ({ lessonId, categoryExam, onImport, onUpdateImage, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsed, setParsed] = useState<ReturnType<typeof csvToWords>>([]);
  const [importedWords, setImportedWords] = useState<VocabWord[]>([]);
  const [autoQuiz, setAutoQuiz] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length > 1) {
        const hdrs = rows[0];
        const data = rows.slice(1).filter(r => r.some(c => c.trim()));
        setHeaders(hdrs);
        setRawRows(data);
        setParsed(csvToWords(data, hdrs, lessonId, categoryExam));
        setStep(2);
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csv = EXCEL_SAMPLE.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'vocabulary_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const validWords = parsed.filter(w => w.word && w.meaning);
  const invalidCount = parsed.length - validWords.length;

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" /> Import from Excel / CSV
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Upload a CSV file to bulk-add words to this lesson</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 px-6 pt-4 pb-2">
          {[1, 2, 3, 4].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= s ? 'text-indigo-600' : 'text-slate-400'}`}>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${step > s ? 'bg-emerald-500 text-white' : step === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {step > s ? <Check className="h-3 w-3" /> : s}
                </div>
                {['Upload', 'Preview', 'Import', 'Images'][i]}
              </div>
              {i < 3 && <div className={`flex-1 h-0.5 mx-2 rounded ${step > s ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Template download */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-indigo-800">Download Sample Template</p>
                  <p className="text-xs text-indigo-600 mt-0.5">Use our pre-formatted template with all column headers</p>
                </div>
                <Button onClick={downloadTemplate} variant="outline" size="sm" className="gap-1.5 border-indigo-300 text-indigo-700 hover:bg-indigo-100">
                  <Download className="h-3.5 w-3.5" /> Template
                </Button>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                  ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
              >
                <FileSpreadsheet className={`h-12 w-12 mx-auto mb-3 ${dragOver ? 'text-indigo-500' : 'text-slate-300'}`} />
                <p className="text-sm font-bold text-slate-600">Drag & drop your CSV file here</p>
                <p className="text-xs text-slate-400 mt-1">or click to browse — supports .csv and .txt</p>
                <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
              </div>

              {/* Column format guide */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-600 mb-2">Required Column Headers:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['word *', 'meaning *', 'example *', 'pronunciation', 'partOfSpeech', 'synonyms', 'antonyms', 'memoryTrick', 'difficulty', 'imageUrl'].map(c => (
                    <code key={c} className={`text-[10px] px-2 py-0.5 rounded font-mono ${c.includes('*') ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'}`}>{c}</code>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">* Required. Synonyms/antonyms: comma-separated values.</p>
              </div>
            </div>
          )}

          {/* Step 2: Preview & Map */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{parsed.length} rows detected</p>
                  <p className="text-xs text-slate-500">{validWords.length} valid · {invalidCount > 0 && <span className="text-red-500">{invalidCount} missing required fields</span>}</p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                  <ChevronLeft className="h-3 w-3" /> Re-upload
                </button>
              </div>

              {/* Detected headers */}
              <div className="flex flex-wrap gap-1.5">
                {headers.map(h => (
                  <span key={h} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{h}</span>
                ))}
              </div>

              {/* Preview table */}
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="px-3 py-2 text-left font-bold text-slate-500">#</th>
                      <th className="px-3 py-2 text-left font-bold text-slate-500">Word</th>
                      <th className="px-3 py-2 text-left font-bold text-slate-500">Meaning</th>
                      <th className="px-3 py-2 text-left font-bold text-slate-500">Difficulty</th>
                      <th className="px-3 py-2 text-left font-bold text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((w, i) => (
                      <tr key={i} className={`border-b ${!w.word || !w.meaning ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                        <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2 font-bold text-slate-800">{w.word || <span className="text-red-500">missing</span>}</td>
                        <td className="px-3 py-2 text-slate-600 max-w-[200px] truncate">{w.meaning || <span className="text-red-500">missing</span>}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${DIFF_COLOR[w.difficulty] || DIFF_COLOR.medium}`}>{w.difficulty}</span>
                        </td>
                        <td className="px-3 py-2">
                          {w.word && w.meaning
                            ? <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Valid</span>
                            : <span className="text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Error</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button onClick={() => setStep(3)} disabled={validWords.length === 0} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
                Continue with {validWords.length} words <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 3: Import options */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-lg font-black text-emerald-800">{validWords.length} Words Ready to Import</p>
                <p className="text-sm text-emerald-600 mt-1">All words will be added to this lesson as approved content</p>
              </div>

              {/* Auto quiz toggle */}
              <div className="border-2 border-dashed border-indigo-200 rounded-xl p-5 bg-indigo-50/50">
                <button onClick={() => setAutoQuiz(!autoQuiz)} className="flex items-start gap-3 w-full text-left">
                  <div className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${autoQuiz ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                    {autoQuiz && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                      <Brain className="h-4 w-4 text-indigo-600" />
                      Auto-generate quiz questions for each word
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Creates up to 4 quiz questions per word (MCQ, Synonym, Antonym, Fill-blank) = up to {validWords.length * 4} questions total
                    </p>
                  </div>
                </button>
              </div>

              <Button
                onClick={() => {
                  const added = onImport(validWords, autoQuiz);
                  setImportedWords(added);
                  const missingImages = added.filter(w => !w.imageUrl);
                  if (missingImages.length > 0) {
                    setStep(4);
                  } else {
                    onClose();
                  }
                }}
                className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 gap-2"
              >
                <Upload className="h-5 w-5" />
                Import {validWords.length} Words{autoQuiz ? ' + Generate Quiz' : ''}
              </Button>
            </div>
          )}

          {/* Step 4: Images */}
          {step === 4 && (
            <ImageUploadPanel words={importedWords} onUpdateImage={onUpdateImage} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Quiz Question Card ────────────────────────────────────────────────────────
const QuizQuestionCard: React.FC<{
  q: QuizQuestion;
  word?: VocabWord;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}> = ({ q, word, onEdit, onDelete, onMoveUp, onMoveDown }) => {
  const typeColor: Record<string, string> = {
    mcq: 'bg-indigo-100 text-indigo-700',
    synonym: 'bg-emerald-100 text-emerald-700',
    antonym: 'bg-red-100 text-red-700',
    fill_blank: 'bg-amber-100 text-amber-700',
    meaning: 'bg-purple-100 text-purple-700',
    audio: 'bg-cyan-100 text-cyan-700',
    image: 'bg-pink-100 text-pink-700',
  };
  const typeLabel: Record<string, string> = {
    mcq: 'MCQ', synonym: 'Synonym', antonym: 'Antonym', fill_blank: 'Fill Blank',
    meaning: 'Meaning', audio: 'Audio', image: 'Image',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 group hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onMoveUp} disabled={!onMoveUp} className="h-5 w-5 rounded flex items-center justify-center hover:bg-slate-100 disabled:opacity-30">
            <ArrowUp className="h-3 w-3" />
          </button>
          <button onClick={onMoveDown} disabled={!onMoveDown} className="h-5 w-5 rounded flex items-center justify-center hover:bg-slate-100 disabled:opacity-30">
            <ArrowDown className="h-3 w-3" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor[q.type] || 'bg-slate-100 text-slate-600'}`}>
              {typeLabel[q.type] || q.type}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${DIFF_COLOR[q.difficulty]}`}>{q.difficulty}</span>
            <span className="text-[10px] text-slate-400">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
            {word && <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded">{word.word}</span>}
          </div>
          <p className="text-sm font-medium text-slate-700 leading-snug line-clamp-2">{q.question}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> {q.correctAnswer}
          </p>
        </div>
        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="h-6 w-6 rounded hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600">
            <Pencil className="h-3 w-3" />
          </button>
          <button onClick={onDelete} className="h-6 w-6 rounded hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SuperAdminVocabulary() {
  const { toast } = useToast();
  const vocab = useVocabulary('superadmin_1');
  const {
    categories, addCategory, updateCategory, deleteCategory,
    lessons, addLesson, updateLesson, deleteLesson,
    words, addWord, updateWord, deleteWord, approveWord,
    quizQuestions, addQuizQuestion, updateQuizQuestion, deleteQuizQuestion,
    getQuestionsForLesson,
    bulkAddWords, autoGenerateQuizForWord,
  } = vocab as any;

  const [view, setView] = useState<AdminView>({ type: 'categories' });
  const [wordForm, setWordForm] = useState<{ open: boolean; editing: VocabWord | null }>({ open: false, editing: null });
  const [excelModal, setExcelModal] = useState(false);
  const [quizEditForm, setQuizEditForm] = useState<{ open: boolean; editing: QuizQuestion | null }>({ open: false, editing: null });

  // Inline forms
  const [catForm, setCatForm] = useState({ open: false, editing: null as VocabCategory | null, name: '', description: '', icon: '📚', color: GRADIENT_PRESETS[0].value, examTags: [] as ExamCategory[], isActive: true });
  const [lessonForm, setLessonForm] = useState({ open: false, editing: null as VocabLesson | null, name: '', description: '', difficulty: 'medium' as DifficultyLevel, estimatedMinutes: 20, priority: 'medium' as 'high' | 'medium' | 'low', status: 'published' as 'draft' | 'published' });

  // Search/filter
  const [wordSearch, setWordSearch] = useState('');
  const [quizCustomForm, setQuizCustomForm] = useState({ question: '', type: 'mcq' as QuizQuestion['type'], options: ['', '', '', ''], correctAnswer: '', explanation: '', difficulty: 'medium' as DifficultyLevel, marks: 1, open: false, editId: null as string | null, wordId: '' });

  // ── Derived data ──
  const currentCategory = view.type !== 'categories' ? categories?.find((c: VocabCategory) => c.id === (view as any).id || c.id === (view as any).categoryId) : null;
  const currentLesson = view.type === 'lesson' ? lessons?.find((l: VocabLesson) => l.id === (view as any).lessonId) : null;
  const lessonWordsList: VocabWord[] = useMemo(() => {
    if (!currentLesson) return [];
    return (currentLesson.wordIds || []).map((id: string) => words?.find((w: VocabWord) => w.id === id)).filter(Boolean) as VocabWord[];
  }, [currentLesson, words]);
  const lessonQuestions: QuizQuestion[] = useMemo(() => {
    if (!currentLesson) return [];
    return getQuestionsForLesson ? getQuestionsForLesson(currentLesson.id) : [];
  }, [currentLesson, quizQuestions, getQuestionsForLesson]);
  const filteredWords = wordSearch
    ? lessonWordsList.filter(w => w.word.toLowerCase().includes(wordSearch.toLowerCase()) || w.meaning.toLowerCase().includes(wordSearch.toLowerCase()))
    : lessonWordsList;

  // ── Category CRUD ──
  const openNewCat = () => setCatForm({ open: true, editing: null, name: '', description: '', icon: '📚', color: GRADIENT_PRESETS[0].value, examTags: [], isActive: true });
  const openEditCat = (c: VocabCategory) => setCatForm({ open: true, editing: c, name: c.name, description: c.description, icon: c.icon, color: c.color, examTags: c.examTags, isActive: c.isActive });
  const saveCat = () => {
    if (!catForm.name.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    if (catForm.editing) updateCategory(catForm.editing.id, { name: catForm.name, description: catForm.description, icon: catForm.icon, color: catForm.color, examTags: catForm.examTags, isActive: catForm.isActive });
    else addCategory({ name: catForm.name, description: catForm.description, icon: catForm.icon, color: catForm.color, examTags: catForm.examTags, isActive: catForm.isActive });
    setCatForm(p => ({ ...p, open: false }));
    toast({ title: catForm.editing ? 'Category updated!' : 'Category created!', description: catForm.name });
  };

  // ── Lesson CRUD ──
  const openNewLesson = () => setLessonForm({ open: true, editing: null, name: '', description: '', difficulty: 'medium', estimatedMinutes: 20, priority: 'high', status: 'published' });
  const openEditLesson = (l: VocabLesson) => setLessonForm({ open: true, editing: l, name: l.name, description: l.description, difficulty: l.difficulty, estimatedMinutes: l.estimatedMinutes, priority: l.priority, status: l.status });
  const saveLesson = () => {
    if (!lessonForm.name.trim() || !currentCategory) return;
    if (lessonForm.editing) updateLesson(lessonForm.editing.id, { name: lessonForm.name, description: lessonForm.description, difficulty: lessonForm.difficulty, estimatedMinutes: lessonForm.estimatedMinutes, priority: lessonForm.priority, status: lessonForm.status });
    else addLesson({ name: lessonForm.name, description: lessonForm.description, categoryId: currentCategory.id, difficulty: lessonForm.difficulty, estimatedMinutes: lessonForm.estimatedMinutes, priority: lessonForm.priority, status: lessonForm.status, wordIds: [] });
    setLessonForm(p => ({ ...p, open: false }));
    toast({ title: lessonForm.editing ? 'Lesson updated!' : 'Lesson created!', description: lessonForm.name });
  };

  // ── Word CRUD ──
  const handleSaveWord = (form: Omit<VocabWord, 'id' | 'createdAt'>, autoGenQuiz: boolean, quizTypes: string[]) => {
    let savedWord: VocabWord;
    if (wordForm.editing) {
      updateWord(wordForm.editing.id, form);
      savedWord = { ...wordForm.editing, ...form };
    } else {
      const added = addWord(form);
      savedWord = added;
      // Add to lesson wordIds
      if (currentLesson && added?.id) {
        updateLesson(currentLesson.id, { wordIds: [...(currentLesson.wordIds || []), added.id] });
      }
    }
    if (autoGenQuiz && savedWord?.id && currentLesson && autoGenerateQuizForWord) {
      const generated = autoGenerateQuizForWord(savedWord, currentLesson.id, quizTypes);
      toast({ title: `Word saved! ${generated.length} quiz questions auto-generated.` });
    } else {
      toast({ title: wordForm.editing ? 'Word updated!' : 'Word added!', description: form.word });
    }
    setWordForm({ open: false, editing: null });
  };

  // ── Excel Import ──
  const handleExcelImport = (newWords: Omit<VocabWord, 'id' | 'createdAt'>[], autoQuiz: boolean) => {
    if (!currentLesson) return [];
    const added: VocabWord[] = bulkAddWords(newWords, currentLesson.id);
    if (autoQuiz && autoGenerateQuizForWord) {
      let total = 0;
      setTimeout(() => {
        added.forEach((w: VocabWord) => {
          const gen = autoGenerateQuizForWord(w, currentLesson.id);
          total += gen.length;
        });
        toast({ title: `${added.length} words imported!`, description: `${total} quiz questions generated automatically` });
      }, 100);
    } else {
      toast({ title: `${added.length} words imported!`, description: 'Check the word list below' });
    }
    return added;
  };

  // ── Quiz CRUD ──
  const deleteWordFromLesson = (wordId: string) => {
    if (!currentLesson) return;
    updateLesson(currentLesson.id, { wordIds: (currentLesson.wordIds || []).filter((id: string) => id !== wordId) });
    toast({ title: 'Word removed from lesson' });
  };

  const saveCustomQuiz = () => {
    const { editId, open, ...rest } = quizCustomForm;
    if (!rest.question.trim() || !currentLesson) return;
    const qData: Omit<QuizQuestion, 'id'> = {
      lessonId: currentLesson.id, wordId: rest.wordId || undefined,
      type: rest.type, question: rest.question,
      options: rest.options.filter(Boolean),
      correctAnswer: rest.correctAnswer, explanation: rest.explanation,
      difficulty: rest.difficulty, marks: rest.marks,
    };
    if (editId) updateQuizQuestion(editId, qData);
    else addQuizQuestion(qData);
    setQuizCustomForm(p => ({ ...p, open: false, editId: null }));
    toast({ title: editId ? 'Question updated!' : 'Question added!' });
  };

  // ─── SCREEN: Categories ───────────────────────────────────────────────────
  if (view.type === 'categories') {
    const totalWords = words?.length || 0;
    const totalLessons = lessons?.length || 0;
    const publishedLessons = lessons?.filter((l: VocabLesson) => l.status === 'published').length || 0;
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Vocabulary Manager</h1>
            <p className="text-sm text-slate-500 mt-1">Manage categories → lessons → words → quizzes in one place</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={openNewCat} className="gap-2 bg-indigo-600 hover:bg-indigo-700 font-bold shadow-sm shadow-indigo-200 h-10">
              <Plus className="h-4 w-4" /> New Category
            </Button>
          </div>
        </div>

        {/* Global stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Categories', value: categories?.length || 0, icon: LayoutGrid, color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Total Lessons', value: totalLessons, icon: BookOpen, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Published', value: publishedLessons, icon: Globe, color: 'text-blue-600 bg-blue-50' },
            { label: 'Total Words', value: totalWords, icon: BookMarked, color: 'text-violet-600 bg-violet-50' },
          ].map(s => (
            <div key={s.label} className={`${s.color.split(' ')[1]} rounded-xl p-4 flex items-center gap-3 border border-black/5`}>
              <s.icon className={`h-8 w-8 ${s.color.split(' ')[0]} shrink-0`} />
              <div>
                <p className={`text-2xl font-black ${s.color.split(' ')[0]}`}>{s.value}</p>
                <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Category form (inline) */}
        {catForm.open && (
          <div className="bg-white border-2 border-indigo-200 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-slate-800 text-lg">{catForm.editing ? 'Edit Category' : '+ New Category'}</h3>
              <button onClick={() => setCatForm(p => ({ ...p, open: false }))} className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Category Name *</Label>
                <Input value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Banking Vocabulary" className="font-semibold h-10" autoFocus />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Icon (emoji)</Label>
                <Input value={catForm.icon} onChange={e => setCatForm(p => ({ ...p, icon: e.target.value }))}
                  placeholder="🏦" className="text-2xl text-center h-10" maxLength={4} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Description</Label>
              <Textarea value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))}
                placeholder="What exams / topics does this category cover?" rows={2} className="resize-none text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Color Theme</Label>
                <div className="grid grid-cols-4 gap-2">
                  {GRADIENT_PRESETS.map(g => (
                    <button
                      key={g.value}
                      onClick={() => setCatForm(p => ({ ...p, color: g.value }))}
                      className={`h-9 rounded-lg ${g.preview} transition-all ${catForm.color === g.value ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105' : 'hover:scale-105'}`}
                      title={g.label}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Exam Tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {EXAM_TAGS.map(t => (
                    <button
                      key={t}
                      onClick={() => setCatForm(p => ({
                        ...p,
                        examTags: p.examTags.includes(t) ? p.examTags.filter(x => x !== t) : [...p.examTags, t]
                      }))}
                      className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase transition-all ${catForm.examTags.includes(t) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setCatForm(p => ({ ...p, open: false }))} className="flex-1 h-10">Cancel</Button>
              <Button onClick={saveCat} className="flex-1 h-10 font-bold bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Save className="h-4 w-4" /> {catForm.editing ? 'Update' : 'Create'} Category
              </Button>
            </div>
          </div>
        )}

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(categories || []).map((cat: VocabCategory, idx: number) => {
            const catLessons = (lessons || []).filter((l: VocabLesson) => l.categoryId === cat.id);
            const totalWordsInCat = catLessons.reduce((s: number, l: VocabLesson) => s + (l.wordIds?.length || 0), 0);
            const published = catLessons.filter((l: VocabLesson) => l.status === 'published').length;
            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all group cursor-pointer"
                onClick={() => setView({ type: 'category', id: cat.id })}
              >
                {/* Gradient header */}
                <div className={`bg-gradient-to-br ${cat.color || 'from-indigo-500 to-violet-600'} p-5 relative overflow-hidden`}>
                  <div className="text-4xl mb-2">{cat.icon || '📚'}</div>
                  <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); openEditCat(cat); }}
                      className="h-7 w-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white backdrop-blur-sm"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); if (confirm(`Delete "${cat.name}"?`)) deleteCategory(cat.id); }}
                      className="h-7 w-7 rounded-lg bg-white/20 hover:bg-red-400/60 flex items-center justify-center text-white backdrop-blur-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {cat.examTags?.slice(0, 3).map((t: string) => (
                      <span key={t} className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/25 text-white backdrop-blur-sm">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-slate-800 text-base leading-tight">{cat.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{cat.description}</p>
                    </div>
                    <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${cat.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-lg font-black text-slate-800">{catLessons.length}</p>
                        <p className="text-[10px] text-slate-400">Lessons</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-slate-800">{totalWordsInCat}</p>
                        <p className="text-[10px] text-slate-400">Words</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-emerald-600">{published}</p>
                        <p className="text-[10px] text-slate-400">Published</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:gap-2 transition-all">
                      Open <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty slot card */}
          {!catForm.open && (
            <button
              onClick={openNewCat}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all min-h-[180px]"
            >
              <Plus className="h-8 w-8" />
              <p className="text-sm font-bold">Add Category</p>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── SCREEN: Category Detail (Lessons) ────────────────────────────────────
  if (view.type === 'category' && currentCategory) {
    const catLessons = (lessons || []).filter((l: VocabLesson) => l.categoryId === currentCategory.id);
    return (
      <div className="space-y-5 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <button onClick={() => setView({ type: 'categories' })} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium">
          <ChevronLeft className="h-4 w-4" /> All Categories
        </button>

        {/* Category header */}
        <div className={`bg-gradient-to-br ${currentCategory.color || 'from-indigo-500 to-violet-600'} rounded-2xl p-6 text-white relative overflow-hidden`}>
          <div className="absolute -right-6 -top-6 text-9xl opacity-10">{currentCategory.icon}</div>
          <div className="relative flex items-start justify-between">
            <div>
              <div className="text-3xl mb-2">{currentCategory.icon}</div>
              <h1 className="text-2xl font-black">{currentCategory.name}</h1>
              <p className="text-white/70 text-sm mt-1">{currentCategory.description}</p>
              <div className="flex gap-1 mt-2 flex-wrap">
                {currentCategory.examTags?.map((t: string) => (
                  <span key={t} className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-white/20 backdrop-blur-sm">{t}</span>
                ))}
              </div>
            </div>
            <button onClick={() => openEditCat(currentCategory)}
              className="h-8 w-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white backdrop-blur-sm transition-all">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-5">
            {[
              { label: 'Lessons', value: catLessons.length },
              { label: 'Total Words', value: catLessons.reduce((s: number, l: VocabLesson) => s + (l.wordIds?.length || 0), 0) },
              { label: 'Published', value: catLessons.filter((l: VocabLesson) => l.status === 'published').length },
            ].map(s => (
              <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-[10px] text-white/70 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category edit form (inline) */}
        {catForm.open && catForm.editing?.id === currentCategory.id && (
          <div className="bg-white border-2 border-indigo-200 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800">Edit Category</h3>
              <button onClick={() => setCatForm(p => ({ ...p, open: false }))} className="h-7 w-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Name *</Label>
                <Input value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Icon</Label>
                <Input value={catForm.icon} onChange={e => setCatForm(p => ({ ...p, icon: e.target.value }))} className="text-2xl text-center h-9" />
              </div>
            </div>
            <Textarea value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} className="resize-none text-sm" />
            <div className="grid grid-cols-4 gap-2">
              {GRADIENT_PRESETS.map(g => <button key={g.value} onClick={() => setCatForm(p => ({ ...p, color: g.value }))} className={`h-8 rounded-lg ${g.preview} ${catForm.color === g.value ? 'ring-2 ring-offset-1 ring-indigo-500' : ''} hover:scale-105 transition-all`} />)}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setCatForm(p => ({ ...p, open: false }))} className="flex-1">Cancel</Button>
              <Button onClick={saveCat} className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2"><Save className="h-4 w-4" /> Update</Button>
            </div>
          </div>
        )}

        {/* Lessons section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-slate-800 text-lg">Lessons</h2>
            <Button onClick={openNewLesson} size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 font-bold h-9">
              <Plus className="h-3.5 w-3.5" /> Add Lesson
            </Button>
          </div>

          {/* Lesson form (inline) */}
          {lessonForm.open && (
            <div className="bg-white border-2 border-indigo-200 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">{lessonForm.editing ? 'Edit Lesson' : '+ New Lesson'}</h3>
                <button onClick={() => setLessonForm(p => ({ ...p, open: false }))} className="h-7 w-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Lesson Name *</Label>
                  <Input value={lessonForm.name} onChange={e => setLessonForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Banking Confusing Words" className="h-10 font-semibold" autoFocus />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Description</Label>
                  <Textarea value={lessonForm.description} onChange={e => setLessonForm(p => ({ ...p, description: e.target.value }))} placeholder="What will students learn?" rows={2} className="resize-none text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Difficulty</Label>
                  <Select value={lessonForm.difficulty} onValueChange={v => setLessonForm(p => ({ ...p, difficulty: v as DifficultyLevel }))}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Est. Minutes</Label>
                  <Input type="number" value={lessonForm.estimatedMinutes} onChange={e => setLessonForm(p => ({ ...p, estimatedMinutes: parseInt(e.target.value) || 0 }))} className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Priority</Label>
                  <Select value={lessonForm.priority} onValueChange={v => setLessonForm(p => ({ ...p, priority: v as 'high' | 'medium' | 'low' }))}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">🔴 High</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="low">🟢 Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Status</Label>
                  <Select value={lessonForm.status} onValueChange={v => setLessonForm(p => ({ ...p, status: v as 'draft' | 'published' }))}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">✅ Published</SelectItem>
                      <SelectItem value="draft">📋 Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" onClick={() => setLessonForm(p => ({ ...p, open: false }))} className="flex-1 h-10">Cancel</Button>
                <Button onClick={saveLesson} className="flex-1 h-10 font-bold bg-indigo-600 hover:bg-indigo-700 gap-2">
                  <Save className="h-4 w-4" /> {lessonForm.editing ? 'Update' : 'Create'} Lesson
                </Button>
              </div>
            </div>
          )}

          {/* Lessons list */}
          <div className="space-y-2">
            {catLessons.map((lesson: VocabLesson, i: number) => {
              const wordCount = lesson.wordIds?.length || 0;
              const qCount = getQuestionsForLesson ? getQuestionsForLesson(lesson.id).length : 0;
              const priorityColor = { high: 'text-red-600 bg-red-50 border-red-200', medium: 'text-amber-600 bg-amber-50 border-amber-200', low: 'text-slate-500 bg-slate-50 border-slate-200' }[lesson.priority];
              return (
                <div
                  key={lesson.id}
                  className="bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group"
                >
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => setView({ type: 'lesson', categoryId: currentCategory.id, lessonId: lesson.id })}
                  >
                    {/* Number */}
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <span className="text-sm font-black text-indigo-600">{i + 1}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-800">{lesson.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${priorityColor}`}>{lesson.priority} Priority</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFF_COLOR[lesson.difficulty]}`}>{lesson.difficulty}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lesson.status === 'published' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                          {lesson.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{lesson.description}</p>
                      <div className="flex items-center gap-4 mt-1.5">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1"><BookOpen className="h-3 w-3" /> {wordCount} words</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1"><Brain className="h-3 w-3" /> {qCount} questions</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.estimatedMinutes} min</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); openEditLesson(lesson); setLessonForm(p => ({ ...p, editing: lesson })); }}
                          className="h-7 w-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); if (confirm(`Delete lesson "${lesson.name}"?`)) deleteLesson(lesson.id); }}
                          className="h-7 w-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:gap-2 transition-all">
                        Open <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {catLessons.length === 0 && !lessonForm.open && (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="font-bold text-slate-500">No lessons yet</p>
                <p className="text-sm text-slate-400 mt-1">Click "Add Lesson" to create the first one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── SCREEN: Lesson Detail (Words + Quiz) ─────────────────────────────────
  if (view.type === 'lesson' && currentCategory && currentLesson) {
    const qCount = lessonQuestions.length;
    const wCount = lessonWordsList.length;

    return (
      <div className="flex flex-col gap-0 max-w-full">
        {/* Excel modal */}
        {excelModal && (
          <ExcelImportModal
            lessonId={currentLesson.id}
            categoryExam={(currentCategory.examTags?.[0] || 'general') as ExamCategory}
            onImport={handleExcelImport}
            onUpdateImage={(id, url) => updateWord(id, { imageUrl: url })}
            onClose={() => setExcelModal(false)}
          />
        )}

        {/* Breadcrumb header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={() => setView({ type: 'categories' })} className="hover:text-slate-700 font-medium">Vocabulary</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <button onClick={() => setView({ type: 'category', id: currentCategory.id })} className="hover:text-slate-700 font-medium">{currentCategory.name}</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-bold text-slate-700">{currentLesson.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setExcelModal(true)} variant="outline" size="sm"
              className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-8 text-xs font-bold">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Import Excel
            </Button>
            <Button onClick={() => setWordForm({ open: true, editing: null })} size="sm"
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 h-8 text-xs font-bold">
              <Plus className="h-3.5 w-3.5" /> Add Word
            </Button>
          </div>
        </div>

        {/* Lesson info bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex items-center gap-4 flex-wrap">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${currentCategory.color} flex items-center justify-center text-lg shrink-0`}>
            {currentCategory.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-black text-slate-800 text-base">{currentLesson.name}</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFF_COLOR[currentLesson.difficulty]}`}>{currentLesson.difficulty}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentLesson.status === 'published' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {currentLesson.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{currentLesson.description}</p>
          </div>
          <div className="flex gap-4 text-center shrink-0">
            <div><p className="text-lg font-black text-indigo-600">{wCount}</p><p className="text-[10px] text-slate-400">Words</p></div>
            <div><p className="text-lg font-black text-violet-600">{qCount}</p><p className="text-[10px] text-slate-400">Questions</p></div>
            <div><p className="text-lg font-black text-slate-600">{currentLesson.estimatedMinutes}m</p><p className="text-[10px] text-slate-400">Est. Time</p></div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => openEditLesson(currentLesson)} className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Lesson edit form */}
        {lessonForm.open && (
          <div className="bg-white border-2 border-indigo-200 rounded-2xl p-5 shadow-lg mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Edit Lesson</h3>
              <button onClick={() => setLessonForm(p => ({ ...p, open: false }))} className="h-7 w-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Name</Label>
                <Input value={lessonForm.name} onChange={e => setLessonForm(p => ({ ...p, name: e.target.value }))} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Difficulty</Label>
                <Select value={lessonForm.difficulty} onValueChange={v => setLessonForm(p => ({ ...p, difficulty: v as DifficultyLevel }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Status</Label>
                <Select value={lessonForm.status} onValueChange={v => setLessonForm(p => ({ ...p, status: v as 'draft' | 'published' }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="published">✅ Published</SelectItem><SelectItem value="draft">📋 Draft</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLessonForm(p => ({ ...p, open: false }))} className="flex-1 h-9 text-sm">Cancel</Button>
              <Button onClick={saveLesson} className="flex-1 h-9 text-sm bg-indigo-600 hover:bg-indigo-700 gap-2"><Save className="h-4 w-4" /> Update Lesson</Button>
            </div>
          </div>
        )}

        {/* Two-column split */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 min-h-[600px]">

          {/* LEFT: Words */}
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-indigo-500" /> Words ({wCount})
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-400" />
                  <Input value={wordSearch} onChange={e => setWordSearch(e.target.value)}
                    placeholder="Search..." className="h-7 pl-7 text-xs w-36 border-slate-200" />
                </div>
                <Button onClick={() => setExcelModal(true)} variant="outline" size="sm"
                  className="h-7 px-2 text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                  <FileSpreadsheet className="h-3 w-3" /> Excel
                </Button>
                <Button onClick={() => setWordForm({ open: true, editing: null })} size="sm"
                  className="h-7 px-2 text-xs gap-1 bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-3 w-3" /> Add
                </Button>
              </div>
            </div>

            {/* Word form inside left panel when panel is open and no right-panel quiz */}
            {wordForm.open ? (
              <div className="flex-1 overflow-hidden">
                <WordFormPanel
                  lessonId={currentLesson.id}
                  categoryExam={(currentCategory.examTags?.[0] || 'general') as ExamCategory}
                  lessonDifficulty={currentLesson.difficulty}
                  editingWord={wordForm.editing}
                  onSave={handleSaveWord}
                  onCancel={() => setWordForm({ open: false, editing: null })}
                />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredWords.map((word: VocabWord, i: number) => (
                  <div key={word.id} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                    {/* Index */}
                    <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-500 shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-800">{word.word}</span>
                        {word.pronunciation && <span className="text-[10px] font-mono text-slate-400">/{word.pronunciation}/</span>}
                        {word.partOfSpeech && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full capitalize">{word.partOfSpeech}</span>}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${DIFF_COLOR[word.difficulty]}`}>{word.difficulty}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{word.meaning}</p>
                      {(word.synonyms?.length || 0) > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {word.synonyms!.slice(0, 3).map(s => <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">{s}</span>)}
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => setWordForm({ open: true, editing: word })}
                        className="h-6 w-6 rounded hover:bg-blue-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button onClick={() => deleteWordFromLesson(word.id)}
                        className="h-6 w-6 rounded hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredWords.length === 0 && (
                  <div className="text-center py-16">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-bold text-slate-500 text-sm">No words yet</p>
                    <p className="text-xs text-slate-400 mt-1">Click "+ Add" or import from Excel</p>
                    <div className="flex gap-2 justify-center mt-4">
                      <Button onClick={() => setWordForm({ open: true, editing: null })} size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs">
                        <Plus className="h-3 w-3" /> Add Word
                      </Button>
                      <Button onClick={() => setExcelModal(true)} variant="outline" size="sm" className="gap-1.5 text-xs border-emerald-300 text-emerald-700">
                        <FileSpreadsheet className="h-3 w-3" /> Import Excel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Quiz Questions */}
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-violet-500" /> Quiz Questions ({qCount})
              </h3>
              <Button
                onClick={() => setQuizCustomForm(p => ({ ...p, open: !p.open, editId: null, question: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', wordId: '' }))}
                size="sm" variant="outline" className="h-7 px-2 text-xs gap-1 border-violet-300 text-violet-700 hover:bg-violet-50">
                <Plus className="h-3 w-3" /> Custom Q
              </Button>
            </div>

            {/* Custom question form */}
            {quizCustomForm.open && (
              <div className="border-b p-4 space-y-3 bg-violet-50/40">
                <p className="text-xs font-bold text-violet-700">{quizCustomForm.editId ? 'Edit Question' : 'Add Custom Question'}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={quizCustomForm.type} onValueChange={v => setQuizCustomForm(p => ({ ...p, type: v as QuizQuestion['type'] }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['mcq', 'synonym', 'antonym', 'fill_blank', 'meaning', 'audio', 'image'].map(t => <SelectItem key={t} value={t} className="text-xs capitalize">{t.replace('_', ' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={quizCustomForm.difficulty} onValueChange={v => setQuizCustomForm(p => ({ ...p, difficulty: v as DifficultyLevel }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="easy" className="text-xs">Easy</SelectItem><SelectItem value="medium" className="text-xs">Medium</SelectItem><SelectItem value="hard" className="text-xs">Hard</SelectItem></SelectContent>
                  </Select>
                </div>
                <Textarea value={quizCustomForm.question} onChange={e => setQuizCustomForm(p => ({ ...p, question: e.target.value }))}
                  placeholder="Question text..." rows={2} className="text-xs resize-none" />
                <div className="grid grid-cols-2 gap-1.5">
                  {quizCustomForm.options.map((opt, i) => (
                    <Input key={i} value={opt} onChange={e => setQuizCustomForm(p => { const ops = [...p.options]; ops[i] = e.target.value; return { ...p, options: ops }; })}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`} className="h-7 text-xs" />
                  ))}
                </div>
                <Select value={quizCustomForm.correctAnswer} onValueChange={v => setQuizCustomForm(p => ({ ...p, correctAnswer: v }))}>
                  <SelectTrigger className="h-8 text-xs text-emerald-700"><SelectValue placeholder="Select correct answer" /></SelectTrigger>
                  <SelectContent>{quizCustomForm.options.filter(Boolean).map((o, i) => <SelectItem key={i} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
                </Select>
                <Input value={quizCustomForm.explanation} onChange={e => setQuizCustomForm(p => ({ ...p, explanation: e.target.value }))} placeholder="Explanation (optional)" className="h-7 text-xs" />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setQuizCustomForm(p => ({ ...p, open: false }))} className="flex-1 h-7 text-xs">Cancel</Button>
                  <Button onClick={saveCustomQuiz} className="flex-1 h-7 text-xs bg-violet-600 hover:bg-violet-700 gap-1">
                    <Save className="h-3 w-3" /> Save Question
                  </Button>
                </div>
              </div>
            )}

            {/* Question list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {lessonQuestions.length > 0 ? (
                lessonQuestions.map((q: QuizQuestion, idx: number) => {
                  const word = q.wordId ? words?.find((w: VocabWord) => w.id === q.wordId) : undefined;
                  return (
                    <QuizQuestionCard
                      key={q.id}
                      q={q}
                      word={word}
                      onEdit={() => setQuizCustomForm({
                        open: true, editId: q.id, question: q.question,
                        type: q.type, options: [...q.options, '', '', '', ''].slice(0, 4),
                        correctAnswer: q.correctAnswer, explanation: q.explanation || '',
                        difficulty: q.difficulty, marks: q.marks, wordId: q.wordId || ''
                      })}
                      onDelete={() => { if (confirm('Delete this question?')) deleteQuizQuestion(q.id); }}
                      onMoveUp={idx > 0 ? () => { } : undefined}
                      onMoveDown={idx < lessonQuestions.length - 1 ? () => { } : undefined}
                    />
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                  <p className="font-bold text-slate-500 text-sm">No quiz questions yet</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Add words with "Auto-generate Quiz" enabled,<br />or create custom questions above
                  </p>
                </div>
              )}
            </div>

            {/* Quick tip */}
            {wCount > 0 && qCount === 0 && (
              <div className="p-3 border-t bg-indigo-50/50">
                <p className="text-[10px] text-indigo-700 text-center flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Tip: Edit any word and save with "Auto-generate Quiz" to create questions instantly
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
