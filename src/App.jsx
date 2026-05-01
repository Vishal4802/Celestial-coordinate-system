import React, {
  useRef, useState, useMemo, useCallback, useEffect, memo
} from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import * as THREE from 'three'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const FONT_MONO = "https://fonts.gstatic.com/s/jetbrainsmono/v18/t6q_o04_7S6X_7pS9P_9L9T6Z0_9V18.ttf"
const FONT_SANS = "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"

const R = 0.8
const OBL = 23.44 * Math.PI / 180
const DEG = Math.PI / 180

const STAR_DECLINATION = 0.439
const STAR_INITIAL_HA  = 1.318
const STAR_RA_EQ2      = 65 * DEG
const STAR_DEC_EQ2     = 22 * DEG
const STAR_LAMBDA      = 65 * DEG
const STAR_BETA        = 30 * DEG

const _v1 = new THREE.Vector3()
const _v2 = new THREE.Vector3()

// ─── GEOMETRY HELPERS ─────────────────────────────────────────────────────────
function buildDottedGeometry(points) {
  const geo = new THREE.BufferGeometry()
  geo.setFromPoints(points)
  return geo
}

// ─── DOTTED LINE ──────────────────────────────────────────────────────────────
const DottedLine = memo(function DottedLine({ start, end, color, segments = 28 }) {
  const geometry = useMemo(() => {
    const s  = new THREE.Vector3(...start)
    const e  = new THREE.Vector3(...end)
    const pts = []
    for (let i = 0; i < segments; i++) {
      pts.push(_v1.clone().lerpVectors(s, e, i / segments))
      pts.push(_v2.clone().lerpVectors(s, e, (i + 0.52) / segments))
    }
    return buildDottedGeometry(pts)
  }, [start[0], start[1], start[2], end[0], end[1], end[2], segments])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
})

// ─── DOTTED CIRCLE ────────────────────────────────────────────────────────────
const DottedCircle = memo(function DottedCircle({
  radius, rotation = [0, 0, 0], color, segments = 64
}) {
  const geometry = useMemo(() => {
    const pts = []
    const step = Math.PI * 2 / segments
    for (let i = 0; i < segments; i++) {
      const a1 = i * step
      const a2 = (i + 0.42) * step
      pts.push(new THREE.Vector3(Math.cos(a1) * radius, 0, Math.sin(a1) * radius))
      pts.push(new THREE.Vector3(Math.cos(a2) * radius, 0, Math.sin(a2) * radius))
    }
    return buildDottedGeometry(pts)
  }, [radius, segments])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <lineSegments geometry={geometry} rotation={rotation}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
})

// ─── DOTTED ARC ───────────────────────────────────────────────────────────────
const DottedArc = memo(function DottedArc({
  fromVec, toVec, radius, color, segments = 44
}) {
  const geometry = useMemo(() => {
    const f   = fromVec.clone().normalize()
    const t   = toVec.clone().normalize()
    const pts = []
    for (let i = 0; i < segments; i++) {
      pts.push(_v1.clone().lerpVectors(f, t, i / segments).normalize().multiplyScalar(radius))
      pts.push(_v2.clone().lerpVectors(f, t, (i + 0.46) / segments).normalize().multiplyScalar(radius))
    }
    return buildDottedGeometry(pts)
  }, [fromVec.x, fromVec.y, fromVec.z, toVec.x, toVec.y, toVec.z, radius, segments])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
})

// ─── DECLINATION ARC ─────────────────────────────────────────────────────────
const DeclinationArc = memo(function DeclinationArc({ radius, starDeclination }) {
  const geometry = useMemo(() => {
    const segs     = 44
    const equatorPt = new THREE.Vector3(0, 0, radius)
    const starPt    = new THREE.Vector3(
      0,
      Math.sin(starDeclination) * radius,
      Math.cos(starDeclination) * radius
    )
    const pts = []
    for (let i = 0; i < segs; i++) {
      pts.push(_v1.clone().lerpVectors(equatorPt, starPt, i / segs).normalize().multiplyScalar(radius))
      pts.push(_v2.clone().lerpVectors(equatorPt, starPt, (i + 0.46) / segs).normalize().multiplyScalar(radius))
    }
    return buildDottedGeometry(pts)
  }, [radius, starDeclination])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#ff00ff" />
    </lineSegments>
  )
})

function makeRingPoints(count = 65) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / (count - 1)) * Math.PI * 2
    return [Math.cos(a) * R, 0, Math.sin(a) * R]
  })
}
const RING_PTS = makeRingPoints()

// ─── CELESTIAL / HORIZONTAL SCENE ────────────────────────────────────────────
function CelestialScene({ config, rotationSpeed = 0, latitude = 28.6 }) {
  const equatorialGroup = useRef()
  const starRef         = useRef()
  const guideArcGeoRef  = useRef()

  const [starCoords, setStarCoords] = useState(null)

  const tilt = useMemo(() => latitude * DEG, [latitude])

  const altArcPts = useMemo(() => {
    if (!starCoords?.pos || !starCoords?.horizonProj) return null
    return Array.from({ length: 24 }, (_, i) => {
      const p = _v1.clone().lerpVectors(starCoords.horizonProj, starCoords.pos, i / 23)
        .normalize().multiplyScalar(R)
      return [p.x, p.y, p.z]
    })
  }, [starCoords?.pos?.x, starCoords?.pos?.y, starCoords?.pos?.z])

  const azArcPts = useMemo(() => {
    if (!starCoords?.horizonProj) return null
    const north = new THREE.Vector3(0, 0, R)
    return Array.from({ length: 24 }, (_, i) => {
      const p = _v1.clone().lerpVectors(north, starCoords.horizonProj, i / 23)
        .normalize().multiplyScalar(R)
      return [p.x, p.y, p.z]
    })
  }, [starCoords?.horizonProj?.x, starCoords?.horizonProj?.z])

  useFrame((_, delta) => {
    if (equatorialGroup.current && rotationSpeed > 0)
      equatorialGroup.current.rotation.y += delta * rotationSpeed

    if (starRef.current) {
      const wp = new THREE.Vector3()
      starRef.current.getWorldPosition(wp)

      const alt    = Math.asin(THREE.MathUtils.clamp(wp.y / R, -1, 1))
      let   az     = Math.atan2(wp.x, wp.z)
      if (az < 0) az += Math.PI * 2

      const hProj = new THREE.Vector3(wp.x, 0, wp.z).normalize().multiplyScalar(R)

      setStarCoords({
        az:          (az  * 180 / Math.PI).toFixed(1),
        alt:         (alt * 180 / Math.PI).toFixed(1),
        pos:         wp.clone(),
        horizonProj: hProj,
      })

      if (guideArcGeoRef.current) {
        const zenith = new THREE.Vector3(0, 1, 0)
        const hNorm  = hProj.clone().normalize()
        const pts    = []
        for (let i = 0; i < 44; i++) {
          pts.push(_v1.clone().lerpVectors(zenith, hNorm, i / 44).normalize().multiplyScalar(R))
          pts.push(_v2.clone().lerpVectors(zenith, hNorm, (i + 0.46) / 44).normalize().multiplyScalar(R))
        }
        guideArcGeoRef.current.setFromPoints(pts)
      }
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

        {config.showMeridian && (
          <DottedCircle radius={R} rotation={[0, 0, Math.PI / 2]} color="#ffcc00" />
        )}

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
          {config.showCelestialEquator && (
            <Line points={RING_PTS} color="#00ff88" lineWidth={1.5} />
          )}
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
              <mesh
                ref={starRef}
                position={[0, Math.sin(STAR_DECLINATION) * R, Math.cos(STAR_DECLINATION) * R]}
              >
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

          <group position={[
            starCoords.pos.x * 1.2,
            starCoords.pos.y * 1.2,
            starCoords.pos.z * 1.2,
          ]}>
            <Text fontSize={0.036} color="#ffe066" anchorX="left" outlineWidth={0.005} outlineColor="#000">
              {`ALT ${starCoords.alt}°\nAZ  ${starCoords.az}°`}
            </Text>
          </group>

          <Line
            points={[[0, 0, 0], [starCoords.pos.x, starCoords.pos.y, starCoords.pos.z]]}
            color="#ff00ff" lineWidth={1} dashed dashSize={0.05} gapSize={0.04}
          />
          <Line
            points={[[0, 0, 0], [starCoords.horizonProj.x, 0, starCoords.horizonProj.z]]}
            color="#00ccff" lineWidth={1} dashed dashSize={0.05} gapSize={0.04}
          />
          <Line
            points={[[0, 0, 0], [0, 0, R]]}
            color="#004455" lineWidth={1} dashed dashSize={0.05} gapSize={0.04}
          />
        </group>
      )}

      <mesh>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
    </group>
  )
}

