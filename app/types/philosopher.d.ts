/**
 * Represents the historical era of a philosopher
 */
export type Era = "Ancient" | "Medieval" | "Modern" | "Contemporary"

/**
 * Represents the five philosophical domains
 */
export type Domain = "ethics" | "aesthetics" | "logic" | "politics" | "metaphysics"

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
  domainSummaries: {
    ethics: string
    aesthetics: string
    logic: string
    politics: string
    metaphysics: string
  }

  /** Key concepts, schools, or ideas associated with the philosopher */
  tags: string[]

  /** IDs of other philosophers who influenced this thinker */
  influences: string[]
}
