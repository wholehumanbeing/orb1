"use client"

import { useCallback, useMemo } from "react"
import { Slider } from "@/components/ui/slider" // Using shadcn/ui Slider
import { cn } from "@/lib/utils"

/**
 * Props for the TimelineRange component
 */
interface TimelineRangeProps {
  /** Minimum year value (can be negative for BCE) */
  minYear: number
  /** Maximum year value */
  maxYear: number
  /** Current range value [start, end] */
  value: [number, number]
  /** Callback when range changes */
  onChange: (range: [number, number]) => void
  /** Interval between tick marks (default: 500) */
  tickInterval?: number
  /** CSS class name for the container */
  className?: string
}

/**
 * A timeline range slider component for filtering by year range,
 * built with shadcn/ui Slider.
 */
export function TimelineRange({
  minYear,
  maxYear,
  value,
  onChange,
  tickInterval = 500,
  className,
}: TimelineRangeProps) {
  // Format year for display (BCE/CE)
  const formatYear = useCallback((year: number): string => {
    if (year === 0) return "1 CE" // Or handle year 0 as per convention
    return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`
  }, [])

  // Generate tick marks at specified intervals
  const ticks = useMemo(() => {
    const result: { value: number; label: string }[] = []
    if (minYear >= maxYear) return [] // Avoid infinite loop if invalid range

    // Round minYear down to nearest tickInterval for the first tick
    let currentTickValue = Math.floor(minYear / tickInterval) * tickInterval
    if (currentTickValue < minYear) {
      currentTickValue += tickInterval
    }

    // Ensure the loop doesn't run excessively if tickInterval is too small or zero
    const safeTickInterval = Math.max(1, tickInterval)

    for (let year = currentTickValue; year <= maxYear; year += safeTickInterval) {
      if (year >= minYear) {
        // Only add ticks within or at the boundary of minYear
        result.push({
          value: year,
          label: formatYear(year),
        })
      }
    }
    // Ensure the last tick for maxYear is included if not perfectly divisible
    if (maxYear % safeTickInterval !== 0 && maxYear > (result[result.length - 1]?.value || minYear)) {
      const lastTick = result[result.length - 1]
      if (!lastTick || lastTick.value < maxYear) {
        // Add maxYear as a tick if it's not already the last one
      }
    }
    return result
  }, [minYear, maxYear, tickInterval, formatYear])

  const handleValueChange = (newValues: number[]) => {
    onChange(newValues as [number, number])
  }

  // Calculate percentage for tick positioning
  const getPercentage = (val: number) => {
    if (maxYear === minYear) return 0 // Avoid division by zero
    return ((val - minYear) / (maxYear - minYear)) * 100
  }

  // Keyboard navigation for shadcn/ui Slider is built-in.
  // Shift+Arrow for 10-year steps is not standard for Radix Slider.
  // We rely on its default keyboard navigation (Arrow keys for 1-step, PageUp/Down for larger steps).

  return (
    <div className={cn("w-full bg-black/80 backdrop-blur-sm border-t border-gray-700 py-8 px-6 text-white", className)}>
      <div className="max-w-7xl mx-auto relative">
        <div className="flex justify-between mb-3 text-sm">
          <span className="text-gray-400">{formatYear(value[0])}</span>
          <span className="font-semibold text-cyan-300">
            Selected: {formatYear(value[0])} – {formatYear(value[1])}
          </span>
          <span className="text-gray-400">{formatYear(value[1])}</span>
        </div>

        <Slider
          min={minYear}
          max={maxYear}
          step={1}
          value={value}
          onValueChange={handleValueChange}
          minStepsBetweenThumbs={1}
          className="w-full h-6 group"
        />

        {/* Tick Marks */}
        <div className="relative h-6 mt-1">
          {" "}
          {/* Container for ticks, aligned with slider */}
          {ticks.map((tick, index) => (
            <div
              key={index}
              className="absolute flex flex-col items-center transform -translate-x-1/2"
              style={{ left: `${getPercentage(tick.value)}%` }}
            >
              <div
                className={cn(
                  "w-0.5 h-2 rounded-full",
                  tick.value >= value[0] && tick.value <= value[1] ? "bg-cyan-400" : "bg-gray-600",
                )}
              />
              <span
                className={cn(
                  "text-xs mt-1 whitespace-nowrap",
                  tick.value >= value[0] && tick.value <= value[1] ? "text-cyan-300" : "text-gray-500",
                )}
              >
                {tick.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
