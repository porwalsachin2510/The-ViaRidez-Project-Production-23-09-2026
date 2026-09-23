/**
 * Default CMS section content for every editable marketing page.
 *
 * This is the source of truth used by `scripts/seed-page-content.ts` to
 * populate each `Page` document's `sections` array so the public pages render
 * their existing design out of the database — after which admins can edit
 * everything from Admin → Content → Landing Pages.
 *
 * The seeder only writes these defaults when a page has no sections yet, so it
 * NEVER overwrites content an admin has already customised.
 */

export type PageSeed = {
  slug: string
  title: string
  heroEyebrow?: string
  heroTitle: string
  heroSubtitle: string
  heroImage?: string | null
  body?: string
  sections: Record<string, unknown>[]
}

/* ------------------------------- Technology ------------------------------- */

const technology: PageSeed = {
  slug: 'technology',
  title: 'Technology Platform',
  heroTitle: 'The intelligence behind better mobility',
  heroSubtitle:
    'ViaRidez combines people, process and technology to give organisations a more reliable way to move their workforce.',
  heroImage: '/media/technology/platform-dashboard.png',
  sections: [
    {
      type: 'stat-bar',
      items: [
        { value: '13+', label: 'Years of operating heritage' },
        { value: '4', label: 'Dubai free zones served' },
        { value: '50+', label: 'Seat coaches in our fleet' },
        { value: '24/7', label: 'Operations & support desk' },
      ],
    },
    {
      type: 'split-checklist',
      variant: 'image-right',
      eyebrow: 'One connected platform',
      heading: 'Technology that earns its place in the operation',
      subheading:
        'The best mobility technology is not a dashboard for its own sake. It makes the service more predictable for passengers, more manageable for operators, and more accountable for decision-makers.',
      image: '/media/technology/platform-dashboard.png',
      imageAlt: 'ViaRidez operations dashboard showing live trips, KPIs and fleet status',
      ctaLabel: 'Book a platform walkthrough',
      ctaHref: '/book-demo',
      items: [
        { body: 'Live operations dashboard for every route and trip' },
        { body: 'Real-time GPS tracking with accurate ETAs' },
        { body: 'Onboard cameras and driver-behaviour monitoring' },
        { body: 'Utilisation, punctuality and cost analytics' },
      ],
    },
    {
      type: 'card-grid',
      background: 'secondary',
      variant: 'cols-3',
      eyebrow: 'Built for the real world',
      heading: 'Everything a modern transport programme needs',
      subheading:
        'Six capabilities that turn corporate transport from a cost centre into a well-run, measurable operation.',
      items: [
        { icon: 'smartphone', title: 'A better rider experience', body: 'Clear trip information, live ETAs and dependable communication for every employee, every day.' },
        { icon: 'map-pinned', title: 'Route intelligence', body: 'Plan routes around real demand, shift windows and operating constraints instead of guesswork.' },
        { icon: 'activity', title: 'Operational visibility', body: 'Give transport teams a live view of service performance, exceptions and daily execution.' },
        { icon: 'bar-chart', title: 'Actionable reporting', body: 'Turn utilisation, punctuality and route data into decisions that improve every month.' },
        { icon: 'shield-check', title: 'Safety by design', body: 'Vetted operators, onboard cameras and audit trails build accountability into the programme.' },
        { icon: 'bus-front', title: 'One connected operation', body: 'Bring clients, operators and internal stakeholders together around one mobility programme.' },
      ],
    },
    {
      type: 'tabs',
      variant: 'light',
      eyebrow: 'Inside the platform',
      heading: 'Four modules, one seamless operation',
      subheading:
        'Explore the core of the ViaRidez platform — from trip management to live tracking, onboard cameras and analytics.',
      items: [
        {
          icon: 'calendar-clock',
          label: 'Trip management',
          heading: 'Plan, schedule and run every trip from one place',
          body: 'Build shift-based rosters, assign routes and vehicles, and manage day-to-day execution without spreadsheets or phone calls.',
          image: '/media/technology/platform-dashboard.png',
          imageAlt: 'ViaRidez fleet operations dashboard showing live trips and KPIs',
          bullets: [
            'Route, roster and pickup-point management',
            'Shift-aware scheduling for round-the-clock operations',
            'Live trip manifests with headcount and boarding status',
            'Automated no-show and exception flagging',
          ],
        },
        {
          icon: 'map-pinned',
          label: 'Live tracking',
          heading: 'See every vehicle, every route, in real time',
          body: 'A live operational map gives transport teams and employees complete visibility of where each trip is and when it will arrive.',
          image: '/media/technology/live-tracking.png',
          imageAlt: 'Live GPS tracking map with vehicles following highlighted routes',
          bullets: [
            'Real-time GPS tracking with accurate ETAs',
            'Geofenced pickup and drop-off zones',
            'Instant route-deviation and delay alerts',
            'Shareable live trip links for riders and admins',
          ],
        },
        {
          icon: 'video',
          label: 'Cameras & safety',
          heading: 'Safety you can actually see',
          body: 'Onboard cameras and driver-behaviour monitoring build accountability into every journey, with playback for any incident.',
          image: '/media/technology/onboard-cameras.png',
          imageAlt: 'Onboard camera safety monitoring with multiple live vehicle feeds',
          bullets: [
            'Live in-vehicle and road-facing camera feeds',
            'Driver-behaviour, speed and harsh-driving alerts',
            'In-app SOS and panic workflows for riders',
            'Incident capture and timeline playback for audits',
          ],
        },
        {
          icon: 'line-chart',
          label: 'Analytics & reporting',
          heading: 'Decisions backed by operational data',
          body: 'Turn utilisation, punctuality and cost data into clear reporting your leadership and finance teams can act on every month.',
          image: '/media/technology/analytics.png',
          imageAlt: 'Analytics dashboard with performance, utilisation and cost charts',
          bullets: [
            'Utilisation, punctuality and cost-per-trip reporting',
            'Programme-level dashboards and trend analysis',
            'CO₂ and sustainability reporting for ESG goals',
            'Scheduled and on-demand exports (CSV / PDF)',
          ],
        },
      ],
    },
    {
      type: 'steps',
      background: 'secondary',
      eyebrow: 'How it works',
      heading: 'From first assessment to fully managed programme',
      subheading:
        'A structured rollout that gets your workforce moving reliably — without the operational burden landing on your team.',
      items: [
        { icon: 'radar', title: 'Map real demand', body: 'We analyse headcount, home clusters, shift patterns and site locations to understand exactly how your people move.' },
        { icon: 'map-pinned', title: 'Design smart routes', body: 'Optimised route networks maximise ridership while minimising fleet and operating cost.' },
        { icon: 'bus-front', title: 'Deploy a vetted fleet', body: 'RTA-compliant vehicles and background-checked, trained drivers go live on schedule.' },
        { icon: 'smartphone', title: 'Launch the platform', body: 'Riders book and track in-app, drivers get navigation, and your team monitors everything from one dashboard.' },
        { icon: 'activity', title: 'Run live operations', body: 'Track every vehicle and trip in real time, manage disruptions and stay ahead of problems.' },
        { icon: 'rocket', title: 'Scale with confidence', body: 'Use analytics and performance data to optimise routes, expand coverage and prove ROI.' },
      ],
    },
    {
      type: 'tabs',
      variant: 'dark',
      eyebrow: 'Built for everyone',
      heading: 'One platform, a better experience for every role',
      subheading:
        'Riders, transport admins and fleet operators each get purpose-built tools that connect into one accountable operation.',
      items: [
        {
          icon: 'building-2',
          label: 'Transport admins',
          heading: 'Full control and visibility, without the operational burden',
          points: [
            { title: 'One live view of everything', body: 'Monitor every route, vehicle and trip in real time from a single operations dashboard.' },
            { title: 'Automated rosters & routing', body: 'Let the platform handle shift-based scheduling and pickup planning instead of manual coordination.' },
            { title: 'Reporting leadership trusts', body: 'Export utilisation, punctuality and cost reports for finance, HR and ESG stakeholders.' },
            { title: 'A single point of accountability', body: 'Vetted operators, audit trails and SLAs keep the whole programme accountable to you.' },
          ],
        },
        {
          icon: 'user',
          label: 'Riders & employees',
          heading: 'A calmer, more dependable daily commute',
          points: [
            { title: 'Know exactly when your ride arrives', body: 'Live ETAs and trip notifications remove the guesswork from every pickup.' },
            { title: 'Book and manage trips in-app', body: 'Reserve seats, view schedules and manage your commute from a simple mobile app.' },
            { title: 'Safety in your pocket', body: 'In-app SOS, verified drivers and monitored vehicles mean help is always one tap away.' },
            { title: 'Share feedback that matters', body: 'Rate trips and flag issues so service quality keeps improving on your route.' },
          ],
        },
        {
          icon: 'bus-front',
          label: 'Fleet operators',
          heading: 'Clear instructions and higher vehicle utilisation',
          points: [
            { title: 'Digital manifests & navigation', body: 'Drivers get optimised routes, stops and passenger lists directly in the driver app.' },
            { title: 'Instant dispatch updates', body: 'Real-time notifications for new bookings, changes and cancellations keep every trip on track.' },
            { title: 'Better utilisation', body: 'Smart routing keeps vehicles fuller and trips efficient, reducing empty running.' },
            { title: 'Accountable operations', body: 'Camera and behaviour monitoring support safer driving and cleaner compliance records.' },
          ],
        },
      ],
    },
    {
      type: 'feature-split',
      variant: 'image-left',
      eyebrow: "In every rider's pocket",
      heading: 'A mobile app employees actually want to use',
      subheading:
        'From the first pickup to the final drop-off, the ViaRidez rider app keeps every commute informed, safe and effortless.',
      image: '/media/technology/rider-app.png',
      imageAlt: 'ViaRidez rider mobile app showing a live trip, ETA and SOS safety button',
      items: [
        { icon: 'map-pinned', title: 'Live ETA & tracking', body: 'Follow the vehicle on a live map and know exactly when it arrives.' },
        { icon: 'clipboard', title: 'Easy booking', body: 'Reserve seats and manage trips in a few taps.' },
        { icon: 'shield-check', title: 'In-app SOS', body: 'One-tap safety alerts connect riders to help instantly.' },
        { icon: 'cpu', title: 'Smart notifications', body: 'Timely updates for pickups, delays and schedule changes.' },
      ],
    },
    {
      type: 'card-grid',
      background: 'secondary',
      variant: 'cols-4',
      eyebrow: 'Trust & compliance',
      heading: 'Enterprise-grade safety, security and accountability',
      subheading:
        'Corporate transport is critical infrastructure — we treat the data and the duty of care that come with it accordingly.',
      items: [
        { icon: 'shield-check', title: 'RTA-compliant operations', body: 'Licensed vehicles and vetted, trained drivers on every route.' },
        { icon: 'lock', title: 'Data privacy & access control', body: 'Role-based access keeps sensitive trip and employee data protected.' },
        { icon: 'scroll-text', title: 'Audit trails', body: 'Every trip, exception and incident is logged for full accountability.' },
        { icon: 'user-check', title: 'Driver vetting', body: 'Background checks, training and certification before any driver goes live.' },
      ],
    },
  ],
}

