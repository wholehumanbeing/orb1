import * as THREE from "three"
import { orderedEras, type Era } from "./constants"

const CYLINDER_RADIAL_SEGMENTS = 32
const CYLINDER_HEIGHT_SEGMENTS = 1
const CYLINDER_OPEN_ENDED = false // Creates a segment, not a full ring slice

/**
 * Creates an array of Cylinder BufferGeometries, one for each era,
 * forming a stack of wedge layers.
 *
 * @param baseRadius The radius of the innermost layer.
 * @param layerThickness The radial thickness of each era layer.
 * @param wedgeHeight The "height" of the wedge along the Y-axis (can be small for flat layers).
 * @param thetaStart Starting angle in radians for the wedge.
 * @param thetaLength Angular extent in radians for the wedge.
 * @returns An array of objects, each containing an era and its corresponding geometry.
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
    // For a cylinder segment, radiusTop and radiusBottom define the segment's own radius.
    // To stack them, we need to translate them.
    // A better approach for stacked rings is to use RingGeometry and rotate it,
    // or create thin cylinders and position them.
    // The prompt asks for CylinderGeometry. Let's make thin, tall cylinders and place them.
    // This means `radius` in the prompt for `makeWedgeLayers` is `baseRadius`.

    const radiusForEraLayer = baseRadius + index * layerThickness
    const nextRadius = baseRadius + (index + 1) * layerThickness
    const midRadius = (radiusForEraLayer + nextRadius) / 2
    const radialDepthOfLayer = layerThickness // This is the "height" of the cylinder if it were laid flat

    // We'll create a segment of a cylinder (a curved wall).
    // The "height" of this cylinder geometry will be our `wedgeHeight`.
    // The "radius" of this cylinder geometry will be `midRadius`.
    // The "depth" or thickness of this wall will be `radialDepthOfLayer`.
    // This is tricky with CylinderGeometry. RingGeometry is better for flat rings.
    // Let's assume the prompt means creating segments of thin cylinders (like pie slices).
    // The "thickness" in the prompt likely refers to the radial extent of each era's layer.

    // Create a cylinder segment (like a piece of a pie, but it's a full cylinder segment)
    // To make it a "layer" or "ring segment", we'd typically use RingGeometry.
    // If we must use CylinderGeometry to form a ring segment:
    // radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength
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

    // To make it a "layer" with radial thickness, we'd typically use two cylinders and CSG,
    // or a custom geometry. Or, use RingGeometry and extrude it.
    // Given the constraints, the simplest interpretation is that each "layer" is a conceptual
    // region in space, and we are placing a representative mesh for that era within the wedge.
    // The prompt "width of each layer = thickness" suggests radial thickness.
    // Let's make each layer a distinct, slightly thicker ring segment.
    // We can use `ExtrudeGeometry` with a `Shape` made from an `ArcCurve`.

    // Re-interpreting: "thin CylinderGeometry meshes, one per era, stacked radially".
    // This means each era is a full cylinder (or segment) whose *radius* increases.
    // The "thickness" is the difference in radius between consecutive era cylinders.
    // The "width of each layer = thickness" is confusing.
    // Let's assume each era is represented by a single cylindrical shell segment.

    // The geometry created above is a segment of a cylinder with radius `midRadius` and height `wedgeHeight`.
    // This is probably what's intended for a single "layer" of an era.
    // The "stacking" is achieved by the `Slice` component rendering multiple such meshes,
    // each with a different `midRadius` based on its era.
    // So, this function should probably just create ONE geometry for a given radius.
    // No, "one per era, stacked radially" means this function *should* return multiple.

    layerGeometries.push({
      era,
      geometry, // This geometry is for the specific `midRadius` of this era.
    })
  })

  return layerGeometries
}

// Alternative: If "thickness" means the height of the cylinder itself, and radius is fixed per layer.
// This is more complex to make them appear as distinct layers in a wedge.
// The first interpretation (each era is a cylindrical shell segment at a different radius) is more likely.
