
import React from 'react';
import UniversalProfileCard from '@/components/universal/UniversalProfileCard';

const AdminProfile = () => {
  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Profile</h1>
        <p className="text-gray-600">Manage your administrator information and platform settings</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UniversalProfileCard className="w-full" />
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">Admin Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium text-sm">Manage Students</div>
                <div className="text-xs text-gray-500">Student oversight and management</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium text-sm">Content Management</div>
                <div className="text-xs text-gray-500">Oversee platform content</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium text-sm">System Settings</div>
                <div className="text-xs text-gray-500">Configure platform settings</div>
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">Admin Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Admin Level</span>
                <span className="text-sm font-medium text-red-600">Category Admin</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Access Level</span>
                <span className="text-sm font-medium">High</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Activity</span>
                <span className="text-sm font-medium">Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
