export const TRANSLATIONS = {
  en: {
    // Navigation & UI
    celestialCoordinatesTitle: 'CELESTIAL COORDINATES',
    selectLanguage: 'Select Language',
    selectPreferredLanguage: 'Select your preferred language',
    canChangeAnytime: 'You can change the language anytime from the app settings',
    english: 'English',
    hindi: 'हिन्दी',
    sanskrit: 'संस्कृतम्',
    language: 'Language',
    chooseCoordinateSystem: 'Choose a Coordinate System',
    interactiveVisualizations: 'Interactive 3D visualizations to master celestial coordinate systems',
    home: 'Home',
    legend: 'Legend',
    steps: 'steps',
    learnMore: 'Learn more',
    resetView: 'Reset View',
    celestialCoords: 'Celestial Coords',
    coordinateSystems: 'Coordinate Systems',
    
    // Coordinate labels & names
    coordLabels: {
      horizontal: {
        label: 'Horizontal',
        coords: [
          { symbol: 'A', name: 'Azimuth', desc: '0°–360° from North' },
          { symbol: 'a', name: 'Altitude', desc: '0° horizon → 90°' }
        ]
      },
      equatorial1: {
        label: 'Equatorial I',
        coords: [
          { symbol: 'δ', name: 'Declination', desc: '+90° (NCP) to −90°' },
          { symbol: 'H', name: 'Hour Angle', desc: '0°–360°, westward' }
        ]
      },
      equatorial2: {
        label: 'Equatorial II',
        coords: [
          { symbol: 'α', name: 'R. Ascension', desc: '0°–360° eastward from ♈' },
          { symbol: 'δ', name: 'Declination', desc: '+90° (NCP) to −90°' }
        ]
      },
      ecliptic: {
        label: 'Ecliptic',
        coords: [
          { symbol: 'λ', name: 'Longitude', desc: '0°–360° eastward from ♈' },
          { symbol: 'β', name: 'Latitude', desc: '±90° from ecliptic plane' }
        ]
      }
    },

    // Legend items
    legendItems: {
      horizontal: [
        { label: 'Horizon' },
        { label: 'Zenith' },
        { label: 'Cel. Equator' },
        { label: 'Pole (NCP)' },
        { label: 'Meridian' },
        { label: 'Azimuth' },
        { label: 'Altitude' },
        { label: 'Alt. Circle' },
        { label: 'Star Path' }
      ],
      equatorial1: [
        { label: 'Horizon' },
        { label: 'Zenith' },
        { label: 'Cel. Equator' },
        { label: 'NCP / SCP' },
        { label: 'Declination' },
        { label: 'Hour Circle' },
        { label: 'Pole–Zenith' },
        { label: 'Star Path' }
      ],
      equatorial2: [
        { label: 'Cel. Equator' },
        { label: 'NCP / SCP' },
        { label: 'Ecliptic' },
        { label: 'Vernal Eq. ♈' },
        { label: 'Autumnal Eq. ♎' },
        { label: 'Sun ☀' },
        { label: 'Hour Circle' },
        { label: 'Right Ascension' },
        { label: 'Declination' },
        { label: 'Star ★' },
        { label: 'Diurnal Path' }
      ],
      ecliptic: [
        { label: 'Cel. Equator' },
        { label: 'NCP / SCP' },
        { label: 'Ecliptic' },
        { label: 'Vernal Eq. ♈' },
        { label: 'Autumnal Eq. ♎' },
        { label: 'NEP / SEP' },
        { label: 'Lon. Circle' },
        { label: 'Longitude λ' },
        { label: 'Latitude β' },
        { label: 'Star ★' },
        { label: 'Sun ☀' },
        { label: 'Diurnal Path' }
      ]
    },

    // Systems
    systems: {
      horizontal: {
        label: 'Horizontal',
        subtitle: 'Azimuth · Altitude',
        description: 'Based on the observer\'s location. Uses the horizon and zenith as reference points.'
      },
      equatorial1: {
        label: 'Equatorial I',
        subtitle: 'Declination · Hour Angle',
        description: 'Centered on the celestial equator. Tracks stars as they move across the sky.'
      },
      equatorial2: {
        label: 'Equatorial II',
        subtitle: 'Declination · Right Ascension',
        description: 'Fixed celestial coordinate system. Independent of observer\'s location and time.'
      },
      ecliptic: {
        label: 'Ecliptic',
        subtitle: 'Longitude · Latitude',
        description: 'Based on the sun\'s apparent path. Used for planetary and solar observations.'
      }
    },

    // Horizontal steps
    horizontalSteps: [
      { desc: 'The Horizon: the base plane for all local observations. Every coordinate is measured relative to this circle.' },
      { desc: 'Zenith & Nadir: the vertical axis. Zenith is the point directly overhead; Nadir is directly below.' },
      { desc: 'Celestial Equator: the projection of Earth\'s equator onto the celestial sphere, tilted by your latitude.' },
      { desc: 'Celestial Poles: the axis around which the entire sky appears to rotate once every 24 hours.' },
      { desc: 'The Meridian: great circle through Zenith and both Poles, with cardinal directions N, S, E, W on the horizon.' },
      { desc: 'Horizontal Coordinates: position is defined by Azimuth (angle from North along horizon) and Altitude (angle above horizon).' },
      { desc: 'Measurement arcs: Cyan = Azimuth from North. Magenta = Altitude above horizon. Dim arc = altitude circle through the star.' },
      { desc: 'Full system: drag the Latitude slider to change observer position. Spin to watch how Az & Alt evolve as Earth rotates.' }
    ],

    // Equatorial I steps
    equatorialSteps: [
      { desc: 'The Celestial Sphere: observer at the centre with the horizon as the reference plane.' },
      { desc: 'Zenith & Nadir: the local vertical axis through the observer\'s position on Earth.' },
      { desc: 'Celestial Equator: projection of Earth\'s equator into space. Unlike the horizon, it never changes with Earth\'s rotation.' },
      { desc: 'Celestial Poles: NCP & SCP mark the rotation axis. Polaris sits near the NCP for northern observers.' },
      { desc: 'Declination (δ) & Hour Angle (H): Magenta arc = Dec from the equator along the hour circle. Orange = hour circle (Pole → Star → Equator). Yellow = Pole–Zenith meridian reference arc; the angle between the two arcs is the Hour Angle.' },
      { desc: 'Rotation + Latitude: Dec stays fixed while HA increases continuously as Earth rotates. Change latitude to see the pole\'s altitude equal the observer\'s latitude.' }
    ],

    // Equatorial II steps
    equatorial2Steps: [
      { desc: 'The Celestial Equator: the fixed reference plane for Equatorial II coordinates. Unlike the horizon, it is the same for every observer on Earth and never shifts with Earth\'s rotation.' },
      { desc: 'Celestial Poles: NCP & SCP define the fixed rotation axis. The pole altitude equals the observer\'s latitude, but RA/Dec themselves are independent of observer location.' },
      { desc: 'The Ecliptic & Equinoxes: the Sun\'s apparent annual path (orange dashes), tilted 23.5° from the equator due to Earth\'s axial tilt. ♈ Vernal Equinox is the zero-point of the RA grid. The Sun ☀ is shown at a fixed position along the ecliptic.' },
      { desc: 'Right Ascension (α) & Declination (δ): Cyan arc = RA measured eastward from ♈. Magenta arc = Declination from equator to star. Orange dashes = hour circle. The dotted ring shows the star\'s full diurnal/daily path (circle of constant declination).' },
      { desc: 'Full Motion: the celestial sphere rotates (Earth spinning), the Sun ☀ drifts along the ecliptic (Earth orbiting). The star rides the rotating sphere with fixed RA & Dec displayed. Use the sliders to control speeds.' }
    ],

    // Ecliptic steps
    eclipticSteps: [
      { desc: 'The Celestial Equator: same fixed great circle used in Equatorial II. Shown here as orientation context; ecliptic coordinates use a different reference plane altogether.' },
      { desc: 'Celestial Poles: NCP & SCP mark the equatorial rotation axis (yellow). The ecliptic system has its own distinct pair of poles, perpendicular to the ecliptic plane rather than the equatorial plane.' },
      { desc: 'The Ecliptic & Equinoxes: the Sun\'s apparent annual path (orange dashes), tilted 23.5° from the equator. The Vernal Equinox ♈ is the zero-point for ecliptic longitude. The Sun ☀ is shown at a fixed position on the ecliptic.' },
      { desc: 'Ecliptic Poles: NEP & SEP (magenta) are perpendicular to the ecliptic plane, displaced 23.5° from the celestial poles. All great circles of ecliptic longitude pass through these two poles. The Sun ☀ sits on the ecliptic.' },
      { desc: 'Ecliptic Longitude (λ) & Latitude (β): Orange dashed arc = great circle of longitude through NEP, the star, and its foot on the ecliptic. Cyan arc = longitude measured eastward along the ecliptic from ♈ to that foot. Magenta arc = latitude from the foot up to the star. The Sun ☀ rides the ecliptic.' },
      { desc: 'Full Motion: the celestial sphere rotates (Earth\'s daily spin) while the Sun ☀ drifts along the ecliptic (Earth\'s yearly orbit). Live λ & β arcs track the star as it rotates. Stars keep fixed ecliptic coordinates. Use the sliders to control both speeds.' }
    ]
  },

  hi: {
    // Navigation & UI
    celestialCoordinatesTitle: 'आकाशीय निर्देशांक',
    selectLanguage: 'भाषा चुनें',
    selectPreferredLanguage: 'अपनी पसंदीदा भाषा चुनें',
    canChangeAnytime: 'आप ऐप सेटिंग्स से कभी भी भाषा बदल सकते हैं',
    english: 'English',
    hindi: 'हिन्दी',
    sanskrit: 'संस्कृतम्',
    language: 'भाषा',
    chooseCoordinateSystem: 'एक समन्वय प्रणाली चुनें',
    interactiveVisualizations: 'आकाशीय समन्वय प्रणालियों में महारत हासिल करने के लिए इंटरैक्टिव 3D दृश्य',
    home: 'होम',
    legend: 'किंवदंती',
    steps: 'कदम',
    learnMore: 'और जानें',
    resetView: 'व्यू रीसेट करें',
    celestialCoords: 'आकाशीय निर्देशांक',
    coordinateSystems: 'समन्वय प्रणाली',
    
    // Coordinate labels & names
    coordLabels: {
      horizontal: {
        label: 'क्षितिज',
        coords: [
          { symbol: 'A', name: 'दिगंश', desc: 'उत्तर से 0°–360°' },
          { symbol: 'a', name: 'ऊंचाई', desc: '0° क्षितिज → 90°' }
        ]
      },
      equatorial1: {
        label: 'विषुवतीय I',
        coords: [
          { symbol: 'δ', name: 'झुकाव', desc: '+90° (NCP) से −90°' },
          { symbol: 'H', name: 'घंटे का कोण', desc: '0°–360°, पश्चिमोन्मुख' }
        ]
      },
      equatorial2: {
        label: 'विषुवतीय II',
        coords: [
          { symbol: 'α', name: 'सही उथान', desc: '♈ से पूर्वोन्मुख 0°–360°' },
          { symbol: 'δ', name: 'झुकाव', desc: '+90° (NCP) से −90°' }
        ]
      },
      ecliptic: {
        label: 'क्रांतिवृत्त',
        coords: [
          { symbol: 'λ', name: 'देशांतर', desc: '♈ से पूर्वोन्मुख 0°–360°' },
          { symbol: 'β', name: 'अक्षांश', desc: 'क्रांतिवृत्त तल से ±90°' }
        ]
      }
    },
    
    // Legend items
    legendItems: {
      horizontal: [
        { label: 'क्षितिज' },
        { label: 'शीर्ष' },
        { label: 'आकाशीय विषुवत रेखा' },
        { label: 'ध्रुव (NCP)' },
        { label: 'मध्याह्न रेखा' },
        { label: 'दिगंश' },
        { label: 'ऊंचाई' },
        { label: 'ऊंचाई वृत्त' },
        { label: 'तारे का पथ' }
      ],
      equatorial1: [
        { label: 'क्षितिज' },
        { label: 'शीर्ष' },
        { label: 'आकाशीय विषुवत रेखा' },
        { label: 'NCP / SCP' },
        { label: 'झुकाव' },
        { label: 'घंटा वृत्त' },
        { label: 'ध्रुव–शीर्ष' },
        { label: 'तारे का पथ' }
      ],
      equatorial2: [
        { label: 'आकाशीय विषुवत रेखा' },
        { label: 'NCP / SCP' },
        { label: 'क्रांतिवृत्त' },
        { label: 'वर्नल इक्विनॉक्स ♈' },
        { label: 'शरद इक्विनॉक्स ♎' },
        { label: 'सूर्य ☀' },
        { label: 'घंटा वृत्त' },
        { label: 'सही उथान' },
        { label: 'झुकाव' },
        { label: 'तारा ★' },
        { label: 'दैनिक पथ' }
      ],
      ecliptic: [
        { label: 'आकाशीय विषुवत रेखा' },
        { label: 'NCP / SCP' },
        { label: 'क्रांतिवृत्त' },
        { label: 'वर्नल इक्विनॉक्स ♈' },
        { label: 'शरद इक्विनॉक्स ♎' },
        { label: 'NEP / SEP' },
        { label: 'देशांतर वृत्त' },
        { label: 'देशांतर λ' },
        { label: 'अक्षांश β' },
        { label: 'तारा ★' },
        { label: 'सूर्य ☀' },
        { label: 'दैनिक पथ' }
      ]
    },
    
    // Systems
    systems: {
      horizontal: {
        label: 'क्षितिज',
        subtitle: 'दिगंश · ऊंचाई',
        description: 'पर्यवेक्षक के स्थान पर आधारित। क्षितिज और शीर्ष को संदर्भ बिंदुओं के रूप में उपयोग करता है।'
      },
      equatorial1: {
        label: 'विषुवतीय I',
        subtitle: 'झुकाव · घंटे का कोण',
        description: 'आकाशीय विषुवत रेखा पर केंद्रित। आकाश में तारों की गति को ट्रैक करता है।'
      },
      equatorial2: {
        label: 'विषुवतीय II',
        subtitle: 'झुकाव · सही उथान',
        description: 'निश्चित आकाशीय समन्वय प्रणाली। पर्यवेक्षक के स्थान और समय से स्वतंत्र।'
      },
      ecliptic: {
        label: 'क्रांतिवृत्त',
        subtitle: 'देशांतर · अक्षांश',
        description: 'सूर्य के आभासी पथ पर आधारित। ग्रहों और सौर प्रेक्षणों के लिए उपयोग किया जाता है।'
      }
    },

    // Horizontal steps
    horizontalSteps: [
      { desc: 'क्षितिज: सभी स्थानीय प्रेक्षणों के लिए आधार तल। प्रत्येक समन्वय इस वृत्त के संबंध में मापा जाता है।' },
      { desc: 'शीर्ष और पाताल: ऊर्ध्वाधर अक्ष। शीर्ष सीधे ऊपर का बिंदु है; पाताल सीधे नीचे है।' },
      { desc: 'आकाशीय विषुवत रेखा: पृथ्वी की विषुवत रेखा का आकाशीय गोले पर प्रक्षेपण, आपके अक्षांश द्वारा झुका हुआ।' },
      { desc: 'आकाशीय ध्रुव: वह अक्ष जिसके चारों ओर संपूर्ण आकाश 24 घंटे में एक बार घूमता प्रतीत होता है।' },
      { desc: 'मध्याह्न रेखा: शीर्ष और दोनों ध्रुवों से गुजरने वाला महान वृत्त, क्षितिज पर कार्डिनल दिशाओं N, S, E, W के साथ।' },
      { desc: 'क्षितिज समन्वय: स्थिति को दिगंश (क्षितिज के साथ उत्तर से कोण) और ऊंचाई (क्षितिज के ऊपर कोण) द्वारा परिभाषित किया जाता है।' },
      { desc: 'मापन चाप: सियान = उत्तर से दिगंश। मैजेंटा = क्षितिज के ऊपर ऊंचाई। मंद चाप = तारे के माध्यम से ऊंचाई वृत्त।' },
      { desc: 'पूर्ण प्रणाली: पर्यवेक्षक की स्थिति बदलने के लिए अक्षांश स्लाइडर को खींचें। यह देखने के लिए घुमाएं कि Az & Alt पृथ्वी के घूमने के साथ कैसे विकसित होते हैं।' }
    ],

    // Equatorial I steps
    equatorialSteps: [
      { desc: 'आकाशीय गोला: पर्यवेक्षक केंद्र में क्षितिज को संदर्भ तल के रूप में रखता है।' },
      { desc: 'शीर्ष और पाताल: पृथ्वी पर पर्यवेक्षक की स्थिति के माध्यम से स्थानीय ऊर्ध्वाधर अक्ष।' },
      { desc: 'आकाशीय विषुवत रेखा: पृथ्वी की विषुवत रेखा का अंतरिक्ष में प्रक्षेपण। क्षितिज के विपरीत, यह पृथ्वी के घूर्णन से कभी नहीं बदलता।' },
      { desc: 'आकाशीय ध्रुव: NCP और SCP घूर्णन अक्ष को चिह्नित करते हैं। पोलारिस उत्तरी पर्यवेक्षकों के लिए NCP के पास बैठता है।' },
      { desc: 'झुकाव (δ) और घंटे का कोण (H): मैजेंटा चाप = घंटे के वृत्त के साथ विषुवत रेखा से झुकाव। नारंगी = घंटे का वृत्त (ध्रुव → तारा → विषुवत रेखा)। पीला = ध्रुव–शीर्ष मध्याह्न संदर्भ चाप; दोनों चापों के बीच का कोण घंटे का कोण है।' },
      { desc: 'घूर्णन + अक्षांश: झुकाव तय रहता है जबकि घंटे का कोण पृथ्वी के घूमने के साथ लगातार बढ़ता है। ध्रुव की ऊंचाई को पर्यवेक्षक के अक्षांश के बराबर देखने के लिए अक्षांश बदलें।' }
    ],

    // Equatorial II steps
    equatorial2Steps: [
      { desc: 'आकाशीय विषुवत रेखा: विषुवतीय II निर्देशांक के लिए निश्चित संदर्भ तल। क्षितिज के विपरीत, यह पृथ्वी पर प्रत्येक पर्यवेक्षक के लिए समान है और पृथ्वी के घूर्णन के साथ कभी नहीं बदलता।' },
      { desc: 'आकाशीय ध्रुव: NCP और SCP निश्चित घूर्णन अक्ष को परिभाषित करते हैं। ध्रुव की ऊंचाई पर्यवेक्षक के अक्षांश के बराबर होती है, लेकिन RA/Dec स्वयं पर्यवेक्षक के स्थान से स्वतंत्र होते हैं।' },
      { desc: 'क्रांतिवृत्त और विषुव: सूर्य का आभासी वार्षिक पथ (नारंगी डैश), विषुवत रेखा से 23.5° झुका हुआ पृथ्वी के अक्षीय झुकाव के कारण। ♈ वर्नल इक्विनॉक्स RA ग्रिड का शून्य बिंदु है। सूर्य ☀ क्रांतिवृत्त के साथ एक निश्चित स्थिति पर दिखाया जाता है।' },
      { desc: 'सही उथान (α) और झुकाव (δ): सियान चाप = ♈ से पूर्व की ओर मापा गया सही उथान। मैजेंटा चाप = विषुवत रेखा से तारे तक झुकाव। नारंगी डैश = घंटे का वृत्त। बिंदीदार वलय तारे का पूर्ण दैनिक पथ दिखाता है (स्थिर झुकाव का वृत्त)।' },
      { desc: 'पूर्ण गति: आकाशीय गोला घूमता है (पृथ्वी घूमना), सूर्य ☀ क्रांतिवृत्त के साथ बहता है (पृथ्वी की परिक्रमा)। तारा घूमते हुए गोले पर सवार होता है निश्चित RA और Dec के साथ। गति को नियंत्रित करने के लिए स्लाइडर्स का उपयोग करें।' }
    ],

    // Ecliptic steps
    eclipticSteps: [
      { desc: 'आकाशीय विषुवत रेखा: विषुवतीय II में उपयोग किया गया समान निश्चित महान वृत्त। यहां अभिविन्यास संदर्भ के रूप में दिखाया गया है; क्रांतिवृत्त निर्देशांक पूरी तरह से एक अलग संदर्भ तल का उपयोग करते हैं।' },
      { desc: 'आकाशीय ध्रुव: NCP और SCP विषुवतीय घूर्णन अक्ष को चिह्नित करते हैं (पीला)। क्रांतिवृत्त प्रणाली के अपने विशिष्ट ध्रुवों की जोड़ी है, विषुवतीय तल के बजाय क्रांतिवृत्त तल के लंबवत।' },
      { desc: 'क्रांतिवृत्त और विषुव: सूर्य का आभासी वार्षिक पथ (नारंगी डैश), विषुवत रेखा से 23.5° झुका हुआ। वर्नल इक्विनॉक्स ♈ क्रांतिवृत्त देशांतर का शून्य बिंदु है। सूर्य ☀ क्रांतिवृत्त पर एक निश्चित स्थिति पर दिखाया जाता है।' },
      { desc: 'क्रांतिवृत्त ध्रुव: NEP और SEP (मैजेंटा) क्रांतिवृत्त तल के लंबवत हैं, आकाशीय ध्रुवों से 23.5° विस्थापित। क्रांतिवृत्त देशांतर के सभी महान वृत्त इन दोनों ध्रुवों से गुजरते हैं। सूर्य ☀ क्रांतिवृत्त पर बैठता है।' },
      { desc: 'क्रांतिवृत्त देशांतर (λ) और अक्षांश (β): नारंगी डैश चाप = NEP, तारे और क्रांतिवृत्त पर उसके पद के माध्यम से देशांतर का महान वृत्त। सियान चाप = ♈ से उस पद तक क्रांतिवृत्त के साथ पूर्व की ओर मापा गया देशांतर। मैजेंटा चाप = पद से तारे तक अक्षांश। सूर्य ☀ क्रांतिवृत्त पर सवार होता है।' },
      { desc: 'पूर्ण गति: आकाशीय गोला घूमता है (पृथ्वी की दैनिक स्पिन) जबकि सूर्य ☀ क्रांतिवृत्त के साथ बहता है (पृथ्वी की वार्षिक परिक्रमा)। लाइव λ और β चाप तारे को घूमते हुए ट्रैक करते हैं। तारे निश्चित क्रांतिवृत्त निर्देशांक रखते हैं। दोनों गति को नियंत्रित करने के लिए स्लाइडर्स का उपयोग करें।' }
    ]
  },

  sa: {
    // Navigation & UI
    celestialCoordinatesTitle: 'खगोल निर्देशांक',
    selectLanguage: 'भाषा निर्वयनं कुरुध्वम्',
    selectPreferredLanguage: 'भवत: प्रिय भाषा निर्वयनं कुरुध्वम्',
    canChangeAnytime: 'अनुप्रयोग व्यवस्थापनात् कदाचिद् भाषा परिवर्तयितुं शक्नोषि',
    english: 'English',
    hindi: 'हिन्दी',
    sanskrit: 'संस्कृतम्',
    language: 'भाषा',
    chooseCoordinateSystem: 'खगोल समन्वय व्यवस्था निर्वयनं कुरुध्वम्',
    interactiveVisualizations: 'खगोल समन्वय व्यवस्था महाविद्या योग्यता प्राप्तये इंटरैक्टिव त्रिविम दृश्य',
    home: 'गृहम्',
    legend: 'आख्यान',
    steps: 'पदानि',
    learnMore: 'अधिकं जानुध्वम्',
    resetView: 'दृश्य पुनः स्थापयतु',
    celestialCoords: 'खगोल निर्देशांक',
    coordinateSystems: 'समन्वय व्यवस्था',
    
    // Coordinate labels & names
    coordLabels: {
      horizontal: {
        label: 'क्षितिज',
        coords: [
          { symbol: 'A', name: 'दिशाकोण', desc: 'उत्तरतः 0°–360°' },
          { symbol: 'a', name: 'उन्नयनकोण', desc: '0° क्षितिज → 90°' }
        ]
      },
      equatorial1: {
        label: 'विषुवतीय प्रथम',
        coords: [
          { symbol: 'δ', name: 'विक्षेपण', desc: '+90° (NCP) तः −90°' },
          { symbol: 'H', name: 'घटिकाकोण', desc: '0°–360°, पश्चिमदिशि' }
        ]
      },
      equatorial2: {
        label: 'विषुवतीय द्वितीय',
        coords: [
          { symbol: 'α', name: 'सम्यगुत्थान', desc: '♈ तः पूर्वदिशि 0°–360°' },
          { symbol: 'δ', name: 'विक्षेपण', desc: '+90° (NCP) तः −90°' }
        ]
      },
      ecliptic: {
        label: 'क्रांतिवृत्त',
        coords: [
          { symbol: 'λ', name: 'देशांतरः', desc: '♈ तः पूर्वदिशि 0°–360°' },
          { symbol: 'β', name: 'अक्षांश', desc: 'क्रांतिवृत्त तलात् ±90°' }
        ]
      }
    },
    
    // Legend items
    legendItems: {
      horizontal: [
        { label: 'क्षितिज' },
        { label: 'शिखरम्' },
        { label: 'आकाश विषुववृत्त' },
        { label: 'ध्रुव (NCP)' },
        { label: 'मध्याह्न वृत्त' },
        { label: 'दिशाकोण' },
        { label: 'उन्नयनकोण' },
        { label: 'उन्नयन वृत्त' },
        { label: 'नक्षत्र पथ' }
      ],
      equatorial1: [
        { label: 'क्षितिज' },
        { label: 'शिखरम्' },
        { label: 'आकाश विषुववृत्त' },
        { label: 'NCP / SCP' },
        { label: 'विक्षेपण' },
        { label: 'घटिका वृत्त' },
        { label: 'ध्रुव–शिखर' },
        { label: 'नक्षत्र पथ' }
      ],
      equatorial2: [
        { label: 'आकाश विषुववृत्त' },
        { label: 'NCP / SCP' },
        { label: 'क्रांतिवृत्त' },
        { label: 'वर्ण विषुव ♈' },
        { label: 'शरद् विषुव ♎' },
        { label: 'सूर्य ☀' },
        { label: 'घटिका वृत्त' },
        { label: 'सम्यगुत्थान' },
        { label: 'विक्षेपण' },
        { label: 'नक्षत्र ★' },
        { label: 'दैनिक पथ' }
      ],
      ecliptic: [
        { label: 'आकाश विषुववृत्त' },
        { label: 'NCP / SCP' },
        { label: 'क्रांतिवृत्त' },
        { label: 'वर्ण विषुव ♈' },
        { label: 'शरद् विषुव ♎' },
        { label: 'NEP / SEP' },
        { label: 'देशांतर वृत्त' },
        { label: 'देशांतरः λ' },
        { label: 'अक्षांश β' },
        { label: 'नक्षत्र ★' },
        { label: 'सूर्य ☀' },
        { label: 'दैनिक पथ' }
      ]
    },
    
    // Systems
    systems: {
      horizontal: {
        label: 'क्षितिज',
        subtitle: 'दिशाकोण · उन्नयनकोण',
        description: 'प्रेक्षक स्थानम् आधारम्। क्षितिज तथा शिखरबिंदुं संदर्भबिंदुभिः यथा उपयोजयति।'
      },
      equatorial1: {
        label: 'विषुवतीय प्रथम',
        subtitle: 'विक्षेपण · घटिकाकोण',
        description: 'आकाश विषुववृत्त केंद्रीकृत। नक्षत्रैः गगने गत्या अनुसरणं कुरु।'
      },
      equatorial2: {
        label: 'विषुवतीय द्वितीय',
        subtitle: 'विक्षेपण · सम्यगुत्थान',
        description: 'निश्चित आकाश समन्वय व्यवस्था। प्रेक्षक स्थान कालाभ्यां स्वातंत्र्य।'
      },
      ecliptic: {
        label: 'क्रांतिवृत्त',
        subtitle: 'देशांतर · अक्षांश',
        description: 'सूर्य आभासीय पथ आधारम्। ग्रह सूर्य प्रेक्षणाय उपयोजति।'
      }
    },

    // Horizontal steps
    horizontalSteps: [
      { desc: 'क्षितिज: सर्व स्थानीय प्रेक्षणानां आधार तलम्। प्रत्येक समन्वय अस्य वृत्त समक्षे परिमाणं कृते।' },
      { desc: 'शिखर तथा पाताल: ऊर्ध्वाधर अक्षः। शिखरं सरलरूपेण ऊर्ध्वदिशि; पातालं सरलरूपेण अधोदिशि।' },
      { desc: 'आकाश विषुववृत्त: पृथिव्या विषुववृत्त आकाश गोल प्रक्षेपः, भवत: अक्षांशेन अनुहत:।' },
      { desc: 'आकाश ध्रुव: ययोः चारु अस्य समस्त आकाशः चतुर्विंशत घटिकाभ्यां अक्षदिशि परिभ्रमणं कुरु।' },
      { desc: 'मध्याह्न वृत्त: शिखर तथा उभयध्रुवेषु गमन महान् वृत्त, क्षितिजे दिकचिहनैः उत्तर दक्षिण पूर्व पश्चिमैः।' },
      { desc: 'क्षितिज समन्वय: स्थानं दिशाकोण (उत्तरतः क्षितिजे कोण) तथा उन्नयनकोण (क्षितिजे ऊर्ध्वे कोण) परिभाषित।' },
      { desc: 'परिमाण चाप: नीलवर्ण = उत्तरतः दिशाकोण। माजेंटा = क्षितिजे ऊर्ध्वे उन्नयनकोण। मंद चाप = नक्षत्रेण उन्नयन वृत्त।' },
      { desc: 'सम्पूर्ण व्यवस्था: प्रेक्षक स्थान परिवर्तनाय अक्षांश श्लिप्तिं खिंचति। आकाशं भ्रमणोदित दिशाकोण तथा उन्नयनकोण पृथिव्या घूर्णनैः कथं विकसते इति पश्य।' }
    ],

    // Equatorial I steps
    equatorialSteps: [
      { desc: 'आकाश गोल: प्रेक्षक केंद्रे क्षितिज संदर्भ तलम्।' },
      { desc: 'शिखर तथा पाताल: पृथिव्यां प्रेक्षक स्थानेन ऊर्ध्वाधर अक्षः।' },
      { desc: 'आकाश विषुववृत्त: पृथिव्या विषुववृत्त अंतरिक्षे प्रक्षेपः। क्षितिजाद् विपरीत, पृथिव्या घूर्णनेन कदापि न परिवर्तते।' },
      { desc: 'आकाश ध्रुव: NCP तथा SCP घूर्णन अक्षं चिह्नयतः। पोलारिस उत्तर प्रेक्षकानां NCP निकटे तिष्ठति।' },
      { desc: 'विक्षेपण तथा घटिकाकोण: माजेंटा चाप = विषुववृत्तात् घटिकावृत्तेन विक्षेपणम्। नारंगी = घटिकावृत्त। पीत = ध्रुव शिखर मध्याह्न संदर्भ चाप; उभयचाप कोणः घटिकाकोणः।' },
      { desc: 'भ्रमण तथा अक्षांश: विक्षेपण स्थिरं यदा घटिकाकोणः पृथिव्या घूर्णनेन निरंतरं वर्धते। ध्रुव ऊंचाई प्रेक्षक अक्षांश समानं पश्य।' }
    ],

    // Equatorial II steps
    equatorial2Steps: [
      { desc: 'आकाश विषुववृत्त: विषुवतीय द्वितीय निर्देशांकानां निश्चित संदर्भ तलम्। क्षितिजात् विपरीत, यत् पृथिव्यां प्रत्येक प्रेक्षकस्य समानं, पृथिव्या घूर्णनेन कदापि न परिवर्तते।' },
      { desc: 'आकाश ध्रुव: NCP तथा SCP निश्चित घूर्णन अक्षं परिभाषयतः। ध्रुव ऊंचाई प्रेक्षक अक्षांश समानं, परंतु सम्यगुत्थान विक्षेपणेन प्रेक्षक स्थानात् स्वतंत्रौ।' },
      { desc: 'क्रांतिवृत्त तथा विषुव: सूर्य आभासीय वार्षिक पथः (नारंगी डैश), विषुववृत्तात् 23.5° अनुहत पृथिव्या अक्षीय अनुहतेः कारणात्। ♈ वर्ण विषुवकालः सम्यगुत्थान ग्रिड शून्य बिंदुः। सूर्य ☀ क्रांतिवृत्तेन निश्चित स्थानम्।' },
      { desc: 'सम्यगुत्थान तथा विक्षेपण: नीलवर्ण चाप = ♈ अग् पूर्वदिशि मापित सम्यगुत्थानम्। माजेंटा चाप = विषुववृत्तात् नक्षत्रे विक्षेपणम्। नारंगी डैश = घटिकावृत्तः। बिंदु वलयः नक्षत्र पूर्ण दैनिक पथम्।' },
      { desc: 'सम्पूर्ण गति: आकाश गोल भ्रमणं कुरु (पृथिव्या घूर्णन), सूर्य ☀ क्रांतिवृत्तेन वहते (पृथिव्या परिक्रमणम्)। नक्षत्रं भ्रमणग्रह निश्चित सम्यगुत्थान विक्षेपणेन। गति नियंत्रणार्थ श्लिप्तिनां उपयोगं कुरु।' }
    ],

    // Ecliptic steps
    eclipticSteps: [
      { desc: 'आकाश विषुववृत्त: विषुवतीय द्वितीयेन उपयुक्त समानं निश्चित महान् वृत्तम्। इह अभिविन्यास संदर्भ रूपेण दर्शनीयः; क्रांतिवृत्त निर्देशांकैः सर्वथा भिन्न संदर्भ तलम्।' },
      { desc: 'आकाश ध्रुव: NCP तथा SCP विषुवतीय घूर्णन अक्षं चिह्नयतः (पीतः)। क्रांतिवृत्त व्यवस्थायां स्वकीय विशिष्ट ध्रुव युगलः, विषुवतीय तलात् परिवर्तनः क्रांतिवृत्त तलात्।' },
      { desc: 'क्रांतिवृत्त तथा विषुव: सूर्य आभासीय वार्षिक पथः (नारंगी डैश), विषुववृत्तात् 23.5° अनुहत। वर्ण विषुवकालः ♈ क्रांतिवृत्त देशांतर शून्य बिंदुः। सूर्य ☀ क्रांतिवृत्तेन निश्चित स्थानम्।' },
      { desc: 'क्रांतिवृत्त ध्रुव: NEP तथा SEP (माजेंटा) क्रांतिवृत्त तलात् समकोणेन, आकाश ध्रुवेभ्यः 23.5° विस्थापितौ। क्रांतिवृत्त देशांतर सर्वे महान् वृत्तौ अनुभयध्रुवेषु गच्छतः। सूर्य ☀ क्रांतिवृत्तेन।' },
      { desc: 'क्रांतिवृत्त देशांतर तथा अक्षांश: नारंगी डैश चाप = NEP, नक्षत्र तथा क्रांतिवृत्त पदेन महान् वृत्त। नीलवर्ण चाप = ♈ तः पदेन क्रांतिवृत्तेन पूर्वदिशि मापित देशांतरम्। माजेंटा चाप = पदात् नक्षत्रे अक्षांशम्। सूर्य ☀ क्रांतिवृत्तेन वहते।' },
      { desc: 'सम्पूर्ण गति: आकाश गोल भ्रमणं कुरु (पृथिव्या दैनिक घूर्णन) यदा सूर्य ☀ क्रांतिवृत्तेन वहते (पृथिव्या वार्षिक परिक्रमणम्)। लाइव देशांतर अक्षांश चाप नक्षत्रम् अनुसरणं कुर्वति। नक्षत्रैः निश्चित क्रांतिवृत्त निर्देशांक। श्लिप्तिनां सर्व गति नियंत्रणार्थ उपयोगं कुरु।' }
    ]
  }
}

export function getTranslation(lang, key, defaultValue = '') {
  const keys = key.split('.')
  let value = TRANSLATIONS[lang]
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      return defaultValue
    }
  }
  
  return value || defaultValue
}
