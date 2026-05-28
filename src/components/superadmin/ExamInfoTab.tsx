/**
 * ExamInfoTab — Static exam information manager
 * Sections: Previous Year Cutoffs, Exam Pattern, How to Start, Important Links, FAQs
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronUp, ExternalLink, Info,
  HelpCircle, ListOrdered, TrendingUp, BookOpen, Link, Save, CheckCircle2,
  BarChart3, Target, Award,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Cutoff {
  id: string; year: string; category: string; cutoff: number; vacancies: number; notes?: string;
}
interface FAQ { id: string; question: string; answer: string; open?: boolean; }
interface ImportantLink { id: string; label: string; url: string; type: 'official' | 'notification' | 'admit' | 'result' | 'other'; }
interface Step { id: string; title: string; description: string; }

interface ExamInfo {
  cutoffs: Cutoff[];
  examPattern: string;
  howToStart: Step[];
  importantLinks: ImportantLink[];
  faqs: FAQ[];
  overview: string;
}

const INFO_KEY = (examId: string) => `examInfo_${examId}`;

function loadInfo(examId: string): ExamInfo {
  try {
    const raw = localStorage.getItem(INFO_KEY(examId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    cutoffs: [
      { id: 'c1', year: '2024', category: 'General', cutoff: 67.25, vacancies: 3720, notes: 'Final merit list' },
      { id: 'c2', year: '2024', category: 'OBC', cutoff: 62.50, vacancies: 0, notes: 'Prelims cutoff' },
      { id: 'c3', year: '2023', category: 'General', cutoff: 71.00, vacancies: 2000 },
    ],
    examPattern: '',
    howToStart: [
      { id: 's1', title: 'Understand the Exam Pattern', description: 'Study the complete pattern including stages, marks, and time allocation.' },
      { id: 's2', title: 'Download Official Syllabus', description: 'Get the official syllabus and mark high-weightage topics.' },
      { id: 's3', title: 'Create a Study Schedule', description: 'Divide your preparation across 3-6 months with daily targets.' },
      { id: 's4', title: 'Start with Mock Tests', description: 'Take full-length mocks regularly to track your progress.' },
    ],
    importantLinks: [
      { id: 'l1', label: 'Official Website', url: 'https://sbi.co.in', type: 'official' },
      { id: 'l2', label: 'Official Notification', url: 'https://sbi.co.in/careers', type: 'notification' },
    ],
    faqs: [
      { id: 'f1', question: 'How many stages does SBI PO have?', answer: 'SBI PO has 3 stages: Prelims, Mains, and Interview (Group Exercise + Personal Interview).', open: false },
      { id: 'f2', question: 'Is there negative marking?', answer: 'Yes, 0.25 marks are deducted for each wrong answer in Prelims and Mains (Objective part).', open: false },
    ],
    overview: '',
  };
}

function saveInfo(examId: string, info: ExamInfo) {
  localStorage.setItem(INFO_KEY(examId), JSON.stringify(info));
}

const LINK_TYPE_STYLE: Record<string, string> = {
  official: 'bg-blue-100 text-blue-700',
  notification: 'bg-amber-100 text-amber-700',
  admit: 'bg-violet-100 text-violet-700',
  result: 'bg-emerald-100 text-emerald-700',
  other: 'bg-slate-100 text-slate-600',
};

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props { examId: string; examName: string; }

const ExamInfoTab: React.FC<Props> = ({ examId, examName }) => {
  const [info, setInfo] = useState<ExamInfo>(() => loadInfo(examId));
  const [section, setSection] = useState<'cutoffs' | 'pattern' | 'steps' | 'links' | 'faqs'>('cutoffs');
  const [saved, setSaved] = useState(false);

  // Cutoff modal
  const [cutoffDialog, setCutoffDialog] = useState(false);
  const [editingCutoffId, setEditingCutoffId] = useState<string | null>(null);
  const [cutoffForm, setCutoffForm] = useState({ year: '', category: 'General', cutoff: '', vacancies: '', notes: '' });

  // Link modal
  const [linkDialog, setLinkDialog] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkForm, setLinkForm] = useState({ label: '', url: '', type: 'official' as ImportantLink['type'] });

  // Step modal
  const [stepDialog, setStepDialog] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [stepForm, setStepForm] = useState({ title: '', description: '' });

  // FAQ
  const [faqDialog, setFaqDialog] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '' });

  const mutate = (fn: (d: ExamInfo) => ExamInfo) => {
    const next = fn(info);
    setInfo(next);
    saveInfo(examId, next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;

  // ── Cutoff handlers ───────────────────────────────────────────────────────────
  const openAddCutoff = () => { setEditingCutoffId(null); setCutoffForm({ year: new Date().getFullYear().toString(), category: 'General', cutoff: '', vacancies: '', notes: '' }); setCutoffDialog(true); };
  const openEditCutoff = (c: Cutoff) => { setEditingCutoffId(c.id); setCutoffForm({ year: c.year, category: c.category, cutoff: String(c.cutoff), vacancies: String(c.vacancies), notes: c.notes ?? '' }); setCutoffDialog(true); };
  const saveCutoff = () => {
    const item: Cutoff = { id: editingCutoffId || uid(), year: cutoffForm.year, category: cutoffForm.category, cutoff: +cutoffForm.cutoff || 0, vacancies: +cutoffForm.vacancies || 0, notes: cutoffForm.notes };
    mutate(d => ({ ...d, cutoffs: editingCutoffId ? d.cutoffs.map(c => c.id === editingCutoffId ? item : c) : [...d.cutoffs, item] }));
    setCutoffDialog(false);
  };
  const deleteCutoff = (id: string) => mutate(d => ({ ...d, cutoffs: d.cutoffs.filter(c => c.id !== id) }));

  // ── Link handlers ────────────────────────────────────────────────────────────
  const openAddLink = () => { setEditingLinkId(null); setLinkForm({ label: '', url: '', type: 'official' }); setLinkDialog(true); };
  const openEditLink = (l: ImportantLink) => { setEditingLinkId(l.id); setLinkForm({ label: l.label, url: l.url, type: l.type }); setLinkDialog(true); };
  const saveLink = () => {
    const item: ImportantLink = { id: editingLinkId || uid(), ...linkForm };
    mutate(d => ({ ...d, importantLinks: editingLinkId ? d.importantLinks.map(l => l.id === editingLinkId ? item : l) : [...d.importantLinks, item] }));
    setLinkDialog(false);
  };
  const deleteLink = (id: string) => mutate(d => ({ ...d, importantLinks: d.importantLinks.filter(l => l.id !== id) }));

  // ── Step handlers ────────────────────────────────────────────────────────────
  const openAddStep = () => { setEditingStepId(null); setStepForm({ title: '', description: '' }); setStepDialog(true); };
  const openEditStep = (s: Step) => { setEditingStepId(s.id); setStepForm({ title: s.title, description: s.description }); setStepDialog(true); };
  const saveStep = () => {
    const item: Step = { id: editingStepId || uid(), ...stepForm };
    mutate(d => ({ ...d, howToStart: editingStepId ? d.howToStart.map(s => s.id === editingStepId ? item : s) : [...d.howToStart, item] }));
    setStepDialog(false);
  };
  const deleteStep = (id: string) => mutate(d => ({ ...d, howToStart: d.howToStart.filter(s => s.id !== id) }));
  const moveStep = (id: string, dir: 'up' | 'down') => {
    mutate(d => {
      const steps = [...d.howToStart];
      const idx = steps.findIndex(s => s.id === id);
      if (dir === 'up' && idx > 0) [steps[idx - 1], steps[idx]] = [steps[idx], steps[idx - 1]];
      if (dir === 'down' && idx < steps.length - 1) [steps[idx], steps[idx + 1]] = [steps[idx + 1], steps[idx]];
      return { ...d, howToStart: steps };
    });
  };

  // ── FAQ handlers ─────────────────────────────────────────────────────────────
  const openAddFaq = () => { setEditingFaqId(null); setFaqForm({ question: '', answer: '' }); setFaqDialog(true); };
  const openEditFaq = (f: FAQ) => { setEditingFaqId(f.id); setFaqForm({ question: f.question, answer: f.answer }); setFaqDialog(true); };
  const saveFaq = () => {
    const item: FAQ = { id: editingFaqId || uid(), ...faqForm, open: false };
    mutate(d => ({ ...d, faqs: editingFaqId ? d.faqs.map(f => f.id === editingFaqId ? item : f) : [...d.faqs, item] }));
    setFaqDialog(false);
  };
  const deleteFaq = (id: string) => mutate(d => ({ ...d, faqs: d.faqs.filter(f => f.id !== id) }));
  const toggleFaq = (id: string) => mutate(d => ({ ...d, faqs: d.faqs.map(f => f.id === id ? { ...f, open: !f.open } : f) }));

  const sections = [
    { id: 'cutoffs', label: 'Previous Year Cutoffs', icon: <BarChart3 className="h-4 w-4" />, count: info.cutoffs.length },
    { id: 'pattern', label: 'Exam Pattern', icon: <Target className="h-4 w-4" /> },
    { id: 'steps', label: 'How to Start', icon: <ListOrdered className="h-4 w-4" />, count: info.howToStart.length },
    { id: 'links', label: 'Important Links', icon: <Link className="h-4 w-4" />, count: info.importantLinks.length },
    { id: 'faqs', label: 'FAQs', icon: <HelpCircle className="h-4 w-4" />, count: info.faqs.length },
  ] as const;

  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <div className="w-48 shrink-0 space-y-1">
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id as any)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${section === s.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
            {s.icon}
            <span className="flex-1">{s.label}</span>
            {'count' in s && (s as any).count > 0 && <span className={`text-[10px] px-1.5 rounded-full font-bold ${section === s.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>{(s as any).count}</span>}
          </button>
        ))}
        {saved && <div className="flex items-center gap-1 text-xs text-emerald-600 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg mt-2"><CheckCircle2 className="h-3.5 w-3.5" /> Saved!</div>}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 bg-white border rounded-xl p-5">

        {/* CUTOFFS */}
        {section === 'cutoffs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Previous Year Cutoffs</h3>
                <p className="text-xs text-muted-foreground">Cutoff marks and vacancy data for past years</p>
              </div>
              <Button size="sm" className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700" onClick={openAddCutoff}><Plus className="h-3.5 w-3.5" /> Add Cutoff</Button>
            </div>
            {info.cutoffs.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <BarChart3 className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No cutoff data yet</p>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Year</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Category</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Cutoff Marks</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Vacancies</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Notes</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {info.cutoffs.sort((a, b) => +b.year - +a.year).map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3"><span className="font-bold text-slate-800">{c.year}</span></td>
                        <td className="px-4 py-3"><Badge variant="outline" className="text-[11px]">{c.category}</Badge></td>
                        <td className="px-4 py-3"><span className="font-black text-indigo-700 text-base">{c.cutoff}</span></td>
                        <td className="px-4 py-3"><span className="font-semibold text-slate-700">{c.vacancies > 0 ? c.vacancies.toLocaleString() : '—'}</span></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{c.notes || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => openEditCutoff(c)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600"><Pencil className="h-3.5 w-3.5" /></button>
                            <button onClick={() => deleteCutoff(c.id)} className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* EXAM PATTERN */}
        {section === 'pattern' && (
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-slate-800">Exam Pattern Overview</h3>
              <p className="text-xs text-muted-foreground">Describe the exam structure, stages, marking scheme, etc.</p>
            </div>
            <Textarea
              className="min-h-[280px] text-sm font-mono resize-none"
              placeholder={`Example:\n\n## Exam Structure\n\nSBI PO consists of 3 stages:\n\n**Stage 1 — Prelims (Online)**\n• Duration: 1 hour\n• Total Marks: 100\n• Sections: English (30Q), Quantitative Aptitude (35Q), Reasoning (35Q)\n• Negative Marking: -0.25 per wrong answer\n\n**Stage 2 — Mains (Online)**\n• Duration: 3 hours + 30 mins (Descriptive)\n• Total Marks: 200 + 50 (Descriptive)\n...`}
              value={info.examPattern}
              onChange={e => mutate(d => ({ ...d, examPattern: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Supports plain text and markdown formatting. Visible on student exam info page.</p>
          </div>
        )}

        {/* HOW TO START */}
        {section === 'steps' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">How to Start Preparation</h3>
                <p className="text-xs text-muted-foreground">Step-by-step guide shown to students on the exam page</p>
              </div>
              <Button size="sm" className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700" onClick={openAddStep}><Plus className="h-3.5 w-3.5" /> Add Step</Button>
            </div>
            {info.howToStart.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <ListOrdered className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No steps yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {info.howToStart.map((step, i) => (
                  <div key={step.id} className="flex items-start gap-3 p-3 border rounded-xl bg-white hover:shadow-sm transition-shadow group">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-700 text-sm shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{step.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => moveStep(step.id, 'up')} disabled={i === 0} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                      <button onClick={() => moveStep(step.id, 'down')} disabled={i === info.howToStart.length - 1} className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                      <button onClick={() => openEditStep(step)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteStep(step.id)} className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* IMPORTANT LINKS */}
        {section === 'links' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Important Links</h3>
                <p className="text-xs text-muted-foreground">Official website, notifications, admit cards, results</p>
              </div>
              <Button size="sm" className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700" onClick={openAddLink}><Plus className="h-3.5 w-3.5" /> Add Link</Button>
            </div>
            {info.importantLinks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <Link className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No links yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {info.importantLinks.map(link => (
                  <div key={link.id} className="flex items-center gap-3 p-3 border rounded-xl hover:shadow-sm transition-shadow group">
                    <span className={`text-[11px] px-2 py-1 rounded font-semibold shrink-0 capitalize ${LINK_TYPE_STYLE[link.type]}`}>{link.type}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800">{link.label}</p>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline truncate block">{link.url}</a>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600"><ExternalLink className="h-3.5 w-3.5" /></a>
                      <button onClick={() => openEditLink(link)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteLink(link.id)} className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAQs */}
        {section === 'faqs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">FAQs</h3>
                <p className="text-xs text-muted-foreground">Common student questions shown on the exam page</p>
              </div>
              <Button size="sm" className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700" onClick={openAddFaq}><Plus className="h-3.5 w-3.5" /> Add FAQ</Button>
            </div>
            {info.faqs.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <HelpCircle className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No FAQs yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {info.faqs.map((faq, i) => (
                  <div key={faq.id} className="border rounded-xl overflow-hidden">
                    <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50/60 transition-colors" onClick={() => toggleFaq(faq.id)}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-indigo-600 w-5">{i + 1}</span>
                        <span className="font-semibold text-sm text-slate-800">{faq.question}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={e => { e.stopPropagation(); openEditFaq(faq); }} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600"><Pencil className="h-3 w-3" /></button>
                        <button onClick={e => { e.stopPropagation(); deleteFaq(faq.id); }} className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                        {faq.open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </div>
                    </button>
                    {faq.open && (
                      <div className="px-4 pb-4 pt-1 bg-slate-50/60 border-t">
                        <p className="text-sm text-slate-700 pl-8">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Dialogs ── */}

      {/* Cutoff */}
      <Dialog open={cutoffDialog} onOpenChange={setCutoffDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingCutoffId ? 'Edit' : 'Add'} Cutoff Data</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-semibold">Year *</Label><Input className="mt-1 h-9" value={cutoffForm.year} onChange={e => setCutoffForm(p => ({ ...p, year: e.target.value }))} placeholder="2024" /></div>
              <div><Label className="text-xs font-semibold">Category *</Label><Input className="mt-1 h-9" value={cutoffForm.category} onChange={e => setCutoffForm(p => ({ ...p, category: e.target.value }))} placeholder="General, OBC, SC…" /></div>
              <div><Label className="text-xs font-semibold">Cutoff Marks *</Label><Input type="number" step="0.01" className="mt-1 h-9" value={cutoffForm.cutoff} onChange={e => setCutoffForm(p => ({ ...p, cutoff: e.target.value }))} /></div>
              <div><Label className="text-xs font-semibold">Vacancies</Label><Input type="number" className="mt-1 h-9" value={cutoffForm.vacancies} onChange={e => setCutoffForm(p => ({ ...p, vacancies: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs font-semibold">Notes (optional)</Label><Input className="mt-1 h-9" value={cutoffForm.notes} onChange={e => setCutoffForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. Prelims cutoff" /></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={saveCutoff} disabled={!cutoffForm.year || !cutoffForm.category} className="bg-indigo-600 hover:bg-indigo-700">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link */}
      <Dialog open={linkDialog} onOpenChange={setLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingLinkId ? 'Edit' : 'Add'} Important Link</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs font-semibold">Label *</Label><Input className="mt-1 h-9" value={linkForm.label} onChange={e => setLinkForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Official Notification" /></div>
            <div><Label className="text-xs font-semibold">URL *</Label><Input className="mt-1 h-9" value={linkForm.url} onChange={e => setLinkForm(p => ({ ...p, url: e.target.value }))} placeholder="https://…" /></div>
            <div><Label className="text-xs font-semibold">Type</Label>
              <div className="flex gap-2 flex-wrap mt-1.5">
                {(['official', 'notification', 'admit', 'result', 'other'] as const).map(t => (
                  <button key={t} onClick={() => setLinkForm(p => ({ ...p, type: t }))} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all capitalize ${linkForm.type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>{t}</button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={saveLink} disabled={!linkForm.label || !linkForm.url} className="bg-indigo-600 hover:bg-indigo-700">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step */}
      <Dialog open={stepDialog} onOpenChange={setStepDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingStepId ? 'Edit' : 'Add'} Step</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs font-semibold">Step Title *</Label><Input className="mt-1 h-9" value={stepForm.title} onChange={e => setStepForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Understand the Exam Pattern" /></div>
            <div><Label className="text-xs font-semibold">Description</Label><Textarea className="mt-1 resize-none" rows={3} value={stepForm.description} onChange={e => setStepForm(p => ({ ...p, description: e.target.value }))} /></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={saveStep} disabled={!stepForm.title.trim()} className="bg-indigo-600 hover:bg-indigo-700">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ */}
      <Dialog open={faqDialog} onOpenChange={setFaqDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingFaqId ? 'Edit' : 'Add'} FAQ</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs font-semibold">Question *</Label><Input className="mt-1 h-9" value={faqForm.question} onChange={e => setFaqForm(p => ({ ...p, question: e.target.value }))} /></div>
            <div><Label className="text-xs font-semibold">Answer *</Label><Textarea className="mt-1 resize-none" rows={4} value={faqForm.answer} onChange={e => setFaqForm(p => ({ ...p, answer: e.target.value }))} /></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={saveFaq} disabled={!faqForm.question.trim() || !faqForm.answer.trim()} className="bg-indigo-600 hover:bg-indigo-700">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamInfoTab;
