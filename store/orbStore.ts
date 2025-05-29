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
  // Example: Add a function to load philosophers if not already present
  loadPhilosophers: (philosophers: Philosopher[]) => void
}

// Sample data for demonstration - replace with your actual data loading mechanism
const samplePhilosophers: Philosopher[] = [
  { id: "1", name: "Socrates", born: -470, died: -399, slice: "Ethics" },
  { id: "2", name: "Plato", born: -428, died: -348, slice: "Metaphysics" },
  { id: "3", name: "Aristotle", born: -384, died: -322, slice: "Logic" },
  { id: "4", name: "Kant", born: 1724, died: 1804, slice: "Ethics" },
  { id: "5", name: "Nietzsche", born: 1844, died: 1900, slice: "Aesthetics" },
  { id: "6", name: "Wittgenstein", born: 1889, died: 1951, slice: "Logic" },
  { id: "7", name: "Sartre", born: 1905, died: 1980, slice: "Ethics" },
  { id: "8", name: "Foucault", born: 1926, died: 1984, slice: "Politics" },
  { id: "9", name: "Hypatia", born: 350, died: 415, slice: "Metaphysics" }, // Example with CE birth/death
  { id: "10", name: "Einstein", born: 1879, died: 1955, slice: "Metaphysics" }, // For testing range
]

export const useOrbStore = create<OrbState>((set) => ({
  philosophers: samplePhilosophers, // Initialize with sample data
  visible: samplePhilosophers, // Initially all are visible
  setVisible: (list) => set({ visible: list }),
  loadPhilosophers: (philosophers) => set({ philosophers, visible: philosophers }),
}))
