import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.development.local' })
loadEnv() // fall back to .env if present

import bcrypt from 'bcryptjs'
import { connectToDatabase } from '../lib/db/mongoose'
import {
  User,
  Service,
  FleetCategory,
  Industry,
  Location,
  FreeZone,
  Blog,
  BlogCategory,
  Testimonial,
  Client,
  CaseStudy,
  Faq,
  Career,
  SiteSettings,
  Page,
} from '../models'
import {
  COMPANY,
  PARENT_SERVICES,
  SUB_SERVICES,
  MICE_SERVICE,
  FLEET_CATEGORIES,
  INDUSTRIES,
  LOCATIONS,
  FREE_ZONES,
  TESTIMONIALS,
  FAQS,
  BLOG_CATEGORIES,
  BLOG_POSTS,
  CAREERS,
  CLIENTS,
  CASE_STUDIES,
} from './seed-data'

async function seed() {
  await connectToDatabase()
  console.log('Connected. Seeding ViaRidez content...')

  // Admin user
  const adminEmail = 'admin@viaridez.ae'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ViaRidez@2026'
  const passwordHash = await bcrypt.hash(adminPassword, 12)
  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    {
      name: 'ViaRidez Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      isActive: true,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  )
  console.log(`Admin user: ${adminEmail}`)

  const by = { createdBy: admin._id, updatedBy: admin._id, status: 'published' as const }

  // Services: parents first, then children referencing parents
  await Service.deleteMany({})
  const parentMap: Record<string, string> = {}
  for (const p of PARENT_SERVICES) {
    const doc = await Service.create({
      title: p.title,
      slug: p.slug,
      category: p.category,
      icon: p.icon,
      excerpt: p.excerpt,
      heroTitle: p.heroTitle,
      heroSubtitle: p.heroSubtitle,
      body: p.body,
      features: p.features,
      benefits: p.benefits,
      featured: true,
      seo: {
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        keywords: p.keywords,
      },
      ...by,
    })
    parentMap[p.slug] = doc._id.toString()
  }
  for (const s of SUB_SERVICES) {
    await Service.create({
      title: s.title,
      slug: s.slug,
      parent: parentMap[s.parentSlug],
      category: s.category,
      icon: s.icon,
      excerpt: s.excerpt,
      heroTitle: s.heroTitle,
      heroSubtitle: s.heroSubtitle,
      body: s.body,
      features: s.features,
      benefits: s.benefits,
      seo: { metaTitle: s.metaTitle, metaDescription: s.metaDescription, keywords: s.keywords },
      ...by,
    })
  }
  await Service.create({
    title: MICE_SERVICE.title,
    slug: MICE_SERVICE.slug,
    category: MICE_SERVICE.category,
    icon: MICE_SERVICE.icon,
    excerpt: MICE_SERVICE.excerpt,
    heroTitle: MICE_SERVICE.heroTitle,
    heroSubtitle: MICE_SERVICE.heroSubtitle,
    body: MICE_SERVICE.body,
    features: MICE_SERVICE.features,
    benefits: MICE_SERVICE.benefits,
    featured: true,
    seo: {
      metaTitle: MICE_SERVICE.metaTitle,
      metaDescription: MICE_SERVICE.metaDescription,
      keywords: MICE_SERVICE.keywords,
    },
    ...by,
  })
  console.log(`Services: ${await Service.countDocuments()}`)

  // Fleet categories
  await FleetCategory.deleteMany({})
  await FleetCategory.insertMany(
    FLEET_CATEGORIES.map((f, i) => ({
      name: f.name,
      slug: f.slug,
      capacityRange: f.capacityRange,
      icon: f.icon,
      description: f.description,
      order: i,
      seo: { metaTitle: f.metaTitle, metaDescription: f.metaDescription },
      ...by,
    })),
  )
  console.log(`Fleet categories: ${await FleetCategory.countDocuments()}`)

  // Professional imagery (stored in /public/media, committed with the app).
  // Services map onto a curated set of context photos by theme; fleet gets a
  // real vehicle photo per category. Editable later via the admin CMS.
  const FLEET_IMAGES: Record<string, string> = {
    sedans: '/media/fleet/sedans.png',
    'suvs-luxury-cars': '/media/fleet/suvs.png',
    minibuses: '/media/fleet/minibuses.png',
    coaches: '/media/fleet/coaches.png',
    vans: '/media/fleet/vans.png',
  }
  const SERVICE_IMAGES: Record<string, string> = {
    'corporate-institutional-transport': '/media/services/corporate-shuttle.png',
    'employee-shuttle-service-dubai': '/media/services/corporate-shuttle.png',
    'inter-emirate-shuttle-service': '/media/services/corporate-shuttle.png',
    'daily-commuter-subscription-car-lift': '/media/services/corporate-shuttle.png',
    'executive-chauffeur-service-dubai': '/media/services/executive-chauffeur.png',
    'individual-on-demand-transport': '/media/services/executive-chauffeur.png',
    'premium-vehicle-rentals': '/media/fleet/suvs.png',
    'airport-transfers-dubai': '/media/services/airport-transfer.png',
    'cruise-terminal-transfers': '/media/services/airport-transfer.png',
    'conference-corporate-event-transport': '/media/services/mice-events.png',
    'mice-event-transportation': '/media/services/mice-events.png',
    'hotel-resort-guest-shuttle': '/media/services/city-tour.png',
    'tourism-leisure': '/media/services/city-tour.png',
    'city-tours-sightseeing-transfers': '/media/services/city-tour.png',
    'desert-safari-theme-park-transport': '/media/services/desert-safari.png',
  }
  for (const [slug, image] of Object.entries(FLEET_IMAGES)) {
    await FleetCategory.updateOne({ slug }, { $set: { image } })
  }
  for (const [slug, heroImage] of Object.entries(SERVICE_IMAGES)) {
    await Service.updateOne({ slug }, { $set: { heroImage } })
  }
  console.log('Assigned fleet & service imagery')

  // Industries
  await Industry.deleteMany({})
  await Industry.insertMany(
    INDUSTRIES.map((ind, i) => ({
      name: ind.name,
      slug: ind.slug,
      icon: ind.icon,
      excerpt: ind.excerpt,
      heroTitle: ind.heroTitle,
      body: ind.body,
      challenges: ind.challenges,
      solutions: ind.solutions,
      order: i,
      featured: i < 3,
      seo: { metaTitle: ind.metaTitle, metaDescription: ind.metaDescription },
      ...by,
    })),
  )
  const INDUSTRY_IMAGES: Record<string, string> = {
    'hospitality-tourism': '/media/industries/hospitality-tourism.png',
    'it-ites-bpo': '/media/industries/it-ites-bpo.png',
    'free-zones-government': '/media/industries/free-zones-government.png',
    'banking-finance': '/media/industries/banking-finance.png',
    healthcare: '/media/industries/healthcare.png',
    education: '/media/industries/education.png',
  }
  for (const [slug, heroImage] of Object.entries(INDUSTRY_IMAGES)) {
    await Industry.updateOne({ slug }, { $set: { heroImage } })
  }
  console.log(`Industries: ${await Industry.countDocuments()} (imagery assigned)`)

  // Locations
  await Location.deleteMany({})
  await Location.insertMany(
    LOCATIONS.map((l, i) => ({
      ...l,
      order: i,
      seo: { metaTitle: l.metaTitle, metaDescription: l.metaDescription },
      ...by,
    })),
  )
  console.log(`Locations: ${await Location.countDocuments()}`)

  // Free zones
  await FreeZone.deleteMany({})
  await FreeZone.insertMany(
    FREE_ZONES.map((fz, i) => ({
      name: fz.name,
      abbreviation: fz.abbreviation,
      slug: fz.slug,
      excerpt: fz.excerpt,
      heroTitle: fz.heroTitle,
      body: fz.body,
      features: fz.features,
      routes: fz.routes,
      order: i,
      seo: { metaTitle: fz.metaTitle, metaDescription: fz.metaDescription },
      ...by,
    })),
  )
  console.log(`Free zones: ${await FreeZone.countDocuments()}`)

  // Testimonials
  await Testimonial.deleteMany({})
  await Testimonial.insertMany(TESTIMONIALS.map((t, i) => ({ ...t, order: i, ...by })))
  console.log(`Testimonials: ${await Testimonial.countDocuments()}`)

  // FAQs
  await Faq.deleteMany({})
  await Faq.insertMany(FAQS.map((f) => ({ ...f, ...by })))
  console.log(`FAQs: ${await Faq.countDocuments()}`)

  // Blog categories + posts
  await BlogCategory.deleteMany({})
  await Blog.deleteMany({})
  const catMap: Record<string, string> = {}
  for (const c of BLOG_CATEGORIES) {
    const doc = await BlogCategory.create({ ...c, ...by })
    catMap[c.slug] = doc._id.toString()
  }
  for (const post of BLOG_POSTS) {
    await Blog.create({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      body: post.body,
      category: catMap[post.categorySlug],
      tags: post.tags,
      author: admin._id,
      readingTime: 5,
      publishedAt: new Date(),
      featured: post.featured,
      seo: { metaTitle: post.metaTitle, metaDescription: post.metaDescription },
      ...by,
    })
  }
  console.log(`Blog posts: ${await Blog.countDocuments()}`)

  // Careers
  await Career.deleteMany({})
  await Career.insertMany(CAREERS.map((c) => ({ ...c, ...by })))
  console.log(`Careers: ${await Career.countDocuments()}`)

  // Clients (logos on the case-studies client wall)
  await Client.deleteMany({})
  await Client.insertMany(CLIENTS.map((c, i) => ({ ...c, order: i, featured: i < 4, ...by })))
  console.log(`Clients: ${await Client.countDocuments()}`)

  // Case studies
  await CaseStudy.deleteMany({})
  await CaseStudy.insertMany(
    CASE_STUDIES.map((cs) => ({
      title: cs.title,
      slug: cs.slug,
      client: cs.client,
      industry: cs.industry,
      serviceType: cs.serviceType,
      location: cs.location,
      fleetSize: cs.fleetSize,
      duration: cs.duration,
      excerpt: cs.excerpt,
      coverImage: cs.coverImage,
      challenge: cs.challenge,
      solution: cs.solution,
      result: cs.result,
      services: cs.services,
      highlights: cs.highlights,
      metrics: cs.metrics,
      gallery: cs.gallery,
      tags: cs.tags,
      testimonialQuote: cs.testimonialQuote,
      testimonialAuthor: cs.testimonialAuthor,
      testimonialRole: cs.testimonialRole,
      featured: Boolean(cs.featured),
      order: cs.order ?? 0,
      seo: { metaTitle: cs.metaTitle, metaDescription: cs.metaDescription },
      ...by,
    })),
  )
  console.log(`Case studies: ${await CaseStudy.countDocuments()}`)

  // CMS page shells for every marketing route. Existing admin-authored content is preserved.
  const cmsPages = [
    ['about', 'About ViaRidez', 'Moving people with precision, care and accountability', 'VIARIDEZ is a corporate transportation partner built for organisations that cannot afford to compromise on safety, punctuality or professionalism.'],
    ['why-viaridez', 'Why ViaRidez', 'Reliability engineered into every trip', 'For your operations, corporate transport is critical infrastructure. We build, run and report on it that way — safe, compliant and accountable, every single day.'],
    ['partners', 'Fleet Partners', 'Put your fleet to work with ViaRidez', 'Join our vetted network of transport operators. Attach your buses, coaches, vans and cars to long-term corporate contracts and keep your vehicles earning.'],
    ['contact', 'Contact ViaRidez', "Let's design your mobility programme", 'Tell us about your routes, headcount and timelines. A VIARIDEZ specialist will prepare a tailored proposal — usually within one business day.'],
    ['get-quote', 'Get a Quote', 'Get your transport cost estimate', "Answer three quick questions to see an indicative monthly cost and how much you could save versus ride-hailing. We'll follow up with a tailored proposal."],
    ['book-demo', 'Book a Demo', 'Book a personalised demo', "Pick a time that works for you. We'll walk your team through a live demo tailored to your routes, headcount and goals — no slideware, just the platform."],
    ['faq', 'Frequently Asked Questions', 'Frequently asked questions', "Everything corporate mobility managers ask us — from onboarding and safety to billing, coverage and technology. Can't find your answer? Talk to our team."],
    ['resources', 'Mobility Resources', 'Ideas and tools for moving people better', 'Explore practical guides, benchmark reports and playbooks to help your organisation build safer, more efficient employee transportation.'],
  ] as const
  for (const [slug, title, heroTitle, heroSubtitle] of cmsPages) {
    await Page.updateOne(
      { slug },
      { $setOnInsert: { title, slug, heroTitle, heroSubtitle, body: '', sections: [], status: 'published', createdBy: admin._id, updatedBy: admin._id } },
      { upsert: true },
    )
  }
  console.log(`CMS page shells ensured: ${cmsPages.length}`)

  // Site settings singleton
  await SiteSettings.findOneAndUpdate(
    { key: 'global' },
    {
      key: 'global',
      companyName: COMPANY.companyName,
      tagline: COMPANY.tagline,
      email: COMPANY.email,
      phone: COMPANY.phone,
      whatsapp: COMPANY.whatsapp,
      address: COMPANY.hqAddress,
      navigation: [
        { label: 'Services', href: '/services', children: [
          { label: 'Corporate & Institutional', href: '/services/corporate-institutional-transport', description: 'Employee shuttles, free-zone & executive transport', icon: 'building-2' },
          { label: 'Tourism & Leisure', href: '/services/tourism-leisure', description: 'Sightseeing, safari & hotel shuttles', icon: 'palm-tree' },
          { label: 'Individual & On-Demand', href: '/services/individual-on-demand-transport', description: 'Airport transfers, car lift & rentals', icon: 'user' },
          { label: 'MICE & Events', href: '/services/mice-event-transportation', description: 'Conference & event transport logistics', icon: 'calendar-days' },
        ] },
        { label: 'Industries', href: '/industries', children: [] },
        { label: 'Fleet', href: '/fleet', children: [] },
        { label: 'Technology', href: '/technology', children: [] },
        { label: 'Company', href: '/about', children: [
          { label: 'About Us', href: '/about', description: 'Our story, heritage and leadership', icon: 'users' },
          { label: 'Why ViaRidez', href: '/why-viaridez', description: 'What sets our mobility apart', icon: 'shield-check' },
          { label: 'Sustainability', href: '/sustainability', description: 'EV fleet & lower-carbon commuting', icon: 'leaf' },
          { label: 'Case Studies', href: '/case-studies', description: 'Results we have delivered', icon: 'clipboard-list' },
          { label: 'Locations', href: '/locations', description: 'Where we operate', icon: 'map-pin' },
        ] },
        { label: 'Resources', href: '/blog', children: [
          { label: 'Blog & Insights', href: '/blog', description: 'Guidance on corporate mobility', icon: 'file-text' },
          { label: 'Resource Library', href: '/resources', description: 'Reports, guides & playbooks', icon: 'clipboard-list' },
          { label: 'FAQ', href: '/faq', description: 'Answers to common questions', icon: 'circle-check' },
        ] },
        { label: 'Contact', href: '/contact', children: [] },
      ],
      ctaPrimary: { label: 'Get a Quote', href: '/contact', external: false },
      // Book Now routes to the enquiry form; the href can be swapped for the
      // live booking app/portal URL later (brief §1, §12) without a rebuild.
      // Careers, Fleet Partners and the client portal are reachable from the
      // footer / Contact page — deliberately kept out of the primary navbar.
      ctaSecondary: { label: 'Book Now', href: '/contact', external: false },
      // Operating facts drawn from the brief — CMS-editable so ViaRidez can
      // swap in independently verified performance figures post-launch (brief §7.2).
      stats: [
        { value: '13+', label: 'Years of operating heritage' },
        { value: '4', label: 'Dubai free zones served' },
        { value: '50+', label: 'Seat coaches in our fleet' },
        { value: '24/7', label: 'Operations & support desk' },
      ],
      footerColumns: [
        {
          title: 'Services',
          links: [
            { label: 'Corporate & Institutional', href: '/services/corporate-institutional-transport' },
            { label: 'Tourism & Leisure', href: '/services/tourism-leisure' },
            { label: 'Individual & On-Demand', href: '/services/individual-on-demand-transport' },
            { label: 'MICE & Events', href: '/services/mice-event-transportation' },
            { label: 'Our Fleet', href: '/fleet' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'About Us', href: '/about' },
            { label: 'Why ViaRidez', href: '/why-viaridez' },
            { label: 'Technology', href: '/technology' },
            { label: 'Sustainability', href: '/sustainability' },
            { label: 'Case Studies', href: '/case-studies' },
            { label: 'Careers', href: '/careers' },
            { label: 'Become a Fleet Partner', href: '/partners' },
          ],
        },
        {
          title: 'Resources',
          links: [
            { label: 'Blog & Insights', href: '/blog' },
            { label: 'Resource Library', href: '/resources' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Get a Quote', href: '/get-quote' },
            { label: 'Privacy Policy', href: '/legal/privacy-policy' },
            { label: 'Cookie Policy', href: '/legal/cookie-policy' },
          ],
        },
      ],
      social: { linkedin: '', instagram: '', facebook: '' },
      defaultSeo: {
        metaTitle: 'ViaRidez | Enterprise Employee Transportation & Corporate Mobility',
        metaDescription:
          'ViaRidez delivers reliable, technology-driven employee transportation, corporate shuttles and managed mobility across Dubai, the UAE free zones, Kuwait, India and Nepal.',
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  )
  console.log('Site settings saved.')

  console.log('\nSeed complete.')
  console.log(`Admin login -> ${adminEmail} / ${adminPassword}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
