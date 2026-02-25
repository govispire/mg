
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, ExternalLink } from 'lucide-react';

interface CourseHeaderProps {
  title: string;
  description: string;
  isPopular?: boolean;
  showButtons?: boolean;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  title,
  description,
  isPopular = false,
  showButtons = true
}) => {
  return (
    <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-700 p-4 md:p-6 mb-4 shadow-lg">
      <div className="flex flex-col space-y-4">
        {isPopular && (
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 w-fit">
            Popular Category
          </Badge>
        )}
        
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-white/90 text-sm max-w-xl opacity-90">
            {description}
          </p>
        </div>
        
        {showButtons && (
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button className="bg-white text-blue-600 hover:bg-white/90">
              <ExternalLink className="h-4 w-4 mr-2" />
              Explore
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
