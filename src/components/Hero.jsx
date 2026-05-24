import React from 'react'
import RotatingCelestialSphere from './RotatingCelestialSphere'

export default function Hero() {
  return (
    <div className="px-6 md:px-12 pt-16 md:pt-20 pb-12">
      <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
        {/* Left content */}
        <div className="flex-2 max-w-3xl">
          {/* Badge */}
          <div className="inline-block mb-6 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-xs font-mono tracking-widest text-[#38bdf8]">✦ CELESTIAL COORDINATES</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
            Explore the<br />
            <span className="bg-gradient-to-r from-[#38bdf8] via-[#a78bfa] to-[#e879f9] bg-clip-text text-transparent animate-pulse" style={{ animationDuration: '4s' }}>
              Celestial Sphere
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-[#a0aec0] leading-relaxed">
            Master the coordinate systems used by astronomers to locate and track celestial objects. 
            Each system offers a unique perspective of the heavens from different reference points.
          </p>
        </div>

        {/* Right: Rotating sphere */}
        <div className="hidden lg:block flex-1 h-[320px] rounded-xl overflow-hidden border border-white/5 shadow-lg">
          <RotatingCelestialSphere />
        </div>
      </div>
    </div>
  )
}
