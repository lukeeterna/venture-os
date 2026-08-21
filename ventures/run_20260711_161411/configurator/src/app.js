import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";

const MAX_GRAPHICS = 20;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_FONT_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const FONT_EXTENSIONS = /\.(ttf|otf|woff2?)$/i;

const PARTS = [
  { id: "body", label: "Corpo maglia" },
  { id: "sleeves", label: "Maniche" },
  { id: "collar", label: "Colletto" },
  { id: "shorts", label: "Pantaloncini" },
  { id: "socks", label: "Calze" }
];

const SURFACES = [
  { id: "shirt-front", label: "Maglia fronte", target: "body", face: "front" },
  { id: "shirt-back", label: "Maglia retro", target: "body", face: "back" },
  { id: "left-sleeve", label: "Manica sinistra", target: "leftSleeve", face: "left" },
  { id: "right-sleeve", label: "Manica destra", target: "rightSleeve", face: "right" },
  { id: "shorts-left", label: "Pantaloncino sinistro", target: "leftShort", face: "front" },
  { id: "shorts-right", label: "Pantaloncino destro", target: "rightShort", face: "front" },
  { id: "socks-left", label: "Calza sinistra", target: "leftSock", face: "front" },
  { id: "socks-right", label: "Calza destra", target: "rightSock", face: "front" }
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

function makePatternState() {
  return { image: null, objectUrl: "", repeat: 3, rotation: 0, offsetX: 0, offsetY: 0, opacity: 1 };
}

const state = {
  sport: "football",
  colors: {
    body: "#87aaf0",
    sleeves: "#87aaf0",
    collar: "#6f91d6",
    shorts: "#f4f4f4",
    socks: "#87aaf0"
  },
  patterns: Object.fromEntries(PARTS.map((part) => [part.id, makePatternState()])),
  personalization: {
    name: "ROSSI",
    number: "10",
    font: "impact",
    color: "#ffffff",
    customFontPresent: false,
    frontNumberEnabled: false,
    backName: { surface: "shirt-back", x: 50, y: 25, scale: 34, rotation: 0 },
    backNumber: { surface: "shirt-back", x: 50, y: 52, scale: 47, rotation: 0 },
    frontNumber: { surface: "shirt-front", x: 50, y: 52, scale: 23, rotation: 0 }
  },
  graphics: []
};

const dom = Object.fromEntries([
  "scene-canvas", "viewer-shell", "loading-overlay", "loading-title", "loading-copy", "view-badge",
  "status-dot", "viewer-status", "part-colors", "pattern-part", "pattern-file", "pattern-thumb",
  "pattern-clear", "pattern-controls", "pattern-message", "player-name", "player-number", "player-font",
  "print-color", "custom-font-file", "font-message", "front-number-toggle", "front-number-card",
  "back-name-controls", "back-number-controls", "front-number-controls", "graphics-list", "graphics-count",
  "graphics-message", "add-logo", "add-sponsor", "add-patch", "add-badge", "summary", "payload",
  "copy-payload", "send-email", "output-message"
].map((id) => [id, document.getElementById(id)]));

let renderer;
let scene;
let camera;
let controls;
let garmentGroup;
let decalGroup;
let viewTween = null;
let nextGraphicId = 1;
let modelReady = false;
let copyTimer = null;
let customFontFace = null;
let customFontUrl = "";

const meshes = {};
const materials = {};
const patternTextures = {};

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function safeColor(value, fallback = "#ffffff") { return /^#[0-9a-f]{6}$/i.test(String(value)) ? String(value).toLowerCase() : fallback; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function cleanText(value, maxLength) { return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, maxLength); }
function setStatus(text, kind = "") { dom["viewer-status"].textContent = text; dom["status-dot"].className = kind; }
function setMessage(element, text, kind = "") { element.textContent = text; element.className = `message${kind ? ` ${kind}` : ""}`; }
function surfaceDef(id) { return SURFACES.find((surface) => surface.id === id) || SURFACES[0]; }

function createMaterial(part) {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(state.colors[part]),
    roughness: 0.76,
    metalness: 0,
    side: THREE.DoubleSide
  });
  material.name = `sportswear-${part}`;
  materials[part] = material;
  return material;
}

