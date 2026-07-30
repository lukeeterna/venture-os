// MT-2D.5 — driver CDP zero-dipendenze (Node 22: WebSocket/fetch globali).
// Pilota il configuratore reale attraverso 3 stati sponsor e cattura il canvas:
//   1) senza sponsor  2) sponsor applicato  3) dopo il reset.
// Lo sponsor di prova e' generato IN PAGINA con la Canvas API (rettangolo
// arancio + scritta SPONSOR): mai un logo/marchio reale, mai un file su disco.
"use strict";

const [, , PORT, PAGE_URL, OUT_DIR] = process.argv;
const { writeFileSync } = await import("node:fs");
const { join } = await import("node:path");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function findPageTarget() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const t = list.find((x) => x.type === "page" && /^file:/.test(x.url || ""));
      if (t && t.webSocketDebuggerUrl) return t;
    } catch (_) { /* devtools non pronto */ }
    await sleep(200);
  }
  throw new Error("target pagina file:// non trovato via CDP");
}

const target = await findPageTarget();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = () => rej(new Error("WS CDP open fallita"));
});

let msgId = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
};
function send(method, params = {}) {
  const id = (msgId += 1);
  return new Promise((resolve) => {
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression, awaitPromise = false) {
  const r = await send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true
  });
  if (r.result && r.result.exceptionDetails) {
    const d = r.result.exceptionDetails;
    throw new Error("evaluate: " + (d.exception?.description || d.text));
  }
  return r.result.result.value;
}

await send("Page.enable");
await send("Runtime.enable");

// Attendi che il configuratore abbia completato il primo render.
let ready = false;
for (let i = 0; i < 80; i += 1) {
  ready = await evaluate("window.__rendered === true");
  if (ready) break;
  await sleep(125);
}
if (!ready) throw new Error("window.__rendered mai true (asset non caricati?)");

function saveShot(name, dataUrl) {
  if (!/^data:image\/png;base64,/.test(dataUrl || "")) {
    throw new Error("dataURL canvas non valido per " + name);
  }
  const buf = Buffer.from(dataUrl.split(",")[1], "base64");
  const out = join(OUT_DIR, name);
  writeFileSync(out, buf);
  console.log(`${name}: ${buf.length} byte`);
}

const CANVAS_URL = "document.getElementById('c').toDataURL('image/png')";

// STATO 1 — senza sponsor (stato pulito post-load)
const offApplied = await evaluate("window.__sponsorApplied === true");
saveShot("sponsor_off.png", await evaluate(CANVAS_URL));

// STATO 2 — sponsor di prova sintetico (Canvas API), applicato via pipeline reale
const INJECT = `(async () => {
  const cv = document.createElement('canvas');
  cv.width = 420; cv.height = 140;
  const g = cv.getContext('2d');
  g.fillStyle = '#ff7a1a'; g.fillRect(0, 0, 420, 140);
  g.fillStyle = '#ffffff';
  g.font = '700 60px sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('SPONSOR', 210, 70);
  const url = cv.toDataURL('image/png');
  await new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => { applySponsorImage(url, im); res(); };
    im.onerror = () => rej(new Error('decode sponsor sintetico fallita'));
    im.src = url;
  });
  return window.__sponsorApplied === true;
})()`;
const onApplied = await evaluate(INJECT, true);
saveShot("sponsor_on.png", await evaluate(CANVAS_URL));

// STATO 3 — reset (removeSponsor: nessuna immagine conservata)
const resetApplied = await evaluate("(function(){ removeSponsor(); return window.__sponsorApplied === true; })()");
saveShot("sponsor_reset.png", await evaluate(CANVAS_URL));

console.log(`__sponsorApplied  off=${offApplied}  on=${onApplied}  reset=${resetApplied}`);
if (offApplied !== false) throw new Error("stato iniziale: __sponsorApplied atteso false");
if (onApplied !== true) throw new Error("applicazione: __sponsorApplied atteso true");
if (resetApplied !== false) throw new Error("reset: __sponsorApplied atteso false");

ws.close();
process.exit(0);
