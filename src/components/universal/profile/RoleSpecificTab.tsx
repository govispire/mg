
import React from 'react';
import { Button } from '@/components/ui/button';

interface RoleSpecificTabProps {
  user: any;
}

const RoleSpecificTab: React.FC<RoleSpecificTabProps> = ({ user }) => {
  switch (user?.role) {
    case 'student':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-green-50 rounded-md text-center">
              <p className="text-xs text-gray-500">Exams Applied</p>
              <p className="text-xl font-semibold text-green-600">5</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-md text-center">
              <p className="text-xs text-gray-500">Cleared</p>
              <p className="text-xl font-semibold text-blue-600">3</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-md text-center">
              <p className="text-xs text-gray-500">Interviews</p>
              <p className="text-xl font-semibold text-purple-600">1</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            View Exam Journey
          </Button>
        </div>
      );
    case 'employee':
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
              <span className="text-sm">Department</span>
              <span className="font-semibold">{user.employeeCategory || 'General'}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
              <span className="text-sm">Tasks Assigned</span>
              <span className="font-semibold">24</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
              <span className="text-sm">Tasks Completed</span>
              <span className="font-semibold">18</span>
            </div>
          </div>
        </div>
      );
    case 'admin':
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
              <span className="text-sm">Students Managed</span>
              <span className="font-semibold">450</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
              <span className="text-sm">Content Created</span>
              <span className="font-semibold">89</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
              <span className="text-sm">Tests Published</span>
              <span className="font-semibold">23</span>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">Role-specific information will be displayed here</p>
        </div>
      );
  }
};

export default RoleSpecificTab;
