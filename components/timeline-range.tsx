"use client"

import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface TimelineRangeProps extends React.ComponentProps<typeof Slider> {
  minYear: number
  maxYear: number
  value: [number, number]
  onValueChange: (value: [number, number]) => void
  className?: string
}

export function TimelineRange({ minYear, maxYear, value, onValueChange, className, ...props }: TimelineRangeProps) {
  const [localValue, setLocalValue] = React.useState<[number, number]>(value)

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleValueChange = (newRange: [number, number]) => {
    setLocalValue(newRange)
  }

  const handleCommit = (committedRange: [number, number]) => {
    onValueChange(committedRange)
  }

  const formatYear = (year: number): string => {
    if (year < 0) return `${Math.abs(year)} BCE`
    return `${year} CE`
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10 p-4 md:p-6 z-50",
        className,
      )}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center text-xs text-gray-400 mb-2 px-1">
          <span>{formatYear(localValue[0])}</span>
          <span>{formatYear(localValue[1])}</span>
        </div>
        <Slider
          min={minYear}
          max={maxYear}
          step={1}
          value={localValue}
          onValueChange={handleValueChange}
          onValueCommit={handleCommit} // Use onValueCommit to call the prop callback
          minStepsBetweenThumbs={10} // Ensure a minimum gap between thumbs
          className="w-full"
          {...props}
        />
        <div className="flex justify-between items-center text-xs text-gray-500 mt-1 px-1">
          <span>{formatYear(minYear)}</span>
          <span>{formatYear(maxYear)}</span>
        </div>
      </div>
    </div>
  )
}
