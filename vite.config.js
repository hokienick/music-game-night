import { defineConfig } from 'vite';

export default defineConfig({
    root: './',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: './public/index.html',
                login: './public/login.html',
            },
        },
    },
    optimizeDeps: {
        include: ['firebase/app', 'firebase/auth'], // Ensure Firebase modules are included
    },
});