function smoothGeometry(geometry) {
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function registerMesh(key, mesh) {
  mesh.name = key;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  meshes[key] = mesh;
  garmentGroup.add(mesh);
  return mesh;
}

function buildGarment() {
  garmentGroup = new THREE.Group();
  garmentGroup.name = "sportswear-football-procedural-kit";
  scene.add(garmentGroup);

  const body = registerMesh("body", new THREE.Mesh(
    smoothGeometry(new THREE.CylinderGeometry(1.03, 1.22, 2.65, 56, 10, true)),
    createMaterial("body")
  ));
  body.position.y = 0.63;
  body.scale.z = 0.56;

  const sleeveGeometry = smoothGeometry(new THREE.CylinderGeometry(0.35, 0.48, 1.18, 36, 5, true));
  const sleeveMaterial = createMaterial("sleeves");
  const leftSleeve = registerMesh("leftSleeve", new THREE.Mesh(sleeveGeometry.clone(), sleeveMaterial));
  leftSleeve.position.set(-1.26, 1.05, 0);
  leftSleeve.rotation.z = -1.05;
  leftSleeve.scale.z = 0.72;
  const rightSleeve = registerMesh("rightSleeve", new THREE.Mesh(sleeveGeometry.clone(), sleeveMaterial));
  rightSleeve.position.set(1.26, 1.05, 0);
  rightSleeve.rotation.z = 1.05;
  rightSleeve.scale.z = 0.72;
  sleeveGeometry.dispose();

  const collar = registerMesh("collar", new THREE.Mesh(
    smoothGeometry(new THREE.TorusGeometry(0.36, 0.082, 18, 56)),
    createMaterial("collar")
  ));
  collar.position.set(0, 1.96, 0);
  collar.rotation.x = Math.PI / 2;
  collar.scale.z = 0.74;

  const shortsMaterial = createMaterial("shorts");
  const waist = registerMesh("waist", new THREE.Mesh(
    smoothGeometry(new THREE.CylinderGeometry(1.18, 1.23, 0.30, 48, 2, true)),
    shortsMaterial
  ));
  waist.position.y = -0.79;
  waist.scale.z = 0.66;

  const shortGeometry = smoothGeometry(new THREE.CylinderGeometry(0.62, 0.76, 1.18, 40, 5, true));
  const leftShort = registerMesh("leftShort", new THREE.Mesh(shortGeometry.clone(), shortsMaterial));
  leftShort.position.set(-0.56, -1.39, 0);
  leftShort.scale.z = 0.70;
  leftShort.rotation.z = 0.05;
  const rightShort = registerMesh("rightShort", new THREE.Mesh(shortGeometry.clone(), shortsMaterial));
  rightShort.position.set(0.56, -1.39, 0);
  rightShort.scale.z = 0.70;
  rightShort.rotation.z = -0.05;
  shortGeometry.dispose();

  const sockMaterial = createMaterial("socks");
  const sockGeometry = smoothGeometry(new THREE.CylinderGeometry(0.25, 0.30, 1.38, 32, 5, true));
  const leftSock = registerMesh("leftSock", new THREE.Mesh(sockGeometry.clone(), sockMaterial));
  leftSock.position.set(-0.54, -2.72, 0);
  leftSock.scale.z = 0.72;
  const rightSock = registerMesh("rightSock", new THREE.Mesh(sockGeometry.clone(), sockMaterial));
  rightSock.position.set(0.54, -2.72, 0);
  rightSock.scale.z = 0.72;
  sockGeometry.dispose();

  garmentGroup.rotation.x = -0.03;
  garmentGroup.updateMatrixWorld(true);

  decalGroup = new THREE.Group();
  decalGroup.name = "sportswear-decals";
  scene.add(decalGroup);
  modelReady = true;
}

function createGroundShadow() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(128, 128, 12, 128, 128, 122);
  gradient.addColorStop(0, "rgba(0,0,0,.50)");
  gradient.addColorStop(.6, "rgba(0,0,0,.16)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5.4, 2.7),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -3.45;
  plane.renderOrder = -1;
  scene.add(plane);
}

function initThree() {
  renderer = new THREE.WebGLRenderer({ canvas: dom["scene-canvas"], antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = false;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x111821, 11, 20);
  camera = new THREE.PerspectiveCamera(32, 1, 0.05, 100);
  camera.position.set(0, 0.15, 8.8);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.minDistance = 5.6;
  controls.maxDistance = 12.5;
  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = Infinity;
  controls.minPolarAngle = Math.PI * 0.28;
  controls.maxPolarAngle = Math.PI * 0.72;
  controls.target.set(0, -0.45, 0);

  scene.add(new THREE.HemisphereLight(0xeaf2ff, 0x18202a, 2.15));
  const key = new THREE.DirectionalLight(0xffffff, 3.0);
  key.position.set(4.5, 6.5, 7.0);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x9cbcff, 1.15);
  fill.position.set(-5, 2.5, -4.5);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xd9e6ff, 1.0);
  rim.position.set(0, 3, -7);
  scene.add(rim);

  buildGarment();
  createGroundShadow();
  resize();
  window.addEventListener("resize", resize);
  animate();
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
  const deg = angles[name] ?? 0;
  const radius = camera.position.distanceTo(controls.target);
  const angle = THREE.MathUtils.degToRad(deg);
  viewTween = new THREE.Vector3(Math.sin(angle) * radius, camera.position.y, Math.cos(angle) * radius);
  dom["view-badge"].textContent = labels[name] || "Vista";
  document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === name));
}

