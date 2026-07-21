const { test } = require('@playwright/test');
const { login } = require('../utils/login');
const { createItem } = require('../utils/createItem');

test.use({
  storageState: undefined,
  contextOptions: { javaScriptEnabled: true },
});

test('Verify user can create an item', async ({ page }) => {
  await login(page);
  await createItem(page);
});