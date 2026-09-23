/**
 * Real VIARIDEZ content sourced from the project brief.
 * Used by scripts/seed.ts to populate MongoDB. No placeholder / lorem ipsum.
 */

export const COMPANY = {
  legalName: 'Viaridez Transportation by Bus Rental L.L.C.',
  companyName: 'ViaRidez',
  tagline: 'Enterprise Employee Transportation & Corporate Mobility',
  hqAddress:
    'Regal Tower, Office 2906, 29th Floor, Al Mustaqbal St, Business Bay, Dubai, UAE',
  email: 'info@viaridez.ae',
  phone: '+971 4 000 0000',
  whatsapp: '+971500000000',
}

/* --------------------------- Parent services ---------------------------- */
export const PARENT_SERVICES = [
  {
    title: 'Corporate & Institutional Transport',
    slug: 'corporate-institutional-transport',
    category: 'corporate',
    icon: 'building-2',
    excerpt:
      'Managed employee transportation, staff shuttles and executive mobility for enterprises, free zones and institutions across Dubai and the UAE.',
    heroTitle: 'Corporate & Institutional Transport in Dubai',
    heroSubtitle:
      'Reliable, RTA-compliant staff transport engineered for enterprise operations — from daily employee shuttles to executive chauffeur programmes.',
    body: 'ViaRidez runs end-to-end corporate mobility programmes for companies that treat the daily commute as mission-critical. We combine a modern, well-maintained fleet, trained professional drivers and live operational oversight to move your workforce safely, on time and cost-effectively. Every contract is built around your shift patterns, headcount and pickup geography — with clear SLAs, transparent reporting and a single account team accountable for performance.',
    features: [
      { icon: 'route', title: 'Route optimisation', description: 'Data-driven routing tuned to your shift timings and staff locations.' },
      { icon: 'shield-check', title: 'RTA-compliant fleet', description: 'Fully licensed vehicles and vetted, professionally trained drivers.' },
      { icon: 'gauge', title: 'Live oversight', description: 'GPS tracking and operational monitoring on every trip.' },
      { icon: 'file-text', title: 'Enterprise reporting', description: 'Attendance, punctuality and utilisation reporting for your team.' },
    ],
    benefits: [
      'Dedicated account management and clear SLAs',
      'Scalable capacity from 7-seat vans to 50+ seat coaches',
      'Predictable monthly contracts with transparent pricing',
    ],
    keywords: [
      'corporate staff transport Dubai',
      'employee shuttle service Dubai',
      'staff bus rental Dubai',
      'corporate transportation company UAE',
    ],
    metaTitle: 'Corporate Staff Transport Dubai | ViaRidez',
    metaDescription:
      'Managed corporate & institutional transport in Dubai — RTA-compliant employee shuttles, staff bus rental and executive mobility for enterprises and free zones.',
  },
  {
    title: 'Tourism & Leisure',
    slug: 'tourism-leisure',
    category: 'general',
    icon: 'palm-tree',
    excerpt:
      'Sightseeing transfers, desert safari and theme-park transport, hotel guest shuttles and cruise terminal transfers across Dubai and the UAE.',
    heroTitle: 'Tourism & Leisure Transport in Dubai',
    heroSubtitle:
      'Comfortable, well-presented vehicles and professional drivers for tour operators, hotels and leisure groups.',
    body: 'From city sightseeing and desert safaris to theme-park runs and cruise transfers, ViaRidez gives tour operators and hospitality partners a dependable transport backbone. Our fleet spans premium sedans through to 50-seat coaches, so groups of any size travel together in comfort. Multilingual, professionally trained drivers and punctual scheduling protect your guest experience and your reputation.',
    features: [
      { icon: 'map', title: 'City tours', description: 'Sightseeing transfers with well-presented vehicles and drivers.' },
      { icon: 'sun', title: 'Desert & theme parks', description: 'IMG Worlds, Global Village and desert safari transport.' },
      { icon: 'hotel', title: 'Hotel partnerships', description: 'Dedicated guest shuttle programmes for hotels and resorts.' },
      { icon: 'ship', title: 'Cruise transfers', description: 'Reliable cruise terminal pickups and drop-offs.' },
    ],
    benefits: [
      'Fleet from premium sedans to 50+ seat coaches',
      'Professional, multilingual drivers',
      'Reliable scheduling that protects the guest experience',
    ],
    keywords: [
      'tourism transport Dubai',
      'city tour transfers Dubai',
      'sightseeing bus rental Dubai',
    ],
    metaTitle: 'Tourism & Leisure Transport Dubai | ViaRidez',
    metaDescription:
      'Sightseeing transfers, desert safari & theme-park transport, hotel guest shuttles and cruise terminal transfers across Dubai — comfortable fleet, professional drivers.',
  },
  {
    title: 'Individual & On-Demand Transport',
    slug: 'individual-on-demand-transport',
    category: 'general',
    icon: 'user',
    excerpt:
      'Airport transfers, daily commuter subscriptions, inter-emirate shuttles and premium vehicle rentals for individuals and small groups.',
    heroTitle: 'Individual & On-Demand Transport in Dubai',
    heroSubtitle:
      'Airport transfers, daily car-lift subscriptions, inter-emirate shuttles and premium rentals — booked around you.',
    body: 'Not every journey needs a fleet contract. ViaRidez offers individuals and small groups the same reliability we give enterprise clients — for airport runs, a daily home-to-office car lift, inter-emirate travel or a premium vehicle when it matters. Fixed, transparent pricing and professional drivers mean no surprises and no stress.',
    features: [
      { icon: 'plane', title: 'Airport transfers', description: 'DXB and DWC pickups with flight tracking and meet-and-greet.' },
      { icon: 'repeat', title: 'Daily commuter subscription', description: 'Home-to-office car lift on a simple monthly plan.' },
      { icon: 'milestone', title: 'Inter-emirate shuttle', description: 'Dubai to Abu Dhabi and Dubai to Sharjah routes.' },
      { icon: 'car', title: 'Premium rentals', description: 'Executive vehicles with a professional driver.' },
    ],
    benefits: [
      'Fixed, transparent pricing',
      'Flight tracking on airport transfers',
      'Simple monthly commuter plans',
    ],
    keywords: [
      'airport transfer Dubai',
      'car lift Dubai',
      'inter emirate transport',
      'premium vehicle rental Dubai',
    ],
    metaTitle: 'Airport Transfers & Car Lift Dubai | ViaRidez',
    metaDescription:
      'Individual & on-demand transport in Dubai — airport transfers, daily commuter car-lift subscriptions, inter-emirate shuttles and premium vehicle rentals.',
  },
]

