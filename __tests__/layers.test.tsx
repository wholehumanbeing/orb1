import { describe, it, expect, vi, beforeEach } from "vitest"
import { useOrbStore, initializePhilosophers } from "@/store/orbStore"
import { eraMeta, type SliceName } from "@/libs/constants"

// Mock the Three.js and R3F dependencies for testing
vi.mock("@react-spring/three", () => ({
  useSpring: vi.fn((props) => {
    const values = typeof props === "function" ? props() : props
    return Object.entries(values).reduce((acc, [key, value]) => {
      if (key !== "config") {
        // @ts-ignore
        acc[key] = value
      }
      return acc
    }, {})
  }),
  animated: {
    group: "div",
  },
}))

vi.mock("@use-gesture/react", () => ({
  useGesture: vi.fn(() => ({})),
}))

const initialPhilosophers = [
  { id: "socrates", name: "Socrates", born: -470, died: -399, slice: "Ethics" as SliceName },
  { id: "kant", name: "Immanuel Kant", born: 1724, died: 1804, slice: "Ethics" as SliceName },
  { id: "plato", name: "Plato", born: -428, died: -348, slice: "Metaphysics" as SliceName },
]

describe("Slice Component & Store Integration", () => {
  beforeEach(() => {
    // Reset store before each test
    initializePhilosophers(initialPhilosophers)
    useOrbStore.setState({
      sliceActive: null,
      layerWindow: [useOrbStore.getState().minYear, useOrbStore.getState().maxYear],
      currentEraFocus: null,
    })
  })

  it("initializes store with philosopher data correctly", () => {
    const state = useOrbStore.getState()
    expect(state.philosophers).toHaveLength(3)
    expect(state.minYear).toBe(-470)
    expect(state.maxYear).toBe(1804)
    expect(state.layerWindow).toEqual([-470, 1804])
  })

  it("filters visible philosophers based on layer window", () => {
    const { setLayerWindow, setVisiblePhilosophers, philosophers } = useOrbStore.getState()

    // Set window to only include ancient period
    setLayerWindow([-500, 0])

    // Manually trigger filtering (in real app this happens in useEffect)
    const [start, end] = [-500, 0]
    const filtered = philosophers.filter((p) => p.born <= end && p.died >= start)
    setVisiblePhilosophers(filtered)

    const state = useOrbStore.getState()
    expect(state.visiblePhilosophers).toHaveLength(2) // Socrates and Plato
    expect(state.visiblePhilosophers.map((p) => p.name)).toEqual(["Socrates", "Plato"])
  })

  it("updates slice active state", () => {
    const { setSliceActive } = useOrbStore.getState()

    setSliceActive("Ethics")
    expect(useOrbStore.getState().sliceActive).toBe("Ethics")

    setSliceActive(null)
    expect(useOrbStore.getState().sliceActive).toBeNull()
  })

  it("updates era focus and layer window", () => {
    const { setCurrentEraFocus, setLayerWindow } = useOrbStore.getState()

    setCurrentEraFocus("Medieval")
    setLayerWindow([eraMeta.Medieval.start, eraMeta.Medieval.end])

    const state = useOrbStore.getState()
    expect(state.currentEraFocus).toBe("Medieval")
    expect(state.layerWindow).toEqual([500, 1400])
  })
})
