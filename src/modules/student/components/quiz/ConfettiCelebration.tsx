import { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  trigger: boolean;
  type?: 'streak' | 'quiz' | 'milestone';
}

const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({ trigger, type = 'quiz' }) => {
  const fireConfetti = useCallback(() => {
    if (type === 'milestone') {
      // Big celebration for milestones
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181']
        });
      }, 250);

      return () => clearInterval(interval);
    } else if (type === 'streak') {
      // Flame-colored confetti for streaks
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF4500', '#FF6347', '#FFA500', '#FFD700', '#FF8C00'],
        zIndex: 9999
      });
    } else {
      // Standard celebration for quiz completion
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#26ccff', '#a25afd']
      });
      fire(0.2, {
        spread: 60,
        colors: ['#ff5e7e', '#88ff5a']
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#ffcf40', '#ff6b6b']
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
        colors: ['#26ccff', '#a25afd', '#ff5e7e']
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
        colors: ['#88ff5a', '#ffcf40']
      });
    }
  }, [type]);

  useEffect(() => {
    if (trigger) {
      fireConfetti();
    }
  }, [trigger, fireConfetti]);

  return null;
};

export default ConfettiCelebration;
