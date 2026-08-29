const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const BASE = process.env.SPORTSWEAR_URL || 'http://127.0.0.1:8282/';
const OUT = path.join(__dirname, 'visual-output');
fs.mkdirSync(OUT, { recursive: true });
const fail = (message) => { throw new Error(message); };

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.stack || err.message}`));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
    const response = await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    if (!response?.ok()) fail(`HTTP ${response?.status()} loading ${BASE}`);
    await page.waitForFunction(() =>
      window.__sportswear3d?.ready === true &&
      window.__footballEasyUiReady === true &&
      window.__sportswearFinishingReady === true &&
      window.__sportswearFinishingStatus?.ready === true,
      null, { timeout: 60000 }
    );
    await page.waitForTimeout(800);

    const initial = await page.evaluate(() => {
      const shell = document.getElementById('viewer-shell').getBoundingClientRect();
      const bar = document.querySelector('.viewer-card>.viewbar')?.getBoundingClientRect();
      const easy = [...document.querySelectorAll('#easy-football-collar option')].map((o) => o.value);
      const advanced = [...document.querySelectorAll('#football-collar option')].map((o) => o.value);
      const status = window.__sportswearFinishingStatus;
      const d = window.__sportswear3d.diagnostics();
      return { shell: { top: shell.top, bottom: shell.bottom }, bar: bar && { top: bar.top, bottom: bar.bottom }, easy, advanced, status, showSocks: d.show_socks };
    });

    if (!initial.status.viewbarOutsideCanvas) fail(`Viewbar still inside viewer shell: ${JSON.stringify(initial)}`);
    if (!initial.bar || initial.bar.top < initial.shell.bottom - 1) fail(`Viewbar overlaps 3D canvas: ${JSON.stringify(initial)}`);
    if (!initial.showSocks) fail('Socks must be visible by default');
    if (!initial.status.cleanShortHem || !Number.isFinite(initial.status.shortHemY)) fail(`Clean shorts hem missing: ${JSON.stringify(initial.status)}`);
    if (initial.status.topologyMutated) fail('Finishing must not mutate garment topology');
    if (initial.status.patchedShirtMaterials < 1 || initial.status.patchedShortsMaterials < 1) fail(`Finishing shader not installed: ${JSON.stringify(initial.status)}`);
    if (JSON.stringify(initial.easy) !== JSON.stringify(['crew', 'v', 'polo', 'polo-button'])) fail(`Simple collar choices are not the four production choices: ${JSON.stringify(initial.easy)}`);
    for (const legacy of ['split-v', 'retro-90']) if (!initial.advanced.includes(legacy)) fail(`Advanced collar feature lost: ${legacy}`);

    for (const id of ['finish-sleeve-on', 'finish-shorts-on', 'finish-collar-on']) await page.locator(`#${id}`).check();
    await page.locator('#finish-sleeve-color').fill('#17355f');
    await page.locator('#finish-shorts-color').fill('#17355f');
    await page.locator('#finish-collar-color').fill('#17355f');
    for (const id of ['finish-sleeve-color', 'finish-shorts-color', 'finish-collar-color']) await page.locator(`#${id}`).dispatchEvent('input');
    await page.waitForTimeout(800);

    const enabled = await page.evaluate(() => window.__sportswearFinishingStatus);
    if (!enabled.trims.sleeveTrim || !enabled.trims.shortsTrim || !enabled.trims.collarTrim) fail(`Trim toggles did not reach runtime: ${JSON.stringify(enabled)}`);

    await page.evaluate(() => window.__sportswear3d.setView('front'));
    await page.waitForTimeout(700);
    await page.locator('.viewer-card').screenshot({ path: path.join(OUT, '09-front-finishing-and-clear-viewbar.png') });
    await page.locator('#easy-football-collar').selectOption('polo-button');
    await page.waitForFunction(() => window.__footballCollarTailorStatus?.type === 'polo-button', null, { timeout: 5000 });
    await page.waitForTimeout(500);
    await page.locator('#viewer-shell').screenshot({ path: path.join(OUT, '10-polo-button-with-trims.png') });

    const final = await page.evaluate(() => ({
      finishing: window.__sportswearFinishingStatus,
      collar: window.__footballCollarTailorStatus,
      diagnostics: window.__sportswear3d.diagnostics(),
    }));
    fs.writeFileSync(path.join(OUT, 'finishing-diagnostics.json'), JSON.stringify({ initial, final, errors }, null, 2));
    if (errors.length) fail(errors.join('\n'));
    console.log('FINISHING_CI=PASS');
    console.log('VIEWBAR_OUTSIDE_CANVAS=PASS');
    console.log('SOCKS_UNOBSTRUCTED_LAYOUT=PASS');
    console.log('CLEAN_SHORT_HEM=PASS');
    console.log('OPTIONAL_TRIMS=PASS');
    console.log('SIMPLE_COLLARS_4=PASS');
    console.log('ADVANCED_FEATURES_PRESERVED=PASS');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
