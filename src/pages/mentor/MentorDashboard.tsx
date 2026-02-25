
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Target, TrendingUp, Clock, MessageSquare, Calendar, Award, BookOpen } from 'lucide-react';
import { useAuth } from '@/app/providers';

const MentorDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Students', value: '24', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Active Tasks', value: '18', icon: Target, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'This Week Sessions', value: '12', icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { title: 'Avg. Progress', value: '78%', icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  ];

  const recentStudents = [
    { id: 1, name: 'Rahul Sharma', progress: 85, status: 'excellent', lastActivity: '2 hours ago', exam: 'IBPS PO' },
    { id: 2, name: 'Priya Patel', progress: 72, status: 'good', lastActivity: '4 hours ago', exam: 'SSC CGL' },
    { id: 3, name: 'Amit Kumar', progress: 65, status: 'needs attention', lastActivity: '1 day ago', exam: 'UPSC' },
    { id: 4, name: 'Sneha Gupta', progress: 90, status: 'excellent', lastActivity: '30 min ago', exam: 'CAT' },
  ];

  const upcomingSessions = [
    { id: 1, student: 'Rahul Sharma', time: '10:00 AM', subject: 'Quantitative Aptitude', type: 'doubt-clearing' },
    { id: 2, student: 'Priya Patel', time: '2:00 PM', subject: 'English', type: 'mock-discussion' },
    { id: 3, student: 'Amit Kumar', time: '4:00 PM', subject: 'General Knowledge', type: 'study-plan' },
  ];

  const pendingTasks = [
    { id: 1, title: 'Review Mock Test Results', student: 'Rahul Sharma', priority: 'high', dueDate: 'Today' },
    { id: 2, title: 'Create Study Plan', student: 'Sneha Gupta', priority: 'medium', dueDate: 'Tomorrow' },
    { id: 3, title: 'Schedule Doubt Session', student: 'Amit Kumar', priority: 'high', dueDate: 'Today' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs attention': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="w-full px-4 lg:px-6 py-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">Here's what's happening with your students today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Student Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Student Activity</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {recentStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{student.name}</h4>
                    <Badge className={`text-xs ${getStatusColor(student.status)}`}>
                      {student.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium">{student.progress}%</span>
                  </div>
                  <Progress value={student.progress} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{student.exam}</span>
                    <span>{student.lastActivity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Today's Sessions</h3>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{session.student}</h4>
                    <p className="text-xs text-gray-600">{session.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{session.time}</p>
                  <Badge variant="outline" className="text-xs">
                    {session.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending Tasks */}
        <Card className="p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pending Tasks</h3>
            <Button variant="outline" size="sm">
              <Target className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <p className="text-xs text-gray-600">{task.student}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`text-xs mb-1 ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </Badge>
                  <p className="text-xs text-gray-500">{task.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Target className="h-4 w-4 mr-2" />
              Assign Task
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MentorDashboard;
