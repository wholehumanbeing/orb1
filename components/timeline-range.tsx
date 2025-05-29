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

  const handleValueChange = (range: [number, number]) => setLocalValue(range)

  // always commit the lower bound first → upper bound second
  const handleCommit = (range: [number, number]) =>
    onValueChange([
      Math.min(range[0], range[1]),
      Math.max(range[0], range[1]),
    ])

  const y = (n: number) => (n < 0 ? `${Math.abs(n)} BCE` : `${n} CE`)

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 p-4 backdrop-blur-sm md:p-6",
        className,
      )}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-2 flex items-center justify-between px-1 text-xs text-gray-400">
          <span>{y(localValue[0])}</span>
          <span>{y(localValue[1])}</span>
        </div>

        <Slider
          min={minYear}
          max={maxYear}
          step={1}
          value={localValue}
          onValueChange={handleValueChange}
          onValueCommit={handleCommit}
          minStepsBetweenThumbs={1}
          // track
          className={cn(
            "w-full",
            "[&_[data-radix-slider-track]]:h-2 [&_[data-radix-slider-track]]:rounded-full [&_[data-radix-slider-track]]:bg-gray-700/70",
            "[&_[data-radix-slider-range]]:bg-white",
            // thumbs (one node per end)
            "[&_[role=slider]]:relative [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:translate-y-[-1px] [&_[role=slider]]:rounded-full [&_[role=slider]]:bg-white [&_[role=slider]]:shadow-md [&_[role=slider]]:focus:outline-none",
          )}
          {...props}
        />

        <div className="mt-1 flex items-center justify-between px-1 text-xs text-gray-500">
          <span>{y(minYear)}</span>
          <span>{y(maxYear)}</span>
        </div>
      </div>
    </div>
  )
}
