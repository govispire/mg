
import React from 'react';

export const EmptyRecentExams: React.FC = () => {
  return (
    <div className="text-center py-10">
      <p className="text-gray-500">No recently taken exams</p>
      <p className="text-sm text-gray-400 mt-2">Your recently taken exams will appear here</p>
    </div>
  );
};
