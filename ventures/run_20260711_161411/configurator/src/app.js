import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";

const MODEL_URL = "./assets/kit.glb";
const MAX_GRAPHICS = 12;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const DESIGNS = [
  ["solid", "Tinta unita", 0],
  ["vertical-stripes", "Righe verticali", 1],
  ["horizontal-stripes", "Righe orizzontali", 2],
  ["horizontal-band", "Fascia orizzontale", 3],
  ["diagonal-band", "Banda diagonale", 4],
  ["half-split", "Metà campo", 5],
  ["chevron", "Chevron", 6],
  ["side-panels", "Pannelli laterali", 7],
  ["contrast-shoulders", "Spalle a contrasto", 8],
  ["center-band", "Banda centrale", 9],
  ["quarters", "Quarti", 10],
  ["pinstripes", "Gessato", 11]
].map(([id, name, code]) => ({ id, name, code }));

const PARTS = [
  { id: "body", label: "Corpo maglia" },
  { id: "sleeves", label: "Maniche" },
  { id: "collar", label: "Colletto" },
  { id: "shorts", label: "Pantaloncini" },
  { id: "socks", label: "Calze" }
];

const SURFACES = [
  { id: "shirt-front", label: "Maglia fronte", part: "body", face: "front", u: [0.14, 0.86], v: [0.13, 0.82] },
  { id: "shirt-back", label: "Maglia retro", part: "body", face: "back", u: [0.14, 0.86], v: [0.13, 0.82] },
  { id: "left-sleeve", label: "Manica sinistra", part: "sleeves", face: "left", u: [0.16, 0.84], v: [0.12, 0.72] },
  { id: "right-sleeve", label: "Manica destra", part: "sleeves", face: "right", u: [0.16, 0.84], v: [0.12, 0.72] },
  { id: "shorts-left", label: "Pantaloncino sinistro", part: "shorts", face: "front-left", u: [0.12, 0.88], v: [0.12, 0.86] },
  { id: "shorts-right", label: "Pantaloncino destro", part: "shorts", face: "front-right", u: [0.12, 0.88], v: [0.12, 0.86] },
  { id: "socks-left", label: "Calza sinistra", part: "socks", face: "front-left", u: [0.16, 0.84], v: [0.10, 0.90] },
  { id: "socks-right", label: "Calza destra", part: "socks", face: "front-right", u: [0.16, 0.84], v: [0.10, 0.90] }
];

