import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { getTranslation } from '../data/translations'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const languageButtons = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'HI' },
    { code: 'sa', label: 'SA' }
  ]

  if (isMobile) {
    return (
      <div className="fixed top-4 right-4 z-50">
        {/* Expand button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
            isExpanded
              ? 'bg-[#2563eb] text-white shadow-lg'
              : 'bg-[#0a0e2e]/95 backdrop-blur-sm border border-white/10 text-[#a0aec0] hover:text-white'
          }`}
          title="Toggle language selector"
        >
          Λ
        </button>

        {/* Expanded menu */}
        {isExpanded && (
          <div className="absolute top-12 right-0 bg-[#0a0e2e]/95 backdrop-blur-sm border border-white/10 rounded-lg p-2 shadow-lg flex flex-col gap-2 min-w-[100px]">
            {languageButtons.map((btn) => (
              <button
                key={btn.code}
                onClick={() => {
                  setLanguage(btn.code)
                  setIsExpanded(false)
                }}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all w-full text-center ${
                  language === btn.code
                    ? 'bg-[#2563eb] text-white shadow-lg'
                    : 'text-[#a0aec0] hover:text-white hover:bg-white/5'
                }`}
                title={getTranslation(language, btn.code === 'en' ? 'english' : btn.code === 'hi' ? 'hindi' : 'sanskrit')}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Desktop: show all buttons - positioned to not overlap legend
  return (
    <div className="fixed top-4 left-4 z-50 bg-[#0a0e2e]/95 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-2 shadow-lg">
      <div className="flex gap-2">
        {languageButtons.map((btn) => (
          <button
            key={btn.code}
            onClick={() => setLanguage(btn.code)}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              language === btn.code
                ? 'bg-[#2563eb] text-white shadow-lg'
                : 'text-[#a0aec0] hover:text-white hover:bg-white/5'
            }`}
            title={getTranslation(language, btn.code === 'en' ? 'english' : btn.code === 'hi' ? 'hindi' : 'sanskrit')}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
