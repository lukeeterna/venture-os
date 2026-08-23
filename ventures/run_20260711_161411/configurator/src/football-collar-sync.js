const VERSION = "football-collar-sync-v1-20260823";
let timer = null;

async function waitReady() {
  for (let i = 0; i < 600; i++) {
    if (window.__footballCollarTailorReady === true && window.__sportswear3d?.realism && typeof window.__sportswear3d?.rebuildFootballCollar === "function") return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

function syncFromUi(reason, delay = 110) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const api = window.__sportswear3d;
    const select = document.getElementById("football-collar");
    if (!api?.realism || !select) return;
    api.realism.collar = select.value || "original";
    api.rebuildFootballCollar();
    window.__footballCollarSyncStatus = {
      version: VERSION,
      type: api.realism.collar,
      reason,
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
  window.__footballCollarSyncStatus = { version: VERSION, type: document.getElementById("football-collar")?.value || "original", reason: "bootstrap" };
} else {
  window.__footballCollarSyncError = "football collar sync bootstrap timeout";
}
