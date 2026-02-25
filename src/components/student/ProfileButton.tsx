
import React, { useState } from 'react';
import { useAuth } from '@/app/providers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User, Settings, CreditCard, LogOut, Target, MapPin,
  BookOpen, BarChart2, Upload, Users, Shield, Crown,
  Bell, Calendar, MessageSquare, Clock, DollarSign, Building2,
  Activity, Lock, Edit,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CompulsoryFormModal } from '@/components/auth/UpdatedAuthModal';
import { useExamCategorySelection } from '@/hooks/useExamCategorySelection';

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = 'student' | 'admin' | 'instructor' | 'employee' | 'super-admin' | 'owner' | 'mentor';

interface ProfileButtonProps {
  showProfileCard?: boolean;
  role?: Role;
}

interface UserProfile {
  username: string;
  email: string;
  phone: string;
  examCategory: string;
  customExamCategory?: string;
  targetExam: string;
  customTargetExam?: string;
  preparationStartDate: Date | null;
  state: string;
  avatar?: string;
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  route: string;
}

interface RoleConfig {
  /** Tailwind gradient classes for the header background */
  gradient: string;
  /** Badge color classes */
  badgeColor: string;
  /** Role display label shown in the badge */
  roleLabel: string;
  /** Two info fields shown in the summary grid */
  info: { icon: React.ReactNode; label: string; value: (user: any, profile: any) => string }[];
  /** Quick-action menu items */
  actions: QuickAction[];
  /** Text on the logout button */
  logoutLabel: string;
  /** Avatar fallback bg */
  avatarBg: string;
}

// ─── Role Config Map ──────────────────────────────────────────────────────────

