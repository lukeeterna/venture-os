import * as THREE from "three";

const VERSION = "football-nameset-edge-safe-v1-20260823";
const REFERENCE_SHIRT_BACK_CM = 74.5;
const PROFILE = Object.freeze({
  backNumber: { x: 50, bodyPct: 42.3, heightCm: 27.0, rotation: 0 },
  frontNumber: { x: 50, bodyPct: 38.4, heightCm: 11.5, rotation: 0 },
});
const CONTROL_TO_BODY_A = 7.7032258065;
const CONTROL_TO_BODY_B = 0.8870967742;
const NUMBER_GLYPH_FILL = 720 / 900;
const FONT_MAP = Object.freeze({
  impact: { family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif", weight: 900 },
  geometric: { family: "Futura, Avenir, 'Century Gothic', Arial, sans-serif", weight: 800 },
  condensed: { family: "'Arial Narrow', 'Helvetica Neue Condensed', Arial, sans-serif", weight: 900 },
  college: { family: "Rockwell, 'Courier New', serif", weight: 900 },
  classic: { family: "Georgia, 'Times New Roman', serif", weight: 800 },
  technical: { family: "Menlo, Monaco, 'Courier New', monospace", weight: 800 },
  modern: { family: "Avenir Next, Avenir, Arial, sans-serif", weight: 800 },
  system: { family: "Inter, ui-sans-serif, system-ui, Arial, sans-serif", weight: 800 },
});

let api;
let state;
let scene;
let shirt;
let repairTimer = null;
let watchTimer = null;
const raycaster = new THREE.Raycaster();
const status = {
  version: VERSION,
  repairs: 0,
  backNumberRepairs: 0,
  frontNumberRepairs: 0,
  maxInward: 0,
  lastReason: null,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const bodyFromControlY = (value) => CONTROL_TO_BODY_A + CONTROL_TO_BODY_B * Number(value || 0);

function publish(extra = {}) {
  Object.assign(status, extra);
  window.__footballNamesetEdgeSafeStatus = { ...status };
}

function shirtMetrics() {
  const box = new THREE.Box3().setFromObject(shirt);
  const size = box.getSize(new THREE.Vector3());
  return {
    box,
    size,
    safeWidth: size.x * 0.68,
    worldPerCm: size.y / REFERENCE_SHIRT_BACK_CM,
  };
}

function currentFont() {
  if (state.personalization.font === "custom" && state.personalization.customFontFamily) {
    return { family: `'${state.personalization.customFontFamily}'`, weight: 800 };
  }
  return FONT_MAP[state.personalization.font] || FONT_MAP.condensed;
}

function shirtMeshes() {
  const list = [];
  shirt.traverse((node) => { if (node.isMesh) list.push(node); });
  return list;
}

function hitSurface(side, xPct, bodyPct) {
  const { box, size } = shirtMetrics();
  const x = THREE.MathUtils.lerp(
    box.min.x + size.x * 0.16,
    box.max.x - size.x * 0.16,
    clamp(xPct, 0, 100) / 100
  );
  const y = box.max.y - size.y * clamp(bodyPct, 0, 100) / 100;
  const far = Math.max(size.x, size.y, size.z) * 3 + 2;
  const front = side === "front";
  raycaster.set(
    new THREE.Vector3(x, y, front ? box.max.z + far : box.min.z - far),
    new THREE.Vector3(0, 0, front ? -1 : 1)
  );
  const hit = raycaster.intersectObjects(shirtMeshes(), false)[0];
  if (!hit) return null;
  const normal = (hit.face?.normal?.clone() || new THREE.Vector3(0, 0, front ? 1 : -1))
    .transformDirection(hit.object.matrixWorld)
    .normalize();
  if (front && normal.z < 0) normal.negate();
  if (!front && normal.z > 0) normal.negate();
  return { point: hit.point.clone().add(normal.clone().multiplyScalar(0.017)), normal };
}

// Reuses the proven conformal-crest strategy: preserve the requested row/Y
// first and move only a missed transparent edge vertex horizontally inward.
// A small Y fallback exists only as a final safety net for highly curved edges.
function safeHitSurface(side, xPct, bodyPct, centerX, centerBodyPct) {
  const exact = hitSurface(side, xPct, bodyPct);
  if (exact) return { ...exact, inward: 0, yAdjusted: false };

  for (const inwardX of [0.08, 0.16, 0.28, 0.42, 0.60, 0.78, 1]) {
    const x = THREE.MathUtils.lerp(xPct, centerX, inwardX);
    const hit = hitSurface(side, x, bodyPct);
    if (hit) return { ...hit, inward: inwardX, yAdjusted: false };
  }

  for (const inwardY of [0.08, 0.16, 0.28]) {
    const y = THREE.MathUtils.lerp(bodyPct, centerBodyPct, inwardY);
    for (const inwardX of [0.16, 0.35, 0.60, 1]) {
      const x = THREE.MathUtils.lerp(xPct, centerX, inwardX);
      const hit = hitSurface(side, x, y);
      if (hit) return { ...hit, inward: Math.max(inwardX, inwardY), yAdjusted: true };
    }
  }
  return null;
}

function numberTexture() {
  const value = String(state.personalization.number || "10").replace(/[\r\n\t]/g, " ").trim().slice(0, 6) || "10";
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const font = currentFont();
  let px = 720;
  ctx.clearRect(0, 0, 900, 900);
  ctx.font = `${font.weight} ${px}px ${font.family}`;
  while (ctx.measureText(value).width > 810 && px > 180) {
    px -= 8;
    ctx.font = `${font.weight} ${px}px ${font.family}`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(255,255,255,.16)";
  ctx.lineWidth = Math.max(1.5, px * 0.008);
  ctx.strokeText(value, 450, 450 + px * 0.02);
  ctx.fillStyle = state.personalization.color;
  ctx.fillText(value, 450, 450 + px * 0.02);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, window.__footballRealismRenderer?.capabilities?.getMaxAnisotropy?.() || 1);
  texture.needsUpdate = true;
  texture.userData.footballNamesetGenerated = true;
  texture.userData.footballNamesetEdgeSafe = true;
  return texture;
}

function physicalHeightFromAdvancedScale(scale) {
  const metrics = shirtMetrics();
  const overlayWidth = metrics.safeWidth * clamp(scale, 4, 140) / 100;
  return overlayWidth * NUMBER_GLYPH_FILL / metrics.worldPerCm;
}

function advancedConfig(slot) {
  const containerId = slot === "backNumber" ? "back-number-controls" : "front-number-controls";
  const container = document.getElementById(containerId);
  if (!container) return null;
  const read = (key, fallback) => Number(container.querySelector(`input[data-key="${key}"]`)?.value ?? fallback);
  return {
    x: read("x", 50),
    bodyPct: bodyFromControlY(read("y", slot === "backNumber" ? 39 : 35)),
    heightCm: physicalHeightFromAdvancedScale(read("scale", 44)),
    rotation: read("rotation", 0),
  };
}

function layoutFor(slot) {
  const advanced = document.body.classList.contains("football-easy-advanced");
  return (advanced ? advancedConfig(slot) : null) || PROFILE[slot];
}

function buildNumberGeometry(side, cfg) {
  const metrics = shirtMetrics();
  const overlayHeight = cfg.heightCm * metrics.worldPerCm / NUMBER_GLYPH_FILL;
  const overlayWidth = overlayHeight;
  const spanX = overlayWidth / metrics.safeWidth * 100;
  const spanY = overlayHeight / metrics.size.y * 100;
  const angle = THREE.MathUtils.degToRad(Number(cfg.rotation) || 0);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const cols = 9;
  const rows = 8;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  let maxInward = 0;
  let yAdjustedVertices = 0;

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const dx = (col / cols - 0.5) * spanX;
      const dy = (row / rows - 0.5) * spanY;
      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;
      const hit = safeHitSurface(side, cfg.x + rx, cfg.bodyPct + ry, cfg.x, cfg.bodyPct);
      if (!hit) return null;
      maxInward = Math.max(maxInward, Number(hit.inward) || 0);
      if (hit.yAdjusted) yAdjustedVertices += 1;
      positions.push(hit.point.x, hit.point.y, hit.point.z);
      normals.push(hit.normal.x, hit.normal.y, hit.normal.z);
      uvs.push(side === "back" ? 1 - col / cols : col / cols, 1 - row / rows);
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const a = row * (cols + 1) + col;
      const b = a + 1;
      const c = a + cols + 1;
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
  geometry.userData.edgeSafeVersion = VERSION;
  geometry.userData.maxInward = maxInward;
  geometry.userData.yAdjustedVertices = yAdjustedVertices;
  return geometry;
}

function addMissingNumber(slot, side, name) {
  const authorityGroup = scene.getObjectByName("football-nameset-authority");
  if (!authorityGroup || authorityGroup.getObjectByName(name)) return false;
  if (slot === "frontNumber" && !state.personalization.frontNumberEnabled) return false;

  const cfg = layoutFor(slot);
  const geometry = buildNumberGeometry(side, cfg);
  if (!geometry) return false;
  const texture = numberTexture();
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.015,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -9,
    roughness: 0.80,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.renderOrder = 23;
  mesh.userData.namesetAuthority = window.__footballNamesetAuthority?.version || "unknown";
  mesh.userData.edgeSafeVersion = VERSION;
  mesh.userData.kind = "number";
  mesh.userData.slot = slot;
  authorityGroup.add(mesh);
  status.maxInward = Math.max(status.maxInward, Number(geometry.userData.maxInward) || 0);
  if (slot === "backNumber") status.backNumberRepairs += 1;
  else status.frontNumberRepairs += 1;
  return true;
}

function refreshAuthorityStatus() {
  try {
    api.payload?.();
  } catch (error) {
    console.error("nameset edge-safe status refresh failed", error);
  }
}

function repair(reason = "manual") {
  if (!scene || !shirt || !state || window.__footballNamesetAuthority?.mode !== "authority") return;
  const back = addMissingNumber("backNumber", "back", "football-nameset-back-number");
  const front = addMissingNumber("frontNumber", "front", "football-nameset-front-number");
  if (back || front) {
    status.repairs += 1;
    status.lastReason = reason;
    scene.updateMatrixWorld(true);
    refreshAuthorityStatus();
    publish();
  }
}

function scheduleRepair(reason, delay = 150) {
  clearTimeout(repairTimer);
  repairTimer = setTimeout(() => repair(reason), delay);
}

async function waitReady() {
  for (let i = 0; i < 600; i++) {
    if (window.__footballNamesetReady === true && window.__footballRealismScene?.isScene && window.__sportswear3d?.state) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

publish();
if (!(await waitReady())) {
  window.__footballNamesetEdgeSafeError = "football nameset edge-safe bootstrap timeout";
  throw new Error(window.__footballNamesetEdgeSafeError);
}

api = window.__sportswear3d;
state = api.state;
scene = window.__footballRealismScene;
shirt = scene.getObjectByName("donor-shirt");
if (!shirt) throw new Error("football nameset edge-safe: donor shirt missing");

repair("bootstrap");
document.addEventListener("input", () => scheduleRepair("input", 180), true);
document.addEventListener("change", () => scheduleRepair("change", 220), true);
document.addEventListener("click", (event) => {
  if (event.target?.id === "official-nameset-reset" || event.target?.matches?.("[data-easy-advanced-toggle]")) {
    scheduleRepair("ui-mode", 260);
  }
}, true);
watchTimer = setInterval(() => repair("authority-watch"), 220);

window.__footballNamesetEdgeSafeReady = true;
publish({ lastReason: "ready" });
