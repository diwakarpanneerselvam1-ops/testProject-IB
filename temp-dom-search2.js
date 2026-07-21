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
    const results = [];
    document.querySelectorAll('*').forEach(el => {
      const txt = (el.innerText || '').trim();
      const attrs = [];
      if (el.placeholder && el.placeholder.includes('Search')) attrs.push(`placeholder=${el.placeholder}`);
      if (el.ariaLabel && el.ariaLabel.includes('Search')) attrs.push(`aria-label=${el.ariaLabel}`);
      if (el.id && el.id.includes('Search')) attrs.push(`id=${el.id}`);
      if (el.title && el.title.includes('Search')) attrs.push(`title=${el.title}`);
      if (txt.includes('Search') || txt.includes('Item') || txt.includes('UPLOAD')) {
        results.push({
          tag: el.tagName,
          attrs: attrs.join(' '),
          text: txt.slice(0,100),
          outerHTML: el.outerHTML.slice(0, 500)
        });
      }
    });
    return results.slice(0, 120);
  });
  console.log(JSON.stringify(nodes, null, 2));
  await browser.close();
})();