/* ---------------------------- Sub-services ------------------------------ */
export const SUB_SERVICES = [
  {
    parentSlug: 'corporate-institutional-transport',
    title: 'Employee Shuttle Service',
    slug: 'employee-shuttle-service-dubai',
    category: 'corporate',
    icon: 'bus',
    excerpt:
      'Daily employee shuttle service in Dubai — dependable staff transportation and employee bus rental built around your shift patterns.',
    heroTitle: 'Employee Shuttle Service in Dubai',
    heroSubtitle:
      'Get your team to work safely and on time, every day, with a managed employee shuttle programme.',
    body: 'Our employee shuttle service takes the daily commute off your plate. ViaRidez designs routes around where your people actually live and the hours they actually work, then runs them with a modern fleet, professional drivers and live tracking. The result is higher attendance, better punctuality and a measurable lift in staff satisfaction — with one accountable team and transparent monthly billing.',
    features: [
      { icon: 'clock', title: 'On-time performance', description: 'Punctuality tracked and reported against clear SLAs.' },
      { icon: 'route', title: 'Optimised routes', description: 'Pickup routes tuned to staff locations and shift timings.' },
      { icon: 'users', title: 'Any headcount', description: 'Scale from a single van route to a full coach network.' },
    ],
    benefits: [
      'Improves attendance and punctuality',
      'Reduces the cost and risk of self-driving staff',
      'Transparent monthly contracts',
    ],
    keywords: [
      'employee shuttle service Dubai',
      'staff transportation Dubai',
      'employee bus rental Dubai',
    ],
    metaTitle: 'Employee Shuttle Service Dubai | ViaRidez',
    metaDescription:
      'Managed employee shuttle service in Dubai — reliable staff transportation and employee bus rental designed around your shift patterns and staff locations.',
  },
  {
    parentSlug: 'corporate-institutional-transport',
    title: 'Executive Chauffeur Service',
    slug: 'executive-chauffeur-service-dubai',
    category: 'corporate',
    icon: 'user-tie',
    excerpt:
      'Executive chauffeur service in Dubai — discreet, professional corporate car service for leadership, clients and VIP guests.',
    heroTitle: 'Executive Chauffeur Service in Dubai',
    heroSubtitle:
      'Premium vehicles and professional chauffeurs for executives, clients and VIP guests.',
    body: 'When the passenger is a director, an investor or a key client, the journey is part of the impression you make. ViaRidez provides a discreet, reliable executive chauffeur service with immaculate premium vehicles and professionally trained drivers. Availability is managed around your calendar, with the same operational rigour and reporting we apply to every contract.',
    features: [
      { icon: 'car', title: 'Premium fleet', description: 'Executive sedans and luxury SUVs, immaculately maintained.' },
      { icon: 'user-check', title: 'Professional chauffeurs', description: 'Discreet, well-presented, professionally trained drivers.' },
      { icon: 'calendar', title: 'Calendar-managed', description: 'Availability arranged around your leadership schedule.' },
    ],
    benefits: ['Discreet, professional service', 'Immaculate premium vehicles', 'Reliable for time-critical meetings'],
    keywords: [
      'executive chauffeur service Dubai',
      'corporate car service Dubai',
      'VIP chauffeur Dubai',
    ],
    metaTitle: 'Executive Chauffeur Service Dubai | ViaRidez',
    metaDescription:
      'Executive chauffeur service in Dubai — discreet, professional corporate car service with premium vehicles for leadership, clients and VIP guests.',
  },
  {
    parentSlug: 'corporate-institutional-transport',
    title: 'Conference & Corporate Event Transport',
    slug: 'conference-corporate-event-transport',
    category: 'corporate',
    icon: 'presentation',
    excerpt:
      'Conference transport in Dubai — coordinated delegate transfers and corporate event shuttles for conferences, summits and company events.',
    heroTitle: 'Conference & Corporate Event Transport',
    heroSubtitle:
      'Move delegates and staff between venues, hotels and airports without a hitch.',
    body: 'Corporate events run on timing. ViaRidez plans and executes delegate transfers and event shuttle loops so attendees move smoothly between airports, hotels and venues. We provide a single point of coordination, marshalled pickups and the right mix of vehicles for your numbers — from executive cars for speakers to coaches for full-delegate moves.',
    features: [
      { icon: 'users', title: 'Delegate transfers', description: 'Airport, hotel and venue transfers coordinated end to end.' },
      { icon: 'repeat', title: 'Shuttle loops', description: 'Continuous venue-to-hotel loops during multi-day events.' },
      { icon: 'headset', title: 'On-site coordination', description: 'A dedicated coordinator managing the transport plan.' },
    ],
    benefits: ['Single point of coordination', 'Right vehicle mix for any delegation', 'Marshalled, punctual pickups'],
    keywords: [
      'conference transport Dubai',
      'corporate event shuttle Dubai',
      'delegate transfer Dubai',
    ],
    metaTitle: 'Conference & Event Transport Dubai | ViaRidez',
    metaDescription:
      'Conference transport in Dubai — coordinated delegate transfers and corporate event shuttles for conferences, summits and company events.',
  },
  {
    parentSlug: 'tourism-leisure',
    title: 'City Tours & Sightseeing Transfers',
    slug: 'city-tours-sightseeing-transfers',
    category: 'general',
    icon: 'map',
    excerpt: 'City tour transfers and sightseeing bus rental in Dubai for tour operators and leisure groups.',
    heroTitle: 'City Tours & Sightseeing Transfers',
    heroSubtitle: 'Comfortable, well-presented vehicles for Dubai sightseeing and city tours.',
    body: 'ViaRidez supports tour operators and leisure groups with reliable sightseeing transport across Dubai and the UAE. Choose from premium sedans to 50-seat coaches, all driven by professional, presentable drivers who know the city. Punctual scheduling keeps your itinerary on track and your guests happy.',
    features: [
      { icon: 'map', title: 'Sightseeing routes', description: 'City tour transfers across Dubai landmarks.' },
      { icon: 'bus', title: 'Group-sized fleet', description: 'Vehicles for any group from a few guests to a full coach.' },
    ],
    benefits: ['Well-presented vehicles', 'Drivers who know the city', 'Punctual itinerary support'],
    keywords: ['city tour transfers Dubai', 'sightseeing bus rental Dubai', 'tourism transport Dubai'],
    metaTitle: 'City Tours & Sightseeing Transfers Dubai | ViaRidez',
    metaDescription:
      'City tour transfers and sightseeing bus rental in Dubai — comfortable vehicles and professional drivers for tour operators and leisure groups.',
  },
  {
    parentSlug: 'tourism-leisure',
    title: 'Desert Safari & Theme Park Transport',
    slug: 'desert-safari-theme-park-transport',
    category: 'general',
    icon: 'sun',
    excerpt: 'Desert safari transport and theme-park shuttles in Dubai — IMG Worlds, Global Village and desert camps.',
    heroTitle: 'Desert Safari & Theme Park Transport',
    heroSubtitle: 'Reliable transfers to desert camps, IMG Worlds, Global Village and beyond.',
    body: 'Get groups to the desert and the parks without the logistics headache. ViaRidez provides comfortable, air-conditioned transport for desert safari camps and Dubai theme parks including IMG Worlds and Global Village, with drivers who handle the routes daily.',
    features: [
      { icon: 'sun', title: 'Desert camps', description: 'Comfortable transfers to and from desert safari camps.' },
      { icon: 'ferris-wheel', title: 'Theme parks', description: 'IMG Worlds, Global Village and major attractions.' },
    ],
    benefits: ['Air-conditioned comfort', 'Experienced route drivers', 'Group-sized vehicles'],
    keywords: ['desert safari transport Dubai', 'theme park shuttle Dubai', 'Global Village bus rental'],
    metaTitle: 'Desert Safari & Theme Park Transport Dubai | ViaRidez',
    metaDescription:
      'Desert safari transport and theme-park shuttles in Dubai — comfortable, air-conditioned vehicles for IMG Worlds, Global Village and desert camps.',
  },
  {
    parentSlug: 'tourism-leisure',
    title: 'Hotel & Resort Guest Shuttle Partnerships',
    slug: 'hotel-resort-guest-shuttle',
    category: 'general',
    icon: 'hotel',
    excerpt: 'Dedicated guest shuttle programmes for Dubai hotels and resorts.',
    heroTitle: 'Hotel & Resort Guest Shuttle Partnerships',
    heroSubtitle: 'Branded, dependable guest shuttle programmes that protect your service scores.',
    body: 'ViaRidez partners with hotels and resorts to run dependable guest shuttle programmes — airport transfers, mall and attraction loops, and scheduled guest services. We operate as an extension of your hospitality team, with presentable vehicles and drivers who understand five-star service standards.',
    features: [
      { icon: 'hotel', title: 'Guest programmes', description: 'Scheduled guest shuttles and on-demand transfers.' },
      { icon: 'star', title: 'Five-star standards', description: 'Presentable vehicles and service-minded drivers.' },
    ],
    benefits: ['Extension of your hospitality team', 'Protects guest service scores', 'Flexible scheduled or on-demand loops'],
    keywords: ['hotel guest shuttle Dubai', 'resort transport Dubai', 'hospitality transport UAE'],
    metaTitle: 'Hotel & Resort Guest Shuttle Dubai | ViaRidez',
    metaDescription:
      'Dedicated guest shuttle partnerships for Dubai hotels and resorts — branded, dependable transport that protects your guest service scores.',
  },
  {
    parentSlug: 'tourism-leisure',
    title: 'Cruise Terminal Transfers',
    slug: 'cruise-terminal-transfers',
    category: 'general',
    icon: 'ship',
    excerpt: 'Reliable cruise terminal transfers in Dubai for cruise lines, agents and passengers.',
    heroTitle: 'Cruise Terminal Transfers',
    heroSubtitle: 'Punctual transfers between Dubai cruise terminals, airports and hotels.',
    body: 'Cruise schedules leave no room for delay. ViaRidez provides punctual, well-coordinated transfers between Dubai cruise terminals, airports and hotels — for individuals, groups and cruise-line partners. Capacity scales from sedans to coaches for full-ship movements.',
    features: [
      { icon: 'ship', title: 'Terminal transfers', description: 'Cruise terminal pickups and drop-offs on schedule.' },
      { icon: 'users', title: 'Group capacity', description: 'Sedans to coaches for full-ship movements.' },
    ],
    benefits: ['Punctual, schedule-critical service', 'Scales to full-ship movements', 'Coordinated with cruise lines and agents'],
    keywords: ['cruise terminal transfer Dubai', 'cruise transport Dubai', 'Dubai cruise shuttle'],
    metaTitle: 'Cruise Terminal Transfers Dubai | ViaRidez',
    metaDescription:
      'Reliable cruise terminal transfers in Dubai — punctual, coordinated transport between cruise terminals, airports and hotels for lines, agents and passengers.',
  },
  {
    parentSlug: 'individual-on-demand-transport',
    title: 'Airport Transfers Dubai',
    slug: 'airport-transfers-dubai',
    category: 'general',
    icon: 'plane',
    excerpt: 'Airport transfer Dubai — DXB and DWC airport pickup service with flight tracking and meet-and-greet.',
    heroTitle: 'Airport Transfers in Dubai',
    heroSubtitle: 'Stress-free DXB and DWC airport transfers with flight tracking and meet-and-greet.',
    body: 'ViaRidez makes airport travel effortless. We track your flight, monitor arrivals and have a professional driver ready at the terminal — no waiting, no surge pricing, no uncertainty. Fixed fares and a range of vehicles mean the right ride whether you travel solo or as a group.',
    features: [
      { icon: 'plane', title: 'Flight tracking', description: 'Live flight monitoring so pickups match real arrival times.' },
      { icon: 'hand', title: 'Meet & greet', description: 'A driver waiting at the terminal on arrival.' },
      { icon: 'tag', title: 'Fixed fares', description: 'Transparent pricing with no surge charges.' },
    ],
    benefits: ['No surge pricing', 'Meet-and-greet on arrival', 'Vehicles for solo travellers or groups'],
    keywords: ['airport transfer Dubai', 'DXB airport transfer service', 'Dubai airport pickup service'],
    metaTitle: 'Airport Transfer Dubai (DXB & DWC) | ViaRidez',
    metaDescription:
      'Airport transfer Dubai — DXB and DWC airport pickup service with flight tracking, meet-and-greet and fixed fares. Book solo or group transfers.',
  },
  {
    parentSlug: 'individual-on-demand-transport',
    title: 'Daily Commuter Subscription (Car Lift)',
    slug: 'daily-commuter-subscription-car-lift',
    category: 'general',
    icon: 'repeat',
    excerpt: 'Car lift Dubai — daily commute subscription for reliable home-to-office transport on a simple monthly plan.',
    heroTitle: 'Daily Commuter Subscription — Car Lift',
    heroSubtitle: 'Reliable home-to-office transport, every working day, on a simple monthly plan.',
    body: 'Skip the daily driving stress and parking costs. ViaRidez runs a daily commuter car-lift subscription that gets you from home to office and back on a fixed, predictable schedule. One monthly plan, one professional driver network, zero surge pricing.',
    features: [
      { icon: 'home', title: 'Home to office', description: 'Fixed daily pickups on your working schedule.' },
      { icon: 'wallet', title: 'Simple monthly plan', description: 'Predictable pricing with no surge charges.' },
    ],
    benefits: ['No parking or fuel costs', 'Predictable monthly pricing', 'Reliable daily schedule'],
    keywords: ['car lift Dubai', 'daily commute subscription Dubai', 'home to office transport Dubai'],
    metaTitle: 'Daily Car Lift & Commute Subscription Dubai | ViaRidez',
    metaDescription:
      'Car lift Dubai — daily commute subscription for reliable home-to-office transport on a simple, predictable monthly plan with no surge pricing.',
  },
  {
    parentSlug: 'individual-on-demand-transport',
    title: 'Inter-Emirate Shuttle Service',
    slug: 'inter-emirate-shuttle-service',
    category: 'general',
    icon: 'milestone',
    excerpt: 'Inter-emirate transport — Dubai to Abu Dhabi shuttle and Dubai to Sharjah shuttle service.',
    heroTitle: 'Inter-Emirate Shuttle Service',
    heroSubtitle: 'Comfortable, scheduled shuttles between Dubai, Abu Dhabi and Sharjah.',
    body: 'For teams and travellers moving between emirates, ViaRidez runs comfortable inter-emirate shuttles on the Dubai–Abu Dhabi and Dubai–Sharjah corridors. Scheduled departures, professional drivers and comfortable vehicles make regular inter-emirate travel simple and predictable.',
    features: [
      { icon: 'milestone', title: 'Key corridors', description: 'Dubai to Abu Dhabi and Dubai to Sharjah routes.' },
      { icon: 'clock', title: 'Scheduled departures', description: 'Predictable timetables for regular travel.' },
    ],
    benefits: ['Comfortable long-distance vehicles', 'Predictable scheduled departures', 'Professional drivers'],
    keywords: ['Dubai to Abu Dhabi shuttle', 'inter emirate transport', 'Dubai Sharjah shuttle service'],
    metaTitle: 'Inter-Emirate Shuttle Service | ViaRidez',
    metaDescription:
      'Inter-emirate transport — comfortable Dubai to Abu Dhabi shuttle and Dubai to Sharjah shuttle service with scheduled departures and professional drivers.',
  },
  {
    parentSlug: 'individual-on-demand-transport',
    title: 'Premium Vehicle Rentals',
    slug: 'premium-vehicle-rentals',
    category: 'general',
    icon: 'car',
    excerpt: 'Premium vehicle rental Dubai — executive cars and luxury SUVs with a professional driver.',
    heroTitle: 'Premium Vehicle Rentals',
    heroSubtitle: 'Executive cars and luxury SUVs with a professional driver, when it matters.',
    body: 'Some occasions call for something more. ViaRidez offers premium vehicle rentals — executive sedans and luxury SUVs — each with a professional chauffeur. Ideal for client hosting, special events and VIP travel, with the reliability and standards our corporate clients depend on.',
    features: [
      { icon: 'car', title: 'Executive & luxury', description: 'Premium sedans and luxury SUVs.' },
      { icon: 'user-check', title: 'With a driver', description: 'Every rental includes a professional chauffeur.' },
    ],
    benefits: ['Executive and luxury vehicles', 'Professional chauffeur included', 'Ideal for VIP and client hosting'],
    keywords: ['premium vehicle rental Dubai', 'luxury car rental with driver Dubai', 'executive car Dubai'],
    metaTitle: 'Premium Vehicle Rentals Dubai | ViaRidez',
    metaDescription:
      'Premium vehicle rental Dubai — executive cars and luxury SUVs with a professional driver for client hosting, events and VIP travel.',
  },
]

