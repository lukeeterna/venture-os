const VERSION = "team-order-v1-20260822";

const CATEGORY_DEFS = Object.freeze({
  men: {
    label: "Adulti · Uomo",
    sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    guide: {
      S: "160–172 cm · torace 88–96 cm",
      M: "171–179 cm · torace 96–100 cm",
      L: "178–185 cm · torace 100–104 cm",
      XL: "183–190 cm · torace 104–108 cm",
      XXL: "188–195 cm · torace 108–112 cm",
      "3XL": "193–200 cm · torace 112–118 cm",
      "4XL": "198–205 cm · torace 118–124 cm",
      "5XL": "203–210 cm · torace 124–130 cm",
    },
  },
  women: {
    label: "Adulte · Donna / calcio femminile",
    sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
    guide: {
      XXS: "133–146 cm · torace 71–77 cm",
      XS: "147–160 cm · torace 77–83 cm",
      S: "159–168 cm · torace 84–88 cm",
      M: "167–175 cm · torace 88–92 cm",
      L: "173–181 cm · torace 92–96 cm",
      XL: "179–187 cm · torace 96–100 cm",
      XXL: "185–191 cm · torace 100–104 cm",
      "3XL": "188–194 cm · torace 104–110 cm",
      "4XL": "193–200 cm · torace 110–116 cm",
    },
  },
  boys: {
    label: "Bambini / ragazzi",
    sizes: ["5XS", "4XS", "3XS", "XXS", "XS", "S"],
    guide: {
      "5XS": "3–4 anni · 100–109 cm",
      "4XS": "5–6 anni · 110–119 cm",
      "3XS": "7–8 anni · 120–132 cm",
      XXS: "9–10 anni · 133–146 cm",
      XS: "11–12 anni · 147–160 cm",
      S: "13–14 anni · 160–172 cm",
    },
  },
  girls: {
    label: "Bambine / ragazze",
    sizes: ["5XS", "4XS", "3XS", "XXS", "XS", "S"],
    guide: {
      "5XS": "3–4 anni · 100–109 cm",
      "4XS": "5–6 anni · 110–119 cm",
      "3XS": "7–8 anni · 120–132 cm",
      XXS: "9–10 anni · 133–146 cm",
      XS: "11–12 anni · 147–160 cm",
      S: "13–14 anni · 160–172 cm",
    },
  },
});

const SOCK_SIZES = Object.freeze(["29/34", "35/38", "39/42", "43/46", "47/50"]);
const DEFAULT_SIZE = Object.freeze({ men: "M", women: "M", boys: "3XS", girls: "3XS" });
const ROLES = Object.freeze({ player: "Giocatore/trice", goalkeeper: "Portiere" });

const orderState = {
  version: VERSION,
  status: "draft",
  currency: "eur",
  fabricSku: "",
  roster: [],
  selectedPlayerId: null,
  catalog: { fabrics: [], personalizations: [], reachable: false, fetchedAt: null },
  quote: null,
  quoteState: "idle",
  nextId: 1,
};

