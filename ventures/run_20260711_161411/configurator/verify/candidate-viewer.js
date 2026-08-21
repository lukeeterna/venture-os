import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const MODELS = {
  collapsed: "../assets/vendor/football-shirt.glb",
  baked2: "../assets/vendor/football-shirt-baked2.glb",
  lower2: "../assets/vendor/football-shirt-lower2.glb",
  madjin: "../assets/vendor/football-shirt-madjin-apose2.glb"
};
const key = new URLSearchParams(location.search).get("model") || "collapsed";
const url = MODELS[key] || MODELS.collapsed;
document.getElementById("label").textContent = key;

const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1014);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xe7efff, 0x252a32, 0.8));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.1); keyLight.position.set(4, 7, 7); scene.add(keyLight);
const fill = new THREE.DirectionalLight(0xabc5ff, 1.0); fill.position.set(-5, 3, 4); scene.add(fill);
const rim = new THREE.DirectionalLight(0xd9e5ff, 1.2); rim.position.set(3, 4, -6); scene.add(rim);

const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
camera.position.set(0, 0.2, 11.5);
camera.lookAt(0, 0.25, 0);

function materialize(root, color) {
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = true; obj.receiveShadow = true;
    const src = Array.isArray(obj.material) ? obj.material : [obj.material];
    const mats = src.map((m) => {
      const n = m?.isMeshStandardMaterial || m?.isMeshPhysicalMaterial ? m.clone() : new THREE.MeshStandardMaterial();
      n.map = null; n.color.set(color); n.metalness = 0; n.roughness = Math.max(0.72, Number(n.roughness ?? 0.86)); n.envMapIntensity = 0.72; n.side = THREE.DoubleSide; n.needsUpdate = true;
      return n;
    });
    obj.material = Array.isArray(obj.material) ? mats : mats[0];
  });
}

function normalizeRoot(root, targetHeight) {
  root.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  root.scale.multiplyScalar(targetHeight / size.y);
  root.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(root);
}

const loader = new GLTFLoader();
try {
  const [shirtGltf, shortsGltf] = await Promise.all([loader.loadAsync(url), loader.loadAsync("../assets/vendor/football-shorts.glb")]);
  const shirt = shirtGltf.scene;
  const shorts = shortsGltf.scene;
  materialize(shirt, "#82a9e6");
  materialize(shorts, "#ffffff");
  scene.add(shirt, shorts);

  let sb = normalizeRoot(shirt, 4.35);
  shirt.position.y += 1.35 - sb.min.y;
  shirt.updateMatrixWorld(true);
  sb = new THREE.Box3().setFromObject(shirt);

  let qb = normalizeRoot(shorts, 1.85);
  shorts.position.y += (sb.min.y + 0.08) - qb.max.y;
  shorts.updateMatrixWorld(true);
  qb = new THREE.Box3().setFromObject(shorts);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.27 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = qb.min.y - 0.05; ground.receiveShadow = true; scene.add(ground);

  window.__candidate = { ready: true, key, shirtBounds: { min: sb.min.toArray(), max: sb.max.toArray(), size: sb.getSize(new THREE.Vector3()).toArray() }, shortsBounds: { min: qb.min.toArray(), max: qb.max.toArray(), size: qb.getSize(new THREE.Vector3()).toArray() } };
} catch (error) {
  console.error(error);
  window.__candidate = { ready: false, key, error: String(error?.stack || error) };
  document.getElementById("label").textContent = `${key}: ERROR`;
}

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener("resize", resize); resize();
(function loop(){ requestAnimationFrame(loop); renderer.render(scene,camera); })();
