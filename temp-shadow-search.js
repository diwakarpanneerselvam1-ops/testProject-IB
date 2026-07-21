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
  const results = await page.evaluate(() => {
    const out = [];
    const visited = new Set();
    function visit(node, path) {
      if (!node || visited.has(node)) return;
      visited.add(node);
      try {
        const text = (node.textContent || '').trim();
        if (text && /Search|Select Items|UPLOAD|Search Item|Search brand/i.test(text)) {
          out.push({ tag: node.tagName, text: text.slice(0, 120), id: node.id || '', cls: node.className || '', path, hasShadow: !!node.shadowRoot });
        }
      } catch (e) {}
      const shadow = node.shadowRoot;
      if (shadow) {
        visit(shadow, path + ' > shadowRoot');
      }
      const children = node.children || [];
      for (const child of children) {
        visit(child, path + ' > ' + child.tagName);
      }
    }
    visit(document.documentElement, 'html');
    return out.slice(0, 120);
  });
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();