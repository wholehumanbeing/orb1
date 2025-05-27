"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { timePeriods } from "@/app/data/allPhilosophers"

interface TimelineProps {
  onYearRangeChange: (startYear: number, endYear: number) => void
  minYear: number
  maxYear: number
  initialStartYear: number
  initialEndYear: number
}

export default function Timeline({
  onYearRangeChange,
  minYear,
  maxYear,
  initialStartYear,
  initialEndYear,
}: TimelineProps) {
  const [range, setRange] = useState<[number, number]>([initialStartYear, initialEndYear])
  const [activePeriod, setActivePeriod] = useState<string | null>(null)

  // Handle slider change
  const handleRangeChange = (values: number[]) => {
    const [start, end] = values as [number, number]
    setRange([start, end])
    onYearRangeChange(start, end)

    // Find active period based on range
    const period = timePeriods.find(
      (p) =>
        (start >= p.startYear && start <= p.endYear) ||
        (end >= p.startYear && end <= p.endYear) ||
        (start <= p.startYear && end >= p.endYear),
    )
    setActivePeriod(period?.name || null)
  }

  // Set period from button click
  const handlePeriodClick = (period: (typeof timePeriods)[0]) => {
    setRange([period.startYear, period.endYear])
    onYearRangeChange(period.startYear, period.endYear)
    setActivePeriod(period.name)
  }

  // Format year for display
  const formatYear = (year: number) => {
    return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-gray-900/90 backdrop-blur-md text-white p-4 rounded-lg shadow-xl w-11/12 max-w-4xl">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Timeline Filter</h3>
        <div className="text-sm">
          <span className="font-medium">{formatYear(range[0])}</span> to{" "}
          <span className="font-medium">{formatYear(range[1])}</span>
        </div>
      </div>

      <div className="mb-6 px-2">
        <Slider
          defaultValue={range}
          min={minYear}
          max={maxYear}
          step={10}
          value={range}
          onValueChange={handleRangeChange}
          className="my-4"
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {timePeriods.map((period) => (
          <button
            key={period.name}
            onClick={() => handlePeriodClick(period)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activePeriod === period.name ? "bg-white text-gray-900 font-medium" : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {period.name}
          </button>
        ))}
        <button
          onClick={() => {
            setRange([minYear, maxYear])
            onYearRangeChange(minYear, maxYear)
            setActivePeriod(null)
          }}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            activePeriod === null ? "bg-white text-gray-900 font-medium" : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          All Time
        </button>
      </div>
    </div>
  )
}
