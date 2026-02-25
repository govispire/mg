
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Quantitative',
    score: 65,
    average: 55,
  },
  {
    name: 'Reasoning',
    score: 78,
    average: 60,
  },
  {
    name: 'English',
    score: 58,
    average: 62,
  },
  {
    name: 'GK',
    score: 70,
    average: 68,
  },
  {
    name: 'Computer',
    score: 85,
    average: 70,
  },
];

const PerformanceChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="score" name="Your Score" fill="#8b5cf6" />
        <Bar dataKey="average" name="Class Average" fill="#e9d5ff" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;
