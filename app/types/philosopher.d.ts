/**
 * Represents the historical era of a philosopher
 */
export type Era = "Ancient" | "Medieval" | "Modern" | "Contemporary"

/**
 * Represents the five philosophical domains
 */
export type Domain = "ethics" | "aesthetics" | "logic" | "politics" | "metaphysics"

/**
 * Domain summaries containing philosopher's views in each philosophical domain
 */
export interface DomainSummaries {
  /** Summary of the philosopher's ethical views (~100-150 words) */
  ethics: string
  /** Summary of the philosopher's aesthetic views (~100-150 words) */
  aesthetics: string
  /** Summary of the philosopher's logical/epistemological views (~100-150 words) */
  logic: string
  /** Summary of the philosopher's political views (~100-150 words) */
  politics: string
  /** Summary of the philosopher's metaphysical views (~100-150 words) */
  metaphysics: string
}

/**
 * Complete data structure for a philosopher
 */
export interface PhilosopherData {
  /** Unique identifier (slug or name-based) for the philosopher */
  id: string

  /** Full name of the philosopher */
  name: string

  /** Historical era the philosopher belongs to */
  era: Era

  /** Birth year (negative for BCE, positive for CE) or approximate date string */
  birth: number | string

  /** Death year (negative for BCE, positive for CE) or approximate date string */
  death?: number | string

  /** Summaries of the philosopher's views in each domain */
  domainSummaries: DomainSummaries

  /** Key concepts, schools, or ideas associated with the philosopher */
  tags: string[]

  /** IDs of other philosophers who influenced this thinker */
  influences: string[]
}

/**
 * Tag categories for organizing philosophical concepts
 */
export interface TagCategory {
  category: string
  tags: string[]
}

/**
 * Philosophical school or movement
 */
export interface PhilosophicalSchool {
  id: string
  name: string
  era: Era
  description: string
  keyFigures: string[] // philosopher IDs
  keyIdeas: string[]
}
