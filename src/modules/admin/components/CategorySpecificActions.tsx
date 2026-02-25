
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, FileText, Upload, Bell, BarChart3, Settings } from 'lucide-react';

interface CategorySpecificActionsProps {
  category?: string;
  displayName: string;
}

const CategorySpecificActions: React.FC<CategorySpecificActionsProps> = ({ 
  category, 
  displayName 
}) => {
  const iconMap = {
    'Users': Users,
    'FileText': FileText,
    'Upload': Upload,
    'Bell': Bell,
    'BarChart3': BarChart3,
    'Settings': Settings
  };

  const getCategoryActions = () => {
    if (!category) {
      return [
        { icon: 'Users', label: 'Manage All Users', color: 'bg-blue-500' },
        { icon: 'FileText', label: 'Global Test Management', color: 'bg-green-500' },
        { icon: 'Upload', label: 'Content Library', color: 'bg-purple-500' },
        { icon: 'BarChart3', label: 'Platform Analytics', color: 'bg-orange-500' }
      ];
    }

    const categoryActions: Record<string, any[]> = {
      'banking': [
        { icon: 'Users', label: 'Banking Students', color: 'bg-blue-600' },
        { icon: 'FileText', label: 'Banking Tests', color: 'bg-green-600' },
        { icon: 'Upload', label: 'Banking Content', color: 'bg-purple-600' },
        { icon: 'BarChart3', label: 'Banking Analytics', color: 'bg-orange-600' }
      ],
      'ssc': [
        { icon: 'Users', label: 'SSC Students', color: 'bg-red-600' },
        { icon: 'FileText', label: 'SSC Tests', color: 'bg-indigo-600' },
        { icon: 'Upload', label: 'SSC Content', color: 'bg-pink-600' },
        { icon: 'BarChart3', label: 'SSC Analytics', color: 'bg-teal-600' }
      ],
      'railway': [
        { icon: 'Users', label: 'Railway Students', color: 'bg-gray-600' },
        { icon: 'FileText', label: 'Railway Tests', color: 'bg-yellow-600' },
        { icon: 'Upload', label: 'Railway Content', color: 'bg-cyan-600' },
        { icon: 'BarChart3', label: 'Railway Analytics', color: 'bg-lime-600' }
      ]
    };

    return categoryActions[category] || [
      { icon: 'Users', label: `${displayName} Students`, color: 'bg-blue-600' },
      { icon: 'FileText', label: `${displayName} Tests`, color: 'bg-green-600' },
      { icon: 'Upload', label: `${displayName} Content`, color: 'bg-purple-600' },
      { icon: 'BarChart3', label: `${displayName} Analytics`, color: 'bg-orange-600' }
    ];
  };

  const actions = getCategoryActions();

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">
        {category ? `${displayName} Quick Actions` : 'Global Quick Actions'}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const IconComponent = iconMap[action.icon as keyof typeof iconMap];
          return (
            <Button 
              key={index}
              variant="outline" 
              className="h-20 flex-col gap-2 hover:bg-gray-50"
            >
              <div className={`p-2 rounded-full ${action.color} text-white`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default CategorySpecificActions;
