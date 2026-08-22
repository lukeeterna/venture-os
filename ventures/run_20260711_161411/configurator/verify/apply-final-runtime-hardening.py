from pathlib import Path

p = Path(__file__).resolve().parents[1] / "src" / "app.js"
s = p.read_text()

if 'version: "football-real-garment-v4-conformal"' in s:
    print("FINAL_RUNTIME_ALREADY_APPLIED=YES")
    raise SystemExit(0)

assert 'version: "football-real-garment-v3"' in s
assert 'function surfaceHit(' in s
assert 'function addTextDecal(' in s

s = s.replace('import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";\n', '')
s = s.replace('const zAxis = new THREE.Vector3(0, 0, 1);\n', '')
s = s.replace(
    '    backName: { x: 50, y: 26, scale: 40, rotation: 0 },\n'
    '    backNumber: { x: 50, y: 53, scale: 48, rotation: 0 },\n',
    '    backName: { x: 50, y: 23, scale: 36, rotation: 0 },\n'
    '    backNumber: { x: 50, y: 55, scale: 44, rotation: 0 },\n'
)

marker = 'async function loadKit() {'
assert marker in s
athletic = r'''function applyAthleticFit(root) {
  const seen = new Set();
  const smoothstep = (a, b, x) => {
    const t = clamp((x - a) / Math.max(1e-6, b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry || seen.has(obj.geometry)) return;
    seen.add(obj.geometry);
    const geometry = obj.geometry;
    const position = geometry.attributes?.position;
    if (!position) return;
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    const height = Math.max(1e-6, box.max.y - box.min.y);
    for (let i = 0; i < position.count; i++) {
      const y = position.getY(i);
      const t = clamp((y - box.min.y) / height, 0, 1);
      const waist = Math.exp(-Math.pow((t - 0.36) / 0.28, 2));
      const shoulder = smoothstep(0.72, 1.0, t);
      const xFactor = 0.95 - 0.09 * waist + 0.05 * shoulder;
      const zFactor = 0.90 + 0.10 * shoulder;
      position.setX(i, position.getX(i) * xFactor);
      position.setZ(i, position.getZ(i) * zFactor);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
  });
}

'''
s = s.replace(marker, athletic + marker, 1)
s = s.replace(
    '  roots.shirt.name = "donor-shirt";\n'
    '  roots.shorts.name = "donor-shorts";\n'
    '  roots.socks.name = "donor-socks";\n\n'
    '  roots.shirt.scale.setScalar(7.0);',
    '  roots.shirt.name = "donor-shirt";\n'
    '  roots.shorts.name = "donor-shorts";\n'
    '  roots.socks.name = "donor-socks";\n\n'
    '  applyAthleticFit(roots.shirt);\n'
    '  roots.shirt.scale.setScalar(7.0);',
    1
)

