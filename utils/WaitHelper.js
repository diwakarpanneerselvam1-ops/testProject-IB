class WaitHelper {

    static async waitForNetworkIdle(page) {
        await page.waitForLoadState('networkidle');
    }

}

module.exports = WaitHelper;