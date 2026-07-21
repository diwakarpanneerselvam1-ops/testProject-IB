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
  const matches = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('*').forEach(el => {
      const text = el.textContent?.trim();
      if (text && /Search/i.test(text)) {
        out.push({ tag: el.tagName, text: text.slice(0, 80), outer: el.outerHTML.slice(0, 400) });
      }
    });
    return out.slice(0, 120);
  });
  console.log(JSON.stringify(matches, null, 2));
  const buttons = await page.locator('button, [role="button"], [tabindex="0"]').all();
  console.log('buttonish count', await buttons.length);
  for (let i = 0; i < Math.min(await buttons.length, 80); i++) {
    const el = buttons[i];
    const text = await el.innerText().catch(() => '');
    if (/Search/i.test(text)) {
      console.log('buttonish', i, 'text=', text, 'outerhtml=', await el.evaluate(e => e.outerHTML.slice(0,400)));
    }
  }
  await browser.close();
})();