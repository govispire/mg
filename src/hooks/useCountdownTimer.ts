
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Bilingual motivational quotes - English and Tamil
export const motivationalQuotes = [
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

export interface QuoteType {
  english: string;
  tamil: string;
}

export function useCountdownTimer() {
  const [time, setTime] = useState(1800); // 30 minutes default (30*60)
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPomodoroMode, setIsPomodoroMode] = useState(false);
  const [quote, setQuote] = useState<QuoteType | null>(null);
  const [showQuote, setShowQuote] = useState(false);
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);
  const { toast } = useToast();

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
    setTime(1800); // Reset to 30 minutes
    setQuote(null);
    setShowQuote(false);
  }, []);

  // Set a custom time in minutes
  const setCustomTime = useCallback((minutes: number) => {
    if (!isActive) {
      setTime(minutes * 60);
    } else {
      toast({
        title: "Cannot change time while timer is running",
        description: "Please stop the timer first before changing the time",
        variant: "destructive",
      });
    }
  }, [isActive, toast]);

  // Display a random quote
  const displayRandomQuote = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[randomIndex]);
    setShowQuote(true);
  }, []);

  // Toggle fullscreen mode
  const toggleFullScreenMode = useCallback(() => {
    setIsFullScreenMode(!isFullScreenMode);
  }, [isFullScreenMode]);

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
            toast({
              title: "Timer complete!",
              description: "Great job! Take a short break before continuing.",
            });
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
  }, [isActive, isPaused, toast, displayRandomQuote]);

  return {
    time,
    isActive,
    isPaused,
    isPomodoroMode,
    isFullScreenMode,
    setIsPomodoroMode,
    setIsFullScreenMode,
    quote,
    showQuote,
    formatTime,
    toggleTimer,
    resetTimer,
    setCustomTime,
    setQuote,
    setShowQuote,
    displayRandomQuote,
    toggleFullScreenMode
  };
}
