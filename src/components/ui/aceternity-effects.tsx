"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingElementProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export function FloatingElement({ children, delay = 0, duration = 6, className = "" }: FloatingElementProps) {
    return (
        <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-10, 10, -10] }}
            transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface BackgroundGradientProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    animate?: boolean;
}

export function BackgroundGradient({
    children,
    className,
    containerClassName,
    animate = true,
}: BackgroundGradientProps) {
    const variants = {
        initial: {
            backgroundPosition: "0 50%",
        },
        animate: {
            backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
        },
    };

    return (
        <div className={`relative p-[2px] group ${containerClassName}`}>
            <motion.div
                variants={animate ? variants : undefined}
                initial={animate ? "initial" : undefined}
                animate={animate ? "animate" : undefined}
                transition={
                    animate
                        ? {
                            duration: 5,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }
                        : undefined
                }
                style={{
                    backgroundSize: animate ? "400% 400%" : undefined,
                }}
                className="absolute inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-xl transition duration-500 will-change-transform bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500"
            />
            <motion.div
                variants={animate ? variants : undefined}
                initial={animate ? "initial" : undefined}
                animate={animate ? "animate" : undefined}
                transition={
                    animate
                        ? {
                            duration: 5,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }
                        : undefined
                }
                style={{
                    backgroundSize: animate ? "400% 400%" : undefined,
                }}
                className="absolute inset-0 rounded-3xl z-[1] will-change-transform bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500"
            />
            <div className={`relative z-10 ${className}`}>{children}</div>
        </div>
    );
}

interface SparklesProps {
    id?: string;
    className?: string;
    background?: string;
    minSize?: number;
    maxSize?: number;
    particleDensity?: number;
    particleColor?: string;
}

export function Sparkles({
    id = "sparkles",
    className,
    background = "transparent",
    minSize = 0.4,
    maxSize = 1.0,
    particleDensity = 50,
    particleColor = "#FFF",
}: SparklesProps) {
    const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

    useEffect(() => {
        const generateSparkles = () => {
            const newSparkles = Array.from({ length: particleDensity }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * (maxSize - minSize) + minSize,
            }));
            setSparkles(newSparkles);
        };

        generateSparkles();
        const interval = setInterval(generateSparkles, 3000);

        return () => clearInterval(interval);
    }, [particleDensity, maxSize, minSize]);

    return (
        <div
            id={id}
            className={`absolute inset-0 overflow-hidden ${className}`}
            style={{ background }}
        >
            {sparkles.map((sparkle) => (
                <motion.div
                    key={sparkle.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                    transition={{
                        duration: Math.random() * 3 + 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                    }}
                    className="absolute rounded-full"
                    style={{
                        left: `${sparkle.x}%`,
                        top: `${sparkle.y}%`,
                        width: `${sparkle.size}rem`,
                        height: `${sparkle.size}rem`,
                        backgroundColor: particleColor,
                    }}
                />
            ))}
        </div>
    );
}

interface MeteorProps {
    number?: number;
    className?: string;
}

export function Meteors({ number = 20, className }: MeteorProps) {
    const meteors = new Array(number).fill(true);

    return (
        <>
            {meteors.map((_, idx) => (
                <span
                    key={idx}
                    className={`animate-meteor-effect absolute h-0.5 w-0.5 rounded-full bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg] ${className}`}
                    style={{
                        top: 0,
                        left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
                        animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
                        animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
                    }}
                />
            ))}
        </>
    );
}