/* --------------------------------- Legal --------------------------------- */

const LAST_UPDATED = 'Last updated: 1 January 2026'

const legalPrivacy: PageSeed = {
  slug: 'legal-privacy-policy',
  title: 'Privacy Policy',
  heroTitle: 'Privacy Policy',
  heroSubtitle:
    'This Privacy Policy explains how ViaRidez ("we", "us") collects, uses, discloses, and safeguards your information when you use our website and corporate mobility services. We are committed to protecting your privacy in line with the UAE Personal Data Protection Law and applicable international standards.',
  sections: [
    {
      type: 'legal',
      body: LAST_UPDATED,
      items: [
        {
          heading: 'Information We Collect',
          body: [
            'Contact details you provide through enquiry, quote, and application forms — such as your name, company, email address, and phone number.',
            'Service information required to plan transportation, including pickup and drop-off locations, passenger volumes, and scheduling preferences.',
            'Technical data collected automatically, such as IP address, browser type, and pages visited, used to improve site performance and security.',
          ],
        },
        {
          heading: 'How We Use Your Information',
          body: [
            'To respond to enquiries, prepare quotations, and deliver the transportation services you request.',
            'To manage recruitment applications and communicate about career opportunities.',
            'To improve our services, ensure security, comply with legal obligations, and — where you have consented — send relevant updates.',
          ],
        },
        {
          heading: 'Data Sharing and Retention',
          body: [
            'We do not sell your personal data. We share it only with vetted service partners and systems required to deliver our services, under strict confidentiality obligations.',
            'We retain personal data only for as long as necessary to fulfil the purposes described here or to comply with legal and contractual requirements.',
          ],
        },
        {
          heading: 'Your Rights',
          body: [
            'You may request access to, correction of, or deletion of your personal data, and you may withdraw consent to marketing communications at any time.',
            'To exercise any of these rights, contact us using the details on our Contact page.',
          ],
        },
      ],
    },
  ],
}

