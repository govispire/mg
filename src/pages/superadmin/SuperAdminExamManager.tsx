/**
 * SuperAdminExamManager — Content Development Command Center
 * ──────────────────────────────────────────────────────────
 * Fixed 6-tab architecture for every exam:
 *   Overview | Exam Stages | Syllabus | Tests | Success Stories | Info
 *
 * All tabs are always present. Content inside is dynamically managed.
 */
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, LayoutDashboard, Calendar, BookOpen, CheckSquare, Users,
  Info, Star, Trophy, Plus, Eye, EyeOff, Pencil, Trash2, Save,
  TrendingUp, BarChart3, Shield, AlertTriangle, Check, Target,
  Clock, Video, FileText, GraduationCap, ChevronRight,
} from 'lucide-react';
import { StepBreadcrumb } from '@/components/ui/step-breadcrumb';
import { useExamCatalog } from '@/hooks/useExamCatalog';
import { useSuccessStoriesStore, type SuccessStory } from '@/hooks/useSuccessStoriesStore';

// Sub-tab components
import ExamOverviewTab from '@/components/superadmin/ExamOverviewTab';
import ExamStageManager from '@/components/superadmin/ExamStageManager';
import ExamSyllabusManager from '@/components/superadmin/ExamSyllabusManager';
import ExamTestsTab from '@/components/superadmin/ExamTestsTab';
import ExamInfoTab from '@/components/superadmin/ExamInfoTab';

// ─── Fixed tabs definition ─────────────────────────────────────────────────────

type FixedTab = 'overview' | 'stages' | 'syllabus' | 'tests' | 'stories' | 'info';

const FIXED_TABS: { id: FixedTab; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-3.5 w-3.5" />, description: 'Analytics & health dashboard' },
  { id: 'stages', label: 'Exam Stages', icon: <Calendar className="h-3.5 w-3.5" />, description: 'Dates, countdown, announcements' },
  { id: 'syllabus', label: 'Syllabus', icon: <BookOpen className="h-3.5 w-3.5" />, description: 'Stage → Subject → Topic → Content' },
  { id: 'tests', label: 'Tests', icon: <CheckSquare className="h-3.5 w-3.5" />, description: 'All test management & approval' },
  { id: 'stories', label: 'Success Stories', icon: <Trophy className="h-3.5 w-3.5" />, description: 'Toppers & cleared students' },
  { id: 'info', label: 'Info', icon: <Info className="h-3.5 w-3.5" />, description: 'Cutoffs, FAQs, links, pattern' },
];

// ─── Success Stories Panel ─────────────────────────────────────────────────────

const defaultStoryForm = () => ({
  name: '', air: 1, year: new Date().getFullYear().toString(),
  avatar: '', score: 0, maxScore: 500,
  testimonial: '', tips: ['', '', '', ''], isVisible: true,
});

interface StoriesPanelProps {
  examId: string;
  examName: string;
}

