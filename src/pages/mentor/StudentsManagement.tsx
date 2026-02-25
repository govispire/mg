
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, MessageSquare, Target, TrendingUp, Phone, Mail, Calendar } from 'lucide-react';

const StudentsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const students = [
    {
      id: 1,
      name: 'Rahul Sharma',
      email: 'rahul.sharma@email.com',
      phone: '+91 98765 43210',
      exam: 'IBPS PO',
      progress: 85,
      status: 'excellent',
      lastActive: '2 hours ago',
      tasksCompleted: 12,
      totalTasks: 15,
      nextSession: '2024-01-15 10:00 AM',
      joinedDate: '2023-09-15',
      avatar: 'RS'
    },
    {
      id: 2,
      name: 'Priya Patel',
      email: 'priya.patel@email.com',
      phone: '+91 98765 43211',
      exam: 'SSC CGL',
      progress: 72,
      status: 'good',
      lastActive: '4 hours ago',
      tasksCompleted: 8,
      totalTasks: 12,
      nextSession: '2024-01-15 2:00 PM',
      joinedDate: '2023-10-01',
      avatar: 'PP'
    },
    {
      id: 3,
      name: 'Amit Kumar',
      email: 'amit.kumar@email.com',
      phone: '+91 98765 43212',
      exam: 'UPSC',
      progress: 65,
      status: 'needs attention',
      lastActive: '1 day ago',
      tasksCompleted: 5,
      totalTasks: 10,
      nextSession: '2024-01-16 4:00 PM',
      joinedDate: '2023-08-20',
      avatar: 'AK'
    },
    {
      id: 4,
      name: 'Sneha Gupta',
      email: 'sneha.gupta@email.com',
      phone: '+91 98765 43213',
      exam: 'CAT',
      progress: 90,
      status: 'excellent',
      lastActive: '30 min ago',
      tasksCompleted: 18,
      totalTasks: 20,
      nextSession: '2024-01-15 11:00 AM',
      joinedDate: '2023-11-10',
      avatar: 'SG'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs attention': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.exam.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || student.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full px-4 lg:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-600">Manage and track your students' progress</p>
        </div>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          Assign Task to All
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search students by name or exam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
            >
              All ({students.length})
            </Button>
            <Button
              variant={selectedFilter === 'excellent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('excellent')}
            >
              Excellent
            </Button>
            <Button
              variant={selectedFilter === 'good' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('good')}
            >
              Good
            </Button>
            <Button
              variant={selectedFilter === 'needs attention' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('needs attention')}
            >
              Needs Attention
            </Button>
          </div>
        </div>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                    {student.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.exam}</p>
                </div>
              </div>
              <Badge className={`${getStatusColor(student.status)}`}>
                {student.status}
              </Badge>
            </div>

            <div className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="font-medium">{student.progress}%</span>
                </div>
                <Progress value={student.progress} className="h-2" />
              </div>

              {/* Tasks */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasks Completed</span>
                <span className="text-sm font-medium">
                  {student.tasksCompleted}/{student.totalTasks}
                </span>
              </div>

              {/* Contact Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  {student.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {student.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Next: {student.nextSession}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Message
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Target className="h-3 w-3 mr-1" />
                  Assign Task
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Progress
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No students found matching your search criteria.</p>
        </Card>
      )}
    </div>
  );
};

export default StudentsManagement;
