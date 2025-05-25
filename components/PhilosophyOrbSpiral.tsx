"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer"
import { Color } from "three"
import ControlPanel from "./ControlPanel"
import DomainPanel from "./DomainPanel"
import NodeDetailPanel from "./NodeDetailPanel"
import { Button } from "@/components/ui/button"
import { Layers, List } from "lucide-react"

// Spiral Dynamics color mapping
const spiralColors = {
  beige: { color: "#D4A574", hex: 0xd4a574, name: "Beige", description: "Survival, instinctive" },
  purple: { color: "#8B4789", hex: 0x8b4789, name: "Purple", description: "Magical, tribal, ancestral" },
  red: { color: "#DC143C", hex: 0xdc143c, name: "Red", description: "Power, dominance, heroic" },
  blue: { color: "#1E3A8A", hex: 0x1e3a8a, name: "Blue", description: "Order, purpose, absolutist" },
  orange: { color: "#FF6B35", hex: 0xff6b35, name: "Orange", description: "Achievement, strategic, materialist" },
  green: { color: "#16A34A", hex: 0x16a34a, name: "Green", description: "Community, egalitarian, relativistic" },
  yellow: { color: "#FCD34D", hex: 0xfcd34d, name: "Yellow", description: "Systemic, integrative, ecological" },
  turquoise: { color: "#06B6D4", hex: 0x06b6d4, name: "Turquoise", description: "Holistic, global, mystical" },
}

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

interface PhilosophyNode {
  id: string
  field: string
  era: number
  year: number
  name: string
  spiral: keyof typeof spiralColors
  description: string
  summary: string
}

