// vite.config.ts

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vite.setup.ts'],
    include: ['src/**/*.test.ts'],  // 🧹 Only pick test files
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage',
    },
  },
});
