import { defineConfig } from './plm-frontend/node_modules/@playwright/test/index.mjs';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'reports/playwright/html', open: 'never' }]],
  outputDir: 'reports/playwright/results',
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    cwd: './plm-frontend',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
