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

export function TimelineRange({
  minYear,
  maxYear,
  value,
  onValueChange,
  className,
  ...props
}: TimelineRangeProps) {
  const [localValue, setLocalValue] = React.useState<[number, number]>(value)

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleValueChange = (newRange: [number, number]) => {
    setLocalValue(newRange)
  }

  // Ensures the committed value always has the lower bound first
  const handleCommit = (committedRange: [number, number]) => {
    onValueChange([
      Math.min(committedRange[0], committedRange[1]),
      Math.max(committedRange[0], committedRange[1]),
    ])
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
          minStepsBetweenThumbs={10} // Kept from your original, adjust if needed
          className={cn(
            "w-full",
            // Track styling (the underlying bar)
            "[&_[data-radix-slider-track]]:h-2",
            "[&_[data-radix-slider-track]]:rounded-full",
            "[&_[data-radix-slider-track]]:bg-gray-700/70", // Dark gray track as in image
            // Range styling (the selected part of the bar)
            "[&_[data-radix-slider-range]]:bg-white", // White range as in image
            // Thumb styling (the draggable nodes)
            "[&_[role=slider]]:relative [&_[role=slider]]:z-10", // Ensure thumbs are above the range
            "[&_[role=slider]]:h-4 [&_[role=slider]]:w-4", // Size of the thumbs
            "[&_[role=slider]]:rounded-full", // Makes them circular
            "[&_[role=slider]]:bg-white", // White thumbs
            "[&_[role=slider]]:shadow-md", // Adds a subtle shadow
            "[&_[role=slider]]:focus-visible:outline-none [&_[role=slider]]:focus-visible:ring-2 [&_[role=slider]]:focus-visible:ring-sky-500", // Focus styling
            "[&_[role=slider]]:ring-1 [&_[role=slider]]:ring-inset [&_[role=slider]]:ring-black/20" // Adds a subtle ring for better definition, adjust color if needed
          )}
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
