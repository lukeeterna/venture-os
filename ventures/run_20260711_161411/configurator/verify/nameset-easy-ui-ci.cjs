const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const BASE = process.env.SPORTSWEAR_URL || 'http://127.0.0.1:8282/';
const OUT = path.join(__dirname, 'visual-output');
const FIX = path.join(__dirname, 'fixtures');
fs.mkdirSync(OUT, { recursive: true });

function fail(message) { throw new Error(message); }
function near(value, expected, tolerance, label) {
  if (!Number.isFinite(Number(value)) || Math.abs(Number(value) - expected) > tolerance) fail(`${label}: expected ${expected}±${tolerance}, got ${value}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--disable-dev-shm-usage'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.stack || err.message}`));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });

    const response = await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    if (!response?.ok()) fail(`HTTP ${response?.status()} loading ${BASE}`);
    await page.waitForFunction(() =>
      window.__sportswear3d?.ready === true && (
        (window.__footballNamesetReady === true && window.__footballNamesetEdgeSafeReady === true && window.__footballEasyUiReady === true) ||
        Boolean(window.__footballNamesetError) || Boolean(window.__footballNamesetEdgeSafeError) || Boolean(window.__footballEasyUiError)
      ), null, { timeout: 40000 }
    );
    await page.waitForTimeout(700);

    let snapshot = await page.evaluate(() => ({
      nameset: window.__footballNamesetStatus || null,
      edge: window.__footballNamesetEdgeSafeStatus || null,
      easy: window.__footballEasyUiStatus || null,
      namesetReady: window.__footballNamesetReady === true,
      edgeReady: window.__footballNamesetEdgeSafeReady === true,
      easyReady: window.__footballEasyUiReady === true,
      namesetError: window.__footballNamesetError || null,
      edgeError: window.__footballNamesetEdgeSafeError || null,
      easyError: window.__footballEasyUiError || null,
      teamOrderReady: window.__teamOrderReady === true,
      realismReady: window.__footballRealismReady === true,
      bodySimple: document.body.classList.contains('football-easy-simple'),
      toolbarButtons: document.querySelectorAll('#football-easy-toolbar button').length,
      advancedNameDisplay: document.getElementById('back-name-controls')?.closest('.subcard') ? getComputedStyle(document.getElementById('back-name-controls').closest('.subcard')).display : null,
      realismDisplay: document.getElementById('football-realism-controls') ? getComputedStyle(document.getElementById('football-realism-controls')).display : null,
      namesetGroupChildren: window.__footballRealismScene?.getObjectByName('football-nameset-authority')?.children?.map?.((node) => node.name) || [],
      hasBackNameMesh: Boolean(window.__footballRealismScene?.getObjectByName('football-nameset-back-name')),
      hasBackNumberMesh: Boolean(window.__footballRealismScene?.getObjectByName('football-nameset-back-number')),
      sceneNames: window.__footballRealismScene?.children?.map?.((node) => node.name).filter(Boolean) || [],
    }));

    if (!snapshot.namesetReady || !snapshot.edgeReady || !snapshot.easyReady || snapshot.namesetError || snapshot.edgeError || snapshot.easyError) fail(`nameset/easy bootstrap failed ${JSON.stringify(snapshot)}`);
    if (!snapshot.nameset?.metrics?.back_name || !snapshot.nameset?.metrics?.back_number) fail(`authoritative rendered meshes missing ${JSON.stringify(snapshot)}`);
    if (snapshot.nameset.version !== 'football-nameset-authority-v1-20260823') fail(`nameset version ${snapshot.nameset.version}`);
    if (snapshot.edge?.version !== 'football-nameset-edge-safe-v1-20260823') fail(`edge-safe nameset missing ${JSON.stringify(snapshot.edge)}`);
    if (snapshot.nameset.mode !== 'authority' || snapshot.nameset.profile !== 'official-reference-2024') fail(`nameset authority not default ${JSON.stringify(snapshot.nameset)}`);
    if (!snapshot.nameset.legacy_text_hidden) fail('legacy text mesh is still visible under authoritative nameset');
    near(snapshot.nameset.metrics.back_name.center_body_pct, 14.8, 1.5, 'back name center');
    near(snapshot.nameset.metrics.back_number.center_body_pct, 42.3, 1.5, 'back number center');
    near(snapshot.nameset.metrics.back_name.glyph_height_cm, 4.9, 0.45, 'back name physical height');
    near(snapshot.nameset.metrics.back_number.glyph_height_cm, 27.0, 0.85, 'back number physical height');
    near(snapshot.nameset.metrics.name_to_number_gap_cm, 4.5, 1.4, 'name-number gap');
    if (snapshot.nameset.metrics.name_to_number_gap_cm < 2.0) fail(`UEFA number-zone clearance violated: ${snapshot.nameset.metrics.name_to_number_gap_cm}cm`);

    if (snapshot.easy.version !== 'football-easy-ui-v1-20260823' || snapshot.easy.mode !== 'simple') fail(`easy UI not simple by default ${JSON.stringify(snapshot.easy)}`);
    if (!snapshot.bodySimple || snapshot.toolbarButtons < 5 || !snapshot.easy.quick_nav || !snapshot.easy.official_reset) fail(`quick/simple UI incomplete ${JSON.stringify(snapshot)}`);
    if (snapshot.advancedNameDisplay !== 'none' || snapshot.realismDisplay !== 'none') fail(`advanced controls visible in simple mode ${JSON.stringify(snapshot)}`);

    const viewer = page.locator('#viewer-shell');
    await page.evaluate(() => window.__sportswear3d.setView('back'));
    await page.waitForTimeout(650);
    await viewer.screenshot({ path: path.join(OUT, '00-official-reference-back.png') });
    await page.screenshot({ path: path.join(OUT, '00-simple-ui.png'), fullPage: true });

    const frontToggle = page.locator('#front-number-toggle');
    if (!(await frontToggle.isChecked())) await frontToggle.check();
    await page.waitForFunction(() => window.__footballNamesetStatus?.metrics?.front_number, null, { timeout: 5000 });
    await page.waitForTimeout(350);
    snapshot = await page.evaluate(() => ({ nameset: window.__footballNamesetStatus, edge: window.__footballNamesetEdgeSafeStatus }));
    near(snapshot.nameset.metrics.front_number.center_body_pct, 38.4, 1.5, 'front number center');
    near(snapshot.nameset.metrics.front_number.glyph_height_cm, 11.5, 0.65, 'front number physical height');
    await page.evaluate(() => window.__sportswear3d.setView('front'));
    await page.waitForTimeout(650);
    await viewer.screenshot({ path: path.join(OUT, '00-official-reference-front.png') });

    await page.locator('[data-easy-advanced-toggle]').click();
    await page.waitForTimeout(180);
    const advanced = await page.evaluate(() => ({
      status: window.__footballEasyUiStatus,
      bodyAdvanced: document.body.classList.contains('football-easy-advanced'),
      realismDisplay: getComputedStyle(document.getElementById('football-realism-controls')).display,
      backNameDisplay: getComputedStyle(document.getElementById('back-name-controls').closest('.subcard')).display,
    }));
    if (advanced.status.mode !== 'advanced' || !advanced.bodyAdvanced || advanced.realismDisplay === 'none' || advanced.backNameDisplay === 'none') fail(`advanced disclosure failed ${JSON.stringify(advanced)}`);

    const repairsBeforeReset = await page.evaluate(() => Number(window.__footballNamesetEdgeSafeStatus?.repairs || 0));
    await page.locator('#official-nameset-reset').click();
    await page.waitForFunction((repairsBefore) =>
      window.__footballNamesetStatus?.mode === 'authority' &&
      Number(window.__footballNamesetEdgeSafeStatus?.repairs || 0) > repairsBefore &&
      Boolean(window.__footballNamesetStatus?.metrics?.back_name) &&
      Boolean(window.__footballNamesetStatus?.metrics?.back_number) &&
      Boolean(window.__footballRealismScene?.getObjectByName('football-nameset-back-number')),
      repairsBeforeReset, { timeout: 7000 }
    );
    snapshot = await page.evaluate(() => ({ nameset: window.__footballNamesetStatus, edge: window.__footballNamesetEdgeSafeStatus }));
    near(snapshot.nameset.metrics.back_name.center_body_pct, 14.8, 1.5, 'reset back name center');
    near(snapshot.nameset.metrics.back_number.center_body_pct, 42.3, 1.5, 'reset back number center');

    const repairsBeforeCrest = await page.evaluate(() => Number(window.__footballNamesetEdgeSafeStatus?.repairs || 0));
    await page.locator('[data-place="crest"]').click();
    const crestCard = page.locator('[data-graphic]').last();
    await crestCard.locator('input[data-field="file"]').setInputFiles(path.join(FIX, 'ci-logo.png'));
    await page.locator('#easy-crest-in-number').selectOption('on');
    await page.waitForFunction((repairsBefore) =>
      window.__footballCrestConformalStatus?.stage === 'built' &&
      Number(window.__footballNamesetEdgeSafeStatus?.repairs || 0) > repairsBefore &&
      Boolean(window.__footballNamesetStatus?.metrics?.back_number) &&
      Boolean(window.__footballRealismScene?.getObjectByName('football-nameset-back-number')) &&
      Boolean(window.__footballRealismScene?.getObjectByName('football-realism-crest-number-v6')),
      repairsBeforeCrest, { timeout: 9000 }
    );
    const crestAlignment = await page.evaluate(() => {
      function yBounds(object) {
        let min = Infinity, max = -Infinity;
        object?.traverse?.((node) => {
          const attr = node.geometry?.attributes?.position;
          if (!attr) return;
          for (let i = 0; i < attr.count; i++) { const y = attr.getY(i); min = Math.min(min, y); max = Math.max(max, y); }
        });
        return Number.isFinite(min) && Number.isFinite(max) ? { min, max, center: (min + max) / 2, span: max - min } : null;
      }
      const number = window.__footballRealismScene.getObjectByName('football-nameset-back-number');
      const crest = window.__footballRealismScene.getObjectByName('football-realism-crest-number-v6');
      return { number: yBounds(number), crest: yBounds(crest), status: window.__footballCrestConformalStatus, edge: window.__footballNamesetEdgeSafeStatus };
    });
    if (!crestAlignment.number || !crestAlignment.crest) fail(`crest/number bounds missing ${JSON.stringify(crestAlignment)}`);
    const crestDelta = Math.abs(crestAlignment.number.center - crestAlignment.crest.center);
    if (crestDelta > crestAlignment.number.span * 0.18) fail(`crest not aligned to authoritative number: ${JSON.stringify({ crestDelta, ...crestAlignment })}`);
    await page.evaluate(() => window.__sportswear3d.setView('back'));
    await page.waitForTimeout(550);
    await viewer.screenshot({ path: path.join(OUT, '00-official-reference-crest.png') });

    if (errors.length) fail(errors.join('\n'));
    fs.writeFileSync(path.join(OUT, 'nameset-easy-ui-diagnostics.json'), JSON.stringify({ snapshot, crestAlignment, errors }, null, 2));
    console.log('OFFICIAL_REFERENCE_NAMESET=PASS');
    console.log('RENDERED_PLACEMENT_ASSERTIONS=PASS');
    console.log('UEFA_NUMBER_ZONE_CLEARANCE=PASS');
    console.log('SIMPLE_MODE_DEFAULT=PASS');
    console.log('ADVANCED_PROGRESSIVE_DISCLOSURE=PASS');
    console.log('EDGE_SAFE_NAMESET=PASS');
    console.log('CREST_ALIGNMENT_WITH_AUTHORITY=PASS');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
