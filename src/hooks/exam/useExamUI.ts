
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const useExamUI = () => {
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [showQuestionPalette, setShowQuestionPalette] = useState(true);
  
  // Handle mobile view
  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);
  
  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Toggle question palette on mobile
  const toggleQuestionPalette = () => {
    setShowQuestionPalette(!showQuestionPalette);
  };
  
  return {
    isMobile,
    showSidebar,
    setShowSidebar,
    showQuestionPalette,
    setShowQuestionPalette,
    toggleSidebar,
    toggleQuestionPalette
  };
};
