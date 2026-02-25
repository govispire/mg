
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
         PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

interface PerformanceAnalyticsProps {
  className?: string;
}

// Sample data for charts
const subjectAccuracyData = [
  { name: 'English', accuracy: 78 },
  { name: 'Quant', accuracy: 65 },
  { name: 'Reasoning', accuracy: 82 },
  { name: 'GK', accuracy: 70 },
];

const timeSpentData = [
  { name: 'English', value: 25, color: '#8884d8' },
  { name: 'Quant', value: 35, color: '#82ca9d' },
  { name: 'Reasoning', value: 30, color: '#ffc658' },
  { name: 'GK', value: 10, color: '#ff8042' },
];

const scoreData = [
  { name: 'Test 1', score: 68 },
  { name: 'Test 2', score: 72 },
  { name: 'Test 3', score: 75 },
  { name: 'Test 4', score: 70 },
  { name: 'Test 5', score: 82 },
];

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ className }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {/* Subject Accuracy Bar Graph */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Subject Accuracy</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjectAccuracyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis 
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
                <Bar dataKey="accuracy" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Time Spent per Subject Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Time Spent per Subject</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={timeSpentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {timeSpentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip formatter={(value) => [`${value}%`, 'Time Spent']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Score Trend Line Graph */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Mock Test Score Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={scoreData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip formatter={(value) => [`${value}`, 'Score']} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceAnalytics;
