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
  const nodes = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).map(el => ({
      tag: el.tagName,
      ariaLabel: el.getAttribute('aria-label'),
      title: el.getAttribute('title'),
      placeholder: el.getAttribute('placeholder'),
      id: el.id,
      cls: el.className,
      text: (el.textContent || '').trim().slice(0, 80)
    })).filter(item => /Search Item|Search item|Search|Item/i.test(item.ariaLabel || '') || /Search Item|Search item|Search|Item/i.test(item.title || '') || /Search Item|Search item|Search|Item/i.test(item.placeholder || '') || /Search Item|Search item|Search|Item/i.test(item.id || '') || /Search Item|Search item|Search|Item/i.test(item.cls || '') || /Search Item|Search item|Search|Item/i.test(item.text));
  });
  console.log(JSON.stringify(nodes, null, 2));
  await browser.close();
})();