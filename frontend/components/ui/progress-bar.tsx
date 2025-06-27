'use client'
import React, { useEffect, useState, useRef } from 'react';
import anime from 'animejs';

interface ProgressBarProps {
    duration: number;
    onComplete?: () => void;
}

export const ProgressBar = ({ duration, onComplete }: ProgressBarProps) => {
    const [progress, setProgress] = useState(0);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const startTime = useRef<number>(Date.now());
    const progressBarRef = useRef<HTMLDivElement>(null);
    const gradientRef = useRef<anime.AnimeInstance | null>(null);

    useEffect(() => {
        // Animate gradient
        if (progressBarRef.current) {
            gradientRef.current = anime({
                targets: progressBarRef.current,
                backgroundPosition: ['0% 50%', '100% 50%'],
                duration: 2000,
                loop: true,
                direction: 'alternate',
                easing: 'linear'
            });
        }

        const updateProgress = () => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime.current;
            const calculatedProgress = (elapsedTime / (duration * 1000)) * 100;

            if (calculatedProgress >= 95) {
                setProgress(95);
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }
                onComplete?.();
                return;
            }

            // Slow down progress after 90%
            if (calculatedProgress > 90) {
                const remainingProgress = Math.min(99 - progress, 0.1);
                setProgress(prev => prev + remainingProgress);
            } else {
                setProgress(Math.min(calculatedProgress, 90));
            }
        };

        progressInterval.current = setInterval(updateProgress, 50);

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
            if (gradientRef.current) {
                gradientRef.current.pause();
            }
        };
    }, [duration, onComplete]);

    return (
        <div className="w-full space-y-3">
            <div className="flex justify-between items-center text-white/90 text-sm">
                <span className="font-body font-medium">Processing...</span>
                <span className='font-body font-semibold'>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                <div
                    ref={progressBarRef}
                    className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full shadow-lg"
                    style={{
                        width: `${progress}%`,
                        backgroundSize: '200% 100%',
                        transition: 'width 0.3s ease-out',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
                    }}
                />
            </div>
        </div>
    );
}; 