import * as THREE from "three";

const VERSION = "football-collar-tailor-v2-20260823";
const raycaster = new THREE.Raycaster();
let api;
let scene;
let shirt;
let state;
let timer = null;
let shirtMeshList = [];
let projectionFallbackMax = 0;

function disposeObject(object) {
  if (!object) return;
  object.traverse?.((node) => {
    node.geometry?.dispose?.();
    const materials = node.material ? (Array.isArray(node.material) ? node.material : [node.material]) : [];
    materials.forEach((material) => material?.dispose?.());
  });
  object.parent?.remove(object);
}

function darken(color, amount = 0.13) {
  const result = new THREE.Color(color || "#ffffff");
  result.offsetHSL(0, 0, -amount);
  return result;
}

function frontHit(x, y, frame) {
  const { box, size } = frame;
  const far = Math.max(size.x, size.y, size.z) * 3 + 2;
  raycaster.set(new THREE.Vector3(x, y, box.max.z + far), new THREE.Vector3(0, 0, -1));
  return raycaster.intersectObjects(shirtMeshList, false)[0] || null;
}

function necklineFrame() {
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(shirt);
  const size = box.getSize(new THREE.Vector3());
  const cx = (box.min.x + box.max.x) * 0.5;
  // Keep the construction on the actual upper-chest textile. The old v1 used
  // one average Z plane at the neck and created visibly floating rectangles.
  const yTop = box.max.y - size.y * 0.035;
  return { box, size, cx, yTop };
}

function material(color, depth = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.90,
    metalness: 0,
    side: THREE.DoubleSide,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -5 - depth,
  });
}

function projectedPoint(x, y, frame, lift = 0.006) {
  const { size, cx } = frame;
  const attempts = [
    [x, y],
    [x, y - size.y * 0.008],
    [x, y - size.y * 0.016],
    [x, y - size.y * 0.026],
    [cx + (x - cx) * 1.06, y - size.y * 0.012],
    [cx + (x - cx) * 1.12, y - size.y * 0.022],
    [cx + (x - cx) * 1.18, y - size.y * 0.034],
  ];
  for (let i = 0; i < attempts.length; i++) {
    const hit = frontHit(attempts[i][0], attempts[i][1], frame);
    if (!hit) continue;
    const normal = (hit.face?.normal?.clone() || new THREE.Vector3(0, 0, 1))
      .transformDirection(hit.object.matrixWorld)
      .normalize();
    if (normal.z < 0) normal.negate();
    projectionFallbackMax = Math.max(projectionFallbackMax, i);
    return {
      point: hit.point.clone().add(normal.clone().multiplyScalar(size.z * lift)),
      normal,
    };
  }
  return null;
}

function surfacePolygon(points, frame, mat, name, renderOrder = 27, lift = 0.006) {
  if (points.length < 3) return null;
  const projected = points.map(([x, y]) => projectedPoint(x, y, frame, lift));
  if (projected.some((item) => !item)) return null;
  const positions = [];
  const normals = [];
  projected.forEach(({ point, normal }) => {
    positions.push(point.x, point.y, point.z);
    normals.push(normal.x, normal.y, normal.z);
  });
  const indices = [];
  for (let i = 1; i < points.length - 1; i++) indices.push(0, i, i + 1);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.name = name;
  mesh.renderOrder = renderOrder;
  mesh.userData.surfaceProjected = true;
  mesh.userData.tailorVersion = VERSION;
  return mesh;
}

function surfaceRibbon(a, b, width, frame, mat, name, renderOrder = 28, lift = 0.006) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length = Math.hypot(dx, dy) || 1;
  const ox = -dy / length * width * 0.5;
  const oy = dx / length * width * 0.5;
  return surfacePolygon([
    [a[0] + ox, a[1] + oy],
    [b[0] + ox, b[1] + oy],
    [b[0] - ox, b[1] - oy],
    [a[0] - ox, a[1] - oy],
  ], frame, mat, name, renderOrder, lift);
}

function addMesh(group, mesh) {
  if (mesh) group.add(mesh);
}

function addButton(x, y, frame, radius, group) {
  const projected = projectedPoint(x, y, frame, 0.010);
  if (!projected) return;
  const geometry = new THREE.CircleGeometry(radius, 24);
  const buttonMaterial = material("#e8e6df", 4);
  const mesh = new THREE.Mesh(geometry, buttonMaterial);
  mesh.position.copy(projected.point);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), projected.normal);
  mesh.name = "football-collar-button";
  mesh.renderOrder = 32;
  mesh.userData.surfaceProjected = true;
  mesh.userData.tailorVersion = VERSION;
  group.add(mesh);
}

