
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, CalendarDays, BookOpen, FileCheck,
  FileText, Lightbulb, BarChart2, Heart, FileQuestion,
  HelpCircle, Upload, Eye, CheckCircle, Users, Bell,
  PieChart, CreditCard, Settings, UserCheck, MessageSquare,
  Target, Clock, TrendingUp, Gift, Flame, Trophy, Star, Award, Lock, Shield,
  Sparkles, FileEdit, GraduationCap
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: string;
  highlight?: boolean;
  showStreak?: boolean;
}

interface StreakMilestone {
  days: number;
  reward: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active: boolean;
  collapsed: boolean;
  badge?: string;
  highlight?: boolean;
  streak?: number;
  longestStreak?: number;
  showStreak?: boolean;
}

const StreakTooltipContent: React.FC<{ streak: number; longestStreak: number }> = ({ streak, longestStreak }) => {
  const milestones: StreakMilestone[] = [
    { days: 3, reward: 'Bronze Badge', icon: <Award className="h-4 w-4 text-amber-600" />, unlocked: streak >= 3 },
    { days: 7, reward: '7-Day Champion', icon: <Trophy className="h-4 w-4 text-yellow-500" />, unlocked: streak >= 7 },
    { days: 14, reward: 'Silver Badge', icon: <Star className="h-4 w-4 text-gray-400" />, unlocked: streak >= 14 },
    { days: 30, reward: 'Gold Badge', icon: <Trophy className="h-4 w-4 text-yellow-400" />, unlocked: streak >= 30 },
    { days: 50, reward: 'Quiz Master', icon: <Award className="h-4 w-4 text-purple-500" />, unlocked: streak >= 50 },
    { days: 100, reward: 'Legend', icon: <Flame className="h-4 w-4 text-red-500" />, unlocked: streak >= 100 },
  ];

  const nextMilestone = milestones.find(m => !m.unlocked);
  const progressToNext = nextMilestone ? (streak / nextMilestone.days) * 100 : 100;

  return (
    <div className="w-64 p-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-orange-100 rounded-full">
          <Flame className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <p className="font-bold text-lg">{streak} Day Streak!</p>
          <p className="text-xs text-muted-foreground">Best: {longestStreak} days</p>
        </div>
      </div>

      {nextMilestone && (
        <div className="mb-3 p-2 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Next: {nextMilestone.reward}</span>
            <span className="font-medium">{streak}/{nextMilestone.days}</span>
          </div>
          <Progress value={progressToNext} className="h-1.5" />
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground mb-2">Milestones</p>
        {milestones.map((milestone) => (
          <div
            key={milestone.days}
            className={cn(
              "flex items-center gap-2 p-1.5 rounded-md text-xs transition-colors",
              milestone.unlocked ? "bg-primary/5" : "opacity-50"
            )}
          >
            {milestone.unlocked ? milestone.icon : <Lock className="h-4 w-4 text-muted-foreground" />}
            <span className={cn("flex-1", milestone.unlocked && "font-medium")}>{milestone.reward}</span>
            <span className="text-muted-foreground">{milestone.days}d</span>
            {milestone.unlocked && <CheckCircle className="h-3 w-3 text-green-500" />}
          </div>
        ))}
      </div>
    </div>
  );
};

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to, active, collapsed, badge, highlight, streak, longestStreak, showStreak }) => {
  return (
    <li className="mb-2">
      <Link
        to={to}
        className={cn(
          "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2.5 text-sm transition-all hover:bg-gray-100",
          active ? "bg-brand-blue/10 text-brand-blue font-semibold" : "text-gray-700 font-medium",
          highlight && !active && "bg-primary/5 border border-primary/20"
        )}
        title={label}
      >
        <div className="flex items-center gap-3">
          <span className={cn(highlight && "text-primary")}>{icon}</span>
          {!collapsed && <span className={cn("font-semibold", highlight && "text-primary")}>{label}</span>}
        </div>
        {!collapsed && (
          <div className="flex items-center gap-1.5">
            {showStreak && streak !== undefined && streak > 0 && (
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <div className="flex items-center gap-0.5 bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full cursor-pointer hover:bg-orange-200 transition-colors">
                    <Flame size={12} className="text-orange-500" />
                    <span className="text-[10px] font-bold">{streak}</span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent side="right" align="start" className="w-auto p-3">
                  <StreakTooltipContent streak={streak} longestStreak={longestStreak || streak} />
                </HoverCardContent>
              </HoverCard>
            )}
            {badge && (
              <Badge className="text-[10px] px-1.5 py-0 h-5 bg-primary text-primary-foreground animate-pulse">
                {badge}
              </Badge>
            )}
          </div>
        )}
      </Link>
    </li>
  );
};

