import { create } from "zustand"
import type { Era, SliceName } from "@/libs/constants"

export type Philosopher = {
  id: string
  name: string
  born: number
  died: number
  slice: SliceName
}

interface OrbState {
  philosophers: Philosopher[]
  visiblePhilosophers: Philosopher[]
  setVisiblePhilosophers: (list: Philosopher[]) => void

  sliceActive: SliceName | null
  setSliceActive: (slice: SliceName | null) => void

  layerWindow: [number, number]
  setLayerWindow: (window: [number, number]) => void

  currentEraFocus: Era | null
  setCurrentEraFocus: (era: Era | null) => void

  minYear: number
  maxYear: number
  setGlobalYearRange: (min: number, max: number) => void
}

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

export function initializePhilosophers(philosophers: Philosopher[]) {
  if (philosophers.length === 0) {
    useOrbStore.setState({ philosophers, visiblePhilosophers: [] })
    return
  }

  const bornYears = philosophers.map((p) => p.born)
  const diedYears = philosophers.map((p) => p.died)
  const min = Math.min(...bornYears)
  const max = Math.max(...diedYears)

  useOrbStore.setState({
    philosophers,
    visiblePhilosophers: philosophers,
    minYear: min,
    maxYear: max,
    layerWindow: [min, max],
  })
}
