import React from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Target } from 'lucide-react';

interface DetailedAnalysisTabProps {
  examId: string;
  examName: string;
}

export const DetailedAnalysisTab: React.FC<DetailedAnalysisTabProps> = ({ examId, examName }) => {
  // Mock data for last 10 tests
  const generateLast10TestsData = (startScore: number, variance: number) => {
    return Array.from({ length: 10 }, (_, i) => ({
      test: `T${i + 1}`,
      score: Math.max(0, Math.min(100, startScore + (Math.random() - 0.5) * variance))
    }));
  };

  const prelimsFullTestData = {
    tests: 10,
    averageMarks: 56,
    bestMarks: 80,
    consistency: 70,
    scoreRange: '24-90 marks',
    chartData: generateLast10TestsData(60, 40)
  };

  const mainsFullTestData = {
    tests: 1,
    averageMarks: 125,
    bestMarks: 125,
    consistency: 0,
    scoreRange: '120-135 marks',
    chartData: [{ test: 'T1', score: 125 }]
  };

  const sectionalTests = [
    {
      title: 'Prelims Sectional - Quantitative Aptitude',
      tests: 8,
      averageMarks: 65,
      bestMarks: 85,
      consistency: 75,
      scoreRange: '45-85 marks',
      chartData: generateLast10TestsData(65, 30)
    },
    {
      title: 'Prelims Sectional - Reasoning',
      tests: 7,
      averageMarks: 58,
      bestMarks: 78,
      consistency: 68,
      scoreRange: '38-78 marks',
      chartData: generateLast10TestsData(58, 35)
    },
    {
      title: 'Prelims Sectional - English',
      tests: 6,
      averageMarks: 52,
      bestMarks: 72,
      consistency: 62,
      scoreRange: '35-72 marks',
      chartData: generateLast10TestsData(52, 30)
    },
    {
      title: 'Mains Sectional - Quantitative',
      tests: 5,
      averageMarks: 68,
      bestMarks: 88,
      consistency: 72,
      scoreRange: '48-88 marks',
      chartData: generateLast10TestsData(68, 32)
    },
    {
      title: 'Mains Sectional - Reasoning',
      tests: 6,
      averageMarks: 62,
      bestMarks: 82,
      consistency: 70,
      scoreRange: '42-82 marks',
      chartData: generateLast10TestsData(62, 35)
    },
    {
      title: 'Mains Sectional - English',
      tests: 4,
      averageMarks: 55,
      bestMarks: 75,
      consistency: 65,
      scoreRange: '38-75 marks',
      chartData: generateLast10TestsData(55, 30)
    }
  ];

  const TestCategoryCard = ({ title, data }: { title: string; data: any }) => (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">Last 10 Tests</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.tests}</p>
            <p className="text-xs text-muted-foreground">Tests</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.averageMarks}</p>
            <p className="text-xs text-muted-foreground">Average Marks</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.bestMarks}</p>
            <p className="text-xs text-muted-foreground">Best Marks</p>
          </div>
          <div className="bg-violet-50 dark:bg-violet-950 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{data.consistency}%</p>
            <p className="text-xs text-muted-foreground">Consistency</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">📊 Score Range:</span>
          <span className="font-medium">{data.scoreRange}</span>
        </div>
      </div>

      {data.chartData && data.chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="test" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No Test Data</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add full test prelims sessions with scores to see analytics
          </p>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Full Test Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TestCategoryCard title="Full Test Prelims" data={prelimsFullTestData} />
        <TestCategoryCard title="Full Test Mains" data={mainsFullTestData} />
      </div>

      {/* Sectional Tests */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Sectional Test Performance</h2>
        <div className="grid grid-cols-1 gap-6">
          {sectionalTests.map((test, index) => (
            <TestCategoryCard key={index} title={test.title} data={test} />
          ))}
        </div>
      </div>
    </div>
  );
};
