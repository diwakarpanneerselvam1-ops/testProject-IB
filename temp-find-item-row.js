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
  const searchInput = page.locator('input[placeholder="Search item code"], input[placeholder*="Search item"], input[id*="SearchKeywordItem"]');
  console.log('Search input count:', await searchInput.count());
  for (let i = 0; i < await searchInput.count(); i++) {
    const input = searchInput.nth(i);
    console.log('input', i, 'visible=', await input.isVisible(), 'placeholder=', await input.getAttribute('placeholder'), 'outerHTML=', await input.evaluate(el => el.outerHTML));
  }
  if (await searchInput.count() === 0) {
    console.error('No search input found!');
    await browser.close();
    process.exit(1);
  }
  await searchInput.first().fill('UPLOAD725941');
  await page.waitForTimeout(1500);
  const textLocators = page.locator(`text=UPLOAD725941`);
  console.log('Text locator count:', await textLocators.count());
  for (let i = 0; i < Math.min(await textLocators.count(), 10); i++) {
    const loc = textLocators.nth(i);
    console.log('TEXT', i, 'visible=', await loc.isVisible(), 'outerHTML=', await loc.evaluate(el => el.outerHTML));
    const parent = await loc.evaluate(el => el.parentElement ? el.parentElement.outerHTML : 'no parent');
    console.log('parent:', parent.slice(0, 400));
    const grand = await loc.evaluate(el => el.parentElement && el.parentElement.parentElement ? el.parentElement.parentElement.outerHTML : 'no grand');
    console.log('grand:', grand.slice(0, 400));
  }
  const allCheckboxes = await page.locator('input[type="checkbox"]').all();
  console.log('checkbox count', allCheckboxes.length);
  for (let i = 0; i < Math.min(allCheckboxes.length, 20); i++) {
    const cb = allCheckboxes[i];
    console.log('checkbox', i, 'visible=', await cb.isVisible(), 'checked=', await cb.isChecked().catch(() => false), 'outerHTML=', await cb.evaluate(el => el.outerHTML));
    const anc = await cb.evaluate(el => {
      let node = el;
      while (node && node.tagName !== 'BODY' && node.tagName !== 'HTML') {
        if (node.textContent && node.textContent.includes('UPLOAD725941')) return node.outerHTML;
        node = node.parentElement;
      }
      return null;
    });
    if (anc) console.log('ancestor contains code', anc.slice(0, 400));
  }
  await browser.close();
})();