const FONTS = {
  impact: { label: "Blocco", family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif", weight: 900 },
  futura: { label: "Geometrico", family: "Futura, Avenir, 'Century Gothic', Arial, sans-serif", weight: 800 },
  copperplate: { label: "Inciso", family: "Copperplate, 'Copperplate Gothic Light', Georgia, serif", weight: 700 },
  menlo: { label: "Tecnico", family: "Menlo, Monaco, 'Courier New', monospace", weight: 800 },
  georgia: { label: "Classico", family: "Georgia, 'Times New Roman', serif", weight: 800 },
  condensed: { label: "Condensato", family: "'Arial Narrow', 'Helvetica Neue Condensed', Arial, sans-serif", weight: 900 },
  varsity: { label: "College", family: "Rockwell, 'Courier New', serif", weight: 900 },
  modern: { label: "Moderno", family: "Avenir Next, Avenir, Arial, sans-serif", weight: 800 }
};

const state = {
  sport: "football",
  design: "solid",
  colors: {
    body: { primary: "#1e5bd6", secondary: "#ffffff" },
    sleeves: { primary: "#1e5bd6", secondary: "#ffffff" },
    collar: { primary: "#ffffff", secondary: "#1e5bd6" },
    shorts: { primary: "#ffffff", secondary: "#1e5bd6" },
    socks: { primary: "#1e5bd6", secondary: "#ffffff" }
  },
  personalization: {
    name: "ROSSI",
    number: "10",
    font: "impact",
    color: "#ffffff",
    frontNumberEnabled: false,
    backName: { surface: "shirt-back", x: 50, y: 25, scale: 35, rotation: 0 },
    backNumber: { surface: "shirt-back", x: 50, y: 51, scale: 46, rotation: 0 },
    frontNumber: { surface: "shirt-front", x: 50, y: 50, scale: 22, rotation: 0 }
  },
  graphics: []
};

const dom = Object.fromEntries([
  "scene-canvas", "viewer-shell", "loading-overlay", "loading-title", "loading-copy", "view-badge",
  "status-dot", "viewer-status", "design-gallery", "part-colors", "player-name", "player-number",
  "player-font", "print-color", "front-number-toggle", "front-number-card", "back-name-controls",
  "back-number-controls", "front-number-controls", "graphics-list", "graphics-count", "graphics-message",
  "add-sponsor", "add-patch", "add-badge", "summary", "payload", "copy-payload", "send-email", "output-message"
].map((id) => [id, document.getElementById(id)]));

let renderer;
let scene;
let camera;
let controls;
let kitRoot;
let decalGroup;
let viewTween = null;
let nextGraphicId = 1;
let modelReady = false;
let copyResetTimer = null;

const partBoundsRoot = Object.fromEntries(PARTS.map((p) => [p.id, new THREE.Box3()]));
const partMaterials = Object.fromEntries(PARTS.map((p) => [p.id, []]));
const partTargets = Object.fromEntries(PARTS.map((p) => [p.id, []]));
const meshReport = [];

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function designCode() { return DESIGNS.find((d) => d.id === state.design)?.code ?? 0; }
function normalizedName(value) {
  return String(value || "")
    .toLocaleUpperCase("it-IT")
    .replace(/[^A-ZÀ-ÖØ-Ý0-9' -]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 18);
}
function normalizedNumber(value) { return String(value || "").replace(/\D/g, "").slice(0, 2); }
function safeColor(value, fallback = "#ffffff") {
  return /^#[0-9a-f]{6}$/i.test(String(value)) ? String(value).toLowerCase() : fallback;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function setStatus(text, kind = "") {
  dom["viewer-status"].textContent = text;
  dom["status-dot"].className = kind;
}
function fatal(title, copy) {
  dom["loading-title"].textContent = title;
  dom["loading-copy"].textContent = copy;
  dom["loading-overlay"].hidden = false;
  setStatus(title, "error");
}
function surfaceDef(id) { return SURFACES.find((surface) => surface.id === id) || SURFACES[0]; }

function classifyPart(materialName = "", meshName = "", materialIndex = 0) {
  const text = `${materialName} ${meshName}`.toLowerCase();
  if (/sleeve|manic/.test(text)) return "sleeves";
  if (/collar|neck|collett/.test(text)) return "collar";
  if (/short|pantal/.test(text)) return "shorts";
  if (/sock|calz/.test(text)) return "socks";
  if (/body|torso|jersey|shirt|maglia/.test(text)) return "body";
  return ["body", "sleeves", "collar", "shorts", "socks"][clamp(materialIndex, 0, 4)] || "body";
}

function expandGroupBounds(box, geometry, group, objectToRoot) {
  const position = geometry.attributes.position;
  const index = geometry.index;
  const start = group?.start ?? 0;
  const count = group?.count ?? (index ? index.count : position.count);
  const point = new THREE.Vector3();
  for (let cursor = start; cursor < start + count; cursor += 1) {
    const vertexIndex = index ? index.getX(cursor) : cursor;
    point.fromBufferAttribute(position, vertexIndex).applyMatrix4(objectToRoot);
    box.expandByPoint(point);
  }
}

function extractGroupGeometry(source, group) {
  const position = source.attributes.position;
  const normal = source.attributes.normal;
  const index = source.index;
  const start = group?.start ?? 0;
  const count = group?.count ?? (index ? index.count : position.count);
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let cursor = 0; cursor < count; cursor += 1) {
    const sourceCursor = start + cursor;
    const vertexIndex = index ? index.getX(sourceCursor) : sourceCursor;
    p.fromBufferAttribute(position, vertexIndex);
    if (normal) n.fromBufferAttribute(normal, vertexIndex);
    else n.set(0, 0, 1);
    positions[cursor * 3] = p.x;
    positions[cursor * 3 + 1] = p.y;
    positions[cursor * 3 + 2] = p.z;
    normals[cursor * 3] = n.x;
    normals[cursor * 3 + 1] = n.y;
    normals[cursor * 3 + 2] = n.z;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function registerDecalTarget(object, source, group, part, materialName, materialIndex) {
  const proxyGeometry = extractGroupGeometry(source, group);
  const proxy = new THREE.Mesh(proxyGeometry, new THREE.MeshBasicMaterial({ visible: false }));
  proxy.name = `decal-target:${part}:${object.name || "mesh"}:${materialIndex}`;
  proxy.matrixAutoUpdate = false;
  proxy.matrix.copy(object.matrix);
  proxy.matrixWorld.copy(object.matrixWorld);
  proxy.userData.part = part;
  proxy.userData.sourceMesh = object.name || "";
  proxy.userData.materialName = materialName || "";
  partTargets[part].push(proxy);
}

function designMaskGlsl() {
  return `
float sportswearDesignMask(vec2 q){
  float r=0.0;
  if(uSportswearDesign<0.5) r=0.0;
  else if(uSportswearDesign<1.5) r=step(0.5,fract(q.x*8.0));
  else if(uSportswearDesign<2.5) r=step(0.5,fract(q.y*8.0));
  else if(uSportswearDesign<3.5) r=1.0-step(0.11,abs(q.y-0.52));
  else if(uSportswearDesign<4.5){float d=q.y-(0.88-q.x*0.76);r=1.0-step(0.115,abs(d));}
  else if(uSportswearDesign<5.5) r=step(0.5,q.x);
  else if(uSportswearDesign<6.5){float c=0.43+abs(q.x-0.5)*0.66;r=1.0-step(0.095,abs(q.y-c));}
  else if(uSportswearDesign<7.5) r=max(1.0-step(0.18,q.x),step(0.82,q.x));
  else if(uSportswearDesign<8.5){float outer=step(0.23,abs(q.x-0.5));float upper=step(0.67,q.y);r=outer*upper;}
  else if(uSportswearDesign<9.5) r=1.0-step(0.13,abs(q.x-0.5));
  else if(uSportswearDesign<10.5){float cx=floor(q.x*2.0);float cy=floor(q.y*2.0);r=mod(cx+cy,2.0);}
  else r=1.0-step(0.09,fract(q.x*12.0));
  return clamp(r,0.0,1.0);
}`;
}

function makeGarmentMaterial(part, bounds, objectToRoot, original) {
  const material = original?.isMeshStandardMaterial ? original.clone() : new THREE.MeshStandardMaterial();
  material.name = `sportswear-${part}`;
  material.map = null;
  material.color = new THREE.Color(0xffffff);
  material.metalness = 0;
  material.roughness = Math.max(0.72, Number(material.roughness ?? 0.82));
  material.side = THREE.DoubleSide;
  material.transparent = false;
  material.opacity = 1;
  material.depthWrite = true;
  material.depthTest = true;
  const uniforms = {
    uSportswearPrimary: { value: new THREE.Color(state.colors[part].primary) },
    uSportswearSecondary: { value: new THREE.Color(state.colors[part].secondary) },
    uSportswearBoundsMin: { value: bounds.min.clone() },
    uSportswearBoundsSize: { value: bounds.getSize(new THREE.Vector3()) },
    uSportswearDesign: { value: designCode() },
    uSportswearObjectToRoot: { value: objectToRoot.clone() }
  };
  material.userData.sportswearUniforms = uniforms;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = `\nuniform mat4 uSportswearObjectToRoot;\nvarying vec3 vSportswearRootPosition;\n${shader.vertexShader}`.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>\nvSportswearRootPosition=(uSportswearObjectToRoot*vec4(transformed,1.0)).xyz;`
    );
    shader.fragmentShader = `\nuniform vec3 uSportswearPrimary;\nuniform vec3 uSportswearSecondary;\nuniform vec3 uSportswearBoundsMin;\nuniform vec3 uSportswearBoundsSize;\nuniform float uSportswearDesign;\nvarying vec3 vSportswearRootPosition;\n${designMaskGlsl()}\n${shader.fragmentShader}`.replace(
      "#include <color_fragment>",
      `#include <color_fragment>\nvec3 sportswearSize=max(uSportswearBoundsSize,vec3(0.0001));\nvec2 sportswearQ=clamp((vSportswearRootPosition.xy-uSportswearBoundsMin.xy)/sportswearSize.xy,0.0,1.0);\nfloat sportswearMix=sportswearDesignMask(sportswearQ);\ndiffuseColor.rgb=mix(uSportswearPrimary,uSportswearSecondary,sportswearMix);`
    );
  };
  material.customProgramCacheKey = () => "sportswear-pbr-v4";
  material.needsUpdate = true;
  partMaterials[part].push(material);
  return material;
}

function disposeTargets() {
  for (const part of PARTS) {
    for (const target of partTargets[part.id]) {
      target.geometry.dispose();
      target.material.dispose();
    }
    partTargets[part.id].length = 0;
  }
}

function applyGarmentMaterials(root) {
  disposeTargets();
  meshReport.length = 0;
  PARTS.forEach((part) => {
    partBoundsRoot[part.id].makeEmpty();
    partMaterials[part.id].length = 0;
  });
  root.updateMatrixWorld(true);
  const rootInverse = root.matrixWorld.clone().invert();
  const entries = [];
  root.traverse((object) => {
    if (!object.isMesh || !object.geometry?.attributes?.position) return;
    if (!object.geometry.attributes.normal) object.geometry.computeVertexNormals();
    const originals = Array.isArray(object.material) ? object.material : [object.material];
    const groups = object.geometry.groups.length
      ? object.geometry.groups
      : [{ start: 0, count: object.geometry.index ? object.geometry.index.count : object.geometry.attributes.position.count, materialIndex: 0 }];
    const objectToRoot = rootInverse.clone().multiply(object.matrixWorld);
    const reportEntry = { mesh: object.name || "(unnamed)", groups: [] };
    for (const group of groups) {
      const materialIndex = group.materialIndex || 0;
      const original = originals[materialIndex] || originals[0];
      const part = classifyPart(original?.name, object.name, materialIndex);
      expandGroupBounds(partBoundsRoot[part], object.geometry, group, objectToRoot);
      registerDecalTarget(object, object.geometry, group, part, original?.name || "", materialIndex);
      reportEntry.groups.push({ materialIndex, material: original?.name || "", part, triangleVertices: group.count });
    }
    meshReport.push(reportEntry);
    entries.push({ object, originals, objectToRoot });
  });
  if (!entries.length) throw new Error("Il GLB non contiene mesh renderizzabili.");
  const rootBounds = new THREE.Box3().setFromObject(root);
  const rootBoundsLocal = rootBounds.clone().applyMatrix4(root.matrixWorld.clone().invert());
  PARTS.forEach((part) => {
    if (partBoundsRoot[part.id].isEmpty()) partBoundsRoot[part.id].copy(rootBoundsLocal);
  });
  for (const { object, originals, objectToRoot } of entries) {
    const replacements = originals.map((original, materialIndex) => {
      const part = classifyPart(original?.name, object.name, materialIndex);
      return makeGarmentMaterial(part, partBoundsRoot[part], objectToRoot, original);
    });
    object.material = Array.isArray(object.material) ? replacements : replacements[0];
    object.castShadow = true;
    object.receiveShadow = true;
  }
}

function updateGarmentUniforms() {
  PARTS.forEach((part) => {
    for (const material of partMaterials[part.id]) {
      const uniforms = material.userData.sportswearUniforms;
      uniforms.uSportswearPrimary.value.set(state.colors[part.id].primary);
      uniforms.uSportswearSecondary.value.set(state.colors[part.id].secondary);
      uniforms.uSportswearDesign.value = designCode();
    }
  });
  renderDesignPreviews();
  updateOutput();
}

function initThree() {
  renderer = new THREE.WebGLRenderer({ canvas: dom["scene-canvas"], antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(34, 1, 0.05, 100);
  camera.position.set(0, 0.2, 9);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.minDistance = 4;
  controls.maxDistance = 14;
  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = Infinity;
  controls.maxPolarAngle = Math.PI * 0.86;
  controls.minPolarAngle = Math.PI * 0.14;
  controls.target.set(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xf0f5ff, 0x26313d, 2.0));
  const key = new THREE.DirectionalLight(0xffffff, 3.4); key.position.set(4.5, 6.5, 7.5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xa9c2ff, 1.45); fill.position.set(-5, 2.5, -4); scene.add(fill);
  const back = new THREE.DirectionalLight(0xffffff, 0.85); back.position.set(0, 2, -6); scene.add(back);
  decalGroup = new THREE.Group();
  decalGroup.name = "sportswear-decals";
  scene.add(decalGroup);
  resize();
  window.addEventListener("resize", resize);
  animate();
}

function normalizeKit(root) {
  root.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  if (!size.y) throw new Error("Modello GLB senza altezza valida.");
  root.scale.multiplyScalar(5.9 / size.y);
  root.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(root);
  root.position.sub(box.getCenter(new THREE.Vector3()));
  root.updateMatrixWorld(true);
  const finalSize = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
  const radius = finalSize.length() / 2;
  const distance = clamp(radius / Math.sin(THREE.MathUtils.degToRad(camera.fov) / 2) * 0.85, 7, 11);
  camera.position.set(0, 0.2, distance);
  controls.minDistance = distance * 0.65;
  controls.maxDistance = distance * 1.55;
  controls.target.set(0, 0, 0);
  controls.update();
}

function resize() {
  if (!renderer) return;
  const width = Math.max(1, dom["viewer-shell"].clientWidth);
  const height = Math.max(1, dom["viewer-shell"].clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function setView(name) {
  const angles = { front: 0, right: 90, back: 180, left: -90 };
  const labels = { front: "Fronte", right: "Destra", back: "Retro", left: "Sinistra" };
  const angle = THREE.MathUtils.degToRad(angles[name] ?? 0);
  const radius = camera.position.distanceTo(controls.target);
  viewTween = new THREE.Vector3(Math.sin(angle) * radius, clamp(camera.position.y, -0.5, 0.8), Math.cos(angle) * radius);
  dom["view-badge"].textContent = labels[name] || "Vista";
  document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === name));
}

function animate() {
  requestAnimationFrame(animate);
  if (viewTween) {
    camera.position.lerp(viewTween, 0.14);
    if (camera.position.distanceTo(viewTween) < 0.012) { camera.position.copy(viewTween); viewTween = null; }
  }
  controls.update();
  renderer.render(scene, camera);
}

async function loadKit() {
  const loader = new GLTFLoader();
  const gltf = await new Promise((resolve, reject) => loader.load(MODEL_URL, resolve, undefined, reject));
  kitRoot = gltf.scene;
  kitRoot.name = "football-kit";
  scene.add(kitRoot);
  normalizeKit(kitRoot);
  applyGarmentMaterials(kitRoot);
  kitRoot.updateMatrixWorld(true);
  modelReady = true;
  rebuildDecals();
  dom["loading-overlay"].hidden = true;
  setStatus("Divisa 3D pronta — 360°", "ready");
}

function rootBoxToWorld(rootBox) {
  const result = new THREE.Box3();
  for (const x of [rootBox.min.x, rootBox.max.x]) for (const y of [rootBox.min.y, rootBox.max.y]) for (const z of [rootBox.min.z, rootBox.max.z]) {
    result.expandByPoint(new THREE.Vector3(x, y, z).applyMatrix4(kitRoot.matrixWorld));
  }
  return result;
}
function mapSafe(value, range) { return lerp(range[0], range[1], clamp(value, 0, 100) / 100); }

function surfaceFrame(id) {
  const def = surfaceDef(id);
  const box = rootBoxToWorld(partBoundsRoot[def.part]);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  let xMin = box.min.x;
  let xMax = box.max.x;
  if (def.face === "front-left") xMax = center.x;
  if (def.face === "front-right") xMin = center.x;
  return { def, box, center, size, xMin, xMax };
}

function placementToProjector(surface, xPct, yPct, rotationDeg) {
  const frame = surfaceFrame(surface);
  const u = mapSafe(xPct, frame.def.u);
  const v = mapSafe(yPct, frame.def.v);
  const eps = Math.max(0.008, Math.min(frame.size.x, frame.size.y, frame.size.z) * 0.006);
  let position, orientation, uSpan, vSpan, depth;
  if (frame.def.face === "front" || frame.def.face.startsWith("front-")) {
    position = new THREE.Vector3(lerp(frame.xMin, frame.xMax, u), lerp(frame.box.max.y, frame.box.min.y, v), frame.box.max.z + eps);
    orientation = new THREE.Euler(0, 0, THREE.MathUtils.degToRad(rotationDeg));
    uSpan = frame.xMax - frame.xMin; vSpan = frame.size.y; depth = frame.size.z;
  } else if (frame.def.face === "back") {
    position = new THREE.Vector3(lerp(frame.xMin, frame.xMax, u), lerp(frame.box.max.y, frame.box.min.y, v), frame.box.min.z - eps);
    orientation = new THREE.Euler(0, Math.PI, THREE.MathUtils.degToRad(-rotationDeg));
    uSpan = frame.xMax - frame.xMin; vSpan = frame.size.y; depth = frame.size.z;
  } else if (frame.def.face === "left") {
    position = new THREE.Vector3(frame.box.min.x - eps, lerp(frame.box.max.y, frame.box.min.y, v), lerp(frame.box.max.z, frame.box.min.z, u));
    orientation = new THREE.Euler(0, -Math.PI / 2, THREE.MathUtils.degToRad(rotationDeg));
    uSpan = frame.size.z; vSpan = frame.size.y; depth = frame.size.x;
  } else {
    position = new THREE.Vector3(frame.box.max.x + eps, lerp(frame.box.max.y, frame.box.min.y, v), lerp(frame.box.min.z, frame.box.max.z, u));
    orientation = new THREE.Euler(0, Math.PI / 2, THREE.MathUtils.degToRad(rotationDeg));
    uSpan = frame.size.z; vSpan = frame.size.y; depth = frame.size.x;
  }
  return { position, orientation, uSpan: Math.max(0.1, uSpan), vSpan: Math.max(0.1, vSpan), depth: Math.max(0.08, depth), part: frame.def.part };
}

function proxyWorldBounds(proxy) {
  if (!proxy.geometry.boundingBox) proxy.geometry.computeBoundingBox();
  return proxy.geometry.boundingBox.clone().applyMatrix4(proxy.matrixWorld);
}
function targetMeshForPart(part, projectorPosition) {
  const targets = partTargets[part];
  if (!targets.length) return null;
  let best = targets[0];
  let bestDistance = Infinity;
  for (const target of targets) {
    const distance = proxyWorldBounds(target).distanceToPoint(projectorPosition);
    if (distance < bestDistance) { best = target; bestDistance = distance; }
  }
  return best;
}

function disposeObject3D(object) {
  object.traverse((child) => {
    child.geometry?.dispose?.();
    if (!child.material) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (material.map?.userData?.ownedBySportswear) material.map.dispose();
      material.dispose?.();
    });
  });
}
function clearDecals() {
  for (const child of [...decalGroup.children]) { decalGroup.remove(child); disposeObject3D(child); }
}
function canvasTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.userData.ownedBySportswear = true;
  return texture;
}
function contrast(hex) {
  const color = new THREE.Color(safeColor(hex));
  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
  return luminance > 0.55 ? "#111820" : "#ffffff";
}

