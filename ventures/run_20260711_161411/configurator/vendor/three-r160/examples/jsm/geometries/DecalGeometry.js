import {
  BufferGeometry,
  Float32BufferAttribute,
  Matrix4,
  Vector3
} from "three";

/**
 * Local geometric projector used for logos/text on arbitrary GLB surfaces.
 * It clips source triangles against a rotated 3D projector box and emits
 * planar UVs for the projected patch. Dependency-free beyond Three.js.
 */
class DecalGeometry extends BufferGeometry {
  constructor(mesh, center, rotation, size) {
    super();

    const positions = [];
    const normals = [];
    const uvs = [];

    const projector = new Matrix4()
      .makeRotationFromEuler(rotation)
      .setPosition(center);
    const projectorInverse = projector.clone().invert();

    const source = mesh.geometry;
    const positionAttr = source.attributes.position;
    const normalAttr = source.attributes.normal;
    const index = source.index;

    const readVertex = (vertexIndex) => {
      const worldPosition = new Vector3()
        .fromBufferAttribute(positionAttr, vertexIndex)
        .applyMatrix4(mesh.matrixWorld);
      const worldNormal = normalAttr
        ? new Vector3()
            .fromBufferAttribute(normalAttr, vertexIndex)
            .transformDirection(mesh.matrixWorld)
            .normalize()
        : new Vector3(0, 0, 1);

      return {
        local: worldPosition.clone().applyMatrix4(projectorInverse),
        normal: worldNormal
      };
    };

    const lerpVertex = (a, b, t) => ({
      local: a.local.clone().lerp(b.local, t),
      normal: a.normal.clone().lerp(b.normal, t).normalize()
    });

    const clipPolygon = (polygon, axis, sign, limit) => {
      if (!polygon.length) return polygon;
      const out = [];
      const coord = (v) => sign * v.local.getComponent(axis);
      const inside = (v) => coord(v) <= limit + 1e-7;

      for (let i = 0; i < polygon.length; i++) {
        const current = polygon[i];
        const previous = polygon[(i + polygon.length - 1) % polygon.length];
        const currentInside = inside(current);
        const previousInside = inside(previous);

        if (currentInside !== previousInside) {
          const a = coord(previous);
          const b = coord(current);
          const denominator = b - a;
          const t = Math.abs(denominator) < 1e-12
            ? 0
            : (limit - a) / denominator;
          out.push(lerpVertex(previous, current, Math.min(1, Math.max(0, t))));
        }

        if (currentInside) out.push(current);
      }

      return out;
    };

    const half = {
      x: Math.max(size.x * 0.5, 1e-6),
      y: Math.max(size.y * 0.5, 1e-6),
      z: Math.max(size.z * 0.5, 1e-6)
    };

    const planes = [
      [0,  1, half.x], [0, -1, half.x],
      [1,  1, half.y], [1, -1, half.y],
      [2,  1, half.z], [2, -1, half.z]
    ];

    const triangleCount = index ? index.count / 3 : positionAttr.count / 3;

    for (let triangle = 0; triangle < triangleCount; triangle++) {
      const base = triangle * 3;
      const ids = index
        ? [index.getX(base), index.getX(base + 1), index.getX(base + 2)]
        : [base, base + 1, base + 2];

      let polygon = ids.map(readVertex);

      for (const [axis, sign, limit] of planes) {
        polygon = clipPolygon(polygon, axis, sign, limit);
        if (polygon.length < 3) break;
      }

      if (polygon.length < 3) continue;

      for (let i = 1; i < polygon.length - 1; i++) {
        for (const vertex of [polygon[0], polygon[i], polygon[i + 1]]) {
          const world = vertex.local.clone().applyMatrix4(projector);
          positions.push(world.x, world.y, world.z);
          normals.push(vertex.normal.x, vertex.normal.y, vertex.normal.z);
          uvs.push(
            0.5 + vertex.local.x / Math.max(size.x, 1e-6),
            0.5 + vertex.local.y / Math.max(size.y, 1e-6)
          );
        }
      }
    }

    this.setAttribute("position", new Float32BufferAttribute(positions, 3));
    this.setAttribute("normal", new Float32BufferAttribute(normals, 3));
    this.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  }
}

export { DecalGeometry };
