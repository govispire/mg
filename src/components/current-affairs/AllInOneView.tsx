import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, Download, BookOpen, Zap, Clock, Calendar,
  ArrowRight, ChevronRight, FileText, X, SlidersHorizontal,
  TrendingUp, Globe, Landmark, FlaskConical, Newspaper, Banknote, Building2,
} from "lucide-react";
import { useCurrentAffairsStore } from "@/hooks/useCurrentAffairsStore";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { generateTopicPDF } from "@/utils/pdfGenerator";

// ─── Category config — colours ONLY for icon/accent, not CTA ─────────────────
const CAT_CFG: Record<string, {
  icon: React.ReactNode;
  iconBg: string;        // icon container background
  iconColor: string;     // icon color
  accentBar: string;     // top 1px accent line
  description: string;
}> = {
  Banking: {
    icon: <Building2 className="w-5 h-5" />,
    iconBg: "bg-emerald-50", iconColor: "text-emerald-600", accentBar: "bg-emerald-400",
    description: "RBI policies, banking regulations, financial schemes, and monetary policy updates relevant to bank exams.",
  },
  Economy: {
    icon: <TrendingUp className="w-5 h-5" />,
    iconBg: "bg-blue-50", iconColor: "text-blue-600", accentBar: "bg-blue-400",
    description: "GDP trends, inflation data, Union Budget announcements, trade figures, and economic policy updates.",
  },
  Science: {
    icon: <FlaskConical className="w-5 h-5" />,
    iconBg: "bg-violet-50", iconColor: "text-violet-600", accentBar: "bg-violet-400",
    description: "Space missions, defence technology, medical breakthroughs, environment news, and innovation updates.",
  },
  Government: {
    icon: <Landmark className="w-5 h-5" />,
    iconBg: "bg-amber-50", iconColor: "text-amber-600", accentBar: "bg-amber-400",
    description: "Central and state government schemes, ministry orders, policy launches, and governance reforms.",
  },
  National: {
    icon: <Newspaper className="w-5 h-5" />,
    iconBg: "bg-rose-50", iconColor: "text-rose-600", accentBar: "bg-rose-400",
    description: "Top domestic headlines, election news, judicial verdicts, and key national events and appointments.",
  },
  International: {
    icon: <Globe className="w-5 h-5" />,
    iconBg: "bg-cyan-50", iconColor: "text-cyan-600", accentBar: "bg-cyan-400",
    description: "Geopolitics, UN developments, bilateral trade agreements, global summits, and foreign affairs updates.",
  },
};
const DEF_CFG = {
  icon: <BookOpen className="w-5 h-5" />,
  iconBg: "bg-slate-50", iconColor: "text-slate-600", accentBar: "bg-slate-400",
  description: "Curated current affairs articles and exam-relevant news updates.",
};
const getCfg = (cat: string) => CAT_CFG[cat] ?? DEF_CFG;

