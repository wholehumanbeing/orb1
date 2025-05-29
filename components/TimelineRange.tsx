"use client"

import type React from "react"

import { useCallback, useMemo } from "react"
import { Range } from "@tanstack/react-range"
import { cn } from "@/lib/utils"

/**
 * Props for the TimelineRange component
 */
interface TimelineRangeProps {
  /**
   * Minimum year value (can be negative for BCE)
   */
  minYear: number
  /**
   * Maximum year value
   */
  maxYear: number
  /**
   * Current range value [start, end]
   */
  value: [number, number]
  /**
   * Callback when range changes
   */
  onChange: (range: [number, number]) => void
  /**
   * Interval between tick marks (default: 500)
   */
  tickInterval?: number
  /**
   * CSS class name for the container
   */
  className?: string
}

/**
 * A timeline range slider component for filtering philosophers by year range
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
    return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`
  }, [])

  // Generate tick marks at specified intervals
  const ticks = useMemo(() => {
    const result = []
    // Round minYear down to nearest tickInterval
    const start = Math.floor(minYear / tickInterval) * tickInterval
    // Round maxYear up to nearest tickInterval
    const end = Math.ceil(maxYear / tickInterval) * tickInterval

    for (let year = start; year <= end; year += tickInterval) {
      result.push({
        value: year,
        label: formatYear(year),
      })
    }
    return result
  }, [minYear, maxYear, tickInterval, formatYear])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const step = e.shiftKey ? 10 : 1
      const newValue = [...value] as [number, number]

      if (e.key === "ArrowLeft") {
        newValue[index] = Math.max(minYear, newValue[index] - step)
        onChange(newValue)
        e.preventDefault()
      } else if (e.key === "ArrowRight") {
        newValue[index] = Math.min(maxYear, newValue[index] + step)
        onChange(newValue)
        e.preventDefault()
      }
    },
    [value, onChange, minYear, maxYear],
  )

  return (
    <div className={cn("w-full bg-black/80 backdrop-blur-sm border-t border-gray-800 py-6 px-4 text-white", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between mb-2 text-sm text-gray-400">
          <span>{formatYear(value[0])}</span>
          <span className="font-medium text-cyan-400">
            {formatYear(value[0])} – {formatYear(value[1])}
          </span>
          <span>{formatYear(value[1])}</span>
        </div>

        <Range
          min={minYear}
          max={maxYear}
          step={1}
          values={value}
          onChange={(values) => onChange(values as [number, number])}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="w-full h-1 bg-gray-700 rounded-full"
              style={{
                ...props.style,
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props, index, isDragged }) => (
            <div
              {...props}
              tabIndex={0}
              role="slider"
              aria-valuenow={value[index]}
              aria-valuemin={minYear}
              aria-valuemax={maxYear}
              aria-label={index === 0 ? "Start year" : "End year"}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "w-5 h-5 rounded-full bg-cyan-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black",
                "transition-all duration-150",
                isDragged ? "scale-110 shadow-cyan-500/50" : "hover:scale-105 hover:shadow-cyan-500/30",
              )}
              style={{
                ...props.style,
                boxShadow: isDragged ? "0 0 10px 2px rgba(6, 182, 212, 0.5)" : "0 0 5px 1px rgba(6, 182, 212, 0.2)",
              }}
            />
          )}
          renderMark={({ props, index }) => {
            const tick = ticks[index]
            if (!tick) return null

            const isInRange = tick.value >= value[0] && tick.value <= value[1]
            const isEndpoint = tick.value === minYear || tick.value === maxYear

            return (
              <div
                {...props}
                className="flex flex-col items-center"
                style={{
                  ...props.style,
                  marginTop: "8px",
                }}
              >
                <div
                  className={cn(
                    "w-0.5 h-2 rounded-full",
                    isInRange ? "bg-cyan-500" : "bg-gray-600",
                    isEndpoint ? "opacity-100" : "opacity-70",
                  )}
                />
                <span
                  className={cn(
                    "text-xs mt-1",
                    isInRange ? "text-cyan-400" : "text-gray-500",
                    isEndpoint ? "opacity-100" : "opacity-70",
                  )}
                >
                  {tick.label}
                </span>
              </div>
            )
          }}
        />
      </div>
    </div>
  )
}
