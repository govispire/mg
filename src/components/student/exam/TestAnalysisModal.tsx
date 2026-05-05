
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen, FileText, TrendingUp, Award, Percent, CheckCircle,
  X, Calendar, Clock, Timer, ChevronLeft, BarChart3, Map
} from 'lucide-react';
import { TestAnalysisData } from '@/data/testAnalysisData';
import { OverallAnalysisTab } from './OverallAnalysisTab';
import { StrongWeakAnalysisTab } from './StrongWeakAnalysisTab';
import { TopicAnalysisTab } from './TopicAnalysisTab';
import { ProgressAnalysisTab } from './ProgressAnalysisTab';
import { ComparativeInsightsTab } from './ComparativeInsightsTab';
import { useIsMobile } from '@/hooks/use-mobile';

interface TestAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: TestAnalysisData;
  onViewSolutions?: () => void;
}

export const TestAnalysisModal: React.FC<TestAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysisData,
  onViewSolutions
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();

  // Derived totals
  const totalScore    = analysisData.sectionWiseData.reduce((s, sec) => s + sec.score, 0);
  const sumMaxScore   = analysisData.sectionWiseData.reduce((s, sec) => s + sec.maxScore, 0);
  const totalAttempted = analysisData.sectionWiseData.reduce((s, sec) => s + sec.attempted, 0);
  const totalCorrect  = analysisData.sectionWiseData.reduce((s, sec) => s + sec.correct, 0);
  const overallAccuracy = totalAttempted > 0 ? parseFloat(((totalCorrect / totalAttempted) * 100).toFixed(2)) : 0;

  // Mock improvement vs last test
  const improvement = '+18.6%';
  const improvementPositive = true;

  const tabs = [
    { value: 'overview',   label: 'Overview',      icon: TrendingUp  },
    { value: 'sectionwise',label: 'Section Wise',   icon: BarChart3   },
    { value: 'strongweak', label: 'Strengths',      icon: CheckCircle },
    { value: 'topic',      label: 'Topics',         icon: FileText    },
    { value: 'progress',   label: 'Time Analysis',  icon: Timer       },
    { value: 'comparative',label: 'Compare',        icon: Percent     },
  ];

  const statCards = [
    {
      label: 'Score',
      value: `${totalScore} / ${sumMaxScore}`,
      sub: 'Good Performance',
      subColor: 'text-green-600',
      accent: 'text-green-600',
      large: true,
    },
    {
      label: 'Percentile',
      value: analysisData.percentile.toFixed(2),
      sub: `You're in top ${(100 - analysisData.percentile).toFixed(2)}%`,
      subColor: 'text-blue-600',
      accent: 'text-blue-600',
      tag: true,
    },
    {
      label: 'Accuracy',
      value: `${overallAccuracy}%`,
      sub: `${totalCorrect} / ${sumMaxScore}`,
      subColor: 'text-gray-500',
      accent: 'text-gray-800',
    },
    {
      label: 'Rank',
      value: analysisData.rank.toLocaleString(),
      sub: `Out of ${analysisData.totalStudents.toLocaleString()}`,
      subColor: 'text-gray-500',
      accent: 'text-gray-800',
    },
    {
      label: 'Improvement',
      value: improvement,
      sub: 'Better than last test',
      subColor: 'text-green-600',
      accent: 'text-green-600',
    },
  ];

  // Subject tags from sections
  const subjectTags = analysisData.sectionWiseData.map(s => s.sectionName);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-w-6xl h-[96vh] max-h-[96vh] overflow-hidden p-0 rounded-2xl border border-gray-200 shadow-2xl bg-white flex flex-col">

        {/* ── Top Header ─────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100">
          {/* Exam title row */}
          <div className="flex items-start justify-between px-5 pt-4 pb-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Test Analysis</h1>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 h-auto rounded-lg gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {!isMobile && 'Review Test'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold border-gray-200 px-3 py-1.5 h-auto rounded-lg gap-1.5"
                onClick={onViewSolutions}
                disabled={!onViewSolutions}
              >
                <FileText className="w-3.5 h-3.5" />
                {!isMobile && 'View Solutions'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold border-gray-200 px-3 py-1.5 h-auto rounded-lg gap-1.5"
              >
                <Map className="w-3.5 h-3.5" />
                {!isMobile && 'Weakness Map'}
              </Button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors ml-1"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Exam info card */}
          <div className="px-5 pb-3">
            <div className="flex items-start gap-4">
              {/* Exam icon */}
              <div className="w-14 h-14 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-gray-900 leading-tight">{analysisData.testName}</h2>
                <p className="text-xs text-gray-500 mb-2">Full Syllabus Mock Test</p>
                {/* Subject tags */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {subjectTags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 text-[11px] text-gray-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {tag}
                    </span>
                  ))}
                </div>
                {/* Date / Time / Duration */}
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {analysisData.date}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Clock className="w-3 h-3" />
                    10:00 AM – 11:00 AM
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Timer className="w-3 h-3" />
                    {analysisData.maxTime} Minutes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stat bar ─────────────────────────────────── */}
          <div className="border-t border-gray-100 grid grid-cols-5 divide-x divide-gray-100">
            {statCards.map((stat, i) => (
              <div key={i} className="px-4 py-3 text-center">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                {stat.tag ? (
                  <>
                    <p className={`text-xl font-extrabold leading-none ${stat.accent} mb-1`}>
                      {stat.value}
                    </p>
                    <span className="inline-block text-[10px] bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2 py-0.5 font-medium">
                      {stat.sub}
                    </span>
                  </>
                ) : (
                  <>
                    <p className={`text-xl font-extrabold leading-none ${stat.accent} mb-1`}>
                      {stat.value}
                    </p>
                    <p className={`text-[10px] font-medium ${stat.subColor}`}>{stat.sub}</p>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* ── Tab strip ────────────────────────────────── */}
          <div className="border-t border-gray-100 overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max">
              {tabs.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-1.5 px-5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.value
                      ? 'border-green-600 text-green-700 bg-green-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab Content ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverallAnalysisTab analysisData={analysisData} />
          )}
          {activeTab === 'sectionwise' && (
            <OverallAnalysisTab analysisData={analysisData} defaultSection />
          )}
          {activeTab === 'strongweak' && (
            <StrongWeakAnalysisTab analysisData={analysisData} />
          )}
          {activeTab === 'topic' && (
            <TopicAnalysisTab analysisData={analysisData} />
          )}
          {activeTab === 'progress' && (
            <ProgressAnalysisTab analysisData={analysisData} />
          )}
          {activeTab === 'comparative' && (
            <ComparativeInsightsTab analysisData={analysisData} />
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
};
