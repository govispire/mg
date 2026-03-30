import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen, ChevronDown, ChevronRight, ChevronUp,
  Plus, Trash2, Edit2, Save, X, Check, GraduationCap,
  Clock, Target, AlertCircle, Layers, FileText, Search,
  Building2, Settings, Eye, AlertTriangle
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { allSyllabusData, ExamSyllabusConfig, TierConfig, SubjectConfig, TopicConfig } from '@/data/syllabusData';

// ─── Types ─────────────────────────────────────────────────────────────────
type SidebarSection = 'exams' | 'tiers' | 'subjects' | 'topics';

interface EditState {
  section: 'exam' | 'tier' | 'subject' | 'topic' | null;
  id: string;
}

// ─── Local editable state seeded from syllabusData ──────────────────────────
type MutableSyllabusData = Record<string, ExamSyllabusConfig>;

// ─── Component ──────────────────────────────────────────────────────────────
const SyllabusManager = () => {
  const [data, setData] = useState<MutableSyllabusData>(() =>
    JSON.parse(JSON.stringify(allSyllabusData))
  );

  const [activeSection, setActiveSection] = useState<SidebarSection>('exams');
  const [selectedExamId, setSelectedExamId] = useState<string>(() => Object.keys(allSyllabusData)[0]);
  const [selectedTierId, setSelectedTierId] = useState<string>(
    () => Object.values(allSyllabusData)[0]?.tiers[0]?.id || ''
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editing, setEditing] = useState<EditState>({ section: null, id: '' });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ label: string; onConfirm: () => void } | null>(null);

  // Form state
  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});

  const selectedExam = data[selectedExamId];
  const selectedTier = selectedExam?.tiers.find(t => t.id === selectedTierId) || selectedExam?.tiers[0];
  const selectedSubject = selectedTier?.subjects.find(s => s.id === selectedSubjectId);

  // Filtered exams
  const filteredExams = useMemo(() => {
    const entries = Object.entries(data);
    if (!searchQuery) return entries;
    return entries.filter(([, e]) =>
      e.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Confirmation-gated delete
  const requestDelete = (label: string, onConfirm: () => void) => {
    setDeleteConfirm({ label, onConfirm });
  };

  const startEdit = (section: EditState['section'], id: string, initialValues: Record<string, string | number | boolean>) => {
    setEditing({ section, id });
    setFormValues(initialValues);
  };

  const cancelEdit = () => {
    setEditing({ section: null, id: '' });
    setFormValues({});
  };

  const saveExamMeta = () => {
    setData(prev => ({
      ...prev,
      [selectedExamId]: {
        ...prev[selectedExamId],
        fullName: String(formValues.fullName || prev[selectedExamId].fullName),
        stages: String(formValues.stages || prev[selectedExamId].stages),
        examDate: String(formValues.examDate || prev[selectedExamId].examDate),
      }
    }));
    cancelEdit();
    showToast('Exam details saved');
  };

  const saveTierMeta = () => {
    setData(prev => {
      const exam = { ...prev[selectedExamId] };
      exam.tiers = exam.tiers.map(t =>
        t.id === selectedTier?.id ? {
          ...t,
          duration: String(formValues.duration ?? t.duration),
          totalMarks: Number(formValues.totalMarks ?? t.totalMarks),
          negativeMarking: String(formValues.negativeMarking ?? t.negativeMarking),
          sectionalCutoff: Boolean(formValues.sectionalCutoff ?? t.sectionalCutoff),
        } : t
      );
      return { ...prev, [selectedExamId]: exam };
    });
    cancelEdit();
    showToast('Tier settings saved');
  };

  const saveSubjectMeta = () => {
    setData(prev => {
      const exam = { ...prev[selectedExamId] };
      exam.tiers = exam.tiers.map(t =>
        t.id === selectedTier?.id ? {
          ...t,
          subjects: t.subjects.map(s =>
            s.id === selectedSubjectId ? {
              ...s,
              name: String(formValues.name ?? s.name),
              marks: Number(formValues.marks ?? s.marks),
            } : s
          )
        } : t
      );
      return { ...prev, [selectedExamId]: exam };
    });
    cancelEdit();
    showToast('Subject saved');
  };

  const saveTopicMeta = (topicId: string) => {
    setData(prev => {
      const exam = { ...prev[selectedExamId] };
      exam.tiers = exam.tiers.map(t =>
        t.id === selectedTier?.id ? {
          ...t,
          subjects: t.subjects.map(s =>
            s.id === selectedSubjectId ? {
              ...s,
              topics: s.topics.map(tp =>
                tp.id === topicId ? {
                  ...tp,
                  name: String(formValues[`name_${topicId}`] ?? tp.name),
                } : tp
              )
            } : s
          )
        } : t
      );
      return { ...prev, [selectedExamId]: exam };
    });
    cancelEdit();
    showToast('Topic saved');
  };

  const addTopic = () => {
    const name = String(formValues.newTopicName || '').trim();
    if (!name) return;
    const newTopic: TopicConfig = {
      id: `topic-${Date.now()}`,
      name,
      progress: 0,
      videos: [],
      pdfs: [],
      tests: [],
    };
    setData(prev => {
      const exam = { ...prev[selectedExamId] };
      exam.tiers = exam.tiers.map(t =>
        t.id === selectedTier?.id ? {
          ...t,
          subjects: t.subjects.map(s =>
            s.id === selectedSubjectId ? { ...s, topics: [...s.topics, newTopic] } : s
          )
        } : t
      );
      return { ...prev, [selectedExamId]: exam };
    });
    setFormValues(prev => ({ ...prev, newTopicName: '' }));
    showToast(`Topic "${name}" added`);
  };

  const removeTopic = (topicId: string) => {
    setData(prev => {
      const exam = { ...prev[selectedExamId] };
      exam.tiers = exam.tiers.map(t =>
        t.id === selectedTier?.id ? {
          ...t,
          subjects: t.subjects.map(s =>
            s.id === selectedSubjectId ? { ...s, topics: s.topics.filter(tp => tp.id !== topicId) } : s
          )
        } : t
      );
      return { ...prev, [selectedExamId]: exam };
    });
    showToast('Topic removed', 'error');
  };

  const addSubject = () => {
    const name = String(formValues.newSubjectName || '').trim();
    if (!name || !selectedTier) return;
    const newSub: SubjectConfig = {
      id: `subject-${Date.now()}`,
      name,
      marks: 0,
      iconName: 'BookOpen',
      iconBg: 'bg-blue-500',
      topics: [],
    };
    setData(prev => {
      const exam = { ...prev[selectedExamId] };
      exam.tiers = exam.tiers.map(t =>
        t.id === selectedTier.id ? { ...t, subjects: [...t.subjects, newSub] } : t
      );
      return { ...prev, [selectedExamId]: exam };
    });
    setFormValues(prev => ({ ...prev, newSubjectName: '' }));
    showToast(`Subject "${name}" added`);
  };

  const addTier = () => {
    const name = String(formValues.newTierName || '').trim();
    if (!name) return;
    const newTier: TierConfig = {
      id: `tier-${Date.now()}`,
      name,
      duration: '60 minutes',
      totalMarks: 100,
      negativeMarking: '0.25 marks per wrong answer',
      sectionalCutoff: false,
      subjects: [],
    };
    setData(prev => {
      const exam = { ...prev[selectedExamId] };
      exam.tiers = [...exam.tiers, newTier];
      return { ...prev, [selectedExamId]: exam };
    });
    setFormValues(prev => ({ ...prev, newTierName: '' }));
    showToast(`Tier "${name}" added`);
  };

  const removeTier = (tierId: string) => {
    setData(prev => {
      const exam = { ...prev[selectedExamId] };
      exam.tiers = exam.tiers.filter(t => t.id !== tierId);
      return { ...prev, [selectedExamId]: exam };
    });
    if (selectedTierId === tierId) setSelectedTierId('');
    showToast('Tier removed', 'error');
  };

  const removeSubject = (subjectId: string) => {
    setData(prev => {
      const exam = { ...prev[selectedExamId] };
      exam.tiers = exam.tiers.map(t =>
        t.id === selectedTier?.id ? { ...t, subjects: t.subjects.filter(s => s.id !== subjectId) } : t
      );
      return { ...prev, [selectedExamId]: exam };
    });
    if (selectedSubjectId === subjectId) setSelectedSubjectId('');
    showToast('Subject removed', 'error');
  };

  // ─── Resource helpers ─────────────────────────────────────────────────────
  const addVideo = (topicId: string) => {
    const title = String(formValues[`v_title_${topicId}`] || '').trim();
    if (!title) return;
    const newVideo = {
      id: `video-${Date.now()}`,
      title,
      instructor: String(formValues[`v_instructor_${topicId}`] || 'PrepSmart'),
      duration: String(formValues[`v_duration_${topicId}`] || '10 min'),
      rating: 4.5,
      completed: false,
    };
    setData(prev => {
      const exam = { ...prev[selectedExamId] };
      exam.tiers = exam.tiers.map(t =>
        t.id === selectedTier?.id ? {
          ...t,
          subjects: t.subjects.map(s =>
            s.id === selectedSubjectId ? {
              ...s,
              topics: s.topics.map(tp =>
                tp.id === topicId ? { ...tp, videos: [...tp.videos, newVideo] } : tp
              )
            } : s
          )
        } : t
      );
      return { ...prev, [selectedExamId]: exam };
    });
    setFormValues(p => ({ ...p, [`v_title_${topicId}`]: '', [`v_instructor_${topicId}`]: '', [`v_duration_${topicId}`]: '' }));
    showToast(`Video "${title}" added`);
  };

  const removeVideo = (topicId: string, videoId: string) => {
    setData(prev => {
      const exam = { ...prev[selectedExamId] };
      exam.tiers = exam.tiers.map(t =>
        t.id === selectedTier?.id ? {
          ...t,
          subjects: t.subjects.map(s =>
            s.id === selectedSubjectId ? {
              ...s,
              topics: s.topics.map(tp =>
                tp.id === topicId ? { ...tp, videos: tp.videos.filter(v => v.id !== videoId) } : tp
              )
            } : s
          )
        } : t
      );
      return { ...prev, [selectedExamId]: exam };
    });
  };

  const addPdf = (topicId: string) => {
    const title = String(formValues[`p_title_${topicId}`] || '').trim();
    if (!title) return;
    const newPdf = {
      id: `pdf-${Date.now()}`,
      title,
      type: (formValues[`p_type_${topicId}`] as 'notes' | 'pyq' | 'formulas' | 'summary') || 'notes',
      pages: Number(formValues[`p_pages_${topicId}`] || 10),
    };
    setData(prev => {
      const exam = { ...prev[selectedExamId] };
      exam.tiers = exam.tiers.map(t =>
        t.id === selectedTier?.id ? {
          ...t,
          subjects: t.subjects.map(s =>
            s.id === selectedSubjectId ? {
              ...s,
              topics: s.topics.map(tp =>
                tp.id === topicId ? { ...tp, pdfs: [...tp.pdfs, newPdf] } : tp
              )
            } : s
          )
        } : t
      );
      return { ...prev, [selectedExamId]: exam };
    });
    setFormValues(p => ({ ...p, [`p_title_${topicId}`]: '', [`p_pages_${topicId}`]: '' }));
    showToast(`PDF "${title}" added`);
  };

  const removePdf = (topicId: string, pdfId: string) => {
    setData(prev => {
      const exam = { ...prev[selectedExamId] };
      exam.tiers = exam.tiers.map(t =>
        t.id === selectedTier?.id ? {
          ...t,
          subjects: t.subjects.map(s =>
            s.id === selectedSubjectId ? {
              ...s,
              topics: s.topics.map(tp =>
                tp.id === topicId ? { ...tp, pdfs: tp.pdfs.filter(p => p.id !== pdfId) } : tp
              )
            } : s
          )
        } : t
      );
      return { ...prev, [selectedExamId]: exam };
    });
  };

  const addTest = (topicId: string) => {
    const title = String(formValues[`t_title_${topicId}`] || '').trim();
    if (!title) return;
    const newTest = {
      id: `test-${Date.now()}`,
      title,
      questions: Number(formValues[`t_questions_${topicId}`] || 20),
      difficulty: (formValues[`t_difficulty_${topicId}`] as 'easy' | 'medium' | 'hard') || 'medium',
      duration: String(formValues[`t_duration_${topicId}`] || '20 min'),
    };
    setData(prev => {
      const exam = { ...prev[selectedExamId] };
      exam.tiers = exam.tiers.map(t =>
        t.id === selectedTier?.id ? {
          ...t,
          subjects: t.subjects.map(s =>
            s.id === selectedSubjectId ? {
              ...s,
              topics: s.topics.map(tp =>
                tp.id === topicId ? { ...tp, tests: [...tp.tests, newTest] } : tp
              )
            } : s
          )
        } : t
      );
      return { ...prev, [selectedExamId]: exam };
    });
    setFormValues(p => ({ ...p, [`t_title_${topicId}`]: '', [`t_questions_${topicId}`]: '', [`t_duration_${topicId}`]: '' }));
    showToast(`Test "${title}" added`);
  };

  const removeTest = (topicId: string, testId: string) => {
    setData(prev => {
      const exam = { ...prev[selectedExamId] };
      exam.tiers = exam.tiers.map(t =>
        t.id === selectedTier?.id ? {
          ...t,
          subjects: t.subjects.map(s =>
            s.id === selectedSubjectId ? {
              ...s,
              topics: s.topics.map(tp =>
                tp.id === topicId ? { ...tp, tests: tp.tests.filter(tt => tt.id !== testId) } : tp
              )
            } : s
          )
        } : t
      );
      return { ...prev, [selectedExamId]: exam };
    });
  };

  // Track which resource tab is open per topic
  const [resourceTab, setResourceTab] = useState<Record<string, 'videos' | 'pdfs' | 'tests'>>({});
  const getResourceTab = (topicId: string) => resourceTab[topicId] || 'videos';

  // ─── Sidebar nav items ───────────────────────────────────────────────────
  const sidebarItems: { key: SidebarSection; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'exams', label: 'Exam List', icon: <GraduationCap size={16} />, desc: 'All exams & meta' },
    { key: 'tiers', label: 'Tiers / Stages', icon: <Layers size={16} />, desc: 'Prelims, Mains, etc.' },
    { key: 'subjects', label: 'Subjects', icon: <BookOpen size={16} />, desc: 'Subject config' },
    { key: 'topics', label: 'Topics', icon: <FileText size={16} />, desc: 'Topic management' },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full min-h-screen bg-muted/20">

      {/* ── Left Sidebar ── */}
      <aside className="w-60 bg-white border-r flex flex-col shrink-0">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#003366] flex items-center justify-center">
              <BookOpen size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Syllabus Manager</p>
              <p className="text-[10px] text-muted-foreground">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Exam quick-select */}
        <div className="p-3 border-b">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Current Exam</p>
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search exams…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 text-xs border rounded-md bg-muted/30 focus:outline-none focus:ring-1 focus:ring-[#003366]"
            />
          </div>
          <div className="mt-2 space-y-0.5 max-h-40 overflow-y-auto">
            {filteredExams.map(([id, exam]) => (
              <button
                key={id}
                onClick={() => {
                  const firstTierId = data[id]?.tiers[0]?.id || '';
                  setSelectedExamId(id);
                  setSelectedTierId(firstTierId);
                  setSelectedSubjectId('');
                }}
                className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedExamId === id
                  ? 'bg-[#003366] text-white'
                  : 'hover:bg-muted/50 text-foreground'
                  }`}
              >
                <span className="block truncate">{exam.examName}</span>
                <span className={`text-[10px] ${selectedExamId === id ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {exam.tiers.length} tier{exam.tiers.length !== 1 ? 's' : ''}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Section nav */}
        <nav className="flex-1 p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Manage</p>
          <ul className="space-y-1">
            {sidebarItems.map(item => (
              <li key={item.key}>
                <button
                  onClick={() => setActiveSection(item.key)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${activeSection === item.key
                    ? 'bg-[#003366]/10 text-[#003366] font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                >
                  <span>{item.icon}</span>
                  <div className="text-left">
                    <span className="block">{item.label}</span>
                  </div>
                  {activeSection === item.key && <ChevronRight size={12} className="ml-auto" />}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-t">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs gap-1.5"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye size={13} />
            {showPreview ? 'Hide' : 'Preview Changes'}
          </Button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-foreground">
              {sidebarItems.find(s => s.key === activeSection)?.label}
            </h1>
            <p className="text-xs text-muted-foreground">
              Editing: <span className="font-semibold">{selectedExam?.examName}</span>
              {selectedTier && <> › <span className="font-semibold">{selectedTier.name}</span></>}
              {selectedSubject && <> › <span className="font-semibold">{selectedSubject.name}</span></>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {Object.keys(data).length} Exams
            </Badge>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mx-6 mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${toast.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
            {toast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
            {toast.msg}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ──────────────────────────────────────────────────────────────
              SECTION: Exam List
          ────────────────────────────────────────────────────────────── */}
          {activeSection === 'exams' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                All exams in the syllabus database. Click a card to edit its metadata.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(data).map(([id, exam]) => (
                  <Card
                    key={id}
                    className={`cursor-pointer border transition-all hover:shadow-sm ${selectedExamId === id ? 'border-[#003366] ring-1 ring-[#003366]' : ''}`}
                    onClick={() => setSelectedExamId(id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <img src={exam.logo} alt={exam.examName} className="w-10 h-10 object-contain flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{exam.examName}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{exam.fullName}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-[10px]">{exam.stages}</Badge>
                            <span className="text-[10px] text-muted-foreground">{exam.examDate}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {exam.tiers.length} tier{exam.tiers.length !== 1 ? 's' : ''} · {exam.tiers.reduce((s, t) => s + t.subjects.length, 0)} subjects
                          </p>
                        </div>
                        {selectedExamId === id && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              startEdit('exam', id, {
                                fullName: exam.fullName,
                                stages: exam.stages,
                                examDate: exam.examDate,
                              });
                            }}
                            className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                      </div>

                      {/* Inline edit form */}
                      {editing.section === 'exam' && editing.id === id && (
                        <div className="mt-3 pt-3 border-t space-y-2" onClick={e => e.stopPropagation()}>
                          <div>
                            <label className="text-[10px] text-muted-foreground">Full Name</label>
                            <input
                              className="w-full text-xs border rounded px-2 py-1.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                              value={String(formValues.fullName ?? '')}
                              onChange={e => setFormValues(p => ({ ...p, fullName: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">Stages</label>
                            <input
                              className="w-full text-xs border rounded px-2 py-1.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                              value={String(formValues.stages ?? '')}
                              onChange={e => setFormValues(p => ({ ...p, stages: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">Exam Date</label>
                            <input
                              className="w-full text-xs border rounded px-2 py-1.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                              value={String(formValues.examDate ?? '')}
                              onChange={e => setFormValues(p => ({ ...p, examDate: e.target.value }))}
                            />
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Button size="sm" className="h-7 text-xs bg-[#003366]" onClick={saveExamMeta}><Save size={11} className="mr-1" />Save</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={cancelEdit}><X size={11} /></Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────
              SECTION: Tiers / Stages
          ────────────────────────────────────────────────────────────── */}
          {activeSection === 'tiers' && selectedExam && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage stages (Prelims, Mains, Interview…) for <strong>{selectedExam.examName}</strong>.
              </p>

              {selectedExam.tiers.map((tier, idx) => {
                const isEditing = editing.section === 'tier' && editing.id === tier.id;
                const stageLabels = ['Prelims', 'Mains', 'Interview', 'Stage 4'];
                const stageColors = ['bg-sky-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500'];
                return (
                  <Card key={tier.id} className={`border ${selectedTierId === tier.id ? 'border-[#003366]' : ''}`}>
                    <CardHeader className="p-4 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full ${stageColors[idx] || 'bg-gray-500'} flex items-center justify-center text-white text-xs font-bold`}>
                            {idx + 1}
                          </div>
                          <div>
                            <CardTitle className="text-sm font-bold">{stageLabels[idx] || tier.name}</CardTitle>
                            <p className="text-[10px] text-muted-foreground">{tier.subjects.length} subjects · {tier.subjects.reduce((s, sub) => s + sub.topics.length, 0)} topics</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { setSelectedTierId(tier.id); setActiveSection('subjects'); }}
                            className="px-2.5 py-1 text-[11px] font-medium bg-muted/40 hover:bg-muted rounded-md transition-colors"
                          >
                            Manage Subjects →
                          </button>
                          <button
                            onClick={() => startEdit('tier', tier.id, {
                              duration: tier.duration,
                              totalMarks: tier.totalMarks,
                              negativeMarking: tier.negativeMarking,
                              sectionalCutoff: tier.sectionalCutoff,
                            })}
                            className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => requestDelete(
                              `tier "${tier.name}"`,
                              () => removeTier(tier.id)
                            )}
                            className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Inline tier details / edit */}
                    <CardContent className="px-4 pb-4">
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={10} />Duration</label>
                            <input className="w-full text-xs border rounded px-2 py-1.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                              value={String(formValues.duration ?? '')}
                              onChange={e => setFormValues(p => ({ ...p, duration: e.target.value }))} />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground flex items-center gap-1"><Target size={10} />Total Marks</label>
                            <input type="number" className="w-full text-xs border rounded px-2 py-1.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                              value={Number(formValues.totalMarks ?? 0)}
                              onChange={e => setFormValues(p => ({ ...p, totalMarks: Number(e.target.value) }))} />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground flex items-center gap-1"><X size={10} />Negative Marking</label>
                            <input className="w-full text-xs border rounded px-2 py-1.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                              value={String(formValues.negativeMarking ?? '')}
                              onChange={e => setFormValues(p => ({ ...p, negativeMarking: e.target.value }))} />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">Sectional Cutoff</label>
                            <select className="w-full text-xs border rounded px-2 py-1.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                              value={formValues.sectionalCutoff ? 'yes' : 'no'}
                              onChange={e => setFormValues(p => ({ ...p, sectionalCutoff: e.target.value === 'yes' }))}>
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          </div>
                          <div className="col-span-2 flex gap-2">
                            <Button size="sm" className="h-7 text-xs bg-[#003366]" onClick={saveTierMeta}><Save size={11} className="mr-1" />Save Changes</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={cancelEdit}><X size={11} className="mr-1" />Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                          <span className="text-xs text-muted-foreground"><Clock size={11} className="inline mr-1" /><strong>{tier.duration}</strong></span>
                          <span className="text-xs text-muted-foreground"><Target size={11} className="inline mr-1" /><strong>{tier.totalMarks}</strong> marks</span>
                          <span className="text-xs text-muted-foreground"><X size={11} className="inline mr-1" />{tier.negativeMarking}</span>
                          <span className="text-xs text-muted-foreground">Cutoff: <strong>{tier.sectionalCutoff ? 'Yes' : 'No'}</strong></span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Add new tier */}
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold mb-2 text-muted-foreground">Add New Tier / Stage</p>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                      placeholder="e.g. Interview, Skill Test…"
                      value={String(formValues.newTierName ?? '')}
                      onChange={e => setFormValues(p => ({ ...p, newTierName: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addTier()}
                    />
                    <Button size="sm" className="h-8 text-xs bg-[#003366] gap-1" onClick={addTier}>
                      <Plus size={12} />Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────
              SECTION: Subjects
          ────────────────────────────────────────────────────────────── */}
          {activeSection === 'subjects' && (
            <div className="space-y-4">
              {/* Tier selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold">Stage:</p>
                {selectedExam?.tiers.map((tier, idx) => {
                  const labels = ['Prelims', 'Mains', 'Interview', 'Stage 4'];
                  return (
                    <button
                      key={tier.id}
                      onClick={() => { setSelectedTierId(tier.id); setSelectedSubjectId(''); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        (selectedTierId === tier.id || (!selectedTierId && idx === 0))
                        ? 'bg-[#003366] text-white border-[#003366]'
                        : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                        }`}
                    >
                      {labels[idx] || tier.name}
                    </button>
                  );
                })}
              </div>

              {selectedTier && (
                <div className="space-y-3">
                  {selectedTier.subjects.map(subject => {
                    const isEditing = editing.section === 'subject' && editing.id === subject.id;
                    return (
                      <Card key={subject.id} className={`border ${selectedSubjectId === subject.id ? 'border-[#003366]' : ''}`}>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${subject.iconBg} flex items-center justify-center`}>
                                <BookOpen size={14} className="text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold">{subject.name}</p>
                                <p className="text-[11px] text-muted-foreground">{subject.marks} marks · {subject.topics.length} topics</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedTierId(selectedTier?.id || '');
                                  setSelectedSubjectId(subject.id);
                                  setActiveSection('topics');
                                }}
                                className="px-2.5 py-1 text-[11px] font-medium bg-muted/40 hover:bg-muted rounded-md transition-colors"
                              >
                                Manage Topics →
                              </button>
                              <button
                                onClick={() => startEdit('subject', subject.id, { name: subject.name, marks: subject.marks })}
                                className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => requestDelete(
                                  `subject "${subject.name}"`,
                                  () => removeSubject(subject.id)
                                )}
                                className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {isEditing && (
                            <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] text-muted-foreground">Subject Name</label>
                                <input className="w-full text-xs border rounded px-2 py-1.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                                  value={String(formValues.name ?? '')}
                                  onChange={e => setFormValues(p => ({ ...p, name: e.target.value }))} />
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground">Marks</label>
                                <input type="number" className="w-full text-xs border rounded px-2 py-1.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                                  value={Number(formValues.marks ?? 0)}
                                  onChange={e => setFormValues(p => ({ ...p, marks: Number(e.target.value) }))} />
                              </div>
                              <div className="col-span-2 flex gap-2">
                                <Button size="sm" className="h-7 text-xs bg-[#003366]" onClick={saveSubjectMeta}><Save size={11} className="mr-1" />Save</Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={cancelEdit}><X size={11} /></Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}

                  {/* Add Subject */}
                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <p className="text-xs font-semibold mb-2 text-muted-foreground">Add New Subject</p>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                          placeholder="e.g. General Studies…"
                          value={String(formValues.newSubjectName ?? '')}
                          onChange={e => setFormValues(p => ({ ...p, newSubjectName: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && addSubject()}
                        />
                        <Button size="sm" className="h-8 text-xs bg-[#003366] gap-1" onClick={addSubject}>
                          <Plus size={12} />Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────
              SECTION: Topics
          ────────────────────────────────────────────────────────────── */}
          {activeSection === 'topics' && (
            <div className="space-y-4">
              {/* Tier + Subject breadcrumb selectors */}
              <div className="flex flex-wrap gap-2 items-center">
                <p className="text-sm font-semibold">Stage:</p>
                {selectedExam?.tiers.map((tier, idx) => {
                  const labels = ['Prelims', 'Mains', 'Interview', 'Stage 4'];
                  return (
                    <button key={tier.id}
                      onClick={() => { setSelectedTierId(tier.id); setSelectedSubjectId(''); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        (selectedTierId === tier.id || (!selectedTierId && idx === 0))
                        ? 'bg-[#003366] text-white border-[#003366]'
                        : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                        }`}>
                      {labels[idx] || tier.name}
                    </button>
                  );
                })}
              </div>

              {selectedTier && (
                <div className="flex flex-wrap gap-2 items-center">
                  <p className="text-sm font-semibold">Subject:</p>
                  {selectedTier.subjects.map(s => (
                    <button key={s.id}
                      onClick={() => setSelectedSubjectId(s.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedSubjectId === s.id
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                        }`}>
                      {s.name}
                    </button>
                  ))}
                </div>
              )}

              {selectedSubject && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedSubject.topics.length} topics in <strong>{selectedSubject.name}</strong>
                  </p>

                  {selectedSubject.topics.map((topic) => {
                    const isEditing = editing.section === 'topic' && editing.id === topic.id;
                    const isExpanded = expandedTopics.includes(topic.id);
                    return (
                      <Card key={topic.id} className="border">
                        <div className="px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#003366] shrink-0" />
                              {isEditing ? (
                                <input
                                  autoFocus
                                  className="flex-1 text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                                  value={String(formValues[`name_${topic.id}`] ?? topic.name)}
                                  onChange={e => setFormValues(p => ({ ...p, [`name_${topic.id}`]: e.target.value }))}
                                />
                              ) : (
                                <p className="text-xs font-medium truncate">{topic.name}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0 text-[10px] text-muted-foreground">
                              <span className="bg-blue-50 px-1.5 py-0.5 rounded">{topic.videos.length}v</span>
                              <span className="bg-amber-50 px-1.5 py-0.5 rounded">{topic.pdfs.length}p</span>
                              <span className="bg-emerald-50 px-1.5 py-0.5 rounded">{topic.tests.length}t</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {isEditing ? (
                                <>
                                  <button onClick={() => saveTopicMeta(topic.id)} className="p-1 rounded hover:bg-emerald-50 text-emerald-600"><Check size={12} /></button>
                                  <button onClick={cancelEdit} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={12} /></button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEdit('topic', topic.id, { [`name_${topic.id}`]: topic.name })}
                                    className="p-1 rounded hover:bg-muted text-muted-foreground"
                                  ><Edit2 size={12} /></button>
                                  <button
                                    onClick={() => setExpandedTopics(p => p.includes(topic.id) ? p.filter(i => i !== topic.id) : [...p, topic.id])}
                                    className="p-1 rounded hover:bg-muted text-muted-foreground"
                                  >{isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</button>
                                  <button
                                    onClick={() => requestDelete(
                                      `topic "${topic.name}"`,
                                      () => removeTopic(topic.id)
                                    )}
                                    className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500"
                                  ><Trash2 size={12} /></button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Expanded: full resource manager */}
                          {isExpanded && !isEditing && (() => {
                            const rtab = getResourceTab(topic.id);
                            return (
                              <div className="mt-3 pt-3 border-t">
                                {/* Resource type tabs */}
                                <div className="flex gap-1 mb-3">
                                  {(['videos', 'pdfs', 'tests'] as const).map(tab => {
                                    const counts = { videos: topic.videos.length, pdfs: topic.pdfs.length, tests: topic.tests.length };
                                    const colors = {
                                      videos: rtab === 'videos' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                                      pdfs: rtab === 'pdfs' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100',
                                      tests: rtab === 'tests' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
                                    };
                                    return (
                                      <button key={tab}
                                        onClick={() => setResourceTab(p => ({ ...p, [topic.id]: tab }))}
                                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${colors[tab]}`}>
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* ── Videos ── */}
                                {rtab === 'videos' && (
                                  <div className="space-y-2">
                                    {topic.videos.length === 0 && (
                                      <p className="text-[10px] text-muted-foreground italic py-1">No videos yet. Add one below.</p>
                                    )}
                                    {topic.videos.map(v => (
                                      <div key={v.id} className="flex items-center justify-between gap-2 bg-blue-50/60 px-3 py-2 rounded-lg">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center shrink-0">
                                            <span className="text-white text-[9px] font-bold">▶</span>
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-xs font-medium truncate">{v.title}</p>
                                            <p className="text-[10px] text-muted-foreground">{v.instructor} · {v.duration}</p>
                                          </div>
                                        </div>
                                        <button onClick={() => requestDelete(
                                          `video "${v.title}"`,
                                          () => removeVideo(topic.id, v.id)
                                        )}
                                          className="p-1 rounded hover:bg-red-100 text-muted-foreground hover:text-red-500 shrink-0">
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    ))}
                                    {/* Add video form */}
                                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Add Video</p>
                                      <input
                                        className="w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                        placeholder="Video title *"
                                        value={String(formValues[`v_title_${topic.id}`] ?? '')}
                                        onChange={e => setFormValues(p => ({ ...p, [`v_title_${topic.id}`]: e.target.value }))}
                                      />
                                      <div className="grid grid-cols-2 gap-2">
                                        <input
                                          className="text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                          placeholder="Instructor name"
                                          value={String(formValues[`v_instructor_${topic.id}`] ?? '')}
                                          onChange={e => setFormValues(p => ({ ...p, [`v_instructor_${topic.id}`]: e.target.value }))}
                                        />
                                        <input
                                          className="text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                          placeholder="Duration (e.g. 15 min)"
                                          value={String(formValues[`v_duration_${topic.id}`] ?? '')}
                                          onChange={e => setFormValues(p => ({ ...p, [`v_duration_${topic.id}`]: e.target.value }))}
                                        />
                                      </div>
                                      <Button size="sm" className="h-7 text-xs bg-blue-500 gap-1"
                                        onClick={() => addVideo(topic.id)}>
                                        <Plus size={11} />Add Video
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* ── PDFs ── */}
                                {rtab === 'pdfs' && (
                                  <div className="space-y-2">
                                    {topic.pdfs.length === 0 && (
                                      <p className="text-[10px] text-muted-foreground italic py-1">No PDFs yet. Add one below.</p>
                                    )}
                                    {topic.pdfs.map(pdf => (
                                      <div key={pdf.id} className="flex items-center justify-between gap-2 bg-amber-50/60 px-3 py-2 rounded-lg">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center shrink-0">
                                            <FileText size={10} className="text-white" />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-xs font-medium truncate">{pdf.title}</p>
                                            <p className="text-[10px] text-muted-foreground capitalize">{pdf.type} · {pdf.pages} pages</p>
                                          </div>
                                        </div>
                                        <button onClick={() => requestDelete(
                                          `PDF "${pdf.title}"`,
                                          () => removePdf(topic.id, pdf.id)
                                        )}
                                          className="p-1 rounded hover:bg-red-100 text-muted-foreground hover:text-red-500 shrink-0">
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    ))}
                                    {/* Add PDF form */}
                                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Add PDF</p>
                                      <input
                                        className="w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                        placeholder="PDF title *"
                                        value={String(formValues[`p_title_${topic.id}`] ?? '')}
                                        onChange={e => setFormValues(p => ({ ...p, [`p_title_${topic.id}`]: e.target.value }))}
                                      />
                                      <div className="grid grid-cols-2 gap-2">
                                        <select
                                          className="text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                          value={String(formValues[`p_type_${topic.id}`] ?? 'notes')}
                                          onChange={e => setFormValues(p => ({ ...p, [`p_type_${topic.id}`]: e.target.value }))}>
                                          <option value="notes">Notes</option>
                                          <option value="pyq">PYQ</option>
                                          <option value="formulas">Formulas</option>
                                          <option value="summary">Summary</option>
                                        </select>
                                        <input type="number"
                                          className="text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                          placeholder="Pages"
                                          value={String(formValues[`p_pages_${topic.id}`] ?? '')}
                                          onChange={e => setFormValues(p => ({ ...p, [`p_pages_${topic.id}`]: e.target.value }))}
                                        />
                                      </div>
                                      <Button size="sm" className="h-7 text-xs bg-amber-500 gap-1"
                                        onClick={() => addPdf(topic.id)}>
                                        <Plus size={11} />Add PDF
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* ── Tests ── */}
                                {rtab === 'tests' && (
                                  <div className="space-y-2">
                                    {topic.tests.length === 0 && (
                                      <p className="text-[10px] text-muted-foreground italic py-1">No tests yet. Add one below.</p>
                                    )}
                                    {topic.tests.map(test => (
                                      <div key={test.id} className="flex items-center justify-between gap-2 bg-emerald-50/60 px-3 py-2 rounded-lg">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center shrink-0">
                                            <span className="text-white text-[9px] font-bold">Q</span>
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-xs font-medium truncate">{test.title}</p>
                                            <p className="text-[10px] text-muted-foreground capitalize">{test.difficulty} · {test.questions}Q · {test.duration}</p>
                                          </div>
                                        </div>
                                        <button onClick={() => requestDelete(
                                          `test "${test.title}"`,
                                          () => removeTest(topic.id, test.id)
                                        )}
                                          className="p-1 rounded hover:bg-red-100 text-muted-foreground hover:text-red-500 shrink-0">
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    ))}
                                    {/* Add test form */}
                                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Add Test</p>
                                      <input
                                        className="w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                        placeholder="Test title *"
                                        value={String(formValues[`t_title_${topic.id}`] ?? '')}
                                        onChange={e => setFormValues(p => ({ ...p, [`t_title_${topic.id}`]: e.target.value }))}
                                      />
                                      <div className="grid grid-cols-3 gap-2">
                                        <input type="number"
                                          className="text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                          placeholder="Questions"
                                          value={String(formValues[`t_questions_${topic.id}`] ?? '')}
                                          onChange={e => setFormValues(p => ({ ...p, [`t_questions_${topic.id}`]: e.target.value }))}
                                        />
                                        <select
                                          className="text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                          value={String(formValues[`t_difficulty_${topic.id}`] ?? 'medium')}
                                          onChange={e => setFormValues(p => ({ ...p, [`t_difficulty_${topic.id}`]: e.target.value }))}>
                                          <option value="easy">Easy</option>
                                          <option value="medium">Medium</option>
                                          <option value="hard">Hard</option>
                                        </select>
                                        <input
                                          className="text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                          placeholder="Duration"
                                          value={String(formValues[`t_duration_${topic.id}`] ?? '')}
                                          onChange={e => setFormValues(p => ({ ...p, [`t_duration_${topic.id}`]: e.target.value }))}
                                        />
                                      </div>
                                      <Button size="sm" className="h-7 text-xs bg-emerald-500 gap-1"
                                        onClick={() => addTest(topic.id)}>
                                        <Plus size={11} />Add Test
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </Card>
                    );
                  })}

                  {/* Add topic */}
                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <p className="text-xs font-semibold mb-2 text-muted-foreground">Add New Topic</p>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                          placeholder="e.g. Percentages…"
                          value={String(formValues.newTopicName ?? '')}
                          onChange={e => setFormValues(p => ({ ...p, newTopicName: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && addTopic()}
                        />
                        <Button size="sm" className="h-8 text-xs bg-[#003366] gap-1" onClick={addTopic}>
                          <Plus size={12} />Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {!selectedSubject && (
                <div className="text-center py-16 text-muted-foreground">
                  <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a Stage and Subject above to manage topics.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Delete Confirmation AlertDialog ── */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={open => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Delete
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the {deleteConfirm?.label}?<br /><br />
              This action <strong>cannot be undone</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { deleteConfirm?.onConfirm(); setDeleteConfirm(null); }}
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SyllabusManager;
