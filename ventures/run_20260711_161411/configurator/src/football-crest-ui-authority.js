const VERSION = "football-crest-ui-authority-v1-20260823";

async function waitReady() {
  for (let i = 0; i < 600; i++) {
    if (
      window.__footballCrestConformalReady === true &&
      window.__sportswear3d?.realism &&
      typeof window.__sportswear3d?.rebuildCrestInNumber === "function"
    ) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

function control() {
  return document.getElementById("crest-in-number");
}

function sync(reason) {
  const select = control();
  const api = window.__sportswear3d;
  if (!select || !api?.realism || typeof api.rebuildCrestInNumber !== "function") return;
  const enabled = select.value === "on";
  api.realism.crestInNumber = enabled;
  api.rebuildCrestInNumber();
  window.__footballCrestUiAuthorityStatus = {
    version: VERSION,
    enabled,
    value: select.value,
    reason,
    at: Date.now(),
  };
}

if (await waitReady()) {
  const select = control();
  if (!select) throw new Error("football crest UI authority: select not found");

  // Start from one coherent state. The product default is OFF and the select must
  // reflect the runtime state before a user or automation chooses ON.
  select.value = window.__sportswear3d.realism.crestInNumber === true ? "on" : "off";

  select.addEventListener("change", () => sync("select-change"));
  select.addEventListener("input", () => sync("select-input"));

  // Reconcile without depending on browser-specific select event behavior.
  let lastValue = select.value;
  setInterval(() => {
    const current = control();
    if (!current) return;
    if (current.value !== lastValue) {
      lastValue = current.value;
      sync("value-watch");
      return;
    }
    const enabled = current.value === "on";
    if (window.__sportswear3d.realism.crestInNumber !== enabled) sync("state-watch");
  }, 100);

  window.__footballCrestUiAuthorityReady = true;
  sync("bootstrap");
} else {
  window.__footballCrestUiAuthorityError = "football crest UI authority bootstrap timeout";
}
