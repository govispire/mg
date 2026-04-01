import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, Plus, Trash2, Edit2, Save, X, BookOpen, Video, FileText, CheckCircle, Clock, Check, AlertCircle, Eye, ChevronRight
} from 'lucide-react';
import { allSyllabusData, ExamSyllabusConfig, TierConfig, SubjectConfig, TopicConfig } from '@/data/syllabusData';
import { useExamCatalog } from '@/hooks/useExamCatalog';

export default function SyllabusManager() {
  const [data, setData] = useState<Record<string, ExamSyllabusConfig>>(() => 
    JSON.parse(JSON.stringify(allSyllabusData))
  );

  const { catalog } = useExamCatalog();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Resource Modals state
  const [videoModal, setVideoModal] = useState<{tierId: string; subjectId: string; topicId: string} | null>(null);
  const [pdfModal, setPdfModal] = useState<{tierId: string; subjectId: string; topicId: string} | null>(null);
  const [testModal, setTestModal] = useState<{tierId: string; subjectId: string; topicId: string} | null>(null);

  const [newVideo, setNewVideo] = useState({ title: '', duration: '15:00', instructor: 'Main Instructor' });
  const [newPdf, setNewPdf] = useState({ title: '', type: 'notes' as any, pages: '10' });
  const [newTest, setNewTest] = useState({ title: '', questions: '20', duration: '20 min', difficulty: 'medium' as any });

  // Creation Inputs state
  const [newTiers, setNewTiers] = useState<string>('');
  const [newSubjects, setNewSubjects] = useState<Record<string, string>>({});
  const [newTopics, setNewTopics] = useState<Record<string, string>>({});

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Initial category mapping
  useEffect(() => {
    if (!selectedCategoryId && catalog.length > 0) {
      setSelectedCategoryId(catalog.filter(c => c.isVisible)[0]?.id || catalog[0].id);
    }
  }, [catalog, selectedCategoryId]);

  // 2. Computed filtered exams that guarantees scaffolding for missing local data
  const filteredExams = useMemo(() => {
    const activeCategory = catalog.find(c => c.id === selectedCategoryId);
    if (!activeCategory) return [];

    const categoryExams = activeCategory.sections.flatMap(s => s.exams);
    const uniqueExams = new Map();
    categoryExams.forEach(e => { if(!uniqueExams.has(e.id)) uniqueExams.set(e.id, e); });

    let entries: [string, ExamSyllabusConfig][] = Array.from(uniqueExams.values()).map(catalogExam => {
      const existing = data[catalogExam.id];
      const skeleton: ExamSyllabusConfig = existing || {
        examId: catalogExam.id,
        examName: catalogExam.name,
        fullName: catalogExam.name,
        stages: '',
        examDate: 'Not Configured',
        tiers: [],
        logo: catalogExam.logo || '',
        category: selectedCategoryId,
      };
      return [catalogExam.id, skeleton];
    });

    if (searchQuery) {
      entries = entries.filter(([, e]) =>
        e.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return entries;
  }, [data, catalog, selectedCategoryId, searchQuery]);

  // 3. Auto-select exam when category changes
  useEffect(() => {
    if (filteredExams.length > 0) {
      const currentExists = filteredExams.find(([id]) => id === selectedExamId);
      if (!currentExists) {
         setSelectedExamId(filteredExams[0][0]);
      }
    }
  }, [filteredExams, selectedExamId]);

  const selectedExam = filteredExams.find(([id]) => id === selectedExamId)?.[1];

  // ─── HANDLERS ─────────────────────────────────────────────────────────────
  
  const updateExam = (fn: (ex: ExamSyllabusConfig) => void) => {
    if (!selectedExamId || !selectedExam) return;
    setData(prev => {
      // Must deep copy to ensure triggers
      const nextData = { ...prev };
      const ex = JSON.parse(JSON.stringify(selectedExam));
      fn(ex);
      nextData[selectedExamId] = ex;
      return nextData;
    });
  };

  const addTier = () => {
    const name = newTiers.trim();
    if (!name) return;
    updateExam(ex => {
      ex.tiers.push({
        id: `tier-${Date.now()}`,
        name,
        duration: '',
        totalMarks: 0,
        negativeMarking: '',
        sectionalCutoff: false,
        subjects: []
      });
      showToast(`Added stage: ${name}`);
    });
    setNewTiers('');
  };

  const addSubject = (tierId: string) => {
    const name = (newSubjects[tierId] || '').trim();
    if (!name) return;
    updateExam(ex => {
      const tier = ex.tiers.find(t => t.id === tierId);
      if (tier) {
         tier.subjects.push({
            id: `sub-${Date.now()}`,
            name,
            marks: 0,
            iconName: 'BookOpen',
            iconBg: 'bg-blue-500',
            topics: []
         });
         showToast(`Added subject: ${name}`);
      }
    });
    setNewSubjects(prev => ({ ...prev, [tierId]: '' }));
  };

  const addTopic = (tierId: string, subjectId: string) => {
    const name = (newTopics[subjectId] || '').trim();
    if (!name) return;
    updateExam(ex => {
      const tier = ex.tiers.find(t => t.id === tierId);
      const subject = tier?.subjects.find(s => s.id === subjectId);
      if (subject) {
        subject.topics.push({
          id: `topic-${Date.now()}`,
          name,
          progress: 0,
          videos: [],
          pdfs: [],
          tests: []
        });
        showToast(`Added topic: ${name}`);
      }
    });
    setNewTopics(prev => ({ ...prev, [subjectId]: '' }));
  };

  const deleteItem = (type: string, tierId: string, subjectId?: string, topicId?: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    updateExam(ex => {
      if (type === 'tier') {
        ex.tiers = ex.tiers.filter(t => t.id !== tierId);
      } else if (type === 'subject') {
        const tier = ex.tiers.find(t => t.id === tierId);
        if (tier) tier.subjects = tier.subjects.filter(s => s.id !== subjectId);
      } else if (type === 'topic') {
        const tier = ex.tiers.find(t => t.id === tierId);
        const subj = tier?.subjects.find(s => s.id === subjectId);
        if (subj) subj.topics = subj.topics.filter(t => t.id !== topicId);
      }
      showToast('Item deleted.');
    });
  };

  const deleteResource = (tierId: string, subjectId: string, topicId: string, rType: 'videos'|'pdfs'|'tests', rId: string) => {
     if (!window.confirm(`Delete this resource?`)) return;
     updateExam(ex => {
       const topic = ex.tiers.find(t => t.id === tierId)?.subjects.find(s => s.id === subjectId)?.topics.find(t => t.id === topicId);
       if (topic) {
          topic[rType] = topic[rType].filter((r: any) => r.id !== rId) as any;
          showToast(`Resource deleted.`);
       }
     });
  };

  // ─── Resource Add Handlers
  const confirmAddVideo = () => {
     if (!videoModal || !newVideo.title) return;
     updateExam(ex => {
        const t = ex.tiers.find(t => t.id === videoModal.tierId)?.subjects.find(s => s.id === videoModal.subjectId)?.topics.find(tp => tp.id === videoModal.topicId);
        if (t) {
           t.videos.push({
              id: `v-${Date.now()}`,
              title: newVideo.title,
              instructor: newVideo.instructor,
              duration: newVideo.duration,
              rating: 0,
              completed: false
           });
           showToast('Video resource added.');
        }
     });
     setVideoModal(null);
     setNewVideo({title: '', duration: '15:00', instructor: 'Main Instructor'});
  };

  const confirmAddPdf = () => {
    if (!pdfModal || !newPdf.title) return;
    updateExam(ex => {
       const t = ex.tiers.find(t => t.id === pdfModal.tierId)?.subjects.find(s => s.id === pdfModal.subjectId)?.topics.find(tp => tp.id === pdfModal.topicId);
       if (t) {
          t.pdfs.push({
             id: `p-${Date.now()}`,
             title: newPdf.title,
             type: newPdf.type,
             pages: parseInt(newPdf.pages) || 1
          });
          showToast('PDF resource added.');
       }
    });
    setPdfModal(null);
    setNewPdf({title: '', type: 'notes', pages: '10'});
  };

  const confirmAddTest = () => {
    if (!testModal || !newTest.title) return;
    updateExam(ex => {
       const t = ex.tiers.find(t => t.id === testModal.tierId)?.subjects.find(s => s.id === testModal.subjectId)?.topics.find(tp => tp.id === testModal.topicId);
       if (t) {
          t.tests.push({
             id: `t-${Date.now()}`,
             title: newTest.title,
             questions: parseInt(newTest.questions) || 10,
             duration: newTest.duration,
             difficulty: newTest.difficulty
          });
          showToast('Test Resource added.');
       }
    });
    setTestModal(null);
    setNewTest({title: '', questions: '20', duration: '20 min', difficulty: 'medium'});
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#f8f9fa] overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-72 bg-white flex flex-col border-r shadow-sm z-10 shrink-0 h-full">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 text-[#003366]">
            <BookOpen size={20} className="font-bold" />
            <span className="font-bold text-base tracking-tight">Syllabus Flow</span>
          </div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Super Admin</p>
        </div>

        <div className="p-3 border-b flex flex-col gap-3 shrink-0">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Exam Category</p>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="w-full h-8 text-xs bg-white">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {catalog.filter(c => c.isVisible).map(cat => (
                  <SelectItem key={cat.id} value={cat.id} className="text-xs">{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Current Exam</p>
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
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredExams.map(([id, exam]) => {
            const isScaffold = !data[id];
            return (
              <button
                key={id}
                onClick={() => setSelectedExamId(id)}
                className={`w-full text-left px-2 py-2 rounded-md transition-colors flex items-center justify-between ${
                  selectedExamId === id ? 'bg-[#003366] text-white shadow-sm' : 'hover:bg-muted/50 text-foreground'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <span className="block truncate text-[13px] font-semibold">{exam.examName}</span>
                  <span className={`block truncate text-[10px] mt-0.5 ${selectedExamId === id ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {isScaffold ? '⚠️ Needs config' : `${exam.tiers.length} Stages configured`}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── Main Content Dashboard ── */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative">
        <div className="bg-white border-b px-6 py-4 shrink-0 shadow-sm z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#003366] mb-1">
              {selectedExam?.fullName || 'Select an Exam'} 
            </h1>
            <p className="text-sm text-slate-500">
               Organize stages, subjects, and topics to curate the perfect learning path.
            </p>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="absolute top-4 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-md animate-in slide-in-from-top-2">
            <Check size={16} />{toast.msg}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {selectedExam ? (
            <div className="max-w-5xl mx-auto space-y-6">
               
              <Accordion type="multiple" className="space-y-4" defaultValue={selectedExam.tiers.map(t => t.id)}>
                {selectedExam.tiers.map((tier) => (
                  <AccordionItem key={tier.id} value={tier.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50 transition-colors [&[data-state=open]>div>svg]:rotate-180">
                       <div className="flex flex-1 items-center justify-between pointer-events-none">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                               {tier.name.charAt(0)}
                            </div>
                            <div className="text-left">
                              <h3 className="font-bold text-slate-800 pointer-events-auto">{tier.name}</h3>
                              <p className="text-xs text-slate-500 font-normal">{tier.subjects.length} Subjects included</p>
                            </div>
                         </div>
                         <Button 
                           size="sm" variant="ghost" className="h-7 px-2 text-rose-600 hover:bg-rose-50 pointer-events-auto mr-4"
                           onClick={(e) => { e.stopPropagation(); deleteItem('tier', tier.id); }}
                         >
                           <Trash2 size={13} />
                         </Button>
                       </div>
                    </AccordionTrigger>

                    <AccordionContent className="p-0 border-t bg-slate-50/50">
                      <div className="p-5 space-y-4">
                        
                        {tier.subjects.map(subject => (
                          <div key={subject.id} className="bg-white border rounded-md shadow-sm">
                             <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b bg-slate-50/80 gap-3">
                                <div className="flex items-center gap-3">
                                   <BookOpen size={16} className="text-blue-600" />
                                   <span className="font-semibold text-slate-800">{subject.name}</span>
                                   <Badge variant="outline" className="text-[10px] ml-2">{subject.topics.length} Topics</Badge>
                                </div>
                                <Button 
                                  size="sm" variant="ghost" className="h-7 text-xs text-rose-600 hover:bg-rose-50"
                                  onClick={() => deleteItem('subject', tier.id, subject.id)}
                                >
                                  Delete Subject
                                </Button>
                             </div>

                             <div className="p-4 space-y-3">
                                {subject.topics.map(topic => (
                                   <div key={topic.id} className="border border-slate-200 rounded-lg p-3 hover:border-blue-200 transition-colors">
                                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                                         <h5 className="font-medium text-sm text-slate-800 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            {topic.name}
                                         </h5>
                                         <Button size="sm" variant="ghost" className="h-6 px-1.5 text-muted-foreground" onClick={() => deleteItem('topic', tier.id, subject.id, topic.id)}>
                                           <X size={13} />
                                         </Button>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                          {/* VIDEOS */}
                                          <div className="bg-slate-50 rounded p-2.5">
                                             <div className="flex justify-between items-center mb-2">
                                               <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1"><Video size={10}/> Videos ({topic.videos.length})</span>
                                               <Button size="sm" variant="ghost" className="h-5 px-1 bg-white hover:bg-slate-200" onClick={() => setVideoModal({tierId: tier.id, subjectId: subject.id, topicId: topic.id})}><Plus size={10} /></Button>
                                             </div>
                                             {topic.videos.map(v => (
                                                <div key={v.id} className="flex justify-between items-center bg-white border border-slate-100 p-1.5 rounded mb-1.5 shadow-sm group">
                                                  <span className="text-[11px] truncate flex-1 leading-tight" title={v.title}>{v.title}</span>
                                                  <Button variant="ghost" className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 text-rose-500" onClick={() => deleteResource(tier.id, subject.id, topic.id, 'videos', v.id)}><X size={10}/></Button>
                                                </div>
                                             ))}
                                          </div>
                                          {/* PDFS */}
                                          <div className="bg-slate-50 rounded p-2.5">
                                             <div className="flex justify-between items-center mb-2">
                                               <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1"><FileText size={10}/> PDFs ({topic.pdfs.length})</span>
                                               <Button size="sm" variant="ghost" className="h-5 px-1 bg-white hover:bg-slate-200" onClick={() => setPdfModal({tierId: tier.id, subjectId: subject.id, topicId: topic.id})}><Plus size={10} /></Button>
                                             </div>
                                             {topic.pdfs.map(p => (
                                                <div key={p.id} className="flex justify-between items-center bg-white border border-slate-100 p-1.5 rounded mb-1.5 shadow-sm group">
                                                  <span className="text-[11px] truncate flex-1 leading-tight" title={p.title}>{p.title}</span>
                                                  <Button variant="ghost" className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 text-rose-500" onClick={() => deleteResource(tier.id, subject.id, topic.id, 'pdfs', p.id)}><X size={10}/></Button>
                                                </div>
                                             ))}
                                          </div>
                                          {/* TESTS */}
                                          <div className="bg-slate-50 rounded p-2.5">
                                             <div className="flex justify-between items-center mb-2">
                                               <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1"><CheckCircle size={10}/> Tests ({topic.tests.length})</span>
                                               <Button size="sm" variant="ghost" className="h-5 px-1 bg-white hover:bg-slate-200" onClick={() => setTestModal({tierId: tier.id, subjectId: subject.id, topicId: topic.id})}><Plus size={10} /></Button>
                                             </div>
                                             {topic.tests.map(t => (
                                                <div key={t.id} className="flex justify-between items-center bg-white border border-slate-100 p-1.5 rounded mb-1.5 shadow-sm group">
                                                  <span className="text-[11px] truncate flex-1 leading-tight" title={t.title}>{t.title}</span>
                                                  <Button variant="ghost" className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 text-rose-500" onClick={() => deleteResource(tier.id, subject.id, topic.id, 'tests', t.id)}><X size={10}/></Button>
                                                </div>
                                             ))}
                                          </div>
                                      </div>
                                   </div>
                                ))}

                                <div className="flex gap-2 items-center pt-2">
                                    <Input placeholder="New Topic Name..." className="h-8 text-xs max-w-sm" value={newTopics[subject.id] || ''} onChange={e => setNewTopics({...newTopics, [subject.id]: e.target.value})} onKeyDown={e => e.key === 'Enter' && addTopic(tier.id, subject.id)}/>
                                    <Button size="sm" onClick={() => addTopic(tier.id, subject.id)} className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700">Add Topic</Button>
                                </div>
                             </div>
                          </div>
                        ))}

                        <div className="flex gap-2 items-center bg-white p-4 border rounded-md shadow-sm border-dashed">
                             <Input placeholder="New Subject Name (e.g. Reasoning Ability)..." className="h-9 text-sm flex-1" value={newSubjects[tier.id] || ''} onChange={e => setNewSubjects({...newSubjects, [tier.id]: e.target.value})} onKeyDown={e => e.key === 'Enter' && addSubject(tier.id)}/>
                             <Button onClick={() => addSubject(tier.id)} className="h-9 bg-emerald-600 hover:bg-emerald-700">Add Subject</Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="flex gap-2 items-center bg-white p-5 border rounded-lg shadow-sm">
                   <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-2 text-slate-800">Add Assessment Stage</h4>
                      <Input placeholder="New Stage Name (e.g. Prelims, Mains, Interview)..." className="h-10 text-sm w-full" value={newTiers} onChange={e => setNewTiers(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTier()} />
                   </div>
                   <div className="pt-6">
                      <Button onClick={addTier} className="h-10 bg-[#003366] hover:bg-[#002244] px-6">Create Stage</Button>
                   </div>
              </div>

            </div>
          ) : (
             <div className="h-full flex items-center justify-center text-muted-foreground">Select an exam to configure its syllabus hierarchy</div>
          )}
        </div>
      </div>

      {/* ── RESOURCE MODALS ── */}

      <Dialog open={!!videoModal} onOpenChange={(open) => !open && setVideoModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-700"><Video size={18}/> Upload Video Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-1.5">
               <Label className="text-xs font-semibold">Video Title</Label>
               <Input placeholder="e.g. Introduction to Syllogism" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} className="h-9" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Teacher / Instructor</Label>
                  <Input placeholder="e.g. Rahul Sharma" value={newVideo.instructor} onChange={e => setNewVideo({...newVideo, instructor: e.target.value})} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Duration</Label>
                  <Input placeholder="e.g. 45:00" value={newVideo.duration} onChange={e => setNewVideo({...newVideo, duration: e.target.value})} className="h-9" />
                </div>
             </div>
          </div>
          <DialogFooter>
             <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
             <Button onClick={confirmAddVideo} className="bg-indigo-600 hover:bg-indigo-700">Confirm Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pdfModal} onOpenChange={(open) => !open && setPdfModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600"><FileText size={18}/> Upload Notes / PDF</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-1.5">
               <Label className="text-xs font-semibold">Document Title</Label>
               <Input placeholder="e.g. Memory Based Questions 2023" value={newPdf.title} onChange={e => setNewPdf({...newPdf, title: e.target.value})} className="h-9" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Type</Label>
                  <Select value={newPdf.type} onValueChange={v => setNewPdf({...newPdf, type: v})}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notes">Class Notes</SelectItem>
                      <SelectItem value="pyq">Previous Year</SelectItem>
                      <SelectItem value="formulas">Formulas</SelectItem>
                      <SelectItem value="summary">Summary PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Total Pages</Label>
                  <Input type="number" placeholder="e.g. 15" value={newPdf.pages} onChange={e => setNewPdf({...newPdf, pages: e.target.value})} className="h-9" />
                </div>
             </div>
          </div>
          <DialogFooter>
             <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
             <Button onClick={confirmAddPdf} className="bg-rose-600 hover:bg-rose-700">Confirm Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!testModal} onOpenChange={(open) => !open && setTestModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600"><CheckCircle size={18}/> Create Assessment Test</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-1.5">
               <Label className="text-xs font-semibold">Test Title</Label>
               <Input placeholder="e.g. Mock Test 1 - High Level" value={newTest.title} onChange={e => setNewTest({...newTest, title: e.target.value})} className="h-9" />
             </div>
             <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Questions</Label>
                  <Input type="number" value={newTest.questions} onChange={e => setNewTest({...newTest, questions: e.target.value})} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Duration (min)</Label>
                  <Input type="number" value={newTest.duration.replace(' min','')} onChange={e => setNewTest({...newTest, duration: `${e.target.value} min`})} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Level</Label>
                  <Select value={newTest.difficulty} onValueChange={v => setNewTest({...newTest, difficulty: v})}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
             </div>
          </div>
          <DialogFooter>
             <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
             <Button onClick={confirmAddTest} className="bg-emerald-600 hover:bg-emerald-700">Save Test Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
