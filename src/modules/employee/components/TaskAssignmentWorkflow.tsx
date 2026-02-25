
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarIcon, Clock, AlertTriangle, CheckCircle, 
  Users, FileText, Target, Zap 
} from 'lucide-react';
import { format } from 'date-fns';
import { EMPLOYEE_CATEGORIES } from '@/data/employeeCategoryData';
import { TaskAssignment, EmployeeSpecialization } from '@/types/employee';
import EnhancedEmployeeSelector from './EnhancedEmployeeSelector';

const TaskAssignmentWorkflow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [taskDetails, setTaskDetails] = useState<Partial<TaskAssignment>>({
    type: 'content-creation',
    priority: 'medium',
    estimatedHours: 8,
    requiredSkills: [],
    status: 'pending'
  });
  const [deadline, setDeadline] = useState<Date>();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const taskTypes = [
    { value: 'content-creation', label: 'Content Creation', icon: FileText },
    { value: 'review', label: 'Content Review', icon: CheckCircle },
    { value: 'test-development', label: 'Test Development', icon: Target },
    { value: 'moderation', label: 'Content Moderation', icon: AlertTriangle },
    { value: 'coordination', label: 'Team Coordination', icon: Users }
  ];

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  const allSpecializations: EmployeeSpecialization[] = [
    'mathematics', 'english', 'reasoning', 'general-knowledge', 'current-affairs',
    'banking', 'ssc', 'railway', 'state-psc', 'upsc', 'technical',
    'regional-management', 'quality-assurance', 'system-administration'
  ];

  const steps = [
    { id: 1, title: 'Task Details', description: 'Define task requirements' },
    { id: 2, title: 'Select Employees', description: 'Choose suitable employees' },
    { id: 3, title: 'Review & Assign', description: 'Confirm assignment' }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= step.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > step.id ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                step.id
              )}
            </div>
            <div className="text-center mt-2">
              <div className="text-sm font-medium">{step.title}</div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 ${
              currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderTaskDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle>Task Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={taskDetails.title || ''}
              onChange={(e) => setTaskDetails(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Task Type</Label>
            <Select
              value={taskDetails.type}
              onValueChange={(value) => setTaskDetails(prev => ({ ...prev, type: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={taskDetails.priority}
              onValueChange={(value) => setTaskDetails(prev => ({ ...prev, priority: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Estimated Hours</Label>
            <Input
              id="hours"
              type="number"
              min="1"
              max="40"
              value={taskDetails.estimatedHours || ''}
              onChange={(e) => setTaskDetails(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) }))}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Pick a deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={(date) => {
                    setDeadline(date);
                    if (date) {
                      setTaskDetails(prev => ({ ...prev, deadline: date.toISOString() }));
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Required Skills</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {allSpecializations.map((skill) => (
              <div key={skill} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={skill}
                  checked={taskDetails.requiredSkills?.includes(skill) || false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTaskDetails(prev => ({
                        ...prev,
                        requiredSkills: [...(prev.requiredSkills || []), skill]
                      }));
                    } else {
                      setTaskDetails(prev => ({
                        ...prev,
                        requiredSkills: prev.requiredSkills?.filter(s => s !== skill) || []
                      }));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={skill} className="text-sm">
                  {skill.replace('-', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={() => setCurrentStep(2)}
            disabled={!taskDetails.title || !taskDetails.type || !deadline}
          >
            Next: Select Employees
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmployeeSelection = () => (
    <div className="space-y-6">
      <EnhancedEmployeeSelector
        taskDetails={taskDetails as TaskAssignment}
        multiSelect={true}
        onEmployeeSelect={(employee) => {
          setSelectedEmployees(prev => 
            prev.includes(employee.id)
              ? prev.filter(id => id !== employee.id)
              : [...prev, employee.id]
          );
        }}
      />
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          Back
        </Button>
        <Button 
          onClick={() => setCurrentStep(3)}
          disabled={selectedEmployees.length === 0}
        >
          Review Assignment
        </Button>
      </div>
    </div>
  );

  const renderReviewAssignment = () => (
    <Card>
      <CardHeader>
        <CardTitle>Review & Confirm Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Task Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span className="font-medium">{taskDetails.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{taskDetails.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Priority:</span>
                <Badge className={priorityColors[taskDetails.priority as keyof typeof priorityColors]}>
                  {taskDetails.priority?.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Hours:</span>
                <span className="font-medium">{taskDetails.estimatedHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deadline:</span>
                <span className="font-medium">
                  {deadline ? format(deadline, "PPP") : 'Not set'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Selected Employees</h3>
            <div className="text-sm text-gray-600">
              {selectedEmployees.length} employee{selectedEmployees.length > 1 ? 's' : ''} selected
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Required Skills:</h4>
          <div className="flex flex-wrap gap-2">
            {taskDetails.requiredSkills?.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill.replace('-', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(2)}>
            Back
          </Button>
          <Button onClick={() => {
            // Handle task assignment logic here
            console.log('Assigning task:', taskDetails);
            console.log('To employees:', selectedEmployees);
          }}>
            <Zap className="h-4 w-4 mr-2" />
            Assign Task
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Assignment Workflow</h1>
        <p className="text-gray-600">Efficiently assign tasks to the most suitable employees</p>
      </div>

      {renderStepIndicator()}

      {currentStep === 1 && renderTaskDetails()}
      {currentStep === 2 && renderEmployeeSelection()}
      {currentStep === 3 && renderReviewAssignment()}
    </div>
  );
};

export default TaskAssignmentWorkflow;
