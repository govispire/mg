
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Users, UserPlus, Filter, Search, Star, TrendingUp, 
  CheckCircle, Clock, AlertTriangle, Award 
} from 'lucide-react';
import { EMPLOYEE_CATEGORIES, MOCK_CATEGORIZED_EMPLOYEES } from '@/data/employeeCategoryData';
import { CategorizedEmployee, EmployeeCategory } from '@/types/employee';

const CategoryEmployeeManager = () => {
  const [selectedCategory, setSelectedCategory] = useState<EmployeeCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [employees] = useState(MOCK_CATEGORIZED_EMPLOYEES);

  const filteredEmployees = employees.filter(employee => {
    const matchesCategory = selectedCategory === 'all' || employee.category === selectedCategory;
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryConfig = (category: EmployeeCategory) => {
    return EMPLOYEE_CATEGORIES.find(cat => cat.id === category);
  };

  const getCategoryColor = (category: EmployeeCategory) => {
    const colors = {
      'subject-matter-expert': 'bg-purple-100 text-purple-800',
      'content-creator': 'bg-blue-100 text-blue-800',
      'test-developer': 'bg-green-100 text-green-800',
      'quality-reviewer': 'bg-orange-100 text-orange-800',
      'content-moderator': 'bg-yellow-100 text-yellow-800',
      'technical-support': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const categoryStats = EMPLOYEE_CATEGORIES.map(category => {
    const categoryEmployees = employees.filter(emp => emp.category === category.id);
    return {
      ...category,
      count: categoryEmployees.length,
      activeCount: categoryEmployees.filter(emp => emp.status === 'active').length,
      avgPerformance: categoryEmployees.reduce((sum, emp) => sum + emp.performance.rating, 0) / categoryEmployees.length || 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryStats.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge className={getCategoryColor(category.id)}>
                  {category.name}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-gray-600">
                    {category.avgPerformance.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">{category.count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active</span>
                  <span className="font-medium text-green-600">{category.activeCount}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {category.description}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as EmployeeCategory | 'all')}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EMPLOYEE_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>

          {/* Employee Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((employee) => {
              const categoryConfig = getCategoryConfig(employee.category);
              return (
                <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{employee.name}</h4>
                          <p className="text-xs text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={employee.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {employee.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <Badge className={getCategoryColor(employee.category)}>
                        {categoryConfig?.name}
                      </Badge>
                      
                      <div className="flex flex-wrap gap-1">
                        {employee.specializations.slice(0, 2).map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {employee.specializations.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{employee.specializations.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Workload</span>
                        <span className="font-medium">{employee.workload}%</span>
                      </div>
                      <Progress value={employee.workload} className="h-2" />
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Performance</span>
                        <div className="flex items-center space-x-1">
                          <Star className={`h-3 w-3 ${getPerformanceColor(employee.performance.rating)}`} />
                          <span className={`font-medium ${getPerformanceColor(employee.performance.rating)}`}>
                            {employee.performance.rating}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Tasks: {employee.performance.completedTasks}</span>
                        <span>Accuracy: {employee.performance.accuracy}%</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="ghost" size="sm">
                          Assign Task
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryEmployeeManager;
