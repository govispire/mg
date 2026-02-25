
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Filter, Search, UserCheck, Clock, Star, MapPin, 
  Briefcase, Award, TrendingUp, Users 
} from 'lucide-react';
import { EMPLOYEE_CATEGORIES, MOCK_CATEGORIZED_EMPLOYEES } from '@/data/employeeCategoryData';
import { 
  CategorizedEmployee, 
  EmployeeCategory, 
  EmployeeSpecialization,
  EmployeeSelectionFilters,
  TaskAssignment
} from '@/types/employee';

interface EnhancedEmployeeSelectorProps {
  onEmployeeSelect?: (employee: CategorizedEmployee) => void;
  taskDetails?: TaskAssignment;
  multiSelect?: boolean;
}

const EnhancedEmployeeSelector: React.FC<EnhancedEmployeeSelectorProps> = ({
  onEmployeeSelect,
  taskDetails,
  multiSelect = false
}) => {
  const [filters, setFilters] = useState<EmployeeSelectionFilters>({
    category: 'all',
    specialization: 'all',
    minRating: 0,
    maxWorkload: 100,
    availableOnly: false,
    minExperience: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const filteredEmployees = useMemo(() => {
    return MOCK_CATEGORIZED_EMPLOYEES.filter(employee => {
      // Basic search
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = filters.category === 'all' || employee.category === filters.category;
      
      // Specialization filter
      const matchesSpecialization = filters.specialization === 'all' || 
                                   employee.specializations.includes(filters.specialization);
      
      // Rating filter
      const matchesRating = employee.performance.rating >= filters.minRating;
      
      // Workload filter
      const matchesWorkload = employee.workload <= filters.maxWorkload;
      
      // Availability filter
      const matchesAvailability = !filters.availableOnly || 
                                 employee.availability.currentCapacity < employee.availability.maxCapacity;
      
      // Experience filter
      const matchesExperience = !filters.minExperience || 
                               (employee.categorySpecific?.experience || 0) >= filters.minExperience;
      
      // Task compatibility (if task is provided)
      let matchesTask = true;
      if (taskDetails) {
        const categoryConfig = EMPLOYEE_CATEGORIES.find(cat => cat.id === employee.category);
        if (categoryConfig) {
          const hasRequiredSkills = taskDetails.requiredSkills.some(skill => 
            employee.specializations.includes(skill)
          );
          const meetsSelectionCriteria = employee.performance.rating >= (categoryConfig.selectionCriteria.performanceThreshold || 0);
          matchesTask = hasRequiredSkills && meetsSelectionCriteria;
        }
      }

      return matchesSearch && matchesCategory && matchesSpecialization && 
             matchesRating && matchesWorkload && matchesAvailability && 
             matchesExperience && matchesTask;
    });
  }, [filters, searchTerm, taskDetails]);

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
      'technical-support': 'bg-gray-100 text-gray-800',
      'regional-coordinator': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getAvailabilityColor = (employee: CategorizedEmployee) => {
    const utilization = (employee.availability.currentCapacity / employee.availability.maxCapacity) * 100;
    if (utilization < 50) return 'text-green-600';
    if (utilization < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleEmployeeSelect = (employee: CategorizedEmployee) => {
    if (multiSelect) {
      setSelectedEmployees(prev => 
        prev.includes(employee.id) 
          ? prev.filter(id => id !== employee.id)
          : [...prev, employee.id]
      );
    } else {
      onEmployeeSelect?.(employee);
    }
  };

  const getMatchScore = (employee: CategorizedEmployee) => {
    if (!taskDetails) return 0;
    
    let score = 0;
    const categoryConfig = getCategoryConfig(employee.category);
    
    // Performance score (40%)
    score += (employee.performance.rating / 5) * 40;
    
    // Skill match score (30%)
    const skillMatches = taskDetails.requiredSkills.filter(skill => 
      employee.specializations.includes(skill)
    ).length;
    score += (skillMatches / taskDetails.requiredSkills.length) * 30;
    
    // Availability score (20%)
    const availabilityScore = ((employee.availability.maxCapacity - employee.availability.currentCapacity) / employee.availability.maxCapacity) * 100;
    score += (availabilityScore / 100) * 20;
    
    // Experience bonus (10%)
    const experience = employee.categorySpecific?.experience || 0;
    const minRequired = categoryConfig?.selectionCriteria.minExperience || 0;
    if (experience >= minRequired) {
      score += Math.min((experience - minRequired) / minRequired, 1) * 10;
    }
    
    return Math.round(score);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Employee Selection</h2>
          <p className="text-gray-600">
            {taskDetails ? `Find the best employees for: ${taskDetails.title}` : 'Browse and select employees'}
          </p>
        </div>
        {taskDetails && (
          <Badge variant="outline" className="text-sm">
            {taskDetails.priority.toUpperCase()} Priority • {taskDetails.estimatedHours}h
          </Badge>
        )}
      </div>

      {/* Search and Basic Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select 
              value={filters.category} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value as EmployeeCategory | 'all' }))}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
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
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="advanced-filters">Advanced Filters</Label>
            <Switch
              id="advanced-filters"
              checked={showAdvancedFilters}
              onCheckedChange={setShowAdvancedFilters}
            />
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Minimum Rating: {filters.minRating}</Label>
                <Slider
                  value={[filters.minRating]}
                  onValueChange={([value]) => setFilters(prev => ({ ...prev, minRating: value }))}
                  max={5}
                  min={0}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Workload: {filters.maxWorkload}%</Label>
                <Slider
                  value={[filters.maxWorkload]}
                  onValueChange={([value]) => setFilters(prev => ({ ...prev, maxWorkload: value }))}
                  max={100}
                  min={0}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Experience: {filters.minExperience} years</Label>
                <Slider
                  value={[filters.minExperience]}
                  onValueChange={([value]) => setFilters(prev => ({ ...prev, minExperience: value }))}
                  max={15}
                  min={0}
                  step={1}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="available-only"
                  checked={filters.availableOnly}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, availableOnly: checked }))}
                />
                <Label htmlFor="available-only">Available only</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => {
          const categoryConfig = getCategoryConfig(employee.category);
          const matchScore = getMatchScore(employee);
          const isSelected = selectedEmployees.includes(employee.id);
          
          return (
            <Card 
              key={employee.id} 
              className={`hover:shadow-lg transition-all cursor-pointer ${
                isSelected ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleEmployeeSelect(employee)}
            >
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
                  {taskDetails && (
                    <Badge variant="secondary" className="text-xs">
                      {matchScore}% Match
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 mb-3">
                  <Badge className={getCategoryColor(employee.category)}>
                    {categoryConfig?.name}
                  </Badge>
                  
                  <div className="flex flex-wrap gap-1">
                    {employee.specializations.slice(0, 2).map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec.replace('-', ' ')}
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
                    <span className="text-gray-600">Performance</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="font-medium">{employee.performance.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Availability</span>
                    <span className={`font-medium ${getAvailabilityColor(employee)}`}>
                      {employee.availability.maxCapacity - employee.availability.currentCapacity}% Free
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-medium">{employee.categorySpecific?.experience || 0} years</span>
                  </div>

                  {employee.categorySpecific?.region && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Region</span>
                      <span className="font-medium">{employee.categorySpecific.region}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t">
                  <Progress 
                    value={employee.availability.currentCapacity} 
                    className="h-2 mb-2" 
                  />
                  <div className="text-xs text-gray-500 text-center">
                    Current Workload: {employee.availability.currentCapacity}%
                  </div>
                </div>

                {multiSelect && (
                  <div className="mt-3">
                    <Button 
                      variant={isSelected ? "default" : "outline"} 
                      size="sm" 
                      className="w-full"
                    >
                      {isSelected ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        'Select Employee'
                      )}
                    </Button>
                  </div>
                )}
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
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}

      {multiSelect && selectedEmployees.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {selectedEmployees.length} employee{selectedEmployees.length > 1 ? 's' : ''} selected
              </span>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setSelectedEmployees([])}>
                  Clear Selection
                </Button>
                <Button>
                  Assign Task
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedEmployeeSelector;
