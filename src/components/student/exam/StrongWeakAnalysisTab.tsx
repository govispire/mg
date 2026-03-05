
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestAnalysisData } from '@/data/testAnalysisData';

interface StrongWeakAnalysisTabProps {
  analysisData: TestAnalysisData;
}

const strengthColor: Record<string, { badge: string; text: string }> = {
  Excellent: { badge: 'bg-green-100 text-green-700 border-green-200', text: 'text-green-700' },
  Good: { badge: 'bg-blue-100 text-blue-700 border-blue-200', text: 'text-blue-700' },
  Average: { badge: 'bg-amber-100 text-amber-700 border-amber-200', text: 'text-amber-700' },
  Poor: { badge: 'bg-red-100 text-red-700 border-red-200', text: 'text-red-700' },
};

const qBgColor = (status: 'correct' | 'wrong' | 'unattempted') => {
  if (status === 'correct') return 'bg-green-500 text-white';
  if (status === 'wrong') return 'bg-red-500 text-white';
  return 'bg-gray-300 text-gray-600';
};

const formatTime = (secs: number) => {
  if (!secs) return '—';
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
};

export const StrongWeakAnalysisTab: React.FC<StrongWeakAnalysisTabProps> = ({ analysisData }) => {
  const sections = analysisData.sectionTopicBreakdown ?? [];

  if (sections.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-gray-500">
        No section data available.
      </Card>
    );
  }

  const [activeSection, setActiveSection] = useState(sections[0]?.sectionId ?? '');

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">My Strong / Weak Areas</h3>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        {/* Section tabs */}
        <div className="overflow-x-auto">
          <TabsList className="h-8 bg-[#003366] rounded-md px-1 gap-0.5 min-w-max">
            {sections.map(sec => (
              <TabsTrigger
                key={sec.sectionId}
                value={sec.sectionId}
                className="text-xs px-3 h-7 rounded text-white/70 data-[state=active]:bg-white data-[state=active]:text-[#003366] data-[state=active]:font-semibold whitespace-nowrap"
              >
                {sec.sectionName}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Per-section topic table */}
        {sections.map(sec => (
          <TabsContent key={sec.sectionId} value={sec.sectionId} className="mt-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">{sec.sectionName}</h4>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="text-left px-3 py-2 font-medium text-gray-600 min-w-[140px]">Topic</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600 min-w-[90px]">
                      Topic Strength
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600 min-w-[200px]">Questions</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600 min-w-[100px]">Level</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600 min-w-[70px]">Score</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600 min-w-[70px]">Accuracy</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600 min-w-[60px]">Speed</th>
                  </tr>
                </thead>
                <tbody>
                  {sec.topics.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-center text-gray-400 italic">No topic data</td>
                    </tr>
                  ) : (
                    sec.topics.map((t, i) => {
                      const sc = strengthColor[t.strength] ?? strengthColor.Poor;
                      const scoreDisplay = t.totalAttempted === 0
                        ? '0.00%'
                        : `${((t.score / t.maxScore) * 100).toFixed(2)}%`;
                      const accDisplay = t.totalAttempted === 0
                        ? '0.00%'
                        : `${t.accuracy.toFixed(2)}%`;

                      return (
                        <tr key={t.topic} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                          {/* Topic name */}
                          <td className="px-3 py-2 font-medium text-gray-800">{t.topic}</td>

                          {/* Strength badge */}
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${sc.badge}`}>
                              {t.strength}
                            </span>
                          </td>

                          {/* Question number circles */}
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1">
                              {t.questionNumbers.map((qn, idx) => (
                                <span
                                  key={qn}
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${qBgColor(t.questionStatuses[idx])}`}
                                >
                                  {qn}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Level */}
                          <td className="px-3 py-2 text-gray-500">{t.levels || '—'}</td>

                          {/* Score % */}
                          <td className={`px-3 py-2 text-right font-medium ${sc.text}`}>
                            {scoreDisplay}
                          </td>

                          {/* Accuracy */}
                          <td className={`px-3 py-2 text-right font-medium ${sc.text}`}>
                            {accDisplay}
                          </td>

                          {/* Speed */}
                          <td className="px-3 py-2 text-right text-gray-500">
                            {formatTime(t.avgTimeSeconds)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Section summary pills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {['Excellent', 'Good', 'Average', 'Poor'].map(s => {
                const count = sec.topics.filter(t => t.strength === s).length;
                if (!count) return null;
                const c = strengthColor[s];
                return (
                  <span key={s} className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border font-medium ${c.badge}`}>
                    {s}: {count} topic{count > 1 ? 's' : ''}
                  </span>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
