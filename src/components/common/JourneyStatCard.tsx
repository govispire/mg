import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface JourneyStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
}

const JourneyStatCard = ({ icon: Icon, label, value, subtitle, color }: JourneyStatCardProps) => {
  return (
    <Card className="p-2.5 hover:shadow-md transition-shadow bg-white border border-gray-100">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
      </div>
      <div>
        <p className="text-[10px] text-gray-600 mb-0.5">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-[9px] text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
    </Card>
  );
};

export default JourneyStatCard;
