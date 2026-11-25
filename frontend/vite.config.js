
import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    host: true,
  },

  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',

    // Do not let Vitest run Playwright browser tests
    exclude: [
      ...configDefaults.exclude,
      'e2e/**',
      'tests/**',
    ],
  },
});
