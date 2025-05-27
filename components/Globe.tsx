"use client"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { Text } from "@react-three/drei"

import { Timeline } from "./Timeline"
import {
  allPhilosophers,
  getPhilosophersInTimeRange,
  getBirthYear,
  domainColors,
  earliestBirthYear,
  latestBirthYear,
} from "@/app/data/allPhilosophers"

interface Philosopher {
  id: string
  name: string
  birthYear: number
  deathYear: number
  domains: string[]
  description: string
}

interface GlobeProps {
  selectedDomain: string | null
}

function Globe({ selectedDomain }: GlobeProps) {
  const [selectedPhilosopher, setSelectedPhilosopher] = useState<Philosopher | null>(null)
  const [hoveredPhilosopher, setHoveredPhilosopher] = useState<Philosopher | null>(null)

  const [timeRangeStart, setTimeRangeStart] = useState(earliestBirthYear)
  const [timeRangeEnd, setTimeRangeEnd] = useState(latestBirthYear)
  const [visiblePhilosophers, setVisiblePhilosophers] = useState(allPhilosophers)

  useEffect(() => {
    const philosophersInRange = getPhilosophersInTimeRange(timeRangeStart, timeRangeEnd)
    setVisiblePhilosophers(philosophersInRange)
  }, [timeRangeStart, timeRangeEnd])

  return (
    <>
      <Canvas style={{ width: "100%", height: "800px" }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade={true} />

        {/* Earth */}
        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial color="#4287f5" />
        </mesh>

        {/* Philosophers */}
        {visiblePhilosophers.map((philosopher, index) => {
          const layerRadius = 2.5 + index * 0.15
          const birthYear = getBirthYear(philosopher)
          const normalizedYear = (birthYear - earliestBirthYear) / (latestBirthYear - earliestBirthYear)

          return (
            <group key={philosopher.id}>
              {/* Philosopher sphere layer */}
              <mesh
                position={[0, 0, 0]}
                onClick={() => setSelectedPhilosopher(philosopher)}
                onPointerOver={() => setHoveredPhilosopher(philosopher)}
                onPointerOut={() => setHoveredPhilosopher(null)}
              >
                <sphereGeometry args={[layerRadius, 64, 64]} />
                <meshStandardMaterial
                  color={domainColors[selectedDomain as keyof typeof domainColors] || "#ffffff"}
                  transparent
                  opacity={0.1 + index * 0.02}
                  wireframe
                />
              </mesh>

              {/* Philosopher label */}
              <Text
                position={[layerRadius + 0.5, 0, 0]}
                fontSize={0.15}
                color="white"
                anchorX="left"
                rotation={[0, Math.PI * normalizedYear * 2, 0]}
              >
                {philosopher.name}
              </Text>
            </group>
          )
        })}
      </Canvas>

      <div className="absolute top-0 left-0 p-4">
        {selectedPhilosopher && (
          <div className="bg-white/80 p-4 rounded-md">
            <h2 className="text-lg font-bold">{selectedPhilosopher.name}</h2>
            <p className="text-sm">
              {selectedPhilosopher.birthYear} - {selectedPhilosopher.deathYear}
            </p>
            <p className="text-sm">{selectedPhilosopher.description}</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 p-4">
        {hoveredPhilosopher && (
          <div className="bg-white/80 p-4 rounded-md">
            <h2 className="text-lg font-bold">{hoveredPhilosopher.name}</h2>
            <p className="text-sm">
              {hoveredPhilosopher.birthYear} - {hoveredPhilosopher.deathYear}
            </p>
          </div>
        )}
      </div>

      <div className="absolute top-0 right-0 p-4">
        <div className="text-sm text-white/60">{visiblePhilosophers.length} philosophers visible</div>
      </div>

      <Timeline
        startYear={timeRangeStart}
        endYear={timeRangeEnd}
        onTimeRangeChange={(start, end) => {
          setTimeRangeStart(start)
          setTimeRangeEnd(end)
        }}
      />
    </>
  )
}

export default Globe
