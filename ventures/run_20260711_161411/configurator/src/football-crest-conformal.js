import * as THREE from "three";

const VERSION = "football-crest-conformal-v3-20260823";
const raycaster = new THREE.Raycaster();
let scene;
let shirt;
let state;
let settleTimer = null;
let sourceRetryTimer = null;
let sourceRetryCount = 0;
const status = {
  version: VERSION,
  stage: "bootstrap",
  enabled: false,
  sourcePresent: false,
  alphaPixels: 0,
  vertices: 0,
  maxInward: 0,
  builds: 0,
  lastReason: null,
};

function publishStatus(patch = {}) {
  Object.assign(status, patch);
  window.__footballCrestConformalStatus = { ...status };
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

function removeAllCrestGroups() {
  let previous = scene?.getObjectByName("football-realism-crest-number-v6");
  while (previous) {
    disposeObject(previous);
    previous = scene?.getObjectByName("football-realism-crest-number-v6");
  }
}

function clearSourceRetry() {
  if (sourceRetryTimer) clearTimeout(sourceRetryTimer);
  sourceRetryTimer = null;
  sourceRetryCount = 0;
}

function retryMissingSource() {
  if (sourceRetryCount >= 10) return;
  sourceRetryCount += 1;
  if (sourceRetryTimer) clearTimeout(sourceRetryTimer);
  sourceRetryTimer = setTimeout(() => rebuild(`source-retry-${sourceRetryCount}`), 180 + sourceRetryCount * 90);
}

function currentFont() {
  if (state.personalization.font === "custom" && state.personalization.customFontFamily) {
    return { family: `'${state.personalization.customFontFamily}'`, weight: 800 };
  }
  const fonts = {
    impact: { family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif", weight: 900 },
    condensed: { family: "'Arial Narrow', 'Helvetica Neue Condensed', Arial, sans-serif", weight: 900 },
    geometric: { family: "Futura, Avenir, 'Century Gothic', Arial, sans-serif", weight: 800 },
    modern: { family: "Avenir Next, Avenir, Arial, sans-serif", weight: 800 },
    system: { family: "Inter, ui-sans-serif, system-ui, Arial, sans-serif", weight: 800 },
  };
  return fonts[state.personalization.font] || fonts.condensed;
}

function sourceGraphic() {
  return state.graphics.find((graphic) => ["crest", "logo"].includes(graphic.type) && graphic.texture?.image) || null;
}

function crestCanvas() {
  const source = sourceGraphic();
  publishStatus({ sourcePresent: Boolean(source) });
  if (!source) return null;
  const image = source.texture.image;
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 900;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.clearRect(0, 0, 900, 900);

  const iw = image.width || image.naturalWidth || 512;
  const ih = image.height || image.naturalHeight || 512;
  const numberText = String(state.personalization.number || "10").slice(0, 6);
  const glyphCount = Math.max(1, numberText.length);
  const slotWidth = Math.min(250, 620 / glyphCount);
  for (let i = 0; i < glyphCount; i++) {
    const x = 450 + (i - (glyphCount - 1) / 2) * slotWidth;
    const maxBox = Math.min(150, slotWidth * 0.64);
    const scale = Math.min(maxBox / Math.max(1, iw), maxBox / Math.max(1, ih));
    const w = Math.max(1, iw * scale);
    const h = Math.max(1, ih * scale);
    ctx.drawImage(image, x - w / 2, 610 - h / 2, w, h);
  }

  const font = currentFont();
  ctx.globalCompositeOperation = "destination-in";
  ctx.font = `${font.weight} 720px ${font.family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(numberText, 450, 455);
  ctx.globalCompositeOperation = "source-over";
  return canvas;
}

function rawBackHit(xPct, yPct) {
  const box = new THREE.Box3().setFromObject(shirt);
  const size = box.getSize(new THREE.Vector3());
  const x = THREE.MathUtils.lerp(box.min.x + size.x * 0.16, box.max.x - size.x * 0.16, THREE.MathUtils.clamp(xPct, 0, 100) / 100);
  const y = THREE.MathUtils.lerp(box.max.y - size.y * 0.15, box.min.y + size.y * 0.15, THREE.MathUtils.clamp(yPct, 0, 100) / 100);
  const far = Math.max(size.x, size.y, size.z) * 3 + 2;
  raycaster.set(new THREE.Vector3(x, y, box.min.z - far), new THREE.Vector3(0, 0, 1));
  const meshes = [];
  shirt.traverse((node) => { if (node.isMesh) meshes.push(node); });
  const hit = raycaster.intersectObjects(meshes, false)[0];
  if (!hit) return null;
  const normal = (hit.face?.normal?.clone() || new THREE.Vector3(0, 0, -1)).transformDirection(hit.object.matrixWorld).normalize();
  if (normal.z > 0) normal.negate();
  return { point: hit.point.clone().add(normal.clone().multiplyScalar(0.018)), normal };
}

function safeBackHit(xPct, yPct, centerX, centerY) {
  for (const inward of [0, 0.12, 0.25, 0.40, 0.60, 0.80]) {
    const x = THREE.MathUtils.lerp(xPct, centerX, inward);
    const y = THREE.MathUtils.lerp(yPct, centerY, inward);
    const hit = rawBackHit(x, y);
    if (hit) return { ...hit, inward };
  }
  const center = rawBackHit(centerX, centerY);
  return center ? { ...center, inward: 1 } : null;
}

function targetSpans() {
  const cfg = state.personalization.backNumber;
  const box = new THREE.Box3().setFromObject(shirt);
  const size = box.getSize(new THREE.Vector3());
  const safeWidth = size.x * 0.68;
  const overlayWidth = safeWidth * THREE.MathUtils.clamp(Number(cfg.scale) || 44, 10, 130) / 100;
  const widthPct = THREE.MathUtils.clamp(overlayWidth / safeWidth * 68, 16, 58);
  const heightPct = THREE.MathUtils.clamp(widthPct * 1.08, 20, 64);
  return { widthPct, heightPct };
}

function rebuild(reason = "manual") {
  publishStatus({ builds: status.builds + 1, lastReason: reason, stage: "start" });
  if (!scene || !shirt || !state) {
    publishStatus({ stage: "not-ready" });
    return;
  }
  const control = document.getElementById("crest-in-number");
  const enabled = window.__sportswear3d?.realism?.crestInNumber === true || control?.value === "on";
  if (window.__sportswear3d?.realism) window.__sportswear3d.realism.crestInNumber = enabled;
  publishStatus({ enabled });
  removeAllCrestGroups();

  const group = new THREE.Group();
  group.name = "football-realism-crest-number-v6";
  group.userData.conformalVersion = VERSION;
  scene.add(group);
  if (!enabled) {
    clearSourceRetry();
    publishStatus({ stage: "disabled", sourcePresent: false, alphaPixels: 0, vertices: 0, maxInward: 0 });
    return;
  }

  const canvas = crestCanvas();
  if (!canvas) {
    publishStatus({ stage: "waiting-source", alphaPixels: 0, vertices: 0 });
    retryMissingSource();
    return;
  }
  clearSourceRetry();
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const alpha = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let alphaPixels = 0;
  for (let i = 3; i < alpha.length; i += 4) if (alpha[i] > 20) alphaPixels++;
  publishStatus({ alphaPixels });
  if (alphaPixels < 1000) {
    publishStatus({ stage: "insufficient-alpha", vertices: 0 });
    return;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  texture.userData.footballRealismGenerated = true;

  const cfg = state.personalization.backNumber;
  const centerX = Number(cfg.x) || 50;
  const centerY = Number(cfg.y) || 52;
  const { widthPct, heightPct } = targetSpans();
  const cols = 8;
  const rows = 10;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  let maxInward = 0;

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const u = col / cols;
      const v = row / rows;
      const x = centerX + (u - 0.5) * widthPct;
      const y = centerY + (v - 0.5) * heightPct;
      const hit = safeBackHit(x, y, centerX, centerY);
      if (!hit) {
        texture.dispose();
        disposeObject(group);
        publishStatus({ stage: "projection-miss", vertices: positions.length / 3, maxInward });
        return;
      }
      maxInward = Math.max(maxInward, Number(hit.inward) || 0);
      positions.push(hit.point.x, hit.point.y, hit.point.z);
      normals.push(hit.normal.x, hit.normal.y, hit.normal.z);
      uvs.push(1 - u, 1 - v);
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

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.01,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -10,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "football-realism-crest-number-v6-mesh";
  mesh.renderOrder = 30;
  mesh.userData.alphaPixels = alphaPixels;
  mesh.userData.maxInward = maxInward;
  group.add(mesh);
  publishStatus({ stage: "built", vertices: positions.length / 3, maxInward });
}

function settle(reason, delay = 180) {
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => rebuild(reason), delay);
}

async function waitReady() {
  for (let i = 0; i < 600; i++) {
    if (window.__footballRealismReady === true && window.__sportswear3d?.state && window.__footballRealismScene?.isScene) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

publishStatus();
if (await waitReady()) {
  scene = window.__footballRealismScene;
  state = window.__sportswear3d.state;
  shirt = scene.getObjectByName("donor-shirt");
  if (!shirt) throw new Error("football crest conformal: donor shirt not found");

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target?.id === "crest-in-number") {
      const enabled = target.value === "on";
      if (window.__sportswear3d?.realism) window.__sportswear3d.realism.crestInNumber = enabled;
      sourceRetryCount = 0;
      settle("crest-select-delegated", 220);
      return;
    }
    if (target?.matches?.('input[type="file"]') && (window.__sportswear3d?.realism?.crestInNumber || document.getElementById("crest-in-number")?.value === "on")) {
      sourceRetryCount = 0;
      settle("graphic-file-change", 320);
      return;
    }
    if (window.__sportswear3d?.realism?.crestInNumber) settle("document-change", 180);
  }, true);
  document.addEventListener("input", (event) => {
    if (event.target?.id === "crest-in-number") return;
    if (window.__sportswear3d?.realism?.crestInNumber) settle("document-input", 180);
  }, true);
  const graphics = document.getElementById("graphics-list");
  if (graphics) new MutationObserver(() => {
    if (window.__sportswear3d?.realism?.crestInNumber || document.getElementById("crest-in-number")?.value === "on") settle("graphics-mutation", 220);
  }).observe(graphics, { childList: true, subtree: true });

  window.__sportswear3d.rebuildCrestInNumber = () => rebuild("api");
  window.__footballCrestConformalReady = true;
  publishStatus({ stage: "ready" });
  settle("bootstrap", 0);
} else {
  window.__footballCrestConformalError = "football crest conformal bootstrap timeout";
  publishStatus({ stage: "bootstrap-timeout" });
}