// ─── EQUATORIAL I SCENE ───────────────────────────────────────────────────────
function EquatorialScene({ config, rotationSpeed = 0, latitude = 28.6 }) {
  const equatorialGroupRef = useRef()
  const starRef            = useRef()
  const [coords, setCoords] = useState(null)
  const [haVecs, setHaVecs] = useState(null)

  const tilt = useMemo(() => latitude * DEG, [latitude])

  useFrame((_, delta) => {
    if (equatorialGroupRef.current && rotationSpeed > 0)
      equatorialGroupRef.current.rotation.y += delta * rotationSpeed

    if (!starRef.current || !config.showStar) return

    const wp = new THREE.Vector3()
    starRef.current.getWorldPosition(wp)

    const ncpW   = new THREE.Vector3(0, Math.cos(tilt) * R, Math.sin(tilt) * R)
    const ncpDir = ncpW.clone().normalize()

    const dec = Math.asin(THREE.MathUtils.clamp(wp.dot(ncpDir) / R, -1, 1))

    const starOnEq   = wp.clone().sub(ncpDir.clone().multiplyScalar(wp.dot(ncpDir)))
    const zenithOnEq = new THREE.Vector3(0, 1, 0)
      .sub(ncpDir.clone().multiplyScalar(ncpDir.y))

    let ha = Math.atan2(
      starOnEq.clone().cross(zenithOnEq).dot(ncpDir),
      starOnEq.dot(zenithOnEq)
    )
    if (ha < 0) ha += Math.PI * 2

    const starEqProj = starOnEq.clone().normalize().multiplyScalar(R)

    setCoords({ dec: (dec * 180 / Math.PI).toFixed(1), ha: (ha * 180 / Math.PI).toFixed(1), pos: wp.clone() })

    if (config.showHAarc)
      setHaVecs({
        ncpW:      ncpW.clone(),
        starPos:   wp.clone(),
        starEqProj,
        zenith:    new THREE.Vector3(0, R, 0),
      })
  })

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
          {config.showCelestialEquator && (
            <Line points={RING_PTS} color="#00ff88" lineWidth={1.5} />
          )}
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
              <mesh
                ref={starRef}
                position={[0, Math.sin(STAR_DECLINATION) * R, Math.cos(STAR_DECLINATION) * R]}
              >
                <sphereGeometry args={[0.026]} />
                <meshBasicMaterial color="#ffe066" />
              </mesh>
              {config.showDecArc && (
                <DeclinationArc radius={R} starDeclination={STAR_DECLINATION} />
              )}
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
}

// ─── ECLIPTIC HELPERS ─────────────────────────────────────────────────────────
function makeEclipticPoint(lambda) {
  return new THREE.Vector3(
    R  * Math.cos(lambda),
    -R * Math.sin(lambda) * Math.sin(OBL),
     R * Math.sin(lambda) * Math.cos(OBL)
  )
}

const EQ2_STAR_POS = new THREE.Vector3(
  R * Math.cos(STAR_DEC_EQ2) * Math.cos(STAR_RA_EQ2),
  R * Math.sin(STAR_DEC_EQ2),
  R * Math.cos(STAR_DEC_EQ2) * Math.sin(STAR_RA_EQ2)
)
const EQ2_STAR_FOOT = new THREE.Vector3(R * Math.cos(STAR_RA_EQ2), 0, R * Math.sin(STAR_RA_EQ2))
const EQ2_STATIC_SUN_POS = makeEclipticPoint(55 * DEG)

const EQ2_RA_ARC_PTS = Array.from({ length: 32 }, (_, i) => {
  const t = (i / 31) * STAR_RA_EQ2
  return [R * Math.cos(t), 0, R * Math.sin(t)]
})
const EQ2_HOUR_CIRCLE_PTS = (() => {
  const ncp = new THREE.Vector3(0, R, 0)
  return Array.from({ length: 32 }, (_, i) => {
    const p = _v1.clone().lerpVectors(ncp, EQ2_STAR_FOOT, i / 31).normalize().multiplyScalar(R)
    return [p.x, p.y, p.z]
  })
})()
const EQ2_DEC_ARC_PTS = Array.from({ length: 24 }, (_, i) => {
  const p = _v1.clone().lerpVectors(EQ2_STAR_FOOT, EQ2_STAR_POS, i / 23).normalize().multiplyScalar(R)
  return [p.x, p.y, p.z]
})
const EQ2_STAR_PATH_PTS = (() => {
  const rH = R * Math.cos(STAR_DEC_EQ2)
  const yH = R * Math.sin(STAR_DEC_EQ2)
  return Array.from({ length: 65 }, (_, i) => {
    const a = (i / 64) * Math.PI * 2
    return [Math.cos(a) * rH, yH, Math.sin(a) * rH]
  })
})()
const EQ2_RA_LABEL_POS  = [R * Math.cos(STAR_RA_EQ2 * 0.5) * 0.74, 0.055, R * Math.sin(STAR_RA_EQ2 * 0.5) * 0.74]
const EQ2_DEC_LABEL_POS = [EQ2_STAR_POS.x * 0.79, EQ2_STAR_POS.y * 0.55 + 0.03, EQ2_STAR_POS.z * 0.79]

