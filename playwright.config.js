// @ts-check
import { defineConfig, devices } from '@playwright/test';

// Create a copy of Desktop Chrome device descriptor and remove deviceScaleFactor
// because Playwright rejects a null viewport together with deviceScaleFactor.
const { deviceScaleFactor, ...desktopChrome } = devices['Desktop Chrome'];

export default defineConfig({

  // Test folder
  testDir: './tests',

  // Global timeout for each test (90 seconds)
  timeout: 90_000,

  // Expect timeout
  expect: {
    timeout: 10_000,
  },

  // Run tests sequentially
  fullyParallel: false,

  // CI settings
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,

  // HTML Report
  reporter: 'html',

  use: {
    // Launch browser in headed mode
    headless: false,

    // Base URL for relative navigation
    baseURL: 'https://ib-tst.outsystemsenterprise.com/InternationalBearings',

    // Global timeout for Playwright actions
    actionTimeout: 30_000,



    // Global timeout for page.goto(), page.waitForURL(), etc.
    navigationTimeout: 60_000,

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
    // Start with no viewport so the browser can be maximized
    viewport: null,
    // Launch options to request a maximized window
    launchOptions: {
      args: ['--start-maximized'],
    },
  },

  // Chromium only
  projects: [
    {
      name: 'chromium',
      use: {
        ...desktopChrome,
        // Maximize browser window
        viewport: null,
        launchOptions: {
          args: ['--start-maximized'],
          slowMo: 500,
        },
      },
    },
  ],
});