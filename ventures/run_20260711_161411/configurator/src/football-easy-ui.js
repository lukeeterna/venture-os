const VERSION = "football-easy-ui-v1-20260823";

let advanced = false;
let toolbar;
let quickCard;
let mutationObserver;

function findSection(title) {
  return [...document.querySelectorAll('.panel > section')].find((section) => section.querySelector('.section-head h2')?.textContent?.trim() === title) || null;
}

function publish() {
  const advancedNodes = [...document.querySelectorAll('[data-easy-advanced="true"]')];
  const status = {
    version: VERSION,
    mode: advanced ? 'advanced' : 'simple',
    advanced,
    advanced_nodes: advancedNodes.length,
    hidden_advanced_nodes: advancedNodes.filter((node) => getComputedStyle(node).display === 'none').length,
    quick_nav: Boolean(toolbar),
    official_reset: Boolean(document.getElementById('official-nameset-reset')),
  };
  window.__footballEasyUiStatus = status;
  return status;
}

function addStyles() {
  if (document.getElementById('football-easy-ui-style')) return;
  const style = document.createElement('style');
  style.id = 'football-easy-ui-style';
  style.textContent = `
    #football-easy-toolbar{position:sticky;top:0;z-index:12;display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px;border-bottom:1px solid #ffffff14;background:#10161eea;backdrop-filter:blur(14px)}
    #football-easy-toolbar button{border:1px solid #ffffff1c;border-radius:999px;background:#151d27;color:#edf3ff;padding:9px 12px;font-size:12px;font-weight:750}
    #football-easy-toolbar button[data-easy-advanced-toggle]{margin-left:auto;border-color:#5b8fff66;background:#214276}
    #football-easy-quick{margin:0 22px 16px;padding:14px;border:1px solid #5b8fff40;border-radius:14px;background:linear-gradient(145deg,#162337,#111923)}
    #football-easy-quick .easy-title{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:9px}
    #football-easy-quick h3{margin:0;font-size:14px}
    #football-easy-quick .easy-badge{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#dbe8ff;background:#5b8fff24;border:1px solid #5b8fff55;border-radius:999px;padding:5px 8px}
    #football-easy-quick .easy-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:9px;align-items:end}
    #football-easy-quick label{display:grid;gap:6px;font-size:11px;font-weight:750;color:#c9d4e3}
    #football-easy-quick button{border:1px solid #6b9fff88;border-radius:10px;background:#315da8;color:white;padding:10px 12px;font-weight:800}
    [data-easy-advanced="true"]{transition:opacity .15s ease}
    .football-easy-simple [data-easy-advanced="true"]{display:none!important}
    .football-easy-simple #football-realism-controls{display:none!important}
    .football-easy-simple .graphic-card .sliders{display:none!important}
    .football-easy-simple #team-order-controls details{display:none!important}
    .football-easy-simple #team-bulk,.football-easy-simple #team-import,.football-easy-simple #team-export{display:none!important}
    @media(max-width:620px){#football-easy-toolbar{padding:9px;gap:6px}#football-easy-toolbar button{padding:8px 9px;font-size:11px}#football-easy-toolbar button[data-easy-advanced-toggle]{margin-left:0}#football-easy-quick{margin:0 15px 14px}#football-easy-quick .easy-grid{grid-template-columns:1fr}}
  `;
  document.head.append(style);
}

