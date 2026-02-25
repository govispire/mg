
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const systemHealthData = [
  { time: '00:00', uptime: 99.9, responseTime: 45, activeUsers: 1200 },
  { time: '04:00', uptime: 99.8, responseTime: 52, activeUsers: 800 },
  { time: '08:00', uptime: 99.9, responseTime: 38, activeUsers: 2100 },
  { time: '12:00', uptime: 99.7, responseTime: 65, activeUsers: 3200 },
  { time: '16:00', uptime: 99.9, responseTime: 42, activeUsers: 2800 },
  { time: '20:00', uptime: 99.8, responseTime: 48, activeUsers: 1900 },
];

const SystemHealthChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={systemHealthData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="uptime" 
          stroke="#10b981" 
          strokeWidth={2}
          name="Uptime (%)"
        />
        <Line 
          type="monotone" 
          dataKey="responseTime" 
          stroke="#f59e0b" 
          strokeWidth={2}
          name="Response Time (ms)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SystemHealthChart;
