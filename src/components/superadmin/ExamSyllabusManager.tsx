/**
 * ExamSyllabusManager — Professional Syllabus CMS
 * ─────────────────────────────────────────────────────────────────────────────
 * Matches the "Topic Content Management" admin panel design with:
 *  • 4-step wizard: Stage Setup → Subject Builder → Topic Builder → Review
 *  • Split-panel Topic Builder: topics list (left) + content tabs (right)
 *  • Tables: Videos (thumbnail/title/faculty/duration/order/status/actions)
 *             PDFs   (thumbnail/title/type/pages/size/order/status/actions)
 *             Tests  (title/type/questions/marks/duration/order/status/actions)
 *  • Status toggle: Published / Draft
 *  • Auto-save + 3-layer broadcast sync to student pages
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BookOpen, Plus, Trash2, X, Video, FileText, CheckCircle2, Search,
  Save, Check, GraduationCap, Pencil, ChevronUp, ChevronDown, Clock,
  Target, RefreshCw, ChevronRight, ChevronLeft, MoreVertical, Copy,
  Eye, EyeOff, BarChart3, Tag, Info, GripVertical, Import, AlertCircle,
  Layers, Star,
} from 'lucide-react';
import { allSyllabusData } from '@/data/syllabusData';
import { loadSyllabusStore, saveSyllabusStore } from '@/hooks/useSyllabusData';

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = 'published' | 'draft';
type Difficulty = 'easy' | 'medium' | 'hard';
type Importance = 'must' | 'high' | 'medium' | 'low';
type PdfType = 'notes' | 'pyq' | 'formulas' | 'summary' | 'practice' | 'other';
type TestType = 'basic' | 'intermediate' | 'advanced' | 'mock' | 'sectional';

interface VideoItem {
  id: string; title: string; subtitle: string;
  instructor: string; duration: string; url: string;
  order: number; status: Status; thumbColor: string;
}
interface PdfItem {
  id: string; title: string; subtitle: string;
  type: PdfType; pages: number; fileSize: string; url: string;
  order: number; status: Status; thumbColor: string;
}
interface TestItem {
  id: string; title: string; subtitle: string;
  type: TestType; questions: number; marks: number;
  duration: string; url: string; order: number; status: Status;
}
interface Topic {
  id: string; name: string; order: number;
  weightage: number; difficulty: Difficulty;
  studyHours: number; importance: Importance;
  description: string; status: Status;
  videos: VideoItem[]; pdfs: PdfItem[]; tests: TestItem[];
}
interface Subject {
  id: string; name: string; marks: number;
  color: string; order: number; topics: Topic[];
}
interface Stage {
  id: string; name: string; order: number;
  duration: string; totalMarks: number;
  negativeMarking: string; sectionalCutoff: boolean;
  subjects: Subject[];
}
interface SyllabusDoc {
  examId: string; examName: string; fullName: string;
  stages: string; examDate: string; tiers: Stage[];
  logo: string; category: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const THUMB_COLORS = [
  '#4F46E5','#0EA5E9','#10B981','#F59E0B','#EF4444',
  '#8B5CF6','#EC4899','#14B8A6','#F97316','#6366F1',
];
const randomColor = () => THUMB_COLORS[Math.floor(Math.random() * THUMB_COLORS.length)];

const STATUS_STYLE: Record<Status, string> = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
};
const DIFF_STYLE: Record<Difficulty, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700',
};
const TYPE_STYLE: Record<string, string> = {
  notes: 'bg-blue-100 text-blue-700',
  pyq: 'bg-purple-100 text-purple-700',
  formulas: 'bg-teal-100 text-teal-700',
  summary: 'bg-indigo-100 text-indigo-700',
  practice: 'bg-orange-100 text-orange-700',
  other: 'bg-slate-100 text-slate-700',
  basic: 'bg-sky-100 text-sky-700',
  intermediate: 'bg-violet-100 text-violet-700',
  advanced: 'bg-rose-100 text-rose-700',
  mock: 'bg-purple-100 text-purple-700',
  sectional: 'bg-teal-100 text-teal-700',
};

function migrateTiers(raw: any[]): Stage[] {
  return (raw || []).map((t: any, ti: number) => ({
    id: t.id || uid(),
    name: t.name || '',
    order: t.order ?? ti,
    duration: t.duration || '',
    totalMarks: t.totalMarks || 0,
    negativeMarking: t.negativeMarking || '',
    sectionalCutoff: !!t.sectionalCutoff,
    subjects: (t.subjects || []).map((s: any, si: number) => ({
      id: s.id || uid(),
      name: s.name || '',
      marks: s.marks || 0,
      color: s.color || s.iconBg?.replace('bg-', '#') || '#4F46E5',
      order: s.order ?? si,
      topics: (s.topics || []).map((tp: any, tpi: number) => ({
        id: tp.id || uid(),
        name: tp.name || '',
        order: tp.order ?? tpi,
        weightage: tp.weightage || 0,
        difficulty: tp.difficulty || 'medium',
        studyHours: tp.studyHours || 1,
        importance: tp.importance || 'medium',
        description: tp.description || '',
        status: tp.status || 'published',
        videos: (tp.videos || []).map((v: any, vi: number) => ({
          id: v.id || uid(), title: v.title || '', subtitle: v.subtitle || '',
          instructor: v.instructor || '', duration: v.duration || '',
          url: v.url || '', order: v.order ?? vi,
          status: v.status || 'published', thumbColor: v.thumbColor || randomColor(),
        })),
        pdfs: (tp.pdfs || []).map((p: any, pi: number) => ({
          id: p.id || uid(), title: p.title || '', subtitle: p.subtitle || '',
          type: p.type || 'notes', pages: p.pages || 0, fileSize: p.fileSize || '',
          url: p.url || '', order: p.order ?? pi,
          status: p.status || 'published', thumbColor: p.thumbColor || randomColor(),
        })),
        tests: (tp.tests || []).map((t: any, tsti: number) => ({
          id: t.id || uid(), title: t.title || '', subtitle: t.subtitle || '',
          type: t.type || 'basic', questions: t.questions || 0,
          marks: t.marks || t.questions || 0, duration: t.duration || '',
          url: t.url || '', order: t.order ?? tsti, status: t.status || 'published',
        })),
      })),
    })),
  }));
}

function loadDoc(examId: string, examName: string): SyllabusDoc {
  const store = loadSyllabusStore();
  const raw = store[examId] || allSyllabusData[examId];
  if (raw) {
    return { ...(raw as any), tiers: migrateTiers((raw as any).tiers || []) } as SyllabusDoc;
  }
  return { examId, examName, fullName: examName, stages: '', examDate: '', tiers: [], logo: '', category: '' };
}

function saveDoc(examId: string, doc: SyllabusDoc) {
  const store = loadSyllabusStore();
  store[examId] = doc as any;
  saveSyllabusStore(store);
}

// ─── Small shared UI ──────────────────────────────────────────────────────────

const Breadcrumb: React.FC<{ parts: string[] }> = ({ parts }) => (
  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
    {parts.map((p, i) => (
      <React.Fragment key={i}>
        {i > 0 && <ChevronRight className="h-3 w-3 text-slate-400" />}
        <span className={i === parts.length - 1 ? 'text-slate-700 font-semibold' : ''}>{p}</span>
      </React.Fragment>
    ))}
  </div>
);

const StatusBadge: React.FC<{ status: Status; onChange: (s: Status) => void }> = ({ status, onChange }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold cursor-pointer transition-colors ${STATUS_STYLE[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'published' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
        {status === 'published' ? 'Published' : 'Draft'}
        <ChevronDown className="h-3 w-3 ml-0.5" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="text-xs">
      <DropdownMenuItem onClick={() => onChange('published')} className="gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Published</DropdownMenuItem>
      <DropdownMenuItem onClick={() => onChange('draft')} className="gap-2"><span className="w-2 h-2 rounded-full bg-amber-400" /> Draft</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const VideoThumb: React.FC<{ color: string; label?: string }> = ({ color, label }) => (
  <div className="w-14 h-10 rounded-md flex items-center justify-center text-white text-[10px] font-bold shadow-sm shrink-0 overflow-hidden" style={{ background: color }}>
    {label ? <span className="text-center leading-tight px-1">{label.slice(0, 8)}</span> : <Video className="h-4 w-4 opacity-80" />}
  </div>
);

const PdfThumb: React.FC<{ color: string; type: PdfType }> = ({ color, type }) => (
  <div className="w-14 h-10 rounded-md flex flex-col items-center justify-center text-white text-[8px] font-black shadow-sm shrink-0" style={{ background: color }}>
    <span>{type === 'pyq' ? 'PYQ' : type === 'formulas' ? 'FML' : type === 'notes' ? 'NOTES' : type === 'summary' ? 'SUM' : 'PDF'}</span>
    <FileText className="h-3 w-3 opacity-70 mt-0.5" />
  </div>
);

const ActionBtns: React.FC<{ onEdit: () => void; onDuplicate?: () => void; onDelete: () => void }> = ({ onEdit, onDuplicate, onDelete }) => (
  <div className="flex items-center gap-1">
    <button type="button" onClick={onEdit} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
    {onDuplicate && <button type="button" onClick={onDuplicate} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-sky-600 transition-colors"><Copy className="h-3.5 w-3.5" /></button>}
    <button type="button" onClick={onDelete} className="p-1.5 rounded-md hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
  </div>
);

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Stage Setup', sub: 'Configure exam stages' },
  { label: 'Subject Builder', sub: 'Add subjects per stage' },
  { label: 'Topic Builder', sub: 'Build topics & content' },
  { label: 'Review & Publish', sub: 'Preview and confirm' },
];

const StepBar: React.FC<{ step: number }> = ({ step }) => (
  <div className="flex items-start gap-0 bg-white border rounded-xl p-4 mb-4 shadow-sm">
    {STEPS.map((s, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center flex-1 min-w-0">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
            i < step ? 'bg-indigo-600 border-indigo-600 text-white' :
            i === step ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100' :
            'bg-white border-slate-300 text-slate-400'
          }`}>
            {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <p className={`text-[11px] font-bold mt-1 text-center ${i === step ? 'text-indigo-700' : i < step ? 'text-slate-700' : 'text-slate-400'}`}>{s.label}</p>
          <p className={`text-[10px] text-center hidden sm:block ${i === step ? 'text-indigo-500' : 'text-slate-400'}`}>{s.sub}</p>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`h-0.5 flex-1 mt-3.5 mx-1 rounded-full transition-all ${i < step ? 'bg-indigo-400' : 'bg-slate-200'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props { examId: string; examName: string; }

export default function ExamSyllabusManager({ examId, examName }: Props) {
  const [doc, setDoc] = useState<SyllabusDoc>(() => loadDoc(examId, examName));
  const [step, setStep] = useState(0);
  const [savedFlash, setSavedFlash] = useState(false);

  // Selection state
  const [selStageId, setSelStageId] = useState<string>('');
  const [selSubjectId, setSelSubjectId] = useState<string>('');
  const [selTopicId, setSelTopicId] = useState<string>('');
  const [resTab, setResTab] = useState<'videos' | 'pdfs' | 'tests' | 'details'>('videos');

  // Modals
  const [stageModal, setStageModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [stageForm, setStageForm] = useState({ name: '', duration: '', totalMarks: '', negativeMarking: '', sectionalCutoff: false });

  const [subjectModal, setSubjectModal] = useState<{ open: boolean; stageId: string; id: string | null }>({ open: false, stageId: '', id: null });
  const [subjectForm, setSubjectForm] = useState({ name: '', marks: '', color: '#4F46E5' });

  const [topicModal, setTopicModal] = useState<{ open: boolean; stageId: string; subjectId: string; id: string | null }>({ open: false, stageId: '', subjectId: '', id: null });
  const [topicForm, setTopicForm] = useState({ name: '', weightage: '', difficulty: 'medium' as Difficulty, studyHours: '2', importance: 'medium' as Importance, description: '' });

  const [videoModal, setVideoModal] = useState<{ open: boolean; stageId: string; subjectId: string; topicId: string; id: string | null }>({ open: false, stageId: '', subjectId: '', topicId: '', id: null });
  const [videoForm, setVideoForm] = useState({ title: '', subtitle: '', instructor: '', duration: '', url: '', status: 'published' as Status });

  const [pdfModal, setPdfModal] = useState<{ open: boolean; stageId: string; subjectId: string; topicId: string; id: string | null }>({ open: false, stageId: '', subjectId: '', topicId: '', id: null });
  const [pdfForm, setPdfForm] = useState({ title: '', subtitle: '', type: 'notes' as PdfType, pages: '', fileSize: '', url: '', status: 'published' as Status });

  const [testModal, setTestModal] = useState<{ open: boolean; stageId: string; subjectId: string; topicId: string; id: string | null }>({ open: false, stageId: '', subjectId: '', topicId: '', id: null });
  const [testForm, setTestForm] = useState({ title: '', subtitle: '', type: 'basic' as TestType, questions: '', marks: '', duration: '', url: '', status: 'published' as Status });

  const [bulkModal, setBulkModal] = useState<{ open: boolean; stageId: string; subjectId: string } | null>(null);
  const [bulkText, setBulkText] = useState('');
  const [search, setSearch] = useState('');

  // ── Mutate ──────────────────────────────────────────────────────────────────
  const mutate = useCallback((fn: (d: SyllabusDoc) => void) => {
    setDoc(prev => {
      const next: SyllabusDoc = JSON.parse(JSON.stringify(prev));
      fn(next);
      saveDoc(examId, next);
      return next;
    });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }, [examId]);

  // Helpers to find entities
  const findStage = (d: SyllabusDoc, stId: string) => d.tiers.find(t => t.id === stId);
  const findSubject = (d: SyllabusDoc, stId: string, sId: string) => findStage(d, stId)?.subjects.find(s => s.id === sId);
  const findTopic = (d: SyllabusDoc, stId: string, sId: string, tId: string) => findSubject(d, stId, sId)?.topics.find(t => t.id === tId);

  // ── Stage CRUD ──────────────────────────────────────────────────────────────
  const openAddStage = () => { setStageForm({ name: '', duration: '', totalMarks: '', negativeMarking: '', sectionalCutoff: false }); setStageModal({ open: true, id: null }); };
  const openEditStage = (s: Stage) => { setStageForm({ name: s.name, duration: s.duration, totalMarks: String(s.totalMarks), negativeMarking: s.negativeMarking, sectionalCutoff: s.sectionalCutoff }); setStageModal({ open: true, id: s.id }); };
  const commitStage = () => {
    if (!stageForm.name.trim()) return;
    if (stageModal.id) {
      mutate(d => { const s = findStage(d, stageModal.id!); if (s) Object.assign(s, { name: stageForm.name, duration: stageForm.duration, totalMarks: +stageForm.totalMarks || 0, negativeMarking: stageForm.negativeMarking, sectionalCutoff: stageForm.sectionalCutoff }); });
    } else {
      mutate(d => { const ns: Stage = { id: `stage_${uid()}`, name: stageForm.name, order: d.tiers.length, duration: stageForm.duration, totalMarks: +stageForm.totalMarks || 0, negativeMarking: stageForm.negativeMarking, sectionalCutoff: stageForm.sectionalCutoff, subjects: [] }; d.tiers.push(ns); setSelStageId(ns.id); });
    }
    setStageModal({ open: false, id: null });
  };
  const deleteStage = (id: string) => { if (!confirm('Delete this stage?')) return; mutate(d => { d.tiers = d.tiers.filter(t => t.id !== id); }); if (selStageId === id) setSelStageId(''); };

  // ── Subject CRUD ────────────────────────────────────────────────────────────
  const openAddSubject = (stageId: string) => { setSubjectForm({ name: '', marks: '', color: '#4F46E5' }); setSubjectModal({ open: true, stageId, id: null }); };
  const openEditSubject = (stageId: string, s: Subject) => { setSubjectForm({ name: s.name, marks: String(s.marks), color: s.color }); setSubjectModal({ open: true, stageId, id: s.id }); };
  const commitSubject = () => {
    const { stageId, id } = subjectModal;
    if (!subjectForm.name.trim()) return;
    if (id) {
      mutate(d => { const s = findSubject(d, stageId, id); if (s) Object.assign(s, { name: subjectForm.name, marks: +subjectForm.marks || 0, color: subjectForm.color }); });
    } else {
      mutate(d => { const st = findStage(d, stageId); if (st) { const ns: Subject = { id: `sub_${uid()}`, name: subjectForm.name, marks: +subjectForm.marks || 0, color: subjectForm.color, order: st.subjects.length, topics: [] }; st.subjects.push(ns); setSelSubjectId(ns.id); } });
    }
    setSubjectModal({ open: false, stageId: '', id: null });
  };
  const deleteSubject = (stId: string, sId: string) => { if (!confirm('Delete this subject?')) return; mutate(d => { const st = findStage(d, stId); if (st) st.subjects = st.subjects.filter(s => s.id !== sId); }); };

  // ── Topic CRUD ──────────────────────────────────────────────────────────────
  const openAddTopic = (stageId: string, subjectId: string) => { setTopicForm({ name: '', weightage: '', difficulty: 'medium', studyHours: '2', importance: 'medium', description: '' }); setTopicModal({ open: true, stageId, subjectId, id: null }); };
  const openEditTopic = (stageId: string, subjectId: string, t: Topic) => { setTopicForm({ name: t.name, weightage: String(t.weightage), difficulty: t.difficulty, studyHours: String(t.studyHours), importance: t.importance, description: t.description }); setTopicModal({ open: true, stageId, subjectId, id: t.id }); };
  const commitTopic = () => {
    const { stageId, subjectId, id } = topicModal;
    if (!topicForm.name.trim()) return;
    const base = { name: topicForm.name, weightage: +topicForm.weightage || 0, difficulty: topicForm.difficulty, studyHours: +topicForm.studyHours || 1, importance: topicForm.importance, description: topicForm.description };
    if (id) {
      mutate(d => { const t = findTopic(d, stageId, subjectId, id); if (t) Object.assign(t, base); });
    } else {
      mutate(d => { const s = findSubject(d, stageId, subjectId); if (s) { const nt: Topic = { ...base, id: `topic_${uid()}`, order: s.topics.length, status: 'published', videos: [], pdfs: [], tests: [] }; s.topics.push(nt); setSelTopicId(nt.id); } });
    }
    setTopicModal({ open: false, stageId: '', subjectId: '', id: null });
  };
  const deleteTopic = (stId: string, sId: string, tId: string) => { mutate(d => { const s = findSubject(d, stId, sId); if (s) s.topics = s.topics.filter(t => t.id !== tId); }); if (selTopicId === tId) setSelTopicId(''); };

  // ── Video CRUD ──────────────────────────────────────────────────────────────
  const openAddVideo = (stageId: string, subjectId: string, topicId: string) => { setVideoForm({ title: '', subtitle: '', instructor: '', duration: '', url: '', status: 'published' }); setVideoModal({ open: true, stageId, subjectId, topicId, id: null }); };
  const openEditVideo = (stageId: string, subjectId: string, topicId: string, v: VideoItem) => { setVideoForm({ title: v.title, subtitle: v.subtitle, instructor: v.instructor, duration: v.duration, url: v.url, status: v.status }); setVideoModal({ open: true, stageId, subjectId, topicId, id: v.id }); };
  const commitVideo = () => {
    const { stageId, subjectId, topicId, id } = videoModal;
    if (!videoForm.title.trim()) return;
    if (id) {
      mutate(d => { const t = findTopic(d, stageId, subjectId, topicId); const v = t?.videos.find(v => v.id === id); if (v) Object.assign(v, { ...videoForm }); });
    } else {
      mutate(d => { const t = findTopic(d, stageId, subjectId, topicId); if (t) t.videos.push({ ...videoForm, id: `v_${uid()}`, order: t.videos.length + 1, thumbColor: randomColor() }); });
    }
    setVideoModal({ open: false, stageId: '', subjectId: '', topicId: '', id: null });
  };
  const deleteVideo = (stId: string, sId: string, tId: string, vId: string) => mutate(d => { const t = findTopic(d, stId, sId, tId); if (t) t.videos = t.videos.filter(v => v.id !== vId); });
  const duplicateVideo = (stId: string, sId: string, tId: string, v: VideoItem) => mutate(d => { const t = findTopic(d, stId, sId, tId); if (t) t.videos.push({ ...v, id: `v_${uid()}`, order: t.videos.length + 1, title: v.title + ' (Copy)' }); });
  const setVideoStatus = (stId: string, sId: string, tId: string, vId: string, status: Status) => mutate(d => { const v = findTopic(d, stId, sId, tId)?.videos.find(v => v.id === vId); if (v) v.status = status; });

  // ── PDF CRUD ────────────────────────────────────────────────────────────────
  const openAddPdf = (stageId: string, subjectId: string, topicId: string) => { setPdfForm({ title: '', subtitle: '', type: 'notes', pages: '', fileSize: '', url: '', status: 'published' }); setPdfModal({ open: true, stageId, subjectId, topicId, id: null }); };
  const openEditPdf = (stageId: string, subjectId: string, topicId: string, p: PdfItem) => { setPdfForm({ title: p.title, subtitle: p.subtitle, type: p.type, pages: String(p.pages), fileSize: p.fileSize, url: p.url, status: p.status }); setPdfModal({ open: true, stageId, subjectId, topicId, id: p.id }); };
  const commitPdf = () => {
    const { stageId, subjectId, topicId, id } = pdfModal;
    if (!pdfForm.title.trim()) return;
    if (id) {
      mutate(d => { const t = findTopic(d, stageId, subjectId, topicId); const p = t?.pdfs.find(p => p.id === id); if (p) Object.assign(p, { ...pdfForm, pages: +pdfForm.pages || 0 }); });
    } else {
      mutate(d => { const t = findTopic(d, stageId, subjectId, topicId); if (t) t.pdfs.push({ ...pdfForm, pages: +pdfForm.pages || 0, id: `p_${uid()}`, order: t.pdfs.length + 1, thumbColor: randomColor() }); });
    }
    setPdfModal({ open: false, stageId: '', subjectId: '', topicId: '', id: null });
  };
  const deletePdf = (stId: string, sId: string, tId: string, pId: string) => mutate(d => { const t = findTopic(d, stId, sId, tId); if (t) t.pdfs = t.pdfs.filter(p => p.id !== pId); });
  const setPdfStatus = (stId: string, sId: string, tId: string, pId: string, status: Status) => mutate(d => { const p = findTopic(d, stId, sId, tId)?.pdfs.find(p => p.id === pId); if (p) p.status = status; });

  // ── Test CRUD ───────────────────────────────────────────────────────────────
  const openAddTest = (stageId: string, subjectId: string, topicId: string) => { setTestForm({ title: '', subtitle: '', type: 'basic', questions: '', marks: '', duration: '', url: '', status: 'published' }); setTestModal({ open: true, stageId, subjectId, topicId, id: null }); };
  const openEditTest = (stageId: string, subjectId: string, topicId: string, t: TestItem) => { setTestForm({ title: t.title, subtitle: t.subtitle, type: t.type, questions: String(t.questions), marks: String(t.marks), duration: t.duration, url: t.url, status: t.status }); setTestModal({ open: true, stageId, subjectId, topicId, id: t.id }); };
  const commitTest = () => {
    const { stageId, subjectId, topicId, id } = testModal;
    if (!testForm.title.trim()) return;
    if (id) {
      mutate(d => { const t = findTopic(d, stageId, subjectId, topicId); const ts = t?.tests.find(t => t.id === id); if (ts) Object.assign(ts, { ...testForm, questions: +testForm.questions || 0, marks: +testForm.marks || 0 }); });
    } else {
      mutate(d => { const t = findTopic(d, stageId, subjectId, topicId); if (t) t.tests.push({ ...testForm, questions: +testForm.questions || 0, marks: +testForm.marks || 0, id: `t_${uid()}`, order: t.tests.length + 1 }); });
    }
    setTestModal({ open: false, stageId: '', subjectId: '', topicId: '', id: null });
  };
  const deleteTest = (stId: string, sId: string, tId: string, tsId: string) => mutate(d => { const t = findTopic(d, stId, sId, tId); if (t) t.tests = t.tests.filter(t => t.id !== tsId); });
  const setTestStatus = (stId: string, sId: string, tId: string, tsId: string, status: Status) => mutate(d => { const ts = findTopic(d, stId, sId, tId)?.tests.find(t => t.id === tsId); if (ts) ts.status = status; });

  // ── Bulk import ─────────────────────────────────────────────────────────────
  const commitBulk = () => {
    if (!bulkModal) return;
    const names = bulkText.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
    mutate(d => { const s = findSubject(d, bulkModal.stageId, bulkModal.subjectId); if (s) names.forEach(name => s.topics.push({ id: `topic_${uid()}`, name, order: s.topics.length, weightage: 0, difficulty: 'medium', studyHours: 1, importance: 'medium', description: '', status: 'published', videos: [], pdfs: [], tests: [] })); });
    setBulkModal(null); setBulkText('');
  };

  // ── Derived current data ────────────────────────────────────────────────────
  const selStage = doc.tiers.find(t => t.id === selStageId);
  const selSubject = selStage?.subjects.find(s => s.id === selSubjectId);
  const selTopic = selSubject?.topics.find(t => t.id === selTopicId);

  // Stats
  const totalStages = doc.tiers.length;
  const totalSubjects = doc.tiers.reduce((a, t) => a + t.subjects.length, 0);
  const totalTopics = doc.tiers.reduce((a, t) => a + t.subjects.reduce((b, s) => b + s.topics.length, 0), 0);

  // Topic search filter for left panel
  const filteredTopics = useMemo(() => {
    if (!selSubject) return [];
    if (!search.trim()) return selSubject.topics;
    const q = search.toLowerCase();
    return selSubject.topics.filter(t => t.name.toLowerCase().includes(q));
  }, [selSubject, search]);

  // ── Step navigation ─────────────────────────────────────────────────────────
  const goNext = () => {
    if (step === 0 && !selStageId && doc.tiers.length > 0) setSelStageId(doc.tiers[0].id);
    if (step === 1 && selStage && selStage.subjects.length > 0 && !selSubjectId) setSelSubjectId(selStage.subjects[0].id);
    if (step === 2 && selSubject && selSubject.topics.length > 0 && !selTopicId) setSelTopicId(selSubject.topics[0].id);
    setStep(s => Math.min(3, s + 1));
  };
  const goPrev = () => setStep(s => Math.max(0, s - 1));

  // ── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-0 -mx-1">
      {/* Breadcrumb + title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <Breadcrumb parts={['Syllabus Manager', examName, STEPS[step].label]} />
          <h2 className="text-lg font-bold text-slate-800 leading-tight">{STEPS[step].label}</h2>
          <p className="text-xs text-muted-foreground">{STEPS[step].sub} for <strong>{examName}</strong></p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${savedFlash ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-400 border'}`}>
            {savedFlash ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
            {savedFlash ? 'Saved!' : 'Auto-save'}
          </div>
          <div className="text-xs text-muted-foreground bg-slate-50 border rounded-lg px-3 py-1.5 flex items-center gap-3">
            <span><strong className="text-slate-700">{totalStages}</strong> Stages</span>
            <span className="text-slate-300">|</span>
            <span><strong className="text-slate-700">{totalSubjects}</strong> Subjects</span>
            <span className="text-slate-300">|</span>
            <span><strong className="text-slate-700">{totalTopics}</strong> Topics</span>
          </div>
        </div>
      </div>

      {/* Step bar */}
      <StepBar step={step} />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 0 — Stage Setup */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {step === 0 && (
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Exam Stages</h3>
              <p className="text-xs text-muted-foreground">Define exam stages like Prelims, Mains, Interview. Configure exam pattern for each.</p>
            </div>
            <Button size="sm" className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700" onClick={openAddStage}><Plus className="h-3.5 w-3.5" /> Add Stage</Button>
          </div>

          {doc.tiers.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-xl">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="font-semibold text-muted-foreground">No stages yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Add stages like Prelims, Mains, Interview to get started</p>
              <Button onClick={openAddStage} className="bg-indigo-600 hover:bg-indigo-700 gap-1"><Plus className="h-4 w-4" /> Add First Stage</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {doc.tiers.map((stage, i) => (
                <div key={stage.id} className={`flex items-center gap-4 p-4 border-2 rounded-xl transition-all cursor-pointer ${selStageId === stage.id ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-200 bg-white'}`}
                  onClick={() => setSelStageId(stage.id)}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${selStageId === stage.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{i + 1}</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{stage.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                      {stage.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{stage.duration}</span>}
                      {stage.totalMarks > 0 && <span className="flex items-center gap-1"><Target className="h-3 w-3" />{stage.totalMarks} marks</span>}
                      {stage.negativeMarking && <span>Negative: {stage.negativeMarking}</span>}
                      {stage.sectionalCutoff && <span className="text-emerald-600 font-medium">Sectional cutoff ✓</span>}
                      <span className="text-indigo-600 font-medium">{stage.subjects.length} subjects</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={e => { e.stopPropagation(); openEditStage(stage); }} className="p-1.5 rounded hover:bg-white hover:text-indigo-600 text-slate-400 transition-colors"><Pencil className="h-4 w-4" /></button>
                    <button type="button" onClick={e => { e.stopPropagation(); deleteStage(stage.id); }} className="p-1.5 rounded hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 1 — Subject Builder */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div className="bg-white border rounded-xl shadow-sm">
          {/* Stage selector */}
          <div className="flex items-center gap-2 p-4 border-b overflow-x-auto">
            <span className="text-xs font-semibold text-muted-foreground shrink-0">Stage:</span>
            {doc.tiers.map(stage => (
              <button key={stage.id} type="button" onClick={() => setSelStageId(stage.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${selStageId === stage.id ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'}`}>
                {stage.name}
              </button>
            ))}
          </div>
          <div className="p-5">
            {!selStage ? (
              <div className="text-center py-12 text-muted-foreground">Select a stage above to manage its subjects</div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800">Subjects in {selStage.name}</h3>
                    <p className="text-xs text-muted-foreground">Add subjects and allocate marks for this stage</p>
                  </div>
                  <Button size="sm" className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => openAddSubject(selStage.id)}><Plus className="h-3.5 w-3.5" /> Add Subject</Button>
                </div>

                {selStage.subjects.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <BookOpen className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-muted-foreground text-sm">No subjects yet</p>
                    <Button size="sm" className="mt-3 gap-1" onClick={() => openAddSubject(selStage.id)}><Plus className="h-3.5 w-3.5" /> Add Subject</Button>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-8">#</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Subject Name</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Marks</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Topics</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Color</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selStage.subjects.map((s, i) => (
                          <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                                <span className="font-semibold text-slate-800">{s.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3"><span className="font-semibold text-indigo-600">{s.marks}</span></td>
                            <td className="px-4 py-3"><Badge variant="outline" className="text-[11px]">{s.topics.length}</Badge></td>
                            <td className="px-4 py-3"><div className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ background: s.color }} /></td>
                            <td className="px-4 py-3 text-right"><ActionBtns onEdit={() => openEditSubject(selStage.id, s)} onDelete={() => deleteSubject(selStage.id, s.id)} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 2 — Topic Builder (split panel) */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div className="flex gap-0 border rounded-xl overflow-hidden bg-white shadow-sm" style={{ minHeight: 560 }}>
          {/* LEFT: Topics list */}
          <div className="w-[260px] shrink-0 border-r flex flex-col">
            {/* Stage + subject selector */}
            <div className="p-3 border-b bg-slate-50 space-y-2">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Stage</p>
                <Select value={selStageId} onValueChange={v => { setSelStageId(v); setSelSubjectId(''); setSelTopicId(''); }}>
                  <SelectTrigger className="h-8 text-xs bg-white"><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>{doc.tiers.map(t => <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {selStage && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Subject</p>
                  <Select value={selSubjectId} onValueChange={v => { setSelSubjectId(v); setSelTopicId(''); }}>
                    <SelectTrigger className="h-8 text-xs bg-white"><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>{selStage.subjects.map(s => <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Topics list */}
            {selSubject ? (
              <>
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Search topics…" className="pl-7 h-7 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredTopics.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">No topics found</div>
                  ) : (
                    filteredTopics.map((tp, i) => (
                      <button key={tp.id} type="button" onClick={() => { setSelTopicId(tp.id); setResTab('videos'); }}
                        className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 border-b border-slate-100 transition-colors ${selTopicId === tp.id ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50 text-slate-700'}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-[11px] font-bold shrink-0 ${selTopicId === tp.id ? 'text-indigo-200' : 'text-muted-foreground'}`}>{i + 1}.</span>
                          <span className="text-[12px] font-semibold truncate">{tp.name}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`text-[10px] font-bold px-1 rounded ${selTopicId === tp.id ? 'bg-indigo-500 text-white' : 'bg-blue-100 text-blue-700'}`}>{tp.videos.length}</span>
                          <span className={`text-[10px] font-bold px-1 rounded ${selTopicId === tp.id ? 'bg-indigo-500 text-white' : 'bg-rose-100 text-rose-700'}`}>{tp.pdfs.length}</span>
                          <span className={`text-[10px] font-bold px-1 rounded ${selTopicId === tp.id ? 'bg-indigo-500 text-white' : 'bg-emerald-100 text-emerald-700'}`}>{tp.tests.length}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="p-2 border-t bg-slate-50 space-y-1">
                  <Button size="sm" className="w-full h-7 text-xs gap-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => openAddTopic(selStageId, selSubjectId)}><Plus className="h-3 w-3" /> Add Topic</Button>
                  <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1" onClick={() => setBulkModal({ open: true, stageId: selStageId, subjectId: selSubjectId })}><Import className="h-3 w-3" /> Bulk Import</Button>
                </div>
                <div className="px-3 py-1.5 border-t">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Videos</span>
                    <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-rose-400" /> PDFs</span>
                    <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Tests</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-4 text-muted-foreground text-xs">Select a stage and subject to see topics</div>
            )}
          </div>

          {/* RIGHT: Topic content management */}
          <div className="flex-1 flex flex-col min-w-0">
            {!selTopic ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8 space-y-3">
                <BookOpen className="h-14 w-14 text-slate-200" />
                <p className="font-semibold text-slate-400">Select a topic from the left panel</p>
                <p className="text-sm text-slate-400">Then manage its videos, PDFs, and tests here</p>
              </div>
            ) : (
              <>
                {/* Topic header */}
                <div className="border-b p-4 bg-slate-50/50">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600"><BookOpen className="h-5 w-5" /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800">{selTopic.name}</h3>
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">Topic #{selTopic.id.slice(-4)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Subject: {selSubject?.name} · Order: {selTopic.order + 1}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => openEditTopic(selStageId, selSubjectId, selTopic)} className="p-1.5 rounded hover:bg-white hover:text-indigo-600 text-slate-400 border bg-white shadow-sm"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => deleteTopic(selStageId, selSubjectId, selTopic.id)} className="p-1.5 rounded hover:bg-rose-50 hover:text-rose-600 text-slate-400 border bg-white shadow-sm"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  {/* Stats row */}
                  <div className="flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3.5 w-3.5" /><span className="text-slate-700 font-semibold">{selTopic.studyHours} hrs</span><span>Est. Hours</span></div>
                    <div className="w-px h-4 bg-slate-200" />
                    <div className="flex items-center gap-1.5 text-muted-foreground"><Video className="h-3.5 w-3.5 text-blue-500" /><span className="text-slate-700 font-semibold">{selTopic.videos.length}</span><span>Videos</span></div>
                    <div className="w-px h-4 bg-slate-200" />
                    <div className="flex items-center gap-1.5 text-muted-foreground"><FileText className="h-3.5 w-3.5 text-rose-500" /><span className="text-slate-700 font-semibold">{selTopic.pdfs.length}</span><span>PDFs</span></div>
                    <div className="w-px h-4 bg-slate-200" />
                    <div className="flex items-center gap-1.5 text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /><span className="text-slate-700 font-semibold">{selTopic.tests.length}</span><span>Tests</span></div>
                    <div className="w-px h-4 bg-slate-200" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Status</span>
                      <StatusBadge status={selTopic.status} onChange={s => mutate(d => { const t = findTopic(d, selStageId, selSubjectId, selTopic.id); if (t) t.status = s; })} />
                    </div>
                    {selTopic.weightage > 0 && <><div className="w-px h-4 bg-slate-200" /><span className="text-muted-foreground flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" />{selTopic.weightage}% weightage</span></>}
                  </div>
                </div>

                {/* Resource tabs */}
                <div className="flex items-center justify-between border-b px-4 pt-1">
                  <div className="flex gap-0">
                    {(['videos', 'pdfs', 'tests', 'details'] as const).map(tab => (
                      <button key={tab} type="button" onClick={() => setResTab(tab)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${resTab === tab ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-muted-foreground hover:text-slate-700'}`}>
                        {tab === 'videos' && <><Video className="h-3.5 w-3.5" />Videos ({selTopic.videos.length})</>}
                        {tab === 'pdfs' && <><FileText className="h-3.5 w-3.5" />PDFs ({selTopic.pdfs.length})</>}
                        {tab === 'tests' && <><CheckCircle2 className="h-3.5 w-3.5" />Tests ({selTopic.tests.length})</>}
                        {tab === 'details' && <><Info className="h-3.5 w-3.5" />Topic Details</>}
                      </button>
                    ))}
                  </div>
                  <div className="pb-1">
                    {resTab === 'videos' && <Button size="sm" className="h-7 gap-1 bg-indigo-600 hover:bg-indigo-700 text-xs" onClick={() => openAddVideo(selStageId, selSubjectId, selTopic.id)}><Plus className="h-3 w-3" /> Add Video</Button>}
                    {resTab === 'pdfs' && <Button size="sm" className="h-7 gap-1 bg-rose-600 hover:bg-rose-700 text-xs" onClick={() => openAddPdf(selStageId, selSubjectId, selTopic.id)}><Plus className="h-3 w-3" /> Add PDF</Button>}
                    {resTab === 'tests' && <Button size="sm" className="h-7 gap-1 bg-emerald-600 hover:bg-emerald-700 text-xs" onClick={() => openAddTest(selStageId, selSubjectId, selTopic.id)}><Plus className="h-3 w-3" /> Add Test</Button>}
                  </div>
                </div>

                {/* Table content */}
                <div className="flex-1 overflow-y-auto">

                  {/* VIDEOS table */}
                  {resTab === 'videos' && (
                    selTopic.videos.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <Video className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                        <p className="text-sm font-medium text-slate-400">No videos yet</p>
                        <Button size="sm" className="mt-3 gap-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => openAddVideo(selStageId, selSubjectId, selTopic.id)}><Plus className="h-3.5 w-3.5" /> Add First Video</Button>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b sticky top-0">
                          <tr>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground w-6">#</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground w-16">Thumbnail</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Video Title</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Faculty</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Duration</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground w-10">Order</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Status</th>
                            <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selTopic.videos.map((v, i) => (
                            <tr key={v.id} className="hover:bg-slate-50/60 group">
                              <td className="px-3 py-2.5 text-xs text-muted-foreground">{i + 1}</td>
                              <td className="px-3 py-2.5"><VideoThumb color={v.thumbColor} label={v.title} /></td>
                              <td className="px-3 py-2.5">
                                <p className="font-semibold text-slate-800 text-sm leading-tight">{v.title}</p>
                                {v.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{v.subtitle}</p>}
                              </td>
                              <td className="px-3 py-2.5"><span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">{v.instructor || '—'}</span></td>
                              <td className="px-3 py-2.5 text-xs font-mono font-semibold text-slate-700">{v.duration || '—'}</td>
                              <td className="px-3 py-2.5 text-xs text-center font-semibold text-muted-foreground">{v.order}</td>
                              <td className="px-3 py-2.5"><StatusBadge status={v.status} onChange={s => setVideoStatus(selStageId, selSubjectId, selTopic.id, v.id, s)} /></td>
                              <td className="px-3 py-2.5 text-right"><ActionBtns onEdit={() => openEditVideo(selStageId, selSubjectId, selTopic.id, v)} onDuplicate={() => duplicateVideo(selStageId, selSubjectId, selTopic.id, v)} onDelete={() => deleteVideo(selStageId, selSubjectId, selTopic.id, v.id)} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  )}

                  {/* PDFS table */}
                  {resTab === 'pdfs' && (
                    selTopic.pdfs.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <FileText className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                        <p className="text-sm font-medium text-slate-400">No PDFs yet</p>
                        <Button size="sm" className="mt-3 gap-1 bg-rose-600 hover:bg-rose-700" onClick={() => openAddPdf(selStageId, selSubjectId, selTopic.id)}><Plus className="h-3.5 w-3.5" /> Add First PDF</Button>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b sticky top-0">
                          <tr>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground w-6">#</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground w-16">Thumbnail</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">PDF Title</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Type</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Pages</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">File Size</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground w-10">Order</th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Status</th>
                            <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selTopic.pdfs.map((p, i) => (
                            <tr key={p.id} className="hover:bg-slate-50/60">
                              <td className="px-3 py-2.5 text-xs text-muted-foreground">{i + 1}</td>
                              <td className="px-3 py-2.5"><PdfThumb color={p.thumbColor} type={p.type} /></td>
                              <td className="px-3 py-2.5">
                                <p className="font-semibold text-slate-800 text-sm leading-tight">{p.title}</p>
                                {p.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{p.subtitle}</p>}
                              </td>
                              <td className="px-3 py-2.5"><span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${TYPE_STYLE[p.type] || TYPE_STYLE.other}`}>{p.type === 'pyq' ? 'PYQ' : p.type.charAt(0).toUpperCase() + p.type.slice(1)}</span></td>
                              <td className="px-3 py-2.5 text-xs font-semibold text-slate-700">{p.pages || '—'}</td>
                              <td className="px-3 py-2.5 text-xs text-muted-foreground">{p.fileSize || '—'}</td>
                              <td className="px-3 py-2.5 text-xs text-center font-semibold text-muted-foreground">{p.order}</td>
                              <td className="px-3 py-2.5"><StatusBadge status={p.status} onChange={s => setPdfStatus(selStageId, selSubjectId, selTopic.id, p.id, s)} /></td>
                              <td className="px-3 py-2.5 text-right"><ActionBtns onEdit={() => openEditPdf(selStageId, selSubjectId, selTopic.id, p)} onDelete={() => deletePdf(selStageId, selSubjectId, selTopic.id, p.id)} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  )}

                  {/* TESTS table */}
                  {resTab === 'tests' && (
                    <>
                      {selTopic.tests.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                          <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                          <p className="text-sm font-medium text-slate-400">No tests yet</p>
                          <Button size="sm" className="mt-3 gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => openAddTest(selStageId, selSubjectId, selTopic.id)}><Plus className="h-3.5 w-3.5" /> Add First Test</Button>
                        </div>
                      ) : (
                        <>
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b sticky top-0">
                              <tr>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground w-6">#</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Test Title</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Type</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Questions</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Marks</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Duration</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground w-10">Order</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Status</th>
                                <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {selTopic.tests.map((t, i) => (
                                <tr key={t.id} className="hover:bg-slate-50/60">
                                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{i + 1}</td>
                                  <td className="px-3 py-2.5">
                                    <p className="font-semibold text-slate-800 text-sm leading-tight">{t.title}</p>
                                    {t.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{t.subtitle}</p>}
                                  </td>
                                  <td className="px-3 py-2.5"><span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${TYPE_STYLE[t.type] || TYPE_STYLE.basic}`}>{t.type.charAt(0).toUpperCase() + t.type.slice(1)}</span></td>
                                  <td className="px-3 py-2.5 text-xs font-semibold text-slate-700">{t.questions}</td>
                                  <td className="px-3 py-2.5 text-xs font-semibold text-slate-700">{t.marks}</td>
                                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{t.duration || '—'}</td>
                                  <td className="px-3 py-2.5 text-xs text-center font-semibold text-muted-foreground">{t.order}</td>
                                  <td className="px-3 py-2.5"><StatusBadge status={t.status} onChange={s => setTestStatus(selStageId, selSubjectId, selTopic.id, t.id, s)} /></td>
                                  <td className="px-3 py-2.5 text-right"><ActionBtns onEdit={() => openEditTest(selStageId, selSubjectId, selTopic.id, t)} onDelete={() => deleteTest(selStageId, selSubjectId, selTopic.id, t.id)} /></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {/* Test summary */}
                          <div className="m-4 p-4 bg-slate-50 rounded-xl border">
                            <p className="font-bold text-sm text-slate-800 mb-3">Test Summary</p>
                            <div className="grid grid-cols-4 gap-4">
                              {[
                                { label: 'Total Tests', value: selTopic.tests.length, icon: <CheckCircle2 className="h-5 w-5 text-indigo-500" /> },
                                { label: 'Total Questions', value: selTopic.tests.reduce((a, t) => a + t.questions, 0), icon: <BarChart3 className="h-5 w-5 text-blue-500" /> },
                                { label: 'Total Marks', value: selTopic.tests.reduce((a, t) => a + t.marks, 0), icon: <Star className="h-5 w-5 text-amber-500" /> },
                                { label: 'Total Duration', value: selTopic.tests.filter(t => t.duration).map(t => parseInt(t.duration) || 0).reduce((a, b) => a + b, 0) + ' mins', icon: <Clock className="h-5 w-5 text-emerald-500" /> },
                              ].map(stat => (
                                <div key={stat.label} className="bg-white p-3 rounded-lg border flex items-center gap-3">
                                  {stat.icon}
                                  <div>
                                    <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
                                    <p className="text-base font-black text-slate-800">{stat.value}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* TOPIC DETAILS */}
                  {resTab === 'details' && selTopic && (
                    <div className="p-5 space-y-4 max-w-xl">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg border">
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Difficulty</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded mt-1 inline-block ${DIFF_STYLE[selTopic.difficulty]}`}>{selTopic.difficulty}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border">
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Importance</p>
                          <p className="text-sm font-bold text-slate-800 mt-1 capitalize">{selTopic.importance === 'must' ? '🔥 Must Do' : selTopic.importance}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border">
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Weightage</p>
                          <p className="text-sm font-bold text-slate-800 mt-1">{selTopic.weightage}%</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border">
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Study Hours</p>
                          <p className="text-sm font-bold text-slate-800 mt-1">{selTopic.studyHours} hrs</p>
                        </div>
                      </div>
                      {selTopic.description && (
                        <div className="bg-slate-50 p-3 rounded-lg border">
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">Description</p>
                          <p className="text-sm text-slate-700">{selTopic.description}</p>
                        </div>
                      )}
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => openEditTopic(selStageId, selSubjectId, selTopic)}><Pencil className="h-3.5 w-3.5" /> Edit Topic Details</Button>
                    </div>
                  )}
                </div>

                {/* Bottom nav */}
                <div className="border-t px-4 py-3 flex items-center justify-between bg-white">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => {
                    const topics = selSubject?.topics || [];
                    const idx = topics.findIndex(t => t.id === selTopicId);
                    if (idx > 0) { setSelTopicId(topics[idx - 1].id); setResTab('videos'); }
                  }} disabled={!selSubject || selSubject.topics.findIndex(t => t.id === selTopicId) === 0}>
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Save className="h-3.5 w-3.5" /> Save as Draft
                    </Button>
                    <Button size="sm" className="gap-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                      const topics = selSubject?.topics || [];
                      const idx = topics.findIndex(t => t.id === selTopicId);
                      if (idx < topics.length - 1) { setSelTopicId(topics[idx + 1].id); setResTab('videos'); }
                    }} disabled={!selSubject || selSubject.topics.findIndex(t => t.id === selTopicId) === (selSubject?.topics.length ?? 0) - 1}>
                      Save & Continue <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 3 — Review & Publish */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-800">Syllabus Ready</p>
              <p className="text-sm text-emerald-700">Review the syllabus below. Publish to make it visible to students instantly.</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Stages', value: doc.tiers.length, color: 'indigo' },
              { label: 'Subjects', value: doc.tiers.reduce((a, t) => a + t.subjects.length, 0), color: 'blue' },
              { label: 'Topics', value: doc.tiers.reduce((a, t) => a + t.subjects.reduce((b, s) => b + s.topics.length, 0), 0), color: 'violet' },
              { label: 'Resources', value: doc.tiers.reduce((a, t) => a + t.subjects.reduce((b, s) => b + s.topics.reduce((c, tp) => c + tp.videos.length + tp.pdfs.length + tp.tests.length, 0), 0), 0), color: 'emerald' },
            ].map(stat => (
              <div key={stat.label} className={`p-4 rounded-xl border bg-${stat.color}-50 border-${stat.color}-200`}>
                <p className={`text-3xl font-black text-${stat.color}-700`}>{stat.value}</p>
                <p className={`text-xs font-semibold text-${stat.color}-600 mt-1`}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {doc.tiers.map((stage, si) => (
              <div key={stage.id} className="border rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 flex items-center gap-3 border-b">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">{si + 1}</span>
                  <span className="font-bold text-slate-800">{stage.name}</span>
                  {stage.duration && <span className="text-xs text-muted-foreground">{stage.duration}</span>}
                  {stage.totalMarks > 0 && <Badge variant="outline" className="text-[10px]">{stage.totalMarks} marks</Badge>}
                  <span className="ml-auto text-xs text-muted-foreground">{stage.subjects.length} subjects</span>
                </div>
                <div className="p-3 space-y-2">
                  {stage.subjects.map(sub => (
                    <div key={sub.id} className="flex items-center gap-3 text-sm">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sub.color }} />
                      <span className="font-semibold text-slate-700">{sub.name}</span>
                      {sub.marks > 0 && <span className="text-xs text-muted-foreground">{sub.marks} marks</span>}
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-indigo-600 font-medium">{sub.topics.length} topics</span>
                      <div className="flex items-center gap-2 ml-auto text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Video className="h-3 w-3 text-blue-400" />{sub.topics.reduce((a, t) => a + t.videos.length, 0)}</span>
                        <span className="flex items-center gap-0.5"><FileText className="h-3 w-3 text-rose-400" />{sub.topics.reduce((a, t) => a + t.pdfs.length, 0)}</span>
                        <span className="flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3 text-emerald-400" />{sub.topics.reduce((a, t) => a + t.tests.length, 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg">
              <RefreshCw className="h-4 w-4" />
              <span>Saved & synced to student pages automatically</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Wizard bottom nav ── */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t">
        <Button variant="outline" onClick={goPrev} disabled={step === 0} className="gap-1"><ChevronLeft className="h-4 w-4" /> Previous</Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1 text-muted-foreground"><Save className="h-4 w-4" /> Save as Draft</Button>
          {step < 3 ? (
            <Button onClick={goNext} className="gap-1 bg-indigo-600 hover:bg-indigo-700">Save & Continue <ChevronRight className="h-4 w-4" /></Button>
          ) : (
            <Button className="gap-1 bg-emerald-600 hover:bg-emerald-700"><Check className="h-4 w-4" /> Publish Syllabus</Button>
          )}
        </div>
      </div>

      {/* ══ MODALS ══ */}

      {/* Stage Modal */}
      <Dialog open={stageModal.open} onOpenChange={o => !o && setStageModal(p => ({ ...p, open: false }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-indigo-700"><GraduationCap className="h-5 w-5" />{stageModal.id ? 'Edit Stage' : 'Add Stage'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs font-semibold">Stage Name *</Label><Input className="mt-1 h-9" placeholder="e.g. Prelims, Mains, Interview" value={stageForm.name} onChange={e => setStageForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-semibold">Duration</Label><Input className="mt-1 h-9" placeholder="e.g. 2 hours" value={stageForm.duration} onChange={e => setStageForm(p => ({ ...p, duration: e.target.value }))} /></div>
              <div><Label className="text-xs font-semibold">Total Marks</Label><Input type="number" className="mt-1 h-9" placeholder="200" value={stageForm.totalMarks} onChange={e => setStageForm(p => ({ ...p, totalMarks: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-semibold">Negative Marking</Label><Input className="mt-1 h-9" placeholder='0.25 or "No"' value={stageForm.negativeMarking} onChange={e => setStageForm(p => ({ ...p, negativeMarking: e.target.value }))} /></div>
              <div className="flex items-end pb-1 gap-2"><Switch checked={stageForm.sectionalCutoff} onCheckedChange={v => setStageForm(p => ({ ...p, sectionalCutoff: v }))} /><Label className="text-xs font-semibold">Sectional Cutoff</Label></div>
            </div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={commitStage} disabled={!stageForm.name.trim()} className="bg-indigo-600 hover:bg-indigo-700">{stageModal.id ? 'Save' : 'Create Stage'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subject Modal */}
      <Dialog open={subjectModal.open} onOpenChange={o => !o && setSubjectModal(p => ({ ...p, open: false }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-blue-700"><BookOpen className="h-5 w-5" />{subjectModal.id ? 'Edit Subject' : 'Add Subject'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs font-semibold">Subject Name *</Label><Input className="mt-1 h-9" placeholder="e.g. Reasoning Ability" value={subjectForm.name} onChange={e => setSubjectForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label className="text-xs font-semibold">Marks Allocated</Label><Input type="number" className="mt-1 h-9" placeholder="e.g. 50" value={subjectForm.marks} onChange={e => setSubjectForm(p => ({ ...p, marks: e.target.value }))} /></div>
            <div><Label className="text-xs font-semibold">Color</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">{THUMB_COLORS.map(c => <button key={c} type="button" style={{ background: c }} onClick={() => setSubjectForm(p => ({ ...p, color: c }))} className={`w-6 h-6 rounded-full transition-all ${subjectForm.color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-70 hover:opacity-100'}`} />)}</div>
            </div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={commitSubject} disabled={!subjectForm.name.trim()} className="bg-blue-600 hover:bg-blue-700">{subjectModal.id ? 'Save' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Topic Modal */}
      <Dialog open={topicModal.open} onOpenChange={o => !o && setTopicModal(p => ({ ...p, open: false }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-slate-700"><Tag className="h-5 w-5 text-indigo-500" />{topicModal.id ? 'Edit Topic' : 'Add Topic'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs font-semibold">Topic Name *</Label><Input className="mt-1 h-9" placeholder="e.g. Syllogism, Coding-Decoding…" value={topicForm.name} onChange={e => setTopicForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs font-semibold">Weightage %</Label><Input type="number" className="mt-1 h-9" value={topicForm.weightage} onChange={e => setTopicForm(p => ({ ...p, weightage: e.target.value }))} /></div>
              <div><Label className="text-xs font-semibold">Study Hours</Label><Input type="number" className="mt-1 h-9" value={topicForm.studyHours} onChange={e => setTopicForm(p => ({ ...p, studyHours: e.target.value }))} /></div>
              <div><Label className="text-xs font-semibold">Difficulty</Label>
                <Select value={topicForm.difficulty} onValueChange={v => setTopicForm(p => ({ ...p, difficulty: v as Difficulty }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="easy">🟢 Easy</SelectItem><SelectItem value="medium">🟡 Medium</SelectItem><SelectItem value="hard">🔴 Hard</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs font-semibold">Importance</Label>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {(['must', 'high', 'medium', 'low'] as const).map(imp => (
                  <button key={imp} type="button" onClick={() => setTopicForm(p => ({ ...p, importance: imp }))}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${topicForm.importance === imp ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                    {imp === 'must' ? '🔥 Must' : imp.charAt(0).toUpperCase() + imp.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div><Label className="text-xs font-semibold">Description (optional)</Label><Textarea className="mt-1 text-sm resize-none" rows={2} placeholder="Brief description of this topic…" value={topicForm.description} onChange={e => setTopicForm(p => ({ ...p, description: e.target.value }))} /></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={commitTopic} disabled={!topicForm.name.trim()} className="bg-indigo-600 hover:bg-indigo-700">{topicModal.id ? 'Save' : 'Add Topic'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={videoModal.open} onOpenChange={o => !o && setVideoModal(p => ({ ...p, open: false }))}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-indigo-700"><Video className="h-5 w-5" />{videoModal.id ? 'Edit Video' : 'Add Video'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs font-semibold">Video Title *</Label><Input className="mt-1 h-9" placeholder="e.g. Logical Reasoning - Part 1: Basics" value={videoForm.title} onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label className="text-xs font-semibold">Subtitle / Description</Label><Input className="mt-1 h-9" placeholder="e.g. Fundamentals of reasoning and analytical thinking" value={videoForm.subtitle} onChange={e => setVideoForm(p => ({ ...p, subtitle: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-semibold">Faculty / Instructor</Label><Input className="mt-1 h-9" placeholder="e.g. Rahul Sharma" value={videoForm.instructor} onChange={e => setVideoForm(p => ({ ...p, instructor: e.target.value }))} /></div>
              <div><Label className="text-xs font-semibold">Duration (mm:ss)</Label><Input className="mt-1 h-9" placeholder="e.g. 31:54" value={videoForm.duration} onChange={e => setVideoForm(p => ({ ...p, duration: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs font-semibold">Video URL</Label><Input className="mt-1 h-9" placeholder="YouTube or embed URL" value={videoForm.url} onChange={e => setVideoForm(p => ({ ...p, url: e.target.value }))} /></div>
            <div><Label className="text-xs font-semibold">Status</Label>
              <div className="flex gap-2 mt-1.5">
                {(['published', 'draft'] as Status[]).map(s => <button key={s} type="button" onClick={() => setVideoForm(p => ({ ...p, status: s }))} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${videoForm.status === s ? STATUS_STYLE[s] + ' ring-1 ring-indigo-300' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>)}
              </div>
            </div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={commitVideo} disabled={!videoForm.title.trim()} className="bg-indigo-600 hover:bg-indigo-700">{videoModal.id ? 'Save' : 'Add Video'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Modal */}
      <Dialog open={pdfModal.open} onOpenChange={o => !o && setPdfModal(p => ({ ...p, open: false }))}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-rose-700"><FileText className="h-5 w-5" />{pdfModal.id ? 'Edit PDF' : 'Add PDF'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs font-semibold">Document Title *</Label><Input className="mt-1 h-9" placeholder="e.g. Logical Reasoning - Class Notes" value={pdfForm.title} onChange={e => setPdfForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label className="text-xs font-semibold">Subtitle</Label><Input className="mt-1 h-9" placeholder="e.g. Complete Theory with Examples" value={pdfForm.subtitle} onChange={e => setPdfForm(p => ({ ...p, subtitle: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs font-semibold">Type</Label>
                <Select value={pdfForm.type} onValueChange={v => setPdfForm(p => ({ ...p, type: v as PdfType }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="notes">Class Notes</SelectItem><SelectItem value="pyq">Previous Year</SelectItem><SelectItem value="formulas">Formulas</SelectItem><SelectItem value="summary">Summary</SelectItem><SelectItem value="practice">Practice Sheet</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs font-semibold">Pages</Label><Input type="number" className="mt-1 h-9" placeholder="42" value={pdfForm.pages} onChange={e => setPdfForm(p => ({ ...p, pages: e.target.value }))} /></div>
              <div><Label className="text-xs font-semibold">File Size</Label><Input className="mt-1 h-9" placeholder="e.g. 2.4 MB" value={pdfForm.fileSize} onChange={e => setPdfForm(p => ({ ...p, fileSize: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs font-semibold">PDF URL / Drive Link</Label><Input className="mt-1 h-9" placeholder="https://…" value={pdfForm.url} onChange={e => setPdfForm(p => ({ ...p, url: e.target.value }))} /></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={commitPdf} disabled={!pdfForm.title.trim()} className="bg-rose-600 hover:bg-rose-700">{pdfModal.id ? 'Save' : 'Add PDF'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Modal */}
      <Dialog open={testModal.open} onOpenChange={o => !o && setTestModal(p => ({ ...p, open: false }))}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-emerald-700"><CheckCircle2 className="h-5 w-5" />{testModal.id ? 'Edit Test' : 'Add Test'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs font-semibold">Test Title *</Label><Input className="mt-1 h-9" placeholder="e.g. Logical Reasoning - Basic Test" value={testForm.title} onChange={e => setTestForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label className="text-xs font-semibold">Subtitle</Label><Input className="mt-1 h-9" placeholder="e.g. Fundamentals and simple patterns" value={testForm.subtitle} onChange={e => setTestForm(p => ({ ...p, subtitle: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-semibold">Type</Label>
                <Select value={testForm.type} onValueChange={v => setTestForm(p => ({ ...p, type: v as TestType }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="basic">Basic</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem><SelectItem value="mock">Mock Test</SelectItem><SelectItem value="sectional">Sectional</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs font-semibold">Test URL / Link</Label><Input className="mt-1 h-9" placeholder="https://…" value={testForm.url} onChange={e => setTestForm(p => ({ ...p, url: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs font-semibold">Questions</Label><Input type="number" className="mt-1 h-9" placeholder="25" value={testForm.questions} onChange={e => setTestForm(p => ({ ...p, questions: e.target.value }))} /></div>
              <div><Label className="text-xs font-semibold">Marks</Label><Input type="number" className="mt-1 h-9" placeholder="25" value={testForm.marks} onChange={e => setTestForm(p => ({ ...p, marks: e.target.value }))} /></div>
              <div><Label className="text-xs font-semibold">Duration</Label><Input className="mt-1 h-9" placeholder="30 mins" value={testForm.duration} onChange={e => setTestForm(p => ({ ...p, duration: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={commitTest} disabled={!testForm.title.trim()} className="bg-emerald-600 hover:bg-emerald-700">{testModal.id ? 'Save' : 'Add Test'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Modal */}
      <Dialog open={!!bulkModal?.open} onOpenChange={o => !o && setBulkModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Import className="h-5 w-5 text-emerald-600" /> Bulk Import Topics</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">Enter topic names — one per line or comma-separated. Each becomes a separate topic.</p>
            <Textarea className="min-h-[140px] text-sm font-mono" placeholder={"Syllogism\nNumber Series\nBlood Relations\n\n— or —\n\nSyllogism, Number Series, Blood Relations"} value={bulkText} onChange={e => setBulkText(e.target.value)} />
            <p className="text-xs text-muted-foreground">{bulkText.split(/[\n,]/).filter(s => s.trim()).length} topics will be added</p>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={commitBulk} disabled={!bulkText.trim()} className="bg-emerald-600 hover:bg-emerald-700 gap-1"><Import className="h-4 w-4" /> Import Topics</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
