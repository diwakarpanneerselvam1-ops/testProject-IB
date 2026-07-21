const { expect } = require('@playwright/test');
const { login } = require('../utils/login');

/**
 * Creates a new item in the International Bearings app and verifies it.
 * Assumes the user is already logged in (call login(page) before this).
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<string>} the generated itemCodeValue
 * 
 */



async function createItem(page) {
  const itemCodeValue = `UPLOAD${Date.now().toString().slice(-6)}`;

const selectadmin = page.locator('#b2-admin');
await page.waitForLoadState('networkidle');
  await selectadmin.click();
  // await expect(selectadmin).toBeChecked();

  // // Navigate to the Administration module
  // await page.goto('https://ib-tst.outsystemsenterprise.com/InternationalBearings_Admin/Users');
  // await expect(page.getByText('ADMINISTRATION', { exact: true })).toBeVisible();

  // Navigate to Products > Item
  await page.getByText('Products', { exact: true }).click();
  await page.getByText('Item', { exact: true }).click();

  // Enable the Trade toggle
  // const tradeToggle = page.locator('#b8-Switch4');
  // await tradeToggle.click();
  //  await page.waitForLoadState('networkidle');
  //  await expect(tradeToggle).toBeChecked();

  // Open the Create Item page
  await page.getByText('Create Item', { exact: true }).click();
  await page.waitForLoadState('networkidle');

  // Enter the Item Code
  const itemCode = page.locator('#b12-Input_ItemCode');
  await itemCode.fill(itemCodeValue);
  await expect(itemCode).toHaveValue(new RegExp(itemCodeValue));

  // Select an Item Description (Group)
  await page.locator('#b12-ItemGroup .vscomp-toggle-button').click();
  await page.locator('#b12-ItemGroup .vscomp-option').first().click();
  await expect(itemCode).toHaveValue(new RegExp(itemCodeValue, 'i'));

  // Select Brand as FBJ
  const brandSelect = page.locator('#b12-ItemBrand');
  await brandSelect.selectOption({ label: 'FBJ' });
  await expect(brandSelect).toHaveValue('12');

  const selectedLabel = await brandSelect.evaluate(el => el.options[el.selectedIndex].text);
  expect(selectedLabel).toBe('FBJ');

  // Save the Item
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Item successfully Created!')).toBeVisible();
  console.log(`✅ Item '${itemCodeValue}' Successfully created`);

  // Verify in Main Enquiry
  await page.goto('https://ib-tst.outsystemsenterprise.com/InternationalBearings/MainEnquiry?IsF8Mode=false');
  await page.getByPlaceholder('Search Item Here').fill(itemCodeValue);
  await page.getByPlaceholder('Search Item Here').press('Enter');

  await expect(page.getByText(itemCodeValue, { exact: true })).toBeVisible();
  await expect(page.getByText('FBJ', { exact: true }).first()).toBeVisible();
  console.log(`✅ Item '${itemCodeValue}' found successfully in Main Enquiry`);

  return itemCodeValue;
}

module.exports = { createItem };