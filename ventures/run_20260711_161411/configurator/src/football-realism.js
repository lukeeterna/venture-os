import * as THREE from "three";

const VERSION = "football-realism-v6-physical-20260822";
const REFERENCE_SHIRT_BACK_CM = 74.5;
const TEXT_CANVAS = Object.freeze({
  name: { aspect: 1400 / 420, glyphFill: 250 / 420 },
  number: { aspect: 1, glyphFill: 720 / 900 },
});

const TYPOGRAPHY_PRESETS = Object.freeze({
  "pl-2022-23": {
    label: "Premier League 2022/23 — riferimento reale",
    nameCm: 4.9,
    backNumberCm: 23,
    frontNumberCm: 12.5,
    font: "condensed",
    nameY: 20,
    numberY: 54,
    evidence: "Manchester City 2022/23 HAALAND: numero 23 cm, lettere 4,9 cm",
    evidenceType: "measured-real-kit-reference",
  },
  "serie-a-2024-27": {
    label: "Serie A 2024–27 — centro fascia normativa",
    nameCm: 5.0,
    backNumberCm: 27.5,
    frontNumberCm: 12.5,
    font: "condensed",
    nameY: 19,
    numberY: 53,
    evidence: "Lega Serie A: numero retro 25–30 cm; default 27,5 cm = centro fascia. Nome 5 cm = riferimento europeo reale.",
    evidenceType: "regulatory-range-midpoint+real-name-reference",
  },
  "uefa-2026": {
    label: "UEFA 2026 — centro fascia regolamentare",
    nameCm: 6.0,
    backNumberCm: 30,
    frontNumberCm: 12.5,
    font: "condensed",
    nameY: 18,
    numberY: 52,
    evidence: "UEFA 2026: numero uomini 25–35 cm, nome ≤7,5 cm, frontale 10–15 cm. 30/6/12,5 sono default nel range, non misure imposte.",
    evidenceType: "regulatory-range-derived-default",
  },
  "pl-2013-14": {
    label: "Premier League 2013/14 — riferimento Arsenal",
    nameCm: 5.0,
    backNumberCm: 26,
    frontNumberCm: 12.5,
    font: "impact",
    nameY: 20,
    numberY: 53,
    evidence: "Arsenal 2013/14 BENDTNER: numero 26 cm, lettere 5 cm",
    evidenceType: "measured-real-kit-reference",
  },
});

const COLLARS = Object.freeze({
  original: "Originale mesh",
  crew: "Crew rib sottile",
  v: "V-neck rib",
  polo: "Polo fold-over",
  "polo-button": "Polo con bottoni",
  "split-v": "Split V moderno",
  "retro-90": "Polo largo anni 90",
});

const PLACEMENTS = Object.freeze({
  crest: { label: "Crest squadra", surface: "shirt-front", x: 38, y: 29, scale: 13, button: "add-logo", evidence: "UEFA chest zone" },
  brand: { label: "Brand / manufacturer", surface: "shirt-front", x: 62, y: 29, scale: 10, button: "add-logo", evidence: "UEFA manufacturer chest position" },
  sponsor: { label: "Main sponsor", surface: "shirt-front", x: 50, y: 53, scale: 31, button: "add-sponsor", evidence: "UEFA torso sponsor zone" },
  "sleeve-patch": { label: "Sleeve patch", surface: "left-sleeve", x: 50, y: 40, scale: 18, button: "add-patch", evidence: "UEFA sleeve free zone" },
  "competition-badge": { label: "Competition badge", surface: "right-sleeve", x: 50, y: 34, scale: 19, button: "add-badge", evidence: "UEFA competition badge sleeve zone" },
  commemorative: { label: "Badge commemorativo", surface: "shirt-front", x: 50, y: 24, scale: 11, button: "add-patch", evidence: "UEFA team identification zone" },
});

const realism = {
  version: VERSION,
  typography: "pl-2022-23",
  collar: "original",
  collarColor: "#9bbcf0",
  crestInNumber: false,
  referenceShirtBackCm: REFERENCE_SHIRT_BACK_CM,
};

