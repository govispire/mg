
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileText, TrendingUp, Award, Percent, CheckCircle, X } from 'lucide-react';
import { TestAnalysisData } from '@/data/testAnalysisData';
import { PassFailAnimation } from './PassFailAnimation';
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
  const [activeTab, setActiveTab] = useState("overall");
  const isMobile = useIsMobile();

  const tabs = [
    { value: "overall", label: "Overall", icon: TrendingUp },
    { value: "strongweak", label: "Strengths", icon: CheckCircle },
    { value: "topic", label: "Topics", icon: FileText },
    { value: "progress", label: "Progress", icon: Award },
    { value: "comparative", label: "Compare", icon: Percent }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl h-[95vh] max-h-[95vh] overflow-y-auto p-0 animate-modal-enter">
        <div className="bg-background py-3 px-3 sm:py-4 sm:px-5 h-full">
          {/* Header Section */}
          <DialogHeader className="mb-2 sm:mb-3">
            <div className="flex flex-col gap-2 sm:gap-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-2">
                  <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 text-gray-900 leading-tight">
                    📊 Test Result Analysis
                  </DialogTitle>
                  <div className="space-y-1">
                    <div className="font-semibold text-sm sm:text-base text-gray-800 leading-tight">
                      {analysisData.testName}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-2 flex-wrap">
                      <span>📅 {analysisData.date}</span>
                      <Badge variant="outline" className={`text-xs ${analysisData.passed ? "text-green-600" : "text-red-600"}`}>
                        {analysisData.passed ? "PASSED" : "NEEDS IMPROVEMENT"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
                <Button variant="outline" size="sm" className="test-action-button text-xs whitespace-nowrap flex-shrink-0">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  {isMobile ? "Test" : "Test Page"}
                </Button>
                <Button
                  size="sm"
                  className="test-action-button text-xs whitespace-nowrap flex-shrink-0"
                  onClick={onViewSolutions}
                  disabled={!onViewSolutions}
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Solution
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Pass/Fail Banner */}
          <div className="mb-2 sm:mb-3">
            <PassFailAnimation
              passed={analysisData.passed}
              score={analysisData.sectionWiseData?.reduce((s, sec) => s + sec.score, 0)}
              maxScore={analysisData.sectionWiseData?.reduce((s, sec) => s + sec.maxScore, 0)}
              percentile={analysisData.percentile}
              rank={analysisData.rank}
              totalStudents={analysisData.totalStudents}
              accuracy={(() => {
                const att = analysisData.sectionWiseData?.reduce((s, sec) => s + sec.attempted, 0) || 0;
                const cor = analysisData.sectionWiseData?.reduce((s, sec) => s + sec.correct, 0) || 0;
                return att > 0 ? Math.round((cor / att) * 100) : 0;
              })()}
            />
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-2 sm:mb-3">
              <TabsList className="grid w-full grid-cols-5 gap-0 sm:gap-0.5 bg-gray-100 p-0.5 sm:p-1 rounded-lg h-auto">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex flex-col items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs px-0.5 sm:px-2 py-1 sm:py-2 lg:py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm min-h-[40px] sm:min-h-[48px] rounded"
                  >
                    <tab.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="leading-tight text-center">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="animate-chart-reveal flex-1 overflow-hidden">
              <TabsContent value="overall" className="mt-0 h-full">
                <OverallAnalysisTab analysisData={analysisData} />
              </TabsContent>

              <TabsContent value="strongweak" className="mt-0 h-full">
                <StrongWeakAnalysisTab analysisData={analysisData} />
              </TabsContent>

              <TabsContent value="topic" className="mt-0 h-full">
                <TopicAnalysisTab analysisData={analysisData} />
              </TabsContent>

              <TabsContent value="progress" className="mt-0 h-full">
                <ProgressAnalysisTab analysisData={analysisData} />
              </TabsContent>

              <TabsContent value="comparative" className="mt-0 h-full">
                <ComparativeInsightsTab analysisData={analysisData} />
              </TabsContent>
            </div>
          </Tabs>

        </div>
      </DialogContent>
    </Dialog>
  );
};