// ─── Priority badge ───────────────────────────────────────────────────────────
const PriorityBadge = ({ imp }: { imp: string }) => {
  if (imp === "high")
    return <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700">🔴 High Priority</span>;
  if (imp === "medium")
    return <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">🟡 Medium</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">Normal</span>;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AllInOneView: React.FC = () => {
  const navigate = useNavigate();
  const { getAllInOneByCategory } = useCurrentAffairsStore();
  const { getReadingProgress } = useReadingProgress();

  const byCategory = getAllInOneByCategory();
  const categories = Object.keys(byCategory).sort();

  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState<"all" | "high" | "quiz">("all");

  const catArticles = useMemo(() => {
    if (!selectedCat) return [];
    let arts = byCategory[selectedCat] ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      arts = arts.filter(a =>
        a.title.toLowerCase().includes(q) || (a.excerpt ?? "").toLowerCase().includes(q)
      );
    }
    if (filter === "high") arts = arts.filter(a => a.importance === "high");
    if (filter === "quiz") arts = arts.filter(a => a.hasQuiz);
    return arts;
  }, [selectedCat, byCategory, search, filter]);

  const openCat = (cat: string) => { setSelectedCat(cat); setSearch(""); setFilter("all"); };

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (categories.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
        <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-extrabold text-slate-800">No Articles Yet</h3>
        <p className="text-xs text-slate-400 mt-1">Articles will appear here grouped by category.</p>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     LEVEL 2 — Category Article View
  ════════════════════════════════════════════════════════════════════════ */
  if (selectedCat) {
    const cfg        = getCfg(selectedCat);
    const allForCat  = byCategory[selectedCat] ?? [];
    const quizCount  = allForCat.filter(a => a.hasQuiz).length;
    const highCount  = allForCat.filter(a => a.importance === "high").length;

    return (
      <div className="space-y-5" style={{ animation: "slideInRight 0.26s ease" }}>
        <style>{`@keyframes slideInRight{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}`}</style>

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => setSelectedCat(null)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Categories
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-extrabold text-slate-900">{selectedCat}</span>
        </div>

        {/* ── Header Banner ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`${cfg.iconBg} ${cfg.iconColor} w-12 h-12 rounded-2xl flex items-center justify-center shrink-0`}>
                {cfg.icon}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">{selectedCat}</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 max-w-lg leading-relaxed">{cfg.description}</p>
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />{allForCat.length} Articles
                  </span>
                  {quizCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 rounded-lg">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />{quizCount} Quizzes
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); generateTopicPDF(allForCat, selectedCat); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-colors shadow-sm shrink-0">
              <Download className="w-4 h-4 text-slate-500" /> Download PDF
            </button>
          </div>

          {/* Search + Filter */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`Search within ${selectedCat}…`}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl px-1.5 py-1.5 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-1" />
              {(["all", "high", "quiz"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filter === f ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-white"
                  }`}>
                  {f === "all" ? "All" : f === "high" ? "🔴 High Priority" : "⚡ Has Quiz"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Articles grid */}
        {catArticles.length === 0 ? (
          <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-extrabold text-slate-800">No articles match your filter</h3>
            <p className="text-xs text-slate-400 mt-1">Try changing the filter or clearing the search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {catArticles.map((article, idx) => {
              const progress = getReadingProgress(article.id);
              return (
                <div key={article.id}
                  onClick={() => navigate(`/current-affairs/${article.id}`, { state: { from: "/student/current-affairs", tab: "all-in-one" } })}
                  className="group bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img src={article.image} alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                        <div className="h-full bg-emerald-400" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                    {progress >= 100 && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">✓ Read</div>
                    )}
                  </div>
                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1 gap-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <PriorityBadge imp={article.importance} />
                      {article.hasQuiz && (
                        <button onClick={e => { e.stopPropagation(); navigate("/student/daily-quizzes"); }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 flex items-center gap-1 transition-colors">
                          <Zap className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /> Take Quiz
                        </button>
                      )}
                    </div>
                    <h3 className="text-sm font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2 flex-1">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">{article.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2.5 border-t border-slate-100 mt-auto">
                      <div className="flex items-center gap-3 font-semibold">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-400" />{article.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-slate-400" />{article.readTime}</span>
                      </div>
                      <span className="flex items-center gap-0.5 font-extrabold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                        Read <ArrowRight className="h-3 w-3" />
                      </span>
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
     LEVEL 1 — Category Directory Grid
  ════════════════════════════════════════════════════════════════════════ */
  const totalArticles = Object.values(byCategory).reduce((s, a) => s + a.length, 0);

  return (
    <div className="space-y-6" style={{ animation: "slideInLeft 0.26s ease" }}>
      <style>{`@keyframes slideInLeft{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}`}</style>

      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Current Affairs Compilations</h2>
          <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
            Select a category to explore curated articles and download monthly PDFs.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0">
          <FileText className="w-3.5 h-3.5" />
          {categories.length} Categories · {totalArticles} Articles
        </div>
      </div>

      {/* ── Category Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const articles  = byCategory[cat];
          const quizCount = articles.filter(a => a.hasQuiz).length;
          const highCount = articles.filter(a => a.importance === "high").length;
          const cfg       = getCfg(cat);

          return (
            /* Full card is clickable */
            <div
              key={cat}
              onClick={() => openCat(cat)}
              className="group relative flex flex-col justify-between p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              {/* Top accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl ${cfg.accentBar}`} />

              <div>
                {/* Logo (left) + Category Name (right) */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 ${cfg.iconBg} ${cfg.iconColor} rounded-xl shrink-0`}>
                    {cfg.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                    {cat}
                  </h3>
                </div>

                {/* Description — relaxed clamp, no early ellipsis */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {cfg.description}
                </p>

                {/* Content metrics */}
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {articles.length} Articles
                  </span>
                  {quizCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 rounded-lg">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {quizCount} Quizzes
                    </span>
                  )}
                </div>
              </div>

              {/* ── Action Footer ── */}
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
                {/* PDF — explicit label, stop card click */}
                <button
                  onClick={e => { e.stopPropagation(); generateTopicPDF(articles, cat); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  title="Download Category PDF"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  PDF
                </button>

                {/* Primary CTA — blue button */}
                <button
                  onClick={e => { e.stopPropagation(); openCat(cat); }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs rounded-lg transition-all shadow-sm"
                >
                  Explore Articles
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
