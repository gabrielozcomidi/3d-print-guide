// Vite config.
// - base './'  -> built files use relative URLs, so `dist/` works from any
//   folder or sub-path on any static host (no server config needed).
// - One page: the site (index.html). The dev server also serves design.html, a reference for
//   tokens, fonts and RTL behaviour, which is not part of the build.
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        // design.html (colour/type reference) is for development only: open it at /design.html with `npm run dev`
        main: resolve(import.meta.dirname, 'index.html'),
      },
    },
  },
});
