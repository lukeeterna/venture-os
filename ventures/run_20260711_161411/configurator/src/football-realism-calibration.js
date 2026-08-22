import * as THREE from "three";

const NAME_SCALE = Object.freeze({ "uefa-2026": 46, "europe-1990s": 48, "europe-modern": 44 });
const raycaster = new THREE.Raycaster();
let queued = false;

async function waitReady() {
  for (let i = 0; i < 240; i++) {
    if (window.__footballRealismPostReady && window.__sportswear3d?.realism && window.__footballRealismScene?.isScene && window.__footballRealismCamera?.isPerspectiveCamera) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

function disposeChildren(group) {
  if (!group) return;
  for (const child of [...group.children]) {
    group.remove(child);
    child.geometry?.dispose?.();
    child.material?.map?.dispose?.();
    child.material?.dispose?.();
  }
}

function fitFullKit() {
  const camera = window.__footballRealismCamera;
  if (!camera) return;
  const target = new THREE.Vector3(0, 0.25, 0);
  const direction = camera.position.clone().sub(target);
  if (direction.lengthSq() < 1e-6) direction.set(0, 0, 1);
  direction.setLength(17.2);
  camera.position.copy(target).add(direction);
  camera.updateProjectionMatrix();
}

function calibrateName() {
  const api = window.__sportswear3d;
  const preset = api?.realism?.typography || "uefa-2026";
  const scale = NAME_SCALE[preset] || NAME_SCALE["uefa-2026"];
  const input = document.querySelector('#back-name-controls input[data-key="scale"]');
  if (!input || Number(input.value) === scale) return;
  input.value = String(scale);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function worldNormal(hit) {
  return (hit.face?.normal?.clone() || new THREE.Vector3(0, 0, -1)).transformDirection(hit.object.matrixWorld).normalize();
}

function shirtHit(shirt, xPct, yPct) {
  const b = new THREE.Box3().setFromObject(shirt);
  const s = b.getSize(new THREE.Vector3());
  const x = THREE.MathUtils.lerp(b.min.x + s.x * 0.16, b.max.x - s.x * 0.16, THREE.MathUtils.clamp(xPct, 0, 100) / 100);
  const y = THREE.MathUtils.lerp(b.max.y - s.y * 0.15, b.min.y + s.y * 0.15, THREE.MathUtils.clamp(yPct, 0, 100) / 100);
  const origin = new THREE.Vector3(x, y, b.min.z - s.z * 4 - 2);
  raycaster.set(origin, new THREE.Vector3(0, 0, 1));
  const meshes = [];
  shirt.traverse((o) => { if (o.isMesh) meshes.push(o); });
  const hit = raycaster.intersectObjects(meshes, false)[0];
  if (!hit) return null;
  const normal = worldNormal(hit);
  if (normal.z > 0) normal.negate();
  return hit.point.clone().add(normal.multiplyScalar(0.016));
}

function currentFont(state) {
  if (state.personalization.font === "custom" && state.personalization.customFontFamily) {
    return { family: `'${state.personalization.customFontFamily}'`, weight: 800 };
  }
  const fonts = {
    impact: { family: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif", weight: 900 },
    condensed: { family: "'Arial Narrow', 'Helvetica Neue Condensed', Arial, sans-serif", weight: 900 },
    geometric: { family: "Futura, Avenir, 'Century Gothic', Arial, sans-serif", weight: 800 },
    modern: { family: "Avenir Next, Avenir, Arial, sans-serif", weight: 800 },
    system: { family: "Inter, ui-sans-serif, system-ui, Arial, sans-serif", weight: 800 }
  };
  return fonts[state.personalization.font] || fonts.condensed;
}

function crestCanvas(state) {
  const source = state.graphics.find((g) => ["crest", "logo"].includes(g.type) && g.texture?.image);
  if (!source) return null;
  const text = String(state.personalization.number || "10").slice(0, 6);
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 900, 900);

  const image = source.texture.image;
  const iw = image.width || 512;
  const ih = image.height || 512;
  const cell = 210;
  for (let i = 0; i < 3; i++) {
    const x = 230 + i * 220;
    const y = 625;
    const h = cell * ih / iw;
    ctx.drawImage(image, x - cell / 2, y - h / 2, cell, h);
  }

  const font = currentFont(state);
  ctx.globalCompositeOperation = "destination-in";
  ctx.font = `${font.weight} 720px ${font.family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, 450, 455);
  ctx.globalCompositeOperation = "source-over";
  return canvas;
}

function rebuildVisibleCrest() {
  const api = window.__sportswear3d;
  const state = api?.state;
  const scene = window.__footballRealismScene;
  if (!state || !scene) return;
  const group = scene.getObjectByName("football-realism-crest-number");
  if (!group) return;
  disposeChildren(group);
  if (!api.realism?.crestInNumber) return;

  const canvas = crestCanvas(state);
  if (!canvas) return;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const shirt = scene.getObjectByName("donor-shirt");
  if (!shirt) { texture.dispose(); return; }
  const cfg = state.personalization.backNumber;
  const spanX = THREE.MathUtils.clamp(Number(cfg.scale) || 50, 12, 70) * 0.75;
  const spanY = spanX * 1.15;
  const cols = 8, rows = 10;
  const positions = [], uvs = [], indices = [];

  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const hit = shirtHit(shirt, cfg.x + (c / cols - 0.5) * spanX, cfg.y + (r / rows - 0.5) * spanY);
      if (!hit) { texture.dispose(); return; }
      positions.push(hit.x, hit.y, hit.z);
      uvs.push(1 - c / cols, 1 - r / rows);
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = r * (cols + 1) + c, b = a + 1, d = (r + 1) * (cols + 1) + c, e = d + 1;
      indices.push(a, d, b, b, d, e);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.01, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -8, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 20;
  mesh.userData.footballRealismCalibrated = true;
  group.add(mesh);
}

function refresh() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    rebuildVisibleCrest();
  });
}

if (await waitReady()) {
  fitFullKit();
  calibrateName();
  document.getElementById("apply-football-typography")?.addEventListener("click", () => setTimeout(calibrateName, 0));
  document.addEventListener("input", refresh);
  document.addEventListener("change", () => setTimeout(refresh, 180));
  const graphics = document.getElementById("graphics-list");
  if (graphics) new MutationObserver(refresh).observe(graphics, { childList: true, subtree: true });
  setTimeout(() => { fitFullKit(); calibrateName(); refresh(); }, 250);
  window.__footballRealismCalibrationReady = true;
}
