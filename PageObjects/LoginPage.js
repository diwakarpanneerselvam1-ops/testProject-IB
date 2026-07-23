const { expect } = require('@playwright/test');


class LoginPage{

    constructor(page) {

        this.page = page;

        this.companySearch = page.getByPlaceholder('Search for Company(Tenant)');
        this.companyOption = page.getByText('IB Singapore(IBSG)');
        this.loginButton = page.locator('tr', { hasText: 'IB Singapore' }).first();

    
    }

    async navigateToLoginPage() {

        await this.page.goto('/InternationalBearings/DummyLogin');
        // await WaitHelper.waitForNetworkIdle(this.page);
}

async searchCompany(company) {
    await this.companySearch.fill(company);

}

async selectCompany() {

    await this.companyOption.click();

}

async clickLogin() {
    await this.loginButton.getByText('Click to login').click();

}

async verifyDashboard() {

    await this.page.waitForURL(/MainEnquiry/);
    await expect(this.page).toHaveURL(/MainEnquiry/);

}
async login(company = 'IBSG'    ) {

    await this.navigateToLoginPage();
    await this.searchCompany(company);
    await this.selectCompany();
    await this.clickLogin();
    await this.verifyDashboard();




}

}module.exports = LoginPage;