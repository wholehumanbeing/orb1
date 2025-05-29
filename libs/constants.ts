export type Era = "Ancient" | "Medieval" | "Renaissance" | "EarlyModern" | "Modern" | "Contemporary"

export const orderedEras: Era[] = ["Ancient", "Medieval", "Renaissance", "EarlyModern", "Modern", "Contemporary"]

export interface EraMeta {
  start: number
  end: number
  color: string // Hex color string
}

export const eraMeta: Record<Era, EraMeta> = {
  Ancient: { start: -600, end: 500, color: "#FF6B6B" },
  Medieval: { start: 500, end: 1400, color: "#FFD166" },
  Renaissance: { start: 1400, end: 1600, color: "#06D6A0" },
  EarlyModern: { start: 1600, end: 1800, color: "#118AB2" },
  Modern: { start: 1800, end: 1900, color: "#073B4C" },
  Contemporary: { start: 1900, end: new Date().getFullYear(), color: "#785EF0" },
}

export type SliceName = "Ethics" | "Logic" | "Aesthetics" | "Politics" | "Metaphysics"

export const sliceNames: SliceName[] = ["Ethics", "Logic", "Aesthetics", "Politics", "Metaphysics"]