function animate() {
  requestAnimationFrame(animate);
  if (viewTween) {
    camera.position.lerp(viewTween, 0.14);
    if (camera.position.distanceTo(viewTween) < 0.012) {
      camera.position.copy(viewTween);
      viewTween = null;
    }
  }
  controls.update();
  renderer.render(scene, camera);
}

function drawCover(ctx, image, width, height, opacity) {
  const sw = image.naturalWidth || image.width || 1;
  const sh = image.naturalHeight || image.height || 1;
  const scale = Math.max(width / sw, height / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.globalAlpha = opacity;
  ctx.drawImage(image, (width - dw) / 2, (height - dh) / 2, dw, dh);
  ctx.globalAlpha = 1;
}

function disposePatternTexture(part) {
  if (patternTextures[part]) {
    patternTextures[part].dispose();
    patternTextures[part] = null;
  }
}

function updatePartAppearance(part) {
  const material = materials[part];
  if (!material) return;
  const pattern = state.patterns[part];
  disposePatternTexture(part);
  if (!pattern.image) {
    material.map = null;
    material.color.set(state.colors[part]);
    material.needsUpdate = true;
    updateOutput();
    return;
  }

  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = state.colors[part];
  ctx.fillRect(0, 0, size, size);
  drawCover(ctx, pattern.image, size, size, pattern.opacity);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(pattern.repeat, pattern.repeat);
  texture.center.set(0.5, 0.5);
  texture.rotation = THREE.MathUtils.degToRad(pattern.rotation);
  texture.offset.set(pattern.offsetX / 100, pattern.offsetY / 100);
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;
  patternTextures[part] = texture;
  material.map = texture;
  material.color.set(0xffffff);
  material.needsUpdate = true;
  updateOutput();
}

function buildPartColors() {
  dom["part-colors"].innerHTML = "";
  for (const part of PARTS) {
    const card = document.createElement("div");
    card.className = "part-card";
    const title = document.createElement("h3");
    title.textContent = part.label;
    const colors = document.createElement("div");
    colors.className = "colors";
    const label = document.createElement("label");
    label.className = "color-field";
    const input = document.createElement("input");
    input.type = "color";
    input.value = state.colors[part.id];
    const span = document.createElement("span");
    span.textContent = "Colore base";
    input.addEventListener("input", () => {
      state.colors[part.id] = input.value.toLowerCase();
      updatePartAppearance(part.id);
    });
    label.append(input, span);
    colors.appendChild(label);
    card.append(title, colors);
    dom["part-colors"].appendChild(card);
  }
}

function slider(container, id, label, min, max, step, value, onInput, suffix = "", full = false) {
  const wrap = document.createElement("div");
  wrap.className = `slider${full ? " full" : ""}`;
  const head = document.createElement("div");
  head.className = "slider-head";
  const lab = document.createElement("label");
  lab.htmlFor = id;
  lab.textContent = label;
  const output = document.createElement("output");
  output.textContent = `${value}${suffix}`;
  const input = document.createElement("input");
  input.type = "range";
  input.id = id;
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.addEventListener("input", () => {
    const next = Number(input.value);
    output.textContent = `${next}${suffix}`;
    onInput(next);
  });
  head.append(lab, output);
  wrap.append(head, input);
  container.appendChild(wrap);
}

function selectedPatternPart() { return dom["pattern-part"].value || "body"; }

function updatePatternThumb() {
  const part = selectedPatternPart();
  const pattern = state.patterns[part];
  dom["pattern-thumb"].innerHTML = "";
  if (pattern.objectUrl) {
    const img = document.createElement("img");
    img.src = pattern.objectUrl;
    img.alt = "Anteprima fantasia";
    dom["pattern-thumb"].appendChild(img);
  } else {
    dom["pattern-thumb"].textContent = "Nessuna fantasia";
  }
}

function buildPatternControls() {
  const part = selectedPatternPart();
  const pattern = state.patterns[part];
  dom["pattern-controls"].innerHTML = "";
  slider(dom["pattern-controls"], "pattern-repeat", "Ripetizione", 1, 12, 1, pattern.repeat, (value) => { pattern.repeat = value; updatePartAppearance(part); }, "×");
  slider(dom["pattern-controls"], "pattern-rotation", "Rotazione", -180, 180, 1, pattern.rotation, (value) => { pattern.rotation = value; updatePartAppearance(part); }, "°");
  slider(dom["pattern-controls"], "pattern-x", "Offset X", -100, 100, 1, pattern.offsetX, (value) => { pattern.offsetX = value; updatePartAppearance(part); }, "%");
  slider(dom["pattern-controls"], "pattern-y", "Offset Y", -100, 100, 1, pattern.offsetY, (value) => { pattern.offsetY = value; updatePartAppearance(part); }, "%");
  slider(dom["pattern-controls"], "pattern-opacity", "Opacità fantasia", 0, 100, 1, Math.round(pattern.opacity * 100), (value) => { pattern.opacity = value / 100; updatePartAppearance(part); }, "%", true);
  updatePatternThumb();
}

function handlePatternFile(file) {
  const part = selectedPatternPart();
  if (!file) return;
  if (!IMAGE_TYPES.has(file.type)) {
    setMessage(dom["pattern-message"], "Formato non supportato. Usa PNG, JPG o WebP.", "error");
    dom["pattern-file"].value = "";
    return;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    setMessage(dom["pattern-message"], "File oltre 8 MB.", "error");
    dom["pattern-file"].value = "";
    return;
  }
  const pattern = state.patterns[part];
  if (pattern.objectUrl) URL.revokeObjectURL(pattern.objectUrl);
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    pattern.objectUrl = url;
    pattern.image = image;
    updatePartAppearance(part);
    updatePatternThumb();
    setMessage(dom["pattern-message"], "Fantasia caricata. Per una continuità perfetta usa un PNG seamless quadrato 1024×1024.", "ok");
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    setMessage(dom["pattern-message"], "Immagine non leggibile.", "error");
  };
  image.src = url;
}

