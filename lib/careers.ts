/**
 * Shared, client-safe helpers for the Careers / Job Applications feature.
 * No 'server-only' imports here so both Server and Client Components can use it.
 */

export interface JobRole {
  _id: string
  title: string
  slug: string
  department?: string
  category?: string
  location?: string
  employmentType?: string
  workMode?: string
  experienceLevel?: string
  experienceMin?: number
  experienceMax?: number
  openings?: number
  salaryDisclosed?: boolean
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  salaryPeriod?: string
  skills?: string[]
  benefits?: string[]
  screeningQuestions?: string[]
  featured?: boolean
  excerpt?: string
  description?: string
  responsibilities?: string[]
  requirements?: string[]
  closingDate?: string | null
  createdAt?: string
}

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
}

export const WORK_MODE_LABELS: Record<string, string> = {
  "on-site": "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
}

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  entry: "Entry level",
  mid: "Mid level",
  senior: "Senior level",
  lead: "Lead / Manager",
}

export function employmentTypeLabel(value?: string): string {
  if (!value) return ""
  return EMPLOYMENT_TYPE_LABELS[value] ?? value
}

export function workModeLabel(value?: string): string {
  if (!value) return ""
  return WORK_MODE_LABELS[value] ?? value
}

export function experienceLevelLabel(value?: string): string {
  if (!value) return ""
  return EXPERIENCE_LEVEL_LABELS[value] ?? value
}

/** Human label for the years-of-experience range, e.g. "3–5 yrs" or "5+ yrs". */
export function experienceLabel(role: Pick<JobRole, "experienceMin" | "experienceMax">): string {
  const min = Number(role.experienceMin) || 0
  const max = Number(role.experienceMax) || 0
  if (!min && !max) return ""
  if (min && max) return min === max ? `${min} yr${min > 1 ? "s" : ""}` : `${min}–${max} yrs`
  if (min) return `${min}+ yrs`
  return `Up to ${max} yrs`
}

/** Formats a compact currency amount, e.g. 12000 -> "12K", 120000 -> "1.2L"-free "120K". */
function compactAmount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000
    return `${Number.isInteger(k) ? k : k.toFixed(1)}K`
  }
  return String(n)
}

/** Salary display label, respecting the "disclosed" flag. */
export function salaryLabel(role: Pick<JobRole, "salaryDisclosed" | "salaryMin" | "salaryMax" | "salaryCurrency" | "salaryPeriod">): string {
  if (!role.salaryDisclosed) return "Competitive"
  const min = Number(role.salaryMin) || 0
  const max = Number(role.salaryMax) || 0
  if (!min && !max) return "Competitive"
  const cur = role.salaryCurrency || "AED"
  const per = role.salaryPeriod === "yearly" ? "yr" : "mo"
  if (min && max) return `${cur} ${compactAmount(min)}–${compactAmount(max)} / ${per}`
  const one = min || max
  return `${cur} ${compactAmount(one)} / ${per}`
}

export interface DeadlineInfo {
  hasDeadline: boolean
  closed: boolean
  /** e.g. "Closes in 5 days", "Closes today", "Applications closed". */
  label: string
  /** Days remaining (negative once past). */
  daysLeft: number
  urgent: boolean
}

export function deadlineInfo(closingDate?: string | null): DeadlineInfo {
  if (!closingDate) {
    return { hasDeadline: false, closed: false, label: "", daysLeft: Infinity, urgent: false }
  }
  const end = new Date(closingDate)
  if (Number.isNaN(end.getTime())) {
    return { hasDeadline: false, closed: false, label: "", daysLeft: Infinity, urgent: false }
  }
  const now = new Date()
  const ms = end.getTime() - now.getTime()
  const daysLeft = Math.ceil(ms / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) {
    return { hasDeadline: true, closed: true, label: "Applications closed", daysLeft, urgent: false }
  }
  if (daysLeft === 0) {
    return { hasDeadline: true, closed: false, label: "Closes today", daysLeft, urgent: true }
  }
  if (daysLeft === 1) {
    return { hasDeadline: true, closed: false, label: "Closes tomorrow", daysLeft, urgent: true }
  }
  return {
    hasDeadline: true,
    closed: false,
    label: `Closes in ${daysLeft} days`,
    daysLeft,
    urgent: daysLeft <= 7,
  }
}

export function postedLabel(createdAt?: string): string {
  if (!createdAt) return ""
  const then = new Date(createdAt)
  if (Number.isNaN(then.getTime())) return ""
  const days = Math.floor((Date.now() - then.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return "Posted today"
  if (days === 1) return "Posted yesterday"
  if (days < 7) return `Posted ${days} days ago`
  if (days < 30) {
    const w = Math.floor(days / 7)
    return `Posted ${w} week${w > 1 ? "s" : ""} ago`
  }
  const m = Math.floor(days / 30)
  return `Posted ${m} month${m > 1 ? "s" : ""} ago`
}

/** Admin ATS pipeline stages in order, with display labels. */
export const APPLICATION_STAGES = [
  "new",
  "reviewing",
  "shortlisted",
  "interview",
  "offer",
  "hired",
  "rejected",
] as const

export type ApplicationStage = (typeof APPLICATION_STAGES)[number]

export const STAGE_LABELS: Record<string, string> = {
  new: "New",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
}
