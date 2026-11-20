import { defineConfig } from './plm-frontend/node_modules/@playwright/test/index.mjs';
import { assertAllowedTarget } from './tests/helpers/allowed-target.cjs';

const baseURL = assertAllowedTarget(
  process.env.PLM_TEST_FRONTEND_URL ?? 'http://127.0.0.1:3000',
  'Playwright baseURL',
).origin;

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
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
