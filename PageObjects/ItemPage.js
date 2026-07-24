const {expect} = require('@playwright/test');
const WaitHelper = require('../utils/WaitHelper');


class ItemPage {

    constructor(page) {

        this.page = page;

        //Navigation
        this.adminMenu = page.locator('#b2-admin');
        this.productsMenu = page.getByText('Products', { exact: true });
        this.itemMenu = page.getByText('Item', { exact: true });
        this.createItemButton = page.getByText('Create Item', { exact: true });

        //Item Form 

        this.itemCode = page.locator('#b12-Input_ItemCode');
        this.itemGroup = page.locator('#b12-ItemGroup .vscomp-toggle-button');
        this.itemGroupOption = page.locator('#b12-ItemGroup .vscomp-option').first();
        this.itemBrand = page.locator('#b12-ItemBrand');
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.successMessage = page.getByText('Item successfully Created!');

        //Main Enquiry

        this.searchItem = page.getByPlaceholder('Search Item Here');
    }

 async openCreateItemPage() {

    await WaitHelper.waitForNetworkIdle(this.page);

    await this.adminMenu.click();

    await WaitHelper.waitForNetworkIdle(this.page);

    await this.productsMenu.click();

    await this.itemMenu.click();

    await this.createItemButton.click();

    await WaitHelper.waitForNetworkIdle(this.page);
}

    async enterItemCode(itemCode){

        await this.itemCode.fill(itemCode);

    }

    async verifyItemCode(itemCode) {

        await expect(this.itemCode).toHaveValue(itemCode);
    }

    async selectItemGroup() {

        await this.itemGroup.click();
        await this.itemGroupOption.click();
    }

    async selectBrand(brandName){
        await this.itemBrand.selectOption({ label: brandName });
    }

    async verifyBrand(brandName) {

        const selectedLabel = await this.itemBrand.evaluate(el => el.options[el.selectedIndex].text);
        expect(selectedLabel).toBe(brandName);
    }

    async clickSave(){

        await this.saveButton.click();

    }

    async verifyItemCreated(){

        await expect(this.successMessage).toBeVisible();
    }

    async verifyItemInMainEnquiry(itemCode, brandName) {

        await this.page.goto('/InternationalBearings/MainEnquiry?IsF8Mode=false');
        await this.searchItem.fill(itemCode);
        await this.searchItem.press('Enter');

        await expect(this.page.getByText(itemCode, { exact: true })).toBeVisible();
        await expect(this.page.getByText(brandName, { exact: true }).first()).toBeVisible();
    }
}

module.exports = ItemPage ;
        