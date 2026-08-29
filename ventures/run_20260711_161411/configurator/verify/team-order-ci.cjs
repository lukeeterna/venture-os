const { chromium } = require('playwright');

const BASE = process.env.SPORTSWEAR_URL || 'http://127.0.0.1:8282/';
function fail(message) { throw new Error(message); }

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--disable-dev-shm-usage'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
    await page.addInitScript(() => { window.__SPORTSWEAR_PUBLISHABLE_KEY = 'pk_ci_sportswear'; });
    const errors = [];
    let catalogKey = null;
    let quoteKey = null;
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.stack || err.message}`));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`); });

    await page.route('**/store/sportswear/catalog**', async (route) => {
      catalogKey = route.request().headers()['x-publishable-api-key'] || null;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          fabrics: [
            { sku: 'FABRIC_MATCH_145', title: 'Match 145 g', unit_amount: 3200, size_matrix: { men: ['XXS','XS','S','M','L','XL','XXL','3XL','4XL','5XL'], women: ['XXS','XS','S','M','L','XL','XXL','3XL','4XL'], boys: ['5XS','4XS','3XS','XXS','XS','S'], girls: ['5XS','4XS','3XS','XXS','XS','S'] } },
            { sku: 'FABRIC_PRO_130', title: 'Pro 130 g', unit_amount: 3900 },
          ],
          personalizations: [
            { sku: 'CUSTOM_NAME', title: 'Nome' },
            { sku: 'BACK_NUMBER', title: 'Numero retro' },
          ],
        }),
      });
    });

    await page.route('**/store/sportswear/quote', async (route) => {
      const request = route.request();
      quoteKey = request.headers()['x-publishable-api-key'] || null;
      const body = JSON.parse(request.postData() || '{}');
      const quantity = Number(body.quantity || 0);
      const unit = quantity >= 10 ? 4100 : 4600;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quote_version: 'ci-v1',
          priced: true,
          currency_code: 'eur',
          total_amount: unit * quantity,
          unit_average_amount: unit,
          discount_amount: quantity >= 10 ? 500 * quantity : 0,
          lines: [
            { sku: body.fabric_sku, title: 'Tessuto', total_amount: 3200 * quantity, tier: quantity >= 10 ? '10+ pezzi' : null },
            { sku: 'CUSTOM_NAME', title: 'Nome', total_amount: 500 * quantity },
            { sku: 'BACK_NUMBER', title: 'Numero retro', total_amount: 400 * quantity },
          ],
        }),
      });
    });

    const response = await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    if (!response || !response.ok()) fail(`HTTP ${response?.status()} loading ${BASE}`);
    await page.waitForFunction(() => window.__teamOrderReady === true, null, { timeout: 30000 });
    if (catalogKey !== 'pk_ci_sportswear') fail(`catalog publishable key missing: ${catalogKey}`);

    const initial = await page.evaluate(() => ({
      ready: window.__teamOrderReady,
      categories: window.__sportswear3d.diagnostics().team_order.categories,
      players: window.__teamOrder.roster.length,
      payloadVersion: window.__sportswear3d.payload().v,
      defaultCategory: window.__teamOrder.roster[0]?.category,
      medusaBridge: window.__sportswearMedusaFetchInstalled,
    }));
    if (!initial.ready || !initial.medusaBridge) fail(`team/bridge not ready ${JSON.stringify(initial)}`);
    if (JSON.stringify(initial.categories) !== JSON.stringify(['men', 'women', 'boys', 'girls'])) fail(`categories mismatch ${JSON.stringify(initial.categories)}`);
    if (initial.players !== 1 || initial.defaultCategory !== 'men') fail(`unexpected initial roster ${JSON.stringify(initial)}`);
    if (initial.payloadVersion !== 4) fail(`expected payload v4 got ${initial.payloadVersion}`);

    await page.locator('#team-add-women').click();
    await page.locator('#team-add-boys').click();
    await page.locator('#team-add-girls').click();
    await page.waitForTimeout(150);

    const rows = page.locator('#team-roster tbody tr');
    if (await rows.count() !== 4) fail(`expected 4 roster rows got ${await rows.count()}`);

    const row0 = rows.nth(0);
    const row1 = rows.nth(1);
    const row2 = rows.nth(2);
    const row3 = rows.nth(3);
    await row0.locator('input[data-field="name"]').fill('ROSSI');
    await row0.locator('input[data-field="number"]').fill('10');
    await row1.locator('input[data-field="name"]').fill('BIANCHI');
    await row1.locator('input[data-field="number"]').fill('7');
    await row2.locator('input[data-field="name"]').fill('VERDI');
    await row2.locator('input[data-field="number"]').fill('9');
    await row3.locator('input[data-field="name"]').fill('NERI');
    await row3.locator('input[data-field="number"]').fill('11');

    const optionCounts = await page.evaluate(() => Array.from(document.querySelectorAll('#team-roster tbody tr')).map((row) => ({
      category: row.querySelector('select[data-field="category"]').value,
      shirtOptions: row.querySelector('select[data-field="shirtSize"]').options.length,
    })));
    const expectedCounts = { men: 10, women: 9, boys: 6, girls: 6 };
    for (const item of optionCounts) if (item.shirtOptions !== expectedCounts[item.category]) fail(`size option count ${JSON.stringify(item)}`);

    await row1.locator('select[data-field="shirtSize"]').selectOption('S');
    await row1.locator('select[data-field="shortsSize"]').selectOption('M');
    await row1.locator('select[data-field="socksSize"]').selectOption('39/42');
    await row2.locator('select[data-field="shirtSize"]').selectOption('3XS');
    await row3.locator('select[data-field="shirtSize"]').selectOption('XXS');

    await page.locator('#team-fabric').selectOption('FABRIC_MATCH_145');
    await page.waitForFunction(() => window.__teamOrder.quoteState === 'ready', null, { timeout: 10000 });
    if (quoteKey !== 'pk_ci_sportswear') fail(`quote publishable key missing: ${quoteKey}`);

    await row1.locator('[data-preview]').click();
    await page.waitForTimeout(250);
    const preview = await page.evaluate(() => ({
      name: document.getElementById('player-name').value,
      number: document.getElementById('player-number').value,
      selected: window.__teamOrder.selectedPlayerId,
    }));
    if (preview.name !== 'BIANCHI' || preview.number !== '7') fail(`preview mismatch ${JSON.stringify(preview)}`);

    await page.waitForFunction(() => window.__teamOrder.quoteState === 'ready', null, { timeout: 10000 });
    const payload = await page.evaluate(() => window.__sportswear3d.payload());
    if (payload.v !== 4) fail(`payload v ${payload.v}`);
    if (payload.team_order.players.length !== 4 || payload.team_order.total_quantity !== 4) fail(`team payload mismatch ${JSON.stringify(payload.team_order)}`);
    if (payload.team_order.fabric_sku !== 'FABRIC_MATCH_145') fail('fabric sku missing from payload');
    if (payload.team_order.players[1].category !== 'women' || payload.team_order.players[1].shirt_size !== 'S' || payload.team_order.players[1].shorts_size !== 'M') fail('women sizes not preserved');
    if (payload.team_order.players[2].category !== 'boys' || payload.team_order.players[3].category !== 'girls') fail('youth categories not preserved');
    if (!payload.team_order.quote?.priced) fail('quote not attached to payload');
    if (!payload.team_order.feature_units.some((line) => line.sku === 'CUSTOM_NAME')) fail('name pricing feature missing');
    if (!payload.team_order.feature_units.some((line) => line.sku === 'BACK_NUMBER')) fail('number pricing feature missing');

    const quoteText = await page.locator('#team-quote').innerText();
    if (!quoteText.includes('184,00') && !quoteText.includes('184')) fail(`quote UI missing expected amount: ${quoteText}`);

    console.log('TEAM_ORDER_BROWSER=PASS');
    console.log('CATEGORIES=men,women,boys,girls');
    console.log('PLAYER_LEVEL_SIZES=PASS');
    console.log('WOMENS_FOOTBALL=PASS');
    console.log('YOUTH_BOYS_GIRLS_SPLIT=PASS');
    console.log('ROSTER_PREVIEW=PASS');
    console.log('PAYLOAD_V4=PASS');
    console.log('MEDUSA_PUBLISHABLE_KEY_BRIDGE=PASS');
    console.log('BACKOFFICE_QUOTE_CONTRACT=PASS');
    if (errors.length) console.log(`NON_FATAL_PAGE_ERRORS=${JSON.stringify(errors)}`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