let api;
let basePayload;
let baseDiagnostics;
let root;
let rosterNode;
let sizeGuideNode;
let fabricSelect;
let quoteNode;
let rosterSummaryNode;
let bulkDialog;
let importInput;
let refreshTimer;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clean = (value, max = 40) => String(value ?? "").replace(/[\r\n\t]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const categoryDef = (id) => CATEGORY_DEFS[id] || CATEGORY_DEFS.men;
const normalizeSize = (category, value) => categoryDef(category).sizes.includes(value) ? value : DEFAULT_SIZE[category] || categoryDef(category).sizes[0];
const totalQuantity = () => orderState.roster.reduce((sum, p) => sum + Math.max(1, Number(p.quantity) || 1), 0);

function backofficeBase() {
  return String(window.__SPORTSWEAR_BACKOFFICE_URL || "").replace(/\/$/, "");
}
function apiUrl(path) {
  return `${backofficeBase()}${path}`;
}

function addStyles() {
  if (document.getElementById("team-order-styles")) return;
  const style = document.createElement("style");
  style.id = "team-order-styles";
  style.textContent = `
    .team-order-toolbar,.team-order-actions{display:flex;flex-wrap:wrap;gap:.55rem;margin:.7rem 0}
    .team-order-table-wrap{overflow:auto;border:1px solid #28313d;border-radius:14px;background:#0d1117}
    .team-order-table{width:100%;border-collapse:collapse;min-width:1060px;font-size:.86rem}
    .team-order-table th,.team-order-table td{padding:.55rem;border-bottom:1px solid #222b36;vertical-align:middle;text-align:left}
    .team-order-table th{position:sticky;top:0;background:#111822;z-index:1;color:#aeb9c9;font-weight:650}
    .team-order-table input,.team-order-table select{width:100%;min-width:76px;background:#111822;border:1px solid #334154;color:#f5f7fb;border-radius:8px;padding:.45rem}
    .team-order-table input[data-field="name"]{min-width:150px}.team-order-table input[data-field="number"]{min-width:70px}
    .team-order-row-active{outline:2px solid #4f8cff;outline-offset:-2px}
    .team-order-danger{color:#ffaaa6}.team-order-ok{color:#65dfa9}.team-order-muted{color:#9aa7b8}
    .team-order-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem}
    .team-order-quote{border:1px solid #2c3745;border-radius:12px;padding:.8rem;margin-top:.7rem;background:#0d1117}
    .team-order-price{font-size:1.35rem;font-weight:800}.team-order-breakdown{display:grid;gap:.35rem;margin-top:.55rem}
    .team-order-size-guide{display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:.45rem;margin:.6rem 0}
    .team-order-size-chip{border:1px solid #2c3745;border-radius:10px;padding:.55rem;background:#111822}
    .team-order-size-chip strong{display:block}.team-order-warn{border-left:3px solid #e1a843;padding-left:.65rem}
    .team-order-dialog{width:min(720px,calc(100vw - 32px));background:#111822;color:#f5f7fb;border:1px solid #334154;border-radius:14px;padding:1rem}
    .team-order-dialog textarea{width:100%;min-height:220px;background:#0d1117;color:#f5f7fb;border:1px solid #334154;border-radius:10px;padding:.7rem}
    @media(max-width:760px){.team-order-grid{grid-template-columns:1fr}}
  `;
  document.head.append(style);
}

function playerTemplate(category = "men") {
  const id = orderState.nextId++;
  const size = DEFAULT_SIZE[category] || categoryDef(category).sizes[0];
  return {
    id,
    name: "",
    number: "",
    category,
    role: "player",
    shirtSize: size,
    shortsSize: size,
    socksSize: category === "boys" || category === "girls" ? "35/38" : "39/42",
    quantity: 1,
    notes: "",
  };
}

function addPlayer(category = "men", initial = {}) {
  const player = { ...playerTemplate(category), ...initial };
  player.category = CATEGORY_DEFS[player.category] ? player.category : category;
  player.shirtSize = normalizeSize(player.category, player.shirtSize);
  player.shortsSize = normalizeSize(player.category, player.shortsSize);
  if (!SOCK_SIZES.includes(player.socksSize)) player.socksSize = "39/42";
  player.quantity = Math.max(1, Math.min(99, Number(player.quantity) || 1));
  orderState.roster.push(player);
  if (!orderState.selectedPlayerId) orderState.selectedPlayerId = player.id;
  renderRoster();
  schedulePayloadRefresh();
  scheduleQuote();
  return player;
}

function removePlayer(id) {
  orderState.roster = orderState.roster.filter((p) => p.id !== id);
  if (orderState.selectedPlayerId === id) orderState.selectedPlayerId = orderState.roster[0]?.id || null;
  renderRoster();
  schedulePayloadRefresh();
  scheduleQuote();
}

function sizeOptions(category, selected) {
  return categoryDef(category).sizes.map((size) => `<option value="${size}"${size === selected ? " selected" : ""}>${size}</option>`).join("");
}

function categoryOptions(selected) {
  return Object.entries(CATEGORY_DEFS).map(([id, def]) => `<option value="${id}"${id === selected ? " selected" : ""}>${escapeHtml(def.label)}</option>`).join("");
}

function roleOptions(selected) {
  return Object.entries(ROLES).map(([id, label]) => `<option value="${id}"${id === selected ? " selected" : ""}>${escapeHtml(label)}</option>`).join("");
}

function duplicateNumbers() {
  const counts = new Map();
  for (const p of orderState.roster) {
    const number = clean(p.number, 6);
    if (!number) continue;
    counts.set(number, (counts.get(number) || 0) + 1);
  }
  return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([number]) => number));
}