let api;
let state;
let scene;
let camera;
let renderer;
let shirt;
let socks;
let collarGroup;
let crestGroup;
let payloadRefreshQueued = false;
const raycaster = new THREE.Raycaster();

const clamp = (v, min, max) => Math.min(max, Math.max(min, Number(v) || 0));
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeColor = (value, fallback) => /^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : fallback;

async function waitReady() {
  for (let i = 0; i < 600; i++) {
    if (window.__sportswear3d?.ready && window.__footballRealismScene?.isScene && window.__footballRealismCamera?.isPerspectiveCamera) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

function disposeObject(object) {
  if (!object) return;
  object.traverse?.((node) => {
    node.geometry?.dispose?.();
    const materials = node.material ? (Array.isArray(node.material) ? node.material : [node.material]) : [];
    for (const material of materials) {
      if (material?.map?.userData?.footballRealismGenerated) material.map.dispose?.();
      material?.dispose?.();
    }
  });
  object.parent?.remove(object);
}

function removeLegacyGeometry() {
  for (const name of ["football-realism-lower", "football-realism-collar", "football-realism-crest-number"]) {
    const object = scene.getObjectByName(name);
    if (object) disposeObject(object);
  }
}

function hideCodeUi() {
  const textarea = document.getElementById("payload");
  const copy = document.getElementById("copy-payload");
  if (textarea) {
    textarea.hidden = true;
    textarea.setAttribute("aria-hidden", "true");
    textarea.tabIndex = -1;
  }
  if (copy) {
    copy.hidden = true;
    copy.setAttribute("aria-hidden", "true");
    copy.tabIndex = -1;
  }
}

function ensureFullSocks() {
  state.showSocks = true;
  const checkbox = document.getElementById("show-socks");
  if (checkbox && !checkbox.checked) {
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
  }
  if (socks) socks.visible = true;
}

function injectUi() {
  if (document.getElementById("football-realism-controls")) return;
  const graphicsSection = document.getElementById("graphics-list")?.closest("section");
  const panel = document.querySelector(".panel");
  if (!panel) return;
  const section = document.createElement("section");
  section.id = "football-realism-controls";
  section.innerHTML = `
    <header class="section-head"><h2>Football realism</h2><span>misure fisiche</span></header>
    <p class="help">I preset sotto usano centimetri documentati o range regolamentari dichiarati. Dopo l'applicazione X, Y, rotazione e scala restano modificabili.</p>
    <div class="subcard">
      <h3>Nome e numero</h3>
      <div class="fields two">
        <label>Riferimento
          <select id="football-typography">${Object.entries(TYPOGRAPHY_PRESETS).map(([id, preset]) => `<option value="${id}">${escapeHtml(preset.label)}</option>`).join("")}</select>
        </label>
        <label>Logo squadra nel numero
          <select id="crest-in-number"><option value="off">No</option><option value="on">Sì — usa il primo crest/logo</option></select>
        </label>
      </div>
      <div class="inline-actions"><button id="apply-football-typography" type="button">Applica misure reali</button></div>
      <p id="football-typography-note" class="help"></p>
    </div>
    <div class="subcard">
      <h3>Colletto</h3>
      <div class="fields two">
        <label>Tipo
          <select id="football-collar">${Object.entries(COLLARS).map(([id, label]) => `<option value="${id}">${escapeHtml(label)}</option>`).join("")}</select>
        </label>
        <label>Colore<input id="football-collar-color" type="color" value="${escapeHtml(realism.collarColor)}"></label>
      </div>
      <p class="help">Le varianti sono fasce/pannelli tessuto conformati alla superficie della maglia, non tubi o solidi sospesi.</p>
    </div>
    <div class="subcard">
      <h3>Preset posizioni</h3>
      <div class="add-row">${Object.entries(PLACEMENTS).map(([id, item]) => `<button type="button" data-place="${id}">+ ${escapeHtml(item.label)}</button>`).join("")}</div>
      <p id="football-placement-note" class="help">Il preset imposta solo la posizione iniziale; i controlli manuali della card restano l'autorità.</p>
    </div>`;
  if (graphicsSection) panel.insertBefore(section, graphicsSection);
  else panel.append(section);
}

function setControl(containerId, key, value, max = 130) {
  const input = document.querySelector(`#${containerId} input[data-key="${key}"]`);
  if (!input) return false;
  if (key === "scale") input.max = String(Math.max(max, Number(input.max) || 0, Math.ceil(value + 8)));
  input.value = String(value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

function shirtMetrics() {
  const box = new THREE.Box3().setFromObject(shirt);
  const size = box.getSize(new THREE.Vector3());
  const safeWidth = size.x * 0.68;
  const worldPerCm = size.y / REFERENCE_SHIRT_BACK_CM;
  return { box, size, safeWidth, worldPerCm };
}

function scaleForPhysicalHeight(targetCm, kind) {
  const metrics = shirtMetrics();
  const text = TEXT_CANVAS[kind];
  const targetWorldGlyphHeight = targetCm * metrics.worldPerCm;
  const overlayWorldHeight = targetWorldGlyphHeight / text.glyphFill;
  const overlayWorldWidth = overlayWorldHeight * text.aspect;
  return overlayWorldWidth / metrics.safeWidth * 100;
}

function estimatedPhysicalHeight(scale, kind) {
  const metrics = shirtMetrics();
  const text = TEXT_CANVAS[kind];
  const overlayWidth = metrics.safeWidth * scale / 100;
  const overlayHeight = overlayWidth / text.aspect;
  return overlayHeight * text.glyphFill / metrics.worldPerCm;
}

function applyTypography(id = realism.typography) {
  const preset = TYPOGRAPHY_PRESETS[id] || TYPOGRAPHY_PRESETS["pl-2022-23"];
  realism.typography = TYPOGRAPHY_PRESETS[id] ? id : "pl-2022-23";
  state.personalization.font = preset.font;
  const fontSelect = document.getElementById("player-font");
  if (fontSelect) {
    fontSelect.value = preset.font;
    fontSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }
  const nameScale = scaleForPhysicalHeight(preset.nameCm, "name");
  const backScale = scaleForPhysicalHeight(preset.backNumberCm, "number");
  const frontScale = scaleForPhysicalHeight(preset.frontNumberCm, "number");
  setControl("back-name-controls", "x", 50);
  setControl("back-name-controls", "y", preset.nameY);
  setControl("back-name-controls", "scale", Number(nameScale.toFixed(1)));
  setControl("back-name-controls", "rotation", 0);
  setControl("back-number-controls", "x", 50);
  setControl("back-number-controls", "y", preset.numberY);
  setControl("back-number-controls", "scale", Number(backScale.toFixed(1)));
  setControl("back-number-controls", "rotation", 0);
  setControl("front-number-controls", "x", 50);
  setControl("front-number-controls", "y", 48);
  setControl("front-number-controls", "scale", Number(frontScale.toFixed(1)));
  setControl("front-number-controls", "rotation", 0);
  const note = document.getElementById("football-typography-note");
  if (note) note.textContent = `${preset.evidence}. Render calibrato sul back-length 74,5 cm di una replica adidas adulto L 2026/27. Target: nome ${preset.nameCm} cm · numero retro ${preset.backNumberCm} cm · frontale ${preset.frontNumberCm} cm.`;
  refreshExtendedPayload();
}

function frontHit(localX, localDown) {
  const { box, size } = shirtMetrics();
  const x = (box.min.x + box.max.x) * 0.5 + localX * size.x;
  const y = box.max.y - localDown * size.y;
  const far = Math.max(size.x, size.y, size.z) * 3 + 2;
  raycaster.set(new THREE.Vector3(x, y, box.max.z + far), new THREE.Vector3(0, 0, -1));
  const meshes = [];
  shirt.traverse((node) => { if (node.isMesh) meshes.push(node); });
  const hit = raycaster.intersectObjects(meshes, false)[0];
  if (!hit) return null;
  const normal = (hit.face?.normal?.clone() || new THREE.Vector3(0, 0, 1)).transformDirection(hit.object.matrixWorld).normalize();
  if (normal.z < 0) normal.negate();
  return { point: hit.point.clone().add(normal.clone().multiplyScalar(0.012)), normal };
}

function collarMaterial() {
  return new THREE.MeshStandardMaterial({
    color: safeColor(realism.collarColor, state.colors.shirt),
    roughness: 0.88,
    metalness: 0,
    side: THREE.DoubleSide,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
}

function projectedRibbon(points, widthFraction = 0.014) {
  if (points.length < 2) return null;
  const { size } = shirtMetrics();
  const half = widthFraction * 0.5;
  const positions = [], normals = [], uvs = [], indices = [];
  for (let i = 0; i < points.length; i++) {
    const previous = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const tx = (next[0] - previous[0]) * size.x;
    const ty = (next[1] - previous[1]) * size.y;
    const length = Math.hypot(tx, ty) || 1;
    const ox = (-ty / length) * half;
    const oy = (tx / length) * half;
    const a = frontHit(points[i][0] + ox, points[i][1] + oy);
    const b = frontHit(points[i][0] - ox, points[i][1] - oy);
    if (!a || !b) return null;
    for (const hit of [a, b]) {
      positions.push(hit.point.x, hit.point.y, hit.point.z);
      normals.push(hit.normal.x, hit.normal.y, hit.normal.z);
    }
    uvs.push(i / (points.length - 1), 0, i / (points.length - 1), 1);
  }
  for (let i = 0; i < points.length - 1; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    indices.push(a, b, c, c, b, d);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  const mesh = new THREE.Mesh(geometry, collarMaterial());
  mesh.renderOrder = 11;
  mesh.userData.collarPart = "ribbon";
  return mesh;
}

function projectedPanel(points) {
  const hits = points.map(([x, y]) => frontHit(x, y));
  if (hits.some((hit) => !hit)) return null;
  const positions = [], normals = [];
  for (const hit of hits) {
    positions.push(hit.point.x, hit.point.y, hit.point.z);
    normals.push(hit.normal.x, hit.normal.y, hit.normal.z);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  const indices = [];
  for (let i = 1; i < points.length - 1; i++) indices.push(0, i, i + 1);
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  const mesh = new THREE.Mesh(geometry, collarMaterial());
  mesh.renderOrder = 10;
  mesh.userData.collarPart = "panel";
  return mesh;
}

function collarButton(x, y) {
  const hit = frontHit(x, y);
  if (!hit) return null;
  const { size } = shirtMetrics();
  const radius = size.x * 0.008;
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 8), new THREE.MeshStandardMaterial({ color: 0xe8e6df, roughness: 0.7, metalness: 0 }));
  mesh.position.copy(hit.point).add(hit.normal.clone().multiplyScalar(radius * 0.5));
  mesh.userData.collarPart = "button";
  return mesh;
}

function rebuildCollar() {
  if (collarGroup) disposeObject(collarGroup);
  collarGroup = new THREE.Group();
  collarGroup.name = "football-realism-collar-v6";
  scene.add(collarGroup);
  if (realism.collar === "original") return;
  const add = (mesh) => { if (mesh) collarGroup.add(mesh); };
  const crewArc = [[-0.105, 0.028], [-0.082, 0.043], [-0.045, 0.058], [0, 0.066], [0.045, 0.058], [0.082, 0.043], [0.105, 0.028]];
  if (realism.collar === "crew") {
    add(projectedRibbon(crewArc, 0.014));
  } else if (realism.collar === "v") {
    add(projectedRibbon([[-0.105, 0.030], [-0.055, 0.061], [0, 0.112]], 0.014));
    add(projectedRibbon([[0, 0.112], [0.055, 0.061], [0.105, 0.030]], 0.014));
  } else if (realism.collar === "split-v") {
    add(projectedRibbon([[-0.105, 0.030], [-0.052, 0.058], [-0.010, 0.101]], 0.013));
    add(projectedRibbon([[0.010, 0.101], [0.052, 0.058], [0.105, 0.030]], 0.013));
  } else if (realism.collar === "polo" || realism.collar === "polo-button") {
    add(projectedPanel([[-0.120, 0.030], [-0.010, 0.066], [-0.030, 0.153], [-0.134, 0.078]]));
    add(projectedPanel([[0.120, 0.030], [0.010, 0.066], [0.030, 0.153], [0.134, 0.078]]));
    add(projectedRibbon([[0, 0.075], [0, 0.166]], 0.010));
    if (realism.collar === "polo-button") {
      add(collarButton(0, 0.106));
      add(collarButton(0, 0.137));
    }
  } else if (realism.collar === "retro-90") {
    add(projectedPanel([[-0.145, 0.024], [-0.008, 0.060], [-0.040, 0.180], [-0.165, 0.090]]));
    add(projectedPanel([[0.145, 0.024], [0.008, 0.060], [0.040, 0.180], [0.165, 0.090]]));
    add(projectedRibbon([[0, 0.073], [0, 0.181]], 0.012));
  }
}

function currentFont() {
  if (state.personalization.font === "custom" && state.personalization.customFontFamily) return { family: `'${state.personalization.customFontFamily}'`, weight: 800 };
  const fonts = {
    impact: { family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif", weight: 900 },
    condensed: { family: "'Arial Narrow', 'Helvetica Neue Condensed', Arial, sans-serif", weight: 900 },
    geometric: { family: "Futura, Avenir, 'Century Gothic', Arial, sans-serif", weight: 800 },
    modern: { family: "Avenir Next, Avenir, Arial, sans-serif", weight: 800 },
    system: { family: "Inter, ui-sans-serif, system-ui, Arial, sans-serif", weight: 800 },
  };
  return fonts[state.personalization.font] || fonts.condensed;
}

function crestCanvas() {
  const source = state.graphics.find((graphic) => ["crest", "logo"].includes(graphic.type) && graphic.texture?.image);
  if (!source) return null;
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const image = source.texture.image;
  const iw = image.width || 512, ih = image.height || 512, cell = 175;
  for (const x of [255, 450, 645]) {
    const h = cell * ih / iw;
    ctx.drawImage(image, x - cell / 2, 655 - h / 2, cell, h);
  }
  const font = currentFont();
  ctx.globalCompositeOperation = "destination-in";
  ctx.font = `${font.weight} 720px ${font.family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(String(state.personalization.number || "10").slice(0, 6), 450, 455);
  ctx.globalCompositeOperation = "source-over";
  return canvas;
}

function backHit(xPct, yPct) {
  const box = new THREE.Box3().setFromObject(shirt);
  const size = box.getSize(new THREE.Vector3());
  const x = THREE.MathUtils.lerp(box.min.x + size.x * 0.16, box.max.x - size.x * 0.16, clamp(xPct, 0, 100) / 100);
  const y = THREE.MathUtils.lerp(box.max.y - size.y * 0.15, box.min.y + size.y * 0.15, clamp(yPct, 0, 100) / 100);
  const far = Math.max(size.x, size.y, size.z) * 3 + 2;
  raycaster.set(new THREE.Vector3(x, y, box.min.z - far), new THREE.Vector3(0, 0, 1));
  const meshes = [];
  shirt.traverse((node) => { if (node.isMesh) meshes.push(node); });
  const hit = raycaster.intersectObjects(meshes, false)[0];
  if (!hit) return null;
  const normal = (hit.face?.normal?.clone() || new THREE.Vector3(0, 0, -1)).transformDirection(hit.object.matrixWorld).normalize();
  if (normal.z > 0) normal.negate();
  return { point: hit.point.clone().add(normal.clone().multiplyScalar(0.016)), normal };
}

function rebuildCrestInNumber() {
  if (crestGroup) disposeObject(crestGroup);
  crestGroup = new THREE.Group();
  crestGroup.name = "football-realism-crest-number-v6";
  scene.add(crestGroup);
  if (!realism.crestInNumber) return;
  const canvas = crestCanvas();
  if (!canvas) return;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  texture.userData.footballRealismGenerated = true;
  const cfg = state.personalization.backNumber;
  const metrics = shirtMetrics();
  const overlayWidth = metrics.safeWidth * clamp(cfg.scale, 10, 130) / 100;
  const spanXPct = overlayWidth / metrics.safeWidth * 68;
  const spanYPct = spanXPct * 1.06;
  const cols = 10, rows = 12;
  const positions = [], normals = [], uvs = [], indices = [];
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const x = cfg.x + (col / cols - 0.5) * spanXPct;
      const y = cfg.y + (row / rows - 0.5) * spanYPct;
      const hit = backHit(x, y);
      if (!hit) { texture.dispose(); return; }
      positions.push(hit.point.x, hit.point.y, hit.point.z);
      normals.push(hit.normal.x, hit.normal.y, hit.normal.z);
      uvs.push(1 - col / cols, 1 - row / rows);
    }
  }
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const a = row * (cols + 1) + col, b = a + 1, c = a + cols + 1, d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.01, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -8, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 20;
  crestGroup.add(mesh);
}

function setGraphicCardValue(card, key, value) {
  if (!card) return;
  if (key === "surface") {
    const select = card.querySelector('[data-field="surface"]');
    if (select) { select.value = value; select.dispatchEvent(new Event("change", { bubbles: true })); }
    return;
  }
  const input = card.querySelector(`input[data-key="${key}"]`);
  if (input) { input.value = String(value); input.dispatchEvent(new Event("input", { bubbles: true })); }
}

function addPlacement(id) {
  const preset = PLACEMENTS[id];
  if (!preset) return;
  const button = document.getElementById(preset.button);
  if (!button) return;
  const before = state.graphics.length;
  button.click();
  if (state.graphics.length <= before) return;
  const graphic = state.graphics[state.graphics.length - 1];
  Object.assign(graphic, { type: id, surface: preset.surface, x: preset.x, y: preset.y, scale: preset.scale, rotation: 0 });
  const card = document.querySelector(`[data-graphic="${graphic.id}"]`);
  if (card) {
    const title = card.querySelector(".graphic-head strong");
    if (title) title.textContent = preset.label;
    for (const [key, value] of Object.entries({ surface: preset.surface, x: preset.x, y: preset.y, scale: preset.scale, rotation: 0 })) setGraphicCardValue(card, key, value);
  }
  const note = document.getElementById("football-placement-note");
  if (note) note.textContent = `${preset.label}: ${preset.evidence}. Da qui puoi cambiare X, Y, rotazione e scala.`;
  refreshExtendedPayload();
}

function realismPayload() {
  const preset = TYPOGRAPHY_PRESETS[realism.typography];
  return {
    version: VERSION,
    typography: {
      preset: realism.typography,
      target_name_height_cm: preset.nameCm,
      target_back_number_height_cm: preset.backNumberCm,
      target_front_number_height_cm: preset.frontNumberCm,
      evidence_type: preset.evidenceType,
      reference_shirt_back_cm: REFERENCE_SHIRT_BACK_CM,
      rendered_name_height_cm_estimate: Number(estimatedPhysicalHeight(state.personalization.backName.scale, "name").toFixed(2)),
      rendered_back_number_height_cm_estimate: Number(estimatedPhysicalHeight(state.personalization.backNumber.scale, "number").toFixed(2)),
    },
    collar: { type: realism.collar, color: realism.collarColor },
    crest_in_number: realism.crestInNumber,
    full_socks: state.showSocks,
    footwear: "none",
  };
}

function refreshExtendedPayload() {
  if (payloadRefreshQueued) return;
  payloadRefreshQueued = true;
  setTimeout(() => {
    payloadRefreshQueued = false;
    const payload = api.payload();
    window.__payload3d = payload;
    const textarea = document.getElementById("payload");
    if (textarea) textarea.value = JSON.stringify(payload, null, 2);
  }, 0);
}

function diagnosticsExtension() {
  const collar = scene.getObjectByName("football-realism-collar-v6");
  const crest = scene.getObjectByName("football-realism-crest-number-v6");
  return {
    version: VERSION,
    typography: realismPayload().typography,
    collar: realism.collar,
    collar_meshes: collar?.children?.length || 0,
    crest_in_number: realism.crestInNumber,
    crest_number_meshes: crest?.children?.length || 0,
    full_socks: Boolean(state.showSocks && socks?.visible),
    footwear: "none",
    payload_ui_hidden: Boolean(document.getElementById("payload")?.hidden && document.getElementById("copy-payload")?.hidden),
  };
}

function wrapApi() {
  const basePayload = api.payload.bind(api);
  const baseDiagnostics = api.diagnostics.bind(api);
  api.payload = () => ({ ...basePayload(), realism: realismPayload() });
  api.diagnostics = () => ({ ...baseDiagnostics(), football_realism: diagnosticsExtension() });
  api.realism = realism;
  api.applyFootballTypography = applyTypography;
  api.rebuildFootballCollar = rebuildCollar;
  api.rebuildCrestInNumber = rebuildCrestInNumber;
}

function bindUi() {
  const typography = document.getElementById("football-typography");
  if (typography) {
    typography.value = realism.typography;
    typography.addEventListener("change", (event) => { realism.typography = event.target.value; });
  }
  document.getElementById("apply-football-typography")?.addEventListener("click", () => applyTypography(typography?.value));
  const collar = document.getElementById("football-collar");
  if (collar) {
    collar.value = realism.collar;
    collar.addEventListener("change", (event) => { realism.collar = event.target.value; rebuildCollar(); refreshExtendedPayload(); });
  }
  document.getElementById("football-collar-color")?.addEventListener("input", (event) => {
    realism.collarColor = safeColor(event.target.value, state.colors.shirt);
    rebuildCollar();
    refreshExtendedPayload();
  });
  document.getElementById("crest-in-number")?.addEventListener("change", (event) => {
    realism.crestInNumber = event.target.value === "on";
    rebuildCrestInNumber();
    refreshExtendedPayload();
  });
  document.querySelectorAll("[data-place]").forEach((button) => button.addEventListener("click", () => addPlacement(button.dataset.place)));
  const refresh = () => {
    if (realism.crestInNumber) setTimeout(rebuildCrestInNumber, 80);
    refreshExtendedPayload();
  };
  document.addEventListener("input", refresh);
  document.addEventListener("change", refresh);
  document.getElementById("shirt-color")?.addEventListener("input", () => {
    if (realism.collar === "original") realism.collarColor = state.colors.shirt;
  });
  const graphics = document.getElementById("graphics-list");
  if (graphics) new MutationObserver(refresh).observe(graphics, { childList: true, subtree: true });
}

function fitCameraToFullKit() {
  if (!camera) return;
  const target = new THREE.Vector3(0, -0.35, 0);
  const direction = camera.position.clone().sub(target);
  if (direction.lengthSq() < 1e-5) direction.set(0, 0, 1);
  direction.setLength(14.8);
  camera.position.copy(target).add(direction);
  camera.updateProjectionMatrix();
}

if (!(await waitReady())) {
  window.__footballRealismError = "football realism bootstrap timeout";
  throw new Error(window.__footballRealismError);
}
api = window.__sportswear3d;
state = api.state;
scene = window.__footballRealismScene;
camera = window.__footballRealismCamera;
renderer = window.__footballRealismRenderer;
shirt = scene.getObjectByName("donor-shirt");
socks = scene.getObjectByName("donor-socks");
if (!shirt || !socks) throw new Error("football realism: donor shirt/socks not found");
removeLegacyGeometry();
hideCodeUi();
ensureFullSocks();
injectUi();
wrapApi();
bindUi();
realism.collarColor = state.colors.shirt;
applyTypography(realism.typography);
rebuildCollar();
fitCameraToFullKit();
refreshExtendedPayload();
window.__footballRealismReady = true;
window.__footballRealismVersion = VERSION;
window.__footballRealismRenderer = renderer;
