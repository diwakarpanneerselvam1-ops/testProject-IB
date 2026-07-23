const {test, expect} = require('@playwright/test');
const { login } = require('../workflows/login');
const { createItem } = require('../workflows/createitem');

test.use({
  storageState: undefined,
  contextOptions: { javaScriptEnabled: true },
});

test('Create item and process Stock Adjustment for it-Discovered item', async ({ page }) => {
  // Step 1: Login
  await login(page);

  // Step 2: Create item
  await createItem(page);

  // Step 3: Navigate to Inventory
  await page.locator("#b2-Inventory").click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL('InternationalBearings/Warehouse');

    // Step 4: Navigate to Stock Adjustment

    page.locator('a.mnu-link', { hasText: 'Stock Adjustment' }).click();

    await expect(page).toHaveTitle('Stock Adjustment');

    

    




});

