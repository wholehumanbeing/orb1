"use client"

import { useEffect, useState, useMemo } from "react" // Added useMemo
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { TimelineRange } from "@/components/TimelineRange" // Corrected path if necessary
import { useOrbStore } from "@/store/orbStore" // Corrected path if necessary

// Dynamically import the Globe component to avoid SSR issues with Three.js
const Globe = dynamic(() => import("@/components/Globe"), { ssr: false })

export default function Home() {
  const philosophers = useOrbStore((state) => state.philosophers)
  const setVisible = useOrbStore((state) => state.setVisible)

  // Calculate min and max years from the philosophers data
  // useMemo will prevent recalculation on every render unless philosophers array changes
  const [minYear, maxYear] = useMemo(() => {
    if (philosophers.length === 0) {
      return [-700, 2025] // Default values if no philosophers
    }
    const bornYears = philosophers.map((p) => p.born)
    const diedYears = philosophers.map((p) => p.died)
    return [Math.min(...bornYears), Math.max(...diedYears)]
  }, [philosophers])

  // Initialize range state with min and max years
  const [range, setRange] = useState<[number, number]>([minYear, maxYear])

  // Update range if minYear/maxYear change (e.g. philosophers loaded async)
  useEffect(() => {
    setRange([minYear, maxYear])
  }, [minYear, maxYear])

  // Filter philosophers based on the selected range
  useEffect(() => {
    // Ensure philosophers are loaded before filtering
    if (philosophers.length === 0) {
      setVisible([])
      return
    }
    const [start, end] = range
    setVisible(philosophers.filter((p) => p.born <= end && p.died >= start))
  }, [range, philosophers, setVisible])

  // Prevent rendering TimelineRange if philosophers haven't loaded min/max years
  if (philosophers.length === 0 && minYear === -700 && maxYear === 2025) {
    // Or some other loading state for the timeline
    return (
      <main className="relative min-h-screen bg-black overflow-hidden">
        <Suspense fallback={<div className="flex items-center justify-center h-screen text-white">Loading Orb...</div>}>
          <Globe />
        </Suspense>
        <div className="fixed bottom-0 left-0 right-0 z-10 h-24 bg-black/80 flex items-center justify-center">
          <p className="text-white">Loading timeline data...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <Suspense fallback={<div className="flex items-center justify-center h-screen text-white">Loading Orb...</div>}>
        <Globe />
      </Suspense>

      {/* Timeline Range Slider */}
      <div className="fixed bottom-0 left-0 right-0 z-10 timeline-container">
        <TimelineRange minYear={minYear} maxYear={maxYear} value={range} onChange={setRange} />
      </div>
    </main>
  )
}
