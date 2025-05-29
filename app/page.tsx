"use client"

import { useEffect, Suspense } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Stats } from "@react-three/drei"

import { TimelineRange } from "@/components/TimelineRange"
import { Slice } from "@/components/Slice" // New Slice component
import { useOrbStore, initializePhilosophers, type Philosopher } from "@/store/orbStore"
import { sliceNames } from "@/libs/constants"

// Sample philosopher data - replace with your actual data loading
const samplePhilosophersData: Philosopher[] = [
  { id: "socrates", name: "Socrates", born: -470, died: -399, slice: "Ethics" },
  { id: "plato", name: "Plato", born: -428, died: -348, slice: "Metaphysics" },
  { id: "aristotle", name: "Aristotle", born: -384, died: -322, slice: "Logic" },
  { id: "kant", name: "Immanuel Kant", born: 1724, died: 1804, slice: "Ethics" },
  { id: "nietzsche", name: "Friedrich Nietzsche", born: 1844, died: 1900, slice: "Aesthetics" },
  { id: "wittgenstein", name: "Ludwig Wittgenstein", born: 1889, died: 1951, slice: "Logic" },
  { id: "foucault", name: "Michel Foucault", born: 1926, died: 1984, slice: "Politics" },
  { id: "aquinas", name: "Thomas Aquinas", born: 1225, died: 1274, slice: "Metaphysics" }, // Medieval
  { id: "descartes", name: "René Descartes", born: 1596, died: 1650, slice: "Metaphysics" }, // Renaissance/EarlyModern
]

// Dynamically import the Globe component if it's separate, otherwise define scene here
// const Globe = dynamic(() => import("@/components/Globe"), { ssr: false });

function OrbScene() {
  const { philosophers, setVisiblePhilosophers, layerWindow, setSliceActive } = useOrbStore()
  const { scene } = useThree() // For background click

  useEffect(() => {
    // Initialize philosophers on mount
    initializePhilosophers(samplePhilosophersData)
  }, [])

  useEffect(() => {
    if (philosophers.length === 0) {
      setVisiblePhilosophers([])
      return
    }
    const [start, end] = layerWindow
    setVisiblePhilosophers(philosophers.filter((p) => p.born <= end && p.died >= start))
  }, [layerWindow, philosophers, setVisiblePhilosophers])

  const numSlices = sliceNames.length
  const wedgeAngle = (Math.PI * 2) / numSlices

  // Background click handler
  const handleBackgroundClick = () => {
    setSliceActive(null)
  }

  // This plane is for catching clicks that miss the orb slices
  // It should be large enough to cover the background from the camera's perspective
  // and positioned behind the orb.
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {sliceNames.map((name, index) => (
        <Slice key={name} sliceName={name} thetaStart={index * wedgeAngle} thetaLength={wedgeAngle} />
      ))}

      {/* Invisible plane for background clicks */}
      <mesh onClick={handleBackgroundClick} rotation-x={-Math.PI / 2} position-y={-10}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial visible={false} />
      </mesh>

      {/* Placeholder for actual philosopher nodes if they are rendered here */}
      {/* <PhilosopherNodes /> */}
    </>
  )
}

export default function Home() {
  const { minYear, maxYear, layerWindow, setLayerWindow } = useOrbStore()

  // This effect ensures that layerWindow is initialized after minYear/maxYear are set from philosophers
  useEffect(() => {
    if (minYear !== -700 && maxYear !== new Date().getFullYear()) {
      // Check if default values are updated
      setLayerWindow([minYear, maxYear])
    }
  }, [minYear, maxYear, setLayerWindow])

  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }}>
        <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
          <Suspense fallback={null}>
            <OrbScene />
          </Suspense>
          <OrbitControls enablePan={false} minDistance={3} maxDistance={10} />
          <Stats />
        </Canvas>
      </div>

      {minYear !== -700 && maxYear !== new Date().getFullYear() ? ( // Render timeline only when real year range is available
        <div className="fixed bottom-0 left-0 right-0 z-10 timeline-container">
          <TimelineRange
            minYear={minYear}
            maxYear={maxYear}
            value={layerWindow}
            onChange={setLayerWindow}
            tickInterval={500}
          />
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 z-10 h-24 bg-black/80 flex items-center justify-center">
          <p className="text-white">Loading timeline data...</p>
        </div>
      )}
    </main>
  )
}
