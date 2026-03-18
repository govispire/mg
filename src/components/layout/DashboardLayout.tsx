
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Bell, Menu, X, Search } from 'lucide-react';
import { useAuth } from '@/app/providers';
import { CategorySelector } from '@/components/global/CategorySelector';
import ProfileButton from '@/components/student/ProfileButton';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  role: 'student' | 'instructor' | 'employee' | 'super-admin' | 'owner' | 'mentor';
  basePath: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role, basePath }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50 w-full">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white shadow-lg`}>
        <Sidebar role={role} basePath={basePath} collapsed={false} />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header */}
        <header className="bg-white shadow border-b-2 border-gray-200 px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between w-full gap-3">
            {/* Left: Mobile menu + Category selector */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 p-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
              {role === 'student' && <CategorySelector />}
            </div>

            {/* Center: Global Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search exams, topics, quizzes..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Right: Bell + Profile */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <ProfileButton showProfileCard={false} role={role} />
            </div>
          </div>
        </header>

        {/* Page content - Full width, let pages manage their own constraints */}
        <main className="flex-1 overflow-auto bg-gray-50 border-l-2 border-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
