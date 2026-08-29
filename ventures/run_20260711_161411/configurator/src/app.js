import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const ASSETS = Object.freeze({
  shirt: "./assets/vendor/football-shirt.glb",
  shorts: "./assets/vendor/football-shorts.glb",
  socks: "./assets/vendor/football-socks.glb"
});

const DONORS = Object.freeze({
  shirt: {
    repository: "pmndrs/examples",
    commit: "be95c387abb15d41d388bca4e2d1568690935a5c",
    blob: "9c7609eddfd597a70cb708f96bc19841766b3488",
    license: "MIT"
  },
  shortsAndSocks: {
    repository: "madjin/asset-pallet",
    commit: "7243319029382f5799f03162cc6bf10795f9951d",
    shortsBlob: "3222095f45778676f967c08bf1962af5306e111b",
    socksBlob: "44667afdfc03d73aad1b556899d41f4af8a6f2e3",
    license: "MIT"
  }
});

const MAX_GRAPHICS = 20;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const ALLOWED_FONT_EXT = /\.(ttf|otf|woff2?|woff)$/i;

const FONTS = Object.freeze({
  impact: { label: "Blocco", family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif", weight: 900 },
  geometric: { label: "Geometrico", family: "Futura, Avenir, 'Century Gothic', Arial, sans-serif", weight: 800 },
  condensed: { label: "Condensato", family: "'Arial Narrow', 'Helvetica Neue Condensed', Arial, sans-serif", weight: 900 },
  college: { label: "College", family: "Rockwell, 'Courier New', serif", weight: 900 },
  classic: { label: "Classico", family: "Georgia, 'Times New Roman', serif", weight: 800 },
  technical: { label: "Tecnico", family: "Menlo, Monaco, 'Courier New', monospace", weight: 800 },
  modern: { label: "Moderno", family: "Avenir Next, Avenir, Arial, sans-serif", weight: 800 },
  system: { label: "Pulito", family: "Inter, ui-sans-serif, system-ui, Arial, sans-serif", weight: 800 }
});

const SURFACES = Object.freeze([
  { id: "shirt-front", label: "Maglia fronte", part: "shirt", side: "front" },
  { id: "shirt-back", label: "Maglia retro", part: "shirt", side: "back" },
  { id: "left-sleeve", label: "Manica sinistra", part: "shirt", side: "left" },
  { id: "right-sleeve", label: "Manica destra", part: "shirt", side: "right" },
  { id: "shorts-left", label: "Pantaloncino sinistro", part: "shorts", side: "front-left" },
  { id: "shorts-right", label: "Pantaloncino destro", part: "shorts", side: "front-right" },
  { id: "socks-left", label: "Calza sinistra", part: "socks", side: "front-left" },
  { id: "socks-right", label: "Calza destra", part: "socks", side: "front-right" }
]);

const state = {
  colors: { shirt: "#9bbcf0", shorts: "#ffffff", socks: "#9bbcf0" },
  showSocks: false,
  patternPart: "shirt",
  patterns: {
    shirt: { present: false, texture: null, objectUrl: null, repeatX: 1, repeatY: 1, rotation: 0, offsetX: 0, offsetY: 0 },
    shorts: { present: false, texture: null, objectUrl: null, repeatX: 1, repeatY: 1, rotation: 0, offsetX: 0, offsetY: 0 },
    socks: { present: false, texture: null, objectUrl: null, repeatX: 1, repeatY: 1, rotation: 0, offsetX: 0, offsetY: 0 }
  },
  personalization: {
    name: "ROSSI",
    number: "10",
    font: "impact",
    customFontFamily: null,
    color: "#ffffff",
    frontNumberEnabled: false,
    backName: { x: 50, y: 23, scale: 36, rotation: 0 },
    backNumber: { x: 50, y: 55, scale: 44, rotation: 0 },
    frontNumber: { x: 50, y: 50, scale: 24, rotation: 0 }
  },
  graphics: []
};

const ids = [
  "scene-canvas", "viewer-shell", "loading-overlay", "loading-title", "loading-copy", "view-badge",
  "status-dot", "viewer-status", "shirt-color", "shorts-color", "socks-color", "show-socks",
  "pattern-part", "pattern-file", "pattern-repeat-x", "pattern-repeat-y", "pattern-rotation", "pattern-offset-x", "pattern-offset-y",
  "pattern-repeat-x-out", "pattern-repeat-y-out", "pattern-rotation-out", "pattern-offset-x-out", "pattern-offset-y-out", "clear-pattern", "pattern-message",
  "player-name", "player-number", "player-font", "print-color", "custom-font-file", "custom-font-status", "front-number-toggle", "front-number-card",
  "back-name-controls", "back-number-controls", "front-number-controls", "graphics-list", "graphics-count", "graphics-message",
  "add-logo", "add-sponsor", "add-patch", "add-badge", "summary", "payload", "copy-payload", "send-email", "output-message"
];
const dom = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));