const SuccessStoriesPanel: React.FC<StoriesPanelProps> = ({ examId, examName }) => {
  const { toast } = useToast();
  const { examStories, addStory, updateStory, deleteStory } = useSuccessStoriesStore(examId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<SuccessStory, 'id' | 'createdAt'>>(defaultStoryForm());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const openAdd = () => { setEditingId(null); setForm(defaultStoryForm()); setDialogOpen(true); };
  const openEdit = (s: SuccessStory) => {
    setEditingId(s.id);
    setForm({ name: s.name, air: s.air, year: s.year, avatar: s.avatar, score: s.score, maxScore: s.maxScore, testimonial: s.testimonial, tips: s.tips.length >= 4 ? s.tips : [...s.tips, ...Array(4 - s.tips.length).fill('')], isVisible: s.isVisible });
    setDialogOpen(true);
  };
  const save = () => {
    if (!form.name.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    if (!form.testimonial.trim()) { toast({ title: 'Testimonial required', variant: 'destructive' }); return; }
    const tips = form.tips.filter(Boolean);
    if (editingId) { updateStory(examId, editingId, { ...form, tips }); toast({ title: 'Story updated' }); }
    else { addStory(examId, { ...form, tips }); toast({ title: '✅ Story published!', description: `${form.name}'s story is now live.` }); }
    setDialogOpen(false);
  };

  const sorted = [...examStories].sort((a, b) => a.air - b.air);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-800 flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" /> Success Stories — {examName}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">These toppers appear in the student portal. Toggle visibility to show/hide.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg font-semibold">
            {examStories.filter(s => s.isVisible).length} visible · {examStories.length} total
          </div>
          <Button size="sm" className="gap-1 h-8 bg-amber-500 hover:bg-amber-600" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Add Story</Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <Trophy className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-slate-400">No success stories yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add toppers to inspire students — they'll appear instantly in the portal.</p>
          <Button size="sm" className="gap-1 bg-amber-500 hover:bg-amber-600" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Add First Story</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(story => (
            <div key={story.id} className={`border rounded-xl p-4 bg-white hover:shadow-md transition-all space-y-3 ${!story.isVisible ? 'opacity-55 border-dashed' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <Avatar className="h-14 w-14 border-2 border-amber-200">
                    <AvatarImage src={story.avatar} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">{story.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {story.air <= 3 && <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1"><Trophy className="h-3 w-3 text-white" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{story.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <Badge className="text-xs px-2 py-0 bg-indigo-600">AIR {story.air}</Badge>
                    <Badge variant="outline" className="text-xs px-2 py-0">{story.year}</Badge>
                    {!story.isVisible && <Badge variant="outline" className="text-[10px] text-slate-400 border-dashed">Hidden</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{story.score}/{story.maxScore} marks</p>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  <Button variant="ghost" size="sm" className={`h-7 w-7 p-0 ${story.isVisible ? 'text-emerald-500' : 'text-slate-300'}`} onClick={() => updateStory(examId, story.id, { isVisible: !story.isVisible })} title={story.isVisible ? 'Hide from students' : 'Show to students'}>
                    {story.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-indigo-600" onClick={() => openEdit(story)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600" onClick={() => setDeleteTarget({ id: story.id, name: story.name })}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              {story.testimonial && <p className="text-xs text-muted-foreground italic line-clamp-2 pl-1 border-l-2 border-amber-200">"{story.testimonial}"</p>}
              {story.tips.filter(Boolean).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {story.tips.filter(Boolean).slice(0, 3).map((tip, i) => <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">{tip}</span>)}
                  {story.tips.filter(Boolean).length > 3 && <span className="text-[10px] text-muted-foreground">+{story.tips.filter(Boolean).length - 3} more</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Story Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" />{editingId ? 'Edit Success Story' : 'Add Success Story'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label className="text-xs font-semibold">Student Name *</Label><Input className="mt-1 h-9" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus /></div>
              <div><Label className="text-xs font-semibold">AIR *</Label><Input type="number" min={1} className="mt-1 h-9" value={form.air} onChange={e => setForm(f => ({ ...f, air: +e.target.value }))} /></div>
              <div><Label className="text-xs font-semibold">Year *</Label><Input className="mt-1 h-9" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} /></div>
              <div><Label className="text-xs font-semibold">Score Obtained</Label><Input type="number" min={0} className="mt-1 h-9" value={form.score} onChange={e => setForm(f => ({ ...f, score: +e.target.value }))} /></div>
              <div><Label className="text-xs font-semibold">Max Score</Label><Input type="number" min={1} className="mt-1 h-9" value={form.maxScore} onChange={e => setForm(f => ({ ...f, maxScore: +e.target.value }))} /></div>
              <div className="col-span-2"><Label className="text-xs font-semibold">Photo URL</Label><Input className="mt-1 h-9" value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} placeholder="https://example.com/photo.jpg" /></div>
            </div>
            <div><Label className="text-xs font-semibold">Testimonial *</Label><Textarea className="mt-1 resize-none" rows={3} value={form.testimonial} onChange={e => setForm(f => ({ ...f, testimonial: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Success Tips (up to 4)</Label>
              {[0, 1, 2, 3].map(i => <Input key={i} className="h-9 text-sm" value={form.tips[i] || ''} onChange={e => { const t = [...(form.tips || ['', '', '', ''])]; t[i] = e.target.value; setForm(f => ({ ...f, tips: t })); }} placeholder={`Tip ${i + 1}`} />)}
            </div>
            <div className="flex items-center gap-3"><Switch id="sv" checked={form.isVisible} onCheckedChange={v => setForm(f => ({ ...f, isVisible: v }))} /><Label htmlFor="sv" className="cursor-pointer">Visible to students</Label></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={save} className="gap-1 bg-amber-500 hover:bg-amber-600"><Save className="h-4 w-4" />{editingId ? 'Save' : 'Publish'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Story */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete success story?</AlertDialogTitle><AlertDialogDescription>Permanently remove <strong>{deleteTarget?.name}</strong>'s story. Cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleteTarget) { deleteStory(examId, deleteTarget.id); toast({ title: 'Story deleted', variant: 'destructive' }); setDeleteTarget(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const SuperAdminExamManager: React.FC = () => {
  const { categoryId, sectionId, examId } = useParams<{ categoryId: string; sectionId: string; examId: string }>();
  const navigate = useNavigate();
  const { catalog, loading } = useExamCatalog();
  const { examStories } = useSuccessStoriesStore(examId ?? '');

  const [activeTab, setActiveTab] = useState<FixedTab>('overview');

  const exam = useMemo(() => {
    const cat = catalog.find(c => c.id === categoryId);
    const sec = cat?.sections.find(s => s.id === sectionId);
    return sec?.exams.find(e => e.id === examId);
  }, [catalog, categoryId, sectionId, examId]);

  const category = catalog.find(c => c.id === categoryId);
  const section = category?.sections.find(s => s.id === sectionId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!exam || !category || !section) {
    return (
      <div className="p-8 text-center">
        <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-3" />
        <p className="text-muted-foreground">Exam not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Go Back</Button>
      </div>
    );
  }

  // Derived stats for header and tabs
  const totalTests = exam.testSlots.reduce((a, s) => a + s.tests.length, 0);
  const visibleTests = exam.testSlots.reduce((a, s) => a + s.tests.filter(t => t.isVisible).length, 0);
  const totalSlots = exam.testSlots.filter(s => s.tests.length > 0).length;
  const pendingApprovalTests = exam.testSlots.reduce((a, s) => a + s.tests.filter(t => (t as any).status === 'pending').length, 0);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* ── Breadcrumb ── */}
      <StepBreadcrumb
        items={[
          { label: 'Test Catalog', href: '/super-admin/test-catalog' },
          { label: category.name, href: `/super-admin/test-catalog/${categoryId}` },
          { label: exam.name, isActive: true },
        ]}
      />

      {/* ── Exam Header ── */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center shrink-0 border border-indigo-200">
              {exam.logo ? (
                <img src={exam.logo} alt={exam.name} className="w-12 h-12 object-contain" />
              ) : (
                <GraduationCap className="h-8 w-8 text-indigo-500" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900">{exam.name}</h1>
                {exam.isPopular && <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-semibold"><Star className="h-3 w-3 mr-1" />Popular</Badge>}
                {pendingApprovalTests > 0 && (
                  <Badge className="bg-amber-500 text-white flex items-center gap-1 text-xs">
                    <AlertTriangle className="h-3 w-3" />{pendingApprovalTests} Pending
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">Content Management · {category.name} → {section.name}</p>
            </div>
          </div>

          {/* Header stats */}
          <div className="flex gap-2 flex-wrap shrink-0">
            {[
              { label: 'Total Tests', value: totalTests, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
              { label: 'Visible', value: visibleTests, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              { label: 'Active Slots', value: totalSlots, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
              { label: 'Stories', value: examStories.length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
            ].map(s => (
              <div key={s.label} className={`text-center ${s.bg} px-4 py-2.5 rounded-xl border ${s.border} min-w-[72px]`}>
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fixed 6-Tab Bar ── */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-stretch border-b overflow-x-auto">
          {FIXED_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            let badge: React.ReactNode = null;
            if (tab.id === 'tests' && totalTests > 0) badge = <span className="ml-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalTests}</span>;
            if (tab.id === 'stories' && examStories.length > 0) badge = <span className="ml-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{examStories.length}</span>;
            if (tab.id === 'tests' && pendingApprovalTests > 0) badge = <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">{pendingApprovalTests}</span>;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                    : 'border-transparent text-muted-foreground hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
                title={tab.description}
              >
                {tab.icon}
                {tab.label}
                {badge}
              </button>
            );
          })}
          <div className="flex-1 border-b-2 border-transparent" />
        </div>

        {/* ── Tab Content ── */}
        <div className="p-5">
          {activeTab === 'overview' && (
            <ExamOverviewTab
              examId={examId!}
              examName={exam.name}
              totalTests={totalTests}
              visibleTests={visibleTests}
              successStoriesCount={examStories.length}
              pendingApprovalTests={pendingApprovalTests}
            />
          )}

          {activeTab === 'stages' && (
            <ExamStageManager examId={examId!} examName={exam.name} />
          )}

          {activeTab === 'syllabus' && (
            <ExamSyllabusManager examId={examId!} examName={exam.name} />
          )}

          {activeTab === 'tests' && (
            <ExamTestsTab
              examId={examId!}
              examName={exam.name}
              categoryId={categoryId!}
              sectionId={sectionId!}
            />
          )}

          {activeTab === 'stories' && (
            <SuccessStoriesPanel examId={examId!} examName={exam.name} />
          )}

          {activeTab === 'info' && (
            <ExamInfoTab examId={examId!} examName={exam.name} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminExamManager;
