import * as THREE from "three";

const VERSION = "football-garment-finishing-v3-20260829";
let scene;
let shirt;
let shorts;
let shirtMaterials = [];
let shortsMaterials = [];
let hemGroup = null;
let hemMaterials = [];

const state = {
  sleeveTrim: false,
  shortsTrim: false,
  collarTrim: false,
  sleeveColor: "#10233f",
  shortsColor: "#10233f",
  collarColor: "#10233f",
};

function boxFrame(root) {
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  return { box, size, cx: (box.min.x + box.max.x) * 0.5 };
}

function uniqueMaterials(root) {
  const set = new Set();
  root.traverse((node) => {
    if (!node.isMesh) return;
    const list = Array.isArray(node.material) ? node.material : [node.material];
    list.filter(Boolean).forEach((material) => set.add(material));
  });
  return [...set];
}

function ensureState(material, kind) {
  material.userData.sportswearFinishing ||= { kind, shader: null, values: {} };
  return material.userData.sportswearFinishing;
}

function installWorldPosition(shader, fragmentDeclarations = "") {
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\nvarying vec3 vSportswearFinishWorldPosition;")
    .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSportswearFinishWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;");
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <common>",
    `#include <common>\nvarying vec3 vSportswearFinishWorldPosition;\n${fragmentDeclarations}`
  );
}

function patchShirtMaterial(material) {
  if (material.userData?.sportswearFinishingInstalled) return;
  const previous = material.onBeforeCompile;
  const finish = ensureState(material, "shirt");
  material.onBeforeCompile = function sportswearShirtFinish(shader, renderer) {
    previous?.call(this, shader, renderer);
    installWorldPosition(shader, `
uniform float uFinishShirtCx;
uniform float uFinishShirtMinY;
uniform float uFinishShirtMaxY;
uniform float uFinishShirtWidth;
uniform float uFinishSleeveTrim;
uniform float uFinishCollarTrim;
uniform vec3 uFinishSleeveColor;
uniform vec3 uFinishCollarColor;`);
    shader.uniforms.uFinishShirtCx = { value: 0 };
    shader.uniforms.uFinishShirtMinY = { value: 0 };
    shader.uniforms.uFinishShirtMaxY = { value: 1 };
    shader.uniforms.uFinishShirtWidth = { value: 1 };
    shader.uniforms.uFinishSleeveTrim = { value: 0 };
    shader.uniforms.uFinishCollarTrim = { value: 0 };
    shader.uniforms.uFinishSleeveColor = { value: new THREE.Color(state.sleeveColor) };
    shader.uniforms.uFinishCollarColor = { value: new THREE.Color(state.collarColor) };
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `#include <map_fragment>
float finishH = max(0.000001, uFinishShirtMaxY-uFinishShirtMinY);
float finishTop = (uFinishShirtMaxY-vSportswearFinishWorldPosition.y)/finishH;
float finishX = abs(vSportswearFinishWorldPosition.x-uFinishShirtCx)/max(0.000001,uFinishShirtWidth*0.5);
if (uFinishSleeveTrim > 0.5 && finishX > 0.53 && finishTop > 0.395 && finishTop < 0.455) diffuseColor.rgb = uFinishSleeveColor;
float neckX = abs(vSportswearFinishWorldPosition.x-uFinishShirtCx)/max(0.000001,uFinishShirtWidth);
float neckEllipse = sqrt(pow(neckX/0.115,2.0)+pow((finishTop-0.050)/0.046,2.0));
if (uFinishCollarTrim > 0.5 && neckEllipse > 0.88 && neckEllipse < 1.08) diffuseColor.rgb = uFinishCollarColor;`
    );
    finish.shader = shader;
    syncShirtMaterial(material);
  };
  material.userData.sportswearFinishingInstalled = true;
  material.needsUpdate = true;
}

function patchShortsMaterial(material) {
  if (material.userData?.sportswearFinishingInstalled) return;
  const previous = material.onBeforeCompile;
  const finish = ensureState(material, "shorts");
  material.onBeforeCompile = function sportswearShortsFinish(shader, renderer) {
    previous?.call(this, shader, renderer);
    installWorldPosition(shader, "uniform float uFinishShortHemY;");
    shader.uniforms.uFinishShortHemY = { value: -999 };
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <clipping_planes_fragment>",
      "#include <clipping_planes_fragment>\nif (vSportswearFinishWorldPosition.y < uFinishShortHemY) discard;"
    );
    finish.shader = shader;
    syncShortsMaterial(material);
  };
  material.userData.sportswearFinishingInstalled = true;
  material.needsUpdate = true;
}

