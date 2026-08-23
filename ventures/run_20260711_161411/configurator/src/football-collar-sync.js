const VERSION = "football-collar-sync-v2-20260823";
let timer = null;

async function waitReady() {
  for (let i = 0; i < 600; i++) {
    if (window.__footballCollarTailorReady === true && window.__sportswear3d?.realism && typeof window.__sportswear3d?.rebuildFootballCollar === "function" && window.__footballRealismScene?.isScene) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

function disposeGroup(group) {
  if (!group) return;
  group.traverse?.((node) => {
    node.geometry?.dispose?.();
    const materials = node.material ? (Array.isArray(node.material) ? node.material : [node.material]) : [];
    materials.forEach((material) => material?.dispose?.());
  });
  group.parent?.remove(group);
}

function removeAllCollarGroups() {
  const scene = window.__footballRealismScene;
  if (!scene) return 0;
  const matches = scene.children.filter((child) => child?.name === "football-realism-collar-v6");
  matches.forEach(disposeGroup);
  return matches.length;
}

function syncFromUi(reason, delay = 130) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const api = window.__sportswear3d;
    const select = document.getElementById("football-collar");
    if (!api?.realism || !select) return;
    api.realism.collar = select.value || "original";
    const removed = removeAllCollarGroups();
    api.rebuildFootballCollar();
    window.__footballCollarSyncStatus = {
      version: VERSION,
      type: api.realism.collar,
      reason,
      removed_legacy_groups: removed,
    };
  }, delay);
}

if (await waitReady()) {
  document.addEventListener("change", (event) => {
    if (event.target?.id === "football-collar") syncFromUi("select-change");
  });
  document.addEventListener("input", (event) => {
    if (["football-collar-color", "shirt-color"].includes(event.target?.id)) syncFromUi("color-change");
  });
  window.__footballCollarSyncReady = true;
  window.__footballCollarSyncStatus = {
    version: VERSION,
    type: document.getElementById("football-collar")?.value || "original",
    reason: "bootstrap",
    removed_legacy_groups: 0,
  };
} else {
  window.__footballCollarSyncError = "football collar sync bootstrap timeout";
}