const legalTerms: PageSeed = {
  slug: 'legal-terms-of-service',
  title: 'Terms of Service',
  heroTitle: 'Terms of Service',
  heroSubtitle:
    'These Terms of Service govern your access to and use of the ViaRidez website and services. By using our website or engaging our services, you agree to these terms.',
  sections: [
    {
      type: 'legal',
      body: LAST_UPDATED,
      items: [
        {
          heading: 'Use of Our Website',
          body: [
            'You agree to use this website lawfully and not to attempt to disrupt its operation or security.',
            'Content on this website is provided for general information about our services and may be updated at any time without notice.',
          ],
        },
        {
          heading: 'Service Engagements',
          body: [
            'Quotations are indicative until confirmed in a written agreement. The specific terms of any transportation engagement are set out in the service contract between you and ViaRidez.',
            'Bookings, cancellations, and service levels are governed by the applicable service agreement and schedule.',
          ],
        },
        {
          heading: 'Liability',
          body: [
            'To the fullest extent permitted by law, our liability is limited to the terms set out in the relevant service agreement.',
            'We are not liable for indirect or consequential losses arising from use of this website.',
          ],
        },
        {
          heading: 'Governing Law',
          body: [
            'These terms are governed by the laws of the United Arab Emirates, and any disputes are subject to the exclusive jurisdiction of the courts of Dubai.',
          ],
        },
      ],
    },
  ],
}

