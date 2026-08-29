import * as THREE from "three";

const VERSION = "football-collar-tailor-v3-20260824";
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
  const yTop = box.max.y - size.y * 0.035;
  return { box, size, cx, yTop };
}

function material(color, depth = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.91,
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

function addCrew(group) {
  group.userData.usesDonorCollar = true;
  group.userData.visualProfile = "donor-crew";
}

function addV(group, frame, split = false) {
  const { size, cx, yTop } = frame;
  const w = size.x;
  const h = size.y;
  const collarColor = api.realism?.collarColor || state.colors.shirt;
  const opening = material(darken(state.colors.shirt, split ? 0.24 : 0.30), 1);
  const rib = material(darken(collarColor, 0.07), 3);
  const seam = material(darken(collarColor, 0.24), 4);

  const startX = w * (split ? 0.066 : 0.082);
  const topY = yTop - h * 0.004;
  const pointY = yTop - h * (split ? 0.073 : 0.118);
  const halfGap = split ? w * 0.008 : 0;
  const ribWidth = w * (split ? 0.015 : 0.020);
  const openingTop = startX * (split ? 0.72 : 0.78);

  addMesh(group, surfacePolygon([
    [cx - openingTop, topY],
    [cx + openingTop, topY],
    [cx + halfGap, pointY],
    [cx - halfGap, pointY],
  ], frame, opening, split ? "football-collar-split-v-opening" : "football-collar-v-opening", 25, 0.004));

  const leftEnd = [cx - halfGap, pointY];
  const rightEnd = [cx + halfGap, pointY];
  addMesh(group, surfaceRibbon([cx - startX, topY], leftEnd, ribWidth, frame, rib, "football-collar-v-rib-left", 29, 0.009));
  addMesh(group, surfaceRibbon(rightEnd, [cx + startX, topY], ribWidth, frame, rib, "football-collar-v-rib-right", 29, 0.009));
  addMesh(group, surfaceRibbon([cx - startX * 0.98, topY], leftEnd, w * 0.0032, frame, seam, "football-collar-v-seam-left", 31, 0.012));
  addMesh(group, surfaceRibbon(rightEnd, [cx + startX * 0.98, topY], w * 0.0032, frame, seam, "football-collar-v-seam-right", 31, 0.012));

  if (split) {
    addMesh(group, surfaceRibbon(
      [cx - w * 0.020, pointY - h * 0.004],
      [cx + w * 0.020, pointY - h * 0.004],
      w * 0.010,
      frame,
      rib,
      "football-collar-split-bridge",
      30,
      0.010
    ));
  }
  group.userData.visualProfile = split ? "split-v-visible" : "deep-v-visible";
}

function addPolo(group, frame, { buttons = false, retro = false } = {}) {
  const { size, cx, yTop } = frame;
  const w = size.x;
  const h = size.y;
  const collarColor = api.realism?.collarColor || state.colors.shirt;
  const wing = material(darken(collarColor, retro ? 0.15 : 0.12), 3);
  const seam = material(darken(collarColor, 0.30), 4);
  const placket = material(darken(state.colors.shirt, retro ? 0.18 : 0.15), 2);
  const opening = material(darken(state.colors.shirt, retro ? 0.30 : 0.25), 1);

  const outer = retro ? 0.138 : 0.114;
  const inner = retro ? 0.034 : 0.028;
  const drop = retro ? 0.136 : 0.108;
  const lowerOuter = retro ? 0.150 : 0.126;
  const topY = yTop - h * 0.004;
  const lowerY = yTop - h * drop;
  const openingBottomY = yTop - h * (retro ? 0.130 : (buttons ? 0.124 : 0.104));
  const openingTopHalf = w * (retro ? 0.082 : 0.066);
  const openingBottomHalf = w * (retro ? 0.020 : 0.014);

  addMesh(group, surfacePolygon([
    [cx - openingTopHalf, topY],
    [cx + openingTopHalf, topY],
    [cx + openingBottomHalf, openingBottomY],
    [cx - openingBottomHalf, openingBottomY],
  ], frame, opening, "football-collar-polo-opening", 25, 0.005));

  const leftWing = [
    [cx - w * outer, topY - h * 0.003],
    [cx - w * (outer * 0.54), topY],
    [cx - w * inner, topY - h * 0.004],
    [cx - w * (retro ? 0.050 : 0.041), lowerY],
    [cx - w * (lowerOuter * 0.70), yTop - h * (retro ? 0.100 : 0.081)],
    [cx - w * lowerOuter, yTop - h * (retro ? 0.077 : 0.063)],
  ];
  const rightWing = leftWing.map(([x, y]) => [2 * cx - x, y]).reverse();
  addMesh(group, surfacePolygon(leftWing, frame, wing, "football-collar-polo-wing-left", 29, 0.010));
  addMesh(group, surfacePolygon(rightWing, frame, wing, "football-collar-polo-wing-right", 29, 0.010));
  addMesh(group, surfaceRibbon(leftWing[2], leftWing[3], w * 0.0035, frame, seam, "football-collar-polo-seam-left", 31, 0.013));
  addMesh(group, surfaceRibbon(rightWing[2], rightWing[3], w * 0.0035, frame, seam, "football-collar-polo-seam-right", 31, 0.013));

  const placketTop = yTop - h * 0.032;
  const placketBottom = yTop - h * (retro ? 0.132 : (buttons ? 0.138 : 0.118));
  addMesh(group, surfaceRibbon([cx, placketTop], [cx, placketBottom], w * 0.016, frame, placket, "football-collar-polo-placket", 28, 0.008));
  addMesh(group, surfaceRibbon([cx, placketTop], [cx, placketBottom], w * 0.0030, frame, seam, "football-collar-polo-placket-seam", 31, 0.013));

  if (buttons) {
    const radius = w * 0.0074;
    addButton(cx, yTop - h * 0.072, frame, radius, group);
    addButton(cx, yTop - h * 0.106, frame, radius, group);
  }
  group.userData.visualProfile = retro ? "retro-polo-fold" : (buttons ? "polo-button-fold" : "polo-fold");
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
    window.__footballCollarTailorStatus = {
      version: VERSION,
      type,
      meshes: 0,
      finite: true,
      surfaceProjected: true,
      usesDonorCollar: true,
      visualProfile: "donor-original",
      reason,
    };
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
  const surfaceProjected = children.length === 0
    ? group.userData.usesDonorCollar === true
    : children.every((child) => child.userData?.surfaceProjected === true);
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
    usesDonorCollar: group.userData.usesDonorCollar === true,
    visualProfile: group.userData.visualProfile || null,
    heightFraction: Number(heightFraction.toFixed(4)),
    widthFraction: Number(widthFraction.toFixed(4)),
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
