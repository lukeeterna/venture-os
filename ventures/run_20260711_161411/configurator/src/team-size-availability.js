const VERSION = "team-size-availability-v1-20260822";
let applying = false;
let observer;

function selectedFabric() {
  const order = window.__teamOrder;
  if (!order?.fabricSku) return null;
  return order.catalog?.fabrics?.find((fabric) => fabric.sku === order.fabricSku) || null;
}

function matrixForFabric(fabric) {
  const matrix = fabric?.size_matrix;
  return matrix && typeof matrix === "object" ? matrix : null;
}

function applyToSelect(select, allowed) {
  if (!select) return false;
  let changed = false;
  for (const option of select.options) {
    option.disabled = Array.isArray(allowed) && !allowed.includes(option.value);
  }
  if (Array.isArray(allowed) && allowed.length && !allowed.includes(select.value)) {
    const replacement = allowed.find((size) => Array.from(select.options).some((option) => option.value === size)) || "";
    if (replacement && replacement !== select.value) {
      select.value = replacement;
      changed = true;
    }
  }
  return changed;
}

function ensureMessage() {
  const section = document.getElementById("team-order-controls");
  if (!section) return null;
  let message = document.getElementById("team-size-availability-note");
  if (!message) {
    message = document.createElement("p");
    message.id = "team-size-availability-note";
    message.className = "help";
    const fabric = document.getElementById("team-fabric")?.closest(".team-order-grid")?.parentElement;
    (fabric || section).append(message);
  }
  return message;
}

function applyMatrix() {
  if (applying) return;
  applying = true;
  try {
    const fabric = selectedFabric();
    const matrix = matrixForFabric(fabric);
    const note = ensureMessage();
    let corrections = 0;

    document.querySelectorAll("#team-roster tbody tr").forEach((row) => {
      const category = row.querySelector('select[data-field="category"]')?.value;
      const allowed = matrix?.[category];
      const shirt = row.querySelector('select[data-field="shirtSize"]');
      const shorts = row.querySelector('select[data-field="shortsSize"]');
      const shirtChanged = applyToSelect(shirt, allowed);
      const shortsChanged = applyToSelect(shorts, allowed);
      if (shirtChanged) { corrections++; shirt.dispatchEvent(new Event("change", { bubbles: true })); }
      if (shortsChanged) { corrections++; shorts.dispatchEvent(new Event("change", { bubbles: true })); }
    });

    if (note) {
      if (!fabric) {
        note.textContent = "Scegli un tessuto per applicare la sua disponibilità taglie reale.";
      } else if (!matrix) {
        note.textContent = `${fabric.title || fabric.sku}: nessuna matrice taglie specifica pubblicata; resta valida la matrice generale.`;
      } else {
        const coverage = Object.entries(matrix).map(([category, sizes]) => `${category}: ${Array.isArray(sizes) ? sizes.join("/") : "—"}`).join(" · ");
        note.textContent = `${fabric.title || fabric.sku} · taglie pubblicate dal backoffice — ${coverage}${corrections ? ` · ${corrections} selezioni incompatibili riallineate.` : ""}`;
      }
    }
  } finally {
    applying = false;
  }
}

async function waitReady() {
  for (let i = 0; i < 1200; i++) {
    if (window.__teamOrderReady === true && document.getElementById("team-roster")) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

if (await waitReady()) {
  document.getElementById("team-fabric")?.addEventListener("change", () => setTimeout(applyMatrix, 0));
  document.getElementById("team-roster")?.addEventListener("change", () => setTimeout(applyMatrix, 0));
  const roster = document.getElementById("team-roster");
  if (roster) {
    observer = new MutationObserver(() => setTimeout(applyMatrix, 0));
    observer.observe(roster, { childList: true, subtree: true });
  }
  const originalFetch = window.fetch;
  window.addEventListener("focus", applyMatrix);
  window.__teamSizeAvailability = { version: VERSION, apply: applyMatrix, originalFetchPresent: typeof originalFetch === "function" };
  window.__teamSizeAvailabilityReady = true;
  setTimeout(applyMatrix, 50);
  setTimeout(applyMatrix, 500);
} else {
  window.__teamSizeAvailabilityError = "team-size availability bootstrap timeout";
}
