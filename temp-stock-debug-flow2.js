const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://ib-tst.outsystemsenterprise.com/InternationalBearings/DummyLogin');
  await page.getByPlaceholder('Search for Company(Tenant)').fill('IBSG');
  await page.getByText('IB Singapore(IBSG)').click();
  const row = page.locator('tr', { hasText: 'IB Singapore' }).first();
  await row.getByText('Click to login').click();
  await page.waitForURL(/MainEnquiry/);
  await page.goto('https://ib-tst.outsystemsenterprise.com/InternationalBearings/Warehouse');
  await page.getByRole('link', { name: 'Stock Adjustment' }).click();
  await page.getByText('Process Stock Adjustment').click();
  await page.waitForLoadState('networkidle');
  console.log('After Process click');
  const searchItemWidgets = await page.locator('text=Search Item').all();
  console.log('Search Item loc count', await page.locator('text=Search Item').count());
  for (let i = 0; i < await page.locator('text=Search Item').count(); i++) {
    const loc = page.locator('text=Search Item').nth(i);
    console.log('Search Item', i, 'visible=', await loc.isVisible(), 'outer=', await loc.evaluate(el => el.outerHTML));
  }
  const allInputs = await page.locator('input').all();
  console.log('total inputs', allInputs.length);
  for (let i = 0; i < allInputs.length; i++) {
    const input = allInputs[i];
    const placeholder = await input.getAttribute('placeholder');
    const visible = await input.isVisible();
    const id = await input.getAttribute('id');
    const cls = await input.getAttribute('class');
    if (placeholder || visible) {
      console.log('INPUT', i, 'visible=', visible, 'placeholder=', placeholder, 'id=', id, 'class=', cls, 'outer=', await input.evaluate(el => el.outerHTML));
    }
  }
  const headers = await page.locator('div, span, label, button, a').all();
  let found = 0;
  for (let i = 0; i < Math.min(await page.locator('div, span, label, button, a').count(), 200); i++) {
    const el = page.locator('div, span, label, button, a').nth(i);
    const text = await el.innerText().catch(() => '');
    if (/Search Item|Search|Upload|Select Items|Item|Brand|Code/i.test(text)) {
      console.log('EL', i, 'text=', text.trim(), 'visible=', await el.isVisible(), 'outer=', await el.evaluate(e => e.outerHTML.slice(0,300)));
      found++;
      if (found > 50) break;
    }
  }
  const match = await page.locator('text=UPLOAD725941').count();
  console.log('UPLOAD725941 count', match);
  await browser.close();
})();