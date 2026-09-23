import {
  Bus,
  Car,
  CarFront,
  Building2,
  Monitor,
  Plane,
  PalmtreeIcon,
  Briefcase,
  Users,
  User,
  ShieldCheck,
  Clock,
  MapPin,
  Truck,
  Route,
  CalendarCheck,
  CalendarDays,
  Landmark,
  GraduationCap,
  Factory,
  HeartPulse,
  ShoppingBag,
  Star,
  CircleCheck,
  Navigation,
  Gauge,
  Leaf,
  Headset,
  ClipboardList,
  MessageSquare,
  Smartphone,
  MapPinned,
  Activity,
  BarChart3,
  ScrollText,
  UserCheck,
  Lock,
  Radar,
  Rocket,
  Cpu,
  Clipboard,
  Video,
  LineChart,
  CalendarClock,
  BusFront,
  Cctv,
  Wallet,
  TrendingUp,
  Sparkles,
  Handshake,
  Recycle,
  Wind,
  BatteryCharging,
  Target,
  Award,
  Phone,
  Mail,
  type LucideIcon,
} from 'lucide-react'

/**
 * Maps CMS-stored icon strings to Lucide components so editors can pick an
 * icon by name in the admin panel without touching code.
 */
const iconMap: Record<string, LucideIcon> = {
  bus: Bus,
  car: Car,
  'car-front': CarFront,
  user: User,
  'palm-tree': PalmtreeIcon,
  'calendar-days': CalendarDays,
  'building-2': Building2,
  monitor: Monitor,
  plane: Plane,
  briefcase: Briefcase,
  users: Users,
  'shield-check': ShieldCheck,
  clock: Clock,
  'map-pin': MapPin,
  truck: Truck,
  route: Route,
  'calendar-check': CalendarCheck,
  landmark: Landmark,
  'graduation-cap': GraduationCap,
  factory: Factory,
  'heart-pulse': HeartPulse,
  'shopping-bag': ShoppingBag,
  star: Star,
  'circle-check': CircleCheck,
  navigation: Navigation,
  gauge: Gauge,
  leaf: Leaf,
  headset: Headset,
  'clipboard-list': ClipboardList,
  'message-square': MessageSquare,
  smartphone: Smartphone,
  'map-pinned': MapPinned,
  activity: Activity,
  'bar-chart': BarChart3,
  'scroll-text': ScrollText,
  'user-check': UserCheck,
  lock: Lock,
  radar: Radar,
  rocket: Rocket,
  cpu: Cpu,
  clipboard: Clipboard,
  video: Video,
  'line-chart': LineChart,
  'calendar-clock': CalendarClock,
  'bus-front': BusFront,
  cctv: Cctv,
  wallet: Wallet,
  'trending-up': TrendingUp,
  sparkles: Sparkles,
  handshake: Handshake,
  recycle: Recycle,
  wind: Wind,
  'battery-charging': BatteryCharging,
  target: Target,
  award: Award,
  phone: Phone,
  mail: Mail,
}

/** Sorted list of every icon key the CMS can reference (for admin pickers). */
export const ICON_KEYS = Object.keys(iconMap).sort()

/**
 * Keyword → icon rules used when a record has no explicit icon set. Ordered by
 * priority (first match wins). Lets service/industry cards look intentional
 * even before an editor assigns an icon in the admin panel.
 */
const hintRules: [RegExp, LucideIcon][] = [
  [/chauffeur|executive|vip|luxury/i, Briefcase],
  [/airport|flight|transfer/i, Plane],
  [/shuttle|staff|employee|commut/i, Bus],
  [/coach|minibus|bus/i, Bus],
  [/sedan|car\b/i, CarFront],
  [/van|suv/i, Truck],
  [/tour|sightsee|leisure|safari|theme|cruise/i, PalmtreeIcon],
  [/subscription|daily|monthly|plan/i, CalendarDays],
  [/inter-?emirate|route|shuttle/i, Route],
  [/rental|hire/i, Car],
  [/mice|event|conference|exhibition|wedding/i, CalendarCheck],
  [/hotel|hospitality|resort/i, Building2],
  [/health|medical|hospital/i, HeartPulse],
  [/bank|finance/i, Landmark],
  [/education|school|university|campus/i, GraduationCap],
  [/it|ites|bpo|tech/i, Monitor],
  [/free ?zone|government|jafza|difc|dmcc/i, Factory],
  [/retail|shop|mall/i, ShoppingBag],
]

function guessIcon(hint?: string): LucideIcon | null {
  if (!hint) return null
  for (const [re, cmp] of hintRules) {
    if (re.test(hint)) return cmp
  }
  return null
}

export function Icon({
  name,
  hint,
  className,
}: {
  /** Explicit CMS icon key (takes priority). */
  name?: string
  /** Free text (e.g. title) used to infer an icon when `name` is unset. */
  hint?: string
  className?: string
}) {
  const Cmp = (name && iconMap[name]) || guessIcon(hint) || CircleCheck
  return <Cmp className={className} aria-hidden="true" />
}
