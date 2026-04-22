import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import * as THREE from 'three'

// ─── FONTS ──────────────────────────────────────────────────────────────────
// This points to a raw .ttf file instead of a CSS stack
const FONT_MONO = "https://fonts.gstatic.com/s/jetbrainsmono/v18/t6q_o04_7S6X_7pS9P_9L9T6Z0_9V18.ttf";
const FONT_SANS = "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf";

// ─── DOTTED LINE ─────────────────────────────────────────────────────────────
// Key fix: compute BufferGeometry synchronously via useMemo — never rely on
// ref + useEffect which fires AFTER first paint leaving an empty geometry.
function DottedLine({ start, end, color, segments = 28 }) {
  const geometry = useMemo(() => {
    const pts = []
    const s = new THREE.Vector3(...start)
    const e = new THREE.Vector3(...end)
    for (let i = 0; i < segments; i++) {
      pts.push(new THREE.Vector3().lerpVectors(s, e, i / segments))
      pts.push(new THREE.Vector3().lerpVectors(s, e, (i + 0.52) / segments))
    }
    const geo = new THREE.BufferGeometry()
    geo.setFromPoints(pts)
    return geo
  }, [start[0], start[1], start[2], end[0], end[1], end[2], segments])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

// ─── DOTTED CIRCLE ───────────────────────────────────────────────────────────
function DottedCircle({ radius, rotation = [0, 0, 0], color, segments = 64 }) {
  const geometry = useMemo(() => {
    const pts = []
    for (let i = 0; i < segments; i++) {
      const a1 = (i / segments) * Math.PI * 2
      const a2 = ((i + 0.42) / segments) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a1) * radius, 0, Math.sin(a1) * radius))
      pts.push(new THREE.Vector3(Math.cos(a2) * radius, 0, Math.sin(a2) * radius))
    }
    const geo = new THREE.BufferGeometry()
    geo.setFromPoints(pts)
    return geo
  }, [radius, segments])

  return (
    <lineSegments geometry={geometry} rotation={rotation}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

// ─── DOTTED ARC (great-circle arc between two world vectors) ─────────────────
function DottedArc({ fromVec, toVec, radius, color, segments = 44 }) {
  const geometry = useMemo(() => {
    const pts = []
    const f = fromVec.clone().normalize()
    const t = toVec.clone().normalize()
    for (let i = 0; i < segments; i++) {
      const p1 = new THREE.Vector3().lerpVectors(f, t, i / segments).normalize().multiplyScalar(radius)
      const p2 = new THREE.Vector3().lerpVectors(f, t, (i + 0.46) / segments).normalize().multiplyScalar(radius)
      pts.push(p1, p2)
    }
    const geo = new THREE.BufferGeometry()
    geo.setFromPoints(pts)
    return geo
  }, [fromVec.x, fromVec.y, fromVec.z, toVec.x, toVec.y, toVec.z, radius, segments])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

// ─── DECLINATION ARC ─────────────────────────────────────────────────────────
function DeclinationArc({ radius, starDeclination }) {
  const geometry = useMemo(() => {
    const pts = []
    const segs = 44
    const equatorPt = new THREE.Vector3(0, 0, radius)
    const starPt    = new THREE.Vector3(0, Math.sin(starDeclination) * radius, Math.cos(starDeclination) * radius)
    for (let i = 0; i < segs; i++) {
      const p1 = new THREE.Vector3().lerpVectors(equatorPt, starPt, i / segs).normalize().multiplyScalar(radius)
      const p2 = new THREE.Vector3().lerpVectors(equatorPt, starPt, (i + 0.46) / segs).normalize().multiplyScalar(radius)
      pts.push(p1, p2)
    }
    const geo = new THREE.BufferGeometry()
    geo.setFromPoints(pts)
    return geo
  }, [radius, starDeclination])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#ff00ff" />
    </lineSegments>
  )
}

// ─── HORIZONTAL COORDINATE SCENE ─────────────────────────────────────────────
function CelestialScene({ config, rotationSpeed = 0, latitude = 28.6 }) {
  const R = 0.8
  const equatorialGroup = useRef()
  const starRef         = useRef()
  const guideArcGeoRef  = useRef()

  const [starCoords, setStarCoords] = useState(null)
  const tilt            = (latitude * Math.PI) / 180
  const starDeclination = 0.439
  const starInitialHA   = 1.318

  const horizonPts = useMemo(() => Array.from({ length: 65 }, (_, i) => [
    Math.cos((i / 64) * Math.PI * 2) * R, 0, Math.sin((i / 64) * Math.PI * 2) * R,
  ]), [])

  const equatorPts = useMemo(() => Array.from({ length: 65 }, (_, i) => [
    Math.cos((i / 64) * Math.PI * 2) * R, 0, Math.sin((i / 64) * Math.PI * 2) * R,
  ]), [])

  useFrame((_, delta) => {
    if (equatorialGroup.current && rotationSpeed > 0) {
      equatorialGroup.current.rotation.y += delta * rotationSpeed
    }
    if (starRef.current) {
      const wp = new THREE.Vector3()
      starRef.current.getWorldPosition(wp)
      const alt = Math.asin(THREE.MathUtils.clamp(wp.y / R, -1, 1))
      let az = Math.atan2(wp.x, wp.z)
      if (az < 0) az += Math.PI * 2
      const hProj = new THREE.Vector3(wp.x, 0, wp.z).normalize().multiplyScalar(R)
      setStarCoords({ az: (az * 180/Math.PI).toFixed(1), alt: (alt * 180/Math.PI).toFixed(1), pos: wp.clone(), horizonProj: hProj })
      if (guideArcGeoRef.current) {
        const zenith = new THREE.Vector3(0, 1, 0)
        const hNorm  = hProj.clone().normalize()
        const pts = []
        for (let i = 0; i < 44; i++) {
          pts.push(new THREE.Vector3().lerpVectors(zenith, hNorm, i/44).normalize().multiplyScalar(R))
          pts.push(new THREE.Vector3().lerpVectors(zenith, hNorm, (i+0.46)/44).normalize().multiplyScalar(R))
        }
        guideArcGeoRef.current.setFromPoints(pts)
      }
    }
  })

  const altArcPts = useMemo(() => {
    if (!starCoords?.pos) return null
    return Array.from({ length: 24 }, (_, i) => {
      const p = new THREE.Vector3().lerpVectors(starCoords.horizonProj, starCoords.pos, i/23).normalize().multiplyScalar(R)
      return [p.x, p.y, p.z]
    })
  }, [starCoords?.pos?.x, starCoords?.pos?.y, starCoords?.pos?.z])

  const azArcPts = useMemo(() => {
    if (!starCoords?.horizonProj) return null
    const north = new THREE.Vector3(0, 0, R)
    return Array.from({ length: 24 }, (_, i) => {
      const p = new THREE.Vector3().lerpVectors(north, starCoords.horizonProj, i/23).normalize().multiplyScalar(R)
      return [p.x, p.y, p.z]
    })
  }, [starCoords?.horizonProj?.x, starCoords?.horizonProj?.z])

  return (
    <group>
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshPhongMaterial color="#4488ff" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

      <group>
        <Line points={horizonPts} color="white" lineWidth={1} />
        {(config.showZenithNadir || config.showStep6) && (
          <>
            <DottedLine start={[0, R, 0]} end={[0, -R, 0]} color="#ff6b6b" />
            <Text position={[0, R+0.11, 0]} fontSize={0.055} color="#ff6b6b" outlineWidth={0.005} outlineColor="#000">ZENITH</Text>
          </>
        )}
        {config.showMeridian && <DottedCircle radius={R} rotation={[0, 0, Math.PI/2]} color="#ffcc00" />}
        {(config.showNESW || config.showStep6) && (
          <>
            <Text position={[0, 0.05, R+0.09]}  fontSize={0.065} color="white" outlineWidth={0.006} outlineColor="#000">N</Text>
            <Text position={[0, 0.05, -R-0.09]} fontSize={0.065} color="white" outlineWidth={0.006} outlineColor="#000">S</Text>
            <Text position={[R+0.09, 0.05, 0]}  fontSize={0.065} color="white" outlineWidth={0.006} outlineColor="#000">W</Text>
            <Text position={[-R-0.09, 0.05, 0]} fontSize={0.065} color="white" outlineWidth={0.006} outlineColor="#000">E</Text>
          </>
        )}
      </group>

      <group rotation={[tilt, 0, 0]}>
        <group ref={equatorialGroup}>
          {config.showCelestialEquator && <Line points={equatorPts} color="#00ff88" lineWidth={1.5} />}
          {config.showCelestialPoles && (
            <>
              <DottedLine start={[0, R, 0]} end={[0, -R, 0]} color="#ffd700" />
              <Text position={[0, R+0.11, 0]} fontSize={0.055} color="#ffd700" outlineWidth={0.005} outlineColor="#000">NCP</Text>
            </>
          )}
          {config.showPath && (
            <group position={[0, Math.sin(starDeclination)*R, 0]}>
              <DottedCircle radius={Math.cos(starDeclination)*R} color="#555" segments={80} />
            </group>
          )}
          {config.showStar && (
            <group rotation={[0, starInitialHA, 0]}>
              <mesh ref={starRef} position={[0, Math.sin(starDeclination)*R, Math.cos(starDeclination)*R]}>
                <sphereGeometry args={[0.026]} />
                <meshBasicMaterial color="#ffe066" />
              </mesh>
            </group>
          )}
        </group>
      </group>

      {config.showStar && starCoords?.pos && (
        <group>
          <lineSegments>
            <bufferGeometry ref={guideArcGeoRef} />
            <lineBasicMaterial color="#444" />
          </lineSegments>
          {altArcPts && <Line points={altArcPts} color="#ff00ff" lineWidth={2.5} />}
          {azArcPts  && <Line points={azArcPts}  color="#00ccff" lineWidth={2.5} />}
          <group position={[starCoords.pos.x*1.2, starCoords.pos.y*1.2, starCoords.pos.z*1.2]}>
            <Text fontSize={0.036} color="#ffe066" anchorX="left" outlineWidth={0.005} outlineColor="#000">
              {`ALT ${starCoords.alt}°\nAZ  ${starCoords.az}°`}
            </Text>
          </group>
          <Line points={[[0,0,0],[starCoords.pos.x,starCoords.pos.y,starCoords.pos.z]]} color="#ff00ff" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
          <Line points={[[0,0,0],[starCoords.horizonProj.x,starCoords.horizonProj.y,starCoords.horizonProj.z]]} color="#00ccff" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
          <Line points={[[0,0,0],[0,0,R]]} color="#004455" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
        </group>
      )}
      <mesh><sphereGeometry args={[0.06]} /><meshStandardMaterial color="#2563eb" /></mesh>
    </group>
  )
}

// ─── EQUATORIAL COORDINATE SCENE ─────────────────────────────────────────────
function EquatorialScene({ config, rotationSpeed = 0, latitude = 28.6 }) {
  const R = 0.8
  const equatorialGroupRef = useRef()
  const starRef            = useRef()
  const [coords,  setCoords]  = useState(null)
  const [haVecs,  setHaVecs]  = useState(null)

  const tilt            = (latitude * Math.PI) / 180
  const starDeclination = 0.439
  const starInitialHA   = 1.318

  const horizonPts = useMemo(() => Array.from({ length: 65 }, (_, i) => [
    Math.cos((i/64)*Math.PI*2)*R, 0, Math.sin((i/64)*Math.PI*2)*R,
  ]), [])
  const equatorPts = useMemo(() => Array.from({ length: 65 }, (_, i) => [
    Math.cos((i/64)*Math.PI*2)*R, 0, Math.sin((i/64)*Math.PI*2)*R,
  ]), [])

  useFrame((_, delta) => {
    if (equatorialGroupRef.current && rotationSpeed > 0) {
      equatorialGroupRef.current.rotation.y += delta * rotationSpeed
    }
    if (starRef.current && config.showStar) {
      const wp = new THREE.Vector3()
      starRef.current.getWorldPosition(wp)
      const ncpW   = new THREE.Vector3(0, Math.cos(tilt)*R, Math.sin(tilt)*R)
      const ncpDir = ncpW.clone().normalize()
      const dec = Math.asin(THREE.MathUtils.clamp(wp.dot(ncpDir)/R, -1, 1))
      const starOnEq   = wp.clone().sub(ncpDir.clone().multiplyScalar(wp.dot(ncpDir)))
      const zenithW    = new THREE.Vector3(0, 1, 0)
      const zenithOnEq = zenithW.clone().sub(ncpDir.clone().multiplyScalar(zenithW.dot(ncpDir)))
      let ha = Math.atan2(starOnEq.clone().cross(zenithOnEq).dot(ncpDir), starOnEq.dot(zenithOnEq))
      if (ha < 0) ha += Math.PI * 2
      const starEqProj = starOnEq.clone().normalize().multiplyScalar(R)
      setCoords({ dec: (dec*180/Math.PI).toFixed(1), ha: (ha*180/Math.PI).toFixed(1), pos: wp.clone() })
      if (config.showHAarc) {
        setHaVecs({ ncpW: ncpW.clone(), starPos: wp.clone(), starEqProj, zenith: zenithW.clone().multiplyScalar(R) })
      }
    }
  })

  return (
    <group>
      <mesh><sphereGeometry args={[R, 64, 64]} /><meshPhongMaterial color="#4488ff" transparent opacity={0.08} side={THREE.DoubleSide} /></mesh>

      {config.showHorizon && <Line points={horizonPts} color="white" lineWidth={1} />}

      {config.showZenith && (
        <>
          <DottedLine start={[0, R, 0]} end={[0, -R, 0]} color="#ff6b6b" />
          <Text position={[0, R+0.11, 0]} fontSize={0.055} color="#ff6b6b" outlineWidth={0.005} outlineColor="#000">ZENITH</Text>
        </>
      )}

      <group rotation={[tilt, 0, 0]}>
        <group ref={equatorialGroupRef}>
          {config.showCelestialEquator && <Line points={equatorPts} color="#00ff88" lineWidth={1.5} />}
          {config.showCelestialPoles && (
            <>
              <DottedLine start={[0, R, 0]} end={[0, -R, 0]} color="#ffd700" />
              <Text position={[0, R+0.11, 0]}  fontSize={0.055} color="#ffd700" outlineWidth={0.005} outlineColor="#000">NCP</Text>
              <Text position={[0, -R-0.13, 0]} fontSize={0.055} color="#ffd700" outlineWidth={0.005} outlineColor="#000">SCP</Text>
            </>
          )}
          {config.showPath && (
            <group position={[0, Math.sin(starDeclination)*R, 0]}>
              <DottedCircle radius={Math.cos(starDeclination)*R} color="#555" segments={80} />
            </group>
          )}
          {config.showStar && (
            <group rotation={[0, starInitialHA, 0]}>
              <mesh ref={starRef} position={[0, Math.sin(starDeclination)*R, Math.cos(starDeclination)*R]}>
                <sphereGeometry args={[0.026]} />
                <meshBasicMaterial color="#ffe066" />
              </mesh>
              {config.showDecArc && <DeclinationArc radius={R} starDeclination={starDeclination} />}
            </group>
          )}
        </group>
      </group>

      {config.showHAarc && config.showStar && haVecs && (
        <>
          <DottedArc fromVec={haVecs.ncpW}    toVec={haVecs.zenith}     radius={R} color="#ffcc00" segments={44} />
          <DottedArc fromVec={haVecs.ncpW}    toVec={haVecs.starPos}    radius={R} color="#ff6600" segments={44} />
          <DottedArc fromVec={haVecs.starPos} toVec={haVecs.starEqProj} radius={R} color="#ff6600" segments={28} />
        </>
      )}

      {config.showStar && coords?.pos && (
        <group position={[coords.pos.x*1.22, coords.pos.y*1.22, coords.pos.z*1.22]}>
          <Text fontSize={0.036} color="#ffe066" anchorX="left" outlineWidth={0.005} outlineColor="#000">
            {`DEC ${coords.dec}°\nHA  ${coords.ha}°`}
          </Text>
        </group>
      )}
      <mesh><sphereGeometry args={[0.06]} /><meshStandardMaterial color="#2563eb" /></mesh>
    </group>
  )
}

// ─── STEP DATA ────────────────────────────────────────────────────────────────
const horizontalSteps = [
  { desc: 'The Horizon — the base plane for all local observations. Every coordinate is measured relative to this circle.', config: {} },
  { desc: 'Zenith & Nadir — the vertical axis. Zenith is the point directly overhead; Nadir is directly below.', config: { showZenithNadir: true } },
  { desc: "Celestial Equator — the projection of Earth's equator onto the celestial sphere, tilted by your latitude.", config: { showZenithNadir: true, showCelestialEquator: true } },
  { desc: 'Celestial Poles — the axis around which the entire sky appears to rotate once every 24 hours.', config: { showZenithNadir: true, showCelestialEquator: true, showCelestialPoles: true } },
  { desc: 'The Meridian — great circle through Zenith and both Poles, with cardinal directions N, S, E, W on the horizon.', config: { showZenithNadir: true, showCelestialEquator: true, showCelestialPoles: true, showMeridian: true, showNESW: true } },
  { desc: 'Horizontal Coordinates — position is defined by Azimuth (angle from North along horizon) and Altitude (angle above horizon).', config: { showStep6: true, showNESW: true } },
  { desc: 'Measurement arcs — Cyan = Azimuth from North. Magenta = Altitude above horizon. Dim arc = altitude circle through the star.', config: { showStep6: true, showNESW: true, showStar: true } },
  { desc: 'Full system — drag the Latitude slider to change observer position. Spin to watch how Az & Alt evolve as Earth rotates.', config: { showZenithNadir: true, showCelestialEquator: true, showCelestialPoles: true, showNESW: true, showStar: true, showPath: true, showMeridian: true } },
]

const equatorialSteps = [
  { desc: 'The Celestial Sphere — observer at the centre with the horizon as the reference plane.', config: { showHorizon: true } },
  { desc: "Zenith & Nadir — the local vertical axis through the observer's position on Earth.", config: { showHorizon: true, showZenith: true } },
  { desc: "Celestial Equator — projection of Earth's equator into space. Unlike the horizon, it never changes with Earth's rotation.", config: { showHorizon: true, showZenith: true, showCelestialEquator: true } },
  { desc: 'Celestial Poles — NCP & SCP mark the rotation axis. Polaris sits near the NCP for northern observers.', config: { showHorizon: true, showZenith: true, showCelestialEquator: true, showCelestialPoles: true } },
  { desc: 'Declination (δ) & Hour Angle (H) — Magenta arc = Dec from the equator along the hour circle. Orange = hour circle (Pole → Star → Equator). Yellow = Pole–Zenith meridian reference arc and angle between these 2 arcs is hour angle', config: { showHorizon: true, showZenith: true, showCelestialEquator: true, showCelestialPoles: true, showStar: true, showPath: true, showDecArc: true, showHAarc: true } },
  { desc: "Rotation + Latitude — Dec stays fixed while HA increases continuously as Earth rotates. Change latitude to see the pole's altitude equal the observer's latitude.", config: { showHorizon: true, showZenith: true, showCelestialEquator: true, showCelestialPoles: true, showStar: true, showPath: true, showDecArc: true, showHAarc: true } },
]

const horizontalLegend = [
  { color: '#ffffff', label: 'Horizon' },
  { color: '#ff6b6b', label: 'Zenith', dot: true },
  { color: '#00ff88', label: 'Cel. Equator' },
  { color: '#ffd700', label: 'Pole (NCP)', dot: true },
  { color: '#ffcc00', label: 'Meridian', dot: true },
  { color: '#00ccff', label: 'Azimuth' },
  { color: '#ff00ff', label: 'Altitude' },
  { color: '#555555', label: 'Alt. Circle', dot: true },
  { color: '#888888', label: 'Star Path', dot: true },
]

const equatorialLegend = [
  { color: '#ffffff', label: 'Horizon' },
  { color: '#ff6b6b', label: 'Zenith', dot: true },
  { color: '#00ff88', label: 'Cel. Equator' },
  { color: '#ffd700', label: 'NCP / SCP', dot: true },
  { color: '#ff00ff', label: 'Declination', dot: true },
  { color: '#ff6600', label: 'Hour Circle', dot: true },
  { color: '#ffcc00', label: 'Pole–Zenith', dot: true },
  { color: '#888888', label: 'Star Path', dot: true },
]

// ─── SLIDER STYLES ────────────────────────────────────────────────────────────
const sliderBox = { background: 'rgba(4,8,20,0.88)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', width: '178px' }
const sliderRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }
const sliderLabel = c => ({ fontSize: '10px', color: c, fontWeight: 800, fontFamily: FONT_MONO, textTransform: 'uppercase', letterSpacing: '0.1em' })
const sliderVal   = c => ({ fontFamily: FONT_MONO, fontSize: '12px', color: c, fontWeight: 700 })

