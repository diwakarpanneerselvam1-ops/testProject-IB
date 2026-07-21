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
  console.log('--- search item elements ---');
  const searchItemLocators = page.locator('text=Search Item');
  console.log('Search Item count:', await searchItemLocators.count());
  for (let i = 0; i < await searchItemLocators.count(); i++) {
    const locator = searchItemLocators.nth(i);
    const text = await locator.innerText().catch(() => '');
    console.log('SEARCH ITEM', i, text, await locator.isVisible(), await locator.evaluate(el => el.outerHTML));
  }
  const searchInputs = page.locator('input[placeholder*="Search"]');
  console.log('input[placeholder*=Search] count:', await searchInputs.count());
  for (let i = 0; i < await searchInputs.count(); i++) {
    const input = searchInputs.nth(i);
    const placeholder = await input.getAttribute('placeholder');
    const visible = await input.isVisible();
    const disabled = await input.isDisabled();
    console.log('INPUT', i, placeholder, visible, disabled, await input.evaluate(el => el.outerHTML));
  }
  console.log('--- searching for item code input by id ---');
  const itemCodeInput = page.locator('input#b12-b12-Input_SearchKeywordItem');
  console.log('item code exists', await itemCodeInput.count(), 'visible', await itemCodeInput.isVisible());
  if (await itemCodeInput.count()) {
    console.log(await itemCodeInput.evaluate(el => el.outerHTML));
    console.log('closest parent', await itemCodeInput.evaluate(el => {
      let cur = el;
      for (let i = 0; i < 4; i++) {
        if (!cur.parentElement) break;
        cur = cur.parentElement;
      }
      return cur.outerHTML;
    }));
  }
  console.log('--- DOM category labels ---');
  const nodes = page.locator('div, span, label, button');
  for (let i = 0; i < await nodes.count(); i++) {
    const node = nodes.nth(i);
    const text = (await node.innerText().catch(() => '')).trim();
    if (/Search/i.test(text) || /Item/i.test(text) || /item code/i.test(text)) {
      console.log('NODE', i, text, await node.isVisible(), await node.evaluate(el => el.outerHTML));
    }
  }
  await browser.close();
})();
