// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // ensures it works with local file previews
  publicDir: 'public', // default, but explicit
});