function textTexture(text, fontKey, color, kind) {
  const canvas = document.createElement("canvas");
  canvas.width = kind === "number" ? 768 : 1536;
  canvas.height = kind === "number" ? 768 : 420;
  const context = canvas.getContext("2d");
  const font = FONTS[fontKey] || FONTS.impact;
  const size = kind === "number" ? 600 : 270;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineJoin = "round";
  context.font = `${font.weight} ${size}px ${font.family}`;
  context.strokeStyle = contrast(color);
  context.lineWidth = Math.max(8, size * 0.032);
  context.fillStyle = safeColor(color);
  const maxWidth = canvas.width * 0.92;
  context.strokeText(text, canvas.width / 2, canvas.height / 2, maxWidth);
  context.fillText(text, canvas.width / 2, canvas.height / 2, maxWidth);
  return { texture: canvasTexture(canvas), aspect: canvas.width / canvas.height };
}
function imageTexture(image) {
  const texture = new THREE.Texture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.userData.ownedBySportswear = true;
  const width = image.naturalWidth || image.width || 1;
  const height = image.naturalHeight || image.height || 1;
  return { texture, aspect: width / height };
}

function addProjectedDecal({ surface, x, y, scale, rotation, texture, aspect, opacity = 1 }) {
  const frame = placementToProjector(surface, x, y, rotation);
  const target = targetMeshForPart(frame.part, frame.position);
  if (!target) return false;
  const width = clamp(frame.uSpan * (scale / 100), 0.10, frame.uSpan * 0.82);
  const height = clamp(width / Math.max(0.18, aspect), 0.08, frame.vSpan * 0.62);
  const depth = clamp(frame.depth * 0.12, 0.055, 0.22);
  const geometry = new DecalGeometry(target, frame.position, frame.orientation, new THREE.Vector3(width, height, depth));
  if (!geometry.attributes.position || geometry.attributes.position.count === 0) { geometry.dispose(); texture.dispose(); return false; }
  const material = new THREE.MeshStandardMaterial({
    map: texture, transparent: true, opacity: clamp(opacity, 0, 1), alphaTest: 0.02,
    depthWrite: false, depthTest: true, roughness: 0.78, metalness: 0,
    polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, side: THREE.FrontSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 10;
  decalGroup.add(mesh);
  return true;
}

function rebuildDecals() {
  if (!modelReady) { updateOutput(); return; }
  clearDecals();
  const p = state.personalization;
  const failures = [];
  if (p.name) {
    const texture = textTexture(p.name, p.font, p.color, "name");
    if (!addProjectedDecal({ ...p.backName, texture: texture.texture, aspect: texture.aspect })) failures.push("nome retro");
  }
  if (p.number) {
    const backTexture = textTexture(p.number, p.font, p.color, "number");
    if (!addProjectedDecal({ ...p.backNumber, texture: backTexture.texture, aspect: backTexture.aspect })) failures.push("numero retro");
    if (p.frontNumberEnabled) {
      const frontTexture = textTexture(p.number, p.font, p.color, "number");
      if (!addProjectedDecal({ ...p.frontNumber, texture: frontTexture.texture, aspect: frontTexture.aspect })) failures.push("numero fronte");
    }
  }
  state.graphics.forEach((graphic) => {
    if (!graphic.image) return;
    const texture = imageTexture(graphic.image);
    if (!addProjectedDecal({ surface: graphic.surface, x: graphic.x, y: graphic.y, scale: graphic.scale, rotation: graphic.rotation, texture: texture.texture, aspect: texture.aspect, opacity: graphic.opacity })) failures.push(`${graphic.type} #${graphic.id}`);
  });
  dom["graphics-message"].textContent = failures.length ? `Non proiettati: ${failures.join(", ")}` : "";
  dom["graphics-message"].className = `message${failures.length ? " error" : ""}`;
  updateOutput();
}

function drawPreview(canvas, design) {
  const dpr = window.devicePixelRatio || 1, width = 120, height = 40;
  canvas.width = width * dpr; canvas.height = height * dpr;
  const context = canvas.getContext("2d"); context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.fillStyle = state.colors.body.primary; context.fillRect(0, 0, width, height);
  context.fillStyle = state.colors.body.secondary; context.strokeStyle = state.colors.body.secondary;
  const id = design.id;
  if (id === "vertical-stripes") for (let i = 0; i < 8; i += 2) context.fillRect(i * width / 8, 0, width / 8, height);
  else if (id === "horizontal-stripes") for (let i = 0; i < 8; i += 2) context.fillRect(0, i * height / 8, width, height / 8);
  else if (id === "horizontal-band") context.fillRect(0, height * 0.42, width, height * 0.2);
  else if (id === "diagonal-band") { context.lineWidth = 10; context.beginPath(); context.moveTo(-5, height); context.lineTo(width + 5, 0); context.stroke(); }
  else if (id === "half-split") context.fillRect(width / 2, 0, width / 2, height);
  else if (id === "chevron") { context.lineWidth = 9; context.beginPath(); context.moveTo(0, height * 0.32); context.lineTo(width / 2, height * 0.7); context.lineTo(width, height * 0.32); context.stroke(); }
  else if (id === "side-panels") { context.fillRect(0, 0, width * 0.18, height); context.fillRect(width * 0.82, 0, width * 0.18, height); }
  else if (id === "contrast-shoulders") { context.fillRect(0, 0, width * 0.28, height * 0.45); context.fillRect(width * 0.72, 0, width * 0.28, height * 0.45); }
  else if (id === "center-band") context.fillRect(width * 0.38, 0, width * 0.24, height);
  else if (id === "quarters") { context.fillRect(width / 2, 0, width / 2, height / 2); context.fillRect(0, height / 2, width / 2, height / 2); }
  else if (id === "pinstripes") { context.lineWidth = 2; for (let x = 6; x < width; x += 10) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke(); } }
}

function buildDesigns() {
  dom["design-gallery"].innerHTML = "";
  for (const design of DESIGNS) {
    const button = document.createElement("button"); button.type = "button"; button.className = "design-card"; button.dataset.id = design.id;
    const canvas = document.createElement("canvas"); canvas.className = "design-swatch";
    const label = document.createElement("small"); label.textContent = design.name; button.append(canvas, label);
    button.addEventListener("click", () => { state.design = design.id; document.querySelectorAll(".design-card").forEach((item) => item.classList.toggle("active", item.dataset.id === design.id)); updateGarmentUniforms(); });
    dom["design-gallery"].appendChild(button);
  }
  renderDesignPreviews();
}
function renderDesignPreviews() {
  document.querySelectorAll(".design-card").forEach((button) => { button.classList.toggle("active", button.dataset.id === state.design); drawPreview(button.querySelector("canvas"), DESIGNS.find((design) => design.id === button.dataset.id)); });
}
function colorField(part, key, label) {
  const wrapper = document.createElement("label"); wrapper.className = "color-field";
  const input = document.createElement("input"); input.type = "color"; input.value = state.colors[part][key];
  const text = document.createElement("span"); text.textContent = label;
  input.addEventListener("input", () => { state.colors[part][key] = input.value.toLowerCase(); updateGarmentUniforms(); });
  wrapper.append(input, text); return wrapper;
}
function buildPartColors() {
  dom["part-colors"].innerHTML = "";
  for (const part of PARTS) {
    const card = document.createElement("div"); card.className = "part-card";
    const heading = document.createElement("h3"); heading.textContent = part.label;
    const colors = document.createElement("div"); colors.className = "colors";
    colors.append(colorField(part.id, "primary", "Primario"), colorField(part.id, "secondary", "Secondario"));
    card.append(heading, colors); dom["part-colors"].appendChild(card);
  }
}

function slider(container, id, label, min, max, value, onInput, suffix = "%", full = false) {
  const wrapper = document.createElement("div"); wrapper.className = `slider${full ? " full" : ""}`;
  const head = document.createElement("div"); head.className = "slider-head";
  const lab = document.createElement("label"); lab.htmlFor = id; lab.textContent = label;
  const output = document.createElement("output"); output.textContent = `${value}${suffix}`;
  const input = document.createElement("input"); input.type = "range"; input.id = id; input.min = min; input.max = max; input.value = value;
  input.addEventListener("input", () => { const number = Number(input.value); output.textContent = `${number}${suffix}`; onInput(number); });
  head.append(lab, output); wrapper.append(head, input); container.appendChild(wrapper);
}
function buildPersonalizationControls() {
  const p = state.personalization, name = dom["back-name-controls"], number = dom["back-number-controls"], front = dom["front-number-controls"];
  name.innerHTML = ""; number.innerHTML = ""; front.innerHTML = "";
  slider(name, "back-name-x", "Orizzontale", 0, 100, p.backName.x, (v) => { p.backName.x = v; rebuildDecals(); });
  slider(name, "back-name-y", "Verticale", 0, 100, p.backName.y, (v) => { p.backName.y = v; rebuildDecals(); });
  slider(name, "back-name-scale", "Scala", 15, 70, p.backName.scale, (v) => { p.backName.scale = v; rebuildDecals(); }, "%", true);
  slider(name, "back-name-rotation", "Rotazione", -30, 30, p.backName.rotation, (v) => { p.backName.rotation = v; rebuildDecals(); }, "°", true);
  slider(number, "back-number-x", "Orizzontale", 0, 100, p.backNumber.x, (v) => { p.backNumber.x = v; rebuildDecals(); });
  slider(number, "back-number-y", "Verticale", 0, 100, p.backNumber.y, (v) => { p.backNumber.y = v; rebuildDecals(); });
  slider(number, "back-number-scale", "Scala", 18, 70, p.backNumber.scale, (v) => { p.backNumber.scale = v; rebuildDecals(); }, "%", true);
  slider(number, "back-number-rotation", "Rotazione", -30, 30, p.backNumber.rotation, (v) => { p.backNumber.rotation = v; rebuildDecals(); }, "°", true);
  slider(front, "front-number-x", "Orizzontale", 0, 100, p.frontNumber.x, (v) => { p.frontNumber.x = v; rebuildDecals(); });
  slider(front, "front-number-y", "Verticale", 0, 100, p.frontNumber.y, (v) => { p.frontNumber.y = v; rebuildDecals(); });
  slider(front, "front-number-scale", "Scala", 10, 50, p.frontNumber.scale, (v) => { p.frontNumber.scale = v; rebuildDecals(); }, "%", true);
}

function addGraphic(type) {
  if (state.graphics.length >= MAX_GRAPHICS) return;
  const defaults = { sponsor: { surface: "shirt-front", x: 50, y: 46, scale: 32 }, patch: { surface: "left-sleeve", x: 50, y: 46, scale: 26 }, badge: { surface: "shirt-front", x: 28, y: 26, scale: 16 } }[type];
  state.graphics.push({ id: nextGraphicId++, type, surface: defaults.surface, x: defaults.x, y: defaults.y, scale: defaults.scale, rotation: 0, opacity: 1, image: null, objectUrl: "" });
  renderGraphics(); updateOutput();
}
function removeGraphic(id) {
  const index = state.graphics.findIndex((graphic) => graphic.id === id); if (index < 0) return;
  const [graphic] = state.graphics.splice(index, 1); if (graphic.objectUrl) URL.revokeObjectURL(graphic.objectUrl);
  renderGraphics(); rebuildDecals();
}
function fieldSelect(label, options, value, onChange) {
  const wrapper = document.createElement("label"); wrapper.className = "field"; wrapper.append(document.createTextNode(label));
  const select = document.createElement("select");
  for (const optionData of options) { const option = document.createElement("option"); option.value = optionData.value; option.textContent = optionData.label; option.selected = optionData.value === value; select.appendChild(option); }
  select.addEventListener("change", () => onChange(select.value)); wrapper.appendChild(select); return wrapper;
}
function graphicSlider(grid, graphic, key, label, min, max, suffix = "%", step = 1) {
  const container = document.createElement("div"); container.className = "slider";
  const head = document.createElement("div"); head.className = "slider-head";
  const text = document.createElement("span"); text.textContent = label;
  const output = document.createElement("output"); output.textContent = `${graphic[key]}${suffix}`;
  const input = document.createElement("input"); input.type = "range"; input.min = min; input.max = max; input.step = step; input.value = graphic[key];
  input.addEventListener("input", () => { graphic[key] = Number(input.value); output.textContent = `${graphic[key]}${suffix}`; rebuildDecals(); });
  head.append(text, output); container.append(head, input); grid.appendChild(container);
}

function renderGraphics() {
  dom["graphics-list"].innerHTML = "";
  const labels = { sponsor: "Sponsor", patch: "Patch / scudetto", badge: "Badge" };
  for (const graphic of state.graphics) {
    const card = document.createElement("div"); card.className = "graphic-card";
    const head = document.createElement("div"); head.className = "graphic-head";
    const title = document.createElement("strong"); title.textContent = `${labels[graphic.type]} #${graphic.id}`;
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "remove-btn"; remove.textContent = "Rimuovi"; remove.addEventListener("click", () => removeGraphic(graphic.id));
    head.append(title, remove);
    const grid = document.createElement("div"); grid.className = "graphic-grid";
    const fileLabel = document.createElement("label"); fileLabel.className = "field wide"; fileLabel.append(document.createTextNode("Immagine"));
    const file = document.createElement("input"); file.type = "file"; file.accept = "image/png,image/jpeg,image/webp";
    file.addEventListener("change", () => {
      const selected = file.files?.[0]; if (!selected) return;
      if (!ALLOWED_IMAGE_TYPES.has(selected.type)) { dom["graphics-message"].textContent = "Formato non supportato: usa PNG, JPEG o WebP."; dom["graphics-message"].className = "message error"; file.value = ""; return; }
      if (selected.size > MAX_IMAGE_BYTES) { dom["graphics-message"].textContent = "Immagine oltre 5 MB."; dom["graphics-message"].className = "message error"; file.value = ""; return; }
      const previousUrl = graphic.objectUrl, nextUrl = URL.createObjectURL(selected), image = new Image();
      image.onload = () => { if (previousUrl) URL.revokeObjectURL(previousUrl); graphic.objectUrl = nextUrl; graphic.image = image; renderGraphics(); rebuildDecals(); };
      image.onerror = () => { URL.revokeObjectURL(nextUrl); dom["graphics-message"].textContent = "Immagine non leggibile."; dom["graphics-message"].className = "message error"; };
      image.src = nextUrl;
    });
    fileLabel.appendChild(file); grid.appendChild(fileLabel);
    grid.appendChild(fieldSelect("Superficie", SURFACES.map((surface) => ({ value: surface.id, label: surface.label })), graphic.surface, (value) => { graphic.surface = value; rebuildDecals(); }));
    const thumb = document.createElement("div"); thumb.className = "thumb";
    if (graphic.objectUrl) { const image = document.createElement("img"); image.src = graphic.objectUrl; image.alt = "Anteprima"; thumb.appendChild(image); } else thumb.textContent = "Nessuna immagine";
    grid.appendChild(thumb);
    graphicSlider(grid, graphic, "x", "Orizzontale", 0, 100);
    graphicSlider(grid, graphic, "y", "Verticale", 0, 100);
    graphicSlider(grid, graphic, "scale", "Scala", 5, 70);
    graphicSlider(grid, graphic, "rotation", "Rotazione", -180, 180, "°");
    graphicSlider(grid, graphic, "opacity", "Opacità", 0.15, 1, "", 0.05);
    card.append(head, grid); dom["graphics-list"].appendChild(card);
  }
  dom["graphics-count"].textContent = `${state.graphics.length} / ${MAX_GRAPHICS}`;
  const disabled = state.graphics.length >= MAX_GRAPHICS;
  dom["add-sponsor"].disabled = disabled; dom["add-patch"].disabled = disabled; dom["add-badge"].disabled = disabled;
}

function payload() {
  const p = state.personalization;
  return {
    v: 1,
    sport: "football",
    design: state.design,
    colors: Object.fromEntries(PARTS.map((part) => [part.id, { primary: state.colors[part.id].primary, secondary: state.colors[part.id].secondary }])),
    personalization: {
      name: p.name, number: p.number, font: p.font, color: p.color, front_number_enabled: p.frontNumberEnabled,
      back_name: { surface: p.backName.surface, x: p.backName.x, y: p.backName.y, scale: p.backName.scale, rotation: p.backName.rotation },
      back_number: { surface: p.backNumber.surface, x: p.backNumber.x, y: p.backNumber.y, scale: p.backNumber.scale, rotation: p.backNumber.rotation },
      front_number: { surface: p.frontNumber.surface, x: p.frontNumber.x, y: p.frontNumber.y, scale: p.frontNumber.scale, rotation: p.frontNumber.rotation }
    },
    graphics: state.graphics.map((graphic) => ({ type: graphic.type, surface: graphic.surface, x: graphic.x, y: graphic.y, scale: graphic.scale, rotation: graphic.rotation, opacity: graphic.opacity, image_present: Boolean(graphic.image) }))
  };
}
function updateOutput() {
  const data = payload(); window.__payload3d = data; dom.payload.value = JSON.stringify(data);
  const design = DESIGNS.find((item) => item.id === state.design)?.name || state.design;
  const graphics = state.graphics.length ? `${state.graphics.length} elementi grafici` : "nessuna patch/sponsor";
  dom.summary.innerHTML = `<strong>${escapeHtml(design)}</strong><br>Retro: ${escapeHtml(state.personalization.name || "—")} sopra ${escapeHtml(state.personalization.number || "—")} · ${escapeHtml(FONTS[state.personalization.font]?.label || state.personalization.font)}<br>${escapeHtml(graphics)} · numero fronte ${state.personalization.frontNumberEnabled ? "sì" : "no"}`;
}

async function copyPayload() {
  const text = dom.payload.value, button = dom["copy-payload"], previous = button.textContent;
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else { dom.payload.focus(); dom.payload.select(); if (!document.execCommand("copy")) throw new Error("copy fallita"); }
    button.textContent = "Copiato ✓";
    dom["output-message"].textContent = "Codice configurazione copiato."; dom["output-message"].className = "message ok";
    clearTimeout(copyResetTimer); copyResetTimer = setTimeout(() => { button.textContent = previous; }, 2000);
  } catch (error) {
    dom.payload.focus(); dom.payload.select(); dom["output-message"].textContent = "Copia non riuscita: il codice resta selezionato."; dom["output-message"].className = "message error";
  }
}
function sendEmail() {
  const subject = encodeURIComponent("Preventivo kit sportivo — [ATTIVITA]");
  const body = encodeURIComponent(`Attività: [ATTIVITA]\nContatto: [TEL]\n\nCodice configurazione: ${JSON.stringify(window.__payload3d)}\n`);
  window.location.href = `mailto:[EMAIL_ATTIVITA]?subject=${subject}&body=${body}`;
}