function playerRow(player, duplicateSet) {
  const active = player.id === orderState.selectedPlayerId ? " team-order-row-active" : "";
  const duplicate = player.number && duplicateSet.has(player.number) ? `<span class="team-order-danger" title="Numero duplicato">⚠</span>` : "";
  return `<tr data-player="${player.id}" class="${active.trim()}">
    <td><input data-field="name" value="${escapeHtml(player.name)}" maxlength="32" placeholder="Cognome / nome"></td>
    <td><div style="display:flex;gap:.25rem;align-items:center"><input data-field="number" value="${escapeHtml(player.number)}" maxlength="6" placeholder="10">${duplicate}</div></td>
    <td><select data-field="category">${categoryOptions(player.category)}</select></td>
    <td><select data-field="role">${roleOptions(player.role)}</select></td>
    <td><select data-field="shirtSize">${sizeOptions(player.category, player.shirtSize)}</select></td>
    <td><select data-field="shortsSize">${sizeOptions(player.category, player.shortsSize)}</select></td>
    <td><select data-field="socksSize">${SOCK_SIZES.map((size) => `<option value="${size}"${size === player.socksSize ? " selected" : ""}>${size}</option>`).join("")}</select></td>
    <td><input data-field="quantity" type="number" min="1" max="99" value="${player.quantity}"></td>
    <td><button type="button" data-preview="${player.id}">Anteprima</button></td>
    <td><button type="button" data-remove="${player.id}" aria-label="Rimuovi giocatore">×</button></td>
  </tr>`;
}

function renderRosterSummary() {
  if (!rosterSummaryNode) return;
  const duplicateSet = duplicateNumbers();
  const categoryCounts = Object.keys(CATEGORY_DEFS).map((category) => {
    const quantity = orderState.roster.filter((p) => p.category === category).reduce((sum, p) => sum + p.quantity, 0);
    return quantity ? `${CATEGORY_DEFS[category].label}: ${quantity}` : null;
  }).filter(Boolean);
  const incomplete = orderState.roster.filter((p) => !clean(p.name) || !clean(p.number)).length;
  rosterSummaryNode.innerHTML = `<strong>${totalQuantity()} divise · ${orderState.roster.length} righe</strong><br>
    <span class="team-order-muted">${escapeHtml(categoryCounts.join(" · ") || "Nessun giocatore")}</span>
    ${duplicateSet.size ? `<br><span class="team-order-danger">Numeri duplicati: ${escapeHtml([...duplicateSet].join(", "))}</span>` : ""}
    ${incomplete ? `<br><span class="team-order-muted">${incomplete} righe senza nome o numero completo.</span>` : ""}`;
}

