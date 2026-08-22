const { chromium } = require('playwright');

const BASE = process.env.SPORTSWEAR_URL || 'http://127.0.0.1:8282/';
function fail(message) { throw new Error(message); }

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--disable-dev-shm-usage'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.addInitScript(() => { window.__SPORTSWEAR_PUBLISHABLE_KEY = 'pk_ci_sizes'; });

    await page.route('**/store/sportswear/catalog**', async (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        fabrics: [
          {
            sku: 'FABRIC_MATCH_145', title: 'Match 145 g', unit_amount: 3200,
            size_matrix: {
              men: ['XXS','XS','S','M','L','XL','XXL','3XL','4XL','5XL'],
              women: ['XXS','XS','S','M','L','XL','XXL','3XL','4XL'],
              boys: ['5XS','4XS','3XS','XXS','XS','S'],
              girls: ['5XS','4XS','3XS','XXS','XS','S'],
            },
          },
          {
            sku: 'FABRIC_PRO_130', title: 'Pro 130 g', unit_amount: 3900,
            size_matrix: {
              men: ['S','M','L','XL','XXL'],
              women: ['S','M','L'],
              boys: ['3XS','XXS','XS'],
              girls: ['3XS','XXS','XS'],
            },
          },
        ],
        personalizations: [],
      }),
    }));

    await page.route('**/store/sportswear/quote', async (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ quote_version: 'ci-size', priced: false, currency_code: 'eur', missing_skus: ['CI'] }),
    }));

    const response = await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    if (!response?.ok()) fail(`HTTP ${response?.status()}`);
    await page.waitForFunction(() => window.__teamOrderReady === true && window.__teamSizeAvailabilityReady === true, null, { timeout: 30000 });

    await page.locator('#team-add-women').click();
    const womenRow = page.locator('#team-roster tbody tr').nth(1);
    await womenRow.locator('select[data-field="shirtSize"]').selectOption('4XL');
    await womenRow.locator('select[data-field="shortsSize"]').selectOption('4XL');
    await page.locator('#team-fabric').selectOption('FABRIC_MATCH_145');
    await page.waitForTimeout(200);
    if ((await womenRow.locator('select[data-field="shirtSize"]').inputValue()) !== '4XL') fail('Match matrix unexpectedly rejected women 4XL');

    await page.locator('#team-fabric').selectOption('FABRIC_PRO_130');
    await page.waitForTimeout(350);
    const refreshedWomen = page.locator('#team-roster tbody tr').nth(1);
    const shirt = refreshedWomen.locator('select[data-field="shirtSize"]');
    const shorts = refreshedWomen.locator('select[data-field="shortsSize"]');
    const shirtValue = await shirt.inputValue();
    const shortsValue = await shorts.inputValue();
    if (shirtValue !== 'S' || shortsValue !== 'S') fail(`Pro matrix did not realign unsupported women 4XL: ${shirtValue}/${shortsValue}`);
    const fourXlDisabled = await shirt.locator('option[value="4XL"]').isDisabled();
    if (!fourXlDisabled) fail('Unsupported women 4XL is not disabled for Pro fabric');

    const state = await page.evaluate(() => ({
      fabric: window.__teamOrder.fabricSku,
      woman: window.__teamOrder.roster[1],
      ready: window.__teamSizeAvailabilityReady,
      version: window.__teamSizeAvailability?.version,
    }));
    if (state.fabric !== 'FABRIC_PRO_130') fail(`fabric state mismatch ${state.fabric}`);
    if (state.woman.shirtSize !== 'S' || state.woman.shortsSize !== 'S') fail(`roster state not realigned ${JSON.stringify(state.woman)}`);
    if (state.version !== 'team-size-availability-v1-20260822') fail(`unexpected availability version ${state.version}`);

    console.log('FABRIC_SIZE_MATRIX_UI=PASS');
    console.log('UNSUPPORTED_SIZE_DISABLED=PASS');
    console.log('IMPORTED_OR_EXISTING_SIZE_REALIGN=PASS');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
