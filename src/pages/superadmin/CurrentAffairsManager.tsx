import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { useCurrentAffairsStore } from '@/hooks/useCurrentAffairsStore';
import { ExtendedArticle, QuizItem } from '@/types/currentAffairs';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, Search, Filter, Newspaper, Calendar,
  Tag, BookOpen, Zap, Eye, Copy, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, TrendingUp, Globe, Landmark,
  Briefcase, Trophy, FlaskConical, LayoutGrid, List,
  CalendarDays, Hash, ArrowUpDown, X, Save, GripVertical,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['Banking', 'Economy', 'National', 'International', 'Government', 'Science', 'Sports'];
const IMPORTANCE_OPTIONS = ['high', 'medium', 'low'] as const;
const PUBLISH_TYPES = [
  { value: 'news', label: 'News', description: 'Appears in main News tab' },
  { value: 'daily-news', label: 'Daily News', description: 'Appears in Daily News tab' },
  { value: 'all-in-one', label: 'All in One', description: 'Appears in All in One tab' },
] as const;

const TOPICS = [
  'RBI Policy', 'Budget 2025', 'Defence', 'Space & ISRO', 'International Relations',
  'Environment', 'Education', 'Health', 'Infrastructure', 'Digital India',
  'Banking', 'Economy', 'Sports', 'Awards', 'Politics', 'Science & Tech',
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Banking: <Landmark size={14} />,
  Economy: <TrendingUp size={14} />,
  National: <Globe size={14} />,
  International: <Globe size={14} />,
  Government: <Briefcase size={14} />,
  Science: <FlaskConical size={14} />,
  Sports: <Trophy size={14} />,
};

// ─── Blank Forms ──────────────────────────────────────────────────────────────

const blankArticle = (): Omit<ExtendedArticle, 'id'> => ({
  title: '',
  category: 'Banking',
  importance: 'high',
  publishType: 'news',
  date: new Date().toISOString().split('T')[0],
  publishedAt: new Date().toISOString().split('T')[0],
  topic: '',
  tags: [],
  excerpt: '',
  content: '',
  image: '',
  readTime: '5 min',
  relatedIds: [],
  hasQuiz: false,
  quizQuestions: 0,
  isAdminCreated: true,
  quizItems: [],
});

const blankQuizItem = (): Omit<QuizItem, 'id'> => ({
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
});

// ─── Quiz Item Editor ─────────────────────────────────────────────────────────