/* --------------------------- MICE (standalone) -------------------------- */
export const MICE_SERVICE = {
  title: 'MICE & Event Transportation',
  slug: 'mice-event-transportation',
  category: 'mice',
  icon: 'calendar-days',
  excerpt:
    'Event transportation Dubai — MICE transport UAE for conferences, exhibitions, incentives and weddings, coordinated end to end.',
  heroTitle: 'MICE & Event Transportation in Dubai',
  heroSubtitle:
    'End-to-end transport logistics for meetings, incentives, conferences, exhibitions and weddings.',
  body: 'MICE programmes live or die on logistics. ViaRidez provides complete event transportation for conferences, exhibitions, incentive groups and weddings across Dubai and the UAE — airport arrivals, hotel-to-venue loops, VIP speaker cars and full-delegation coach moves. A dedicated coordinator owns your transport plan from planning through execution, so your event runs on time.',
  features: [
    { icon: 'calendar-days', title: 'Full-event planning', description: 'Transport plans built around your event schedule.' },
    { icon: 'users', title: 'Delegation moves', description: 'Coaches, minibuses and cars matched to group sizes.' },
    { icon: 'headset', title: 'Dedicated coordinator', description: 'One owner for your transport from planning to execution.' },
    { icon: 'heart', title: 'Weddings', description: 'Guest transport and wedding bus rental across the UAE.' },
  ],
  benefits: ['Single coordinator end to end', 'Right vehicle mix for any programme', 'Proven for conferences, exhibitions and weddings'],
  keywords: ['event transportation Dubai', 'MICE transport UAE', 'wedding bus rental Dubai'],
  metaTitle: 'MICE & Event Transportation Dubai | ViaRidez',
  metaDescription:
    'Event transportation Dubai — MICE transport across the UAE for conferences, exhibitions, incentives and weddings, coordinated end to end by a dedicated team.',
}

