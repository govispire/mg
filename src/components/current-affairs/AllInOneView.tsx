import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, Download, BookOpen, Zap, Clock, Calendar,
  ArrowRight, ChevronRight, FileText, X, SlidersHorizontal,
  TrendingUp, Globe, Landmark, FlaskConical, Newspaper, Banknote, Building2,
  Sparkles, CheckCircle2, Bookmark, Share2, Layers, Eye, Filter,
  SortAsc, SortDesc, CalendarDays, Award, HelpCircle, CheckCircle, ChevronDown
} from "lucide-react";
import { useCurrentAffairsStore } from "@/hooks/useCurrentAffairsStore";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { generateArticlesPDF } from "@/utils/pdfGenerator";
import { Article } from "@/components/current-affairs/types";
import { Badge } from "@/components/ui/badge";

// ─── Category Configurations ──────────────────────────────────────────────────
const CAT_CFG: Record<string, {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  accentBar: string;
  description: string;
}> = {
  Banking: {
    icon: <Building2 className="w-5 h-5" />,
    iconBg: "bg-emerald-50", iconColor: "text-emerald-600", accentBar: "bg-emerald-500",
    description: "RBI policies, banking regulations, financial schemes, and monetary policy updates relevant to bank exams.",
  },
  Economy: {
    icon: <TrendingUp className="w-5 h-5" />,
    iconBg: "bg-blue-50", iconColor: "text-blue-600", accentBar: "bg-blue-500",
    description: "GDP trends, inflation data, Union Budget announcements, trade figures, and economic policy updates.",
  },
  Science: {
    icon: <FlaskConical className="w-5 h-5" />,
    iconBg: "bg-violet-50", iconColor: "text-violet-600", accentBar: "bg-violet-500",
    description: "Space missions, defence technology, medical breakthroughs, environment news, and innovation updates.",
  },
  Government: {
    icon: <Landmark className="w-5 h-5" />,
    iconBg: "bg-amber-50", iconColor: "text-amber-600", accentBar: "bg-amber-500",
    description: "Central and state government schemes, ministry orders, policy launches, and governance reforms.",
  },
  National: {
    icon: <Newspaper className="w-5 h-5" />,
    iconBg: "bg-rose-50", iconColor: "text-rose-600", accentBar: "bg-rose-500",
    description: "Top domestic headlines, election news, judicial verdicts, and key national events and appointments.",
  },
  International: {
    icon: <Globe className="w-5 h-5" />,
    iconBg: "bg-cyan-50", iconColor: "text-cyan-600", accentBar: "bg-cyan-500",
    description: "Geopolitics, UN developments, bilateral trade agreements, global summits, and foreign affairs updates.",
  },
};

const DEF_CFG = {
  icon: <BookOpen className="w-5 h-5" />,
  iconBg: "bg-slate-50", iconColor: "text-slate-600", accentBar: "bg-slate-400",
  description: "Curated current affairs articles and exam-relevant news updates.",
};

const getCfg = (cat: string) => CAT_CFG[cat] ?? DEF_CFG;

