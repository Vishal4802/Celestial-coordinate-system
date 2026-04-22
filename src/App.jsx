import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import * as THREE from 'three'

// --- SHARP DOTTED HELPERS ---

function DottedLine({ start, end, color, segments = 24 }) {
  const geoRef = useRef()
  useEffect(() => {
    if (!geoRef.current) return
    const pts = []
    const s = new THREE.Vector3(...start)
    const e = new THREE.Vector3(...end)
    for (let i = 0; i < segments; i++) {
      const t1 = i / segments
      const t2 = (i + 0.5) / segments
      pts.push(new THREE.Vector3().lerpVectors(s, e, t1))
      pts.push(new THREE.Vector3().lerpVectors(s, e, t2))
    }
    geoRef.current.setFromPoints(pts)
  }, [start[0], start[1], start[2], end[0], end[1], end[2], segments])

  return (
    <lineSegments>
      <bufferGeometry ref={geoRef} />
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

function DottedCircle({ radius, rotation = [0, 0, 0], color, segments = 60 }) {
  const geoRef = useRef()
  useEffect(() => {
    if (!geoRef.current) return
    const pts = []
    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2
      const angle2 = ((i + 0.4) / segments) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(angle1) * radius, 0, Math.sin(angle1) * radius))
      pts.push(new THREE.Vector3(Math.cos(angle2) * radius, 0, Math.sin(angle2) * radius))
    }
    geoRef.current.setFromPoints(pts)
  }, [radius, segments])

  return (
    <lineSegments rotation={rotation}>
      <bufferGeometry ref={geoRef} />
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

// --- CORE SCENE ---

function CelestialScene({ config, rotationSpeed = 0, latitude = 28.6 }) {
  const radius = 0.8
  const equatorialGroup = useRef()
  const starRef = useRef()
  const guideArcGeoRef = useRef()

  const [starCoords, setStarCoords] = useState({ az: 0, alt: 0 })

  // tilt = observer latitude in radians — driven by the latitude prop
  const tilt = (latitude * Math.PI) / 180

  const starDeclination = 0.439
  const starInitialHA   = 1.318

  useFrame((state, delta) => {
    if (equatorialGroup.current && rotationSpeed > 0) {
      equatorialGroup.current.rotation.y += delta * rotationSpeed
    }

    if (starRef.current) {
      const worldPos = new THREE.Vector3()
      starRef.current.getWorldPosition(worldPos)

      const alt = Math.asin(THREE.MathUtils.clamp(worldPos.y / radius, -1, 1))
      let az = Math.atan2(worldPos.x, worldPos.z)
      if (az < 0) az += Math.PI * 2

      const horizonProj = new THREE.Vector3(worldPos.x, 0, worldPos.z)
        .normalize()
        .multiplyScalar(radius)

      setStarCoords({
        az: (az * 180 / Math.PI).toFixed(1),
        alt: (alt * 180 / Math.PI).toFixed(1),
        pos: worldPos.clone(),
        horizonProj,
      })

      if (guideArcGeoRef.current) {
        const zenith    = new THREE.Vector3(0, 1, 0)
        const horizNorm = horizonProj.clone().normalize()
        const pts       = []
        const segs      = 40
        for (let i = 0; i < segs; i++) {
          const t1 = i / segs
          const t2 = (i + 0.45) / segs
          pts.push(
            new THREE.Vector3().lerpVectors(zenith, horizNorm, t1).normalize().multiplyScalar(radius)
          )
          pts.push(
            new THREE.Vector3().lerpVectors(zenith, horizNorm, t2).normalize().multiplyScalar(radius)
          )
        }
        guideArcGeoRef.current.setFromPoints(pts)
      }
    }
  })

  return (
    <group>
      {/* 1. ATMOSPHERE / SHELL */}
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhongMaterial color="#4488ff" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

      {/* 2. HORIZONTAL SYSTEM */}
      <group>
        <Line
          points={Array.from({ length: 65 }, (_, i) => [
            Math.cos((i / 64) * Math.PI * 2) * radius,
            0,
            Math.sin((i / 64) * Math.PI * 2) * radius,
          ])}
          color="white"
          lineWidth={1}
        />

        {(config.showZenithNadir || config.showStep6) && (
          <>
            <DottedLine start={[0, radius, 0]} end={[0, -radius, 0]} color="#ff6b6b" />
            <Text position={[0, radius + 0.1, 0]} fontSize={0.05} color="#ff6b6b">
              ZENITH
            </Text>
          </>
        )}

        {config.showMeridian && (
          <DottedCircle radius={radius} rotation={[0, 0, Math.PI / 2]} color="#ffcc00" />
        )}

        {(config.showNESW || config.showStep6) && (
          <>
            <Text position={[0, 0.05, radius + 0.08]}  fontSize={0.06} color="white">N</Text>
            <Text position={[0, 0.05, -radius - 0.08]} fontSize={0.06} color="white">S</Text>
            <Text position={[radius + 0.08, 0.05, 0]}  fontSize={0.06} color="white">W</Text>
            <Text position={[-radius - 0.08, 0.05, 0]} fontSize={0.06} color="white">E</Text>
          </>
        )}
      </group>

      {/* 3. EQUATORIAL SYSTEM — tilted by latitude */}
      <group rotation={[tilt, 0, 0]}>
        <group ref={equatorialGroup}>

          {config.showCelestialEquator && (
            <Line
              points={Array.from({ length: 65 }, (_, i) => [
                Math.cos((i / 64) * Math.PI * 2) * radius,
                0,
                Math.sin((i / 64) * Math.PI * 2) * radius,
              ])}
              color="#00ff88"
              lineWidth={1.5}
            />
          )}

          {config.showCelestialPoles && (
            <>
              <DottedLine start={[0, radius, 0]} end={[0, -radius, 0]} color="#ffd700" />
              <Text position={[0, radius + 0.1, 0]} fontSize={0.05} color="#ffd700">
                NCP
              </Text>
            </>
          )}

          {config.showPath && (
            <group position={[0, Math.sin(starDeclination) * radius, 0]}>
              <DottedCircle
                radius={Math.cos(starDeclination) * radius}
                rotation={[0, 0, 0]}
                color="#888"
                segments={80}
              />
            </group>
          )}

          {config.showStar && (
            <group rotation={[0, starInitialHA, 0]}>
              <mesh
                ref={starRef}
                position={[
                  0,
                  Math.sin(starDeclination) * radius,
                  Math.cos(starDeclination) * radius,
                ]}
              >
                <sphereGeometry args={[0.025]} />
                <meshBasicMaterial color="yellow" />
              </mesh>
            </group>
          )}
        </group>
      </group>

      {/* 4. MEASUREMENT ARCS */}
      {config.showStar && starCoords.pos && (
        <group>
          <lineSegments>
            <bufferGeometry ref={guideArcGeoRef} />
            <lineBasicMaterial color="#555" />
          </lineSegments>

          <Line
            points={Array.from({ length: 24 }, (_, i) => {
              const p = new THREE.Vector3()
                .lerpVectors(starCoords.horizonProj, starCoords.pos, i / 23)
                .normalize()
                .multiplyScalar(radius)
              return [p.x, p.y, p.z]
            })}
            color="#ff00ff"
            lineWidth={2.5}
          />

          <Line
            points={Array.from({ length: 24 }, (_, i) => {
              const north = new THREE.Vector3(0, 0, radius)
              const p = new THREE.Vector3()
                .lerpVectors(north, starCoords.horizonProj, i / 23)
                .normalize()
                .multiplyScalar(radius)
              return [p.x, p.y, p.z]
            })}
            color="#00ccff"
            lineWidth={2.5}
          />

          <group
            position={[
              starCoords.pos.x * 1.18,
              starCoords.pos.y * 1.18,
              starCoords.pos.z * 1.18,
            ]}
          >
            <Text
              fontSize={0.032}
              color="yellow"
              anchorX="left"
              outlineWidth={0.004}
              outlineColor="black"
            >
              {`ALT: ${starCoords.alt}°\nAZ:  ${starCoords.az}°`}
            </Text>
          </group>

          <Line
            points={[[0, 0, 0], [starCoords.pos.x, starCoords.pos.y, starCoords.pos.z]]}
            color="#ff00ff"
            lineWidth={1}
            dashed
            dashSize={0.05}
            gapSize={0.04}
          />
          <Line
            points={[
              [0, 0, 0],
              [starCoords.horizonProj.x, starCoords.horizonProj.y, starCoords.horizonProj.z],
            ]}
            color="#00ccff"
            lineWidth={1}
            dashed
            dashSize={0.05}
            gapSize={0.04}
          />
          <Line
            points={[[0, 0, 0], [0, 0, radius]]}
            color="#005566"
            lineWidth={1}
            dashed
            dashSize={0.05}
            gapSize={0.04}
          />
        </group>
      )}

      {/* Centre Earth */}
      <mesh>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
    </group>
  )
}

// --- MAIN APP COMPONENT ---

export default function App() {
  const steps = [
    {
      desc: 'The Horizon: The base plane for local observation.',
      config: { showZenithNadir: false },
    },
    {
      desc: 'The Vertical Axis: Zenith is directly above, Nadir is below.',
      config: { showZenithNadir: true },
    },
    {
      desc: "The Celestial Equator: Projection of Earth's equator into space.",
      config: { showZenithNadir: true, showCelestialEquator: true },
    },
    {
      desc: 'Celestial Poles: The rotation axis of the celestial sphere.',
      config: { showZenithNadir: true, showCelestialEquator: true, showCelestialPoles: true },
    },
    {
      desc: 'The Meridian: Great circle passing through Zenith and Poles.',
      config: {
        showZenithNadir: true,
        showCelestialEquator: true,
        showCelestialPoles: true,
        showMeridian: true,
        showNESW: true,
      },
    },
    {
      desc: 'Horizontal Coordinates: Position defined by North and Horizon.',
      config: { showStep6: true, showNESW: true },
    },
    {
      desc: 'Measurement: Cyan arc = Azimuth (from N). Pink arc = Altitude. Dotted arc = altitude circle through star.',
      config: { showStep6: true, showNESW: true, showStar: true },
    },
    {
      desc: 'Rotation + Latitude: Drag the latitude slider to move your observer position. Notice how the celestial equator angle and star path change. Spin the sphere to see how Az & Alt evolve.',
      config: {
        showZenithNadir: true,
        showCelestialEquator: true,
        showCelestialPoles: true,
        showNESW: true,
        showStar: true,
        showPath: true,
        showMeridian: true,
      },
    },
  ]

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-950 p-6 border-r border-slate-800 shrink-0 overflow-y-auto">
        <h2 className="text-lg font-black text-cyan-400 mb-8 border-b border-cyan-900 pb-2">
          Horizontal Coordinate System
        </h2>
        <div className="space-y-6">
          <LegendItem color="white"   label="Horizon"    />
          <LegendItem color="#ff6b6b" label="Zenith"     dotted />
          <LegendItem color="#00ff88" label="Equator"    />
          <LegendItem color="#ffd700" label="NCP Pole"   dotted />
          <LegendItem color="#00ccff" label="Azimuth"    />
          <LegendItem color="#ff00ff" label="Altitude"   />
          <LegendItem color="#555"    label="Alt Circle" dotted />
          <LegendItem color="#888"    label="Star Path"  dotted />
        </div>

        {/* Latitude quick-facts */}
        <div className="mt-10 border-t border-slate-800 pt-6 space-y-2">
          <p className="text-[10px] text-cyan-400 uppercase font-black tracking-widest mb-3">Key Latitudes</p>
          {[
            { lat: 90,  label: 'North Pole' },
            { lat: 0,   label: 'Equator' },
          ].map(({ lat, label }) => (
            <div key={lat} className="flex justify-between text-[11px]">
              <span className="text-slate-400">{label}</span>
              <span className="text-cyan-300 font-mono">{lat}°</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-12 bg-slate-900 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
        <div className="max-w-4xl mx-auto space-y-16 pb-20">
          {steps.map((step, i) => (
            <StepCard key={i} step={i + 1} data={step} />
          ))}
        </div>
      </div>
    </div>
  )
}

function StepCard({ step, data }) {
  const [speed, setSpeed]       = useState(0)
  const [latitude, setLatitude] = useState(28.6)
  const controlsRef             = useRef()
  const isStep8                 = step === 8

  // Latitude presets
  const presets = [
    { label: 'Pole 90°',   value: 90 },
    { label: 'Equator 0°', value: 0  },
  ]

  return (
    <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="p-5 bg-slate-900/80 flex justify-between items-center border-b border-slate-800">
        <div>
          <span className="text-cyan-500 font-black text-xs uppercase tracking-widest block mb-1">
            Step 0{step}
          </span>
          <p className="text-slate-200 text-sm font-medium italic">"{data.desc}"</p>
        </div>
      </div>

      <div className="h-[500px] relative">
        <Canvas camera={{ position: [1.8, 1.2, 1.8], fov: 40 }}>
          <color attach="background" args={['#020408']} />
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={1} />
          <CelestialScene
            config={data.config}
            rotationSpeed={speed}
            latitude={latitude}
          />
          <OrbitControls ref={controlsRef} makeDefault minDistance={1} maxDistance={4} />
        </Canvas>

        {/* UI Overlays */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-3 items-end">

          {/* ── Latitude control — only in step 8 ── */}
          {isStep8 && (
            <div className="bg-black/70 p-3 rounded-xl border border-white/10 backdrop-blur-sm w-44">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                  Latitude
                </label>
                <span className="text-emerald-300 font-mono text-xs font-bold">
                  {latitude.toFixed(1)}°
                </span>
              </div>
              <input
                type="range"
                min="-90"
                max="90"
                step="0.5"
                value={latitude}
                onChange={e => setLatitude(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 mb-2"
              />
              <div className="grid grid-cols-2 gap-1">
                {presets.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setLatitude(p.value)}
                    className={`text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded transition-all
                      ${Math.abs(latitude - p.value) < 0.6
                        ? 'bg-emerald-500 text-black'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Rotation speed — only in step 8 ── */}
          {isStep8 && (
            <div className="bg-black/70 p-3 rounded-xl border border-white/10 backdrop-blur-sm w-44">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] text-cyan-400 font-black uppercase tracking-widest">
                  Rotation
                </label>
                <span className="text-cyan-300 font-mono text-xs">
                  {speed === 0 ? 'paused' : `${speed.toFixed(2)}×`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.01"
                value={speed}
                onChange={e => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          )}

          <button
            onClick={() => controlsRef.current?.reset()}
            className="px-6 py-2 bg-white text-black hover:bg-cyan-400 transition-all font-black text-[10px] rounded-full shadow-lg"
          >
            RESET VIEW
          </button>
        </div>
      </div>
    </div>
  )
}

function LegendItem({ color, label, dotted }) {
  return (
    <div className="flex items-center gap-4 group">
      <div
        className={`w-10 h-[2px] transition-all group-hover:w-12 ${dotted ? 'border-b-2 border-dotted' : ''}`}
        style={{ backgroundColor: dotted ? 'transparent' : color, borderColor: color }}
      />
      <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400 group-hover:text-white transition-colors">
        {label}
      </span>
    </div>
  )
}
