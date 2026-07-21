const { test, expect } = require('@playwright/test');
const { login } = require('../utils/login');
const { createItem } = require('../utils/createItem');

const BASE_URL = 'https://ib-tst.outsystemsenterprise.com/InternationalBearings';
const STOCK_ADJUSTMENT_LIST_URL = `${BASE_URL}/StockAdjustment?InventoryDocumentId=0`;

// Main Enquiry defaults to the Trade toggle already; the quantity panel
// (Staging/In Transit/Available Qty) just needs an explicit refresh click
// after selecting the item for the newly posted data to load.
async function refreshMainEnquiry(page) {
  await page.getByTitle('Refresh', { exact: true }).click();
}

// `text=X` matched a <select> whose <option> list happens to include the
// same label (a Qty Type filter dropdown), not just the data cell. Scope to
// the table row so the dropdown never enters the match set.
async function getQtyRowText(page, label) {
  return page.locator('tr', { hasText: label }).innerText();
}

async function goToItemEnquiry(page, itemCodeValue) {
  await page.goto(`${BASE_URL}/MainEnquiry?IsF8Mode=false`);
  await page.getByPlaceholder('Search Item Here').fill(itemCodeValue);
  await page.keyboard.press('Enter');
  await page.getByText(itemCodeValue, { exact: true }).first().click();
  await refreshMainEnquiry(page);
}