start = s.index('function surfaceHit(')
end = s.index('function currentFont()', start)
surface_block = r'''function surfaceRay(surfaceId, xPct, yPct) {
  const def = surfaceDef(surfaceId);
  const box = bounds[def.part];
  if (!box || box.isEmpty()) return null;
  const x = clamp(Number(xPct) || 50, 0, 100) / 100;
  const y = clamp(Number(yPct) || 50, 0, 100) / 100;
  const width = box.max.x - box.min.x;
  const height = box.max.y - box.min.y;
  const depth = box.max.z - box.min.z;
  const far = Math.max(width, height, depth) * 2.5 + 2;
  const centerX = (box.min.x + box.max.x) * 0.5;
  let origin;
  let direction;

  if (def.side === "front" || def.side === "back") {
    const px = lerp(box.min.x + width * 0.16, box.max.x - width * 0.16, x);
    const py = lerp(box.max.y - height * 0.15, box.min.y + height * 0.15, y);
    if (def.side === "back") {
      origin = new THREE.Vector3(px, py, box.min.z - far);
      direction = new THREE.Vector3(0, 0, 1);
    } else {
      origin = new THREE.Vector3(px, py, box.max.z + far);
      direction = new THREE.Vector3(0, 0, -1);
    }
  } else if (def.side === "left" || def.side === "right") {
    const py = lerp(box.max.y - height * 0.08, box.max.y - height * 0.43, y);
    const pz = lerp(box.max.z - depth * 0.12, box.min.z + depth * 0.12, x);
    if (def.side === "left") {
      origin = new THREE.Vector3(box.min.x - far, py, pz);
      direction = new THREE.Vector3(1, 0, 0);
    } else {
      origin = new THREE.Vector3(box.max.x + far, py, pz);
      direction = new THREE.Vector3(-1, 0, 0);
    }
  } else {
    const left = def.side === "front-left";
    const px = left
      ? lerp(box.min.x + width * 0.09, centerX - width * 0.04, x)
      : lerp(centerX + width * 0.04, box.max.x - width * 0.09, x);
    const py = lerp(box.max.y - height * 0.12, box.min.y + height * 0.12, y);
    origin = new THREE.Vector3(px, py, box.max.z + far);
    direction = new THREE.Vector3(0, 0, -1);
  }
  return { def, origin, direction, outward: direction.clone().negate() };
}

function surfaceHit(surfaceId, xPct, yPct) {
  const ray = surfaceRay(surfaceId, xPct, yPct);
  if (!ray) return null;
  const hit = rayHit(meshes[ray.def.part], ray.origin, ray.direction);
  if (!hit) return null;
  if (hit.normal.dot(ray.outward) < 0) hit.normal.negate();
  hit.outward = ray.outward;
  return hit;
}

function surfaceSafeSize(surfaceId) {
  const def = surfaceDef(surfaceId);
  const size = bounds[def.part].getSize(new THREE.Vector3());
  if (def.side === "front" || def.side === "back") {
    return { width: size.x * 0.68, height: size.y * 0.70 };
  }
  if (def.side === "left" || def.side === "right") {
    return { width: Math.max(size.z * 0.76, size.x * 0.14), height: size.y * 0.35 };
  }
  return { width: size.x * 0.37, height: size.y * 0.76 };
}

function buildSurfaceOverlayGeometry(surfaceId, xPct, yPct, sizeX, sizeY, rotationDeg = 0, cols = 8, rows = 6) {
  const safe = surfaceSafeSize(surfaceId);
  if (!safe.width || !safe.height) return null;
  const spanX = clamp(sizeX / safe.width * 100, 2, 86);
  const spanY = clamp(sizeY / safe.height * 100, 2, 86);
  const angle = radians(rotationDeg);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  for (const shrink of [1, 0.86, 0.72, 0.58]) {
    const halfX = spanX * shrink * 0.5;
    const halfY = spanY * shrink * 0.5;
    const cx = clamp(Number(xPct) || 50, 2 + halfX, 98 - halfX);
    const cy = clamp(Number(yPct) || 50, 2 + halfY, 98 - halfY);
    const positions = [];
    const normals = [];
    const uvs = [];
    let ok = true;

    for (let row = 0; row <= rows && ok; row++) {
      for (let col = 0; col <= cols; col++) {
        const du = (col / cols - 0.5) * spanX * shrink;
        const dv = (row / rows - 0.5) * spanY * shrink;
        const rx = du * cos - dv * sin;
        const ry = du * sin + dv * cos;
        const hit = surfaceHit(surfaceId, cx + rx, cy + ry);
        if (!hit) { ok = false; break; }
        const point = hit.point.clone().add(hit.normal.clone().multiplyScalar(0.012));
        positions.push(point.x, point.y, point.z);
        normals.push(hit.normal.x, hit.normal.y, hit.normal.z);
        uvs.push(col / cols, 1 - row / rows);
      }
    }
    if (!ok) continue;

    const indices = [];
    const stride = cols + 1;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const a = row * stride + col;
        const b = a + 1;
        const c = a + stride;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    geometry.userData.shrink = shrink;
    return geometry;
  }
  return null;
}

function makeSurfaceOverlay(surfaceId, texture, xPct, yPct, sizeX, sizeY, rotationDeg, opacity = 1, cols = 8, rows = 6) {
  if (!texture) return null;
  const geometry = buildSurfaceOverlayGeometry(surfaceId, xPct, yPct, sizeX, sizeY, rotationDeg, cols, rows);
  if (!geometry) return null;
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    opacity: clamp(Number(opacity) || 1, 0.05, 1),
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    roughness: 0.80,
    metalness: 0,
    side: THREE.DoubleSide,
    alphaTest: 0.015
  });
  const overlay = new THREE.Mesh(geometry, material);
  overlay.renderOrder = 10;
  overlay.castShadow = false;
  overlay.receiveShadow = false;
  decalGroup.add(overlay);
  return overlay;
}

'''
s = s[:start] + surface_block + s[end:]

