import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

/**
 * E2E chạy trên bản build có MSW (VITE_ENABLE_MOCKS=true) + vite preview: không cần backend.
 * VITE_API_URL trỏ tới cổng không có dịch vụ để request chưa có mock lỗi ngay thay vì gọi nhầm backend thật.
 * Local: yarn e2e (E2E_PORT đổi cổng preview, mặc định 4173). CI: cài chromium bằng `npx playwright install --with-deps chromium`.
 */
const port = Number(process.env.E2E_PORT ?? 4173)
const baseURL = `http://127.0.0.1:${port}`
const rootDir = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: './playwright-report', open: 'never' }]]
    : [['list'], ['html', { outputFolder: './playwright-report', open: 'never' }]],
  use: {
    baseURL,
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: `npx vite build --outDir dist-e2e --emptyOutDir --logLevel warn && npx vite preview --outDir dist-e2e --host 127.0.0.1 --port ${port} --strictPort`,
    cwd: rootDir,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      VITE_ENABLE_MOCKS: 'true',
      VITE_API_URL: 'http://127.0.0.1:59999',
      VITE_DOMAIN_URL: baseURL,
    },
  },
})
