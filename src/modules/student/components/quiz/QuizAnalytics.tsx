import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  BarChart3,
  PieChart,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { cn } from '@/lib/utils';

interface QuizAnalyticsProps {
  analytics: {
    averageScore: number;
    averageTime: number;
    totalQuizzes: number;
    topicAccuracy: Record<string, { correct: number; total: number; percentage: number }>;
    subjectAccuracy: Record<string, { correct: number; total: number; percentage: number }>;
    performanceTrend: { quiz: number; score: number; date: string }[];
    timePerQuestionTrend: { quiz: number; avgTime: number; date: string }[];
    weeklyProgress: { week: string; quizzes: number; avgScore: number }[];
    strongTopics: { topic: string; accuracy: number; attempts: number }[];
    weakTopics: { topic: string; accuracy: number; attempts: number }[];
  };
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function QuizAnalytics({ analytics }: QuizAnalyticsProps) {
  const subjectData = Object.entries(analytics.subjectAccuracy).map(([name, data]) => ({
    name,
    value: data.total,
    accuracy: data.percentage,
  }));

  const topicData = Object.entries(analytics.topicAccuracy)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([topic, data]) => ({
      topic,
      accuracy: data.percentage,
      attempts: data.total,
    }));

  // Calculate improvement
  const recentScores = analytics.performanceTrend.slice(-5);
  const olderScores = analytics.performanceTrend.slice(0, 5);
  const recentAvg = recentScores.length > 0 
    ? recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length 
    : 0;
  const olderAvg = olderScores.length > 0 
    ? olderScores.reduce((sum, s) => sum + s.score, 0) / olderScores.length 
    : 0;
  const improvement = recentAvg - olderAvg;

  if (analytics.totalQuizzes === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Analytics Yet</h3>
          <p className="text-muted-foreground">Complete some quizzes to see your performance analytics!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
        <TabsTrigger value="topics">Topics</TabsTrigger>
        <TabsTrigger value="time">Time Analysis</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Target className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <div className="text-2xl font-bold">{analytics.averageScore}%</div>
                  <div className="text-xs text-muted-foreground">Avg. Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Clock className="h-8 w-8 text-blue-500" />
                <div className="text-right">
                  <div className="text-2xl font-bold">{Math.round(analytics.averageTime / 60)}m</div>
                  <div className="text-xs text-muted-foreground">Avg. Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <BarChart3 className="h-8 w-8 text-green-500" />
                <div className="text-right">
                  <div className="text-2xl font-bold">{analytics.totalQuizzes}</div>
                  <div className="text-xs text-muted-foreground">Total Quizzes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <TrendingUp className={cn("h-8 w-8", improvement >= 0 ? "text-green-500" : "text-red-500")} />
                <div className="text-right">
                  <div className={cn("text-2xl font-bold flex items-center gap-1", improvement >= 0 ? "text-green-500" : "text-red-500")}>
                    {improvement >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    {Math.abs(Math.round(improvement))}%
                  </div>
                  <div className="text-xs text-muted-foreground">Improvement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Subject Distribution & Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, accuracy }) => `${name}: ${accuracy}%`}
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Strong vs Weak Topics */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Strong Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.strongTopics.length > 0 ? (
                analytics.strongTopics.map((topic, idx) => (
                  <div key={topic.topic} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate">{topic.topic}</span>
                      <span className="font-medium text-green-600">{topic.accuracy}%</span>
                    </div>
                    <Progress value={topic.accuracy} className="h-2" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Complete more quizzes to see your strong topics.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-red-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                <XCircle className="h-4 w-4" />
                Topics to Improve
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.weakTopics.length > 0 ? (
                analytics.weakTopics.map((topic, idx) => (
                  <div key={topic.topic} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate">{topic.topic}</span>
                      <span className="font-medium text-red-600">{topic.accuracy}%</span>
                    </div>
                    <Progress value={topic.accuracy} className="h-2" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Complete more quizzes to identify areas for improvement.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="trends" className="space-y-4">
        {/* Performance Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Score Trend (Last 10 Quizzes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.2}
                    name="Score (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="quizzes" fill="hsl(var(--primary))" name="Quizzes" />
                  <Bar yAxisId="right" dataKey="avgScore" fill="#22c55e" name="Avg Score (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="topics" className="space-y-4">
        {/* Topic-wise Accuracy */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Topic-wise Accuracy (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} className="text-xs" />
                  <YAxis dataKey="topic" type="category" width={120} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Bar 
                    dataKey="accuracy" 
                    fill="hsl(var(--primary))" 
                    name="Accuracy (%)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Topic Details Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">All Topics Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {Object.entries(analytics.topicAccuracy)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([topic, data]) => (
                  <div key={topic} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{topic}</div>
                      <div className="text-xs text-muted-foreground">{data.total} questions attempted</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={data.percentage >= 70 ? 'default' : data.percentage >= 50 ? 'secondary' : 'destructive'}>
                        {data.percentage}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {data.correct}/{data.total}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="time" className="space-y-4">
        {/* Time per Question Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Average Time per Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.timePerQuestionTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                    formatter={(value: number) => [`${Math.round(value)}s`, 'Avg Time']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                    name="Avg Time (sec)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Time Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-500">
                {Math.round(analytics.averageTime / 60)}:{(analytics.averageTime % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Quiz Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-500">
                {analytics.timePerQuestionTrend.length > 0 
                  ? Math.round(analytics.timePerQuestionTrend[analytics.timePerQuestionTrend.length - 1]?.avgTime || 0)
                  : 0}s
              </div>
              <div className="text-sm text-muted-foreground">Latest Avg per Q</div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">
                {analytics.totalQuizzes * 10}
              </div>
              <div className="text-sm text-muted-foreground">Questions Attempted</div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
