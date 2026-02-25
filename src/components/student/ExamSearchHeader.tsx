
import React from 'react';
import { Search } from 'lucide-react';

interface ExamSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ExamSearchHeader: React.FC<ExamSearchHeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold">Exam Tests</h1>
        <p className="text-gray-500 text-sm sm:text-base">Select a category and exam to start your preparation</p>
      </div>
      <div className="relative w-full md:w-64 md:flex-shrink-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input 
          type="text" 
          className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
          placeholder="Search exams..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};