/* -------------------------------- Fleet --------------------------------- */
export const FLEET_CATEGORIES = [
  {
    name: 'Sedans (Economy & Premium)',
    slug: 'sedans',
    capacityRange: '1–4 passengers',
    icon: 'car',
    description:
      'Economy and premium sedans for airport transfers, executive travel and individual journeys — comfortable, efficient and professionally driven.',
    metaTitle: 'Sedan Rental with Driver Dubai | ViaRidez Fleet',
    metaDescription:
      'Economy and premium sedan rental with driver in Dubai for airport transfers and executive travel — comfortable, efficient, professionally driven.',
  },
  {
    name: 'SUVs & Luxury Cars',
    slug: 'suvs-luxury-cars',
    capacityRange: '1–6 passengers',
    icon: 'car-front',
    description:
      'Premium SUVs and luxury vehicles for VIP travel, client hosting and executive chauffeur service, each with a professional driver.',
    metaTitle: 'Luxury SUV & Car Rental with Driver Dubai | ViaRidez',
    metaDescription:
      'Premium SUVs and luxury cars with driver in Dubai for VIP travel, executive chauffeur service and client hosting.',
  },
  {
    name: 'Vans (7–15 Seater)',
    slug: 'vans',
    capacityRange: '7–15 passengers',
    icon: 'bus',
    description:
      'Comfortable 7–15 seater vans for small-group staff transport, guest shuttles and family travel across Dubai and the UAE.',
    metaTitle: 'Van Rental with Driver Dubai (7–15 Seater) | ViaRidez',
    metaDescription:
      '7–15 seater van rental with driver in Dubai for small-group staff transport, guest shuttles and family travel.',
  },
  {
    name: 'Minibuses (26–34 Seater)',
    slug: 'minibuses',
    capacityRange: '26–34 passengers',
    icon: 'bus',
    description:
      'Minibus rental in Dubai — 26 to 34 seater vehicles ideal for mid-size staff shuttles, events and group transfers.',
    metaTitle: 'Minibus Rental Dubai (26–34 Seater) | ViaRidez',
    metaDescription:
      'Minibus rental Dubai — 26 seater and mini coach hire for staff shuttles, events and group transfers with professional drivers.',
  },
  {
    name: 'Coaches (50+ Seater)',
    slug: 'coaches',
    capacityRange: '50+ passengers',
    icon: 'bus',
    description:
      'Coach rental in Dubai — 50+ seater buses for large staff transport, MICE delegations and major group movements.',
    metaTitle: 'Coach Rental Dubai (50 Seater Bus) | ViaRidez',
    metaDescription:
      'Coach rental Dubai — 50 seater bus rental for large staff transport, MICE delegations and major group movements. Bus rental Dubai near you.',
  },
]

