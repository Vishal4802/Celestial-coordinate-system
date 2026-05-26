import React, { useState } from 'react'
import RotatingCelestialSphere from './RotatingCelestialSphere'
import LanguageModal from './LanguageModal'
import { useLanguage } from '../context/LanguageContext'
import { getTranslation } from '../data/translations'

export default function Hero() {
  const { language } = useLanguage()
  const [languageModalOpen, setLanguageModalOpen] = useState(false)
  
  const isEnglish = language === 'en'
  const isHindi = language === 'hi'
  const isSanskrit = language === 'sa'

  return (
    <div className="px-6 md:px-12 pt-16 md:pt-20 pb-12">
      <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
        {/* Left content */}
        <div className="flex-2 max-w-3xl">
          {/* Badge with Language Button */}
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-xs font-mono tracking-widest text-[#38bdf8]">
                {isEnglish && '✦ CELESTIAL COORDINATES'}
                {isHindi && '✦ आकाश निर्देशांक'}
                {isSanskrit && '✦ खगोल निर्देशांक'}
              </span>
            </div>
            <button
              onClick={() => setLanguageModalOpen(true)}
              className="px-4 py-1 rounded-full bg-white/5 border border-white/10 hover:border-white/30 backdrop-blur-sm transition-all text-xs font-mono tracking-widest text-[#a78bfa] hover:text-[#c8b6ff]"
            >
              {getTranslation(language, 'language')}
            </button>
          </div>
          
          <LanguageModal isVisible={languageModalOpen} onClose={() => setLanguageModalOpen(false)} />

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
            {isEnglish && <>Explore the<br /></>}
            {isHindi && <>अन्वेषण करें<br /></>}
            {isSanskrit && <>अन्वेषण करुध्वम्<br /></>}
            <span className="bg-gradient-to-r from-[#38bdf8] via-[#a78bfa] to-[#e879f9] bg-clip-text text-transparent animate-pulse" style={{ animationDuration: '4s' }}>
              {isEnglish && 'Celestial Sphere'}
              {isHindi && 'आकाशीय गोला'}
              {isSanskrit && 'खगोल गोल'}
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-[#a0aec0] leading-relaxed">
            {isEnglish && 'Master the coordinate systems used by astronomers to locate and track celestial objects. Each system offers a unique perspective of the heavens from different reference points.'}
            {isHindi && 'खगोल विज्ञानियों द्वारा खगोलीय वस्तुओं का पता लगाने और ट्रैक करने के लिए उपयोग की जाने वाली समन्वय प्रणालियों में महारत हासिल करें। प्रत्येक प्रणाली विभिन्न संदर्भ बिंदुओं से आकाश का एक अद्वितीय दृष्टिकोण प्रदान करती है।'}
            {isSanskrit && 'खगोल विज्ञानिभिः खगोल वस्तुनां पता निर्धारणार्थं ट्रैक कर्तुं योजिताः समन्वय व्यवस्था महाविद्या प्राप्यताम्। प्रत्येक व्यवस्था विभिन्न संदर्भ बिंदुभ्यः आकाश अद्वितीय दृष्टिकोण प्रदर्शयति।'}
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
