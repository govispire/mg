import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  BarChart, 
  Settings, 
  User, 
  PlusCircle,
  Bookmark,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTaskModal } from '@/hooks/useTaskModal';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/app/providers';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to?: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ 
  icon, 
  label, 
  to, 
  active,
  onClick
}) => {
  const content = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
        active ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 font-medium" : "text-gray-700 dark:text-gray-300"
      )}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
  
  if (onClick) {
    return (
      <button className="w-full text-left" onClick={onClick}>
        {content}
      </button>
    );
  }
  
  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  
  return <div>{content}</div>;
};

interface CalendarSidebarProps {
  onCloseSidebar?: () => void;
  userRole?: 'student' | 'mentor' | 'admin' | 'employee' | 'super-admin' | 'owner';
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ 
  onCloseSidebar,
  userRole = 'student'
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const { openModal } = useTaskModal();
  
  const handleCreateTask = () => {
    if (onCloseSidebar) onCloseSidebar();
    openModal();
  };
  
  const getInitial = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // Get role-specific base path
  const getBasePath = () => {
    switch (userRole) {
      case 'admin': return '/admin';
      case 'mentor': return '/mentor';
      case 'employee': return '/employee';
      case 'super-admin': return '/super-admin';
      case 'owner': return '/owner';
      default: return '/student';
    }
  };

  const basePath = getBasePath();
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
            P
          </div>
          <span className="text-lg font-bold">PrepSmart</span>
        </div>
      </div>
      
      <div className="p-4">
        <Button 
          className="w-full justify-start gap-2 bg-purple-600 hover:bg-purple-700"
          onClick={handleCreateTask}
        >
          <PlusCircle size={18} />
          <span>Add New Task</span>
        </Button>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="mb-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
          Main
        </div>
        <NavItem
          icon={<Calendar size={18} />}
          label="Calendar"
          to={`${basePath}/calendar`}
          active={location.pathname === `${basePath}/calendar`}
        />
        <NavItem
          icon={<CheckSquare size={18} />}
          label="Tasks"
          to={`${basePath}/calendar?view=tasks`}
          active={location.search.includes('view=tasks')}
        />
        <NavItem
          icon={<Clock size={18} />}
          label="Today"
          to={`${basePath}/calendar?view=today`}
          active={location.search.includes('view=today')}
        />
        <NavItem
          icon={<BarChart size={18} />}
          label="Reports"
          to={`${basePath}/calendar?view=reports`}
          active={location.search.includes('view=reports')}
        />
        
        <Separator className="my-4" />
        
        <div className="mb-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
          Categories
        </div>
        <NavItem
          icon={<div className="w-3 h-3 rounded-full bg-blue-500" />}
          label="Study"
          to={`${basePath}/calendar?category=study`}
          active={location.search.includes('category=study')}
        />
        <NavItem
          icon={<div className="w-3 h-3 rounded-full bg-green-500" />}
          label="Practice"
          to={`${basePath}/calendar?category=practice`}
          active={location.search.includes('category=practice')}
        />
        <NavItem
          icon={<div className="w-3 h-3 rounded-full bg-yellow-500" />}
          label="Revision"
          to={`${basePath}/calendar?category=revision`}
          active={location.search.includes('category=revision')}
        />
        <NavItem
          icon={<div className="w-3 h-3 rounded-full bg-red-500" />}
          label="Exams"
          to={`${basePath}/calendar?category=exams`}
          active={location.search.includes('category=exams')}
        />
        <NavItem
          icon={<div className="w-3 h-3 rounded-full bg-purple-500" />}
          label="Important"
          to={`${basePath}/calendar?category=important`}
          active={location.search.includes('category=important')}
        />
        <NavItem
          icon={<PlusCircle size={18} />}
          label="Add Category"
          onClick={() => {}}
        />
        
        <Separator className="my-4" />
        
        <div className="mb-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
          Tags
        </div>
        <NavItem
          icon={<Bookmark size={18} className="text-blue-500" />}
          label="Quantitative"
          to={`${basePath}/calendar?tag=quantitative`}
        />
        <NavItem
          icon={<Bookmark size={18} className="text-green-500" />}
          label="Reasoning"
          to={`${basePath}/calendar?tag=reasoning`}
        />
        <NavItem
          icon={<Bookmark size={18} className="text-orange-500" />}
          label="English"
          to={`${basePath}/calendar?tag=english`}
        />
      </nav>
      
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-purple-100 text-purple-800">
              {getInitial(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
          </div>
          <Button variant="ghost" size="icon">
            <Settings size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
