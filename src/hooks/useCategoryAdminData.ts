
import { useMemo } from 'react';
import { useAuth } from '@/app/providers';
import { useStudentData } from '@/app/providers';

export const useCategoryAdminData = () => {
  const { user } = useAuth();
  const { analytics, students } = useStudentData();

  const categoryData = useMemo(() => {
    const userCategory = user?.examCategory;
    
    if (!userCategory) {
      return {
        students: students,
        activeStudents: students.filter(s => s.status === 'active').length,
        pendingStudents: students.filter(s => s.status === 'pending').length,
        categorySpecific: false,
        displayName: 'All Categories'
      };
    }

    // Filter students by category
    const categoryStudents = students.filter(s => 
      s.category?.toLowerCase() === userCategory.toLowerCase()
    );
    
    const activeStudents = categoryStudents.filter(s => s.status === 'active').length;
    const pendingStudents = categoryStudents.filter(s => s.status === 'pending').length;

    // Get category display name
    const categoryMap: Record<string, string> = {
      'banking': 'Banking',
      'ssc': 'SSC',
      'railway': 'Railway',
      'upsc': 'UPSC',
      'state-psc': 'TNPSC',
      'defence': 'Defence',
      'judicial': 'Judicial',
      'regulatory': 'Regulatory'
    };

    return {
      students: categoryStudents,
      activeStudents,
      pendingStudents,
      categorySpecific: true,
      displayName: categoryMap[userCategory] || userCategory.toUpperCase(),
      category: userCategory
    };
  }, [user?.examCategory, students]);

  // Get category-specific content counts
  const contentCounts = useMemo(() => {
    const baseCount = 1245;
    const categoryMultipliers: Record<string, number> = {
      'banking': 1.2,
      'ssc': 1.1,
      'railway': 0.9,
      'upsc': 1.3,
      'state-psc': 0.8,
      'defence': 0.7,
      'judicial': 0.6,
      'regulatory': 0.5
    };

    const multiplier = user?.examCategory ? categoryMultipliers[user.examCategory] || 1 : 1;
    return Math.floor(baseCount * multiplier);
  }, [user?.examCategory]);

  // Get category-specific recent activity
  const recentActivity = useMemo(() => {
    if (!user?.examCategory) {
      return analytics.recentRegistrations.slice(0, 5);
    }

    return analytics.recentRegistrations
      .filter(s => s.category?.toLowerCase() === user.examCategory?.toLowerCase())
      .slice(0, 5);
  }, [user?.examCategory, analytics.recentRegistrations]);

  // Get category-specific quick actions
  const quickActions = useMemo(() => {
    const baseActions = [
      { icon: 'Users', label: 'Manage Users', description: 'User management' },
      { icon: 'FileText', label: 'Create Test', description: 'Test creation' },
      { icon: 'Upload', label: 'Upload Content', description: 'Content upload' },
      { icon: 'Bell', label: 'Send Notification', description: 'Notifications' }
    ];

    if (user?.examCategory) {
      return [
        { icon: 'Users', label: `Manage ${categoryData.displayName} Students`, description: `${categoryData.displayName} student management` },
        { icon: 'FileText', label: `Create ${categoryData.displayName} Test`, description: `${categoryData.displayName} test creation` },
        { icon: 'Upload', label: `Upload ${categoryData.displayName} Content`, description: `${categoryData.displayName} content` },
        { icon: 'Bell', label: `${categoryData.displayName} Notifications`, description: `Category notifications` }
      ];
    }

    return baseActions;
  }, [user?.examCategory, categoryData.displayName]);

  return {
    categoryData,
    contentCounts,
    recentActivity,
    quickActions,
    userCategory: user?.examCategory,
    isGlobalAdmin: !user?.examCategory
  };
};
