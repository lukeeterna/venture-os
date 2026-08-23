import * as THREE from "three";

const VERSION = "football-collar-tailor-v1-20260823";
const raycaster = new THREE.Raycaster();
let api;
let scene;
let shirt;
let state;
let timer = null;

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

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

function frontHit(x, y, box, size) {
  const far = Math.max(size.x, size.y, size.z) * 3 + 2;
  raycaster.set(new THREE.Vector3(x, y, box.max.z + far), new THREE.Vector3(0, 0, -1));
  const meshes = [];
  shirt.traverse((node) => { if (node.isMesh) meshes.push(node); });
  return raycaster.intersectObjects(meshes, false)[0] || null;
}

function necklineFrame() {
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(shirt);
  const size = box.getSize(new THREE.Vector3());
  const cx = (box.min.x + box.max.x) * 0.5;
  const yTop = box.max.y - size.y * 0.018;
  const yShoulder = box.max.y - size.y * 0.052;
  const probes = [
    frontHit(cx - size.x * 0.105, yShoulder, box, size),
    frontHit(cx + size.x * 0.105, yShoulder, box, size),
    frontHit(cx - size.x * 0.14, box.max.y - size.y * 0.085, box, size),
    frontHit(cx + size.x * 0.14, box.max.y - size.y * 0.085, box, size),
  ].filter(Boolean);
  const z = probes.length ? probes.reduce((sum, hit) => sum + hit.point.z, 0) / probes.length : box.max.z;
  return { box, size, cx, yTop, z };
}

function material(color, depth = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.88,
    metalness: 0,
    side: THREE.DoubleSide,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: -4 - depth,
  });
}

function polygon(points, z, mat, name, renderOrder = 24) {
  if (points.length < 3) return null;
  const vertices = [];
  for (const [x, y] of points) vertices.push(x, y, z);
  const indices = [];
  for (let i = 1; i < points.length - 1; i++) indices.push(0, i, i + 1);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.name = name;
  mesh.renderOrder = renderOrder;
  return mesh;
}

function ribbon(a, b, width, z, mat, name) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length = Math.hypot(dx, dy) || 1;
  const ox = -dy / length * width * 0.5;
  const oy = dx / length * width * 0.5;
  return polygon([
    [a[0] + ox, a[1] + oy],
    [b[0] + ox, b[1] + oy],
    [b[0] - ox, b[1] - oy],
    [a[0] - ox, a[1] - oy],
  ], z, mat, name, 28);
}

function button(x, y, z, radius, group) {
  const geometry = new THREE.CircleGeometry(radius, 20);
  const buttonMaterial = material("#e8e6df", 3);
  const mesh = new THREE.Mesh(geometry, buttonMaterial);
  mesh.position.set(x, y, z + radius * 0.02);
  mesh.name = "football-collar-button";
  mesh.renderOrder = 31;
  group.add(mesh);
}

function addV(group, frame, split = false) {
  const { size, cx, yTop, z } = frame;
  const w = size.x;
  const h = size.y;
  const fabric = material(state.colors.shirt, 1);
  const collarColor = api.realism?.collarColor || state.colors.shirt;
  const rib = material(collarColor, 2);
  const edge = material(darken(collarColor, 0.17), 3);
  const outerX = w * (split ? 0.075 : 0.092);
  const gapX = w * (split ? 0.018 : 0.046);
  const pointY = yTop - h * (split ? 0.075 : 0.115);
  const topY = yTop - h * 0.012;

  group.add(polygon([
    [cx - outerX, topY], [cx - gapX, topY], [cx, pointY], [cx - outerX * 0.90, yTop - h * 0.058],
  ], z - size.z * 0.002, fabric, "football-collar-v-fill-left", 21));
  group.add(polygon([
    [cx + gapX, topY], [cx + outerX, topY], [cx + outerX * 0.90, yTop - h * 0.058], [cx, pointY],
  ], z - size.z * 0.002, fabric, "football-collar-v-fill-right", 21));

  const ribWidth = w * (split ? 0.008 : 0.011);
  const left = [[cx - gapX, topY], [cx, pointY]];
  const right = [[cx, pointY], [cx + gapX, topY]];
  group.add(ribbon(left[0], left[1], ribWidth, z + size.z * 0.004, rib, "football-collar-v-rib-left"));
  group.add(ribbon(right[0], right[1], ribWidth, z + size.z * 0.004, rib, "football-collar-v-rib-right"));
  group.add(ribbon([cx - outerX, topY], [cx - gapX, topY], w * 0.004, z + size.z * 0.005, edge, "football-collar-v-seam-left"));
  group.add(ribbon([cx + gapX, topY], [cx + outerX, topY], w * 0.004, z + size.z * 0.005, edge, "football-collar-v-seam-right"));
}

