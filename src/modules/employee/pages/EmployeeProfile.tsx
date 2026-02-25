
import React from 'react';
import UniversalProfileCard from '@/components/universal/UniversalProfileCard';

const EmployeeProfile = () => {
  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Employee Profile</h1>
        <p className="text-gray-600">Manage your employee information and work details</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UniversalProfileCard className="w-full" />
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">Employee Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium text-sm">View Tasks</div>
                <div className="text-xs text-gray-500">Check assigned tasks and deadlines</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium text-sm">Upload Content</div>
                <div className="text-xs text-gray-500">Upload questions and materials</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium text-sm">Work Calendar</div>
                <div className="text-xs text-gray-500">View schedule and meetings</div>
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">Work Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Department</span>
                <span className="text-sm font-medium text-blue-600">Content Creation</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Joined</span>
                <span className="text-sm font-medium">Jan 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Performance</span>
                <span className="text-sm font-medium text-green-600">Excellent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
