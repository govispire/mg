
import React, { useState, useEffect } from 'react';

interface PassFailAnimationProps {
  passed: boolean;
}

export const PassFailAnimation: React.FC<PassFailAnimationProps> = ({ passed }) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload images for faster loading
  useEffect(() => {
    const passImage = new Image();
    const failImage = new Image();
    
    passImage.src = "https://res.cloudinary.com/dsyxrhbwb/image/upload/e_background_removal/f_png/v1748018649/6163719773242901061_ranh4z.jpg";
    failImage.src = "https://res.cloudinary.com/dsyxrhbwb/image/upload/e_background_removal/f_png/v1748018450/6161467973429215658_jckxno.jpg";
    
    const currentImage = passed ? passImage : failImage;
    
    currentImage.onload = () => {
      setImageLoaded(true);
    };
    
    // Start loading immediately
    if (currentImage.complete) {
      setImageLoaded(true);
    }
  }, [passed]);

  useEffect(() => {
    if (imageLoaded) {
      const phases = [
        { delay: 0, phase: 1 }, // Start descent
        { delay: 500, phase: 2 }, // Impact (reduced from 800ms)
        { delay: 650, phase: 3 }, // Lift (reduced from 1000ms)
        { delay: 800, phase: 4 }, // Final position (reduced from 1200ms)
      ];

      phases.forEach(({ delay, phase }) => {
        setTimeout(() => setAnimationPhase(phase), delay);
      });

      if (passed) {
        setTimeout(() => setShowConfetti(true), 650);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  }, [passed, imageLoaded]);

  const stampImage = passed 
    ? "https://res.cloudinary.com/dsyxrhbwb/image/upload/e_background_removal/f_png/v1748018649/6163719773242901061_ranh4z.jpg"
    : "https://res.cloudinary.com/dsyxrhbwb/image/upload/e_background_removal/f_png/v1748018450/6161467973429215658_jckxno.jpg";

  const getStampStyle = () => {
    if (!imageLoaded) {
      return 'opacity-0 translate-y-0 scale-100 rotate-0';
    }
    
    switch (animationPhase) {
      case 0:
        return 'opacity-0 translate-y-[-200px] scale-50 rotate-[-10deg]';
      case 1:
        return 'opacity-100 translate-y-0 scale-100 rotate-0 transition-all duration-500 ease-out';
      case 2:
        return 'opacity-100 translate-y-2 scale-110 rotate-2 transition-all duration-150 ease-out';
      case 3:
        return 'opacity-100 translate-y-[-4px] scale-95 rotate-[-1deg] transition-all duration-150 ease-out';
      case 4:
        return 'opacity-100 translate-y-0 scale-100 rotate-0 transition-all duration-200 ease-out';
      default:
        return 'opacity-100 translate-y-0 scale-100 rotate-0';
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-8">
      {/* Confetti Effect */}
      {showConfetti && passed && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div 
                className="w-2 h-2 rounded"
                style={{
                  backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a55eea'][Math.floor(Math.random() * 6)]
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Loading placeholder */}
      {!imageLoaded && (
        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-200 rounded-full animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}

      {/* Stamp Image */}
      {imageLoaded && (
        <div className={`transform ${getStampStyle()}`}>
          <img 
            src={stampImage} 
            alt={passed ? "Pass Stamp" : "Fail Stamp"}
            className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-lg"
            loading="eager"
            decoding="async"
          />
        </div>
      )}

      {/* Congratulations Message */}
      {passed && animationPhase >= 3 && (
        <div className="mt-6 text-center animate-slide-up">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
            🎉 Congratulations! 🎉
          </h2>
          <p className="text-gray-600 text-lg">
            You have successfully passed the test!
          </p>
          <div className="mt-3 text-sm text-green-600 font-medium">
            Keep up the excellent work!
          </div>
        </div>
      )}

      {!passed && animationPhase >= 3 && (
        <div className="mt-6 text-center animate-slide-up">
          <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
            Better Luck Next Time!
          </h2>
          <p className="text-gray-600 text-lg">
            Keep practicing to improve your score.
          </p>
          <div className="mt-3 text-sm text-blue-600 font-medium">
            Every attempt makes you stronger!
          </div>
        </div>
      )}
    </div>
  );
};
