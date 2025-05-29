"use client"

import * as React from "react"
import { Slider } from "@/components/ui/slider" // Assuming this is a Radix UI based Slider
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

  // Ensures the committed value always has the lower bound first
  const handleCommit = (committedRange: [number, number]) => {
    onValueChange([Math.min(committedRange[0], committedRange[1]), Math.max(committedRange[0], committedRange[1])])
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
          {/* Display current selected range */}
          <span>{formatYear(localValue[0])}</span>
          <span>{formatYear(localValue[1])}</span>
        </div>
        <Slider
          min={minYear}
          max={maxYear}
          step={1}
          value={localValue}
          onValueChange={handleValueChange}
          onValueCommit={handleCommit}
          minStepsBetweenThumbs={10}
          className="w-full [&_[data-radix-slider-track]]:h-2 [&_[data-radix-slider-track]]:bg-gray-600 [&_[data-radix-slider-range]]:bg-blue-500 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:rounded-full [&_[role=slider]]:shadow-lg [&_[role=slider]]:cursor-grab [&_[role=slider]:hover]:bg-blue-600 [&_[role=slider]:active]:cursor-grabbing [&_[role=slider]:focus]:outline-none [&_[role=slider]:focus]:ring-2 [&_[role=slider]:focus]:ring-blue-400 [&_[role=slider]:focus]:ring-offset-2"
          {...props}
        />
        <div className="flex justify-between items-center text-xs text-gray-500 mt-1 px-1">
          {/* Display min and max possible years */}
          <span>{formatYear(minYear)}</span>
          <span>{formatYear(maxYear)}</span>
        </div>
      </div>
    </div>
  )
}
