const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const BASE = process.env.SPORTSWEAR_URL || 'http://127.0.0.1:8282/';
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'visual-output');
const FIX = path.join(__dirname, 'fixtures');
fs.mkdirSync(OUT, { recursive: true });

function fail(message) { throw new Error(message); }

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.stack || err.message}`));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });

  const response = await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  if (!response || !response.ok()) fail(`HTTP ${response?.status()} loading ${BASE}`);

  await page.waitForFunction(() => window.__sportswear3d?.ready === true, null, { timeout: 45000 });
  await page.waitForFunction(() => window.__footballRealismReady === true && window.__footballRealismPostReady === true, null, { timeout: 45000 });
  await page.waitForTimeout(900);

  const webgl = await page.evaluate(() => {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  });
  if (!webgl) fail('WebGL unavailable in browser test');

  let diagnostics = await page.evaluate(() => window.__sportswear3d.diagnostics());
  if (diagnostics.meshes.shirt < 1 || diagnostics.meshes.shorts < 1 || diagnostics.meshes.socks < 1) fail(`Missing real garment meshes: ${JSON.stringify(diagnostics.meshes)}`);
  if (diagnostics.decals < 2) fail(`Back name/number decals not projected: ${diagnostics.decals}`);
  if (diagnostics.donor_assets.shirt.blob !== '9c7609eddfd597a70cb708f96bc19841766b3488') fail('Unexpected shirt donor identity');
  if (!diagnostics.football_realism) fail('Football realism diagnostics missing');
  if (!diagnostics.show_socks) fail('Complete socks must be visible by default');
  if (!diagnostics.football_realism.boots || diagnostics.football_realism.lower_meshes < 6) fail(`Footwear/lower-body not built: ${JSON.stringify(diagnostics.football_realism)}`);

  const realismPayload = await page.evaluate(() => window.__sportswear3d.payload().realism);
  if (!realismPayload || realismPayload.typography.preset !== 'uefa-2026') fail('UEFA typography preset missing from payload');
  if (realismPayload.typography.target_back_number_height_cm !== 30) fail(`Unexpected back number physical target: ${realismPayload.typography.target_back_number_height_cm}`);

  const viewer = page.locator('#viewer-shell');
  await viewer.screenshot({ path: path.join(OUT, '01-front-reference-footwear.png') });

  await page.evaluate(() => window.__sportswear3d.setView('back'));
  await page.waitForTimeout(900);
  await viewer.screenshot({ path: path.join(OUT, '02-back-name-number.png') });

  await page.locator('#player-number').fill('A10');
  await page.locator('#player-number').dispatchEvent('input');
  await page.waitForTimeout(350);
  const numberValue = await page.evaluate(() => window.__payload3d.personalization.number);
  if (numberValue !== 'A10') fail(`Free-text number/characters failed: ${numberValue}`);

  await page.locator('#football-collar').selectOption('v');
  await page.waitForTimeout(350);
  diagnostics = await page.evaluate(() => window.__sportswear3d.diagnostics());
  if (diagnostics.football_realism.collar !== 'v' || diagnostics.football_realism.collar_meshes < 1) fail(`V-neck collar did not render: ${JSON.stringify(diagnostics.football_realism)}`);

  await page.locator('[data-place="crest"]').click();
  await page.waitForTimeout(250);
  const crestPreset = await page.evaluate(() => {
    const g = window.__sportswear3d.state.graphics.at(-1);
    return g ? { type: g.type, surface: g.surface, x: g.x, y: g.y, scale: g.scale } : null;
  });
  if (!crestPreset || crestPreset.type !== 'crest' || crestPreset.surface !== 'shirt-front' || crestPreset.x !== 38 || crestPreset.y !== 29) fail(`Crest placement preset failed: ${JSON.stringify(crestPreset)}`);
  const crestCard = page.locator('[data-graphic]').last();
  await crestCard.locator('input[data-field="file"]').setInputFiles(path.join(FIX, 'ci-logo.png'));
  await page.locator('#crest-in-number').selectOption('on');
  await page.waitForTimeout(900);
  diagnostics = await page.evaluate(() => window.__sportswear3d.diagnostics());
  if (!diagnostics.football_realism.crest_in_number || diagnostics.football_realism.crest_number_meshes < 1) fail(`Crest-in-number did not render: ${JSON.stringify(diagnostics.football_realism)}`);
  await viewer.screenshot({ path: path.join(OUT, '03-back-crest-in-number.png') });

  await page.evaluate(() => window.__sportswear3d.setView('front'));
  await page.waitForTimeout(800);
  await page.locator('#pattern-file').setInputFiles(path.join(FIX, 'ci-pattern.png'));
  await page.waitForTimeout(900);
  const patternPresent = await page.evaluate(() => window.__payload3d.patterns.shirt.present);
  if (!patternPresent) fail('Pattern upload did not reach payload/material state');
  await viewer.screenshot({ path: path.join(OUT, '04-pattern-upload.png') });

  await page.locator('#clear-pattern').click();
  await page.locator('#add-patch').click();
  const card = page.locator('[data-graphic]').last();
  await card.locator('input[data-field="file"]').setInputFiles(path.join(FIX, 'ci-logo.png'));
  await page.waitForTimeout(900);
  const graphicPresent = await page.evaluate(() => window.__payload3d.graphics.some((g) => g.type === 'patch' && g.image_present));
  if (!graphicPresent) fail('Patch upload did not reach payload/decal state');
  await page.evaluate(() => window.__sportswear3d.setView('right'));
  await page.waitForTimeout(900);
  await viewer.screenshot({ path: path.join(OUT, '05-patch-right-sleeve.png') });

  const stablePayload = await page.evaluate(() => ({ textarea: JSON.parse(document.getElementById('payload').value), api: window.__sportswear3d.payload() }));
  if (!stablePayload.textarea.realism || !stablePayload.api.realism) fail('Realism payload was lost after normal configurator interactions');

  diagnostics = await page.evaluate(() => window.__sportswear3d.diagnostics());
  fs.writeFileSync(path.join(OUT, 'runtime-diagnostics.json'), JSON.stringify({ diagnostics, errors }, null, 2));
  if (errors.length) fail(errors.join('\n'));

  console.log('SPORTSWEAR_REAL_BROWSER=PASS');
  console.log(`THREE_REVISION=${diagnostics.three_revision}`);
  console.log(`REAL_MESHES=${JSON.stringify(diagnostics.meshes)}`);
  console.log(`DECALS=${diagnostics.decals}`);
  console.log(`FOOTBALL_REALISM=${JSON.stringify(diagnostics.football_realism)}`);
  console.log('FOOTWEAR=PASS');
  console.log('UEFA_TYPOGRAPHY_DEFAULT=PASS');
  console.log('COLLAR_LIBRARY=PASS');
  console.log('CREST_PRESET=PASS');
  console.log('CREST_IN_NUMBER=PASS');
  console.log('PATTERN_UPLOAD=PASS');
  console.log('PATCH_UPLOAD=PASS');
  console.log('FREE_TEXT_NUMBER=PASS');
  console.log('ROTATION_FRONT_BACK_RIGHT=PASS');
  await browser.close();
})().catch(async (error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
