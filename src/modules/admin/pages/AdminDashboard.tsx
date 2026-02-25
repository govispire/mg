
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/app/providers';
import { useCategoryAdminData } from '@/hooks/useCategoryAdminData';
import EnhancedWelcomeBanner from '@/components/dashboard/EnhancedWelcomeBanner';
import AnalyticsCard from '@/components/analytics/AnalyticsCard';
import CategoryChart from '@/components/analytics/CategoryChart';
import CategorySpecificActions from '@/components/admin/CategorySpecificActions';
import { Users, FileText, CheckCircle, Upload, Bell, BarChart2, TrendingUp, Building, Crown, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { 
    categoryData, 
    contentCounts, 
    recentActivity, 
    userCategory, 
    isGlobalAdmin 
  } = useCategoryAdminData();

  // Get category-specific icon
  const getCategoryIcon = (category?: string) => {
    const iconMap: Record<string, any> = {
      'banking': Building,
      'ssc': Shield,
      'railway': TrendingUp,
      'upsc': Crown,
      'state-psc': Shield,
      'defence': Shield,
      'judicial': Crown,
      'regulatory': Building
    };
    return category ? iconMap[category] || Shield : Shield;
  };

  const CategoryIcon = getCategoryIcon(userCategory);

  return (
    <div className="w-full px-4 lg:px-6 py-6">
      <EnhancedWelcomeBanner name={user?.name || 'Admin'} role={user?.role} />
      
      <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg font-medium">
              {isGlobalAdmin ? 'Global Administration Panel' : `${categoryData.displayName} Administration`}
            </h2>
            {userCategory && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CategoryIcon className="h-3 w-3" />
                {categoryData.displayName} Admin
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {isGlobalAdmin 
              ? 'Manage platform-wide operations, users, and content across all categories'
              : `Manage ${categoryData.displayName} exams, content, and students`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            {isGlobalAdmin ? 'Global Report' : `${categoryData.displayName} Report`}
          </Button>
          <Button>
            {isGlobalAdmin ? 'Create Content' : `Create ${categoryData.displayName} Content`}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <AnalyticsCard 
          title={isGlobalAdmin ? "Total Students" : `${categoryData.displayName} Students`}
          value={categoryData.students.length}
          icon={Users}
          change={`+12 this week`}
          changeType="positive"
        />
        <AnalyticsCard 
          title="Active Students"
          value={categoryData.activeStudents}
          icon={TrendingUp}
          change={`${((categoryData.activeStudents/categoryData.students.length)*100).toFixed(1)}% active rate`}
          changeType="positive"
        />
        <AnalyticsCard 
          title="Pending Approvals"
          value={categoryData.pendingStudents}
          icon={CheckCircle}
          change={categoryData.pendingStudents > 0 ? `${categoryData.pendingStudents} need review` : 'All approved'}
          changeType={categoryData.pendingStudents > 0 ? 'negative' : 'positive'}
        />
        <AnalyticsCard 
          title={isGlobalAdmin ? "All Content Items" : `${categoryData.displayName} Content`}
          value={contentCounts.toLocaleString()}
          icon={Upload}
          change="+24 this month"
          changeType="positive"
        />
      </div>
      
      <Tabs defaultValue="overview" className="mt-10">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Student Management</TabsTrigger>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                Recent Student Activity
                {userCategory && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {categoryData.displayName} Category
                  </Badge>
                )}
              </h3>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">New registration: {student.name}</span>
                        <div className="text-sm text-gray-500">{student.category} • {student.state}</div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {student.registrationDate.toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No recent {userCategory ? categoryData.displayName : ''} student activity
                  </div>
                )}
              </div>
            </Card>
            
            <CategorySpecificActions 
              category={userCategory} 
              displayName={categoryData.displayName} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="students">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnalyticsCard
              title={`${categoryData.displayName} Active Students`}
              value={categoryData.activeStudents}
              icon={BarChart2}
              description={`Active students in ${isGlobalAdmin ? 'all categories' : 'your category'}`}
            />
            <AnalyticsCard
              title={`${categoryData.displayName} Total Students`}
              value={categoryData.students.length}
              icon={Users}
              description={`Total students in ${isGlobalAdmin ? 'all categories' : 'your category'}`}
            />
            <AnalyticsCard
              title="Engagement Rate"
              value={`${((categoryData.activeStudents/categoryData.students.length)*100).toFixed(1)}%`}
              icon={TrendingUp}
              description="Student engagement level"
            />
          </div>
          
          <Card className="mt-6 p-6">
            <h3 className="text-xl font-semibold mb-4">
              {isGlobalAdmin ? 'All Students' : `${categoryData.displayName} Students`}
            </h3>
            <div className="space-y-3">
              {categoryData.students.slice(0, 10).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{student.name}</span>
                    <div className="text-sm text-gray-500">
                      {student.category} • {student.state} • {student.status}
                    </div>
                  </div>
                  <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                    {student.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {isGlobalAdmin ? 'Global Content Overview' : `${categoryData.displayName} Content`}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Content Items</span>
                  <span className="font-bold">{contentCounts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Published Tests</span>
                  <span className="font-bold">{Math.floor(contentCounts * 0.3)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Video Content</span>
                  <span className="font-bold">{Math.floor(contentCounts * 0.4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Study Materials</span>
                  <span className="font-bold">{Math.floor(contentCounts * 0.3)}</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Content Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {isGlobalAdmin ? 'New' : categoryData.displayName} Content
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Create {isGlobalAdmin ? 'New' : categoryData.displayName} Test
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Send {isGlobalAdmin ? 'Platform' : categoryData.displayName} Notification
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          {isGlobalAdmin ? (
            <CategoryChart 
              data={{
                'Banking': 450,
                'SSC': 380,
                'Railway': 290,
                'UPSC': 340,
                'TNPSC': 210,
                'Defence': 180,
                'Judicial': 120,
                'Regulatory': 90
              }} 
              title="Students by Category"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">{categoryData.displayName} Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Student Growth</span>
                    <span className="text-green-600 font-semibold">+15.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Content Engagement</span>
                    <span className="text-blue-600 font-semibold">78.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Test Completion Rate</span>
                    <span className="text-purple-600 font-semibold">82.1%</span>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Category Insights</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Most popular content type: Practice Tests
                  </div>
                  <div className="text-sm text-gray-600">
                    Peak activity time: 7-9 PM
                  </div>
                  <div className="text-sm text-gray-600">
                    Average session duration: 45 minutes
                  </div>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
