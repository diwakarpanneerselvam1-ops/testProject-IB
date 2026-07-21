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

  const results = await page.evaluate(() => {
    const visibleInputs = [];
    const nodes = [...document.querySelectorAll('input,textarea,select,div,span,label')];
    for (const el of nodes) {
      const rect = el.getBoundingClientRect();
      const visible = rect.width > 1 && rect.height > 1 && window.getComputedStyle(el).visibility !== 'hidden' && window.getComputedStyle(el).display !== 'none';
      if (!visible) continue;
      const text = (el.textContent || '').trim();
      const attrs = {};
      for (const a of el.getAttributeNames()) {
        attrs[a] = el.getAttribute(a);
      }
      if (text.includes('Search') || text.includes('Item') || attrs.placeholder?.includes('Search') || attrs.id?.includes('Search') || attrs.class?.includes('search') || attrs.id?.includes('item') || attrs.class?.includes('item')) {
        visibleInputs.push({
          tag: el.tagName,
          text: text.slice(0, 80),
          placeholder: attrs.placeholder || '',
          id: attrs.id || '',
          name: attrs.name || '',
          class: attrs.class || '',
          type: attrs.type || '',
          value: attrs.value || '',
          outerHTML: el.outerHTML.slice(0, 400),
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        });
      }
    }
    return visibleInputs;
  });
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();