/* ----------------------------- Industries ------------------------------- */
export const INDUSTRIES = [
  {
    name: 'IT / ITES & BPO',
    slug: 'it-ites-bpo',
    icon: 'monitor',
    excerpt: '24/7 shift-based employee transport for IT, ITES and BPO operations.',
    heroTitle: 'Employee Transport for IT, ITES & BPO',
    body: 'IT and BPO operations run around the clock, and so does their transport need. ViaRidez builds shift-aligned employee shuttle programmes that keep round-the-clock teams moving safely — with late-night safety protocols, live tracking and reliable punctuality that protects productivity.',
    challenges: ['24/7 rotating shifts', 'Late-night staff safety', 'Large, dispersed workforce'],
    solutions: ['Shift-aligned routing', 'Late-night safety protocols and tracking', 'Scalable van-to-coach capacity'],
    metaTitle: 'IT, ITES & BPO Employee Transport Dubai | ViaRidez',
    metaDescription:
      '24/7 shift-based employee transport for IT, ITES and BPO operations in Dubai — safe, tracked, reliable staff shuttles that protect productivity.',
  },
  {
    name: 'Free Zones & Government Entities',
    slug: 'free-zones-government',
    icon: 'landmark',
    excerpt: 'Compliant staff transport for free-zone companies and government entities.',
    heroTitle: 'Transport for Free Zones & Government Entities',
    body: 'Free-zone and government employers need dependable, compliant staff transport at scale. ViaRidez runs employee shuttle programmes into JAFZA, DIFC, Dubai South and DMCC and supports government entities with RTA-compliant fleets, vetted drivers and transparent reporting.',
    challenges: ['Concentrated commute peaks', 'Compliance and vetting requirements', 'Large headcounts'],
    solutions: ['Free-zone route networks', 'RTA-compliant fleet and vetted drivers', 'Enterprise reporting'],
    metaTitle: 'Free Zone & Government Staff Transport Dubai | ViaRidez',
    metaDescription:
      'Compliant staff transport for free-zone companies and government entities in Dubai — JAFZA, DIFC, Dubai South and DMCC employee shuttles.',
  },
  {
    name: 'Hospitality & Tourism',
    slug: 'hospitality-tourism',
    icon: 'hotel',
    excerpt: 'Guest and staff transport for hotels, resorts and tour operators.',
    heroTitle: 'Transport for Hospitality & Tourism',
    body: 'From guest shuttles to back-of-house staff transport, ViaRidez helps hospitality and tourism businesses protect their service scores. Presentable vehicles, service-minded drivers and reliable scheduling make us a dependable extension of your team.',
    challenges: ['Guest experience expectations', 'Variable, seasonal demand', 'Staff and guest transport combined'],
    solutions: ['Branded guest shuttle programmes', 'Flexible seasonal capacity', 'Combined guest and staff transport'],
    metaTitle: 'Hospitality & Tourism Transport Dubai | ViaRidez',
    metaDescription:
      'Guest and staff transport for hotels, resorts and tour operators in Dubai — presentable vehicles and reliable scheduling that protect service scores.',
  },
  {
    name: 'Healthcare',
    slug: 'healthcare',
    icon: 'heart-pulse',
    excerpt: 'Reliable, safety-first staff transport for hospitals and healthcare providers.',
    heroTitle: 'Employee Transport for Healthcare',
    body: 'Healthcare runs on shifts and cannot tolerate no-shows. ViaRidez provides safe, punctual staff transport for hospitals and clinics �� shift-aligned routing, vetted drivers and live tracking so critical staff arrive on time, every time.',
    challenges: ['Critical shift punctuality', 'Round-the-clock rosters', 'Staff safety'],
    solutions: ['Shift-critical punctuality SLAs', '24/7 rostered routing', 'Vetted drivers and tracking'],
    metaTitle: 'Healthcare Staff Transport Dubai | ViaRidez',
    metaDescription:
      'Reliable, safety-first staff transport for hospitals and healthcare providers in Dubai — shift-aligned, tracked and punctual employee shuttles.',
  },
  {
    name: 'Banking & Finance',
    slug: 'banking-finance',
    icon: 'landmark',
    excerpt: 'Discreet, dependable corporate transport for banks and financial institutions.',
    heroTitle: 'Corporate Transport for Banking & Finance',
    body: 'Banks and financial institutions expect discretion, punctuality and compliance. ViaRidez provides executive chauffeur service and staff transport for the finance sector, with vetted drivers, immaculate vehicles and reliable reporting.',
    challenges: ['Discretion and professionalism', 'Executive and staff needs', 'Compliance expectations'],
    solutions: ['Executive chauffeur programmes', 'Compliant, vetted operations', 'Transparent reporting'],
    metaTitle: 'Banking & Finance Corporate Transport Dubai | ViaRidez',
    metaDescription:
      'Discreet, dependable corporate transport for banks and financial institutions in Dubai — executive chauffeur service and compliant staff transport.',
  },
  {
    name: 'Education',
    slug: 'education',
    icon: 'graduation-cap',
    excerpt: 'Safe, reliable transport for schools, universities and training institutions.',
    heroTitle: 'Transport for Education',
    body: 'Educational institutions need safe, dependable transport for staff and organised group movements. ViaRidez provides reliable vehicles and vetted drivers for universities, schools and training institutions, with safety and punctuality at the core.',
    challenges: ['Safety expectations', 'Scheduled group movements', 'Staff and event transport'],
    solutions: ['Vetted, safety-trained drivers', 'Scheduled and event transport', 'Reliable group capacity'],
    metaTitle: 'Education Sector Transport Dubai | ViaRidez',
    metaDescription:
      'Safe, reliable transport for schools, universities and training institutions in Dubai — vetted drivers and dependable group movements.',
  },
]

/* ------------------------------ Locations ------------------------------- */
export const LOCATIONS = [
  {
    name: 'Dubai',
    slug: 'dubai',
    type: 'city',
    countryCode: 'AE',
    isPrimary: true,
    excerpt: 'ViaRidez headquarters in Business Bay, Dubai — the hub of our UAE operations.',
    heroTitle: 'ViaRidez in Dubai',
    body: 'Our Dubai headquarters in Business Bay is the operational hub for corporate mobility across the UAE. From here we run employee shuttles, free-zone staff transport, executive chauffeur programmes and event logistics for clients throughout the emirate.',
    address: 'Regal Tower, Office 2906, 29th Floor, Al Mustaqbal St, Business Bay, Dubai, UAE',
    phone: '+971 4 000 0000',
    email: 'dubai@viaridez.ae',
    coordinates: { lat: 25.1857, lng: 55.2637 },
    highlights: ['UAE headquarters', 'Full corporate mobility operations', 'Free-zone route networks'],
    metaTitle: 'ViaRidez Dubai — Corporate Transport (Business Bay) | ViaRidez',
    metaDescription:
      'ViaRidez Dubai headquarters in Business Bay — corporate mobility, employee shuttles, free-zone staff transport and executive chauffeur service across the UAE.',
  },
  {
    name: 'Kuwait',
    slug: 'kuwait',
    type: 'country',
    countryCode: 'KW',
    excerpt: '13+ years of transportation operations via our sister entity GoRidez in Al Rai, Kuwait.',
    heroTitle: 'ViaRidez Group in Kuwait',
    body: "ViaRidez's heritage runs through Kuwait, where our sister entity GoRidez (Auto Capital, Al Rai) has delivered transportation operations for more than 13 years. That operational depth underpins the standards, systems and reliability we bring to the UAE.",
    address: 'Auto Capital, Al Rai, Kuwait',
    phone: '+965 0000 0000',
    email: 'kuwait@viaridez.ae',
    highlights: ['13+ years of operations', 'Sister entity: GoRidez', 'Foundation of group expertise'],
    metaTitle: 'ViaRidez Group in Kuwait (GoRidez) | ViaRidez',
    metaDescription:
      "ViaRidez's Kuwait operations via sister entity GoRidez — 13+ years of transportation experience in Al Rai, Kuwait, underpinning our UAE standards.",
  },
  {
    name: 'India',
    slug: 'india',
    type: 'country',
    countryCode: 'IN',
    excerpt: 'India is part of the ViaRidez group footprint.',
    heroTitle: 'ViaRidez Group Footprint — India',
    body: 'India forms part of the wider ViaRidez group footprint, extending the group’s presence and talent base beyond the Gulf as operations continue to grow.',
    highlights: ['Part of group footprint', 'Extended talent base'],
    metaTitle: 'ViaRidez Group Footprint — India | ViaRidez',
    metaDescription: 'India as part of the ViaRidez group footprint — extending the group’s presence and talent base beyond the Gulf.',
  },
  {
    name: 'Nepal',
    slug: 'nepal',
    type: 'country',
    countryCode: 'NP',
    excerpt: 'Nepal is part of the ViaRidez group footprint.',
    heroTitle: 'ViaRidez Group Footprint — Nepal',
    body: 'Nepal forms part of the wider ViaRidez group footprint, contributing to the group’s people and presence as the business expands.',
    highlights: ['Part of group footprint', 'Contributing to group presence'],
    metaTitle: 'ViaRidez Group Footprint — Nepal | ViaRidez',
    metaDescription: 'Nepal as part of the ViaRidez group footprint — contributing to the group’s people and presence.',
  },
]

