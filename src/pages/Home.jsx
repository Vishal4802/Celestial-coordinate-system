import React from 'react'
import StarBackground from '../components/StarBackground'
import Hero from '../components/Hero'
import SystemCard from '../components/SystemCard'
import { SYSTEMS_DATA } from '../data/systems'

export default function HomePage({ onSelectSystem }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#06091a] via-[#0a0e2e] to-[#06091a] text-[#e2e8f0] overflow-hidden">
      {/* Background stars */}
      <StarBackground />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero section */}
        <Hero />

        {/* Systems grid */}
        <div className="px-6 md:px-12 py-8 flex-1">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-[#c8d8ee]">Choose a Coordinate System</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {SYSTEMS_DATA.map((system) => (
                <SystemCard
                  key={system.id}
                  system={system}
                  onSelect={onSelectSystem}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 md:px-12 py-8 border-t border-white/[0.05]">
          <div className="max-w-6xl mx-auto text-center text-sm text-[#5a7088]">
            <p>Interactive 3D visualizations to master celestial coordinate systems</p>
          </div>
        </div>
      </div>
    </div>
  )
}
