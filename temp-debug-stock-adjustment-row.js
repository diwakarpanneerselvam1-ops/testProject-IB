const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
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
  await page.getByText('Search Item').first().click();
  await page.waitForTimeout(1000);
  await page.getByPlaceholder('Search item code').fill('UPLOAD725941');
  await page.waitForTimeout(1000);
  const selectors = [
    'tr',
    'div',
    'li',
    'span',
    'button',
    'label'
  ];
  for (const sel of selectors) {
    const loc = page.locator(`${sel}:has-text("UPLOAD725941")`);
    const count = await loc.count();
    if (count > 0) {
      console.log(sel, 'count=', count);
      for (let i = 0; i < Math.min(count, 5); i++) {
        const node = loc.nth(i);
        const isVisible = await node.isVisible();
        console.log('  index=', i, 'visible=', isVisible, 'outerHTML=', (await node.evaluate(el => el.outerHTML)).slice(0, 800));
      }
    }
  }
  const checkboxes = await page.locator('input[type="checkbox"]').all();
  console.log('checkbox count', checkboxes.length);
  for (let i = 0; i < Math.min(checkboxes.length, 20); i++) {
    const cb = checkboxes[i];
    const visible = await cb.isVisible();
    const checked = await cb.isChecked().catch(() => false);
    console.log('checkbox', i, 'visible=', visible, 'checked=', checked, 'outerHTML=', await cb.evaluate(el => el.outerHTML));
  }
  await browser.close();
})();