function clearPattern() {
  const part = selectedPatternPart();
  const pattern = state.patterns[part];
  if (pattern.objectUrl) URL.revokeObjectURL(pattern.objectUrl);
  Object.assign(pattern, makePatternState());
  dom["pattern-file"].value = "";
  updatePartAppearance(part);
  buildPatternControls();
  setMessage(dom["pattern-message"], "Fantasia rimossa.", "ok");
}

function buildFontOptions() {
  dom["player-font"].innerHTML = "";
  for (const [key, font] of Object.entries(FONTS)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = font.label;
    dom["player-font"].appendChild(option);
  }
  dom["player-font"].value = state.personalization.font;
}

async function loadCustomFont(file) {
  if (!file) return;
  if (file.size > MAX_FONT_BYTES || !FONT_EXTENSIONS.test(file.name)) {
    setMessage(dom["font-message"], "Font non supportato. Usa TTF, OTF, WOFF o WOFF2 fino a 5 MB.", "error");
    dom["custom-font-file"].value = "";
    return;
  }
  try {
    if (customFontFace) document.fonts.delete(customFontFace);
    if (customFontUrl) URL.revokeObjectURL(customFontUrl);
    customFontUrl = URL.createObjectURL(file);
    customFontFace = new FontFace("SportswearCustomUpload", `url(${customFontUrl})`);
    await customFontFace.load();
    document.fonts.add(customFontFace);
    FONTS["custom-upload"] = { label: "Font caricato", family: "SportswearCustomUpload, sans-serif", weight: 700 };
    state.personalization.font = "custom-upload";
    state.personalization.customFontPresent = true;
    buildFontOptions();
    await document.fonts.load("700 64px SportswearCustomUpload");
    rebuildDecals();
    setMessage(dom["font-message"], "Font caricato in memoria e applicato.", "ok");
  } catch (error) {
    console.error(error);
    setMessage(dom["font-message"], "Il font non è stato caricato dal browser.", "error");
  }
}

