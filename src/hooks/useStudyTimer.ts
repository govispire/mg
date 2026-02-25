
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useStudyTimer() {
  const [time, setTime] = useState(1800); // 30 minutes default (30*60)
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [showQuote, setShowQuote] = useState(false);
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

  // Toggle expanded state
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
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
  const displayRandomQuote = useCallback((quoteData: any) => {
    setQuote(quoteData);
    setShowQuote(true);
    
    // Hide quote after 20 seconds
    const hideQuoteTimeout = setTimeout(() => {
      setShowQuote(false);
    }, 20000);
    
    return () => clearTimeout(hideQuoteTimeout);
  }, []);

  // Timer effect - ensure it runs in both expanded and collapsed states
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            // Timer complete
            setIsActive(false);
            clearInterval(interval as NodeJS.Timeout);
            toast({
              title: "Study session complete!",
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
  }, [isActive, isPaused, toast]);

  return {
    time,
    isActive,
    isPaused,
    isExpanded,
    quote,
    showQuote,
    formatTime,
    toggleTimer,
    resetTimer,
    setCustomTime,
    toggleExpanded,
    setShowQuote,
    displayRandomQuote
  };
}
