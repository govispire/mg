
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/app/providers';
import EnhancedWelcomeBanner from '@/components/dashboard/EnhancedWelcomeBanner';
import StatCard from '@/components/dashboard/StatCard';
import SystemHealthChart from '@/components/dashboard/SystemHealthChart';
import UserActivityChart from '@/components/dashboard/UserActivityChart';
import UserManagementTable from '@/components/dashboard/UserManagementTable';
import PlatformAnalyticsChart from '@/components/dashboard/PlatformAnalyticsChart';
import { Users, CreditCard, BarChart2, Shield, Settings, Database, TrendingUp, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="w-full px-4 lg:px-6 py-6">
      <EnhancedWelcomeBanner name={user?.name || 'Super Admin'} role="super-admin" />
      
      <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium">System Administration</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor platform health, manage users, and oversee system operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Generate Report</Button>
          <Button variant="outline">System Backup</Button>
          <Button>Platform Settings</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
        <StatCard 
          title="Total Users"
          value="12,845"
          icon={<Users className="h-5 w-5 text-blue-500" />}
          change="+156 this month"
          positive
        />
        <StatCard 
          title="System Health"
          value="99.9%"
          icon={<Shield className="h-5 w-5 text-green-500" />}
          change="Excellent"
          positive
        />
        <StatCard 
          title="Revenue"
          value="₹2.8L"
          icon={<CreditCard className="h-5 w-5 text-purple-500" />}
          change="+8% vs last month"
          positive
        />
        <StatCard 
          title="Active Sessions"
          value="1,245"
          icon={<BarChart2 className="h-5 w-5 text-orange-500" />}
          change="+24 today"
          positive
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <StatCard 
          title="Daily Tests"
          value="2,456"
          icon={<Activity className="h-5 w-5 text-indigo-500" />}
          change="+12% today"
          positive
        />
        <StatCard 
          title="System Alerts"
          value="3"
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          change="2 resolved"
          positive
        />
        <StatCard 
          title="Database Size"
          value="142 GB"
          icon={<Database className="h-5 w-5 text-cyan-500" />}
          change="+2.1 GB this week"
          positive={false}
        />
      </div>
      
      <Tabs defaultValue="overview" className="mt-10">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                System Health Monitoring
              </h3>
              <SystemHealthChart />
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                User Activity Trends
              </h3>
              <UserActivityChart />
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Card className="p-6">
              <h4 className="font-semibold text-green-700 mb-2">System Status</h4>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">All services operational</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Last check: 2 minutes ago</p>
            </Card>
            
            <Card className="p-6">
              <h4 className="font-semibold text-blue-700 mb-2">Performance</h4>
              <div className="text-2xl font-bold text-blue-600">42ms</div>
              <p className="text-xs text-gray-500">Average response time</p>
            </Card>
            
            <Card className="p-6">
              <h4 className="font-semibold text-purple-700 mb-2">Storage</h4>
              <div className="text-2xl font-bold text-purple-600">78%</div>
              <p className="text-xs text-gray-500">Disk usage</p>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <Card className="p-6">
            <UserManagementTable />
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Platform Analytics & Insights</h3>
            <PlatformAnalyticsChart />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">89%</div>
                <div className="text-sm text-gray-600">User Retention</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">4.8</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">156</div>
                <div className="text-sm text-gray-600">Daily Signups</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">92%</div>
                <div className="text-sm text-gray-600">Test Completion</div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Configuration
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Maintenance Mode</span>
                  <Button variant="outline" size="sm">Disabled</Button>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>User Registration</span>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Email Notifications</span>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>System Backups</span>
                  <Button variant="outline" size="sm">Daily</Button>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Management
              </h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Run Database Optimization
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Export User Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Clear System Logs
                </Button>
                <Button variant="destructive" className="w-full justify-start">
                  Reset Test Database
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminDashboard;
