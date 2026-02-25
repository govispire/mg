
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Users, BookOpen, Filter } from 'lucide-react';
import { mentorshipCategories } from '@/data/mentorshipData';

type FilterType = 'all' | 'regular' | 'combo';

interface MentorshipCategorySelectorProps {
  onCategoriesChange: (categories: string[]) => void;
  selectedCategories: string[];
}

const MentorshipCategorySelector: React.FC<MentorshipCategorySelectorProps> = ({
  onCategoriesChange,
  selectedCategories
}) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredCategories = mentorshipCategories.filter(category => {
    if (filter === 'combo') return category.isCombo;
    if (filter === 'regular') return !category.isCombo;
    return true;
  });

  const toggleCategory = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    console.log('Toggling category:', categoryId, 'New selection:', newCategories);
    onCategoriesChange(newCategories);
  };

  const totalStudents = filteredCategories.reduce((sum, cat) => sum + cat.studentsEnrolled, 0);
  const totalMentors = filteredCategories.reduce((sum, cat) => sum + cat.mentorsAvailable, 0);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{totalStudents.toLocaleString()}</div>
            <p className="text-gray-600">Students Enrolled</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{totalMentors}</div>
            <p className="text-gray-600">Expert Mentors</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
            <p className="text-gray-600">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="flex items-center gap-2"
        >
          <Filter size={16} />
          All Categories ({mentorshipCategories.length})
        </Button>
        <Button
          variant={filter === 'regular' ? 'default' : 'outline'}
          onClick={() => setFilter('regular')}
          className="flex items-center gap-2"
        >
          <BookOpen size={16} />
          Regular Exams ({mentorshipCategories.filter(c => !c.isCombo).length})
        </Button>
        <Button
          variant={filter === 'combo' ? 'default' : 'outline'}
          onClick={() => setFilter('combo')}
          className="flex items-center gap-2"
        >
          <Users size={16} />
          Combo Packs ({mentorshipCategories.filter(c => c.isCombo).length})
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedCategories.includes(category.id)
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : category.colorClass
            }`}
            onClick={() => toggleCategory(category.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={category.logo}
                    alt={category.name}
                    className="h-10 w-10 object-contain"
                  />
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    {category.isCombo && (
                      <Badge variant="secondary" className="mt-1">
                        Combo Pack
                      </Badge>
                    )}
                  </div>
                </div>
                {selectedCategories.includes(category.id) && (
                  <div className="bg-blue-500 text-white rounded-full p-1">
                    <Check size={16} />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                {category.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Students:</span>
                  <span className="font-medium">{category.studentsEnrolled.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mentors:</span>
                  <span className="font-medium">{category.mentorsAvailable}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MentorshipCategorySelector;
