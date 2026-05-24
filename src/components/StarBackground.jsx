import React, { useMemo } from 'react'

export default function StarBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 0.5,
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random() * 0.6 + 0.3,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--opacity); }
          50% { opacity: calc(var(--opacity) * 0.5); }
        }
      `}</style>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            width: star.size + 'px',
            height: star.size + 'px',
            left: star.left + '%',
            top: star.top + '%',
            opacity: star.opacity,
            '--opacity': star.opacity,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
