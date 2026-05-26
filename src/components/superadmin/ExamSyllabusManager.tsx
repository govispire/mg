/**
 * ExamSyllabusManager — Full-featured per-exam syllabus editor
 * ─────────────────────────────────────────────────────────────────────────────
 * Embedded inside the SuperAdmin Test Catalog exam page as a tab.
 *
 * Features:
 *  Stage (Tier) level:
 *    • Add / rename / delete stages (Prelims, Mains, Interview…)
 *    • Exam pattern per stage: duration, total marks, negative marking, sectional cutoff
 *    • Reorder stages with ↑↓ buttons
 *
 *  Subject level (per stage):
 *    • Add / rename / delete subjects
 *    • Marks allocated, icon color
 *    • Reorder subjects
 *
 *  Topic level (per subject):
 *    • Add / rename / delete topics
 *    • Weightage %, difficulty (Easy/Medium/Hard), estimated study hours, importance tag
 *    • Reorder topics
 *
 *  Resources per topic:
 *    • Video: title + YouTube/embed URL + instructor + duration
 *    • PDF/Notes: title + link + type (notes/pyq/formulas/summary) + pages
 *    • Practice Test: title + link + question count + duration + difficulty
 *
 *  UX:
 *    • Live search across stages → subjects → topics
 *    • Auto-save + broadcast on every mutation (same 3-layer sync as useExamStages)
 *    • Stats banner: stages / subjects / topics / resources
 *    • Compact accordion with expandable subjects and topics
 *    • Inline "Add" forms — no separate modal needed for names
 *    • Separate resource dialog (modal) for adding videos/PDFs/tests with full metadata
 *    • Bulk import: paste comma-separated topic names to add many at once
 */

import React, { useState, useMemo, useCallback, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BookOpen, Plus, Trash2, X, Video, FileText, CheckCircle, Search,
  Save, RefreshCw, Check, GraduationCap, Layers, Pencil,
  ChevronUp, ChevronDown, Clock, Target, Zap, Star, AlertCircle,
  Link as LinkIcon, Tag, BarChart3, Import, ChevronRight,
} from 'lucide-react';
import { allSyllabusData, type ExamSyllabusConfig } from '@/data/syllabusData';
import { loadSyllabusStore, saveSyllabusStore } from '@/hooks/useSyllabusData';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoResource {
  id: string;
  title: string;
  url: string;
  instructor: string;
  duration: string; // e.g. "45:00"
}

interface PdfResource {
  id: string;
  title: string;
  url: string;
  type: 'notes' | 'pyq' | 'formulas' | 'summary' | 'other';
  pages: number;
}

