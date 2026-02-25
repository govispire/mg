
import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Clock, Trophy, Calendar } from 'lucide-react';

interface PastelStatCardProps {
  type: 'exams' | 'hours' | 'rank' | 'days';
  value: string;
  subtitle: string;
}

const PastelStatCard: React.FC<PastelStatCardProps> = ({ type, value, subtitle }) => {
  // Card configuration based on type
  const cardConfig: {
    [key: string]: {
      title: string;
      icon: ReactNode;
      bgColor: string;
      iconColor: string;
      emoji: string;
    }
  } = {
    exams: {
      title: "Total Exams Taken",
      icon: <PieChart className="h-5 w-5" />,
      bgColor: "bg-[#F2FCE2]", // Soft Green
      iconColor: "text-green-500",
      emoji: "🧪"
    },
    hours: {
      title: "Total Study Hours",
      icon: <Clock className="h-5 w-5" />,
      bgColor: "bg-[#FEF7CD]", // Soft Yellow
      iconColor: "text-amber-500",
      emoji: "⏰"
    },
    rank: {
      title: "Current Rank",
      icon: <Trophy className="h-5 w-5" />,
      bgColor: "bg-[#E5DEFF]", // Soft Purple
      iconColor: "text-purple-500",
      emoji: "🏅"
    },
    days: {
      title: "Days Spent Studying",
      icon: <Calendar className="h-5 w-5" />,
      bgColor: "bg-[#D3E4FD]", // Soft Blue
      iconColor: "text-blue-500",
      emoji: "📅"
    }
  };

  const config = cardConfig[type];

  return (
    <Card className={`p-4 border-none shadow-sm ${config.bgColor} hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{config.emoji}</span>
            <span className="text-sm font-medium text-gray-700">{config.title}</span>
          </div>
          <p className="text-2xl font-bold mt-2">{value}</p>
          <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-full ${config.bgColor} border ${config.iconColor} border-opacity-20`}>
          <div className={`${config.iconColor}`}>
            {config.icon}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PastelStatCard;