function buildPersonalizationControls() {
  const p = state.personalization;
  const name = dom["back-name-controls"];
  const number = dom["back-number-controls"];
  const front = dom["front-number-controls"];
  name.innerHTML = number.innerHTML = front.innerHTML = "";
  slider(name, "back-name-x", "Orizzontale", 10, 90, 1, p.backName.x, (v) => { p.backName.x = v; rebuildDecals(); }, "%");
  slider(name, "back-name-y", "Verticale", 8, 55, 1, p.backName.y, (v) => { p.backName.y = v; rebuildDecals(); }, "%");
  slider(name, "back-name-scale", "Scala", 12, 65, 1, p.backName.scale, (v) => { p.backName.scale = v; rebuildDecals(); }, "%", true);
  slider(name, "back-name-rotation", "Rotazione", -30, 30, 1, p.backName.rotation, (v) => { p.backName.rotation = v; rebuildDecals(); }, "°", true);
  slider(number, "back-number-x", "Orizzontale", 10, 90, 1, p.backNumber.x, (v) => { p.backNumber.x = v; rebuildDecals(); }, "%");
  slider(number, "back-number-y", "Verticale", 25, 84, 1, p.backNumber.y, (v) => { p.backNumber.y = v; rebuildDecals(); }, "%");
  slider(number, "back-number-scale", "Scala", 15, 72, 1, p.backNumber.scale, (v) => { p.backNumber.scale = v; rebuildDecals(); }, "%", true);
  slider(number, "back-number-rotation", "Rotazione", -30, 30, 1, p.backNumber.rotation, (v) => { p.backNumber.rotation = v; rebuildDecals(); }, "°", true);
  slider(front, "front-number-x", "Orizzontale", 10, 90, 1, p.frontNumber.x, (v) => { p.frontNumber.x = v; rebuildDecals(); }, "%");
  slider(front, "front-number-y", "Verticale", 15, 82, 1, p.frontNumber.y, (v) => { p.frontNumber.y = v; rebuildDecals(); }, "%");
  slider(front, "front-number-scale", "Scala", 10, 50, 1, p.frontNumber.scale, (v) => { p.frontNumber.scale = v; rebuildDecals(); }, "%", true);
}

function textureFromCanvas(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.userData.sportswearOwned = true;
  return texture;
}

function textTexture(text, fontKey, color, kind) {
  const font = FONTS[fontKey] || FONTS.impact;
  const canvas = document.createElement("canvas");
  canvas.width = kind === "number" ? 900 : 1600;
  canvas.height = kind === "number" ? 900 : 420;
  const ctx = canvas.getContext("2d");
  const fontSize = kind === "number" ? 680 : 260;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = safeColor(color);
  ctx.font = `${font.weight} ${fontSize}px ${font.family}`;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width * 0.94);
  return { texture: textureFromCanvas(canvas), aspect: canvas.width / canvas.height };
}

function imageTexture(image) {
  const texture = new THREE.Texture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.userData.sportswearOwned = true;
  const width = image.naturalWidth || image.width || 1;
  const height = image.naturalHeight || image.height || 1;
  return { texture, aspect: width / height };
}

function targetMesh(surface) {
  return meshes[surfaceDef(surface).target] || meshes.body;
}

function projectorFrame(surface, xPct, yPct, rotationDeg) {
  const def = surfaceDef(surface);
  const target = targetMesh(surface);
  target.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(target);
  const size = box.getSize(new THREE.Vector3());
  const x = clamp(xPct, 0, 100) / 100;
  const y = clamp(yPct, 0, 100) / 100;
  const rotation = THREE.MathUtils.degToRad(rotationDeg || 0);
  const eps = 0.012;
  let position;
  let orientation;
  let uSpan;
  let vSpan;
  let depth;

  if (def.face === "front") {
    position = new THREE.Vector3(THREE.MathUtils.lerp(box.min.x, box.max.x, x), THREE.MathUtils.lerp(box.max.y, box.min.y, y), box.max.z + eps);
    orientation = new THREE.Euler(0, 0, rotation);
    uSpan = size.x; vSpan = size.y; depth = size.z;
  } else if (def.face === "back") {
    position = new THREE.Vector3(THREE.MathUtils.lerp(box.min.x, box.max.x, x), THREE.MathUtils.lerp(box.max.y, box.min.y, y), box.min.z - eps);
    orientation = new THREE.Euler(0, Math.PI, -rotation);
    uSpan = size.x; vSpan = size.y; depth = size.z;
  } else if (def.face === "left") {
    position = new THREE.Vector3(box.min.x - eps, THREE.MathUtils.lerp(box.max.y, box.min.y, y), THREE.MathUtils.lerp(box.max.z, box.min.z, x));
    orientation = new THREE.Euler(0, -Math.PI / 2, rotation);
    uSpan = size.z; vSpan = size.y; depth = size.x;
  } else {
    position = new THREE.Vector3(box.max.x + eps, THREE.MathUtils.lerp(box.max.y, box.min.y, y), THREE.MathUtils.lerp(box.min.z, box.max.z, x));
    orientation = new THREE.Euler(0, Math.PI / 2, rotation);
    uSpan = size.z; vSpan = size.y; depth = size.x;
  }

  return { target, position, orientation, uSpan: Math.max(0.15, uSpan), vSpan: Math.max(0.15, vSpan), depth: Math.max(0.12, depth) };
}

