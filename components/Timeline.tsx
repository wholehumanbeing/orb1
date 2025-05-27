"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronUp, ChevronDown, Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { timePeriods, earliestBirthYear, latestBirthYear } from "@/app/data/allPhilosophers"

interface TimelineProps {
  startYear: number
  endYear: number
  onTimeRangeChange: (start: number, end: number) => void
}

export function Timeline({ startYear, endYear, onTimeRangeChange }: TimelineProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(1) // 1 = normal, 2 = fast, 0.5 = slow
  const [windowSize, setWindowSize] = useState(endYear - startYear) // Years in the time window

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      const step = 25 * playSpeed
      const newStart = startYear + step
      const newEnd = endYear + step

      if (newEnd > latestBirthYear + 100) {
        // Reset to beginning when reaching the end
        onTimeRangeChange(earliestBirthYear, earliestBirthYear + windowSize)
        setIsPlaying(false)
      } else {
        onTimeRangeChange(newStart, newEnd)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [isPlaying, startYear, endYear, windowSize, playSpeed, onTimeRangeChange])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = Number(e.target.value)
    onTimeRangeChange(newStart, newStart + windowSize)
  }

  const handlePeriodClick = (period: (typeof timePeriods)[0]) => {
    onTimeRangeChange(period.startYear, period.endYear)
    setWindowSize(period.endYear - period.startYear)
    setIsPlaying(false)
  }

  const adjustWindowSize = (delta: number) => {
    const newSize = Math.max(50, Math.min(2000, windowSize + delta))
    setWindowSize(newSize)

    // Keep the center of the window the same
    const center = (startYear + endYear) / 2
    const newStart = Math.max(earliestBirthYear, Math.floor(center - newSize / 2))
    const newEnd = Math.min(latestBirthYear, Math.ceil(center + newSize / 2))

    onTimeRangeChange(newStart, newEnd)
  }

  const formatYear = (year: number) => {
    if (year < 0) return `${Math.abs(year)} BCE`
    return `${year} CE`
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10 transition-all duration-300 ${
        isCollapsed ? "h-12" : "h-48"
      }`}
    >
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-2 right-2 p-1 text-white/60 hover:text-white transition-colors"
      >
        {isCollapsed ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isCollapsed ? (
        <div className="flex items-center justify-between px-6 h-full">
          <span className="text-sm text-white/60">
            {formatYear(startYear)} - {formatYear(endYear)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-4">
          {/* Time Period Buttons */}
          <div className="flex gap-2 flex-wrap">
            {timePeriods.map((period) => (
              <button
                key={period.name}
                onClick={() => handlePeriodClick(period)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  startYear === period.startYear && endYear === period.endYear
                    ? "bg-white text-black font-medium"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {period.name}
              </button>
            ))}
            <button
              onClick={() => {
                onTimeRangeChange(earliestBirthYear, latestBirthYear)
                setWindowSize(latestBirthYear - earliestBirthYear)
              }}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                startYear === earliestBirthYear && endYear === latestBirthYear
                  ? "bg-white text-black font-medium"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              All Time
            </button>
          </div>

          {/* Timeline Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>{formatYear(startYear)}</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => adjustWindowSize(-50)}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors text-xs"
                >
                  Narrow
                </button>
                <span className="text-white/80">Window: {windowSize} years</span>
                <button
                  onClick={() => adjustWindowSize(50)}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors text-xs"
                >
                  Widen
                </button>
              </div>
              <span>{formatYear(endYear)}</span>
            </div>

            <input
              type="range"
              min={earliestBirthYear}
              max={latestBirthYear - windowSize}
              value={startYear}
              onChange={handleSliderChange}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  transparent 0%, 
                  #3a86ff ${((startYear - earliestBirthYear) / (latestBirthYear - earliestBirthYear)) * 100}%, 
                  #ff006e ${((endYear - earliestBirthYear) / (latestBirthYear - earliestBirthYear)) * 100}%, 
                  transparent 100%)`,
              }}
            />

            {/* Timeline markers */}
            <div className="relative w-full h-4">
              {timePeriods.map((period) => {
                const leftPos = ((period.startYear - earliestBirthYear) / (latestBirthYear - earliestBirthYear)) * 100
                const width = ((period.endYear - period.startYear) / (latestBirthYear - earliestBirthYear)) * 100

                return (
                  <div
                    key={period.name}
                    className="absolute h-1 bg-white/30 top-1"
                    style={{
                      left: `${leftPos}%`,
                      width: `${width}%`,
                    }}
                  >
                    <div
                      className="absolute text-[10px] text-white/50 whitespace-nowrap"
                      style={{
                        left: "0",
                        top: "4px",
                        transform: width < 10 ? "translateX(-50%)" : "none",
                      }}
                    >
                      {period.name}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                onTimeRangeChange(earliestBirthYear, earliestBirthYear + windowSize)
                setIsPlaying(false)
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                onTimeRangeChange(latestBirthYear - windowSize, latestBirthYear)
                setIsPlaying(false)
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Speed controls */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPlaySpeed(0.5)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                playSpeed === 0.5 ? "bg-white/40" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              0.5x
            </button>
            <button
              onClick={() => setPlaySpeed(1)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                playSpeed === 1 ? "bg-white/40" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setPlaySpeed(2)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                playSpeed === 2 ? "bg-white/40" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              2x
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        input[type=range]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }

        input[type=range]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          border: none;
        }
      `}</style>
    </div>
  )
}
