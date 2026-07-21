const { test, expect } = require('@playwright/test');

async function login(page) {
    

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

}

module.exports = {login};