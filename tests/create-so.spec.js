const { test, expect } = require('@playwright/test');

test('Verify user can navigate to Sales Order', async ({ page }) => {

  // Step 1: Navigate to the Dummy Login page
  await page.goto('https://ib-tst.outsystemsenterprise.com/InternationalBearings/DummyLogin');
  await page.waitForLoadState('networkidle');

  // Step 2: Search for IB Singapore (IBSG)
  await page.getByPlaceholder('Search for Company(Tenant)').fill('IBSG');

  // Step 3: Select IB Singapore
  await page.getByText('IB Singapore(IBSG)').click();

  // Step 4: Login
  const row = page.locator('tr', { hasText: 'IB Singapore' }).first();
  await row.getByText('Click to login').click();

  // Step 5: Verify Dashboard
  await page.waitForURL(/MainEnquiry/);
  await expect(page).toHaveURL(/MainEnquiry/);

  console.log('✅ Logged in successfully');

  // Step 6: Navigate to Sales
  const sidebarTooltips = page.locator('.osui-tooltip__content');
  await sidebarTooltips.nth(1).click();

  // Verify Quotation page
  await expect(page).toHaveURL(/Quotation/);

  console.log('✅ Navigated to Sales');

  // Step 7: Open Order tab
  await page.locator('a', { hasText: 'Order V2' }).first().click();

  // Verify Sales Order page
  await expect(page).toHaveURL(/SalesOrderV2/);

  console.log('✅ Navigated to Sales Order');

  // Screenshot
  await page.screenshot({
    path: 'test-results/sales-order.png',
    fullPage: true


    
  });
  // --- assumes `page` is already on the Sales Order screen (Order list) ---

// 1. Switch from "Order" tab to "Create Order" tab
await page.getByRole('tab', { name: 'Create Order' }).click();

// The form shows a "Retrieving data" processing modal while it loads;
// interacting with fields before it clears causes the click to be lost
// and the dropdown to never open.
await page.locator('.processing-popup-container').waitFor({ state: 'hidden' });

// Helper: scope to the field block that contains an exact-match label,
// then interact with its custom dropdown widget
function fieldByLabel(page, labelText) {
  return page.locator(
    `xpath=//label[normalize-space(.)="${labelText}"]/ancestor::div[contains(@class,"OSInline")][1]`
  );
}

// 2. Select Customer = "R.K NETWORK LTD"
const customerField = fieldByLabel(page, 'Customer');
await customerField.locator('.lazy-dropdown-search').click();
await customerField.locator('input.dropdown-search-field').fill('R.K NETWORK');
await customerField
  .locator('.lazy-dropdown-search__item--choice', { hasText: 'R.K NETWORK LTD' })
  .first()
  .click();

// Selecting the customer triggers another async lookup (GST codes for
// that customer), which re-shows the "Retrieving data" modal.
await page.locator('.processing-popup-container').waitFor({ state: 'hidden' });

// 3. Select the first available GST Code
const gstField = fieldByLabel(page, 'GST Code');
await gstField.locator('.lazy-dropdown-search').click();
// Give the async GST lookup a moment to actually show the modal, if it's going to
await page.locator('.processing-popup-container').waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
// Now wait for it to clear (no-op if it never appeared)
await page.locator('.processing-popup-container').waitFor({ state: 'hidden' });
const gstOptions = gstField.locator(
  '.lazy-dropdown-search__item--choice:not(.lazy-dropdown-search__placeholder)'
);
await gstOptions.first().click(); // picks "IBV01" in current test data

// 4. Once Customer + GST Code (mandatory fields) are set, the other tabs unlock.
//    Navigate to "Item Details"
await page.getByRole('tab', { name: 'Item Details' }).click();

// Optional sanity check that navigation succeeded
await page.waitForSelector('div[role="tab"].active:has-text("Item Details")');

});