function addCrew(group, frame) {
  const { size, cx, yTop } = frame;
  const w = size.x;
  const h = size.y;
  const color = api.realism?.collarColor || state.colors.shirt;
  const rib = material(color, 2);
  const seam = material(darken(color, 0.16), 3);
  const segments = 20;
  const outer = [];
  const inner = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = Math.PI * (1 - t);
    outer.push([
      cx + Math.cos(angle) * w * 0.082,
      yTop - h * 0.004 - Math.sin(angle) * h * 0.050,
    ]);
    inner.push([
      cx + Math.cos(angle) * w * 0.068,
      yTop - h * 0.007 - Math.sin(angle) * h * 0.036,
    ]);
  }
  for (let i = 0; i < segments; i++) {
    addMesh(group, surfacePolygon([outer[i], outer[i + 1], inner[i + 1], inner[i]], frame, rib, `football-collar-crew-${i}`, 27, 0.006));
  }
  for (let i = 0; i < segments; i += 2) {
    addMesh(group, surfaceRibbon(inner[i], inner[Math.min(segments, i + 2)], w * 0.0022, frame, seam, `football-collar-crew-seam-${i}`, 29, 0.009));
  }
}

function addV(group, frame, split = false) {
  const { size, cx, yTop } = frame;
  const w = size.x;
  const h = size.y;
  const color = api.realism?.collarColor || state.colors.shirt;
  const rib = material(color, 2);
  const seam = material(darken(color, 0.18), 3);
  const startX = w * (split ? 0.060 : 0.074);
  const topY = yTop - h * 0.010;
  const pointY = yTop - h * (split ? 0.082 : 0.112);
  const halfGap = split ? w * 0.006 : 0;
  const ribWidth = w * (split ? 0.014 : 0.017);
  const leftEnd = [cx - halfGap, pointY];
  const rightEnd = [cx + halfGap, pointY];
  addMesh(group, surfaceRibbon([cx - startX, topY], leftEnd, ribWidth, frame, rib, "football-collar-v-rib-left", 28, 0.007));
  addMesh(group, surfaceRibbon(rightEnd, [cx + startX, topY], ribWidth, frame, rib, "football-collar-v-rib-right", 28, 0.007));
  addMesh(group, surfaceRibbon([cx - startX * 0.96, topY - h * 0.001], leftEnd, w * 0.0024, frame, seam, "football-collar-v-seam-left", 30, 0.010));
  addMesh(group, surfaceRibbon(rightEnd, [cx + startX * 0.96, topY - h * 0.001], w * 0.0024, frame, seam, "football-collar-v-seam-right", 30, 0.010));
  if (split) {
    addMesh(group, surfaceRibbon([cx, pointY - h * 0.010], [cx, pointY + h * 0.010], w * 0.0026, frame, seam, "football-collar-split-center", 31, 0.011));
  }
}

function addPolo(group, frame, { buttons = false, retro = false } = {}) {
  const { size, cx, yTop } = frame;
  const w = size.x;
  const h = size.y;
  const collarColor = api.realism?.collarColor || state.colors.shirt;
  const wing = material(collarColor, 3);
  const seam = material(darken(collarColor, 0.18), 4);
  const outer = retro ? 0.130 : 0.105;
  const inner = retro ? 0.032 : 0.026;
  const drop = retro ? 0.130 : 0.102;
  const lowerOuter = retro ? 0.145 : 0.120;
  const topY = yTop - h * 0.010;
  const lowerY = yTop - h * drop;

  const leftWing = [
    [cx - w * outer, topY - h * 0.010],
    [cx - w * inner, topY - h * 0.008],
    [cx - w * (retro ? 0.044 : 0.036), lowerY],
    [cx - w * lowerOuter, yTop - h * (retro ? 0.082 : 0.070)],
  ];
  const rightWing = leftWing.map(([x, y]) => [2 * cx - x, y]).reverse();
  addMesh(group, surfacePolygon(leftWing, frame, wing, "football-collar-polo-wing-left", 29, 0.008));
  addMesh(group, surfacePolygon(rightWing, frame, wing, "football-collar-polo-wing-right", 29, 0.008));
  addMesh(group, surfaceRibbon(leftWing[1], leftWing[2], w * 0.0028, frame, seam, "football-collar-polo-seam-left", 31, 0.011));
  addMesh(group, surfaceRibbon(rightWing[2], rightWing[1], w * 0.0028, frame, seam, "football-collar-polo-seam-right", 31, 0.011));

  const placketTop = yTop - h * 0.045;
  const placketBottom = yTop - h * (buttons ? 0.145 : 0.125);
  addMesh(group, surfaceRibbon([cx, placketTop], [cx, placketBottom], w * 0.013, frame, material(darken(state.colors.shirt, 0.04), 2), "football-collar-polo-placket", 26, 0.006));
  addMesh(group, surfaceRibbon([cx, placketTop], [cx, placketBottom], w * 0.0022, frame, seam, "football-collar-polo-placket-seam", 31, 0.011));

  if (buttons) {
    const radius = w * 0.0062;
    addButton(cx, yTop - h * 0.082, frame, radius, group);
    addButton(cx, yTop - h * 0.116, frame, radius, group);
  }
}