const legalCookie: PageSeed = {
  slug: 'legal-cookie-policy',
  title: 'Cookie Policy',
  heroTitle: 'Cookie Policy',
  heroSubtitle:
    'This Cookie Policy explains how ViaRidez uses cookies and similar technologies to recognise you when you visit our website and to improve your experience.',
  sections: [
    {
      type: 'legal',
      body: LAST_UPDATED,
      items: [
        {
          heading: 'What Are Cookies',
          body: [
            'Cookies are small text files placed on your device that help websites function and provide analytical information.',
          ],
        },
        {
          heading: 'How We Use Cookies',
          body: [
            'Essential cookies enable core functionality such as navigation and security.',
            'Analytics cookies help us understand how visitors use our site so we can improve it. These are used only where permitted.',
          ],
        },
        {
          heading: 'Managing Cookies',
          body: [
            'You can control and delete cookies through your browser settings. Disabling some cookies may affect the functionality of the website.',
          ],
        },
      ],
    },
  ],
}

const additionalPages: PageSeed[] = [
  {
    slug: 'about',
    title: 'About ViaRidez',
    heroTitle: 'Moving people with precision, care and accountability',
    heroSubtitle: 'ViaRidez is a corporate transportation partner built for organisations that cannot afford to compromise on safety, punctuality or professionalism.',
    heroImage: '/media/sections/operations.png',
    sections: [
      {
        type: 'prose-split',
        eyebrow: 'Our mission',
        heading: 'To be the most trusted name in corporate mobility across the region',
        image: '/media/sections/fleet-lineup.png',
        imageAlt: 'ViaRidez corporate fleet lined up at a Dubai depot',
        variant: 'image-right',
        items: [
          { body: 'We partner with enterprises, institutions and free zones to design transport programmes that keep their people moving safely and on time — every single day.' },
          { body: 'From daily staff shuttles to executive chauffeur services and large-scale event logistics, our operation is engineered around dependability, compliance and a genuinely premium experience.' },
        ],
      },
      { type: 'stat-band', items: [] },
      {
        type: 'value-list',
        background: 'surface',
        eyebrow: 'What we stand for',
        heading: 'The values that drive our service',
        subheading: 'Principles we hold ourselves to on every route, every day.',
        items: [
          { icon: 'shield-check', title: 'Safety first', body: 'Rigorous driver vetting, maintenance and compliance underpin every journey.' },
          { icon: 'clock', title: 'Reliability', body: 'On-time performance is measured, monitored and continuously improved.' },
          { icon: 'headset', title: 'Service excellence', body: 'Dedicated account management and 24/7 operational support.' },
          { icon: 'gauge', title: 'Precision at scale', body: 'Smart dispatch and routing keep large programmes running smoothly.' },
          { icon: 'leaf', title: 'Sustainability', body: 'A modern, efficient fleet with a clear path toward greener mobility.' },
          { icon: 'users', title: 'People-centred', body: 'We treat every passenger and colleague with respect and care.' },
        ],
      },
    ],
  },
  {
    slug: 'why-viaridez',
    title: 'Why ViaRidez',
    heroTitle: 'Reliability engineered into every trip',
    heroSubtitle: 'For your operations, corporate transport is critical infrastructure. We build, run and report on it that way — safe, compliant and accountable, every single day.',
    sections: [
      { type: 'stat-band', items: [] },
      {
        type: 'icon-cards',
        variant: 'cols-4',
        eyebrow: 'What sets us apart',
        heading: 'Eight reasons operations leaders trust us',
        subheading: "Trust, safety, compliance and technology aren't add-ons — they're how every ViaRidez contract is designed and delivered.",
        items: [
          { icon: 'shield-check', title: 'Safety-first operations', body: 'Vetted, professionally trained drivers, enforced night-shift safety protocols and a fleet maintained to a strict preventative schedule.' },
          { icon: 'circle-check', title: 'RTA-compliant & licensed', body: 'Every vehicle and driver meets UAE Road & Transport Authority requirements, so your transport programme stays fully compliant.' },
          { icon: 'navigation', title: 'Live tracking & visibility', body: 'Real-time GPS tracking and route monitoring give your admins and passengers full visibility on every trip.' },
          { icon: 'route', title: 'Optimised routing', body: 'Data-driven route planning tuned to your shift patterns and staff geography — cutting commute times and controlling cost.' },
          { icon: 'bar-chart', title: 'Enterprise-grade reporting', body: 'Attendance, punctuality and utilisation reporting with clear SLAs, so performance is measured, not assumed.' },
          { icon: 'headset', title: 'Dedicated account support', body: 'A single point of contact and a 24/7 operations desk keep your programme running without friction.' },
          { icon: 'users', title: 'Proven operating heritage', body: 'Backed by 13+ years of transport operations through our sister entity in Kuwait — we launched in Dubai with a track record, not a learning curve.' },
          { icon: 'leaf', title: 'A modern, efficient fleet', body: 'From executive sedans to 50+ seat coaches, a well-presented fleet with a clear path toward greener mobility.' },
        ],
      },
      {
        type: 'prose-columns',
        background: 'primary',
        eyebrow: 'The ViaRidez difference',
        heading: 'More than a bus rental — a managed mobility partner',
        items: [
          { heading: 'Built for enterprise operations', body: 'We treat corporate transport as critical infrastructure. Contracts are engineered around your headcount, shift timings and pickup geography — with the reporting and accountability procurement teams expect.' },
          { heading: 'Compliance you can substantiate', body: "RTA-licensed vehicles and vetted drivers are the baseline, not the selling point. We keep documentation current so your organisation's duty-of-care obligations are always covered." },
          { heading: 'Technology that earns its place', body: "Live GPS tracking, route optimisation and utilisation reporting exist to reduce cost and risk for you — and to hand off cleanly to ViaRidez's booking and tracking apps as they come online." },
        ],
      },
    ],
  },
  {
    slug: 'sustainability',
    title: 'Sustainability',
    heroTitle: 'A more responsible way to move people',
    heroSubtitle: 'Sustainability is practical at ViaRidez: optimise the network, improve utilisation and transition to cleaner vehicles with evidence.',
    heroImage: '/media/sections/sustainability.png',
    sections: [
      {
        type: 'split-highlights',
        eyebrow: 'Progress over promises',
        heading: 'Sustainability that starts with the network you have',
        subheading: 'A credible sustainability programme is built from measurable operational choices. We help teams understand where shared transport, route optimisation and EV adoption can make the biggest difference.',
        items: [
          { icon: 'leaf', title: 'Smarter by default', body: 'Every route decision balances service quality, efficiency and impact.' },
          { icon: 'shield-check', title: 'Responsible by design', body: 'Safety, reliability and sustainability belong in the same operating model.' },
        ],
      },
      {
        type: 'icon-cards',
        variant: 'plain',
        eyebrow: 'Our approach',
        heading: 'Practical changes with measurable impact',
        items: [
          { icon: 'battery-charging', title: 'EV-ready fleet strategy', body: 'Introduce electric vehicles where route length, charging access and duty cycles make the business case work.' },
          { icon: 'route', title: 'Fewer empty kilometres', body: 'Better planning and consolidation can reduce unnecessary vehicle movement before changing the fleet at all.' },
          { icon: 'leaf', title: 'Lower-impact commuting', body: 'Move more people in fewer vehicles with dependable shared transport built around real employee demand.' },
          { icon: 'recycle', title: 'Measure, then improve', body: 'Track service and utilisation data so sustainability decisions are tied to operational outcomes.' },
        ],
      },
    ],
  },
  {
    slug: 'contact',
    title: 'Contact ViaRidez',
    heroTitle: 'Let’s design your mobility programme',
    heroSubtitle: 'Tell us about your routes, headcount and timelines. A ViaRidez specialist will prepare a tailored proposal — usually within one business day.',
    heroImage: '/media/services/executive-chauffeur.png',
    sections: [
      {
        type: 'note-card',
        heading: 'Operating footprint',
        body: 'Headquartered in Dubai, serving the UAE free zones, with a growing presence across Kuwait, India and Nepal.',
      },
    ],
  },
  {
    slug: 'book-demo',
    title: 'Book a Demo',
    heroTitle: 'Book a personalised demo',
    heroSubtitle: 'Pick a time that works for you. We’ll walk your team through a live demo tailored to your routes, headcount and goals — no slideware, just the platform.',
    heroImage: '/media/services/technology-platform.png',
    sections: [
      {
        type: 'icon-list',
        heading: "What we'll cover",
        items: [
          { icon: 'route', title: 'Route & fleet planning', body: 'How we design and optimise routes around your sites and shifts.' },
          { icon: 'video', title: 'Live tracking & app', body: 'The employee and admin experience, from booking to arrival.' },
          { icon: 'line-chart', title: 'Reporting & savings', body: 'Utilisation, cost and sustainability dashboards for your team.' },
          { icon: 'headset', title: 'Managed operations', body: 'SLAs, safety standards and 24/7 support that back every route.' },
        ],
      },
    ],
  },
  {
    slug: 'get-quote',
    title: 'Get a Quote',
    heroTitle: 'Get your transport cost estimate',
    heroSubtitle: 'Answer three quick questions to see an indicative monthly cost and how much you could save versus ride-hailing. We’ll follow up with a tailored proposal.',
    heroImage: '/media/services/staff-transport.png',
    sections: [
      {
        type: 'icon-list',
        heading: 'Why request a quote',
        items: [
          { icon: 'clock', title: 'Reply in 1 business day', body: 'A mobility specialist reviews every request personally.' },
          { icon: 'shield-check', title: 'No obligation', body: 'The estimate is indicative and free — no commitment required.' },
          { icon: 'circle-check', title: 'Tailored to you', body: 'Exact routing, vehicle mix and SLAs in your proposal.' },
        ],
      },
      {
        type: 'note-card',
        heading: 'Prefer to talk?',
        body: "Call our mobility team directly and we'll scope your programme over a quick call.",
      },
    ],
  },
]

