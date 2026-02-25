
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import StatCard from '@/components/dashboard/StatCard';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import { BookOpen, Calendar, Layout, FileText } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm py-4">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold">P</div>
              <span className="text-lg font-bold">PrepSmart</span>
            </div>
            <Button variant="ghost" onClick={() => window.location.href = "/"}>Logout</Button>
          </div>
        </div>
      </header>
      
      <main className="container px-4 md:px-6 py-8">
        <WelcomeBanner name="Student" />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <StatCard 
            title="Tests Taken"
            value="12"
            icon={<Layout className="h-5 w-5 text-blue-500" />}
            change="+3 this week"
            positive
          />
          <StatCard 
            title="Study Hours"
            value="48"
            icon={<BookOpen className="h-5 w-5 text-green-500" />}
            change="+5 hours"
            positive
          />
          <StatCard 
            title="Tasks Today"
            value="3/5"
            icon={<Calendar className="h-5 w-5 text-purple-500" />}
            change="2 pending"
            positive={false}
          />
          <StatCard 
            title="Materials"
            value="24"
            icon={<FileText className="h-5 w-5 text-orange-500" />}
            change="3 new"
            positive
          />
        </div>
        
        <Tabs defaultValue="overview" className="mt-10">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="upcoming-tests">Upcoming Tests</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Performance Overview</h3>
              <div className="h-[350px]">
                <PerformanceChart />
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="upcoming-tests">
            <div className="space-y-4">
              <Card className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">IBPS PO Mock Test</h4>
                  <p className="text-sm text-gray-500">Scheduled for tomorrow, 10:00 AM</p>
                </div>
                <Button>Start</Button>
              </Card>
              <Card className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">SSC CGL Practice Set</h4>
                  <p className="text-sm text-gray-500">Scheduled for Apr 30, 2:00 PM</p>
                </div>
                <Button>Start</Button>
              </Card>
              <Card className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">General Awareness Quiz</h4>
                  <p className="text-sm text-gray-500">Available anytime</p>
                </div>
                <Button>Start</Button>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h4 className="font-semibold">Quantitative Aptitude</h4>
                <p className="text-sm text-gray-500 mb-4">Focus on improving calculation speed</p>
                <Button variant="outline" className="w-full">View Resources</Button>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold">English Language</h4>
                <p className="text-sm text-gray-500 mb-4">Practice more reading comprehension</p>
                <Button variant="outline" className="w-full">View Resources</Button>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold">Reasoning</h4>
                <p className="text-sm text-gray-500 mb-4">Try logical reasoning exercises</p>
                <Button variant="outline" className="w-full">View Resources</Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