function rebuild(reason = "manual") {
  if (!scene || !shirt || !api?.realism) return;
  for (const old of scene.children.filter((child) => child?.name === "football-realism-collar-v6")) disposeObject(old);
  const group = new THREE.Group();
  group.name = "football-realism-collar-v6";
  group.userData.tailorVersion = VERSION;
  group.userData.reason = reason;
  scene.add(group);

  const type = api.realism.collar || "original";
  if (type === "original") {
    window.__footballCollarTailorStatus = { version: VERSION, type, meshes: 0, finite: true, surfaceProjected: true, reason };
    return;
  }

  projectionFallbackMax = 0;
  const frame = necklineFrame();
  if (type === "crew") addCrew(group, frame);
  else if (type === "v") addV(group, frame, false);
  else if (type === "split-v") addV(group, frame, true);
  else if (type === "polo") addPolo(group, frame);
  else if (type === "polo-button") addPolo(group, frame, { buttons: true });
  else if (type === "retro-90") addPolo(group, frame, { retro: true });

  scene.updateMatrixWorld(true);
  const children = group.children.filter(Boolean);
  const finite = children.every((child) => {
    const attr = child.geometry?.attributes?.position;
    if (!attr) return true;
    for (let i = 0; i < attr.count; i++) {
      if (![attr.getX(i), attr.getY(i), attr.getZ(i)].every(Number.isFinite)) return false;
    }
    return true;
  });
  const shirtBox = new THREE.Box3().setFromObject(shirt);
  const shirtSize = shirtBox.getSize(new THREE.Vector3());
  const collarBox = children.length ? new THREE.Box3().setFromObject(group) : new THREE.Box3();
  const collarSize = children.length ? collarBox.getSize(new THREE.Vector3()) : new THREE.Vector3();
  const heightFraction = shirtSize.y > 0 ? collarSize.y / shirtSize.y : 0;
  const widthFraction = shirtSize.x > 0 ? collarSize.x / shirtSize.x : 0;
  const depthFraction = shirtSize.z > 0 ? collarSize.z / shirtSize.z : 0;
  const surfaceProjected = children.length > 0 && children.every((child) => child.userData?.surfaceProjected === true);
  group.userData.surfaceProjected = surfaceProjected;
  group.userData.heightFraction = heightFraction;
  group.userData.widthFraction = widthFraction;
  group.userData.maxProjectionFallback = projectionFallbackMax;
  window.__footballCollarTailorStatus = {
    version: VERSION,
    type,
    meshes: children.length,
    finite,
    surfaceProjected,
    heightFraction: Number(heightFraction.toFixed(4)),
    widthFraction: Number(widthFraction.toFixed(4)),
    depthFraction: Number(depthFraction.toFixed(4)),
    maxProjectionFallback: projectionFallbackMax,
    reason,
  };
}

function schedule(reason) {
  clearTimeout(timer);
  timer = setTimeout(() => rebuild(reason), 70);
}

async function waitReady() {
  for (let i = 0; i < 600; i++) {
    if (window.__footballRealismReady && window.__sportswear3d?.realism && window.__footballRealismScene?.isScene) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

if (await waitReady()) {
  api = window.__sportswear3d;
  scene = window.__footballRealismScene;
  state = api.state;
  shirt = scene.getObjectByName("donor-shirt");
  if (!shirt) throw new Error("football collar tailor: donor shirt not found");
  shirtMeshList = [];
  shirt.traverse((node) => { if (node.isMesh) shirtMeshList.push(node); });

  document.getElementById("football-collar")?.addEventListener("change", () => schedule("collar-change"));
  document.getElementById("football-collar-color")?.addEventListener("input", () => schedule("collar-color"));
  document.getElementById("shirt-color")?.addEventListener("input", () => schedule("shirt-color"));
  api.rebuildFootballCollar = () => rebuild("api");
  window.__footballCollarTailorReady = true;
  rebuild("bootstrap");
} else {
  window.__footballCollarTailorError = "football collar tailor bootstrap timeout";
}
