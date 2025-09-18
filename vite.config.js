import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry:'src/index.js',
            name:'date-picker',
            formats:['es'],
            fileName: (format) => 'index.mjs'
        },
        rollupOptions:{
            external:[
                '@ragyjs/dom-renderer',
            ],
            output:{
                globals:{'@ragyjs/dom-renderer':'DomRenderer'}
            }
        },
        outDir:'dist',
        emptyOutDir:true,
        minify:'terser',
        sourcemap:true,
    },

});
