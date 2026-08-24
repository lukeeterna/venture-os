import * as THREE from "three";

const VERSION = "football-neckline-structural-v1-20260824";
const topology = new WeakMap();
let scene;
let shirt;
let api;
let meshes = [];
let timer = null;

function frame() {
  scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(shirt);
  const size = box.getSize(new THREE.Vector3());
  return {
    box,
    size,
    cx: (box.min.x + box.max.x) * 0.5,
    yTop: box.max.y - size.y * 0.035,
  };
}

function capture() {
  for (const mesh of meshes) {
    const geometry = mesh.geometry;
    const position = geometry?.attributes?.position;
    if (!geometry || !position) continue;
    if (!geometry.index) geometry.setIndex(Array.from({ length: position.count }, (_, i) => i));
    topology.set(mesh, Array.from(geometry.index.array));
  }
}

function restore() {
  for (const mesh of meshes) {
    const base = topology.get(mesh);
    if (!base) continue;
    mesh.geometry.setIndex(base);
    mesh.geometry.index.needsUpdate = true;
    mesh.geometry.computeBoundingSphere?.();
  }
}

function profileFor(type, f) {
  const w = f.size.x;
  const h = f.size.y;
  if (type === "v") {
    return { kind: "v", topY: f.yTop + h * 0.014, bottomY: f.yTop - h * 0.130, topHalf: w * 0.100, bottomHalf: w * 0.003 };
  }
  if (type === "split-v") {
    return { kind: "split-v", topY: f.yTop + h * 0.014, bottomY: f.yTop - h * 0.086, topHalf: w * 0.084, bottomHalf: w * 0.010 };
  }
  if (["polo", "polo-button", "retro-90"].includes(type)) {
    const retro = type === "retro-90";
    return {
      kind: retro ? "retro-polo" : "polo",
      topY: f.yTop + h * 0.012,
      bottomY: f.yTop - h * (retro ? 0.120 : 0.102),
      topHalf: w * (retro ? 0.087 : 0.074),
      bottomHalf: w * (retro ? 0.030 : 0.023),
    };
  }
  return null;
}

function inside(point, profile, f) {
  if (!profile) return false;
  const frontZ = f.box.min.z + f.size.z * 0.58;
  if (point.z < frontZ || point.y < profile.bottomY || point.y > profile.topY) return false;
  const span = Math.max(1e-8, profile.topY - profile.bottomY);
  const t = THREE.MathUtils.clamp((point.y - profile.bottomY) / span, 0, 1);
  const half = THREE.MathUtils.lerp(profile.bottomHalf, profile.topHalf, t);
  return Math.abs(point.x - f.cx) <= half;
}

function cut(type) {
  restore();
  const f = frame();
  const profile = profileFor(type, f);
  if (!profile) {
    publish(type, null, 0, 0);
    return;
  }

  scene.updateMatrixWorld(true);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const center = new THREE.Vector3();
  let removed = 0;
  let keptCount = 0;

  for (const mesh of meshes) {
    const base = topology.get(mesh);
    const position = mesh.geometry?.attributes?.position;
    if (!base || !position) continue;
    const kept = [];
    for (let i = 0; i + 2 < base.length; i += 3) {
      const ia = base[i];
      const ib = base[i + 1];
      const ic = base[i + 2];
      a.fromBufferAttribute(position, ia).applyMatrix4(mesh.matrixWorld);
      b.fromBufferAttribute(position, ib).applyMatrix4(mesh.matrixWorld);
      c.fromBufferAttribute(position, ic).applyMatrix4(mesh.matrixWorld);
      center.copy(a).add(b).add(c).multiplyScalar(1 / 3);
      const vertexHits = Number(inside(a, profile, f)) + Number(inside(b, profile, f)) + Number(inside(c, profile, f));
      if (inside(center, profile, f) || vertexHits >= 2) {
        removed += 1;
      } else {
        kept.push(ia, ib, ic);
        keptCount += 1;
      }
    }
    mesh.geometry.setIndex(kept);
    mesh.geometry.index.needsUpdate = true;
    mesh.geometry.computeBoundingSphere?.();
  }

  publish(type, profile.kind, removed, keptCount);
  if (removed < 3) console.error(`football neckline structural cut failed for ${type}: removed=${removed}`);
}

function publish(type, profile, removed, remaining) {
  const active = Boolean(profile && removed > 0);
  window.__footballNecklineStructuralStatus = {
    version: VERSION,
    type,
    profile,
    structuralCut: active,
    removedTriangles: removed,
    remainingTriangles: remaining,
  };
  const tailor = window.__footballCollarTailorStatus;
  if (tailor && tailor.type === type) {
    tailor.structuralCut = active;
    tailor.removedTriangles = removed;
    tailor.structuralProfile = profile;
  }
}

function schedule(reason) {
  restore();
  clearTimeout(timer);
  timer = setTimeout(() => {
    const type = api?.realism?.collar || document.getElementById("football-collar")?.value || "original";
    cut(type);
    if (window.__footballNecklineStructuralStatus) window.__footballNecklineStructuralStatus.reason = reason;
  }, 155);
}

async function waitReady() {
  for (let i = 0; i < 600; i++) {
    if (window.__footballCollarTailorReady && window.__footballRealismScene?.isScene && window.__sportswear3d?.realism) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

if (await waitReady()) {
  scene = window.__footballRealismScene;
  api = window.__sportswear3d;
  shirt = scene.getObjectByName("donor-shirt");
  if (!shirt) throw new Error("football neckline structural: donor shirt not found");
  shirt.traverse((node) => { if (node.isMesh) meshes.push(node); });
  capture();

  const collar = document.getElementById("football-collar");
  const collarColor = document.getElementById("football-collar-color");
  const shirtColor = document.getElementById("shirt-color");
  collar?.addEventListener("change", () => schedule("collar-change"));
  collarColor?.addEventListener("input", () => schedule("collar-color"));
  shirtColor?.addEventListener("input", () => schedule("shirt-color"));

  const rebuild = api.rebuildFootballCollar;
  if (typeof rebuild === "function") {
    api.rebuildFootballCollar = (...args) => {
      restore();
      const result = rebuild(...args);
      schedule("api-rebuild");
      return result;
    };
  }

  window.__footballNecklineStructuralReady = true;
  schedule("bootstrap");
} else {
  window.__footballNecklineStructuralError = "football neckline structural bootstrap timeout";
}