start = s.index('function addTextDecal(')
end = s.index('function sliderMarkup(', start)
decal_block = r'''function addTextDecal(surface, config, text, kind) {
  if (!cleanText(text, kind === "name" ? 24 : 6)) return;
  const texture = textTexture(text, kind);
  texture.userData.generatedText = true;
  const safe = surfaceSafeSize(surface);
  const sizeX = safe.width * clamp(config.scale, 8, 80) / 100;
  const aspect = texture.userData.canvasAspect || 1;
  makeSurfaceOverlay(surface, texture, config.x, config.y, sizeX, sizeX / aspect, config.rotation, 1, kind === "name" ? 10 : 9, kind === "name" ? 3 : 8);
}

function rebuildDecals() {
  if (!ready && !roots.shirt) return;
  scene.updateMatrixWorld(true);
  refreshBounds();
  disposeDecals();
  addTextDecal("shirt-back", state.personalization.backName, state.personalization.name, "name");
  addTextDecal("shirt-back", state.personalization.backNumber, state.personalization.number, "number");
  if (state.personalization.frontNumberEnabled) {
    addTextDecal("shirt-front", state.personalization.frontNumber, state.personalization.number, "number");
  }
  for (const graphic of state.graphics) {
    if (!graphic.texture) continue;
    const def = surfaceDef(graphic.surface);
    if (def.part === "socks" && !state.showSocks) continue;
    const safe = surfaceSafeSize(graphic.surface);
    const base = safe.width * clamp(graphic.scale, 4, 70) / 100;
    const aspect = clamp(Number(graphic.aspect) || 1, 0.12, 8);
    makeSurfaceOverlay(
      graphic.surface,
      graphic.texture,
      graphic.x,
      graphic.y,
      base * Math.sqrt(aspect),
      base / Math.sqrt(aspect),
      graphic.rotation,
      graphic.opacity,
      def.side === "left" || def.side === "right" ? 5 : 8,
      def.side === "left" || def.side === "right" ? 5 : 6
    );
  }
}

'''
s = s[:start] + decal_block + s[end:]

s = s.replace('ctx.strokeStyle = "rgba(0,0,0,.45)";', 'ctx.strokeStyle = "rgba(0,0,0,.30)";')
s = s.replace('ctx.lineWidth = Math.max(3, px * 0.022);', 'ctx.lineWidth = Math.max(2, px * 0.014);')
s = s.replace('version: "football-real-garment-v3"', 'version: "football-real-garment-v4-conformal"')

assert 'DecalGeometry' not in s
assert 'buildSurfaceOverlayGeometry' in s
assert 'applyAthleticFit(roots.shirt)' in s
assert 'version: "football-real-garment-v4-conformal"' in s
p.write_text(s)
print("FINAL_RUNTIME_APPLIED=YES")
