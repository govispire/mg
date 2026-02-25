
import { GraduationCap, Building, Shield, Crown, Users } from 'lucide-react';
import { UserRole } from '@/app/providers';

export interface RoleData {
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  tabs: string[];
  tabLabels: string[];
}

export const getRoleData = (user: any): RoleData => {
  switch (user?.role) {
    case 'student':
      return {
        title: `${user.examCategory || 'General'} Aspirant`,
        subtitle: 'Started Aug 2024',
        icon: GraduationCap,
        color: 'from-blue-500 to-purple-500',
        tabs: ['personal', 'exams', 'stats'],
        tabLabels: ['Personal', 'Exam Progress', 'Statistics']
      };
    case 'employee':
      return {
        title: `${user.employeeCategory || 'General'} Employee`,
        subtitle: `${user.examCategory || 'Multi-Category'} Department`,
        icon: Building,
        color: 'from-green-500 to-blue-500',
        tabs: ['personal', 'work', 'performance'],
        tabLabels: ['Personal', 'Work Info', 'Performance']
      };
    case 'admin':
      return {
        title: `${user.examCategory || 'Global'} Administrator`,
        subtitle: 'Platform Management',
        icon: Shield,
        color: 'from-red-500 to-pink-500',
        tabs: ['personal', 'admin', 'analytics'],
        tabLabels: ['Personal', 'Admin Info', 'Analytics']
      };
    case 'super-admin':
      return {
        title: 'Super Administrator',
        subtitle: 'Global Platform Control',
        icon: Crown,
        color: 'from-purple-500 to-indigo-500',
        tabs: ['personal', 'super-admin', 'system'],
        tabLabels: ['Personal', 'Super Admin', 'System']
      };
    case 'owner':
      return {
        title: 'Platform Owner',
        subtitle: 'Business Operations',
        icon: Crown,
        color: 'from-yellow-500 to-orange-500',
        tabs: ['personal', 'business', 'financials'],
        tabLabels: ['Personal', 'Business', 'Financials']
      };
    case 'mentor':
      return {
        title: `${user.examCategory || 'Multi-Category'} Mentor`,
        subtitle: 'Student Guidance',
        icon: Users,
        color: 'from-teal-500 to-cyan-500',
        tabs: ['personal', 'mentorship', 'students'],
        tabLabels: ['Personal', 'Mentorship', 'Students']
      };
    default:
      return {
        title: 'User',
        subtitle: 'Platform Member',
        icon: Users,
        color: 'from-gray-500 to-slate-500',
        tabs: ['personal'],
        tabLabels: ['Personal']
      };
  }
};