/* --------------------------- Listing / index pages ------------------------ */
/**
 * Index/listing pages render their body from live collections (services,
 * fleet, case studies, locations, etc.), so these seeds exist mainly to give
 * every page an editable CMS `Page` document — the hero eyebrow, title,
 * subtitle and image become manageable from Admin → Content → Landing Pages,
 * and admins can upload a hero background just like on the other pages.
 * `sections` is intentionally empty for the pure listing pages.
 */
const listingPages: PageSeed[] = [
  {
    slug: 'home',
    title: 'Home',
    heroEyebrow: 'Corporate Mobility · Dubai & UAE',
    heroTitle: 'Enterprise transportation that keeps your workforce moving.',
    heroSubtitle:
      'Managed employee shuttles, free-zone staff transport and executive chauffeur programmes — engineered for reliability, safety and scale.',
    heroImage: '/images/hero-fleet.png',
    sections: [
      {
        type: 'trust-bar',
        eyebrow: 'Trusted by',
        heading: 'Enterprises that move with VIARIDEZ',
      },
    ],
  },
  {
    slug: 'services',
    title: 'Services',
    heroEyebrow: 'What we do',
    heroTitle: 'Enterprise mobility, engineered end to end',
    heroSubtitle:
      'From daily employee transportation to executive chauffeur and large-scale event mobility — every ViaRidez programme is managed with compliance, safety and reliability at its core.',
    heroImage: '/media/services/corporate-shuttle.png',
    sections: [],
  },
  {
    slug: 'fleet',
    title: 'Fleet',
    heroEyebrow: 'Our fleet',
    heroTitle: 'The right vehicle for every journey',
    heroSubtitle:
      'Meticulously maintained, RTA-compliant vehicles matched to your route, headcount and comfort requirements — from executive sedans to full-size coaches.',
    heroImage: '/media/sections/fleet-lineup.png',
    sections: [],
  },
  {
    slug: 'industries',
    title: 'Industries',
    heroEyebrow: 'Industries we serve',
    heroTitle: 'Transport programmes built around your sector',
    heroSubtitle:
      'We tailor mobility to the operational realities of each industry — from 24/7 IT shift shuttles to free zone employee transport and executive corporate travel.',
    heroImage: '/media/industries/it-ites-bpo.png',
    sections: [],
  },
  {
    slug: 'case-studies',
    title: 'Case Studies & Clients',
    heroEyebrow: 'Case studies & clients',
    heroTitle: 'Transport programmes that keep organisations moving',
    heroSubtitle:
      'Real outcomes for enterprises, free-zone companies and event organisers who rely on ViaRidez to move their people safely and on time.',
    heroImage: '/media/case-studies/tech-park-shuttle.png',
    sections: [],
  },
  {
    slug: 'locations',
    title: 'Locations',
    heroEyebrow: 'Where we operate',
    heroTitle: 'Regional reach, local expertise',
    heroSubtitle:
      'Headquartered in Dubai and serving the wider UAE, with an operational footprint that extends across Kuwait, India and Nepal.',
    heroImage: '/media/sections/operations.png',
    sections: [],
  },
  {
    slug: 'free-zones',
    title: 'Free Zones',
    heroEyebrow: 'Free Zone Mobility',
    heroTitle: 'Free Zone Shuttle Services Across Dubai',
    heroSubtitle:
      "Purpose-built staff transport for Dubai's most important economic zones — engineered for compliance, punctuality and scale.",
    heroImage: '/media/industries/free-zones-government.png',
    sections: [],
  },
  {
    slug: 'blog',
    title: 'Insights & News',
    heroEyebrow: 'Insights',
    heroTitle: 'Mobility insights & company news',
    heroSubtitle:
  'Perspectives on corporate transportation, operations, technology and sustainable mobility from the VIARIDEZ team.',
  heroImage: '/heroes/blog-hero.png',
    sections: [],
  },
  {
    slug: 'careers',
    title: 'Careers',
    heroEyebrow: 'Careers',
    heroTitle: 'Move your career forward with VIARIDEZ',
    heroSubtitle:
  "We're building the most reliable corporate mobility network in the region — and we're looking for people who take pride in service, safety and precision.",
  heroImage: '/heroes/careers-hero.png',
    sections: [],
  },
]

export const PAGE_CONTENT: PageSeed[] = [
  technology,
  legalPrivacy,
  legalTerms,
  legalCookie,
  ...additionalPages,
  ...listingPages,
]

