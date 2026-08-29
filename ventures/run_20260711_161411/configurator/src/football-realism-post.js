import * as THREE from "three";

async function waitForRealism() {
  for (let i = 0; i < 240; i++) {
    if (window.__footballRealismReady && window.__sportswear3d?.realism && window.__footballRealismScene?.isScene) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

function fixLowerBodyGround() {
  const scene = window.__footballRealismScene;
  if (!scene) return;
  const socks = scene.getObjectByName("donor-socks");
  const lower = scene.getObjectByName("football-realism-lower");
  const ground = scene.children.find((o) => o.isMesh && o.geometry?.type === "PlaneGeometry" && o.material?.isShadowMaterial);
  if (!socks || !lower || !ground || !lower.children.length) return;
  scene.updateMatrixWorld(true);
  const socksBox = new THREE.Box3().setFromObject(socks);
  const lowerBox = new THREE.Box3().setFromObject(lower);
  ground.position.y = Math.min(socksBox.min.y, lowerBox.min.y) - 0.06;
}

function keepExtendedPayload() {
  const api = window.__sportswear3d;
  const textarea = document.getElementById("payload");
  if (!api?.payload || !textarea) return;
  const payload = api.payload();
  window.__payload3d = payload;
  textarea.value = JSON.stringify(payload, null, 2);
}

function addContrastRibOption() {
  const select = document.getElementById("football-collar");
  if (!select || select.querySelector('option[value="contrast-rib"]')) return;
  const option = document.createElement("option");
  option.value = "contrast-rib";
  option.textContent = "Rib a contrasto";
  select.insertBefore(option, select.querySelector('option[value="split"]'));
}

if (await waitForRealism()) {
  addContrastRibOption();
  const refresh = () => requestAnimationFrame(() => {
    fixLowerBodyGround();
    keepExtendedPayload();
  });
  document.addEventListener("input", refresh);
  document.addEventListener("change", () => setTimeout(refresh, 140));
  const graphics = document.getElementById("graphics-list");
  if (graphics) new MutationObserver(refresh).observe(graphics, { childList: true, subtree: true });
  refresh();
  setTimeout(refresh, 250);
  setTimeout(refresh, 700);
  window.__footballRealismPostReady = true;
}
