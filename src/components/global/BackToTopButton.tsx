import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface BackToTopButtonProps {
    threshold?: number;
    className?: string;
    targetId?: string; // Optional: scroll to a specific element ID instead of window top
}

const BackToTopButton: React.FC<BackToTopButtonProps> = ({
    threshold = 300,
    className,
    targetId
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > threshold) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, [threshold]);

    const scrollToTop = () => {
        if (targetId) {
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                return;
            }
        }

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={cn("fixed bottom-8 right-8 z-50", className)}
                >
                    <Button
                        size="icon"
                        className="rounded-full shadow-lg h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-110"
                        onClick={scrollToTop}
                        aria-label="Back to top"
                    >
                        <ArrowUp className="h-6 w-6" />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BackToTopButton;
