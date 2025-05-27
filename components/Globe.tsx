"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer"
import { Color } from "three"
import ControlPanel from "./ControlPanel"
import InfoPanel from "./InfoPanel"
import Timeline from "./Timeline"
import { allPhilosophers, getBirthYear, getPhilosophersInTimeRange, domainColors } from "@/app/data/allPhilosophers"
import type { PhilosopherData } from "@/app/types/philosopher"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface SliceData {
  name: string
  color: string
  description: string
}

interface EraData {
  name: string
  period: string
  radius: number
}

export default function Globe() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [isHighResLoaded, setIsHighResLoaded] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [selectedSlice, setSelectedSlice] = useState<number | null>(null)
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null)
  const [selectedPhilosopher, setSelectedPhilosopher] = useState<PhilosopherData | null>(null)
  const [visiblePhilosophers, setVisiblePhilosophers] = useState<PhilosopherData[]>(allPhilosophers)
  const [timeRange, setTimeRange] = useState<[number, number]>([-700, 2023])

  // Control states
  const [isPaused, setIsPaused] = useState(false)
  const [speed, setSpeed] = useState(1.0)
  const [currentColor, setCurrentColor] = useState("#3a86ff")

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
  const starsRef = useRef<THREE.Points | null>(null)
  const atmosphereRef = useRef<THREE.Mesh | null>(null)
  const solidSlicesRef = useRef<THREE.Mesh[]>([])
  const philosopherMeshesRef = useRef<Map<string, THREE.Mesh[]>>(new Map())
  const philosopherGroupsRef = useRef<Map<string, THREE.Group>>(new Map())

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

  // Historical eras (from core to outer)
  const eras: EraData[] = [
    { name: "Ancient", period: "600 BCE - 500 CE", radius: 2.5 },
    { name: "Medieval", period: "500 - 1400 CE", radius: 3.2 },
    { name: "Renaissance", period: "1400 - 1600 CE", radius: 3.9 },
    { name: "Modern", period: "1600 - 1900 CE", radius: 4.6 },
    { name: "Contemporary", period: "1900 CE - Present", radius: 5.3 },
  ]

  // Predefined colors
  const predefinedColors = sliceData.map((slice) => slice.color)

  // Get domain index by name
  const getDomainIndex = (name: string): number => {
    const lowerName = name.toLowerCase()
    return sliceData.findIndex((slice) => slice.name.toLowerCase() === lowerName)
  }

  // Get era index by name
  const getEraIndex = (name: string): number => {
    return eras.findIndex((era) => era.name === name)
  }

  // Handle timeline range change
  const handleTimeRangeChange = (startYear: number, endYear: number) => {
    setTimeRange([startYear, endYear])
    const filteredPhilosophers = getPhilosophersInTimeRange(startYear, endYear)
    setVisiblePhilosophers(filteredPhilosophers)

    // Update visibility of philosopher meshes
    updatePhilosopherVisibility(filteredPhilosophers)
  }

  // Update philosopher visibility based on time range
  const updatePhilosopherVisibility = (visiblePhilosophers: PhilosopherData[]) => {
    const visibleIds = new Set(visiblePhilosophers.map((p) => p.id))

    philosopherGroupsRef.current.forEach((group, id) => {
      const isVisible = visibleIds.has(id)
      group.visible = isVisible

      // Animate the transition
      if (group.userData.targetOpacity !== undefined) {
        group.userData.targetOpacity = isVisible ? 1.0 : 0.0
      }
    })
  }

  useEffect(() => {
    if (!mountRef.current) return

    // Create scene, camera, and renderer
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create CSS2D renderer for labels
    const labelRenderer = new CSS2DRenderer()
    labelRenderer.setSize(window.innerWidth, window.innerHeight)
    labelRenderer.domElement.style.position = "absolute"
    labelRenderer.domElement.style.top = "0px"
    labelRenderer.domElement.style.pointerEvents = "none"
    mountRef.current.appendChild(labelRenderer.domElement)
    labelRendererRef.current = labelRenderer

    // Create a starfield
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
    starsRef.current = stars

    // Create slices with concentric rings
    const sliceAngle = (Math.PI * 2) / 5
    const sliceGap = 0.02

    sliceData.forEach((slice, sliceIndex) => {
      const sliceGroup = new THREE.Group()
      sliceGroup.userData = { index: sliceIndex, name: slice.name }

      // Create concentric rings for each era
      eras.forEach((era, eraIndex) => {
        const innerRadius = eraIndex === 0 ? 0 : eras[eraIndex - 1].radius
        const outerRadius = era.radius

        // Create ring geometry
        const ringGeometry = new THREE.RingGeometry(
          innerRadius,
          outerRadius,
          32,
          1,
          sliceIndex * sliceAngle + sliceGap,
          sliceAngle - sliceGap * 2,
        )

        // Create sphere segment for 3D effect
        const sphereGeometry = new THREE.SphereGeometry(
          (innerRadius + outerRadius) / 2,
          16,
          8,
          sliceIndex * sliceAngle + sliceGap,
          sliceAngle - sliceGap * 2,
          0,
          Math.PI,
        )

        // Material with era-based opacity
        const material = new THREE.MeshPhongMaterial({
          color: new Color(slice.color),
          transparent: true,
          opacity: 0.3 + eraIndex * 0.15,
          side: THREE.DoubleSide,
        })

        const ringMesh = new THREE.Mesh(sphereGeometry, material)
        ringMesh.userData = { era: era.name, sliceIndex, eraIndex, domain: slice.name.toLowerCase() }
        sliceGroup.add(ringMesh)

        // Add wireframe overlay
        const wireframeMaterial = new THREE.MeshBasicMaterial({
          color: new Color(slice.color),
          wireframe: true,
          transparent: true,
          opacity: 0.2,
        })
        const wireframeMesh = new THREE.Mesh(sphereGeometry, wireframeMaterial)
        sliceGroup.add(wireframeMesh)
      })

      // Create label
      const labelDiv = document.createElement("div")
      labelDiv.className = "slice-label"
      labelDiv.textContent = slice.name
      labelDiv.style.cssText = `
        color: white;
        font-family: Arial, sans-serif;
        font-size: 14px;
        font-weight: bold;
        padding: 4px 8px;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 4px;
        white-space: nowrap;
        user-select: none;
        transition: all 0.3s ease;
      `

      const label = new CSS2DObject(labelDiv)
      const labelAngle = sliceIndex * sliceAngle + sliceAngle / 2
      const labelRadius = 6
      label.position.set(Math.sin(labelAngle) * labelRadius, 0, Math.cos(labelAngle) * labelRadius)
      sliceGroup.add(label)

      slicesRef.current.push(sliceGroup)
      scene.add(sliceGroup)
    })

    // Add philosopher nodes
    allPhilosophers.forEach((philosopher) => {
      // Create a group for this philosopher
      const philosopherGroup = new THREE.Group()
      philosopherGroup.userData = {
        philosopherId: philosopher.id,
        birthYear: getBirthYear(philosopher),
        targetOpacity: 1.0, // For animation
      }
      philosopherGroupsRef.current.set(philosopher.id, philosopherGroup)
      scene.add(philosopherGroup)

      const philosopherMeshes: THREE.Mesh[] = []

      // Create nodes for each domain the philosopher has written about
      Object.keys(philosopher.domainSummaries).forEach((domain) => {
        const domainIndex = getDomainIndex(domain)
        if (domainIndex === -1) return

        const eraIndex = getEraIndex(philosopher.era)
        if (eraIndex === -1) return

        // Calculate position within the slice and era
        const sliceAngle = (Math.PI * 2) / 5
        const angle = domainIndex * sliceAngle + sliceAngle / 2

        // Add some variation to position within the era ring
        const innerRadius = eraIndex === 0 ? 0 : eras[eraIndex - 1].radius
        const outerRadius = eras[eraIndex].radius
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5 + (Math.random() - 0.5) * 0.3

        // Add some height variation
        const heightVariation = (Math.random() - 0.5) * 0.5

        // Calculate position
        const x = Math.sin(angle) * radius
        const y = heightVariation
        const z = Math.cos(angle) * radius

        // Create philosopher node
        const geometry = new THREE.SphereGeometry(0.1, 8, 8)
        const material = new THREE.MeshPhongMaterial({
          color: new Color(sliceData[domainIndex].color),
          emissive: new Color(sliceData[domainIndex].color),
          emissiveIntensity: 0.2,
          transparent: true,
          opacity: 0.7,
        })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(x, y, z)
        mesh.userData = {
          philosopherId: philosopher.id,
          philosopherName: philosopher.name,
          domain: domain,
          era: philosopher.era,
          birthYear: getBirthYear(philosopher),
        }

        philosopherGroup.add(mesh)
        philosopherMeshes.push(mesh)
      })

      philosopherMeshesRef.current.set(philosopher.id, philosopherMeshes)
    })

    // Add lights
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

    // Mouse interaction
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

        // Check if we clicked on a philosopher node
        if (object.userData.philosopherId) {
          const philosopherId = object.userData.philosopherId
          const philosopher = allPhilosophers.find((p) => p.id === philosopherId)
          if (philosopher) {
            setSelectedPhilosopher(philosopher)

            // Find the domain index
            const domain = object.userData.domain
            const domainIndex = getDomainIndex(domain)
            if (domainIndex !== -1) {
              setSelectedSlice(domainIndex)
            }
          }
        }
        // Check if we clicked on a slice
        else if (object.userData.sliceIndex !== undefined) {
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

    const hintTimer = setTimeout(() => {
      setShowHint(false)
    }, 3000)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("click", handleClick)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (mountRef.current && rendererRef.current && labelRendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement)
        mountRef.current.removeChild(labelRendererRef.current.domElement)
      }
      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
      clearTimeout(hintTimer)
    }
  }, [])

  // Animation loop
  useEffect(() => {
    if (
      !sceneRef.current ||
      !cameraRef.current ||
      !rendererRef.current ||
      !controlsRef.current ||
      !labelRendererRef.current
    )
      return

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      // Check for hover
      if (cameraRef.current && sceneRef.current) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
        const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true)

        let newHoveredSlice: number | null = null
        if (intersects.length > 0) {
          const object = intersects[0].object
          if (object.userData.sliceIndex !== undefined) {
            newHoveredSlice = object.userData.sliceIndex
          }
        }

        if (newHoveredSlice !== hoveredSlice) {
          setHoveredSlice(newHoveredSlice)
        }
      }

      if (!isPaused) {
        // Rotate slices
        slicesRef.current.forEach((sliceGroup, index) => {
          sliceGroup.rotation.y += 0.001 * speed + index * 0.0001 * speed
        })

        // Rotate philosopher nodes with their respective slices
        philosopherGroupsRef.current.forEach((group) => {
          // Animate opacity for appearing/disappearing
          if (group.userData.targetOpacity !== undefined) {
            group.children.forEach((child) => {
              if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhongMaterial) {
                child.material.opacity = THREE.MathUtils.lerp(
                  child.material.opacity,
                  group.userData.targetOpacity * 0.7, // Base opacity
                  0.1,
                )
              }
            })
          }

          // Only rotate visible philosophers
          if (group.visible) {
            group.children.forEach((child) => {
              if (child instanceof THREE.Mesh) {
                const domain = child.userData.domain
                const domainIndex = getDomainIndex(domain)
                if (domainIndex !== -1) {
                  // Calculate rotation based on the slice's rotation
                  const sliceGroup = slicesRef.current[domainIndex]
                  if (sliceGroup) {
                    // Get the original position
                    const originalPos = new THREE.Vector3(child.position.x, child.position.y, child.position.z)

                    // Calculate distance from center (radius)
                    const radius = Math.sqrt(originalPos.x * originalPos.x + originalPos.z * originalPos.z)

                    // Calculate current angle
                    let angle = Math.atan2(originalPos.x, originalPos.z)

                    // Apply rotation
                    angle += 0.001 * speed + domainIndex * 0.0001 * speed

                    // Update position
                    child.position.x = Math.sin(angle) * radius
                    child.position.z = Math.cos(angle) * radius
                  }
                }
              }
            })
          }
        })
      }

      // Update hover effects
      slicesRef.current.forEach((sliceGroup, index) => {
        const isHovered = index === hoveredSlice
        const isSelected = index === selectedSlice

        sliceGroup.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhongMaterial) {
            const targetOpacity = isHovered || isSelected ? 0.8 : 0.3 + (child.userData.eraIndex || 0) * 0.15
            child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, 0.1)

            if (isSelected) {
              child.material.emissive = new Color(sliceData[index].color)
              child.material.emissiveIntensity = 0.3
            } else {
              child.material.emissiveIntensity = 0
            }
          }
        })

        // Update label styles
        const label = sliceGroup.children.find((child) => child instanceof CSS2DObject)
        if (label && label instanceof CSS2DObject) {
          const labelElement = label.element as HTMLDivElement
          if (isHovered || isSelected) {
            labelElement.style.transform = "scale(1.2)"
            labelElement.style.background = "rgba(0, 0, 0, 0.9)"
          } else {
            labelElement.style.transform = "scale(1)"
            labelElement.style.background = "rgba(0, 0, 0, 0.7)"
          }
        }
      })

      // Update philosopher node effects
      visiblePhilosophers.forEach((philosopher) => {
        const meshes = philosopherMeshesRef.current.get(philosopher.id)
        if (meshes) {
          const isSelected = selectedPhilosopher?.id === philosopher.id

          meshes.forEach((mesh) => {
            if (mesh.material instanceof THREE.MeshPhongMaterial) {
              // Get the domain
              const domain = mesh.userData.domain
              const domainIndex = getDomainIndex(domain)

              // Check if this domain is selected
              const isDomainSelected = domainIndex === selectedSlice

              // Update appearance based on selection state
              if (isSelected && isDomainSelected) {
                mesh.material.emissiveIntensity = 0.8
                mesh.scale.set(1.5, 1.5, 1.5)
              } else if (isSelected || isDomainSelected) {
                mesh.material.emissiveIntensity = 0.5
                mesh.scale.set(1.2, 1.2, 1.2)
              } else {
                mesh.material.emissiveIntensity = 0.2
                mesh.scale.set(1.0, 1.0, 1.0)
              }
            }
          })
        }
      })

      if (controlsRef.current) {
        controlsRef.current.update()
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
        labelRendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPaused, speed, hoveredSlice, selectedSlice, selectedPhilosopher, visiblePhilosophers])

  // Update color when it changes
  useEffect(() => {
    // Update atmosphere color
    if (atmosphereRef.current && atmosphereRef.current.material instanceof THREE.ShaderMaterial) {
      atmosphereRef.current.material.uniforms.glowColor.value = new Color(currentColor)
    }

    // Update solid slices color
    solidSlicesRef.current.forEach((slice) => {
      if (slice.material instanceof THREE.MeshPhongMaterial) {
        slice.material.color = new Color(currentColor)
      }
    })
  }, [currentColor])

  // Format birth year for display
  const formatBirthYear = (year: number | string): string => {
    if (typeof year === "number") {
      return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`
    }
    return year.toString()
  }

  return (
    <>
      <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0">
        {showHint && (
          <div className="absolute bottom-20 right-4 bg-black bg-opacity-30 text-white text-sm px-3 py-1 rounded-full transition-opacity duration-1000 opacity-80 hover:opacity-100 md:bottom-16">
            Click slices or philosophers to explore • Drag to rotate
          </div>
        )}
      </div>

      <ControlPanel
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        speed={speed}
        setSpeed={setSpeed}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        predefinedColors={predefinedColors}
      />

      <Timeline
        onYearRangeChange={handleTimeRangeChange}
        minYear={-700}
        maxYear={2023}
        initialStartYear={-700}
        initialEndYear={2023}
      />

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
                  {selectedPhilosopher.era} Era • {formatBirthYear(selectedPhilosopher.birth)}
                  {selectedPhilosopher.death && ` - ${formatBirthYear(selectedPhilosopher.death)}`}
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

              <p className="text-sm">
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

      {/* Philosopher count indicator */}
      <div className="fixed top-4 right-4 z-40 bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm">
        Showing {visiblePhilosophers.length} philosophers
      </div>
    </>
  )
}