// ─── EQUATORIAL II SCENE ─────────────────────────────────────────────────────
function EquatorialIIScene({ config, sunSpeed = 0 }) {
  const sunAngle          = useRef(0.96)
  const [sunPos, setSunPos] = useState(() => makeEclipticPoint(0.96))
  const equatorialGroupRef  = useRef()

  const sphereRotSpeed = config.rotateSphere ? (config.sphereSpeed ?? 0.18) : 0

  useFrame((_, delta) => {
    if (equatorialGroupRef.current && sphereRotSpeed > 0)
      equatorialGroupRef.current.rotation.y += delta * sphereRotSpeed

    if (config.showSunMotion) {
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
          <mesh position={[R, 0, 0]}>
            <sphereGeometry args={[0.014]} /><meshBasicMaterial color="#ffffff" />
          </mesh>
          <Text position={[R * 1.17, 0.07, 0.01]} fontSize={0.052} color="#ffffff" outlineWidth={0.004} outlineColor="#000">♈</Text>
          <mesh position={[-R, 0, 0]}>
            <sphereGeometry args={[0.011]} /><meshBasicMaterial color="#888888" />
          </mesh>
          <Text position={[-R * 1.22, 0.07, 0.01]} fontSize={0.050} color="#888888" outlineWidth={0.004} outlineColor="#000">♎</Text>
          <Text position={[0.07, -0.22, R * 0.65]} fontSize={0.036} color="#ff9900" outlineWidth={0.003} outlineColor="#000">23.5°</Text>
        </>
      )}

      {config.showStaticSun && (
        <>
          <mesh position={EQ2_STATIC_SUN_POS.toArray()}>
            <sphereGeometry args={[0.034]} /><meshBasicMaterial color="#ffe500" />
          </mesh>
          <Text
            position={[EQ2_STATIC_SUN_POS.x * 1.28, EQ2_STATIC_SUN_POS.y * 1.28, EQ2_STATIC_SUN_POS.z * 1.28]}
            fontSize={0.038} color="#ffe500" outlineWidth={0.004} outlineColor="#000"
          >☀</Text>
        </>
      )}

      {config.showStar && !config.rotateSphere && (
        <>
          <Line points={EQ2_HOUR_CIRCLE_PTS} color="#ff6600" lineWidth={1.6} dashed dashSize={0.042} gapSize={0.036} />
          <Line points={EQ2_DEC_ARC_PTS}     color="#c026d3" lineWidth={2.8} />
          <Line points={EQ2_RA_ARC_PTS}      color="#00ccff" lineWidth={2.8} />
          <Line
            points={[[0, 0, 0], EQ2_STAR_FOOT.toArray()]}
            color="#1a3a4a" lineWidth={1} dashed dashSize={0.04} gapSize={0.035}
          />
          <mesh position={EQ2_STAR_POS.toArray()}>
            <sphereGeometry args={[0.020]} /><meshBasicMaterial color="#ffffff" />
          </mesh>
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
              <mesh position={EQ2_STAR_POS.toArray()}>
                <sphereGeometry args={[0.020]} /><meshBasicMaterial color="#ffffff" />
              </mesh>
              {config.showStarPath && (
                <group position={[0, R * Math.sin(STAR_DEC_EQ2), 0]}>
                  <DottedCircle radius={R * Math.cos(STAR_DEC_EQ2)} color="#886644" segments={80} />
                </group>
              )}
            </>
          )}
        </group>
      )}

      {config.rotateSphere && config.showStar && (
        <StarLabel2
          equatorialGroupRef={equatorialGroupRef}
          starLocalPos={EQ2_STAR_POS}
          showArcs
        />
      )}

      {config.showSunMotion && sunPos && (
        <>
          <mesh position={sunPos.toArray()}>
            <sphereGeometry args={[0.034]} /><meshBasicMaterial color="#ffe500" />
          </mesh>
          <Text
            position={[sunPos.x * 1.28, sunPos.y * 1.28, sunPos.z * 1.28]}
            fontSize={0.038} color="#ffe500" outlineWidth={0.004} outlineColor="#000"
          >☀</Text>
        </>
      )}

      <mesh>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
    </group>
  )
}

// ─── STAR LABEL (Equatorial II – rotating) ────────────────────────────────────
function StarLabel2({ equatorialGroupRef, starLocalPos, showArcs = false }) {
  const [worldPos, setWorldPos] = useState(null)

  useFrame(() => {
    if (!equatorialGroupRef.current) return
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
    const footX = R * Math.cos(ra)
    const footZ = R * Math.sin(ra)
    const ncpV  = new THREE.Vector3(0, R, 0)
    const footV = new THREE.Vector3(footX, 0, footZ)
    const starV = new THREE.Vector3(x, y, z)

    return {
      hour: Array.from({ length: 32 }, (_, i) => {
        const p = _v1.clone().lerpVectors(ncpV, footV, i / 31).normalize().multiplyScalar(R)
        return [p.x, p.y, p.z]
      }),
      dec: Array.from({ length: 24 }, (_, i) => {
        const p = _v1.clone().lerpVectors(footV, starV, i / 23).normalize().multiplyScalar(R)
        return [p.x, p.y, p.z]
      }),
      ra: Array.from({ length: 32 }, (_, i) => {
        const t = (i / 31) * ra
        return [R * Math.cos(t), 0, R * Math.sin(t)]
      }),
      footX, footZ,
      raMid:  [R * Math.cos(ra * 0.5) * 0.74, 0.055, R * Math.sin(ra * 0.5) * 0.74],
      decMid: [x * 0.79, y * 0.55 + 0.03, z * 0.79],
    }
  }, [worldPos?.x, worldPos?.y, worldPos?.z, worldPos?.ra])

  if (!worldPos || !arcs) return null

  const { x, y, z, ra, dec } = worldPos
  const scale = 1.26

  return (
    <>
      {showArcs && arcs && (
        <>
          <Line points={arcs.hour} color="#ff6600" lineWidth={1.6} dashed dashSize={0.042} gapSize={0.036} />
          <Line points={arcs.dec}  color="#c026d3" lineWidth={2.8} />
          <Line points={arcs.ra}   color="#00ccff" lineWidth={2.8} />
          <Line
            points={[[0, 0, 0], [arcs.footX, 0, arcs.footZ]]}
            color="#1a3a4a" lineWidth={1} dashed dashSize={0.04} gapSize={0.035}
          />
          <Text position={arcs.raMid}  fontSize={0.033} color="#00ccff" outlineWidth={0.003} outlineColor="#000">α</Text>
          <Text position={arcs.decMid} fontSize={0.033} color="#c026d3" outlineWidth={0.003} outlineColor="#000">δ</Text>
        </>
      )}
      <group position={[x * scale, y * scale + 0.06, z * scale]}>
        <Text fontSize={0.036} color="#ffffff" anchorX="left" outlineWidth={0.005} outlineColor="#000">
          {`α  ${(ra  / DEG).toFixed(1)}°\nδ  ${(dec / DEG).toFixed(1)}°`}
        </Text>
      </group>
    </>
  )
}

// ─── ECLIPTIC PRECOMPUTED CONSTANTS ──────────────────────────────────────────
const ECL_NEP_DIR = new THREE.Vector3(0, Math.cos(OBL), Math.sin(OBL))
const ECL_NEP_POS = new THREE.Vector3(0, R * Math.cos(OBL),  R * Math.sin(OBL))
const ECL_SEP_POS = new THREE.Vector3(0, -R * Math.cos(OBL), -R * Math.sin(OBL))
const ECL_STATIC_SUN_POS = makeEclipticPoint(110 * DEG)

const ECL_FOOT_POS = makeEclipticPoint(STAR_LAMBDA)
const ECL_STAR_POS = (() => {
  const foot = ECL_FOOT_POS.clone()
  return foot.clone().normalize()
    .multiplyScalar(R * Math.cos(STAR_BETA))
    .add(ECL_NEP_DIR.clone().multiplyScalar(R * Math.sin(STAR_BETA)))
})()

const ECL_LON_ARC_PTS = Array.from({ length: 40 }, (_, i) => {
  const p = makeEclipticPoint((i / 39) * STAR_LAMBDA)
  return [p.x, p.y, p.z]
})
const ECL_NEP_TO_FOOT_PTS = Array.from({ length: 60 }, (_, i) => {
  const p = _v1.clone().lerpVectors(ECL_NEP_POS, ECL_FOOT_POS, i / 59).normalize().multiplyScalar(R)
  return [p.x, p.y, p.z]
})
const ECL_LAT_ARC_PTS = Array.from({ length: 28 }, (_, i) => {
  const p = _v1.clone().lerpVectors(ECL_FOOT_POS, ECL_STAR_POS, i / 27).normalize().multiplyScalar(R)
  return [p.x, p.y, p.z]
})
const ECL_LON_MID_PT = makeEclipticPoint(STAR_LAMBDA * 0.5)
const ECL_LAT_MID_PT = (() => {
  return _v1.clone().lerpVectors(ECL_FOOT_POS, ECL_STAR_POS, 0.5).normalize().multiplyScalar(R * 0.82)
})()
const ECL_DIURNAL_RADIUS = Math.sqrt(ECL_STAR_POS.x ** 2 + ECL_STAR_POS.z ** 2)