/* ------------------------------ Free Zones ------------------------------ */
export const FREE_ZONES = [
  {
    name: 'JAFZA Staff Shuttle',
    abbreviation: 'JAFZA',
    slug: 'jafza-staff-shuttle',
    excerpt: 'JAFZA staff transport — dedicated employee shuttle routes into Jebel Ali Free Zone.',
    heroTitle: 'JAFZA Staff Shuttle Service',
    body: 'Jebel Ali Free Zone concentrates thousands of employees into tight commute windows. ViaRidez runs dedicated JAFZA staff transport — optimised routes, RTA-compliant vehicles and reliable punctuality that keeps free-zone operations staffed and on time. We tailor capacity to your headcount, from vans to full coaches.',
    features: ['Optimised routes into JAFZA', 'RTA-compliant fleet and vetted drivers', 'Capacity from vans to coaches', 'Live tracking and reporting'],
    routes: ['Residential clusters to JAFZA', 'Metro-link feeder routes', 'Multi-shift coverage'],
    metaTitle: 'JAFZA Staff Transport & Shuttle Dubai | ViaRidez',
    metaDescription:
      'JAFZA staff transport — dedicated employee shuttle routes into Jebel Ali Free Zone with RTA-compliant vehicles, optimised routing and live tracking.',
  },
  {
    name: 'DIFC Staff Transport',
    abbreviation: 'DIFC',
    slug: 'difc-staff-transport',
    excerpt: 'DIFC staff transport — professional employee shuttles for the financial district.',
    heroTitle: 'DIFC Staff Transport Service',
    body: 'The Dubai International Financial Centre demands discretion and reliability. ViaRidez provides professional staff transport and executive mobility into DIFC — presentable vehicles, vetted drivers and punctuality that matches the standards of the district’s financial and professional firms.',
    features: ['Professional employee shuttles', 'Executive mobility options', 'Vetted, well-presented drivers', 'Reliable district-wide coverage'],
    routes: ['Residential areas to DIFC', 'Executive point-to-point', 'Event and delegate transfers'],
    metaTitle: 'DIFC Staff Transport Dubai | ViaRidez',
    metaDescription:
      'DIFC staff transport — professional employee shuttles and executive mobility for the Dubai International Financial Centre with vetted, presentable drivers.',
  },
  {
    name: 'Dubai South Shuttle',
    abbreviation: 'Dubai South',
    slug: 'dubai-south-shuttle',
    excerpt: 'Dubai South shuttle service — employee transport for the Dubai South and Expo district.',
    heroTitle: 'Dubai South Shuttle Service',
    body: 'Dubai South and the Expo district sit at the edge of the city, making dependable staff transport essential. ViaRidez runs Dubai South shuttle services with optimised long-corridor routing, comfortable vehicles and reliable scheduling for employers in the zone.',
    features: ['Long-corridor route optimisation', 'Comfortable vehicles for longer commutes', 'Reliable multi-shift scheduling', 'Live tracking and reporting'],
    routes: ['City residential areas to Dubai South', 'Expo district coverage', 'Multi-shift services'],
    metaTitle: 'Dubai South Shuttle Service | ViaRidez',
    metaDescription:
      'Dubai South shuttle service — employee transport for the Dubai South and Expo district with optimised long-corridor routing and reliable scheduling.',
  },
  {
    name: 'DMCC Employee Shuttle',
    abbreviation: 'DMCC',
    slug: 'dmcc-employee-shuttle',
    excerpt: 'DMCC employee shuttle — staff transport for the Dubai Multi Commodities Centre (JLT).',
    heroTitle: 'DMCC Employee Shuttle Service',
    body: 'The Dubai Multi Commodities Centre in JLT is one of the busiest business districts in the region. ViaRidez provides DMCC employee shuttle services with routes tuned to JLT’s dense commute, RTA-compliant vehicles and the reliability that free-zone employers expect.',
    features: ['Routes tuned to JLT commute density', 'RTA-compliant fleet', 'Vetted, professional drivers', 'Enterprise reporting'],
    routes: ['Residential clusters to JLT / DMCC', 'Metro-link feeder routes', 'Multi-shift coverage'],
    metaTitle: 'DMCC Employee Shuttle (JLT) Dubai | ViaRidez',
    metaDescription:
      'DMCC employee shuttle — staff transport for the Dubai Multi Commodities Centre in JLT with routes tuned to commute density and RTA-compliant vehicles.',
  },
]

/* ---------------------------- Testimonials ------------------------------ */
export const TESTIMONIALS = [
  { author: 'Operations Director', role: 'Operations Director', company: 'Global BPO, Dubai', quote: 'ViaRidez took our 24/7 shuttle headache off the table. Attendance improved and our night-shift staff finally feel safe getting home.', rating: 5, featured: true },
  { author: 'HR Lead', role: 'HR Lead', company: 'Free Zone Manufacturer', quote: 'The routing into JAFZA is genuinely optimised. Reliable pickups, clear reporting, and a team that actually answers the phone.', rating: 5, featured: true },
  { author: 'Facilities Manager', role: 'Facilities Manager', company: 'Financial Services, DIFC', quote: 'Professional, discreet and always on time. Exactly what we need moving executives and staff around DIFC.', rating: 5, featured: true },
]

/* -------------------------------- FAQs ---------------------------------- */
export const FAQS = [
  { question: 'Which areas does ViaRidez operate in?', answer: 'ViaRidez operates across Dubai and the wider UAE, with dedicated free-zone routes into JAFZA, DIFC, Dubai South and DMCC. Our group also operates in Kuwait via sister entity GoRidez, with India and Nepal as part of the group footprint.', category: 'general', order: 1 },
  { question: 'Is your fleet RTA-compliant?', answer: 'Yes. Our vehicles are fully licensed and RTA-compliant, and our drivers are professionally trained and vetted.', category: 'general', order: 2 },
  { question: 'What size groups can you transport?', answer: 'Our fleet scales from sedans and 7–15 seat vans to 26–34 seat minibuses and 50+ seat coaches, so we can move anything from an individual to a full delegation.', category: 'fleet', order: 3 },
  { question: 'Do you offer contracts or one-off bookings?', answer: 'Both. We run ongoing corporate contracts with clear SLAs and monthly billing, as well as one-off bookings for events, transfers and on-demand needs.', category: 'corporate', order: 4 },
  { question: 'How do employee shuttle routes get planned?', answer: 'We build routes around where your staff live and the shifts they work, optimising for punctuality and cost. Routes are reviewed regularly as your needs change.', category: 'corporate', order: 5 },
  { question: 'Can CTAs connect to your booking app later?', answer: 'Yes. Every booking and login call-to-action is centrally configured, so it can be pointed to the ViaRidez app or portal the moment it launches — no redesign required.', category: 'general', order: 6 },
]

/* ------------------------------ Blog seed ------------------------------- */
export const BLOG_CATEGORIES = [
  { name: 'Corporate Mobility', slug: 'corporate-mobility', order: 1 },
  { name: 'Free Zones', slug: 'free-zones', order: 2 },
  { name: 'Events & MICE', slug: 'events-mice', order: 3 },
  { name: 'Fleet', slug: 'fleet', order: 4 },
]

