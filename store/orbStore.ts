import { create } from "zustand"

export type Philosopher = {
  id: string
  name: string
  born: number // e.g. 1879
  died: number // e.g. 1955 (use born if still alive)
  slice: "Ethics" | "Logic" | "Aesthetics" | "Politics" | "Metaphysics"
  // ...other props used by the r3f layer
}

interface OrbState {
  philosophers: Philosopher[]
  visible: Philosopher[]
  setVisible: (list: Philosopher[]) => void
}

export const useOrbStore = create<OrbState>((set) => ({
  philosophers: [], // This will be populated with actual data
  visible: [], // Initially empty, will be populated based on range filter
  setVisible: (list) => set({ visible: list }),
}))
