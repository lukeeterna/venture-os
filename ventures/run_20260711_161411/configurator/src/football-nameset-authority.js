import * as THREE from "three";

const VERSION = "football-nameset-authority-v1-20260823";
const REFERENCE_SHIRT_BACK_CM = 74.5;
const PROFILE = Object.freeze({
  id: "official-reference-2024",
  label: "Layout ufficiale · reference-match",
  nameCm: 4.9,
  backNumberCm: 27.0,
  frontNumberCm: 11.5,
  backNameBodyPct: 14.8,
  backNumberBodyPct: 42.3,
  frontNumberBodyPct: 38.4,
  expectedGapCm: 4.5,
  font: "condensed",
  defaultPrintColor: "#172033",
  evidence: "Founder-supplied official-shirt reference measured against UEFA 2026 equipment constraints",
});

// Advanced Y sliders are preserved for compatibility. The authority maps their
// values onto the actual shirt body instead of the legacy 15%-85% ray band.
// Chosen so y=8 -> 14.8% body and y=39 -> 42.3% body; the latter also keeps
// the existing crest-in-number projector aligned with the authoritative number.
const CONTROL_TO_BODY_A = 7.7032258065;
const CONTROL_TO_BODY_B = 0.8870967742;
const TEXT_CANVAS = Object.freeze({
  // Keep the exact same physical glyph width as the legacy 1400x420 canvas,
  // but crop transparent vertical padding so the projection does not sample
  // the open neckline above an otherwise valid official-style player name.
  name: { aspect: 1400 / 280, glyphFill: 250 / 280 },
  number: { aspect: 1, glyphFill: 720 / 900 },
});
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
let decalGroup;
let group;
let renderTimer = null;
let legacyWatchTimer = null;
let mode = "authority";
let advancedSynced = false;
let payloadWrapped = false;
let layout = null;
const raycaster = new THREE.Raycaster();

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const cleanText = (value, max) => String(value ?? "").replace(/[\r\n\t]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const bodyFromControlY = (value) => CONTROL_TO_BODY_A + CONTROL_TO_BODY_B * Number(value || 0);
const controlYFromBody = (value) => (Number(value) - CONTROL_TO_BODY_A) / CONTROL_TO_BODY_B;

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

function scaleForPhysicalHeight(targetCm, kind) {
  const metrics = shirtMetrics();
  const text = TEXT_CANVAS[kind];
  const overlayHeight = targetCm * metrics.worldPerCm / text.glyphFill;
  const overlayWidth = overlayHeight * text.aspect;
  return overlayWidth / metrics.safeWidth * 100;
}

function physicalHeightFromScale(scale, kind) {
  const metrics = shirtMetrics();
  const text = TEXT_CANVAS[kind];
  const overlayWidth = metrics.safeWidth * clamp(scale, 4, 140) / 100;
  const overlayHeight = overlayWidth / text.aspect;
  return overlayHeight * text.glyphFill / metrics.worldPerCm;
}

function initialLayout() {
  return {
    backName: { x: 50, bodyPct: PROFILE.backNameBodyPct, heightCm: PROFILE.nameCm, rotation: 0 },
    backNumber: { x: 50, bodyPct: PROFILE.backNumberBodyPct, heightCm: PROFILE.backNumberCm, rotation: 0 },
    frontNumber: { x: 50, bodyPct: PROFILE.frontNumberBodyPct, heightCm: PROFILE.frontNumberCm, rotation: 0 },
  };
}

function textTexture(text, kind) {
  const value = cleanText(text, kind === "name" ? 24 : 6) || (kind === "name" ? "ROSSI" : "10");
  const canvas = document.createElement("canvas");
  canvas.width = kind === "name" ? 1400 : 900;
  canvas.height = kind === "name" ? 280 : 900;
  const ctx = canvas.getContext("2d");
  const font = currentFont();
  let px = kind === "name" ? 250 : 720;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${font.weight} ${px}px ${font.family}`;
  while (ctx.measureText(value).width > canvas.width * 0.90 && px > 70) {
    px -= 8;
    ctx.font = `${font.weight} ${px}px ${font.family}`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(255,255,255,.16)";
  ctx.lineWidth = Math.max(1.5, px * 0.008);
  ctx.strokeText(value, canvas.width / 2, canvas.height / 2 + px * 0.02);
  ctx.fillStyle = state.personalization.color;
  ctx.fillText(value, canvas.width / 2, canvas.height / 2 + px * 0.02);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, window.__footballRealismRenderer?.capabilities?.getMaxAnisotropy?.() || 1);
  texture.needsUpdate = true;
  texture.userData.footballNamesetGenerated = true;
  return texture;
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
  return { point: hit.point.clone().add(normal.clone().multiplyScalar(0.016)), normal };
}

function buildGeometry(side, centerX, centerBodyPct, sizeX, sizeY, rotationDeg, cols, rows) {
  const { size, safeWidth } = shirtMetrics();
  const spanX = sizeX / safeWidth * 100;
  const spanY = sizeY / size.y * 100;
  const angle = THREE.MathUtils.degToRad(Number(rotationDeg) || 0);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const positions = [];
  const normals = [];
  const uvs = [];

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const dx = (col / cols - 0.5) * spanX;
      const dy = (row / rows - 0.5) * spanY;
      const rx = dx * cos - dy * sin;
      const ry = dx * sin + dy * cos;
      const hit = hitSurface(side, centerX + rx, centerBodyPct + ry);
      if (!hit) return null;
      positions.push(hit.point.x, hit.point.y, hit.point.z);
      normals.push(hit.normal.x, hit.normal.y, hit.normal.z);
      uvs.push(side === "back" ? 1 - col / cols : col / cols, 1 - row / rows);
    }
  }

  const indices = [];
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
  return geometry;
}

function disposeGroup() {
  if (!group) return;
  group.traverse((node) => {
    node.geometry?.dispose?.();
    node.material?.map?.dispose?.();
    node.material?.dispose?.();
  });
  group.parent?.remove(group);
  group = null;
}

function addTextMesh(side, slot, text, kind, name) {
  if (!cleanText(text, kind === "name" ? 24 : 6)) return null;
  const cfg = layout[slot];
  const metrics = shirtMetrics();
  const textDef = TEXT_CANVAS[kind];
  const overlayHeight = cfg.heightCm * metrics.worldPerCm / textDef.glyphFill;
  const overlayWidth = overlayHeight * textDef.aspect;
  const geometry = buildGeometry(
    side,
    cfg.x,
    cfg.bodyPct,
    overlayWidth,
    overlayHeight,
    cfg.rotation,
    kind === "name" ? 10 : 9,
    kind === "name" ? 3 : 8
  );
  if (!geometry) return null;
  const texture = textTexture(text, kind);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.015,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -8,
    roughness: 0.80,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.renderOrder = 22;
  mesh.userData.namesetAuthority = VERSION;
  mesh.userData.kind = kind;
  mesh.userData.slot = slot;
  group.add(mesh);
  return mesh;
}

function setLegacyTextVisible(visible) {
  if (!decalGroup) return;
  for (const child of decalGroup.children) {
    const map = child.material?.map;
    if (map?.userData?.generatedText === true) child.visible = visible;
  }
}

function renderedMeshMetrics(mesh, kind) {
  if (!mesh) return null;
  const shirtBox = new THREE.Box3().setFromObject(shirt);
  const shirtSize = shirtBox.getSize(new THREE.Vector3());
  const box = new THREE.Box3().setFromObject(mesh);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const centerBodyPct = (shirtBox.max.y - center.y) / shirtSize.y * 100;
  const overlayHeightCm = size.y / shirtSize.y * REFERENCE_SHIRT_BACK_CM;
  return {
    center_body_pct: Number(centerBodyPct.toFixed(2)),
    glyph_height_cm: Number((overlayHeightCm * TEXT_CANVAS[kind].glyphFill).toFixed(2)),
    overlay_height_cm: Number(overlayHeightCm.toFixed(2)),
  };
}

function collectMetrics() {
  const backName = renderedMeshMetrics(group?.getObjectByName("football-nameset-back-name"), "name");
  const backNumber = renderedMeshMetrics(group?.getObjectByName("football-nameset-back-number"), "number");
  const frontNumber = renderedMeshMetrics(group?.getObjectByName("football-nameset-front-number"), "number");
  let gapCm = null;
  if (backName && backNumber) {
    const nameCenterCm = backName.center_body_pct / 100 * REFERENCE_SHIRT_BACK_CM;
    const numberCenterCm = backNumber.center_body_pct / 100 * REFERENCE_SHIRT_BACK_CM;
    gapCm = numberCenterCm - backNumber.glyph_height_cm / 2 - (nameCenterCm + backName.glyph_height_cm / 2);
  }
  return {
    back_name: backName,
    back_number: backNumber,
    front_number: frontNumber,
    name_to_number_gap_cm: gapCm == null ? null : Number(gapCm.toFixed(2)),
  };
}

function publishStatus(extra = {}) {
  const status = {
    version: VERSION,
    mode,
    profile: PROFILE.id,
    profile_label: PROFILE.label,
    evidence: PROFILE.evidence,
    targets: {
      name_cm: PROFILE.nameCm,
      back_number_cm: PROFILE.backNumberCm,
      front_number_cm: PROFILE.frontNumberCm,
      back_name_body_pct: PROFILE.backNameBodyPct,
      back_number_body_pct: PROFILE.backNumberBodyPct,
      front_number_body_pct: PROFILE.frontNumberBodyPct,
      expected_gap_cm: PROFILE.expectedGapCm,
    },
    metrics: mode === "authority" ? collectMetrics() : null,
    legacy_text_hidden: mode === "authority" && Boolean(decalGroup?.children?.some?.((child) => child.material?.map?.userData?.generatedText && child.visible === false)),
    ...extra,
  };
  window.__footballNamesetStatus = status;
  return status;
}

function renderAuthority(reason = "manual") {
  if (mode !== "authority" || !scene || !shirt || !state) {
    disposeGroup();
    setLegacyTextVisible(true);
    publishStatus({ reason });
    return;
  }
  setLegacyTextVisible(false);
  disposeGroup();
  group = new THREE.Group();
  group.name = "football-nameset-authority";
  group.userData.namesetAuthority = VERSION;
  scene.add(group);
  addTextMesh("back", "backName", state.personalization.name, "name", "football-nameset-back-name");
  addTextMesh("back", "backNumber", state.personalization.number, "number", "football-nameset-back-number");
  if (state.personalization.frontNumberEnabled) {
    addTextMesh("front", "frontNumber", state.personalization.number, "number", "football-nameset-front-number");
  }
  scene.updateMatrixWorld(true);
  publishStatus({ reason });
}

function scheduleRender(reason, delay = 70) {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(() => renderAuthority(reason), delay);
}

function setControl(containerId, key, value, max = 140) {
  const input = document.querySelector(`#${containerId} input[data-key="${key}"]`);
  if (!input) return;
  if (key === "scale") input.max = String(Math.max(max, Number(input.max) || 0, Math.ceil(Number(value) + 8)));
  input.value = String(Number(value).toFixed(key === "scale" ? 1 : 0));
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function syncControlsToProfile() {
  if (!shirt || !state) return;
  advancedSynced = true;
  setControl("back-name-controls", "x", 50);
  setControl("back-name-controls", "y", controlYFromBody(PROFILE.backNameBodyPct));
  setControl("back-name-controls", "scale", scaleForPhysicalHeight(PROFILE.nameCm, "name"));
  setControl("back-name-controls", "rotation", 0);
  setControl("back-number-controls", "x", 50);
  setControl("back-number-controls", "y", 39);
  setControl("back-number-controls", "scale", scaleForPhysicalHeight(PROFILE.backNumberCm, "number"));
  setControl("back-number-controls", "rotation", 0);
  setControl("front-number-controls", "x", 50);
  setControl("front-number-controls", "y", controlYFromBody(PROFILE.frontNumberBodyPct));
  setControl("front-number-controls", "scale", scaleForPhysicalHeight(PROFILE.frontNumberCm, "number"));
  setControl("front-number-controls", "rotation", 0);
  state.personalization.font = PROFILE.font;
  const font = document.getElementById("player-font");
  if (font) { font.value = PROFILE.font; font.dispatchEvent(new Event("change", { bubbles: true })); }
  scheduleRender("sync-controls", 120);
}

function applyProfile({ syncControls = false } = {}) {
  mode = "authority";
  layout = initialLayout();
  if (state?.personalization?.color === "#ffffff") {
    state.personalization.color = PROFILE.defaultPrintColor;
    const color = document.getElementById("print-color");
    if (color) { color.value = PROFILE.defaultPrintColor; color.dispatchEvent(new Event("input", { bubbles: true })); }
  }
  if (state?.personalization) state.personalization.font = PROFILE.font;
  const font = document.getElementById("player-font");
  if (font) { font.value = PROFILE.font; font.dispatchEvent(new Event("change", { bubbles: true })); }
  if (syncControls) syncControlsToProfile();
  else scheduleRender("apply-profile", 120);
}

function useLegacy(reason = "legacy-preset") {
  mode = "legacy";
  disposeGroup();
  setLegacyTextVisible(true);
  publishStatus({ reason });
}

function updateLayoutFromAdvancedInput(target) {
  const container = target.closest?.("#back-name-controls,#back-number-controls,#front-number-controls");
  if (!container || mode !== "authority") return false;
  const slot = container.id === "back-name-controls" ? "backName" : container.id === "back-number-controls" ? "backNumber" : "frontNumber";
  const key = target.dataset.key;
  if (!key) return false;
  if (key === "x") layout[slot].x = Number(target.value);
  if (key === "y") layout[slot].bodyPct = bodyFromControlY(target.value);
  if (key === "rotation") layout[slot].rotation = Number(target.value);
  if (key === "scale") layout[slot].heightCm = physicalHeightFromScale(Number(target.value), slot === "backName" ? "name" : "number");
  scheduleRender(`advanced-${slot}-${key}`, 80);
  return true;
}

function wrapPayload() {
  if (payloadWrapped || !api?.payload || !api?.diagnostics) return;
  const basePayload = api.payload.bind(api);
  const baseDiagnostics = api.diagnostics.bind(api);
  api.payload = () => ({ ...basePayload(), nameset_layout: publishStatus() });
  api.diagnostics = () => ({ ...baseDiagnostics(), nameset_layout: publishStatus() });
  payloadWrapped = true;
}

async function waitReady() {
  for (let i = 0; i < 600; i++) {
    if (window.__sportswear3d?.ready && window.__footballRealismReady === true && window.__teamOrderReady === true && window.__footballRealismScene?.isScene) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

if (!(await waitReady())) {
  window.__footballNamesetError = "football nameset authority bootstrap timeout";
  throw new Error(window.__footballNamesetError);
}

api = window.__sportswear3d;
state = api.state;
scene = window.__footballRealismScene;
shirt = scene.getObjectByName("donor-shirt");
decalGroup = scene.getObjectByName("customization-decals");
if (!shirt || !decalGroup) throw new Error("football nameset authority: shirt/decal group missing");
layout = initialLayout();
wrapPayload();
applyProfile({ syncControls: false });

document.addEventListener("click", (event) => {
  if (event.target?.id === "apply-football-typography") useLegacy("legacy-typography-apply");
});
document.addEventListener("input", (event) => {
  if (updateLayoutFromAdvancedInput(event.target)) return;
  if (["player-name", "player-number", "player-font", "print-color", "front-number-toggle"].includes(event.target?.id)) scheduleRender(`input-${event.target.id}`, 90);
});
document.addEventListener("change", (event) => {
  if (["player-name", "player-number", "player-font", "print-color", "front-number-toggle", "custom-font-file"].includes(event.target?.id)) scheduleRender(`change-${event.target.id}`, 120);
  if (event.target?.id === "crest-in-number" && event.target.value === "on" && mode === "authority") {
    syncControlsToProfile();
  }
});

legacyWatchTimer = setInterval(() => {
  if (mode === "authority") setLegacyTextVisible(false);
}, 160);

api.namesetAuthority = {
  version: VERSION,
  profile: PROFILE,
  reset: () => applyProfile({ syncControls: advancedSynced }),
  syncControlsToProfile,
  useLegacy,
  get mode() { return mode; },
};
window.__footballNamesetAuthority = api.namesetAuthority;
window.__footballNamesetReady = true;
scheduleRender("bootstrap", 0);