export const BLOG_POSTS = [
  {
    title: 'How Free Zone Companies in JAFZA & DMCC Can Cut Employee Commute Costs',
    slug: 'cut-employee-commute-costs-jafza-dmcc',
    categorySlug: 'free-zones',
    excerpt: 'A practical look at how free-zone employers reduce commute cost and improve attendance with managed staff shuttles.',
    tags: ['JAFZA staff transport', 'employee commute cost Dubai'],
    body: 'Free-zone employers in JAFZA and DMCC face a common challenge: getting large numbers of staff to a single concentrated location, on time, at a predictable cost. Self-driving staff means parking pressure, reimbursement complexity and unpredictable attendance. A managed employee shuttle programme converts that variable cost into a fixed, transparent monthly contract while improving punctuality and staff satisfaction.\n\nThe savings come from three places: consolidating individual journeys into optimised routes, removing the hidden cost of late or absent staff, and freeing HR and admin teams from managing transport reimbursements. This article breaks down how to model those savings and what to look for in a transport partner.',
    metaTitle: 'Cut Employee Commute Costs in JAFZA & DMCC | ViaRidez',
    metaDescription: 'How free-zone companies in JAFZA and DMCC reduce employee commute costs and improve attendance with managed staff shuttle programmes.',
    featured: true,
  },
  {
    title: 'Coach vs. Minibus vs. Van: Choosing the Right Fleet Size for Your Event',
    slug: 'coach-vs-minibus-vs-van-fleet-size',
    categorySlug: 'fleet',
    excerpt: 'A quick guide to matching vehicle type to group size, budget and comfort for corporate events and MICE programmes.',
    tags: ['coach rental Dubai', 'minibus rental Dubai'],
    body: 'Choosing the wrong vehicle size is one of the most common — and most expensive — event transport mistakes. Too small and you run extra trips; too large and you pay for empty seats. This guide maps group sizes to the right vehicle class: vans for 7–15, minibuses for 26–34, and coaches for 50+, with notes on comfort, luggage and route suitability.\n\nWe also cover the practical factors that change the answer: multi-venue loops, VIP splits, luggage volume for airport moves, and how to combine vehicle classes in a single programme for the best cost-to-comfort balance.',
    metaTitle: 'Coach vs Minibus vs Van: Right Fleet Size | ViaRidez',
    metaDescription: 'How to choose the right fleet size — van, minibus or coach — for your corporate event or MICE programme in Dubai, balancing cost, comfort and logistics.',
    featured: false,
  },
  {
    title: 'MICE & Event Transportation in Dubai: A Planner’s Logistics Checklist',
    slug: 'mice-event-transportation-logistics-checklist',
    categorySlug: 'events-mice',
    excerpt: 'The transport logistics checklist every Dubai event planner should run before a conference, exhibition or incentive programme.',
    tags: ['conference transport Dubai', 'MICE logistics UAE'],
    body: 'Great events are invisible in their logistics — nobody notices the transport because it simply works. This checklist covers everything a planner should confirm before an event: airport arrival coordination, hotel-to-venue loops, VIP and speaker cars, delegate manifests, marshalling points, and a single accountable coordinator.\n\nWe walk through each item, the questions to ask your transport partner, and the contingency planning that keeps a programme on schedule when flights slip or numbers change on the day.',
    metaTitle: 'MICE & Event Transport Logistics Checklist Dubai | ViaRidez',
    metaDescription: 'A planner’s logistics checklist for MICE and event transportation in Dubai — airport coordination, venue loops, VIP cars and contingency planning.',
    featured: false,
  },
]

/* ------------------------------ Careers --------------------------------- */
export const CAREERS = [
  {
    title: 'Professional Driver — Corporate Shuttle',
    slug: 'professional-driver-corporate-shuttle',
    department: 'Operations',
    location: 'Dubai, UAE',
    employmentType: 'full-time',
    excerpt: 'Join our Dubai operations team as a professional shuttle driver serving corporate and free-zone clients.',
    description: 'We are hiring experienced, professional drivers for our corporate and free-zone shuttle operations in Dubai. You will operate ViaRidez vehicles safely and punctually, delivering a professional experience to our corporate passengers.',
    responsibilities: ['Operate assigned routes safely and on time', 'Maintain professional standards with passengers', 'Complete pre-trip vehicle checks', 'Follow all RTA and company safety protocols'],
    requirements: ['Valid UAE driving licence', 'Prior professional driving experience', 'Strong safety and punctuality record', 'Good spoken English'],
  },
  {
    title: 'Operations Coordinator',
    slug: 'operations-coordinator',
    department: 'Operations',
    location: 'Business Bay, Dubai',
    employmentType: 'full-time',
    excerpt: 'Coordinate routes, schedules and driver assignments for our growing corporate mobility operations.',
    description: 'As an Operations Coordinator you will own the day-to-day scheduling and route coordination that keeps our corporate transport running smoothly, working closely with clients and drivers.',
    responsibilities: ['Plan and adjust routes and schedules', 'Coordinate driver assignments', 'Handle client operational requests', 'Monitor live operations and resolve issues'],
    requirements: ['Experience in transport or logistics operations', 'Strong organisational skills', 'Comfortable with scheduling tools and tracking systems', 'Excellent communication'],
  },
]

/* ------------------------------- Clients -------------------------------- */
// Logo-less client entries render as a styled wordmark on the client wall.
// Add a `logo` path later (via the admin CMS) to show a real logo.
export const CLIENTS = [
  { name: 'Meridian Technologies', industry: 'IT / ITES & BPO' },
  { name: 'Gulf Falcon BPO', industry: 'IT / ITES & BPO' },
  { name: 'DMCC-registered enterprises', industry: 'Free Zones' },
  { name: 'Al Noor Health Group', industry: 'Healthcare' },
  { name: 'Horizon Events Group', industry: 'Events & MICE' },
  { name: 'Emirates Financial Services', industry: 'Banking & Finance' },
  { name: 'Cedar Hospitality', industry: 'Hospitality & Tourism' },
  { name: 'BlueWave Logistics', industry: 'Logistics' },
]

