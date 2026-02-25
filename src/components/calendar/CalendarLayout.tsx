
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { CalendarSidebar } from './CalendarSidebar';
import { TaskPanel } from './TaskPanel';
import { CalendarPanel } from './CalendarPanel';
import { ProgressDashboard } from './ProgressDashboard';
import ProfileButton from '@/components/student/ProfileButton';
import { Calendar, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { TaskProvider } from '@/context/TaskContext';

const CalendarLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const [sidebarVisible, setSidebarVisible] = useState(!isMobile);
  const [panelView, setPanelView] = useState<'split' | 'tasks' | 'calendar'>(
    isMobile ? 'tasks' : 'split'
  );
  
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  
  // Update panel view and sidebar visibility when screen size changes
  React.useEffect(() => {
    setPanelView(isMobile ? 'tasks' : 'split');
    setSidebarVisible(!isMobile);
  }, [isMobile]);
  
  return (
    <TaskProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile sidebar toggle */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="fixed top-4 left-4 z-50 bg-white shadow-md rounded-full"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Sidebar */}
        <div 
          className={`${
            sidebarVisible 
              ? 'fixed inset-y-0 left-0 z-40 w-64 md:w-72 lg:static' 
              : 'hidden'
          } bg-white shadow-md lg:shadow-none transition-all duration-300 ease-in-out`}
        >
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4" 
              onClick={toggleSidebar}
            >
              <X size={20} />
            </Button>
          )}
          <CalendarSidebar onCloseSidebar={() => setSidebarVisible(false)} />
        </div>
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                {!isMobile && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={toggleSidebar}
                    className="mr-4"
                  >
                    {sidebarVisible ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                  </Button>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h1 className="text-xl font-semibold hidden md:block">Calendar & Tasks</h1>
                </div>
              </div>
              
              {isMobile && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={panelView === 'tasks' ? 'default' : 'outline'}
                    onClick={() => setPanelView('tasks')}
                  >
                    Tasks
                  </Button>
                  <Button 
                    size="sm" 
                    variant={panelView === 'calendar' ? 'default' : 'outline'}
                    onClick={() => setPanelView('calendar')}
                  >
                    Calendar
                  </Button>
                </div>
              )}
              
              <div className="flex items-center">
                <ProfileButton showProfileCard={false} />
              </div>
            </div>
          </div>
          
          {/* Main content panels */}
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Tasks Panel */}
            {(panelView === 'split' || panelView === 'tasks') && (
              <div className={`${panelView === 'split' ? 'w-full md:w-1/3 lg:w-2/5 border-r' : 'w-full'} overflow-auto`}>
                <TaskPanel />
              </div>
            )}
            
            {/* Calendar Panel */}
            {(panelView === 'split' || panelView === 'calendar') && (
              <div className={`${panelView === 'split' ? 'w-full md:w-2/3 lg:w-3/5' : 'w-full'} overflow-auto`}>
                <CalendarPanel />
              </div>
            )}
          </div>
          
          {/* Progress Dashboard */}
          <div className="bg-white dark:bg-gray-800 shadow-inner p-4 border-t">
            <ProgressDashboard />
          </div>
        </div>
      </div>
    </TaskProvider>
  );
};

export default CalendarLayout;
