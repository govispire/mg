
import React from 'react';
import UniversalProfileCard from '@/components/universal/UniversalProfileCard';

const MentorProfile = () => {
  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mentor Profile</h1>
        <p className="text-gray-600">Manage your mentor information and student guidance details</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UniversalProfileCard className="w-full" />
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">Mentor Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium text-sm">My Students</div>
                <div className="text-xs text-gray-500">View and manage mentored students</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium text-sm">Schedule Sessions</div>
                <div className="text-xs text-gray-500">Book mentoring sessions</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium text-sm">Progress Tracking</div>
                <div className="text-xs text-gray-500">Track student progress</div>
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">Mentor Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Students Mentored</span>
                <span className="text-sm font-medium text-teal-600">25</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium">92%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rating</span>
                <span className="text-sm font-medium text-yellow-600">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;
