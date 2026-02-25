import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, TrendingUp, Award, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: number;
  type: 'score' | 'streak' | 'achievement' | 'signup';
  name: string;
  location: string;
  message: string;
  time: string;
}

const notifications: Notification[] = [
  { id: 1, type: 'score', name: 'Rahul', location: 'Delhi', message: 'scored 85% in IBPS PO mock', time: '2 mins ago' },
  { id: 2, type: 'achievement', name: 'Priya', location: 'Mumbai', message: 'cleared SBI Clerk exam', time: '5 mins ago' },
  { id: 3, type: 'streak', name: 'Amit', location: 'Bangalore', message: 'completed 30-day streak', time: '8 mins ago' },
  { id: 4, type: 'score', name: 'Sneha', location: 'Chennai', message: 'scored 92% in SSC CGL mock', time: '12 mins ago' },
  { id: 5, type: 'signup', name: 'Vikram', location: 'Hyderabad', message: 'just joined PrepSmart', time: '15 mins ago' },
  { id: 6, type: 'achievement', name: 'Anita', location: 'Pune', message: 'qualified for RRB NTPC interview', time: '18 mins ago' },
  { id: 7, type: 'score', name: 'Rajesh', location: 'Kolkata', message: 'scored 88% in RBI Grade B mock', time: '22 mins ago' },
  { id: 8, type: 'streak', name: 'Meera', location: 'Jaipur', message: 'achieved 50-day streak badge', time: '25 mins ago' },
];

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'score': return TrendingUp;
    case 'streak': return Flame;
    case 'achievement': return Award;
    case 'signup': return CheckCircle;
  }
};

const getColor = (type: Notification['type']) => {
  switch (type) {
    case 'score': return 'text-blue-500 bg-blue-100';
    case 'streak': return 'text-orange-500 bg-orange-100';
    case 'achievement': return 'text-green-500 bg-green-100';
    case 'signup': return 'text-purple-500 bg-purple-100';
  }
};

const SocialProofTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % notifications.length);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const notification = notifications[currentIndex];
  const Icon = getIcon(notification.type);
  const colorClass = getColor(notification.type);

  return (
    <div className="fixed bottom-4 left-4 z-50 hidden md:block">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-xl border p-4 max-w-xs"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${colorClass.split(' ')[1]}`}>
                <Icon className={`h-4 w-4 ${colorClass.split(' ')[0]}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{notification.name}</span>
                  {' from '}
                  <span className="text-muted-foreground">{notification.location}</span>
                  {' '}
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-green-600 font-medium">Live</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialProofTicker;
