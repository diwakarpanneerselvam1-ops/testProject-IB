const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false });
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

  console.log('pre click visible?');
  const searchItem = page.getByPlaceholder('Search Item');
  console.log('searchItem count', await searchItem.count(), 'visible=', await searchItem.isVisible());
  await searchItem.click();
  await page.waitForTimeout(1000);
  const searchItemCode = page.getByPlaceholder('Search item code');
  console.log('searchItemCode count', await searchItemCode.count(), 'visible=', await searchItemCode.isVisible(), 'outer=', await searchItemCode.evaluate(el => el.outerHTML));
  await searchItemCode.fill('UPLOAD725941');
  await page.waitForTimeout(1000);
  const rows = await page.locator('tr:has-text("UPLOAD725941")').all();
  console.log('tr rows count', rows.length);
  for (let i = 0; i < rows.length; i++) {
    console.log('row outer', await rows[i].evaluate(el => el.outerHTML));
  }
  const divRows = await page.locator('div:has-text("UPLOAD725941")').all();
  console.log('div rows count', divRows.length);
  for (let i = 0; i < Math.min(divRows.length, 10); i++) {
    console.log('div row', await divRows[i].evaluate(el => el.outerHTML.slice(0,400)));
  }
  await browser.close();
})();