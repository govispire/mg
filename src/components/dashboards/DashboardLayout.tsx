
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Bell, Menu, X } from 'lucide-react';
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
    <div className="flex h-screen bg-slate-100/80 w-full">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/70 shadow-[1px_0_12px_rgba(0,0,0,0.04)]`}>
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
        <header
          className="bg-white border-b border-slate-200/70 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 h-[64px] flex items-center"
          style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center justify-between w-full gap-4">
            {/* Left: Mobile menu + Category Selector */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 lg:w-1/2">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
              
              <div className="hidden md:block">
                {role === 'student' && <CategorySelector />}
              </div>
            </div>



            {/* Right: Bell + Profile */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1 lg:flex-none lg:w-1/3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />

              </Button>
              <ProfileButton showProfileCard={false} role={role} />
            </div>
          </div>
        </header>

        {/* Page content - Consistent padding for all pages */}
        <main className="flex-1 overflow-auto bg-slate-100/80 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
