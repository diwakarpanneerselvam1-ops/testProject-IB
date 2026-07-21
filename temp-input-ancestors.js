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
  const input = await page.locator('#b12-b12-Input_SearchKeywordItem');
  console.log('count', await input.count());
  if (await input.count() > 0) {
    console.log('visible', await input.isVisible());
    console.log('outerHTML', await input.evaluate(el => el.outerHTML));
    let current = await input.evaluateHandle(el => el.parentElement);
    for (let i = 0; i < 6 && current; i++) {
      const html = await current.evaluate(el => el.outerHTML);
      console.log(`ancestor ${i}:`, html.slice(0, 400));
      const parent = await current.evaluateHandle(el => el.parentElement);
      current = parent;
    }
  }
  await browser.close();
})();
