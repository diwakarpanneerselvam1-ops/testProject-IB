const { test, expect } = require('@playwright/test');
const LoginPage = require('../PageObjects/LoginPage');
const WaitHelper = require('../utils/WaitHelper');

async function login(page) {

  
  //call for the LoginPage class
  const loginPage = new LoginPage(page);
    

  // Step 1: Navigate to the Dummy Login page
  
  await loginPage.navigateToLoginPage();
  await WaitHelper.waitForNetworkIdle(page);
  
  // Step 2: Search for IB Singapore (IBSG)
  
  await loginPage.searchCompany('IBSG');

  // Step 3: Select IB Singapore
 
  await loginPage.selectCompany();

  // Step 4: Login
  
 await loginPage.clickLogin();

  // Step 5: Verify Dashboard
  
  await loginPage.verifyDashboard();

  console.log('✅ Logged in successfully');

}

module.exports = {login};