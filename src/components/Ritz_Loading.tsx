"use client"
import { motion } from "framer-motion"

interface RitzLoadingProps {
    color?: string
    spcolor?: string
    size?: "small" | "medium" | "large"
}

export function RitzLoading({ spcolor = "blue-600", color = "text-primary", size = "medium" }: RitzLoadingProps) {
    const sizeClasses = {
        small: "text-2xl",
        medium: "text-4xl",
        large: "text-6xl",
    }
    const spinnerSize = {
        small: 5,
        medium: 10,
        large: 20,
    }

    return (
        <div className={`font-bold flex items-center ${color} ${sizeClasses[size]}`}>
            <div className={`border-gray-300 h-${spinnerSize[size]} w-${spinnerSize[size]} animate-spin rounded-full border-8 border-t-${spcolor}`} />
            {"Ritz".split("").map((letter, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 0.5,
                        delay: index * 0.2,
                        repeat: Infinity,
                        repeatDelay: 1,
                    }}
                >
                    {letter}
                </motion.span>
            ))}
        </div>
    )
}