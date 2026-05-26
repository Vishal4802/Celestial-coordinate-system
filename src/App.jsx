import React, {
  useRef, useState, useMemo, useCallback, useEffect, memo
} from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import HomePage from './pages/Home'
import LanguageModal from './components/LanguageModal'
import { useLanguage } from './context/LanguageContext'
import { getTranslation, TRANSLATIONS } from './data/translations'
import { DEG, RING_PTS } from './constants/3d'
import { CelestialScene, EquatorialScene, EquatorialIIScene, EclipticScene } from './components/3D/scenes'

// ─── STEP CARD ────────────────────────────────────────────────────────────────
const horizontalSteps = [
  { desc: 'The Horizon: the base plane for all local observations. Every coordinate is measured relative to this circle.', config: {} },
  { desc: 'Zenith & Nadir: the vertical axis. Zenith is the point directly overhead; Nadir is directly below.', config: { showZenithNadir: true } },
  { desc: "Celestial Equator: the projection of Earth's equator onto the celestial sphere, tilted by your latitude.", config: { showZenithNadir: true, showCelestialEquator: true } },
  { desc: 'Celestial Poles: the axis around which the entire sky appears to rotate once every 24 hours.', config: { showZenithNadir: true, showCelestialEquator: true, showCelestialPoles: true } },
  { desc: 'The Meridian: great circle through Zenith and both Poles, with cardinal directions N, S, E, W on the horizon.', config: { showZenithNadir: true, showCelestialEquator: true, showCelestialPoles: true, showMeridian: true, showNESW: true } },
  { desc: 'Horizontal Coordinates: position is defined by Azimuth (angle from North along horizon) and Altitude (angle above horizon).', config: { showStep6: true, showNESW: true } },
  { desc: 'Measurement arcs: Cyan = Azimuth from North. Magenta = Altitude above horizon. Dim arc = altitude circle through the star.', config: { showStep6: true, showNESW: true, showStar: true } },
  { desc: 'Full system: drag the Latitude slider to change observer position. Spin to watch how Az & Alt evolve as Earth rotates.', config: { showZenithNadir: true, showCelestialEquator: true, showCelestialPoles: true, showNESW: true, showStar: true, showPath: true, showMeridian: true } },
]
const equatorialSteps = [
  { desc: 'The Celestial Sphere: observer at the centre with the horizon as the reference plane.', config: { showHorizon: true } },
  { desc: "Zenith & Nadir: the local vertical axis through the observer's position on Earth.", config: { showHorizon: true, showZenith: true } },
  { desc: "Celestial Equator: projection of Earth's equator into space. Unlike the horizon, it never changes with Earth's rotation.", config: { showHorizon: true, showZenith: true, showCelestialEquator: true } },
  { desc: 'Celestial Poles: NCP & SCP mark the rotation axis. Polaris sits near the NCP for northern observers.', config: { showHorizon: true, showZenith: true, showCelestialEquator: true, showCelestialPoles: true } },
  { desc: 'Declination (δ) & Hour Angle (H): Magenta arc = Dec from the equator along the hour circle. Orange = hour circle (Pole → Star → Equator). Yellow = Pole–Zenith meridian reference arc; the angle between the two arcs is the Hour Angle.', config: { showHorizon: true, showZenith: true, showCelestialEquator: true, showCelestialPoles: true, showStar: true, showPath: true, showDecArc: true, showHAarc: true } },
  { desc: "Rotation + Latitude: Dec stays fixed while HA increases continuously as Earth rotates. Change latitude to see the pole's altitude equal the observer's latitude.", config: { showHorizon: true, showZenith: true, showCelestialEquator: true, showCelestialPoles: true, showStar: true, showPath: true, showDecArc: true, showHAarc: true } },
]
const equatorial2Steps = [
  { desc: "The Celestial Equator: the fixed reference plane for Equatorial II coordinates. Unlike the horizon, it is the same for every observer on Earth and never shifts with Earth's rotation.", config: { showEquator: true } },
  { desc: "Celestial Poles: NCP & SCP define the fixed rotation axis. The pole altitude equals the observer's latitude, but RA/Dec themselves are independent of observer location.", config: { showEquator: true, showPoles: true } },
  { desc: "The Ecliptic & Equinoxes: the Sun's apparent annual path (orange dashes), tilted 23.5° from the equator due to Earth's axial tilt. ♈ Vernal Equinox is the zero-point of the RA grid. The Sun ☀ is shown at a fixed position along the ecliptic.", config: { showEquator: true, showPoles: true, showEcliptic: true, showStaticSun: true } },
  { desc: "Right Ascension (α) & Declination (δ): Cyan arc = RA measured eastward from ♈. Magenta arc = Declination from equator to star. Orange dashes = hour circle. The dotted ring shows the star's full diurnal/daily path (circle of constant declination).", config: { showEquator: true, showPoles: true, showEcliptic: true, showStaticSun: true, showStar: true, showStarPath: true } },
  { desc: "Full Motion: the celestial sphere rotates (Earth spinning), the Sun ☀ drifts along the ecliptic (Earth orbiting). The star rides the rotating sphere with fixed RA & Dec displayed. Use the sliders to control speeds.", config: { showEquator: true, showPoles: true, showEcliptic: true, showStar: true, showStarPath: true, showSunMotion: true, rotateSphere: true, sunSpeed: 0.5 } },
]
const eclipticSteps = [
  { desc: "The Celestial Equator: same fixed great circle used in Equatorial II. Shown here as orientation context; ecliptic coordinates use a different reference plane altogether.", config: { showEquator: true } },
  { desc: "Celestial Poles: NCP & SCP mark the equatorial rotation axis (yellow). The ecliptic system has its own distinct pair of poles, perpendicular to the ecliptic plane rather than the equatorial plane.", config: { showEquator: true, showCelPoles: true } },
  { desc: "The Ecliptic & Equinoxes: the Sun's apparent annual path (orange dashes), tilted 23.5° from the equator. The Vernal Equinox ♈ is the zero-point for ecliptic longitude. The Sun ☀ is shown at a fixed position on the ecliptic.", config: { showEquator: true, showCelPoles: true, showEcliptic: true, showStaticSun: true } },
  { desc: "Ecliptic Poles: NEP & SEP (magenta) are perpendicular to the ecliptic plane, displaced 23.5° from the celestial poles. All great circles of ecliptic longitude pass through these two poles. The Sun ☀ sits on the ecliptic.", config: { showEquator: true, showCelPoles: true, showEcliptic: true, showEclPoles: true, showStaticSun: true } },
  { desc: "Ecliptic Longitude (λ) & Latitude (β): Orange dashed arc = great circle of longitude through NEP, the star, and its foot on the ecliptic. Cyan arc = longitude measured eastward along the ecliptic from ♈ to that foot. Magenta arc = latitude from the foot up to the star. The Sun ☀ rides the ecliptic.", config: { showEquator: true, showCelPoles: true, showEcliptic: true, showEclPoles: true, showStar: true, showStaticSun: true } },
  { desc: "Full Motion: the celestial sphere rotates (Earth's daily spin) while the Sun ☀ drifts along the ecliptic (Earth's yearly orbit). Live λ & β arcs track the star as it rotates. Stars keep fixed ecliptic coordinates. Use the sliders to control both speeds.", config: { showEquator: true, showEcliptic: true, showEclPoles: true, showStar: true, showSunMotion: true, rotateSphere: true } },
]

