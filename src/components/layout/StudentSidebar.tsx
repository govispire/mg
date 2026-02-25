
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  UsersRound,
  MessageSquare,
  HelpCircle,
  Heart,
  Download,
  Zap,
  Newspaper,
  Bell,
  TrendingUpDown,
  Gift,
  Shield,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/student/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Calendar',
    url: '/student/calendar',
    icon: Calendar,
  },
  {
    title: 'Mentorship',
    url: '/student/mentorship',
    icon: Users,
  },
  {
    title: 'Courses',
    url: '/student/courses',
    icon: BookOpen,
  },
  {
    title: 'Tests',
    url: '/student/tests',
    icon: FileText,
  },
  {
    title: 'Current Affairs',
    url: '/student/current-affairs',
    icon: Newspaper,
  },
  {
    title: 'Daily Free Quizzes',
    url: '/student/daily-quizzes',
    icon: Gift,
    isHighlighted: true,
    badge: 'TODAY',
  },

  {
    title: 'Performance',
    url: '/student/performance',
    icon: TrendingUp,
  },
  {
    title: 'Exam Notifications',
    url: '/student/exam-notifications',
    icon: Bell,
  },
  {
    title: 'Exam Tracker',
    url: '/student/self-care',
    icon: Heart,
  },
  {
    title: 'PDF Courses',
    url: '/student/pdf-courses',
    icon: Download,
  },
  {
    title: 'Doubt Forum',
    url: '/student/doubt-forum',
    icon: MessageSquare,
  },
  {
    title: 'FAQ',
    url: '/student/faq',
    icon: HelpCircle,
  },
];

export function StudentSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-foreground">PrepSmart</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className={cn(
                      item.isHighlighted && !location.pathname.includes(item.url) &&
                      "bg-primary/10 hover:bg-primary/20 border border-primary/20"
                    )}
                  >
                    <Link to={item.url} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <item.icon className={cn(
                          "h-4 w-4",
                          item.isHighlighted && "text-primary"
                        )} />
                        <span className={cn(
                          item.isHighlighted && "font-medium text-primary"
                        )}>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4 bg-primary text-primary-foreground">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          © 2025 PrepSmart
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
