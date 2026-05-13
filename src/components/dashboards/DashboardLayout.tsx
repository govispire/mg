
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Bell, Menu, X } from 'lucide-react';
import { useAuth } from '@/app/providers';
import { CategorySelector } from '@/components/global/CategorySelector';
import ProfileButton from '@/components/student/ProfileButton';
import Sidebar from './Sidebar';

import FloatingTimerWidget from '@/components/student/dashboard/FloatingTimerWidget';

interface DashboardLayoutProps {
  role: 'student' | 'instructor' | 'employee' | 'super-admin' | 'owner' | 'mentor';
  basePath: string;
}

const SIDEBAR_EXPANDED_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 64;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role, basePath }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  return (
    <>
      <div className="flex h-screen bg-slate-100/80 w-full overflow-hidden">

        {/* ── Desktop sidebar ─────────────────────────────────────── */}
        <div
          className="hidden lg:block relative flex-shrink-0 h-full"
          style={{
            width: sidebarWidth,
            transition: 'width 300ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <Sidebar
            role={role}
            basePath={basePath}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(prev => !prev)}
          />
        </div>

        {/* ── Mobile sidebar (overlay) ─────────────────────────────── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <div
          className={`
            fixed inset-y-0 left-0 z-50 lg:hidden
            transition-transform duration-300 ease-in-out
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{ width: SIDEBAR_EXPANDED_WIDTH }}
        >
        <Sidebar
            role={role}
            basePath={basePath}
            collapsed={false}
          />
        </div>

        {/* ── Main content ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header
            className="bg-white border-b border-slate-200/70 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 h-[64px] flex items-center flex-shrink-0"
            style={{ boxShadow: '0 1px 0 0 rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center justify-between w-full gap-4">
              {/* Left: Mobile menu + Category Selector */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 lg:w-1/2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                  onClick={() => setMobileOpen(prev => !prev)}
                >
                  {mobileOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
                </Button>
              {role === 'student' && <CategorySelector />}
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

          {/* Page content */}
          <main className="flex-1 overflow-auto bg-slate-100/80 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>

      {role === 'student' && <FloatingTimerWidget />}
    </>
  );
};

export default DashboardLayout;
