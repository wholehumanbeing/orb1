"use client"

import * as THREE from "three"
import { useRef, useMemo, useEffect, useState } from "react"
import { useSpring, animated } from "@react-spring/three"
import { useGesture } from "@use-gesture/react"
import { clamp } from "three/src/math/MathUtils.js"

import { useOrbStore } from "@/store/orbStore"
import { orderedEras, eraMeta, type Era, type SliceName } from "@/libs/constants"
// makeWedgeLayerGeometries is not directly used here if Slice creates meshes per era.
// Instead, we'll iterate eras and create a mesh for each.

const WEDGE_BASE_RADIUS = 2 // Base radius for the innermost era layer
const WEDGE_LAYER_THICKNESS = 0.5 // Radial thickness of each era layer
const WEDGE_HEIGHT = 0.2 // The "height" or thickness of the wedge itself along Y-axis

interface SliceProps {
  sliceName: SliceName
  thetaStart: number
  thetaLength: number
  // The group containing these slices will be rotated to position them around the circle.
  // So, the slice itself can be built along the Z-axis or X-axis.
}

const AnimatedMeshStandardMaterial = animated(THREE.MeshStandardMaterial)

interface EraLayerMeshProps {
  era: Era
  geometry: THREE.CylinderGeometry
  sliceName: SliceName
  isActiveSlice: boolean
  isGloballyActive: boolean // Is any slice active?
}

function EraLayerMesh({ era, geometry, sliceName, isActiveSlice, isGloballyActive }: EraLayerMeshProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!)
  const layerWindow = useOrbStore((state) => state.layerWindow)

  const [opacity, setOpacity] = useState(0.05)

  useEffect(() => {
    const eraData = eraMeta[era]
    const [windowStart, windowEnd] = layerWindow
    const eraIntersectsWindow = eraData.start <= windowEnd && eraData.end >= windowStart

    let targetOpacity = 0.05 // Default for non-intersecting eras

    if (eraIntersectsWindow) {
      targetOpacity = 0.9 // Default for intersecting eras
      if (isGloballyActive && !isActiveSlice) {
        targetOpacity = 0.3 // Dim if another slice is active
      }
    }
    setOpacity(targetOpacity)
  }, [layerWindow, era, isActiveSlice, isGloballyActive])

  return (
    <mesh geometry={geometry}>
      <AnimatedMeshStandardMaterial
        ref={materialRef}
        color={eraMeta[era].color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
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
      return {
        era,
        geometry: new THREE.CylinderGeometry(
          midRadius,
          midRadius,
          WEDGE_HEIGHT,
          32,
          1,
          false,
          0, // Build along Z, parent group will be rotated
          thetaLength,
        ),
      }
    })
    // The parent group of this Slice component will be rotated by thetaStart.
    // So, individual layers are created with thetaStart=0 relative to the Slice group.
  }, [thetaLength])

  const bind = useGesture({
    onWheel: ({ event, delta: [, deltaY], memo }) => {
      event.stopPropagation() // Prevent parent scrolling
      if (!isActive) return

      // Initialize memo with currentEraFocus or the middle era if null
      if (memo === undefined) {
        const initialEraIndex = currentEraFocus
          ? orderedEras.findIndex((e) => e === currentEraFocus)
          : Math.floor(orderedEras.length / 2)
        memo = Math.max(0, initialEraIndex) // Ensure it's a valid index
      }

      const newIndex = clamp(memo + (deltaY > 0 ? 1 : -1), 0, orderedEras.length - 1)

      if (newIndex !== memo) {
        const nextEra = orderedEras[newIndex]
        setCurrentEraFocus(nextEra) // Update focus for next wheel event
        setLayerWindow([eraMeta[nextEra].start, eraMeta[nextEra].end])
      }
      return newIndex // Store new index in memo
    },
  })

  const [isHovered, setIsHovered] = useState(false)
  useEffect(() => {
    if (isHovered) document.body.style.cursor = "pointer"
    return () => {
      document.body.style.cursor = "auto"
    }
  }, [isHovered])

  // The slice group itself is animated along its local Z axis.
  // To achieve this, the group's children (the era layers) should be positioned
  // such that the group's origin is at the center of the orb.
  // Then, the group is rotated by `thetaStart + thetaLength / 2` to orient its local Z outwards.
  // The animation `positionZ` will then move it along this outward direction.

  return (
    <animated.group
      ref={groupRef}
      {...bind()} // Spread gesture handlers here
      onClick={(e) => {
        e.stopPropagation() // Prevent click from reaching background
        setSliceActive(sliceName)
        // When a slice is clicked, set its middle era as the focus for scrolling
        const middleEraIndex = Math.floor(orderedEras.length / 2)
        const middleEra = orderedEras[middleEraIndex]
        setCurrentEraFocus(middleEra)
        setLayerWindow([eraMeta[middleEra].start, eraMeta[middleEra].end])
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setIsHovered(true)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setIsHovered(false)
      }}
      // Position and rotation for the entire slice wedge
      // Rotation aligns the slice's local Z-axis to point outwards radially
      rotation-y={thetaStart + thetaLength / 2}
      // The animation will be on a nested group if we want to animate along this rotated Z.
      // Or, animate groupRef.position directly if calculated.
      // Let's use a nested animated group for the Z push.
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
    </animated.group>
  )
}
