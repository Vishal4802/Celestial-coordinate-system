import React, { useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { getTranslation } from '../data/translations'

export default function LanguageModal({ isVisible, onClose }) {
  const { language, setLanguage } = useLanguage()

  useEffect(() => {
    // No longer auto-show on startup
  }, [])

  const handleLanguageSelect = (lang) => {
    setLanguage(lang)
    if (onClose) onClose()
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#030611] border border-white/[0.1] rounded-2xl p-8 max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="text-4xl mb-3">✦</div>
            <h2 className="text-2xl font-bold text-[#e2e8f0] mb-2">{getTranslation(language, 'celestialCoordinatesTitle')}</h2>
            <p className="text-sm text-[#7a90b0]">{getTranslation(language, 'selectPreferredLanguage')}</p>
          </div>

          {/* Language Options */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleLanguageSelect('en')}
              className="w-full px-6 py-4 rounded-lg border-2 border-[#38bdf8]/30 bg-[#38bdf8]/5 hover:bg-[#38bdf8]/15 hover:border-[#38bdf8]/60 transition-all text-[#38bdf8] font-semibold text-lg"
            >
              🇬🇧 English
            </button>

            <button
              onClick={() => handleLanguageSelect('hi')}
              className="w-full px-6 py-4 rounded-lg border-2 border-[#fb923c]/30 bg-[#fb923c]/5 hover:bg-[#fb923c]/15 hover:border-[#fb923c]/60 transition-all text-[#fb923c] font-semibold text-lg"
            >
              🇮🇳 हिंदी (Hindi)
            </button>

            <button
              onClick={() => handleLanguageSelect('sa')}
              className="w-full px-6 py-4 rounded-lg border-2 border-[#a78bfa]/30 bg-[#a78bfa]/5 hover:bg-[#a78bfa]/15 hover:border-[#a78bfa]/60 transition-all text-[#a78bfa] font-semibold text-lg"
            >
              🕉️ संस्कृत (Sanskrit)
            </button>
          </div>

          {/* Footer text */}
          <p className="text-xs text-[#364d66] text-center">
            {getTranslation(language, 'canChangeAnytime')}
          </p>
        </div>
      </div>
    </>
  )
}
