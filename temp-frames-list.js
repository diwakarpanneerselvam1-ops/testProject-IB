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
  console.log('frames count', page.frames().length);
  page.frames().forEach((frame, index) => {
    console.log('frame', index, 'name=', frame.name(), 'url=', frame.url());
  });
  for (const frame of page.frames()) {
    const frameText = await frame.evaluate(() => document.body.innerText.slice(0, 1000)).catch(() => 'error');
    console.log('FRAME', frame.name(), 'TEXT first 1000 chars =');
    console.log(frameText);
    const containsSearch = await frame.evaluate(() => document.body.innerText.includes('Search Item')).catch(() => false);
    console.log('FRAME', frame.name(), 'contains Search Item?', containsSearch);
  }
  await browser.close();
})();