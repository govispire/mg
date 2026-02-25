
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const userActivityData = [
  { day: 'Mon', students: 3200, mentors: 45, admins: 8, logins: 2800 },
  { day: 'Tue', students: 3800, mentors: 52, admins: 12, logins: 3200 },
  { day: 'Wed', students: 4200, mentors: 48, admins: 9, logins: 3600 },
  { day: 'Thu', students: 3900, mentors: 55, admins: 11, logins: 3400 },
  { day: 'Fri', students: 4500, mentors: 62, admins: 15, logins: 3900 },
  { day: 'Sat', students: 2800, mentors: 38, admins: 6, logins: 2400 },
  { day: 'Sun', students: 2100, mentors: 28, admins: 4, logins: 1800 },
];

const UserActivityChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={userActivityData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="students" fill="#3b82f6" name="Students" />
        <Bar dataKey="mentors" fill="#10b981" name="Mentors" />
        <Bar dataKey="admins" fill="#f59e0b" name="Admins" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default UserActivityChart;
