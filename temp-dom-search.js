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
  const matches = await page.evaluate(() => {
    const texts = ['Search Item', 'Search', 'Select Items to adjust', 'Search item code', 'Search brand code'];
    const results = [];
    document.querySelectorAll('*').forEach(el => {
      const text = el.textContent?.trim();
      if (!text) return;
      if (texts.some(t => text.includes(t))) {
        results.push({
          tag: el.tagName,
          text: text.slice(0, 200),
          id: el.id || null,
          class: el.className || null,
          outer: el.outerHTML.slice(0, 400)
        });
      }
    });
    return results.slice(0, 80);
  });
  console.log(JSON.stringify(matches, null, 2));
  await browser.close();
})();
