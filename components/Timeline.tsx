"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { timePeriods, earliestBirthYear, latestBirthYear } from "@/app/data/allPhilosophers"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"

interface TimelineProps {
  onYearRangeChange: (startYear: number, endYear: number) => void
  minYear?: number
  maxYear?: number
  initialStartYear?: number
  initialEndYear?: number
}

export default function Timeline({
  onYearRangeChange,
  minYear = earliestBirthYear,
  maxYear = latestBirthYear,
  initialStartYear = minYear,
  initialEndYear = maxYear,
}: TimelineProps) {
  const [yearRange, setYearRange] = useState<[number, number]>([initialStartYear, initialEndYear])
  const [isPlaying, setIsPlaying] = useState(false)
  const [activePeriod, setActivePeriod] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  // Format year for display (BCE/CE)
  const formatYear = (year: number) => {
    if (year <= 0) {
      return `${Math.abs(year)} BCE`
    }
    return `${year} CE`
  }

  // Handle slider change
  const handleSliderChange = (values: number[]) => {
    const [start, end] = values as [number, number]
    setYearRange([start, end])
    onYearRangeChange(start, end)

    // Find active period
    const period = timePeriods.find((p) => start >= p.startYear && end <= p.endYear)
    setActivePeriod(period?.name || null)
  }

  // Handle period selection
  const handlePeriodSelect = (period: (typeof timePeriods)[0]) => {
    setYearRange([period.startYear, period.endYear])
    onYearRangeChange(period.startYear, period.endYear)
    setActivePeriod(period.name)
  }

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      const windowSize = yearRange[1] - yearRange[0]
      let newStart = yearRange[0] + 10
      let newEnd = yearRange[1] + 10

      // Reset if we reach the end
      if (newEnd > maxYear) {
        newStart = minYear
        newEnd = minYear + windowSize
      }

      setYearRange([newStart, newEnd])
      onYearRangeChange(newStart, newEnd)
    }, 500)

    return () => clearInterval(interval)
  }, [isPlaying, yearRange, minYear, maxYear, onYearRangeChange])

  // Narrow the range
  const narrowRange = () => {
    const currentSize = yearRange[1] - yearRange[0]
    const newSize = Math.max(50, currentSize - 50)
    const midpoint = (yearRange[0] + yearRange[1]) / 2
    const newStart = Math.max(minYear, Math.floor(midpoint - newSize / 2))
    const newEnd = Math.min(maxYear, Math.ceil(midpoint + newSize / 2))

    setYearRange([newStart, newEnd])
    onYearRangeChange(newStart, newEnd)
  }

  // Widen the range
  const widenRange = () => {
    const currentSize = yearRange[1] - yearRange[0]
    const newSize = Math.min(maxYear - minYear, currentSize + 50)
    const midpoint = (yearRange[0] + yearRange[1]) / 2
    const newStart = Math.max(minYear, Math.floor(midpoint - newSize / 2))
    const newEnd = Math.min(maxYear, Math.ceil(midpoint + newSize / 2))

    setYearRange([newStart, newEnd])
    onYearRangeChange(newStart, newEnd)
  }

  return (
    <motion.div
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900/90 backdrop-blur-md text-white rounded-lg shadow-lg p-4 w-full max-w-3xl"
      initial={{ y: 100, opacity: 0 }}
      animate={{
        y: isExpanded ? 0 : 60,
        opacity: 1,
        height: isExpanded ? "auto" : "60px",
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Philosophical Timeline</h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsExpanded(!isExpanded)}>
          <ChevronLeft
            className={`h-4 w-4 transform transition-transform ${isExpanded ? "rotate-90" : "-rotate-90"}`}
          />
        </Button>
      </div>

      {isExpanded && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="text-xs">{formatYear(yearRange[0])}</div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={narrowRange}>
                <ChevronLeft className="h-3 w-3" />
                <ChevronRight className="h-3 w-3 -ml-1" />
              </Button>
              <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={widenRange}>
                <ChevronRight className="h-3 w-3" />
                <ChevronLeft className="h-3 w-3 -ml-1" />
              </Button>
            </div>
            <div className="text-xs">{formatYear(yearRange[1])}</div>
          </div>

          <div className="mb-4">
            <Slider
              value={yearRange}
              min={minYear}
              max={maxYear}
              step={1}
              onValueChange={handleSliderChange}
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {timePeriods.map((period) => (
              <Button
                key={period.name}
                variant={activePeriod === period.name ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
                onClick={() => handlePeriodSelect(period)}
              >
                {period.name}
              </Button>
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}