function addDecal({ surface, x, y, scale, rotation, texture, aspect, opacity = 1 }) {
  const frame = projectorFrame(surface, x, y, rotation);
  const width = clamp(frame.uSpan * (scale / 100), 0.10, frame.uSpan * 0.84);
  const height = clamp(width / Math.max(0.18, aspect), 0.08, frame.vSpan * 0.72);
  const projectorDepth = clamp(frame.depth * 0.22, 0.08, 0.24);
  const geometry = new DecalGeometry(frame.target, frame.position, frame.orientation, new THREE.Vector3(width, height, projectorDepth));
  if (!geometry.attributes.position || geometry.attributes.position.count === 0) {
    geometry.dispose();
    texture.dispose();
    return false;
  }
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    opacity: clamp(opacity, 0, 1),
    alphaTest: 0.01,
    depthWrite: false,
    depthTest: true,
    roughness: 0.78,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    side: THREE.FrontSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 10;
  decalGroup.add(mesh);
  return true;
}

function disposeDecalObject(object) {
  object.geometry?.dispose?.();
  const list = Array.isArray(object.material) ? object.material : [object.material];
  for (const material of list) {
    if (material?.map?.userData?.sportswearOwned) material.map.dispose();
    material?.dispose?.();
  }
}

function clearDecals() {
  if (!decalGroup) return;
  for (const child of [...decalGroup.children]) {
    decalGroup.remove(child);
    disposeDecalObject(child);
  }
}

function rebuildDecals() {
  if (!modelReady) { updateOutput(); return; }
  clearDecals();
  const failures = [];
  const p = state.personalization;
  if (p.name) {
    const t = textTexture(p.name, p.font, p.color, "name");
    if (!addDecal({ ...p.backName, texture: t.texture, aspect: t.aspect })) failures.push("nome retro");
  }
  if (p.number) {
    const t = textTexture(p.number, p.font, p.color, "number");
    if (!addDecal({ ...p.backNumber, texture: t.texture, aspect: t.aspect })) failures.push("numero retro");
    if (p.frontNumberEnabled) {
      const f = textTexture(p.number, p.font, p.color, "number");
      if (!addDecal({ ...p.frontNumber, texture: f.texture, aspect: f.aspect })) failures.push("numero fronte");
    }
  }
  for (const graphic of state.graphics) {
    if (!graphic.image) continue;
    const image = imageTexture(graphic.image);
    if (!addDecal({ surface: graphic.surface, x: graphic.x, y: graphic.y, scale: graphic.scale, rotation: graphic.rotation, opacity: graphic.opacity, texture: image.texture, aspect: image.aspect })) failures.push(`${graphic.type} #${graphic.id}`);
  }
  setMessage(dom["graphics-message"], failures.length ? `Elementi non proiettati: ${failures.join(", ")}` : "", failures.length ? "error" : "");
  updateOutput();
}

function addGraphic(type) {
  if (state.graphics.length >= MAX_GRAPHICS) return;
  const defaults = {
    logo: { surface: "shirt-front", x: 32, y: 27, scale: 16 },
    sponsor: { surface: "shirt-front", x: 50, y: 47, scale: 34 },
    patch: { surface: "left-sleeve", x: 52, y: 46, scale: 24 },
    badge: { surface: "shirt-front", x: 68, y: 27, scale: 15 }
  }[type];
  state.graphics.push({ id: nextGraphicId++, type, surface: defaults.surface, x: defaults.x, y: defaults.y, scale: defaults.scale, rotation: 0, opacity: 1, image: null, objectUrl: "" });
  renderGraphics();
  updateOutput();
}

function removeGraphic(id) {
  const index = state.graphics.findIndex((graphic) => graphic.id === id);
  if (index < 0) return;
  const [graphic] = state.graphics.splice(index, 1);
  if (graphic.objectUrl) URL.revokeObjectURL(graphic.objectUrl);
  renderGraphics();
  rebuildDecals();
}

function fieldSelect(label, options, value, onChange) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";
  wrapper.textContent = label;
  const select = document.createElement("select");
  for (const optionData of options) {
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.label;
    option.selected = optionData.value === value;
    select.appendChild(option);
  }
  select.addEventListener("change", () => onChange(select.value));
  wrapper.appendChild(select);
  return wrapper;
}

function graphicSlider(container, graphic, key, label, min, max, step = 1, suffix = "%") {
  slider(container, `graphic-${graphic.id}-${key}`, label, min, max, step, graphic[key], (value) => { graphic[key] = value; rebuildDecals(); }, suffix);
}

