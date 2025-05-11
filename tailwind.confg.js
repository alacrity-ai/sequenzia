// tailwind.config.js
import flowbitePlugin from 'flowbite/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',       // your app
    './node_modules/flowbite/**/*.js'   // flowbite components
  ],
  theme: {
    extend: {}
  },
  plugins: [
    flowbitePlugin
  ]
};
