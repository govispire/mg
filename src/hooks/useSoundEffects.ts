import { useCallback, useRef } from 'react';

type SoundType = 'success' | 'celebration' | 'streak' | 'milestone' | 'click' | 'correct' | 'wrong' | 'complete';

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  pattern?: number[];
}

const soundConfigs: Record<SoundType, SoundConfig | SoundConfig[]> = {
  success: {
    frequency: 523.25, // C5
    duration: 150,
    type: 'sine',
    volume: 0.3,
  },
  celebration: [
    { frequency: 523.25, duration: 100, type: 'sine', volume: 0.3 },
    { frequency: 659.25, duration: 100, type: 'sine', volume: 0.3 },
    { frequency: 783.99, duration: 100, type: 'sine', volume: 0.3 },
    { frequency: 1046.50, duration: 200, type: 'sine', volume: 0.4 },
  ],
  streak: [
    { frequency: 440, duration: 80, type: 'square', volume: 0.2 },
    { frequency: 554.37, duration: 80, type: 'square', volume: 0.2 },
    { frequency: 659.25, duration: 80, type: 'square', volume: 0.2 },
    { frequency: 880, duration: 150, type: 'sine', volume: 0.3 },
  ],
  milestone: [
    { frequency: 392, duration: 100, type: 'sine', volume: 0.3 },
    { frequency: 523.25, duration: 100, type: 'sine', volume: 0.3 },
    { frequency: 659.25, duration: 100, type: 'sine', volume: 0.3 },
    { frequency: 783.99, duration: 100, type: 'sine', volume: 0.3 },
    { frequency: 1046.50, duration: 300, type: 'sine', volume: 0.4 },
  ],
  click: {
    frequency: 1000,
    duration: 30,
    type: 'sine',
    volume: 0.1,
  },
  correct: [
    { frequency: 523.25, duration: 100, type: 'sine', volume: 0.25 },
    { frequency: 659.25, duration: 150, type: 'sine', volume: 0.3 },
  ],
  wrong: {
    frequency: 200,
    duration: 200,
    type: 'sawtooth',
    volume: 0.15,
  },
  complete: [
    { frequency: 392, duration: 150, type: 'sine', volume: 0.25 },
    { frequency: 523.25, duration: 150, type: 'sine', volume: 0.25 },
    { frequency: 659.25, duration: 150, type: 'sine', volume: 0.3 },
    { frequency: 783.99, duration: 300, type: 'sine', volume: 0.35 },
  ],
};

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((config: SoundConfig, startTime: number) => {
    const audioContext = getAudioContext();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = config.frequency;
    oscillator.type = config.type;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(config.volume, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + config.duration / 1000);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + config.duration / 1000 + 0.1);
  }, [getAudioContext]);

  const playSound = useCallback((type: SoundType) => {
    if (!enabledRef.current) return;

    try {
      const audioContext = getAudioContext();
      const config = soundConfigs[type];
      
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      let currentTime = audioContext.currentTime;

      if (Array.isArray(config)) {
        config.forEach((sound, index) => {
          playTone(sound, currentTime);
          currentTime += sound.duration / 1000;
        });
      } else {
        playTone(config, currentTime);
      }
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, [getAudioContext, playTone]);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  const isEnabled = useCallback(() => enabledRef.current, []);

  return {
    playSound,
    setEnabled,
    isEnabled,
  };
};

export default useSoundEffects;