function renderGraphics() {
  dom["graphics-list"].innerHTML = "";
  const labels = { logo: "Logo", sponsor: "Sponsor", patch: "Patch / scudetto", badge: "Badge" };
  for (const graphic of state.graphics) {
    const card = document.createElement("div");
    card.className = "graphic-card";
    const head = document.createElement("div");
    head.className = "graphic-head";
    const title = document.createElement("strong");
    title.textContent = `${labels[graphic.type]} #${graphic.id}`;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-btn";
    remove.textContent = "Rimuovi";
    remove.addEventListener("click", () => removeGraphic(graphic.id));
    head.append(title, remove);

    const grid = document.createElement("div");
    grid.className = "graphic-grid";
    const fileLabel = document.createElement("label");
    fileLabel.className = "field wide";
    fileLabel.textContent = "Immagine (PNG trasparente consigliato)";
    const file = document.createElement("input");
    file.type = "file";
    file.accept = "image/png,image/jpeg,image/webp";
    file.addEventListener("change", () => {
      const selected = file.files?.[0];
      if (!selected) return;
      if (!IMAGE_TYPES.has(selected.type) || selected.size > MAX_IMAGE_BYTES) {
        setMessage(dom["graphics-message"], "Immagine non valida o oltre 8 MB.", "error");
        file.value = "";
        return;
      }
      if (graphic.objectUrl) URL.revokeObjectURL(graphic.objectUrl);
      const url = URL.createObjectURL(selected);
      const image = new Image();
      image.onload = () => {
        graphic.objectUrl = url;
        graphic.image = image;
        renderGraphics();
        rebuildDecals();
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        setMessage(dom["graphics-message"], "Immagine non leggibile.", "error");
      };
      image.src = url;
    });
    fileLabel.appendChild(file);
    grid.appendChild(fileLabel);
    grid.appendChild(fieldSelect("Superficie", SURFACES.map((surface) => ({ value: surface.id, label: surface.label })), graphic.surface, (value) => { graphic.surface = value; rebuildDecals(); }));

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    if (graphic.objectUrl) {
      const image = document.createElement("img");
      image.src = graphic.objectUrl;
      image.alt = "Anteprima grafica";
      thumb.appendChild(image);
    } else thumb.textContent = "Nessuna immagine";
    grid.appendChild(thumb);

    graphicSlider(grid, graphic, "x", "Orizzontale", 5, 95);
    graphicSlider(grid, graphic, "y", "Verticale", 5, 95);
    graphicSlider(grid, graphic, "scale", "Scala", 5, 75);
    graphicSlider(grid, graphic, "rotation", "Rotazione", -180, 180, 1, "°");
    graphicSlider(grid, graphic, "opacity", "Opacità", 0.1, 1, 0.05, "");
    card.append(head, grid);
    dom["graphics-list"].appendChild(card);
  }
  dom["graphics-count"].textContent = `${state.graphics.length} / ${MAX_GRAPHICS}`;
  const disabled = state.graphics.length >= MAX_GRAPHICS;
  for (const id of ["add-logo", "add-sponsor", "add-patch", "add-badge"]) dom[id].disabled = disabled;
}

function payload() {
  const p = state.personalization;
  return {
    v: 2,
    sport: "football",
    model: "procedural-kit-v2",
    colors: Object.fromEntries(PARTS.map((part) => [part.id, state.colors[part.id]])),
    patterns: Object.fromEntries(PARTS.map((part) => {
      const pattern = state.patterns[part.id];
      return [part.id, { image_present: Boolean(pattern.image), repeat: pattern.repeat, rotation: pattern.rotation, offset_x: pattern.offsetX, offset_y: pattern.offsetY, opacity: pattern.opacity }];
    })),
    personalization: {
      name: p.name,
      number: p.number,
      font: p.font,
      custom_font_present: p.customFontPresent,
      color: p.color,
      front_number_enabled: p.frontNumberEnabled,
      back_name: { ...p.backName },
      back_number: { ...p.backNumber },
      front_number: { ...p.frontNumber }
    },
    graphics: state.graphics.map((graphic) => ({ type: graphic.type, surface: graphic.surface, x: graphic.x, y: graphic.y, scale: graphic.scale, rotation: graphic.rotation, opacity: graphic.opacity, image_present: Boolean(graphic.image) }))
  };
}

function readableSummary() {
  const patterns = PARTS.filter((part) => state.patterns[part.id].image).map((part) => part.label);
  const graphics = state.graphics.filter((graphic) => graphic.image).length;
  return [
    `Nome: ${state.personalization.name || "—"}`,
    `Numero/caratteri: ${state.personalization.number || "—"}`,
    `Font: ${FONTS[state.personalization.font]?.label || state.personalization.font}`,
    `Fantasie caricate: ${patterns.length ? patterns.join(", ") : "nessuna"}`,
    `Loghi/sponsor/patch caricati: ${graphics}`,
    `Numero fronte: ${state.personalization.frontNumberEnabled ? "Sì" : "No"}`
  ].join("\n");
}

