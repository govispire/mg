
import React from 'react';
import { Calendar, TrendingUp, Award, FileText } from 'lucide-react';

interface ThirdTabProps {
  user: any;
}

const ThirdTab: React.FC<ThirdTabProps> = ({ user }) => {
  switch (user?.role) {
    case 'student':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-blue-50 rounded-md">
              <div className="flex items-center gap-2 text-blue-600">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium">Study Days</span>
              </div>
              <p className="text-xl font-semibold mt-1">78</p>
            </div>
            <div className="p-2 bg-green-50 rounded-md">
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Tasks Done</span>
              </div>
              <p className="text-xl font-semibold mt-1">245</p>
            </div>
          </div>
        </div>
      );
    case 'employee':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-green-50 rounded-md">
              <div className="flex items-center gap-2 text-green-600">
                <Award className="h-4 w-4" />
                <span className="text-xs font-medium">Rating</span>
              </div>
              <p className="text-xl font-semibold mt-1">4.8/5</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-md">
              <div className="flex items-center gap-2 text-blue-600">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium">Projects</span>
              </div>
              <p className="text-xl font-semibold mt-1">12</p>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">Additional information will be displayed here</p>
        </div>
      );
  }
};

export default ThirdTab;