let renderer;
let scene;
let camera;
let controls;
let modelGroup;
let decalGroup;
let ground;
let viewTween = null;
let ready = false;
let nextGraphicId = 1;
let copyResetTimer = null;
let customFontObjectUrl = null;

const roots = { shirt: null, shorts: null, socks: null };
const meshes = { shirt: [], shorts: [], socks: [] };
const bounds = { shirt: new THREE.Box3(), shorts: new THREE.Box3(), socks: new THREE.Box3() };
const materialRecords = { shirt: [], shorts: [], socks: [] };
const raycaster = new THREE.Raycaster();
const tmpSize = new THREE.Vector3();
const textureLoader = new THREE.TextureLoader();

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function radians(deg) { return THREE.MathUtils.degToRad(Number(deg) || 0); }
function cleanText(value, max) { return String(value ?? "").replace(/[\r\n\t]/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }
function safeColor(value, fallback = "#ffffff") { return /^#[0-9a-f]{6}$/i.test(String(value)) ? String(value).toLowerCase() : fallback; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function surfaceDef(id) { return SURFACES.find((s) => s.id === id) || SURFACES[0]; }

function setStatus(text, kind = "") {
  dom["viewer-status"].textContent = text;
  dom["status-dot"].className = kind;
}
function message(node, text = "", kind = "") {
  node.textContent = text;
  node.className = `message${kind ? ` ${kind}` : ""}`;
}
function fatal(title, copy, error) {
  console.error(title, error || copy);
  dom["loading-title"].textContent = title;
  dom["loading-copy"].textContent = copy;
  dom["loading-overlay"].hidden = false;
  setStatus(title, "error");
  window.__sportswear3dError = String(error?.stack || error || copy);
}

function initScene() {
  renderer = new THREE.WebGLRenderer({ canvas: dom["scene-canvas"], antialias: true, alpha: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(dom["viewer-shell"].clientWidth, dom["viewer-shell"].clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d1014);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environment = env;
  pmrem.dispose();

  camera = new THREE.PerspectiveCamera(29, 1, 0.1, 100);
  camera.position.set(0, 0.25, 12.2);

  controls = new OrbitControls(camera, dom["scene-canvas"]);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.minDistance = 7.4;
  controls.maxDistance = 18;
  controls.minPolarAngle = 0.22;
  controls.maxPolarAngle = Math.PI - 0.22;
  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = Infinity;
  controls.target.set(0, 0.25, 0);

  modelGroup = new THREE.Group();
  modelGroup.name = "football-kit";
  scene.add(modelGroup);
  decalGroup = new THREE.Group();
  decalGroup.name = "customization-decals";
  scene.add(decalGroup);

  scene.add(new THREE.HemisphereLight(0xe8f0ff, 0x232933, 1.35));
  const key = new THREE.DirectionalLight(0xffffff, 3.1);
  key.position.set(4.5, 7.5, 7.5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xa9c3ff, 1.75);
  fill.position.set(-6, 3.2, 4);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xd8e6ff, 2.0);
  rim.position.set(2.5, 4.5, -7);
  scene.add(rim);

  ground = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.30 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.72;
  ground.receiveShadow = true;
  scene.add(ground);

  new ResizeObserver(resizeRenderer).observe(dom["viewer-shell"]);
}

function resizeRenderer() {
  if (!renderer || !camera) return;
  const w = Math.max(1, dom["viewer-shell"].clientWidth);
  const h = Math.max(1, dom["viewer-shell"].clientHeight);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function firstMeshes(root) {
  const list = [];
  root.traverse((obj) => { if (obj.isMesh) list.push(obj); });
  return list;
}

function configureMesh(part, mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = true;
  const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const materials = source.map((original) => {
    const material = original?.clone?.() || new THREE.MeshStandardMaterial();
    if (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) {
      const replacement = new THREE.MeshStandardMaterial();
      replacement.normalMap = material.normalMap || null;
      replacement.aoMap = material.aoMap || null;
      replacement.roughnessMap = material.roughnessMap || null;
      material.dispose?.();
      return replacement;
    }
    return material;
  });
  materials.forEach((material) => {
    material.name = `sportswear-${part}`;
    material.map = null;
    material.color.set(state.colors[part]);
    material.metalness = 0;
    material.roughness = Math.max(0.72, Number(material.roughness ?? 0.86));
    material.envMapIntensity = 0.8;
    material.side = THREE.DoubleSide;
    material.transparent = false;
    material.opacity = 1;
    material.needsUpdate = true;
    materialRecords[part].push(material);
  });
  mesh.material = Array.isArray(mesh.material) ? materials : materials[0];
}

function applyAthleticFit(root) {
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

async function loadKit() {
  const loader = new GLTFLoader();
  const [shirtGltf, shortsGltf, socksGltf] = await Promise.all([
    loader.loadAsync(ASSETS.shirt),
    loader.loadAsync(ASSETS.shorts),
    loader.loadAsync(ASSETS.socks)
  ]);

  roots.shirt = shirtGltf.scene;
  roots.shorts = shortsGltf.scene;
  roots.socks = socksGltf.scene;
  roots.shirt.name = "donor-shirt";
  roots.shorts.name = "donor-shorts";
  roots.socks.name = "donor-socks";

  applyAthleticFit(roots.shirt);
  roots.shirt.scale.setScalar(7.0);
  roots.shirt.position.set(0, 1.50, 0);

  roots.shorts.scale.set(7.40, 3.20, 5.50);
  roots.shorts.position.set(0, -1.60, 0);

  roots.socks.scale.set(7.20, 4.20, 5.20);
  roots.socks.position.set(0, -4.20, 0);
  roots.socks.visible = state.showSocks;

  for (const part of ["shirt", "shorts", "socks"]) {
    meshes[part] = firstMeshes(roots[part]);
    if (!meshes[part].length) throw new Error(`Nessuna mesh trovata per ${part}`);
    meshes[part].forEach((mesh) => configureMesh(part, mesh));
    modelGroup.add(roots[part]);
  }

  scene.updateMatrixWorld(true);
  refreshBounds();
  applyAllMaterials();
  rebuildDecals();
}

function refreshBounds() {
  scene.updateMatrixWorld(true);
  for (const part of ["shirt", "shorts", "socks"]) bounds[part].setFromObject(roots[part]);
  if (ground) ground.position.y = state.showSocks ? bounds.socks.min.y - 0.06 : bounds.shorts.min.y - 0.06;
}

function applyPartMaterial(part) {
  const pattern = state.patterns[part];
  for (const material of materialRecords[part]) {
    material.map = pattern.present ? pattern.texture : null;
    material.color.set(pattern.present ? 0xffffff : state.colors[part]);
    material.needsUpdate = true;
  }
  if (pattern.present && pattern.texture) updatePatternTexture(part);
}
function applyAllMaterials() { ["shirt", "shorts", "socks"].forEach(applyPartMaterial); }

function updatePatternTexture(part) {
  const p = state.patterns[part];
  if (!p.texture) return;
  p.texture.wrapS = THREE.RepeatWrapping;
  p.texture.wrapT = THREE.RepeatWrapping;
  p.texture.colorSpace = THREE.SRGBColorSpace;
  p.texture.center.set(0.5, 0.5);
  p.texture.repeat.set(p.repeatX, p.repeatY);
  p.texture.rotation = radians(p.rotation);
  p.texture.offset.set(p.offsetX, p.offsetY);
  p.texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  p.texture.needsUpdate = true;
}

function disposePattern(part) {
  const p = state.patterns[part];
  p.texture?.dispose?.();
  if (p.objectUrl) URL.revokeObjectURL(p.objectUrl);
  p.texture = null;
  p.objectUrl = null;
  p.present = false;
  applyPartMaterial(part);
}

async function loadPatternFile(file) {
  if (!file) return;
  if (!ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_BYTES) {
    message(dom["pattern-message"], "Usa PNG/JPG/WebP fino a 8 MB.", "error");
    dom["pattern-file"].value = "";
    return;
  }
  const part = state.patternPart;
  disposePattern(part);
  const objectUrl = URL.createObjectURL(file);
  try {
    const texture = await textureLoader.loadAsync(objectUrl);
    const p = state.patterns[part];
    p.texture = texture;
    p.objectUrl = objectUrl;
    p.present = true;
    updatePatternTexture(part);
    applyPartMaterial(part);
    message(dom["pattern-message"], `Fantasia applicata a ${part === "shirt" ? "maglia" : part === "shorts" ? "pantaloncini" : "calze"}.`, "ok");
    updateOutput();
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    message(dom["pattern-message"], "Immagine non leggibile.", "error");
    console.error(error);
  }
}

function syncPatternControls() {
  const p = state.patterns[state.patternPart];
  const values = {
    "pattern-repeat-x": p.repeatX,
    "pattern-repeat-y": p.repeatY,
    "pattern-rotation": p.rotation,
    "pattern-offset-x": p.offsetX,
    "pattern-offset-y": p.offsetY
  };
  for (const [id, value] of Object.entries(values)) dom[id].value = String(value);
  updatePatternOutputs();
}
function updatePatternOutputs() {
  dom["pattern-repeat-x-out"].textContent = Number(dom["pattern-repeat-x"].value).toFixed(1);
  dom["pattern-repeat-y-out"].textContent = Number(dom["pattern-repeat-y"].value).toFixed(1);
  dom["pattern-rotation-out"].textContent = `${Math.round(Number(dom["pattern-rotation"].value))}°`;
  dom["pattern-offset-x-out"].textContent = Number(dom["pattern-offset-x"].value).toFixed(2);
  dom["pattern-offset-y-out"].textContent = Number(dom["pattern-offset-y"].value).toFixed(2);
}
function readPatternControls() {
  const p = state.patterns[state.patternPart];
  p.repeatX = Number(dom["pattern-repeat-x"].value);
  p.repeatY = Number(dom["pattern-repeat-y"].value);
  p.rotation = Number(dom["pattern-rotation"].value);
  p.offsetX = Number(dom["pattern-offset-x"].value);
  p.offsetY = Number(dom["pattern-offset-y"].value);
  updatePatternOutputs();
  updatePatternTexture(state.patternPart);
  updateOutput();
}

function worldNormal(intersection) {
  const normal = intersection.face?.normal?.clone() || new THREE.Vector3(0, 0, 1);
  return normal.transformDirection(intersection.object.matrixWorld).normalize();
}

function rayHit(meshList, origin, direction) {
  raycaster.set(origin, direction);
  const hits = raycaster.intersectObjects(meshList, false);
  if (!hits.length) return null;
  const hit = hits[0];
  return { point: hit.point.clone(), normal: worldNormal(hit), mesh: hit.object };
}

function surfaceRay(surfaceId, xPct, yPct) {
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
        uvs.push(surfaceDef(surfaceId).side === "back" ? 1 - col / cols : col / cols, 1 - row / rows);
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

function currentFont() {
  if (state.personalization.font === "custom" && state.personalization.customFontFamily) {
    return { label: "Personale", family: `'${state.personalization.customFontFamily}'`, weight: 800 };
  }
  return FONTS[state.personalization.font] || FONTS.impact;
}

function textTexture(text, kind) {
  const clean = cleanText(text, kind === "name" ? 24 : 6) || (kind === "name" ? "ROSSI" : "10");
  const canvas = document.createElement("canvas");
  canvas.width = kind === "name" ? 1400 : 900;
  canvas.height = kind === "name" ? 420 : 900;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const font = currentFont();
  let px = kind === "name" ? 250 : 720;
  ctx.font = `${font.weight} ${px}px ${font.family}`;
  while (ctx.measureText(clean).width > canvas.width * 0.90 && px > 70) {
    px -= 8;
    ctx.font = `${font.weight} ${px}px ${font.family}`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(0,0,0,.30)";
  ctx.lineWidth = Math.max(2, px * 0.014);
  ctx.strokeText(clean, canvas.width / 2, canvas.height / 2 + px * 0.02);
  ctx.fillStyle = state.personalization.color;
  ctx.fillText(clean, canvas.width / 2, canvas.height / 2 + px * 0.02);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;
  texture.userData.canvasAspect = canvas.width / canvas.height;
  return texture;
}

function disposeDecals() {
  for (const child of [...decalGroup.children]) {
    decalGroup.remove(child);
    child.geometry?.dispose?.();
    child.material?.map?.userData?.generatedText && child.material.map.dispose?.();
    child.material?.dispose?.();
  }
}

function addTextDecal(surface, config, text, kind) {
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

function sliderMarkup(label, key, value, min, max, step, suffix = "") {
  const safe = escapeHtml(key);
  return `<label>${escapeHtml(label)} <output data-out="${safe}">${Number(value).toFixed(step < 1 ? 1 : 0)}${suffix}</output><input data-key="${safe}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
}

function renderTextControls(container, config, onChange) {
  container.innerHTML = [
    sliderMarkup("X", "x", config.x, 15, 85, 1, "%"),
    sliderMarkup("Y", "y", config.y, 8, 88, 1, "%"),
    sliderMarkup("Scala", "scale", config.scale, 10, 70, 1, "%"),
    sliderMarkup("Rotaz.", "rotation", config.rotation, -25, 25, 1, "°")
  ].join("");
  container.querySelectorAll("input[data-key]").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.key;
      config[key] = Number(input.value);
      const out = container.querySelector(`[data-out="${key}"]`);
      out.textContent = `${Number(input.value).toFixed(Number(input.step) < 1 ? 1 : 0)}${key === "rotation" ? "°" : "%"}`;
      onChange();
    });
  });
}

function populateFonts() {
  dom["player-font"].innerHTML = Object.entries(FONTS).map(([id, f]) => `<option value="${id}">${escapeHtml(f.label)}</option>`).join("");
  dom["player-font"].value = state.personalization.font;
}

async function loadCustomFont(file) {
  if (!file) return;
  if (!ALLOWED_FONT_EXT.test(file.name) || file.size > 8 * 1024 * 1024) {
    dom["custom-font-status"].textContent = "Formato non valido: TTF/OTF/WOFF/WOFF2 max 8 MB";
    return;
  }
  if (customFontObjectUrl) URL.revokeObjectURL(customFontObjectUrl);
  customFontObjectUrl = URL.createObjectURL(file);
  const family = `SportswearCustom_${Date.now()}`;
  try {
    const face = new FontFace(family, `url(${customFontObjectUrl})`);
    await face.load();
    document.fonts.add(face);
    state.personalization.customFontFamily = family;
    if (!dom["player-font"].querySelector('option[value="custom"]')) {
      const opt = document.createElement("option");
      opt.value = "custom";
      opt.textContent = "Personale";
      dom["player-font"].append(opt);
    }
    state.personalization.font = "custom";
    dom["player-font"].value = "custom";
    dom["custom-font-status"].textContent = "Font personale caricato ✓";
    rebuildDecals();
    updateOutput();
  } catch (error) {
    console.error(error);
    dom["custom-font-status"].textContent = "Font non leggibile";
  }
}

function defaultGraphic(type) {
  const defaults = {
    logo: { surface: "shirt-front", x: 38, y: 32, scale: 14 },
    sponsor: { surface: "shirt-front", x: 50, y: 52, scale: 30 },
    patch: { surface: "right-sleeve", x: 50, y: 42, scale: 18 },
    badge: { surface: "shorts-right", x: 50, y: 35, scale: 18 }
  }[type] || { surface: "shirt-front", x: 50, y: 50, scale: 20 };
  return {
    id: nextGraphicId++, type, ...defaults, rotation: 0, opacity: 1,
    texture: null, objectUrl: null, aspect: 1, imagePresent: false
  };
}

function addGraphic(type) {
  if (state.graphics.length >= MAX_GRAPHICS) {
    message(dom["graphics-message"], `Massimo ${MAX_GRAPHICS} elementi.`, "error");
    return;
  }
  state.graphics.push(defaultGraphic(type));
  renderGraphics();
  updateOutput();
}
function removeGraphic(id) {
  const index = state.graphics.findIndex((g) => g.id === id);
  if (index < 0) return;
  const [graphic] = state.graphics.splice(index, 1);
  graphic.texture?.dispose?.();
  if (graphic.objectUrl) URL.revokeObjectURL(graphic.objectUrl);
  renderGraphics();
  rebuildDecals();
  updateOutput();
}

function graphicCard(graphic) {
  const surfaces = SURFACES.map((s) => `<option value="${s.id}"${s.id === graphic.surface ? " selected" : ""}>${escapeHtml(s.label)}</option>`).join("");
  return `<div class="graphic-card" data-graphic="${graphic.id}">
    <div class="graphic-head"><strong>${escapeHtml(graphic.type)}</strong><button type="button" data-remove="${graphic.id}">Rimuovi</button></div>
    <div class="graphic-grid">
      <label>Superficie<select data-field="surface">${surfaces}</select></label>
      <label>Immagine<input data-field="file" type="file" accept="image/png,image/jpeg,image/webp"></label>
    </div>
    <div class="graphic-preview" data-preview>${graphic.objectUrl ? `<img src="${graphic.objectUrl}" alt="">` : "Nessuna immagine"}</div>
    <div class="sliders">
      ${sliderMarkup("X", "x", graphic.x, 5, 95, 1, "%")}
      ${sliderMarkup("Y", "y", graphic.y, 5, 95, 1, "%")}
      ${sliderMarkup("Scala", "scale", graphic.scale, 4, 70, 1, "%")}
      ${sliderMarkup("Rotaz.", "rotation", graphic.rotation, -180, 180, 1, "°")}
      ${sliderMarkup("Opacità", "opacity", graphic.opacity, 0.1, 1, 0.05, "")}
    </div>
  </div>`;
}

function renderGraphics() {
  dom["graphics-count"].textContent = `${state.graphics.length} / ${MAX_GRAPHICS}`;
  dom["graphics-list"].innerHTML = state.graphics.map(graphicCard).join("");
  dom["graphics-list"].querySelectorAll("[data-graphic]").forEach((card) => {
    const graphic = state.graphics.find((g) => g.id === Number(card.dataset.graphic));
    card.querySelector("[data-remove]").addEventListener("click", () => removeGraphic(graphic.id));
    card.querySelector('[data-field="surface"]').addEventListener("change", (event) => {
      graphic.surface = event.target.value;
      rebuildDecals(); updateOutput();
    });
    card.querySelector('[data-field="file"]').addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_BYTES) {
        message(dom["graphics-message"], "Usa PNG/JPG/WebP fino a 8 MB.", "error");
        event.target.value = "";
        return;
      }
      graphic.texture?.dispose?.();
      if (graphic.objectUrl) URL.revokeObjectURL(graphic.objectUrl);
      const objectUrl = URL.createObjectURL(file);
      try {
        const texture = await textureLoader.loadAsync(objectUrl);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        const image = texture.image;
        graphic.aspect = image?.width && image?.height ? image.width / image.height : 1;
        graphic.texture = texture;
        graphic.objectUrl = objectUrl;
        graphic.imagePresent = true;
        card.querySelector("[data-preview]").innerHTML = `<img src="${objectUrl}" alt="">`;
        message(dom["graphics-message"], `${graphic.type} caricato.`, "ok");
        rebuildDecals(); updateOutput();
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        console.error(error);
        message(dom["graphics-message"], "Immagine non leggibile.", "error");
      }
    });
    card.querySelectorAll("input[data-key]").forEach((input) => {
      input.addEventListener("input", () => {
        const key = input.dataset.key;
        graphic[key] = Number(input.value);
        const out = card.querySelector(`[data-out="${key}"]`);
        const suffix = key === "rotation" ? "°" : ["x", "y", "scale"].includes(key) ? "%" : "";
        out.textContent = `${Number(input.value).toFixed(Number(input.step) < 1 ? 2 : 0)}${suffix}`;
        rebuildDecals(); updateOutput();
      });
    });
  });
}

function safePatternPayload(p) {
  return { present: p.present, repeat_x: p.repeatX, repeat_y: p.repeatY, rotation: p.rotation, offset_x: p.offsetX, offset_y: p.offsetY };
}
function payloadObject() {
  return {
    v: 3,
    sport: "football",
    model_source: "verified-mit-garment-assets",
    colors: { ...state.colors },
    show_socks: state.showSocks,
    patterns: {
      shirt: safePatternPayload(state.patterns.shirt),
      shorts: safePatternPayload(state.patterns.shorts),
      socks: safePatternPayload(state.patterns.socks)
    },
    personalization: {
      name: state.personalization.name,
      number: state.personalization.number,
      font: state.personalization.font === "custom" ? "custom" : state.personalization.font,
      custom_font_present: state.personalization.font === "custom" && Boolean(state.personalization.customFontFamily),
      color: state.personalization.color,
      front_number_enabled: state.personalization.frontNumberEnabled,
      back_name: { ...state.personalization.backName },
      back_number: { ...state.personalization.backNumber },
      front_number: { ...state.personalization.frontNumber }
    },
    graphics: state.graphics.map((g) => ({
      type: g.type, surface: g.surface, x: g.x, y: g.y, scale: g.scale,
      rotation: g.rotation, opacity: g.opacity, image_present: g.imagePresent
    }))
  };
}

function updateOutput() {
  const payload = payloadObject();
  window.__payload3d = payload;
  dom["payload"].value = JSON.stringify(payload, null, 2);
  const patternCount = Object.values(payload.patterns).filter((p) => p.present).length;
  const graphicsWithImage = payload.graphics.filter((g) => g.image_present).length;
  dom["summary"].innerHTML = [
    ["Maglia", state.colors.shirt],
    ["Pantaloncini", state.colors.shorts],
    ["Nome / numero", `${state.personalization.name || "—"} · ${state.personalization.number || "—"}`],
    ["Font", currentFont().label],
    ["Fantasie caricate", String(patternCount)],
    ["Loghi / patch con immagine", String(graphicsWithImage)]
  ].map(([a, b]) => `<div class="summary-row"><span>${escapeHtml(a)}</span><span>${escapeHtml(b)}</span></div>`).join("");
}

async function copyPayload() {
  const text = dom["payload"].value;
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else throw new Error("Clipboard API unavailable");
  } catch (_) {
    dom["payload"].focus(); dom["payload"].select();
    document.execCommand("copy");
  }
  dom["copy-payload"].textContent = "Copiato ✓";
  clearTimeout(copyResetTimer);
  copyResetTimer = setTimeout(() => { dom["copy-payload"].textContent = "Copia codice"; }, 2000);
  message(dom["output-message"], "Configurazione copiata.", "ok");
}

function sendEmail() {
  const subject = encodeURIComponent("Preventivo kit sportivo — [ATTIVITA]");
  const body = encodeURIComponent(`Buongiorno [ATTIVITA],\n\nvorrei un preventivo per questa configurazione:\n\n${dom["payload"].value}\n\nRecapito: [TEL]`);
  location.href = `mailto:[EMAIL_ATTIVITA]?subject=${subject}&body=${body}`;
}

function setView(name, immediate = false) {
  const target = controls.target.clone();
  const distance = camera.position.distanceTo(target);
  const positions = {
    front: new THREE.Vector3(0, target.y, distance),
    back: new THREE.Vector3(0, target.y, -distance),
    left: new THREE.Vector3(-distance, target.y, 0),
    right: new THREE.Vector3(distance, target.y, 0)
  };
  const end = positions[name] || positions.front;
  dom["view-badge"].textContent = name === "front" ? "Fronte" : name === "back" ? "Retro" : name === "left" ? "Sinistra" : "Destra";
  document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === name));
  if (immediate) {
    camera.position.copy(end); controls.update(); viewTween = null; return;
  }
  viewTween = { start: camera.position.clone(), end, started: performance.now(), duration: 520 };
}

function updateViewTween(now) {
  if (!viewTween) return;
  const t = clamp((now - viewTween.started) / viewTween.duration, 0, 1);
  const e = 1 - Math.pow(1 - t, 3);
  camera.position.lerpVectors(viewTween.start, viewTween.end, e);
  if (t >= 1) viewTween = null;
}

function bindUi() {
  dom["shirt-color"].addEventListener("input", (e) => { state.colors.shirt = safeColor(e.target.value, state.colors.shirt); if (!state.patterns.shirt.present) applyPartMaterial("shirt"); updateOutput(); });
  dom["shorts-color"].addEventListener("input", (e) => { state.colors.shorts = safeColor(e.target.value, state.colors.shorts); if (!state.patterns.shorts.present) applyPartMaterial("shorts"); updateOutput(); });
  dom["socks-color"].addEventListener("input", (e) => { state.colors.socks = safeColor(e.target.value, state.colors.socks); if (!state.patterns.socks.present) applyPartMaterial("socks"); updateOutput(); });
  dom["show-socks"].addEventListener("change", (e) => { state.showSocks = e.target.checked; if (roots.socks) roots.socks.visible = state.showSocks; refreshBounds(); rebuildDecals(); updateOutput(); });

  dom["pattern-part"].addEventListener("change", (e) => { state.patternPart = e.target.value; syncPatternControls(); message(dom["pattern-message"]); });
  dom["pattern-file"].addEventListener("change", (e) => loadPatternFile(e.target.files?.[0]));
  ["pattern-repeat-x", "pattern-repeat-y", "pattern-rotation", "pattern-offset-x", "pattern-offset-y"].forEach((id) => dom[id].addEventListener("input", readPatternControls));
  dom["clear-pattern"].addEventListener("click", () => { disposePattern(state.patternPart); dom["pattern-file"].value = ""; message(dom["pattern-message"], "Fantasia rimossa.", "ok"); updateOutput(); });

  dom["player-name"].addEventListener("input", (e) => { state.personalization.name = cleanText(e.target.value, 24); rebuildDecals(); updateOutput(); });
  dom["player-number"].addEventListener("input", (e) => { state.personalization.number = cleanText(e.target.value, 6); rebuildDecals(); updateOutput(); });
  dom["player-font"].addEventListener("change", (e) => { state.personalization.font = e.target.value; rebuildDecals(); updateOutput(); });
  dom["print-color"].addEventListener("input", (e) => { state.personalization.color = safeColor(e.target.value); rebuildDecals(); updateOutput(); });
  dom["custom-font-file"].addEventListener("change", (e) => loadCustomFont(e.target.files?.[0]));
  dom["front-number-toggle"].addEventListener("change", (e) => { state.personalization.frontNumberEnabled = e.target.checked; dom["front-number-card"].hidden = !e.target.checked; rebuildDecals(); updateOutput(); });

  renderTextControls(dom["back-name-controls"], state.personalization.backName, () => { rebuildDecals(); updateOutput(); });
  renderTextControls(dom["back-number-controls"], state.personalization.backNumber, () => { rebuildDecals(); updateOutput(); });
  renderTextControls(dom["front-number-controls"], state.personalization.frontNumber, () => { rebuildDecals(); updateOutput(); });

  dom["add-logo"].addEventListener("click", () => addGraphic("logo"));
  dom["add-sponsor"].addEventListener("click", () => addGraphic("sponsor"));
  dom["add-patch"].addEventListener("click", () => addGraphic("patch"));
  dom["add-badge"].addEventListener("click", () => addGraphic("badge"));
  dom["copy-payload"].addEventListener("click", copyPayload);
  dom["send-email"].addEventListener("click", sendEmail);
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
}

function diagnostics() {
  const box = (part) => ({ min: bounds[part].min.toArray(), max: bounds[part].max.toArray(), size: bounds[part].getSize(new THREE.Vector3()).toArray() });
  return {
    ready,
    three_revision: THREE.REVISION,
    webgl2: renderer?.capabilities?.isWebGL2 ?? false,
    donor_assets: DONORS,
    meshes: { shirt: meshes.shirt.length, shorts: meshes.shorts.length, socks: meshes.socks.length },
    bounds: { shirt: box("shirt"), shorts: box("shorts"), socks: box("socks") },
    decals: decalGroup?.children?.length ?? 0,
    show_socks: state.showSocks,
    payload: payloadObject()
  };
}

function animate(now) {
  requestAnimationFrame(animate);
  updateViewTween(now);
  controls.update();
  renderer.render(scene, camera);
}

async function boot() {
  try {
    initScene();
    requestAnimationFrame(animate);
    populateFonts();
    renderGraphics();
    syncPatternControls();
    bindUi();
    updateOutput();
    setStatus("Caricamento mesh reali");
    await loadKit();
    ready = true;
    refreshBounds();
    rebuildDecals();
    dom["loading-overlay"].hidden = true;
    setStatus("Divisa 3D pronta — mesh reali", "ok");
    setView("front", true);
    updateOutput();
    window.__sportswear3d.ready = true;
    window.__sportswear3d.diagnostics = diagnostics;
  } catch (error) {
    fatal("Caricamento 3D fallito", "La divisa non può essere mostrata. Controlla la console.", error);
  }
}

window.__sportswear3d = {
  ready: false,
  donors: DONORS,
  state,
  setView,
  rebuildDecals,
  payload: payloadObject,
  diagnostics,
  version: "football-real-garment-v4-conformal"
};

window.addEventListener("beforeunload", () => {
  for (const p of Object.values(state.patterns)) { p.texture?.dispose?.(); if (p.objectUrl) URL.revokeObjectURL(p.objectUrl); }
  for (const g of state.graphics) { g.texture?.dispose?.(); if (g.objectUrl) URL.revokeObjectURL(g.objectUrl); }
  if (customFontObjectUrl) URL.revokeObjectURL(customFontObjectUrl);
});

boot();
