"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { useSpring, animated } from "@react-spring/three"
import { useGesture } from "@use-gesture/react"
import * as THREE from "three"

import { useOrbStore } from "@/store/orbStore"
import { orderedEras, eraMeta, type Era, type SliceName } from "@/libs/constants"

const WEDGE_BASE_RADIUS = 2
const WEDGE_LAYER_THICKNESS = 0.5
const WEDGE_HEIGHT = 0.2

interface SliceProps {
  sliceName: SliceName
  thetaStart: number
  thetaLength: number
}

interface EraLayerMeshProps {
  era: Era
  geometry: THREE.CylinderGeometry
  sliceName: SliceName
  isActiveSlice: boolean
  isGloballyActive: boolean
}

function EraLayerMesh({ era, geometry, sliceName, isActiveSlice, isGloballyActive }: EraLayerMeshProps) {
  const layerWindow = useOrbStore((state) => state.layerWindow)
  const [opacity, setOpacity] = useState(0.05)

  useEffect(() => {
    const eraData = eraMeta[era]
    const [windowStart, windowEnd] = layerWindow
    const eraIntersectsWindow = eraData.start <= windowEnd && eraData.end >= windowStart

    let targetOpacity = 0.05

    if (eraIntersectsWindow) {
      targetOpacity = 0.9
      if (isGloballyActive && !isActiveSlice) {
        targetOpacity = 0.3
      }
    }
    setOpacity(targetOpacity)
  }, [layerWindow, era, isActiveSlice, isGloballyActive])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={eraMeta[era].color} transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  )
}

export function Slice({ sliceName, thetaStart, thetaLength }: SliceProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const { sliceActive, setSliceActive, layerWindow, setLayerWindow, currentEraFocus, setCurrentEraFocus } =
    useOrbStore()

  const isActive = sliceActive === sliceName

  const { positionZ } = useSpring({
    positionZ: isActive ? 0.25 : 0,
    config: { mass: 1, tension: 170, friction: 26 },
  })

  // Create geometries for each era layer within this slice
  const layerGeometries = useMemo(() => {
    return orderedEras.map((era, index) => {
      const midRadius = WEDGE_BASE_RADIUS + index * WEDGE_LAYER_THICKNESS + WEDGE_LAYER_THICKNESS / 2

      const geometry = new THREE.CylinderGeometry(midRadius, midRadius, WEDGE_HEIGHT, 32, 1, false, 0, thetaLength)

      return {
        era,
        geometry,
      }
    })
  }, [thetaLength])

  // Clamp function
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

  const bind = useGesture({
    onWheel: ({ event, delta: [, deltaY], memo }) => {
      event.stopPropagation()
      if (!isActive) return

      if (memo === undefined) {
        const initialEraIndex = currentEraFocus
          ? orderedEras.findIndex((e) => e === currentEraFocus)
          : Math.floor(orderedEras.length / 2)
        memo = Math.max(0, initialEraIndex)
      }

      const newIndex = clamp(memo + (deltaY > 0 ? 1 : -1), 0, orderedEras.length - 1)

      if (newIndex !== memo) {
        const nextEra = orderedEras[newIndex]
        setCurrentEraFocus(nextEra)
        setLayerWindow([eraMeta[nextEra].start, eraMeta[nextEra].end])
      }
      return newIndex
    },
  })

  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered) {
      document.body.style.cursor = "pointer"
    } else {
      document.body.style.cursor = "auto"
    }
  }, [isHovered])

  const handleClick = (e: THREE.Event) => {
    e.stopPropagation()
    setSliceActive(sliceName)
    const middleEraIndex = Math.floor(orderedEras.length / 2)
    const middleEra = orderedEras[middleEraIndex]
    setCurrentEraFocus(middleEra)
    setLayerWindow([eraMeta[middleEra].start, eraMeta[middleEra].end])
  }

  const handlePointerOver = (e: THREE.Event) => {
    e.stopPropagation()
    setIsHovered(true)
  }

  const handlePointerOut = (e: THREE.Event) => {
    e.stopPropagation()
    setIsHovered(false)
  }

  return (
    <group
      ref={groupRef}
      {...bind()}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      rotation-y={thetaStart + thetaLength / 2}
    >
      <animated.group position-z={positionZ}>
        {layerGeometries.map(({ era, geometry }) => (
          <EraLayerMesh
            key={`${sliceName}-${era}`}
            era={era}
            geometry={geometry}
            sliceName={sliceName}
            isActiveSlice={isActive}
            isGloballyActive={sliceActive !== null}
          />
        ))}
      </animated.group>
    </group>
  )
}
