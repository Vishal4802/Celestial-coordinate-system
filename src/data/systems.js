export const SYSTEMS_DATA = [
  {
    id: 'horizontal',
    label: 'Horizontal',
    subtitle: 'Azimuth · Altitude',
    description: 'Based on the observer\'s location. Uses the horizon and zenith as reference points.',
    color: '#38bdf8',
  },
  {
    id: 'equatorial1',
    label: 'Equatorial I',
    subtitle: 'Declination · Hour Angle',
    description: 'Centered on the celestial equator. Tracks stars as they move across the sky.',
    color: '#fb923c',
  },
  {
    id: 'equatorial2',
    label: 'Equatorial II',
    subtitle: 'Declination · Right Ascension',
    description: 'Fixed celestial coordinate system. Independent of observer\'s location and time.',
    color: '#a78bfa',
  },
  {
    id: 'ecliptic',
    label: 'Ecliptic',
    subtitle: 'Longitude · Latitude',
    description: 'Based on the sun\'s apparent path. Used for planetary and solar observations.',
    color: '#e879f9',
  },
]
