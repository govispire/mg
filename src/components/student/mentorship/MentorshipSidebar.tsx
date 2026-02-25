
import React from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  BookOpen, 
  FileText, 
  MessageSquare,
  LayoutDashboard,
  BellDot,
  ChevronDown,
  Star,
  BookMarked,
  BarChart2,
  Award
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const MentorshipSidebar: React.FC = () => {
  const currentTime = new Date();
  const hours = currentTime.getHours();
  
  // Determine greeting based on time of day
  let greeting = "Good morning";
  if (hours >= 12 && hours < 18) {
    greeting = "Good afternoon";
  } else if (hours >= 18) {
    greeting = "Good evening";
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header & Contextual Banner */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" className="flex items-center text-gray-500">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>My Sessions</span>
          </Button>
          <div className="flex items-center">
            <BellDot className="h-5 w-5 text-gray-500 mr-3" />
            <Avatar className="h-8 w-8 border-2 border-purple-100">
              <div className="bg-purple-600 text-white font-medium flex items-center justify-center h-full w-full">
                PS
              </div>
            </Avatar>
            <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
          </div>
        </div>
        
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-900">{greeting}, Priya</h2>
          <p className="text-sm text-purple-600">Your next session is in 2 days</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-700">
            <LayoutDashboard className="mr-1 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-700">
            <Calendar className="mr-1 h-4 w-4" />
            Sessions
          </Button>
          <Button variant="default" size="sm" className="text-white bg-purple-600 hover:bg-purple-700">
            <BookOpen className="mr-1 h-4 w-4" />
            Study Plan
          </Button>
        </div>
      </div>
      
      {/* Profile Snapshot Cards */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {/* Mentor Card */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-center mb-2">
            <Avatar className="h-10 w-10 mr-3">
              <div className="bg-blue-600 text-white font-medium flex items-center justify-center h-full w-full">
                AK
              </div>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900">Ankit Kumar</h3>
              <p className="text-xs text-gray-600">IAS Coach</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>24 Sessions</span>
            </div>
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              <span>4.9</span>
            </div>
          </div>
          <Button variant="link" size="sm" className="text-blue-600 p-0 h-auto">
            View Full Profile
          </Button>
        </div>
        
        {/* Mentee Card */}
        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
          <div className="flex items-center mb-2">
            <Avatar className="h-10 w-10 mr-3">
              <div className="bg-green-600 text-white font-medium flex items-center justify-center h-full w-full">
                PS
              </div>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900">Priya Singh</h3>
              <p className="text-xs text-gray-600">UPSC CSE Aspirant</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>18 Completed</span>
            </div>
            <div className="flex items-center">
              <Award className="h-3 w-3 mr-1 text-blue-500" />
              <span>65% Progress</span>
            </div>
          </div>
          <Button variant="link" size="sm" className="text-green-600 p-0 h-auto">
            Edit Goals
          </Button>
        </div>
      </div>
      
      {/* Shared Goals & Roadmap */}
      <div className="p-4 border-t border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-900">Learning Roadmap</h3>
          <p className="text-xs text-gray-600">50% Complete</p>
        </div>
        
        <div className="mb-4">
          <Progress value={50} className="h-2 mb-1" />
          <p className="text-xs text-gray-500">Clear UPSC Prelims in 6 months</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center p-2 bg-gray-100 rounded-md">
            <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm">NCERTs Review</span>
            <span className="text-xs text-gray-500 ml-auto">Completed</span>
          </div>
          
          <div className="flex items-center p-2 bg-gray-100 rounded-md">
            <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm">Static GK Revision</span>
            <span className="text-xs text-gray-500 ml-auto">Completed</span>
          </div>
          
          <div className="flex items-center p-2 bg-gray-100 rounded-md">
            <div className="h-4 w-4 rounded-full bg-purple-500 mr-2"></div>
            <span className="text-sm">Current Affairs</span>
            <span className="text-xs text-gray-500 ml-auto">In Progress</span>
          </div>
          
          <div className="flex items-center p-2 bg-gray-100 rounded-md">
            <div className="h-4 w-4 rounded-full bg-gray-300 mr-2"></div>
            <span className="text-sm">Full Mock Tests</span>
            <span className="text-xs text-gray-500 ml-auto">Upcoming</span>
          </div>
        </div>
      </div>
      
      {/* Session Scheduler */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-900">Upcoming Sessions</h3>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 h-auto">
            Book New Session
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="p-2 border border-gray-200 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Indian Polity Discussion</p>
                <p className="text-xs text-gray-500">May 16, 2025 • 2:00 PM</p>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Join
              </Button>
            </div>
          </div>
          
          <div className="p-2 border border-gray-200 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Economy MCQ Practice</p>
                <p className="text-xs text-gray-500">May 23, 2025 • 3:30 PM</p>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Reschedule
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resource Center Preview */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3">Resources</h3>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <div className="flex-shrink-0 p-3 border rounded-md bg-gray-50 w-32 h-24 flex flex-col items-center justify-center">
            <FileText className="h-6 w-6 text-purple-600 mb-1" />
            <span className="text-xs text-center">Indian Polity Notes</span>
          </div>
          
          <div className="flex-shrink-0 p-3 border rounded-md bg-gray-50 w-32 h-24 flex flex-col items-center justify-center">
            <BookMarked className="h-6 w-6 text-blue-600 mb-1" />
            <span className="text-xs text-center">UPSC Syllabus</span>
          </div>
          
          <div className="flex-shrink-0 p-3 border rounded-md bg-gray-50 w-32 h-24 flex flex-col items-center justify-center">
            <BarChart2 className="h-6 w-6 text-green-600 mb-1" />
            <span className="text-xs text-center">Practice Questions</span>
          </div>
        </div>
      </div>
      
      {/* Performance Summary */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-gray-900">Performance</h3>
          <span className="text-xs text-purple-600">View All</span>
        </div>
        <div className="flex space-x-2">
          <div className={cn(
            "text-xs p-1 rounded flex-1 text-center",
            "bg-green-100 text-green-800"
          )}>
            Polity 92%
          </div>
          <div className={cn(
            "text-xs p-1 rounded flex-1 text-center",
            "bg-yellow-100 text-yellow-800"
          )}>
            Economy 76%
          </div>
          <div className={cn(
            "text-xs p-1 rounded flex-1 text-center",
            "bg-blue-100 text-blue-800"
          )}>
            GK 85%
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorshipSidebar;
