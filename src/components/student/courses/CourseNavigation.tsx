import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { StepBreadcrumb, StepBreadcrumbItem } from '@/components/ui/step-breadcrumb';
import { Button } from '@/components/ui/button';

interface CourseNavigationProps {
  items: Array<{
    label: string;
    href?: string;
    isActive?: boolean;
  }>;
  showBackButton?: boolean;
  backHref?: string;
}

export const CourseNavigation: React.FC<CourseNavigationProps> = ({
  items,
  showBackButton = false,
  backHref,
}) => {
  const breadcrumbItems: StepBreadcrumbItem[] = [
    { label: 'Home', icon: <Home className="h-4 w-4" />, href: '/student/dashboard' },
    ...items.map((item) => ({
      label: item.label,
      href: item.href,
      isActive: item.isActive,
    })),
  ];

  return (
    <div className="flex items-center gap-4 mb-4 flex-wrap">
      {showBackButton && backHref && (
        <Link to={backHref}>
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
      )}
      <StepBreadcrumb items={breadcrumbItems} />
    </div>
  );
};
