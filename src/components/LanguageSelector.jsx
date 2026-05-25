import React from 'react'
import { useLanguage } from '../context/LanguageContext'
import { getTranslation } from '../data/translations'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="fixed top-4 right-4 z-50 bg-[#0a0e2e]/95 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-2 shadow-lg">
      <div className="flex gap-2">
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
            language === 'en'
              ? 'bg-[#2563eb] text-white shadow-lg'
              : 'text-[#a0aec0] hover:text-white hover:bg-white/5'
          }`}
          title={getTranslation(language, 'english')}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('hi')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
            language === 'hi'
              ? 'bg-[#2563eb] text-white shadow-lg'
              : 'text-[#a0aec0] hover:text-white hover:bg-white/5'
          }`}
          title={getTranslation(language, 'hindi')}
        >
          HI
        </button>
        <button
          onClick={() => setLanguage('sa')}
          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
            language === 'sa'
              ? 'bg-[#2563eb] text-white shadow-lg'
              : 'text-[#a0aec0] hover:text-white hover:bg-white/5'
          }`}
          title={getTranslation(language, 'sanskrit')}
        >
          SA
        </button>
      </div>
    </div>
  )
}
