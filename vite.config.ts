/// <reference types="vitest" />
// vite.config.ts

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  base: isProduction ? '/sequenzia/' : './',
  publicDir: 'public',
  server: {
    watch: {
      ignored: ['!**/src/**'],
    }
  },
  plugins: [
    tsconfigPaths(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '/static': path.resolve(__dirname, 'public/static'),
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include: ['**/*.test.ts'],
    exclude: ['**/test/integration/**', '**/test/live/**'],
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage',
    },
  },
  build: {
    rollupOptions: {
      output: {
        format: 'es',
        manualChunks: {
          vendor: ['@tonaljs/tonal', 'flowbite', 'smplr', 'webaudiofont', 'openai', 'zod'],
        },
      },
    },
  }
});