// ─── LEGEND DATA ──────────────────────────────────────────────────────────────
const horizontalLegend  = [{ color:'#ffffff',label:'Horizon'},{color:'#ff6b6b',label:'Zenith',dot:true},{color:'#00ff88',label:'Cel. Equator'},{color:'#ffd700',label:'Pole (NCP)',dot:true},{color:'#ffcc00',label:'Meridian',dot:true},{color:'#00ccff',label:'Azimuth'},{color:'#ff00ff',label:'Altitude'},{color:'#555555',label:'Alt. Circle',dot:true},{color:'#888888',label:'Star Path',dot:true}]
const equatorialLegend  = [{ color:'#ffffff',label:'Horizon'},{color:'#ff6b6b',label:'Zenith',dot:true},{color:'#00ff88',label:'Cel. Equator'},{color:'#ffd700',label:'NCP / SCP',dot:true},{color:'#ff00ff',label:'Declination',dot:true},{color:'#ff6600',label:'Hour Circle',dot:true},{color:'#ffcc00',label:'Pole–Zenith',dot:true},{color:'#888888',label:'Star Path',dot:true}]
const equatorial2Legend = [{ color:'#00ff88',label:'Cel. Equator'},{color:'#ffd700',label:'NCP / SCP',dot:true},{color:'#ff9900',label:'Ecliptic',dot:true},{color:'#ffffff',label:'Vernal Eq. ♈'},{color:'#888888',label:'Autumnal Eq. ♎',dot:true},{color:'#ffe500',label:'Sun ☀',dot:true},{color:'#ff6600',label:'Hour Circle',dot:true},{color:'#00ccff',label:'Right Ascension'},{color:'#c026d3',label:'Declination',dot:true},{color:'#ffe066',label:'Star ★',dot:true},{color:'#443322',label:'Diurnal Path',dot:true}]
const eclipticLegend    = [{ color:'#00ff88',label:'Cel. Equator'},{color:'#ffd700',label:'NCP / SCP',dot:true},{color:'#ff9900',label:'Ecliptic',dot:true},{color:'#ffffff',label:'Vernal Eq. ♈'},{color:'#888888',label:'Autumnal Eq. ♎',dot:true},{color:'#e879f9',label:'NEP / SEP',dot:true},{color:'#ff6600',label:'Lon. Circle',dot:true},{color:'#00ccff',label:'Longitude λ'},{color:'#c026d3',label:'Latitude β',dot:true},{color:'#ffe066',label:'Star ★',dot:true},{color:'#ffe500',label:'Sun ☀',dot:true},{color:'#443322',label:'Diurnal Path',dot:true}]

