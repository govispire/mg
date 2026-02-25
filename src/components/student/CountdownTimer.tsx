
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  RefreshCcw,
  Timer,
  X,
  Expand
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownTimerProps {
  className?: string;
}

// Bilingual motivational quotes - English and Tamil
const motivationalQuotes = [
  { 
    english: "Stay focused and never give up.",
    tamil: "கவனம் செலுத்துங்கள், ஒருபோதும் விட்டுவிடாதீர்கள்."
  },
  { 
    english: "Discipline is the bridge between goals and accomplishment.",
    tamil: "இலக்குகளுக்கும் சாதனைகளுக்கும் இடையே உள்ள பாலம் கட்டுப்பாடு."
  },
  { 
    english: "Your only limit is your mind.",
    tamil: "உங்கள் மனம் மட்டுமே உங்கள் வரம்பு."
  },
  { 
    english: "Don't watch the clock; do what it does. Keep going.",
    tamil: "கடிகாரத்தை பார்க்காதீர்கள்; அது செய்வதை செய்யுங்கள். தொடர்ந்து செல்லுங்கள்."
  },
  { 
    english: "Success is the sum of small efforts, repeated day in and day out.",
    tamil: "வெற்றி என்பது தினசரி சிறிய முயற்சிகளின் மொத்தம்."
  }
];

