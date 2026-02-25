
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  Book,
  Menu,
  LayoutDashboard,
  CalendarDays,
  UserCheck,
  BookOpen,
  FileCheck,
  FileText,
  Lightbulb,
  BarChart2,
  Heart,
  FileQuestion,
  HelpCircle
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useExamCategorySelection } from '@/hooks/useExamCategorySelection';

interface ProfileHeaderProps {
  onToggleSidebar: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { clearSelection } = useExamCategorySelection();

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleChangeExamCategory = () => {
    console.log('Clearing exam category selection from profile header...');
    clearSelection();
    // Navigate with state to indicate this is coming from profile
    navigate('/student/exam-categories', { state: { fromProfile: true } });
  };

  // Complete navigation items matching desktop sidebar
  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: '/student/dashboard' },
    { icon: <CalendarDays size={18} />, label: 'Calendar', to: '/student/calendar' },
    { icon: <UserCheck size={18} />, label: 'Mentorship', to: '/student/mentorship' },
    { icon: <BookOpen size={18} />, label: 'Courses', to: '/student/courses' },
    { icon: <FileCheck size={18} />, label: 'Tests', to: '/student/tests' },
    { icon: <FileText size={18} />, label: 'Current Affairs', to: '/student/current-affairs' },

    { icon: <BarChart2 size={18} />, label: 'Performance Analytics', to: '/student/performance' },
    { icon: <Heart size={18} />, label: 'Exam Tracker', to: '/student/self-care' },
    { icon: <FileText size={18} />, label: 'PDF Courses', to: '/student/pdf-courses' },
    { icon: <FileQuestion size={18} />, label: 'Doubt Forum', to: '/student/doubt-forum' },
    { icon: <HelpCircle size={18} />, label: 'FAQ', to: '/student/faq' },
  ];

  return (
    <header className="bg-white border-b shadow-sm py-2 px-3 sm:px-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 h-8 w-8 sm:h-9 sm:w-9">
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-64 p-0">
                <div className="flex flex-col h-full bg-white">
                  <div className="p-3 sm:p-4 border-b flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      P
                    </div>
                    <span className="text-base sm:text-lg font-bold">PrepSmart</span>
                  </div>

                  <div className="p-3 sm:p-4 border-b">
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm text-gray-500">Logged in as</span>
                      <span className="font-medium text-sm sm:text-base">{user?.name}</span>
                      <span className="text-xs text-purple-600 capitalize">Student</span>
                    </div>
                  </div>

                  <nav className="flex-1 overflow-y-auto p-3 sm:p-4">
                    <ul className="space-y-1 sm:space-y-2">
                      {navItems.map((item) => (
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            className={`flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 sm:py-3 text-sm transition-all hover:bg-gray-100 touch-manipulation ${location.pathname === item.to
                              ? "bg-purple-100 text-purple-700 font-medium"
                              : "text-gray-700"
                              }`}
                          >
                            {item.icon}
                            <span className="text-sm sm:text-base">{item.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  <div className="p-3 sm:p-4 border-t">
                    <button
                      onClick={logout}
                      className="w-full py-2 px-3 text-sm text-gray-700 flex items-center gap-2 hover:bg-gray-100 rounded-md transition-colors touch-manipulation"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-2 h-8 w-8 sm:h-9 sm:w-9">
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
              P
            </div>
            <span className="text-base sm:text-lg font-bold hidden sm:inline">PrepSmart</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9 px-1 sm:px-2 hover:bg-gray-100">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                <AvatarFallback className="bg-purple-600 text-white text-xs sm:text-sm">
                  {getInitials(user?.name || "User")}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline font-medium text-sm">{user?.name || "User"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-white border shadow-lg">
            <DropdownMenuLabel className="text-sm">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-100">
                <Link to="/student/profile" className="flex items-center w-full text-sm">
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 text-sm">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 text-sm">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Subscription Plan</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleChangeExamCategory} className="cursor-pointer hover:bg-gray-100 text-sm">
                <Book className="mr-2 h-4 w-4" />
                <span>Change Exam Category</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout?.()} className="cursor-pointer hover:bg-gray-100 text-sm">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default ProfileHeader;