// ─── Time Presets ─────────────────────────────────────────────────────────────
const TIME_RANGES = [
  { id: 'all', label: 'All Time' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '15d', label: 'Last 15 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '2m', label: 'Last 2 Months' },
  { id: '3m', label: 'Last 3 Months' },
  { id: '4m', label: 'Last 4 Months' },
  { id: '6m', label: 'Last 6 Months' },
  { id: '12m', label: 'Last 12 Months' },
  { id: 'cur_month', label: 'Current Month' },
  { id: 'prev_month', label: 'Previous Month' },
];

// ─── Dynamic Topic Compilations (Auto-Generated Tags) ────────────────────────
const DYNAMIC_TOPICS = [
  { id: 'rbi', label: '🏦 RBI & Monetary Policy', tag: 'rbi' },
  { id: 'budget', label: '💰 Union Budget 2026', tag: 'budget' },
  { id: 'schemes', label: '🏛️ Govt Schemes & Yojanas', tag: 'scheme' },
  { id: 'summits', label: '🌍 Global Summits & Deals', tag: 'summit' },
  { id: 'defence', label: '🚀 Space & Defence Tech', tag: 'defence' },
  { id: 'awards', label: '🏆 Awards & Appointments', tag: 'award' },
];

// ─── Date Filtering Helper ───────────────────────────────────────────────────
const parseArticleDate = (dateStr?: string): Date => {
  if (!dateStr) return new Date();
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;
  return new Date();
};

const filterByTimeRange = (articles: Article[], range: string) => {
  if (!articles || articles.length === 0 || range === 'all') return articles;
  
  let refDate = new Date();
  let maxTime = 0;
  articles.forEach(a => {
    if (a && a.date) {
      const t = parseArticleDate(a.date).getTime();
      if (t > maxTime) maxTime = t;
    }
  });
  if (maxTime > 0) {
    refDate = new Date(maxTime);
  }

  return articles.filter(art => {
    if (!art) return false;
    const artDate = parseArticleDate(art.date);
    const diffDays = (refDate.getTime() - artDate.getTime()) / (1000 * 3600 * 24);
    if (diffDays < 0) return true;

    switch (range) {
      case '7d': return diffDays <= 7;
      case '15d': return diffDays <= 15;
      case '30d': return diffDays <= 30;
      case '2m': return diffDays <= 60;
      case '3m': return diffDays <= 90;
      case '4m': return diffDays <= 120;
      case '6m': return diffDays <= 180;
      case '8m': return diffDays <= 240;
      case '12m': return diffDays <= 365;
      case 'cur_month':
        return artDate.getMonth() === refDate.getMonth() && artDate.getFullYear() === refDate.getFullYear();
      case 'prev_month': {
        const prev = new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1);
        return artDate.getMonth() === prev.getMonth() && artDate.getFullYear() === prev.getFullYear();
      }
      default: return true;
    }
  });
};

