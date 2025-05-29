import * as THREE from "three"
import { orderedEras, type Era } from "./constants"

const CYLINDER_RADIAL_SEGMENTS = 32
const CYLINDER_HEIGHT_SEGMENTS = 1
const CYLINDER_OPEN_ENDED = false

/**
 * Creates an array of Cylinder BufferGeometries, one for each era,
 * forming a stack of wedge layers.
 */
export function makeWedgeLayerGeometries(
  baseRadius: number,
  layerThickness: number,
  wedgeHeight: number,
  thetaStart: number,
  thetaLength: number,
): { era: Era; geometry: THREE.CylinderGeometry }[] {
  const layerGeometries: { era: Era; geometry: THREE.CylinderGeometry }[] = []

  orderedEras.forEach((era, index) => {
    const radiusForEraLayer = baseRadius + index * layerThickness
    const nextRadius = baseRadius + (index + 1) * layerThickness
    const midRadius = (radiusForEraLayer + nextRadius) / 2

    // Create a cylinder segment geometry
    const geometry = new THREE.CylinderGeometry(
      midRadius, // radiusTop
      midRadius, // radiusBottom
      wedgeHeight, // height of the wedge (along Y)
      CYLINDER_RADIAL_SEGMENTS,
      CYLINDER_HEIGHT_SEGMENTS,
      CYLINDER_OPEN_ENDED,
      thetaStart,
      thetaLength,
    )

    layerGeometries.push({
      era,
      geometry,
    })
  })

  return layerGeometries
}
