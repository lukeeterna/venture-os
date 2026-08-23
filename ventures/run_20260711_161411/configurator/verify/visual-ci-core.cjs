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
function checkpoint(name) { console.log(`VISUAL_CHECKPOINT=${name}`); }

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.stack || err.message}`));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });
    const response = await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    if (!response?.ok()) fail(`HTTP ${response?.status()} loading ${BASE}`);
    await page.waitForFunction(() =>
      window.__sportswear3d?.ready === true &&
      window.__footballRealismReady === true &&
      window.__footballCollarTailorReady === true &&
      window.__footballCrestConformalReady === true &&
      window.__footballCrestUiAuthorityReady === true &&
      window.__footballNamesetReady === true &&
      window.__footballEasyUiReady === true,
      null, { timeout: 60000 }
    );
    await page.waitForTimeout(500);
    checkpoint('runtime-ready');

    const diagnostics = await page.evaluate(() => window.__sportswear3d.diagnostics());
    if (diagnostics.three_revision !== '160') fail(`Unexpected Three revision ${diagnostics.three_revision}`);
    if (diagnostics.meshes.shirt < 1 || diagnostics.meshes.shorts < 1 || diagnostics.meshes.socks < 1) fail(`Missing donor garment mesh: ${JSON.stringify(diagnostics.meshes)}`);
    if (!diagnostics.football_realism) fail('football_realism diagnostics missing');
    if (diagnostics.football_realism.version !== 'football-realism-v6-physical-20260822') fail(`Unexpected realism version ${diagnostics.football_realism.version}`);
    if (!diagnostics.football_realism.full_socks) fail('Full socks are not visible by default');
    if (diagnostics.football_realism.footwear !== 'none') fail(`Footwear must be removed, got ${diagnostics.football_realism.footwear}`);
    if (!diagnostics.football_realism.payload_ui_hidden) fail('Payload/code UI is visible');
    const legacy = await page.evaluate(() => ({
      lower: Boolean(window.__footballRealismScene.getObjectByName('football-realism-lower')),
      bootControl: Boolean(document.getElementById('football-boots')),
      payloadHidden: document.getElementById('payload')?.hidden,
      copyHidden: document.getElementById('copy-payload')?.hidden,
    }));
    if (legacy.lower || legacy.bootControl) fail(`Legacy footwear survived: ${JSON.stringify(legacy)}`);
    if (!legacy.payloadHidden || !legacy.copyHidden) fail(`Code UI not hidden: ${JSON.stringify(legacy)}`);
    checkpoint('garments-no-footwear-hidden-code');

    let realism = await page.evaluate(() => window.__sportswear3d.payload().realism);
    if (realism.typography.preset !== 'pl-2022-23') fail(`Unexpected default typography ${realism.typography.preset}`);
    near(realism.typography.target_name_height_cm, 4.9, 0.01, 'PL name target');
    near(realism.typography.target_back_number_height_cm, 23, 0.01, 'PL back number target');
    near(realism.typography.rendered_name_height_cm_estimate, 4.9, 0.20, 'PL rendered name');
    near(realism.typography.rendered_back_number_height_cm_estimate, 23, 0.25, 'PL rendered number');
    const viewer = page.locator('#viewer-shell');
    await page.evaluate(() => window.__sportswear3d.setView('front'));
    await page.waitForTimeout(700);
    await viewer.screenshot({ path: path.join(OUT, '01-front-no-footwear.png') });
    await page.evaluate(() => window.__sportswear3d.setView('back'));
    await page.waitForTimeout(700);
    await viewer.screenshot({ path: path.join(OUT, '02-back-reference-default.png') });

    await page.locator('[data-easy-advanced-toggle]').click();
    await page.waitForFunction(() => window.__footballEasyUiStatus?.mode === 'advanced', null, { timeout: 5000 });
    await page.locator('#football-typography').selectOption('uefa-2026');
    await page.locator('#apply-football-typography').click();
    await page.waitForTimeout(500);
    realism = await page.evaluate(() => window.__sportswear3d.payload().realism);
    near(realism.typography.target_name_height_cm, 6, 0.01, 'UEFA name target');
    near(realism.typography.target_back_number_height_cm, 30, 0.01, 'UEFA number target');
    near(realism.typography.rendered_name_height_cm_estimate, 6, 0.25, 'UEFA rendered name');
    near(realism.typography.rendered_back_number_height_cm_estimate, 30, 0.35, 'UEFA rendered number');
    await viewer.screenshot({ path: path.join(OUT, '03-back-uefa-physical-size.png') });
    checkpoint('physical-typography');

    await page.evaluate(() => window.__sportswear3d.setView('front'));
    await page.waitForTimeout(500);
    const collarResults = {};
    for (const collar of ['crew', 'v', 'polo', 'polo-button', 'split-v', 'retro-90']) {
      await page.locator('#football-collar').selectOption(collar);
      await page.waitForFunction((expected) => window.__footballCollarTailorStatus?.type === expected, collar, { timeout: 5000 });
      await page.waitForTimeout(260);
      collarResults[collar] = await page.evaluate((expected) => {
        const d = window.__sportswear3d.diagnostics().football_realism;
        const group = window.__footballRealismScene.getObjectByName('football-realism-collar-v6');
        const tailor = window.__footballCollarTailorStatus || {};
        let finite = true, maxAbs = 0;
        const mins = [Infinity, Infinity, Infinity];
        const maxs = [-Infinity, -Infinity, -Infinity];
        group?.traverse((o) => {
          const a = o.geometry?.attributes?.position;
          if (!a) return;
          for (let i = 0; i < a.count; i++) {
            const values = [a.getX(i), a.getY(i), a.getZ(i)];
            if (!values.every(Number.isFinite)) finite = false;
            maxAbs = Math.max(maxAbs, ...values.map(Math.abs));
            for (let axis = 0; axis < 3; axis++) {
              mins[axis] = Math.min(mins[axis], values[axis]);
              maxs[axis] = Math.max(maxs[axis], values[axis]);
            }
          }
        });
        const size = mins.every(Number.isFinite) && maxs.every(Number.isFinite)
          ? maxs.map((value, axis) => value - mins[axis]) : [0, 0, 0];
        return {
          meshes: d.collar_meshes,
          finite,
          maxAbs,
          size,
          tailorVersion: group?.userData?.tailorVersion || null,
          surfaceProjected: group?.userData?.surfaceProjected === true,
          tailorStatus: tailor,
          expected,
        };
      }, collar);
      const result = collarResults[collar];
      if (result.meshes < 1 || !result.finite || result.maxAbs > 20) fail(`Collar ${collar} invalid: ${JSON.stringify(result)}`);
      if (result.tailorVersion !== 'football-collar-tailor-v2-20260823') fail(`Collar ${collar} not rendered by surface tailor: ${JSON.stringify(result)}`);
      if (result.tailorStatus.version !== 'football-collar-tailor-v2-20260823' || result.tailorStatus.type !== collar || result.tailorStatus.finite !== true) fail(`Collar ${collar} tailor status invalid: ${JSON.stringify(result.tailorStatus)}`);
      if (!result.surfaceProjected || result.tailorStatus.surfaceProjected !== true) fail(`Collar ${collar} contains flat/non-projected geometry: ${JSON.stringify(result)}`);
      if (!(result.tailorStatus.heightFraction > 0.015 && result.tailorStatus.heightFraction < 0.18)) fail(`Collar ${collar} vertical footprint unrealistic: ${JSON.stringify(result.tailorStatus)}`);
      if (!(result.tailorStatus.widthFraction > 0.08 && result.tailorStatus.widthFraction < 0.34)) fail(`Collar ${collar} horizontal footprint unrealistic: ${JSON.stringify(result.tailorStatus)}`);
      if (!(result.tailorStatus.depthFraction >= 0 && result.tailorStatus.depthFraction < 0.45)) fail(`Collar ${collar} floats too far from garment: ${JSON.stringify(result.tailorStatus)}`);
      if (result.tailorStatus.maxProjectionFallback > 6) fail(`Collar ${collar} projection fallback escaped bounded window: ${JSON.stringify(result.tailorStatus)}`);
      if (Math.max(...result.size) <= 0.03) fail(`Collar ${collar} has negligible geometry: ${JSON.stringify(result.size)}`);
      await viewer.screenshot({ path: path.join(OUT, `collar-${collar}.png`) });
    }
    checkpoint('surface-projected-collars');

    await page.locator('[data-place="crest"]').click();
    const crestCard = page.locator('[data-graphic]').last();
    await crestCard.locator('input[data-field="file"]').setInputFiles(path.join(FIX, 'ci-logo.png'));
    await page.locator('#crest-in-number').selectOption('off');
    await page.waitForFunction(() => window.__sportswear3d.realism.crestInNumber === false, null, { timeout: 5000 });
    await page.locator('#crest-in-number').selectOption('on');
    await page.waitForFunction(() => window.__footballCrestConformalStatus?.stage === 'built' && window.__footballCrestConformalStatus?.enabled === true, null, { timeout: 8000 });
    const crestCheck = await page.evaluate(() => {
      const group = window.__footballRealismScene.getObjectByName('football-realism-crest-number-v6');
      const mesh = group?.children?.[0];
      const canvas = mesh?.material?.map?.image;
      const status = window.__footballCrestConformalStatus || {};
      const uiAuthority = window.__footballCrestUiAuthorityStatus || {};
      if (!canvas?.getContext) return { meshes: group?.children?.length || 0, alphaPixels: 0, status, uiAuthority, version: group?.userData?.conformalVersion || null };
      const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let alphaPixels = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 20) alphaPixels++;
      return { meshes: group.children.length, alphaPixels, status, uiAuthority, version: group.userData.conformalVersion || null };
    });
    if (crestCheck.meshes < 1 || crestCheck.alphaPixels < 1000) fail(`Crest-in-number pixels missing: ${JSON.stringify(crestCheck)}`);
    if (crestCheck.version !== 'football-crest-conformal-v3-20260823' || crestCheck.status.stage !== 'built') fail(`Conformal crest layer not authoritative: ${JSON.stringify(crestCheck)}`);
    if (crestCheck.uiAuthority.enabled !== true || crestCheck.uiAuthority.value !== 'on') fail(`Crest UI authority did not track ON state: ${JSON.stringify(crestCheck.uiAuthority)}`);
    await page.evaluate(() => window.__sportswear3d.setView('back'));
    await page.waitForTimeout(500);
    await viewer.screenshot({ path: path.join(OUT, '07-back-crest-in-number.png') });
    checkpoint('crest-in-number');

    await page.evaluate(() => window.__sportswear3d.setView('front'));
    await page.locator('#pattern-file').setInputFiles(path.join(FIX, 'ci-pattern.png'));
    await page.waitForTimeout(600);
    if (!(await page.evaluate(() => window.__payload3d.patterns.shirt.present))) fail('Pattern upload failed');
    await page.locator('#clear-pattern').click();
    await page.locator('#add-patch').click();
    const patchCard = page.locator('[data-graphic]').last();
    await patchCard.locator('input[data-field="file"]').setInputFiles(path.join(FIX, 'ci-logo.png'));
    await page.waitForTimeout(600);
    if (!(await page.evaluate(() => window.__payload3d.graphics.some((g) => g.type === 'patch' && g.image_present)))) fail('Patch upload failed');
    await page.locator('#player-number').fill('A10');
    await page.locator('#player-number').dispatchEvent('input');
    await page.waitForTimeout(350);
    if ((await page.evaluate(() => window.__payload3d.personalization.number)) !== 'A10') fail('Free-text number failed');
    await page.evaluate(() => window.__sportswear3d.setView('right'));
    await page.waitForTimeout(500);
    await viewer.screenshot({ path: path.join(OUT, '08-right-patch.png') });
    checkpoint('regressions');

    const final = await page.evaluate(() => window.__sportswear3d.diagnostics());
    const finalAux = await page.evaluate(() => ({
      collar: window.__footballCollarTailorStatus,
      crest: window.__footballCrestConformalStatus,
      crestUi: window.__footballCrestUiAuthorityStatus,
      nameset: window.__footballNamesetStatus,
      easyUi: window.__footballEasyUiStatus,
    }));
    fs.writeFileSync(path.join(OUT, 'runtime-diagnostics.json'), JSON.stringify({ diagnostics: final, collarResults, crestCheck, finalAux, errors }, null, 2));
    if (errors.length) fail(errors.join('\n'));
    console.log('SPORTSWEAR_REAL_BROWSER=PASS');
    console.log(`THREE_REVISION=${final.three_revision}`);
    console.log(`REAL_MESHES=${JSON.stringify(final.meshes)}`);
    console.log(`FOOTBALL_REALISM=${JSON.stringify(final.football_realism)}`);
    console.log('PHYSICAL_TYPOGRAPHY=PASS');
    console.log('NO_FOOTWEAR=PASS');
    console.log('PAYLOAD_UI_HIDDEN=PASS');
    console.log('SURFACE_PROJECTED_COLLAR_GEOMETRY_ALL_VARIANTS=PASS');
    console.log(`CREST_ALPHA_PIXELS=${crestCheck.alphaPixels}`);
    console.log('CONFORMAL_CREST_IN_NUMBER=PASS');
    console.log('PATTERN_UPLOAD=PASS');
    console.log('PATCH_UPLOAD=PASS');
    console.log('FREE_TEXT_NUMBER=PASS');
    console.log('ROTATION_FRONT_BACK_RIGHT=PASS');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
