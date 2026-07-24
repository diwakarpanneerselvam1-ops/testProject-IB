const { expect } = require('@playwright/test');
const ItemPage = require('../PageObjects/ItemPage');
const RandomData = require('../utils/RandomData');

/**
 * Creates a new item in the International Bearings app and verifies it.
 * Assumes the user is already logged in (call login(page) before this).
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<string>} the generated itemCodeValue
 * 
 */

async function createItem(page) {

  const itemPage = new ItemPage(page); // Create an instance of the ItemPage class
  const itemCode = RandomData.itemCode(); // Generate a random item code


  // Navigate to the Administration module

 await itemPage.openCreateItemPage();
  
  // Enter the Item Code
  
  await itemPage.enterItemCode(itemCode);
  await itemPage.verifyItemCode(itemCode);

  // Select an Item Description (Group)

await itemPage.selectItemGroup();

  // Select Brand as FBJ

  await itemPage.selectBrand('FBJ');

  await itemPage.verifyBrand('FBJ');


  // Save the Item

  await itemPage.clickSave();

  // Verify in Main Enquiry
  
  await itemPage.verifyItemCreated(); // Verify the success message is displayed

  await itemPage.verifyItemInMainEnquiry(itemCode,'FBJ'   );

  console.log(`✅ Item '${itemCode}' created successfully`);

  return itemCode; //

}

module.exports = { createItem };