interface SidebarProps {
  role: 'student' | 'admin' | 'instructor' | 'employee' | 'super-admin' | 'owner' | 'mentor';
  basePath: string;
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ role, basePath, collapsed }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  // Load streak data from localStorage for students
  useEffect(() => {
    if (role === 'student') {
      try {
        const storedStreak = localStorage.getItem('streak_data');
        if (storedStreak) {
          const parsed = JSON.parse(storedStreak);
          setStreak(parsed.currentStreak || 0);
          setLongestStreak(parsed.longestStreak || 0);
        }
      } catch (error) {
        console.error('Error loading streak data:', error);
      }
    }
  }, [role]);

  // Check if current path matches or is a sub-path of the nav item
  const isActive = (path: string) => {
    if (path === `${basePath}/mentorship`) {
      // For mentorship, check if current path starts with mentorship
      return location.pathname.startsWith(`${basePath}/mentorship`);
    }
    return location.pathname === path;
  };

  // Define navigation items based on role
  const getNavItems = () => {
    switch (role) {
      case 'student':
        return [
          { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: `${basePath}/dashboard` },
          { icon: <BookOpen size={18} />, label: 'Know Your Syllabus', to: `${basePath}/syllabus` },
          { icon: <UserCheck size={18} />, label: 'Mentorship', to: `${basePath}/mentorship/dashboard` },
          { icon: <BookOpen size={18} />, label: 'Courses', to: `${basePath}/courses` },

          { icon: <FileCheck size={18} />, label: 'Tests', to: `${basePath}/tests` },
          { icon: <FileText size={18} />, label: 'Current Affairs', to: `${basePath}/current-affairs` },
          { icon: <Gift size={18} />, label: 'Daily Free Quizzes', to: `${basePath}/daily-quizzes`, badge: 'TODAY', highlight: true, showStreak: true },


          { icon: <Bell size={18} />, label: 'Exam Notifications', to: `${basePath}/exam-notifications` },
          { icon: <Heart size={18} />, label: 'Exam Tracker', to: `${basePath}/self-care` },
          { icon: <FileText size={18} />, label: 'PDF Courses', to: `${basePath}/pdf-courses` },
        ];
      case 'mentor':
        return [
          { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: `${basePath}/dashboard` },
          { icon: <CalendarDays size={18} />, label: 'Calendar', to: `${basePath}/calendar` },
          { icon: <Users size={18} />, label: 'My Students', to: `${basePath}/students` },
          { icon: <Target size={18} />, label: 'Assign Tasks', to: `${basePath}/assign-tasks` },
          { icon: <TrendingUp size={18} />, label: 'Progress Tracking', to: `${basePath}/progress` },
          { icon: <CalendarDays size={18} />, label: 'Sessions', to: `${basePath}/sessions` },
          { icon: <MessageSquare size={18} />, label: 'Messages', to: `${basePath}/messages` },
          { icon: <BarChart2 size={18} />, label: 'Analytics', to: `${basePath}/analytics` },
          { icon: <Clock size={18} />, label: 'Schedule', to: `${basePath}/schedule` },
        ];
      case 'employee':
        return [
          { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: `${basePath}/dashboard` },
          { icon: <CalendarDays size={18} />, label: 'Calendar', to: `${basePath}/calendar` },
          { icon: <Upload size={18} />, label: 'Upload Questions & Tests', to: `${basePath}/upload-questions` },
          { icon: <Upload size={18} />, label: 'Upload Study Materials', to: `${basePath}/upload-materials` },
          { icon: <Eye size={18} />, label: 'Preview Tests', to: `${basePath}/preview-tests` },
          { icon: <CheckCircle size={18} />, label: 'Approvals', to: `${basePath}/approvals` },
        ];
      case 'admin':
        return [
          { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: `${basePath}/dashboard` },
          { icon: <CalendarDays size={18} />, label: 'Calendar', to: `${basePath}/calendar` },
          { icon: <Users size={18} />, label: 'Manage Employees', to: `${basePath}/manage-employees` },
          { icon: <Users size={18} />, label: 'Manage Students', to: `${basePath}/manage-students` },
          { icon: <FileCheck size={18} />, label: 'Create/Edit Tests', to: `${basePath}/edit-tests` },
          { icon: <Upload size={18} />, label: 'Upload Courses & PDFs', to: `${basePath}/upload-courses` },
          { icon: <Bell size={18} />, label: 'Push Notifications', to: `${basePath}/notifications` },
        ];
      case 'super-admin':
        return [
          { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: `${basePath}/dashboard` },
          { icon: <CalendarDays size={18} />, label: 'Calendar', to: `${basePath}/calendar` },
          { icon: <Users size={18} />, label: 'Create Admins', to: `${basePath}/create-admins` },
          { icon: <Users size={18} />, label: 'Manage All Users', to: `${basePath}/manage-users` },
          { icon: <CreditCard size={18} />, label: 'Payment/Plans', to: `${basePath}/payment-plans` },
          { icon: <BarChart2 size={18} />, label: 'View Analytics', to: `${basePath}/analytics` },
          { icon: <Sparkles size={18} />, label: 'Create AI Blog', to: `${basePath}/create-blog`, highlight: true },
          { icon: <FileEdit size={18} />, label: 'Manage Blogs', to: `${basePath}/manage-blogs` },
          { icon: <GraduationCap size={18} />, label: 'Test Catalog', to: `${basePath}/test-catalog`, highlight: true },
        ];
      case 'owner':
        return [
          { icon: <LayoutDashboard size={18} />, label: 'Dashboard', to: `${basePath}/dashboard` },
          { icon: <Users size={18} />, label: 'Manage Users', to: `${basePath}/manage-users` },
          { icon: <FileText size={18} />, label: 'Content Management', to: `${basePath}/content-management` },
          { icon: <PieChart size={18} />, label: 'Business Analytics', to: `${basePath}/business-analytics` },
          { icon: <CalendarDays size={18} />, label: 'Calendar', to: `${basePath}/calendar` },
          { icon: <Bell size={18} />, label: 'Notifications', to: `${basePath}/notifications` },
          { icon: <CreditCard size={18} />, label: 'Payments & Plans', to: `${basePath}/payments-plans` },
          { icon: <Settings size={18} />, label: 'Settings', to: `${basePath}/settings` },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className={`h-full bg-white border-r flex flex-col ${collapsed ? 'items-center' : ''}`}>
      <div className={`p-4 border-b flex ${collapsed ? 'justify-center' : 'items-center gap-2'}`}>
        <div className="w-7 h-7 rounded-full bg-brand-blue flex items-center justify-center text-white text-sm font-bold">P</div>
        {!collapsed && <span className="text-base font-bold">PrepSmart</span>}
      </div>

      {collapsed && (
        <div className="py-4 border-b flex justify-center">
          <Avatar>
            <AvatarFallback className="bg-brand-blue text-white">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className={`space-y-1 ${collapsed ? 'items-center' : ''}`}>
          {navItems.map((item: NavItem) => (
            <SidebarItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              active={isActive(item.to)}
              collapsed={collapsed}
              badge={item.badge}
              highlight={item.highlight}
              streak={streak}
              longestStreak={longestStreak}
              showStreak={item.showStreak}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
