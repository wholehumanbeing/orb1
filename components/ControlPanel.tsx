"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Pause, Play, ChevronUp, ChevronDown, Settings, X } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { domainColors } from "@/app/data/allPhilosophers"

interface ControlPanelProps {
  isPaused: boolean
  setIsPaused: (value: boolean) => void
  speed: number
  setSpeed: (value: number) => void
  currentColor: string
  setCurrentColor: (value: string) => void
  predefinedColors: string[]
}

export default function ControlPanel({
  isPaused,
  setIsPaused,
  speed,
  setSpeed,
  currentColor,
  setCurrentColor,
  predefinedColors,
}: ControlPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".control-panel") && !target.closest(".control-toggle")) {
        setIsExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Get domain names for the color picker
  const domainNames = Object.keys(domainColors).map((key) => key.charAt(0).toUpperCase() + key.slice(1))

  return (
    <>
      {/* Mobile toggle button */}
      <motion.button
        className="control-toggle fixed bottom-4 left-4 z-50 bg-gray-900/80 backdrop-blur-sm text-white p-3 rounded-full shadow-lg md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X size={20} /> : <Settings size={20} />}
      </motion.button>

      {/* Mobile controls */}
      <motion.div
        className="fixed bottom-16 left-4 z-40 md:hidden"
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={isOpen ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        {isOpen && (
          <div className="bg-gray-900/90 backdrop-blur-md text-white p-4 rounded-lg shadow-lg w-[280px]">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Orb Controls</h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Animation</span>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setIsPaused(!isPaused)}>
                    {isPaused ? <Play size={14} /> : <Pause size={14} />}
                  </Button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Speed: {speed.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[speed]}
                    min={0.1}
                    max={3}
                    step={0.1}
                    onValueChange={(value) => setSpeed(value[0])}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-xs">Domain Colors</span>
                  <div className="grid grid-cols-5 gap-2 mt-1">
                    {predefinedColors.map((color, index) => (
                      <button
                        key={color}
                        className={`w-full aspect-square rounded-full ${
                          currentColor === color ? "ring-2 ring-white ring-offset-1 ring-offset-gray-900" : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setCurrentColor(color)}
                        title={domainNames[index] || ""}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Desktop controls */}
      <div className="control-panel fixed bottom-4 right-4 z-50 hidden md:block">
        <motion.div
          className="bg-gray-900/80 backdrop-blur-sm text-white rounded-lg shadow-lg overflow-hidden"
          initial={{ width: "auto" }}
          animate={{ width: isExpanded ? "auto" : "auto" }}
        >
          <motion.div className="flex space-x-2 p-2" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </Button>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSpeed(Math.max(0.1, speed - 0.1))}
                title="Decrease Speed"
              >
                <ChevronDown size={16} />
              </Button>
              <span className="text-xs w-10 text-center">{speed.toFixed(1)}x</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSpeed(Math.min(3, speed + 0.1))}
                title="Increase Speed"
              >
                <ChevronUp size={16} />
              </Button>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Domain Colors">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: currentColor }} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 bg-gray-900/90 backdrop-blur-md border-gray-800">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Philosophical Domains</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {predefinedColors.map((color, index) => (
                      <button
                        key={color}
                        className={`w-full aspect-square rounded-full ${
                          currentColor === color ? "ring-2 ring-white" : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setCurrentColor(color)}
                        title={domainNames[index] || ""}
                      />
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(!isExpanded)}>
            <ChevronUp size={16} className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </Button>
        </motion.div>
      </div>
    </>
  )
}