export default function PhilosophyOrbSpiral() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [selectedNode, setSelectedNode] = useState<PhilosophyNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<PhilosophyNode | null>(null)
  const [endorsedNodes, setEndorsedNodes] = useState<string[]>([])
  const [selectedSlice, setSelectedSlice] = useState<number | null>(null)
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null)
  const [showHint, setShowHint] = useState(true)
  const [showEraRings, setShowEraRings] = useState(true)
  const [viewMode, setViewMode] = useState<"3d" | "list">("3d")

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
  const nodesRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const slicesRef = useRef<THREE.Group[]>([])
  const domainLabelsRef = useRef<THREE.Group | null>(null)

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

  // Philosophy nodes with Spiral Dynamics mapping
  const philosophyNodes: PhilosophyNode[] = [
    // Logic - Evolution from Blue through Yellow
    {
      id: "aristotle-logic",
      field: "Logic",
      era: 0,
      year: -350,
      name: "Aristotelian Logic",
      spiral: "blue",
      description: "Formal rules of valid reasoning",
      summary: "The foundation of Western logic - absolute rules for determining truth through syllogisms.",
    },
    {
      id: "bacon-method",
      field: "Logic",
      era: 2,
      year: 1620,
      name: "Scientific Method",
      spiral: "orange",
      description: "Empirical investigation",
      summary: "Knowledge through systematic observation and experimentation rather than pure reasoning.",
    },
    {
      id: "fuzzy-logic",
      field: "Logic",
      era: 4,
      year: 1965,
      name: "Fuzzy Logic",
      spiral: "green",
      description: "Many-valued logic",
      summary: "Rejecting binary true/false for degrees of truth - embracing ambiguity and context.",
    },
    {
      id: "systems-thinking",
      field: "Logic",
      era: 4,
      year: 1968,
      name: "Systems Theory",
      spiral: "yellow",
      description: "Holistic reasoning",
      summary: "Understanding through interconnected wholes rather than isolated parts.",
    },

    // Aesthetics - From Purple mysticism to Turquoise integration
    {
      id: "cave-art",
      field: "Aesthetics",
      era: 0,
      year: -30000,
      name: "Shamanic Art",
      spiral: "purple",
      description: "Art as magic and ritual",
      summary: "Early human art serving spiritual and tribal bonding purposes.",
    },
    {
      id: "plato-beauty",
      field: "Aesthetics",
      era: 0,
      year: -380,
      name: "Platonic Beauty",
      spiral: "blue",
      description: "Eternal perfect Forms",
      summary: "Beauty as objective truth - unchanging ideals that material objects imperfectly copy.",
    },
    {
      id: "renaissance-art",
      field: "Aesthetics",
      era: 2,
      year: 1500,
      name: "Renaissance Ideals",
      spiral: "orange",
      description: "Human achievement in art",
      summary: "Celebrating individual genius and technical mastery - art as human triumph.",
    },
    {
      id: "romantic-sublime",
      field: "Aesthetics",
      era: 3,
      year: 1800,
      name: "Romantic Sublime",
      spiral: "red",
      description: "Raw emotional power",
      summary: "Art expressing overwhelming natural forces and passionate individual experience.",
    },
    {
      id: "postmodern-art",
      field: "Aesthetics",
      era: 4,
      year: 1960,
      name: "Postmodern Aesthetics",
      spiral: "green",
      description: "Pluralistic, contextual beauty",
      summary: "Rejecting universal standards - beauty is culturally constructed and politically charged.",
    },
    {
      id: "eco-art",
      field: "Aesthetics",
      era: 4,
      year: 1990,
      name: "Ecological Aesthetics",
      spiral: "turquoise",
      description: "Art as living system",
      summary: "Art that participates in and reveals natural/social ecosystems as unified wholes.",
    },

    // Ethics - Full spiral evolution
    {
      id: "tribal-taboo",
      field: "Ethics",
      era: 0,
      year: -50000,
      name: "Tribal Taboos",
      spiral: "purple",
      description: "Ancestral moral codes",
      summary: "Right and wrong determined by ancestral spirits and tribal custom.",
    },
    {
      id: "might-right",
      field: "Ethics",
      era: 0,
      year: -800,
      name: "Heroic Ethics",
      spiral: "red",
      description: "Power determines morality",
      summary: "The strong take what they can - morality serves the powerful individual.",
    },
    {
      id: "divine-command",
      field: "Ethics",
      era: 0,
      year: -500,
      name: "Divine Command",
      spiral: "blue",
      description: "God-given moral law",
      summary: "Absolute moral rules revealed by divine authority - one true way.",
    },
    {
      id: "social-contract",
      field: "Ethics",
      era: 2,
      year: 1650,
      name: "Social Contract",
      spiral: "orange",
      description: "Rational self-interest",
      summary: "Morality as mutual agreement between rational individuals seeking advantage.",
    },
    {
      id: "utilitarian",
      field: "Ethics",
      era: 3,
      year: 1863,
      name: "Utilitarianism",
      spiral: "orange",
      description: "Greatest good calculation",
      summary: "Maximizing overall happiness through cost-benefit analysis of actions.",
    },
    {
      id: "care-ethics",
      field: "Ethics",
      era: 4,
      year: 1982,
      name: "Ethics of Care",
      spiral: "green",
      description: "Relational, contextual ethics",
      summary: "Morality based on relationships, empathy, and particular contexts rather than abstract rules.",
    },
    {
      id: "integral-ethics",
      field: "Ethics",
      era: 4,
      year: 2000,
      name: "Integral Ethics",
      spiral: "yellow",
      description: "Multi-perspectival morality",
      summary: "Integrating insights from all previous stages into flexible, situational wisdom.",
    },

    // Politics - Governance through the spiral
    {
      id: "tribal-elder",
      field: "Politics",
      era: 0,
      year: -40000,
      name: "Elder Council",
      spiral: "purple",
      description: "Ancestral wisdom governance",
      summary: "Leadership by those closest to ancestral spirits and tribal traditions.",
    },
    {
      id: "warrior-king",
      field: "Politics",
      era: 0,
      year: -3000,
      name: "Warrior Kings",
      spiral: "red",
      description: "Rule by strength",
      summary: "The strongest warrior leads - power through dominance and conquest.",
    },
    {
      id: "divine-monarchy",
      field: "Politics",
      era: 0,
      year: -2000,
      name: "Divine Monarchy",
      spiral: "blue",
      description: "God-appointed rulers",
      summary: "Kings rule by divine right - hierarchical order reflecting cosmic order.",
    },
    {
      id: "republic",
      field: "Politics",
      era: 0,
      year: -509,
      name: "Republican Government",
      spiral: "orange",
      description: "Merit-based representation",
      summary: "Citizens elect the most capable to represent their interests.",
    },
    {
      id: "democracy",
      field: "Politics",
      era: 2,
      year: 1776,
      name: "Liberal Democracy",
      spiral: "orange",
      description: "Individual rights and votes",
      summary: "Government by consent with protection of individual freedoms and property.",
    },
    {
      id: "social-democracy",
      field: "Politics",
      era: 3,
      year: 1890,
      name: "Social Democracy",
      spiral: "green",
      description: "Egalitarian welfare state",
      summary: "Democracy ensuring equal opportunity and social safety nets for all.",
    },
    {
      id: "network-governance",
      field: "Politics",
      era: 4,
      year: 2000,
      name: "Network Governance",
      spiral: "yellow",
      description: "Adaptive, multi-level systems",
      summary: "Flexible governance networks responding to complex, dynamic challenges.",
    },

    // Metaphysics - Reality through the spiral
    {
      id: "animism",
      field: "Metaphysics",
      era: 0,
      year: -60000,
      name: "Animism",
      spiral: "purple",
      description: "Spirit-filled universe",
      summary: "Everything has a spirit - rocks, trees, ancestors all possess consciousness.",
    },
    {
      id: "olympian-gods",
      field: "Metaphysics",
      era: 0,
      year: -1200,
      name: "Heroic Polytheism",
      spiral: "red",
      description: "Gods as super-warriors",
      summary: "Reality ruled by powerful, capricious deities embodying human passions.",
    },
    {
      id: "monotheism",
      field: "Metaphysics",
      era: 0,
      year: -600,
      name: "Monotheism",
      spiral: "blue",
      description: "One true God",
      summary: "Single divine creator establishing absolute truth and moral order.",
    },
    {
      id: "materialism",
      field: "Metaphysics",
      era: 2,
      year: 1600,
      name: "Scientific Materialism",
      spiral: "orange",
      description: "Matter and motion",
      summary: "Reality consists only of physical matter obeying mathematical laws.",
    },
    {
      id: "relativism",
      field: "Metaphysics",
      era: 4,
      year: 1960,
      name: "Postmodern Relativism",
      spiral: "green",
      description: "Multiple constructed realities",
      summary: "Reality is socially constructed - no single objective truth exists.",
    },
    {
      id: "process-philosophy",
      field: "Metaphysics",
      era: 4,
      year: 1929,
      name: "Process Philosophy",
      spiral: "yellow",
      description: "Reality as dynamic becoming",
      summary: "Reality is not things but processes - everything is in constant creative flux.",
    },
    {
      id: "integral-theory",
      field: "Metaphysics",
      era: 4,
      year: 1995,
      name: "Integral Theory",
      spiral: "turquoise",
      description: "All-quadrant, all-level reality",
      summary:
        "Reality includes subjective, objective, individual and collective dimensions at all developmental levels.",
    },
  ]

  // Get field index for positioning
  const getFieldIndex = (field: string): number => {
    return sliceData.findIndex((s) => s.name === field)
  }

  // Create node geometry based on spiral level
  const createNodeGeometry = (spiral: keyof typeof spiralColors): THREE.BufferGeometry => {
    switch (spiral) {
      case "beige":
      case "purple":
        return new THREE.SphereGeometry(0.15, 16, 16)
      case "red":
        return new THREE.ConeGeometry(0.15, 0.3, 4)
      case "blue":
        return new THREE.BoxGeometry(0.25, 0.25, 0.25)
      case "orange":
        return new THREE.ConeGeometry(0.15, 0.3, 6)
      case "green":
        return new THREE.DodecahedronGeometry(0.175)
      case "yellow":
        return new THREE.IcosahedronGeometry(0.175)
      case "turquoise":
        return new THREE.TorusGeometry(0.15, 0.075, 8, 16)
      default:
        return new THREE.SphereGeometry(0.15, 32, 32)
    }
  }

  // Create fixed domain labels that always face the camera
  const createFixedDomainLabels = () => {
    const labelsGroup = new THREE.Group()

    sliceData.forEach((slice, index) => {
      const labelDiv = document.createElement("div")
      labelDiv.className = "domain-label"
      labelDiv.textContent = slice.name
      labelDiv.style.cssText = `
        color: white;
        font-family: Arial, sans-serif;
        font-size: 14px;
        font-weight: bold;
        padding: 4px 8px;
        background: rgba(0, 0, 0, 0.7);
        border: 2px solid ${slice.color};
        border-radius: 4px;
        white-space: nowrap;
        user-select: none;
        transition: all 0.3s ease;
        pointer-events: auto;
        cursor: pointer;
      `

      // Make labels clickable
      labelDiv.addEventListener("click", () => {
        setSelectedSlice(index)
      })

      const label = new CSS2DObject(labelDiv)

      // Position labels in a pentagon around the orb
      const angle = (index * Math.PI * 2) / 5
      const radius = 7
      const x = Math.sin(angle) * radius
      const z = Math.cos(angle) * radius
      label.position.set(x, 0, z)

      labelsGroup.add(label)
    })

    return labelsGroup
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
    labelRenderer.domElement.style.pointerEvents = "auto"
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

    // Create slices with increased gap to prevent overlap
    const sliceAngle = (Math.PI * 2) / 5
    const sliceGap = 0.1 // Increased gap between slices

    sliceData.forEach((slice, sliceIndex) => {
      const sliceGroup = new THREE.Group()
      sliceGroup.userData = { index: sliceIndex, name: slice.name }

      // Create concentric rings for each era
      eras.forEach((era, eraIndex) => {
        const innerRadius = eraIndex === 0 ? 0 : eras[eraIndex - 1].radius
        const outerRadius = era.radius

        // Create sphere segment for 3D effect with increased gap
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
          opacity: 0.1 + eraIndex * 0.05,
          side: THREE.DoubleSide,
        })

        const ringMesh = new THREE.Mesh(sphereGeometry, material)
        ringMesh.userData = { era: era.name, sliceIndex, eraIndex }
        ringMesh.visible = showEraRings
        sliceGroup.add(ringMesh)

        // Add wireframe overlay with increased opacity for better visibility
        const wireframeMaterial = new THREE.MeshBasicMaterial({
          color: new Color(slice.color),
          wireframe: true,
          transparent: true,
          opacity: 0.2, // Increased from 0.1
        })
        const wireframeMesh = new THREE.Mesh(sphereGeometry, wireframeMaterial)
        wireframeMesh.visible = showEraRings
        sliceGroup.add(wireframeMesh)
      })

      slicesRef.current.push(sliceGroup)
      scene.add(sliceGroup)
    })

    // Create fixed domain labels
    const domainLabels = createFixedDomainLabels()
    scene.add(domainLabels)
    domainLabelsRef.current = domainLabels

    // Add philosophy nodes
    philosophyNodes.forEach((node) => {
      const fieldIndex = getFieldIndex(node.field)
      if (fieldIndex === -1) return

      const sliceAngle = (Math.PI * 2) / 5
      const angle = fieldIndex * sliceAngle + sliceAngle / 2
      const radius = eras[node.era]?.radius || 3

      // Add some variation in position
      const angleVariation = (Math.random() - 0.5) * 0.2
      const radiusVariation = (Math.random() - 0.5) * 0.3
      const heightVariation = (Math.random() - 0.5) * 0.5

      const x = Math.sin(angle + angleVariation) * (radius + radiusVariation)
      const y = heightVariation
      const z = Math.cos(angle + angleVariation) * (radius + radiusVariation)

      const geometry = createNodeGeometry(node.spiral)
      const spiralColor = spiralColors[node.spiral]
      const material = new THREE.MeshPhongMaterial({
        color: spiralColor.hex,
        emissive: spiralColor.hex,
        emissiveIntensity: 0.3,
        metalness: 0.3,
        roughness: 0.4,
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(x, y, z)
      mesh.userData = { node }

      nodesRef.current.set(node.id, mesh)
      scene.add(mesh)

      // Add label for the node
      const nodeLabelDiv = document.createElement("div")
      nodeLabelDiv.textContent = node.name
      nodeLabelDiv.style.cssText = `
        color: white;
        font-family: Arial, sans-serif;
        font-size: 10px;
        padding: 2px 4px;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 2px;
        white-space: nowrap;
        user-select: none;
        display: none;
        pointer-events: none;
      `
      const nodeLabel = new CSS2DObject(nodeLabelDiv)
      nodeLabel.position.set(0, 0.3, 0)
      mesh.add(nodeLabel)
      mesh.userData.label = nodeLabelDiv
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
        if (object.userData.node) {
          setSelectedNode(object.userData.node)
        } else if (object.userData.sliceIndex !== undefined) {
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
  }, [showEraRings])

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

        let newHoveredNode: PhilosophyNode | null = null
        let newHoveredSlice: number | null = null

        if (intersects.length > 0) {
          const object = intersects[0].object
          if (object.userData.node) {
            newHoveredNode = object.userData.node
          } else if (object.userData.sliceIndex !== undefined) {
            newHoveredSlice = object.userData.sliceIndex
          }
        }

        if (newHoveredNode?.id !== hoveredNode?.id) {
          setHoveredNode(newHoveredNode)
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

        // Animate nodes based on their spiral level
        nodesRef.current.forEach((mesh, id) => {
          const node = philosophyNodes.find((n) => n.id === id)
          if (!node) return

          const time = Date.now() * 0.001
          const baseScale = 1

          switch (node.spiral) {
            case "beige":
              mesh.rotation.y = Math.sin(time * 0.5) * 0.1
              break
            case "purple":
              mesh.rotation.y = time * 0.2
              mesh.position.y += Math.sin(time * 2) * 0.001
              break
            case "red":
              mesh.scale.setScalar(baseScale + Math.sin(time * 3) * 0.05)
              break
            case "blue":
              mesh.rotation.y = time * 0.1
              break
            case "orange":
              mesh.rotation.x = Math.sin(time * 2) * 0.2
              mesh.rotation.y = Math.cos(time * 2) * 0.2
              break
            case "green":
              mesh.rotation.y = Math.sin(time) * 0.3
              mesh.scale.setScalar(baseScale + Math.sin(time * 1.5) * 0.025)
              break
            case "yellow":
              mesh.rotation.x = time * 0.3
              mesh.rotation.y = time * 0.2
              mesh.rotation.z = time * 0.1
              break
            case "turquoise":
              const s = Math.sin(time) * 0.05
              mesh.scale.set(baseScale + s, baseScale - s * 0.5, baseScale + s * 0.5)
              mesh.rotation.y = time * 0.4
              break
          }

          // Handle hover and selection effects
          const isHovered = hoveredNode?.id === id
          const isSelected = selectedNode?.id === id
          const isEndorsed = endorsedNodes.includes(id)

          if (mesh.userData.label) {
            mesh.userData.label.style.display = isHovered || isSelected ? "block" : "none"
          }

          if (mesh.material instanceof THREE.MeshPhongMaterial) {
            const targetIntensity = isHovered ? 0.8 : isSelected ? 0.6 : isEndorsed ? 0.5 : 0.3
            mesh.material.emissiveIntensity = THREE.MathUtils.lerp(
              mesh.material.emissiveIntensity,
              targetIntensity,
              0.1,
            )
          }
        })

        // Update hover effects for slices
        slicesRef.current.forEach((sliceGroup, index) => {
          const isHovered = index === hoveredSlice
          const isSelected = index === selectedSlice

          sliceGroup.children.forEach((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhongMaterial) {
              const targetOpacity =
                isHovered || isSelected
                  ? 0.2 + (child.userData.eraIndex || 0) * 0.1
                  : 0.1 + (child.userData.eraIndex || 0) * 0.05

              child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, 0.1)
            }
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
              const targetOpacity = isHovered || isSelected ? 0.2 : 0.1
              child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, 0.1)
            }
          })
        })

        // Update domain labels to always face the camera
        if (domainLabelsRef.current) {
          domainLabelsRef.current.children.forEach((child) => {
            if (child instanceof CSS2DObject) {
              // Make labels always face the camera
              child.element.style.opacity = "1"
            }
          })
        }
      }

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
  }, [isPaused, speed, hoveredNode, selectedNode, hoveredSlice, selectedSlice, endorsedNodes, showEraRings])

  // Handle node endorsement
  const handleEndorseNode = (nodeId: string) => {
    setEndorsedNodes((prev) => {
      if (prev.includes(nodeId)) {
        return prev.filter((id) => id !== nodeId)
      } else {
        return [...prev, nodeId]
      }
    })
  }

  // Toggle era rings visibility
  const toggleEraRings = () => {
    setShowEraRings(!showEraRings)
  }

  // Toggle view mode between 3D and list
  const toggleViewMode = () => {
    setViewMode(viewMode === "3d" ? "list" : "3d")
  }

  // Predefined colors for the control panel
  const predefinedColors = sliceData.map((slice) => slice.color)

  // Filter nodes by domain for list view
  const getNodesByDomain = (domain: string) => {
    return philosophyNodes.filter((node) => node.field === domain)
  }

  return (
    <>
      {viewMode === "3d" ? (
        <>
          <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0">
            {showHint && (
              <div className="absolute bottom-20 right-4 bg-black bg-opacity-30 text-white text-sm px-3 py-1 rounded-full transition-opacity duration-1000 opacity-80 hover:opacity-100 md:bottom-16">
                Click nodes or domains to explore • Drag to rotate
              </div>
            )}
          </div>

          {/* Fixed domain navigation */}
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900/80 backdrop-blur-sm rounded-full px-2 py-1 hidden md:flex space-x-1">
            {sliceData.map((slice, index) => (
              <button
                key={slice.name}
                className={`px-3 py-1 text-sm rounded-full transition-all ${
                  selectedSlice === index ? "bg-white text-gray-900 font-medium" : "text-white hover:bg-white/10"
                }`}
                onClick={() => setSelectedSlice(index)}
                style={{ borderBottom: `2px solid ${slice.color}` }}
              >
                {slice.name}
              </button>
            ))}
          </div>

          {/* View toggle and era rings toggle */}
          <div className="fixed top-4 right-4 z-50 flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-gray-900/80 backdrop-blur-sm border-gray-700"
              onClick={toggleViewMode}
              title="Toggle View Mode"
            >
              <List size={16} />
            </Button>
            <Button
              variant={showEraRings ? "default" : "outline"}
              size="sm"
              className="h-8 bg-gray-900/80 backdrop-blur-sm border-gray-700"
              onClick={toggleEraRings}
            >
              {showEraRings ? "Hide Eras" : "Show Eras"}
            </Button>
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
            <DomainPanel
              slice={sliceData[selectedSlice]}
              eras={eras}
              nodes={getNodesByDomain(sliceData[selectedSlice].name)}
              onNodeSelect={setSelectedNode}
              onClose={() => setSelectedSlice(null)}
            />
          )}

          {selectedNode && (
            <NodeDetailPanel
              node={selectedNode}
              spiralColors={spiralColors}
              eraName={eras[selectedNode.era].name}
              isEndorsed={endorsedNodes.includes(selectedNode.id)}
              onEndorse={handleEndorseNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </>
      ) : (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold">Philosophical Domains</h1>
              <Button variant="outline" size="sm" onClick={toggleViewMode}>
                <span className="mr-2">3D View</span>
                <Layers size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {sliceData.map((domain) => (
                <div
                  key={domain.name}
                  className="bg-gray-900/80 backdrop-blur-sm rounded-lg overflow-hidden"
                  style={{ borderTop: `3px solid ${domain.color}` }}
                >
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">{domain.name}</h2>
                    <p className="text-sm text-gray-400 mb-4">{domain.description}</p>

                    <div className="space-y-3">
                      {getNodesByDomain(domain.name).map((node) => (
                        <div
                          key={node.id}
                          className="bg-gray-800/60 rounded p-3 cursor-pointer hover:bg-gray-800"
                          onClick={() => setSelectedNode(node)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium">{node.name}</h3>
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: spiralColors[node.spiral].color }}
                              title={spiralColors[node.spiral].name}
                            ></span>
                          </div>
                          <p className="text-xs text-gray-400">{node.description}</p>
                          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                            <span>{eras[node.era].name}</span>
                            <span>{node.year < 0 ? `${Math.abs(node.year)} BCE` : `${node.year} CE`}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedNode && (
            <NodeDetailPanel
              node={selectedNode}
              spiralColors={spiralColors}
              eraName={eras[selectedNode.era].name}
              isEndorsed={endorsedNodes.includes(selectedNode.id)}
              onEndorse={handleEndorseNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </div>
      )}
    </>
  )
}
