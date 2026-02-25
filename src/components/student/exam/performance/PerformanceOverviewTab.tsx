import React from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, Target, TrendingUp, BookOpen, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PerformanceOverviewTabProps {
  examId: string;
  examName: string;
}

export const PerformanceOverviewTab: React.FC<PerformanceOverviewTabProps> = ({ examId, examName }) => {
  const performanceStats = {
    totalTests: 45,
    prelimsTests: 20,
    mainsTests: 15,
    prelimsSectional: 8,
    mainsSectional: 7,
    averageScore: 72,
    percentile: 85,
    rank: 145,
    totalStudents: 1000
  };

  const monthlyData = [
    { month: 'Jan', totalTests: 5, totalPrelims: 2, totalMains: 2, sectionalPrelims: 1, sectionalMains: 0 },
    { month: 'Feb', totalTests: 6, totalPrelims: 3, totalMains: 2, sectionalPrelims: 1, sectionalMains: 0 },
    { month: 'Mar', totalTests: 8, totalPrelims: 4, totalMains: 2, sectionalPrelims: 1, sectionalMains: 1 },
    { month: 'Apr', totalTests: 9, totalPrelims: 4, totalMains: 3, sectionalPrelims: 1, sectionalMains: 1 },
    { month: 'May', totalTests: 10, totalPrelims: 5, totalMains: 3, sectionalPrelims: 1, sectionalMains: 1 },
    { month: 'Jun', totalTests: 7, totalPrelims: 2, totalMains: 3, sectionalPrelims: 1, sectionalMains: 1 }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tests</p>
              <p className="text-2xl font-bold">{performanceStats.totalTests}</p>
              <p className="text-xs text-green-600">+12%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prelims Tests</p>
              <p className="text-2xl font-bold">{performanceStats.prelimsTests}</p>
              <p className="text-xs text-green-600">+8%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Award className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mains Tests</p>
              <p className="text-2xl font-bold">{performanceStats.mainsTests}</p>
              <p className="text-xs text-green-600">+15%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Target className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prelims Sectional</p>
              <p className="text-2xl font-bold">{performanceStats.prelimsSectional}</p>
              <p className="text-xs text-green-600">+25%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Award className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mains Sectional</p>
              <p className="text-2xl font-bold">{performanceStats.mainsSectional}</p>
              <p className="text-xs text-green-600">+3%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Performance Trend - Test Categories */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Monthly Performance Trend - Test Categories
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalTests" stroke="hsl(var(--primary))" strokeWidth={2} name="Total Tests" />
            <Line type="monotone" dataKey="totalPrelims" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Total Prelims" />
            <Line type="monotone" dataKey="totalMains" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Total Mains" />
            <Line type="monotone" dataKey="sectionalPrelims" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Sectional Prelims" />
            <Line type="monotone" dataKey="sectionalMains" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Sectional Mains" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Performance Insights */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Performance Insights</h3>
        <div className="grid gap-4">
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <Trophy className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100">Strong Areas</h4>
              <p className="text-sm text-green-700 dark:text-green-300">Excellent performance in Quantitative and GK sections</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
            <Target className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900 dark:text-amber-100">Areas to Improve</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">Focus on English and Reasoning sections for better overall score</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
