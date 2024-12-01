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
                dashboard: '/admin/dashboard.html', // Dashboard page entry point
                signup: '/signup.html', // Sign up page entry point
                adminSettings: '/admin/admin-settings.html', // Admin Settings page entry point
                inviteHost: '/admin/invite-host.html',
                hostDashboard: '/host/host-dashboard.html',
            },
        },
    },
    server: {
        open: true, // Automatically opens the browser on `npx vite`
    },
});