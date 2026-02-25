import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/app/providers';
import { useStudentData } from '@/app/providers';
import EnhancedWelcomeBanner from '@/components/dashboard/EnhancedWelcomeBanner';
import AnalyticsCard from '@/components/analytics/AnalyticsCard';
import CategoryChart from '@/components/analytics/CategoryChart';
import { DollarSign, Users, TrendingUp, Building, BarChart3, MapPin } from 'lucide-react';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const { analytics } = useStudentData();

  const calculateRevenue = () => {
    // Assuming average revenue per student of ₹2,500
    return `₹${(analytics.totalStudents * 2.5).toFixed(1)}L`;
  };

  const getConversionRate = () => {
    const activeStudents = analytics.totalStudents;
    const totalVisitors = activeStudents * 4; // Assuming 4:1 visitor to conversion ratio
    return `${((activeStudents / totalVisitors) * 100).toFixed(1)}%`;
  };

  return (
    <div className="w-full px-4 lg:px-6 py-6">
      <EnhancedWelcomeBanner name={user?.name || 'Owner'} role={user?.role} />

      <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium">Business Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor your platform's performance and growth metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Download Report</Button>
          <Button>Business Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <AnalyticsCard
          title="Total Revenue"
          value={calculateRevenue()}
          icon={DollarSign}
          change={`+${analytics.growthMetrics.monthlyGrowth} students this month`}
          changeType="positive"
        />
        <AnalyticsCard
          title="Active Students"
          value={analytics.totalStudents.toLocaleString()}
          icon={Users}
          change={`+${analytics.growthMetrics.weeklyGrowth} this week`}
          changeType="positive"
        />
        <AnalyticsCard
          title="Conversion Rate"
          value={getConversionRate()}
          icon={TrendingUp}
          change="+0.4% improvement"
          changeType="positive"
        />
        <AnalyticsCard
          title="Platform Health"
          value="98.5%"
          icon={Building}
          change="Excellent"
          changeType="positive"
        />
      </div>

      <Tabs defaultValue="overview" className="mt-10">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Business Overview</TabsTrigger>
          <TabsTrigger value="categories">Category Analytics</TabsTrigger>
          <TabsTrigger value="states">Regional Analytics</TabsTrigger>
          <TabsTrigger value="growth">Growth Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryChart
              data={analytics.categoryWiseCounts}
              title="Student Distribution by Category"
            />
            <CategoryChart
              data={analytics.stateWiseCounts}
              title="Student Distribution by State"
            />
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(analytics.categoryWiseCounts).map(([category, count]) => (
              <AnalyticsCard
                key={category}
                title={`${category} Students`}
                value={count}
                icon={BarChart3}
                description={`${((count / analytics.totalStudents) * 100).toFixed(1)}% of total students`}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="states">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(analytics.stateWiseCounts).map(([state, count]) => (
              <AnalyticsCard
                key={state}
                title={state}
                value={count}
                icon={MapPin}
                description={`${((count / analytics.totalStudents) * 100).toFixed(1)}% of total students`}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="growth">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnalyticsCard
              title="Daily Growth"
              value={analytics.growthMetrics.dailyGrowth}
              icon={TrendingUp}
              description="New registrations today"
              changeType="positive"
            />
            <AnalyticsCard
              title="Weekly Growth"
              value={analytics.growthMetrics.weeklyGrowth}
              icon={TrendingUp}
              description="New registrations this week"
              changeType="positive"
            />
            <AnalyticsCard
              title="Monthly Growth"
              value={analytics.growthMetrics.monthlyGrowth}
              icon={TrendingUp}
              description="New registrations this month"
              changeType="positive"
            />
          </div>

          <Card className="mt-6 p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Registrations</h3>
            <div className="space-y-3">
              {analytics.recentRegistrations.map((student) => (
                <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.category} • {student.state}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{student.examType}</div>
                    <div className="text-xs text-gray-500">
                      {student.registrationDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerDashboard;