interface TestResource {
  id: string;
  title: string;
  url: string;
  questions: number;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Topic {
  id: string;
  name: string;
  weightage: number;        // % out of 100 for this subject
  difficulty: 'easy' | 'medium' | 'hard';
  studyHours: number;       // estimated hours
  importance: 'must' | 'high' | 'medium' | 'low';
  videos: VideoResource[];
  pdfs: PdfResource[];
  tests: TestResource[];
  progress: number;         // 0-100 student progress (read-only here)
}

interface Subject {
  id: string;
  name: string;
  marks: number;
  iconBg: string;
  topics: Topic[];
}

interface Stage {
  id: string;
  name: string;
  duration: string;         // e.g. "2 hours"
  totalMarks: number;
  negativeMarking: string;  // e.g. "0.25" or "No"
  sectionalCutoff: boolean;
  subjects: Subject[];
}

interface SyllabusData {
  examId: string;
  examName: string;
  fullName: string;
  stages: string;
  examDate: string;
  tiers: Stage[];
  logo: string;
  category: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() { return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

function loadExam(examId: string, examName: string): SyllabusData {
  const store = loadSyllabusStore();
  if (store[examId]) {
    // Cast existing data — add missing fields with defaults
    const d = store[examId] as any;
    return {
      ...d,
      tiers: (d.tiers || []).map((t: any) => ({
        ...t,
        duration: t.duration || '',
        totalMarks: t.totalMarks || 0,
        negativeMarking: t.negativeMarking || '',
        sectionalCutoff: t.sectionalCutoff || false,
        subjects: (t.subjects || []).map((s: any) => ({
          ...s,
          marks: s.marks || 0,
          iconBg: s.iconBg || 'bg-blue-500',
          topics: (s.topics || []).map((tp: any) => ({
            id: tp.id,
            name: tp.name,
            weightage: tp.weightage || 0,
            difficulty: tp.difficulty || 'medium',
            studyHours: tp.studyHours || 1,
            importance: tp.importance || 'medium',
            videos: (tp.videos || []).map((v: any) => ({ id: v.id, title: v.title, url: v.url || '', instructor: v.instructor || '', duration: v.duration || '' })),
            pdfs: (tp.pdfs || []).map((p: any) => ({ id: p.id, title: p.title, url: p.url || '', type: p.type || 'notes', pages: p.pages || 0 })),
            tests: (tp.tests || []).map((t: any) => ({ id: t.id, title: t.title, url: t.url || '', questions: t.questions || 0, duration: t.duration || '', difficulty: t.difficulty || 'medium' })),
            progress: tp.progress || 0,
          })),
        })),
      })),
    } as SyllabusData;
  }
  if (allSyllabusData[examId]) {
    const d = allSyllabusData[examId] as any;
    return { ...d, tiers: (d.tiers || []).map((t: any) => ({ ...t, subjects: (t.subjects || []).map((s: any) => ({ ...s, topics: (s.topics || []).map((tp: any) => ({ id: tp.id || uid(), name: tp.name, weightage: tp.weightage || 0, difficulty: tp.difficulty || 'medium', studyHours: tp.studyHours || 1, importance: tp.importance || 'medium', videos: tp.videos || [], pdfs: tp.pdfs || [], tests: tp.tests || [], progress: tp.progress || 0 })) })) })) } as SyllabusData;
  }
  return { examId, examName, fullName: examName, stages: '', examDate: '', tiers: [], logo: '', category: '' };
}

function saveExam(examId: string, data: SyllabusData) {
  const store = loadSyllabusStore();
  store[examId] = data as any;
  saveSyllabusStore(store);
}

// ─── Small sub-components ──────────────────────────────────────────────────────

const IMPORTANCE_COLORS: Record<string, string> = {
  must: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
};
const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'text-emerald-600',
  medium: 'text-amber-600',
  hard: 'text-rose-600',
};
const ICON_BG_OPTIONS = [
  { label: 'Blue', value: 'bg-blue-500' },
  { label: 'Indigo', value: 'bg-indigo-500' },
  { label: 'Purple', value: 'bg-purple-500' },
  { label: 'Rose', value: 'bg-rose-500' },
  { label: 'Emerald', value: 'bg-emerald-500' },
  { label: 'Amber', value: 'bg-amber-500' },
  { label: 'Teal', value: 'bg-teal-500' },
  { label: 'Sky', value: 'bg-sky-500' },
];

const ResourceChip: React.FC<{ label: string; onDelete: () => void }> = ({ label, onDelete }) => (
  <span className="inline-flex items-center gap-1 text-[11px] bg-white border rounded-md px-2 py-0.5 text-slate-700 shadow-sm group max-w-[160px]">
    <span className="truncate flex-1" title={label}>{label}</span>
    <button type="button" onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-rose-500 ml-0.5 shrink-0"><X className="h-2.5 w-2.5" /></button>
  </span>
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props { examId: string; examName: string; }

export default function ExamSyllabusManager({ examId, examName }: Props) {
  const formId = useId();
  const [data, setData] = useState<SyllabusData>(() => loadExam(examId, examName));
  const [savedFlash, setSavedFlash] = useState(false);
  const [search, setSearch] = useState('');

  // Stage edit modal
  const [stageModal, setStageModal] = useState<{ open: boolean; stageId: string | null }>({ open: false, stageId: null });
  const [stageForm, setStageForm] = useState({ name: '', duration: '', totalMarks: '', negativeMarking: '', sectionalCutoff: false });

  // Subject edit modal
  const [subjectModal, setSubjectModal] = useState<{ open: boolean; stageId: string; subjectId: string | null }>({ open: false, stageId: '', subjectId: null });
  const [subjectForm, setSubjectForm] = useState({ name: '', marks: '', iconBg: 'bg-blue-500' });

  // Topic edit modal
  const [topicModal, setTopicModal] = useState<{ open: boolean; stageId: string; subjectId: string; topicId: string | null }>({ open: false, stageId: '', subjectId: '', topicId: null });
  const [topicForm, setTopicForm] = useState({ name: '', weightage: '', difficulty: 'medium' as Topic['difficulty'], studyHours: '2', importance: 'medium' as Topic['importance'] });

  // Resource modal
  type ResCtx = { stageId: string; subjectId: string; topicId: string; type: 'video' | 'pdf' | 'test' };
  const [resModal, setResModal] = useState<ResCtx | null>(null);
  const [videoForm, setVideoForm] = useState({ title: '', url: '', instructor: '', duration: '' });
  const [pdfForm, setPdfForm] = useState({ title: '', url: '', type: 'notes', pages: '' });
  const [testForm, setTestForm] = useState({ title: '', url: '', questions: '', duration: '', difficulty: 'medium' });

  // Bulk import
  const [bulkModal, setBulkModal] = useState<{ open: boolean; stageId: string; subjectId: string } | null>(null);
  const [bulkText, setBulkText] = useState('');

  // ── Mutate ────────────────────────────────────────────────────────────────────
  const mutate = useCallback((fn: (d: SyllabusData) => void) => {
    setData(prev => {
      const next: SyllabusData = JSON.parse(JSON.stringify(prev));
      fn(next);
      saveExam(examId, next);
      return next;
    });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }, [examId]);

  // ── Stage CRUD ────────────────────────────────────────────────────────────────
  const openAddStage = () => {
    setStageForm({ name: '', duration: '', totalMarks: '', negativeMarking: '', sectionalCutoff: false });
    setStageModal({ open: true, stageId: null });
  };
  const openEditStage = (s: Stage) => {
    setStageForm({ name: s.name, duration: s.duration, totalMarks: String(s.totalMarks), negativeMarking: s.negativeMarking, sectionalCutoff: s.sectionalCutoff });
    setStageModal({ open: true, stageId: s.id });
  };
  const commitStage = () => {
    const { stageId } = stageModal;
    if (!stageForm.name.trim()) return;
    if (stageId) {
      mutate(d => { const s = d.tiers.find(t => t.id === stageId); if (s) { s.name = stageForm.name; s.duration = stageForm.duration; s.totalMarks = parseInt(stageForm.totalMarks) || 0; s.negativeMarking = stageForm.negativeMarking; s.sectionalCutoff = stageForm.sectionalCutoff; } });
    } else {
      mutate(d => { d.tiers.push({ id: `stage_${uid()}`, name: stageForm.name, duration: stageForm.duration, totalMarks: parseInt(stageForm.totalMarks) || 0, negativeMarking: stageForm.negativeMarking, sectionalCutoff: stageForm.sectionalCutoff, subjects: [] }); });
    }
    setStageModal({ open: false, stageId: null });
  };
  const deleteStage = (id: string) => { if (!confirm('Delete this stage and all its content?')) return; mutate(d => { d.tiers = d.tiers.filter(t => t.id !== id); }); };
  const moveStage = (id: string, dir: -1 | 1) => mutate(d => { const i = d.tiers.findIndex(t => t.id === id); const j = i + dir; if (j >= 0 && j < d.tiers.length) [d.tiers[i], d.tiers[j]] = [d.tiers[j], d.tiers[i]]; });

  // ── Subject CRUD ──────────────────────────────────────────────────────────────
  const openAddSubject = (stageId: string) => { setSubjectForm({ name: '', marks: '', iconBg: 'bg-blue-500' }); setSubjectModal({ open: true, stageId, subjectId: null }); };
  const openEditSubject = (stageId: string, s: Subject) => { setSubjectForm({ name: s.name, marks: String(s.marks), iconBg: s.iconBg }); setSubjectModal({ open: true, stageId, subjectId: s.id }); };
  const commitSubject = () => {
    const { stageId, subjectId } = subjectModal;
    if (!subjectForm.name.trim()) return;
    if (subjectId) {
      mutate(d => { const s = d.tiers.find(t => t.id === stageId)?.subjects.find(s => s.id === subjectId); if (s) { s.name = subjectForm.name; s.marks = parseInt(subjectForm.marks) || 0; s.iconBg = subjectForm.iconBg; } });
    } else {
      mutate(d => { d.tiers.find(t => t.id === stageId)?.subjects.push({ id: `sub_${uid()}`, name: subjectForm.name, marks: parseInt(subjectForm.marks) || 0, iconBg: subjectForm.iconBg, topics: [] }); });
    }
    setSubjectModal({ open: false, stageId: '', subjectId: null });
  };
  const deleteSubject = (stageId: string, subjectId: string) => { if (!confirm('Delete this subject and all topics?')) return; mutate(d => { const s = d.tiers.find(t => t.id === stageId); if (s) s.subjects = s.subjects.filter(s => s.id !== subjectId); }); };
  const moveSubject = (stageId: string, subjectId: string, dir: -1 | 1) => mutate(d => { const subs = d.tiers.find(t => t.id === stageId)?.subjects || []; const i = subs.findIndex(s => s.id === subjectId); const j = i + dir; if (j >= 0 && j < subs.length) [subs[i], subs[j]] = [subs[j], subs[i]]; });

  // ── Topic CRUD ────────────────────────────────────────────────────────────────
  const openAddTopic = (stageId: string, subjectId: string) => { setTopicForm({ name: '', weightage: '', difficulty: 'medium', studyHours: '2', importance: 'medium' }); setTopicModal({ open: true, stageId, subjectId, topicId: null }); };
  const openEditTopic = (stageId: string, subjectId: string, t: Topic) => { setTopicForm({ name: t.name, weightage: String(t.weightage), difficulty: t.difficulty, studyHours: String(t.studyHours), importance: t.importance }); setTopicModal({ open: true, stageId, subjectId, topicId: t.id }); };
  const commitTopic = () => {
    const { stageId, subjectId, topicId } = topicModal;
    if (!topicForm.name.trim()) return;
    const base = { name: topicForm.name, weightage: parseFloat(topicForm.weightage) || 0, difficulty: topicForm.difficulty, studyHours: parseFloat(topicForm.studyHours) || 1, importance: topicForm.importance };
    if (topicId) {
      mutate(d => { const tp = d.tiers.find(t => t.id === stageId)?.subjects.find(s => s.id === subjectId)?.topics.find(t => t.id === topicId); if (tp) Object.assign(tp, base); });
    } else {
      mutate(d => { d.tiers.find(t => t.id === stageId)?.subjects.find(s => s.id === subjectId)?.topics.push({ ...base, id: `topic_${uid()}`, videos: [], pdfs: [], tests: [], progress: 0 }); });
    }
    setTopicModal({ open: false, stageId: '', subjectId: '', topicId: null });
  };
  const deleteTopic = (stageId: string, subjectId: string, topicId: string) => mutate(d => { const s = d.tiers.find(t => t.id === stageId)?.subjects.find(s => s.id === subjectId); if (s) s.topics = s.topics.filter(t => t.id !== topicId); });
  const moveTopic = (stageId: string, subjectId: string, topicId: string, dir: -1 | 1) => mutate(d => { const topics = d.tiers.find(t => t.id === stageId)?.subjects.find(s => s.id === subjectId)?.topics || []; const i = topics.findIndex(t => t.id === topicId); const j = i + dir; if (j >= 0 && j < topics.length) [topics[i], topics[j]] = [topics[j], topics[i]]; });

  // ── Bulk import ────────────────────────────────────────────────────────────────
  const commitBulk = () => {
    if (!bulkModal || !bulkText.trim()) return;
    const names = bulkText.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
    mutate(d => {
      const subj = d.tiers.find(t => t.id === bulkModal.stageId)?.subjects.find(s => s.id === bulkModal.subjectId);
      if (subj) names.forEach(name => subj.topics.push({ id: `topic_${uid()}`, name, weightage: 0, difficulty: 'medium', studyHours: 1, importance: 'medium', videos: [], pdfs: [], tests: [], progress: 0 }));
    });
    setBulkModal(null);
    setBulkText('');
  };

  // ── Resources ─────────────────────────────────────────────────────────────────
  const getTopic = (d: SyllabusData, ctx: ResCtx) => d.tiers.find(t => t.id === ctx.stageId)?.subjects.find(s => s.id === ctx.subjectId)?.topics.find(t => t.id === ctx.topicId);

  const openResModal = (ctx: ResCtx) => {
    setResModal(ctx);
    setVideoForm({ title: '', url: '', instructor: '', duration: '' });
    setPdfForm({ title: '', url: '', type: 'notes', pages: '' });
    setTestForm({ title: '', url: '', questions: '', duration: '', difficulty: 'medium' });
  };

  const addVideo = () => {
    if (!resModal || !videoForm.title.trim()) return;
    mutate(d => { getTopic(d, resModal)?.videos.push({ id: `v_${uid()}`, title: videoForm.title, url: videoForm.url, instructor: videoForm.instructor, duration: videoForm.duration }); });
    setVideoForm({ title: '', url: '', instructor: '', duration: '' });
  };
  const addPdf = () => {
    if (!resModal || !pdfForm.title.trim()) return;
    mutate(d => { getTopic(d, resModal)?.pdfs.push({ id: `p_${uid()}`, title: pdfForm.title, url: pdfForm.url, type: pdfForm.type as any, pages: parseInt(pdfForm.pages) || 0 }); });
    setPdfForm({ title: '', url: '', type: 'notes', pages: '' });
  };
  const addTest = () => {
    if (!resModal || !testForm.title.trim()) return;
    mutate(d => { getTopic(d, resModal)?.tests.push({ id: `t_${uid()}`, title: testForm.title, url: testForm.url, questions: parseInt(testForm.questions) || 0, duration: testForm.duration, difficulty: testForm.difficulty as any }); });
    setTestForm({ title: '', url: '', questions: '', duration: '', difficulty: 'medium' });
  };
  const deleteResource = (stageId: string, subjectId: string, topicId: string, type: 'videos' | 'pdfs' | 'tests', id: string) => mutate(d => { const tp = d.tiers.find(t => t.id === stageId)?.subjects.find(s => s.id === subjectId)?.topics.find(t => t.id === topicId); if (tp) (tp as any)[type] = (tp as any)[type].filter((r: any) => r.id !== id); });

  // ── Search filter ──────────────────────────────────────────────────────────────
  const filteredTiers = useMemo(() => {
    if (!search.trim()) return data.tiers;
    const q = search.toLowerCase();
    return data.tiers.map(tier => ({
      ...tier,
      subjects: tier.subjects.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.topics.some(t => t.name.toLowerCase().includes(q))
      ).map(s => ({
        ...s,
        topics: s.topics.filter(t => t.name.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)),
      })),
    })).filter(t => t.name.toLowerCase().includes(q) || t.subjects.length > 0);
  }, [data.tiers, search]);

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const totalSubjects = data.tiers.reduce((a, t) => a + t.subjects.length, 0);
  const totalTopics = data.tiers.reduce((a, t) => a + t.subjects.reduce((b, s) => b + s.topics.length, 0), 0);
  const totalResources = data.tiers.reduce((a, t) => a + t.subjects.reduce((b, s) => b + s.topics.reduce((c, tp) => c + tp.videos.length + tp.pdfs.length + tp.tests.length, 0), 0), 0);