function shortsHemFrame() {
  const f = boxFrame(shorts);
  const hemY = f.box.min.y + f.size.y * 0.055;
  const bandHeight = f.size.y * 0.072;
  return { ...f, hemY, bandHeight };
}

function disposeHemGroup() {
  if (!hemGroup) return;
  hemGroup.traverse((node) => {
    node.geometry?.dispose?.();
    if (node.material && !Array.isArray(node.material)) node.material.dispose?.();
  });
  hemGroup.removeFromParent();
  hemGroup = null;
  hemMaterials = [];
}

function buildShortHemBands() {
  disposeHemGroup();
  const f = shortsHemFrame();
  hemGroup = new THREE.Group();
  hemGroup.name = "sportswear-clean-short-hems";
  const centerY = f.hemY + f.bandHeight * 0.46;
  const offsetX = f.size.x * 0.245;
  const radiusX = f.size.x * 0.198;
  const radiusZ = f.size.z * 0.425;
  for (const sign of [-1, 1]) {
    const material = new THREE.MeshStandardMaterial({
      color: state.shortsTrim ? state.shortsColor : (window.__sportswear3d?.state?.colors?.shorts || "#ffffff"),
      roughness: 0.86,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const geometry = new THREE.CylinderGeometry(1, 1, f.bandHeight, 64, 1, true);
    const band = new THREE.Mesh(geometry, material);
    band.name = sign < 0 ? "sportswear-short-hem-left" : "sportswear-short-hem-right";
    band.position.set(f.cx + sign * offsetX, centerY, (f.box.min.z + f.box.max.z) * 0.5);
    band.scale.set(radiusX, 1, radiusZ);
    band.renderOrder = 8;
    band.castShadow = true;
    band.receiveShadow = true;
    hemGroup.add(band);
    hemMaterials.push(material);
  }
  scene.add(hemGroup);
  syncHemBands();
}

function syncHemBands() {
  const base = window.__sportswear3d?.state?.colors?.shorts || "#ffffff";
  hemMaterials.forEach((material) => {
    material.color.set(state.shortsTrim ? state.shortsColor : base);
    material.needsUpdate = true;
  });
}

function syncShirtMaterial(material) {
  const finish = ensureState(material, "shirt");
  const f = boxFrame(shirt);
  finish.values = { cx: f.cx, minY: f.box.min.y, maxY: f.box.max.y, width: f.size.x };
  const u = finish.shader?.uniforms;
  if (!u) return;
  const collar = document.getElementById("football-collar")?.value || "crew";
  u.uFinishShirtCx.value = f.cx;
  u.uFinishShirtMinY.value = f.box.min.y;
  u.uFinishShirtMaxY.value = f.box.max.y;
  u.uFinishShirtWidth.value = f.size.x;
  u.uFinishSleeveTrim.value = state.sleeveTrim ? 1 : 0;
  u.uFinishCollarTrim.value = state.collarTrim && (collar === "crew" || collar === "original") ? 1 : 0;
  u.uFinishSleeveColor.value.set(state.sleeveColor);
  u.uFinishCollarColor.value.set(state.collarColor);
}

function syncShortsMaterial(material) {
  const finish = ensureState(material, "shorts");
  const f = shortsHemFrame();
  finish.values = { hemY: f.hemY };
  const u = finish.shader?.uniforms;
  if (!u) return;
  u.uFinishShortHemY.value = f.hemY;
}

function syncAll() {
  shirtMaterials.forEach(syncShirtMaterial);
  shortsMaterials.forEach(syncShortsMaterial);
  syncHemBands();
  const existingCollarColor = document.getElementById("football-collar-color");
  if (existingCollarColor && state.collarTrim && existingCollarColor.value !== state.collarColor) {
    existingCollarColor.value = state.collarColor;
    existingCollarColor.dispatchEvent(new Event("input", { bubbles: true }));
  }
  publish();
}

function addStyles() {
  if (document.getElementById("sportswear-finishing-style")) return;
  const style = document.createElement("style");
  style.id = "sportswear-finishing-style";
  style.textContent = `
    .viewer-card>.viewbar{position:relative!important;left:auto!important;bottom:auto!important;transform:none!important;display:flex;justify-content:center;gap:8px;padding:10px 12px;margin:0;border:0;border-top:1px solid #ffffff12;border-radius:0;background:#0d1218}
    .viewer-card>.viewbar button{min-width:76px}
    #sportswear-finishing-controls .finish-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    #sportswear-finishing-controls .finish-card{padding:10px;border:1px solid #ffffff14;border-radius:11px;background:#111923}
    #sportswear-finishing-controls .finish-card label{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:750}
    #sportswear-finishing-controls .finish-card input[type=checkbox]{width:auto}
    #sportswear-finishing-controls .finish-card input[type=color]{margin-top:8px}
    @media(max-width:620px){.viewer-card>.viewbar{overflow:auto;justify-content:flex-start}.viewer-card>.viewbar button{min-width:70px}.viewer-shell{min-height:64vh!important}#sportswear-finishing-controls .finish-grid{grid-template-columns:1fr}}
  `;
  document.head.append(style);
}

function injectUi() {
  if (document.getElementById("sportswear-finishing-controls")) return;
  const colors = [...document.querySelectorAll(".panel>section")].find((section) => section.querySelector("h2")?.textContent?.trim() === "Colori divisa");
  if (!colors) return;
  const section = document.createElement("section");
  section.id = "sportswear-finishing-controls";
  section.innerHTML = `
    <header class="section-head"><h2>Bordi e finiture</h2><span>opzionali</span></header>
    <p class="help">Attiva solo i bordi desiderati. Il fondo pantaloncino usa sempre un hem liscio che maschera il bordo della mesh donor.</p>
    <div class="finish-grid">
      <div class="finish-card"><label><input id="finish-sleeve-on" type="checkbox"> Bordo maniche</label><input id="finish-sleeve-color" type="color" value="${state.sleeveColor}"></div>
      <div class="finish-card"><label><input id="finish-shorts-on" type="checkbox"> Bordo pantaloncini</label><input id="finish-shorts-color" type="color" value="${state.shortsColor}"></div>
      <div class="finish-card"><label><input id="finish-collar-on" type="checkbox"> Bordo colletto</label><input id="finish-collar-color" type="color" value="${state.collarColor}"></div>
    </div>`;
  colors.insertAdjacentElement("afterend", section);
  const bindings = [
    ["finish-sleeve-on", "sleeveTrim", "change", (e) => e.target.checked],
    ["finish-shorts-on", "shortsTrim", "change", (e) => e.target.checked],
    ["finish-collar-on", "collarTrim", "change", (e) => e.target.checked],
    ["finish-sleeve-color", "sleeveColor", "input", (e) => e.target.value],
    ["finish-shorts-color", "shortsColor", "input", (e) => e.target.value],
    ["finish-collar-color", "collarColor", "input", (e) => e.target.value],
  ];
  bindings.forEach(([id, key, event, read]) => document.getElementById(id)?.addEventListener(event, (e) => { state[key] = read(e); syncAll(); }));
  document.getElementById("shorts-color")?.addEventListener("input", () => setTimeout(syncHemBands, 0));
  document.getElementById("football-collar")?.addEventListener("change", () => setTimeout(syncAll, 180));
}

function simplifyCollarChoices() {
  const source = document.getElementById("football-collar");
  const easy = document.getElementById("easy-football-collar");
  if (!source || !easy) return;
  const allowed = new Set(["crew", "v"]);
  [...easy.options].forEach((option) => { if (!allowed.has(option.value)) option.remove(); });
  if (!allowed.has(easy.value)) {
    easy.value = "crew";
    source.value = "crew";
    source.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function publish() {
  const sf = shortsHemFrame();
  window.__sportswearFinishingStatus = {
    version: VERSION,
    ready: true,
    viewbarOutsideCanvas: !document.getElementById("viewer-shell")?.contains(document.querySelector(".viewbar")),
    cleanShortHem: true,
    shortHemY: Number(sf.hemY.toFixed(4)),
    hemMeshes: hemGroup?.children?.length || 0,
    simpleCollars: [...document.querySelectorAll("#easy-football-collar option")].map((option) => option.value),
    trims: { ...state },
    patchedShirtMaterials: shirtMaterials.length,
    patchedShortsMaterials: shortsMaterials.length,
    topologyMutated: false,
  };
}

async function waitReady() {
  for (let i = 0; i < 600; i++) {
    if (window.__sportswear3d?.ready && window.__footballRealismScene?.isScene && document.querySelector(".panel")) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

if (await waitReady()) {
  scene = window.__footballRealismScene;
  shirt = scene.getObjectByName("donor-shirt");
  shorts = scene.getObjectByName("donor-shorts");
  if (!shirt || !shorts) throw new Error("sportswear finishing: donor garment roots missing");
  shirtMaterials = uniqueMaterials(shirt);
  shortsMaterials = uniqueMaterials(shorts);
  shirtMaterials.forEach(patchShirtMaterial);
  shortsMaterials.forEach(patchShortsMaterial);
  buildShortHemBands();
  addStyles();
  injectUi();
  simplifyCollarChoices();
  syncAll();
  window.__sportswearFinishingReady = true;
  window.__sportswearFinishing = { state, sync: syncAll };
} else {
  window.__sportswearFinishingError = "sportswear finishing bootstrap timeout";
  throw new Error(window.__sportswearFinishingError);
}
