import React, { useRef, useState, useMemo, useCallback, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Line } from '@react-three/drei'
import * as THREE from 'three'
import {
  DEG, R, OBL, FONT_MONO, FONT_SANS,
  STAR_DECLINATION, STAR_INITIAL_HA, STAR_RA_EQ2, STAR_DEC_EQ2, STAR_LAMBDA, STAR_BETA,
  _v1, _v2, makeRingPoints, makeEclipticPoint, RING_PTS
} from '../../constants/3d'
import { DottedLine, DottedCircle, DottedArc, DeclinationArc } from './GeometryPrimitives'

// ─── CELESTIAL / HORIZONTAL SCENE ────────────────────────────────────────────
export const CelestialScene = memo(function CelestialScene({ config, rotationSpeed = 0, latitude = 28.6 }) {
  const equatorialGroup = useRef()
  const starRef         = useRef()
  const guideArcGeoRef  = useRef()
  const _fa = useRef(new THREE.Vector3())
  const _fb = useRef(new THREE.Vector3())
  const frameCount = useRef(0)
  const [starCoords, setStarCoords] = useState(null)
  const tilt = useMemo(() => latitude * DEG, [latitude])

  const altArcPts = useMemo(() => {
    if (!starCoords?.pos || !starCoords?.horizonProj) return null
    return Array.from({ length: 24 }, (_, i) => {
      const p = _v1.clone().lerpVectors(starCoords.horizonProj, starCoords.pos, i / 23).normalize().multiplyScalar(R)
      return [p.x, p.y, p.z]
    })
  }, [starCoords?.pos?.x, starCoords?.pos?.y, starCoords?.pos?.z])

  const azArcPts = useMemo(() => {
    if (!starCoords?.horizonProj) return null
    const north = new THREE.Vector3(0, 0, R)
    return Array.from({ length: 24 }, (_, i) => {
      const p = _v1.clone().lerpVectors(north, starCoords.horizonProj, i / 23).normalize().multiplyScalar(R)
      return [p.x, p.y, p.z]
    })
  }, [starCoords?.horizonProj?.x, starCoords?.horizonProj?.z])

  useFrame((_, delta) => {
    frameCount.current++
    if (equatorialGroup.current && rotationSpeed > 0)
      equatorialGroup.current.rotation.y += delta * rotationSpeed
    if (!starRef.current) return
    const wp    = new THREE.Vector3()
    starRef.current.getWorldPosition(wp)
    const alt   = Math.asin(THREE.MathUtils.clamp(wp.y / R, -1, 1))
    let   az    = Math.atan2(wp.x, wp.z)
    if (az < 0) az += Math.PI * 2
    const hProj = new THREE.Vector3(wp.x, 0, wp.z).normalize().multiplyScalar(R)
    if (frameCount.current % 2 === 0) {
      setStarCoords({ az: (az * 180 / Math.PI).toFixed(1), alt: (alt * 180 / Math.PI).toFixed(1), pos: wp.clone(), horizonProj: hProj.clone() })
    }
    if (guideArcGeoRef.current) {
      const zenith = new THREE.Vector3(0, 1, 0)
      const hNorm  = hProj.clone().normalize()
      const pts    = []
      for (let i = 0; i < 44; i++) {
        pts.push(_fa.current.lerpVectors(zenith, hNorm, i / 44).normalize().multiplyScalar(R).clone())
        pts.push(_fb.current.lerpVectors(zenith, hNorm, (i + 0.46) / 44).normalize().multiplyScalar(R).clone())
      }
      guideArcGeoRef.current.setFromPoints(pts)
    }
  })

  return (
    <group>
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshPhongMaterial color="#4488ff" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <group>
        <Line points={RING_PTS} color="white" lineWidth={1} />
        {(config.showZenithNadir || config.showStep6) && (
          <>
            <DottedLine start={[0, R, 0]} end={[0, -R, 0]} color="#ff6b6b" />
            <Text position={[0, R + 0.11, 0]} fontSize={0.055} color="#ff6b6b" outlineWidth={0.005} outlineColor="#000">ZENITH</Text>
          </>
        )}
        {config.showMeridian && <DottedCircle radius={R} rotation={[0, 0, Math.PI / 2]} color="#ffcc00" />}
        {(config.showNESW || config.showStep6) && (
          <>
            <Text position={[0, 0.05, R + 0.09]}  fontSize={0.065} color="white" outlineWidth={0.006} outlineColor="#000">N</Text>
            <Text position={[0, 0.05, -R - 0.09]} fontSize={0.065} color="white" outlineWidth={0.006} outlineColor="#000">S</Text>
            <Text position={[R + 0.09, 0.05, 0]}  fontSize={0.065} color="white" outlineWidth={0.006} outlineColor="#000">W</Text>
            <Text position={[-R - 0.09, 0.05, 0]} fontSize={0.065} color="white" outlineWidth={0.006} outlineColor="#000">E</Text>
          </>
        )}
      </group>
      <group rotation={[tilt, 0, 0]}>
        <group ref={equatorialGroup}>
          {config.showCelestialEquator && <Line points={RING_PTS} color="#00ff88" lineWidth={1.5} />}
          {config.showCelestialPoles && (
            <>
              <DottedLine start={[0, R, 0]} end={[0, -R, 0]} color="#ffd700" />
              <Text position={[0, R + 0.11, 0]} fontSize={0.055} color="#ffd700" outlineWidth={0.005} outlineColor="#000">NCP</Text>
            </>
          )}
          {config.showPath && (
            <group position={[0, Math.sin(STAR_DECLINATION) * R, 0]}>
              <DottedCircle radius={Math.cos(STAR_DECLINATION) * R} color="#555" segments={80} />
            </group>
          )}
          {config.showStar && (
            <group rotation={[0, STAR_INITIAL_HA, 0]}>
              <mesh ref={starRef} position={[0, Math.sin(STAR_DECLINATION) * R, Math.cos(STAR_DECLINATION) * R]}>
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
          <group position={[starCoords.pos.x * 1.2, starCoords.pos.y * 1.2, starCoords.pos.z * 1.2]}>
            <Text fontSize={0.036} color="#ffe066" anchorX="left" outlineWidth={0.005} outlineColor="#000">
              {`ALT ${starCoords.alt}°\nAZ  ${starCoords.az}°`}
            </Text>
          </group>
          <Line points={[[0,0,0],[starCoords.pos.x, starCoords.pos.y, starCoords.pos.z]]} color="#ff00ff" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
          <Line points={[[0,0,0],[starCoords.horizonProj.x, 0, starCoords.horizonProj.z]]} color="#00ccff" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
          <Line points={[[0,0,0],[0,0,R]]} color="#004455" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
        </group>
      )}
      <mesh>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
    </group>
  )
})

