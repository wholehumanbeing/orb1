"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface SpiralColor {
  color: string
  hex: number
  name: string
  description: string
}

interface NodeDetailPanelProps {
  node: {
    id: string
    field: string
    era: number
    year: number
    name: string
    spiral: string
    description: string
    summary: string
  }
  spiralColors: Record<string, SpiralColor>
  eraName: string
  isEndorsed: boolean
  onEndorse: (nodeId: string) => void
  onClose: () => void
}

export default function NodeDetailPanel({
  node,
  spiralColors,
  eraName,
  isEndorsed,
  onEndorse,
  onClose,
}: NodeDetailPanelProps) {
  const spiralColor = spiralColors[node.spiral as keyof typeof spiralColors]

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-900/95 backdrop-blur-md text-white rounded-lg shadow-2xl max-w-md w-full md:w-96">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: spiralColor.color }} />
              {node.name}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{node.description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X size={16} />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{node.field}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{eraName} Era</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">
                {node.year < 0 ? `${Math.abs(node.year)} BCE` : `${node.year} CE`}
              </span>
            </div>
            <div
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: `${spiralColor.color}33`,
                color: spiralColor.color,
              }}
            >
              {spiralColor.name}
            </div>
          </div>

          <p className="text-sm">{node.summary}</p>

          <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
            <span className="text-xs text-gray-500">{spiralColor.description}</span>
            <Button variant={isEndorsed ? "default" : "outline"} size="sm" onClick={() => onEndorse(node.id)}>
              {isEndorsed ? "Endorsed" : "Endorse"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
