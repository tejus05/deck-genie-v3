import { cn } from "@/lib/utils"
import { Loader } from "./loader"
import { ProgressBar } from "./progress-bar"
import { useEffect, useRef } from "react"
import anime from "animejs"
import Image from "next/image"
interface OverlayLoaderProps {
    text?: string
    className?: string
    show: boolean
    showProgress?: boolean
    duration?: number
    extra_info?: string
    onProgressComplete?: () => void
}

export const OverlayLoader = ({
    text,
    className,
    show,
    showProgress = false,
    duration = 10,
    onProgressComplete,
    extra_info
}: OverlayLoaderProps) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (show && overlayRef.current && contentRef.current) {
            // Animate overlay fade in
            anime({
                targets: overlayRef.current,
                opacity: [0, 1],
                duration: 300,
                easing: 'easeInOutQuad'
            });

            // Animate content scale and fade in
            anime({
                targets: contentRef.current,
                scale: [0.9, 1],
                opacity: [0, 1],
                duration: 400,
                easing: 'easeOutQuad'
            });
        }
    }, [show]);

    if (!show) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center opacity-0"
        >
            <div
                ref={contentRef}
                className={cn(
                    "flex flex-col items-center justify-center px-8 pt-4 pb-8 rounded-3xl glass border-2 border-white/20 shadow-modern-xl",
                    "min-w-[320px] sm:min-w-[380px] opacity-0",
                    className
                )}
            >
                {/* Modern loading animation */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-lg opacity-30 animate-pulse-gentle"></div>
                    <img 
                        loading="eager" 
                        src={'/loading.gif'} 
                        alt="loading" 
                        width={220} 
                        height={220}
                        className="relative z-10 drop-shadow-lg"
                    />
                </div>

                {showProgress ? (
                    <div className="w-full space-y-6">
                        <ProgressBar
                            duration={duration}
                            onComplete={onProgressComplete}
                        />
                        {text && (
                            <div className="space-y-2">
                                <p className="text-white text-lg text-center font-semibold font-body">
                                    {text}
                                </p>
                                {extra_info && (
                                    <p className="text-white/80 text-sm text-center font-body">
                                        {extra_info}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2 text-center">
                        <p className="text-white text-lg font-semibold font-body">
                            {text}
                        </p>
                        {extra_info && (
                            <p className="text-white/80 text-sm font-body">
                                {extra_info}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
} 