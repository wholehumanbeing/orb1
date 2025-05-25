"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer"
import { Color } from "three"
import ControlPanel from "./ControlPanel"
import InfoPanel from "./InfoPanel"

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

  // Philosophical domains
  const sliceData: SliceData[] = [
    {
      name: "Logic",
      color: "#3a86ff",
      description: "The study of valid reasoning and argumentation",
    },
    {
      name: "Aesthetics",
      color: "#8338ec",
      description: "The philosophy of beauty, art, and taste",
    },
    {
      name: "Ethics",
      color: "#ff006e",
      description: "The study of moral principles and values",
    },
    {
      name: "Politics",
      color: "#fb5607",
      description: "The philosophy of governance and social organization",
    },
    {
      name: "Metaphysics",
      color: "#ffbe0b",
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
        ringMesh.userData = { era: era.name, sliceIndex, eraIndex }
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
        if (object.userData.sliceIndex !== undefined) {
          setSelectedSlice(object.userData.sliceIndex)
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
  }, [isPaused, speed, hoveredSlice, selectedSlice])

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

  return (
    <>
      <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0">
        {showHint && (
          <div className="absolute bottom-20 right-4 bg-black bg-opacity-30 text-white text-sm px-3 py-1 rounded-full transition-opacity duration-1000 opacity-80 hover:opacity-100 md:bottom-16">
            Click slices to explore • Drag to rotate
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

      {selectedSlice !== null && (
        <InfoPanel slice={sliceData[selectedSlice]} eras={eras} onClose={() => setSelectedSlice(null)} />
      )}
    </>
  )
}