function addCrew(group, frame) {
  const { size, cx, yTop, z } = frame;
  const w = size.x;
  const h = size.y;
  const color = api.realism?.collarColor || state.colors.shirt;
  const rib = material(color, 2);
  const seam = material(darken(color, 0.17), 3);
  const segments = 18;
  const outer = [];
  const inner = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = Math.PI * (1 - t);
    const x = cx + Math.cos(angle) * w * 0.084;
    const y = yTop - h * 0.010 - Math.sin(angle) * h * 0.045;
    outer.push([x, y]);
    const xi = cx + Math.cos(angle) * w * 0.071;
    const yi = yTop - h * 0.007 - Math.sin(angle) * h * 0.036;
    inner.push([xi, yi]);
  }
  for (let i = 0; i < segments; i++) {
    group.add(polygon([outer[i], outer[i + 1], inner[i + 1], inner[i]], z + size.z * 0.003, rib, `football-collar-crew-${i}`, 27));
  }
  for (let i = 0; i < segments; i += 2) {
    group.add(ribbon(inner[i], inner[Math.min(segments, i + 2)], w * 0.0025, z + size.z * 0.005, seam, `football-collar-crew-seam-${i}`));
  }
}

function addPolo(group, frame, { buttons = false, retro = false } = {}) {
  const { size, cx, yTop, z } = frame;
  const w = size.x;
  const h = size.y;
  const collarColor = api.realism?.collarColor || state.colors.shirt;
  const wing = material(collarColor, 3);
  const seam = material(darken(collarColor, 0.18), 4);
  const fabric = material(state.colors.shirt, 1);
  const wide = retro ? 0.155 : 0.120;
  const inner = retro ? 0.018 : 0.012;
  const drop = retro ? 0.165 : 0.125;
  const topY = yTop - h * 0.010;
  const slitBottom = yTop - h * (buttons ? 0.145 : 0.115);

  group.add(polygon([
    [cx - w * 0.090, topY], [cx - w * 0.010, topY], [cx - w * 0.008, slitBottom], [cx - w * 0.083, yTop - h * 0.060],
  ], z - size.z * 0.003, fabric, "football-collar-polo-fill-left", 20));
  group.add(polygon([
    [cx + w * 0.010, topY], [cx + w * 0.090, topY], [cx + w * 0.083, yTop - h * 0.060], [cx + w * 0.008, slitBottom],
  ], z - size.z * 0.003, fabric, "football-collar-polo-fill-right", 20));

  const leftWing = [
    [cx - w * wide, yTop - h * 0.020],
    [cx - w * inner, yTop - h * 0.028],
    [cx - w * (retro ? 0.045 : 0.032), yTop - h * drop],
    [cx - w * (retro ? 0.170 : 0.135), yTop - h * (retro ? 0.095 : 0.078)],
  ];
  const rightWing = leftWing.map(([x, y]) => [2 * cx - x, y]).reverse();
  group.add(polygon(leftWing, z + size.z * 0.008, wing, "football-collar-polo-wing-left", 29));
  group.add(polygon(rightWing, z + size.z * 0.008, wing, "football-collar-polo-wing-right", 29));

  group.add(ribbon(leftWing[1], leftWing[2], w * 0.004, z + size.z * 0.011, seam, "football-collar-polo-seam-left"));
  group.add(ribbon(rightWing[2], rightWing[1], w * 0.004, z + size.z * 0.011, seam, "football-collar-polo-seam-right"));
  group.add(ribbon([cx, yTop - h * 0.030], [cx, slitBottom], w * 0.004, z + size.z * 0.010, seam, "football-collar-polo-placket"));

  if (buttons) {
    const radius = w * 0.007;
    button(cx, yTop - h * 0.078, z + size.z * 0.012, radius, group);
    button(cx, yTop - h * 0.112, z + size.z * 0.012, radius, group);
  }
}

function rebuild(reason = "manual") {
  if (!scene || !shirt || !api?.realism) return;
  const old = scene.getObjectByName("football-realism-collar-v6");
  if (old) disposeObject(old);
  const group = new THREE.Group();
  group.name = "football-realism-collar-v6";
  group.userData.tailorVersion = VERSION;
  group.userData.reason = reason;
  scene.add(group);

  const type = api.realism.collar || "original";
  if (type === "original") {
    window.__footballCollarTailorStatus = { version: VERSION, type, meshes: 0, reason };
    return;
  }

  const frame = necklineFrame();
  if (type === "crew") addCrew(group, frame);
  else if (type === "v") addV(group, frame, false);
  else if (type === "split-v") addV(group, frame, true);
  else if (type === "polo") addPolo(group, frame);
  else if (type === "polo-button") addPolo(group, frame, { buttons: true });
  else if (type === "retro-90") addPolo(group, frame, { retro: true });

  const children = group.children.filter(Boolean);
  const finite = children.every((child) => {
    const attr = child.geometry?.attributes?.position;
    if (!attr) return true;
    for (let i = 0; i < attr.count; i++) {
      if (![attr.getX(i), attr.getY(i), attr.getZ(i)].every(Number.isFinite)) return false;
    }
    return true;
  });
  window.__footballCollarTailorStatus = { version: VERSION, type, meshes: children.length, finite, reason };
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

  document.getElementById("football-collar")?.addEventListener("change", () => schedule("collar-change"));
  document.getElementById("football-collar-color")?.addEventListener("input", () => schedule("collar-color"));
  document.getElementById("shirt-color")?.addEventListener("input", () => schedule("shirt-color"));
  api.rebuildFootballCollar = () => rebuild("api");
  window.__footballCollarTailorReady = true;
  rebuild("bootstrap");
} else {
  window.__footballCollarTailorError = "football collar tailor bootstrap timeout";
}
