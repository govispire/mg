import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Article } from '@/components/current-affairs/types';

export const useAudioNarration = () => {
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrationArticleId, setNarrationArticleId] = useState<string | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const startNarration = (article: Article) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Audio narration is not supported in your browser');
      return;
    }

    stopNarration();

    const textToRead = `${article.title}. ${article.excerpt}. ${article.content || ''}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setIsNarrating(false);
      setNarrationArticleId(null);
    };

    utterance.onerror = () => {
      setIsNarrating(false);
      setNarrationArticleId(null);
      toast.error('Narration stopped due to an error');
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsNarrating(true);
    setNarrationArticleId(article.id);
    toast.success('Starting audio narration');
  };

  const stopNarration = () => {
    window.speechSynthesis.cancel();
    setIsNarrating(false);
    setNarrationArticleId(null);
  };

  const toggleNarration = (article: Article) => {
    if (isNarrating && narrationArticleId === article.id) {
      stopNarration();
    } else {
      startNarration(article);
    }
  };

  return {
    isNarrating,
    narrationArticleId,
    startNarration,
    stopNarration,
    toggleNarration
  };
};