// ─── ECLIPTIC SCENE ───────────────────────────────────────────────────────────
function EclipticScene({ config, sunSpeed = 0.5, sphereSpeed = 0.18 }) {
  const sunAngle          = useRef(0.96)
  const [sunPos, setSunPos] = useState(() => makeEclipticPoint(0.96))
  const equatorialGroupRef  = useRef()

  useFrame((_, delta) => {
    if (config.showSunMotion) {
      sunAngle.current = (sunAngle.current + delta * sunSpeed * 0.38) % (Math.PI * 2)
      setSunPos(makeEclipticPoint(sunAngle.current))
    }
    if (equatorialGroupRef.current && config.rotateSphere)
      equatorialGroupRef.current.rotation.y += delta * sphereSpeed
  })

  return (
    <group>
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshPhongMaterial color="#4488ff" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

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
          <mesh position={[R, 0, 0]}>
            <sphereGeometry args={[0.014]} /><meshBasicMaterial color="#ffffff" />
          </mesh>
          <Text position={[R * 1.17, 0.07, 0.01]} fontSize={0.052} color="#ffffff" outlineWidth={0.004} outlineColor="#000">♈</Text>
          <mesh position={[-R, 0, 0]}>
            <sphereGeometry args={[0.011]} /><meshBasicMaterial color="#888888" />
          </mesh>
          <Text position={[-R * 1.22, 0.07, 0.01]} fontSize={0.050} color="#888888" outlineWidth={0.004} outlineColor="#000">♎</Text>
          <Text position={[0.07, -0.22, R * 0.65]} fontSize={0.036} color="#ff9900" outlineWidth={0.003} outlineColor="#000">23.5°</Text>
        </>
      )}

      {config.showEclPoles && (
        <>
          <DottedLine
            start={ECL_NEP_POS.toArray()}
            end={ECL_SEP_POS.toArray()}
            color="#e879f9"
            segments={32}
          />
          <mesh position={ECL_NEP_POS.toArray()}>
            <sphereGeometry args={[0.022]} /><meshBasicMaterial color="#e879f9" />
          </mesh>
          <Text
            position={[ECL_NEP_POS.x + 0.06, ECL_NEP_POS.y + 0.10, ECL_NEP_POS.z]}
            fontSize={0.048} color="#e879f9" outlineWidth={0.004} outlineColor="#000"
          >NEP</Text>
          <mesh position={ECL_SEP_POS.toArray()}>
            <sphereGeometry args={[0.022]} /><meshBasicMaterial color="#e879f9" />
          </mesh>
          <Text
            position={[ECL_SEP_POS.x + 0.06, ECL_SEP_POS.y - 0.12, ECL_SEP_POS.z]}
            fontSize={0.048} color="#e879f9" outlineWidth={0.004} outlineColor="#000"
          >SEP</Text>
        </>
      )}

      {config.showStaticSun && (
        <>
          <mesh position={ECL_STATIC_SUN_POS.toArray()}>
            <sphereGeometry args={[0.034]} /><meshBasicMaterial color="#ffe500" />
          </mesh>
          <Text
            position={[ECL_STATIC_SUN_POS.x * 1.28, ECL_STATIC_SUN_POS.y * 1.28 + 0.04, ECL_STATIC_SUN_POS.z * 1.28]}
            fontSize={0.038} color="#ffe500" outlineWidth={0.004} outlineColor="#000"
          >☀</Text>
        </>
      )}

      {config.showStar && !config.rotateSphere && (
        <>
          <Line points={ECL_NEP_TO_FOOT_PTS} color="#ff6600" lineWidth={1.8} dashed dashSize={0.042} gapSize={0.036} />
          <Line points={ECL_LON_ARC_PTS}     color="#00ccff" lineWidth={2.8} />
          <Line points={ECL_LAT_ARC_PTS}     color="#c026d3" lineWidth={2.8} />
          <Line
            points={[[0, 0, 0], ECL_FOOT_POS.toArray()]}
            color="#1a3a4a" lineWidth={1} dashed dashSize={0.04} gapSize={0.035}
          />
          <mesh position={ECL_FOOT_POS.toArray()}>
            <sphereGeometry args={[0.014]} /><meshBasicMaterial color="#aaaaaa" />
          </mesh>
          <mesh position={ECL_STAR_POS.toArray()}>
            <sphereGeometry args={[0.024]} /><meshBasicMaterial color="#ffe066" />
          </mesh>
          <group position={[ECL_STAR_POS.x * 1.22, ECL_STAR_POS.y * 1.22, ECL_STAR_POS.z * 1.22]}>
            <Text fontSize={0.036} color="#ffe066" anchorX="left" outlineWidth={0.005} outlineColor="#000">
              {`λ  ${(STAR_LAMBDA / DEG).toFixed(1)}°\nβ  ${(STAR_BETA / DEG).toFixed(1)}°`}
            </Text>
          </group>
          <Text
            position={[ECL_LON_MID_PT.x * 0.74, ECL_LON_MID_PT.y * 0.74 + 0.07, ECL_LON_MID_PT.z * 0.74]}
            fontSize={0.036} color="#00ccff" outlineWidth={0.004} outlineColor="#000"
          >λ</Text>
          <Text
            position={[ECL_LAT_MID_PT.x, ECL_LAT_MID_PT.y + 0.04, ECL_LAT_MID_PT.z]}
            fontSize={0.036} color="#c026d3" outlineWidth={0.004} outlineColor="#000"
          >β</Text>
        </>
      )}

      {config.rotateSphere && (
        <group ref={equatorialGroupRef}>
          {config.showStar && (
            <>
              <mesh position={ECL_STAR_POS.toArray()}>
                <sphereGeometry args={[0.024]} /><meshBasicMaterial color="#ffe066" />
              </mesh>
              <group position={[0, ECL_STAR_POS.y, 0]}>
                <DottedCircle radius={ECL_DIURNAL_RADIUS} color="#443322" segments={80} />
              </group>
            </>
          )}
        </group>
      )}

      {config.rotateSphere && config.showStar && (
        <StarLabelEclipticLive
          equatorialGroupRef={equatorialGroupRef}
          starLocalPos={ECL_STAR_POS}
          nepPos={ECL_NEP_POS}
        />
      )}

      {config.showSunMotion && sunPos && (
        <>
          <mesh position={sunPos.toArray()}>
            <sphereGeometry args={[0.034]} /><meshBasicMaterial color="#ffe500" />
          </mesh>
          <Text
            position={[sunPos.x * 1.28, sunPos.y * 1.28, sunPos.z * 1.28]}
            fontSize={0.038} color="#ffe500" outlineWidth={0.004} outlineColor="#000"
          >☀</Text>
        </>
      )}

      <mesh>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
    </group>
  )
}

// ─── STAR LABEL ECLIPTIC LIVE ─────────────────────────────────────────────────
const ECL_X_AXIS = new THREE.Vector3(1, 0, 0)
const ECL_Z_AXIS = new THREE.Vector3(0, -Math.sin(OBL), Math.cos(OBL))

