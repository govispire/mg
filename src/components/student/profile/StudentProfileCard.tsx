import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/app/providers';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useExamCategorySelection } from '@/hooks/useExamCategorySelection';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Calendar, BookOpen, Target, Award, Clock, CheckCircle2, TrendingUp, DollarSign, Edit, ShieldCheck, Crown, ClipboardList, Gift, Hourglass, XCircle, Activity, CalendarCheck, Shield } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { CompulsoryFormModal } from '@/components/auth/UpdatedAuthModal';
import StudyHeatmap from '../StudyHeatmap';

interface StudentProfileCardProps {
  className?: string;
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

const StudentProfileCard: React.FC<StudentProfileCardProps> = ({ className }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('userProfile', null);
  const { clearSelection } = useExamCategorySelection();
  const [showEditProfile, setShowEditProfile] = React.useState(false);

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleProfileUpdate = (data: any) => {
    if (!userProfile) return;
    setUserProfile({ ...userProfile, ...data });
    setShowEditProfile(false);
  };

  const handleInstantUpdate = (data: any) => {
    if (!userProfile) return;
    setUserProfile({ ...userProfile, ...data });
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };


  // Defensive check for profile data
  const displayName = user?.name || "Student User";
  const displayEmail = userProfile?.email || user?.email || "student@example.com";
  const displayPhone = userProfile?.phone || "Phone not set";
  const displayLocation = userProfile?.state || "Location not set";
  const displayCategory = userProfile?.examCategory === 'others' ? userProfile?.customExamCategory : "Banking & Insurance";
  const displayTarget = userProfile?.targetExam === 'others' ? userProfile?.customTargetExam : "IBPS PO 2024";
  const formattedStartDate = userProfile?.preparationStartDate
    ? new Date(userProfile.preparationStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : "Not updated";

  // Calculate stats logic
  const signupDate = new Date('2024-08-15'); // Mock signup based on context
  const today = new Date();
  const totalDaysSinceSignup = differenceInDays(today, signupDate);
  const activeDays = 124; // Mock active days count


  return (
    <div className={`space-y-6 ${className}`}>

      {/* 1. New Header Section with Cover */}
      <div className="relative rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100">
        {/* Decorative Cover Background */}
        <div className="h-40 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute left-10 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 gap-6 relative">
            {/* Profile Avatar */}
            <div className="relative group">
              <div className="rounded-full p-1.5 bg-white shadow-xl ring-1 ring-slate-100 relative z-10">
                <Avatar className="h-32 w-32 border-4 border-white shadow-inner bg-slate-100">
                  <AvatarImage src={userProfile?.avatar || user?.avatar} className="object-cover" />
                  <AvatarFallback className="text-4xl font-bold bg-indigo-50 text-indigo-600">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <button
                onClick={handleEditProfile}
                className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all z-20 border-2 border-white"
                title="Update Photo"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>

            {/* Name & Basic Info */}
            <div className="flex-1 mt-2 md:mt-0">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    {displayName}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified Student
                    </span>
                  </h1>
                  <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-slate-400" /> {displayEmail}
                  </p>
                </div>

                <Button onClick={handleEditProfile} className="shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 rounded-full transition-all">
                  <Edit className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 2. Personal Information Card */}
        <Card className="md:col-span-1 shadow-sm border-slate-200 h-full">
          <CardHeader className="border-b bg-slate-50/50 pb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" /> Personal Details
            </h3>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">State / Location</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5 capitalize">{displayLocation}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Phone Number</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{displayPhone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Prep Started On</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{formattedStartDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Academic Focus Card */}
        <Card className="md:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-rose-500" /> Academic Goals
            </h3>
            <span className="text-xs font-bold bg-rose-100 text-rose-700 px-3 py-1 rounded-full border border-rose-200">Active</span>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Category */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Current Exam Category</p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="h-10 w-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-xl">📚</div>
                  <div>
                    <p className="font-bold text-slate-800 text-base">{displayCategory}</p>
                    <p className="text-xs text-slate-500">Selected Path</p>
                  </div>
                </div>
              </div>

              {/* Target */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Primary Target</p>
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 flex items-center gap-3 relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10">
                    <Target className="w-24 h-24 text-indigo-600 -mr-6 -mt-6" />
                  </div>
                  <div className="h-10 w-10 bg-indigo-600 rounded-lg shadow-md flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="relative z-10">
                    <p className="font-bold text-indigo-900 text-base">{displayTarget}</p>
                    <p className="text-xs text-indigo-600 font-medium">High Priority Goal</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Course Completion Progress</span>
                <span className="text-sm font-bold text-slate-900">45%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-[45%] shadow-sm"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Stats Row */}
        <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Tests Completed',
              value: '142',
              icon: ClipboardList,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              subtext: 'Across all categories'
            },
            {
              label: 'Free Quizzes / Tests',
              value: '89',
              icon: Gift,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              subtext: 'Practice sets'
            },
            {
              label: 'Total Prep Days',
              value: '186',
              icon: CalendarCheck,
              color: 'text-violet-600',
              bg: 'bg-violet-50',
              subtext: 'Consistent effort'
            },
            {
              label: 'Total Hours Studied',
              value: '347h',
              icon: Clock,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              subtext: 'Focused time'
            },
            {
              label: 'Active / Total Days',
              value: `${activeDays} / ${totalDaysSinceSignup}`,
              icon: Activity,
              color: 'text-indigo-600',
              bg: 'bg-indigo-50',
              subtext: 'Since joining'
            },
            {
              label: 'Total Exams Failed',
              value: '2',
              icon: XCircle,
              color: 'text-red-600',
              bg: 'bg-red-50',
              subtext: 'Learning attempts'
            },
            {
              label: 'Total Exams Cleared',
              value: '3',
              icon: CheckCircle2,
              color: 'text-green-600',
              bg: 'bg-green-50',
              subtext: 'Success milestones'
            },
            {
              label: 'Total Amount Spent',
              value: '₹12,500',
              icon: DollarSign,
              color: 'text-rose-600',
              bg: 'bg-rose-50',
              subtext: 'Investment in future'
            },
          ].map((stat, i) => (
            <Card key={i} className="shadow-sm border-slate-100 hover:shadow-md transition-shadow hover:border-indigo-100 group">
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">{stat.label}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{stat.subtext}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 5. Journey Heatmap */}
        <div className="md:col-span-3">
          <StudyHeatmap title="Total Journey Days" className="border-slate-200 shadow-sm" />
        </div>

      </div>

      {/* Edit Profile Modal (Re-used) */}
      {
        showEditProfile && (
          <CompulsoryFormModal
            open={showEditProfile}
            onOpenChange={setShowEditProfile}
            username={displayName}
            initialData={userProfile || undefined}
            onInstantUpdate={handleInstantUpdate}
            onComplete={handleProfileUpdate}
          />
        )
      }
    </div >
  );
};

export default StudentProfileCard;
