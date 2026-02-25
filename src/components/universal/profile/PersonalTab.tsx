
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book } from 'lucide-react';

interface PersonalTabProps {
  user: any;
  onChangeExamCategory: () => void;
}

const PersonalTab: React.FC<PersonalTabProps> = ({ user, onChangeExamCategory }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-gray-500">Email</p>
          <p className="text-sm font-medium truncate">{user?.email || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Role</p>
          <p className="text-sm font-medium capitalize">{user?.role?.replace('-', ' ') || 'N/A'}</p>
        </div>
      </div>
      
      {user?.examCategory && (
        <div>
          <p className="text-xs text-gray-500">Category</p>
          <div className="flex items-center justify-between mt-1">
            <Badge variant="secondary" className="text-xs">
              {user.examCategory.toUpperCase()}
            </Badge>
            {user.role === 'student' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onChangeExamCategory}
                className="text-xs h-7"
              >
                <Book className="h-3 w-3 mr-1" />
                Change
              </Button>
            )}
          </div>
        </div>
      )}
      
      {user?.state && (
        <div>
          <p className="text-xs text-gray-500">State</p>
          <p className="text-sm font-medium capitalize">{user.state.replace('-', ' ')}</p>
        </div>
      )}
    </div>
  );
};

export default PersonalTab;
