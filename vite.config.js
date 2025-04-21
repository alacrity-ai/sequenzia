// vite.config.js
import { defineConfig } from 'vite';

const isGH = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  base: isGH ? '/sequenzia/' : './',
  publicDir: 'public',
});
