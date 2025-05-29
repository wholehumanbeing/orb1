"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { TimelineRange } from "@/components/TimelineRange"
import { useOrbStore } from "@/store/orbStore"

// Dynamically import the Globe component to avoid SSR issues with Three.js
const Globe = dynamic(() => import("@/components/Globe"), { ssr: false })

export default function Home() {
  const philosophers = useOrbStore((state) => state.philosophers)
  const setVisible = useOrbStore((state) => state.setVisible)

  // Calculate min and max years from the philosophers data
  const minYear = Math.min(...philosophers.map((p) => p.born))
  const maxYear = Math.max(...philosophers.map((p) => p.died))

  // Initialize range state with min and max years
  const [range, setRange] = useState<[number, number]>([minYear, maxYear])

  // Filter philosophers based on the selected range
  useEffect(() => {
    const [start, end] = range
    setVisible(philosophers.filter((p) => p.born <= end && p.died >= start))
  }, [range, philosophers, setVisible])

  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <Suspense fallback={<div className="flex items-center justify-center h-screen text-white">Loading...</div>}>
        <Globe />
      </Suspense>

      {/* Timeline Range Slider */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <TimelineRange minYear={minYear} maxYear={maxYear} value={range} onChange={setRange} />
      </div>
    </main>
  )
}
