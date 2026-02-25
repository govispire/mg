import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceOverviewTab } from './performance/PerformanceOverviewTab';
import { DetailedAnalysisTab } from './performance/DetailedAnalysisTab';

interface ExamPerformanceTabProps {
  examId: string;
  examName: string;
}

export const ExamPerformanceTab: React.FC<ExamPerformanceTabProps> = ({ examId, examName }) => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <PerformanceOverviewTab examId={examId} examName={examName} />
      </TabsContent>

      <TabsContent value="detailed">
        <DetailedAnalysisTab examId={examId} examName={examName} />
      </TabsContent>
    </Tabs>
  );
};