// ─── MOBILE HOOK ──────────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return isMobile
}

// ─── IN-VIEW HOOK ─────────────────────────────────────────────────────────────
function useInView(ref, rootMargin = '180px') {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return }
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect() } }, { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return inView
}

// ─── STARFIELD LOADING PLACEHOLDER ───────────────────────────────────────────
function StarfieldPlaceholder({ accentColor, isMobile }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W   = canvas.offsetWidth  || 600
    const H   = canvas.offsetHeight || (isMobile ? 320 : 480)
    canvas.width = W; canvas.height = H
    const stars = Array.from({ length: 160 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.4 + 0.3, phase: Math.random() * Math.PI * 2, speed: Math.random() * 0.8 + 0.4 }))
    let angle = 0
    function draw(t) {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#020408'; ctx.fillRect(0, 0, W, H)
      stars.forEach(s => {
        const b = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase))
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180,210,255,${b.toFixed(2)})`; ctx.fill()
      })
      const cx = W / 2, cy = H / 2, rad = Math.min(W, H) * 0.32
      for (let i = 0; i < 48; i++) {
        const a1 = angle + (i / 48) * Math.PI * 2, a2 = angle + ((i + 0.42) / 48) * Math.PI * 2
        ctx.beginPath(); ctx.arc(cx, cy, rad, a1, a2)
        ctx.strokeStyle = `${accentColor}55`; ctx.lineWidth = 1.5; ctx.stroke()
      }
      angle += 0.003
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fillStyle = '#2563eb'; ctx.fill()
      const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.002))
      ctx.beginPath(); ctx.arc(cx, cy, 18 * pulse, 0, Math.PI * 2)
      ctx.strokeStyle = `${accentColor}${Math.round(pulse * 80).toString(16).padStart(2,'0')}`; ctx.lineWidth = 1; ctx.stroke()
      animRef.current = requestAnimationFrame(draw)
    }
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [accentColor, isMobile])

  return <canvas ref={canvasRef} className="w-full h-full block" />
}

// ─── STEP CARD ────────────────────────────────────────────────────────────────
const StepCard = memo(function StepCard({ stepNum, data, systemId, accentColor }) {
  const isEquatorial1 = systemId === 'equatorial1'
  const isEquatorial2 = systemId === 'equatorial2'
  const isEcliptic    = systemId === 'ecliptic'
  const isMobile      = useIsMobile()

  const totalSteps = isEcliptic ? 6 : isEquatorial1 ? 6 : isEquatorial2 ? 5 : 8
  const isLastStep = stepNum === totalSteps

  const [speed,       setSpeed]       = useState(isLastStep ? 0.22 : 0)
  const [latitude,    setLatitude]    = useState(28.6)
  const [sunSpeed,    setSunSpeed]    = useState(0.5)
  const [sphereSpeed, setSphereSpeed] = useState(0.18)

  const controlsRef        = useRef()
  const canvasContainerRef = useRef()
  const canvasReady        = useInView(canvasContainerRef)

  const frameloop = useMemo(() => {
    const cfg = data.config
    if (isLastStep)        return 'always'
    if (cfg.rotateSphere)  return 'always'
    if (cfg.showSunMotion) return 'always'
    if (cfg.showStar && (systemId === 'horizontal' || systemId === 'equatorial1')) return 'always'
    return 'demand'
  }, [data.config, isLastStep, systemId])

  const dynamicConfig = useMemo(() => {
    if (!((isEquatorial2 || isEcliptic) && data.config.rotateSphere)) return data.config
    return { ...data.config, sunSpeed, sphereSpeed }
  }, [data.config, sunSpeed, sphereSpeed, isEquatorial2, isEcliptic])

  const onLatChange    = useCallback(e => setLatitude(parseFloat(e.target.value)), [])
  const onSpeedChange  = useCallback(e => setSpeed(parseFloat(e.target.value)), [])
  const onSunChange    = useCallback(e => setSunSpeed(parseFloat(e.target.value)), [])
  const onSphereChange = useCallback(e => setSphereSpeed(parseFloat(e.target.value)), [])
  const onReset        = useCallback(() => controlsRef.current?.reset(), [])
  const onLat90        = useCallback(() => setLatitude(90), [])
  const onLat0         = useCallback(() => setLatitude(0), [])

  const showDualSliders = (isEquatorial2 || isEcliptic) && data.config.rotateSphere
  const showLatRot      = !isEquatorial2 && !isEcliptic

  // Slider box: static layout classes; dynamic accentColor border/bg via inline style only
  const SliderBox = ({ children }) => (
    <div className={`rounded-xl border border-white/[0.07] p-3 backdrop-blur-sm bg-[rgba(4,8,20,0.88)] ${isMobile ? 'w-full' : 'w-[178px]'}`}>
      {children}
    </div>
  )

  const controlsOverlay = isLastStep && (
    <div className={isMobile
      ? 'flex flex-col gap-2.5 p-3 bg-[rgba(4,8,20,0.95)] border-t border-white/[0.06]'
      : 'absolute bottom-4 right-4 flex flex-col gap-2.5 items-end'
    }>
      {showLatRot && (
        <>
          <SliderBox>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">Latitude</span>
              <span className="font-mono text-xs font-bold text-emerald-300">{latitude.toFixed(1)}°</span>
            </div>
            <input type="range" min="-90" max="90" step="0.5" value={latitude} onChange={onLatChange}
              className="w-full mb-2 accent-emerald-400" />
            <div className="grid grid-cols-2 gap-1">
              {[{ l: '90°', v: 90, fn: onLat90 }, { l: '0°', v: 0, fn: onLat0 }].map(p => (
                <button key={p.v} onClick={p.fn}
                  className={`text-[10px] font-bold font-mono uppercase tracking-wider py-1 rounded-md border-0 cursor-pointer transition-colors ${Math.abs(latitude - p.v) < 0.6 ? 'bg-emerald-500 text-black' : 'bg-[#1a2235] text-slate-500'}`}>
                  {p.l}
                </button>
              ))}
            </div>
          </SliderBox>

          <SliderBox>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300">Rotation</span>
              <span className="font-mono text-xs font-bold text-cyan-200">{speed === 0 ? 'paused' : `${speed.toFixed(2)}×`}</span>
            </div>
            <input type="range" min="0" max="0.8" step="0.01" value={speed} onChange={onSpeedChange}
              className="w-full accent-cyan-400" />
          </SliderBox>
        </>
      )}

      {showDualSliders && (
        <>
          <SliderBox>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isEcliptic ? 'text-fuchsia-400' : 'text-violet-400'}`}>Sphere</span>
              <span className={`font-mono text-xs font-bold ${isEcliptic ? 'text-fuchsia-300' : 'text-violet-300'}`}>{sphereSpeed === 0 ? 'paused' : `${sphereSpeed.toFixed(2)}×`}</span>
            </div>
            <input type="range" min="0" max="0.6" step="0.01" value={sphereSpeed} onChange={onSphereChange}
              className={`w-full mb-1 ${isEcliptic ? 'accent-fuchsia-400' : 'accent-violet-400'}`} />
            <div className={`text-[9px] font-mono ${isEcliptic ? 'text-[#4a2060]' : 'text-[#4a3a6a]'}`}>★ star / diurnal/daily rotation</div>
          </SliderBox>

          <SliderBox>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">Sun Speed</span>
              <span className="font-mono text-xs font-bold text-amber-200">{sunSpeed === 0 ? 'paused' : `${sunSpeed.toFixed(2)}×`}</span>
            </div>
            <input type="range" min="0" max="2" step="0.05" value={sunSpeed} onChange={onSunChange}
              className="w-full mb-1 accent-amber-400" />
            <div className="text-[9px] font-mono text-[#4a3a20]">☀ ecliptic drift</div>
          </SliderBox>
        </>
      )}

      <div className={isMobile ? 'flex justify-center' : ''}>
        <button onClick={onReset}
          className="px-5 py-1.5 bg-white text-black border-0 rounded-full font-extrabold text-[11px] font-mono uppercase tracking-widest cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          RESET VIEW
        </button>
      </div>
    </div>
  )

  const resetBtnOnly = !isLastStep && (
    <div className="absolute bottom-3 right-3">
      <button onClick={onReset}
        className="px-5 py-1.5 bg-white text-black border-0 rounded-full font-extrabold text-[11px] font-mono uppercase tracking-widest cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
        RESET VIEW
      </button>
    </div>
  )

  return (
    <div className="bg-[rgba(8,12,28,0.92)] border border-white/[0.07] rounded-[14px] overflow-hidden mb-7 shadow-[0_12px_48px_rgba(0,0,0,0.7)]">
      {/* Header */}
      <div className={`flex items-center gap-3 bg-white/[0.025] border-b border-white/[0.05] ${isMobile ? 'px-3.5 py-3' : 'px-5 py-3.5'}`}>
        {/* Step number badge — dynamic accentColor via inline style */}
        <div
          className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[11px] md:text-[13px] font-extrabold font-mono shrink-0"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}55`, color: accentColor }}
        >
          {String(stepNum).padStart(2, '0')}
        </div>
        <p className={`m-0 leading-relaxed text-[#b8c8e0] font-normal tracking-[0.01em] ${isMobile ? 'text-xs' : 'text-[13.5px]'}`}>
          {data.desc}
        </p>
      </div>

      {/* Canvas */}
      <div ref={canvasContainerRef} className={`relative bg-[#020408] ${isMobile ? 'h-[320px]' : 'h-[480px]'}`}>
        {canvasReady ? (
          <Canvas
            camera={{ position: [1.8, 1.2, 1.8], fov: 40 }}
            frameloop={frameloop}
            dpr={isMobile ? [1, 1.5] : [1, 2]}
            gl={{ antialias: !isMobile, powerPreference: 'high-performance', preserveDrawingBuffer: false }}
            performance={{ min: 0.5 }}
          >
            <color attach="background" args={['#020408']} />
            <ambientLight intensity={0.6} />
            <pointLight position={[5, 5, 5]} intensity={1} />
            {isEcliptic
              ? <EclipticScene     config={dynamicConfig} sunSpeed={sunSpeed} sphereSpeed={sphereSpeed} />
              : isEquatorial2
              ? <EquatorialIIScene config={dynamicConfig} sunSpeed={sunSpeed} />
              : isEquatorial1
              ? <EquatorialScene   config={data.config}   rotationSpeed={speed} latitude={latitude} />
              : <CelestialScene    config={data.config}   rotationSpeed={speed} latitude={latitude} />
            }
            <OrbitControls ref={controlsRef} makeDefault minDistance={1} maxDistance={4} />
          </Canvas>
        ) : (
          <StarfieldPlaceholder accentColor={accentColor} isMobile={isMobile} />
        )}
        {!isMobile && isLastStep && canvasReady && controlsOverlay}
        {canvasReady && resetBtnOnly}
      </div>

      {/* Mobile controls below canvas */}
      {isMobile && isLastStep && controlsOverlay}
    </div>
  )
})

