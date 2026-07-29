import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Download,
  Eye,
  Search,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  FileText,
  Sparkles,
  Zap,
  CheckCircle,
  Clock,
  Filter,
  Layers,
  FolderOpen,
  Award,
  Star,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useGlobalContentFilter } from '@/hooks/useGlobalContentFilter';
import {
  PDF_COLLECTIONS,
  SUBJECTS,
  TOPICS_BY_SUBJECT,
  SUBTOPICS_BY_TOPIC,
  getSubtopicPDFs,
  PDFCollection,
  PDFSubject,
  PDFDocument
} from '@/data/pdfData';

export const PDFCourses = () => {
  // ── Drill-down navigation state ──────────────────────────────────────────
  const [selectedCollection, setSelectedCollection] = useState<PDFCollection | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<PDFSubject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<{ id: string; name: string; pdfCount: number } | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<{ id: string; name: string; pdfCount: number } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const { hasActiveFilters } = useGlobalContentFilter();

  // Handlers for breadcrumb resets
  const handleResetToHome = () => {
    setSelectedCollection(null);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setSearchQuery('');
  };

  const handleSelectCollection = (col: PDFCollection) => {
    setSelectedCollection(col);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setSearchQuery('');
  };

  const handleSelectSubject = (subj: PDFSubject) => {
    setSelectedSubject(subj);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setSearchQuery('');
  };

  const handleSelectTopic = (top: { id: string; name: string; pdfCount: number }) => {
    setSelectedTopic(top);
    setSelectedSubtopic(null);
    setSearchQuery('');
  };

  const handleSelectSubtopic = (subtop: { id: string; name: string; pdfCount: number }) => {
    setSelectedSubtopic(subtop);
    setSearchQuery('');
  };

  const handleDownload = (pdfTitle: string) => {
    toast({
      title: 'Download started',
      description: `${pdfTitle} is downloading.`,
    });
  };

  const handleView = (pdfTitle: string) => {
    toast({
      title: 'Opening Preview',
      description: `Viewing ${pdfTitle}.`,
    });
  };

  // Popular collections list
  const popularCollections = useMemo(
    () => PDF_COLLECTIONS.filter((c) => c.popular),
    []
  );

  // Filtered collections for search
  const filteredCollections = useMemo(() => {
    if (!searchQuery) return PDF_COLLECTIONS;
    const q = searchQuery.toLowerCase();
    return PDF_COLLECTIONS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.badge?.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // ── RENDER LEVEL 4: PDF ITEMS (Inside Subtopic) ──────────────────────────
  if (selectedCollection && selectedSubject && selectedTopic && selectedSubtopic) {
    const pdfs = getSubtopicPDFs(selectedSubtopic.id, selectedSubtopic.name);
    const filteredPdfs = pdfs.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Breadcrumb Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
          <button onClick={handleResetToHome} className="hover:text-blue-600 flex items-center gap-1">
            📚 PDF Library
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <button onClick={() => { setSelectedSubject(null); setSelectedTopic(null); setSelectedSubtopic(null); }} className="hover:text-blue-600">
            {selectedCollection.title}
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <button onClick={() => { setSelectedTopic(null); setSelectedSubtopic(null); }} className="hover:text-blue-600">
            {selectedSubject.name}
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <button onClick={() => setSelectedSubtopic(null)} className="hover:text-blue-600">
            {selectedTopic.name}
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">{selectedSubtopic.name}</span>
        </div>

        {/* Subtopic Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold bg-blue-500/30 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/20">
                {selectedSubject.name} • {selectedTopic.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{selectedSubtopic.name}</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">Download practice sets, model papers, and explanatory PDF solutions</p>
          </div>
          <Button onClick={() => setSelectedSubtopic(null)} variant="secondary" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0">
            <ArrowLeft className="h-4 w-4" /> Back to {selectedTopic.name}
          </Button>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${selectedSubtopic.name}...`}
              className="pl-9 bg-white"
            />
          </div>
        </div>

        {/* PDF Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPdfs.map((pdf) => (
            <Card key={pdf.id} className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {pdf.isNew && (
                      <Badge className="bg-amber-500 text-white text-[10px] font-extrabold uppercase">New</Badge>
                    )}
                    <Badge variant="outline" className="text-[11px] font-bold text-slate-600 border-slate-200">
                      {pdf.examType}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">{pdf.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                    <span>📄 {pdf.pages} Pages</span>
                    <span>•</span>
                    <span>❓ {pdf.questionsCount} Qs</span>
                    <span>•</span>
                    <span>💾 {pdf.size}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                  <span>Updated {pdf.date}</span>
                  <span>{pdf.downloads.toLocaleString()} downloads</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button onClick={() => handleDownload(pdf.title)} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold gap-1.5 text-xs">
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </Button>
                  <Button onClick={() => handleView(pdf.title)} variant="outline" className="flex-1 font-semibold text-xs border-slate-200 gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ── RENDER LEVEL 3: SUBTOPICS (Inside Topic) ──────────────────────────────
  if (selectedCollection && selectedSubject && selectedTopic) {
    const subtopics = SUBTOPICS_BY_TOPIC[selectedTopic.id] || [
      { id: `${selectedTopic.id}-sub1`, name: `${selectedTopic.name} - Basic Level Sets`, pdfCount: 15 },
      { id: `${selectedTopic.id}-sub2`, name: `${selectedTopic.name} - Moderate Level Sets`, pdfCount: 18 },
      { id: `${selectedTopic.id}-sub3`, name: `${selectedTopic.name} - Advanced Level Sets`, pdfCount: 12 },
      { id: `${selectedTopic.id}-sub4`, name: `${selectedTopic.name} - Previous Years Collection`, pdfCount: 20 },
    ];

    const filteredSubtopics = subtopics.filter((st) =>
      st.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Breadcrumb Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
          <button onClick={handleResetToHome} className="hover:text-blue-600 flex items-center gap-1">
            📚 PDF Library
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <button onClick={() => { setSelectedSubject(null); setSelectedTopic(null); }} className="hover:text-blue-600">
            {selectedCollection.title}
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <button onClick={() => setSelectedTopic(null)} className="hover:text-blue-600">
            {selectedSubject.name}
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">{selectedTopic.name}</span>
        </div>

        {/* Topic Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-6 rounded-2xl shadow-md">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold bg-white/10 text-purple-200 px-2.5 py-0.5 rounded-full border border-white/10">
                {selectedSubject.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{selectedTopic.name} Sub-topics</h1>
            <p className="text-purple-200 text-xs sm:text-sm mt-1">Select a specific sub-topic pattern to view and download PDF sets</p>
          </div>
          <Button onClick={() => setSelectedTopic(null)} variant="secondary" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0">
            <ArrowLeft className="h-4 w-4" /> Back to {selectedSubject.name}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${selectedTopic.name} subtopics...`}
            className="pl-9 bg-white"
          />
        </div>

        {/* Subtopic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubtopics.map((st) => (
            <div
              key={st.id}
              onClick={() => handleSelectSubtopic(st)}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                  📁
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors truncate">
                    {st.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">{st.pdfCount} Downloadable PDF Sets</p>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shrink-0 ml-3">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── RENDER LEVEL 2: TOPICS (Inside Subject) ──────────────────────────────
  if (selectedCollection && selectedSubject) {
    const topics = TOPICS_BY_SUBJECT[selectedSubject.id] || [
      { id: `${selectedSubject.id}-top1`, name: 'Fundamental Practice Topics', subtopicsCount: 5, pdfCount: 45 },
      { id: `${selectedSubject.id}-top2`, name: 'Advanced Problem Solving', subtopicsCount: 6, pdfCount: 50 },
      { id: `${selectedSubject.id}-top3`, name: 'Previous Year Memory Sets', subtopicsCount: 4, pdfCount: 40 },
    ];

    const filteredTopics = topics.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Breadcrumb Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
          <button onClick={handleResetToHome} className="hover:text-blue-600 flex items-center gap-1">
            📚 PDF Library
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <button onClick={() => setSelectedSubject(null)} className="hover:text-blue-600">
            {selectedCollection.title}
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">{selectedSubject.name}</span>
        </div>

        {/* Subject Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shrink-0">
              {selectedSubject.icon}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">{selectedSubject.name} Topics</h1>
              <p className="text-blue-200 text-xs sm:text-sm mt-0.5">
                {selectedSubject.topicsCount} Topics • {selectedSubject.pdfCount} Total PDFs
              </p>
            </div>
          </div>
          <Button onClick={() => setSelectedSubject(null)} variant="secondary" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0">
            <ArrowLeft className="h-4 w-4" /> Change Subject
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${selectedSubject.name} topics...`}
            className="pl-9 bg-white"
          />
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((top) => (
            <div
              key={top.id}
              onClick={() => handleSelectTopic(top)}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                    {top.subtopicsCount} Patterns
                  </span>
                  <span className="text-xs font-bold text-blue-600">{top.pdfCount} PDFs</span>
                </div>
                <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                  {top.name}
                </h3>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-blue-600 group-hover:gap-1.5 transition-all">
                <span>View Sub-topics</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── RENDER LEVEL 1: SUBJECTS (Inside Collection) ──────────────────────────
  if (selectedCollection) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Breadcrumb Bar */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
          <button onClick={handleResetToHome} className="hover:text-blue-600 flex items-center gap-1">
            📚 PDF Library
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">{selectedCollection.title}</span>
        </div>

        {/* Collection Hero Banner */}
        <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-r ${selectedCollection.bgGradient} text-white p-7 shadow-lg`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">{selectedCollection.icon}</span>
                <span className="text-xs font-black uppercase tracking-widest text-white/90 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                  {selectedCollection.badge || 'PDF Collection'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-2">{selectedCollection.title}</h1>
              <p className="text-white/80 text-sm max-w-xl">{selectedCollection.description}</p>
            </div>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0 text-center">
              <div>
                <p className="text-xs text-white/70 font-semibold">Total PDFs</p>
                <p className="text-xl font-black text-white">{selectedCollection.pdfCount.toLocaleString()}</p>
              </div>
              <div className="border-x border-white/15 px-3">
                <p className="text-xs text-white/70 font-semibold">{selectedCollection.metric3Label}</p>
                <p className="text-xl font-black text-white">{selectedCollection.metric3Value}</p>
              </div>
              <div>
                <p className="text-xs text-white/70 font-semibold">Questions</p>
                <p className="text-xl font-black text-white">{selectedCollection.questionCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-xl font-black text-slate-900">Select Subject</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pick a subject to explore topic-wise PDF modules</p>
          </div>
          <Button onClick={handleResetToHome} variant="outline" className="gap-2 text-xs font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Collections
          </Button>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUBJECTS.map((subj) => (
            <div
              key={subj.id}
              onClick={() => handleSelectSubject(subj)}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between gap-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                  {subj.icon}
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900 block">{subj.pdfCount}</span>
                  <span className="text-xs font-semibold text-slate-400">PDF Courses</span>
                </div>
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-xl group-hover:text-blue-600 transition-colors mb-1">
                  {subj.name}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">{subj.topicsCount} Comprehensive Topics</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-black text-blue-600 group-hover:gap-2 transition-all">
                <span>Browse Topics</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── RENDER LEVEL 0: HOMEPAGE (ALL PDF COLLECTIONS) ─────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">

      {/* ── Homepage Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📚</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">PDF Library</h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Choose your preparation stream from targeted PDF collections
          </p>
          {hasActiveFilters && (
            <p className="text-xs text-blue-600 font-bold mt-1.5 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Content tailored to your active exam profile
            </p>
          )}
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white text-sm"
            placeholder="Search collections, topics or PDFs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Continue Learning / Quick Jump Card ── */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shrink-0">
            ⚡
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Continue Learning</span>
            <h3 className="font-black text-base sm:text-lg">Topic-wise PDF Course • Reasoning Puzzles</h3>
            <p className="text-xs text-slate-300 mt-0.5">Linear Puzzle Set 1 • Downloaded 2 days ago</p>
          </div>
        </div>
        <Button
          onClick={() => {
            const topicCol = PDF_COLLECTIONS.find((c) => c.id === 'topic-wise') || PDF_COLLECTIONS[0];
            handleSelectCollection(topicCol);
          }}
          className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-5 py-2.5 rounded-xl shrink-0 gap-1.5"
        >
          Resume Practice <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* ── 🔥 Popular Collections Grid ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900">Popular Collections</h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">Aspirant Favorites</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularCollections.map((col) => (
            <div
              key={col.id}
              onClick={() => handleSelectCollection(col)}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{col.icon}</span>
                  {col.badge && (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {col.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                  {col.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">{col.description}</p>
              </div>

              {/* 3 Metric Pills */}
              <div className="border-t border-slate-100 pt-3">
                <div className="grid grid-cols-3 gap-1 text-center bg-slate-50 p-2 rounded-xl text-[11px] mb-3">
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold">📄 PDFs</span>
                    <span className="font-black text-slate-800">{col.pdfCount}</span>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="text-slate-400 block text-[9px] font-bold">📚 {col.metric3Label}</span>
                    <span className="font-black text-slate-800">{col.metric3Value}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold">❓ Qs</span>
                    <span className="font-black text-slate-800">{col.questionCount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-black text-blue-600 group-hover:gap-1.5 transition-all">
                  <span>Browse Collection</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 📚 All PDF Collections (Full Grid of 10 Cards) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">All PDF Collections</h2>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {filteredCollections.length} Collections Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCollections.map((col) => (
            <div
              key={col.id}
              onClick={() => handleSelectCollection(col)}
              className="bg-white rounded-3xl border border-slate-200 p-6 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                    {col.icon}
                  </div>
                  {col.badge && (
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {col.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-black text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors">
                  {col.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1.5">{col.description}</p>
              </div>

              {/* 3 Metrics Badge Layout */}
              <div>
                <div className="grid grid-cols-3 gap-1.5 text-center bg-slate-50 p-2.5 rounded-2xl text-xs mb-4 border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">📄 PDFs</span>
                    <span className="font-black text-slate-900">{col.pdfCount.toLocaleString()}</span>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold">📚 {col.metric3Label}</span>
                    <span className="font-black text-slate-900">{col.metric3Value}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">❓ Questions</span>
                    <span className="font-black text-slate-900">{col.questionCount}</span>
                  </div>
                </div>

                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl justify-between group-hover:bg-blue-600 transition-colors">
                  <span>Browse Collection</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Premium Bundle Banner ── */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-7 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-black/20 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            ⭐ Premium Complete Package
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">All-in-One Bank & SSC PDF Bundle</h2>
          <p className="text-amber-100 text-xs sm:text-sm max-w-xl">
            Get unlimited access to 50,000+ practice questions, 10-year PYQ solutions, and daily editorial PDF notes.
          </p>
        </div>
        <Button
          onClick={() => {
            const premCol = PDF_COLLECTIONS.find((c) => c.id === 'premium-bundles') || PDF_COLLECTIONS[0];
            handleSelectCollection(premCol);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white font-black text-sm px-6 py-3 rounded-2xl shrink-0 shadow-md gap-2"
        >
          Explore Premium Bundles <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

    </div>
  );
};

export default PDFCourses;