function renderRoster() {
  if (!rosterNode) return;
  const duplicates = duplicateNumbers();
  rosterNode.innerHTML = orderState.roster.length ? `<div class="team-order-table-wrap"><table class="team-order-table">
    <thead><tr><th>Giocatore</th><th>N°</th><th>Categoria</th><th>Ruolo</th><th>Maglia</th><th>Pantaloncino</th><th>Calze EU</th><th>Qtà</th><th>3D</th><th></th></tr></thead>
    <tbody>${orderState.roster.map((p) => playerRow(p, duplicates)).join("")}</tbody></table></div>` : `<p class="team-order-muted">Aggiungi i giocatori della squadra o importa il roster.</p>`;
  rosterNode.querySelectorAll("[data-player]").forEach((row) => {
    const id = Number(row.dataset.player);
    const player = orderState.roster.find((p) => p.id === id);
    if (!player) return;
    row.querySelectorAll("[data-field]").forEach((input) => input.addEventListener("change", () => {
      const field = input.dataset.field;
      if (field === "category") {
        player.category = input.value;
        player.shirtSize = normalizeSize(player.category, player.shirtSize);
        player.shortsSize = normalizeSize(player.category, player.shortsSize);
        renderRoster();
      } else if (field === "quantity") {
        player.quantity = Math.max(1, Math.min(99, Number(input.value) || 1));
        input.value = String(player.quantity);
      } else if (["name", "number", "notes"].includes(field)) {
        player[field] = clean(input.value, field === "number" ? 6 : 60);
      } else {
        player[field] = input.value;
      }
      renderRosterSummary();
      schedulePayloadRefresh();
      scheduleQuote();
    }));
    row.querySelectorAll('input[data-field="name"],input[data-field="number"]').forEach((input) => input.addEventListener("input", () => {
      const field = input.dataset.field;
      player[field] = clean(input.value, field === "number" ? 6 : 32);
      renderRosterSummary();
      schedulePayloadRefresh();
    }));
    row.querySelector("[data-preview]")?.addEventListener("click", () => previewPlayer(id));
    row.querySelector("[data-remove]")?.addEventListener("click", () => removePlayer(id));
  });
  renderRosterSummary();
}

