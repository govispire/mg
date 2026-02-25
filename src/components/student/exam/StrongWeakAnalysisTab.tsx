
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Target } from 'lucide-react';
import { TestAnalysisData } from '@/data/testAnalysisData';
import { useIsMobile } from '@/hooks/use-mobile';

interface StrongWeakAnalysisTabProps {
  analysisData: TestAnalysisData;
}

export const StrongWeakAnalysisTab: React.FC<StrongWeakAnalysisTabProps> = ({ analysisData }) => {
  const isMobile = useIsMobile();
  
  const subjectTabs = [
    { value: "english", label: isMobile ? "English" : "English Language" },
    { value: "banking", label: isMobile ? "Banking" : "Banking Knowledge" },
    { value: "awareness", label: isMobile ? "Awareness" : "General Awareness" },
    { value: "computer", label: isMobile ? "Computer" : "Computer Aptitude" }
  ];

  const strengthData = [
    { area: "Reading Comprehension", score: 85, status: "strong", questions: [1, 2, 3, 4, 5] },
    { area: "Vocabulary", score: 92, status: "strong", questions: [6, 7, 8, 9] },
    { area: "Grammar", score: 78, status: "average", questions: [10, 11, 12] }
  ];

  const weaknessData = [
    { area: "Para Jumbles", score: 45, status: "weak", questions: [13, 14, 15] },
    { area: "Error Spotting", score: 52, status: "weak", questions: [16, 17, 18, 19] }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'strong': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'weak': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Subject Tabs - Mobile Optimized */}
      <Tabs defaultValue="english">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 min-w-max sm:min-w-0">
            {subjectTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="english" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* Strong Areas */}
          <Card className="p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-green-600">Strong Areas</h3>
            <div className="space-y-3 sm:space-y-4">
              {strengthData.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 sm:p-4 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getStatusIcon(item.status)}
                      <span className="font-medium text-sm sm:text-base truncate">{item.area}</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600 ml-2">{item.score}%</span>
                  </div>
                  <Progress value={item.score} className="mb-2 h-2" />
                  <div className="flex flex-wrap gap-1">
                    {item.questions.map((q) => (
                      <span key={q} className="bg-gray-200 text-xs px-2 py-1 rounded">
                        Q{q}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Weak Areas */}
          <Card className="p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-red-600">Areas for Improvement</h3>
            <div className="space-y-3 sm:space-y-4">
              {weaknessData.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 sm:p-4 bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getStatusIcon(item.status)}
                      <span className="font-medium text-sm sm:text-base truncate">{item.area}</span>
                    </div>
                    <span className="text-sm font-semibold text-red-600 ml-2">{item.score}%</span>
                  </div>
                  <Progress value={item.score} className="mb-2 h-2" />
                  <div className="flex flex-wrap gap-1">
                    {item.questions.map((q) => (
                      <span key={q} className="bg-gray-200 text-xs px-2 py-1 rounded">
                        Q{q}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Summary Cards - Mobile Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="p-3 sm:p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span className="font-medium text-sm sm:text-base">Focus Areas</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">3</div>
              <div className="text-xs sm:text-sm text-gray-600">Topics to improve</div>
            </Card>
            <Card className="p-3 sm:p-4 bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span className="font-medium text-sm sm:text-base">Avg Time</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">1.8m</div>
              <div className="text-xs sm:text-sm text-gray-600">Per question</div>
            </Card>
            <Card className="p-3 sm:p-4 bg-purple-50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <span className="font-medium text-sm sm:text-base">Overall</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">78%</div>
              <div className="text-xs sm:text-sm text-gray-600">Accuracy</div>
            </Card>
          </div>
        </TabsContent>

        {/* Other subject tabs would have similar content */}
        {subjectTabs.slice(1).map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <Card className="p-4 sm:p-6">
              <div className="text-center py-6 sm:py-8">
                <h3 className="text-base sm:text-lg font-semibold mb-2">{tab.label} Analysis</h3>
                <p className="text-sm sm:text-base text-gray-600">Analysis for {tab.label} will be displayed here</p>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
