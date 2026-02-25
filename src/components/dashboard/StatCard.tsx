
import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  change: string;
  positive: boolean;
}

const StatCard = ({ title, value, icon, change, positive }: StatCardProps) => {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <span className="bg-gray-100 p-2 rounded-full">{icon}</span>
      </div>
      
      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold">{value}</h3>
        <div className={`flex items-center text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {positive ? (
            <ArrowUpRight className="h-3 w-3 mr-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 mr-1" />
          )}
          <span>{change}</span>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
