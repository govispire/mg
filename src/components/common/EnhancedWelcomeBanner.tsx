
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin } from 'lucide-react';
import { useAuth } from '@/app/providers';
import { examCategories } from '@/data/examData';
import { indiaStates } from '@/data/indiaStates';

interface EnhancedWelcomeBannerProps {
  name: string;
  role?: string;
}

const EnhancedWelcomeBanner = ({ name, role }: EnhancedWelcomeBannerProps) => {
  const { user } = useAuth();
  
  // Only render for student role
  if (role !== 'student') {
    return null;
  }
  
  const getExamCategoryName = (categoryId: string) => {
    const category = examCategories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  const getStateName = (stateId: string) => {
    const state = indiaStates.find(s => s.id === stateId);
    return state?.name || stateId;
  };

  return (
    <div className="bg-gradient-to-br from-brand-light to-white rounded-xl shadow-sm p-6 md:p-8 border border-primary/10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome, {name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Track your preparation progress and upcoming exams.
          </p>
          
          {user && (
            <div className="mt-4 flex flex-wrap gap-2">
              {user.examCategory && (
                <div className="bg-primary/10 text-primary text-sm py-1 px-3 rounded-full border border-primary/20">
                  <span className="font-medium">{getExamCategoryName(user.examCategory)}</span>
                </div>
              )}
              
              {user.state && (
                <div className="bg-orange-50 text-orange-700 text-sm py-1 px-3 rounded-full flex items-center border border-orange-200">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="font-medium">{getStateName(user.state)}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <Button variant="outline" size="sm" className="flex items-center gap-1 border-primary/30 hover:bg-primary/5">
          <PlusCircle className="h-4 w-4" />
          <span>Add Exam</span>
        </Button>
      </div>
    </div>
  );
};

export default EnhancedWelcomeBanner;
