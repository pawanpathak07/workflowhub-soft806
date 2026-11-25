
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',

  fullyParallel: false,
  workers: 1,

  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],

 use: {
  baseURL: 'http://127.0.0.1:5173',
  screenshot: 'only-on-failure',
  trace: 'retain-on-failure',
},

  projects: [
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
