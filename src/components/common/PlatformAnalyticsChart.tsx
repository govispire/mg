
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const examCategoryData = [
  { name: 'Banking', value: 35, count: 4200 },
  { name: 'Civil Services', value: 25, count: 3000 },
  { name: 'Engineering', value: 20, count: 2400 },
  { name: 'Management', value: 12, count: 1440 },
  { name: 'Others', value: 8, count: 960 },
];

const monthlyGrowthData = [
  { month: 'Jan', users: 8500, tests: 12000, revenue: 45000 },
  { month: 'Feb', users: 9200, tests: 13500, revenue: 52000 },
  { month: 'Mar', users: 10100, tests: 15200, revenue: 58000 },
  { month: 'Apr', users: 11300, tests: 16800, revenue: 65000 },
  { month: 'May', users: 12200, tests: 18500, revenue: 72000 },
  { month: 'Jun', users: 12845, tests: 19200, revenue: 78000 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PlatformAnalyticsChart = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h4 className="text-lg font-semibold mb-4">Exam Category Distribution</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={examCategoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {examCategoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div>
        <h4 className="text-lg font-semibold mb-4">Monthly Growth</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyGrowthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="users" fill="#3b82f6" name="New Users" />
            <Bar dataKey="tests" fill="#10b981" name="Tests Taken" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PlatformAnalyticsChart;
