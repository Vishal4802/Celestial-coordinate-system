// 3D scene constants and helpers
import * as THREE from 'three'

export const DEG = Math.PI / 180
export const R = 0.8
export const OBL = 23.44 * Math.PI / 180

export const FONT_MONO = "https://fonts.gstatic.com/s/jetbrainsmono/v18/t6q_o04_7S6X_7pS9P_9L9T6Z0_9V18.ttf"
export const FONT_SANS = "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"

export const STAR_DECLINATION = 0.439
export const STAR_INITIAL_HA = 1.318
export const STAR_RA_EQ2 = 65 * DEG
export const STAR_DEC_EQ2 = 22 * DEG
export const STAR_LAMBDA = 65 * DEG
export const STAR_BETA = 30 * DEG

export const _v1 = new THREE.Vector3()
export const _v2 = new THREE.Vector3()

export function buildDottedGeometry(points) {
  const geo = new THREE.BufferGeometry()
  geo.setFromPoints(points)
  return geo
}

export function makeRingPoints(count = 65) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / (count - 1)) * Math.PI * 2
    return [Math.cos(a) * R, 0, Math.sin(a) * R]
  })
}

export function makeEclipticPoint(lambda) {
  return new THREE.Vector3(R * Math.cos(lambda), -R * Math.sin(lambda) * Math.sin(OBL), R * Math.sin(lambda) * Math.cos(OBL))
}

export const RING_PTS = makeRingPoints()
