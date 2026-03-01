import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceOverviewTab } from './performance/PerformanceOverviewTab';
import { DetailedAnalysisTab } from './performance/DetailedAnalysisTab';
import { TestHistoryTab } from './performance/TestHistoryTab';
import { useExamProgress } from '@/hooks/useExamProgress';

interface ExamPerformanceTabProps {
  examId: string;
  examName: string;
}

export const ExamPerformanceTab: React.FC<ExamPerformanceTabProps> = ({ examId, examName }) => {
  const { progressData } = useExamProgress(examId);

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
        <TabsTrigger value="history">Test History</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <PerformanceOverviewTab examId={examId} examName={examName} />
      </TabsContent>

      <TabsContent value="detailed">
        <DetailedAnalysisTab examId={examId} examName={examName} />
      </TabsContent>

      <TabsContent value="history">
        <TestHistoryTab
          examId={examId}
          examName={examName}
          testTypes={progressData.testTypes}
        />
      </TabsContent>
    </Tabs>
  );
};