function wireUi() {
  for (const [key, font] of Object.entries(FONTS)) { const option = document.createElement("option"); option.value = key; option.textContent = font.label; dom["player-font"].appendChild(option); }
  dom["player-font"].value = state.personalization.font;
  dom["player-name"].addEventListener("input", () => { const value = normalizedName(dom["player-name"].value); dom["player-name"].value = value; state.personalization.name = value; rebuildDecals(); });
  dom["player-number"].addEventListener("input", () => { const value = normalizedNumber(dom["player-number"].value); dom["player-number"].value = value; state.personalization.number = value; rebuildDecals(); });
  dom["player-font"].addEventListener("change", () => { state.personalization.font = dom["player-font"].value; rebuildDecals(); });
  dom["print-color"].addEventListener("input", () => { state.personalization.color = safeColor(dom["print-color"].value); rebuildDecals(); });
  dom["front-number-toggle"].addEventListener("change", () => { state.personalization.frontNumberEnabled = dom["front-number-toggle"].checked; dom["front-number-card"].hidden = !state.personalization.frontNumberEnabled; rebuildDecals(); });
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  dom["add-sponsor"].addEventListener("click", () => addGraphic("sponsor"));
  dom["add-patch"].addEventListener("click", () => addGraphic("patch"));
  dom["add-badge"].addEventListener("click", () => addGraphic("badge"));
  dom["copy-payload"].addEventListener("click", copyPayload);
  dom["send-email"].addEventListener("click", sendEmail);
}

async function main() {
  buildDesigns(); buildPartColors(); buildPersonalizationControls(); renderGraphics(); wireUi(); updateOutput(); initThree();
  try { await loadKit(); } catch (error) { console.error(error); fatal("Impossibile caricare il kit", String(error?.message || error)); }
  window.__sportswear3d = {
    state, setView, rebuildDecals, payload,
    surfaces: SURFACES.map(({ id, label, part, face }) => ({ id, label, part, face })),
    meshReport: () => structuredClone(meshReport),
    diagnostics: () => ({ modelReady, threeRevision: THREE.REVISION, decalCount: decalGroup?.children.length || 0, targetCounts: Object.fromEntries(PARTS.map((part) => [part.id, partTargets[part.id].length])), payload: payload() })
  };
}
main();