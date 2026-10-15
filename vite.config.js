import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cpSync } from 'fs';

// src/main.js is a plain script (so pages also work without a build);
// Vite leaves non-module scripts alone, so copy it into the output as-is.
const copySiteScript = {
  name: 'copy-site-script',
  closeBundle() {
    cpSync(resolve(__dirname, 'src/main.js'), resolve(__dirname, 'dist/src/main.js'));
  }
};

export default defineConfig({
  plugins: [copySiteScript],
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        services: resolve(__dirname, 'services.html'),
        academy: resolve(__dirname, 'academy.html'),
        faq: resolve(__dirname, 'faq.html'),
        privacy: resolve(__dirname, 'privacy-policy.html'),
        partnership: resolve(__dirname, 'partnership.html'),
        blog: resolve(__dirname, 'blog.html'),
        blogeditor: resolve(__dirname, 'blogeditor.html'),
        admin1: resolve(__dirname, 'admin1.html')
      }
    }
  }
});
