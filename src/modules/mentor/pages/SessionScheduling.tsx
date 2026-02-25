
import React from 'react';
import { Calendar } from 'lucide-react';

const SessionScheduling = () => {
  return (
    <div className="w-full px-4 lg:px-6 py-6">
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Scheduling</h1>
        <p className="text-gray-600">Schedule and manage mentoring sessions with your students</p>
      </div>
    </div>
  );
};

export default SessionScheduling;
