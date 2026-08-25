import * as THREE from "three";

const VERSION = "football-neckline-structural-v8-20260825";
let scene;
let shirt;
let api;
let materials = [];
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
    frontZ: box.min.z + size.z * 0.58,
  };
}

function profileFor(type, f) {
  const w = f.size.x;
  const h = f.size.y;
  if (type === "v") {
    return {
      kind: "v",
      topY: f.yTop + h * 0.008,
      bottomY: f.yTop - h * 0.116,
      topHalf: w * 0.070,
      bottomHalf: 0,
    };
  }
  if (type === "split-v") {
    return {
      kind: "split-v",
      topY: f.yTop + h * 0.008,
      bottomY: f.yTop - h * 0.076,
      topHalf: w * 0.054,
      bottomHalf: w * 0.004,
    };
  }
  return null;
}

function shaderState(material) {
  material.userData.footballNeckline ||= {
    mode: 0,
    cx: 0,
    topY: 0,
    bottomY: 0,
    topHalf: 0,
    bottomHalf: 0,
    frontZ: 0,
    shader: null,
  };
  return material.userData.footballNeckline;
}

function installShaderClip(material) {
  if (!material || material.userData?.footballNecklineInstalled) return;
  const previousCompile = material.onBeforeCompile;
  const state = shaderState(material);

  material.onBeforeCompile = function onBeforeFootballNecklineCompile(shader, renderer) {
    previousCompile?.call(this, shader, renderer);
    shader.uniforms.uFootballNeckMode = { value: state.mode };
    shader.uniforms.uFootballNeckCx = { value: state.cx };
    shader.uniforms.uFootballNeckTopY = { value: state.topY };
    shader.uniforms.uFootballNeckBottomY = { value: state.bottomY };
    shader.uniforms.uFootballNeckTopHalf = { value: state.topHalf };
    shader.uniforms.uFootballNeckBottomHalf = { value: state.bottomHalf };
    shader.uniforms.uFootballNeckFrontZ = { value: state.frontZ };

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vFootballNeckWorldPosition;"
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvFootballNeckWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;"
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>\nvarying vec3 vFootballNeckWorldPosition;\nuniform float uFootballNeckMode;\nuniform float uFootballNeckCx;\nuniform float uFootballNeckTopY;\nuniform float uFootballNeckBottomY;\nuniform float uFootballNeckTopHalf;\nuniform float uFootballNeckBottomHalf;\nuniform float uFootballNeckFrontZ;`
      )
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>\nif (uFootballNeckMode > 0.5 && vFootballNeckWorldPosition.z > uFootballNeckFrontZ && vFootballNeckWorldPosition.y >= uFootballNeckBottomY && vFootballNeckWorldPosition.y <= uFootballNeckTopY) {\n  float neckSpan = max(0.000001, uFootballNeckTopY - uFootballNeckBottomY);\n  float neckT = clamp((vFootballNeckWorldPosition.y - uFootballNeckBottomY) / neckSpan, 0.0, 1.0);\n  float neckHalfWidth = mix(uFootballNeckBottomHalf, uFootballNeckTopHalf, neckT);\n  if (abs(vFootballNeckWorldPosition.x - uFootballNeckCx) < neckHalfWidth) discard;\n}`
      );

    state.shader = shader;
  };

  material.userData.footballNecklineInstalled = true;
  material.needsUpdate = true;
}

function syncUniforms(material, values) {
  const state = shaderState(material);
  Object.assign(state, values);
  const shader = state.shader;
  if (!shader) return;
  shader.uniforms.uFootballNeckMode.value = values.mode;
  shader.uniforms.uFootballNeckCx.value = values.cx;
  shader.uniforms.uFootballNeckTopY.value = values.topY;
  shader.uniforms.uFootballNeckBottomY.value = values.bottomY;
  shader.uniforms.uFootballNeckTopHalf.value = values.topHalf;
  shader.uniforms.uFootballNeckBottomHalf.value = values.bottomHalf;
  shader.uniforms.uFootballNeckFrontZ.value = values.frontZ;
}

function publish(type, profile, reason) {
  const active = Boolean(profile);
  const compiledMaterials = materials.filter((material) => shaderState(material).shader).length;
  window.__footballNecklineStructuralStatus = {
    version: VERSION,
    type,
    profile: profile?.kind || null,
    shaderClip: active,
    triangleCut: false,
    topologyMutated: false,
    edgeMode: "per-fragment-discard",
    patchedMaterials: materials.length,
    compiledMaterials,
    reason,
  };
  const tailor = window.__footballCollarTailorStatus;
  if (tailor && tailor.type === type) {
    tailor.shaderClip = active;
    tailor.triangleCut = false;
    tailor.structuralProfile = profile?.kind || null;
  }
}

function apply(type, reason) {
  const f = frame();
  const profile = profileFor(type, f);
  const values = profile
    ? {
        mode: 1,
        cx: f.cx,
        topY: profile.topY,
        bottomY: profile.bottomY,
        topHalf: profile.topHalf,
        bottomHalf: profile.bottomHalf,
        frontZ: f.frontZ,
      }
    : {
        mode: 0,
        cx: f.cx,
        topY: f.yTop,
        bottomY: f.yTop,
        topHalf: 0,
        bottomHalf: 0,
        frontZ: f.frontZ,
      };
  materials.forEach((material) => syncUniforms(material, values));
  publish(type, profile, reason);
}

function schedule(reason) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const type = document.getElementById("football-collar")?.value || api?.realism?.collar || "original";
    apply(type, reason);
  }, 175);
}

async function waitReady() {
  for (let i = 0; i < 600; i++) {
    const selectValue = document.getElementById("football-collar")?.value || "original";
    const synced = window.__footballCollarSyncReady === true && window.__footballCollarTailorStatus?.type === selectValue;
    if (synced && window.__footballRealismScene?.isScene && window.__sportswear3d?.realism) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

if (await waitReady()) {
  scene = window.__footballRealismScene;
  api = window.__sportswear3d;
  shirt = scene.getObjectByName("donor-shirt");
  if (!shirt) throw new Error("football neckline structural: donor shirt not found");

  const uniqueMaterials = new Set();
  shirt.traverse((node) => {
    if (!node.isMesh) return;
    const list = Array.isArray(node.material) ? node.material : [node.material];
    list.filter(Boolean).forEach((material) => uniqueMaterials.add(material));
  });
  materials = [...uniqueMaterials];
  materials.forEach(installShaderClip);

  const collar = document.getElementById("football-collar");
  const collarColor = document.getElementById("football-collar-color");
  const shirtColor = document.getElementById("shirt-color");
  collar?.addEventListener("change", () => schedule("collar-change"));
  collarColor?.addEventListener("input", () => schedule("collar-color"));
  shirtColor?.addEventListener("input", () => schedule("shirt-color"));

  window.__footballNecklineStructuralReady = true;
  schedule("bootstrap");
} else {
  window.__footballNecklineStructuralError = "football neckline structural bootstrap timeout";
}
