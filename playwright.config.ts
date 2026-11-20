import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './qa',
  testMatch: /e2e\.spec\.ts/,
  timeout: 120_000,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'off', actionTimeout: 8000 },
  expect: { timeout: 6000 },
  webServer: {
    command: 'npm run build && npx vite preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