// ─── EQUATORIAL I SCENE ───────────────────────────────────────────────────────
export const EquatorialScene = memo(function EquatorialScene({ config, rotationSpeed = 0, latitude = 28.6 }) {
  const equatorialGroupRef = useRef()
  const starRef            = useRef()
  const frameCount         = useRef(0)
  const [coords, setCoords] = useState(null)
  const [haVecs, setHaVecs] = useState(null)
  const tilt = useMemo(() => latitude * DEG, [latitude])

  useFrame((_, delta) => {
    frameCount.current++
    if (equatorialGroupRef.current && rotationSpeed > 0)
      equatorialGroupRef.current.rotation.y += delta * rotationSpeed
    if (!starRef.current || !config.showStar) return
    if (frameCount.current % 2 !== 0) return
    const wp = new THREE.Vector3()
    starRef.current.getWorldPosition(wp)
    const ncpW   = new THREE.Vector3(0, Math.cos(tilt) * R, Math.sin(tilt) * R)
    const ncpDir = ncpW.clone().normalize()
    const dec = Math.asin(THREE.MathUtils.clamp(wp.dot(ncpDir) / R, -1, 1))
    const starOnEq   = wp.clone().sub(ncpDir.clone().multiplyScalar(wp.dot(ncpDir)))
    const zenithOnEq = new THREE.Vector3(0, 1, 0).sub(ncpDir.clone().multiplyScalar(ncpDir.y))
    let ha = Math.atan2(starOnEq.clone().cross(zenithOnEq).dot(ncpDir), starOnEq.dot(zenithOnEq))
    if (ha < 0) ha += Math.PI * 2
    const starEqProj = starOnEq.clone().normalize().multiplyScalar(R)
    setCoords({ dec: (dec * 180 / Math.PI).toFixed(1), ha: (ha * 180 / Math.PI).toFixed(1), pos: wp.clone() })
    if (config.showHAarc) {
      setHaVecs({ ncpW, starPos: wp.clone(), starEqProj, zenith: new THREE.Vector3(0, R, 0) })
    }
  })

  const decArcPts = useMemo(() => {
    if (!haVecs?.starPos || !haVecs?.starEqProj) return null
    return Array.from({ length: 24 }, (_, i) => {
      const p = _v1.clone().lerpVectors(haVecs.starEqProj, haVecs.starPos, i / 23).normalize().multiplyScalar(R)
      return [p.x, p.y, p.z]
    })
  }, [haVecs?.starPos?.x, haVecs?.starPos?.y, haVecs?.starPos?.z, haVecs?.starEqProj?.x, haVecs?.starEqProj?.y, haVecs?.starEqProj?.z])

  return (
    <group>
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshPhongMaterial color="#4488ff" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      {config.showHorizon && <Line points={RING_PTS} color="white" lineWidth={1} />}
      {config.showZenith && (
        <>
          <DottedLine start={[0, R, 0]} end={[0, -R, 0]} color="#ff6b6b" />
          <Text position={[0, R + 0.11, 0]} fontSize={0.055} color="#ff6b6b" outlineWidth={0.005} outlineColor="#000">ZENITH</Text>
        </>
      )}
      <group rotation={[tilt, 0, 0]}>
        <group ref={equatorialGroupRef}>
          {config.showCelestialEquator && <Line points={RING_PTS} color="#00ff88" lineWidth={1.5} />}
          {config.showCelestialPoles && (
            <>
              <DottedLine start={[0, R, 0]} end={[0, -R, 0]} color="#ffd700" />
              <Text position={[0,  R + 0.11, 0]} fontSize={0.055} color="#ffd700" outlineWidth={0.005} outlineColor="#000">NCP</Text>
              <Text position={[0, -R - 0.13, 0]} fontSize={0.055} color="#ffd700" outlineWidth={0.005} outlineColor="#000">SCP</Text>
            </>
          )}
          {config.showPath && (
            <group position={[0, Math.sin(STAR_DECLINATION) * R, 0]}>
              <DottedCircle radius={Math.cos(STAR_DECLINATION) * R} color="#555" segments={80} />
            </group>
          )}
          {config.showStar && (
            <group rotation={[0, STAR_INITIAL_HA, 0]}>
              <mesh ref={starRef} position={[0, Math.sin(STAR_DECLINATION) * R, Math.cos(STAR_DECLINATION) * R]}>
                <sphereGeometry args={[0.026]} />
                <meshBasicMaterial color="#ffe066" />
              </mesh>
              {config.showDecArc && <DeclinationArc radius={R} starDeclination={STAR_DECLINATION} />}
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
      {config.showStar && coords?.pos && haVecs && (
        <group>
          <Line points={[[0,0,0],[coords.pos.x, coords.pos.y, coords.pos.z]]} color="#ff00ff" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
          <Line points={[[0,0,0],[haVecs.starEqProj.x, haVecs.starEqProj.y, haVecs.starEqProj.z]]} color="#ff6600" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
          {decArcPts && <Line points={decArcPts} color="#ff00ff" lineWidth={2.5} />}
        </group>
      )}
      {config.showStar && coords?.pos && (
        <group position={[coords.pos.x * 1.22, coords.pos.y * 1.22, coords.pos.z * 1.22]}>
          <Text fontSize={0.036} color="#ffe066" anchorX="left" outlineWidth={0.005} outlineColor="#000">
            {`DEC ${coords.dec}°\nHA  ${coords.ha}°`}
          </Text>
        </group>
      )}
      <mesh>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
    </group>
  )
})

// ─── EQUATORIAL II SCENE HELPERS ────────────────────────────────────────────
const EQ2_STAR_POS       = new THREE.Vector3(R * Math.cos(STAR_DEC_EQ2) * Math.cos(STAR_RA_EQ2), R * Math.sin(STAR_DEC_EQ2), R * Math.cos(STAR_DEC_EQ2) * Math.sin(STAR_RA_EQ2))
const EQ2_STAR_FOOT      = new THREE.Vector3(R * Math.cos(STAR_RA_EQ2), 0, R * Math.sin(STAR_RA_EQ2))
const EQ2_STATIC_SUN_POS = makeEclipticPoint(55 * DEG)

const EQ2_RA_ARC_PTS = Array.from({ length: 32 }, (_, i) => { const t = (i / 31) * STAR_RA_EQ2; return [R * Math.cos(t), 0, R * Math.sin(t)] })
const EQ2_HOUR_CIRCLE_PTS = (() => {
  const ncp = new THREE.Vector3(0, R, 0)
  return Array.from({ length: 32 }, (_, i) => { const p = _v1.clone().lerpVectors(ncp, EQ2_STAR_FOOT, i / 31).normalize().multiplyScalar(R); return [p.x, p.y, p.z] })
})()
const EQ2_DEC_ARC_PTS = Array.from({ length: 24 }, (_, i) => { const p = _v1.clone().lerpVectors(EQ2_STAR_FOOT, EQ2_STAR_POS, i / 23).normalize().multiplyScalar(R); return [p.x, p.y, p.z] })
const EQ2_RA_LABEL_POS  = [R * Math.cos(STAR_RA_EQ2 * 0.5) * 0.74, 0.055, R * Math.sin(STAR_RA_EQ2 * 0.5) * 0.74]
const EQ2_DEC_LABEL_POS = [EQ2_STAR_POS.x * 0.79, EQ2_STAR_POS.y * 0.55 + 0.03, EQ2_STAR_POS.z * 0.79]

// ─── EQUATORIAL II SCENE ─────────────────────────────────────────────────────
export const EquatorialIIScene = memo(function EquatorialIIScene({ config, sunSpeed = 0 }) {
  const sunAngle           = useRef(0.96)
  const frameCount         = useRef(0)
  const [sunPos, setSunPos] = useState(() => makeEclipticPoint(0.96))
  const equatorialGroupRef = useRef()
  const sphereRotSpeed = config.rotateSphere ? (config.sphereSpeed ?? 0.18) : 0

  useFrame((_, delta) => {
    frameCount.current++
    if (equatorialGroupRef.current && sphereRotSpeed > 0)
      equatorialGroupRef.current.rotation.y += delta * sphereRotSpeed
    if (config.showSunMotion && frameCount.current % 2 === 0) {
      sunAngle.current = (sunAngle.current + delta * (config.sunSpeed ?? 0.5) * 0.38) % (Math.PI * 2)
      setSunPos(makeEclipticPoint(sunAngle.current))
    }
  })

  return (
    <group>
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshPhongMaterial color="#4488ff" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      {config.showEquator && <Line points={RING_PTS} color="#00ff88" lineWidth={1.5} />}
      {config.showPoles && (
        <>
          <DottedLine start={[0, R, 0]} end={[0, -R, 0]} color="#ffd700" />
          <Text position={[0,  R + 0.11, 0]} fontSize={0.055} color="#ffd700" outlineWidth={0.005} outlineColor="#000">NCP</Text>
          <Text position={[0, -R - 0.13, 0]} fontSize={0.055} color="#ffd700" outlineWidth={0.005} outlineColor="#000">SCP</Text>
        </>
      )}
      {config.showEcliptic && (
        <>
          <DottedCircle radius={R} rotation={[OBL, 0, 0]} color="#ff9900" segments={96} />
          <mesh position={[R, 0, 0]}><sphereGeometry args={[0.014]} /><meshBasicMaterial color="#ffffff" /></mesh>
          <Text position={[R * 1.17, 0.07, 0.01]} fontSize={0.052} color="#ffffff" outlineWidth={0.004} outlineColor="#000">♈</Text>
          <mesh position={[-R, 0, 0]}><sphereGeometry args={[0.011]} /><meshBasicMaterial color="#888888" /></mesh>
          <Text position={[-R * 1.22, 0.07, 0.01]} fontSize={0.050} color="#888888" outlineWidth={0.004} outlineColor="#000">♎</Text>
          <Text position={[0.07, -0.22, R * 0.65]} fontSize={0.036} color="#ff9900" outlineWidth={0.003} outlineColor="#000">23.5°</Text>
        </>
      )}
      {config.showStaticSun && (
        <>
          <mesh position={EQ2_STATIC_SUN_POS.toArray()}><sphereGeometry args={[0.034]} /><meshBasicMaterial color="#ffe500" /></mesh>
          <Text position={[EQ2_STATIC_SUN_POS.x * 1.28, EQ2_STATIC_SUN_POS.y * 1.28, EQ2_STATIC_SUN_POS.z * 1.28]} fontSize={0.038} color="#ffe500" outlineWidth={0.004} outlineColor="#000">☀</Text>
        </>
      )}
      {config.showStar && !config.rotateSphere && (
        <>
          <Line points={EQ2_HOUR_CIRCLE_PTS} color="#ff6600" lineWidth={1.6} dashed dashSize={0.042} gapSize={0.036} />
          <Line points={EQ2_DEC_ARC_PTS}     color="#c026d3" lineWidth={2.8} />
          <Line points={EQ2_RA_ARC_PTS}      color="#00ccff" lineWidth={2.8} />
          <Line points={[[0,0,0], EQ2_STAR_FOOT.toArray()]} color="#1a3a4a" lineWidth={1} dashed dashSize={0.04} gapSize={0.035} />
          <Line points={[[0,0,0], EQ2_STAR_POS.toArray()]}  color="#c026d3" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
          <Line points={[[0,0,0], EQ2_STAR_FOOT.toArray()]} color="#00ccff" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
          <mesh position={EQ2_STAR_POS.toArray()}><sphereGeometry args={[0.020]} /><meshBasicMaterial color="#ffffff" /></mesh>
          <group position={[EQ2_STAR_POS.x * 1.23, EQ2_STAR_POS.y * 1.23, EQ2_STAR_POS.z * 1.23]}>
            <Text fontSize={0.036} color="#ffffff" anchorX="left" outlineWidth={0.005} outlineColor="#000">
              {`α  ${(STAR_RA_EQ2 / DEG).toFixed(1)}°\nδ  ${(STAR_DEC_EQ2 / DEG).toFixed(1)}°`}
            </Text>
          </group>
          <Text position={EQ2_RA_LABEL_POS}  fontSize={0.033} color="#00ccff" outlineWidth={0.003} outlineColor="#000">α</Text>
          <Text position={EQ2_DEC_LABEL_POS} fontSize={0.033} color="#c026d3" outlineWidth={0.003} outlineColor="#000">δ</Text>
          {config.showStarPath && (
            <group position={[0, R * Math.sin(STAR_DEC_EQ2), 0]}>
              <DottedCircle radius={R * Math.cos(STAR_DEC_EQ2)} color="#886644" segments={80} />
            </group>
          )}
        </>
      )}
      {config.rotateSphere && (
        <group ref={equatorialGroupRef}>
          {config.showStar && (
            <>
              <mesh position={EQ2_STAR_POS.toArray()}><sphereGeometry args={[0.020]} /><meshBasicMaterial color="#ffffff" /></mesh>
              {config.showStarPath && (
                <group position={[0, R * Math.sin(STAR_DEC_EQ2), 0]}>
                  <DottedCircle radius={R * Math.cos(STAR_DEC_EQ2)} color="#886644" segments={80} />
                </group>
              )}
            </>
          )}
        </group>
      )}
      {config.rotateSphere && config.showStar && <StarLabel2 equatorialGroupRef={equatorialGroupRef} starLocalPos={EQ2_STAR_POS} showArcs />}
      {config.showSunMotion && sunPos && (
        <>
          <mesh position={sunPos.toArray()}><sphereGeometry args={[0.034]} /><meshBasicMaterial color="#ffe500" /></mesh>
          <Text position={[sunPos.x * 1.28, sunPos.y * 1.28, sunPos.z * 1.28]} fontSize={0.038} color="#ffe500" outlineWidth={0.004} outlineColor="#000">☀</Text>
        </>
      )}
      <mesh><sphereGeometry args={[0.06]} /><meshStandardMaterial color="#2563eb" /></mesh>
    </group>
  )
})

// ─── STAR LABEL (Equatorial II – rotating) ────────────────────────────────────
function StarLabel2({ equatorialGroupRef, starLocalPos, showArcs = false }) {
  const [worldPos, setWorldPos] = useState(null)
  const frameCount = useRef(0)

  useFrame(() => {
    frameCount.current++
    if (!equatorialGroupRef.current || frameCount.current % 2 !== 0) return
    const wp = new THREE.Vector3(starLocalPos.x, starLocalPos.y, starLocalPos.z)
    equatorialGroupRef.current.localToWorld(wp)
    const dec = Math.asin(THREE.MathUtils.clamp(wp.y / R, -1, 1))
    let   ra  = Math.atan2(wp.z, wp.x)
    if (ra < 0) ra += Math.PI * 2
    setWorldPos({ x: wp.x, y: wp.y, z: wp.z, ra, dec })
  })

  const arcs = useMemo(() => {
    if (!worldPos) return null
    const { x, y, z, ra } = worldPos
    const footX = R * Math.cos(ra); const footZ = R * Math.sin(ra)
    const ncpV  = new THREE.Vector3(0, R, 0)
    const footV = new THREE.Vector3(footX, 0, footZ)
    const starV = new THREE.Vector3(x, y, z)
    return {
      hour: Array.from({ length: 32 }, (_, i) => { const p = _v1.clone().lerpVectors(ncpV, footV, i / 31).normalize().multiplyScalar(R); return [p.x, p.y, p.z] }),
      dec:  Array.from({ length: 24 }, (_, i) => { const p = _v1.clone().lerpVectors(footV, starV, i / 23).normalize().multiplyScalar(R); return [p.x, p.y, p.z] }),
      ra:   Array.from({ length: 32 }, (_, i) => { const t = (i / 31) * ra; return [R * Math.cos(t), 0, R * Math.sin(t)] }),
      footX, footZ,
      raMid:  [R * Math.cos(ra * 0.5) * 0.74, 0.055, R * Math.sin(ra * 0.5) * 0.74],
      decMid: [x * 0.79, y * 0.55 + 0.03, z * 0.79],
    }
  }, [worldPos?.x, worldPos?.y, worldPos?.z, worldPos?.ra])

  if (!worldPos || !arcs) return null
  const { x, y, z, ra, dec } = worldPos

  return (
    <>
      {showArcs && arcs && (
        <>
          <Line points={arcs.hour} color="#ff6600" lineWidth={1.6} dashed dashSize={0.042} gapSize={0.036} />
          <Line points={arcs.dec}  color="#c026d3" lineWidth={2.8} />
          <Line points={arcs.ra}   color="#00ccff" lineWidth={2.8} />
          <Line points={[[0,0,0],[arcs.footX,0,arcs.footZ]]} color="#1a3a4a" lineWidth={1} dashed dashSize={0.04} gapSize={0.035} />
          <Line points={[[0,0,0],[x,y,z]]}                  color="#c026d3" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
          <Line points={[[0,0,0],[arcs.footX,0,arcs.footZ]]} color="#00ccff" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
          <Text position={arcs.raMid}  fontSize={0.033} color="#00ccff" outlineWidth={0.003} outlineColor="#000">α</Text>
          <Text position={arcs.decMid} fontSize={0.033} color="#c026d3" outlineWidth={0.003} outlineColor="#000">δ</Text>
        </>
      )}
      <group position={[x * 1.26, y * 1.26 + 0.06, z * 1.26]}>
        <Text fontSize={0.036} color="#ffffff" anchorX="left" outlineWidth={0.005} outlineColor="#000">
          {`α  ${(ra / DEG).toFixed(1)}°\nδ  ${(dec / DEG).toFixed(1)}°`}
        </Text>
      </group>
    </>
  )
}

// ─── ECLIPTIC PRECOMPUTED CONSTANTS ──────────────────────────────────────────
const ECL_NEP_DIR        = new THREE.Vector3(0, Math.cos(OBL), Math.sin(OBL))
const ECL_NEP_POS        = new THREE.Vector3(0,  R * Math.cos(OBL),  R * Math.sin(OBL))
const ECL_SEP_POS        = new THREE.Vector3(0, -R * Math.cos(OBL), -R * Math.sin(OBL))
const ECL_STATIC_SUN_POS = makeEclipticPoint(110 * DEG)
const ECL_FOOT_POS       = makeEclipticPoint(STAR_LAMBDA)
const ECL_STAR_POS       = (() => {
  const foot = ECL_FOOT_POS.clone()
  return foot.clone().normalize().multiplyScalar(R * Math.cos(STAR_BETA)).add(ECL_NEP_DIR.clone().multiplyScalar(R * Math.sin(STAR_BETA)))
})()
const ECL_LON_ARC_PTS    = Array.from({ length: 40 }, (_, i) => { const p = makeEclipticPoint((i / 39) * STAR_LAMBDA); return [p.x, p.y, p.z] })
const ECL_NEP_TO_FOOT_PTS = Array.from({ length: 60 }, (_, i) => { const p = _v1.clone().lerpVectors(ECL_NEP_POS, ECL_FOOT_POS, i / 59).normalize().multiplyScalar(R); return [p.x, p.y, p.z] })
const ECL_LAT_ARC_PTS    = Array.from({ length: 28 }, (_, i) => { const p = _v1.clone().lerpVectors(ECL_FOOT_POS, ECL_STAR_POS, i / 27).normalize().multiplyScalar(R); return [p.x, p.y, p.z] })
const ECL_LON_MID_PT     = makeEclipticPoint(STAR_LAMBDA * 0.5)
const ECL_LAT_MID_PT     = (() => _v1.clone().lerpVectors(ECL_FOOT_POS, ECL_STAR_POS, 0.5).normalize().multiplyScalar(R * 0.82))()
const ECL_DIURNAL_RADIUS = Math.sqrt(ECL_STAR_POS.x ** 2 + ECL_STAR_POS.z ** 2)

// ─── ECLIPTIC SCENE ───────────────────────────────────────────────────────────
export const EclipticScene = memo(function EclipticScene({ config, sunSpeed = 0.5, sphereSpeed = 0.18 }) {
  const sunAngle           = useRef(0.96)
  const frameCount         = useRef(0)
  const [sunPos, setSunPos] = useState(() => makeEclipticPoint(0.96))
  const equatorialGroupRef = useRef()

  useFrame((_, delta) => {
    frameCount.current++
    if (config.showSunMotion && frameCount.current % 2 === 0) {
      sunAngle.current = (sunAngle.current + delta * sunSpeed * 0.38) % (Math.PI * 2)
      setSunPos(makeEclipticPoint(sunAngle.current))
    }
    if (equatorialGroupRef.current && config.rotateSphere)
      equatorialGroupRef.current.rotation.y += delta * sphereSpeed
  })

  return (
    <group>
      <mesh><sphereGeometry args={[R, 64, 64]} /><meshPhongMaterial color="#4488ff" transparent opacity={0.08} side={THREE.DoubleSide} /></mesh>
      {config.showEquator && <Line points={RING_PTS} color="#00ff88" lineWidth={1.5} />}
      {config.showCelPoles && (
        <>
          <DottedLine start={[0, R, 0]} end={[0, -R, 0]} color="#ffd700" />
          <Text position={[0,  R + 0.11, 0]} fontSize={0.055} color="#ffd700" outlineWidth={0.005} outlineColor="#000">NCP</Text>
          <Text position={[0, -R - 0.13, 0]} fontSize={0.055} color="#ffd700" outlineWidth={0.005} outlineColor="#000">SCP</Text>
        </>
      )}
      {config.showEcliptic && (
        <>
          <DottedCircle radius={R} rotation={[OBL, 0, 0]} color="#ff9900" segments={96} />
          <mesh position={[R, 0, 0]}><sphereGeometry args={[0.014]} /><meshBasicMaterial color="#ffffff" /></mesh>
          <Text position={[R * 1.17, 0.07, 0.01]} fontSize={0.052} color="#ffffff" outlineWidth={0.004} outlineColor="#000">♈</Text>
          <mesh position={[-R, 0, 0]}><sphereGeometry args={[0.011]} /><meshBasicMaterial color="#888888" /></mesh>
          <Text position={[-R * 1.22, 0.07, 0.01]} fontSize={0.050} color="#888888" outlineWidth={0.004} outlineColor="#000">♎</Text>
          <Text position={[0.07, -0.22, R * 0.65]} fontSize={0.036} color="#ff9900" outlineWidth={0.003} outlineColor="#000">23.5°</Text>
        </>
      )}
      {config.showEclPoles && (
        <>
          <DottedLine start={ECL_NEP_POS.toArray()} end={ECL_SEP_POS.toArray()} color="#e879f9" segments={32} />
          <mesh position={ECL_NEP_POS.toArray()}><sphereGeometry args={[0.022]} /><meshBasicMaterial color="#e879f9" /></mesh>
          <Text position={[ECL_NEP_POS.x + 0.06, ECL_NEP_POS.y + 0.10, ECL_NEP_POS.z]} fontSize={0.048} color="#e879f9" outlineWidth={0.004} outlineColor="#000">NEP</Text>
          <mesh position={ECL_SEP_POS.toArray()}><sphereGeometry args={[0.022]} /><meshBasicMaterial color="#e879f9" /></mesh>
          <Text position={[ECL_SEP_POS.x + 0.06, ECL_SEP_POS.y - 0.12, ECL_SEP_POS.z]} fontSize={0.048} color="#e879f9" outlineWidth={0.004} outlineColor="#000">SEP</Text>
        </>
      )}
      {config.showStaticSun && (
        <>
          <mesh position={ECL_STATIC_SUN_POS.toArray()}><sphereGeometry args={[0.034]} /><meshBasicMaterial color="#ffe500" /></mesh>
          <Text position={[ECL_STATIC_SUN_POS.x * 1.28, ECL_STATIC_SUN_POS.y * 1.28 + 0.04, ECL_STATIC_SUN_POS.z * 1.28]} fontSize={0.038} color="#ffe500" outlineWidth={0.004} outlineColor="#000">☀</Text>
        </>
      )}
      {config.showStar && !config.rotateSphere && (
        <>
          <Line points={ECL_NEP_TO_FOOT_PTS} color="#ff6600" lineWidth={1.8} dashed dashSize={0.042} gapSize={0.036} />
          <Line points={ECL_LON_ARC_PTS}     color="#00ccff" lineWidth={2.8} />
          <Line points={ECL_LAT_ARC_PTS}     color="#c026d3" lineWidth={2.8} />
          <Line points={[[0,0,0], ECL_FOOT_POS.toArray()]} color="#1a3a4a" lineWidth={1} dashed dashSize={0.04} gapSize={0.035} />
          <Line points={[[0,0,0], ECL_STAR_POS.toArray()]} color="#c026d3" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
          <Line points={[[0,0,0], ECL_FOOT_POS.toArray()]} color="#00ccff" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
          <mesh position={ECL_FOOT_POS.toArray()}><sphereGeometry args={[0.014]} /><meshBasicMaterial color="#aaaaaa" /></mesh>
          <mesh position={ECL_STAR_POS.toArray()}><sphereGeometry args={[0.024]} /><meshBasicMaterial color="#ffe066" /></mesh>
          <group position={[ECL_STAR_POS.x * 1.22, ECL_STAR_POS.y * 1.22, ECL_STAR_POS.z * 1.22]}>
            <Text fontSize={0.036} color="#ffe066" anchorX="left" outlineWidth={0.005} outlineColor="#000">
              {`λ  ${(STAR_LAMBDA / DEG).toFixed(1)}°\nβ  ${(STAR_BETA / DEG).toFixed(1)}°`}
            </Text>
          </group>
          <Text position={[ECL_LON_MID_PT.x * 0.74, ECL_LON_MID_PT.y * 0.74 + 0.07, ECL_LON_MID_PT.z * 0.74]} fontSize={0.036} color="#00ccff" outlineWidth={0.004} outlineColor="#000">λ</Text>
          <Text position={[ECL_LAT_MID_PT.x, ECL_LAT_MID_PT.y + 0.04, ECL_LAT_MID_PT.z]} fontSize={0.036} color="#c026d3" outlineWidth={0.004} outlineColor="#000">β</Text>
        </>
      )}
      {config.rotateSphere && (
        <group ref={equatorialGroupRef}>
          {config.showStar && (
            <>
              <mesh position={ECL_STAR_POS.toArray()}><sphereGeometry args={[0.024]} /><meshBasicMaterial color="#ffe066" /></mesh>
              <group position={[0, ECL_STAR_POS.y, 0]}>
                <DottedCircle radius={ECL_DIURNAL_RADIUS} color="#443322" segments={80} />
              </group>
            </>
          )}
        </group>
      )}
      {config.rotateSphere && config.showStar && <StarLabelEclipticLive equatorialGroupRef={equatorialGroupRef} starLocalPos={ECL_STAR_POS} nepPos={ECL_NEP_POS} />}
      {config.showSunMotion && sunPos && (
        <>
          <mesh position={sunPos.toArray()}><sphereGeometry args={[0.034]} /><meshBasicMaterial color="#ffe500" /></mesh>
          <Text position={[sunPos.x * 1.28, sunPos.y * 1.28, sunPos.z * 1.28]} fontSize={0.038} color="#ffe500" outlineWidth={0.004} outlineColor="#000">☀</Text>
        </>
      )}
      <mesh><sphereGeometry args={[0.06]} /><meshStandardMaterial color="#2563eb" /></mesh>
    </group>
  )
})

// ─── STAR LABEL ECLIPTIC LIVE ─────────────────────────────────────────────────
const ECL_X_AXIS = new THREE.Vector3(1, 0, 0)
const ECL_Z_AXIS = new THREE.Vector3(0, -Math.sin(OBL), Math.cos(OBL))

function StarLabelEclipticLive({ equatorialGroupRef, starLocalPos, nepPos }) {
  const [wp, setWp] = useState({ x: starLocalPos.x, y: starLocalPos.y, z: starLocalPos.z, lambda: STAR_LAMBDA, beta: STAR_BETA })
  const frameCount = useRef(0)

  useFrame(() => {
    frameCount.current++
    if (!equatorialGroupRef.current || frameCount.current % 2 !== 0) return
    const pos = new THREE.Vector3(starLocalPos.x, starLocalPos.y, starLocalPos.z)
    equatorialGroupRef.current.localToWorld(pos)
    const nepDirN = ECL_NEP_DIR.clone().normalize()
    const sinBeta = THREE.MathUtils.clamp(pos.dot(nepDirN) / R, -1, 1)
    const beta    = Math.asin(sinBeta)
    const foot    = pos.clone().sub(nepDirN.clone().multiplyScalar(pos.dot(nepDirN)))
    let lambda    = Math.atan2(foot.dot(ECL_Z_AXIS), foot.dot(ECL_X_AXIS))
    if (lambda < 0) lambda += Math.PI * 2
    setWp({ x: pos.x, y: pos.y, z: pos.z, lambda, beta })
  })

  const arcs = useMemo(() => {
    const { x, y, z, lambda } = wp
    const footPos = makeEclipticPoint(lambda)
    const starV   = new THREE.Vector3(x, y, z)
    const footV   = footPos.clone()
    return {
      lonArc:    Array.from({ length: 40 }, (_, i) => { const p = makeEclipticPoint((i / 39) * lambda); return [p.x, p.y, p.z] }),
      nepToFoot: Array.from({ length: 60 }, (_, i) => { const p = _v1.clone().lerpVectors(nepPos, footV, i / 59).normalize().multiplyScalar(R); return [p.x, p.y, p.z] }),
      latArc:    Array.from({ length: 28 }, (_, i) => { const p = _v1.clone().lerpVectors(footV, starV, i / 27).normalize().multiplyScalar(R); return [p.x, p.y, p.z] }),
      lonMid: makeEclipticPoint(lambda * 0.5),
      latMid: _v1.clone().lerpVectors(footV, starV, 0.5).normalize().multiplyScalar(R * 0.82),
      foot:   footPos,
    }
  }, [wp.x, wp.y, wp.z, wp.lambda])

  const { x, y, z, lambda, beta } = wp
  return (
    <>
      <Line points={arcs.nepToFoot} color="#ff6600" lineWidth={1.8} dashed dashSize={0.042} gapSize={0.036} />
      {arcs.lonArc.length > 1 && <Line points={arcs.lonArc} color="#00ccff" lineWidth={2.8} />}
      <Line points={arcs.latArc}  color="#c026d3" lineWidth={2.8} />
      <Line points={[[0,0,0], arcs.foot.toArray()]} color="#1a3a4a" lineWidth={1} dashed dashSize={0.04} gapSize={0.035} />
      <Line points={[[0,0,0], [x,y,z]]}             color="#c026d3" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
      <Line points={[[0,0,0], arcs.foot.toArray()]} color="#00ccff" lineWidth={1} dashed dashSize={0.05} gapSize={0.04} />
      <mesh position={arcs.foot.toArray()}><sphereGeometry args={[0.014]} /><meshBasicMaterial color="#aaaaaa" /></mesh>
      <Text position={[arcs.lonMid.x * 0.74, arcs.lonMid.y * 0.74 + 0.07, arcs.lonMid.z * 0.74]} fontSize={0.033} color="#00ccff" outlineWidth={0.003} outlineColor="#000">λ</Text>
      <Text position={[arcs.latMid.x, arcs.latMid.y + 0.04, arcs.latMid.z]} fontSize={0.033} color="#c026d3" outlineWidth={0.003} outlineColor="#000">β</Text>
      <group position={[x * 1.26, y * 1.26 + 0.06, z * 1.26]}>
        <Text fontSize={0.036} color="#ffe066" anchorX="left" outlineWidth={0.005} outlineColor="#000">
          {`λ  ${(lambda / DEG).toFixed(1)}°\nβ  ${(beta / DEG).toFixed(1)}°`}
        </Text>
      </group>
    </>
  )
}