function StarLabelEclipticLive({ equatorialGroupRef, starLocalPos, nepPos }) {
  const [wp, setWp] = useState({
    x: starLocalPos.x, y: starLocalPos.y, z: starLocalPos.z,
    lambda: STAR_LAMBDA, beta: STAR_BETA,
  })

  useFrame(() => {
    if (!equatorialGroupRef.current) return
    const pos = new THREE.Vector3(starLocalPos.x, starLocalPos.y, starLocalPos.z)
    equatorialGroupRef.current.localToWorld(pos)

    const nepDirN = ECL_NEP_DIR.clone().normalize()
    const sinBeta = THREE.MathUtils.clamp(pos.dot(nepDirN) / R, -1, 1)
    const beta    = Math.asin(sinBeta)

    const foot   = pos.clone().sub(nepDirN.clone().multiplyScalar(pos.dot(nepDirN)))
    let lambda   = Math.atan2(foot.dot(ECL_Z_AXIS), foot.dot(ECL_X_AXIS))
    if (lambda < 0) lambda += Math.PI * 2

    setWp({ x: pos.x, y: pos.y, z: pos.z, lambda, beta })
  })

  const arcs = useMemo(() => {
    const { x, y, z, lambda } = wp
    const footPos = makeEclipticPoint(lambda)
    const starV   = new THREE.Vector3(x, y, z)
    const footV   = footPos.clone()

    return {
      lonArc: Array.from({ length: 40 }, (_, i) => {
        const p = makeEclipticPoint((i / 39) * lambda)
        return [p.x, p.y, p.z]
      }),
      nepToFoot: Array.from({ length: 60 }, (_, i) => {
        const p = _v1.clone().lerpVectors(nepPos, footV, i / 59).normalize().multiplyScalar(R)
        return [p.x, p.y, p.z]
      }),
      latArc: Array.from({ length: 28 }, (_, i) => {
        const p = _v1.clone().lerpVectors(footV, starV, i / 27).normalize().multiplyScalar(R)
        return [p.x, p.y, p.z]
      }),
      lonMid:  makeEclipticPoint(lambda * 0.5),
      latMid:  _v1.clone().lerpVectors(footV, starV, 0.5).normalize().multiplyScalar(R * 0.82),
      foot:    footPos,
    }
  }, [wp.x, wp.y, wp.z, wp.lambda])

  const { x, y, z, lambda, beta } = wp

  return (
    <>
      <Line points={arcs.nepToFoot} color="#ff6600" lineWidth={1.8} dashed dashSize={0.042} gapSize={0.036} />
      {arcs.lonArc.length > 1 && <Line points={arcs.lonArc} color="#00ccff" lineWidth={2.8} />}
      <Line points={arcs.latArc} color="#c026d3" lineWidth={2.8} />
      <Line
        points={[[0, 0, 0], arcs.foot.toArray()]}
        color="#1a3a4a" lineWidth={1} dashed dashSize={0.04} gapSize={0.035}
      />
      <mesh position={arcs.foot.toArray()}>
        <sphereGeometry args={[0.014]} /><meshBasicMaterial color="#aaaaaa" />
      </mesh>
      <Text
        position={[arcs.lonMid.x * 0.74, arcs.lonMid.y * 0.74 + 0.07, arcs.lonMid.z * 0.74]}
        fontSize={0.033} color="#00ccff" outlineWidth={0.003} outlineColor="#000"
      >λ</Text>
      <Text
        position={[arcs.latMid.x, arcs.latMid.y + 0.04, arcs.latMid.z]}
        fontSize={0.033} color="#c026d3" outlineWidth={0.003} outlineColor="#000"
      >β</Text>
      <group position={[x * 1.26, y * 1.26 + 0.06, z * 1.26]}>
        <Text fontSize={0.036} color="#ffe066" anchorX="left" outlineWidth={0.005} outlineColor="#000">
          {`λ  ${(lambda / DEG).toFixed(1)}°\nβ  ${(beta / DEG).toFixed(1)}°`}
        </Text>
      </group>
    </>
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
  { desc: 'Declination (δ) & Hour Angle (H) — Magenta arc = Dec from the equator along the hour circle. Orange = hour circle (Pole → Star → Equator). Yellow = Pole–Zenith meridian reference arc; the angle between the two arcs is the Hour Angle.', config: { showHorizon: true, showZenith: true, showCelestialEquator: true, showCelestialPoles: true, showStar: true, showPath: true, showDecArc: true, showHAarc: true } },
  { desc: "Rotation + Latitude — Dec stays fixed while HA increases continuously as Earth rotates. Change latitude to see the pole's altitude equal the observer's latitude.", config: { showHorizon: true, showZenith: true, showCelestialEquator: true, showCelestialPoles: true, showStar: true, showPath: true, showDecArc: true, showHAarc: true } },
]

const equatorial2Steps = [
  { desc: "The Celestial Equator — the fixed reference plane for Equatorial II coordinates. Unlike the horizon, it is the same for every observer on Earth and never shifts with Earth's rotation.", config: { showEquator: true } },
  { desc: "Celestial Poles — NCP & SCP define the fixed rotation axis. The pole altitude equals the observer's latitude, but RA/Dec themselves are independent of observer location.", config: { showEquator: true, showPoles: true } },
  { desc: "The Ecliptic & Equinoxes — the Sun's apparent annual path (orange dashes), tilted 23.5° from the equator due to Earth's axial tilt. ♈ Vernal Equinox is the zero-point of the RA grid. The Sun ☀ is shown at a fixed position along the ecliptic.", config: { showEquator: true, showPoles: true, showEcliptic: true, showStaticSun: true } },
  { desc: "Right Ascension (α) & Declination (δ) — Cyan arc = RA measured eastward from ♈. Magenta arc = Declination from equator to star. Orange dashes = hour circle. The dotted ring shows the star's full diurnal path (circle of constant declination).", config: { showEquator: true, showPoles: true, showEcliptic: true, showStaticSun: true, showStar: true, showStarPath: true } },
  { desc: "Full Motion — the celestial sphere rotates (Earth spinning), the Sun ☀ drifts along the ecliptic (Earth orbiting). The star rides the rotating sphere with fixed RA & Dec displayed. Use the sliders to control speeds.", config: { showEquator: true, showPoles: true, showEcliptic: true, showStar: true, showStarPath: true, showSunMotion: true, rotateSphere: true, sunSpeed: 0.5 } },
]

const eclipticSteps = [
  { desc: "The Celestial Equator — same fixed great circle used in Equatorial II. Shown here as orientation context; ecliptic coordinates use a different reference plane altogether.", config: { showEquator: true } },
  { desc: "Celestial Poles — NCP & SCP mark the equatorial rotation axis (yellow). The ecliptic system has its own distinct pair of poles, perpendicular to the ecliptic plane rather than the equatorial plane.", config: { showEquator: true, showCelPoles: true } },
  { desc: "The Ecliptic & Equinoxes — the Sun's apparent annual path (orange dashes), tilted 23.5° from the equator. The Vernal Equinox ♈ is the zero-point for ecliptic longitude. The Sun ☀ is shown at a fixed position on the ecliptic.", config: { showEquator: true, showCelPoles: true, showEcliptic: true, showStaticSun: true } },
  { desc: "Ecliptic Poles — NEP & SEP (magenta) are perpendicular to the ecliptic plane, displaced 23.5° from the celestial poles. All great circles of ecliptic longitude pass through these two poles. The Sun ☀ sits on the ecliptic.", config: { showEquator: true, showCelPoles: true, showEcliptic: true, showEclPoles: true, showStaticSun: true } },
  { desc: "Ecliptic Longitude (λ) & Latitude (β) — Orange dashed arc = great circle of longitude through NEP, the star, and its foot on the ecliptic. Cyan arc = longitude measured eastward along the ecliptic from ♈ to that foot. Magenta arc = latitude from the foot up to the star. The Sun ☀ rides the ecliptic.", config: { showEquator: true, showCelPoles: true, showEcliptic: true, showEclPoles: true, showStar: true, showStaticSun: true } },
  { desc: "Full Motion — the celestial sphere rotates (Earth's daily spin) while the Sun ☀ drifts along the ecliptic (Earth's yearly orbit). Live λ & β arcs track the star as it rotates. Stars keep fixed ecliptic coordinates. Use the sliders to control both speeds.", config: { showEquator: true, showEcliptic: true, showEclPoles: true, showStar: true, showSunMotion: true, rotateSphere: true } },
]

// ─── LEGEND DATA ──────────────────────────────────────────────────────────────
const horizontalLegend = [
  { color: '#ffffff', label: 'Horizon' },
  { color: '#ff6b6b', label: 'Zenith',       dot: true },
  { color: '#00ff88', label: 'Cel. Equator' },
  { color: '#ffd700', label: 'Pole (NCP)',   dot: true },
  { color: '#ffcc00', label: 'Meridian',     dot: true },
  { color: '#00ccff', label: 'Azimuth' },
  { color: '#ff00ff', label: 'Altitude' },
  { color: '#555555', label: 'Alt. Circle',  dot: true },
  { color: '#888888', label: 'Star Path',    dot: true },
]
const equatorialLegend = [
  { color: '#ffffff', label: 'Horizon' },
  { color: '#ff6b6b', label: 'Zenith',       dot: true },
  { color: '#00ff88', label: 'Cel. Equator' },
  { color: '#ffd700', label: 'NCP / SCP',    dot: true },
  { color: '#ff00ff', label: 'Declination',  dot: true },
  { color: '#ff6600', label: 'Hour Circle',  dot: true },
  { color: '#ffcc00', label: 'Pole–Zenith',  dot: true },
  { color: '#888888', label: 'Star Path',    dot: true },
]
const equatorial2Legend = [
  { color: '#00ff88', label: 'Cel. Equator' },
  { color: '#ffd700', label: 'NCP / SCP',       dot: true },
  { color: '#ff9900', label: 'Ecliptic',         dot: true },
  { color: '#ffffff', label: 'Vernal Eq. ♈' },
  { color: '#888888', label: 'Autumnal Eq. ♎',  dot: true },
  { color: '#ffe500', label: 'Sun ☀',            dot: true },
  { color: '#ff6600', label: 'Hour Circle',      dot: true },
  { color: '#00ccff', label: 'Right Ascension' },
  { color: '#c026d3', label: 'Declination',      dot: true },
  { color: '#ffe066', label: 'Star ★',           dot: true },
  { color: '#443322', label: 'Diurnal Path',     dot: true },
]
const eclipticLegend = [
  { color: '#00ff88', label: 'Cel. Equator' },
  { color: '#ffd700', label: 'NCP / SCP',       dot: true },
  { color: '#ff9900', label: 'Ecliptic',         dot: true },
  { color: '#ffffff', label: 'Vernal Eq. ♈' },
  { color: '#888888', label: 'Autumnal Eq. ♎',  dot: true },
  { color: '#e879f9', label: 'NEP / SEP',        dot: true },
  { color: '#ff6600', label: 'Lon. Circle',      dot: true },
  { color: '#00ccff', label: 'Longitude λ' },
  { color: '#c026d3', label: 'Latitude β',       dot: true },
  { color: '#ffe066', label: 'Star ★',           dot: true },
  { color: '#ffe500', label: 'Sun ☀',            dot: true },
  { color: '#443322', label: 'Diurnal Path',     dot: true },
]

// ─── HOISTED STYLE OBJECTS ────────────────────────────────────────────────────
const SLIDER_BOX_STYLE = {
  background: 'rgba(4,8,20,0.88)',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.07)',
  backdropFilter: 'blur(10px)',
  width: '178px',
}
const SLIDER_ROW_STYLE = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px',
}
const RESET_BTN_STYLE = {
  padding: '7px 20px', background: '#fff', color: '#000', border: 'none',
  borderRadius: '999px', fontWeight: 800, fontSize: '11px', fontFamily: FONT_MONO,
  letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
  boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
}

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
  const controlsRef = useRef()

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

  const sliderLabelStyle = useMemo(() => ({
    fontSize: '10px', color: accentColor, fontWeight: 800,
    fontFamily: FONT_MONO, textTransform: 'uppercase', letterSpacing: '0.1em',
  }), [accentColor])
  const sliderValStyle = useMemo(() => ({
    fontFamily: FONT_MONO, fontSize: '12px', color: accentColor, fontWeight: 700,
  }), [accentColor])

  const canvasHeight = isMobile ? '320px' : '480px'

  // On mobile, controls go below canvas instead of overlaid
  const controlsOverlay = isLastStep && (
    <div style={isMobile ? {
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      background: 'rgba(4,8,20,0.95)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    } : {
      position: 'absolute', bottom: '16px', right: '16px',
      display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end',
    }}>
      {showLatRot && (
        <>
          <div style={isMobile ? { ...SLIDER_BOX_STYLE, width: '100%' } : SLIDER_BOX_STYLE}>
            <div style={SLIDER_ROW_STYLE}>
              <span style={{ ...sliderLabelStyle, color: '#34d399' }}>Latitude</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: '12px', color: '#6ee7b7', fontWeight: 700 }}>{latitude.toFixed(1)}°</span>
            </div>
            <input
              type="range" min="-90" max="90" step="0.5" value={latitude}
              onChange={onLatChange}
              style={{ width: '100%', accentColor: '#34d399', marginBottom: '8px' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              {[{ l: '90°', v: 90, fn: onLat90 }, { l: '0°', v: 0, fn: onLat0 }].map(p => (
                <button key={p.v} onClick={p.fn} style={{
                  fontSize: '10px', fontWeight: 700, fontFamily: FONT_MONO,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  padding: '5px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: Math.abs(latitude - p.v) < 0.6 ? '#10b981' : '#1a2235',
                  color:      Math.abs(latitude - p.v) < 0.6 ? '#000'    : '#64748b',
                }}>{p.l}</button>
              ))}
            </div>
          </div>

          <div style={isMobile ? { ...SLIDER_BOX_STYLE, width: '100%' } : SLIDER_BOX_STYLE}>
            <div style={SLIDER_ROW_STYLE}>
              <span style={{ ...sliderLabelStyle, color: '#67e8f9' }}>Rotation</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: '12px', color: '#a5f3fc', fontWeight: 700 }}>
                {speed === 0 ? 'paused' : `${speed.toFixed(2)}×`}
              </span>
            </div>
            <input
              type="range" min="0" max="0.8" step="0.01" value={speed}
              onChange={onSpeedChange}
              style={{ width: '100%', accentColor: '#22d3ee' }}
            />
          </div>
        </>
      )}

      {showDualSliders && (
        <>
          <div style={isMobile ? { ...SLIDER_BOX_STYLE, width: '100%' } : SLIDER_BOX_STYLE}>
            <div style={SLIDER_ROW_STYLE}>
              <span style={{ fontSize: '10px', color: isEcliptic ? '#e879f9' : '#a78bfa', fontWeight: 800, fontFamily: FONT_MONO, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Sphere
              </span>
              <span style={{ fontFamily: FONT_MONO, fontSize: '12px', color: isEcliptic ? '#f0abfc' : '#c4b5fd', fontWeight: 700 }}>
                {sphereSpeed === 0 ? 'paused' : `${sphereSpeed.toFixed(2)}×`}
              </span>
            </div>
            <input
              type="range" min="0" max="0.6" step="0.01" value={sphereSpeed}
              onChange={onSphereChange}
              style={{ width: '100%', accentColor: isEcliptic ? '#e879f9' : '#a78bfa', marginBottom: '4px' }}
            />
            <div style={{ fontSize: '9px', color: isEcliptic ? '#4a2060' : '#4a3a6a', fontFamily: FONT_MONO }}>
              ★ star / diurnal rotation
            </div>
          </div>

          <div style={isMobile ? { ...SLIDER_BOX_STYLE, width: '100%' } : SLIDER_BOX_STYLE}>
            <div style={SLIDER_ROW_STYLE}>
              <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 800, fontFamily: FONT_MONO, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Sun Speed
              </span>
              <span style={{ fontFamily: FONT_MONO, fontSize: '12px', color: '#fde68a', fontWeight: 700 }}>
                {sunSpeed === 0 ? 'paused' : `${sunSpeed.toFixed(2)}×`}
              </span>
            </div>
            <input
              type="range" min="0" max="2" step="0.05" value={sunSpeed}
              onChange={onSunChange}
              style={{ width: '100%', accentColor: '#fbbf24', marginBottom: '4px' }}
            />
            <div style={{ fontSize: '9px', color: '#4a3a20', fontFamily: FONT_MONO }}>
              ☀ ecliptic drift
            </div>
          </div>
        </>
      )}

      <div style={isMobile ? { display: 'flex', justifyContent: 'center' } : {}}>
        <button onClick={onReset} style={RESET_BTN_STYLE}>RESET VIEW</button>
      </div>
    </div>
  )

  // On mobile: reset button floats in canvas, controls below
  const resetBtnOnly = !isLastStep && (
    <div style={{
      position: 'absolute', bottom: '12px', right: '12px',
    }}>
      <button onClick={onReset} style={RESET_BTN_STYLE}>RESET VIEW</button>
    </div>
  )

  return (
    <div style={{
      background: 'rgba(8,12,28,0.92)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '14px', overflow: 'hidden', marginBottom: '28px',
      boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: isMobile ? '12px 14px' : '14px 20px',
        background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px',
          background: `${accentColor}18`, border: `1px solid ${accentColor}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isMobile ? '11px' : '13px', fontWeight: 800, color: accentColor,
          fontFamily: FONT_MONO, flexShrink: 0,
        }}>{String(stepNum).padStart(2, '0')}</div>
        <p style={{
          margin: 0, fontSize: isMobile ? '12px' : '13.5px', lineHeight: '1.65', color: '#b8c8e0',
          fontFamily: FONT_SANS, fontWeight: 400, letterSpacing: '0.01em',
        }}>{data.desc}</p>
      </div>

      {/* 3-D Canvas */}
      <div style={{ height: canvasHeight, position: 'relative' }}>
        <Canvas camera={{ position: [1.8, 1.2, 1.8], fov: 40 }}>
          <color attach="background" args={['#020408']} />
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={1} />

          {isEcliptic
            ? <EclipticScene    config={dynamicConfig} sunSpeed={sunSpeed} sphereSpeed={sphereSpeed} />
            : isEquatorial2
            ? <EquatorialIIScene config={dynamicConfig} sunSpeed={sunSpeed} />
            : isEquatorial1
            ? <EquatorialScene  config={data.config} rotationSpeed={speed} latitude={latitude} />
            : <CelestialScene   config={data.config} rotationSpeed={speed} latitude={latitude} />
          }

          <OrbitControls ref={controlsRef} makeDefault minDistance={1} maxDistance={4} />
        </Canvas>

        {/* Desktop: overlay controls on last step, reset button on other steps */}
        {!isMobile && isLastStep && controlsOverlay}
        {resetBtnOnly}
      </div>

      {/* Mobile: controls below canvas */}
      {isMobile && isLastStep && controlsOverlay}
    </div>
  )
})

// ─── LEGEND ITEM ──────────────────────────────────────────────────────────────
const LegendItem = memo(function LegendItem({ color, label, dot }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '3px 0' }}>
      <div style={{
        width: '28px', height: '2px', flexShrink: 0,
        background: dot ? 'transparent' : color,
        borderBottom: dot ? `2px dashed ${color}` : 'none',
      }} />
      <span style={{
        fontSize: '12px', fontFamily: FONT_SANS, fontWeight: 500,
        color: '#7a90b0', letterSpacing: '0.01em',
      }}>{label}</span>
    </div>
  )
})

// ─── COORD DEF ────────────────────────────────────────────────────────────────
const CoordDef = memo(function CoordDef({ symbol, name, desc, color }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '3px' }}>
        <span style={{ fontSize: '20px', fontWeight: 800, color, fontFamily: FONT_MONO, lineHeight: 1 }}>{symbol}</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#7a90b0', fontFamily: FONT_SANS }}>{name}</span>
      </div>
      <div style={{ fontSize: '11px', color: '#364d66', fontFamily: FONT_MONO, letterSpacing: '0.03em', paddingLeft: '2px' }}>{desc}</div>
    </div>
  )
})

// ─── SYSTEMS DATA ─────────────────────────────────────────────────────────────
const SYSTEMS = [
  {
    id: 'horizontal', label: 'Horizontal', sub: 'Azimuth · Altitude', color: '#38bdf8',
    steps: horizontalSteps, legend: horizontalLegend, coordLabel: 'Horizontal',
    coords: [
      { symbol: 'A', name: 'Azimuth',  desc: '0°–360° from North', color: '#00ccff' },
      { symbol: 'a', name: 'Altitude', desc: '0° horizon → 90°',  color: '#ff00ff' },
    ],
  },
  {
    id: 'equatorial1', label: 'Equatorial I', sub: 'Declination · Hour Angle', color: '#fb923c',
    steps: equatorialSteps, legend: equatorialLegend, coordLabel: 'Equatorial I',
    coords: [
      { symbol: 'δ', name: 'Declination', desc: '+90° (NCP) to −90°', color: '#ff00ff' },
      { symbol: 'H', name: 'Hour Angle',  desc: '0°–360°, westward',  color: '#ff6600' },
    ],
  },
  {
    id: 'equatorial2', label: 'Equatorial II', sub: 'Declination · Right Ascension', color: '#a78bfa',
    steps: equatorial2Steps, legend: equatorial2Legend, coordLabel: 'Equatorial II',
    coords: [
      { symbol: 'α', name: 'R. Ascension', desc: '0°–360° eastward from ♈', color: '#00ccff' },
      { symbol: 'δ', name: 'Declination',  desc: '+90° (NCP) to −90°',      color: '#c026d3' },
    ],
  },
  {
    id: 'ecliptic', label: 'Ecliptic', sub: 'Longitude · Latitude', color: '#e879f9',
    steps: eclipticSteps, legend: eclipticLegend, coordLabel: 'Ecliptic',
    coords: [
      { symbol: 'λ', name: 'Longitude', desc: '0°–360° eastward from ♈', color: '#00ccff' },
      { symbol: 'β', name: 'Latitude',  desc: '±90° from ecliptic plane', color: '#c026d3' },
    ],
  },
]

// ─── LEGEND DRAWER (mobile) ───────────────────────────────────────────────────
function LegendDrawer({ active, isOpen, onClose }) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 40, backdropFilter: 'blur(2px)',
          }}
        />
      )}
      {/* Drawer */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: '240px',
        background: '#030611', borderLeft: '1px solid rgba(255,255,255,0.07)',
        zIndex: 50, padding: '24px 18px', overflowY: 'auto',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: `1px solid ${active.color}33` }}>
          <span style={{ fontSize: '11px', fontFamily: FONT_MONO, letterSpacing: '0.14em', textTransform: 'uppercase', color: active.color, fontWeight: 700 }}>Legend</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4a6080', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '2px 6px' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '28px' }}>
          {active.legend.map((item, i) => (
            <LegendItem key={i} color={item.color} label={item.label} dot={item.dot} />
          ))}
        </div>

        <div style={{ paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, fontFamily: FONT_MONO, letterSpacing: '0.12em', textTransform: 'uppercase', color: active.color, marginBottom: '16px' }}>
            {active.coordLabel}
          </div>
          {active.coords.map((c, i) => (
            <CoordDef key={i} symbol={c.symbol} name={c.name} desc={c.desc} color={c.color} />
          ))}
        </div>
      </div>
    </>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeSystemId, setActiveSystemId] = useState('horizontal')
  const [navOpen,        setNavOpen]        = useState(false)
  const [legendOpen,     setLegendOpen]     = useState(false)
  const isMobile = useIsMobile()

  const active = useMemo(() => SYSTEMS.find(s => s.id === activeSystemId), [activeSystemId])

  const handleSystemChange = useCallback((id) => {
    setActiveSystemId(id)
    setNavOpen(false)
  }, [])

  // ── MOBILE LAYOUT ──
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#06091a', color: '#e2e8f0', fontFamily: FONT_SANS, overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: '52px', flexShrink: 0,
          background: '#030611', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button
            onClick={() => setNavOpen(true)}
            style={{ background: 'none', border: 'none', color: '#7a90b0', cursor: 'pointer', fontSize: '20px', padding: '4px', lineHeight: 1 }}
          >☰</button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: active.color, fontFamily: FONT_SANS }}>{active.label}</div>
            <div style={{ fontSize: '9px', color: '#253548', fontFamily: FONT_MONO, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{active.sub}</div>
          </div>

          <button
            onClick={() => setLegendOpen(true)}
            style={{ background: 'none', border: 'none', color: '#7a90b0', cursor: 'pointer', fontSize: '16px', padding: '4px', lineHeight: 1, fontFamily: FONT_MONO }}
          >★</button>
        </div>

        {/* Main scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px 80px' }}>
          {active.steps.map((step, i) => (
            <StepCard
              key={`${activeSystemId}-${i}`}
              stepNum={i + 1}
              data={step}
              systemId={activeSystemId}
              accentColor={active.color}
            />
          ))}
        </div>

        {/* Bottom tab bar */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#030611', borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', zIndex: 30, paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {SYSTEMS.map(sys => {
            const on = activeSystemId === sys.id
            return (
              <button
                key={sys.id}
                onClick={() => handleSystemChange(sys.id)}
                style={{
                  flex: 1, padding: '10px 4px 8px', border: 'none',
                  background: on ? `${sys.color}0d` : 'transparent',
                  borderTop: `2px solid ${on ? sys.color : 'transparent'}`,
                  cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '3px',
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: on ? sys.color : '#1c2c40' }} />
                <span style={{
                  fontSize: '9px', fontWeight: 700, color: on ? sys.color : '#364e68',
                  fontFamily: FONT_MONO, letterSpacing: '0.04em', textTransform: 'uppercase',
                  lineHeight: 1.2, textAlign: 'center',
                }}>{sys.label}</span>
              </button>
            )
          })}
        </div>

        {/* Nav drawer */}
        <>
          {navOpen && (
            <div onClick={() => setNavOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(2px)' }} />
          )}
          <div style={{
            position: 'fixed', left: 0, top: 0, bottom: 0, width: '220px',
            background: '#030611', borderRight: '1px solid rgba(255,255,255,0.07)',
            zIndex: 50, padding: '20px 10px',
            transform: navOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '4px 10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', fontFamily: FONT_MONO, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#263550', marginBottom: '6px', fontWeight: 900 }}>Celestial Coords</div>
              <div style={{ fontSize: '16px', fontFamily: FONT_SANS, fontWeight: 700, color: '#c8d8ee', lineHeight: 1.25 }}>Coordinate<br />Systems</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {SYSTEMS.map(sys => {
                const on = activeSystemId === sys.id
                return (
                  <button
                    key={sys.id}
                    onClick={() => handleSystemChange(sys.id)}
                    style={{
                      padding: '13px 14px', borderRadius: '10px',
                      border: on ? `1px solid ${sys.color}44` : '1px solid transparent',
                      background: on ? `${sys.color}0e` : 'transparent',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '4px' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: on ? sys.color : '#1c2c40', boxShadow: on ? `0 0 10px ${sys.color}99` : 'none', flexShrink: 0 }} />
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: on ? sys.color : '#374e68', fontFamily: FONT_SANS }}>{sys.label}</span>
                    </div>
                    <div style={{ fontSize: '10.5px', color: on ? `${sys.color}77` : '#1e2f42', paddingLeft: '16px', fontFamily: FONT_MONO, letterSpacing: '0.04em' }}>{sys.sub}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </>

        {/* Legend drawer */}
        <LegendDrawer active={active} isOpen={legendOpen} onClose={() => setLegendOpen(false)} />
      </div>
    )
  }

  // ── DESKTOP LAYOUT (original) ──
  return (
    <div style={{
      display: 'flex', height: '100vh', background: '#06091a',
      color: '#e2e8f0', overflow: 'hidden', fontFamily: FONT_SANS,
    }}>
      {/* LEFT NAV */}
      <div style={{
        width: '210px', background: '#030611',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            fontSize: '10px', fontFamily: FONT_MONO, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: '#263550', marginBottom: '8px', fontWeight: 900,
          }}>Celestial Coords</div>
          <div style={{
            fontSize: '17px', fontFamily: FONT_SANS, fontWeight: 700,
            color: '#c8d8ee', lineHeight: 1.25,
          }}>Coordinate<br />Systems</div>
        </div>

        <div style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {SYSTEMS.map(sys => {
            const on = activeSystemId === sys.id
            return (
              <button
                key={sys.id}
                onClick={() => setActiveSystemId(sys.id)}
                style={{
                  padding: '13px 14px', borderRadius: '10px',
                  border: on ? `1px solid ${sys.color}44` : '1px solid transparent',
                  background: on ? `${sys.color}0e` : 'transparent',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '4px' }}>
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: on ? sys.color : '#1c2c40',
                    boxShadow: on ? `0 0 10px ${sys.color}99` : 'none', flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: '13.5px', fontWeight: 700,
                    color: on ? sys.color : '#374e68',
                    fontFamily: FONT_SANS, letterSpacing: '0.01em',
                  }}>{sys.label}</span>
                </div>
                <div style={{
                  fontSize: '10.5px',
                  color: on ? `${sys.color}77` : '#1e2f42',
                  paddingLeft: '16px', fontFamily: FONT_MONO, letterSpacing: '0.04em',
                }}>{sys.sub}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '36px 28px', background: '#07091c',
      }}>
        <div style={{
          marginBottom: '36px', paddingBottom: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <h1 style={{
            margin: '0 0 6px', fontSize: '28px', fontWeight: 800,
            color: active.color, fontFamily: FONT_SANS, letterSpacing: '-0.02em',
          }}>{active.label}</h1>
          <div style={{
            fontSize: '13px', color: '#253548', fontFamily: FONT_MONO,
            letterSpacing: '0.04em', fontWeight: 700,
          }}>{active.steps.length} steps · {active.sub}</div>
        </div>

        {active.steps.map((step, i) => (
          <StepCard
            key={`${activeSystemId}-${i}`}
            stepNum={i + 1}
            data={step}
            systemId={activeSystemId}
            accentColor={active.color}
          />
        ))}
      </div>

      {/* RIGHT LEGEND */}
      <div style={{
        width: '192px', background: '#030611',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        padding: '24px 18px', flexShrink: 0, overflowY: 'auto',
      }}>
        <div style={{
          fontSize: '11px', fontFamily: FONT_MONO, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: active.color, fontWeight: 700,
          marginBottom: '18px', paddingBottom: '12px',
          borderBottom: `1px solid ${active.color}33`,
        }}>Legend</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '28px' }}>
          {active.legend.map((item, i) => (
            <LegendItem key={i} color={item.color} label={item.label} dot={item.dot} />
          ))}
        </div>

        <div style={{ paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{
            fontSize: '10px', fontWeight: 700, fontFamily: FONT_MONO,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: active.color, marginBottom: '16px',
          }}>{active.coordLabel}</div>
          {active.coords.map((c, i) => (
            <CoordDef key={i} symbol={c.symbol} name={c.name} desc={c.desc} color={c.color} />
          ))}
        </div>
      </div>
    </div>
  )
}