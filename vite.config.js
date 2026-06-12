import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the built app works under a GitHub Pages subpath.
export default defineConfig({
  plugins: [react()],
  base: './',
});
