
import React from 'react';
import { BarChart2 } from 'lucide-react';

const MentorAnalytics = () => {
  return (
    <div className="w-full px-4 lg:px-6 py-6">
      <div className="text-center py-12">
        <BarChart2 className="h-16 w-16 text-orange-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">View detailed analytics and insights about your mentoring effectiveness</p>
      </div>
    </div>
  );
};

export default MentorAnalytics;
