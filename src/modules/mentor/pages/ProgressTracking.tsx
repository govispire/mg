
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const ProgressTracking = () => {
  return (
    <div className="w-full px-4 lg:px-6 py-6">
      <div className="text-center py-12">
        <TrendingUp className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Progress Tracking</h1>
        <p className="text-gray-600">Monitor and analyze your students' progress and performance</p>
      </div>
    </div>
  );
};

export default ProgressTracking;
