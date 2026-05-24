export const horizontalSteps = [
  { desc: 'The Horizon: the base plane for all local observations. Every coordinate is measured relative to this circle.', config: {} },
  { desc: 'Zenith & Nadir: the vertical axis. Zenith is the point directly overhead; Nadir is directly below.', config: { showZenithNadir: true } },
  { desc: "Celestial Equator: the projection of Earth's equator onto the celestial sphere, tilted by your latitude.", config: { showZenithNadir: true, showCelestialEquator: true } },
  { desc: 'Celestial Poles: the axis around which the entire sky appears to rotate once every 24 hours.', config: { showZenithNadir: true, showCelestialEquator: true, showCelestialPoles: true } },
  { desc: 'The Meridian: great circle through Zenith and both Poles, with cardinal directions N, S, E, W on the horizon.', config: { showZenithNadir: true, showCelestialEquator: true, showCelestialPoles: true, showMeridian: true, showNESW: true } },
  { desc: 'Horizontal Coordinates: position is defined by Azimuth (angle from North along horizon) and Altitude (angle above horizon).', config: { showStep6: true, showNESW: true } },
  { desc: 'Measurement arcs: Cyan = Azimuth from North. Magenta = Altitude above horizon. Dim arc = altitude circle through the star.', config: { showStep6: true, showNESW: true, showStar: true } },
  { desc: 'Full system: drag the Latitude slider to change observer position. Spin to watch how Az & Alt evolve as Earth rotates.', config: { showZenithNadir: true, showCelestialEquator: true, showCelestialPoles: true, showNESW: true, showStar: true, showPath: true, showMeridian: true } },
]

export const equatorialSteps = [
  { desc: 'The Celestial Sphere: observer at the centre with the horizon as the reference plane.', config: { showHorizon: true } },
  { desc: "Zenith & Nadir: the local vertical axis through the observer's position on Earth.", config: { showHorizon: true, showZenith: true } },
  { desc: "Celestial Equator: projection of Earth's equator into space. Unlike the horizon, it never changes with Earth's rotation.", config: { showHorizon: true, showZenith: true, showCelestialEquator: true } },
  { desc: 'Celestial Poles: NCP & SCP mark the rotation axis. Polaris sits near the NCP for northern observers.', config: { showHorizon: true, showZenith: true, showCelestialEquator: true, showCelestialPoles: true } },
  { desc: 'Declination (δ) & Hour Angle (H): Magenta arc = Dec from the equator along the hour circle. Orange = hour circle (Pole → Star → Equator). Yellow = Pole–Zenith meridian reference arc; the angle between the two arcs is the Hour Angle.', config: { showHorizon: true, showZenith: true, showCelestialEquator: true, showCelestialPoles: true, showStar: true, showPath: true, showDecArc: true, showHAarc: true } },
  { desc: "Rotation + Latitude: Dec stays fixed while HA increases continuously as Earth rotates. Change latitude to see the pole's altitude equal the observer's latitude.", config: { showHorizon: true, showZenith: true, showCelestialEquator: true, showCelestialPoles: true, showStar: true, showPath: true, showDecArc: true, showHAarc: true } },
]

export const equatorial2Steps = [
  { desc: "The Celestial Equator: the fixed reference plane for Equatorial II coordinates. Unlike the horizon, it is the same for every observer on Earth and never shifts with Earth's rotation.", config: { showEquator: true } },
  { desc: "Celestial Poles: NCP & SCP define the fixed rotation axis. The pole altitude equals the observer's latitude, but RA/Dec themselves are independent of observer location.", config: { showEquator: true, showPoles: true } },
  { desc: "The Ecliptic & Equinoxes: the Sun's apparent annual path (orange dashes), tilted 23.5° from the equator due to Earth's axial tilt. ♈ Vernal Equinox is the zero-point of the RA grid. The Sun ☀ is shown at a fixed position along the ecliptic.", config: { showEquator: true, showPoles: true, showEcliptic: true, showStaticSun: true } },
  { desc: "Right Ascension (α) & Declination (δ): Cyan arc = RA measured eastward from ♈. Magenta arc = Declination from equator to star. Orange dashes = hour circle. The dotted ring shows the star's full diurnal/daily path (circle of constant declination).", config: { showEquator: true, showPoles: true, showEcliptic: true, showStaticSun: true, showStar: true, showStarPath: true } },
  { desc: "Full Motion: the celestial sphere rotates (Earth spinning), the Sun ☀ drifts along the ecliptic (Earth orbiting). The star rides the rotating sphere with fixed RA & Dec displayed. Use the sliders to control speeds.", config: { showEquator: true, showPoles: true, showEcliptic: true, showStar: true, showStarPath: true, showSunMotion: true, rotateSphere: true, sunSpeed: 0.5 } },
]

export const eclipticSteps = [
  { desc: "The Celestial Equator: same fixed great circle used in Equatorial II. Shown here as orientation context; ecliptic coordinates use a different reference plane altogether.", config: { showEquator: true } },
  { desc: "Celestial Poles: NCP & SCP mark the equatorial rotation axis (yellow). The ecliptic system has its own distinct pair of poles, perpendicular to the ecliptic plane rather than the equatorial plane.", config: { showEquator: true, showCelPoles: true } },
  { desc: "The Ecliptic & Equinoxes: the Sun's apparent annual path (orange dashes), tilted 23.5° from the equator. The Vernal Equinox ♈ is the zero-point for ecliptic longitude. The Sun ☀ is shown at a fixed position on the ecliptic.", config: { showEquator: true, showCelPoles: true, showEcliptic: true, showStaticSun: true } },
  { desc: "Ecliptic Poles: NEP & SEP (magenta) are perpendicular to the ecliptic plane, displaced 23.5° from the celestial poles. All great circles of ecliptic longitude pass through these two poles. The Sun ☀ sits on the ecliptic.", config: { showEquator: true, showCelPoles: true, showEcliptic: true, showEclPoles: true, showStaticSun: true } },
  { desc: "Ecliptic Longitude (λ) & Latitude (β): Orange dashed arc = great circle of longitude through NEP, the star, and its foot on the ecliptic. Cyan arc = longitude measured eastward along the ecliptic from ♈ to that foot. Magenta arc = latitude from the foot up to the star. The Sun ☀ rides the ecliptic.", config: { showEquator: true, showCelPoles: true, showEcliptic: true, showEclPoles: true, showStar: true, showStaticSun: true } },
  { desc: "Full Motion: the celestial sphere rotates (Earth's daily spin) while the Sun ☀ drifts along the ecliptic (Earth's yearly orbit). Live λ & β arcs track the star as it rotates. Stars keep fixed ecliptic coordinates. Use the sliders to control both speeds.", config: { showEquator: true, showEcliptic: true, showEclPoles: true, showStar: true, showSunMotion: true, rotateSphere: true } },
]
