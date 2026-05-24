import React from 'react'

export default function SystemCard({ system, onSelect }) {
  return (
    <button
      onClick={() => onSelect(system.id)}
      className="group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 text-left h-full"
      style={{
        borderColor: system.color + '30',
        background: `linear-gradient(135deg, ${system.color}05 0%, ${system.color}02 100%)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = system.color + '60'
        e.currentTarget.style.boxShadow = `0 0 30px ${system.color}20, inset 0 0 30px ${system.color}05`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = system.color + '30'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Gradient glow background */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${system.color} 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative p-8 md:p-10 flex flex-col h-full">
        {/* Top accent blob */}
        <div
          className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"
          style={{ background: system.color }}
        />

        {/* Header with title and arrow */}
        <div className="flex items-start justify-between mb-3 relative z-10">
          <h3 className="text-3xl font-black" style={{ color: system.color }}>
            {system.label}
          </h3>
          <span className="text-2xl transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 text-[#5a7088] group-hover:text-[#38bdf8]">
            ↗
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-sm font-mono tracking-widest mb-4 uppercase relative z-10" style={{ color: system.color + '99' }}>
          {system.subtitle}
        </p>

        {/* Description */}
        <p className="text-[#a0aec0] leading-relaxed relative z-10 flex-grow">
          {system.description}
        </p>

        {/* CTA */}
        <div className="mt-6 flex items-center gap-2 text-xs font-mono tracking-wider text-[#5a7088] group-hover:text-[#38bdf8] transition-colors relative z-10 uppercase">
          <span>Learn more</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform group-hover:translate-x-1">
            <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </button>
  )
}