function previewPlayer(id) {
  const player = orderState.roster.find((p) => p.id === id);
  if (!player) return;
  orderState.selectedPlayerId = id;
  const nameInput = document.getElementById("player-name");
  const numberInput = document.getElementById("player-number");
  if (nameInput) {
    nameInput.value = player.name || "ROSSI";
    nameInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
  if (numberInput) {
    numberInput.value = player.number || "10";
    numberInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
  api?.setView?.("back");
  renderRoster();
  schedulePayloadRefresh();
}

function renderSizeGuide(category = "men") {
  if (!sizeGuideNode) return;
  const def = categoryDef(category);
  sizeGuideNode.innerHTML = `<p class="help"><strong>${escapeHtml(def.label)}</strong>. Le misure sotto sono un riferimento teamwear; la disponibilità effettiva del modello/tessuto viene dal backoffice.</p>
    <div class="team-order-size-guide">${def.sizes.map((size) => `<div class="team-order-size-chip"><strong>${size}</strong><span>${escapeHtml(def.guide[size] || "Taglia comune; verifica scheda prodotto")}</span></div>`).join("")}</div>
    ${category === "girls" ? `<p class="help team-order-warn">La base youth è volutamente separata come categoria “bambine/ragazze”. Se il fornitore offre un taglio youth femminile dedicato, il backoffice può pubblicare una matrice specifica senza cambiare il roster.</p>` : ""}
    <p class="help">Calze: 29/34 · 35/38 · 39/42 · 43/46 · 47/50.</p>`;
}

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      row.push(cell); cell = "";
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function importCsvText(text) {
  const rows = parseCsv(text);
  if (!rows.length) return 0;
  const header = rows[0].map((v) => clean(v).toLowerCase());
  const hasHeader = header.some((v) => ["name", "nome", "player", "giocatore", "number", "numero"].includes(v));
  const body = hasHeader ? rows.slice(1) : rows;
  const findIndex = (...keys) => header.findIndex((h) => keys.includes(h));
  const indexes = hasHeader ? {
    name: findIndex("name", "nome", "player", "giocatore"),
    number: findIndex("number", "numero", "n"),
    category: findIndex("category", "categoria"),
    role: findIndex("role", "ruolo"),
    shirtSize: findIndex("shirt", "maglia", "shirt_size", "taglia_maglia"),
    shortsSize: findIndex("shorts", "pantaloncino", "shorts_size", "taglia_pantaloncino"),
    socksSize: findIndex("socks", "calze", "socks_size", "taglia_calze"),
    quantity: findIndex("quantity", "qty", "quantita", "quantità"),
  } : null;
  let imported = 0;
  for (const values of body) {
    const get = (field, fallbackIndex) => indexes ? (indexes[field] >= 0 ? values[indexes[field]] : "") : values[fallbackIndex];
    const rawCategory = clean(get("category", 2)).toLowerCase();
    const category = CATEGORY_DEFS[rawCategory] ? rawCategory : "men";
    addPlayer(category, {
      name: clean(get("name", 0), 32),
      number: clean(get("number", 1), 6),
      category,
      role: ["goalkeeper", "portiere"].includes(clean(get("role", 3)).toLowerCase()) ? "goalkeeper" : "player",
      shirtSize: clean(get("shirtSize", 4)).toUpperCase(),
      shortsSize: clean(get("shortsSize", 5)).toUpperCase(),
      socksSize: clean(get("socksSize", 6)),
      quantity: Number(get("quantity", 7)) || 1,
    });
    imported++;
  }
  return imported;
}

function importBulkText(text) {
  let count = 0;
  for (const line of text.split(/\r?\n/).map((v) => v.trim()).filter(Boolean)) {
    const values = line.split(/\t|;|\|/).map((v) => clean(v));
    const category = CATEGORY_DEFS[values[2]] ? values[2] : "men";
    addPlayer(category, {
      name: values[0] || "",
      number: values[1] || "",
      category,
      shirtSize: values[3] || DEFAULT_SIZE[category],
      shortsSize: values[4] || values[3] || DEFAULT_SIZE[category],
      socksSize: values[5] || (category === "boys" || category === "girls" ? "35/38" : "39/42"),
      role: ["portiere", "goalkeeper"].includes((values[6] || "").toLowerCase()) ? "goalkeeper" : "player",
    });
    count++;
  }
  return count;
}

function exportCsv() {
  const quote = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const header = ["name", "number", "category", "role", "shirt_size", "shorts_size", "socks_size", "quantity"];
  const lines = [header.join(","), ...orderState.roster.map((p) => [p.name, p.number, p.category, p.role, p.shirtSize, p.shortsSize, p.socksSize, p.quantity].map(quote).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "rosa-taglie.csv"; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function featureUnits() {
  const payload = basePayload ? basePayload() : window.__payload3d || {};
  const graphics = payload.graphics || [];
  const patterns = payload.patterns || {};
  const units = [];
  if (orderState.roster.some((p) => clean(p.name))) units.push({ sku: "CUSTOM_NAME", units_per_kit: 1 });
  if (orderState.roster.some((p) => clean(p.number))) units.push({ sku: "BACK_NUMBER", units_per_kit: 1 });
  if (payload.personalization?.front_number_enabled) units.push({ sku: "FRONT_NUMBER", units_per_kit: 1 });
  const graphicTypes = new Map();
  for (const graphic of graphics.filter((g) => g.image_present)) graphicTypes.set(graphic.type, (graphicTypes.get(graphic.type) || 0) + 1);
  for (const [type, count] of graphicTypes) units.push({ sku: `GRAPHIC_${String(type).toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`, units_per_kit: count });
  if (Object.values(patterns).some((p) => p.present)) units.push({ sku: "CUSTOM_PATTERN", units_per_kit: 1 });
  const collar = payload.realism?.collar?.type;
  if (collar && collar !== "original") units.push({ sku: "CUSTOM_COLLAR", units_per_kit: 1 });
  return units;
}

function teamPayload() {
  return {
    version: VERSION,
    status: orderState.status,
    currency: orderState.currency,
    fabric_sku: orderState.fabricSku || null,
    total_quantity: totalQuantity(),
    selected_player_id: orderState.selectedPlayerId,
    players: orderState.roster.map((p) => ({
      id: p.id,
      name: clean(p.name, 32),
      number: clean(p.number, 6),
      category: p.category,
      role: p.role,
      shirt_size: p.shirtSize,
      shorts_size: p.shortsSize,
      socks_size_eu: p.socksSize,
      quantity: p.quantity,
    })),
    size_distribution: sizeDistribution(),
    feature_units: featureUnits(),
    quote: orderState.quote ? {
      currency: orderState.quote.currency_code,
      total_amount: orderState.quote.total_amount,
      priced: orderState.quote.priced === true,
      quote_version: orderState.quote.quote_version || null,
    } : null,
  };
}

function sizeDistribution() {
  const out = {};
  for (const player of orderState.roster) {
    const key = `${player.category}:${player.shirtSize}`;
    out[key] = (out[key] || 0) + player.quantity;
  }
  return out;
}

function wrapApi() {
  if (api.__teamOrderWrapped) return;
  basePayload = api.payload.bind(api);
  baseDiagnostics = api.diagnostics.bind(api);
  api.payload = () => ({ ...basePayload(), v: 4, team_order: teamPayload() });
  api.diagnostics = () => ({ ...baseDiagnostics(), team_order: {
    version: VERSION,
    players: orderState.roster.length,
    total_quantity: totalQuantity(),
    categories: Object.keys(CATEGORY_DEFS),
    quote_state: orderState.quoteState,
    catalog_reachable: orderState.catalog.reachable,
  }});
  api.teamOrder = orderState;
  api.addTeamPlayer = addPlayer;
  api.previewTeamPlayer = previewPlayer;
  api.__teamOrderWrapped = true;
}

function refreshPayloadNow() {
  if (!api?.payload) return;
  const payload = api.payload();
  window.__payload3d = payload;
  const textarea = document.getElementById("payload");
  if (textarea) textarea.value = JSON.stringify(payload, null, 2);
}

function schedulePayloadRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(refreshPayloadNow, 30);
}

function catalogOptionText(fabric) {
  const price = Number.isFinite(fabric.unit_amount) ? ` · ${(fabric.unit_amount / 100).toLocaleString("it-IT", { style: "currency", currency: String(orderState.currency).toUpperCase() })}` : "";
  return `${fabric.title || fabric.sku}${price}`;
}

function renderCatalog() {
  if (!fabricSelect) return;
  const fabrics = orderState.catalog.fabrics || [];
  fabricSelect.innerHTML = fabrics.length ? `<option value="">Scegli tessuto</option>${fabrics.map((f) => `<option value="${escapeHtml(f.sku)}"${f.sku === orderState.fabricSku ? " selected" : ""}>${escapeHtml(catalogOptionText(f))}</option>`).join("")}` : `<option value="">Listino non disponibile</option>`;
}

function renderQuote() {
  if (!quoteNode) return;
  if (!orderState.roster.length) {
    quoteNode.innerHTML = `<span class="team-order-muted">Inserisci almeno un giocatore per calcolare il preventivo.</span>`;
    return;
  }
  if (orderState.quoteState === "loading") {
    quoteNode.innerHTML = `<span class="team-order-muted">Calcolo listino e fascia quantità…</span>`;
    return;
  }
  if (orderState.quoteState === "unreachable") {
    quoteNode.innerHTML = `<strong>Prezzo non pubblicato</strong><p class="help">Il configuratore non inventa prezzi: il backoffice Medusa non è raggiungibile o il listino non è ancora configurato.</p>`;
    return;
  }
  const q = orderState.quote;
  if (!q || q.priced !== true) {
    quoteNode.innerHTML = `<strong>Listino incompleto</strong><p class="help">Imposta nel backoffice il prezzo del tessuto e delle personalizzazioni richieste, comprese le fasce quantità.</p>`;
    return;
  }
  const currency = String(q.currency_code || orderState.currency).toUpperCase();
  const money = (amount) => (Number(amount || 0) / 100).toLocaleString("it-IT", { style: "currency", currency });
  quoteNode.innerHTML = `<div class="team-order-price">${money(q.total_amount)}</div>
    <div>${totalQuantity()} divise · ${money(q.unit_average_amount)} media/divisa</div>
    <div class="team-order-breakdown">${(q.lines || []).map((line) => `<div><span>${escapeHtml(line.title || line.sku)}</span> · <strong>${money(line.total_amount)}</strong>${line.tier ? ` <span class="team-order-ok">${escapeHtml(line.tier)}</span>` : ""}</div>`).join("")}</div>
    ${q.discount_amount ? `<p class="team-order-ok">Vantaggio quantità: ${money(q.discount_amount)}</p>` : ""}`;
}

async function fetchCatalog() {
  try {
    const response = await fetch(apiUrl(`/store/sportswear/catalog?currency_code=${encodeURIComponent(orderState.currency)}&quantity=${Math.max(1, totalQuantity())}`), { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`catalog HTTP ${response.status}`);
    const data = await response.json();
    orderState.catalog = { fabrics: Array.isArray(data.fabrics) ? data.fabrics : [], personalizations: Array.isArray(data.personalizations) ? data.personalizations : [], reachable: true, fetchedAt: Date.now() };
    if (orderState.fabricSku && !orderState.catalog.fabrics.some((f) => f.sku === orderState.fabricSku)) orderState.fabricSku = "";
    renderCatalog();
    scheduleQuote();
  } catch (error) {
    orderState.catalog = { fabrics: [], personalizations: [], reachable: false, fetchedAt: Date.now(), error: String(error) };
    renderCatalog();
    orderState.quoteState = "unreachable";
    renderQuote();
  }
}

let quoteTimer;
function scheduleQuote() {
  clearTimeout(quoteTimer);
  quoteTimer = setTimeout(requestQuote, 250);
}

async function requestQuote() {
  if (!orderState.roster.length || !orderState.fabricSku) {
    orderState.quote = null;
    orderState.quoteState = orderState.catalog.reachable ? "idle" : "unreachable";
    renderQuote();
    schedulePayloadRefresh();
    return;
  }
  orderState.quoteState = "loading";
  renderQuote();
  try {
    const response = await fetch(apiUrl("/store/sportswear/quote"), {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        currency_code: orderState.currency,
        fabric_sku: orderState.fabricSku,
        quantity: totalQuantity(),
        feature_units: featureUnits(),
        roster: teamPayload().players,
      }),
    });
    if (!response.ok) throw new Error(`quote HTTP ${response.status}`);
    orderState.quote = await response.json();
    orderState.quoteState = orderState.quote?.priced === true ? "ready" : "incomplete";
  } catch (error) {
    orderState.quote = null;
    orderState.quoteState = "unreachable";
  }
  renderQuote();
  schedulePayloadRefresh();
}

function injectUi() {
  if (document.getElementById("team-order-controls")) return;
  const summarySection = document.getElementById("summary")?.closest("section");
  const panel = document.querySelector(".panel");
  if (!panel) return;
  const section = document.createElement("section");
  section.id = "team-order-controls";
  section.innerHTML = `
    <header class="section-head"><h2>Rosa, taglie e quantità</h2><span>per giocatore</span></header>
    <p class="help">Una sola grafica di squadra, ma nome, numero e taglie sono specifici per ogni giocatore. Uomo, donna, bambino e bambina restano categorie separate nello stesso ordine.</p>
    <div class="team-order-toolbar">
      <button type="button" id="team-add-men">+ Uomo</button>
      <button type="button" id="team-add-women">+ Donna</button>
      <button type="button" id="team-add-boys">+ Bambino</button>
      <button type="button" id="team-add-girls">+ Bambina</button>
      <button type="button" id="team-bulk">Incolla rosa</button>
      <button type="button" id="team-import">Importa CSV</button>
      <button type="button" id="team-export">Esporta CSV</button>
      <input id="team-import-file" type="file" accept=".csv,text/csv" hidden>
    </div>
    <div id="team-roster-summary" class="help"></div>
    <div id="team-roster"></div>
    <details style="margin-top:.8rem"><summary>Guida taglie</summary>
      <div class="team-order-toolbar"><label>Categoria <select id="team-size-guide-category">${categoryOptions("men")}</select></label></div>
      <div id="team-size-guide"></div>
    </details>
    <div class="subcard" style="margin-top:.9rem">
      <h3>Tessuto e preventivo</h3>
      <div class="team-order-grid">
        <label>Tessuto / qualità<select id="team-fabric"><option value="">Caricamento listino…</option></select></label>
        <label>Valuta<select id="team-currency"><option value="eur">EUR</option></select></label>
      </div>
      <p class="help">Prezzi, supplementi e offerte quantità arrivano dal backoffice. Nessun prezzo è hardcoded nel configuratore.</p>
      <div id="team-quote" class="team-order-quote"></div>
    </div>`;
  if (summarySection) panel.insertBefore(section, summarySection);
  else panel.append(section);
  root = section;
  rosterNode = section.querySelector("#team-roster");
  rosterSummaryNode = section.querySelector("#team-roster-summary");
  sizeGuideNode = section.querySelector("#team-size-guide");
  fabricSelect = section.querySelector("#team-fabric");
  quoteNode = section.querySelector("#team-quote");
  importInput = section.querySelector("#team-import-file");

  bulkDialog = document.createElement("dialog");
  bulkDialog.className = "team-order-dialog";
  bulkDialog.innerHTML = `<form method="dialog"><h3>Incolla rosa</h3><p class="help">Una riga per giocatore: Nome ; Numero ; categoria (men/women/boys/girls) ; maglia ; pantaloncino ; calze ; ruolo.</p><textarea id="team-bulk-text" placeholder="ROSSI;10;men;M;M;39/42;player\nBIANCHI;1;women;S;S;39/42;goalkeeper"></textarea><div class="team-order-actions"><button value="cancel">Annulla</button><button value="default" id="team-bulk-apply">Importa</button></div></form>`;
  document.body.append(bulkDialog);

  section.querySelector("#team-add-men").addEventListener("click", () => addPlayer("men"));
  section.querySelector("#team-add-women").addEventListener("click", () => addPlayer("women"));
  section.querySelector("#team-add-boys").addEventListener("click", () => addPlayer("boys"));
  section.querySelector("#team-add-girls").addEventListener("click", () => addPlayer("girls"));
  section.querySelector("#team-bulk").addEventListener("click", () => bulkDialog.showModal());
  section.querySelector("#team-import").addEventListener("click", () => importInput.click());
  section.querySelector("#team-export").addEventListener("click", exportCsv);
  section.querySelector("#team-size-guide-category").addEventListener("change", (event) => renderSizeGuide(event.target.value));
  fabricSelect.addEventListener("change", () => { orderState.fabricSku = fabricSelect.value; scheduleQuote(); schedulePayloadRefresh(); });
  section.querySelector("#team-currency").addEventListener("change", (event) => { orderState.currency = event.target.value; fetchCatalog(); });
  importInput.addEventListener("change", async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    importCsvText(await file.text());
    importInput.value = "";
  });
  bulkDialog.querySelector("#team-bulk-apply").addEventListener("click", (event) => {
    event.preventDefault();
    importBulkText(bulkDialog.querySelector("#team-bulk-text").value);
    bulkDialog.close();
  });
  renderSizeGuide("men");
  renderRoster();
  renderQuote();
}

async function waitReady() {
  for (let i = 0; i < 1200; i++) {
    if (window.__sportswear3d?.ready === true) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

if (await waitReady()) {
  api = window.__sportswear3d;
  addStyles();
  injectUi();
  wrapApi();
  if (!orderState.roster.length) addPlayer("men", { name: "ROSSI", number: "10", shirtSize: "M", shortsSize: "M", socksSize: "39/42" });
  refreshPayloadNow();
  fetchCatalog();
  document.addEventListener("input", scheduleQuote);
  document.addEventListener("change", scheduleQuote);
  window.__teamOrder = orderState;
  window.__teamOrderReady = true;
} else {
  window.__teamOrderError = "sportswear base runtime timeout";
}