  // ── Resource modal context ────────────────────────────────────────────────────
  const resTopicData = resModal ? (() => {
    for (const stage of data.tiers) {
      for (const subj of stage.subjects) {
        const tp = subj.topics.find(t => t.id === resModal.topicId);
        if (tp) return tp;
      }
    }
    return null;
  })() : null;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
            Syllabus Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full syllabus editor for <strong>{examName}</strong>. All changes save instantly and sync to students.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground bg-slate-50 border rounded-lg px-3 py-1.5">
            <span className="flex items-center gap-1"><Layers className="h-3 w-3" /><strong className="text-foreground">{data.tiers.length}</strong> Stages</span>
            <span className="text-slate-300">|</span>
            <span><strong className="text-foreground">{totalSubjects}</strong> Subjects</span>
            <span className="text-slate-300">|</span>
            <span><strong className="text-foreground">{totalTopics}</strong> Topics</span>
            <span className="text-slate-300">|</span>
            <span><strong className="text-foreground">{totalResources}</strong> Resources</span>
          </div>
          {/* Auto-save */}
          <div className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-300 ${savedFlash ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
            {savedFlash ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
            {savedFlash ? 'Saved!' : 'Auto-save'}
          </div>
          {/* Add Stage */}
          <Button size="sm" className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700" onClick={openAddStage}>
            <Plus className="h-3.5 w-3.5" /> Add Stage
          </Button>
        </div>
      </div>

      {/* ── Sync badge ── */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-xs text-indigo-700">
        <RefreshCw className="h-3.5 w-3.5 shrink-0" />
        <span><strong>Live Sync:</strong> Changes instantly reflect on the student's <strong>Know Your Syllabus</strong> page and exam detail pages.</span>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search stages, subjects, topics…" className="pl-9 h-9 text-sm bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
      </div>

      {/* ── Empty state ── */}
      {data.tiers.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-slate-50/50">
          <GraduationCap className="h-14 w-14 mx-auto mb-4 text-muted-foreground/25" />
          <p className="font-bold text-muted-foreground text-lg">No Stages Configured</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-5 max-w-xs mx-auto">
            Start by adding exam stages like Prelims, Mains, or Interview. Then add subjects and topics inside each stage.
          </p>
          <Button onClick={openAddStage} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="h-4 w-4" /> Create First Stage
          </Button>
        </div>
      )}

      {/* ── Stage Accordion ── */}
      <Accordion type="multiple" defaultValue={data.tiers.map(t => t.id)} className="space-y-3">
        {filteredTiers.map((tier, tIdx) => {
          const realTier = data.tiers.find(t => t.id === tier.id)!;
          const totalTierTopics = tier.subjects.reduce((a, s) => a + s.topics.length, 0);
          return (
            <AccordionItem key={tier.id} value={tier.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
              <AccordionTrigger className="px-5 py-3.5 hover:no-underline hover:bg-slate-50 transition-colors [&[data-state=open]>div>svg]:rotate-180">
                <div className="flex flex-1 items-center justify-between pr-3 pointer-events-none">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">{tIdx + 1}</div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-slate-800">{tier.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                        {realTier.duration && <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{realTier.duration}</span>}
                        {realTier.totalMarks > 0 && <span className="flex items-center gap-0.5"><Target className="h-3 w-3" />{realTier.totalMarks} marks</span>}
                        {realTier.negativeMarking && <span>-{realTier.negativeMarking}</span>}
                        {realTier.sectionalCutoff && <span className="text-emerald-600">Sectional ✓</span>}
                        <span className="text-slate-400">·</span>
                        <span>{tier.subjects.length} subjects · {totalTierTopics} topics</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pointer-events-auto">
                    <button type="button" onClick={e => { e.stopPropagation(); moveStage(tier.id, -1); }} disabled={tIdx === 0} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronUp className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={e => { e.stopPropagation(); moveStage(tier.id, 1); }} disabled={tIdx === data.tiers.length - 1} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronDown className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={e => { e.stopPropagation(); openEditStage(realTier); }} className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={e => { e.stopPropagation(); deleteStage(tier.id); }} className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="border-t bg-slate-50/50">
                <div className="p-4 space-y-3">

                  {/* Subjects */}
                  {tier.subjects.map((subject, sIdx) => {
                    const realSubject = realTier.subjects.find(s => s.id === subject.id)!;
                    const totalRes = subject.topics.reduce((a, t) => a + t.videos.length + t.pdfs.length + t.tests.length, 0);
                    return (
                      <div key={subject.id} className="bg-white border rounded-lg shadow-sm">
                        {/* Subject header */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-b">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full ${subject.iconBg}`} />
                            <span className="font-semibold text-sm">{subject.name}</span>
                            {subject.marks > 0 && <Badge variant="outline" className="text-[10px] h-4 px-1">{subject.marks}M</Badge>}
                            <span className="text-[11px] text-muted-foreground">{subject.topics.length} topics · {totalRes} resources</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => moveSubject(tier.id, subject.id, -1)} disabled={sIdx === 0} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => moveSubject(tier.id, subject.id, 1)} disabled={sIdx === tier.subjects.length - 1} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => openEditSubject(tier.id, realSubject)} className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"><Pencil className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => { setBulkModal({ open: true, stageId: tier.id, subjectId: subject.id }); setBulkText(''); }} className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" title="Bulk import topics"><Import className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => openAddTopic(tier.id, subject.id)} className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50" title="Add topic"><Plus className="h-3.5 w-3.5" /></button>
                            <button type="button" onClick={() => deleteSubject(tier.id, subject.id)} className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>

                        {/* Topics table */}
                        {subject.topics.length > 0 && (
                          <div className="divide-y divide-slate-100">
                            {subject.topics.map((topic, tpIdx) => (
                              <div key={topic.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50/60 transition-colors group">
                                {/* Reorder */}
                                <div className="flex flex-col mt-0.5 shrink-0">
                                  <button type="button" onClick={() => moveTopic(tier.id, subject.id, topic.id, -1)} disabled={tpIdx === 0} className="text-slate-300 hover:text-slate-600 disabled:opacity-0"><ChevronUp className="h-3 w-3" /></button>
                                  <button type="button" onClick={() => moveTopic(tier.id, subject.id, topic.id, 1)} disabled={tpIdx === subject.topics.length - 1} className="text-slate-300 hover:text-slate-600 disabled:opacity-0"><ChevronDown className="h-3 w-3" /></button>
                                </div>

                                {/* Topic info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium text-sm text-slate-800">{topic.name}</span>
                                    <span className={`text-[10px] font-semibold ${DIFFICULTY_COLORS[topic.difficulty]}`}>{topic.difficulty}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${IMPORTANCE_COLORS[topic.importance]}`}>{topic.importance === 'must' ? '🔥 Must' : topic.importance}</span>
                                    {topic.weightage > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><BarChart3 className="h-3 w-3" />{topic.weightage}%</span>}
                                    {topic.studyHours > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-3 w-3" />{topic.studyHours}h</span>}
                                  </div>
                                  {/* Resources chips */}
                                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {topic.videos.map(v => <ResourceChip key={v.id} label={`▶ ${v.title}`} onDelete={() => deleteResource(tier.id, subject.id, topic.id, 'videos', v.id)} />)}
                                    {topic.pdfs.map(p => <ResourceChip key={p.id} label={`📄 ${p.title}`} onDelete={() => deleteResource(tier.id, subject.id, topic.id, 'pdfs', p.id)} />)}
                                    {topic.tests.map(t => <ResourceChip key={t.id} label={`✅ ${t.title}`} onDelete={() => deleteResource(tier.id, subject.id, topic.id, 'tests', t.id)} />)}
                                    <button type="button" onClick={() => openResModal({ stageId: tier.id, subjectId: subject.id, topicId: topic.id, type: 'video' })}
                                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors">
                                      <Plus className="h-2.5 w-2.5" /> Resource
                                    </button>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button type="button" onClick={() => openEditTopic(tier.id, subject.id, topic)} className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"><Pencil className="h-3.5 w-3.5" /></button>
                                  <button type="button" onClick={() => deleteTopic(tier.id, subject.id, topic.id)} className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add topic inline */}
                        <div className="px-4 py-2 border-t bg-slate-50/50">
                          <button type="button" onClick={() => openAddTopic(tier.id, subject.id)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium">
                            <Plus className="h-3 w-3" /> Add Topic
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Subject */}
                  <button type="button" onClick={() => openAddSubject(tier.id)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-lg text-sm text-muted-foreground hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                    <Plus className="h-4 w-4" /> Add Subject to {tier.name}
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* ══ Stage Modal ══ */}
      <Dialog open={stageModal.open} onOpenChange={open => !open && setStageModal(p => ({ ...p, open: false }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-700">
              <GraduationCap className="h-5 w-5" />
              {stageModal.stageId ? 'Edit Stage' : 'Add New Stage'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="text-xs font-semibold">Stage Name *</Label>
              <Input className="mt-1 h-9" placeholder="e.g. Prelims, Mains, Interview…" value={stageForm.name} onChange={e => setStageForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-semibold">Duration</Label>
                <Input className="mt-1 h-9" placeholder="e.g. 2 hours" value={stageForm.duration} onChange={e => setStageForm(p => ({ ...p, duration: e.target.value }))} />
              </div>
              <div><Label className="text-xs font-semibold">Total Marks</Label>
                <Input type="number" className="mt-1 h-9" placeholder="e.g. 200" value={stageForm.totalMarks} onChange={e => setStageForm(p => ({ ...p, totalMarks: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-semibold">Negative Marking</Label>
                <Input className="mt-1 h-9" placeholder='e.g. 0.25 or "No"' value={stageForm.negativeMarking} onChange={e => setStageForm(p => ({ ...p, negativeMarking: e.target.value }))} />
              </div>
              <div className="flex flex-col justify-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch checked={stageForm.sectionalCutoff} onCheckedChange={v => setStageForm(p => ({ ...p, sectionalCutoff: v }))} />
                  <Label className="text-xs font-semibold">Sectional Cutoff</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={commitStage} disabled={!stageForm.name.trim()} className="bg-indigo-600 hover:bg-indigo-700">{stageModal.stageId ? 'Save Changes' : 'Create Stage'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Subject Modal ══ */}
      <Dialog open={subjectModal.open} onOpenChange={open => !open && setSubjectModal(p => ({ ...p, open: false }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700">
              <BookOpen className="h-5 w-5" />
              {subjectModal.subjectId ? 'Edit Subject' : 'Add Subject'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="text-xs font-semibold">Subject Name *</Label>
              <Input className="mt-1 h-9" placeholder="e.g. Reasoning Ability" value={subjectForm.name} onChange={e => setSubjectForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div><Label className="text-xs font-semibold">Marks Allocated</Label>
              <Input type="number" className="mt-1 h-9" placeholder="e.g. 50" value={subjectForm.marks} onChange={e => setSubjectForm(p => ({ ...p, marks: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs font-semibold">Color</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {ICON_BG_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" title={opt.label} onClick={() => setSubjectForm(p => ({ ...p, iconBg: opt.value }))}
                    className={`w-6 h-6 rounded-full ${opt.value} ${subjectForm.iconBg === opt.value ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-80 hover:opacity-100'} transition-all`} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={commitSubject} disabled={!subjectForm.name.trim()} className="bg-blue-600 hover:bg-blue-700">{subjectModal.subjectId ? 'Save' : 'Add Subject'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Topic Modal ══ */}
      <Dialog open={topicModal.open} onOpenChange={open => !open && setTopicModal(p => ({ ...p, open: false }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-700">
              <Tag className="h-5 w-5 text-indigo-500" />
              {topicModal.topicId ? 'Edit Topic' : 'Add Topic'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="text-xs font-semibold">Topic Name *</Label>
              <Input className="mt-1 h-9" placeholder="e.g. Syllogism, Number Series, Para Jumbles…" value={topicForm.name} onChange={e => setTopicForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs font-semibold">Weightage (%)</Label>
                <Input type="number" className="mt-1 h-9" placeholder="0–100" value={topicForm.weightage} onChange={e => setTopicForm(p => ({ ...p, weightage: e.target.value }))} />
              </div>
              <div><Label className="text-xs font-semibold">Study Hours</Label>
                <Input type="number" className="mt-1 h-9" placeholder="hrs" value={topicForm.studyHours} onChange={e => setTopicForm(p => ({ ...p, studyHours: e.target.value }))} />
              </div>
              <div><Label className="text-xs font-semibold">Difficulty</Label>
                <Select value={topicForm.difficulty} onValueChange={v => setTopicForm(p => ({ ...p, difficulty: v as any }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">🟢 Easy</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="hard">🔴 Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs font-semibold">Importance</Label>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {(['must', 'high', 'medium', 'low'] as const).map(imp => (
                  <button key={imp} type="button" onClick={() => setTopicForm(p => ({ ...p, importance: imp }))}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${topicForm.importance === imp ? IMPORTANCE_COLORS[imp] + ' ring-1 ring-offset-1 ring-indigo-400' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                    {imp === 'must' ? '🔥 Must' : imp.charAt(0).toUpperCase() + imp.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={commitTopic} disabled={!topicForm.name.trim()} className="bg-indigo-600 hover:bg-indigo-700">{topicModal.topicId ? 'Save' : 'Add Topic'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Resource Modal ══ */}
      <Dialog open={!!resModal} onOpenChange={open => !open && setResModal(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-700">
              Manage Resources — <span className="text-indigo-600 font-normal">{resTopicData?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">

            {/* Videos */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 flex items-center gap-1.5"><Video className="h-3.5 w-3.5" /> Video Lessons ({resTopicData?.videos.length || 0})</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {resTopicData?.videos.map(v => (
                  <span key={v.id} className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-800 text-[11px] px-2 py-1 rounded-md max-w-[200px] group">
                    <span className="truncate flex-1" title={v.title}>{v.title}</span>
                    {v.url && <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 shrink-0"><LinkIcon className="h-3 w-3" /></a>}
                    <button type="button" onClick={() => resModal && deleteResource(resModal.stageId, resModal.subjectId, resModal.topicId, 'videos', v.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 shrink-0"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Video title *" className="h-8 text-xs" value={videoForm.title} onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))} />
                  <Input placeholder="YouTube/embed URL" className="h-8 text-xs" value={videoForm.url} onChange={e => setVideoForm(p => ({ ...p, url: e.target.value }))} />
                  <Input placeholder="Instructor name" className="h-8 text-xs" value={videoForm.instructor} onChange={e => setVideoForm(p => ({ ...p, instructor: e.target.value }))} />
                  <Input placeholder="Duration (e.g. 45:00)" className="h-8 text-xs" value={videoForm.duration} onChange={e => setVideoForm(p => ({ ...p, duration: e.target.value }))} />
                </div>
                <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 gap-1" onClick={addVideo} disabled={!videoForm.title.trim()}><Plus className="h-3 w-3" /> Add Video</Button>
              </div>
            </div>

            {/* PDFs */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-2 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> PDFs & Notes ({resTopicData?.pdfs.length || 0})</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {resTopicData?.pdfs.map(p => (
                  <span key={p.id} className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-800 text-[11px] px-2 py-1 rounded-md max-w-[200px] group">
                    <span className="truncate flex-1" title={p.title}>{p.title}</span>
                    {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-700 shrink-0"><LinkIcon className="h-3 w-3" /></a>}
                    <button type="button" onClick={() => resModal && deleteResource(resModal.stageId, resModal.subjectId, resModal.topicId, 'pdfs', p.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 shrink-0"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Document title *" className="h-8 text-xs" value={pdfForm.title} onChange={e => setPdfForm(p => ({ ...p, title: e.target.value }))} />
                  <Input placeholder="PDF/document URL" className="h-8 text-xs" value={pdfForm.url} onChange={e => setPdfForm(p => ({ ...p, url: e.target.value }))} />
                  <Select value={pdfForm.type} onValueChange={v => setPdfForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notes">Class Notes</SelectItem>
                      <SelectItem value="pyq">Previous Year</SelectItem>
                      <SelectItem value="formulas">Formulas</SelectItem>
                      <SelectItem value="summary">Summary PDF</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="Pages" className="h-8 text-xs" value={pdfForm.pages} onChange={e => setPdfForm(p => ({ ...p, pages: e.target.value }))} />
                </div>
                <Button size="sm" className="h-7 text-xs bg-rose-600 hover:bg-rose-700 gap-1" onClick={addPdf} disabled={!pdfForm.title.trim()}><Plus className="h-3 w-3" /> Add PDF</Button>
              </div>
            </div>

            {/* Practice Tests */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" /> Practice Tests ({resTopicData?.tests.length || 0})</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {resTopicData?.tests.map(t => (
                  <span key={t.id} className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] px-2 py-1 rounded-md max-w-[200px] group">
                    <span className="truncate flex-1" title={t.title}>{t.title}</span>
                    {t.url && <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-700 shrink-0"><LinkIcon className="h-3 w-3" /></a>}
                    <button type="button" onClick={() => resModal && deleteResource(resModal.stageId, resModal.subjectId, resModal.topicId, 'tests', t.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 shrink-0"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Test title *" className="h-8 text-xs" value={testForm.title} onChange={e => setTestForm(p => ({ ...p, title: e.target.value }))} />
                  <Input placeholder="Test link/URL" className="h-8 text-xs" value={testForm.url} onChange={e => setTestForm(p => ({ ...p, url: e.target.value }))} />
                  <Input type="number" placeholder="No. of questions" className="h-8 text-xs" value={testForm.questions} onChange={e => setTestForm(p => ({ ...p, questions: e.target.value }))} />
                  <Input placeholder="Duration (e.g. 20 min)" className="h-8 text-xs" value={testForm.duration} onChange={e => setTestForm(p => ({ ...p, duration: e.target.value }))} />
                  <Select value={testForm.difficulty} onValueChange={v => setTestForm(p => ({ ...p, difficulty: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1" onClick={addTest} disabled={!testForm.title.trim()}><Plus className="h-3 w-3" /> Add Test</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button>Done</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Bulk Import Modal ══ */}
      <Dialog open={!!bulkModal?.open} onOpenChange={open => !open && setBulkModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Import className="h-5 w-5 text-emerald-600" /> Bulk Import Topics</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">Enter topic names — one per line <strong>or</strong> comma-separated. Each will be added as a separate topic.</p>
            <Textarea
              className="min-h-[140px] text-sm font-mono"
              placeholder={"Syllogism\nNumber Series\nBlood Relations\n\n— or —\n\nSyllogism, Number Series, Blood Relations"}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{bulkText.split(/[\n,]/).filter(s => s.trim()).length} topics will be added</p>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={commitBulk} disabled={!bulkText.trim()} className="bg-emerald-600 hover:bg-emerald-700 gap-1"><Import className="h-4 w-4" /> Import Topics</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