// ─── Priority Badge ───────────────────────────────────────────────────────────
const PriorityBadge = ({ imp }: { imp: string }) => {
  if (imp === "high")
    return <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700">🔴 High Priority</span>;
  if (imp === "medium")
    return <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">🟡 Medium</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">Normal</span>;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AllInOneView: React.FC = () => {
  const navigate = useNavigate();
  const { getAllInOneByCategory, getNewsArticles } = useCurrentAffairsStore();
  const { getReadingProgress, markAsRead } = useReadingProgress();

  const byCategory = getAllInOneByCategory();
  const categories = Object.keys(byCategory).sort();
  const allArticles = getNewsArticles();

  // State
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedTopicTag, setSelectedTopicTag] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('all');
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "high" | "quiz">("all");
  const [targetExam, setTargetExam] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'priority'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'magazine'>('magazine'); // ⭐ Default to Continuous Reading View!
  const [activeMonthAnchor, setActiveMonthAnchor] = useState<string>('');

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('compilation_bookmarks_set');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('compilation_bookmarks_set', JSON.stringify(Array.from(bookmarkedIds)));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarkedIds]);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtered Articles for active Compilation
  const filteredArticles = useMemo(() => {
    let list: Article[] = [];

    if (selectedTopicTag) {
      const tagLower = selectedTopicTag.toLowerCase();
      list = allArticles.filter(a =>
        (a.category && a.category.toLowerCase().includes(tagLower)) ||
        (a.title && a.title.toLowerCase().includes(tagLower)) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(tagLower))
      );
    } else if (selectedCat) {
      list = byCategory[selectedCat] ?? [];
    } else {
      list = allArticles;
    }

    // Time Range Filter
    list = filterByTimeRange(list, timeRange);

    // Search Query Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.excerpt ?? "").toLowerCase().includes(q) ||
        (a.content ?? "").toLowerCase().includes(q)
      );
    }

    // Filter Pills
    if (filter === "high") list = list.filter(a => a.importance === "high");
    if (filter === "quiz") list = list.filter(a => a.hasQuiz);

    // Exam Filter
    if (targetExam !== 'all') {
      list = list.filter(a => {
        const cat = a.category.toLowerCase();
        if (targetExam === 'banking') return cat.includes('bank') || cat.includes('economy');
        if (targetExam === 'ssc') return cat.includes('national') || cat.includes('scheme');
        if (targetExam === 'upsc') return true;
        return true;
      });
    }

    // Sort Order
    return [...list].sort((a, b) => {
      if (sortOrder === 'priority') {
        const pMap: Record<string, number> = { high: 3, medium: 2, normal: 1 };
        return (pMap[b.importance] || 1) - (pMap[a.importance] || 1);
      }
      const dA = parseArticleDate(a.date).getTime();
      const dB = parseArticleDate(b.date).getTime();
      return sortOrder === 'newest' ? dB - dA : dA - dB;
    });
  }, [selectedCat, selectedTopicTag, byCategory, allArticles, timeRange, search, filter, targetExam, sortOrder]);

  // Group Articles by Month for Continuous Reading View
  const monthlyGroups = useMemo(() => {
    const groups: Record<string, Article[]> = {};
    filteredArticles.forEach(art => {
      const d = parseArticleDate(art.date);
      const monthYear = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(art);
    });
    return groups;
  }, [filteredArticles]);

  const monthKeys = Object.keys(monthlyGroups);

  // Calculate Reading Progress Pct
  const readCount = useMemo(() => {
    return filteredArticles.filter(a => getReadingProgress(a.id) >= 100).length;
  }, [filteredArticles, getReadingProgress]);

  const readingProgressPct = filteredArticles.length > 0
    ? Math.round((readCount / filteredArticles.length) * 100)
    : 0;

  const openCat = (cat: string) => {
    setSelectedCat(cat);
    setSelectedTopicTag(null);
    setSearch("");
    setFilter("all");
  };

  const openTopicTag = (tag: string) => {
    setSelectedTopicTag(tag);
    setSelectedCat(null);
    setSearch("");
    setFilter("all");
  };

  const currentCompilationTitle = selectedTopicTag
    ? DYNAMIC_TOPICS.find(t => t.tag === selectedTopicTag)?.label || 'Topic Compilation'
    : selectedCat || 'All Compilations';

  /* ════════════════════════════════════════════════════════════════════════
     LEVEL 2 — Compilation Studio View (Card Grid vs Continuous Reading Mode)
  ════════════════════════════════════════════════════════════════════════ */
  if (selectedCat || selectedTopicTag) {
    const cfg = getCfg(selectedCat || 'Banking');

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <button
              onClick={() => { setSelectedCat(null); setSelectedTopicTag(null); }}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Compilations</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-extrabold text-slate-900">{currentCompilationTitle}</span>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setViewMode('magazine')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                viewMode === 'magazine'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📖 Continuous Reading</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>🎴 Card Grid</span>
            </button>
          </div>
        </div>

        {/* ── Compilation Banner & Summary Header ── */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-300 text-xs font-black">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Knowledge Compilation System</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {currentCompilationTitle} Compilation
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Read all curated news in one continuous stream. Filter by time duration, target exams, or download consolidated PDFs for exam revision.
              </p>
            </div>

            {/* Stats Badge & Export Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl flex flex-col justify-center">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1 gap-4">
                  <span>Reading Progress</span>
                  <span className="text-amber-300 font-black">{readingProgressPct}%</span>
                </div>
                <div className="w-44 h-2 bg-slate-900/60 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500" style={{ width: `${readingProgressPct}%` }} />
                </div>
                <p className="text-[10px] text-slate-300 mt-1 font-semibold">
                  {readCount} of {filteredArticles.length} articles read
                </p>
              </div>

              <button
                onClick={() => generateArticlesPDF(filteredArticles, `${currentCompilationTitle} Compilation`)}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl transition-all shadow-md active:scale-95 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Multi-Dimensional Filter Control Panel ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* Time Duration Range Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
              <span className="uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Select Time Duration
              </span>
              <span className="text-slate-400 font-semibold">{filteredArticles.length} Articles Found</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
              {TIME_RANGES.map(tr => (
                <button
                  key={tr.id}
                  onClick={() => setTimeRange(tr.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    timeRange === tr.id
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tr.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Search + Exam + Priority Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Search within ${currentCompilationTitle}...`}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Exam Selector */}
            <div className="sm:col-span-3">
              <select
                value={targetExam}
                onChange={e => setTargetExam(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="all">🎯 All Exam Types</option>
                <option value="banking">🏦 Banking (IBPS / SBI PO)</option>
                <option value="ssc">🏛️ SSC CGL & Govt</option>
                <option value="upsc">🇮🇳 UPSC Civil Services</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="sm:col-span-3">
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as any)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="newest">🕒 Newest First</option>
                <option value="oldest">⌛ Oldest First</option>
                <option value="priority">🔴 Priority Order</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── CONTINUOUS READING MODE ("MAGAZINE MODE") ── */}
        {viewMode === 'magazine' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sticky Monthly Timeline Sidebar (3 Cols) */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-20 bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <span>Monthly Timeline</span>
                </div>

                <div className="space-y-1">
                  {monthKeys.map(mKey => (
                    <a
                      key={mKey}
                      href={`#month-${mKey.replace(/\s+/g, '-')}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(`month-${mKey.replace(/\s+/g, '-')}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                        setActiveMonthAnchor(mKey);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeMonthAnchor === mKey
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{mKey}</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-black">
                        {monthlyGroups[mKey].length}
                      </span>
                    </a>
                  ))}
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] font-semibold text-blue-900 leading-relaxed">
                  💡 Scroll continuously to read news chronologically like a magazine.
                </div>
              </div>
            </div>

            {/* Continuous Magazine Reading Stream (9 Cols) */}
            <div className="lg:col-span-9 space-y-8">
              {filteredArticles.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white space-y-2">
                  <BookOpen className="h-12 w-12 text-slate-300 mx-auto" />
                  <h3 className="text-base font-black text-slate-800">No Articles Found</h3>
                  <p className="text-xs text-slate-500 font-medium">Try adjusting your time range or clear filters.</p>
                </div>
              ) : (
                monthKeys.map(month => (
                  <div key={month} id={`month-${month.replace(/\s+/g, '-')}`} className="space-y-4 scroll-mt-24">
                    {/* Month Section Header */}
                    <div className="sticky top-16 z-20 bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2 text-sm font-black tracking-wide">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span>{month.toUpperCase()}</span>
                      </div>
                      <Badge variant="outline" className="border-blue-400/40 text-blue-200 bg-blue-500/10 text-xs font-bold">
                        {monthlyGroups[month].length} News Updates
                      </Badge>
                    </div>

                    {/* Articles Stream in Month */}
                    <div className="space-y-5">
                      {monthlyGroups[month].map((art, idx) => {
                        const isRead = getReadingProgress(art.id) >= 100;
                        const isBookmarked = bookmarkedIds.has(art.id);

                        return (
                          <div
                            key={art.id}
                            className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-4 relative group"
                          >
                            {/* Article Top Meta */}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <PriorityBadge imp={art.importance} />
                                <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                  {art.category}
                                </span>
                                {isRead && (
                                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Read
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" />{art.date}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" />{art.readTime}</span>
                                <button
                                  onClick={(e) => toggleBookmark(art.id, e)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isBookmarked ? 'bg-amber-100 text-amber-700' : 'hover:bg-slate-100 text-slate-400'
                                  }`}
                                >
                                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                </button>
                              </div>
                            </div>

                            {/* Article Headline */}
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                              {art.title}
                            </h3>

                            {/* Article Image & Content Body */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
                              {art.image && (
                                <div className="md:col-span-5 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video md:aspect-auto">
                                  <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                              )}

                              <div className={`${art.image ? 'md:col-span-7' : 'md:col-span-12'} space-y-3`}>
                                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                                  {art.excerpt}
                                </p>
                                
                                {art.content && (
                                  <p className="text-xs text-slate-600 leading-relaxed font-normal bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                                    {art.content.length > 300 ? `${art.content.slice(0, 300)}...` : art.content}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Actions & Practice Quiz Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => markAsRead(art.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{isRead ? 'Completed' : 'Mark as Read'}</span>
                                </button>
                                
                                <button
                                  onClick={() => navigate(`/current-affairs/${art.id}`)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all"
                                >
                                  <span>Full Article</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {art.hasQuiz && (
                                <button
                                  onClick={() => navigate('/student/daily-quizzes')}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-xs transition-all"
                                >
                                  <Zap className="w-3.5 h-3.5 fill-current" />
                                  <span>Take Practice Quiz</span>
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        ) : (
          /* CARD GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredArticles.map((article) => {
              const progress = getReadingProgress(article.id);
              const isBookmarked = bookmarkedIds.has(article.id);

              return (
                <div
                  key={article.id}
                  onClick={() => navigate(`/current-affairs/${article.id}`)}
                  className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {progress >= 100 && (
                      <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">✓ Read</div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1 gap-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <PriorityBadge imp={article.importance} />
                      <button onClick={(e) => toggleBookmark(article.id, e)} className="text-slate-400 hover:text-amber-500 transition-colors">
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">{article.excerpt}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2.5 border-t border-slate-100 mt-auto">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-400" />{article.date}</span>
                      <span className="flex items-center gap-0.5 font-extrabold text-blue-600 group-hover:translate-x-0.5 transition-transform">Read <ArrowRight className="h-3 w-3" /></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     LEVEL 1 — Main Compilations Directory (Category Grid + Topic Compilations)
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Current Affairs Knowledge Compilations</h2>
          <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
            Automatic time-based compilations, topic-wise digests, and continuous reading magazine views.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 font-bold text-xs px-3 py-1">
            ⚡ Automatic Sync from Daily News
          </Badge>
        </div>
      </div>

      {/* ── DYNAMIC TOPIC COMPILATIONS (AUTO-GENERATED TAGS STRIP) ── */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50 rounded-3xl p-5 border border-blue-100 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-blue-900">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Dynamic Topic Compilations (Exam Specific)
          </span>
          <span className="text-blue-600 text-[11px] font-bold">Auto-generated from tags</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide py-1">
          {DYNAMIC_TOPICS.map(dt => (
            <button
              key={dt.id}
              onClick={() => openTopicTag(dt.tag)}
              className="px-4 py-2 rounded-2xl bg-white border border-blue-200/90 hover:border-blue-400 text-slate-800 hover:text-blue-700 font-extrabold text-xs shadow-2xs transition-all whitespace-nowrap flex items-center gap-1.5 group hover:scale-105 active:scale-95 shrink-0"
            >
              <span>{dt.label}</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </div>

      {/* ── CATEGORY COMPILATION DIRECTORY GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const articles = byCategory[cat] || [];
          const quizCount = articles.filter(a => a && a.hasQuiz).length;
          const cfg = getCfg(cat);

          return (
            <div
              key={cat}
              onClick={() => openCat(cat)}
              className="group relative flex flex-col justify-between p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${cfg.accentBar}`} />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 ${cfg.iconBg} ${cfg.iconColor} rounded-2xl shrink-0 shadow-2xs`}>
                    {cfg.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {cat}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Compilation Module</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-medium">
                  {cfg.description}
                </p>

                <div className="flex items-center gap-2 pt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    {articles.length} Articles
                  </span>
                  {quizCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-amber-800 bg-amber-50 rounded-xl border border-amber-200/60">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {quizCount} Quizzes
                    </span>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center gap-2.5 mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={e => { e.stopPropagation(); generateArticlesPDF(articles, `${cat} Compilation`); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shrink-0"
                  title="Download Compilation PDF"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={e => { e.stopPropagation(); openCat(cat); }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-95"
                >
                  <span>Explore Compilation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllInOneView;
