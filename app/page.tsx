"use client"

import { useEffect, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

import { TimelineRange } from "@/components/TimelineRange"
import { Slice } from "@/components/Slice"
import { useOrbStore, initializePhilosophers, type Philosopher } from "@/store/orbStore"
import { sliceNames } from "@/libs/constants"

// Sample philosopher data
const samplePhilosophersData: Philosopher[] = [
  { id: "socrates", name: "Socrates", born: -470, died: -399, slice: "Ethics" },
  { id: "plato", name: "Plato", born: -428, died: -348, slice: "Metaphysics" },
  { id: "aristotle", name: "Aristotle", born: -384, died: -322, slice: "Logic" },
  { id: "kant", name: "Immanuel Kant", born: 1724, died: 1804, slice: "Ethics" },
  { id: "nietzsche", name: "Friedrich Nietzsche", born: 1844, died: 1900, slice: "Aesthetics" },
  { id: "wittgenstein", name: "Ludwig Wittgenstein", born: 1889, died: 1951, slice: "Logic" },
  { id: "foucault", name: "Michel Foucault", born: 1926, died: 1984, slice: "Politics" },
  { id: "aquinas", name: "Thomas Aquinas", born: 1225, died: 1274, slice: "Metaphysics" },
  { id: "descartes", name: "René Descartes", born: 1596, died: 1650, slice: "Metaphysics" },
]

function OrbScene() {
  const { philosophers, setVisiblePhilosophers, layerWindow, setSliceActive } = useOrbStore()

  useEffect(() => {
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

  const handleBackgroundClick = () => {
    setSliceActive(null)
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {sliceNames.map((name, index) => (
        <Slice key={name} sliceName={name} thetaStart={index * wedgeAngle} thetaLength={wedgeAngle} />
      ))}

      {/* Background plane for click handling */}
      <mesh onClick={handleBackgroundClick} rotation-x={-Math.PI / 2} position-y={-10}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial visible={false} />
      </mesh>
    </>
  )
}

export default function Home() {
  const { minYear, maxYear, layerWindow, setLayerWindow } = useOrbStore()

  useEffect(() => {
    if (minYear !== -700 && maxYear !== new Date().getFullYear()) {
      setLayerWindow([minYear, maxYear])
    }
  }, [minYear, maxYear, setLayerWindow])

  const hasValidYearRange = minYear !== -700 && maxYear !== new Date().getFullYear()

  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 2, 8], fov: 75 }}>
          <Suspense fallback={null}>
            <OrbScene />
          </Suspense>
          <OrbitControls enablePan={false} minDistance={5} maxDistance={15} />
        </Canvas>
      </div>

      {hasValidYearRange ? (
        <div className="fixed bottom-0 left-0 right-0 z-10">
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
