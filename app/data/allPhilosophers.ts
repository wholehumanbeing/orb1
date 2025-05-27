import type { PhilosopherData } from "../types/philosopher"
import { ancientPhilosophers } from "./ancientPhilosophers"
import { medievalPhilosophers } from "./medievalPhilosophers"
import { modernPhilosophers } from "./modernPhilosophers"
import { contemporaryPhilosophers } from "./contemporaryPhilosophers"

// Combine all philosophers and sort chronologically by birth year
export const allPhilosophers: PhilosopherData[] = [
  ...ancientPhilosophers,
  ...medievalPhilosophers,
  ...modernPhilosophers,
  ...contemporaryPhilosophers,
].sort((a, b) => {
  // Convert string birth years to numbers for sorting
  const birthA = typeof a.birth === "string" ? Number.parseInt(a.birth.replace(/[^\d-]/g, "")) : a.birth
  const birthB = typeof b.birth === "string" ? Number.parseInt(b.birth.replace(/[^\d-]/g, "")) : b.birth
  return birthA - birthB
})

// Get philosophers by domain
export function getPhilosophersByDomain(domain: string): PhilosopherData[] {
  return allPhilosophers.filter((p) => p.domainSummaries[domain as keyof typeof p.domainSummaries])
}

// Get all unique tags across philosophers
export function getAllTags(): string[] {
  const tagsSet = new Set<string>()
  allPhilosophers.forEach((p) => {
    p.tags.forEach((tag) => tagsSet.add(tag))
  })
  return Array.from(tagsSet).sort()
}

// Map era names to colors for visualization
export const eraColors = {
  Ancient: "#3a86ff",
  Medieval: "#8338ec",
  Modern: "#ff006e",
  Contemporary: "#fb5607",
}

// Map domains to colors for visualization
export const domainColors = {
  ethics: "#3a86ff",
  aesthetics: "#8338ec",
  logic: "#ff006e",
  politics: "#fb5607",
  metaphysics: "#ffbe0b",
}