test('Create item and process Stock Adjustment for it', async ({ page }) => {

  // Step 1: Login
  await login(page);

  // Step 2: Create item and capture the code for use in Stock Adjustment
  const itemCodeValue = await createItem(page);
  console.log(`Using newly created item for Stock Adjustment: ${itemCodeValue}`);

  // Step 3: Navigate to Stock Adjustment and fill in the header + item selection
  await page.goto(`${BASE_URL}/Warehouse`);
  await page.getByRole('link', { name: 'Stock Adjustment' }).click();
  await page.getByText('Process Stock Adjustment').click();

  await page.locator('#b12-DiscrepancyDropdown').selectOption({ label: 'Opening Stock' });
  await page.getByRole('radio', { name: 'Positive Adjustment' }).click();
  await expect(page.getByRole('radio', { name: 'Positive Adjustment' })).toBeChecked();

  // Select the item using itemCodeValue from item creation above
  await page.getByText('Search Item').first().click();

  // Trigger the search and wait for the matching row to appear
  await page.getByPlaceholder('Search item code').fill(itemCodeValue);
  await page.getByPlaceholder('Search item code').press('Enter');
  const resultRow = page.getByText(itemCodeValue, { exact: true }).first();
  await expect(resultRow).toBeVisible({ timeout: 15000 });

  // Check the item via a real Playwright action so the app's own event
  // handlers fire (a DOM-evaluate click() does not reliably trigger them)
  const itemCheckbox = resultRow.locator('xpath=ancestor::tr[1]//input[@type="checkbox"]').first();
  await itemCheckbox.check();

  // Close the item-search dropdown by clicking outside it; this dismisses
  // the overlay and adds the item to the adjustment grid.
  // Scoped to the tabpanel so it can't match the "Stock Adjustment" nav link.
  const stockAdjustmentPanel = page.getByRole('tabpanel', { name: 'Process Stock Adjustment' });
  await stockAdjustmentPanel.getByText('Stock Adjustment', { exact: true }).first().click();

  // Verify the item actually landed in the adjustment grid before continuing;
  // otherwise later per-row fields (e.g. Bin Location) will never render.
  const itemRow = page.getByRole('row', { name: itemCodeValue });
  await expect(itemRow.first()).toBeVisible({ timeout: 20000 });

  // Add a detail line for the item; this reveals the Bin Location / Pack
  // Type / Country / etc. fields for the selected item.
  await page.getByRole('button', { name: 'Add more' }).click();

  // Bin Location / Pack Type / Country / No of Packs / Unit Cost / Purchase Date
  // Each "Select X" label is duplicated (a hidden template span plus the
  // visible dropdown trigger); filter to the visible one with :visible.
  // Use pressSequentially (real keystrokes) instead of fill() — these search
  // boxes filter on a per-keystroke debounce, which a single fill() input
  // event does not reliably trigger.
  await page.locator(':visible:text-is("Select Bin Location")').click();
  await page.getByPlaceholder('Search Bin Location').pressSequentially('BIN100021', { delay: 50 });
  await page.getByText('BIN100021', { exact: true }).click();

  await page.locator(':visible:text-is("Select Pack Type")').click();
  await page.getByPlaceholder('Search Pack Type').pressSequentially('1X10', { delay: 50 });
  await page.getByText('1X10', { exact: true }).click();

  await page.locator(':visible:text-is("Select Country")').click();
  await page.getByPlaceholder('Search Country').pressSequentially('Japan', { delay: 50 });
  await page.getByText('JAPAN', { exact: true }).click();

  // Scope by accessible row name (not raw `tr` nesting) and only consider
  // visible inputs — the row also contains a hidden leftover input from the
  // item-search step that a plain `tr:has-text(...) input` selector picks up.
  const detailRow = page.getByRole('row', { name: /BIN100021/ });
  const detailInputs = detailRow.locator('input:visible');
  await detailInputs.nth(0).fill('100');
  await detailInputs.nth(1).fill('1.23');

  const purchaseDate = new Date();
  purchaseDate.setDate(purchaseDate.getDate() - 1);
  await page.locator('input[type="date"]').fill(purchaseDate.toISOString().split('T')[0]);

  // ===================== SAVE & SUBMIT =====================
  await page.getByRole('button', { name: 'Save & Submit' }).click();
  await expect(page.getByText('Successfully Saved')).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();

  // ===================== CAPTURE NEW DOCUMENT NUMBER =====================
  // Filter to rows that contain a document link to skip the header row
  // (whose first cell is a select-all checkbox with hidden tooltip text).
  const firstRow = page.locator('table tbody tr').filter({ has: page.getByRole('link') }).first();
  const docNumber = (await firstRow.getByRole('link').first().innerText()).trim();
  console.log(`📄 New Stock Adjustment Document Number: ${docNumber}`);
  expect(docNumber).not.toBe('');
  // Reusable locator; Playwright re-queries the live page on each use, so
  // this stays valid across the page.goto() navigations below.
  const docRow = page.locator(`tr:has-text("${docNumber}")`);

  // ===================== STEP 1: VERIFY STATUS = PENDING, QTY IN STAGING =====================
  await expect(firstRow.getByText('Pending')).toBeVisible();
  console.log(`✅ Document ${docNumber} status confirmed as Pending`);

  await goToItemEnquiry(page, itemCodeValue);

  const stagingQtyPending = await getQtyRowText(page, 'Staging Qty');
  console.log(`Staging Qty while Pending: ${stagingQtyPending}`);
  expect(stagingQtyPending).toContain('1,000');

  // ===================== STEP 2: APPROVE, VERIFY STATUS + QTY MOVES TO IN TRANSIT =====================
  await page.goto(STOCK_ADJUSTMENT_LIST_URL);
  await page.getByRole('link', { name: docNumber }).click();
  await page.getByRole('button', { name: 'Approve' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('Approved Successfully')).toBeVisible();

  await page.goto(STOCK_ADJUSTMENT_LIST_URL);
  await expect(docRow.getByText('Approved')).toBeVisible();
  console.log(`✅ Document ${docNumber} status confirmed as Approved`);

  await goToItemEnquiry(page, itemCodeValue);

  const inTransitQtyApproved = await getQtyRowText(page, 'In Transit Qty');
  console.log(`In Transit Qty after Approve: ${inTransitQtyApproved}`);
  expect(inTransitQtyApproved).toContain('1,000');

  const stagingQtyAfterApprove = await getQtyRowText(page, 'Staging Qty');
  expect(stagingQtyAfterApprove).toContain('0');
  console.log(`✅ Qty moved from Staging to In Transit after Approve`);

  // ===================== STEP 3: POST, VERIFY STATUS + QTY MOVES TO AVAILABLE =====================
  await page.goto(STOCK_ADJUSTMENT_LIST_URL);
  await docRow.locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: 'Post' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();

  await expect(docRow.getByText('Posted')).toBeVisible();
  console.log(`✅ Document ${docNumber} status confirmed as Posted`);

  await goToItemEnquiry(page, itemCodeValue);

  // Available Qty updates asynchronously on the backend after Post; poll
  // (re-refreshing each attempt) instead of asserting on a single read.
  let availableQtyPosted;
  await expect.poll(async () => {
    await refreshMainEnquiry(page);
    availableQtyPosted = await getQtyRowText(page, 'Available Qty');
    return availableQtyPosted;
  }, { timeout: 30000 }).toContain('1,000');
  console.log(`Available Qty after Post: ${availableQtyPosted}`);

  const inTransitQtyPosted = await getQtyRowText(page, 'In Transit Qty');
  expect(inTransitQtyPosted).toContain('0');
  console.log(`✅ Qty moved from In Transit to Available Qty after Post — cycle complete for '${itemCodeValue}'`);
});