// ─── STEP CARD ────────────────────────────────────────────────────────────────
function StepCard({ stepNum, data, isEquatorial, accentColor }) {
  const [speed, setSpeed]       = useState(0)
  const [latitude, setLatitude] = useState(28.6)
  const controlsRef             = useRef()
  const isLastStep = isEquatorial ? stepNum === 6 : stepNum === 8

  return (
    <div style={{ background: 'rgba(8,12,28,0.92)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 12px 48px rgba(0,0,0,0.7)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '8px',
          background: `${accentColor}18`, border: `1px solid ${accentColor}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 800, color: accentColor,
          fontFamily: FONT_MONO, flexShrink: 0,
        }}>{String(stepNum).padStart(2,'0')}</div>
        <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.65', color: '#b8c8e0', fontFamily: FONT_SANS, fontWeight: 400, letterSpacing: '0.01em' }}>
          {data.desc}
        </p>
      </div>

      <div style={{ height: '480px', position: 'relative' }}>
        <Canvas camera={{ position: [1.8, 1.2, 1.8], fov: 40 }}>
          <color attach="background" args={['#020408']} />
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={1} />
          {isEquatorial
            ? <EquatorialScene config={data.config} rotationSpeed={speed} latitude={latitude} />
            : <CelestialScene  config={data.config} rotationSpeed={speed} latitude={latitude} />
          }
          <OrbitControls ref={controlsRef} makeDefault minDistance={1} maxDistance={4} />
        </Canvas>

        <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
          {isLastStep && (
            <>
              <div style={sliderBox}>
                <div style={sliderRow}>
                  <span style={sliderLabel('#34d399')}>Latitude</span>
                  <span style={sliderVal('#6ee7b7')}>{latitude.toFixed(1)}°</span>
                </div>
                <input type="range" min="-90" max="90" step="0.5" value={latitude}
                  onChange={e => setLatitude(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#34d399', marginBottom: '8px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  {[{ l: '90°', v: 90 }, { l: '0°', v: 0 }].map(p => (
                    <button key={p.v} onClick={() => setLatitude(p.v)} style={{
                      fontSize: '10px', fontWeight: 700, fontFamily: FONT_MONO,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      padding: '5px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                      background: Math.abs(latitude - p.v) < 0.6 ? '#10b981' : '#1a2235',
                      color:      Math.abs(latitude - p.v) < 0.6 ? '#000'    : '#64748b',
                    }}>{p.l}</button>
                  ))}
                </div>
              </div>
              <div style={sliderBox}>
                <div style={sliderRow}>
                  <span style={sliderLabel('#67e8f9')}>Rotation</span>
                  <span style={sliderVal('#a5f3fc')}>{speed === 0 ? 'paused' : `${speed.toFixed(2)}×`}</span>
                </div>
                <input type="range" min="0" max="0.8" step="0.01" value={speed}
                  onChange={e => setSpeed(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#22d3ee' }} />
              </div>
            </>
          )}
          <button onClick={() => controlsRef.current?.reset()} style={{
            padding: '7px 20px', background: '#fff', color: '#000', border: 'none',
            borderRadius: '999px', fontWeight: 800, fontSize: '11px', fontFamily: FONT_MONO,
            letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
          }}>RESET VIEW</button>
        </div>
      </div>
    </div>
  )
}

// ─── LEGEND ITEM ──────────────────────────────────────────────────────────────
function LegendItem({ color, label, dot }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '3px 0' }}>
      <div style={{ width: '28px', height: '2px', flexShrink: 0, background: dot ? 'transparent' : color, borderBottom: dot ? `2px dashed ${color}` : 'none' }} />
      <span style={{ fontSize: '12px', fontFamily: FONT_SANS, fontWeight: 500, color: '#7a90b0', letterSpacing: '0.01em' }}>{label}</span>
    </div>
  )
}

function CoordDef({ symbol, name, desc, color }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '3px' }}>
        <span style={{ fontSize: '20px', fontWeight: 800, color, fontFamily: FONT_MONO, lineHeight: 1 }}>{symbol}</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#7a90b0', fontFamily: FONT_SANS }}>{name}</span>
      </div>
      <div style={{ fontSize: '11px', color: '#364d66', fontFamily: FONT_MONO, letterSpacing: '0.03em', paddingLeft: '2px' }}>{desc}</div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeSystem, setActiveSystem] = useState('horizontal')

  const systems = [
    { id: 'horizontal',  label: 'Horizontal',   sub: 'Azimuth · Altitude',          color: '#38bdf8', steps: horizontalSteps, legend: horizontalLegend, isEquatorial: false },
    { id: 'equatorial1', label: 'Equatorial I',  sub: 'Declination · Hour Angle',    color: '#fb923c', steps: equatorialSteps, legend: equatorialLegend, isEquatorial: true  },
  ]

  const active = systems.find(s => s.id === activeSystem)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#06091a', color: '#e2e8f0', overflow: 'hidden', fontFamily: FONT_SANS }}>

      {/* ── LEFT NAV ── */}
      <div style={{ width: '210px', background: '#030611', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '10px', fontFamily: FONT_MONO, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#263550', marginBottom: '8px', fontWeight: 900 }}>
            Celestial Coords
          </div>
          <div style={{ fontSize: '17px', fontFamily: FONT_SANS, fontWeight: 700, color: '#c8d8ee', lineHeight: 1.25 }}>
            Coordinate<br/>Systems
          </div>
        </div>

        <div style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {systems.map(sys => {
            const on = activeSystem === sys.id
            return (
              <button key={sys.id} onClick={() => setActiveSystem(sys.id)} style={{
                padding: '13px 14px', borderRadius: '10px',
                border: on ? `1px solid ${sys.color}44` : '1px solid transparent',
                background: on ? `${sys.color}0e` : 'transparent',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '4px' }}>
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: on ? sys.color : '#1c2c40',
                    boxShadow: on ? `0 0 10px ${sys.color}99` : 'none', flexShrink: 0,
                  }} />
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: on ? sys.color : '#374e68', fontFamily: FONT_SANS, letterSpacing: '0.01em' }}>
                    {sys.label}
                  </span>
                </div>
                <div style={{ fontSize: '10.5px', color: on ? `${sys.color}77` : '#1e2f42', paddingLeft: '16px', fontFamily: FONT_MONO, letterSpacing: '0.04em' }}>
                  {sys.sub}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '36px 28px', background: '#07091c' }}>
        <div style={{ marginBottom: '36px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          
          <h1 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: 800, color: active.color, fontFamily: FONT_SANS, letterSpacing: '-0.02em' }}>
            {active.label}
          </h1>
          <div style={{ fontSize: '13px', color: '#253548', fontFamily: FONT_MONO, letterSpacing: '0.04em', fontWeight: 700 }}>
            {active.steps.length} steps · {active.sub}
          </div>
        </div>

        {active.steps.map((step, i) => (
          <StepCard key={`${activeSystem}-${i}`} stepNum={i+1} data={step} isEquatorial={active.isEquatorial} accentColor={active.color} />
        ))}
      </div>

      {/* ── RIGHT LEGEND ── */}
      <div style={{ width: '192px', background: '#030611', borderLeft: '1px solid rgba(255,255,255,0.05)', padding: '24px 18px', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', fontFamily: FONT_MONO, letterSpacing: '0.14em', textTransform: 'uppercase', color: active.color, fontWeight: 700, marginBottom: '18px', paddingBottom: '12px', borderBottom: `1px solid ${active.color}33` }}>
          Legend
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '28px' }}>
          {active.legend.map((item, i) => (
            <LegendItem key={i} color={item.color} label={item.label} dot={item.dot} />
          ))}
        </div>
        <div style={{ paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, fontFamily: FONT_MONO, letterSpacing: '0.12em', textTransform: 'uppercase', color: active.color, marginBottom: '16px' }}>
            {active.isEquatorial ? 'Equatorial' : 'Horizontal'}
          </div>
          {active.isEquatorial ? (
            <>
              <CoordDef symbol="δ" name="Declination" desc="+90° (NCP) to −90°" color="#ff00ff" />
              <CoordDef symbol="H" name="Hour Angle"  desc="0°–360°, westward"  color="#ff6600" />
            </>
          ) : (
            <>
              <CoordDef symbol="A" name="Azimuth"  desc="0°–360° from North" color="#00ccff" />
              <CoordDef symbol="a" name="Altitude" desc="0° horizon → 90°"  color="#ff00ff" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
