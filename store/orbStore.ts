import { create } from "zustand"
import type { Era, SliceName } from "@/libs/constants" // Assuming constants.ts is in libs

export type Philosopher = {
  id: string
  name: string
  born: number // e.g. 1879
  died: number // e.g. 1955 (use born if still alive)
  slice: SliceName // Updated to SliceName
  // ...other props used by the r3f layer
}

interface OrbState {
  philosophers: Philosopher[]
  visiblePhilosophers: Philosopher[] // Renamed for clarity
  setVisiblePhilosophers: (list: Philosopher[]) => void

  sliceActive: SliceName | null
  setSliceActive: (slice: SliceName | null) => void

  layerWindow: [number, number] // [startYear, endYear]
  setLayerWindow: (window: [number, number]) => void

  // For scroll-based era navigation
  currentEraFocus: Era | null
  setCurrentEraFocus: (era: Era | null) => void

  // Initial min/max years for the timeline
  minYear: number
  maxYear: number
  setGlobalYearRange: (min: number, max: number) => void
}

// Default initial range, can be updated once philosophers are loaded
const initialMinYear = -700
const initialMaxYear = new Date().getFullYear()

export const useOrbStore = create<OrbState>((set) => ({
  philosophers: [],
  visiblePhilosophers: [],
  setVisiblePhilosophers: (list) => set({ visiblePhilosophers: list }),

  sliceActive: null,
  setSliceActive: (slice) => set({ sliceActive: slice }),

  layerWindow: [initialMinYear, initialMaxYear],
  setLayerWindow: (window) => set({ layerWindow: window }),

  currentEraFocus: null,
  setCurrentEraFocus: (era) => set({ currentEraFocus: era }),

  minYear: initialMinYear,
  maxYear: initialMaxYear,
  setGlobalYearRange: (min, max) => set({ minYear: min, maxYear: max }),
}))

// Function to initialize store with philosopher data and calculate year range
export function initializePhilosophers(philosophers: Philosopher[]) {
  if (philosophers.length === 0) {
    useOrbStore.setState({ philosophers, visiblePhilosophers: [] })
    return
  }
  const bornYears = philosophers.map((p) => p.born)
  const diedYears = philosophers.map((p) => p.died) // Assuming 'died' is always present
  const min = Math.min(...bornYears)
  const max = Math.max(...diedYears)

  useOrbStore.setState({
    philosophers,
    visiblePhilosophers: philosophers, // Initially show all
    minYear: min,
    maxYear: max,
    layerWindow: [min, max], // Set initial layerWindow to full range
  })
}
