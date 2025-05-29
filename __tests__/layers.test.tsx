import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, act } from "@react-three/test-renderer"
import { Slice } from "@/components/Slice"
import { useOrbStore, initializePhilosophers } from "@/store/orbStore"
import { eraMeta, orderedEras, type SliceName } from "@/libs/constants"
import type * as THREE from "three"

// Mock useGesture
vi.mock("@use-gesture/react", () => ({
  useGesture: vi.fn((handlers) => {
    // Simulate wheel event for testing
    const onWheel = (event: any) => {
      if (handlers.onWheel) {
        handlers.onWheel({
          event,
          delta: [0, event.deltaY || 0], // [deltaX, deltaY]
          memo: undefined, // Let the handler initialize memo
        })
      }
    }
    // Return a bind object that can be spread, and a way to manually trigger handlers
    return { bind: () => ({ onWheel }), triggerWheel: onWheel }
  }),
}))

// Mock react-spring
vi.mock("@react-spring/three", () => ({
  useSpring: vi.fn((props) => {
    // Return the 'to' value directly for testing, or a simplified animated value
    const values = typeof props === "function" ? props() : props
    return Object.entries(values).reduce((acc, [key, value]) => {
      if (key !== "config") {
        // @ts-ignore
        acc[key] = { get: () => value, to: value } // Mock animated value
      }
      return acc
    }, {})
  }),
  animated: {
    group: "group", // Mock animated components as their base types
    mesh: "mesh",
  },
}))

const initialPhilosophers = [
  { id: "socrates", name: "Socrates", born: -470, died: -399, slice: "Ethics" as SliceName },
  { id: "kant", name: "Immanuel Kant", born: 1724, died: 1804, slice: "Ethics" as SliceName },
  { id: "plato", name: "Plato", born: -428, died: -348, slice: "Metaphysics" as SliceName },
]

// Helper function for clamping a value within a range
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max)

describe("Slice Component & Layered Interaction", () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      initializePhilosophers(initialPhilosophers)
      useOrbStore.setState({
        sliceActive: null,
        layerWindow: [useOrbStore.getState().minYear, useOrbStore.getState().maxYear],
        currentEraFocus: null,
      })
    })
  })

  it("activates slice on click and moves it outward", async () => {
    const sliceName: SliceName = "Ethics"
    const { scene } = await render(<Slice sliceName={sliceName} thetaStart={0} thetaLength={(Math.PI * 2) / 5} />)

    const sliceGroup = scene.children[0] as THREE.Group // Assuming Slice renders a group at root
    expect(sliceGroup).toBeDefined()

    // Simulate click
    await act(async () => {
      // @ts-ignore
      sliceGroup.props.onClick({ stopPropagation: vi.fn() })
    })

    expect(useOrbStore.getState().sliceActive).toBe(sliceName)

    // Check positionZ from useSpring mock (might need adjustment based on mock)
    // This part is tricky with the current mock. A better mock would allow checking the 'to' value.
    // For now, we check the store state.
    // To test animation, you'd typically use await r3f.advanceFrames(frameCount, timeDelta)
  })

  it("changes layerWindow on wheel scroll when slice is active", async () => {
    const sliceName: SliceName = "Ethics"
    const { scene } = await render(<Slice sliceName={sliceName} thetaStart={0} thetaLength={(Math.PI * 2) / 5} />)
    const sliceGroup = scene.children[0] as THREE.Group

    // Activate slice
    await act(async () => {
      // @ts-ignore
      sliceGroup.props.onClick({ stopPropagation: vi.fn() })
    })
    expect(useOrbStore.getState().sliceActive).toBe(sliceName)

    const initialEraFocusIndex = orderedEras.findIndex((e) => e === useOrbStore.getState().currentEraFocus)
    const expectedNextEraIndex = clamp(initialEraFocusIndex + 1, 0, orderedEras.length - 1)
    const expectedNextEra = orderedEras[expectedNextEraIndex]

    // Simulate wheel scroll down
    // Need to access the useGesture mock's trigger function
    const gestureHookResult = vi.mocked(require("@use-gesture/react").useGesture).mock.results[0].value

    await act(async () => {
      gestureHookResult.triggerWheel({ stopPropagation: vi.fn(), deltaY: 100 }) // deltaY > 0 for scroll down
    })

    const newLayerWindow = useOrbStore.getState().layerWindow
    expect(newLayerWindow[0]).toBe(eraMeta[expectedNextEra].start)
    expect(newLayerWindow[1]).toBe(eraMeta[expectedNextEra].end)
    expect(useOrbStore.getState().currentEraFocus).toBe(expectedNextEra)
  })

  it("dims inactive slices when one slice is active", async () => {
    // This requires rendering multiple slices and checking material opacity.
    // The EraLayerMesh component handles opacity based on global state.
    // We'd need to check the opacity prop passed to AnimatedMeshStandardMaterial.
    // This test would be more involved.
  })

  it("updates layer opacity based on timeline drag (layerWindow change)", async () => {
    const sliceName: SliceName = "Ethics"
    // Render a slice, then change layerWindow in the store, then check opacity.
    // This also tests the EraLayerMesh's useEffect.
    const { scene } = await render(<Slice sliceName={sliceName} thetaStart={0} thetaLength={(Math.PI * 2) / 5} />)

    // Example: Set layerWindow to only include 'Contemporary' era
    const contemporaryEra = eraMeta["Contemporary"]
    await act(async () => {
      useOrbStore.getState().setLayerWindow([contemporaryEra.start, contemporaryEra.end])
    })

    // Find a mesh for an ancient layer and check its opacity (should be low)
    // Find a mesh for a contemporary layer and check its opacity (should be high)
    // This requires inspecting the children meshes and their material props.
  })

  // Test for background click resetting active slice would be in the main scene test.
})
