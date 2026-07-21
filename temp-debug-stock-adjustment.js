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
  const buttons = await page.locator('button, input, div, span').all();
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].innerText().catch(() => '');
    if (/Search Item|Search item code|Search/i.test(text)) {
      console.log('TEXT', i, text, await buttons[i].evaluate(n => n.outerHTML));
    }
  }
  const inputs = await page.locator('input').all();
  console.log('input count', inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    const placeholder = await inputs[i].getAttribute('placeholder');
    const visible = await inputs[i].isVisible();
    if (placeholder && /search/i.test(placeholder)) {
      console.log('INPUT', i, placeholder, visible, await inputs[i].evaluate(n => n.outerHTML));
    }
  }
  console.log('DONE');
  await browser.close();
})();
