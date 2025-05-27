import type { PhilosopherData } from "../types/philosopher"
import { ancientPhilosophers } from "./ancientPhilosophers"
import { medievalPhilosophers } from "./medievalPhilosophers"
import { modernPhilosophers } from "./modernPhilosophers"
import { contemporaryPhilosophers } from "./contemporaryPhilosophers"

// Combine all philosophers
export const allPhilosophers: PhilosopherData[] = [
  ...ancientPhilosophers,
  ...medievalPhilosophers,
  ...modernPhilosophers,
  ...contemporaryPhilosophers,
]

// Convert string birth years to numbers for consistent sorting
export function getBirthYear(philosopher: PhilosopherData): number {
  if (typeof philosopher.birth === "number") {
    return philosopher.birth
  }

  // Handle string birth years like "c. -624"
  const match = philosopher.birth.toString().match(/-?\d+/)
  if (match) {
    return Number.parseInt(match[0])
  }

  return 0 // Fallback
}

// Get all philosophers sorted chronologically
export const chronologicalPhilosophers = [...allPhilosophers].sort((a, b) => getBirthYear(a) - getBirthYear(b))

// Get the earliest and latest birth years
export const earliestBirthYear = getBirthYear(chronologicalPhilosophers[0])
export const latestBirthYear = getBirthYear(chronologicalPhilosophers[chronologicalPhilosophers.length - 1])

// Get philosophers within a time range
export function getPhilosophersInTimeRange(startYear: number, endYear: number): PhilosopherData[] {
  return chronologicalPhilosophers.filter((philosopher) => {
    const birthYear = getBirthYear(philosopher)
    return birthYear >= startYear && birthYear <= endYear
  })
}

// Map domains to colors for visualization
export const domainColors = {
  logic: "#3a86ff",
  aesthetics: "#8338ec",
  ethics: "#ff006e",
  politics: "#fb5607",
  metaphysics: "#ffbe0b",
}

// Map eras to colors
export const eraColors = {
  Ancient: "#3a86ff",
  Medieval: "#8338ec",
  Modern: "#ff006e",
  Contemporary: "#fb5607",
}

// Define major time periods
export const timePeriods = [
  { name: "Ancient", startYear: -700, endYear: 500 },
  { name: "Medieval", startYear: 500, endYear: 1400 },
  { name: "Renaissance", startYear: 1400, endYear: 1600 },
  { name: "Early Modern", startYear: 1600, endYear: 1800 },
  { name: "Modern", startYear: 1800, endYear: 1900 },
  { name: "Contemporary", startYear: 1900, endYear: 2023 },
]
