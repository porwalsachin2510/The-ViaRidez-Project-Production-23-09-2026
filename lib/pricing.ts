/**
 * Indicative commute-cost estimator.
 *
 * This is a *marketing* estimator — it produces an indicative monthly cost
 * range plus an estimated saving versus employees expensing ride-hailing.
 * It is deliberately transparent and conservative; the real proposal is
 * always prepared by a mobility specialist. All figures are in AED.
 *
 * Pure module (no DB / no client-only APIs) so it can run on the server
 * (server action, JSON-LD) and the client (live wizard preview) alike.
 */

export type TripType = "one-way" | "round-trip"

export interface EstimatorInput {
  /** Number of employees to be transported. */
  employees: number
  /** Approximate one-way distance per trip, in km. */
  distanceKm: number
  /** Working days per week (1–7). */
  daysPerWeek: number
  /** One-way (home→office only) or round-trip (both legs). */
  tripType: TripType
}

export interface VehiclePlan {
  label: string
  seats: number
  /** How many of this vehicle are needed. */
  count: number
  /** Indicative all-in cost per vehicle per operating day (driver + fuel + ops). */
  dayRate: number
}

export interface EstimatorResult {
  /** Recommended vehicle mix. */
  plan: VehiclePlan
  /** Legs per day (1 for one-way, 2 for round-trip). */
  legsPerDay: number
  /** Operating days per month (daysPerWeek * 4.33, rounded). */
  daysPerMonth: number
  /** Indicative ViaRidez monthly cost — low end of the range. */
  monthlyLow: number
  /** Indicative ViaRidez monthly cost — high end of the range. */
  monthlyHigh: number
  /** Estimated monthly cost if employees expensed ride-hailing instead. */
  rideHailingMonthly: number
  /** Estimated monthly saving (ride-hailing − ViaRidez midpoint). */
  monthlySavings: number
  /** Saving as a percentage of the ride-hailing baseline. */
  savingsPct: number
  /** Cost per employee per month (midpoint). */
  perEmployeeMonthly: number
}

const DAYS_PER_MONTH_FACTOR = 4.33

/** Vehicle options ordered by capacity. Rates are indicative AED/day, all-in. */
const VEHICLES = [
  { label: "Executive Sedan", seats: 4, baseDayRate: 320, perKm: 1.6 },
  { label: "Premium Van (Hiace)", seats: 12, baseDayRate: 520, perKm: 2.1 },
  { label: "Midi Bus", seats: 22, baseDayRate: 760, perKm: 2.8 },
  { label: "Coach Bus", seats: 50, baseDayRate: 1150, perKm: 3.6 },
] as const

/** Indicative ride-hailing cost per km per passenger (AED), UAE market. */
const RIDE_HAILING_PER_KM = 2.4
const RIDE_HAILING_BASE_FARE = 12

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function roundTo(n: number, step: number) {
  return Math.round(n / step) * step
}

/** Pick the most cost-efficient single vehicle type for the headcount. */
function pickVehicle(employees: number) {
  // Prefer the smallest vehicle class that fills reasonably; fall back to coach.
  for (const v of VEHICLES) {
    const count = Math.ceil(employees / v.seats)
    // Use this class if it needs a sensible number of vehicles.
    if (count <= 6 || v === VEHICLES[VEHICLES.length - 1]) {
      return { ...v, count }
    }
  }
  const last = VEHICLES[VEHICLES.length - 1]
  return { ...last, count: Math.ceil(employees / last.seats) }
}

export function estimate(input: EstimatorInput): EstimatorResult {
  const employees = clamp(Math.round(input.employees) || 0, 1, 5000)
  const distanceKm = clamp(input.distanceKm || 0, 1, 300)
  const daysPerWeek = clamp(Math.round(input.daysPerWeek) || 0, 1, 7)
  const legsPerDay = input.tripType === "round-trip" ? 2 : 1

  const v = pickVehicle(employees)
  const daysPerMonth = Math.round(daysPerWeek * DAYS_PER_MONTH_FACTOR)

  // Per-vehicle day rate scales with distance beyond a 15km baseline.
  const distanceFactor = 1 + Math.max(0, distanceKm - 15) * 0.012
  const dayRate = Math.round(v.baseDayRate * distanceFactor + distanceKm * v.perKm)

  // Monthly ViaRidez cost midpoint, then a ±12% indicative band.
  const midMonthly = v.count * dayRate * legsPerDay * daysPerMonth
  const monthlyLow = roundTo(midMonthly * 0.88, 50)
  const monthlyHigh = roundTo(midMonthly * 1.12, 50)

  // Ride-hailing baseline: each employee takes an individual trip per leg.
  const perTrip = RIDE_HAILING_BASE_FARE + distanceKm * RIDE_HAILING_PER_KM
  const rideHailingMonthly = roundTo(
    employees * perTrip * legsPerDay * daysPerMonth,
    50,
  )

  const monthlySavings = Math.max(0, roundTo(rideHailingMonthly - midMonthly, 50))
  const savingsPct =
    rideHailingMonthly > 0
      ? Math.round((monthlySavings / rideHailingMonthly) * 100)
      : 0
  const perEmployeeMonthly = Math.round(midMonthly / employees)

  return {
    plan: { label: v.label, seats: v.seats, count: v.count, dayRate },
    legsPerDay,
    daysPerMonth,
    monthlyLow,
    monthlyHigh,
    rideHailingMonthly,
    monthlySavings,
    savingsPct,
    perEmployeeMonthly,
  }
}

/** Format an AED amount for display, e.g. 12500 → "AED 12,500". */
export function formatAED(n: number): string {
  return `AED ${Math.round(n).toLocaleString("en-AE")}`
}