// ─── LEGEND ITEM ──────────────────────────────────────────────────────────────
const LegendItem = memo(function LegendItem({ color, label, dot }) {
  return (
    <div className="flex items-center gap-3 py-[3px]">
      <div
        className="w-7 h-0.5 shrink-0"
        style={dot
          ? { background: 'transparent', borderBottom: `2px dashed ${color}` }
          : { background: color }
        }
      />
      <span className="text-xs font-medium text-[#7a90b0] tracking-[0.01em]">{label}</span>
    </div>
  )
})

// ─── COORD DEF ────────────────────────────────────────────────────────────────
const CoordDef = memo(function CoordDef({ symbol, name, desc, color }) {
  return (
    <div className="mb-4">
      <div className="flex items-baseline gap-2 mb-0.5">
        <span className="text-xl font-extrabold font-mono leading-none" style={{ color }}>{symbol}</span>
        <span className="text-[13px] font-semibold text-[#7a90b0]">{name}</span>
      </div>
      <div className="text-[11px] text-[#364d66] font-mono tracking-[0.03em] pl-0.5">{desc}</div>
    </div>
  )
})

// ─── NAV BUTTON (shared between mobile drawer + desktop sidebar) ──────────────
function NavButton({ sys, active, onClick }) {
  const on = active === sys.id
  return (
    <button onClick={onClick}
      className="w-full px-3.5 py-3 rounded-[10px] cursor-pointer text-left transition-all"
      style={{ border: on ? `1px solid ${sys.color}44` : '1px solid transparent', background: on ? `${sys.color}0e` : 'transparent' }}
    >
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-[7px] h-[7px] rounded-full shrink-0"
          style={{ background: on ? sys.color : '#1c2c40', boxShadow: on ? `0 0 10px ${sys.color}99` : 'none' }} />
        <span className="text-[13.5px] font-bold tracking-[0.01em]"
          style={{ color: on ? sys.color : '#374e68' }}>{sys.label}</span>
      </div>
      <div className="pl-4 text-[10.5px] font-mono tracking-[0.04em]"
        style={{ color: on ? `${sys.color}77` : '#1e2f42' }}>{sys.sub}</div>
    </button>
  )
}