function updateOutput() {
  const data = payload();
  window.__payload3d = data;
  dom.payload.value = JSON.stringify(data);
  dom.summary.innerHTML = `<strong>Configurazione corrente</strong><br>${readableSummary().split("\n").map(escapeHtml).join("<br>")}`;
}

async function copyPayload() {
  const original = "Copia codice preventivo";
  const text = dom.payload.value;
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else {
      dom.payload.focus();
      dom.payload.select();
      if (!document.execCommand("copy")) throw new Error("copy fallita");
    }
    dom["copy-payload"].textContent = "Copiato ✓";
    setMessage(dom["output-message"], "Codice configurazione copiato.", "ok");
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { dom["copy-payload"].textContent = original; }, 2000);
  } catch (error) {
    dom.payload.focus();
    dom.payload.select();
    setMessage(dom["output-message"], "Copia automatica non riuscita: il codice resta selezionato.", "error");
  }
}

function sendEmail() {
  const subject = "Preventivo kit sportivo — [ATTIVITA]";
  const body = `Attività: [ATTIVITA]\n\n${readableSummary()}\n\nContatto: [TEL]\n\nCodice configurazione: ${JSON.stringify(window.__payload3d)}`;
  window.location.href = `mailto:${encodeURIComponent("[EMAIL_ATTIVITA]")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function wireUi() {
  for (const part of PARTS) {
    const option = document.createElement("option");
    option.value = part.id;
    option.textContent = part.label;
    dom["pattern-part"].appendChild(option);
  }
  buildPatternControls();
  dom["pattern-part"].addEventListener("change", () => { dom["pattern-file"].value = ""; buildPatternControls(); setMessage(dom["pattern-message"], ""); });
  dom["pattern-file"].addEventListener("change", () => handlePatternFile(dom["pattern-file"].files?.[0]));
  dom["pattern-clear"].addEventListener("click", clearPattern);

  buildFontOptions();
  dom["player-name"].addEventListener("input", () => { const value = cleanText(dom["player-name"].value, 24); dom["player-name"].value = value; state.personalization.name = value; rebuildDecals(); });
  dom["player-number"].addEventListener("input", () => { const value = cleanText(dom["player-number"].value, 6); dom["player-number"].value = value; state.personalization.number = value; rebuildDecals(); });
  dom["player-font"].addEventListener("change", () => { state.personalization.font = dom["player-font"].value; rebuildDecals(); });
  dom["print-color"].addEventListener("input", () => { state.personalization.color = safeColor(dom["print-color"].value); rebuildDecals(); });
  dom["custom-font-file"].addEventListener("change", () => loadCustomFont(dom["custom-font-file"].files?.[0]));
  dom["front-number-toggle"].addEventListener("change", () => { state.personalization.frontNumberEnabled = dom["front-number-toggle"].checked; dom["front-number-card"].hidden = !state.personalization.frontNumberEnabled; rebuildDecals(); });

  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  dom["add-logo"].addEventListener("click", () => addGraphic("logo"));
  dom["add-sponsor"].addEventListener("click", () => addGraphic("sponsor"));
  dom["add-patch"].addEventListener("click", () => addGraphic("patch"));
  dom["add-badge"].addEventListener("click", () => addGraphic("badge"));
  dom["copy-payload"].addEventListener("click", copyPayload);
  dom["send-email"].addEventListener("click", sendEmail);
}

function disposeRuntimeObjects() {
  for (const pattern of Object.values(state.patterns)) if (pattern.objectUrl) URL.revokeObjectURL(pattern.objectUrl);
  for (const graphic of state.graphics) if (graphic.objectUrl) URL.revokeObjectURL(graphic.objectUrl);
  if (customFontUrl) URL.revokeObjectURL(customFontUrl);
}

function main() {
  buildPartColors();
  buildPersonalizationControls();
  renderGraphics();
  wireUi();
  updateOutput();
  initThree();
  PARTS.forEach((part) => updatePartAppearance(part.id));
  rebuildDecals();
  dom["loading-overlay"].hidden = true;
  setStatus("Divisa 3D pronta — 360°", "ready");
  window.addEventListener("beforeunload", disposeRuntimeObjects);
  window.__sportswear3d = {
    state,
    setView,
    rebuildDecals,
    payload,
    model: "procedural-kit-v2",
    surfaces: SURFACES.map((surface) => surface.id),
    parts: PARTS.map((part) => part.id)
  };
}

try { main(); }
catch (error) {
  console.error(error);
  dom["loading-title"].textContent = "Errore configuratore";
  dom["loading-copy"].textContent = String(error?.message || error);
  dom["loading-overlay"].hidden = false;
  setStatus("Errore configuratore", "error");
}
