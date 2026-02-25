
import React from 'react';
import { Clock } from 'lucide-react';

const MentorSchedule = () => {
  return (
    <div className="w-full px-4 lg:px-6 py-6">
      <div className="text-center py-12">
        <Clock className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule</h1>
        <p className="text-gray-600">Manage your daily schedule and time slots for mentoring</p>
      </div>
    </div>
  );
};

export default MentorSchedule;