// ─── LEGEND PANEL (shared between mobile drawer + desktop sidebar) ────────────
function LegendPanel({ active }) {
  return (
    <>
      <div className="flex flex-col gap-1 mb-7">
        {active.legend.map((item, i) => <LegendItem key={i} color={item.color} label={item.label} dot={item.dot} />)}
      </div>
      <div className="pt-4 border-t border-white/[0.04]">
        <div className="text-sm font-bold font-mono uppercase tracking-[0.12em] mb-4" style={{ color: active.color }}>
          {active.coordLabel}
        </div>
        {active.coords.map((c, i) => <CoordDef key={i} symbol={c.symbol} name={c.name} desc={c.desc} color={c.color} />)}
      </div>
    </>
  )
}

// ─── LEGEND DRAWER (mobile) ───────────────────────────────────────────────────
function LegendDrawer({ active, isOpen, onClose, language }) {
  return (
    <>
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />}
      <div className={`fixed right-0 top-0 bottom-0 w-60 bg-[#030611] border-l border-white/[0.07] z-50 px-4 py-6 overflow-y-auto transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-4 pb-3" style={{ borderBottom: `1px solid ${active.color}33` }}>
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] font-bold" style={{ color: active.color }}>{getTranslation(language, 'legend')}</span>
          <button onClick={onClose} className="bg-transparent border-0 text-[#4a6080] cursor-pointer text-[18px] leading-none px-1.5 py-0.5">✕</button>
        </div>
        <LegendPanel active={active} />
      </div>
    </>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const { language } = useLanguage()
  const [showHome, setShowHome] = useState(true)
  const [activeSystemId, setActiveSystemId] = useState('horizontal')
  const [navOpen,        setNavOpen]        = useState(false)
  const [legendOpen,     setLegendOpen]     = useState(false)
  const [languageModalOpen, setLanguageModalOpen] = useState(false)
  const isMobile = useIsMobile()

  // Build SYSTEMS data based on current language
  const SYSTEMS = useMemo(() => {
    const trans = TRANSLATIONS[language]
    const hSteps = trans.horizontalSteps.map(s => ({ ...s, config: {} }))
    const eSteps = trans.equatorialSteps.map(s => ({ ...s, config: {} }))
    const e2Steps = trans.equatorial2Steps.map(s => ({ ...s, config: {} }))
    const eclSteps = trans.eclipticSteps.map(s => ({ ...s, config: {} }))

    // Restore configs from original steps
    horizontalSteps.forEach((orig, i) => { if (hSteps[i]) hSteps[i].config = orig.config })
    equatorialSteps.forEach((orig, i) => { if (eSteps[i]) eSteps[i].config = orig.config })
    equatorial2Steps.forEach((orig, i) => { if (e2Steps[i]) e2Steps[i].config = orig.config })
    eclipticSteps.forEach((orig, i) => { if (eclSteps[i]) eclSteps[i].config = orig.config })

    // Build coords with translated names and colors
    const horCoords = trans.coordLabels.horizontal.coords.map((c, i) => ({ ...c, color: ['#00ccff', '#ff00ff'][i] }))
    const eqCoords = trans.coordLabels.equatorial1.coords.map((c, i) => ({ ...c, color: ['#ff00ff', '#ff6600'][i] }))
    const eq2Coords = trans.coordLabels.equatorial2.coords.map((c, i) => ({ ...c, color: ['#00ccff', '#c026d3'][i] }))
    const eclCoords = trans.coordLabels.ecliptic.coords.map((c, i) => ({ ...c, color: ['#00ccff', '#c026d3'][i] }))

    // Build legends with translated labels and colors
    const horLegend = trans.legendItems.horizontal.map((item, i) => ({ ...item, color: horizontalLegend[i].color, dot: horizontalLegend[i].dot }))
    const eqLegend = trans.legendItems.equatorial1.map((item, i) => ({ ...item, color: equatorialLegend[i].color, dot: equatorialLegend[i].dot }))
    const eq2Legend = trans.legendItems.equatorial2.map((item, i) => ({ ...item, color: equatorial2Legend[i].color, dot: equatorial2Legend[i].dot }))
    const eclLegend = trans.legendItems.ecliptic.map((item, i) => ({ ...item, color: eclipticLegend[i].color, dot: eclipticLegend[i].dot }))

    return [
      { id: 'horizontal',   label: trans.systems.horizontal.label,     sub: trans.systems.horizontal.subtitle,            color: '#38bdf8', steps: hSteps,   legend: horLegend,  coordLabel: trans.coordLabels.horizontal.label,   coords: horCoords },
      { id: 'equatorial1',  label: trans.systems.equatorial1.label,   sub: trans.systems.equatorial1.subtitle,      color: '#fb923c', steps: eSteps,   legend: eqLegend,  coordLabel: trans.coordLabels.equatorial1.label,   coords: eqCoords },
      { id: 'equatorial2',  label: trans.systems.equatorial2.label,  sub: trans.systems.equatorial2.subtitle, color: '#a78bfa', steps: e2Steps, legend: eq2Legend, coordLabel: trans.coordLabels.equatorial2.label,  coords: eq2Coords },
      { id: 'ecliptic',     label: trans.systems.ecliptic.label,       sub: trans.systems.ecliptic.subtitle,          color: '#e879f9', steps: eclSteps,    legend: eclLegend,    coordLabel: trans.coordLabels.ecliptic.label,       coords: eclCoords },
    ]
  }, [language])

  const active = useMemo(() => SYSTEMS.find(s => s.id === activeSystemId), [activeSystemId, SYSTEMS])

  const handleSystemChange = useCallback((id) => { setActiveSystemId(id); setNavOpen(false); setShowHome(false) }, [])

  // Show home page
  if (showHome) {
    return <HomePage onSelectSystem={handleSystemChange} onLanguageClick={() => setLanguageModalOpen(true)} languageModalOpen={languageModalOpen} onLanguageModalClose={() => setLanguageModalOpen(false)} />
  }

  // ── MOBILE LAYOUT ──
  if (isMobile) {
    return (
      <>
        <LanguageModal isVisible={languageModalOpen} onClose={() => setLanguageModalOpen(false)} />
        <div className="flex flex-col h-screen bg-[#06091a] text-[#e2e8f0] overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 h-[52px] shrink-0 bg-[#030611] border-b border-white/[0.06]">
          <button onClick={() => setShowHome(true)} className="bg-transparent border-0 text-[#7a90b0] cursor-pointer text-lg p-1 leading-none hover:text-[#38bdf8] transition-colors">⌂</button>
          <div className="text-center">
            <div className="text-[15px] font-bold" style={{ color: active.color }}>{active.label}</div>
            <div className="text-[9px] text-[#253548] font-mono uppercase tracking-[0.06em]">{active.sub}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setLanguageModalOpen(true)} className="bg-transparent border-0 text-[#7a90b0] hover:text-[#a78bfa] cursor-pointer text-base p-1 leading-none transition-colors">⚙️</button>
            <button onClick={() => setLegendOpen(true)} className="bg-transparent border-0 text-[#7a90b0] cursor-pointer text-base p-1 leading-none font-mono">★</button>
          </div>
        </div>

        {/* Main scrollable content */}
        <div className="flex-1 overflow-y-auto px-3 pt-4 pb-20">
          {active.steps.map((step, i) => (
            <StepCard key={`${activeSystemId}-${i}`} stepNum={i + 1} data={step} systemId={activeSystemId} accentColor={active.color} />
          ))}
        </div>

        {/* Bottom tab bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#030611] border-t border-white/[0.07] flex z-30" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {SYSTEMS.map(sys => {
            const on = activeSystemId === sys.id
            return (
              <button key={sys.id} onClick={() => handleSystemChange(sys.id)}
                className="flex-1 py-2.5 pb-2 border-0 cursor-pointer flex flex-col items-center gap-[3px]"
                style={{ background: on ? `${sys.color}0d` : 'transparent', borderTop: `2px solid ${on ? sys.color : 'transparent'}` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: on ? sys.color : '#1c2c40' }} />
                <span className="text-[9px] font-bold font-mono uppercase tracking-[0.04em] text-center leading-tight"
                  style={{ color: on ? sys.color : '#364e68' }}>{sys.label}</span>
              </button>
            )
          })}
        </div>

        {/* Nav drawer */}
        {navOpen && <div onClick={() => setNavOpen(false)} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />}
        <div className={`fixed left-0 top-0 bottom-0 w-[220px] bg-[#030611] border-r border-white/[0.07] z-50 p-2.5 flex flex-col transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="px-2.5 pt-1 pb-5 mb-3.5 border-b border-white/[0.05]">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#263550] mb-1.5 font-black">{getTranslation(language, 'celestialCoords')}</div>
            <div className="text-base font-bold text-[#c8d8ee] leading-tight">{getTranslation(language, 'coordinateSystems')}</div>
          </div>
          <div className="flex flex-col gap-1">
            {SYSTEMS.map(sys => <NavButton key={sys.id} sys={sys} active={activeSystemId} onClick={() => handleSystemChange(sys.id)} />)}
          </div>
        </div>

        <LegendDrawer active={active} isOpen={legendOpen} onClose={() => setLegendOpen(false)} language={language} />
      </div>
      </>
    )
  }

  // ── DESKTOP LAYOUT ──
  return (
    <>
      <LanguageModal isVisible={languageModalOpen} onClose={() => setLanguageModalOpen(false)} />
      <div className="flex h-screen bg-[#06091a] text-[#e2e8f0] overflow-hidden">
        {/* Left nav */}
        <div className="w-[210px] bg-[#030611] border-r border-white/[0.05] flex flex-col shrink-0">
          <button onClick={() => setShowHome(true)} className="px-5 pt-5 pb-3 border-b border-white/[0.05] text-left bg-transparent border-0 cursor-pointer hover:bg-white/[0.03] transition-colors">
            <div className="text-sm font-mono uppercase tracking-[0.18em] text-[#5a7088] mb-1 font-black hover:text-[#38bdf8]">← {getTranslation(language, 'home')}</div>
          </button>
          <div className="px-5 py-3 border-b border-white/[0.05]">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#263550] mb-2 font-black">{getTranslation(language, 'celestialCoords')}</div>
            <div className="text-[15px] font-bold text-[#c8d8ee] leading-tight">{getTranslation(language, 'coordinateSystems')}</div>
          </div>
          <div className="p-2.5 flex flex-col gap-1">
            {SYSTEMS.map(sys => <NavButton key={sys.id} sys={sys} active={activeSystemId} onClick={() => setActiveSystemId(sys.id)} />)}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto px-7 py-9 bg-[#07091c]">
          <div className="mb-9 pb-5 border-b border-white/[0.05]">
            <h1 className="m-0 mb-1.5 text-[28px] font-extrabold tracking-[-0.02em]" style={{ color: active.color }}>{active.label}</h1>
            <div className="text-[13px] text-[#253548] font-mono tracking-[0.04em] font-bold">
              {active.steps.length} {getTranslation(language, 'steps')} · {active.sub}
            </div>
          </div>
          {active.steps.map((step, i) => (
            <StepCard key={`${activeSystemId}-${i}`} stepNum={i + 1} data={step} systemId={activeSystemId} accentColor={active.color} />
          ))}
        </div>

        {/* Right legend */}
        <div className="w-48 bg-[#030611] border-l border-white/[0.05] px-4 py-6 shrink-0 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3"
            style={{ borderBottom: `1px solid ${active.color}33` }}>
            <div className="text-sm font-mono uppercase tracking-[0.14em] font-bold"
              style={{ color: active.color }}>
              {getTranslation(language, 'legend')}
            </div>
            <button
              onClick={() => setLanguageModalOpen(true)}
              className="bg-transparent border-0 text-[#7a90b0] hover:text-[#a78bfa] cursor-pointer text-lg transition-colors p-1 leading-none"
              title="Settings"
            >
              ⚙️
            </button>
          </div>
          <div className="flex-1">
            <LegendPanel active={active} />
          </div>
        </div>
      </div>
    </>
  )
}