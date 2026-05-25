import React from 'react'
import StarBackground from '../components/StarBackground'
import Hero from '../components/Hero'
import SystemCard from '../components/SystemCard'
import LanguageSelector from '../components/LanguageSelector'
import { useLanguage } from '../context/LanguageContext'
import { getTranslation } from '../data/translations'

export default function HomePage({ onSelectSystem }) {
  const { language } = useLanguage()

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#06091a] via-[#0a0e2e] to-[#06091a] text-[#e2e8f0] overflow-hidden">
      {/* Language Selector */}
      <LanguageSelector />
      
      {/* Background stars */}
      <StarBackground />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero section */}
        <Hero />

        {/* Systems grid */}
        <div className="px-6 md:px-12 py-8 flex-1">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-[#c8d8ee]">
              {getTranslation(language, 'chooseCoordinateSystem')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {['horizontal', 'equatorial1', 'equatorial2', 'ecliptic'].map((systemId) => {
                const systemData = getTranslation(language, `systems.${systemId}`)
                const colorMap = { horizontal: '#38bdf8', equatorial1: '#fb923c', equatorial2: '#a78bfa', ecliptic: '#e879f9' }
                
                return (
                  <SystemCard
                    key={systemId}
                    system={{
                      id: systemId,
                      label: systemData.label,
                      subtitle: systemData.subtitle,
                      description: systemData.description,
                      color: colorMap[systemId]
                    }}
                    onSelect={onSelectSystem}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 md:px-12 py-8 border-t border-white/[0.05]">
          <div className="max-w-6xl mx-auto text-center text-sm text-[#5a7088]">
            <p>{getTranslation(language, 'interactiveVisualizations')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
