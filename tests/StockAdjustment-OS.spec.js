const { test, expect } = require('@playwright/test');
const { login } = require('../workflows/login');
const { createItem } = require('../workflows/createItem');
const StockAdjustmentPage = require('../PageObjects/StockAdjustmentPage');
const MainEnquiryPage = require('../PageObjects/MainEnquiryPage')




test('Create item and process Stock Adjustment for it', async ({ page }) => {

  const stockPage = new StockAdjustmentPage(page);
  const enquiryPage = new MainEnquiryPage(page);

  // Step 1: Login
  await login(page);

  // Step 2: Create item and capture the code for use in Stock Adjustment
  const itemCodeValue = await createItem(page);
  console.log(`Using newly created item for Stock Adjustment: ${itemCodeValue}`);

  
  await stockPage.open();

  await stockPage.selectDiscrepancy('Opening Stock');

  await stockPage.selectPositiveAdjustment();

  await stockPage.searchItemByCode(itemCodeValue);

  await stockPage.addItemDetails();

  await stockPage.selectBinLocation('BIN100021');

  await stockPage.selectPackType('1X10');

  await stockPage.selectCountryOfOrigin('Japan');

  await stockPage.fillItemDetails('BIN100021', 100, 1.23);

  const purchaseDate = new Date();

  purchaseDate.setDate(purchaseDate.getDate() - 1); 

  await stockPage.selectPurchaseDate(purchaseDate);

  await stockPage.save();

  // ===================== CAPTURE NEW DOCUMENT NUMBER =====================
  // Filter to rows that contain a document link to skip the header row
  // (whose first cell is a select-all checkbox with hidden tooltip text).

  const docNumber = await stockPage.getDocumentNumber();
  console.log(`📄 New Stock Adjustment Document Number: ${docNumber}`);
  expect(docNumber).not.toBe('');
  // Reusable locator; Playwright re-queries the live page on each use, so
  // this stays valid across the page.goto() navigations below

  // ===================== STEP 1: VERIFY STATUS = PENDING, QTY IN STAGING =====================

  await stockPage.verifyStatus(docNumber, 'Pending');
  console.log(`✅ Document ${docNumber} status confirmed as Pending`);

  await enquiryPage.searchItem(itemCodeValue);

  const stagingQtyPending = await enquiryPage.getQuantity('Staging Qty');

  console.log(`Staging Qty while Pending: ${stagingQtyPending}`);

  expect(stagingQtyPending).toContain('1,000');

  // ===================== STEP 2: APPROVE, VERIFY STATUS + QTY MOVES TO IN TRANSIT =====================


await stockPage.approveDocument(docNumber);


  await stockPage.verifyStatus(docNumber, 'Approved');
  console.log(`✅ Document ${docNumber} status confirmed as Approved`);

  await enquiryPage.searchItem(itemCodeValue);

  const inTransitQtyApproved = await enquiryPage.getQuantity('In Transit Qty')
  console.log(`In Transit Qty after Approve: ${inTransitQtyApproved}`);
  expect(inTransitQtyApproved).toContain('1,000');

  const stagingQtyAfterApprove = await enquiryPage.getQuantity('Staging Qty');
  expect(stagingQtyAfterApprove).toContain('0');
  console.log(`✅ Qty moved from Staging to In Transit after Approve`);

  // ===================== STEP 3: POST, VERIFY STATUS + QTY MOVES TO AVAILABLE =====================

await stockPage.postDocument(docNumber);


  await stockPage.verifyStatus(docNumber, 'Posted');
  console.log(`✅ Document ${docNumber} status confirmed as Posted`);

  await enquiryPage.searchItem(itemCodeValue);

  // Available Qty updates asynchronously on the backend after Post; poll
  // (re-refreshing each attempt) instead of asserting on a single read.
  let availableQtyPosted;
  await expect.poll(async () => {
    await enquiryPage.refreshQty();
    availableQtyPosted = await enquiryPage.getQuantity('Available Qty');
    return availableQtyPosted;
  }, { timeout: 30000 }).toContain('1,000');
  console.log(`Available Qty after Post: ${availableQtyPosted}`);

  const inTransitQtyPosted = await enquiryPage.getQuantity('In Transit Qty');
  expect(inTransitQtyPosted).toContain('0');
  console.log(`✅ Qty moved from In Transit to Available Qty after Post — cycle complete for '${itemCodeValue}'`);
});