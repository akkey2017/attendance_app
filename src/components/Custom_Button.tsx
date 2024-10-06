"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { on } from 'events'

interface CustomButtonProps {
    size?: "small" | "medium" | "large"
    text: string
    color: string
    onClick?: (e:React.MouseEvent<HTMLButtonElement>) => void
}

export default function CustomButton({ size = "small", text, color = "black", onClick }: CustomButtonProps) {
    const sizeClasses = {
        small: "px-1 py-1",
        medium: "px-3 py-2",
        large: "px-5 py-3",
    }
    const textSizes = { small: "text-sm", medium: "text-base", large: "text-lg" }

    return (
        <motion.button
            className={`relative z-0 bg-white overflow-hidden ${sizeClasses[size]} rounded-xl shadow-md`}
            style={{ border: `2px solid ${color}` }}
            whileHover="hover"
            whileTap={{
                scale: 0.95,
                transition: { duration: 0.1 }
            }}
            onClick={onClick}  
        >
            <motion.div
                className="relative flex items-center justify-center pointer-events-none"
                initial={{ color: color }}
                variants={{
                    hover: { color: 'white', transition: { duration: 0.3 } }
                }}
            >
                <span className={`${textSizes[size]} z-10 font-bold gothic whitespace-nowrap`}>
                    {text}
                </span>
            </motion.div>
            <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                variants={{
                    hover: { opacity: 1, transition: { duration: 0.3 }},
                }}
            >
                <motion.div
                    className="absolute inset-0 rounded-md"
                    initial={{ top: '100%', bottom: '100%', left: '100%', right: '100%' }}
                    variants={{
                        hover: {
                            top: '0%',
                            bottom: '0%',
                            left: '0%',
                            right: '0%',
                            transition: { duration: 0.3, ease: "easeInOut" }
                        },
                    }}
                    style={{ backgroundColor: color }}
                />
            </motion.div>
        </motion.button>
    )
}