const getRoleConfig = (role: Role, basePath: string): RoleConfig => {
  switch (role) {
    case 'student':
      return {
        gradient: 'from-blue-600/10 via-background to-purple-600/10',
        badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
        roleLabel: 'Student',
        avatarBg: 'bg-gradient-to-br from-blue-500 to-purple-600',
        info: [
          {
            icon: <Target className="h-3 w-3" />,
            label: 'Target Exam',
            value: (_, p) => p?.targetExam?.toUpperCase().replace('-', ' ') || 'NOT SET',
          },
          {
            icon: <MapPin className="h-3 w-3" />,
            label: 'State',
            value: (_, p) => p?.state || 'NOT SET',
          },
        ],
        actions: [
          { icon: <User className="h-4 w-4" />, label: 'Full Account Details', route: '/student/profile?tab=details' },
          { icon: <Settings className="h-4 w-4" />, label: 'Security Settings', route: '/student/profile?tab=security' },
          { icon: <CreditCard className="h-4 w-4" />, label: 'Premium Subscription', route: '/student/profile?tab=subscription' },
        ],
        logoutLabel: 'Sign Out',
      };

    case 'mentor':
      return {
        gradient: 'from-teal-600/10 via-background to-cyan-600/10',
        badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
        roleLabel: 'Mentor',
        avatarBg: 'bg-gradient-to-br from-teal-500 to-cyan-600',
        info: [
          {
            icon: <Users className="h-3 w-3" />,
            label: 'My Students',
            value: (u) => u?.studentCount ? `${u.studentCount} Active` : 'View Students',
          },
          {
            icon: <Calendar className="h-3 w-3" />,
            label: 'Sessions',
            value: (u) => u?.sessionCount ? `${u.sessionCount} This Week` : 'View Schedule',
          },
        ],
        actions: [
          { icon: <Calendar className="h-4 w-4" />, label: 'My Schedule', route: '/mentor/schedule' },
          { icon: <MessageSquare className="h-4 w-4" />, label: 'Messages', route: '/mentor/messages' },
          { icon: <Clock className="h-4 w-4" />, label: 'Set Availability', route: '/mentor/sessions' },
        ],
        logoutLabel: 'End Session',
      };

    case 'employee':
      return {
        gradient: 'from-green-600/10 via-background to-blue-600/10',
        badgeColor: 'bg-green-100 text-green-700 border-green-200',
        roleLabel: 'Employee',
        avatarBg: 'bg-gradient-to-br from-green-500 to-blue-600',
        info: [
          {
            icon: <Building2 className="h-3 w-3" />,
            label: 'Department',
            value: (u) => u?.examCategory || 'General',
          },
          {
            icon: <BookOpen className="h-3 w-3" />,
            label: 'Category',
            value: (u) => u?.employeeCategory || 'Content',
          },
        ],
        actions: [
          { icon: <Upload className="h-4 w-4" />, label: 'Upload Questions & Tests', route: '/employee/upload-questions' },
          { icon: <Upload className="h-4 w-4" />, label: 'Upload Study Materials', route: '/employee/upload-materials' },
          { icon: <Settings className="h-4 w-4" />, label: 'Account Settings', route: '/employee/profile' },
        ],
        logoutLabel: 'Clock Out',
      };

    case 'admin':
      return {
        gradient: 'from-red-600/10 via-background to-pink-600/10',
        badgeColor: 'bg-red-100 text-red-700 border-red-200',
        roleLabel: 'Admin',
        avatarBg: 'bg-gradient-to-br from-red-500 to-pink-600',
        info: [
          {
            icon: <Shield className="h-3 w-3" />,
            label: 'Domain',
            value: (u) => u?.examCategory || 'All Categories',
          },
          {
            icon: <Users className="h-3 w-3" />,
            label: 'Manages',
            value: () => 'Staff & Students',
          },
        ],
        actions: [
          { icon: <Users className="h-4 w-4" />, label: 'Manage Staff', route: '/admin/manage-employees' },
          { icon: <Bell className="h-4 w-4" />, label: 'Push Notifications', route: '/admin/notifications' },
          { icon: <Settings className="h-4 w-4" />, label: 'Admin Settings', route: '/admin/profile' },
        ],
        logoutLabel: 'Admin Logout',
      };

    case 'super-admin':
      return {
        gradient: 'from-purple-600/10 via-background to-indigo-600/10',
        badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
        roleLabel: 'Super Admin',
        avatarBg: 'bg-gradient-to-br from-purple-500 to-indigo-600',
        info: [
          {
            icon: <Activity className="h-3 w-3" />,
            label: 'Access Level',
            value: () => 'Global Control',
          },
          {
            icon: <Lock className="h-3 w-3" />,
            label: 'Clearance',
            value: () => 'Maximum',
          },
        ],
        actions: [
          { icon: <Users className="h-4 w-4" />, label: 'Create Admins', route: '/super-admin/create-admins' },
          { icon: <BarChart2 className="h-4 w-4" />, label: 'View Analytics', route: '/super-admin/analytics' },
          { icon: <Shield className="h-4 w-4" />, label: 'System Settings', route: '/super-admin/settings' },
        ],
        logoutLabel: 'Secure Logout',
      };

    case 'owner':
      return {
        gradient: 'from-yellow-600/10 via-background to-orange-600/10',
        badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        roleLabel: 'Owner',
        avatarBg: 'bg-gradient-to-br from-yellow-500 to-orange-600',
        info: [
          {
            icon: <DollarSign className="h-3 w-3" />,
            label: 'Revenue View',
            value: () => 'Business Analytics',
          },
          {
            icon: <Crown className="h-3 w-3" />,
            label: 'Access',
            value: () => 'Full Platform',
          },
        ],
        actions: [
          { icon: <BarChart2 className="h-4 w-4" />, label: 'Business Analytics', route: '/owner/business-analytics' },
          { icon: <CreditCard className="h-4 w-4" />, label: 'Payments & Plans', route: '/owner/payments-plans' },
          { icon: <Settings className="h-4 w-4" />, label: 'Platform Settings', route: '/owner/settings' },
        ],
        logoutLabel: 'Owner Logout',
      };

    default:
      return getRoleConfig('student', basePath);
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

const ProfileButton: React.FC<ProfileButtonProps> = ({ showProfileCard = false, role: roleProp }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { clearSelection } = useExamCategorySelection();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('userProfile', null);

  // Derive role: prefer explicit prop, fall back to user.role, then 'student'
  const role: Role = (roleProp || user?.role || 'student') as Role;
  const config = getRoleConfig(role, `/${role}`);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const handleEditProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEditProfile(true);
  };

  const handleProfileUpdate = (data: any) => {
    if (!userProfile) return;
    setUserProfile({ ...userProfile, ...data });
    setShowEditProfile(false);
    if (data.examCategory !== userProfile.examCategory) {
      // Optional: trigger data reload
    }
  };

  const handleInstantUpdate = (data: any) => {
    if (!userProfile) return;
    setUserProfile({ ...userProfile, ...data });
  };

  const handleLogout = () => {
    if (role === 'student') {
      clearSelection();
    }
    logout?.();
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9 px-1 sm:px-2">
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
              <AvatarImage
                src={userProfile?.avatar || user?.avatar}
                alt={user?.name || 'User'}
                className="object-cover"
              />
              <AvatarFallback className={`text-xs sm:text-sm text-white ${config.avatarBg}`}>
                {getInitials(user?.name || 'User')}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-sm font-medium">{user?.name || 'User'}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[340px] p-0 overflow-hidden shadow-2xl border-muted/20"
          forceMount
        >
          {/* ── Role-coloured header ─────────────────────────── */}
          <div className={`p-5 bg-gradient-to-br ${config.gradient} border-b relative overflow-hidden`}>
            {/* subtle decorative blob */}
            <div className="absolute right-[-10%] top-[-10%] w-32 h-32 rounded-full blur-[60px] bg-primary/10 pointer-events-none" />

            <div className="flex flex-col gap-4 relative z-10">
              {/* Avatar + name row */}
              <div className="flex items-center gap-4">
                <div
                  className="relative group cursor-pointer shrink-0"
                  onClick={role === 'student' ? handleEditProfile : undefined}
                >
                  <Avatar className="h-16 w-16 border-4 border-background shadow-lg group-hover:ring-2 group-hover:ring-primary/30 transition-all duration-300">
                    <AvatarImage
                      src={userProfile?.avatar || user?.avatar}
                      alt={user?.name || 'User'}
                      className="object-cover"
                    />
                    <AvatarFallback className={`text-2xl font-bold text-white ${config.avatarBg}`}>
                      {getInitials(user?.name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  {role === 'student' && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-lg font-extrabold truncate leading-none text-foreground">
                      {user?.name || 'User'}
                    </p>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-medium mb-2">
                    {user?.email || 'user@prepsmart.com'}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 ${config.badgeColor}`}
                  >
                    {config.roleLabel}
                  </Badge>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-primary/10">
                {config.info.map((field, i) => (
                  <div key={i} className={`space-y-1 ${i > 0 ? 'pl-3 border-l border-primary/10' : ''}`}>
                    <p className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest flex items-center gap-1.5">
                      {field.icon}
                      {field.label}
                    </p>
                    <p className="text-sm font-bold text-foreground truncate">
                      {field.value(user, userProfile)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Quick actions ─────────────────────────────────── */}
          <div className="p-2 space-y-1 bg-background">
            {config.actions.map((action) => (
              <DropdownMenuItem
                key={action.route}
                onClick={() => navigate(action.route)}
                className="h-11 px-4 cursor-pointer rounded-lg hover:bg-primary/5 group"
              >
                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mr-3 group-hover:bg-primary/10 transition-colors">
                  <span className="text-muted-foreground group-hover:text-primary">{action.icon}</span>
                </div>
                <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground">
                  {action.label}
                </span>
              </DropdownMenuItem>
            ))}

            <div className="h-px bg-muted/60 my-2 mx-2" />

            {/* ── Logout ────────────────────────────────────────── */}
            <DropdownMenuItem
              onClick={handleLogout}
              className="h-11 px-4 cursor-pointer rounded-lg text-red-600 focus:text-red-700 focus:bg-red-50 font-bold transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3">
                <LogOut className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-sm">{config.logoutLabel}</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Profile Modal — only for students */}
      {showEditProfile && role === 'student' && (
        <CompulsoryFormModal
          open={showEditProfile}
          onOpenChange={setShowEditProfile}
          username={user?.name || ''}
          initialData={userProfile || undefined}
          onInstantUpdate={handleInstantUpdate}
          onComplete={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default ProfileButton;