const QuizItemEditor: React.FC<{
  item: QuizItem;
  index: number;
  onChange: (updated: QuizItem) => void;
  onDelete: () => void;
}> = ({ item, index, onChange, onDelete }) => {
  return (
    <Card className="border-primary/20 bg-primary/2.5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className="text-primary border-primary/30 shrink-0">Q{index + 1}</Badge>
          <button
            type="button"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Question Text</Label>
          <Textarea
            value={item.question}
            onChange={e => onChange({ ...item, question: e.target.value })}
            placeholder="Type the question here..."
            rows={2}
            className="text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {item.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...item, correctIndex: i })}
                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all shrink-0 text-xs font-bold ${
                  item.correctIndex === i
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-muted-foreground/30 text-muted-foreground hover:border-green-400'
                }`}
                title="Mark as correct"
              >
                {String.fromCharCode(65 + i)}
              </button>
              <Input
                value={opt}
                onChange={e => {
                  const opts = [...item.options];
                  opts[i] = e.target.value;
                  onChange({ ...item, options: opts });
                }}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="text-sm h-8"
              />
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-green-700">Explanation (shown after answer)</Label>
          <Textarea
            value={item.explanation}
            onChange={e => onChange({ ...item, explanation: e.target.value })}
            placeholder="Why is this the correct answer? Use **bold** for key facts, bullet points for step-by-step working."
            rows={2}
            className="text-sm border-green-200"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Article Form Dialog ──────────────────────────────────────────────────────

const ArticleFormDialog: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: ExtendedArticle | null;
  onSave: (data: Omit<ExtendedArticle, 'id'>) => void;
}> = ({ open, onOpenChange, initial, onSave }) => {
  const [form, setForm] = useState<Omit<ExtendedArticle, 'id'>>(initial ? { ...initial } : blankArticle());
  const [tagInput, setTagInput] = useState('');
  const [quizItems, setQuizItems] = useState<QuizItem[]>(initial?.quizItems || []);
  const [hasQuiz, setHasQuiz] = useState(initial?.hasQuiz || false);
  const [showQuizSection, setShowQuizSection] = useState(false);

  // Reset when dialog opens
  React.useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : blankArticle());
      setQuizItems(initial?.quizItems || []);
      setHasQuiz(initial?.hasQuiz || false);
      setTagInput('');
      setShowQuizSection(false);
    }
  }, [open, initial]);

  const addTag = () => {
    const tag = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
    if (tagInput.trim() && !form.tags.includes(tag)) {
      setForm(f => ({ ...f, tags: [...f.tags, tag] }));
    }
    setTagInput('');
  };

  const removeTag = (t: string) => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));

  const addQuizItem = () => {
    const newItem: QuizItem = {
      id: `q-${Date.now()}`,
      ...blankQuizItem(),
    };
    setQuizItems(prev => [...prev, newItem]);
    setShowQuizSection(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.topic.trim()) { toast.error('Topic is required'); return; }
    if (!form.excerpt.trim()) { toast.error('Excerpt/Summary is required'); return; }

    const finalData: Omit<ExtendedArticle, 'id'> = {
      ...form,
      hasQuiz,
      quizItems: hasQuiz ? quizItems : [],
      quizQuestions: hasQuiz ? quizItems.length : 0,
    };
    onSave(finalData);
  };

  const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode; className?: string }> = ({ label, required, children, className }) => (
    <div className={`space-y-1.5 ${className || ''}`}>
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Newspaper className="h-5 w-5 text-primary" />
            {initial ? 'Edit Article' : 'Create New Current Affairs Article'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ── Basic Info ─────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Article Title" required className="md:col-span-2">
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. RBI Monetary Policy: Key Highlights for Banking Exams"
                className="text-base"
              />
            </Field>

            <Field label="Category" required>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>
                      <div className="flex items-center gap-2">
                        {CATEGORY_ICONS[c]}
                        {c}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Topic" required>
              <Input
                value={form.topic}
                onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                list="topic-list"
                placeholder="e.g. RBI Policy"
              />
              <datalist id="topic-list">
                {TOPICS.map(t => <option key={t} value={t} />)}
              </datalist>
            </Field>

            <Field label="Importance">
              <Select value={form.importance} onValueChange={v => setForm(f => ({ ...f, importance: v as typeof form.importance }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High Priority</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">⚪ Normal</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Publish Date" required>
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value, publishedAt: e.target.value }))}
              />
            </Field>

            <Field label="Publish To" required>
              <Select value={form.publishType} onValueChange={v => setForm(f => ({ ...f, publishType: v as typeof form.publishType }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PUBLISH_TYPES.map(pt => (
                    <SelectItem key={pt.value} value={pt.value}>
                      <div>
                        <div className="font-medium">{pt.label}</div>
                        <div className="text-xs text-muted-foreground">{pt.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Read Time">
              <Input
                value={form.readTime}
                onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))}
                placeholder="e.g. 5 min"
              />
            </Field>

            <Field label="Featured Image URL" className="md:col-span-2">
              <Input
                value={form.image || ''}
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
              />
              {form.image && (
                <img src={form.image} alt="preview" className="mt-2 h-24 w-full object-cover rounded-lg border" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
            </Field>
          </div>

          {/* ── Tags ───────────────────────────────────────── */}
          <Field label="Tags">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="#RBI, #Banking, #UPSC"
              />
              <Button type="button" variant="outline" onClick={addTag} size="sm">
                <Plus size={14} className="mr-1" /> Add
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map(t => (
                  <Badge key={t} variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => removeTag(t)}>
                    {t} <X size={10} />
                  </Badge>
                ))}
              </div>
            )}
          </Field>

          <Separator />

          {/* ── Excerpt / Summary ──────────────────────────── */}
          <Field label="Excerpt / Summary" required>
            <RichTextEditor
              value={form.excerpt}
              onChange={v => setForm(f => ({ ...f, excerpt: v }))}
              placeholder="Short summary shown in article listing pages..."
              minHeight={120}
            />
          </Field>

          {/* ── Full Content ────────────────────────────────── */}
          <Field label="Full Article Content">
            <RichTextEditor
              value={form.content || ''}
              onChange={v => setForm(f => ({ ...f, content: v }))}
              placeholder="Write the full article content here. Use **bold** for key facts, bullet points for lists..."
              minHeight={240}
            />
          </Field>

          <Separator />

          {/* ── Quiz Section ────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={hasQuiz}
                  onCheckedChange={v => { setHasQuiz(v); if (v && quizItems.length === 0) addQuizItem(); }}
                  id="has-quiz"
                />
                <Label htmlFor="has-quiz" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Zap size={15} className="text-primary" />
                  Include Quiz with this Article
                  {hasQuiz && quizItems.length > 0 && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                      {quizItems.length} Question{quizItems.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </Label>
              </div>
              {hasQuiz && (
                <button
                  type="button"
                  onClick={() => setShowQuizSection(v => !v)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  {showQuizSection ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {showQuizSection ? 'Collapse' : 'Expand'} Quiz
                </button>
              )}
            </div>

            <AnimatePresence>
              {hasQuiz && showQuizSection && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-primary">
                    <strong>Quiz Instructions:</strong> Click the letter button (A/B/C/D) to mark the correct answer. Add explanation for each question.
                  </div>

                  {quizItems.map((item, i) => (
                    <QuizItemEditor
                      key={item.id}
                      item={item}
                      index={i}
                      onChange={updated => setQuizItems(prev => prev.map(q => q.id === item.id ? updated : q))}
                      onDelete={() => setQuizItems(prev => prev.filter(q => q.id !== item.id))}
                    />
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addQuizItem}
                    className="w-full border-dashed border-primary/40 text-primary hover:bg-primary/5 gap-2"
                  >
                    <Plus size={14} /> Add Question
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="gap-2">
            <Save size={14} />
            {initial ? 'Update Article' : 'Publish Article'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Article Card ─────────────────────────────────────────────────────────────

const ArticleCard: React.FC<{
  article: ExtendedArticle;
  viewMode: 'grid' | 'list';
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = ({ article, viewMode, onEdit, onDelete, onDuplicate }) => {
  const importanceBadge = () => {
    if (article.importance === 'high') return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">High Priority</Badge>;
    if (article.importance === 'medium') return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-[10px]">Medium</Badge>;
    return <Badge variant="secondary" className="text-[10px]">Normal</Badge>;
  };

  const publishTypeBadge = () => {
    const colors: Record<string, string> = {
      'news': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'daily-news': 'bg-green-500/10 text-green-600 border-green-500/20',
      'all-in-one': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    };
    const labels: Record<string, string> = {
      'news': 'News', 'daily-news': 'Daily News', 'all-in-one': 'All in One',
    };
    return (
      <Badge className={`text-[10px] ${colors[article.publishType] || 'bg-gray-100 text-gray-600'}`}>
        {labels[article.publishType] || article.publishType}
      </Badge>
    );
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all">
        <CardContent className="p-4 flex gap-4 items-start">
          {article.image && (
            <img
              src={article.image}
              alt={article.title}
              className="w-20 h-14 object-cover rounded-lg flex-shrink-0 border"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <Badge variant="outline" className="text-[10px]">{article.category}</Badge>
              {importanceBadge()}
              {publishTypeBadge()}
              {article.isAdminCreated && <Badge className="text-[10px] bg-orange-500/10 text-orange-600 border-orange-500/20">Admin Created</Badge>}
              {article.hasQuiz && <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20"><Zap size={9} className="mr-0.5" />{article.quizQuestions} Q</Badge>}
            </div>
            <h4 className="font-semibold text-sm line-clamp-1">{article.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1"
               dangerouslySetInnerHTML={{ __html: article.excerpt.replace(/<[^>]*>/g, '') }}
            />
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar size={11} />{article.date}</span>
              <span className="flex items-center gap-1"><Hash size={11} />{article.topic}</span>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={onEdit} title="Edit"><Pencil size={14} /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" onClick={onDuplicate} title="Duplicate"><Copy size={14} /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={onDelete} title="Delete"><Trash2 size={14} /></Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all overflow-hidden group">
      {article.image && (
        <div className="h-36 overflow-hidden relative">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 left-2 flex gap-1">
            {publishTypeBadge()}
          </div>
          {article.importance === 'high' && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-red-500 text-white animate-pulse text-[10px]">Hot</Badge>
            </div>
          )}
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className="text-[10px]">{article.category}</Badge>
          {importanceBadge()}
          {article.hasQuiz && <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20"><Zap size={9} className="mr-0.5" />{article.quizQuestions} Q</Badge>}
          {article.isAdminCreated && <Badge className="text-[10px] bg-orange-500/10 text-orange-600 border-orange-500/20">Admin</Badge>}
        </div>
        <h4 className="font-semibold text-sm line-clamp-2 mb-1">{article.title}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3"
           dangerouslySetInnerHTML={{ __html: article.excerpt.replace(/<[^>]*>/g, '') }}
        />
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar size={11} />{article.date}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary" onClick={onEdit}><Pencil size={12} /></Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary" onClick={onDuplicate}><Copy size={12} /></Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={onDelete}><Trash2 size={12} /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const CurrentAffairsManager: React.FC = () => {
  const {
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    duplicateArticle,
  } = useCurrentAffairsStore();

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterImportance, setFilterImportance] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'category' | 'importance'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [groupBy, setGroupBy] = useState<'date' | 'category' | 'none'>('date');

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ExtendedArticle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (article: ExtendedArticle) => {
    setEditingArticle(article);
    setFormOpen(true);
  };

  const handleSave = (data: Omit<ExtendedArticle, 'id'>) => {
    if (editingArticle) {
      updateArticle(editingArticle.id, data);
      toast.success('Article updated successfully!');
    } else {
      addArticle(data);
      toast.success('Article published successfully! It will appear in the student Current Affairs page.');
    }
    setFormOpen(false);
    setEditingArticle(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteArticle(deleteTarget.id);
    toast.success('Article deleted.');
    setDeleteTarget(null);
  };

  // Filtered + sorted articles
  const filteredArticles = useMemo(() => {
    let result = [...articles];

    // Tab filter by publishType
    if (activeTab !== 'all') {
      result = result.filter(a =>
        activeTab === 'news' ? (!a.publishType || a.publishType === 'news') :
        a.publishType === activeTab
      );
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.topic.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filterCategory !== 'All') result = result.filter(a => a.category === filterCategory);
    if (filterImportance !== 'All') result = result.filter(a => a.importance === filterImportance);

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      if (sortBy === 'importance') {
        const order = { high: 0, medium: 1, low: 2 };
        return (order[a.importance] || 2) - (order[b.importance] || 2);
      }
      return 0;
    });

    return result;
  }, [articles, activeTab, search, filterCategory, filterImportance, sortBy]);

  // Grouped articles
  const groupedArticles = useMemo(() => {
    if (groupBy === 'none') return { 'All Articles': filteredArticles };

    const groups: Record<string, ExtendedArticle[]> = {};
    filteredArticles.forEach(a => {
      let key = '';
      if (groupBy === 'date') {
        const d = new Date(a.date);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) key = 'Today';
        else if (diffDays <= 7) key = 'This Week';
        else if (diffDays <= 30) key = 'This Month';
        else key = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      } else if (groupBy === 'category') {
        key = a.category;
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return groups;
  }, [filteredArticles, groupBy]);

  const adminCount = articles.filter(a => a.isAdminCreated).length;
  const totalCount = articles.length;
  const quizCount = articles.filter(a => a.hasQuiz).length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            Current Affairs Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage articles that appear in News, Daily News, and All in One tabs on the student portal.
            Changes reflect <strong>immediately</strong>.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
          <Plus size={16} />
          New Article
        </Button>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Articles', value: totalCount, color: 'bg-blue-50 text-blue-700', icon: <BookOpen size={16} /> },
          { label: 'Admin Created', value: adminCount, color: 'bg-orange-50 text-orange-700', icon: <Pencil size={16} /> },
          { label: 'With Quiz', value: quizCount, color: 'bg-primary/10 text-primary', icon: <Zap size={16} /> },
          { label: 'Categories', value: CATEGORIES.length, color: 'bg-green-50 text-green-700', icon: <Tag size={16} /> },
        ].map(stat => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className={`p-4 ${stat.color} rounded-xl flex items-center gap-3`}>
              {stat.icon}
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs font-medium opacity-80">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Live sync notice ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 bg-green-500/5 border border-green-500/20 rounded-lg px-4 py-2 text-sm text-green-700">
        <CheckCircle size={15} className="shrink-0" />
        Articles published here appear <strong className="mx-1">immediately</strong> in the student Current Affairs page.
        News tab → <strong>News</strong>, Daily News tab → <strong>Daily News</strong>, All in One tab → <strong>All in One</strong>.
      </div>

      {/* ── Tabs by publish type ─────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 h-10">
          <TabsTrigger value="all" className="gap-1.5 px-4 h-8">
            <BookOpen size={13} /> All
            <Badge variant="secondary" className="text-[10px] ml-1">{articles.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="news" className="gap-1.5 px-4 h-8">
            <Newspaper size={13} /> News
            <Badge variant="secondary" className="text-[10px] ml-1">
              {articles.filter(a => !a.publishType || a.publishType === 'news').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="daily-news" className="gap-1.5 px-4 h-8">
            <CalendarDays size={13} /> Daily News
            <Badge variant="secondary" className="text-[10px] ml-1">
              {articles.filter(a => a.publishType === 'daily-news').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="all-in-one" className="gap-1.5 px-4 h-8">
            <LayoutGrid size={13} /> All in One
            <Badge variant="secondary" className="text-[10px] ml-1">
              {articles.filter(a => a.publishType === 'all-in-one').length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {/* ── Filters + Controls ─────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles, topics, tags..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-9 w-[130px] text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterImportance} onValueChange={setFilterImportance}>
                <SelectTrigger className="h-9 w-[120px] text-xs">
                  <SelectValue placeholder="Importance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Levels</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">⚪ Normal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="h-9 w-[120px] text-xs">
                  <ArrowUpDown size={12} className="mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="category">Sort by Category</SelectItem>
                  <SelectItem value="importance">Sort by Importance</SelectItem>
                </SelectContent>
              </Select>

              <Select value={groupBy} onValueChange={v => setGroupBy(v as typeof groupBy)}>
                <SelectTrigger className="h-9 w-[130px] text-xs">
                  <GripVertical size={12} className="mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Group by Date</SelectItem>
                  <SelectItem value="category">Group by Category</SelectItem>
                  <SelectItem value="none">No Grouping</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex bg-muted/50 rounded-lg p-0.5">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm" className="h-8 w-8 p-0"
                  onClick={() => setViewMode('list')}
                >
                  <List size={14} />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm" className="h-8 w-8 p-0"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* ── Article List ──────────────────────────────────────────── */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No articles found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or create a new article</p>
              <Button onClick={handleOpenAdd} className="mt-4 gap-2">
                <Plus size={14} /> Create First Article
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedArticles).map(([group, groupArticles]) => (
                <div key={group}>
                  {Object.keys(groupedArticles).length > 1 && (
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarDays size={15} className="text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">{group}</h3>
                      <Badge variant="secondary" className="text-[10px]">{groupArticles.length}</Badge>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}
                  <div className={viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'space-y-3'
                  }>
                    {groupArticles.map(article => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        layout
                      >
                        <ArticleCard
                          article={article}
                          viewMode={viewMode}
                          onEdit={() => handleOpenEdit(article)}
                          onDelete={() => setDeleteTarget({ id: article.id, title: article.title })}
                          onDuplicate={() => { duplicateArticle(article.id); toast.success('Article duplicated'); }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Article Form Dialog ───────────────────────────────────────────── */}
      <ArticleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editingArticle}
        onSave={handleSave}
      />

      {/* ── Delete Confirm ────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="text-destructive h-5 w-5" />
              Delete Article?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>"{deleteTarget?.title}"</strong>.
              It will be removed from the student portal immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Article
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CurrentAffairsManager;
