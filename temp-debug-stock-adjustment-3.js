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

  const searchItemNodes = await page.locator('text=Search Item').all();
  console.log('Search Item nodes:', searchItemNodes.length);
  for (let i = 0; i < searchItemNodes.length; i++) {
    const node = searchItemNodes[i];
    console.log('NODE', i, 'visible=', await node.isVisible(), 'text=', await node.innerText().catch(() => ''), 'outerHTML=', (await node.evaluate(el => el.outerHTML)).slice(0, 400));
  }

  const inputs = await page.locator('input[placeholder*="Search"]').all();
  console.log('Search placeholders count:', inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    console.log('INPUT', i, 'placeholder=', await input.getAttribute('placeholder'), 'visible=', await input.isVisible(), 'outerHTML=', (await input.evaluate(el => el.outerHTML)).slice(0, 400));
  }

  console.log('Clicking first Search Item node');
  if (searchItemNodes.length > 0) {
    await searchItemNodes[0].click();
    await page.waitForTimeout(1500);
  }

  const searchItemCode = await page.locator('input[placeholder*="item code"], input[placeholder*="Search item"]');
  console.log('Search item code count after click:', await searchItemCode.count());
  for (let i = 0; i < await searchItemCode.count(); i++) {
    const input = searchItemCode.nth(i);
    console.log('ITEM INPUT', i, 'placeholder=', await input.getAttribute('placeholder'), 'visible=', await input.isVisible(), 'outerHTML=', (await input.evaluate(el => el.outerHTML)).slice(0, 400));
  }

  const anyTextNodes = await page.locator('text=Search').all();
  console.log('Any text containing Search count:', await anyTextNodes.length);
  for (let i = 0; i < await anyTextNodes.length; i++) {
    const node = anyTextNodes[i];
    console.log('SEARCH TEXT', i, 'visible=', await node.isVisible(), 'outerHTML=', (await node.evaluate(el => el.outerHTML)).slice(0, 400));
  }

  console.log('Done');
  await browser.close();
})();
