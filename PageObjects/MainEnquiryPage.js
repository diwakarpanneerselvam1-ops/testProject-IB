class MainEnquiryPage {

    constructor(page) {

        this.page = page;

        this.searchItemBox = page.getByPlaceholder('Search Item Here');

        this.refreshButton = page.getByTitle('Refresh', { exact: true });


    }

    async searchItem(itemCode) {

        await this.page.goto('/InternationalBearings/MainEnquiry?IsF8Mode=false')

        await this.searchItemBox.fill(itemCode);

        await this.searchItemBox.press('Enter');

        await this.page.getByText(itemCode, { exact: true }).first().click();

         await this.refreshButton.click();

    }

    async refreshQty()
    {
        await this.refreshButton.click();
    }

    async getQuantity(label) {

        return await this.page.locator('tr', { hasText: label }).innerText();
    }
     
}

module.exports = MainEnquiryPage;