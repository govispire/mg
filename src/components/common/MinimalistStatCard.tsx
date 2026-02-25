
import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Clock, Trophy, Calendar } from 'lucide-react';

interface MinimalistStatCardProps {
  type: 'exams' | 'hours' | 'rank' | 'days';
  value: string;
  subtitle: string;
}

const MinimalistStatCard: React.FC<MinimalistStatCardProps> = ({ type, value, subtitle }) => {
  const cardConfig: {
    [key: string]: {
      title: string;
      icon: ReactNode;
      emoji: string;
    }
  } = {
    exams: {
      title: "Total Exams Taken",
      icon: <PieChart className="h-5 w-5" />,
      emoji: "🧪"
    },
    hours: {
      title: "Total Study Hours",
      icon: <Clock className="h-5 w-5" />,
      emoji: "⏰"
    },
    rank: {
      title: "Current Rank",
      icon: <Trophy className="h-5 w-5" />,
      emoji: "🏅"
    },
    days: {
      title: "Days Spent Studying",
      icon: <Calendar className="h-5 w-5" />,
      emoji: "📅"
    }
  };

  const config = cardConfig[type];

  return (
    <Card className="p-4 bg-slate-50/50 border-slate-200/60 hover:bg-slate-50 hover:shadow-sm transition-all duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{config.emoji}</span>
            <span className="text-sm font-medium text-slate-600">{config.title}</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="p-2 rounded-lg bg-white border border-slate-200/60">
          <div className="text-slate-600">
            {config.icon}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MinimalistStatCard;
