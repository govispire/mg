
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Users, BookOpen, Filter, X } from 'lucide-react';
import { mentorshipCategories } from '@/data/mentorshipData';

type FilterType = 'all' | 'regular' | 'combo';

interface MentorshipCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onSave: (categories: string[]) => void;
}

const MentorshipCategoryModal: React.FC<MentorshipCategoryModalProps> = ({
  isOpen,
  onClose,
  selectedCategories: initialSelectedCategories,
  onSave
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Initialize selected categories when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, setting initial categories:', initialSelectedCategories);
      setSelectedCategories([...initialSelectedCategories]);
    }
  }, [isOpen, initialSelectedCategories]);

  const filteredCategories = mentorshipCategories.filter(category => {
    if (filter === 'combo') return category.isCombo;
    if (filter === 'regular') return !category.isCombo;
    return true;
  });

  const toggleCategory = (categoryId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Toggling category:', categoryId);
    setSelectedCategories(prev => {
      const newCategories = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      console.log('Updated categories:', newCategories);
      return newCategories;
    });
  };

  const handleSave = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Saving categories:', selectedCategories);
    if (selectedCategories.length === 0) {
      console.log('No categories selected');
      return;
    }
    onSave(selectedCategories);
    onClose();
  };

  const handleClose = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('Closing modal');
    onClose();
  };

  const totalStudents = filteredCategories.reduce((sum, cat) => sum + cat.studentsEnrolled, 0);
  const totalMentors = filteredCategories.reduce((sum, cat) => sum + cat.mentorsAvailable, 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Choose Your Mentorship Categories
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-gray-600 mt-2">
            Select the exam categories you want mentorship for. Our expert mentors will guide you through your preparation journey.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">{totalStudents.toLocaleString()}</div>
                <p className="text-gray-600 text-sm">Students Enrolled</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600 mb-1">{totalMentors}</div>
                <p className="text-gray-600 text-sm">Expert Mentors</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-purple-600 mb-1">98%</div>
                <p className="text-gray-600 text-sm">Success Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="flex items-center gap-2"
              size="sm"
            >
              <Filter size={14} />
              All Categories ({mentorshipCategories.length})
            </Button>
            <Button
              variant={filter === 'regular' ? 'default' : 'outline'}
              onClick={() => setFilter('regular')}
              className="flex items-center gap-2"
              size="sm"
            >
              <BookOpen size={14} />
              Regular Exams ({mentorshipCategories.filter(c => !c.isCombo).length})
            </Button>
            <Button
              variant={filter === 'combo' ? 'default' : 'outline'}
              onClick={() => setFilter('combo')}
              className="flex items-center gap-2"
              size="sm"
            >
              <Users size={14} />
              Combo Packs ({mentorshipCategories.filter(c => c.isCombo).length})
            </Button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg select-none ${
                    isSelected
                      ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-500 shadow-md'
                      : 'hover:shadow-md border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={(e) => toggleCategory(category.id, e)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={category.logo}
                          alt={category.name}
                          className="h-8 w-8 object-contain"
                        />
                        <div>
                          <CardTitle className="text-sm font-semibold">{category.name}</CardTitle>
                          {category.isCombo && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Combo Pack
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="bg-blue-500 text-white rounded-full p-1 animate-in fade-in duration-200">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-xs mb-3">
                      {category.description}
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Students:</span>
                        <span className="font-medium">{category.studentsEnrolled.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Mentors:</span>
                        <span className="font-medium">{category.mentorsAvailable}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={selectedCategories.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Selection ({selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MentorshipCategoryModal;
