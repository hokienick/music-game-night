import { defineConfig } from 'vite';

export default defineConfig({
    root: './public', // Root directory for development
    build: {
        outDir: '../dist', // Output directory for production build
        emptyOutDir: true, // Clear the dist folder before building
        rollupOptions: {
            input: {
                main: '/index.html', // Main entry point
                login: '/login.html', // Login page entry point
                dashboard: './public/admin/dashboard.html'
            },
        },
    },
    server: {
        open: true, // Automatically opens the browser on `npx vite`
    },
});