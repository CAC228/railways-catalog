import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './test',
  testMatch: '**/*.e2e.spec.ts',
  workers: 1,
  timeout: 45000,
  outputDir: './test-results',
  use: {
    baseURL: process.env.CHAT_TEST_FRONTEND_URL || 'http://127.0.0.1:4173',
    channel: process.env.PLAYWRIGHT_CHANNEL,
    headless: true,
    screenshot: 'only-on-failure',
  },
})
