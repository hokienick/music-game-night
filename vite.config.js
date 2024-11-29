import { defineConfig } from 'vite';

export default defineConfig({
  root: './public', // Set public as the root directory
  build: {
    outDir: '../dist', // Output built files into the dist folder outside public
    rollupOptions: {
      input: {
        main: './public/index.html', // Explicitly specify entry point
      },
    },
  },
  server: {
    open: true, // Automatically opens the app in the browser
  },
});