function jumpTo(title) {
  const section = findSection(title);
  section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setAdvanced(next) {
  advanced = Boolean(next);
  document.body.classList.toggle('football-easy-simple', !advanced);
  document.body.classList.toggle('football-easy-advanced', advanced);
  const button = document.querySelector('[data-easy-advanced-toggle]');
  if (button) {
    button.textContent = advanced ? 'Nascondi opzioni avanzate' : 'Mostra opzioni avanzate';
    button.setAttribute('aria-pressed', String(advanced));
  }
  if (advanced) window.__footballNamesetAuthority?.syncControlsToProfile?.();
  publish();
}

function syncSimpleControls() {
  const collar = document.getElementById('football-collar');
  const easyCollar = document.getElementById('easy-football-collar');
  if (collar && easyCollar && easyCollar.value !== collar.value) easyCollar.value = collar.value;
  const crest = document.getElementById('crest-in-number');
  const easyCrest = document.getElementById('easy-crest-in-number');
  if (crest && easyCrest) easyCrest.value = crest.value;
}

function injectToolbar() {
  const panel = document.querySelector('.panel');
  if (!panel || document.getElementById('football-easy-toolbar')) return;
  toolbar = document.createElement('nav');
  toolbar.id = 'football-easy-toolbar';
  toolbar.setAttribute('aria-label', 'Navigazione rapida configuratore');
  toolbar.innerHTML = `
    <button type="button" data-easy-jump="Colori divisa">1 · Kit</button>
    <button type="button" data-easy-jump="Nome e numero">2 · Nome e numero</button>
    <button type="button" data-easy-jump="Loghi, sponsor e patch">3 · Loghi</button>
    <button type="button" data-easy-jump="Rosa, taglie e quantità">4 · Rosa e prezzo</button>
    <button type="button" data-easy-advanced-toggle aria-pressed="false">Mostra opzioni avanzate</button>`;
  panel.prepend(toolbar);
  toolbar.querySelectorAll('[data-easy-jump]').forEach((button) => button.addEventListener('click', () => jumpTo(button.dataset.easyJump)));
  toolbar.querySelector('[data-easy-advanced-toggle]').addEventListener('click', () => setAdvanced(!advanced));
}

function injectQuickCard() {
  if (document.getElementById('football-easy-quick')) return;
  const nameSection = findSection('Nome e numero');
  if (!nameSection) return;
  quickCard = document.createElement('div');
  quickCard.id = 'football-easy-quick';
  quickCard.innerHTML = `
    <div class="easy-title"><h3>Impostazione consigliata</h3><span class="easy-badge">reference-match</span></div>
    <p class="help">Nome e numero partono già nel layout misurato su una maglia ufficiale: puoi cambiare testo, font e colore senza spostare manualmente nulla.</p>
    <div class="easy-grid">
      <button type="button" id="official-nameset-reset">Ripristina layout ufficiale</button>
      <label>Colletto
        <select id="easy-football-collar"></select>
      </label>
      <label>Logo nel numero
        <select id="easy-crest-in-number"><option value="off">No</option><option value="on">Sì</option></select>
      </label>
    </div>`;
  nameSection.insertBefore(quickCard, nameSection.children[1] || null);

  const sourceCollar = document.getElementById('football-collar');
  const easyCollar = quickCard.querySelector('#easy-football-collar');
  if (sourceCollar) {
    easyCollar.innerHTML = sourceCollar.innerHTML;
    easyCollar.value = sourceCollar.value;
    easyCollar.addEventListener('change', () => {
      sourceCollar.value = easyCollar.value;
      sourceCollar.dispatchEvent(new Event('change', { bubbles: true }));
    });
    sourceCollar.addEventListener('change', syncSimpleControls);
  }

  const sourceCrest = document.getElementById('crest-in-number');
  const easyCrest = quickCard.querySelector('#easy-crest-in-number');
  if (sourceCrest) {
    easyCrest.value = sourceCrest.value;
    easyCrest.addEventListener('change', () => {
      sourceCrest.value = easyCrest.value;
      sourceCrest.dispatchEvent(new Event('change', { bubbles: true }));
    });
    sourceCrest.addEventListener('change', syncSimpleControls);
  }

  quickCard.querySelector('#official-nameset-reset').addEventListener('click', () => {
    window.__footballNamesetAuthority?.reset?.();
    window.__sportswear3d?.setView?.('back');
    syncSimpleControls();
  });
}

function markAdvancedNodes() {
  [
    document.querySelector('.pattern-sliders'),
    document.getElementById('football-realism-controls'),
    document.getElementById('back-name-controls')?.closest('.subcard'),
    document.getElementById('back-number-controls')?.closest('.subcard'),
    document.getElementById('front-number-controls')?.closest('.subcard'),
  ].filter(Boolean).forEach((node) => node.dataset.easyAdvanced = 'true');

  document.querySelectorAll('.graphic-card .sliders').forEach((node) => node.dataset.easyAdvanced = 'true');
  document.querySelectorAll('#team-order-controls details').forEach((node) => node.dataset.easyAdvanced = 'true');
  ['team-bulk', 'team-import', 'team-export'].forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.dataset.easyAdvanced = 'true';
  });
}

async function waitReady() {
  for (let i = 0; i < 600; i++) {
    if (window.__footballNamesetReady === true && window.__teamOrderReady === true && document.querySelector('.panel')) return true;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return false;
}

async function boot() {
  if (!(await waitReady())) {
    window.__footballEasyUiError = 'football easy UI bootstrap timeout';
    throw new Error(window.__footballEasyUiError);
  }

  addStyles();
  injectToolbar();
  injectQuickCard();
  markAdvancedNodes();
  setAdvanced(false);
  syncSimpleControls();

  const graphics = document.getElementById('graphics-list');
  if (graphics) {
    mutationObserver = new MutationObserver(() => {
      markAdvancedNodes();
      publish();
    });
    mutationObserver.observe(graphics, { childList: true, subtree: true });
  }

  window.__footballEasyUi = { version: VERSION, setAdvanced, get advanced() { return advanced; } };
  window.__footballEasyUiReady = true;
  publish();
}

boot().catch((error) => {
  window.__footballEasyUiError = String(error?.stack || error);
  console.error('football easy UI bootstrap failed', error);
});
