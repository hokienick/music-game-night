export default {
    root: './', // Define the root as 'public'
    build: {
        outDir: '../dist',
        rollupOptions: {
            input: { 
                main: './public/index.html',
                login: './public/admin/login.html',
            },
        },
    },
};