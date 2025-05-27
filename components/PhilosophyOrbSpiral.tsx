"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer"
import { Color } from "three"
import ControlPanel from "./ControlPanel"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { allPhilosophers, domainColors } from "@/app/data/allPhilosophers"
import type { PhilosopherData } from "@/app/types/philosopher"

// Philosophical domains
const domains = ["ethics", "aesthetics", "logic", "politics", "metaphysics"]

export default function PhilosophyOrbSpiral() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [selectedPhilosopher, setSelectedPhilosopher] = useState<PhilosopherData | null>(null)
  const [hoveredPhilosopher, setHoveredPhilosopher] = useState<PhilosopherData | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(true)

  // Control states
  const [isPaused, setIsPaused] = useState(false)
  const [speed, setSpeed] = useState(1.0)
  const [currentColor, setCurrentColor] = useState("#3a86ff")

  // Animation references
  const animationRef = useRef<number | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const labelRendererRef = useRef<CSS2DRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const philosopherLayersRef = useRef<Map<string, THREE.Group>>(new Map())
  const domainSlicesRef = useRef<Map<string, THREE.Group>>(new Map())
  const originalPositionsRef = useRef<Map<string, THREE.Vector3>>(new Map())

  // Calculate the number of philosophers to determine layer thickness
  const totalPhilosophers = allPhilosophers.length
  const coreRadius = 2
  const outerRadius = 6
  const layerThickness = (outerRadius - coreRadius) / totalPhilosophers

  // Add a check for empty data
  const hasPhilosophers = totalPhilosophers > 0

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

    // Create domain slices
    const sliceAngle = (Math.PI * 2) / domains.length
    const sliceGap = 0.02

    // Create domain slices
    domains.forEach((domain, domainIndex) => {
      const sliceGroup = new THREE.Group()
      sliceGroup.userData = { domain }
      domainSlicesRef.current.set(domain, sliceGroup)

      // Create philosopher layers
      if (hasPhilosophers) {
        allPhilosophers.forEach((philosopher, philosopherIndex) => {
          // Calculate inner and outer radius for this philosopher's layer
          const innerRadius = coreRadius + philosopherIndex * layerThickness
          const outerRadius = innerRadius + layerThickness

          // Create sphere segment for this domain slice and philosopher layer
          const sphereGeometry = new THREE.SphereGeometry(
            (innerRadius + outerRadius) / 2,
            16,
            8,
            domainIndex * sliceAngle + sliceGap,
            sliceAngle - sliceGap * 2,
            0,
            Math.PI,
          )

          // Material with philosopher-based color
          const material = new THREE.MeshPhongMaterial({
            color: new Color(domainColors[domain as keyof typeof domainColors]),
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
          })

          const sliceMesh = new THREE.Mesh(sphereGeometry, material)
          sliceMesh.userData = {
            domain,
            philosopherId: philosopher.id,
            philosopherName: philosopher.name,
            philosopherEra: philosopher.era,
            layer: philosopherIndex,
          }

          // Store the original position for animation
          originalPositionsRef.current.set(`${domain}-${philosopher.id}`, sliceMesh.position.clone())

          sliceGroup.add(sliceMesh)

          // Add wireframe overlay
          const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: new Color(domainColors[domain as keyof typeof domainColors]),
            wireframe: true,
            transparent: true,
            opacity: 0.1,
          })
          const wireframeMesh = new THREE.Mesh(sphereGeometry, wireframeMaterial)
          sliceGroup.add(wireframeMesh)
        })
      } else {
        // If no philosophers, create a placeholder sphere
        const sphereGeometry = new THREE.SphereGeometry(
          3,
          16,
          8,
          domainIndex * sliceAngle + sliceGap,
          sliceAngle - sliceGap * 2,
          0,
          Math.PI,
        )

        const material = new THREE.MeshPhongMaterial({
          color: new Color(domainColors[domain as keyof typeof domainColors]),
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
        })

        const sliceMesh = new THREE.Mesh(sphereGeometry, material)
        sliceMesh.userData = { domain }
        sliceGroup.add(sliceMesh)

        // Add wireframe overlay
        const wireframeMaterial = new THREE.MeshBasicMaterial({
          color: new Color(domainColors[domain as keyof typeof domainColors]),
          wireframe: true,
          transparent: true,
          opacity: 0.1,
        })
        const wireframeMesh = new THREE.Mesh(sphereGeometry, wireframeMaterial)
        sliceGroup.add(wireframeMesh)
      }

      // Create domain label
      const labelDiv = document.createElement("div")
      labelDiv.className = "domain-label"
      labelDiv.textContent = domain.charAt(0).toUpperCase() + domain.slice(1)
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
      const labelAngle = domainIndex * sliceAngle + sliceAngle / 2
      const labelRadius = 6.5
      label.position.set(Math.sin(labelAngle) * labelRadius, 0, Math.cos(labelAngle) * labelRadius)
      sliceGroup.add(label)

      scene.add(sliceGroup)
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
        if (object.userData.domain && object.userData.philosopherId) {
          const domain = object.userData.domain
          const philosopherId = object.userData.philosopherId

          // Find the philosopher data
          const philosopher = allPhilosophers.find((p) => p.id === philosopherId)
          if (philosopher) {
            setSelectedPhilosopher(philosopher)
            setSelectedDomain(domain)

            // Animate the slice outward
            animateSlice(domain, philosopherId, true)
          }
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

  // Function to animate a slice outward or back
  const animateSlice = (domain: string, philosopherId: string, outward: boolean) => {
    const sliceGroup = domainSlicesRef.current.get(domain)
    if (!sliceGroup) return

    // Find all meshes for this philosopher in this domain
    sliceGroup.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.userData.philosopherId === philosopherId) {
        const key = `${domain}-${philosopherId}`
        const originalPosition = originalPositionsRef.current.get(key)

        if (originalPosition) {
          // Calculate the direction vector from center to the mesh
          const direction = new THREE.Vector3()
          direction.subVectors(child.position, new THREE.Vector3(0, 0, 0)).normalize()

          // Set the target position
          const targetPosition = new THREE.Vector3()
          if (outward) {
            // Move outward by 0.2 units
            targetPosition.copy(originalPosition).add(direction.multiplyScalar(0.2))
            child.position.copy(targetPosition)
          } else {
            // Move back to original position
            child.position.copy(originalPosition)
          }
        }
      }
    })
  }

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

        let newHoveredPhilosopher: PhilosopherData | null = null
        let newHoveredDomain: string | null = null

        if (intersects.length > 0) {
          const object = intersects[0].object
          if (object.userData.domain && object.userData.philosopherId) {
            const domain = object.userData.domain
            const philosopherId = object.userData.philosopherId

            // Find the philosopher data
            const philosopher = allPhilosophers.find((p) => p.id === philosopherId)
            if (philosopher) {
              newHoveredPhilosopher = philosopher
              newHoveredDomain = domain
            }
          }
        }

        if (newHoveredPhilosopher?.id !== hoveredPhilosopher?.id) {
          setHoveredPhilosopher(newHoveredPhilosopher)
        }

        if (newHoveredDomain !== hoveredDomain) {
          setHoveredDomain(newHoveredDomain)
        }
      }

      if (!isPaused) {
        // Rotate domain slices
        domainSlicesRef.current.forEach((sliceGroup, domain) => {
          sliceGroup.rotation.y += 0.001 * speed + domains.indexOf(domain) * 0.0001 * speed
        })
      }

      // Update hover effects for domains
      domainSlicesRef.current.forEach((sliceGroup, domain) => {
        const isHovered = domain === hoveredDomain
        const isSelected = domain === selectedDomain

        sliceGroup.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhongMaterial) {
            // Get the philosopher ID from the mesh
            const philosopherId = child.userData.philosopherId

            // Check if this philosopher is hovered or selected
            const isPhilosopherHovered = hoveredPhilosopher?.id === philosopherId
            const isPhilosopherSelected = selectedPhilosopher?.id === philosopherId

            // Set opacity based on hover/selection state
            const targetOpacity =
              (isHovered || isSelected) && (isPhilosopherHovered || isPhilosopherSelected)
                ? 0.8 // Domain and philosopher both highlighted
                : isHovered || isSelected || isPhilosopherHovered || isPhilosopherSelected
                  ? 0.5 // Either domain or philosopher highlighted
                  : 0.3 // Neither highlighted

            child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, 0.1)

            // Add emissive glow for selected items
            if ((isSelected && isPhilosopherSelected) || (isHovered && isPhilosopherHovered)) {
              child.material.emissive = new Color(domainColors[domain as keyof typeof domainColors])
              child.material.emissiveIntensity = 0.3
            } else {
              child.material.emissiveIntensity = 0
            }
          }

          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
            // Update wireframe opacity
            const targetOpacity = isHovered || isSelected ? 0.2 : 0.1
            child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, 0.1)
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

      // Always update controls for interactivity
      if (controlsRef.current) {
        controlsRef.current.update()
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
        labelRendererRef.current?.render(sceneRef.current, cameraRef.current)
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPaused, speed, hoveredPhilosopher, selectedPhilosopher, hoveredDomain, selectedDomain])

  // Reset selection and animate slice back when closing the detail panel
  const handleClosePanel = () => {
    if (selectedPhilosopher && selectedDomain) {
      animateSlice(selectedDomain, selectedPhilosopher.id, false)
    }
    setSelectedPhilosopher(null)
    setSelectedDomain(null)
  }

  // Predefined colors for the control panel
  const predefinedColors = Object.values(domainColors)

  return (
    <>
      {!hasPhilosophers && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">No Philosopher Data</h2>
            <p className="mb-4">
              The visualization requires philosopher data to display properly. Currently using sample data with{" "}
              {totalPhilosophers} philosophers.
            </p>
          </div>
        </div>
      )}
      <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0">
        {showHint && (
          <div className="absolute bottom-20 right-4 bg-black bg-opacity-30 text-white text-sm px-3 py-1 rounded-full transition-opacity duration-1000 opacity-80 hover:opacity-100 md:bottom-16">
            Click on a section to explore philosophers • Drag to rotate
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

      {selectedPhilosopher && selectedDomain && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900/95 backdrop-blur-md text-white rounded-lg shadow-2xl max-w-md w-full md:w-96">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: domainColors[selectedDomain as keyof typeof domainColors] }}
                  />
                  {selectedPhilosopher.name}
                </h2>
                <p className="text-gray-400 text-sm mt-1">{selectedPhilosopher.era} Era</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClosePanel} className="h-8 w-8">
                <X size={16} />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">{selectedDomain}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">
                    {typeof selectedPhilosopher.birth === "number" && selectedPhilosopher.birth < 0
                      ? `${Math.abs(selectedPhilosopher.birth)} BCE`
                      : `${selectedPhilosopher.birth} CE`}
                    {selectedPhilosopher.death && " - "}
                    {typeof selectedPhilosopher.death === "number" && selectedPhilosopher.death < 0
                      ? `${Math.abs(selectedPhilosopher.death)} BCE`
                      : selectedPhilosopher.death
                        ? `${selectedPhilosopher.death} CE`
                        : ""}
                  </span>
                </div>
              </div>

              <p className="text-sm whitespace-pre-line">
                {
                  selectedPhilosopher.domainSummaries[
                    selectedDomain as keyof typeof selectedPhilosopher.domainSummaries
                  ]
                }
              </p>

              <div className="pt-4 border-t border-gray-800">
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedPhilosopher.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-800 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
