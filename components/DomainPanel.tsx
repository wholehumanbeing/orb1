"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DomainPanelProps {
  slice: {
    name: string
    color: string
    description: string
  }
  eras: Array<{
    name: string
    period: string
    radius: number
  }>
  nodes: Array<{
    id: string
    field: string
    era: number
    year: number
    name: string
    spiral: string
    description: string
    summary: string
  }>
  onNodeSelect: (node: any) => void
  onClose: () => void
}

export default function DomainPanel({ slice, eras, nodes, onNodeSelect, onClose }: DomainPanelProps) {
  const philosophicalContent = {
    Logic: {
      Ancient: "Aristotle's syllogistic logic, Stoic propositional logic",
      Medieval: "Scholastic logic, universals debate",
      Renaissance: "Humanist dialectic, method of loci",
      Modern: "Symbolic logic, Leibniz's calculus ratiocinator",
      Contemporary: "Mathematical logic, computational logic, AI reasoning",
    },
    Aesthetics: {
      Ancient: "Plato's theory of beauty, Aristotle's poetics",
      Medieval: "Divine beauty, Gothic aesthetics",
      Renaissance: "Perspective, proportion, humanism in art",
      Modern: "Kant's critique of judgment, Romantic sublime",
      Contemporary: "Postmodern art, digital aesthetics, NFTs",
    },
    Ethics: {
      Ancient: "Virtue ethics, Stoicism, Epicureanism",
      Medieval: "Divine command theory, natural law",
      Renaissance: "Civic humanism, Machiavellian ethics",
      Modern: "Deontology, utilitarianism, social contract",
      Contemporary: "Applied ethics, environmental ethics, AI ethics",
    },
    Politics: {
      Ancient: "Plato's Republic, Aristotle's Politics",
      Medieval: "Divine right, feudalism, just war theory",
      Renaissance: "Republicanism, sovereignty, reason of state",
      Modern: "Liberalism, democracy, rights theory",
      Contemporary: "Global justice, digital democracy, posthuman politics",
    },
    Metaphysics: {
      Ancient: "Forms, substance, causation, being",
      Medieval: "Essence/existence, universals, God's nature",
      Renaissance: "Infinity, heliocentrism, natural magic",
      Modern: "Mind-body dualism, monads, idealism",
      Contemporary: "Quantum ontology, simulation hypothesis, emergence",
    },
  }

  const content = philosophicalContent[slice.name as keyof typeof philosophicalContent] || {}

  return (
    <motion.div
      className="fixed top-4 left-4 z-50 bg-gray-900/95 backdrop-blur-md text-white rounded-lg shadow-2xl max-w-md w-full md:w-96"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: slice.color }} />
              {slice.name}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{slice.description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X size={16} />
          </Button>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="overview" className="flex-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="concepts" className="flex-1">
              Concepts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Historical Development</h3>
              <div className="space-y-3">
                {eras.map((era) => (
                  <div
                    key={era.name}
                    className="border-l-2 border-gray-700 pl-4 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">{era.name}</h4>
                      <span className="text-xs text-gray-500">{era.period}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {content[era.name as keyof typeof content] || "Development in progress..."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="concepts">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="bg-gray-800/60 rounded p-3 cursor-pointer hover:bg-gray-800"
                  onClick={() => onNodeSelect(node)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">{node.name}</h3>
                    <span className="text-xs text-gray-500">
                      {node.year < 0 ? `${Math.abs(node.year)} BCE` : `${node.year} CE`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{node.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Navigate through time from the core outward. Each ring represents a major era in philosophical thought.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
