const {expect} = require('@playwright/test');

class StockAdjustmentPage {
    constructor(page) {

        this.page = page;
        this.listUrl = '/InternationalBearings/StockAdjustment?InventoryDocumentId=0';

        //navigation

        this.stockAdjustmentLink = page.getByRole('link', { name: 'Stock Adjustment' });
        this.processStockAdjustment = page.getByText('Process Stock Adjustment', { exact: true });

        //Header

        this.discrepancyDropdown = page.locator('#b12-DiscrepancyDropdown');
        this.positiveAdjustment = page.getByRole('radio', { name: 'Positive Adjustment' });

        //Item Search

        this.searchItem = page.getByText('Search Item', { exact: true }).first();
        this.searchItemTextbox = page.getByPlaceholder('Search item code');

        //Details

        this.addMoreButton = page.getByRole('button', { name: 'Add More' });

        this.binLocation = page.locator(':visible:text-is("Select Bin Location")');
        this.packType = page.locator(':visible:text-is("Select Pack Type")');
        this.countryOfOrigin = page.locator(':visible:text-is("Select Country")');

        this.saveSubmit = page.getByRole('button', { name: 'Save & Submit' });

        //search dropdowns
        
        this.searchBinLocation = page.getByPlaceholder('Search Bin Location');
        this.searchPackType = page.getByPlaceholder('Search Pack Type');
        this.searchCountryOfOrigin = page.getByPlaceholder('Search Country');
        
        //Success Message

        this.successMessage = page.getByText('Successfully Saved');
        this.okButton = page.getByRole('button', { name: 'OK' });

        //approval

        this.approveButton = page.getByRole('button', { name: 'Approve' });
        this.confirmButton = page.getByRole('button', { name: 'Confirm' });
        this.postButton = page.getByRole('button', { name: 'Post' });

        //Detail Row

        this.purchaseDate = page.locator('input[type="date"]');

// Item Search Panel
    this.stockAdjustmentPanel = page.getByRole('tabpanel', {
    name: 'Process Stock Adjustment'
});

this.stockAdjustmentText = this.stockAdjustmentPanel
    .getByText('Stock Adjustment', { exact: true })
    .first();


    }
    async open() {

        await this.page.goto(`/InternationalBearings/Warehouse`);
        await this.stockAdjustmentLink.click();
        await this.processStockAdjustment.click();
    }

    async selectDiscrepancy(type) {

        await this.discrepancyDropdown.selectOption({ label: type });
    }

    async selectPositiveAdjustment() {

        await this.positiveAdjustment.check();
        
    }

    async searchItemByCode(itemCode) {

        await this.searchItem.click();
        await this.searchItemTextbox.fill(itemCode);
        await this.searchItemTextbox.press('Enter');
        const resultRow = this.page.getByText(itemCode, { exact: true }).first();
        await expect(resultRow).toBeVisible({ timeout: 15000 });
        await resultRow.locator('xpath=ancestor::tr[1]//input[@type="checkbox"]').check();
        // Close the search dropdown
        await this.stockAdjustmentText.click();

// Verify the item is added to the grid
        const itemRow = this.page.getByRole('row', {
    name: new RegExp(itemCode)
});

        await expect(itemRow.first()).toBeVisible({ timeout: 20000 });

    }

    async addItemDetails() {

        await this.addMoreButton.click();

    }

    async selectBinLocation(binLocation) {

        await this.binLocation.click();
        await this.searchBinLocation.pressSequentially(binLocation,{delay: 50});
        await this.page.getByText(binLocation, { exact: true }).click();

    }

    async selectPackType(packType) {

        await this.packType.click();
        await this.searchPackType.pressSequentially(packType,{delay: 50});
        await this.page.getByText(packType, { exact: true }).click();
    }

    async selectCountryOfOrigin(country) 
    
    {
        await this.countryOfOrigin.click();
        await this.searchCountryOfOrigin.pressSequentially(country,{delay: 50});
        await this.page.getByText(country.toUpperCase(),{exact: true}).click();

    }

    async fillItemDetails(binLocation,quantity,unitCost){

        const detailRow = this.page.getByRole('row',{name:new RegExp(binLocation)});
        const detailInputs = detailRow.locator('input:visible');
        await detailInputs.nth(0).fill(quantity.toString());
        await detailInputs.nth(1).fill(unitCost.toString());
    }

    async selectPurchaseDate(date){

        await this.purchaseDate.fill(date.toISOString().split('T')[0]);
    }

    async save(){

        await this.saveSubmit.click();
        await expect(this.successMessage).toBeVisible({timeout: 15000});
        await this.okButton.click();
    }

        async approveDocument(docNumber)
        
        {

            await this.page.goto(this.listUrl);
            await this.page.getByRole('link',{name:docNumber}).click();
            await this.approveButton.click();
            await this.confirmButton.click();
            await expect(this.page.getByText('Approved Successfully')).toBeVisible();
        }

        async postDocument(docNumber){

            await this.page.goto(this.listUrl);
            const docRow = this.page.locator(`tr:has-text("${docNumber}")`);

            await docRow.locator('input[type="checkbox"]').check();
            await this.postButton.click();
            await this.confirmButton.click();
            await this.page.waitForLoadState('networkidle');

        }

        async verifyStatus(docNumber,status){


            await this.page.goto(this.listUrl);
            const docRow = this.page.locator(`tr:has-text("${docNumber}")`);

            await expect(docRow.getByText(status)).toBeVisible({timeout:15000});

        }


        
    

        async getDocumentNumber() {

        const firstRow = this.page.locator('table tbody tr').filter({ has: this.page.getByRole('link') }).first();

        return( await  firstRow.getByRole('link').first().innerText()).trim();   
    
    }


}

module.exports = StockAdjustmentPage;