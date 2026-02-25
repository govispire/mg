
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileText, TrendingUp, Award, Percent, CheckCircle, Download, Share2, RefreshCcw, X } from 'lucide-react';
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

  const statCards = [
    {
      title: "Score",
      value: `${analysisData.score}/${analysisData.maxScore}`,
      icon: TrendingUp,
      gradient: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      textColor: "text-blue-600"
    },
    {
      title: "Rank",
      value: `${analysisData.rank}/${analysisData.totalStudents}`,
      icon: Award,
      gradient: "from-purple-50 to-purple-100",
      border: "border-purple-200",
      textColor: "text-purple-600"
    },
    {
      title: "Percentile",
      value: `${analysisData.percentile}%`,
      icon: Percent,
      gradient: "from-amber-50 to-amber-100",
      border: "border-amber-200",
      textColor: "text-amber-600"
    },
    {
      title: "Accuracy",
      value: `${analysisData.accuracy}%`,
      icon: CheckCircle,
      gradient: "from-green-50 to-green-100",
      border: "border-green-200",
      textColor: "text-green-600"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl h-[95vh] max-h-[95vh] overflow-y-auto p-0 animate-modal-enter">
        <div className="bg-background py-3 px-3 sm:py-4 sm:px-4 lg:py-6 lg:px-6 h-full">
          {/* Header Section */}
          <DialogHeader className="mb-4 sm:mb-6">
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

              {/* Action Buttons - Mobile Optimized */}
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

          {/* Pass/Fail Animation */}
          <div className="mb-4 sm:mb-6">
            <PassFailAnimation passed={analysisData.passed} />
          </div>

          {/* Stats Cards - Improved Mobile Layout */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
            {statCards.map((stat, index) => (
              <Card
                key={stat.title}
                className={`p-2 sm:p-3 lg:p-4 bg-gradient-to-br ${stat.gradient} ${stat.border} border animate-slide-up test-card`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1 truncate">
                      {stat.title}
                    </div>
                    <div className={`text-xs sm:text-sm lg:text-lg font-bold ${stat.textColor} truncate`}>
                      {stat.value}
                    </div>
                  </div>
                  <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 ${stat.textColor} shrink-0`} />
                </div>
              </Card>
            ))}
          </div>

          {/* Tab Navigation - Mobile Optimized */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-4 sm:mb-6">
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

          {/* Bottom Action Buttons - Mobile Optimized */}
          <div className="sticky bottom-0 bg-background border-t border-gray-200 pt-2 sm:pt-3 mt-4 sm:mt-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
                <Button variant="outline" size="sm" className="test-action-button text-xs whitespace-nowrap flex-shrink-0">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" className="test-action-button text-xs whitespace-nowrap flex-shrink-0">
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Share
                </Button>
                <Button size="sm" className="test-action-button bg-blue-600 hover:bg-blue-700 text-xs whitespace-nowrap flex-shrink-0">
                  <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Retake
                </Button>
              </div>
              <Button variant="ghost" onClick={onClose} className="test-action-button text-xs sm:ml-auto">
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
