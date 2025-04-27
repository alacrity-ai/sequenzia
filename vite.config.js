// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

const isGH = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  base: isGH ? '/sequenzia/' : './',
  publicDir: 'public',
  server: {
    watch: {
      // Force reload for any changes in your src directory
      ignored: ['!**/src/**'],
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  }
});
