import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Compact relative time, e.g. "just now", "5m ago", "3h ago", "2d ago", else a short date. */
export function formatRelativeTime(input: Date | string | number | null | undefined): string {
  if (!input) return ""
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return ""
  const diffMs = Date.now() - date.getTime()
  const sec = Math.round(diffMs / 1000)
  if (sec < 45) return "just now"
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 7) return `${day}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

/** Full absolute timestamp for tooltips. */
export function formatAbsoluteTime(input: Date | string | number | null | undefined): string {
  if (!input) return ""
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
}
