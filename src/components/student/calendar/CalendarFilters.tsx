
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterSubject: string;
  setFilterSubject: (subject: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  subjects: (string | undefined)[];
  resetFilters: () => void;
  showReset: boolean;
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filterSubject,
  setFilterSubject,
  filterStatus,
  setFilterStatus,
  subjects,
  resetFilters,
  showReset
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-4">
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search tasks..."
          className="pl-9 w-full sm:w-[250px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="study">Study</SelectItem>
            <SelectItem value="test">Test</SelectItem>
            <SelectItem value="revision">Revision</SelectItem>
            <SelectItem value="break">Break</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-full sm:w-[120px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject, idx) => (
              <SelectItem key={idx} value={subject || ''}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="missed">Missed</SelectItem>
          </SelectContent>
        </Select>
        
        {showReset && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={resetFilters}
            className="hover:bg-red-50"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default CalendarFilters;
