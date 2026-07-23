const { test } = require('@playwright/test');
const { login } = require('../workflows/login');
const { createItem } = require('../workflows/createitem');

test.use({
  storageState: undefined,
  // contextOptions: { javaScriptEnabled: true },
});

test('Verify user can create an item', async ({ page }) => {
  await login(page);
  await createItem(page);
});