"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer"
import { Color } from "three"
import ControlPanel from "./ControlPanel"
import InfoPanel from "./InfoPanel"
import { TimelineRange } from "./timeline-range" // New Timeline component
import {
  allPhilosophers,
  getBirthYear,
  domainColors,
  earliestBirthYear,
  latestBirthYear,
} from "@/app/data/allPhilosophers"
import type { PhilosopherData } from "@/app/types/philosopher"
import { Button } from "@/components/ui/button"
import { X, Info } from "lucide-react"

interface SliceData {
  name: string
  color: string
  description: string
}

interface EraData {
  name: string
  period: string
  startYear: number
  endYear: number
}

export default function Globe() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [showHint, setShowHint] = useState(true)
  const [showLegend, setShowLegend] = useState(false)
  const [selectedSlice, setSelectedSlice] = useState<number | null>(null)
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null)
  const [selectedPhilosopher, setSelectedPhilosopher] = useState<PhilosopherData | null>(null)
  const [speed, setSpeed] = useState(1.0)
  const [isPaused, setIsPaused] = useState(false)
  const [currentColor, setCurrentColor] = useState("#3a86ff")

  const [activeTimeRange, setActiveTimeRange] = useState<[number, number]>([earliestBirthYear, latestBirthYear])
  const [visiblePhilosophers, setVisiblePhilosophers] = useState<PhilosopherData[]>(allPhilosophers)

  // Animation references
  const animationRef = useRef<number | null>(null)
  const slicesRef = useRef<THREE.Group[]>([])
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const labelRendererRef = useRef<CSS2DRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const philosopherGroupsRef = useRef<Map<string, THREE.Group>>(new Map())
  const yearLayersRef = useRef<Map<number, THREE.Group[]>>(new Map())

  // Philosophical domains
  const sliceData: SliceData[] = [
    {
      name: "Logic",
      color: domainColors.logic,
      description: "The study of valid reasoning and argumentation",
    },
    {
      name: "Aesthetics",
      color: domainColors.aesthetics,
      description: "The philosophy of beauty, art, and taste",
    },
    {
      name: "Ethics",
      color: domainColors.ethics,
      description: "The study of moral principles and values",
    },
    {
      name: "Politics",
      color: domainColors.politics,
      description: "The philosophy of governance and social organization",
    },
    {
      name: "Metaphysics",
      color: domainColors.metaphysics,
      description: "The study of reality, existence, and being",
    },
  ]

  // Historical eras
  const eras: EraData[] = [
    { name: "Ancient", period: "600 BCE - 500 CE", startYear: -600, endYear: 500 },
    { name: "Medieval", period: "500 - 1400 CE", startYear: 500, endYear: 1400 },
    { name: "Renaissance", period: "1400 - 1600 CE", startYear: 1400, endYear: 1600 },
    { name: "Early Modern", period: "1600 - 1800 CE", startYear: 1600, endYear: 1800 },
    { name: "Modern", period: "1800 - 1900 CE", startYear: 1800, endYear: 1900 },
    { name: "Contemporary", period: "1900 CE - Present", startYear: 1900, endYear: 2023 },
  ]

  // Predefined colors
  const predefinedColors = sliceData.map((slice) => slice.color)

  // Get domain index by name
  const getDomainIndex = (name: string): number => {
    const lowerName = name.toLowerCase()
    return sliceData.findIndex((slice) => slice.name.toLowerCase() === lowerName)
  }

  // Calculate radius based on birth year (earlier = closer to center)
  const getRadiusForYear = (year: number): number => {
    const coreRadius = 1.5
    const maxRadius = 6
    const yearRange = latestBirthYear - earliestBirthYear
    if (yearRange === 0) return coreRadius // Avoid division by zero
    const normalizedYear = (year - earliestBirthYear) / yearRange
    return coreRadius + normalizedYear * (maxRadius - coreRadius)
  }

  // Get era for a given year
  const getEraForYear = (year: number): EraData | undefined => {
    return eras.find((era) => year >= era.startYear && year <= era.endYear)
  }

  // Effect to filter philosophers when activeTimeRange changes
  useEffect(() => {
    const [startYear, endYear] = activeTimeRange
    const filtered = allPhilosophers.filter((p) => {
      const birth = getBirthYear(p)
      // Consider death year if available, otherwise assume active until latest possible year for filtering
      const death = p.death
        ? typeof p.death === "string"
          ? Number.parseInt(p.death.replace("c. ", ""))
          : p.death
        : latestBirthYear
      // Check for overlap: philosopher's lifespan [birth, death] overlaps with [startYear, endYear]
      return birth <= endYear && death >= startYear
    })
    setVisiblePhilosophers(filtered)
  }, [activeTimeRange])

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const labelRenderer = new CSS2DRenderer()
    labelRenderer.setSize(window.innerWidth, window.innerHeight)
    labelRenderer.domElement.style.position = "absolute"
    labelRenderer.domElement.style.top = "0px"
    labelRenderer.domElement.style.pointerEvents = "none"
    mountRef.current.appendChild(labelRenderer.domElement)
    labelRendererRef.current = labelRenderer

    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 10000
    const positions = new Float32Array(starsCount * 3)
    for (let i = 0; i < starsCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      sizeAttenuation: true,
    })
    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    const sliceAngle = (Math.PI * 2) / sliceData.length
    const sliceGap = 0.05

    for (let year = earliestBirthYear; year <= latestBirthYear; year += 25) {
      const currentYearLayers: THREE.Group[] = []
      sliceData.forEach((slice, sliceIndex) => {
        const sliceGroup = new THREE.Group()
        sliceGroup.userData = { index: sliceIndex, name: slice.name, year: year }
        const innerRadius = getRadiusForYear(year)
        const outerRadiusLayer = getRadiusForYear(year + 25)
        const sphereGeometry = new THREE.SphereGeometry(
          (innerRadius + outerRadiusLayer) / 2,
          32,
          16,
          sliceIndex * sliceAngle + sliceGap,
          sliceAngle - sliceGap * 2,
          0,
          Math.PI,
        )
        const material = new THREE.MeshPhongMaterial({
          color: new Color(slice.color),
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
        })
        const mesh = new THREE.Mesh(sphereGeometry, material)
        mesh.userData = { sliceIndex, year, domain: slice.name.toLowerCase(), era: getEraForYear(year)?.name }
        sliceGroup.add(mesh)
        const wireframeMaterial = new THREE.MeshBasicMaterial({
          color: new Color(slice.color),
          wireframe: true,
          transparent: true,
          opacity: 0.1,
        })
        const wireframeMesh = new THREE.Mesh(sphereGeometry, wireframeMaterial)
        sliceGroup.add(wireframeMesh)
        if (year % 100 === 0) {
          const yearMarkerDiv = document.createElement("div")
          yearMarkerDiv.className = "year-marker"
          yearMarkerDiv.textContent = year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`
          yearMarkerDiv.style.cssText = `color: ${slice.color}; font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; padding: 2px 4px; background: rgba(0, 0, 0, 0.7); border-radius: 4px; white-space: nowrap; user-select: none; opacity: 0.7;`
          const yearMarker = new CSS2DObject(yearMarkerDiv)
          const markerAngle = sliceIndex * sliceAngle + sliceAngle / 2
          const markerRadius = outerRadiusLayer + 0.1
          yearMarker.position.set(Math.sin(markerAngle) * markerRadius, 0, Math.cos(markerAngle) * markerRadius)
          sliceGroup.add(yearMarker)
        }
        currentYearLayers.push(sliceGroup)
        scene.add(sliceGroup)
      })
      yearLayersRef.current.set(year, currentYearLayers)
    }

    sliceData.forEach((slice, sliceIndex) => {
      const labelDiv = document.createElement("div")
      labelDiv.className = "domain-label"
      labelDiv.textContent = slice.name
      labelDiv.style.cssText = `color: white; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; padding: 4px 8px; background: rgba(0, 0, 0, 0.7); border: 1px solid ${slice.color}; border-radius: 4px; white-space: nowrap; user-select: none; transition: all 0.3s ease;`
      const label = new CSS2DObject(labelDiv)
      const labelAngle = sliceIndex * sliceAngle + sliceAngle / 2
      const labelRadius = 7
      label.position.set(Math.sin(labelAngle) * labelRadius, 0, Math.cos(labelAngle) * labelRadius)
      const labelGroup = new THREE.Group()
      labelGroup.add(label)
      labelGroup.userData = { type: "domainLabel", index: sliceIndex, name: slice.name }
      slicesRef.current.push(labelGroup)
      scene.add(labelGroup)
    })

    allPhilosophers.forEach((philosopher) => {
      const philosopherGroup = new THREE.Group()
      const birthYear = getBirthYear(philosopher)
      philosopherGroup.userData = {
        philosopherId: philosopher.id,
        philosopherName: philosopher.name,
        birthYear: birthYear,
        targetOpacity: 1.0,
        isVisible: true,
      }
      philosopherGroupsRef.current.set(philosopher.id, philosopherGroup)
      scene.add(philosopherGroup)
      Object.keys(philosopher.domainSummaries).forEach((domain) => {
        const domainIndex = getDomainIndex(domain)
        if (domainIndex === -1) return
        const radius = getRadiusForYear(birthYear)
        const angle = domainIndex * sliceAngle + sliceAngle / 2 + (Math.random() - 0.5) * sliceAngle * 0.5
        const heightVariation = (Math.random() - 0.5) * 0.5
        const x = Math.sin(angle) * radius
        const y = heightVariation
        const z = Math.cos(angle) * radius
        const geometry = new THREE.SphereGeometry(0.08, 12, 12)
        const material = new THREE.MeshPhongMaterial({
          color: new Color(sliceData[domainIndex].color),
          emissive: new Color(sliceData[domainIndex].color),
          emissiveIntensity: 0.3,
          transparent: true,
          opacity: 0.8,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(x, y, z)
        mesh.userData = {
          philosopherId: philosopher.id,
          philosopherName: philosopher.name,
          domain: domain,
          era: philosopher.era,
          birthYear: birthYear,
        }
        const nameDiv = document.createElement("div")
        nameDiv.className = "philosopher-name"
        nameDiv.textContent = philosopher.name
        nameDiv.style.cssText = `color: white; font-family: Arial, sans-serif; font-size: 12px; padding: 3px 6px; background: rgba(0, 0, 0, 0.8); border-radius: 4px; white-space: nowrap; user-select: none; opacity: 0; transition: opacity 0.2s ease;`
        const nameLabel = new CSS2DObject(nameDiv)
        nameLabel.position.set(0, 0.15, 0)
        mesh.add(nameLabel)
        philosopherGroup.add(mesh)
      })
    })

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    const pointLight = new THREE.PointLight(0xffffff, 1)
    pointLight.position.set(10, 10, 10)
    scene.add(pointLight)

    camera.position.set(0, 5, 12)
    camera.lookAt(0, 0, 0)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.minDistance = 8
    controls.maxDistance = 20
    controlsRef.current = controls

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }
    const handleClick = (event: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
      const intersects = raycasterRef.current.intersectObjects(scene.children, true)
      if (intersects.length > 0) {
        const object = intersects[0].object
        if (object.userData.philosopherId) {
          const philosopher = allPhilosophers.find((p) => p.id === object.userData.philosopherId)
          if (philosopher) {
            setSelectedPhilosopher(philosopher)
            const domainIndex = getDomainIndex(object.userData.domain)
            if (domainIndex !== -1) setSelectedSlice(domainIndex)
          }
        } else if (object.userData.sliceIndex !== undefined) {
          setSelectedSlice(object.userData.sliceIndex)
          setSelectedPhilosopher(null)
        }
      }
    }
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("click", handleClick)
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && labelRendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
        labelRendererRef.current.setSize(window.innerWidth, window.innerHeight)
      }
    }
    window.addEventListener("resize", handleResize)
    const hintTimer = setTimeout(() => setShowHint(false), 3000)
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("click", handleClick)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (mountRef.current && rendererRef.current && labelRendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement)
        mountRef.current.removeChild(labelRendererRef.current.domElement)
      }
      if (controlsRef.current) controlsRef.current.dispose()
      clearTimeout(hintTimer)
    }
  }, [])

  useEffect(() => {
    if (
      !sceneRef.current ||
      !cameraRef.current ||
      !rendererRef.current ||
      !controlsRef.current ||
      !labelRendererRef.current
    )
      return

    const visiblePhilosopherIds = new Set(visiblePhilosophers.map((p) => p.id))

    philosopherGroupsRef.current.forEach((group, id) => {
      const isVisible = visiblePhilosopherIds.has(id)
      group.userData.isVisible = isVisible // Store visibility state
      // We'll handle actual THREE.Object3D.visible in the animation loop for smoother transitions
    })

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)
      if (cameraRef.current && sceneRef.current) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
        const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true)
        let newHoveredSlice: number | null = null
        let hoveredPhilosopherNodeId: string | null = null
        if (intersects.length > 0) {
          const object = intersects[0].object
          if (object.userData.sliceIndex !== undefined) newHoveredSlice = object.userData.sliceIndex
          if (object.userData.philosopherId) {
            hoveredPhilosopherNodeId = object.userData.philosopherId
            const nameLabel = object.children.find((child) => child instanceof CSS2DObject)
            if (nameLabel && nameLabel.element) (nameLabel.element as HTMLElement).style.opacity = "1"
          }
        }
        philosopherGroupsRef.current.forEach((group) => {
          group.children.forEach((child) => {
            if (child instanceof THREE.Mesh) {
              const nameLabel = child.children.find((grandchild) => grandchild instanceof CSS2DObject)
              if (nameLabel && nameLabel.element && child.userData.philosopherId !== hoveredPhilosopherNodeId) {
                ;(nameLabel.element as HTMLElement).style.opacity = "0"
              }
            }
          })
        })
        if (newHoveredSlice !== hoveredSlice) setHoveredSlice(newHoveredSlice)
      }

      if (!isPaused) {
        slicesRef.current.forEach((sliceGroup) => {
          if (sliceGroup.userData.type === "domainLabel") sliceGroup.rotation.y += 0.001 * speed
        })
        yearLayersRef.current.forEach((layers) => {
          layers.forEach((layer, index) => (layer.rotation.y += 0.001 * speed + index * 0.00005 * speed))
        })
        philosopherGroupsRef.current.forEach((group) => {
          if (group.userData.isVisible) group.rotation.y += 0.001 * speed
        })
      }

      philosopherGroupsRef.current.forEach((group) => {
        const targetVisibility = group.userData.isVisible
        // Smoothly transition visibility for the entire group
        if (group.visible !== targetVisibility) {
          // For instant change:
          // group.visible = targetVisibility;

          // For smooth opacity change (more complex, involves iterating children materials):
          group.children.forEach((childNode) => {
            if (childNode instanceof THREE.Mesh && childNode.material instanceof THREE.MeshPhongMaterial) {
              const mat = childNode.material as THREE.MeshPhongMaterial
              mat.transparent = true // Ensure transparency is enabled
              const targetOpacity = targetVisibility ? (childNode.userData.originalOpacity ?? 0.8) : 0
              if (!childNode.userData.originalOpacity && targetVisibility) {
                childNode.userData.originalOpacity = mat.opacity
              }
              mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.1)
            }
          })
          if (
            group.children.every(
              (c) =>
                (c instanceof THREE.Mesh && (c.material as THREE.MeshPhongMaterial).opacity < 0.01) ||
                !(c instanceof THREE.Mesh),
            )
          ) {
            if (!targetVisibility) group.visible = false // Hide group once all children are faded
          } else {
            group.visible = true // Ensure group is visible during fade in
          }
        }

        if (group.visible) {
          // Only apply effects if group is generally visible
          const isSelectedPhilosopher = selectedPhilosopher?.id === group.userData.philosopherId
          group.children.forEach((childNode) => {
            if (childNode instanceof THREE.Mesh && childNode.material instanceof THREE.MeshPhongMaterial) {
              const mat = childNode.material as THREE.MeshPhongMaterial
              const domainIndex = getDomainIndex(childNode.userData.domain)
              const isDomainSelected = domainIndex === selectedSlice

              if (isSelectedPhilosopher && isDomainSelected) {
                mat.emissiveIntensity = 0.8
                childNode.scale.setScalar(THREE.MathUtils.lerp(childNode.scale.x, 1.5, 0.1))
              } else if (isSelectedPhilosopher || isDomainSelected) {
                mat.emissiveIntensity = 0.5
                childNode.scale.setScalar(THREE.MathUtils.lerp(childNode.scale.x, 1.2, 0.1))
              } else {
                mat.emissiveIntensity = 0.3
                childNode.scale.setScalar(THREE.MathUtils.lerp(childNode.scale.x, 1.0, 0.1))
              }
            }
          })
        }
      })

      slicesRef.current.forEach((sliceGroup) => {
        if (sliceGroup.userData.type === "domainLabel") {
          const index = sliceGroup.userData.index
          const isSelected = index === selectedSlice
          const label = sliceGroup.children.find((child) => child instanceof CSS2DObject)
          if (label && label.element) {
            const el = label.element as HTMLElement
            el.style.transform = isSelected || index === hoveredSlice ? "scale(1.2)" : "scale(1)"
            el.style.background = isSelected || index === hoveredSlice ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.7)"
            el.style.borderWidth = isSelected || index === hoveredSlice ? "2px" : "1px"
          }
        }
      })
      yearLayersRef.current.forEach((layers) => {
        layers.forEach((layer) => {
          const sliceIndex = layer.userData.index
          const isSelected = sliceIndex === selectedSlice
          layer.children.forEach((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhongMaterial) {
              const mat = child.material as THREE.MeshPhongMaterial
              mat.opacity = THREE.MathUtils.lerp(
                mat.opacity,
                isSelected || sliceIndex === hoveredSlice ? 0.6 : 0.3,
                0.1,
              )
              mat.emissiveIntensity = isSelected ? 0.3 : 0
              if (isSelected) mat.emissive = new Color(sliceData[sliceIndex].color)
            }
          })
        })
      })

      if (controlsRef.current) controlsRef.current.update()
      if (rendererRef.current && sceneRef.current && cameraRef.current && labelRendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
        labelRendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }
    animate()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPaused, speed, hoveredSlice, selectedSlice, selectedPhilosopher, visiblePhilosophers])

  const formatYearDisplay = (year: number | string): string => {
    if (typeof year === "number") {
      return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`
    }
    return year.toString()
  }

  return (
    <>
      <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0">
        {showHint && (
          <div className="absolute bottom-24 right-4 bg-black bg-opacity-30 text-white text-sm px-3 py-1 rounded-full transition-opacity duration-1000 opacity-80 hover:opacity-100 md:bottom-20">
            Click slices or philosophers to explore • Drag to rotate
          </div>
        )}
      </div>

      <button
        onClick={() => setShowLegend(!showLegend)}
        className="fixed top-4 right-4 z-40 bg-gray-900/80 backdrop-blur-sm text-white p-2 rounded-full"
      >
        <Info size={20} />
      </button>

      {showLegend && (
        <div className="fixed top-16 right-4 z-40 bg-gray-900/90 backdrop-blur-md text-white p-4 rounded-lg shadow-lg max-w-xs">
          <h3 className="text-lg font-bold mb-3">Orb Legend</h3>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-1">Domains (Slices)</h4>
              <div className="space-y-1">
                {sliceData.map((slice) => (
                  <div key={slice.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }}></div>
                    <span className="text-xs">{slice.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Layers</h4>
              <p className="text-xs">
                Each layer represents a time period. Earlier philosophers (closer to center) lived earlier in history.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Nodes</h4>
              <p className="text-xs">
                Each glowing node represents a philosopher. Filter by time using the timeline below.
              </p>
            </div>
          </div>
        </div>
      )}

      <ControlPanel
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        speed={speed}
        setSpeed={setSpeed}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        predefinedColors={predefinedColors}
      />

      <TimelineRange
        minYear={earliestBirthYear}
        maxYear={latestBirthYear}
        value={activeTimeRange}
        onValueChange={setActiveTimeRange}
      />

      <div className="fixed top-4 left-4 z-40 bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm">
        Showing {visiblePhilosophers.length} philosophers • {formatYearDisplay(activeTimeRange[0])} to{" "}
        {formatYearDisplay(activeTimeRange[1])}
      </div>

      {selectedSlice !== null && !selectedPhilosopher && (
        <InfoPanel slice={sliceData[selectedSlice]} eras={eras} onClose={() => setSelectedSlice(null)} />
      )}

      {selectedPhilosopher && selectedSlice !== null && (
        <div className="fixed top-4 left-4 z-50 bg-gray-900/95 backdrop-blur-md text-white rounded-lg shadow-2xl max-w-md w-full md:w-96">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: sliceData[selectedSlice].color }} />
                  {selectedPhilosopher.name}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {selectedPhilosopher.era} Era • {formatYearDisplay(selectedPhilosopher.birth)}
                  {selectedPhilosopher.death && ` - ${formatYearDisplay(selectedPhilosopher.death)}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedPhilosopher(null)
                  setSelectedSlice(null)
                }}
                className="h-8 w-8"
              >
                <X size={16} />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{sliceData[selectedSlice].name}</span>
                </div>
              </div>
              <p className="text-sm max-h-40 overflow-y-auto">
                {
                  selectedPhilosopher.domainSummaries[
                    sliceData[selectedSlice].name.toLowerCase() as keyof typeof selectedPhilosopher.domainSummaries
                  ]
                }
              </p>
              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-sm font-medium mb-2">Key Concepts</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPhilosopher.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-800 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {selectedPhilosopher.influences.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-2">Influenced By</h3>
                  <div className="text-xs text-gray-400">
                    {selectedPhilosopher.influences.map((id, index) => {
                      const influencer = allPhilosophers.find((p) => p.id === id)
                      return (
                        <span key={id}>
                          {influencer ? influencer.name : id}
                          {index < selectedPhilosopher.influences.length - 1 ? ", " : ""}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
