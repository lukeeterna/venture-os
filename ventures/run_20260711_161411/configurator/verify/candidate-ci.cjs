const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const BASE = process.env.SPORTSWEAR_URL || 'http://127.0.0.1:8282/';
const OUT = path.join(__dirname, 'visual-output');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader','--disable-dev-shm-usage'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 800 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.stack || e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const report = {};
  for (const model of ['collapsed','baked2','lower2','madjin']) {
    await page.goto(`${BASE}verify/candidate-viewer.html?model=${model}`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForFunction(() => window.__candidate && window.__candidate.ready === true, null, { timeout: 30000 });
    await page.waitForTimeout(700);
    report[model] = await page.evaluate(() => window.__candidate);
    await page.screenshot({ path: path.join(OUT, `candidate-${model}.png`) });
  }
  fs.writeFileSync(path.join(OUT, 'candidate-report.json'), JSON.stringify({ report, errors }, null, 2));
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('SHIRT_CANDIDATE_BROWSER=PASS');
  console.log(JSON.stringify(report));
  await browser.close();
})().catch(err => { console.error(err.stack || err); process.exitCode = 1; });