const CountdownTimer: React.FC<CountdownTimerProps> = ({ className }) => {
  const [time, setTime] = useState(1800); // 30 minutes default (30*60)
  const [selectedTime, setSelectedTime] = useState("30");
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPomodoroMode, setIsPomodoroMode] = useState(false);
  const [quote, setQuote] = useState<{ english: string; tamil: string } | null>(null);
  const [showQuote, setShowQuote] = useState(false);
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);

  // Format time to display as HH:MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':');
  }, []);

  // Toggle the timer between running and paused
  const toggleTimer = useCallback(() => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  }, [isActive, isPaused]);

  // Reset the timer to the initial value
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setTime(parseInt(selectedTime) * 60);
    setQuote(null);
    setShowQuote(false);
  }, [selectedTime]);

  // Handle time selection
  const handleTimeChange = (value: string) => {
    setSelectedTime(value);
    if (!isActive) {
      setTime(parseInt(value) * 60);
    }
  };

  // Enable Pomodoro mode
  const togglePomodoroMode = () => {
    setIsPomodoroMode(!isPomodoroMode);
    if (!isActive && !isPomodoroMode) {
      setSelectedTime("25");
      setTime(25 * 60);
    }
  };

  // Toggle fullscreen mode
  const toggleFullScreenMode = () => {
    setIsFullScreenMode(!isFullScreenMode);
  };

  // Display a random quote
  const displayRandomQuote = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[randomIndex]);
    setShowQuote(true);
  }, []);

  // Close fullscreen mode
  const handleCloseFullScreen = () => {
    setIsFullScreenMode(false);
  };

  // Calculate progress for the timer circle
  const calculateProgress = () => {
    const totalSeconds = parseInt(selectedTime) * 60;
    return (totalSeconds - time) / totalSeconds * 100;
  };
  
  const progress = calculateProgress();
  const circumference = 2 * Math.PI * 130;
  const strokeDashoffset = circumference * (1 - progress / 100);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            // Timer complete
            setIsActive(false);
            clearInterval(interval as NodeJS.Timeout);
            displayRandomQuote();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, displayRandomQuote]);

  // Handle Pomodoro mode when timer ends
  useEffect(() => {
    if (isPomodoroMode && time === 0 && !isActive) {
      setTimeout(() => {
        if (selectedTime === "25") {
          // Switch to break (5 minutes)
          handleTimeChange("5");
        } else {
          // If it was a break, switch back to work (25 minutes)
          handleTimeChange("25");
        }
      }, 3000);
    }
  }, [isPomodoroMode, time, isActive, selectedTime]);

  // Show quote every 2 minutes during full screen mode
  useEffect(() => {
    let quoteInterval: NodeJS.Timeout | null = null;
    
    if (isFullScreenMode && isActive && !isPaused) {
      quoteInterval = setInterval(() => {
        displayRandomQuote();
      }, 120000); // 2 minutes
    }
    
    return () => {
      if (quoteInterval) clearInterval(quoteInterval);
    };
  }, [isFullScreenMode, isActive, isPaused, displayRandomQuote]);

  return (
    <>
      {/* Full screen mode overlay */}
      <AnimatePresence>
        {isFullScreenMode && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto"
          >
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-gray-800 h-8 w-8 sm:h-10 sm:w-10"
                onClick={handleCloseFullScreen}
              >
                <X className="h-4 w-4 sm:h-6 sm:w-6" />
              </Button>
            </div>

            <div className="text-center mb-4 sm:mb-8 w-full max-w-3xl">
              {/* Timer circle in fullscreen */}
              <div className="relative flex items-center justify-center my-4 sm:my-8 mx-auto">
                <svg width="250" height="250" viewBox="0 0 300 300" className="sm:w-[300px] sm:h-[300px] transform scale-110">
                  {/* Background circle */}
                  <circle
                    cx="150"
                    cy="150"
                    r="140"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="10"
                  />
                  
                  {/* Progress circle */}
                  <circle
                    cx="150"
                    cy="150"
                    r="140"
                    fill="none"
                    stroke={isPomodoroMode ? "#ef4444" : "#8b5cf6"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 140}
                    strokeDashoffset={2 * Math.PI * 140 * (1 - progress / 100)}
                    transform="rotate(-90 150 150)"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute text-4xl sm:text-6xl font-bold text-white">
                  {formatTime(time)}
                </div>
              </div>

              {/* Timer controls in fullscreen */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 mb-4 sm:mb-8">
                <Button
                  size="lg"
                  variant="default"
                  onClick={toggleTimer}
                  className={cn(
                    "text-base sm:text-lg px-4 sm:px-6 py-4 sm:py-6 w-full sm:w-auto",
                    isPomodoroMode ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"
                  )}
                >
                  {!isActive || isPaused ? <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> : <Pause className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />}
                  {!isActive ? "Start" : isPaused ? "Resume" : "Pause"}
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetTimer}
                  disabled={!isActive && time === parseInt(selectedTime) * 60}
                  className="text-base sm:text-lg px-4 sm:px-6 py-4 sm:py-6 border-white text-white hover:bg-gray-800 w-full sm:w-auto"
                >
                  <RefreshCcw className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Reset
                </Button>
              </div>

              {/* Bilingual quotes in fullscreen */}
              {quote && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-800/50 rounded-xl p-4 sm:p-8 backdrop-blur-sm max-w-3xl mx-auto"
                >
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Quote of the Moment</h2>
                    <div className="space-y-3 sm:space-y-6">
                      <div className="p-3 sm:p-4 rounded-lg bg-purple-900/30 backdrop-blur-sm">
                        <p className="text-sm sm:text-xl font-medium text-white">"{quote.english}"</p>
                      </div>
                      
                      <div className="p-3 sm:p-4 rounded-lg bg-purple-900/30 backdrop-blur-sm">
                        <p className="text-sm sm:text-xl font-medium text-white">"{quote.tamil}"</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Normal timer card view */}
      <Card className={cn("p-3 sm:p-6", className, isPomodoroMode && "bg-red-50 dark:bg-red-900/20")}>
        <div className="flex items-center justify-between w-full mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-medium flex items-center gap-2">
            <Timer className={cn("h-4 w-4 sm:h-5 sm:w-5", isPomodoroMode ? "text-red-500" : "text-purple-500")} />
            <span className="hidden sm:inline">{isPomodoroMode ? "Pomodoro Timer" : "Countdown Timer"}</span>
            <span className="sm:hidden">{isPomodoroMode ? "Pomodoro" : "Timer"}</span>
          </h3>
          <div className="flex items-center gap-1 sm:gap-2">
            <Select
              value={selectedTime}
              onValueChange={handleTimeChange}
              disabled={isActive}
            >
              <SelectTrigger className="w-[80px] sm:w-[110px] text-xs sm:text-sm">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 min</SelectItem>
                <SelectItem value="10">10 min</SelectItem>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="25">25 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleFullScreenMode}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 h-8 w-8 sm:h-9 sm:w-9"
            >
              <Expand className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        <div className="relative flex items-center justify-center my-3 sm:my-4">
          <svg width="200" height="200" viewBox="0 0 280 280" className="sm:w-[280px] sm:h-[280px]">
            {/* Background circle */}
            <circle
              cx="140"
              cy="140"
              r="130"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            
            {/* Progress circle */}
            <circle
              cx="140"
              cy="140"
              r="130"
              fill="none"
              stroke={isPomodoroMode ? "#ef4444" : "#8b5cf6"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 140 140)"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute text-2xl sm:text-4xl font-bold text-gray-700 dark:text-gray-200">
            {formatTime(time)}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button
            variant="default"
            onClick={toggleTimer}
            className={cn(
              "w-full sm:w-auto text-xs sm:text-sm",
              isPomodoroMode ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"
            )}
          >
            {!isActive || isPaused ? <Play className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> : <Pause className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />}
            {!isActive ? "Start" : isPaused ? "Resume" : "Pause"}
          </Button>
          
          <Button
            variant="outline"
            onClick={resetTimer}
            disabled={!isActive && time === parseInt(selectedTime) * 60}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <RefreshCcw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Reset
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <div className="flex items-center gap-2">
            <Switch
              checked={isPomodoroMode}
              onCheckedChange={togglePomodoroMode}
              id="pomodoro-mode"
            />
            <Label htmlFor="pomodoro-mode" className="text-xs sm:text-sm">
              Pomodoro Mode
              {isPomodoroMode && (
                <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs bg-red-100 text-red-800 px-1 sm:px-2 py-0.5 rounded-full dark:bg-red-900 dark:text-red-200">
                  Active
                </span>
              )}
            </Label>
          </div>
          
          {quote && showQuote ? (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleFullScreenMode}
              className="text-xs sm:text-sm w-full sm:w-auto"
            >
              Expand
            </Button>
          ) : (
            !isActive && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={displayRandomQuote}
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                Show Quote
              </Button>
            )
          )}
        </div>
        
        <AnimatePresence>
          {quote && showQuote && !isFullScreenMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 sm:mt-4 p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg text-center"
            >
              <p className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-300">
                "{quote.english}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </>
  );
};

export default CountdownTimer;
