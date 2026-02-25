
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, Users, Target, Plus, Send } from 'lucide-react';

const TaskAssignment = () => {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    dueDate: '',
    estimatedTime: '',
  });

  const students = [
    { id: 1, name: 'Rahul Sharma', exam: 'IBPS PO', avatar: 'RS' },
    { id: 2, name: 'Priya Patel', exam: 'SSC CGL', avatar: 'PP' },
    { id: 3, name: 'Amit Kumar', exam: 'UPSC', avatar: 'AK' },
    { id: 4, name: 'Sneha Gupta', exam: 'CAT', avatar: 'SG' },
  ];

  const taskCategories = [
    'Mock Test',
    'Study Material',
    'Practice Problems',
    'Reading Assignment',
    'Video Lecture',
    'Doubt Clearing',
    'Revision',
    'Current Affairs'
  ];

  const recentTasks = [
    {
      id: 1,
      title: 'Complete Quantitative Aptitude Mock Test',
      students: ['Rahul Sharma', 'Priya Patel'],
      category: 'Mock Test',
      priority: 'high',
      dueDate: '2024-01-15',
      status: 'active'
    },
    {
      id: 2,
      title: 'Read Current Affairs - January Week 1',
      students: ['All Students'],
      category: 'Reading Assignment',
      priority: 'medium',
      dueDate: '2024-01-12',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Solve English Comprehension Practice Set',
      students: ['Amit Kumar'],
      category: 'Practice Problems',
      priority: 'low',
      dueDate: '2024-01-18',
      status: 'active'
    },
  ];

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleFormChange = (field: string, value: string) => {
    setTaskForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log('Task Assignment:', {
      ...taskForm,
      selectedStudents: selectedStudents.map(id => students.find(s => s.id === id)?.name)
    });
    // Reset form
    setTaskForm({
      title: '',
      description: '',
      category: '',
      priority: '',
      dueDate: '',
      estimatedTime: '',
    });
    setSelectedStudents([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="w-full px-4 lg:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assign Tasks</h1>
        <p className="text-gray-600">Create and assign tasks to your students</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Task Creation Form */}
        <Card className="p-6 xl:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Target className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Create New Task</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Task Title</label>
              <Input
                placeholder="Enter task title..."
                value={taskForm.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Describe the task in detail..."
                rows={3}
                value={taskForm.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={taskForm.category} onValueChange={(value) => handleFormChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <Select value={taskForm.priority} onValueChange={(value) => handleFormChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <Input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => handleFormChange('dueDate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estimated Time (hours)</label>
                <Input
                  type="number"
                  placeholder="2"
                  value={taskForm.estimatedTime}
                  onChange={(e) => handleFormChange('estimatedTime', e.target.value)}
                />
              </div>
            </div>

            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Assign to Students</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedStudents.includes(student.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleStudentSelection(student.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {student.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-gray-600">{student.exam}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedStudents.length} student(s) selected
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={!taskForm.title || selectedStudents.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Assign Task
            </Button>
          </div>
        </Card>

        {/* Recent Tasks */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Tasks</h3>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>

          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {task.students.join(', ')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {task.dueDate}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                    {task.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-xs">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TaskAssignment;