/* ----------------------------- Case studies ----------------------------- */
export const CASE_STUDIES = [
  {
    title: 'Scaling round-the-clock staff transport for a 1,800-seat tech campus',
    slug: 'meridian-technologies-employee-shuttle',
    client: 'Meridian Technologies',
    industry: 'IT / ITES & BPO',
    serviceType: 'Employee Shuttle Programme',
    location: 'Dubai Internet City, UAE',
    fleetSize: '24 vehicles',
    duration: 'Ongoing since 2022',
    coverImage: '/media/case-studies/tech-park-shuttle.png',
    featured: true,
    order: 0,
    excerpt:
      'How ViaRidez replaced a fragmented mix of taxis and ad-hoc vans with a single, route-optimised shuttle programme for a 24/7 technology operation.',
    challenge:
      'Meridian ran three rotating shifts across a 1,800-strong workforce spread over Dubai, Sharjah and Ajman. Staff relied on a patchwork of taxis and unmanaged vans, driving up cost, hurting punctuality and creating real safety concerns for late-night shift changes. HR had no visibility of who boarded, when, or whether trips ran on time.',
    services: ['24/7 shift-aligned shuttles', 'Route optimisation across 3 emirates', 'Live GPS tracking & trip reporting', 'Dedicated on-site coordinator'],
    solution:
      'We mapped every employee pickup against the three shift windows and designed 11 optimised routes served by a mixed fleet of vans, minibuses and coaches. Each vehicle carries GPS tracking, and a dedicated ViaRidez coordinator manages daily operations from Meridian’s campus. Attendance and punctuality feed into a monthly report for HR and Admin.',
    highlights: ['11 optimised routes replacing 40+ ad-hoc trips', 'Female-staff late-night safety protocol', 'Monthly punctuality & utilisation dashboard', 'Single monthly contract, transparent pricing'],
    result:
      'Within the first quarter, on-time arrivals rose to 99.4% and per-employee transport cost fell by 31%. Late-night safety incidents dropped to zero, and HR gained full visibility of daily ridership for the first time.',
    metrics: [
      { value: '99.4%', label: 'On-time arrivals' },
      { value: '31%', label: 'Lower transport cost' },
      { value: '1,800', label: 'Staff moved daily' },
      { value: '0', label: 'Safety incidents' },
    ],
    tags: ['employee shuttle Dubai', 'BPO transport', 'route optimisation'],
    testimonialQuote:
      'ViaRidez turned our biggest operational headache into something we no longer think about. The reporting alone changed how we plan headcount and shifts.',
    testimonialAuthor: 'Priya Nair',
    testimonialRole: 'Head of Administration, Meridian Technologies',
    gallery: ['/media/case-studies/tech-park-shuttle.png', '/media/services/corporate-shuttle.png'],
    metaTitle: 'Employee Shuttle Case Study: 1,800-Seat Tech Campus | ViaRidez',
    metaDescription:
      'ViaRidez case study — a route-optimised 24/7 employee shuttle programme lifted on-time arrivals to 99.4% and cut transport cost 31% for a Dubai tech campus.',
  },
  {
    title: 'A unified free-zone commute for a fast-growing DMCC cluster',
    slug: 'dmcc-free-zone-staff-commute',
    client: 'DMCC-registered enterprises',
    industry: 'Free Zones',
    serviceType: 'Free-Zone Commute Programme',
    location: 'JLT & DMCC, Dubai',
    fleetSize: '9 coaches & minibuses',
    duration: '6-month rollout',
    coverImage: '/media/case-studies/free-zone-coaches.png',
    order: 1,
    excerpt:
      'Consolidating the daily commute for several DMCC-registered companies into shared, metro-linked coach routes with predictable schedules.',
    challenge:
      'Multiple companies in the same free-zone towers were each arranging separate, half-empty transport. Costs were high, vehicles idled, and employees faced unreliable timings and long waits at the metro interchange.',
    services: ['Shared inter-company routes', 'Metro-linked scheduling', 'Seat-booking coordination', 'Consolidated monthly billing'],
    solution:
      'ViaRidez pooled demand across the participating companies into shared coach routes timed to metro arrivals, with a simple seat-allocation process. A single consolidated invoice replaced several fragmented contracts.',
    highlights: ['Shared routes across 5 companies', 'Timed to Dubai Metro arrivals', 'One consolidated monthly invoice', 'Higher seat utilisation, lower cost per head'],
    result:
      'Seat utilisation climbed from 54% to 91%, cost per employee dropped by 38%, and average wait time at the interchange fell from 18 minutes to under 5.',
    metrics: [
      { value: '91%', label: 'Seat utilisation' },
      { value: '38%', label: 'Cost per head saved' },
      { value: '<5 min', label: 'Avg interchange wait' },
      { value: '5', label: 'Companies served' },
    ],
    tags: ['free zone transport', 'DMCC staff commute', 'shared shuttle'],
    testimonialQuote:
      'Pooling our commute with neighbouring firms felt complicated until ViaRidez made it effortless. Utilisation and cost both moved in the right direction.',
    testimonialAuthor: 'Omar Haddad',
    testimonialRole: 'Facilities Lead, DMCC cluster',
    gallery: ['/media/case-studies/free-zone-coaches.png', '/media/industries/free-zones-government.png'],
    metaTitle: 'Free-Zone Staff Commute Case Study (DMCC) | ViaRidez',
    metaDescription:
      'ViaRidez case study — shared, metro-linked free-zone routes raised seat utilisation to 91% and cut cost per employee 38% for a DMCC company cluster.',
  },
  {
    title: 'End-to-end delegate transport for a 3,000-attendee Dubai summit',
    slug: 'horizon-events-summit-transport',
    client: 'Horizon Events Group',
    industry: 'Events & MICE',
    serviceType: 'MICE & Event Transport',
    location: 'DWTC, Dubai',
    fleetSize: '32 vehicles over 4 days',
    duration: '4-day programme',
    coverImage: '/media/case-studies/mice-event-transport.png',
    order: 2,
    excerpt:
      'Coordinating airport arrivals, hotel-to-venue loops and VIP speaker cars for a four-day international summit without a single missed transfer.',
    challenge:
      'Horizon needed flawless transport for 3,000 delegates arriving on staggered flights, staying across nine hotels, with 40+ VIP speakers requiring dedicated cars — all condensed into four intense days.',
    services: ['Airport arrival coordination', 'Hotel-to-venue shuttle loops', 'VIP & speaker chauffeur cars', 'On-site transport command desk'],
    solution:
      'A dedicated ViaRidez coordinator built a minute-by-minute transport plan: continuous hotel-venue loops, a VIP car pool with named-driver assignments, and a live command desk to reflow vehicles as flights and sessions shifted.',
    highlights: ['9 hotels on continuous loops', '40+ VIP cars with named drivers', 'Live command desk & contingency pool', 'Real-time manifest tracking'],
    result:
      'All 3,000 delegates were moved with zero missed transfers, an average venue wait under 4 minutes, and a 4.8/5 delegate transport satisfaction score.',
    metrics: [
      { value: '3,000', label: 'Delegates moved' },
      { value: '0', label: 'Missed transfers' },
      { value: '4.8/5', label: 'Delegate rating' },
      { value: '<4 min', label: 'Avg venue wait' },
    ],
    tags: ['event transport Dubai', 'MICE logistics', 'conference shuttle'],
    testimonialQuote:
      'Transport is usually where large events unravel. With ViaRidez it was the smoothest part of the entire summit.',
    testimonialAuthor: 'Sara El-Amin',
    testimonialRole: 'Event Director, Horizon Events Group',
    gallery: ['/media/case-studies/mice-event-transport.png', '/media/services/mice-events.png'],
    metaTitle: 'MICE Event Transport Case Study: 3,000-Delegate Summit | ViaRidez',
    metaDescription:
      'ViaRidez case study — end-to-end delegate transport for a 3,000-attendee Dubai summit delivered zero missed transfers and a 4.8/5 satisfaction score.',
  },
  {
    title: 'Safe, reliable night-shift transport for hospital staff',
    slug: 'al-noor-health-night-shift-transport',
    client: 'Al Noor Health Group',
    industry: 'Healthcare',
    serviceType: 'Night-Shift Staff Transport',
    location: 'Dubai & Sharjah',
    fleetSize: '14 vans & minibuses',
    duration: 'Ongoing since 2023',
    coverImage: '/media/case-studies/healthcare-staff-transport.png',
    order: 3,
    excerpt:
      'Giving clinical staff dependable door-to-door transport for demanding 24/7 rosters, with safety protocols built around late-night travel.',
    challenge:
      'Al Noor’s nurses and clinical staff worked rotating 24/7 shifts, and late-night travel was both a safety risk and a retention problem. Unreliable transport meant late arrivals that disrupted handovers.',
    services: ['24/7 rostered shuttle service', 'Door-to-door pickup for night staff', 'Vetted drivers & live tracking', 'Handover-aligned scheduling'],
    solution:
      'ViaRidez built shift-aligned routes with door-to-door pickup for night staff, vetted and trained drivers, live tracking shared with the hospital’s security desk, and schedules timed precisely to clinical handovers.',
    highlights: ['Door-to-door night pickup', 'Live tracking to security desk', 'Handover-aligned timings', 'Vetted, trained drivers'],
    result:
      'Late arrivals to handover fell by 96%, staff-reported commute safety scores rose sharply, and transport became a cited factor in improved night-shift retention.',
    metrics: [
      { value: '96%', label: 'Fewer late handovers' },
      { value: '24/7', label: 'Roster coverage' },
      { value: '+22%', label: 'Night-shift retention' },
      { value: '14', label: 'Vehicles deployed' },
    ],
    tags: ['healthcare staff transport', 'night shift transport Dubai', 'hospital shuttle'],
    testimonialQuote:
      'Our night team finally feels looked after. Dependable, safe transport has genuinely helped us keep experienced staff.',
    testimonialAuthor: 'Dr. Hana Yusuf',
    testimonialRole: 'Nursing Director, Al Noor Health Group',
    gallery: ['/media/case-studies/healthcare-staff-transport.png', '/media/industries/healthcare.png'],
    metaTitle: 'Healthcare Night-Shift Transport Case Study | ViaRidez',
    metaDescription:
      'ViaRidez case study — safe, handover-aligned night-shift transport cut late handovers 96% and lifted night-shift retention for a Dubai hospital group.',
  },
]
