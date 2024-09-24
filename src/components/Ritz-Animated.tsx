import React, { useEffect, useRef } from 'react'

export default function Component() {
    const svgRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        const svg = svgRef.current
        if (!svg) return

        const animateGlow = () => {
            const paths = svg.querySelectorAll('path')
            paths.forEach((path) => {
                const length = path.getTotalLength()
                const glowStart = Math.random() * length
                const glowLength = Math.random() * 20 + 10

                const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
                glowPath.setAttribute('d', path.getAttribute('d') || '')
                glowPath.setAttribute('fill', 'none')
                glowPath.setAttribute('stroke', 'white')
                glowPath.setAttribute('stroke-width', '3')
                glowPath.setAttribute('stroke-dasharray', `0 ${glowStart} ${glowLength} ${length}`)
                glowPath.setAttribute('filter', 'url(#glow)')

                svg.appendChild(glowPath)

                glowPath.animate(
                    [
                        { opacity: 0 },
                        { opacity: 1 },
                        { opacity: 0 }
                    ],
                    {
                        duration: 1000,
                        easing: 'ease-in-out'
                    }
                ).onfinish = () => {
                    glowPath.remove()
                }
            })
        }

        const interval = setInterval(animateGlow, 200)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-full h-screen bg-black flex items-center justify-center">
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="0 0 400 200"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <path
                    d="M50 150 L50 50 L100 50 L100 150 M120 150 L120 50 L170 50 L170 150 M190 150 L190 50 L240 100 L290 50 L290 150 M310 150 L310 50 L360 50"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.3"
                />
            </svg>
        </div>
    )
}